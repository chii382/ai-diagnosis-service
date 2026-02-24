'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

type SortField = 'createdAt' | 'userName' | 'userEmail' | 'summary';

interface DiagnosisItem {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  summary: string;
}

interface Stats {
  todayCount: number;
  totalCount: number;
  activeUserCount: number;
  diagnoses: DiagnosisItem[];
  diagnosisTotalCount: number;
  diagnosisPage: number;
  totalPages: number;
  dbStatus: string;
  apiResponseTime?: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'createdAt' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  const fetchStats = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('sortBy', sortBy);
    params.set('order', sortOrder);
    if (search) params.set('search', search);
    return fetch(`/api/admin/stats?${params}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, [page, sortBy, sortOrder, search]);

  useEffect(() => {
    if (!stats && page === 1) setLoading(true);
    if (stats) setTableLoading(true);
    fetchStats().finally(() => {
      setLoading(false);
      setTableLoading(false);
    });
  }, [fetchStats]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  const s = stats ?? {
    todayCount: 0,
    totalCount: 0,
    activeUserCount: 0,
    diagnoses: [],
    diagnosisTotalCount: 0,
    diagnosisPage: 1,
    totalPages: 0,
    dbStatus: 'unknown',
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} color="#3d2c1e" mb={2}>
        管理者ダッシュボード
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ border: '1px solid rgba(139,90,43,0.12)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>本日の診断数</Typography>
              <Typography variant="h4" fontWeight={700} color="#f97316">{s.todayCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ border: '1px solid rgba(139,90,43,0.12)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>総診断数</Typography>
              <Typography variant="h4" fontWeight={700} color="#f97316">{s.totalCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ border: '1px solid rgba(139,90,43,0.12)' }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>アクティブユーザー数</Typography>
              <Typography variant="h4" fontWeight={700} color="#f97316">{s.activeUserCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ border: '1px solid rgba(139,90,43,0.12)', mb: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} color="#3d2c1e" gutterBottom>
            システムステータス
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={s.dbStatus === 'ok' ? <CheckCircleIcon /> : <ErrorIcon />}
              label={`DB: ${s.dbStatus === 'ok' ? '接続OK' : s.dbStatus}`}
              color={s.dbStatus === 'ok' ? 'success' : 'error'}
              size="small"
            />
            {s.apiResponseTime != null && (
              <Chip
                label={`API応答: ${s.apiResponseTime}ms`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ border: '1px solid rgba(139,90,43,0.12)', position: 'relative' }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600} color="#3d2c1e" sx={{ flexGrow: 1 }}>
              診断結果
            </Typography>
            <TextField
              size="small"
              placeholder="名前・メール・サマリーで検索"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="contained" size="small" onClick={handleSearch} sx={{ textTransform: 'none' }}>
              検索
            </Button>
          </Box>
          {tableLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.7)',
                zIndex: 1,
                borderRadius: 1,
              }}
            >
              <CircularProgress size={32} sx={{ color: '#f97316' }} />
            </Box>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sortDirection={sortBy === 'createdAt' ? sortOrder : false}
                  sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                  onClick={() => handleSort('createdAt')}
                >
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    日時
                    {sortBy === 'createdAt' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                  </Box>
                </TableCell>
                <TableCell
                  sortDirection={sortBy === 'userName' ? sortOrder : false}
                  sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                  onClick={() => handleSort('userName')}
                >
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    名前
                    {sortBy === 'userName' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                  </Box>
                </TableCell>
                <TableCell
                  sortDirection={sortBy === 'userEmail' ? sortOrder : false}
                  sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                  onClick={() => handleSort('userEmail')}
                >
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    メールアドレス
                    {sortBy === 'userEmail' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                  </Box>
                </TableCell>
                <TableCell
                  sortDirection={sortBy === 'summary' ? sortOrder : false}
                  sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                  onClick={() => handleSort('summary')}
                >
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    サマリー
                    {sortBy === 'summary' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {s.diagnoses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">データなし</TableCell>
                </TableRow>
              ) : (
                s.diagnoses.map((d) => (
                  <TableRow
                    key={d._id}
                    onClick={() => router.push(`/diagnosis/${String(d._id)}?from=admin`)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(249, 115, 22, 0.06)' },
                    }}
                  >
                    <TableCell>{new Date(d.createdAt).toLocaleString('ja-JP')}</TableCell>
                    <TableCell>{d.userName ?? '-'}</TableCell>
                    <TableCell>{d.userEmail ?? '-'}</TableCell>
                    <TableCell>{d.summary}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {s.totalPages > 1 && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                sx={{ textTransform: 'none', minWidth: 100 }}
              >
                前ページへ
              </Button>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                {Array.from({ length: s.totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setPage(p)}
                    sx={{
                      minWidth: 36,
                      textTransform: 'none',
                      ...(p === page && {
                        background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                        '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' },
                      }),
                    }}
                  >
                    {p}
                  </Button>
                ))}
              </Box>
              <Button
                variant="outlined"
                size="small"
                disabled={page >= s.totalPages}
                onClick={() => setPage((p) => Math.min(s.totalPages, p + 1))}
                sx={{ textTransform: 'none', minWidth: 100 }}
              >
                次ページへ
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
