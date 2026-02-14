'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'motion/react';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InsightsIcon from '@mui/icons-material/Insights';

const steps = [
  {
    number: '01',
    icon: <EditNoteIcon sx={{ fontSize: { xs: 56, md: 64 } }} />,
    title: '質問に回答',
    description: '5つの簡単な質問に答えるだけ',
  },
  {
    number: '02',
    icon: <AutoFixHighIcon sx={{ fontSize: { xs: 56, md: 64 } }} />,
    title: 'AI分析',
    description: 'AIがあなたの回答を分析',
  },
  {
    number: '03',
    icon: <InsightsIcon sx={{ fontSize: { xs: 56, md: 64 } }} />,
    title: '結果表示',
    description: 'あなた専用のロードマップを表示',
  },
];

export default function StepsSection() {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      if (window.location.hash === '#steps') {
        // すぐにアニメーションをリセット（スクロール開始時）
        setAnimationKey(prev => prev + 1);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <Box
      component="section"
      id="steps"
      sx={{
        pt: { xs: 6, md: 8 },
        pb: { xs: 6, md: 8 },
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景装飾 */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          height: '70%',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, rgba(245, 158, 11, 0.04) 50%, transparent 80%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />
      {/* 追加の装飾要素 */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: 180,
          height: 180,
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* セクションタイトル */}
        <motion.div
          key={`title-${animationKey}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px 0px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 10 } }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                mb: 2,
                color: '#3d2c1e',
              }}
            >
              診断の<Box component="span" sx={{ color: '#f97316' }}>流れ</Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#5c4033',
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              たった3ステップで、あなたのキャリアロードマップが完成します
            </Typography>
          </Box>
        </motion.div>

        {/* ステップ */}
        <motion.div
          key={`steps-${animationKey}`}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px 0px' }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 6, md: 8 },
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 2, md: 0 },
            mt: { xs: 2, md: 3 },
          }}
        >
          {steps.map((step, index) => (
            <Box
              key={index}
              sx={{
                width: { xs: '100%', md: 'calc(33.333% - 43px)' },
                maxWidth: { md: 480 },
                textAlign: 'center',
                position: 'relative',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: { md: 'translateY(-10px)' },
                },
              }}
            >
              {/* コネクター（PC表示時のみ） */}
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'absolute',
                    top: '70px',
                    right: '-20%',
                    width: '40%',
                    height: '5px',
                    background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.6) 0%, rgba(245, 158, 11, 0.6) 50%, rgba(249, 115, 22, 0.6) 100%)',
                    borderRadius: 3,
                    boxShadow: '0 3px 12px rgba(249, 115, 22, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                      borderRadius: 3,
                    },
                    '&::after': {
                      content: '"→"',
                      position: 'absolute',
                      right: '-20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#f97316',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      textShadow: '0 2px 6px rgba(249, 115, 22, 0.4), 0 0 10px rgba(249, 115, 22, 0.2)',
                      background: 'linear-gradient(135deg, #fffbf5 0%, #fff7ed 100%)',
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                    },
                  }}
                />
              )}

              {/* ステップ番号とアイコン */}
              <Box
                sx={{
                  width: { xs: 120, md: 140 },
                  height: { xs: 120, md: 140 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 40%, #ea580c 100%)',
                  color: 'white',
                  mx: 'auto',
                  mb: { xs: 4, md: 5 },
                  boxShadow: '0 16px 50px rgba(249, 115, 22, 0.5), 0 6px 20px rgba(249, 115, 22, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(245, 158, 11, 0.3) 100%)',
                    zIndex: -1,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                  },
                  '&:hover': {
                    transform: 'scale(1.08)',
                    boxShadow: '0 20px 60px rgba(249, 115, 22, 0.6), 0 8px 24px rgba(249, 115, 22, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                    '&::before': {
                      opacity: 1,
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                  }}
                >
                  {step.icon}
                </Box>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: -12,
                    width: { xs: 40, md: 44 },
                    height: { xs: 40, md: 44 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef3e2 50%, #ffffff 100%)',
                    color: '#f97316',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    fontWeight: 800,
                    boxShadow: '0 6px 16px rgba(139, 90, 43, 0.3), 0 2px 6px rgba(249, 115, 22, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
                    border: '3px solid rgba(249, 115, 22, 0.15)',
                    zIndex: 2,
                  }}
                >
                  {step.number}
                </Box>
              </Box>

              {/* タイトルと説明 */}
              <Typography
                variant="h3"
                component="h3"
                sx={{
                  mb: { xs: 2, md: 2.5 },
                  color: '#3d2c1e',
                  fontSize: { xs: '1.375rem', md: '1.75rem' },
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                {step.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#5c4033',
                  fontSize: { xs: '1rem', md: '1.0625rem' },
                  lineHeight: 1.8,
                }}
              >
                {step.description}
              </Typography>
            </Box>
          ))}
        </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
