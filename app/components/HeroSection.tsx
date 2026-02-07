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
        minHeight: { xs: 'auto', md: 'auto' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
        pt: { xs: 10, md: 8 },
        pb: { xs: 4, md: 6 },
      }}
    >
      {/* 背景の装飾 */}
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '50%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '10%',
          left: '-10%',
          width: '40%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              py: { xs: 2, md: 3 },
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
                  color: 'text.primary',
                  fontSize: { xs: '2rem', md: '3.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  '& span': {
                    color: '#f97316',
                  },
                }}
              >
                5問でわかる、<br />
                あなたの<span>キャリア</span>
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
                  color: 'text.secondary',
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  fontWeight: 400,
                  lineHeight: 1.8,
                  mb: { xs: 4, md: 5 },
                  maxWidth: 600,
                  '& span': {
                    color: '#f97316',
                    fontWeight: 600,
                  },
                }}
              >
                <span>AI</span>があなたに最適な<br />
                <span>キャリアロードマップ</span>を提案します
              </Typography>
            </motion.div>

            {/* ヒーロー画像 */}
            <motion.div
              key={`image-${animationKey}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.8,
                delay: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: { xs: '100%', md: 650 },
                  mb: { xs: 4, md: 5 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(139, 90, 43, 0.15)',
                }}
              >
                <Image
                  src="/hero-image.png"
                  alt="キャリアアップを目指すビジネスパーソン"
                  width={1200}
                  height={675}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    display: 'block',
                  }}
                  priority
                />
              </Box>
            </motion.div>

            {/* CTAボタン */}
            <motion.div
              key={`button-${animationKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.6,
                delay: 0.7,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              <Box>
                <CTAButton variant="primary" size="large" />
              </Box>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
