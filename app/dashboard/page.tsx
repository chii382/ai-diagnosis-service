'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Image from 'next/image';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import HomeIcon from '@mui/icons-material/Home';
import Link from 'next/link';
import PlanRibbonBadge from '@/app/components/PlanRibbonBadge';
import { PLAN_PRO } from '@/lib/plan';

interface ProfileData {
  name: string;
  image?: string;
  /** 0=フリー, 1=プロ */
  plan?: number;
}

const actionItems = [
  { label: 'AIキャリア診断', href: '/diagnosis', icon: PsychologyIcon, primary: true, main: true },
  { label: '診断履歴', href: '/diagnosis/history', icon: HistoryIcon, primary: true },
  { label: 'プロフィールを入力', href: '/profile', icon: EditIcon, primary: false },
  { label: 'LPに戻る', href: '/', icon: HomeIcon, primary: false },
];

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
            plan: typeof data.plan === 'number' ? data.plan : 0,
          });
        } catch (e) {
          setProfileData({
            name: session.user?.name || '',
            image: session.user?.image || '',
            plan: 0,
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
          background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
        }}
      >
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', pt: { xs: 2, sm: 4 }, pb: 1, mt: { xs: -1, sm: -2 }, width: '100%', boxSizing: 'border-box', overflowX: 'hidden', background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 1.5, md: 2 }, margin: '0 auto', pt: 0, mt: 0, width: '100%', maxWidth: '100%' }}>

        {/* ヘッダーバナー（画像全体を表示、アスペクト比を維持） */}
        <Box
          sx={{
            width: '100%',
            borderRadius: 1.5,
            overflow: 'hidden',
          }}
        >
          <Image
            src="/images/dashboard-header-banner.png"
            alt="会員専用ページ"
            width={1537}
            height={401}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            priority
            unoptimized
          />
        </Box>

        {/* メインコンテンツ */}
        <Box
          sx={{
            mt: 0.25,
            minHeight: { xs: '50vh', sm: '55vh' },
            background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
            pt: 1,
            pb: { xs: 3, sm: 5 },
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              height: '60%',
              background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            },
          }}
        >
          {/* メインカード */}
        <Box
          sx={{
            background: '#ffffff',
            borderRadius: 2.5,
            border: '1px solid rgba(139, 90, 43, 0.08)',
            overflow: 'hidden',
            boxShadow: '0 16px 48px rgba(139, 90, 43, 0.1)',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* ユーザーセクション */}
          <Box
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              pt: { xs: 1.5, sm: 2.5 },
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(245, 158, 11, 0.02) 50%, transparent 100%)',
              borderBottom: '1px solid rgba(139, 90, 43, 0.06)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
              {!profileLoaded ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: { xs: 48, sm: 60 },
                      height: { xs: 48, sm: 60 },
                      borderRadius: '50%',
                      bgcolor: 'rgba(249, 115, 22, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress size={26} sx={{ color: '#f97316' }} />
                  </Box>
                  <Box>
                    <Box sx={{ width: 110, height: 20, bgcolor: 'rgba(139, 90, 43, 0.1)', borderRadius: 1, mb: 0.5 }} />
                    <Box sx={{ width: 160, height: 14, bgcolor: 'rgba(139, 90, 43, 0.08)', borderRadius: 1 }} />
                  </Box>
                </Box>
              ) : (
                <>
                  <Avatar
                    src={profileData.image || undefined}
                    alt={profileData.name || 'User'}
                    sx={{
                      width: { xs: 48, sm: 60 },
                      height: { xs: 48, sm: 60 },
                      bgcolor: '#f97316',
                      boxShadow: '0 6px 20px rgba(249, 115, 22, 0.3)',
                    }}
                  >
                    {!profileData.image && <PersonIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: '#fff' }} />}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1, sm: 1.25 },
                        flexWrap: 'wrap',
                        mb: 0.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.6rem' },
                          fontWeight: 700,
                          color: '#3d2c1e',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {profileData.name || 'ユーザー'}
                      </Typography>
                      <PlanRibbonBadge isPro={profileData.plan === PLAN_PRO} />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.95rem' },
                        color: '#5c4033',
                        wordBreak: 'break-all',
                      }}
                    >
                      {session.user?.email}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            <Typography
              sx={{
                mt: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                color: '#5c4033',
                lineHeight: 1.6,
              }}
            >
              会員専用ページへようこそ。ここから各種機能にアクセスできます。
            </Typography>
          </Box>

          {/* ワンポイントアドバイス */}
          <Box sx={{ p: { xs: 1, sm: 2, md: 2.5 }, pt: 1.5, pb: 0 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: { sm: 400, md: 420 },
                ml: { sm: 'auto' },
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.18) 0%, rgba(245, 158, 11, 0.1) 100%)',
                border: '2px solid rgba(249, 115, 22, 0.5)',
                boxShadow: '0 2px 12px rgba(249, 115, 22, 0.15)',
                overflow: 'visible',
                '@keyframes adviceBounce': {
                  '0%, 85%, 100%': { transform: 'translateY(0)' },
                  '90%': { transform: 'translateY(-8px)' },
                  '95%': { transform: 'translateY(2px)' },
                },
                animation: 'adviceBounce 3s ease-in-out infinite',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '12px solid transparent',
                  borderRight: '12px solid transparent',
                  borderTop: '14px solid rgba(249, 115, 22, 0.4)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: -6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: '12px solid #fff9f5',
                },
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.4,
                  background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  borderRadius: '10px 10px 10px 4px',
                }}
              >
                <LightbulbOutlinedIcon sx={{ fontSize: 16 }} />
                ワンポイントアドバイス
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: { xs: 1, sm: 1.5 }, pt: { xs: 1, sm: 1.25 } }}>
                <EditIcon sx={{ fontSize: { xs: 18, sm: 20 }, color: '#f97316', mt: 0.15, flexShrink: 0 }} />
                <Typography
                  component="div"
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    color: '#3d2c1e',
                    lineHeight: 1.7,
                    fontWeight: 600,
                  }}
                >
                  <Box component="span" sx={{ display: 'block', whiteSpace: { xs: 'normal', sm: 'nowrap' } }}>
                    プロフィールを入力すると診断に反映されます。
                  </Box>
                  <Box component="span" sx={{ display: 'block', whiteSpace: { xs: 'normal', sm: 'nowrap' } }}>
                    プロフィールを充実させましょう。
                  </Box>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* アクションカード：幅に応じて1行〜複数行に自然に折り返し（flexbox） */}
          <Box
            sx={{
              p: { xs: 1, sm: 2, md: 2.5 },
              pt: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 0.75, sm: 1 },
              width: '100%',
            }}
          >
            {actionItems.map((item) => {
              const Icon = item.icon;
              const isMain = 'main' in item && item.main;
              return (
                <Box
                  key={item.href}
                  sx={{
                    flex: isMain ? '2 1 220px' : '1 1 100px',
                    minWidth: isMain ? 180 : 85,
                  }}
                >
                  <Link href={item.href} style={{ textDecoration: 'none', minWidth: 0, display: 'block' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: { xs: 0.4, sm: 1 },
                        py: { xs: 1.25, sm: 2, md: 2.25 },
                        px: { xs: 0.5, sm: 1.5 },
                        borderRadius: 1.5,
                        background: isMain
                          ? 'linear-gradient(135deg, rgba(254, 215, 170, 0.7) 0%, rgba(253, 186, 116, 0.5) 50%, rgba(251, 146, 60, 0.25) 100%)'
                          : '#ffedd5',
                        border: isMain ? '2px solid rgba(249, 115, 22, 0.55)' : '1px solid rgba(139, 90, 43, 0.2)',
                        boxShadow: isMain
                          ? '0 4px 20px rgba(249, 115, 22, 0.3), 0 0 0 1px rgba(249, 115, 22, 0.15)'
                          : '0 2px 10px rgba(139, 90, 43, 0.08)',
                        transition: 'all 0.2s ease',
                        minHeight: { xs: 80, sm: 95 },
                        minWidth: 0,
                        '@keyframes mainGlow': {
                          '0%, 100%': { boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3), 0 0 0 1px rgba(249, 115, 22, 0.15)' },
                          '50%': { boxShadow: '0 6px 28px rgba(249, 115, 22, 0.4), 0 0 0 1px rgba(249, 115, 22, 0.2)' },
                        },
                        ...(isMain && {
                          animation: 'mainGlow 2.5s ease-in-out infinite',
                        }),
                        '&:hover': {
                          borderColor: item.primary ? 'rgba(249, 115, 22, 0.6)' : 'rgba(139, 90, 43, 0.2)',
                          boxShadow: isMain
                            ? '0 10px 32px rgba(249, 115, 22, 0.4), 0 0 0 2px rgba(249, 115, 22, 0.25)'
                            : '0 8px 24px rgba(139, 90, 43, 0.12)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 32, sm: 44 },
                          height: { xs: 32, sm: 44 },
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isMain
                            ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                            : item.primary
                              ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                              : 'rgba(249, 115, 22, 0.25)',
                          boxShadow: isMain ? '0 4px 14px rgba(249, 115, 22, 0.45)' : undefined,
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: { xs: 18, sm: 24 },
                            color: item.primary || isMain ? '#fff' : '#f97316',
                          }}
                        />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: isMain ? { xs: '0.9rem', sm: '1.15rem' } : { xs: '0.7rem', sm: '0.9rem' },
                          fontWeight: 600,
                          color: '#3d2c1e',
                          textAlign: 'center',
                          lineHeight: 1.4,
                          whiteSpace: { xs: 'normal', sm: 'nowrap' },
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </Link>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ px: { xs: 1.5, sm: 2, md: 2.5 }, pb: { xs: 2, sm: 2.5 }, pt: 0.75 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={() => setLogoutDialogOpen(true)}
              sx={{
                py: { xs: 1.25, sm: 1.4 },
                borderRadius: '9999px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              ログアウト
            </Button>
          </Box>
        </Box>
        </Box>
      </Container>

      {/* ログアウト確認ダイアログ */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: {
            background: '#fff',
            border: '1px solid rgba(139, 90, 43, 0.12)',
            borderRadius: 3,
            boxShadow: '0 25px 60px rgba(139, 90, 43, 0.15)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#3d2c1e', fontWeight: 700, fontSize: '1.2rem' }}>ログアウトの確認</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#5c4033', fontSize: '1.05rem' }}>ログアウトします。よろしいですか？</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            sx={{ color: '#5c4033', textTransform: 'none', fontSize: '1rem' }}
          >
            キャンセル
          </Button>
          <Button
            onClick={() => {
              signOut({ callbackUrl: '/' });
              setLogoutDialogOpen(false);
            }}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
              textTransform: 'none',
              fontSize: '1rem',
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
