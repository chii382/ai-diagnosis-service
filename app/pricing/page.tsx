'use client';

import { Box, Container, Typography, Card, CardContent } from '@mui/material';
import { motion } from 'motion/react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function PricingPage() {
  const plans = [
    {
      name: '無料プラン',
      price: '¥0',
      period: '完全無料・永続的',
      features: [
        '5問の簡単な質問に回答',
        'AIによる基本的な分析',
        'シンプルなキャリアロードマップ',
        '月1回まで診断可能',
      ],
      note: '※ 追加の費用や登録料は一切かかりません',
      highlighted: false,
    },
    {
      name: 'スタンダードプラン',
      price: '¥980',
      period: '月額',
      features: [
        '5問の簡単な質問に回答',
        'AIによる深い分析',
        'パーソナライズされたキャリアロードマップ',
        '具体的な次のステップの提案',
        '月5回まで診断可能',
        '詳細レポートのダウンロード',
      ],
      note: '※ 初月無料キャンペーン実施中',
      highlighted: true,
    },
    {
      name: 'プレミアムプラン',
      price: '¥2,980',
      period: '月額',
      features: [
        '5問の簡単な質問に回答',
        'AIによる深い分析',
        'パーソナライズされたキャリアロードマップ',
        '具体的な次のステップの提案',
        '無制限で診断可能',
        '詳細レポートのダウンロード',
        '専属キャリアアドバイザーサポート',
        '優先的な新機能へのアクセス',
      ],
      note: '※ 初月無料キャンペーン実施中',
      highlighted: false,
    },
  ];

  return (
    <Box component="main" sx={{ background: '#fff7ed', minHeight: '100vh' }}>
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ pt: 10 }}>
        <Box
          component="section"
          sx={{
            pt: { xs: 4, md: 6 },
            pb: { xs: 10, md: 14 },
            background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 100%)',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                料金<Box component="span" sx={{ color: '#f97316' }}>プラン</Box>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  maxWidth: 500,
                  mx: 'auto',
                }}
              >
                あなたに最適なプランをお選びください
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: { xs: 4, md: 3 },
                alignItems: 'stretch',
                pt: { xs: 4, md: 5 },
                overflow: 'visible',
              }}
            >
              {plans.map((plan, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    pt: plan.highlighted ? { xs: 2, md: 2.5 } : 0,
                  }}
                >
                  {plan.highlighted && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#f97316',
                        color: '#ffffff',
                        px: 2.5,
                        py: 0.75,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        zIndex: 2,
                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      おすすめ
                    </Box>
                  )}
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      textAlign: 'center',
                      border: plan.highlighted
                        ? '3px solid #f97316'
                        : '2px solid rgba(249, 115, 22, 0.2)',
                      background: plan.highlighted
                        ? 'linear-gradient(180deg, #fff7ed 0%, #fffbf5 100%)'
                        : 'linear-gradient(180deg, #ffffff 0%, #fffbf5 100%)',
                      boxShadow: plan.highlighted
                        ? '0 20px 40px rgba(249, 115, 22, 0.25)'
                        : '0 20px 40px rgba(249, 115, 22, 0.15)',
                      transform: plan.highlighted ? { md: 'scale(1.05)' } : 'none',
                      position: 'relative',
                      transition: 'transform 0.3s ease',
                      overflow: 'visible',
                      '&:hover': {
                        transform: plan.highlighted ? { md: 'scale(1.08)' } : { md: 'scale(1.02)' },
                      },
                    }}
                  >
                  <CardContent sx={{ p: { xs: 4, md: 5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="h3"
                      component="h2"
                      sx={{
                        mb: 1,
                        color: 'text.primary',
                        fontSize: { xs: '1.5rem', md: '1.75rem' },
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h2"
                        component="div"
                        sx={{
                          fontWeight: 700,
                          color: '#f97316',
                          mb: 0.5,
                          fontSize: { xs: '2rem', md: '2.5rem' },
                        }}
                      >
                        {plan.price}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {plan.period}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'left', mb: 4, flexGrow: 1 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <Box
                          key={featureIndex}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            mb: 2,
                          }}
                        >
                          <CheckCircleIcon
                            sx={{
                              color: '#f97316',
                              fontSize: 20,
                              mt: 0.25,
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.primary',
                              fontSize: { xs: '0.875rem', md: '0.9375rem' },
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontStyle: 'italic',
                        fontSize: { xs: '0.75rem', md: '0.8125rem' },
                        mt: 'auto',
                      }}
                    >
                      {plan.note}
                    </Typography>
                  </CardContent>
                </Card>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      </Box>
      </motion.div>
      <Footer />
    </Box>
  );
}
