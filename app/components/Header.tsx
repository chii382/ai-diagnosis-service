'use client';

import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface HeaderProps {
  onCTAClick: () => void;
}

export default function Header({ onCTAClick }: HeaderProps) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(255, 251, 245, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(139, 90, 43, 0.08)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon
              sx={{
                color: '#f97316',
                fontSize: 28,
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              キャリア診断AI
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={onCTAClick}
            sx={{
              background: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ed8936 100%)',
              color: '#ffffff',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textShadow: '0 1px 2px rgba(0,0,0,0.15)',
              boxShadow: '0 4px 15px rgba(251, 146, 60, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #fdba74 0%, #fb923c 50%, #f97316 100%)',
                boxShadow: '0 6px 20px rgba(251, 146, 60, 0.5)',
              },
            }}
          >
            診断を始める
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
