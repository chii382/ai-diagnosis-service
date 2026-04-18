/**
 * 公開サイトのオリジン（例: https://example.com）。
 * 本番で `NEXT_PUBLIC_APP_URL` の設定漏れがあると Checkout の return_url が作れず 500 になるため、
 * 代表的なホスティングが付与する環境変数をフォールバックする。
 */
export function getPublicAppUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }

  const withHttps = (raw: string | undefined): string | null => {
    if (!raw?.trim()) return null;
    const host = raw.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!host) return null;
    return `https://${host}`;
  };

  const vercel = withHttps(process.env.VERCEL_URL);
  if (vercel) return vercel;

  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) {
    const u = withHttps(railway);
    if (u) return u;
  }

  const netlify = process.env.URL ?? process.env.DEPLOY_PRIME_URL;
  const nl = withHttps(netlify);
  if (nl) return nl;

  return null;
}
