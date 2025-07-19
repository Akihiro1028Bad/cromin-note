#!/usr/bin/env node

console.log('🔍 Vercel環境変数チェックスクリプト');
console.log('=====================================');

// 環境変数の確認
const envVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV
};

console.log('📋 環境変数の状況:');
Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅ 設定済み' : '❌ 未設定';
  const displayValue = key.includes('SECRET') || key.includes('URL') 
    ? (value ? `${value.substring(0, 20)}...` : '未設定')
    : value || '未設定';
  
  console.log(`${key}: ${status} - ${displayValue}`);
});

// データベース接続テスト
console.log('\n🗄️ データベース接続テスト:');
if (process.env.DATABASE_URL) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  prisma.$connect()
    .then(() => {
      console.log('✅ データベース接続成功');
      return prisma.$disconnect();
    })
    .catch((error) => {
      console.error('❌ データベース接続失敗:', error.message);
      console.log('💡 解決方法:');
      console.log('1. Vercelダッシュボードで環境変数を確認');
      console.log('2. Supabaseの接続設定を確認');
      console.log('3. ネットワーク接続を確認');
    });
} else {
  console.log('❌ DATABASE_URLが設定されていません');
}

console.log('\n📝 推奨設定:');
console.log('Vercelダッシュボード → Settings → Environment Variables');
console.log('- DATABASE_URL: postgresql://...');
console.log('- DIRECT_URL: postgresql://...');
console.log('- JWT_SECRET: your-secret-key');
console.log('- NODE_ENV: production'); 