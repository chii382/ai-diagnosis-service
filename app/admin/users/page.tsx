'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';

type SortField = 'name' | 'email' | 'role' | 'diagnosisCount' | 'createdAt';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  diagnosisCount: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [items, setItems] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'diagnosisCount' || field === 'createdAt' ? 'desc' : 'asc');
    }
    setPage(0);
  };

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page + 1));
    params.set('sortBy', sortBy);
    params.set('order', sortOrder);
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = (userId: string, newRole: string) => {
    fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
      .then((r) => {
        if (r.ok) fetchUsers();
      })
      .catch(console.error);
  };

  const handleDeleteClick = (e: React.MouseEvent, u: UserItem) => {
    e.stopPropagation();
    setDeleteTarget(u);
  };
  const handleDeleteCancel = () => setDeleteTarget(null);
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget._id}`, { method: 'DELETE' });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setDeleteError(data.error ?? '削除に失敗しました');
        setDeleteTarget(null);
        return;
      }
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      setDeleteError('削除に失敗しました');
      setDeleteTarget(null);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} color="#3d2c1e" mb={2}>
        ユーザー管理
      </Typography>
      <Card sx={{ border: '1px solid rgba(139,90,43,0.12)', mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="メール・名前で検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>ロール</InputLabel>
              <Select value={roleFilter} label="ロール" onChange={(e) => setRoleFilter(e.target.value)}>
                <MenuItem value="">すべて</MenuItem>
                <MenuItem value="admin">admin</MenuItem>
                <MenuItem value="user">user</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={fetchUsers}><RefreshIcon /></IconButton>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ border: '1px solid rgba(139,90,43,0.12)' }}>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}><CircularProgress sx={{ color: '#f97316' }} /></Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sortDirection={sortBy === 'name' ? sortOrder : false}
                      sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                      onClick={() => handleSort('name')}
                    >
                      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        ユーザー
                        {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                      </Box>
                    </TableCell>
                    <TableCell
                      sortDirection={sortBy === 'email' ? sortOrder : false}
                      sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                      onClick={() => handleSort('email')}
                    >
                      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        メール
                        {sortBy === 'email' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                      </Box>
                    </TableCell>
                    <TableCell
                      sortDirection={sortBy === 'role' ? sortOrder : false}
                      sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                      onClick={() => handleSort('role')}
                    >
                      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        ロール
                        {sortBy === 'role' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                      </Box>
                    </TableCell>
                    <TableCell
                      sortDirection={sortBy === 'diagnosisCount' ? sortOrder : false}
                      sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                      onClick={() => handleSort('diagnosisCount')}
                    >
                      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        診断数
                        {sortBy === 'diagnosisCount' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                      </Box>
                    </TableCell>
                    <TableCell
                      sortDirection={sortBy === 'createdAt' ? sortOrder : false}
                      sx={{ cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                      onClick={() => handleSort('createdAt')}
                    >
                      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                        登録日
                        {sortBy === 'createdAt' && (sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />)}
                      </Box>
                    </TableCell>
                    <TableCell>操作</TableCell>
                    <TableCell align="center" sx={{ width: 56 }}>削除</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((u) => (
                    <TableRow
                      key={u._id}
                      onClick={() => router.push(`/admin/users/${u._id}`)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(249, 115, 22, 0.06)' },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar src={u.image ?? undefined} sx={{ width: 32, height: 32 }}>{u.name?.[0] ?? '?'}</Avatar>
                          {u.name || '-'}
                        </Box>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Chip label={u.role} size="small" color={u.role === 'admin' ? 'primary' : 'default'} /></TableCell>
                      <TableCell>{u.diagnosisCount}</TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString('ja-JP')}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select size="small" value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} sx={{ minWidth: 90 }}>
                          <MenuItem value="user">user</MenuItem>
                          <MenuItem value="admin">admin</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell
                        align="center"
                        onClick={(e) => e.stopPropagation()}
                        sx={{ width: 56, verticalAlign: 'middle' }}
                      >
                        <IconButton
                          size="small"
                          color="error"
                          title="ユーザーを削除"
                          onClick={(e) => handleDeleteClick(e, u)}
                          sx={{ '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08)' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={20}
                rowsPerPageOptions={[20]}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* 削除確認ダイアログ */}
      <Dialog open={!!deleteTarget} onClose={handleDeleteCancel}>
        <DialogTitle>削除の確認</DialogTitle>
        <DialogContent>
          <Typography>このユーザーを削除しますか？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>キャンセル</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* 削除エラーダイアログ */}
      <Dialog open={!!deleteError} onClose={() => setDeleteError(null)}>
        <DialogTitle>エラー</DialogTitle>
        <DialogContent>
          <Typography color="error">{deleteError}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteError(null)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
