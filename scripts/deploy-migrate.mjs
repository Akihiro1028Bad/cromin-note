#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting deployment migration...');

// 環境変数の確認
const requiredEnvVars = ['DATABASE_URL', 'DIRECT_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

// デバッグ情報の出力（パスワードは隠す）
console.log('🔍 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DIRECT_URL exists:', !!process.env.DIRECT_URL);

if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL format:', dbUrl.replace(/:[^:@]*@/, ':****@'));
}

if (process.env.DIRECT_URL) {
  const directUrl = process.env.DIRECT_URL;
  console.log('DIRECT_URL format:', directUrl.replace(/:[^:@]*@/, ':****@'));
}

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please set these variables in Vercel dashboard');
  process.exit(1);
}

try {
  // Prismaクライアントの生成
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // マイグレーションの実行
  console.log('🔄 Running database migrations...');
  console.log('Using DIRECT_URL for migrations...');
  
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production',
      DATABASE_URL: process.env.DIRECT_URL // マイグレーション時はDIRECT_URLを使用
    }
  });

  console.log('✅ Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  
  // エラーログの詳細出力
  if (error.stdout) {
    console.error('STDOUT:', error.stdout.toString());
  }
  if (error.stderr) {
    console.error('STDERR:', error.stderr.toString());
  }
  
  // 接続テストを試行
  console.log('🔍 Testing database connection...');
  try {
    execSync('npx prisma db execute --stdin <<< "SELECT 1"', {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DIRECT_URL
      }
    });
  } catch (testError) {
    console.error('❌ Database connection test failed');
    console.error('This suggests a network or configuration issue');
  }
  
  process.exit(1);
} 