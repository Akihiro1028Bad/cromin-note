import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const types = await prisma.noteType.findMany({
      orderBy: { id: 'asc' }
    });

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