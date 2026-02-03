'use client';

import { Box, Container, Typography } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import InsightsIcon from '@mui/icons-material/Insights';

const steps = [
  {
    number: '01',
    icon: <EditNoteIcon sx={{ fontSize: 36 }} />,
    title: '質問に回答',
    description: '5つの簡単な質問に答えるだけ',
  },
  {
    number: '02',
    icon: <AutoFixHighIcon sx={{ fontSize: 36 }} />,
    title: 'AI分析',
    description: 'AIがあなたの回答を分析',
  },
  {
    number: '03',
    icon: <InsightsIcon sx={{ fontSize: 36 }} />,
    title: '結果表示',
    description: 'あなた専用のロードマップを表示',
  },
];

export default function StepsSection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
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
          width: '80%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.04) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* セクションタイトル */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mb: 2,
              color: 'text.primary',
            }}
          >
            診断の<Box component="span" sx={{ color: '#f97316' }}>流れ</Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            たった3ステップで、あなたのキャリアロードマップが完成します
          </Typography>
        </Box>

        {/* ステップ */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {steps.map((step, index) => (
            <Box
              key={index}
              sx={{
                width: { xs: '100%', md: 'calc(33.333% - 22px)' },
                maxWidth: { md: 350 },
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* コネクター（PC表示時のみ） */}
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    display: { xs: 'none', md: 'block' },
                    position: 'absolute',
                    top: '40px',
                    right: '-15%',
                    width: '30%',
                    height: '3px',
                    background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.4) 0%, rgba(245, 158, 11, 0.4) 100%)',
                    borderRadius: 2,
                    '&::after': {
                      content: '"→"',
                      position: 'absolute',
                      right: '-12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#f97316',
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                    },
                  }}
                />
              )}

              {/* ステップ番号とアイコン */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                  color: 'white',
                  mx: 'auto',
                  mb: 3,
                  boxShadow: '0 10px 30px rgba(249, 115, 22, 0.3)',
                  position: 'relative',
                }}
              >
                {step.icon}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: 'white',
                    color: '#f97316',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 10px rgba(139, 90, 43, 0.15)',
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
                  mb: 1.5,
                  color: 'text.primary',
                }}
              >
                {step.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {step.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
