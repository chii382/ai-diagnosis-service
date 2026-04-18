'use client';

import { Box } from '@mui/material';
import CheckoutButton from './CheckoutButton';

/** public/pointing-hand.png の自然サイズ（変形禁止のため比率算出に使用） */
const POINTING_HAND_INTRINSIC = { w: 176, h: 163 };
/** 行内の表示高さ（幅は縦横比固定で算出） */
const POINTING_HAND_DISPLAY_H = 32;

/** 差し指アイコン（等方スケールのみ・縦横比は常に維持。img は高さ指定＋ width: auto で比率固定） */
function ProPlanPointingHand() {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        flexShrink: 0,
        lineHeight: 0,
        transform: 'translateY(0.5px)',
        '@keyframes proArrowNudge': {
          '0%, 100%': { transform: 'translateY(0.5px) translateX(0)' },
          '50%': { transform: 'translateY(0.5px) translateX(3px)' },
        },
        animation: 'proArrowNudge 2.4s ease-in-out infinite',
      }}
    >
      <Box
        component="img"
        src="/pointing-hand.png"
        alt=""
        width={POINTING_HAND_INTRINSIC.w}
        height={POINTING_HAND_INTRINSIC.h}
        sx={{
          height: POINTING_HAND_DISPLAY_H,
          width: 'auto',
          /** 画像の縦横比を CSS でも固定（潰れ防止） */
          aspectRatio: `${POINTING_HAND_INTRINSIC.w} / ${POINTING_HAND_INTRINSIC.h}`,
          display: 'block',
          verticalAlign: 'middle',
          objectFit: 'contain',
        }}
      />
    </Box>
  );
}

/**
 * 診断結果：プロプラン課金への導線
 * — 文言は「文字幅ぴったり」のラップ（横幅一杯に広がらない）
 * — 背景は参照 CSS 同様、::before を scaleX で流し込むオレンジグラデ
 */
export default function ProUpgradeCtaRow() {
  return (
    <Box
      className="pro-upgrade-bg is-animated"
      sx={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: { xs: 1, sm: 1.25 },
        rowGap: 1.25,
        maxWidth: '100%',
        ml: { xs: 0, md: 'auto' },
        '@keyframes proUpgradeBgSweep': {
          '0%': {
            opacity: 0,
            transform: 'scaleX(0) translateX(-5%)',
          },
          '22%': {
            opacity: 1,
            transform: 'scaleX(1) translateX(0)',
          },
          '82%': {
            opacity: 1,
            transform: 'scaleX(1) translateX(0)',
          },
          '100%': {
            opacity: 0,
            transform: 'scaleX(0) translateX(-5%)',
          },
        },
        '&.is-animated .bg-wrap': {
          position: 'relative',
          display: 'inline-block',
          maxWidth: '100%',
          verticalAlign: 'middle',
          borderRadius: '12px',
          overflow: 'hidden',
          lineHeight: 1.45,
        },
        '&.is-animated .bg-wrap::before': {
          animation:
            'proUpgradeBgSweep 4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
          background:
            'linear-gradient(to right, #9a3412 0%, #c2410c 22%, #ea580c 48%, #f97316 72%, #fdba74 100%)',
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transformOrigin: 'left center',
        },
        '& .inn': {
          color: '#fff',
          display: 'inline-block',
          fontSize: { xs: '0.78rem', sm: '0.88rem' },
          fontWeight: 700,
          letterSpacing: '0.03em',
          padding: '10px 16px',
          position: 'relative',
          zIndex: 1,
          whiteSpace: 'nowrap',
          textShadow: '0 1px 3px rgba(0,0,0,0.25)',
        },
      }}
    >
      <Box component="span" className="bg-wrap">
        <Box component="span" className="inn">
          プロプランにアップデートする場合はこちらから
        </Box>
      </Box>

      <ProPlanPointingHand />

      {/*
        アップデート: /checkout（Embedded Checkout）へ。Stripe フォーム直下に「キャンセル」ボタンを表示する。
        完了後は return_url で /checkout/success、キャンセルで /checkout/cancel。
      */}
      <Box sx={{ flexShrink: 0 }}>
        <CheckoutButton
          label="アップデート"
          variant="contained"
          size="small"
          buttonSx={{
            borderRadius: '999px',
            px: 2.25,
            py: 0.75,
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
            minHeight: 36,
            background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 35%, #fdba74 92%)',
            color: '#9a3412',
            border: '1px solid rgba(251, 146, 60, 0.55)',
            boxShadow: '0 3px 10px rgba(251, 146, 60, 0.22)',
            '&:hover': {
              background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 40%, #fb923c 95%)',
              borderColor: 'rgba(249, 115, 22, 0.5)',
              boxShadow: '0 4px 14px rgba(251, 146, 60, 0.28)',
            },
            '&:disabled': {
              background: 'rgba(254, 215, 170, 0.55)',
              color: 'rgba(154, 52, 18, 0.6)',
              borderColor: 'rgba(251, 146, 60, 0.35)',
            },
          }}
        />
      </Box>
    </Box>
  );
}
