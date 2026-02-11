'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, Button, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 100%)',
        pt: 10,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        <Card
          sx={{
            p: 4,
            mb: 4,
            boxShadow: '0 20px 60px rgba(139, 90, 43, 0.15)',
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <Avatar
                src={session.user?.image || undefined}
                alt={session.user?.name || 'User'}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#f97316',
                }}
              >
                {!session.user?.image && <PersonIcon sx={{ fontSize: 40 }} />}
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                  {session.user?.name || 'ユーザー'}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {session.user?.email}
                </Typography>
              </Box>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
              ダッシュボード
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
              会員専用ページへようこそ。ここから各種機能にアクセスできます。
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Link href="/profile" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                    },
                  }}
                >
                  プロフィールを編集
                </Button>
              </Link>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#f97316',
                    color: '#f97316',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#ea580c',
                      backgroundColor: 'rgba(249, 115, 22, 0.08)',
                    },
                  }}
                >
                  LPに戻る
                </Button>
              </Link>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                sx={{
                  borderColor: '#dc2626',
                  color: '#dc2626',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#b91c1c',
                    backgroundColor: 'rgba(220, 38, 38, 0.08)',
                  },
                }}
              >
                ログアウト
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
