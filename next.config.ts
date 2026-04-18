import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import path from 'node:path';
import { createRequire } from 'node:module';

/** Turbopack が `@mui/material-nextjs` の package exports ワイルドカード（`./*`）を解決できない場合の実体パス（相対・/ 区切り。Windows で絶対パスだと Turbopack が未対応） */
const require = createRequire(import.meta.url);
const muiMaterialNextjsRoot = path.dirname(
  require.resolve('@mui/material-nextjs/package.json')
);
const muiAppRouterEntry = `./${path
  .relative(process.cwd(), path.join(muiMaterialNextjsRoot, 'v16-appRouter/index.js'))
  .replace(/\\/g, '/')}`;

const muiMaterialRoot = path.dirname(require.resolve('@mui/material/package.json'));
function muiMaterialAlias(tailFromPackageRoot: string): string {
  return `./${path
    .relative(process.cwd(), path.join(muiMaterialRoot, tailFromPackageRoot))
    .replace(/\\/g, '/')}`;
}

/** Turbopack が next-auth の package exports（next-auth/react 等）を解決できない場合の実体パス */
const nextAuthRoot = path.dirname(require.resolve('next-auth/package.json'));
function nextAuthAlias(tailFromPackageRoot: string): string {
  return `./${path
    .relative(process.cwd(), path.join(nextAuthRoot, tailFromPackageRoot))
    .replace(/\\/g, '/')}`;
}

const nextConfig: NextConfig = {
  transpilePackages: [
    '@mui/material',
    '@mui/material-nextjs',
    '@mui/icons-material',
    '@mui/system',
  ],
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mui/material/CssBaseline': path.join(muiMaterialRoot, 'CssBaseline/index.js'),
      '@mui/material/styles': path.join(muiMaterialRoot, 'styles/index.js'),
      '@mui/material-nextjs/v13-appRouter': path.join(
        muiMaterialNextjsRoot,
        'v16-appRouter/index.js'
      ),
      '@mui/material-nextjs/v14-appRouter': path.join(
        muiMaterialNextjsRoot,
        'v16-appRouter/index.js'
      ),
      '@mui/material-nextjs/v15-appRouter': path.join(
        muiMaterialNextjsRoot,
        'v16-appRouter/index.js'
      ),
      '@mui/material-nextjs/v16-appRouter': path.join(
        muiMaterialNextjsRoot,
        'v16-appRouter/index.js'
      ),
      'next-auth/react': path.join(nextAuthRoot, 'react.js'),
      'next-auth/providers/google': path.join(nextAuthRoot, 'providers/google.js'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      // ドキュメントや古い記事の import パス（v13〜v16 は同じ実装の再エクスポート）
      '@mui/material-nextjs/v13-appRouter': muiAppRouterEntry,
      '@mui/material-nextjs/v14-appRouter': muiAppRouterEntry,
      '@mui/material-nextjs/v15-appRouter': muiAppRouterEntry,
      '@mui/material-nextjs/v16-appRouter': muiAppRouterEntry,
      // Turbopack が @mui/material の package exports ワイルドカード（`./*`）を解決できない場合の実体パス
      '@mui/material/CssBaseline': muiMaterialAlias('CssBaseline/index.js'),
      '@mui/material/styles': muiMaterialAlias('styles/index.js'),
      'next-auth/react': nextAuthAlias('react.js'),
      'next-auth/providers/google': nextAuthAlias('providers/google.js'),
    },
  },
};

const hasSentry = !!(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN);

export default hasSentry
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG ?? '',
      project: process.env.SENTRY_PROJECT ?? '',
      silent: !process.env.CI,
    })
  : nextConfig;
