'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import dynamic from 'next/dynamic';

const DiagnosisRadarChart = dynamic(() => import('@/app/components/diagnosis/DiagnosisRadarChart'), {
  ssr: false,
});

const QUESTION_LABELS: Record<string, string> = {
  q1: '現在のキャリア状況',
  q2: '得意な分野・スキル',
  q3: '働き方の希望',
  q4: 'キャリアで重視するもの',
  q5: '目標達成時期',
};

const FALLBACK_SKILL_ITEMS = [
  'キャリア明確度',
  'スキル意識',
  '働き方志向',
  '価値観の明確さ',
  'アクション志向',
  '専門性',
  'コミュニケーション力',
  '課題解決力',
];

function deriveSkillScoresFromAnswers(answers: Record<string, string>): Record<string, number> {
  const vals = Object.values(answers).filter(Boolean);
  const base = vals.length > 0 ? 3 + (vals.length % 3) * 0.2 : 3;
  const result: Record<string, number> = {};
  FALLBACK_SKILL_ITEMS.forEach((item, i) => {
    result[item] = Math.min(5, Math.max(1, base + (i % 5) * 0.15 + (i * 0.05)));
  });
  return result;
}

function deriveAptitudeScoresFromAnswers(
  answers: Record<string, string>
): Record<string, Array<{ name: string; score: number }>> {
  const base = Math.min(4, Math.max(2, 3 + Object.values(answers).filter(Boolean).length * 0.1));
  return {
    スキル: [
      { name: 'コミュニケーション力', score: base + 0.3 },
      { name: '論理的思考', score: base + 0.1 },
      { name: 'マネジメント', score: base },
    ],
    業種: [
      { name: 'IT・テクノロジー', score: base + 0.4 },
      { name: 'コンサルティング', score: base + 0.2 },
      { name: '金融', score: base },
    ],
    職種: [
      { name: 'プロジェクトマネージャー', score: base + 0.3 },
      { name: '営業', score: base + 0.1 },
      { name: 'エンジニア', score: base },
    ],
  };
}

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
  const searchParams = useSearchParams();
  const id = params.id as string;
  const fromAdmin = searchParams.get('from') === 'admin';
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
      router.push(fromAdmin ? '/admin' : '/diagnosis/history');
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
          pt: 4,
          pb: 6,
        }}
      >
        <Container maxWidth="md">
          <Link href={fromAdmin ? '/admin' : '/diagnosis/history'} style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{
                width: 260,
                minHeight: 56,
                fontSize: '1.2rem',
                whiteSpace: 'nowrap',
                borderColor: 'rgba(139, 90, 43, 0.3)',
                color: '#5c4033',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { borderColor: '#5c4033', backgroundColor: 'rgba(139, 90, 43, 0.06)' },
              }}
            >
              {fromAdmin ? '最近の診断結果へ戻る' : '診断履歴に戻る'}
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

  let result = (data.result || {}) as Record<string, unknown>;
  let roadmap = (data.careerRoadmap || {}) as Record<string, string>;
  const answers = data.answers || {};

  const isLikelyRawJson = (s: string) =>
    typeof s === 'string' &&
    s.trim().startsWith('{') &&
    (s.includes('"result"') || s.includes('"summary"') || s.length > 300);

  if (typeof result.summary === 'string' && isLikelyRawJson(result.summary)) {
    try {
      const parsed = JSON.parse(result.summary) as {
        result?: Record<string, unknown>;
        careerRoadmap?: Record<string, string>;
      };
      if (parsed?.result && typeof parsed.result === 'object') {
        result = parsed.result as Record<string, unknown>;
      } else {
        result = { ...result, summary: '' };
      }
      if (parsed?.careerRoadmap && typeof parsed.careerRoadmap === 'object') {
        roadmap = parsed.careerRoadmap;
      }
    } catch {
      result = { ...result, summary: '' };
    }
  }

  const safeStr = (val: unknown, fallback = ''): string => {
    if (typeof val !== 'string') return fallback;
    if (isLikelyRawJson(val)) return fallback;
    return val;
  };

  const replaceUserWithYou = (s: string) => s.replace(/ユーザー/g, 'あなた');
  const summary = replaceUserWithYou(safeStr(result.summary) || safeStr((result as { Summary?: string }).Summary) || '');
  const strengthsAnalysis = replaceUserWithYou(safeStr(result.strengthsAnalysis));
  const suitableJobsAnalysis = replaceUserWithYou(safeStr(result.suitableJobsAnalysis));
  const strengths = Array.isArray(result.strengths)
    ? result.strengths.filter((s): s is string => typeof s === 'string')
    : [];

  const skillScores = (result.skillScores as Record<string, number>) || deriveSkillScoresFromAnswers(answers);
  type AptitudeCategory = Record<string, Array<{ name: string; score: number }>>;
  const aptitudeScores =
    (result.aptitudeScores as AptitudeCategory) || deriveAptitudeScoresFromAnswers(answers);

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
        <Box sx={{ mb: 4 }}>
          {/* ヘッダーバナー（一番上） */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              aspectRatio: '985 / 152',
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: '#fff7ed',
              mb: 1.5,
            }}
          >
            <Image
              src="/images/diagnosis-result-header-banner.png"
              alt="診断結果"
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              style={{ objectFit: 'contain', objectPosition: 'center center' }}
              priority
              unoptimized
            />
          </Box>
          <Link href={fromAdmin ? '/admin' : '/diagnosis/history'} style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{
                mb: 1.5,
                width: 260,
                minHeight: 56,
                fontSize: '1.2rem',
                whiteSpace: 'nowrap',
                borderColor: 'rgba(139, 90, 43, 0.3)',
                color: '#5c4033',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { borderColor: '#5c4033', backgroundColor: 'rgba(139, 90, 43, 0.06)' },
              }}
            >
              {fromAdmin ? '最近の診断結果へ戻る' : '診断履歴に戻る'}
            </Button>
          </Link>
          <Typography variant="body2" sx={{ color: '#5c4033' }}>
            {data.createdAt ? formatDate(data.createdAt) : '-'}
          </Typography>
        </Box>

        {/* あなたの回答と視覚化（2カラム） */}
        {Object.keys(answers).length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 480px' },
              gap: 3,
              mb: 3,
              alignItems: 'start',
            }}
          >
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.keys(skillScores).length > 0 && (
                <DiagnosisRadarChart data={skillScores} title="キャリアスキルレーダーチャート" />
              )}
            </Box>
          </Box>
        )}

        {/* 分析サマリー */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
              分析サマリー
            </Typography>
            {summary ? (
              <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.8, mb: 2 }}>
                {summary}
              </Typography>
            ) : null}
            {strengthsAnalysis ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600, mb: 0.5 }}>
                  強みの詳細分析
                </Typography>
                <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.8 }}>
                  {strengthsAnalysis}
                </Typography>
              </Box>
            ) : null}
            {suitableJobsAnalysis ? (
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600, mb: 0.5 }}>
                  向いている職種・業種の分析
                </Typography>
                <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.8 }}>
                  {suitableJobsAnalysis}
                </Typography>
              </Box>
            ) : null}
            {!summary && !strengthsAnalysis && !suitableJobsAnalysis ? (
              <Typography variant="body2" sx={{ color: '#5c4033', fontStyle: 'italic' }}>
                分析結果を取得できませんでした。
              </Typography>
            ) : null}
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

        {/* 適正スコア表 */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2, whiteSpace: 'nowrap' }}>
              適正スコア表
            </Typography>
            {Object.keys(aptitudeScores).length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {Object.entries(aptitudeScores).map(([category, items]) => {
                  const validItems = Array.isArray(items)
                    ? items.filter(
                        (i): i is { name: string; score: number } =>
                          i && typeof i === 'object' && typeof i.name === 'string'
                      )
                    : [];
                  return validItems.length > 0 ? (
                    <Box key={category}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: '#f97316',
                          fontWeight: 600,
                          mb: 1,
                          borderBottom: '2px solid rgba(249, 115, 22, 0.3)',
                          pb: 0.5,
                          display: 'inline-block',
                        }}
                      >
                        {category}
                      </Typography>
                      <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          boxShadow: 'none',
                          border: '1px solid rgba(139, 90, 43, 0.12)',
                          overflow: 'hidden',
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'rgba(249, 115, 22, 0.06)' }}>
                              <TableCell sx={{ fontWeight: 600, color: '#3d2c1e' }}>項目</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#3d2c1e', width: 100, whiteSpace: 'nowrap' }} align="right">
                                適正スコア
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {[...validItems]
                              .sort((a, b) => (b.score || 0) - (a.score || 0))
                              .map((item, idx) => (
                                <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                  <TableCell sx={{ color: '#5c4033' }}>{item.name}</TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 600, color: '#f97316' }}>
                                    {typeof item.score === 'number' ? item.score.toFixed(1) : '-'}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ) : null;
                })}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#5c4033', fontStyle: 'italic' }}>
                （適正スコアデータがありません）
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
                width: 220,
                minHeight: 52,
                fontSize: '1.1rem',
                whiteSpace: 'nowrap',
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
            sx={{
              width: 220,
              minHeight: 52,
              fontSize: '1.1rem',
              whiteSpace: 'nowrap',
              textTransform: 'none',
              fontWeight: 600,
            }}
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
