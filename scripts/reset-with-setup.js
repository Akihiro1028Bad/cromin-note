#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔄 リセット＆セットアップスクリプト開始...');

async function resetWithSetup() {
  try {
    // 1. 実行中のプロセスを停止
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

    // 5. 開発サーバーを起動
    console.log('🚀 開発サーバーを起動中...');
    
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      detached: false
    });

    // サーバー起動を待つ
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 6. マスタデータをセットアップ
    console.log('🗄️ マスタデータをセットアップ中...');
    try {
      execSync('curl -X POST http://localhost:3000/api/setup-master-data', { 
        stdio: 'inherit',
        timeout: 10000 
      });
      console.log('✅ マスタデータのセットアップが完了しました');
    } catch (error) {
      console.log('⚠️ マスタデータのセットアップに失敗しました');
      console.log('💡 手動で以下のコマンドを実行してください:');
      console.log('   curl -X POST http://localhost:3000/api/setup-master-data');
    }

    console.log('🎉 リセット＆セットアップが完了しました！');
    console.log('📝 開発サーバーが起動しています: http://localhost:3000');

  } catch (error) {
    console.error('❌ リセット＆セットアップでエラーが発生しました:', error.message);
    process.exit(1);
  }
}

resetWithSetup(); 