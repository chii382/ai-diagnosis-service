/**
 * AI が返す simpleDiagnosisSummary（3行）を正規化して常に3要素の配列にする。
 * クライアント・API の両方で利用可能。
 */

const DEFAULT_SIMPLE_LINES: [string, string, string] = [
  '回答に基づき、あなたのキャリアの方向性を簡潔に示したサマリーです。',
  '詳細な分析・ロードマップは有料版でご確認いただけます。',
  '引き続きキャリア探索にお役立てください。',
];

/** 「ー」「—」などだけの行は空として扱い、別文で埋める */
function sanitizeSimpleLine(s: string): string {
  const t = s.trim();
  if (!t) return '';
  if (/^[\u30FC\u2014\u2015\uFF0D\u2212\-ー－・…\s　]+$/u.test(t)) return '';
  return t;
}

export function normalizeSimpleDiagnosisSummary(
  raw: unknown,
  summaryFallback?: string
): [string, string, string] {
  const pad = (lines: string[]): [string, string, string] => {
    const a = lines.map(sanitizeSimpleLine);
    const out = [a[0] ?? '', a[1] ?? '', a[2] ?? ''];
    for (let i = 0; i < 3; i++) {
      if (!out[i]) out[i] = DEFAULT_SIMPLE_LINES[i];
    }
    return [out[0], out[1], out[2]];
  };

  if (Array.isArray(raw)) {
    const lines = raw
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    if (lines.length > 0) return pad(lines);
  }
  if (typeof raw === 'string') {
    const lines = raw
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    if (lines.length > 0) return pad(lines);
  }
  if (summaryFallback?.trim()) {
    const parts = summaryFallback
      .split(/(?<=[。！？])\s*/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    if (parts.length > 0) return pad(parts);
  }
  return [...DEFAULT_SIMPLE_LINES];
}
