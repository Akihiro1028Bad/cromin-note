import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // APIリクエストログ
  logger.logApiRequest('GET', '/api/notes/my', {
    requestId,
    endpoint: '/api/notes/my'
  });

  try {
    // JWT_SECRETの確認
    if (!process.env.JWT_SECRET) {
      logger.logError({
        error: new Error('JWT_SECRET is not configured'),
        context: {
          requestId,
          endpoint: '/api/notes/my',
          method: 'GET'
        },
        additionalInfo: {
          hasJwtSecret: false,
          environment: process.env.NODE_ENV
        }
      });
      return NextResponse.json({ 
        success: false,
        error: 'サーバー設定エラー: JWT_SECRETが設定されていません',
        details: 'Please configure JWT_SECRET environment variable'
      }, { status: 500 });
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      logger.logError({
        error: new Error('No authorization token provided'),
        context: {
          requestId,
          endpoint: '/api/notes/my',
          method: 'GET'
        }
      });
      return NextResponse.json({ 
        success: false,
        error: '認証トークンが必要です' 
      }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      logger.logError({
        error: new Error('Invalid token'),
        context: {
          requestId,
          endpoint: '/api/notes/my',
          method: 'GET'
        },
        additionalInfo: {
          hasToken: !!token,
          tokenLength: token.length
        }
      });
      return NextResponse.json({ 
        success: false,
        error: '無効なトークンです' 
      }, { status: 401 });
    }

    // ページネーションパラメータを取得
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    logger.logDatabaseOperation('count_notes', Date.now() - startTime, {
      requestId,
      endpoint: '/api/notes/my',
      userId: user.userId
    });

    // 総件数を取得
    const totalCount = await prisma.note.count({
      where: {
        userId: user.userId
      }
    });

    // ノートを取得（ページネーション適用）
    const notes = await prisma.note.findMany({
      where: {
        userId: user.userId
      },
      include: {
        user: true,
        noteType: true,
        result: true,
        scoreSets: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // noteOpponentsを別途取得（安全な方法）
    const notesWithOpponents = await Promise.all(
      notes.map(async (note) => {
        try {
          const noteOpponents = await prisma.noteOpponent.findMany({
            where: {
              noteId: note.id,
              opponentId: { not: null } // nullでないopponent_idのみ取得
            },
            include: {
              opponent: {
                select: {
                  id: true,
                  name: true,
                  userId: true
                }
              }
            }
          });

          // さらにnullチェック（二重保険）
          const validNoteOpponents = noteOpponents.filter(no => 
            no.opponent !== null && 
            no.opponentId !== null && 
            no.opponentId.trim() !== ''
          );

          return {
            ...note,
            noteOpponents: validNoteOpponents
          };
        } catch (error) {
          console.error(`Error fetching opponents for note ${note.id}:`, error);
          return {
            ...note,
            noteOpponents: []
          };
        }
      })
    );

    const duration = Date.now() - startTime;
    
    // 成功ログ
    logger.logDatabaseOperation('fetch_notes', duration, {
      requestId,
      endpoint: '/api/notes/my',
      userId: user.userId,
      notesCount: notesWithOpponents.length,
      totalCount,
      page,
      limit
    });

    // データ構造を確認するログ
    if (notesWithOpponents.length > 0) {
      const firstNote = notesWithOpponents[0];
      logger.logApiRequest('GET', '/api/notes/my', {
        requestId,
        endpoint: '/api/notes/my',
        dataStructure: {
          hasNoteType: !!firstNote.noteType,
          hasResult: !!firstNote.result,
          hasScoreSets: !!firstNote.scoreSets,
          noteTypeName: firstNote.noteType?.name,
          resultName: firstNote.result?.name,
          scoreSetsCount: firstNote.scoreSets?.length,
          noteOpponentsCount: firstNote.noteOpponents?.length || 0
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      data: notesWithOpponents,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // 詳細なエラーログ
    logger.logError({
      error,
      context: {
        requestId,
        endpoint: '/api/notes/my',
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
        ),
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET?.length || 0
      }
    });
    
    return NextResponse.json({ 
      success: false,
      error: 'ノートの取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 