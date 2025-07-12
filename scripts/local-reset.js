#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 ローカル環境リセットスクリプト開始...');

try {
  // 1. 実行中のプロセスを停止
  console.log('🛑 実行中のプロセスを停止中...');
  try {
    // npm run dev や npm start のプロセスを停止
    execSync('pkill -f "next dev"', { stdio: 'ignore' });
    execSync('pkill -f "next start"', { stdio: 'ignore' });
    console.log('✅ 実行中のプロセスを停止しました');
  } catch (error) {
    console.log('ℹ️ 停止するプロセスが見つかりませんでした');
  }
  
  // 2. Prismaクライアントの再生成
  console.log('📦 Prismaクライアントを再生成中...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 3. キャッシュクリア
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
  
  // 4. 依存関係の再インストール
  console.log('📥 依存関係を再インストール中...');
  execSync('npm install', { stdio: 'inherit' });
  
  // 5. 開発サーバーの起動
  console.log('🚀 開発サーバーを起動中...');
  console.log('📝 サーバーが起動したら、以下のコマンドでマスタデータをセットアップしてください:');
  console.log('   curl -X POST http://localhost:3000/api/setup-master-data');
  console.log('');
  console.log('📝 以下のコマンドでサーバーを起動してください:');
  console.log('   npm run dev');
  
  console.log('🎉 ローカル環境リセットが完了しました！');
  
} catch (error) {
  console.error('❌ リセットスクリプトでエラーが発生しました:', error.message);
  process.exit(1);
} 