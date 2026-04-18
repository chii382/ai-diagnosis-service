# Stripe 課金導線 設計書

**対象サービス:** キャリア診断サービス（Next.js + TypeScript + MongoDB）  
**認証:** NextAuth.js（Google OAuth）  
**版:** 初版（Stage 5 実装のたたき台）

---

## 1. 商品設計

### 1.1 有料商品（Stripe Product / Price）

| 項目 | 内容 |
|------|------|
| **商品名（表示用）** | プロプラン（月額） |
| **課金形態** | サブスクリプション（月額） |
| **税込価格（想定）** | ¥980 / 月（Stripe Price に `unit_amount` 等で登録。税区分は事業者の税務方針に合わせる） |
| **請求サイクル** | 毎月 |
| **Stripe 上の識別** | Product: 例 `career_diagnosis_pro` / Price: 例 `price_pro_monthly`（実装時に環境変数で参照） |

### 1.2 含まれる機能（プロプラン）

料金ページ・LP と整合させた**プロプラン**に含める機能は次のとおりとする。

| # | 機能 |
|---|------|
| 1 | 5問の簡単な質問に回答 |
| 2 | AI による簡易診断結果 |
| 3 | AI による詳細キャリアロードマップ作成 |
| 4 | 診断履歴の保存・比較 |
| 5 | 結果の PDF ダウンロード |

無料（お試し・未課金会員）との差分は **「2. 無料／有料の対比」** に集約する。

---

## 2. 無料ユーザーと有料ユーザーの対比

| 区分 | フリー（お試し・未課金） | プロ（Stripe サブスク有効） |
|------|--------------------------|------------------------------|
| **診断の実施** | お試しは回数制限あり（例: 3回まで）※アプリ仕様に合わせる | 会員かつ課金済みなら原則無制限（アプリ仕様に合わせる） |
| **簡易診断結果（3行サマリー）** | ○ | ○ |
| **詳細分析・詳細キャリアロードマップ** | モザイク／ロック表示（閲覧不可または一部のみ） | ○ 閲覧可能 |
| **診断履歴の保存・比較** | × または制限 | ○ |
| **結果の PDF ダウンロード** | × | ○ |
| **課金状態の判定** | `subscriptionStatus !== 'active'` 等 | Stripe Webhook / DB で `active` を保持 |

※「フリー」のうち「Google ログインのみで未課金」の会員と「お試し診断のみ」の扱いは、実装時に User モデルのフラグで分けてもよい。

---

## 3. 課金導線の設計

### 3.1 購入ボタンを置く画面とボタン文言

| 画面 | 配置イメージ | ボタン文言（案） | 補足 |
|------|----------------|------------------|------|
| **トップページ（料金セクション `#pricing`）** | プロプランカード内の主ボタン | **「プロプランに申し込む」** | 未ログイン時は先にサインインへ誘導してから Checkout でも可 |
| **診断結果（ロック表示付近）** | 詳細分析エリアの下またはモザイク上の CTA | **「プロプランで全文を見る」** | 体験後の転換用 |
| **マイページ / ダッシュボード** | 課金状態が無料のときのみ表示 | **「プロプランにアップグレード」** | 既存ユーザーのアップセル |
| **FAQ / 料金に誘導するフッター** | テキストリンク | **「料金・プランを見る」** → `#pricing` へ | 導線の補助 |

ボタン押下時の分岐（推奨）:

- **未ログイン** → `/auth/signin?callbackUrl=/api/billing/checkout` など（サインイン後に Checkout 作成）
- **ログイン済み・未課金** → サーバーで Checkout Session 作成 → Stripe Hosted Checkout へリダイレクト

### 3.2 ボタンから Stripe Checkout までの流れ（テキスト図）

```
[ユーザー] 購入ボタン押下
    → （未ログインなら）Google サインイン
    → [Next.js] POST /api/billing/checkout（または Route Handler）
           · セッションから userId 取得
           · Stripe Customer を user に紐づけ（初回のみ作成）
           · checkout.sessions.create（mode: subscription, line_items, success_url, cancel_url）
    → [Stripe] Hosted Checkout ページへリダイレクト
    → [ユーザー] カード入力・確定
    → [Stripe] success_url / cancel_url へリダイレクト
    → [Stripe] Webhook: checkout.session.completed / customer.subscription.updated 等
    → [Next.js] MongoDB の User に subscription 状態を保存
```

---

## 4. 支払い後の画面設計

ベース URL を `https://example.com` とした例。実装時は環境変数 `NEXT_PUBLIC_APP_URL` 等に合わせる。

### 4.1 成功（success）

| 項目 | 内容 |
|------|------|
| **URL（案）** | `/billing/success?session_id={CHECKOUT_SESSION_ID}` |
| **表示メッセージ（案）** | 「お支払いが完了しました。プロプランの機能がご利用いただけます。」 |
| **次の行動ボタン** | 主: **「診断結果を見る」**（直前の診断 ID があればそこへ）／副: **「マイページへ」** |

※ `session_id` は表示に使わず、サーバーで Session を検証してから DB 更新済みであることが前提（二重反映防止）。

### 4.2 キャンセル（cancel）

| 項目 | 内容 |
|------|------|
| **URL（案）** | `/billing/cancel` |
| **表示メッセージ（案）** | 「決済を完了されませんでした。いつでも再度お申し込みいただけます。」 |
| **次の行動ボタン** | **「料金プランに戻る」**（`/#pricing`）／**「トップへ戻る」** |

### 4.3 エラー（error）

| 項目 | 内容 |
|------|------|
| **URL（案）** | `/billing/error`（クエリ例: `?reason=webhook` / `reason=session_invalid`） |
| **表示メッセージ（案）** | 「決済の処理中に問題が発生しました。しばらくしてから再度お試しください。改善しない場合はサポートへご連絡ください。」 |
| **次の行動ボタン** | **「もう一度試す」**（Checkout 再作成へ）／**「トップへ戻る」** |

※ エラーは Checkout 完了後に Webhook 失敗したケースや、手動で `/billing/success` に直叩きしたケースなどを想定。ログ・Sentry と連携するとよい。

### 4.4 画面遷移の整理（テキスト図）

```
Stripe Checkout 成功
    → /billing/success
        → [診断結果を見る] / [マイページへ]

Stripe Checkout キャンセル
    → /billing/cancel
        → [料金プランに戻る] / [トップへ]

アプリ側エラー or 検証失敗
    → /billing/error
        → [もう一度試す] / [トップへ]
```

---

## 5. 実装チェックリスト（Stage 5・優先順）

優先度は **依存関係とリスク低減** を考慮した順。

| 順 | 項目 | 内容 |
|----|------|------|
| 1 | Stripe ダッシュボード準備 | Product / Price 作成、テスト／本番の API キー・Webhook シークレットを環境変数に分離 |
| 2 | User モデル拡張 | `stripeCustomerId`, `subscriptionId`, `subscriptionStatus`, `currentPeriodEnd` 等 |
| 3 | Checkout Session API | `POST /api/billing/checkout`（認証必須、Customer 紐付け、success/cancel URL） |
| 4 | Webhook エンドポイント | `POST /api/billing/webhook`（raw body で署名検証、`checkout.session.completed` 等で DB 更新） |
| 5 | 成功・キャンセル・エラーページ | `/billing/success`, `/billing/cancel`, `/billing/error` の UI と文言 |
| 6 | 機能ゲート | 診断結果のモザイク解除・PDF・履歴を `subscriptionStatus === 'active'`（等）で制御 |
| 7 | 購入ボタン設置 | 料金セクション・診断結果・マイページへの CTA と未ログイン時の誘導 |
| 8 | カスタマーポータル（任意） | プラン変更・解約は Stripe Customer Portal へのリンクをマイページに配置 |
| 9 | テスト | Stripe CLI で Webhook テスト、テストカード（成功／3Dセキュア／失敗） |
| 10 | 本番切替 | 本番キー・Webhook URL 登録、ログ監視 |

---

## 補足

- **PCI DSS:** カード番号は自前で保持せず、Stripe Checkout / Elements に任せる方針とする。
- **税・インボイス:** インボイス制度・適格請求書に応じた Stripe Tax / メタデータは別途検討。
- **利用規約・特商法:** サブスク開始前に LP / フッターから参照できるようにする。

---

*本文書は実装時の仕様と差し替え・追記が発生してもよいドラフトである。*
