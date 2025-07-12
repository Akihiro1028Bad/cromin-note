# Prisma設定とデプロイ手順

## �� 修正完了: TurboPack対策（最終版）

### 根本原因の解決
- **問題**: `prepared statement "s4" already exists` エラー
- **原因**: TurboPack（Next.js App Router）とPrismaClientの再初期化
- **解決策**: PrismaClientをシンプルな構成に変更 + 再接続制御 + 強力なエラーハンドリング

### 📁 新しいファイル構成
```
src/lib/
├── prisma.ts          # PrismaClientのみ（シンプル・安全）
├── prismaCache.ts     # キャッシュ機能
├── prismaRetry.ts     # リトライ機能（改善版）
├── prismaHealth.ts    # ヘルスチェック機能（改善版）
└── prismaReset.ts     # 強制リセット機能（新規）
```

### 🔧 環境変数設定（重要）

#### ローカル開発環境
`.env.local`ファイルを作成して以下を追加：

```bash
# TurboPack対策: prepared statement重複エラー回避
PRISMA_EXPERIMENTAL_POSTGRESQL_NO_PREPARED_STATEMENTS=true

# 既存の環境変数
DATABASE_URL=your_database_url_here
GMAIL_USER=your_gmail_user_here
GMAIL_APP_PASSWORD=your_gmail_app_password_here
```

#### Vercel本番環境
Vercelのダッシュボードで以下を設定：

```bash
PRISMA_EXPERIMENTAL_POSTGRESQL_NO_PREPARED_STATEMENTS=true
```

### 🎯 最終的な修正内容

#### 1. prisma.ts（安全な初期化）
```typescript
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// TurboPack対策: より安全な初期化パターン
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

// グローバル変数でのシングルトン管理
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };
```

#### 2. APIルートの保護
- **results/route.ts**: `withPrisma`で保護
- **types/route.ts**: `withPrisma` + `withCache`で保護

#### 3. prismaHealth.ts（改善版）
- **ヘルスチェック頻度**: 1分間隔 → 5分間隔
- **自動再接続**: 無効化（手動のみ）
- **prepared statement生成**: 最小限に抑制

#### 4. prismaRetry.ts（改善版）
- **再接続クールダウン**: 1分間の制限
- **リトライ回数**: 5回 → 3回に削減
- **バックオフ間隔**: より短縮

#### 5. prismaReset.ts（新規）
- **強制リセット機能**: `resetPrismaClient()`
- **強制再接続機能**: `forceReconnect()`

### 🚀 デプロイ手順

#### 1. ローカル環境
```bash
# 環境変数設定
echo "PRISMA_EXPERIMENTAL_POSTGRESQL_NO_PREPARED_STATEMENTS=true" >> .env.local

# Prismaクライアント再生成
npx prisma generate

# 開発サーバー起動
npm run dev
```

#### 2. Vercel本番環境
```bash
# デプロイ
vercel --prod

# 環境変数設定（Vercelダッシュボード）
PRISMA_EXPERIMENTAL_POSTGRESQL_NO_PREPARED_STATEMENTS=true
```

### 🔍 動作確認

#### 1. ローカルテスト
```bash
# 開発サーバー起動
npm run dev

# エラーログ確認
# prepared statement重複エラーが発生しないことを確認
```

#### 2. APIテスト
```bash
# ヘルスチェック
curl http://localhost:3000/api/health/db

# ノート一覧取得
curl http://localhost:3000/api/notes/public

# 結果一覧取得
curl http://localhost:3000/api/notes/results

# 種別一覧取得
curl http://localhost:3000/api/notes/types
```

### 🛠️ トラブルシューティング

#### 1. 環境変数が反映されない場合
```bash
# 開発サーバー再起動
npm run dev
```

#### 2. まだエラーが発生する場合
```bash
# Prismaクライアント再生成
npx prisma generate

# 開発サーバー再起動
npm run dev
```

#### 3. 強制リセットが必要な場合
```typescript
import { resetPrismaClient, forceReconnect } from '@/lib/prismaReset';

// 強制リセット
await resetPrismaClient();

// 強制再接続
await forceReconnect();
```

#### 4. 本番環境での問題
```bash
# Vercel環境変数確認
vercel env ls

# 必要に応じて再設定
vercel env add PRISMA_EXPERIMENTAL_POSTGRESQL_NO_PREPARED_STATEMENTS
```

### 📊 期待される効果

#### ✅ 解決される問題
- `prepared statement "sX" already exists` エラー
- TurboPackによるPrismaClient再初期化
- 接続プールの重複作成
- 過度な再接続によるprepared statement蓄積
- APIルートでの接続エラー

#### ✅ 改善される点
- 開発環境での安定性向上
- ホットリロード時のエラー回避
- 本番環境でのパフォーマンス向上
- 再接続頻度の適切な制御
- 強制リセット機能による緊急時の対応

### 📝 注意事項

1. **環境変数必須**: `PRISMA_EXPERIMENTAL_POSTGRESQL_NO_PREPARED_STATEMENTS=true`は必須
2. **開発サーバー再起動**: 環境変数変更後は必ず再起動
3. **本番環境**: Vercelダッシュボードでの環境変数設定を忘れずに
4. **再接続制御**: 1分間のクールダウン期間を設けてprepared statement蓄積を防止
5. **強制リセット**: 緊急時のみ使用（通常は自動リトライで対応）

### 🎉 完了

これで`prepared statement`重複エラーの根本解決が完了しました！ 