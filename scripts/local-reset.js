#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔄 ローカル環境リセットスクリプト開始...');

try {
  // 1. プロセスを停止
  console.log('🛑 実行中のプロセスを停止中...');
  try {
    execSync('pkill -f "next dev"', { stdio: 'ignore' });
    console.log('✅ Next.jsプロセスを停止しました');
  } catch (error) {
    console.log('ℹ️ 実行中のNext.jsプロセスはありませんでした');
  }

  // 2. キャッシュをクリア
  console.log('🧹 キャッシュをクリア中...');
  
  // .nextディレクトリの削除
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ .nextディレクトリを削除しました');
  }
  
  // node_modules/.cacheディレクトリの削除
  const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('✅ node_modules/.cacheディレクトリを削除しました');
  }

  // 3. Prismaクライアントを再生成
  console.log('📦 Prismaクライアントを再生成中...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prismaクライアントを再生成しました');

  // 4. 依存関係を再インストール
  console.log('📥 依存関係を再インストール中...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ 依存関係を再インストールしました');

  console.log('🎉 ローカル環境リセットが完了しました！');
  console.log('💡 次のコマンドで開発サーバーを起動してください:');
  console.log('   npm run dev');

} catch (error) {
  console.error('❌ リセットスクリプトでエラーが発生しました:', error.message);
  process.exit(1);
} 