'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, TextField, Button } from '@mui/material';
import { motion } from 'motion/react';

export default function ContactSection() {
  const [animationKey, setAnimationKey] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleHashChange = () => {
      if (window.location.hash === '#contact') {
        // すぐにアニメーションをリセット（スクロール開始時）
        setAnimationKey(prev => prev + 1);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // フォーム送信処理（実装予定）
    setFormData({ name: '', email: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box
      component="section"
      id="contact"
      sx={{
        pt: { xs: 6, md: 8 },
        pb: { xs: 10, md: 14 },
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 100%)',
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
                color: 'text.primary',
              }}
            >
              お<Box component="span" sx={{ color: '#f97316' }}>問い合わせ</Box>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              ご質問やご意見がございましたら、お気軽にお問い合わせください
            </Typography>
          </Box>
        </motion.div>

        {/* フォーム */}
        <motion.div
          key={`form-${animationKey}`}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px 0px' }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            background: '#ffffff',
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(139, 90, 43, 0.08)',
          }}
        >
          <TextField
            fullWidth
            label="お名前"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="メールアドレス"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="お問い合わせ内容"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            multiline
            rows={6}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ed8936 100%)',
              color: '#ffffff',
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 700,
              '&:hover': {
                background: 'linear-gradient(135deg, #fdba74 0%, #fb923c 50%, #f97316 100%)',
              },
            }}
          >
            送信する
          </Button>
        </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
