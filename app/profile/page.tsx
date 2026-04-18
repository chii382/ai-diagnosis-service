'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, TextField, Button, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, FormLabel, FormControlLabel, Radio, RadioGroup, Select, MenuItem, InputLabel } from '@mui/material';
import Image from 'next/image';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { PLAN_PRO } from '@/lib/plan';

const AGE_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: '20未満', label: '20代未満' },
  { value: '20代', label: '20代' },
  { value: '30代', label: '30代' },
  { value: '40代', label: '40代' },
  { value: '50代', label: '50代' },
  { value: '60代以上', label: '60代以上' },
];

const JOB_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: '営業', label: '営業' },
  { value: 'エンジニア', label: 'エンジニア' },
  { value: 'マーケティング', label: 'マーケティング' },
  { value: '人事', label: '人事' },
  { value: '経理・財務', label: '経理・財務' },
  { value: 'デザイナー', label: 'デザイナー' },
  { value: 'マネージャー', label: 'マネージャー' },
  { value: '経営者・役員', label: '経営者・役員' },
  { value: 'その他', label: 'その他' },
];

const INDUSTRY_OPTIONS = [
  { value: '', label: '選択しない' },
  { value: 'IT・テクノロジー', label: 'IT・テクノロジー' },
  { value: '金融', label: '金融' },
  { value: 'コンサルティング', label: 'コンサルティング' },
  { value: '製造', label: '製造' },
  { value: '小売・EC', label: '小売・EC' },
  { value: '医療・介護', label: '医療・介護' },
  { value: '教育', label: '教育' },
  { value: 'マスコミ・広告', label: 'マスコミ・広告' },
  { value: '官公庁', label: '官公庁' },
  { value: 'その他', label: 'その他' },
];

interface ProfileData {
  name: string;
  email: string;
  image?: string;
  /** 0=フリー, 1=プロ */
  plan?: number;
  gender?: string;
  ageGroup?: string;
  jobType?: string;
  industry?: string;
  other?: string;
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
            email: data.email || session.user?.email || '',
            image: data.image || session.user?.image || '',
            plan: typeof data.plan === 'number' ? data.plan : 0,
            gender: data.gender ?? '',
            ageGroup: data.ageGroup ?? '',
            jobType: data.jobType ?? '',
            industry: data.industry ?? '',
            other: data.other ?? '',
          });
        } catch (e) {
          setProfileData({
            name: session.user?.name || '',
            email: session.user?.email || '',
            image: session.user?.image || '',
            plan: 0,
            gender: '',
            ageGroup: '',
            jobType: '',
            industry: '',
            other: '',
          });
        } finally {
          setProfileLoaded(true);
        }
      };
      fetchProfile();
    }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name?: string; value: unknown } }) => {
    const target = e.target as { name?: string; value: unknown };
    const name = target.name;
    if (name) {
      setProfileData((prev) => ({ ...prev, [name]: String(target.value ?? '') }));
    }
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
          gender: profileData.gender ?? '',
          ageGroup: profileData.ageGroup ?? '',
          jobType: profileData.jobType ?? '',
          industry: profileData.industry ?? '',
          other: profileData.other ?? '',
        }),
      });

      if (!response.ok) {
        throw new Error('プロフィールの更新に失敗しました');
      }

      const data = await response.json();
      setProfileData((prev) => ({
        ...prev,
        name: data.name ?? prev.name,
        image: data.image ?? prev.image,
        plan: typeof data.plan === 'number' ? data.plan : prev.plan,
        gender: data.gender ?? prev.gender ?? '',
        ageGroup: data.ageGroup ?? prev.ageGroup ?? '',
        jobType: data.jobType ?? prev.jobType ?? '',
        industry: data.industry ?? prev.industry ?? '',
        other: data.other ?? prev.other ?? '',
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
        pt: 3,
        pb: 6,
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ヘッダーバナー（985×152px、画像全体を表示） */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '985 / 152',
            overflow: 'hidden',
            borderRadius: 2,
            bgcolor: '#fff7ed',
          }}
        >
          <Image
            src="/images/profile-header-banner.png"
            alt="プロフィール入力"
            fill
            sizes="(max-width: 900px) 100vw, 900px"
            style={{ objectFit: 'contain', objectPosition: 'center center' }}
            priority
            unoptimized
          />
        </Box>

        {/* メインコンテンツ（ダッシュボードと同様の幅・スタイル） */}
        <Box
          sx={{
            mt: 2,
            background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
            pt: 2,
            pb: 6,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
        <Card
          sx={{
            p: 4,
            boxShadow: '0 20px 60px rgba(139, 90, 43, 0.12)',
            borderRadius: 3,
            border: '1px solid rgba(139, 90, 43, 0.08)',
          }}
        >
          <CardContent>

            {message && (
              <Alert severity={message.type} sx={{ mb: 3 }}>
                {message.text}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon sx={{ fontSize: 22 }} />}
                disabled={loading}
                sx={{
                  width: 180,
                  minHeight: 52,
                  fontSize: '1.1rem',
                  whiteSpace: 'nowrap',
                  borderRadius: '9999px',
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
                    width: 180,
                    minHeight: 52,
                    fontSize: '1.1rem',
                    whiteSpace: 'nowrap',
                    borderRadius: '9999px',
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
                variant="contained"
                startIcon={<LogoutIcon sx={{ fontSize: 22 }} />}
                onClick={() => setLogoutDialogOpen(true)}
                sx={{
                  width: 180,
                  minHeight: 52,
                  fontSize: '1.1rem',
                  whiteSpace: 'nowrap',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  },
                }}
              >
                ログアウト
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Avatar
                src={profileData.image || session.user?.image || undefined}
                alt={profileData.name || 'User'}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#f97316',
                  flexShrink: 0,
                }}
              >
                {!profileData.image && !session.user?.image && <PersonIcon sx={{ fontSize: 60 }} />}
              </Avatar>
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
                              gender: profileData.gender ?? '',
                              ageGroup: profileData.ageGroup ?? '',
                              jobType: profileData.jobType ?? '',
                              industry: profileData.industry ?? '',
                              other: profileData.other ?? '',
                            }),
                          });

                          if (!response.ok) {
                            throw new Error('アバターの更新に失敗しました');
                          }

                          const data = await response.json();
                          setProfileData((prev) => ({
                            ...prev,
                            image: data.image || result,
                            plan: typeof data.plan === 'number' ? data.plan : prev.plan,
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

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                <TextField
                  label="名前"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  margin="dense"
                  required
                  sx={{ flex: '1 1 200px', minWidth: 0 }}
                />
                <TextField
                  label="メールアドレス"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  margin="dense"
                  disabled
                  sx={{ flex: '1 1 200px', minWidth: 0 }}
                  helperText="メールアドレスは変更できません"
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#5c4033', mb: 1.5 }}>
                現在のプラン:{' '}
                <Box component="span" sx={{ fontWeight: 700, color: '#ea580c' }}>
                  {profileData.plan === PLAN_PRO ? 'プロ' : 'フリー'}
                </Box>
              </Typography>

              <FormControl component="fieldset" sx={{ mt: 1, mb: 1, display: 'block' }}>
                <FormLabel component="legend" sx={{ color: '#3d2c1e' }}>
                  性別（任意）
                </FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={profileData.gender || ''}
                  onChange={handleChange}
                >
                  <FormControlLabel value="" control={<Radio />} label="選択しない" />
                  <FormControlLabel value="男性" control={<Radio />} label="男性" />
                  <FormControlLabel value="女性" control={<Radio />} label="女性" />
                  <FormControlLabel value="その他" control={<Radio />} label="その他" />
                </RadioGroup>
              </FormControl>

              <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
                <InputLabel id="ageGroup-label">年齢（年代・任意）</InputLabel>
                <Select
                  labelId="ageGroup-label"
                  id="ageGroup"
                  name="ageGroup"
                  value={profileData.ageGroup || ''}
                  label="年齢（年代・任意）"
                  onChange={(e) => handleChange({ target: { name: 'ageGroup', value: e.target.value } })}
                >
                  {AGE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value || 'empty'} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
                <InputLabel id="jobType-label">今の職種（任意）</InputLabel>
                <Select
                  labelId="jobType-label"
                  id="jobType"
                  name="jobType"
                  value={profileData.jobType || ''}
                  label="今の職種（任意）"
                  onChange={(e) => handleChange({ target: { name: 'jobType', value: e.target.value } })}
                >
                  {JOB_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value || 'empty'} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
                <InputLabel id="industry-label">今の業種（任意）</InputLabel>
                <Select
                  labelId="industry-label"
                  id="industry"
                  name="industry"
                  value={profileData.industry || ''}
                  label="今の業種（任意）"
                  onChange={(e) => handleChange({ target: { name: 'industry', value: e.target.value } })}
                >
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value || 'empty'} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="その他（任意）"
                name="other"
                value={profileData.other || ''}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
                placeholder="補足や自由なコメントをご記入ください"
                sx={{ mb: 1 }}
              />
            </form>
          </CardContent>
        </Card>
        </Box>
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
          <Button
            onClick={() => { signOut({ callbackUrl: '/' }); setLogoutDialogOpen(false); }}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' },
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
