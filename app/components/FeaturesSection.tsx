'use client';

import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import FreeIcon from '@mui/icons-material/AttachMoney';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VerifiedIcon from '@mui/icons-material/Verified';

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
  {
    icon: <FreeIcon sx={{ fontSize: 48 }} />,
    title: '完全無料で利用可能',
    description: '一切の費用はかかりません。高品質なキャリア診断を無料でお試しいただけます。',
    color: '#f97316',
  },
  {
    icon: <PersonAddIcon sx={{ fontSize: 48 }} />,
    title: '登録不要・すぐに始められる',
    description: 'メール登録や会員登録は不要。今すぐ診断を始めて、すぐに結果を確認できます。',
    color: '#f59e0b',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 48 }} />,
    title: '専門家監修の信頼性',
    description: 'キャリアカウンセラーや人事の専門家が監修。信頼できる診断結果をお届けします。',
    color: '#ea580c',
  },
];

export default function FeaturesSection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
      }}
    >
      <Container maxWidth="lg">
        {/* セクションタイトル */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 6 } }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mb: 2,
              color: 'white',
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            選ばれる<Box component="span" sx={{ color: 'rgba(255, 255, 255, 0.95)' }}>6つ</Box>の理由
          </Typography>
        </Box>

        {/* 特徴カード */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
            justifyContent: 'center',
          }}
        >
          {features.map((feature, index) => (
            <Box
              key={index}
              sx={{
                width: '100%',
                maxWidth: { md: 400 },
                mx: 'auto',
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  border: 'none',
                  background: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${feature.color}15 0%, ${feature.color}10 100%)`,
                      color: feature.color,
                      mb: 2.5,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{
                      mb: 1.5,
                      color: 'text.primary',
                      fontSize: { xs: '1.125rem', md: '1.25rem' },
                      fontWeight: 600,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.7,
                      fontSize: { xs: '0.875rem', md: '0.95rem' },
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
