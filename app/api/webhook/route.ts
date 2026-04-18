import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { connectDB } from '@/lib/db';
import { escapeRegexChars, PLAN_PRO } from '@/lib/plan';

/** Node ランタイムで動かす（Stripe SDK が期待する暗号処理のため） */
export const runtime = 'nodejs';

/**
 * Stripe のサーバー用クライアント（STRIPE_SECRET_KEY はサーバー専用）
 */
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY が設定されていません。');
  }
  return new Stripe(key);
}

/**
 * POST /api/webhook
 * Stripe ダッシュボードから送られる Webhook を受け取り、署名検証後にイベントを処理する。
 *
 * 【流れの4ステップ】
 * 1. 材料取得 … 生の body と stripe-signature、環境変数のシークレットを取る
 * 2. 署名検証 … constructEvent で改ざんされていないことを確認する
 * 3. イベント分岐 … checkout.session.completed だけビジネス処理（他はログのみ）
 * 4. 200 OK 返却 … 検証に成功したリクエストは必ず 200（内部処理で失敗してもログしつつ 200）
 */
export async function POST(request: Request) {
  // --- 1. 材料取得（JSON にパースせず、署名検証用に生テキストのまま使う） ---
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    console.error('[webhook] stripe-signature ヘッダーがありません');
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET が未設定です');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  // --- 2. 署名検証（失敗時のみ 400。Stripe に「再送してよい」と伝える） ---
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] 署名検証に失敗しました', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // --- 3. イベント分岐 ---
  switch (event.type) {
    case 'checkout.session.completed': {
      // Checkout が完了したときのセッション（支払い・サブスク開始などの起点）
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        const metaEmail = session.metadata?.userEmail?.trim();
        const detailEmail = session.customer_details?.email?.trim();
        const customerEmail =
          typeof session.customer_email === 'string' ? session.customer_email.trim() : '';
        const email = metaEmail || detailEmail || customerEmail;

        console.log(
          '[webhook] checkout.session.completed',
          'session.id =',
          session.id,
          'email =',
          email || '(なし)'
        );

        if (!email) {
          console.error('[webhook] メールが取得できず plan を更新できません');
          break;
        }

        await connectDB();
        const mongoose = await import('mongoose');
        const db = mongoose.default.connection.db;
        if (!db) {
          console.error('[webhook] MongoDB db が取得できません');
          break;
        }

        const filter = {
          email: new RegExp(`^${escapeRegexChars(email)}$`, 'i'),
        };
        const updateResult = await db.collection('users').updateOne(filter, {
          $set: { plan: PLAN_PRO, updatedAt: new Date() },
        });

        if (updateResult.matchedCount === 0) {
          console.warn(
            '[webhook] users に一致するドキュメントがありません（未登録メールの可能性）:',
            email
          );
        } else {
          console.log('[webhook] plan をプロに更新しました:', email);
        }
      } catch (handlerErr) {
        // 内部処理が失敗しても 200 は返す方針（Stripe の無限リトライを避けるためログに留める）
        console.error('[webhook] checkout.session.completed 処理中にエラー', handlerErr);
      }
      break;
    }

    default: {
      // 今回は未対応のイベントは記録だけしておく
      console.log('[webhook] 未処理のイベント種別（スキップ）:', event.type);
    }
  }

  // --- 4. 200 OK 返却（署名が通ったリクエストはここまで来る） ---
  return NextResponse.json({ received: true }, { status: 200 });
}
