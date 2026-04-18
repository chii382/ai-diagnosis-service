'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import type { StripeEmbeddedCheckout } from '@stripe/stripe-js';
import {
  CHECKOUT_USER_FRIENDLY_ERROR,
  STRIPE_EMBEDDED_CLIENT_SECRET_KEY,
} from '@/app/lib/stripeEmbeddedHandoff';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

/**
 * Embedded Checkout ＋ 下にキャンセル。
 * セッション取得失敗時は Alert + 再試行・お問い合わせ・トップ（CheckoutButton と同じ3導線）。
 */
export default function CheckoutPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const checkoutInstanceRef = useRef<StripeEmbeddedCheckout | null>(null);
  const clientSecretCache = useRef<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  /** 再試行のたびに増やして埋め込み初期化をやり直す */
  const [retryKey, setRetryKey] = useState(0);

  const fetchClientSecret = useCallback(async () => {
    if (clientSecretCache.current) {
      return clientSecretCache.current;
    }
    if (typeof window !== 'undefined') {
      const handedOff = sessionStorage.getItem(STRIPE_EMBEDDED_CLIENT_SECRET_KEY);
      if (handedOff) {
        sessionStorage.removeItem(STRIPE_EMBEDDED_CLIENT_SECRET_KEY);
        clientSecretCache.current = handedOff;
        return handedOff;
      }
    }
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ embedded: true }),
    });
    const data = (await res.json()) as { clientSecret?: string; error?: string };
    if (res.status === 401) {
      throw new Error('login_required');
    }
    if (!res.ok) {
      throw new Error(data.error ?? 'session');
    }
    if (!data.clientSecret) {
      throw new Error('no_secret');
    }
    clientSecretCache.current = data.clientSecret;
    return data.clientSecret;
  }, []);

  const handleRetry = useCallback(() => {
    clientSecretCache.current = null;
    checkoutInstanceRef.current?.destroy();
    checkoutInstanceRef.current = null;
    setError(null);
    setLoading(true);
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!publishableKey) {
      setError(CHECKOUT_USER_FRIENDLY_ERROR);
      setLoading(false);
      return;
    }

    const mountEl = mountRef.current;
    if (!mountEl) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const stripe = await loadStripe(publishableKey);
        if (!stripe || cancelled) return;

        const embedded = await stripe.createEmbeddedCheckoutPage({
          fetchClientSecret,
        });
        if (cancelled) {
          embedded.destroy();
          return;
        }

        checkoutInstanceRef.current = embedded;
        embedded.mount(mountEl);
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error && err.message === 'login_required'
              ? '購入するにはログインが必要です。サインインしてからお試しください。'
              : CHECKOUT_USER_FRIENDLY_ERROR;
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      checkoutInstanceRef.current?.destroy();
      checkoutInstanceRef.current = null;
    };
  }, [fetchClientSecret, retryKey]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 2 }}>
        お支払い
      </Typography>

      {error ? (
        <Alert severity="error" role="alert" sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            {error}
          </Typography>
          <Stack spacing={1} alignItems="flex-start">
            <Button
              variant="contained"
              size="small"
              onClick={handleRetry}
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

      <Box sx={{ position: 'relative', minHeight: 320 }}>
        {loading ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
            }}
          >
            <CircularProgress />
          </Box>
        ) : null}
        <div ref={mountRef} id="embedded-checkout" />
      </Box>

      <Box
        sx={{
          mt: 3,
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          お支払いをせずに終了する場合
        </Typography>
        <Button
          component={Link}
          href="/checkout/cancel"
          variant="outlined"
          color="error"
          fullWidth
          sx={{
            maxWidth: 360,
            py: 1.25,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          キャンセル
        </Button>
      </Box>
    </Container>
  );
}
