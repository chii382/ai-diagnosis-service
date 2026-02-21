'use client';

import { Button, Box } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

interface CTAButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export default function CTAButton({ variant = 'primary', size = 'large', fullWidth = false }: CTAButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Button
      component={Link}
      href="/diagnosis-free"
      variant="contained"
      size={size}
      fullWidth={fullWidth}
        sx={{
          background: isPrimary
            ? 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ed8936 100%)'
            : 'white',
          color: isPrimary ? '#ffffff' : '#f97316',
          px: size === 'large' ? 6 : 4,
          py: size === 'large' ? 2.5 : 1.5,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textShadow: isPrimary ? '0 1px 2px rgba(0,0,0,0.15)' : 'none',
          boxShadow: isPrimary
            ? '0 8px 30px rgba(251, 146, 60, 0.45)'
            : '0 4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.25,
          position: 'relative',
          overflow: 'visible',
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
        {isPrimary && (
          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 48,
              height: 48,
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))',
              transform: 'rotate(-15deg)',
              display: 'block',
            }}
            aria-label="初心者マーク"
          >
            <Image
              src="/images/shoshinsha-mark-transparent.png"
              alt="初心者マーク"
              width={48}
              height={48}
              style={{ objectFit: 'contain', width: 48, height: 48 }}
              unoptimized
            />
          </Box>
        )}
        <Box component="span" sx={{ lineHeight: 1.2, whiteSpace: 'nowrap' }}>
          <Box component="span" sx={{ fontSize: size === 'large' ? '1rem' : '0.9rem' }}>まずは</Box>
          <Box
            component="span"
            sx={{
              fontSize: size === 'large' ? '1.65rem' : '1.2rem',
              fontWeight: 800,
              color: '#fef08a',
              textShadow: '0 2px 4px rgba(0,0,0,0.25), 0 0 12px rgba(254,240,138,0.5)',
            }}
          >
            無料
          </Box>
          <Box component="span" sx={{ fontSize: size === 'large' ? '1rem' : '0.9rem' }}>で</Box>
        </Box>
        <Box component="span" sx={{ fontSize: size === 'large' ? '1rem' : '0.9rem', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
          診断してみる
        </Box>
      </Button>
  );
}
