#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Vercelデプロイスクリプト開始...');

try {
  // 1. キャッシュクリア（最初に実行）
  console.log('🧹 キャッシュをクリア中...');
  
  // .nextディレクトリの削除
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ .nextディレクトリを削除しました');
  }
  
  // 2. Prismaクライアントの再生成
  console.log('📦 Prismaクライアントを再生成中...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // node_modules/.cacheディレクトリの削除
  const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('✅ node_modules/.cacheディレクトリを削除しました');
  }
  
  // 3. 依存関係の再インストール（必要に応じて）
  console.log('📥 依存関係を確認中...');
  execSync('npm ci --only=production', { stdio: 'inherit' });
  
  // 4. ビルド実行
  console.log('🔨 アプリケーションをビルド中...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 5. マスタデータのセットアップ（初回デプロイ時）
  console.log('🗄️ マスタデータをセットアップ中...');
  try {
    execSync('curl -X POST https://your-app.vercel.app/api/setup-master-data', { 
      stdio: 'inherit',
      timeout: 30000 
    });
    console.log('✅ マスタデータのセットアップが完了しました');
  } catch (error) {
    console.log('⚠️ マスタデータのセットアップに失敗しました（初回デプロイ時は正常です）');
  }
  
  console.log('🎉 Vercelデプロイスクリプトが完了しました！');
  
} catch (error) {
  console.error('❌ デプロイスクリプトでエラーが発生しました:', error.message);
  process.exit(1);
} 