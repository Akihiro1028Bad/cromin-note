import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // データベース接続テスト
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    // 基本的な統計情報を取得
    const [userCount, noteCount, publicNoteCount] = await Promise.all([
      prisma.user.count(),
      prisma.note.count(),
      prisma.note.count({ where: { isPublic: true } })
    ]);
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${responseTime}ms`,
        metrics: {
          totalUsers: userCount,
          totalNotes: noteCount,
          publicNotes: publicNoteCount
        }
      },
      recommendations: {
        // パフォーマンス推奨事項
        ...(responseTime > 1000 && { 
          warning: 'Database response time is slow. Consider optimizing queries.' 
        }),
        ...(userCount > 500 && { 
          info: 'User count is high. Consider implementing caching for frequently accessed data.' 
        }),
        ...(noteCount > 10000 && { 
          info: 'Note count is high. Consider implementing pagination and archiving.' 
        })
      }
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 503 });
  }
} 