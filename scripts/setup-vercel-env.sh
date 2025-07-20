#!/bin/bash

echo "🚀 Vercel環境変数設定スクリプト"

# 環境変数の設定
echo "📝 環境変数を設定中..."

# データベース接続
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production

# JWT認証
vercel env add JWT_SECRET production

# 環境設定
vercel env add NODE_ENV production

# メール設定（必要に応じて）
vercel env add GMAIL_USER production
vercel env add GMAIL_APP_PASSWORD production

echo "✅ 環境変数の設定が完了しました"
echo ""
echo "📋 設定された環境変数:"
echo "- DATABASE_URL"
echo "- DIRECT_URL" 
echo "- JWT_SECRET"
echo "- NODE_ENV"
echo "- GMAIL_USER"
echo "- GMAIL_APP_PASSWORD"
echo ""
echo "🔍 確認方法:"
echo "vercel env ls" 