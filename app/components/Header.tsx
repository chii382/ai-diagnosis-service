'use client';

import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'トップ', path: '/#' },
  { label: '特徴', path: '/#features' },
  { label: '診断の流れ', path: '/#steps' },
  { label: '料金', path: '/#pricing' },
  { label: 'よくある質問', path: '/#faq' },
  { label: 'お問い合わせ', path: '/#contact' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (typeof window === 'undefined') return;
    
    // トップへのリンクの場合
    if (path === '/#' || path === '/') {
      e.preventDefault();
      // 既にトップにいる場合は何もしない
      if (window.scrollY === 0) {
        setMobileOpen(false);
        return;
      }
      
      // ハッシュをクリア
      window.history.pushState(null, '', '/');
      
      // hashchangeイベントを発火（ヒーローセクションのアニメーションをリセット）
      const hashChangeEvent = new CustomEvent('hashchange', {
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(hashChangeEvent);
      
      // ページトップにスクロール
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      setMobileOpen(false); // モバイルメニューを閉じる
      return;
    }
    
    // アンカーリンクの場合のみスムーススクロール
    if (path.startsWith('/#')) {
      e.preventDefault();
      const hash = path.substring(1); // '/#features' -> '#features'
      const element = document.querySelector(hash);
      if (element) {
        const headerOffset = 80; // ヘッダーの高さ分のオフセット
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        // ハッシュを設定
        window.history.pushState(null, '', hash);
        
        // すぐにhashchangeイベントを発火（アニメーションをリセット）
        if (typeof window !== 'undefined') {
          const hashChangeEvent = new CustomEvent('hashchange', {
            bubbles: true,
            cancelable: true,
          });
          window.dispatchEvent(hashChangeEvent);
        }
        
        // スクロール開始
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
      setMobileOpen(false); // モバイルメニューを閉じる
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === 'undefined') return;
    
    // 既にトップにいる場合は何もしない
    if (window.scrollY === 0) {
      return;
    }
    e.preventDefault();
    
    // ハッシュをクリア
    window.history.pushState(null, '', '/');
    
    // hashchangeイベントを発火（ヒーローセクションのアニメーションをリセット）
    const hashChangeEvent = new CustomEvent('hashchange', {
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(hashChangeEvent);
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    setMobileOpen(false); // モバイルメニューを閉じる
  };


  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#f97316' }}>
          メニュー
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <Link
              href={item.path}
              style={{ textDecoration: 'none', width: '100%' }}
              onClick={(e) => handleNavClick(e, item.path)}
            >
              <ListItemButton
                sx={{
                  color: 'rgba(139, 90, 43, 0.8)',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(249, 115, 22, 0.08)',
                    color: '#f97316',
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
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
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleLogoClick}>
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
              </Link>
            </Box>

            {/* デスクトップナビゲーション */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  style={{ textDecoration: 'none' }}
                  onClick={(e) => handleNavClick(e, item.path)}
                >
                  <Button
                    sx={{
                      color: 'rgba(139, 90, 43, 0.8)',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      textTransform: 'none',
                      px: 2,
                      '&:hover': {
                        color: '#f97316',
                        backgroundColor: 'rgba(249, 115, 22, 0.08)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </Box>

            {/* モバイルメニューボタン */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, color: 'rgba(139, 90, 43, 0.8)' }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* モバイルドロワー */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // モバイルでのパフォーマンス向上のため
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
