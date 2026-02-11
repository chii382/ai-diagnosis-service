# Vercel環境変数設定手順

## 本番環境でログインエラーが発生している場合

本番環境で「Server error」が表示される場合、Vercelの環境変数が正しく設定されていない可能性があります。

## 設定手順

### 1. Vercelダッシュボードにアクセス

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. プロジェクト「ai-diagnosis-service」を選択
3. 「Settings」→「Environment Variables」に移動

### 2. Production環境に環境変数を追加

以下の環境変数を**Production**環境に追加してください：

| 環境変数名 | 値 | 説明 |
|-----------|-----|------|
| `GOOGLE_CLIENT_ID` | `1034055950152-s2fonhh8tj5dg7gab6m031bjtafipsve.apps.googleusercontent.com` | Google OAuth認証ID |
| `GOOGLE_CLIENT_SECRET` | `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` | Google OAuth認証シークレット |
| `AUTH_SECRET` | `jozdqXva8ijeFv4kFPdXRgw+glTbotmiV4FFYrqfw88=` | NextAuth.jsセッション暗号化キー |
| `MONGODB_URI` | `mongodb+srv://akirapapa_db_user:akirapapa@cluster0.yx71oyz.mongodb.net/?appName=Cluster0` | MongoDB接続文字列 |
| `MONGODB_DB_NAME` | `auth` | MongoDBデータベース名（オプション） |
| `NEXTAUTH_URL` | `https://ai-diagnosis-service-virid.vercel.app` | 本番環境のURL（**重要**） |
| `AUTH_URL` | `https://ai-diagnosis-service-virid.vercel.app` | 認証URL（**重要**） |

### 3. 環境変数の追加方法

1. 「Environment Variables」ページで「Add New」をクリック
2. **Key**に環境変数名を入力（例: `GOOGLE_CLIENT_ID`）
3. **Value**に値を入力
4. **Environment**で「Production」を選択（**重要**: Productionを選択してください）
5. 「Save」をクリック
6. すべての環境変数について繰り返す

### 4. Google Cloud ConsoleでリダイレクトURIを追加

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択
3. 「APIとサービス」→「認証情報」に移動
4. OAuth 2.0 クライアント IDを編集
5. 「承認済みのリダイレクト URI」に以下を追加：
   ```
   https://ai-diagnosis-service-virid.vercel.app/api/auth/callback/google
   ```
6. 「保存」をクリック

### 5. 再デプロイ

環境変数を設定した後、以下のいずれかの方法で再デプロイしてください：

**方法1: GitHubにプッシュ**
```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

**方法2: Vercelダッシュボードから**
1. Vercelダッシュボードでプロジェクトを選択
2. 「Deployments」タブを開く
3. 最新のデプロイメントの「...」メニューから「Redeploy」を選択

## 確認方法

### 環境変数の確認

Vercelダッシュボードの「Settings」→「Environment Variables」で以下を確認：
- [ ] Production環境にすべての環境変数が設定されている
- [ ] `NEXTAUTH_URL`が本番環境のURL（`https://ai-diagnosis-service-virid.vercel.app`）になっている
- [ ] `AUTH_URL`が本番環境のURLになっている

### 動作確認

本番環境で以下を確認：
- [ ] ログインページ（`/auth/signin`）が表示される
- [ ] Googleログインボタンが表示される
- [ ] Googleログインボタンをクリックして認証が成功する
- [ ] 認証後にダッシュボード（`/dashboard`）にリダイレクトされる

## よくあるエラー

### エラー: "Server error"

**原因**: 環境変数が設定されていない、または`NEXTAUTH_URL`が間違っている

**対処**:
1. VercelダッシュボードでProduction環境にすべての環境変数が設定されているか確認
2. `NEXTAUTH_URL`が本番環境のURLになっているか確認
3. 再デプロイを実行

### エラー: "Invalid redirect URI"

**原因**: Google Cloud Consoleで本番環境のリダイレクトURIが設定されていない

**対処**: Google Cloud Consoleで`https://ai-diagnosis-service-virid.vercel.app/api/auth/callback/google`を追加

## 注意事項

- 環境変数は**Production**環境に設定してください（DevelopmentやPreviewではなく）
- `NEXTAUTH_URL`と`AUTH_URL`は必ず本番環境のURL（`https://ai-diagnosis-service-virid.vercel.app`）に設定してください
- 環境変数を変更した後は、必ず再デプロイを実行してください
