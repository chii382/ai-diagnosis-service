'use client';

import { Button, Snackbar, Alert } from '@mui/material';
import { useState } from 'react';

interface CTAButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export default function CTAButton({ variant = 'primary', size = 'large' }: CTAButtonProps) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleClick = () => {
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const isPrimary = variant === 'primary';

  return (
    <>
      <Button
        variant="contained"
        size={size}
        onClick={handleClick}
        sx={{
          background: isPrimary
            ? 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ed8936 100%)'
            : 'white',
          color: isPrimary ? '#ffffff' : '#f97316',
          px: size === 'large' ? 6 : 4,
          py: size === 'large' ? 2.5 : 1.5,
          fontSize: size === 'large' ? '1.25rem' : '1rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textShadow: isPrimary ? '0 1px 2px rgba(0,0,0,0.15)' : 'none',
          boxShadow: isPrimary
            ? '0 8px 30px rgba(251, 146, 60, 0.45)'
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: isPrimary
              ? 'linear-gradient(135deg, #fdba74 0%, #fb923c 50%, #f97316 100%)'
              : 'rgba(255, 255, 255, 0.95)',
            transform: 'translateY(-2px)',
            boxShadow: isPrimary
              ? '0 12px 40px rgba(251, 146, 60, 0.55)'
              : '0 8px 30px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        無料で診断を始める
      </Button>

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
            background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
            color: '#ffffff',
            fontWeight: 600,
            '& .MuiAlert-icon': {
              color: '#ffffff',
            },
          }}
        >
          Coming Soon! 診断機能は近日公開予定です 🚀
        </Alert>
      </Snackbar>
    </>
  );
}
