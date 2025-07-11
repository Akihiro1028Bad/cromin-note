#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Running migration only...');

try {
  // 環境変数の確認
  if (!process.env.DIRECT_URL) {
    console.error('❌ DIRECT_URL environment variable is required');
    process.exit(1);
  }

  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  console.log('🔄 Running database migrations with DIRECT_URL...');
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production',
      DATABASE_URL: process.env.DIRECT_URL
    }
  });

  console.log('✅ Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} 