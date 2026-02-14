'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#f97316', // オレンジ
      light: '#fb923c',
      dark: '#ea580c',
    },
    secondary: {
      main: '#f59e0b', // アンバー
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#fffbf5', // 薄いアイボリー
      paper: '#ffffff',
    },
    text: {
      primary: '#3d2c1e',
      secondary: '#5c4033', // 本文・補足文用
    },
  },
  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      color: '#3d2c1e',
      fontSize: '4.5rem',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.03em',
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
        letterSpacing: '-0.02em',
      },
    },
    h2: {
      color: '#3d2c1e',
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      '@media (max-width:600px)': {
        fontSize: '1.875rem',
      },
    },
    h3: {
      color: '#3d2c1e',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0em',
    },
    h4: {
      color: '#3d2c1e',
    },
    h5: {
      color: '#3d2c1e',
    },
    h6: {
      color: '#3d2c1e',
    },
    body1: {
      color: '#3d2c1e',
      fontSize: '1rem',
      lineHeight: 1.8,
      fontWeight: 400,
    },
    body2: {
      color: '#5c4033',
      fontSize: '0.875rem',
      lineHeight: 1.7,
      fontWeight: 400,
    },
    subtitle1: {
      color: '#3d2c1e',
    },
    subtitle2: {
      color: '#5c4033',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#3d2c1e',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: '#3d2c1e',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 50,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)',
        },
      },
    },
  },
});

export default theme;
