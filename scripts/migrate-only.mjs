#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🔄 マイグレーション実行スクリプト開始...');

try {
  // Prismaクライアントの生成
  console.log('📦 Prismaクライアントを生成中...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // マイグレーションの実行
  console.log('🗄️ マイグレーションを実行中...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('✅ マイグレーションが完了しました！');

} catch (error) {
  console.error('❌ マイグレーションでエラーが発生しました:', error.message);
  process.exit(1);
} 