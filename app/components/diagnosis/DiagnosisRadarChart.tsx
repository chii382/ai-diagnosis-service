'use client';

import { Box, Typography } from '@mui/material';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Text,
} from 'recharts';

interface DiagnosisRadarChartProps {
  data: Record<string, number>;
  title?: string;
}

function renderCustomTick(props: {
  payload?: { value?: string };
  cx?: number | string;
  cy?: number | string;
  x?: number | string;
  y?: number | string;
}) {
  const { payload, cx = 0, cy = 0, x = 0, y = 0 } = props;
  const value = payload?.value ?? '';
  const k = 1.18;
  const ncx = Number(cx) || 0;
  const ncy = Number(cy) || 0;
  const nx = Number(x) || 0;
  const ny = Number(y) || 0;
  const tx = ncx + (nx - ncx) * k;
  const ty = ncy + (ny - ncy) * k;
  return (
    <Text x={tx} y={ty} fill="#5c4033" fontSize={10} textAnchor="middle">
      {value}
    </Text>
  );
}

export default function DiagnosisRadarChart({ data, title = 'キャリアスキルレーダーチャート' }: DiagnosisRadarChartProps) {
  const chartData = Object.entries(data)
    .slice(0, 8)
    .map(([subject, value]) => ({
      subject,
      value: typeof value === 'number' ? Math.min(5, Math.max(0, value)) : 0,
      fullMark: 5,
    }));

  if (chartData.length === 0) return null;

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#fff',
        borderRadius: 2,
        border: '1px solid rgba(139, 90, 43, 0.08)',
        boxShadow: '0 2px 12px rgba(139, 90, 43, 0.06)',
        overflow: 'visible',
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          color: '#3d2c1e',
          fontSize: '0.95rem',
          mb: 1.5,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ width: '100%', minWidth: 300, height: 360, overflow: 'visible' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="52%" data={chartData} margin={{ top: 25, right: 35, bottom: 25, left: 35 }}>
            <PolarGrid stroke="rgba(139, 90, 43, 0.15)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={renderCustomTick}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tick={{ fill: '#8b5a2b', fontSize: 10 }}
              tickCount={6}
            />
            <Radar
              name="あなたのスコア"
              dataKey="value"
              stroke="#f97316"
              fill="#f97316"
              fillOpacity={0.35}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid rgba(139, 90, 43, 0.12)',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : '0', 'スコア']}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={() => 'あなたのスコア'}
            />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
      {chartData.length > 0 && (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(139, 90, 43, 0.08)' }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 10px',
              fontSize: '0.75rem',
              color: '#5c4033',
              lineHeight: 1.5,
            }}
          >
            {chartData.map((d, i) => (
              <Box key={i} component="span">
                {d.subject}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
