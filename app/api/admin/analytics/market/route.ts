import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireAdmin } from '@/lib/requireAdmin';

function buildPrompt(diagnosisVocab: {
  industries: string[];
  jobTypes: string[];
}): string {
  const industryList = [...new Set([...diagnosisVocab.industries, 'IT・テクノロジー', '金融', 'コンサルティング', '製造', '小売・EC', '医療・介護', '教育'])].slice(0, 15);
  const jobList = [...new Set([...diagnosisVocab.jobTypes, '営業', 'エンジニア', 'マーケティング', '人事', 'マネージャー'])].slice(0, 15);

  return `あなたは日本の求人市場の専門家です。
現在の日本における求人・募集の傾向（直近1〜2年）を踏まえ、以下の形式で需要分布の推定値を返してください。

【診断システムで使用する業種の例】
${industryList.join('、')}

【診断システムで使用する職種の例】
${jobList.join('、')}

【重要】
- name は上記の語彙と一致させてください。上記にない語彙を足す場合は、一般的な求人市場で使われる表現にしてください。
- value は相対的な需要割合（％）で、各カテゴリの合計が100になるようにしてください。
- byAgeGroup の name は「20未満」「20代」「30代」「40代」「50代」「60代以上」のいずれかにしてください。

【出力形式】JSONのみを返すこと。説明文・マークダウン・コードブロックは含めない。
{
  "byIndustry": [ {"name": "IT・テクノロジー", "value": 18}, {"name": "金融", "value": 12}, ... ],
  "byJobType": [ {"name": "エンジニア", "value": 22}, {"name": "営業", "value": 18}, ... ],
  "byAgeGroup": [ {"name": "20代", "value": 30}, {"name": "30代", "value": 40}, {"name": "40代", "value": 20}, ... ]
}`;
}

function extractJsonObject(raw: string): string | null {
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
    if (c === '}') {
      depth--;
      if (depth === 0) return stripped.slice(start, i + 1);
    }
  }
  return null;
}

export interface MarketData {
  byIndustry: Array<{ name: string; value: number }>;
  byJobType: Array<{ name: string; value: number }>;
  byAgeGroup: Array<{ name: string; value: number }>;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.res;

  try {
    const body = await request.json().catch(() => ({}));
    const diagnosisVocab = (body?.diagnosisVocab ?? {}) as {
      industries?: string[];
      jobTypes?: string[];
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY が設定されていません' },
        { status: 500 }
      );
    }

    const prompt = buildPrompt({
      industries: diagnosisVocab.industries ?? [],
      jobTypes: diagnosisVocab.jobTypes ?? [],
    });

    const anthropic = new Anthropic({ apiKey });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlocks = Array.isArray(message.content)
      ? message.content.filter((c) => c.type === 'text')
      : [];
    const text = textBlocks
      .map((c) => (c && typeof c === 'object' && 'text' in c ? (c as { text: string }).text : ''))
      .join('');

    const jsonStr = extractJsonObject(text);
    if (!jsonStr) {
      return NextResponse.json(
        { error: '市場データの解析に失敗しました' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonStr) as MarketData;

    const normalizeToPercent = (arr: Array<{ name: string; value: number }>) => {
      const filtered = (arr ?? []).filter((x) => x.name?.trim());
      const total = filtered.reduce((s, x) => s + (x.value ?? 0), 0);
      if (total <= 0) return filtered.map((x) => ({ name: x.name.trim(), value: 0 }));
      return filtered.map((x) => ({
        name: x.name.trim(),
        value: Math.round(((x.value ?? 0) / total) * 1000) / 10,
      }));
    };

    const market: MarketData = {
      byIndustry: normalizeToPercent(parsed.byIndustry ?? []),
      byJobType: normalizeToPercent(parsed.byJobType ?? []),
      byAgeGroup: normalizeToPercent(parsed.byAgeGroup ?? []),
    };

    return NextResponse.json(market);
  } catch (error) {
    console.error('[admin/analytics/market]', error);
    return NextResponse.json(
      { error: '市場データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
