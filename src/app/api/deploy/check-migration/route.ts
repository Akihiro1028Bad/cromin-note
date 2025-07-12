import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // データベース接続テスト
    await prisma.$queryRawUnsafe('SELECT 1');
    
    // マイグレーション履歴を取得
    const migrations = await prisma.$queryRawUnsafe(`
      SELECT 
        version,
        checksum,
        execution_time,
        applied_at
      FROM _prisma_migrations 
      ORDER BY applied_at DESC
    `);
    
    // テーブル構造の確認
    const tables = await prisma.$queryRawUnsafe(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'cromin_%'
      ORDER BY table_name, ordinal_position
    `);
    
    // 基本的な統計情報
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.note.count(),
      prisma.noteType.count(),
      prisma.result.count()
    ]);
    
    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        migrations: migrations,
        tables: tables,
        stats: {
          users: stats[0],
          notes: stats[1],
          noteTypes: stats[2],
          results: stats[3]
        }
      },
      deployment: {
        environment: process.env.NODE_ENV,
        prismaVersion: process.env.PRISMA_VERSION || '5.15.0',
        nodeVersion: process.version
      }
    });
    
  } catch (error) {
    console.error('Migration check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      }
    }, { status: 500 });
  }
} 