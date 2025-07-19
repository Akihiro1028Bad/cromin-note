#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESモジュールでの__dirnameの取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Vercelデプロイスクリプト開始...');

// 環境変数チェック
console.log('🔍 環境変数をチェック中...');
const requiredEnvVars = ['DATABASE_URL', 'DIRECT_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ 必要な環境変数が設定されていません:', missingEnvVars);
  console.log('💡 Vercelダッシュボードで環境変数を設定してください');
  console.log('Settings → Environment Variables');
  process.exit(1);
}

console.log('✅ 必要な環境変数が設定されています');

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
  
  // 3. データベース接続テスト
  console.log('🔗 データベース接続をテスト中...');
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ データベース接続成功');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ データベース接続失敗:', error.message);
    console.log('⚠️ マイグレーションをスキップします');
  }
  
  // 4. データベースマイグレーション実行
  console.log('🗄️ データベースマイグレーションを実行中...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ マイグレーションが完了しました');
  } catch (error) {
    console.error('❌ マイグレーションでエラーが発生しました:', error.message);
    console.log('⚠️ ビルドは続行しますが、データベースの整合性を確認してください');
  }
  
  // 5. 不正データのクリーンアップ（必要に応じて）
  console.log('🧹 不正データをクリーンアップ中...');
  try {
    execSync('npx prisma db execute --file prisma/cleanup-null-opponents.sql', { stdio: 'inherit' });
    console.log('✅ データクリーンアップが完了しました');
  } catch (error) {
    console.log('⚠️ データクリーンアップに失敗しました（初回デプロイ時は正常です）');
  }
  
  // 6. node_modules/.cacheディレクトリの削除
  const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('✅ node_modules/.cacheディレクトリを削除しました');
  }
  
  // 7. 依存関係の再インストール（必要に応じて）
  console.log('📥 依存関係を確認中...');
  execSync('npm ci --only=production', { stdio: 'inherit' });
  
  // 8. ビルド実行
  console.log('🔨 アプリケーションをビルド中...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // 9. マスタデータのセットアップ（初回デプロイ時）
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