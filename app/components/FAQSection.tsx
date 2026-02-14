'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { motion } from 'motion/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: '診断は本当に無料ですか？',
    answer: 'はい、完全無料です。診断機能は無料でご利用いただけます。追加の費用や登録料は一切かかりません。',
  },
  {
    question: '診断にはどのくらい時間がかかりますか？',
    answer: 'たった5問の質問に答えるだけなので、約3分で完了します。忙しい方でもスキマ時間で簡単に診断できます。',
  },
  {
    question: '診断結果は保存されますか？',
    answer: '現在、診断結果の自動保存機能はありません。結果を保存したい場合は、画面をスクリーンショットで保存するか、結果ページをブックマークしてください。将来的に保存機能の追加を検討しています。',
  },
  {
    question: '何度でも診断できますか？',
    answer: 'はい、何度でも無料で診断できます。キャリアの方向性が変わった時や、定期的に自分の適性を確認したい時にご利用ください。',
  },
  {
    question: '診断結果を共有できますか？',
    answer: '現在、診断結果の共有機能は準備中です。将来的にSNSでのシェア機能や、PDFでのダウンロード機能の追加を予定しています。',
  },
  {
    question: '個人情報は安全に管理されますか？',
    answer: 'はい、お客様の個人情報は厳重に管理いたします。診断に必要な最小限の情報のみを取得し、第三者に提供することはありません。詳細はプライバシーポリシーをご確認ください。',
  },
  {
    question: '診断結果はどのくらい正確ですか？',
    answer: 'AIが最新のキャリア分析技術を用いて、あなたの回答を多角的に分析します。ただし、診断結果は参考情報としてご活用いただき、最終的な判断はご自身で行ってください。',
  },
  {
    question: '就活生・転職活動中の方にも使えますか？',
    answer: 'はい、就活中の学生から転職を考えている社会人まで、幅広い方にご利用いただけます。キャリアの方向性に悩んでいる方のサポートツールとしてご活用ください。',
  },
];

export default function FAQSection() {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      if (window.location.hash === '#faq') {
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
      id="faq"
      sx={{
        pt: { xs: 6, md: 8 },
        pb: { xs: 10, md: 14 },
        background: 'transparent',
      }}
    >
      <Container maxWidth="md">
        {/* セクションタイトル */}
        <motion.div
          key={`title-${animationKey}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px 0px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                mb: 2,
                color: '#3d2c1e',
              }}
            >
              よくある<Box component="span" sx={{ color: '#f97316' }}>質問</Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#5c4033',
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              診断に関するよくある質問と回答をご紹介します
            </Typography>
          </Box>
        </motion.div>

        {/* FAQアコーディオン */}
        <motion.div
          key={`faq-${animationKey}`}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px 0px' }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(139, 90, 43, 0.08)',
                border: '1px solid rgba(139, 90, 43, 0.08)',
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  borderColor: 'rgba(249, 115, 22, 0.2)',
                  boxShadow: '0 4px 16px rgba(249, 115, 22, 0.12)',
                },
              }}
            >
              <AccordionSummary
                expandIcon={
                  <ExpandMoreIcon
                    sx={{
                      color: '#f97316',
                    }}
                  />
                }
                sx={{
                  px: { xs: 2, md: 3 },
                  py: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(249, 115, 22, 0.04)',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: '#3d2c1e',
                    fontSize: { xs: '0.95rem', md: '1rem' },
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  px: { xs: 2, md: 3 },
                  pb: 3,
                  pt: 0,
                }}
              >
                <Typography
                  sx={{
                    color: '#5c4033',
                    lineHeight: 1.8,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
