#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 リセット＆セットアップスクリプト開始...');

try {
  // 1. 実行中のプロセスを停止
  console.log('🛑 実行中のプロセスを停止中...');
  try {
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
  
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ .nextディレクトリを削除しました');
  }
  
  const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('✅ node_modules/.cacheディレクトリを削除しました');
  }
  
  // 4. 依存関係の再インストール
  console.log('📥 依存関係を再インストール中...');
  execSync('npm install', { stdio: 'inherit' });
  
  // 5. 開発サーバーを起動
  console.log('🚀 開発サーバーを起動中...');
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });
  
  // サーバーの起動を待つ
  let serverReady = false;
  let setupAttempted = false;
  
  devProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output.trim());
    
    // サーバーが起動したことを検知
    if (output.includes('Ready') && !serverReady) {
      serverReady = true;
      console.log('✅ サーバーが起動しました');
      
      // 少し待ってからマスタデータをセットアップ
      setTimeout(() => {
        if (!setupAttempted) {
          setupAttempted = true;
          console.log('🗄️ マスタデータをセットアップ中...');
          
          try {
            execSync('curl -X POST http://localhost:3000/api/setup-master-data', {
              stdio: 'inherit',
              timeout: 15000
            });
            console.log('✅ マスタデータのセットアップが完了しました');
          } catch (error) {
            console.log('⚠️ マスタデータのセットアップに失敗しました');
            console.log('📝 手動で実行してください: curl -X POST http://localhost:3000/api/setup-master-data');
          }
        }
      }, 3000); // 3秒待つ
    }
  });
  
  devProcess.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  
  devProcess.on('close', (code) => {
    console.log(`開発サーバーが終了しました (コード: ${code})`);
  });
  
  // プロセスが終了した場合の処理
  process.on('SIGINT', () => {
    console.log('\n🛑 プロセスを終了中...');
    devProcess.kill('SIGINT');
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ スクリプトでエラーが発生しました:', error.message);
  process.exit(1);
} 