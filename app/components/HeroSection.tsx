'use client';

import { Box, Container, Typography } from '@mui/material';
import Image from 'next/image';
import CTAButton from './common/CTAButton';

export default function HeroSection() {
  return (
    <Box
      component="section"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
        pt: { xs: 14, md: 12 },
        pb: { xs: 8, md: 10 },
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

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            textAlign: 'center',
          }}
        >
          {/* バッジ - サイズアップ */}
          <Box
            sx={{
              display: 'inline-block',
              px: { xs: 3, md: 4 },
              py: { xs: 1.2, md: 1.5 },
              mb: 4,
              borderRadius: 50,
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
              border: '2px solid rgba(249, 115, 22, 0.3)',
              boxShadow: '0 4px 15px rgba(249, 115, 22, 0.1)',
            }}
          >
            <Typography
              sx={{
                color: '#ea580c',
                fontWeight: 700,
                fontSize: { xs: '1rem', md: '1.2rem' },
                letterSpacing: '0.02em',
              }}
            >
              ✨ たった5問・3分で完了
            </Typography>
          </Box>

          {/* キャッチコピー */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              mb: 3,
              color: 'text.primary',
              '& span': {
                background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              },
            }}
          >
            5問でわかる、あなたの<span>キャリア</span>
          </Typography>

          {/* サブコピー - インパクトアップ */}
          <Box
            sx={{
              mb: 5,
              py: 2,
              px: 3,
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(245, 158, 11, 0.05) 100%)',
              borderRadius: 3,
              display: 'inline-block',
            }}
          >
            <Typography
              sx={{
                color: '#6b5344',
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 600,
                lineHeight: 1.6,
                '& span': {
                  color: '#f97316',
                  fontWeight: 700,
                },
              }}
            >
              <span>AI</span>があなたに最適な<br />
              <span>キャリアロードマップ</span>を提案します
            </Typography>
          </Box>

          {/* ヒーロー画像 */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 700,
              mx: 'auto',
              mb: 5,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(139, 90, 43, 0.2)',
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

          {/* CTAボタン */}
          <Box sx={{ mb: 2 }}>
            <CTAButton variant="primary" size="large" />
          </Box>

          {/* 補足テキスト */}
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              opacity: 0.7,
              fontSize: '0.95rem',
            }}
          >
            完全無料・登録不要
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
