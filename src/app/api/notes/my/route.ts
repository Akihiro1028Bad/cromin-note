import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    console.log('Fetching notes for user:', user.userId);

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
      }
    });

    console.log('Found notes:', notes.length);

    return NextResponse.json({ notes });
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