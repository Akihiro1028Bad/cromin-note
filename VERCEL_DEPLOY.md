# Vercelデプロイ設定

## 自動実行される処理

Vercelデプロイ時に以下の処理が自動実行されます：

1. **Prismaクライアントの再生成** (`npx prisma generate`)
2. **キャッシュクリア** (`.next`ディレクトリの削除)
3. **依存関係の再インストール** (`npm ci --only=production`)
4. **アプリケーションのビルド** (`npm run build`)
5. **マスタデータのセットアップ** (初回デプロイ時)

## 必要な環境変数

Vercelのダッシュボードで以下の環境変数を設定してください：

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
JWT_SECRET="your-jwt-secret-key"

# Email (Gmail)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

# Environment
NODE_ENV="production"

# Prisma
PRISMA_GENERATE_DATAPROXY="true"
```

## デプロイ手順

1. **GitHubにプッシュ**
   ```bash
   git add .
   git commit -m "Update Vercel deployment settings"
   git push origin main
   ```

2. **Vercelでデプロイ**
   - Vercelダッシュボードでプロジェクトを選択
   - 環境変数を設定
   - デプロイを実行

3. **デプロイ後の確認**
   - アプリケーションが正常に動作するか確認
   - マスタデータが正しく設定されているか確認

## トラブルシューティング

### Prisma接続エラー
- 環境変数`DATABASE_URL`が正しく設定されているか確認
- データベースがVercelからアクセス可能か確認

### マスタデータエラー
- 初回デプロイ後、手動でマスタデータをセットアップ：
  ```bash
  curl -X POST https://your-app.vercel.app/api/setup-master-data
  ```

### ビルドエラー
- Node.jsバージョンが18以上であることを確認
- 依存関係が正しくインストールされているか確認

## 注意事項

- サーバーレス環境では接続プールの設定が異なります
- 本番環境では接続数とタイムアウトを調整しています
- 初回デプロイ時はマスタデータのセットアップが必要です 