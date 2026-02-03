'use client';

import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const features = [
  {
    icon: <AccessTimeIcon sx={{ fontSize: 48 }} />,
    title: 'たった5問・3分で完了',
    description: '忙しいあなたでも、スキマ時間でサクッと診断できます。シンプルな質問に答えるだけ。',
    color: '#f97316',
  },
  {
    icon: <PsychologyIcon sx={{ fontSize: 48 }} />,
    title: 'AIが深く分析',
    description: '最新のAI技術があなたの回答を多角的に分析。表面的な診断ではない深い洞察を提供します。',
    color: '#f59e0b',
  },
  {
    icon: <TrackChangesIcon sx={{ fontSize: 48 }} />,
    title: 'パーソナライズされた提案',
    description: 'あなただけのキャリアロードマップを作成。具体的な次のステップがわかります。',
    color: '#ea580c',
  },
];

export default function FeaturesSection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        background: '#ffffff',
      }}
    >
      <Container maxWidth="lg">
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
            選ばれる<Box component="span" sx={{ color: '#f97316' }}>3つ</Box>の理由
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            キャリア診断AIは、あなたのキャリア選択をサポートします
          </Typography>
        </Box>

        {/* 特徴カード */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center',
          }}
        >
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                width: { xs: '100%', md: 'calc(33.333% - 22px)' },
                maxWidth: { md: 400 },
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(139, 90, 43, 0.08)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fffbf5 100%)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(249, 115, 22, 0.15)',
                    borderColor: 'rgba(249, 115, 22, 0.2)',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}10 100%)`,
                      color: feature.color,
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{
                      mb: 2,
                      color: 'text.primary',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.8,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
