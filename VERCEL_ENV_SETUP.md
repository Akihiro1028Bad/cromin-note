# Vercel環境変数設定ガイド

## 必要な環境変数

### 1. データベース接続
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.tdpnuvtkiliypyywkxsd.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.tdpnuvtkiliypyywkxsd.supabase.co:5432/postgres
```

### 2. 認証
```
JWT_SECRET=your-secure-secret-key-here
```

### 3. 環境設定
```
NODE_ENV=production
```

### 4. メール設定（オプション）
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

## 設定手順

### Step 1: Vercelダッシュボードにアクセス
1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクトを選択
3. Settings → Environment Variables

### Step 2: 環境変数を追加
各環境変数を以下の設定で追加：

- **Name**: `DATABASE_URL`
- **Value**: `postgresql://postgres:[YOUR-PASSWORD]@db.tdpnuvtkiliypyywkxsd.supabase.co:5432/postgres`
- **Environment**: Production, Preview, Development

- **Name**: `DIRECT_URL`
- **Value**: `postgresql://postgres:[YOUR-PASSWORD]@db.tdpnuvtkiliypyywkxsd.supabase.co:5432/postgres`
- **Environment**: Production, Preview, Development

- **Name**: `JWT_SECRET`
- **Value**: `your-secure-secret-key-here`
- **Environment**: Production, Preview, Development

- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Production, Preview, Development

### Step 3: 設定の確認
1. すべての環境変数が正しく設定されているか確認
2. 環境（Production, Preview, Development）が正しく選択されているか確認

## トラブルシューティング

### データベース接続エラー
```
Error: P1001: Can't reach database server
```

**解決方法:**
1. `DATABASE_URL`と`DIRECT_URL`が正しく設定されているか確認
2. Supabaseの接続設定を確認
3. パスワードが正しいか確認

### JWT認証エラー
```
API /auth/me - Invalid token
```

**解決方法:**
1. `JWT_SECRET`が設定されているか確認
2. シークレットキーが十分に長く、安全か確認

### マイグレーションエラー
```
❌ マイグレーションでエラーが発生しました
```

**解決方法:**
1. 環境変数が正しく設定されているか確認
2. データベース接続が正常か確認
3. マイグレーションファイルが正しいか確認

## 確認方法

### デプロイログでの確認
デプロイログで以下のメッセージを確認：
```
✅ 必要な環境変数が設定されています
✅ データベース接続成功
✅ マイグレーションが完了しました
```

### アプリケーションでの確認
アプリケーション起動時に以下のログを確認：
```
🔧 ENVIRONMENT CHECK: {
  hasDatabaseUrl: true,
  hasDirectUrl: true,
  hasJwtSecret: true,
  ...
}
```

## 注意事項

1. **機密情報の保護**: パスワードやシークレットキーは安全に管理
2. **環境の分離**: 本番環境と開発環境で異なる設定を使用
3. **定期的な確認**: 環境変数が正しく動作しているか定期的に確認 