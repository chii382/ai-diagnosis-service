'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, TextField, Button, CircularProgress, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';

interface ProfileData {
  name: string;
  email: string;
  image?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

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
            email: data.email || session.user?.email || '',
            image: data.image || session.user?.image || '',
          });
        } catch (e) {
          setProfileData({
            name: session.user?.name || '',
            email: session.user?.email || '',
            image: session.user?.image || '',
          });
        } finally {
          setProfileLoaded(true);
        }
      };
      fetchProfile();
    }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          image: profileData.image ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      const data = await response.json();
      setProfileData((prev) => ({
        ...prev,
        name: data.name || prev.name,
      }));
      router.push('/dashboard');
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'エラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

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

  if (!profileLoaded) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 100%)',
          pt: 10,
          pb: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#f97316' }} />
        </Container>
      </Box>
    );
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
      <Container maxWidth="md">
        <Card
          sx={{
            p: 4,
            boxShadow: '0 20px 60px rgba(139, 90, 43, 0.15)',
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, mb: 4, color: '#3d2c1e' }}
            >
              プロフィール
            </Typography>

            {message && (
              <Alert severity={message.type} sx={{ mb: 3 }}>
                {message.text}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Avatar
                src={profileData.image || session.user?.image || undefined}
                alt={profileData.name || 'User'}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#f97316',
                  mb: 2,
                }}
              >
                {!profileData.image && !session.user?.image && <PersonIcon sx={{ fontSize: 60 }} />}
              </Avatar>
              <Typography variant="body2" sx={{ color: '#3d2c1e' }}>
                アバターはGoogleアカウントから取得されます
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#f97316',
                    color: '#f97316',
                    '&:hover': {
                      borderColor: '#ea580c',
                      backgroundColor: 'rgba(249, 115, 22, 0.04)',
                    },
                  }}
                >
                  アバター画像を変更
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // ファイルを Data URL に変換してプレビュー＆保存
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const result = reader.result;
                        if (typeof result !== 'string') return;

                        // 画面プレビュー更新
                        setProfileData((prev) => ({
                          ...prev,
                          image: result,
                        }));

                        setLoading(true);
                        setMessage(null);
                        try {
                          const response = await fetch('/api/user/profile', {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              name: profileData.name,
                              image: result,
                            }),
                          });

                          if (!response.ok) {
                            throw new Error('アバターの更新に失敗しました');
                          }

                          const data = await response.json();
                          setProfileData((prev) => ({
                            ...prev,
                            image: data.image || result,
                          }));
                          setMessage({ type: 'success', text: 'アバターを更新しました' });
                        } catch (error) {
                          setMessage({
                            type: 'error',
                            text: error instanceof Error ? error.message : 'アバター更新中にエラーが発生しました',
                          });
                        } finally {
                          setLoading(false);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </Button>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="名前"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="メールアドレス"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                margin="normal"
                disabled
                sx={{ mb: 2 }}
                helperText="メールアドレスは変更できません"
              />

              <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
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
                  保存
                </Button>
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
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
                    キャンセル
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
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
