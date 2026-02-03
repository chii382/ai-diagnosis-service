import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeProvider from './providers/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: '5問でわかる、あなたのキャリア | キャリア診断AI',
  description:
    'AIがあなたに最適なキャリアロードマップを提案します。たった5問・3分で完了。完全無料・登録不要で診断できます。',
  keywords: 'キャリア診断, AI, キャリアロードマップ, 転職, 就活, キャリア相談',
  openGraph: {
    title: '5問でわかる、あなたのキャリア | キャリア診断AI',
    description: 'AIがあなたに最適なキャリアロードマップを提案します。',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
