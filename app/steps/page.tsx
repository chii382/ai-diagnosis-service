'use client';

import { Box } from '@mui/material';
import { motion } from 'motion/react';
import Header from '../components/Header';
import StepsSection from '../components/StepsSection';
import Footer from '../components/Footer';

export default function StepsPage() {
  return (
    <Box component="main" sx={{ background: '#fff7ed', minHeight: '100vh' }}>
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ pt: 10 }}>
          <StepsSection />
        </Box>
      </motion.div>
      <Footer />
    </Box>
  );
}
