import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// ノート取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        noteType: true,
        result: true,
        scoreSets: {
          orderBy: {
            setNumber: 'asc'
          }
        },
        user: {
          select: {
            id: true,
            nickname: true
          }
        },
        noteOpponents: {
          include: {
            opponent: true
          }
        }
      }
    });

    if (!note) {
      return NextResponse.json(
        { success: false, message: 'ノートが見つかりません。' },
        { status: 404 }
      );
    }

    // scoreSetsからscoreDataを生成
    const scoreData = note.scoreSets.map((set: any) => ({
      setNumber: set.setNumber,
      myScore: set.myScore,
      opponentScore: set.opponentScore
    }));

    // レスポンス用のノートオブジェクトを作成
    const noteWithScoreData = {
      ...note,
      scoreData: JSON.stringify(scoreData)
    };

    return NextResponse.json(
      { success: true, note: noteWithScoreData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { success: false, message: 'ノートの取得に失敗しました。' },
      { status: 500 }
    );
  }
}

// ノート更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // APIリクエストログ
  logger.logApiRequest('PUT', `/api/notes/${id}`, {
    requestId,
    endpoint: `/api/notes/${id}`,
    noteId: id
  });

  try {
    // 認証チェック
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      logger.logError({
        error: new Error('No authorization token provided'),
        context: {
          requestId,
          endpoint: `/api/notes/${id}`,
          method: 'PUT'
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
          endpoint: `/api/notes/${id}`,
          method: 'PUT'
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

    // ノートの所有者チェック
    const existingNote = await prisma.note.findUnique({
      where: { id }
    });

    if (!existingNote) {
      logger.logError({
        error: new Error('Note not found'),
        context: {
          requestId,
          endpoint: `/api/notes/${id}`,
          method: 'PUT'
        },
        additionalInfo: {
          noteId: id,
          userId: decoded.userId
        }
      });
      return NextResponse.json(
        { success: false, message: 'ノートが見つかりません。' },
        { status: 404 }
      );
    }

    if (existingNote.userId !== decoded.userId) {
      logger.logError({
        error: new Error('Permission denied'),
        context: {
          requestId,
          endpoint: `/api/notes/${id}`,
          method: 'PUT'
        },
        additionalInfo: {
          noteId: id,
          noteUserId: existingNote.userId,
          requestUserId: decoded.userId
        }
      });
      return NextResponse.json(
        { success: false, message: 'このノートを編集する権限がありません。' },
        { status: 403 }
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
    if (scoreData) {
      try {
        const parsedScoreData = JSON.parse(scoreData);
        if (Array.isArray(parsedScoreData)) {
          scoreSets = parsedScoreData.map((set: any, index: number) => ({
            setNumber: set.setNumber || index + 1,
            myScore: Number(set.myScore) || 0,
            opponentScore: Number(set.opponentScore) || 0
          }));
        }
      } catch (error) {
        console.error('Score data parsing error:', error);
        return NextResponse.json(
          { success: false, message: 'スコアデータの形式が正しくありません。' },
          { status: 400 }
        );
      }
    }

    // トランザクション処理で一括更新
    const result = await prisma.$transaction(async (tx) => {
      // 既存のscoreSetsを削除
      await tx.scoreSet.deleteMany({
        where: { noteId: id }
      });

      // 既存のnote_opponentsを削除
      await tx.noteOpponent.deleteMany({
        where: { noteId: id }
      });

      // ノート更新
      const note = await tx.note.update({
        where: { id },
        data: {
          typeId: Number(typeId),
          title: title.trim(),
          content: content || null,
          resultId: resultId ? Number(resultId) : null,
          categoryId: categoryId ? Number(categoryId) : null,
          memo: memo || null,
          condition: condition || null,
          isPublic: Boolean(isPublic),
          totalSets: totalSets ? Number(totalSets) : null,
          wonSets: wonSets ? Number(wonSets) : null,
          matchDuration: matchDuration ? Number(matchDuration) : null,
          updatedAt: new Date(),
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
              endpoint: `/api/notes/${id}`,
              nonExistentIds,
              userId: decoded.userId
            });
          }
        }
      }

      return note;
    });

    // 更新後のノートを取得（関連データ含む）
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
    logger.logDatabaseOperation('update_note', duration, {
      requestId,
      endpoint: `/api/notes/${id}`,
      noteId: id,
      userId: decoded.userId,
      scoreSetsCount: scoreSets.length,
      opponentIdsCount: Array.isArray(opponentIds) ? opponentIds.length : 0
    });

    return NextResponse.json(
      { success: true, note: noteWithOpponents },
      { status: 200 }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // 詳細なエラーログ
    logger.logError({
      error,
      context: {
        requestId,
        endpoint: `/api/notes/${id}`,
        method: 'PUT',
        duration: `${duration}ms`
      },
      additionalInfo: {
        noteId: id,
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
    let errorMessage = 'ノートの更新に失敗しました。';
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

// ノート削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // 認証チェック
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: '認証されていません。' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: '無効なトークンです。' },
        { status: 401 }
      );
    }

    // ノートの所有者チェック
    const existingNote = await prisma.note.findUnique({
      where: { id }
    });

    if (!existingNote) {
      return NextResponse.json(
        { success: false, message: 'ノートが見つかりません。' },
        { status: 404 }
      );
    }

    if (existingNote.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'このノートを削除する権限がありません。' },
        { status: 403 }
      );
    }

    // ノート削除
    await prisma.note.delete({
      where: { id }
    });

    return NextResponse.json(
      { success: true, message: 'ノートを削除しました。' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { success: false, message: 'ノートの削除に失敗しました。' },
      { status: 500 }
    );
  }
} 