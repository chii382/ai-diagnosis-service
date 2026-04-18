import { Box, Button, Typography } from '@mui/material';

/**
 * Stripe Checkout の success_url で開くページ（Server Component）
 * ※ ここは「支払い完了の確定」ではなく、Checkout 側の受付完了の表示。
 *    権限反映などの最終処理は Webhook 側で行う前提。
 */
export default function CheckoutSuccessPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
        maxWidth: 520,
        mx: 'auto',
      }}
    >
      {/* 見出し：支払いを受け付けたことだけ伝える（課金確定とは書かない） */}
      <Typography variant="h5" component="h1" align="center" fontWeight={700}>
        お支払いを受け付けました
      </Typography>

      {/* 補足：反映は非同期であることを示す */}
      <Typography color="text.secondary" align="center" sx={{ lineHeight: 1.7 }}>
        Pro機能はまもなく反映されます。
      </Typography>

      {/* 次の行動：マイページへ */}
      <Button
        component="a"
        href="/dashboard"
        variant="contained"
        sx={{ mt: 1, textTransform: 'none', fontWeight: 700, px: 3 }}
      >
        マイページへ
      </Button>
    </Box>
  );
}
