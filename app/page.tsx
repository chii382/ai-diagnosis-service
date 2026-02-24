'use client';

import { Suspense } from 'react';
import { Box } from '@mui/material';
import { motion } from 'motion/react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import PainSection from './components/PainSection';
import StepsSection from './components/StepsSection';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <Box component="main" sx={{ background: '#fff7ed', minHeight: '100vh' }}>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <HeroSection />
        <PainSection />
        <FeaturesSection />
        <StepsSection />
        <PricingSection />
        <FAQSection />
        <ContactSection />
      </motion.div>
      <Footer />
    </Box>
  );
}
