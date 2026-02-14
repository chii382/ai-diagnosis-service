'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';

interface ProfileData {
  name: string;
  image?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({ name: '', image: '' });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user) {
      setProfileLoaded(false);
      const fetchProfile = async () => {
        try {
          const res = await fetch('/api/user/profile', { method: 'GET' });
          if (!res.ok) throw new Error('Fetch failed');
          const data = await res.json();
          setProfileData({
            name: data.name || session.user?.name || '',
            image: data.image || session.user?.image || '',
          });
        } catch (e) {
          setProfileData({
            name: session.user?.name || '',
            image: session.user?.image || '',
          });
        } finally {
          setProfileLoaded(true);
        }
      };
      fetchProfile();
    }
  }, [status, session, router]);

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
        background: '#fff7ed',
        pt: 10,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#3d2c1e',
            mb: 3,
            pt: 0,
          }}
        >
          ダッシュボード
        </Typography>

        <Card
          sx={{
            p: 4,
            mb: 4,
            boxShadow: '0 20px 60px rgba(139, 90, 43, 0.12)',
            borderRadius: 3,
            background: '#ffffff',
            border: '1px solid rgba(139, 90, 43, 0.08)',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              {!profileLoaded ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: 'rgba(139, 90, 43, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress size={32} sx={{ color: '#f97316' }} />
                  </Box>
                  <Box>
                    <Box sx={{ width: 120, height: 28, bgcolor: 'rgba(139, 90, 43, 0.1)', borderRadius: 1, mb: 1 }} />
                    <Box sx={{ width: 180, height: 20, bgcolor: 'rgba(139, 90, 43, 0.08)', borderRadius: 1 }} />
                  </Box>
                </Box>
              ) : (
                <>
                  <Avatar
                    src={profileData.image || undefined}
                    alt={profileData.name || 'User'}
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: '#f97316',
                    }}
                  >
                    {!profileData.image && <PersonIcon sx={{ fontSize: 40 }} />}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 0.5, color: '#3d2c1e' }}>
                      {profileData.name || 'ユーザー'}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#5c4033' }}>
                      {session.user?.email}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>

            <Typography variant="body1" sx={{ color: '#5c4033', mb: 4 }}>
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
                onClick={() => setLogoutDialogOpen(true)}
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

      {/* ログアウト確認ダイアログ */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>ログアウトの確認</DialogTitle>
        <DialogContent>
          <Typography>ログアウトします。よろしいですか？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="inherit">
            キャンセル
          </Button>
          <Button onClick={() => { signOut({ callbackUrl: '/auth/signin' }); setLogoutDialogOpen(false); }} color="error" variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
