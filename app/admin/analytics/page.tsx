'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const CARD_BORDER = '1px solid rgba(139,90,43,0.12)';
const CHART_COLOR = '#ea580c';
const MARKET_COLOR = '#64748b';

interface MarketData {
  byIndustry: Array<{ name: string; value: number }>;
  byJobType: Array<{ name: string; value: number }>;
  byAgeGroup: Array<{ name: string; value: number }>;
}

interface AnalyticsData {
  dailyChart: Array<{ date: string; count: number }>;
  weeklyChart: Array<{ date: string; count: number }>;
  monthlyChart: Array<{ date: string; count: number }>;
  byAgeGroup: Array<{ name: string; value: number }>;
  byJobTypeProfile: Array<{ name: string; value: number }>;
  byIndustryProfile: Array<{ name: string; value: number }>;
  bySuitableJobType: Array<{ name: string; value: number }>;
  bySuitableIndustry: Array<{ name: string; value: number }>;
  completionRate: number;
  totalDiagnoses: number;
}

/** 件数TOP10を抽出し、値降順でソート */
function getTop10ByValueDescending(arr: Array<{ name: string; value: number }>): Array<{ name: string; count: number }> {
  return [...arr]
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
    .map(({ name, value }) => ({ name, count: value }));
}

/** グラフ用：TOP10（値降順表示）。Rechartsは先頭を上に描画するため、値降順のまま渡す */
function toChartDataForValueDescendingDisplay(arr: Array<{ name: string; value: number }>): Array<{ name: string; count: number }> {
  return getTop10ByValueDescending(arr);
}

const AGE_ORDER = ['20未満', '20代', '30代', '40代', '50代', '60代以上', '未入力'];

function toAgeGroupChartData(arr: Array<{ name: string; value: number }>): Array<{ name: string; count: number }> {
  return [...arr]
    .sort((a, b) => {
      const ai = AGE_ORDER.indexOf(a.name);
      const bi = AGE_ORDER.indexOf(b.name);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 10)
    .map(({ name, value }) => ({ name, count: value }));
}

/** 件数配列を割合（％）に正規化 */
function toPercentDistribution(arr: Array<{ name: string; value: number }>): Record<string, number> {
  const total = arr.reduce((s, x) => s + (x.value ?? 0), 0);
  if (total <= 0) return {};
  const out: Record<string, number> = {};
  for (const x of arr) {
    if (x.name?.trim()) out[x.name.trim()] = ((x.value ?? 0) / total) * 100;
  }
  return out;
}

/** 市場データは既に％なのでそのままマップに */
function marketToMap(arr: Array<{ name: string; value: number }>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const x of arr) {
    if (x.name?.trim()) out[x.name.trim()] = x.value ?? 0;
  }
  return out;
}

/** 2つの分布のマッチ度を0〜100で算出（差の絶対値合計を基に） */
function computeMatchScore(
  diagnosis: Record<string, number>,
  market: Record<string, number>
): number {
  const keys = new Set([...Object.keys(diagnosis), ...Object.keys(market)]);
  if (keys.size === 0) return 0;
  let sumDiff = 0;
  for (const k of keys) {
    const d = diagnosis[k] ?? 0;
    const m = market[k] ?? 0;
    sumDiff += Math.abs(d - m);
  }
  return Math.round(Math.max(0, 100 - sumDiff / 2));
}

/** 比較グラフ用：診断と市場をマージ（TOP10程度に絞る） */
function mergeForComparison(
  diagnosis: Array<{ name: string; value: number }>,
  market: Array<{ name: string; value: number }>
): Array<{ name: string; diagnosis: number; market: number }> {
  const dMap = toPercentDistribution(diagnosis);
  const mMap = marketToMap(market);
  const keys = new Set([...Object.keys(dMap), ...Object.keys(mMap)]);
  return [...keys]
    .filter((k) => (dMap[k] ?? 0) > 0 || (mMap[k] ?? 0) > 0)
    .map((k) => ({
      name: k,
      diagnosis: Math.round((dMap[k] ?? 0) * 10) / 10,
      market: Math.round((mMap[k] ?? 0) * 10) / 10,
    }))
    .sort((a, b) => Math.max(b.diagnosis, b.market) - Math.max(a.diagnosis, a.market))
    .slice(0, 10);
}

/** ギャップ分析：市場需要高・診断低 & 診断高・市場低 */
function getGapAnalysis(
  diagnosis: Array<{ name: string; value: number }>,
  market: Array<{ name: string; value: number }>
): { demandHighSupplyLow: Array<{ name: string; market: number; diagnosis: number }>; supplyHighDemandLow: Array<{ name: string; diagnosis: number; market: number }> } {
  const dMap = toPercentDistribution(diagnosis);
  const mMap = marketToMap(market);
  const keys = new Set([...Object.keys(dMap), ...Object.keys(mMap)]);
  const items = [...keys].map((k) => ({
    name: k,
    diagnosis: dMap[k] ?? 0,
    market: mMap[k] ?? 0,
  }));
  const demandHighSupplyLow = items
    .filter((x) => x.market >= 5 && x.diagnosis < x.market - 3)
    .sort((a, b) => b.market - a.market)
    .slice(0, 5)
    .map((x) => ({ ...x, market: Math.round(x.market * 10) / 10, diagnosis: Math.round(x.diagnosis * 10) / 10 }));
  const supplyHighDemandLow = items
    .filter((x) => x.diagnosis >= 5 && x.diagnosis > x.market + 3)
    .sort((a, b) => b.diagnosis - a.diagnosis)
    .slice(0, 5)
    .map((x) => ({ ...x, diagnosis: Math.round(x.diagnosis * 10) / 10, market: Math.round(x.market * 10) / 10 }));
  return { demandHighSupplyLow, supplyHighDemandLow };
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!data) return;
    const industries = (data.bySuitableIndustry ?? []).slice(0, 10).map((x) => x.name);
    const jobTypes = (data.bySuitableJobType ?? []).slice(0, 10).map((x) => x.name);
    setMarketError(null);
    fetch('/api/admin/analytics/market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        diagnosisVocab: { industries, jobTypes },
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('市場データの取得に失敗しました');
        return r.json();
      })
      .then(setMarketData)
      .catch((e) => setMarketError(e?.message ?? '市場データを取得できませんでした'));
  }, [data]);

  const chartData =
    chartType === 'day'
      ? data?.dailyChart ?? []
      : chartType === 'week'
        ? data?.weeklyChart ?? []
        : data?.monthlyChart ?? [];

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ['診断数推移', ''],
      ['期間', '件数'],
      ...chartData.map((d) => [d.date, String(d.count)]),
      [''],
      ['ユーザー属性（プロフィール）', ''],
      ['年代別TOP10', ''],
      ['名前', '件数'],
      ...toAgeGroupChartData(data.byAgeGroup ?? []).map((c) => [c.name, String(c.count)]),
      [''],
      ['現状の職種別TOP10', ''],
      ['名前', '件数'],
      ...getTop10ByValueDescending(data.byJobTypeProfile ?? []).map((c) => [c.name, String(c.count)]),
      [''],
      ['現状の業種別TOP10', ''],
      ['名前', '件数'],
      ...getTop10ByValueDescending(data.byIndustryProfile ?? []).map((c) => [c.name, String(c.count)]),
      [''],
      ['診断結果（向いている業種・職種）', ''],
      ['向いている業種TOP10', ''],
      ['名前', '件数'],
      ...getTop10ByValueDescending(data.bySuitableIndustry ?? []).map((c) => [c.name, String(c.count)]),
      [''],
      ['向いている職種TOP10', ''],
      ['名前', '件数'],
      ...getTop10ByValueDescending(data.bySuitableJobType ?? []).map((c) => [c.name, String(c.count)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700} color="#3d2c1e">
          診断分析レポート
        </Typography>
        <Button
          startIcon={<FileDownloadIcon />}
          variant="outlined"
          onClick={exportCsv}
          sx={{ textTransform: 'none', borderColor: CHART_COLOR, color: CHART_COLOR, '&:hover': { borderColor: CHART_COLOR, bgcolor: 'rgba(234,88,12,0.08)' } }}
        >
          CSVエクスポート
        </Button>
      </Box>

      {/* カテゴリ1: 診断トレンド */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} color="#5c4a3a" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon fontSize="small" />
          診断トレンド
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
              <CardContent sx={{ pt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Typography variant="h6" fontWeight={600} color="#3d2c1e">診断数推移</Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>期間</InputLabel>
                    <Select value={chartType} label="期間" onChange={(e) => setChartType(e.target.value as 'day' | 'week' | 'month')}>
                      <MenuItem value="day">日別</MenuItem>
                      <MenuItem value="week">週別</MenuItem>
                      <MenuItem value="month">月別</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke={CHART_COLOR} strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ border: CARD_BORDER, boxShadow: 'none', height: '100%' }}>
              <CardContent sx={{ pt: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom color="#3d2c1e">サマリー</Typography>
                <Box sx={{ '& > *': { py: 0.5 } }}>
                  <Typography variant="body1">総診断数: <strong>{data?.totalDiagnoses ?? 0}</strong> 件</Typography>
                  <Typography variant="body1">診断完了率: <strong>{data?.completionRate ?? 0}%</strong></Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* カテゴリ2: 診断結果（向いている業種・職種） */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} color="#5c4a3a" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon fontSize="small" />
          診断結果（向いている業種・職種 TOP10・降順）
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
              <CardContent sx={{ pt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="#3d2c1e">向いている業種 TOP10</Typography>
                <Box sx={{ width: '100%', height: 340 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={toChartDataForValueDescendingDisplay(data?.bySuitableIndustry ?? [])}
                      layout="vertical"
                      margin={{ left: 100, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.1)" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10 }} interval={0} />
                      <Tooltip />
                      <Bar dataKey="count" name="件数" fill={CHART_COLOR} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
              <CardContent sx={{ pt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="#3d2c1e">向いている職種 TOP10</Typography>
                <Box sx={{ width: '100%', height: 340 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={toChartDataForValueDescendingDisplay(data?.bySuitableJobType ?? [])}
                      layout="vertical"
                      margin={{ left: 100, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.1)" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10 }} interval={0} />
                      <Tooltip />
                      <Bar dataKey="count" name="件数" fill={CHART_COLOR} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* カテゴリ3: ユーザー属性（プロフィール集計） */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} color="#5c4a3a" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon fontSize="small" />
          ユーザー属性（プロフィール集計：現状の職種・業種）
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
              <CardContent sx={{ pt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="#3d2c1e">年代別</Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={toAgeGroupChartData(data?.byAgeGroup ?? [])}
                      layout="vertical"
                      margin={{ left: 56, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.1)" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 10 }} interval={0} />
                      <Tooltip />
                      <Bar dataKey="count" name="件数" fill={CHART_COLOR} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
              <CardContent sx={{ pt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="#3d2c1e">現状の職種別 TOP10</Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={toChartDataForValueDescendingDisplay(data?.byJobTypeProfile ?? [])}
                      layout="vertical"
                      margin={{ left: 100, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.1)" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10 }} interval={0} />
                      <Tooltip />
                      <Bar dataKey="count" name="件数" fill={CHART_COLOR} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
              <CardContent sx={{ pt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom color="#3d2c1e">現状の業種別 TOP10</Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={toChartDataForValueDescendingDisplay(data?.byIndustryProfile ?? [])}
                      layout="vertical"
                      margin={{ left: 100, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.1)" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 10 }} interval={0} />
                      <Tooltip />
                      <Bar dataKey="count" name="件数" fill={CHART_COLOR} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* カテゴリ4: 市場マッチング */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} color="#5c4a3a" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CompareArrowsIcon fontSize="small" />
          市場マッチング（診断結果 vs 市場需要）
        </Typography>
        {marketError && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            ※ {marketError} 市場データはAIによる推定値です。
          </Typography>
        )}
        {marketData && (
          <>
            <Typography variant="caption" display="block" sx={{ color: '#78716c', mb: 2 }}>
              ※ 市場需要データはAIによる推定値です。参考としてご活用ください。
            </Typography>
            {(() => {
              const dInd = toPercentDistribution(data?.bySuitableIndustry ?? []);
              const mInd = marketToMap(marketData.byIndustry);
              const dJob = toPercentDistribution(data?.bySuitableJobType ?? []);
              const mJob = marketToMap(marketData.byJobType);
              const dAge = toPercentDistribution(data?.byAgeGroup ?? []);
              const mAge = marketToMap(marketData.byAgeGroup);
              const industryMatch = computeMatchScore(dInd, mInd);
              const jobMatch = computeMatchScore(dJob, mJob);
              const ageMatch = computeMatchScore(dAge, mAge);
              const overallMatch = Math.round((industryMatch + jobMatch + ageMatch) / 3);
              const industryCompare = mergeForComparison(data?.bySuitableIndustry ?? [], marketData.byIndustry);
              const jobCompare = mergeForComparison(data?.bySuitableJobType ?? [], marketData.byJobType);
              const gapInd = getGapAnalysis(data?.bySuitableIndustry ?? [], marketData.byIndustry);
              const gapJob = getGapAnalysis(data?.bySuitableJobType ?? [], marketData.byJobType);

              return (
                <Grid container spacing={2}>
                  {/* マッチングサマリー */}
                  <Grid size={{ xs: 12 }}>
                    <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
                      <CardContent sx={{ pt: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom color="#3d2c1e">
                          マッチングサマリー
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(234,88,12,0.08)', borderRadius: 2, minWidth: 100 }}>
                            <Typography variant="caption" color="#78716c">業種</Typography>
                            <Typography variant="h6" fontWeight={700} color={CHART_COLOR}>{industryMatch}%</Typography>
                          </Box>
                          <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(234,88,12,0.08)', borderRadius: 2, minWidth: 100 }}>
                            <Typography variant="caption" color="#78716c">職種</Typography>
                            <Typography variant="h6" fontWeight={700} color={CHART_COLOR}>{jobMatch}%</Typography>
                          </Box>
                          <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(234,88,12,0.08)', borderRadius: 2, minWidth: 100 }}>
                            <Typography variant="caption" color="#78716c">年代</Typography>
                            <Typography variant="h6" fontWeight={700} color={CHART_COLOR}>{ageMatch}%</Typography>
                          </Box>
                          <Box sx={{ px: 2, py: 1, bgcolor: 'rgba(139,90,43,0.12)', borderRadius: 2, minWidth: 100 }}>
                            <Typography variant="caption" color="#78716c">全体</Typography>
                            <Typography variant="h6" fontWeight={700} color="#3d2c1e">{overallMatch}%</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* 業種比較グラフ */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
                      <CardContent sx={{ pt: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom color="#3d2c1e">
                          業種：診断結果 vs 市場需要（％）
                        </Typography>
                        <Box sx={{ width: '100%', height: 320 }}>
                          <ResponsiveContainer>
                            <BarChart data={industryCompare} layout="vertical" margin={{ left: 80, right: 16 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.1)" />
                              <XAxis type="number" tick={{ fontSize: 10 }} />
                              <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 10 }} interval={0} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="diagnosis" name="診断結果" fill={CHART_COLOR} radius={[0, 4, 4, 0]} />
                              <Bar dataKey="market" name="市場需要（AI推定）" fill={MARKET_COLOR} radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* 職種比較グラフ */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
                      <CardContent sx={{ pt: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom color="#3d2c1e">
                          職種：診断結果 vs 市場需要（％）
                        </Typography>
                        <Box sx={{ width: '100%', height: 320 }}>
                          <ResponsiveContainer>
                            <BarChart data={jobCompare} layout="vertical" margin={{ left: 80, right: 16 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.1)" />
                              <XAxis type="number" tick={{ fontSize: 10 }} />
                              <YAxis type="category" dataKey="name" width={75} tick={{ fontSize: 10 }} interval={0} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="diagnosis" name="診断結果" fill={CHART_COLOR} radius={[0, 4, 4, 0]} />
                              <Bar dataKey="market" name="市場需要（AI推定）" fill={MARKET_COLOR} radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* ギャップ分析 */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
                      <CardContent sx={{ pt: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom color="#3d2c1e">
                          ギャップ分析：市場需要高・診断供給低（業種・職種）
                        </Typography>
                        <Typography variant="caption" color="#78716c" display="block" sx={{ mb: 1 }}>
                          市場で需要が高いが、診断ユーザーの適性では相対的に少ない領域
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {[...gapInd.demandHighSupplyLow, ...gapJob.demandHighSupplyLow]
                            .sort((a, b) => b.market - a.market)
                            .slice(0, 6)
                            .map((x, i) => (
                              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span>{x.name}</span>
                                <span>市場 {x.market}% / 診断 {x.diagnosis}%</span>
                              </Box>
                            ))}
                          {[...gapInd.demandHighSupplyLow, ...gapJob.demandHighSupplyLow].length === 0 && (
                            <Typography variant="body2" color="text.secondary">該当なし</Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
                      <CardContent sx={{ pt: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom color="#3d2c1e">
                          ギャップ分析：診断高・市場需要低（業種・職種）
                        </Typography>
                        <Typography variant="caption" color="#78716c" display="block" sx={{ mb: 1 }}>
                          診断ユーザーに多く向いているが、市場需要は相対的に低い領域
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {[...gapInd.supplyHighDemandLow, ...gapJob.supplyHighDemandLow]
                            .sort((a, b) => b.diagnosis - a.diagnosis)
                            .slice(0, 6)
                            .map((x, i) => (
                              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span>{x.name}</span>
                                <span>診断 {x.diagnosis}% / 市場 {x.market}%</span>
                              </Box>
                            ))}
                          {[...gapInd.supplyHighDemandLow, ...gapJob.supplyHighDemandLow].length === 0 && (
                            <Typography variant="body2" color="text.secondary">該当なし</Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              );
            })()}
          </>
        )}
        {!marketData && !marketError && data && (
          <Card sx={{ border: CARD_BORDER, boxShadow: 'none' }}>
            <CardContent sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={24} sx={{ color: CHART_COLOR }} />
              <Typography variant="body2" sx={{ ml: 2 }}>市場データを取得中…</Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
