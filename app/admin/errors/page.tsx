'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from '@mui/material';

interface ErrorEntry {
  id: string;
  message: string;
  timestamp: string;
  url?: string;
  stack?: string;
}

export default function AdminErrorsPage() {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [sentryConfigured, setSentryConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/errors')
      .then((r) => r.json())
      .then((data) => {
        setErrors(data.errors ?? []);
        setSentryConfigured(data.sentryConfigured ?? false);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} color="#3d2c1e" mb={2}>
        エラーログ
      </Typography>

      <Card sx={{ border: '1px solid rgba(139,90,43,0.12)', mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip
              label={sentryConfigured ? 'Sentry連携済み' : 'Sentry未設定'}
              color={sentryConfigured ? 'success' : 'default'}
              size="small"
            />
            {!sentryConfigured && (
              <Typography variant="body2" color="text.secondary">
                SENTRY_DSNを設定するとSentryでエラー監視が有効になります
              </Typography>
            )}
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}><CircularProgress sx={{ color: '#f97316' }} /></Box>
          ) : errors.length === 0 ? (
            <Typography color="text.secondary">エラーログはありません</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>日時</TableCell>
                  <TableCell>メッセージ</TableCell>
                  <TableCell>URL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {errors.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{new Date(e.timestamp).toLocaleString('ja-JP')}</TableCell>
                    <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.message}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.url || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
