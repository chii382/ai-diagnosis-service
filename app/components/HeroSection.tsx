'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import LogoutIcon from '@mui/icons-material/Logout';
import CTAButton from './common/CTAButton';

export default function HeroSection() {
  const { data: session, status } = useSession();
  const [animationKey, setAnimationKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const isLoggedIn = status === 'authenticated' && !!session;

  const handleLogoutClick = () => setLogoutDialogOpen(true);
  const handleLogoutConfirm = () => {
    signOut({ callbackUrl: '/' });
    setLogoutDialogOpen(false);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // 初回読み込み時にアニメーションを発動
    setIsVisible(true);

    // ハッシュ変更時（ロゴクリック時やトップボタンクリック時など）にアニメーションを再発動
    const handleHashChange = () => {
      // ハッシュが空または#の場合、またはカスタムイベントの場合
      const currentHash = window.location.hash;
      if (currentHash === '' || currentHash === '#') {
        setIsVisible(false);
        setTimeout(() => {
          setAnimationKey(prev => prev + 1);
          setIsVisible(true);
        }, 50);
      }
    };

    // カスタムイベント（hashchange）とネイティブイベントの両方をリッスン
    window.addEventListener('hashchange', handleHashChange);
    
    // 初回読み込み時にもハッシュをチェック
    if (window.location.hash === '' || window.location.hash === '#') {
      // 初回は既にアニメーションが発動しているので、何もしない
    }
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <Box
      component="section"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 9, md: 9 },
        pb: { xs: 4, md: 4 },
      }}
    >
      <Box
        component="video"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          minWidth: '100%',
          minHeight: '100%',
          transform: 'translate(-50%, -50%)',
          objectFit: 'cover',
          zIndex: 0,
        }}
        src="/videos/hero-background.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(120deg, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.75) 40%, rgba(15, 23, 42, 0.3) 100%)',
          zIndex: 1,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}
        >
          <Box
            sx={{
              maxWidth: { xs: '100%', md: 680 },
              textAlign: 'center',
              mx: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: { xs: 4, md: 6 },
              mt: { xs: 2, md: 3 },
            }}
          >
            {/* メインタイトル */}
            <motion.div
              key={`title-${animationKey}`}
              initial={false}
              animate={isVisible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
              transition={{ 
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  mb: { xs: 2.5, md: 3 },
                  color: '#f9fafb',
                  fontSize: { xs: '2.8rem', md: '4.2rem' },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  '& span': {
                    color: '#f97316',
                  },
                }}
              >
                BEST PARTNER<br />
                FOR YOUR <span>CAREER</span>
              </Typography>
            </motion.div>

            {/* サブコピー */}
            <motion.div
              key={`subcopy-${animationKey}`}
              initial={false}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.6,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <Typography
                sx={{
                  color: 'rgba(241, 245, 249, 0.9)',
                  fontSize: { xs: '1.05rem', md: '1.2rem' },
                  fontWeight: 400,
                  lineHeight: 1.9,
                  mt: { xs: 2, md: 2.5 },
                  mb: { xs: 4.5, md: 5 },
                  maxWidth: 540,
                  '& span': {
                    color: '#f97316',
                    fontWeight: 600,
                  },
                }}
              >
                たった<span>5問</span>の質問で、あなたの<span>強み</span>と<span>可能性</span>を可視化。<br />
                <span>AI</span>があなただけの<span>キャリアロードマップ</span>を描きます。
              </Typography>
            </motion.div>

            {/* CTAボタン or ログアウト（ログイン中） */}
            <motion.div
              key={`button-${animationKey}`}
              initial={false}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.6,
                delay: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              {isLoggedIn ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255, 251, 245, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '2px solid rgba(249, 115, 22, 0.4)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                  minWidth: { xs: 280, sm: 360 },
                }}
              >
                <Typography
                  sx={{
                    color: '#3d2c1e',
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  ログイン中です。ログアウトする場合はこちらから
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogoutClick}
                  sx={{
                    background: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ed8936 100%)',
                    color: '#fff',
                    px: 4,
                    py: 1.8,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    borderRadius: '9999px',
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(251, 146, 60, 0.45)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #fdba74 0%, #fb923c 50%, #f97316 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(251, 146, 60, 0.55)',
                    },
                  }}
                >
                  ログアウト
                </Button>
              </Box>
              ) : (
              <Box
                sx={{
                  mt: { xs: 6, md: 10 },
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'stretch',
                  justifyContent: 'center',
                  gap: 3.5,
                  width: '100%',
                  maxWidth: 760,
                }}
              >
                <Link href="/auth/signin" style={{ textDecoration: 'none', flex: 1, minWidth: 300 }}>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ed8936 100%)',
                        color: '#ffffff',
                        px: 6,
                        py: 2.5,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textShadow: '0 1px 2px rgba(0,0,0,0.15)',
                        boxShadow: '0 8px 30px rgba(251, 146, 60, 0.45)',
                        borderRadius: 50,
                        textTransform: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.25,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #fdba74 0%, #fb923c 50%, #f97316 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(251, 146, 60, 0.55)',
                        },
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontSize: '1rem',
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          color: '#3d2817',
                          textShadow: '0 1px 2px rgba(255,255,255,0.3)',
                        }}
                      >
                        会員様はこちら
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          fontSize: '1.65rem',
                          fontWeight: 800,
                          lineHeight: 1.2,
                          color: '#fff',
                          textShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 20px rgba(255,255,255,0.3)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        ログイン
                      </Box>
                    </Button>
                  </Link>
                <Box sx={{ flex: 1, minWidth: 300, position: 'relative', overflow: 'visible' }}>
                  <CTAButton variant="primary" size="large" fullWidth />
                </Box>
              </Box>
              )}
            </motion.div>
          </Box>
        </motion.div>
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
          <Button onClick={() => setLogoutDialogOpen(false)} sx={{ color: '#5c4033', textTransform: 'none' }}>
            キャンセル
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
              textTransform: 'none',
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
