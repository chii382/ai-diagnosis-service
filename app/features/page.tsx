'use client';

import { Box } from '@mui/material';
import { motion } from 'motion/react';
import Header from '../components/Header';
import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';

export default function FeaturesPage() {
  return (
    <Box component="main">
      <Header />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ pt: 10 }}>
          <FeaturesSection />
        </Box>
      </motion.div>
      <Footer />
    </Box>
  );
}
