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
} from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface AnalyticsData {
  dailyChart: Array<{ date: string; count: number }>;
  weeklyChart: Array<{ date: string; count: number }>;
  monthlyChart: Array<{ date: string; count: number }>;
  topCareers: Array<{ name: string; count: number }>;
  completionRate: number;
  totalDiagnoses: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
      ['人気キャリアパスTOP10', ''],
      ['名前', '件数'],
      ...(data.topCareers?.map((c) => [c.name, String(c.count)]) ?? []),
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5" fontWeight={700} color="#3d2c1e">
          診断分析レポート
        </Typography>
        <Button startIcon={<FileDownloadIcon />} variant="outlined" onClick={exportCsv} sx={{ textTransform: 'none' }}>
          CSVエクスポート
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ border: '1px solid rgba(139,90,43,0.12)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>診断数推移</Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>期間</InputLabel>
                  <Select value={chartType} label="期間" onChange={(e) => setChartType(e.target.value as 'day' | 'week' | 'month')}>
                    <MenuItem value="day">日別</MenuItem>
                    <MenuItem value="week">週別</MenuItem>
                    <MenuItem value="month">月別</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.1)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ border: '1px solid rgba(139,90,43,0.12)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>サマリー</Typography>
              <Typography>総診断数: {data?.totalDiagnoses ?? 0}</Typography>
              <Typography>診断完了率: {data?.completionRate ?? 0}%</Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid rgba(139,90,43,0.12)', mt: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>人気キャリアパス TOP10</Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={(data?.topCareers ?? []).slice(0, 10)}
                    layout="vertical"
                    margin={{ left: 80, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,90,43,0.1)" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
