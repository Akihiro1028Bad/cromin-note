import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPrisma } from '@/lib/prismaRetry';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const results = await withPrisma(async (prisma) => {
      return await prisma.result.findMany({
        orderBy: { id: 'asc' }
      });
    });

    return NextResponse.json(
      { success: true, results },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { success: false, message: '試合結果の取得に失敗しました。' },
      { status: 500 }
    );
  }
} 