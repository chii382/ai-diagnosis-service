'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from 'next/link';
import Image from 'next/image';

/** お試し診断の利用回数（完了1回ごとに +1） */
const FREE_DIAGNOSIS_COUNT_KEY = 'free_diagnosis_count';
/** 旧仕様（1回のみ）のフラグ — 初回読み込みで count に移行 */
const LEGACY_FREE_DIAGNOSIS_DONE_KEY = 'free_diagnosis_done';
const FREE_TRIAL_MAX = 3;
const FREE_RESULT_STORAGE = 'free_diagnosis_result';

function readTrialCountFromStorage(): number {
  if (typeof window === 'undefined') return 0;
  if (localStorage.getItem(FREE_DIAGNOSIS_COUNT_KEY) === null && localStorage.getItem(LEGACY_FREE_DIAGNOSIS_DONE_KEY) === 'true') {
    localStorage.setItem(FREE_DIAGNOSIS_COUNT_KEY, '1');
    localStorage.removeItem(LEGACY_FREE_DIAGNOSIS_DONE_KEY);
  }
  const raw = localStorage.getItem(FREE_DIAGNOSIS_COUNT_KEY);
  if (raw === null) return 0;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n, 0), FREE_TRIAL_MAX);
}

const QUESTIONS = [
  { key: 'q1', label: '現在のキャリア状況は？', options: ['転職を検討している', '現在の仕事でスキルアップしたい', '副業・兼業を始めたい', '起業・独立を考えている', 'キャリアの方向性を模索している'] },
  { key: 'q2', label: '得意な分野やスキルは何ですか？', options: ['論理的思考・分析力', 'コミュニケーション・交渉力', '創造性・企画力', '専門技術・プログラミング', 'マネジメント・調整力'] },
  { key: 'q3', label: '働き方の希望は？', options: ['フルリモートで働きたい', 'オフィス中心で働きたい', 'ハイブリッド（出社と在宅の併用）', 'フレックスタイム制を希望', '働き方にこだわりはない'] },
  { key: 'q4', label: 'キャリアで最も重視するものは？', options: ['収入・待遇', 'やりがい・成長', 'ワークライフバランス', '社会貢献・意義', 'スキル習得・専門性'] },
  { key: 'q5', label: '目標を達成したい時期は？', options: ['3ヶ月以内に動き出したい', '半年〜1年以内', '1年〜2年かけて計画的に', '2年〜3年先を見据えている', 'まずは情報収集から始めたい'] },
] as const;

const initialAnswers: Record<string, string> = {};
QUESTIONS.forEach((q) => {
  initialAnswers[q.key] = '';
});

export default function DiagnosisFreePage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** null: localStorage 未読込 */
  const [trialCount, setTrialCount] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTrialCount(readTrialCountFromStorage());
    }
  }, []);

  const limitReached = trialCount !== null && trialCount >= FREE_TRIAL_MAX;
  const remainingTrials = trialCount === null ? null : Math.max(0, FREE_TRIAL_MAX - trialCount);

  const handleChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setError(null);
    setExpandedAccordion(false);
  };

  const isValid = QUESTIONS.every((q) => (answers[q.key] ?? '').trim().length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading || limitReached) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/diagnosis-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '診断の実行に失敗しました');

      const next = Math.min(readTrialCountFromStorage() + 1, FREE_TRIAL_MAX);
      localStorage.setItem(FREE_DIAGNOSIS_COUNT_KEY, String(next));
      sessionStorage.setItem(FREE_RESULT_STORAGE, JSON.stringify(data));
      router.push('/diagnosis-free/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (trialCount === null) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffbf5' }}>
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)',
        pt: 8,
        pb: 6,
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ヘッダーバナー */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '985 / 152',
            overflow: 'hidden',
            borderRadius: 2,
            bgcolor: '#fff7ed',
            mb: 2,
          }}
        >
          <Image
            src="/images/diagnosis-header-banner.png"
            alt="AIキャリア診断"
            fill
            sizes="(max-width: 900px) 100vw, 900px"
            style={{ objectFit: 'contain', objectPosition: 'center center' }}
            priority
            unoptimized
          />
        </Box>
        <Typography variant="body1" sx={{ color: '#5c4033', mb: 2 }}>
          5問に答えるだけで、AIがあなたのキャリアロードマップを提案します（お試しは3回まで・ログイン不要）
        </Typography>
        {trialCount !== null && !limitReached && remainingTrials !== null && remainingTrials > 0 && (
          <Typography variant="body2" sx={{ color: '#8b7355', mb: 2 }}>
            お試し診断はあと{remainingTrials}回ご利用いただけます。
          </Typography>
        )}

        {limitReached ? (
          <Card sx={{ p: 3, boxShadow: '0 20px 60px rgba(139, 90, 43, 0.12)', borderRadius: 3, border: '1px solid rgba(139, 90, 43, 0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
                お試し無料診断は3回までご利用いただけます
              </Typography>
              <Typography variant="body1" sx={{ color: '#5c4033', mb: 3 }}>
                お試し診断の回数を使い切りました。会員登録すると、何度でも診断でき、診断結果の履歴も保存されます。
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    sx={{
                      width: 220,
                      minHeight: 52,
                      fontSize: '1.1rem',
                      whiteSpace: 'nowrap',
                      borderColor: 'rgba(139, 90, 43, 0.3)',
                      color: '#5c4033',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { borderColor: '#5c4033', backgroundColor: 'rgba(139, 90, 43, 0.06)' },
                    }}
                  >
                    LPに戻る
                  </Button>
                </Link>
                <Link href="/auth/signin" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    sx={{
                      width: 220,
                      minHeight: 52,
                      fontSize: '1.1rem',
                      whiteSpace: 'nowrap',
                      background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' },
                    }}
                  >
                    会員登録して診断
                  </Button>
                </Link>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ p: 3, boxShadow: '0 20px 60px rgba(139, 90, 43, 0.12)', borderRadius: 3, border: '1px solid rgba(139, 90, 43, 0.08)' }}>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  {QUESTIONS.map((q) => {
                    const selected = answers[q.key] ?? '';
                    const isAnswered = selected.length > 0;
                    return (
                      <Accordion
                        key={q.key}
                        expanded={expandedAccordion === q.key}
                        onChange={(_, isExpanded) => setExpandedAccordion(isExpanded ? q.key : false)}
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(139, 90, 43, 0.08)',
                          border: '1px solid rgba(139, 90, 43, 0.08)',
                          '&:before': { display: 'none' },
                          '&.Mui-expanded': { borderColor: 'rgba(249, 115, 22, 0.2)', boxShadow: '0 4px 16px rgba(249, 115, 22, 0.12)' },
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#f97316' }} />} sx={{ px: { xs: 2, md: 3 }, py: 1.5, '&:hover': { backgroundColor: 'rgba(249, 115, 22, 0.04)' } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Typography sx={{ fontWeight: 600, color: '#3d2c1e', fontSize: { xs: '0.95rem', md: '1rem' } }}>
                              {q.label}<Box component="span" sx={{ color: '#dc2626', ml: 0.5 }}>*</Box>
                            </Typography>
                            {isAnswered && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', minWidth: 0, maxWidth: { xs: '60%', sm: '70%' } }}>
                                <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20, flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ color: '#5c4033', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected}</Typography>
                              </Box>
                            )}
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 2, pt: 0 }}>
                          <RadioGroup value={selected} onChange={(e) => handleChange(q.key, e.target.value)} sx={{ gap: 0.5 }}>
                            {q.options.map((opt) => (
                              <FormControlLabel
                                key={opt}
                                value={opt}
                                control={<Radio sx={{ color: 'rgba(139, 90, 43, 0.6)', '&.Mui-checked': { color: '#f97316' } }} />}
                                label={<Typography variant="body1" sx={{ color: '#5c4033' }}>{opt}</Typography>}
                                sx={{
                                  m: 0, px: 2, py: 1, borderRadius: 2, bgcolor: 'rgba(139, 90, 43, 0.04)',
                                  border: selected === opt ? '2px solid rgba(249, 115, 22, 0.3)' : '2px solid transparent',
                                  transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(249, 115, 22, 0.06)' },
                                }}
                              />
                            ))}
                          </RadioGroup>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                  {!isValid && (
                    <Typography variant="body2" sx={{ color: '#dc2626' }}>※ すべての質問（5問）に回答すると診断を実行できます</Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={!isValid || loading}
                      startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <PsychologyIcon sx={{ fontSize: 22 }} />}
                      sx={{
                        width: 220, minHeight: 52, fontSize: '1.1rem', whiteSpace: 'nowrap',
                        background: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)',
                        fontWeight: 600, textTransform: 'none',
                        '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' },
                        '&:disabled': { background: 'rgba(139, 90, 43, 0.2)', color: 'rgba(61, 44, 30, 0.5)' },
                      }}
                    >
                      {loading ? '診断中...' : '診断を実行'}
                    </Button>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                      <Button variant="outlined" sx={{ width: 220, minHeight: 52, fontSize: '1.1rem', whiteSpace: 'nowrap', borderColor: 'rgba(139, 90, 43, 0.3)', color: '#5c4033', fontWeight: 600, textTransform: 'none', '&:hover': { borderColor: '#5c4033', backgroundColor: 'rgba(139, 90, 43, 0.06)' } }}>
                        LPに戻る
                      </Button>
                    </Link>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        )}
      </Container>

      <Dialog open={!!error} onClose={() => setError(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#dc2626' }}><ErrorOutlineIcon />エラー</DialogTitle>
        <DialogContent><Typography sx={{ color: '#5c4033' }}>{error}</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setError(null)} variant="contained" sx={{ background: '#dc2626', '&:hover': { background: '#b91c1c' }, textTransform: 'none' }}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
