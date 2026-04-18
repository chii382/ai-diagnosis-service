'use client';

import { Box } from '@mui/material';

/** フリープラン（ティール）・添付参考色 */
const FREE_MAIN = '#26A69A';
const FREE_FOLD = '#1a7a6e';

/** プロプラン（サーモンピンク） */
const PRO_MAIN = '#fa8072';
const PRO_FOLD = '#d65a4e';

type PlanRibbonBadgeProps = {
  /** true のときプロプラン表示 */
  isPro: boolean;
};

/**
 * 帯の左下に折り返し（リボン）を付けたプラン表示
 */
export default function PlanRibbonBadge({ isPro }: PlanRibbonBadgeProps) {
  const main = isPro ? PRO_MAIN : FREE_MAIN;
  const fold = isPro ? PRO_FOLD : FREE_FOLD;
  const label = isPro ? 'プロプラン' : 'フリープラン';

  return (
    <Box
      component="span"
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        pl: 1.5,
        pr: 1.85,
        py: 0.65,
        color: '#fff',
        fontWeight: 700,
        fontSize: { xs: '0.7rem', sm: '0.8rem' },
        letterSpacing: '0.04em',
        bgcolor: main,
        lineHeight: 1.2,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
        // 左下の折り込み（濃い色の三角形でリボン感）
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          bottom: -9,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '0 8px 9px 0',
          borderColor: `transparent transparent ${fold} transparent`,
          zIndex: 0,
        },
      }}
    >
      {label}
    </Box>
  );
}
