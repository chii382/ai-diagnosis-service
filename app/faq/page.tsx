'use client';

import { Box } from '@mui/material';
import { motion } from 'motion/react';
import Header from '../components/Header';
import FAQSection from '../components/FAQSection';
import Footer from '../components/Footer';

export default function FAQPage() {
  return (
    <Box component="main" sx={{ background: '#fff7ed', minHeight: '100vh' }}>
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ pt: 10 }}>
          <FAQSection />
        </Box>
      </motion.div>
      <Footer />
    </Box>
  );
}
