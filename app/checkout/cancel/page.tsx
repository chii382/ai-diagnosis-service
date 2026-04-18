import { Box, Button, Stack, Typography } from '@mui/material';

/**
 * Stripe Checkout の cancel_url で開くページ（Server Component）
 * 決断を責めず、また検討してもらえるよう穏やかなトーンにする。
 */
export default function CheckoutCancelPage() {
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
      {/* キャンセルした事実を落ち着いて伝える */}
      <Typography variant="h5" component="h1" align="center" fontWeight={700}>
        お支払いはキャンセルされました
      </Typography>

      {/* 感謝の一文（ユーザーを責めない） */}
      <Typography color="text.secondary" align="center" sx={{ lineHeight: 1.7 }}>
        ご検討いただきありがとうございます。
      </Typography>

      {/* 料金・トップへの導線を縦に並べて読みやすく */}
      <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 320, mt: 1 }}>
        {/*
          Server Component からは next/link のコンポーネント参照を MUI に渡せないため、
          通常の <a> として描画する（見た目は MUI Button のまま）。
        */}
        <Button
          component="a"
          href="/pricing"
          variant="contained"
          fullWidth
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          料金ページを見る
        </Button>
        <Button
          component="a"
          href="/"
          variant="outlined"
          fullWidth
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          トップページへ戻る
        </Button>
      </Stack>
    </Box>
  );
}
