import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { getPublicAppUrl } from '@/lib/getPublicAppUrl';

/**
 * Stripe のサーバー用クライアント（秘密鍵はサーバーでのみ使用）
 * — このファイルはブラウザに送られないため、STRIPE_SECRET_KEY を安全に使える
 */
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY が設定されていません。');
  }
  return new Stripe(key);
}

type CheckoutBody = {
  /** true のとき Embedded Checkout 用（client_secret を返す。ホスト型 URL は返さない） */
  embedded?: boolean;
};

/**
 * POST /api/checkout
 * — Checkout Session を作成する
 * · embedded: false（既定）→ ホスト型 Checkout の url
 * · embedded: true → Embedded Checkout 用の client_secret（ui_mode: embedded_page）
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'ログインが必要です。' }, { status: 401 });
    }
    const userEmail = session.user.email;

    // フロントと同じ「サイトのベース URL」（成功・キャンセル後の戻り先に使う）
    const appUrl = getPublicAppUrl();
    if (!appUrl) {
      console.error(
        '[checkout] 公開 URL を解決できません。NEXT_PUBLIC_APP_URL または Vercel の VERCEL_URL 等を設定してください。'
      );
      return NextResponse.json(
        { error: 'サーバー設定（公開サイトの URL）が不足しています。' },
        { status: 500 }
      );
    }

    // Stripe ダッシュボードで作成した Price ID（1 商品につき 1 つ）
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    if (!priceId) {
      console.error('[checkout] NEXT_PUBLIC_STRIPE_PRICE_ID が未設定です');
      return NextResponse.json(
        { error: '商品（価格）の設定が不足しています。' },
        { status: 500 }
      );
    }

    let embedded = false;
    try {
      const body = (await req.json()) as CheckoutBody;
      embedded = Boolean(body?.embedded);
    } catch {
      /* body なし */
    }

    const stripe = getStripe();

    // Price が「定期課金」なら subscription、都度払いなら payment（混在すると Stripe がエラーにする）
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.recurring ? ('subscription' as const) : ('payment' as const);

    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    const sessionCommon = {
      customer_email: userEmail,
      metadata: { userEmail },
    } as const;

    if (embedded) {
      // 自サイト埋め込み Checkout（cancel_url は指定不可 → 画面下に自前のキャンセル導線を置く）
      const checkoutSession = await stripe.checkout.sessions.create({
        mode,
        line_items: lineItems,
        ui_mode: 'embedded_page',
        return_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        ...sessionCommon,
      });

      if (!checkoutSession.client_secret) {
        console.error('[checkout] embedded: client_secret が空です', checkoutSession.id);
        return NextResponse.json(
          { error: '決済セッションの初期化に失敗しました。' },
          { status: 500 }
        );
      }

      return NextResponse.json({ clientSecret: checkoutSession.client_secret });
    }

    // ホスト型 Checkout（フルページ redirect）
    const checkoutSession = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      ...sessionCommon,
    });

    const url = checkoutSession.url;
    if (!url) {
      console.error('[checkout] session.url が空です', checkoutSession.id);
      return NextResponse.json(
        { error: '決済ページの URL を取得できませんでした。' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error('[checkout] Stripe error:', err.type, err.code, err.message);
    } else {
      console.error('[checkout]', err);
    }
    const message =
      err instanceof Error ? err.message : '決済セッションの作成に失敗しました。';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
