import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: '認証トークンが必要です' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
    }

    // ページネーションパラメータを取得
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    console.log('Fetching notes for user:', user.userId, `page: ${page}, limit: ${limit}`);

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

    console.log('Found notes:', notes.length, 'of', totalCount);

    return NextResponse.json({ 
      notes,
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
    console.error('Error fetching user notes:', error);
    
    // より詳細なエラー情報を出力
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ 
      error: 'ノートの取得に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 