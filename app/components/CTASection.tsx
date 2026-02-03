'use client';

import { Box, Container, Typography } from '@mui/material';
import CTAButton from './common/CTAButton';

export default function CTASection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 10, md: 14 },
        background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景装飾 */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '50%',
          height: '70%',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '40%',
          height: '60%',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mb: 2,
              color: 'white',
            }}
          >
            今すぐキャリア診断を
            <br />
            始めましょう
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 5,
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: { xs: '1rem', md: '1.125rem' },
            }}
          >
            完全無料・登録不要で診断できます
          </Typography>

          <CTAButton variant="secondary" size="large" />
        </Box>
      </Container>
    </Box>
  );
}
