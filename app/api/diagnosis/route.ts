import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserIdFromSession } from '@/lib/getUserId';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import Anthropic from '@anthropic-ai/sdk';

const DIAGNOSIS_QUESTIONS = [
  '現在のキャリア状況は？（例：転職を検討中、スキルアップしたい、副業を始めたい など）',
  '得意な分野やスキルは何ですか？',
  '働き方の希望は？（リモートワーク、オフィス勤務、フレックスなど）',
  'キャリアで最も重視するものは？（収入、やりがい、ワークライフバランスなど）',
  '目標を達成したい時期は？（すぐ、1年以内、3年以内など）',
] as const;

function buildPrompt(answers: Record<string, string>): string {
  const answersText = DIAGNOSIS_QUESTIONS.map((q, i) => {
    const key = `q${i + 1}` as keyof typeof answers;
    return `Q${i + 1}: ${q}\nA: ${answers[key] || '-'}`;
  }).join('\n\n');

  return `以下はキャリア診断の5問に対するユーザーの回答です。これに基づき、JSON形式で分析結果とキャリアロードマップを返してください。

【回答】
${answersText}

【出力形式】以下のJSON形式で出力してください。マークダウンコードブロックは使わず、純粋なJSONのみを返してください。
{
  "result": {
    "summary": "全体の分析サマリー（2-3文）",
    "strengths": ["強み1", "強み2", "強み3"],
    "recommendations": ["推奨アクション1", "推奨アクション2"]
  },
  "careerRoadmap": {
    "shortTerm": "短期（〜6ヶ月）の具体的なアクションプラン",
    "midTerm": "中期（6ヶ月〜2年）のキャリアプラン",
    "longTerm": "長期（2年以上）のビジョンと目標"
  }
}`;
}

export async function POST(request: NextRequest) {
  const log = (step: string, data?: object) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Diagnosis POST] ${step}`, data ?? '');
    }
  };

  try {
    log('1. auth start');
    const session = await auth();
    log('2. auth done', { hasSession: !!session, email: session?.user?.email?.slice(0, 5) + '...' });

    const userId = await getUserIdFromSession(session);

    if (!userId) {
      log('3. userId missing - Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized', debug: { step: 'userId', hint: 'session or user not found' } },
        { status: 401 }
      );
    }
    log('3. userId ok', { userId: userId.toString() });

    const body = await request.json();
    const answers = body.answers as Record<string, string>;

    if (!answers || typeof answers !== 'object') {
      log('4. invalid answers');
      return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
    }
    log('4. answers ok', { keys: Object.keys(answers) });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      log('5. ANTHROPIC_API_KEY missing');
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      );
    }

    log('6. calling Anthropic API');
    const anthropic = new Anthropic({ apiKey });
    const prompt = buildPrompt(answers);

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    log('7. Anthropic API response received');

    const textBlock = message.content.find((c) => c.type === 'text');
    const text = textBlock && 'text' in textBlock ? textBlock.text : '';

    let parsed: { result?: Record<string, unknown>; careerRoadmap?: Record<string, string> } = {};
    try {
      const jsonStr = text.replace(/```json\s?/g, '').replace(/```\s?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = {
        result: { summary: text || '分析結果を取得できませんでした。' },
        careerRoadmap: {
          shortTerm: '-',
          midTerm: '-',
          longTerm: '-',
        },
      };
    }

    const result = parsed.result ?? {};
    const careerRoadmap = parsed.careerRoadmap ?? {
      shortTerm: '-',
      midTerm: '-',
      longTerm: '-',
    };

    log('8. connecting DB and saving');
    await connectDB();
    const diagnosis = await Diagnosis.create({
      userId,
      answers,
      result,
      careerRoadmap,
    });

    const diagnosisId = diagnosis._id.toString();
    log('9. diagnosis saved', { id: diagnosisId });

    return NextResponse.json({
      id: diagnosisId,
      diagnosis: {
        id: diagnosisId,
        answers: diagnosis.answers,
        result: diagnosis.result,
        careerRoadmap: diagnosis.careerRoadmap,
        createdAt: diagnosis.createdAt,
      },
    });
  } catch (error) {
    console.error('[Diagnosis POST] ERROR:', error);
    let msg = error instanceof Error ? error.message : 'Internal server error';

    // Anthropic API の認証エラーを分かりやすく変換
    if (
      msg.includes('invalid x-api-key') ||
      msg.includes('authentication_error') ||
      msg.includes('401')
    ) {
      msg =
        'APIキーが無効です。.env.local の ANTHROPIC_API_KEY に正しいAnthropic APIキーを設定し、開発サーバーを再起動してください。';
    }

    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      {
        error: msg,
        ...(process.env.NODE_ENV === 'development' && stack ? { debug: { stack: stack.slice(0, 500) } } : {}),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const userId = await getUserIdFromSession(session);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const list = await Diagnosis.find({ userId })
      .sort({ createdAt: -1 })
      .select('_id answers result careerRoadmap createdAt')
      .lean();

    const items = list.map((d) => ({
      id: d._id.toString(),
      answers: d.answers,
      result: d.result,
      careerRoadmap: d.careerRoadmap,
      createdAt: d.createdAt,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Diagnosis GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
