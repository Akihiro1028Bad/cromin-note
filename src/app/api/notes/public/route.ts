import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      where: {
        isPublic: true
      },
      include: {
        user: {
          select: {
            nickname: true
          }
        },
        noteType: true,
        result: true,
        scoreSets: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(
      { success: true, notes },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching public notes:', error);
    return NextResponse.json(
      { success: false, message: '公開ノートの取得に失敗しました。' },
      { status: 500 }
    );
  }
} 