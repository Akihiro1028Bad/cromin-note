This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### 自動マイグレーション設定

このプロジェクトは、Vercelにデプロイする際に自動的にデータベースマイグレーションを実行するように設定されています。

#### 必要な環境変数

Vercelのダッシュボードで以下の環境変数を設定してください：

```bash
# データベース接続（接続プール用）
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.tdpnuvtkiliypyywkxsd.supabase.co:6543/postgres?pgbouncer=true&connection_limit=20&pool_timeout=30"

# データベース接続（ダイレクト接続用）
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.tdpnuvtkiliypyywkxsd.supabase.co:5432/postgres?connection_limit=5"

# 認証
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="https://your-domain.vercel.app"

# メール設定
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# アプリケーションURL
APP_URL="https://your-domain.vercel.app"
PRODUCTION_URL="https://your-domain.vercel.app"
```

#### デプロイプロセス

1. **ビルド時**: `prisma generate` と `prisma migrate deploy` が自動実行されます
2. **デプロイ後**: `/admin/deploy-status` でマイグレーション状態を確認できます
3. **ヘルスチェック**: `/api/health/db` でデータベース接続を確認できます

#### 利用可能なスクリプト

```bash
# 開発用ビルド
npm run build

# デプロイ用ビルド（マイグレーション含む）
npm run build:deploy

# マイグレーション実行
npm run db:migrate

# デプロイ用マイグレーション
npm run deploy:migrate

# データベース関連
npm run db:generate    # Prismaクライアント生成
npm run db:push        # スキーマを直接プッシュ
npm run db:reset       # データベースリセット
npm run db:studio      # Prisma Studio起動
npm run db:seed        # シードデータ投入
```

#### トラブルシューティング

- **マイグレーションエラー**: Vercelのビルドログで詳細を確認
- **接続エラー**: `DIRECT_URL` が正しく設定されているか確認
- **権限エラー**: Supabaseの接続設定を確認

#### パフォーマンス監視

- `/admin/performance` - システムパフォーマンス監視
- `/admin/deploy-status` - デプロイ状態確認
- `/api/health/db` - データベース健康状態API
