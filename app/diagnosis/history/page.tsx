'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';

interface DiagnosisItem {
  id: string;
  createdAt: string;
  result?: { summary?: string };
}

export default function DiagnosisHistoryPage() {
  const [items, setItems] = useState<DiagnosisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await fetch('/api/diagnosis', { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || '取得に失敗しました');
        }
        const data = await res.json();
        setItems(data.items ?? []);
      } catch (err) {
        setItems([]);
        setErrorDialog(err instanceof Error ? err.message : '診断履歴の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
        pt: 4,
        pb: 6,
      }}
    >
      <Container maxWidth="md">
        {/* ヘッダーバナー（画像全体を表示） */}
        <Box
          sx={{
            width: '100%',
            mb: 1.5,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Image
            src="/images/diagnosis-history-header-banner.png"
            alt="診断履歴"
            width={1024}
            height={400}
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
            priority
            unoptimized
          />
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              sx={{
                color: '#3d2c1e',
                background: '#fff',
                borderColor: 'rgba(139, 90, 43, 0.35)',
                borderRadius: '9999px',
                px: 3,
                py: 1.2,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  background: 'rgba(139, 90, 43, 0.04)',
                  borderColor: 'rgba(139, 90, 43, 0.5)',
                },
              }}
            >
              ← ダッシュボードに戻る
            </Button>
          </Link>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ color: '#5c4033' }}>
            過去のAIキャリア診断結果を確認できます
          </Typography>
        </Box>

        <Card
          sx={{
            boxShadow: '0 20px 60px rgba(139, 90, 43, 0.12)',
            borderRadius: 3,
            border: '1px solid rgba(139, 90, 43, 0.08)',
          }}
        >
          <CardContent>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: '#f97316' }} />
              </Box>
            ) : items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <HistoryIcon sx={{ fontSize: 64, color: 'rgba(139, 90, 43, 0.3)', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#5c4033', mb: 3 }}>
                  診断履歴はまだありません
                </Typography>
                <Link href="/diagnosis" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                      },
                    }}
                  >
                    診断を始める
                  </Button>
                </Link>
              </Box>
            ) : (
              <List disablePadding>
                {items.map((item) => (
                  <ListItem key={item.id} disablePadding divider>
                    <ListItemButton component={Link} href={`/diagnosis/${item.id}`}>
                      <ListItemText
                        primary={
                          typeof item.result?.summary === 'string'
                            ? item.result.summary.slice(0, 80) + (item.result.summary.length > 80 ? '...' : '')
                            : `診断結果（${formatDate(item.createdAt)}）`
                        }
                        secondary={formatDate(item.createdAt)}
                        primaryTypographyProps={{ fontWeight: 500, color: '#3d2c1e' }}
                        secondaryTypographyProps={{ color: '#5c4033', fontSize: '0.875rem' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}

            {items.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Link href="/diagnosis" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    fullWidth
                    sx={{
                      borderColor: '#f97316',
                      color: '#f97316',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#ea580c',
                        backgroundColor: 'rgba(249, 115, 22, 0.08)',
                      },
                    }}
                  >
                    新しい診断を実行
                  </Button>
                </Link>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* エラーダイアログ */}
      <Dialog
        open={!!errorDialog}
        onClose={() => setErrorDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#dc2626' }}>
          <ErrorOutlineIcon />
          エラー
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#5c4033' }}>{errorDialog}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setErrorDialog(null)}
            variant="contained"
            sx={{ background: '#dc2626', '&:hover': { background: '#b91c1c' }, textTransform: 'none' }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
