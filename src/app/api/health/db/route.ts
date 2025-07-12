import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // 環境変数チェック
  logger.logEnvironmentCheck();
  
  // APIリクエストログ
  logger.logApiRequest('GET', '/api/health/db', {
    requestId,
    endpoint: '/api/health/db'
  });

  try {
    // データベース接続テスト
    await prisma.$queryRaw`SELECT 1`;
    
    const duration = Date.now() - startTime;
    
    // 成功ログ
    logger.logDatabaseOperation('health_check', duration, {
      requestId,
      endpoint: '/api/health/db',
      success: true
    });

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      isVercel: !!process.env.VERCEL
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // 詳細なエラーログ
    logger.logError({
      error,
      context: {
        requestId,
        endpoint: '/api/health/db',
        method: 'GET',
        duration: `${duration}ms`
      },
      additionalInfo: {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        isPrismaError: error instanceof Error && error.message.includes('prisma'),
        isConnectionError: error instanceof Error && (
          error.message.includes('connection') || 
          error.message.includes('timeout') ||
          error.message.includes('ECONNREFUSED')
        )
      }
    });

    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      isVercel: !!process.env.VERCEL
    }, { status: 503 });
  }
} 