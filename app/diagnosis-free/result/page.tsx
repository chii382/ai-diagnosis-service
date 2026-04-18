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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import dynamic from 'next/dynamic';
import { normalizeSimpleDiagnosisSummary } from '@/lib/diagnosisSimpleSummary';
import ProUpgradeCtaRow from '@/app/components/ProUpgradeCtaRow';

const DiagnosisRadarChart = dynamic(() => import('@/app/components/diagnosis/DiagnosisRadarChart'), { ssr: false });

const FREE_RESULT_STORAGE = 'free_diagnosis_result';

const QUESTION_LABELS: Record<string, string> = {
  q1: '現在のキャリア状況',
  q2: '得意な分野・スキル',
  q3: '働き方の希望',
  q4: 'キャリアで重視するもの',
  q5: '目標達成時期',
};

const FALLBACK_SKILL_ITEMS = ['キャリア明確度', 'スキル意識', '働き方志向', '価値観の明確さ', 'アクション志向', '専門性', 'コミュニケーション力', '課題解決力'];

function deriveSkillScoresFromAnswers(answers: Record<string, string>): Record<string, number> {
  const vals = Object.values(answers).filter(Boolean);
  const base = vals.length > 0 ? 3 + (vals.length % 3) * 0.2 : 3;
  const result: Record<string, number> = {};
  FALLBACK_SKILL_ITEMS.forEach((item, i) => {
    result[item] = Math.min(5, Math.max(1, base + (i % 5) * 0.15 + (i * 0.05)));
  });
  return result;
}

function deriveAptitudeScoresFromAnswers(answers: Record<string, string>): Record<string, Array<{ name: string; score: number }>> {
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

export default function DiagnosisFreeResultPage() {
  const [data, setData] = useState<{ answers?: Record<string, string>; result?: Record<string, unknown>; careerRoadmap?: Record<string, string> } | null | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(FREE_RESULT_STORAGE);
        if (raw) {
          const parsed = JSON.parse(raw) as { answers?: Record<string, string>; result?: Record<string, unknown>; careerRoadmap?: Record<string, string> };
          setData(parsed);
        } else {
          setData(null);
        }
      } catch {
        setData(null);
      }
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fffbf5' }}>
        <Typography sx={{ color: '#5c4033' }}>読み込み中...</Typography>
      </Box>
    );
  }

  if (data == null) {
    return (
      <Box sx={{ minHeight: '100vh', background: '#fffbf5', pt: 4, pb: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ color: '#5c4033', mb: 2 }}>診断結果のデータが見つかりません。無料診断からやり直してください。</Typography>
          <Link href="/diagnosis-free" style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{
                borderColor: 'rgba(139, 90, 43, 0.3)',
                color: '#5c4033',
                fontWeight: 600,
                textTransform: 'none',
                width: 260,
                minHeight: 56,
                fontSize: '1.2rem',
                '&:hover': { borderColor: '#5c4033', backgroundColor: 'rgba(139, 90, 43, 0.06)' },
              }}
            >
              無料診断に戻る
            </Button>
          </Link>
        </Box>
      </Box>
    );
  }

  let result = (data.result || {}) as Record<string, unknown>;
  let roadmap = (data.careerRoadmap || { shortTerm: '-', midTerm: '-', longTerm: '-' }) as Record<string, string>;
  const answers = data.answers || {};

  const isLikelyRawJson = (s: string) =>
    typeof s === 'string' && s.trim().startsWith('{') && (s.includes('"result"') || s.includes('"summary"') || s.length > 300);

  if (typeof result.summary === 'string' && isLikelyRawJson(result.summary)) {
    try {
      const parsed = JSON.parse(result.summary) as { result?: Record<string, unknown>; careerRoadmap?: Record<string, string> };
      if (parsed?.result && typeof parsed.result === 'object') result = parsed.result as Record<string, unknown>;
      if (parsed?.careerRoadmap && typeof parsed.careerRoadmap === 'object') roadmap = parsed.careerRoadmap;
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
  const summary = replaceUserWithYou(safeStr(result.summary) || '');
  const strengthsAnalysis = replaceUserWithYou(safeStr(result.strengthsAnalysis));
  const suitableJobsAnalysis = replaceUserWithYou(safeStr(result.suitableJobsAnalysis));
  const strengths = Array.isArray(result.strengths) ? result.strengths.filter((s): s is string => typeof s === 'string') : [];
  const simpleLines = normalizeSimpleDiagnosisSummary(result.simpleDiagnosisSummary, summary);
  const skillScores = (result.skillScores as Record<string, number>) || deriveSkillScoresFromAnswers(answers);
  type AptitudeCategory = Record<string, Array<{ name: string; score: number }>>;
  const aptitudeScores = (result.aptitudeScores as AptitudeCategory) || deriveAptitudeScoresFromAnswers(answers);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 50%, #fef3e2 100%)', pt: 4, pb: 6 }}>
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
          <Link href="/diagnosis-free" style={{ textDecoration: 'none' }}>
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
              無料診断に戻る
            </Button>
          </Link>
          <Typography variant="body2" sx={{ color: '#5c4033' }}>※ この結果は保存されません。会員登録すると履歴が保存されます。</Typography>
        </Box>

        {Object.keys(answers).length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 480px' }, gap: 3, mb: 3, alignItems: 'start' }}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>あなたの回答</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {Object.entries(answers).map(([key, value]) =>
                    value ? (
                      <Box key={key}>
                        <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600 }}>{QUESTION_LABELS[key] || key}</Typography>
                        <Typography variant="body1" sx={{ color: '#5c4033' }}>{value}</Typography>
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

        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)',
            border: '1px solid rgba(249, 115, 22, 0.22)',
            bgcolor: '#fffefb',
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>
              簡易診断結果
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {simpleLines.map((line, i) => (
                <Typography key={i} variant="body1" sx={{ color: '#5c4033', lineHeight: 1.85 }}>
                  {line}
                </Typography>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 2,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              columnGap: 2,
              rowGap: 1.5,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: '#3d2c1e', flexShrink: 0 }}
            >
              詳細分析サマリー
            </Typography>
            <ProUpgradeCtaRow />
          </Box>
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                filter: 'blur(8px)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
                <CardContent>
                {summary && <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.8, mb: 2 }}>{summary}</Typography>}
                {strengthsAnalysis && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600, mb: 0.5 }}>強みの詳細分析</Typography>
                    <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.8 }}>{strengthsAnalysis}</Typography>
                  </Box>
                )}
                {suitableJobsAnalysis && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600, mb: 0.5 }}>向いている職種・業種の分析</Typography>
                    <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.8 }}>{suitableJobsAnalysis}</Typography>
                  </Box>
                )}
                {!summary && !strengthsAnalysis && !suitableJobsAnalysis && (
                  <Typography variant="body2" sx={{ color: '#5c4033', fontStyle: 'italic' }}>分析結果を取得できませんでした。</Typography>
                )}
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>強み</Typography>
                {strengths.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {strengths.map((s, i) => (
                      <Chip key={i} label={s} sx={{ bgcolor: 'rgba(249, 115, 22, 0.12)', color: '#ea580c' }} />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: '#5c4033', fontStyle: 'italic' }}>（強みの分析結果がありません）</Typography>
                )}
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2, whiteSpace: 'nowrap' }}>適正スコア表</Typography>
                {Object.keys(aptitudeScores).length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {Object.entries(aptitudeScores).map(([category, items]) => {
                      const validItems = Array.isArray(items) ? items.filter((i): i is { name: string; score: number } => i && typeof i === 'object' && typeof i.name === 'string') : [];
                      return validItems.length > 0 ? (
                        <Box key={category}>
                          <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600, mb: 1, borderBottom: '2px solid rgba(249, 115, 22, 0.3)', pb: 0.5, display: 'inline-block' }}>{category}</Typography>
                          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid rgba(139, 90, 43, 0.12)', overflow: 'hidden' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ bgcolor: 'rgba(249, 115, 22, 0.06)' }}>
                                  <TableCell sx={{ fontWeight: 600, color: '#3d2c1e' }}>項目</TableCell>
                                  <TableCell sx={{ fontWeight: 600, color: '#3d2c1e', width: 100, whiteSpace: 'nowrap' }} align="right">適正スコア</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {[...validItems].sort((a, b) => (b.score || 0) - (a.score || 0)).map((item, idx) => (
                                  <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ color: '#5c4033' }}>{item.name}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600, color: '#f97316' }}>{typeof item.score === 'number' ? item.score.toFixed(1) : '-'}</TableCell>
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
                  <Typography variant="body2" sx={{ color: '#5c4033', fontStyle: 'italic' }}>（適正スコアデータがありません）</Typography>
                )}
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(139, 90, 43, 0.08)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#3d2c1e', mb: 2 }}>キャリアロードマップ</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600, mb: 0.5 }}>短期（〜6ヶ月）</Typography>
                    <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.7 }}>{roadmap.shortTerm || '（未設定）'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600, mb: 0.5 }}>中期（6ヶ月〜2年）</Typography>
                    <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.7 }}>{roadmap.midTerm || '（未設定）'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#f97316', fontWeight: 600, mb: 0.5 }}>長期（2年以上）</Typography>
                    <Typography variant="body1" sx={{ color: '#5c4033', lineHeight: 1.7 }}>{roadmap.longTerm || '（未設定）'}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                pt: { xs: 3, sm: 4 },
                background: 'linear-gradient(180deg, rgba(255,251,245,0.6) 0%, rgba(255,247,237,0.85) 100%)',
                borderRadius: 2,
                px: 2,
              }}
            >
              <LockIcon sx={{ fontSize: 44, color: '#8b5a2b', opacity: 0.85, mb: 0.75 }} />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: '#5c4033',
                  textAlign: 'center',
                  lineHeight: 1.55,
                  whiteSpace: 'nowrap',
                  fontSize: { xs: '0.6875rem', sm: '1rem' },
                }}
              >
                有料版にアップグレードすると確認することができます
              </Typography>
            </Box>
          </Box>
        </Box>

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
      </Container>
    </Box>
  );
}
