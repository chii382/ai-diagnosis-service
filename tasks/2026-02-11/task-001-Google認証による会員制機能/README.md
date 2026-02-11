# Google認証による会員制機能 - セットアップガイド

## 実装完了項目

✅ NextAuth.js v5（Auth.js）設定  
✅ Google OAuth認証  
✅ MongoDBアダプター設定  
✅ 認証ミドルウェア  
✅ ログインページ（/auth/signin）  
✅ ダッシュボードページ（/dashboard）  
✅ プロフィールページ（/profile）  
✅ ユーザー情報取得API  
✅ プロフィール更新API  

## セットアップ手順

### 1. パッケージのインストール

```bash
npm install next-auth@beta @auth/mongodb-adapter mongodb
```

### 2. 環境変数の設定

`.env.local`ファイルをプロジェクトルートに作成し、以下の環境変数を設定してください：

```env
# Google OAuth認証情報
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth.js設定
AUTH_SECRET=your_auth_secret_here

# MongoDB接続文字列
MONGODB_URI=mongodb://localhost:27017/your_database_name
MONGODB_DB_NAME=auth
```

#### 環境変数の取得方法

**AUTH_SECRETの生成：**
```bash
openssl rand -base64 32
```

**Google OAuth認証情報の取得：**
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
5. アプリケーションの種類を「ウェブアプリケーション」に設定
6. 承認済みのリダイレクト URIに以下を追加：
   - 開発環境: `http://localhost:3000/api/auth/callback/google`
   - 本番環境: `https://your-domain.com/api/auth/callback/google`

**MongoDB接続文字列：**
- ローカルMongoDB: `mongodb://localhost:27017/your_database_name`
- MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database_name`

### 3. 実装されたファイル

```
app/
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts          # NextAuth.js設定
│   └── user/
│       └── profile/
│           └── route.ts          # ユーザー情報取得・更新API
├── auth/
│   └── signin/
│       └── page.tsx              # ログインページ
├── dashboard/
│   └── page.tsx                  # ダッシュボードページ
├── profile/
│   └── page.tsx                  # プロフィールページ
└── providers/
    └── SessionProvider.tsx       # セッションプロバイダー

middleware.ts                      # 認証ミドルウェア
```

### 4. 動作確認

1. 開発サーバーを起動：
```bash
npm run dev
```

2. ブラウザで以下にアクセス：
   - ログインページ: `http://localhost:3000/auth/signin`
   - ダッシュボード: `http://localhost:3000/dashboard`（認証必須）
   - プロフィール: `http://localhost:3000/profile`（認証必須）

3. Googleアカウントでログインをテスト

## 機能説明

### 認証フロー

1. ユーザーが保護されたページ（/dashboard, /profile）にアクセス
2. 未ログインの場合、ミドルウェアが`/auth/signin`にリダイレクト
3. ログインページでGoogleログインボタンをクリック
4. Google認証画面で認証
5. 認証成功後、`/dashboard`にリダイレクト
6. セッションが確立され、保護されたページにアクセス可能

### データモデル

NextAuth.jsが自動的にMongoDBに以下のコレクションを作成します：

- `users`: ユーザー情報
- `accounts`: OAuthアカウント情報
- `sessions`: セッション情報（JWT使用時は使用されない場合あり）

### APIエンドポイント

- `GET /api/auth/[...nextauth]`: NextAuth.js認証エンドポイント
- `GET /api/user/profile`: ユーザー情報取得
- `PUT /api/user/profile`: プロフィール更新

## トラブルシューティング

### MongoDB接続エラー

- MongoDBが起動しているか確認
- `MONGODB_URI`が正しく設定されているか確認
- ファイアウォール設定を確認（MongoDB Atlasの場合）

### Google OAuth認証エラー

- Google Cloud ConsoleでリダイレクトURIが正しく設定されているか確認
- `GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`が正しく設定されているか確認

### セッションが保持されない

- `AUTH_SECRET`が設定されているか確認
- ブラウザのCookie設定を確認

## 次のステップ

- [ ] ユーザー情報の拡張（追加フィールド）
- [ ] ログアウト機能の追加
- [ ] エラーハンドリングの強化
- [ ] テストの追加
