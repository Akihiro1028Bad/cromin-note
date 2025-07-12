#!/bin/bash

echo "🔄 クイックリセット開始..."

# 実行中のプロセスを停止
echo "🛑 プロセスを停止中..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true

# Prismaクライアント再生成
echo "📦 Prismaクライアントを再生成中..."
npx prisma generate

# キャッシュクリア
echo "🧹 キャッシュをクリア中..."
rm -rf .next
rm -rf node_modules/.cache

# 開発サーバー起動
echo "🚀 開発サーバーを起動中..."
echo "📝 サーバーが起動したら、以下のコマンドでマスタデータをセットアップしてください:"
echo "   curl -X POST http://localhost:3000/api/setup-master-data"
echo ""
npm run dev 