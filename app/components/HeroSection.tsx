'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'motion/react';
import Image from 'next/image';
import CTAButton from './common/CTAButton';

export default function HeroSection() {
  const [animationKey, setAnimationKey] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

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
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
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
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
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
              initial={{ opacity: 0, y: 20 }}
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

            {/* CTAボタン */}
            <motion.div
              key={`button-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.6,
                delay: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <Box
                sx={{
                  mt: { xs: 6, md: 10 },
                }}
              >
                <CTAButton variant="primary" size="large" />
              </Box>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
