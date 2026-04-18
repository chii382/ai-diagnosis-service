'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import Link from 'next/link';
import {
  CHECKOUT_USER_FRIENDLY_ERROR,
  STRIPE_EMBEDDED_CLIENT_SECRET_KEY,
} from '@/app/lib/stripeEmbeddedHandoff';

type CheckoutOkResponse = {
  clientSecret: string;
};

type CheckoutErrResponse = {
  error?: string;
};

type CheckoutButtonProps = {
  label?: string;
  variant?: 'contained' | 'outlined' | 'text';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  buttonSx?: SxProps<Theme>;
};

/**
 * 埋め込み Checkout 用セッションを作成し、client_secret を sessionStorage に渡してから /checkout へ遷移する。
 * 失敗時は Alert + 再試行・お問い合わせ・トップの3導線。
 */
export default function CheckoutButton({
  label = '購入する',
  variant = 'contained',
  fullWidth = false,
  size = 'medium',
  buttonSx,
}: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ embedded: true }),
      });
      const data = (await res.json()) as CheckoutOkResponse & CheckoutErrResponse;

      if (res.status === 401) {
        setError('購入するにはログインが必要です。サインインしてからお試しください。');
        return;
      }
      if (!res.ok || !data.clientSecret) {
        setError(CHECKOUT_USER_FRIENDLY_ERROR);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(STRIPE_EMBEDDED_CLIENT_SECRET_KEY, data.clientSecret);
      }
      router.push('/checkout');
    } catch {
      setError(CHECKOUT_USER_FRIENDLY_ERROR);
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {error ? (
        <Alert severity="error" role="alert">
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            {error}
          </Typography>
          <Stack spacing={1} alignItems="flex-start">
            <Button
              variant="contained"
              size="small"
              onClick={() => void startCheckout()}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              もう一度試す
            </Button>
            <MuiLink component={Link} href="/contact" underline="hover" variant="body2">
              お問い合わせ
            </MuiLink>
            <MuiLink component={Link} href="/" underline="hover" variant="body2">
              トップページへ戻る
            </MuiLink>
          </Stack>
        </Alert>
      ) : null}

      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={loading}
        onClick={() => void startCheckout()}
        sx={
          buttonSx != null
            ? ([
                { textTransform: 'none', fontWeight: 700 },
                buttonSx,
              ] as SxProps<Theme>)
            : { textTransform: 'none', fontWeight: 700 }
        }
      >
        {loading ? '処理中…' : label}
      </Button>
    </Box>
  );
}
