'use client';

import { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Box, Container, Typography, Button, Card, CardContent, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            p: 4,
            boxShadow: '0 20px 60px rgba(139, 90, 43, 0.15)',
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Link
                href="/"
                style={{
                  textDecoration: 'none',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Image
                    src="/images/compass-logo.png"
                    alt="AI CAREER COMPASS"
                    width={80}
                    height={80}
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                </Box>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  AI CAREER COMPASS
                </Typography>
              </Link>
              <Typography variant="body1" sx={{ color: '#5c4033', mb: 4 }}>
                会員専用機能をご利用いただくには、Googleアカウントでログインしてください
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              sx={{
                background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                color: 'white',
                fontWeight: 600,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                },
              }}
            >
              Googleでログイン
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
