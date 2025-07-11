import { NextResponse } from 'next/server';
import { prisma, withCache } from '@/lib/prisma';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // キャッシュを使用（10分間キャッシュ）
    const types = await withCache(
      'note-types',
      async () => {
        return await prisma.noteType.findMany({
          orderBy: { id: 'asc' }
        });
      },
      10 * 60 * 1000 // 10分
    );

    return NextResponse.json(
      { success: true, types },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching note types:', error);
    return NextResponse.json(
      { success: false, message: 'ノート種別の取得に失敗しました。' },
      { status: 500 }
    );
  }
} 