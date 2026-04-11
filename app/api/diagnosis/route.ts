import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserIdFromSession } from '@/lib/getUserId';
import { connectDB } from '@/lib/db';
import Diagnosis from '@/models/Diagnosis';
import Anthropic from '@anthropic-ai/sdk';
import { normalizeSimpleDiagnosisSummary } from '@/lib/diagnosisSimpleSummary';

const DIAGNOSIS_QUESTIONS = [
  '現在のキャリア状況は？（例：転職を検討中、スキルアップしたい、副業を始めたい など）',
  '得意な分野やスキルは何ですか？',
  '働き方の希望は？（リモートワーク、オフィス勤務、フレックスなど）',
  'キャリアで最も重視するものは？（収入、やりがい、ワークライフバランスなど）',
  '目標を達成したい時期は？（すぐ、1年以内、3年以内など）',
] as const;

interface ProfileInfo {
  gender?: string;
  ageGroup?: string;
  jobType?: string;
  industry?: string;
  other?: string;
}

function buildPrompt(answers: Record<string, string>, profile?: ProfileInfo | null): string {
  const answersText = DIAGNOSIS_QUESTIONS.map((q, i) => {
    const key = `q${i + 1}` as keyof typeof answers;
    return `Q${i + 1}: ${q}\nA: ${answers[key] || '-'}`;
  }).join('\n\n');

  const hasProfile =
    profile &&
    [profile.gender, profile.ageGroup, profile.jobType, profile.industry, profile.other].some(
      (v) => v && String(v).trim().length > 0
    );

  const profileLines = hasProfile
    ? [
        '【プロフィール情報】（入力されている場合、以下も加味してより精度の高い診断を行ってください）',
        ...(profile?.gender ? [`・性別: ${profile.gender}`] : []),
        ...(profile?.ageGroup ? [`・年齢（年代）: ${profile.ageGroup}`] : []),
        ...(profile?.jobType ? [`・今の職種: ${profile.jobType}`] : []),
        ...(profile?.industry ? [`・今の業種: ${profile.industry}`] : []),
        ...(profile?.other ? [`・その他: ${profile.other}`] : []),
      ]
    : [];
  const profileSection =
    profileLines.length > 0 ? `\n${profileLines.join('\n')}\n` : '';

  return `以下はキャリア診断の5問に対するユーザーの回答です。これに基づき、JSON形式で分析結果、キャリアロードマップ、レーダーチャート用スキルスコア（8項目）、適正スコア表を返してください。
${profileSection}

【回答】
${answersText}

【各設問の意味（分析・simpleDiagnosisSummary で活用してください）】
Q1: いまのキャリアの状況・課題感　Q2: 強みとなるスキル・経験　Q3: 働き方の希望　Q4: 仕事で重視すること　Q5: 目標の時間軸

【重要】
- skillScoresは回答内容に応じて項目を変えてください。aptitudeScoresはスキル・業種・職種の適正スコア表（回答に基づき適したものを選び、1〜5のスコアを付ける）。
- summary・strengthsAnalysis・suitableJobsAnalysisは、単なる情報の寄せ集めではなく、回答を「分析」した結果を書いてください。なぜそう言えるのか、回答のどこからその洞察が導かれるのか、を論理的に説明してください。
- simpleDiagnosisSummary は必ず文字列を3つだけ持つ配列。各要素は1文（40〜90字程度）の簡易サマリー（です・ます調）。モザイクなしでユーザーに見せるため、簡潔で分かりやすく書くこと。
- simpleDiagnosisSummary の3行は次の役割で内容を分け、互いに重複しないようにしてください。（1）現状・スキル・経験から読み取れるあなたの強みや立ち位置、（2）働き方や重視すること（Q3・Q4）と照らしたときのキャリア上の傾向や適した方向性、（3）目標時期（Q5）も意識したうえでの次の一歩・視点・おすすめの方向のヒント。プロフィール情報がある場合は1行目または2行目で自然に織り込んでください。可能な範囲でQ1〜Q5の内容に言及してください。「ー」「…」などプレースホルダーだけの行は禁止です。JSONの例文をそのまま返さず、必ずこのユーザーの回答に即した具体的な文に書き換えてください。
- 全ての文章は「です」「ます」調の丁寧語で統一してください。分析サマリー、強みの詳細分析、向いている職種の分析、キャリアロードマップのいずれも敬体（です・ます）で記述すること。
- 対象者を指す場合は「ユーザー」ではなく「あなた」を使用してください。

【出力形式】レスポンスは必ず以下のJSON形式のみを返してください。説明文、マークダウン、コードブロック、前後のテキストは一切含めず、JSONオブジェクトだけを出力してください。
{
  "result": {
    "simpleDiagnosisSummary": [
      "回答とプロフィールから、いまのキャリアの位置づけと、活かせそうな強みの両方がはっきりと読み取れます。",
      "働き方の希望や重視することと照らすと、対人や成果に関わる役割で力を発揮しやすい傾向があります。",
      "目標の時期を意識しつつ、まずは情報収集や小さな対話から次の一歩を踏み出すと進みやすいでしょう。"
    ],
    "summary": "全体の分析サマリー（2-3文、です・ます調）。回答から読み取れるキャリアの方向性を要約。",
    "strengthsAnalysis": "強みの詳細分析（3-5文、です・ます調）。回答のどの部分から強みが読み取れるか、その強みがどう活かせるかを具体的に分析。",
    "suitableJobsAnalysis": "向いている職種・業種の詳細分析（3-5文、です・ます調）。なぜその職種が向いていると言えるか、回答内容と紐づけて論理的に説明。",
    "strengths": ["強み1", "強み2", "強み3"],
    "skillScores": {
      "項目1": 3.5,
      "項目2": 4.0,
      "項目3": 3.2,
      "項目4": 3.8,
      "項目5": 4.2,
      "項目6": 3.0,
      "項目7": 3.6,
      "項目8": 4.1
    },
    "aptitudeScores": {
      "スキル": [
        { "name": "コミュニケーション力", "score": 4.2 },
        { "name": "論理的思考", "score": 3.8 },
        { "name": "マネジメント", "score": 3.5 }
      ],
      "業種": [
        { "name": "IT・テクノロジー", "score": 4.0 },
        { "name": "コンサルティング", "score": 3.8 },
        { "name": "金融", "score": 3.2 }
      ],
      "職種": [
        { "name": "プロジェクトマネージャー", "score": 4.2 },
        { "name": "営業", "score": 3.9 },
        { "name": "エンジニア", "score": 3.5 }
      ]
    }
  },
  "careerRoadmap": {
    "shortTerm": "短期（〜6ヶ月）の具体的なアクションプラン（です・ます調）",
    "midTerm": "中期（6ヶ月〜2年）のキャリアプラン（です・ます調）",
    "longTerm": "長期（2年以上）のビジョンと目標（です・ます調）"
  }
}

skillScoresは必ず8項目（回答に応じて内容を変える）。aptitudeScoresはスキル・業種・職種の3カテゴリ、各3〜5項目。simpleDiagnosisSummaryは必ず3要素の配列。回答内容に応じて適したスキル・業種・職種を選び、1〜5のスコア（小数可）を付けてください。

strengthsAnalysisとsuitableJobsAnalysisは省略せず必ず出力してください。回答を深く分析し、「あなた」に「なるほど、そういう理由で自分にはこういう強みや適性があるのか」と納得できる説明を書いてください。敬体（です・ます）で統一すること。`;
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

    let profile: ProfileInfo | null = null;
    if (session?.user?.email) {
      const mongoose = await connectDB();
      const db = mongoose.connection.db;
      if (db) {
        const user = await db.collection('users').findOne(
          { email: session.user.email },
          { projection: { gender: 1, ageGroup: 1, jobType: 1, industry: 1, other: 1 } }
        );
        if (user) {
          profile = {
            gender: user.gender ?? undefined,
            ageGroup: user.ageGroup ?? undefined,
            jobType: user.jobType ?? undefined,
            industry: user.industry ?? undefined,
            other: user.other ?? undefined,
          };
        }
      }
      log('4b. profile fetched', { hasProfile: !!profile });
    }

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
    const prompt = buildPrompt(answers, profile);

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    log('7. Anthropic API response received');

    const textBlocks = Array.isArray(message.content)
      ? message.content.filter((c) => c.type === 'text')
      : [];
    const text = textBlocks
      .map((c) => (c && typeof c === 'object' && 'text' in c ? (c as { text: string }).text : ''))
      .join('');
    if (!text || text.length < 20) {
      log('7b. empty or too short response', { len: text?.length ?? 0 });
    }

    let parsed: { result?: Record<string, unknown>; careerRoadmap?: Record<string, string> } = {};

    const extractJsonObject = (raw: string): string | null => {
      const stripped = raw.replace(/```json\s?/gi, '').replace(/```\s?/g, '').trim();
      const start = stripped.indexOf('{');
      if (start < 0) return null;
      let depth = 0;
      let inStr = false;
      let strChar = '';
      for (let i = start; i < stripped.length; i++) {
        const c = stripped[i];
        if (inStr) {
          if (c === '\\' && i + 1 < stripped.length) {
            i++;
            continue;
          }
          if (c === strChar) inStr = false;
          continue;
        }
        if (c === '"' || c === "'") {
          inStr = true;
          strChar = c;
          continue;
        }
        if (c === '{') depth++;
        else if (c === '}') {
          depth--;
          if (depth === 0) return stripped.slice(start, i + 1);
        }
      }
      return null;
    };

    const tryParse = (jsonStr: string): typeof parsed | null => {
      if (!jsonStr || jsonStr.length < 10) return null;
      const fixCommon = (s: string) => s.replace(/,(\s*[}\]])/g, '$1');
      for (const raw of [jsonStr, fixCommon(jsonStr)]) {
        try {
          const obj = JSON.parse(raw) as unknown;
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            return obj as typeof parsed;
          }
        } catch (e) {
          if (process.env.NODE_ENV === 'development' && raw === jsonStr) {
            console.warn('[Diagnosis] JSON parse error:', (e as Error).message?.slice(0, 100));
          }
        }
      }
      return null;
    };

    const baseStr = text.replace(/```json\s?/gi, '').replace(/```\s?/g, '').trim();
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidates = [
      baseStr,
      extractJsonObject(text),
      ...(codeBlockMatch ? [codeBlockMatch[1].trim()] : []),
    ].filter((s): s is string => !!s && s.length > 10);

    for (const candidate of candidates) {
      const p = tryParse(candidate);
      if (p && (p.result || p.careerRoadmap || (p as Record<string, unknown>).summary)) {
        parsed = p;
        break;
      }
    }

    if (!parsed.result && !parsed.careerRoadmap) {
      const asObj = parsed as Record<string, unknown>;
      if (asObj && typeof asObj === 'object' && ('summary' in asObj || 'skillScores' in asObj)) {
        const roadmap = asObj.careerRoadmap;
        const { careerRoadmap: _r, ...rest } = asObj;
        parsed = {
          result: rest as Record<string, unknown>,
          careerRoadmap: typeof roadmap === 'object' && roadmap ? (roadmap as Record<string, string>) : undefined,
        };
      } else {
        parsed = {
          result: {
            summary: '分析結果の取得に問題がありました。もう一度診断を実行してください。',
            simpleDiagnosisSummary: normalizeSimpleDiagnosisSummary(undefined, ''),
          },
          careerRoadmap: { shortTerm: '-', midTerm: '-', longTerm: '-' },
        };
        if (process.env.NODE_ENV === 'development' && text) {
          console.warn('[Diagnosis] All parse attempts failed. Text length:', text.length, 'preview:', text.slice(0, 200));
        }
      }
    }

    const rawResult =
      parsed.result ??
      (parsed && typeof parsed === 'object' && ('summary' in parsed || 'skillScores' in parsed)
        ? (parsed as Record<string, unknown>)
        : {});
    const result =
      typeof rawResult === 'object' && rawResult !== null && !Array.isArray(rawResult)
        ? rawResult
        : {};
    const nestedRoadmap =
      typeof rawResult === 'object' &&
      rawResult !== null &&
      'careerRoadmap' in rawResult &&
      typeof (rawResult as { careerRoadmap?: unknown }).careerRoadmap === 'object'
        ? (rawResult as { careerRoadmap: Record<string, string> }).careerRoadmap
        : null;
    const careerRoadmap =
      parsed.careerRoadmap ?? nestedRoadmap ?? {
        shortTerm: '-',
        midTerm: '-',
        longTerm: '-',
      };

    const resultObj = result as Record<string, unknown>;
    const resultMerged = {
      ...resultObj,
      simpleDiagnosisSummary: normalizeSimpleDiagnosisSummary(
        resultObj.simpleDiagnosisSummary,
        typeof resultObj.summary === 'string' ? resultObj.summary : undefined
      ),
    };

    log('8. connecting DB and saving');
    await connectDB();
    const diagnosis = await Diagnosis.create({
      userId,
      answers,
      result: resultMerged,
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
