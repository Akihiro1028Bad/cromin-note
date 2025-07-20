import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // APIリクエストログ
  logger.logApiRequest('POST', '/api/notes', {
    requestId,
    endpoint: '/api/notes'
  });

  try {
    // 認証チェック
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      logger.logError({
        error: new Error('No authorization token provided'),
        context: {
          requestId,
          endpoint: '/api/notes',
          method: 'POST'
        }
      });
      return NextResponse.json(
        { success: false, message: '認証されていません。' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      logger.logError({
        error: new Error('Invalid token'),
        context: {
          requestId,
          endpoint: '/api/notes',
          method: 'POST'
        },
        additionalInfo: {
          hasToken: !!token,
          tokenLength: token.length
        }
      });
      return NextResponse.json(
        { success: false, message: '無効なトークンです。' },
        { status: 401 }
      );
    }

    const requestBody = await request.json();
    
    // リクエストボディの検証
    const {
      typeId,
      title,
      content,
      resultId,
      categoryId,
      memo,
      condition,
      isPublic,
      scoreData,
      totalSets,
      wonSets,
      matchDuration,
      opponentIds
    } = requestBody;

    // 必須フィールドの検証
    if (!typeId || !title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: '種別とタイトルは必須です。' },
        { status: 400 }
      );
    }

    // スコアデータをパース
    let scoreSets = [];
    let calculatedResultId = resultId;
    if (scoreData) {
      try {
        const parsedScoreData = JSON.parse(scoreData);
        if (Array.isArray(parsedScoreData)) {
          scoreSets = parsedScoreData.map((set: any, index: number) => ({
            setNumber: set.setNumber || index + 1,
            myScore: Number(set.myScore) || 0,
            opponentScore: Number(set.opponentScore) || 0
          }));
          
          // スコアから結果を自動計算
          if (scoreSets.length > 0) {
            const wonSets = scoreSets.filter((set: any) => set.myScore > set.opponentScore).length;
            const totalSets = scoreSets.length;
            
            if (wonSets > totalSets / 2) {
              // 勝ち
              calculatedResultId = 1; // 勝ちのID（実際のDBのIDに合わせて調整）
            } else if (wonSets < totalSets / 2) {
              // 負け
              calculatedResultId = 2; // 負けのID（実際のDBのIDに合わせて調整）
            } else {
              // 引き分け
              calculatedResultId = 3; // 引き分けのID（実際のDBのIDに合わせて調整）
            }
          }
        }
      } catch (error) {
        console.error('Score data parsing error:', error);
        return NextResponse.json(
          { success: false, message: 'スコアデータの形式が正しくありません。' },
          { status: 400 }
        );
      }
    }

    // トランザクション処理で一括作成
    const result = await prisma.$transaction(async (tx) => {
      // ノート作成
      const note = await tx.note.create({
        data: {
          userId: decoded.userId,
          typeId: Number(typeId),
          title: title.trim(),
          content: content || null,
          resultId: calculatedResultId ? Number(calculatedResultId) : null,
          categoryId: categoryId ? Number(categoryId) : null,
          memo: memo || null,
          condition: condition || null,
          isPublic: Boolean(isPublic),
          totalSets: totalSets ? Number(totalSets) : null,
          wonSets: wonSets ? Number(wonSets) : null,
          matchDuration: matchDuration ? Number(matchDuration) : null,
          scoreSets: {
            create: scoreSets
          }
        },
        include: {
          scoreSets: true
        }
      });

      // 対戦相手の紐付け（note_opponents中間テーブル）
      if (Array.isArray(opponentIds) && opponentIds.length > 0) {
        // 対戦相手IDの存在確認
        const validOpponentIds = opponentIds.filter(id => id && typeof id === 'string');
        
        if (validOpponentIds.length > 0) {
          // 実際にデータベースに存在する対戦相手IDのみを取得
          const existingOpponents = await tx.opponent.findMany({
            where: {
              id: { in: validOpponentIds },
              userId: decoded.userId // 自分の対戦相手のみ
            },
            select: { id: true }
          });
          
          const existingOpponentIds = existingOpponents.map(o => o.id);
          
          if (existingOpponentIds.length > 0) {
            await tx.noteOpponent.createMany({
              data: existingOpponentIds.map((opponentId: string) => ({
                noteId: note.id,
                opponentId
              }))
            });
          }
          
          // 存在しないIDがあった場合はログに記録
          const nonExistentIds = validOpponentIds.filter(id => !existingOpponentIds.includes(id));
          if (nonExistentIds.length > 0) {
            logger.warn('Non-existent opponent IDs found', {
              requestId,
              endpoint: '/api/notes',
              nonExistentIds,
              userId: decoded.userId
            });
          }
        }
      }

      return note;
    });

    // 作成後のノートを取得（関連データ含む）
    const noteWithOpponents = await prisma.note.findUnique({
      where: { id: result.id },
      include: {
        scoreSets: {
          orderBy: {
            setNumber: 'asc'
          }
        },
        noteOpponents: {
          include: {
            opponent: true
          }
        }
      }
    });

    const duration = Date.now() - startTime;
    // 成功ログ
    logger.logDatabaseOperation('create_note', duration, {
      requestId,
      endpoint: '/api/notes',
      noteId: result.id,
      userId: decoded.userId,
      scoreSetsCount: scoreSets.length,
      opponentIdsCount: Array.isArray(opponentIds) ? opponentIds.length : 0
    });

    return NextResponse.json(
      { success: true, note: noteWithOpponents },
      { status: 201 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // 詳細なエラーログ
    logger.logError({
      error,
      context: {
        requestId,
        endpoint: '/api/notes',
        method: 'POST',
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
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });
    
    // より具体的なエラーメッセージ
    let errorMessage = 'ノートの作成に失敗しました。';
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'データの重複が発生しました。';
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = '関連データが見つかりません。';
      } else if (error.message.includes('connection') || error.message.includes('timeout')) {
        errorMessage = 'データベース接続エラーが発生しました。';
      }
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
} 