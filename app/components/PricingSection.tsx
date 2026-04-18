'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Box, Container, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { motion } from 'motion/react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckoutButton from './CheckoutButton';
import { PLAN_PRO } from '@/lib/plan';

type PricingPlan =
  | {
      name: string;
      price: string;
      period: string;
      features: string[];
      note: string;
    }
  | {
      name: string;
      price: string;
      period: string;
      features: string[];
      cta: 'checkout';
    };

export default function PricingSection() {
  const { status } = useSession();
  const [animationKey, setAnimationKey] = useState(0);
  /** ログイン時のみ取得。null は未ログインまたは読み込み中 */
  const [userPlan, setUserPlan] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setUserPlan(null);
      return;
    }
    if (status !== 'authenticated') return;

    let cancelled = false;
    setUserPlan(null);
    void fetch('/api/user/profile', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('profile'))))
      .then((data: { plan?: number }) => {
        if (!cancelled) {
          setUserPlan(typeof data.plan === 'number' ? data.plan : 0);
        }
      })
      .catch(() => {
        if (!cancelled) setUserPlan(0);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const showProCheckout =
    status === 'unauthenticated' ||
    (status === 'authenticated' && userPlan !== null && userPlan !== PLAN_PRO);
  const proPlanLoading =
    status === 'loading' || (status === 'authenticated' && userPlan === null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      if (window.location.hash === '#pricing') {
        // すぐにアニメーションをリセット（スクロール開始時）
        setAnimationKey(prev => prev + 1);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const plans: PricingPlan[] = [
    {
      name: 'フリープラン（無料）',
      price: '¥0',
      period: '完全無料・永続的',
      features: ['5問の簡単な質問に回答', 'AIによる簡易診断結果'],
      note: '※ 追加の費用や登録料は一切かかりません',
    },
    {
      name: 'プロプラン（有料）',
      price: '¥980',
      period: '月額',
      features: [
        '5問の簡単な質問に回答',
        'AIによる簡易診断結果',
        'AIによる詳細キャリアロードマップ作成',
        '診断履歴の保存・比較',
        '結果のPDFダウンロード',
      ],
      cta: 'checkout',
    },
  ];

  return (
    <Box
      component="section"
      id="pricing"
      sx={{
        pt: { xs: 6, md: 8 },
        pb: { xs: 6, md: 8 },
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 100%)',
      }}
    >
      <Container maxWidth="lg">
        {/* セクションタイトル */}
        <motion.div
          key={`title-${animationKey}`}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px 0px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                mb: 2,
                color: '#3d2c1e',
              }}
            >
              料金<Box component="span" sx={{ color: '#f97316' }}>プラン</Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#5c4033',
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              あなたに最適なプランをお選びください
            </Typography>
          </Box>
        </motion.div>

        {/* プランカード */}
        <motion.div
          key={`plans-${animationKey}`}
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px 0px' }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: { xs: 4, md: 3 },
            alignItems: 'stretch',
            pt: { xs: 4, md: 5 },
            overflow: 'visible',
            maxWidth: 920,
            mx: 'auto',
          }}
        >
          {plans.map((plan, index) => (
            <Box key={index} sx={{ position: 'relative' }}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  border: '2px solid rgba(249, 115, 22, 0.2)',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fffbf5 100%)',
                  boxShadow: '0 20px 40px rgba(249, 115, 22, 0.15)',
                  position: 'relative',
                  transition: 'transform 0.3s ease',
                  overflow: 'visible',
                  '&:hover': {
                    transform: { md: 'scale(1.02)' },
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 4, md: 5 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h3"
                    component="h3"
                    sx={{
                      mb: 1,
                      color: '#3d2c1e',
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
                    <Typography variant="body2" sx={{ color: '#5c4033' }}>
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
                            color: '#3d2c1e',
                            fontSize: { xs: '0.875rem', md: '0.9375rem' },
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {'cta' in plan && plan.cta === 'checkout' ? (
                    <Box sx={{ mt: 'auto', width: '100%', pt: 1, minHeight: proPlanLoading ? 52 : undefined }}>
                      {proPlanLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
                          <CircularProgress size={28} sx={{ color: '#f97316' }} />
                        </Box>
                      ) : showProCheckout ? (
                        <CheckoutButton
                          label="アップグレード"
                          variant="contained"
                          fullWidth
                          size="medium"
                          buttonSx={{
                            bgcolor: '#f97316',
                            color: '#fff',
                            py: 1.25,
                            fontSize: { xs: '0.95rem', md: '1rem' },
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 8px 20px rgba(249, 115, 22, 0.35)',
                            '&:hover': {
                              bgcolor: '#ea580c',
                              boxShadow: '0 10px 24px rgba(234, 88, 12, 0.4)',
                            },
                          }}
                        />
                      ) : null}
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#5c4033',
                        fontStyle: 'italic',
                        fontSize: { xs: '0.75rem', md: '0.8125rem' },
                        mt: 'auto',
                      }}
                    >
                      {'note' in plan ? plan.note : ''}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
