'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Box, Tabs, Tab, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BugReportIcon from '@mui/icons-material/BugReport';
import HomeIcon from '@mui/icons-material/Home';

export default function AdminLayoutNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const value =
    pathname === '/admin'
      ? 0
      : pathname.startsWith('/admin/users')
        ? 1
        : pathname.startsWith('/admin/analytics')
          ? 2
          : pathname.startsWith('/admin/errors')
            ? 3
            : 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
        pt: 2,
        pb: 4,
      }}
    >
      <Box sx={{ px: 2, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, borderBottom: 1, borderColor: 'divider', gap: 2 }}>
          <Tabs value={value} sx={{ minHeight: 48, '& .MuiTabs-flexContainer': { gap: 0 } }}>
            <Tab component={Link} href="/admin" label="ダッシュボード" icon={<DashboardIcon />} iconPosition="start" />
            <Tab component={Link} href="/admin/users" label="ユーザー管理" icon={<PeopleIcon />} iconPosition="start" />
            <Tab component={Link} href="/admin/analytics" label="分析レポート" icon={<AnalyticsIcon />} iconPosition="start" />
            <Tab component={Link} href="/admin/errors" label="エラーログ" icon={<BugReportIcon />} iconPosition="start" />
          </Tabs>
          <Button
            component={Link}
            href="/"
            variant="contained"
            startIcon={<HomeIcon />}
            sx={{
              flexShrink: 0,
              background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              px: 2,
              '&:hover': {
                background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
              },
            }}
          >
            LP画面に戻る
          </Button>
        </Box>
        {children}
      </Box>
    </Box>
  );
}
