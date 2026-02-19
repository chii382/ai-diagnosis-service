'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const QUESTION_LABELS: Record<string, string> = {
  q1: '現在のキャリア状況',
  q2: '得意な分野・スキル',
  q3: '働き方の希望',
  q4: 'キャリアで重視するもの',
  q5: '目標達成時期',
};

interface DiagnosisDetail {
  id: string;
  answers?: Record<string, string>;
  result?: Record<string, unknown>;
  careerRoadmap?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export default function DiagnosisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<DiagnosisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/diagnosis/${id}`, { credentials: 'include' });
        const d = await res.json();
        if (process.env.NODE_ENV === 'development') {
          console.log('[診断詳細] GET response:', { status: res.status, ok: res.ok, id, data: d });
        }
        if (!res.ok) {
          if (d.debug) console.warn('[診断詳細] API debug:', d.debug);
          let msg = '取得に失敗しました';
          if (res.status === 401) msg = 'ログインが必要です';
          else if (res.status === 404) msg = '診断結果が見つかりません' + (d.debug?.userIdMismatch ? '（別ユーザーのデータの可能性）' : '');
          else msg = d.error || msg;
          setError(msg);
          setErrorDialog(msg);
          return;
        }
        setData(d);
      } catch (err) {
        console.error('[診断詳細] fetch error:', err);
        const msg = 'エラーが発生しました';
        setError(msg);
        setErrorDialog(msg);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('この診断結果を削除しますか？')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/diagnosis/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      router.push('/diagnosis/history');
    } catch {
      setErrorDialog('削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fffbf5',
        }}
      >
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: '#fffbf5',
          pt: 12,
          pb: 6,
        }}
      >
        <Container maxWidth="md">
          <Link href="/diagnosis/history" style={{ textDecoration: 'none' }}>
            <Button startIcon={<ArrowBackIcon />} sx={{ color: '#f97316', textTransform: 'none' }}>
              診断履歴に戻る
            </Button>
          </Link>
        </Container>
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
            <Typography sx={{ color: '#5c4033' }}>
              {errorDialog || error || '診断結果を取得できませんでした'}
            </Typography>
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

  const result = (data.result || {}) as Record<string, unknown>;
  const roadmap = (data.careerRoadmap || {}) as Record<string, string>;
  const answers = data.answers || {};

  const summary =
    typeof result.summary === 'string'
      ? result.summary
      : typeof result.Summary === 'string'
        ? result.Summary
        : '';
  const strengths = Array.isArray(result.strengths)
    ? result.strengths.filter((s): s is string => typeof s === 'string')
    : [];
  const recommendations = Array.isArray(result.recommendations)
    ? result.recommendations.filter((r): r is string => typeof r === 'string')
    : [];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
        pt: 12,
        pb: 6,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Link href="/diagnosis/history" style={{ textDecoration: 'none' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              sx={{ color: '#5c4033', textTransform: 'none', mb: 2 }}
            >
              診断履歴に戻る
            </Button>
          </Link>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#3d2c1e', mb: 1 }}>
            診断結果
          </Typography>
          <Typography variant="body2" sx={{ color: '#5c4033' }}>
            {data.createdAt ? formatDate(data.createdAt) : '-'}
          </Typography>
        </Box>

        {/* あなたの回答 - 常に表示 */}
        {Object.keys(answers).length > 0 && (
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
                あなたの回答
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {Object.entries(answers).map(([key, value]) =>
                  value ? (
                    <Box key={key}>
                      <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600 }}>
                        {QUESTION_LABELS[key] || key}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#5c4033' }}>
                        {value}
                      </Typography>
                    </Box>
                  ) : null
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* 分析サマリー */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
              分析サマリー
            </Typography>
            {summary ? (
              <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.8 }}>
                {summary}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: '#5c4033', fontStyle: 'italic' }}>
                分析結果を取得できませんでした。
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* 強み */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
              強み
            </Typography>
            {strengths.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {strengths.map((s, i) => (
                  <Chip key={i} label={s} sx={{ bgcolor: 'rgba(249, 115, 22, 0.12)', color: '#ea580c' }} />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#5c4033', fontStyle: 'italic' }}>
                （強みの分析結果がありません）
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* 推奨アクション */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
              推奨アクション
            </Typography>
            {recommendations.length > 0 ? (
              <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                {recommendations.map((r, i) => (
                  <Typography key={i} component="li" sx={{ color: '#5c4033', mb: 0.5 }}>
                    {r}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#5c4033', fontStyle: 'italic' }}>
                （推奨アクションがありません）
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* キャリアロードマップ */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
              キャリアロードマップ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600, mb: 0.5 }}>
                  短期（〜6ヶ月）
                </Typography>
                <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.7 }}>
                  {roadmap.shortTerm || '（未設定）'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600, mb: 0.5 }}>
                  中期（6ヶ月〜2年）
                </Typography>
                <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.7 }}>
                  {roadmap.midTerm || '（未設定）'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600, mb: 0.5 }}>
                  長期（2年以上）
                </Typography>
                <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.7 }}>
                  {roadmap.longTerm || '（未設定）'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Link href={`/diagnosis/${id}/edit`} style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              sx={{
                background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                },
              }}
            >
              編集
            </Button>
          </Link>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {deleting ? '削除中...' : '削除'}
          </Button>
        </Box>
      </Container>

      {/* 削除エラーなど用のダイアログ */}
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
