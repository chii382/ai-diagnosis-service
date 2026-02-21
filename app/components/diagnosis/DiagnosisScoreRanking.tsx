'use client';

import { Box, Typography } from '@mui/material';

interface RankingItem {
  name: string;
  score: number;
}

interface RankingCategory {
  category: string;
  items: RankingItem[];
}

interface DiagnosisScoreRankingProps {
  data: RankingCategory[];
  title?: string;
}

const RANK_STYLES = [
  { bg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#fff' },
  { bg: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', color: '#fff' },
  { bg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff' },
  { bg: 'rgba(139, 90, 43, 0.12)', color: '#5c4033' },
];

export default function DiagnosisScoreRanking({
  data,
  title = 'スコアランキング',
}: DiagnosisScoreRankingProps) {
  if (!data || data.length === 0) return null;

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: '#fff',
        borderRadius: 2,
        border: '1px solid rgba(139, 90, 43, 0.08)',
        boxShadow: '0 2px 12px rgba(139, 90, 43, 0.06)',
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((cat, catIdx) => (
          <Box key={catIdx}>
            <Typography
              sx={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#f97316',
                mb: 0.75,
                borderBottom: '2px solid rgba(249, 115, 22, 0.3)',
                pb: 0.5,
                display: 'inline-block',
              }}
            >
              {cat.category}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {cat.items
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .map((item, idx) => {
                  const style = RANK_STYLES[Math.min(idx, RANK_STYLES.length - 1)];
                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        py: 0.5,
                        px: 1,
                        borderRadius: 1,
                        bgcolor: idx < 3 ? 'rgba(249, 115, 22, 0.04)' : 'transparent',
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          ...style,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.85rem',
                          color: '#5c4033',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: '#f97316',
                          flexShrink: 0,
                        }}
                      >
                        {typeof item.score === 'number' ? item.score.toFixed(1) : '-'}
                      </Typography>
                    </Box>
                  );
                })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
