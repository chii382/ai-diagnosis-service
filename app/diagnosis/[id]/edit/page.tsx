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
  TextField,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface DiagnosisDetail {
  id: string;
  result: { summary?: string; strengths?: string[]; recommendations?: string[] };
  careerRoadmap: { shortTerm?: string; midTerm?: string; longTerm?: string };
}

export default function DiagnosisEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDialog, setErrorDialog] = useState<string | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  const [resultSummary, setResultSummary] = useState('');
  const [resultStrengths, setResultStrengths] = useState('');
  const [resultRecommendations, setResultRecommendations] = useState('');
  const [shortTerm, setShortTerm] = useState('');
  const [midTerm, setMidTerm] = useState('');
  const [longTerm, setLongTerm] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/diagnosis/${id}`, { credentials: 'include' });
        if (!res.ok) {
          const msg = '診断結果を取得できませんでした';
          setError(msg);
          setErrorDialog(msg);
          return;
        }
        const d: DiagnosisDetail = await res.json();
        const r = d.result || {};
        const road = d.careerRoadmap || {};

        setResultSummary(typeof r.summary === 'string' ? r.summary : '');
        setResultStrengths(Array.isArray(r.strengths) ? r.strengths.join('\n') : '');
        setResultRecommendations(Array.isArray(r.recommendations) ? r.recommendations.join('\n') : '');
        setShortTerm(road.shortTerm ?? '');
        setMidTerm(road.midTerm ?? '');
        setLongTerm(road.longTerm ?? '');
        setFetchSuccess(true);
      } catch {
        const msg = 'エラーが発生しました';
        setError(msg);
        setErrorDialog(msg);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const strengths = resultStrengths.trim() ? resultStrengths.trim().split('\n').filter(Boolean) : [];
      const recommendations = resultRecommendations.trim()
        ? resultRecommendations.trim().split('\n').filter(Boolean)
        : [];

      const res = await fetch(`/api/diagnosis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result: {
            summary: resultSummary,
            strengths,
            recommendations,
          },
          careerRoadmap: {
            shortTerm: shortTerm || '-',
            midTerm: midTerm || '-',
            longTerm: longTerm || '-',
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '更新に失敗しました');
      }

      router.push(`/diagnosis/${id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'エラーが発生しました';
      setError(msg);
      setErrorDialog(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading || (error && !fetchSuccess)) {
    if (error && !loading) {
      return (
        <Box sx={{ minHeight: '100vh', background: '#fffbf5', pt: 12, pb: 6 }}>
          <Container maxWidth="md">
            <Link href={`/diagnosis/${id}`} style={{ textDecoration: 'none' }}>
              <Button startIcon={<ArrowBackIcon />} sx={{ color: '#f97316', textTransform: 'none' }}>
                診断結果に戻る
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
              <Typography sx={{ color: '#5c4033' }}>{errorDialog || error}</Typography>
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
          <Link href={`/diagnosis/${id}`} style={{ textDecoration: 'none' }}>
            <Button
              startIcon={<ArrowBackIcon />}
              sx={{ color: '#5c4033', textTransform: 'none', mb: 2 }}
            >
              診断結果に戻る
            </Button>
          </Link>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#3d2c1e', mb: 1 }}>
            診断結果を編集
          </Typography>
        </Box>

        <Card
          sx={{
            p: 4,
            boxShadow: '0 20px 60px rgba(139, 90, 43, 0.12)',
            borderRadius: 3,
            border: '1px solid rgba(139, 90, 43, 0.08)',
          }}
        >
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
                分析サマリー
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={resultSummary}
                onChange={(e) => setResultSummary(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
                強み（1行につき1つ）
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="強み1&#10;強み2&#10;強み3"
                value={resultStrengths}
                onChange={(e) => setResultStrengths(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
                推奨アクション（1行につき1つ）
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="推奨1&#10;推奨2"
                value={resultRecommendations}
                onChange={(e) => setResultRecommendations(e.target.value)}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
                キャリアロードマップ
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                <TextField
                  label="短期（〜6ヶ月）"
                  fullWidth
                  multiline
                  rows={2}
                  value={shortTerm}
                  onChange={(e) => setShortTerm(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="中期（6ヶ月〜2年）"
                  fullWidth
                  multiline
                  rows={2}
                  value={midTerm}
                  onChange={(e) => setMidTerm(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="長期（2年以上）"
                  fullWidth
                  multiline
                  rows={2}
                  value={longTerm}
                  onChange={(e) => setLongTerm(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                    },
                  }}
                >
                  {saving ? '保存中...' : '保存'}
                </Button>
                <Link href={`/diagnosis/${id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="outlined" sx={{ borderColor: '#f97316', color: '#f97316', textTransform: 'none' }}>
                    キャンセル
                  </Button>
                </Link>
              </Box>
            </form>
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
