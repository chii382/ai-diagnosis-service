'use client';

import { useState } from 'react';
import { Box, Snackbar, Alert } from '@mui/material';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import StepsSection from './components/StepsSection';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function Home() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCTAClick = () => {
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box component="main">
      <Header onCTAClick={handleCTAClick} />
      <HeroSection />
      <FeaturesSection />
      <StepsSection />
      <FAQSection />
      <CTASection />
      <Footer />

      {/* ヘッダーのCTAボタン用スナックバー */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="info"
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          }}
        >
          Coming Soon! 診断機能は近日公開予定です 🚀
        </Alert>
      </Snackbar>
    </Box>
  );
}
