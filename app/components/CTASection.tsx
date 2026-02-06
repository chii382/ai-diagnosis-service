'use client';

import { Box, Container, Typography } from '@mui/material';
import CTAButton from './common/CTAButton';

export default function CTASection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        background: '#ffffff',
        position: 'relative',
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CTAButton variant="primary" size="large" />
        </Box>
      </Container>
    </Box>
  );
}
