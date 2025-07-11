import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // ノート種別の挿入
    const noteTypes = await Promise.all([
      prisma.noteType.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1, name: '練習' }
      }),
      prisma.noteType.upsert({
        where: { id: 2 },
        update: {},
        create: { id: 2, name: 'ゲーム練習' }
      }),
      prisma.noteType.upsert({
        where: { id: 3 },
        update: {},
        create: { id: 3, name: '公式試合' }
      })
    ]);

    // 試合結果の挿入
    const results = await Promise.all([
      prisma.result.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1, name: '勝ち' }
      }),
      prisma.result.upsert({
        where: { id: 2 },
        update: {},
        create: { id: 2, name: '負け' }
      }),
      prisma.result.upsert({
        where: { id: 3 },
        update: {},
        create: { id: 3, name: '引き分け' }
      }),
      prisma.result.upsert({
        where: { id: 4 },
        update: {},
        create: { id: 4, name: '練習のみ' }
      }),
      prisma.result.upsert({
        where: { id: 5 },
        update: {},
        create: { id: 5, name: '未定' }
      })
    ]);

    return NextResponse.json(
      { 
        success: true, 
        message: 'マスタデータの設定が完了しました。',
        noteTypes,
        results
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error setting up master data:', error);
    return NextResponse.json(
      { success: false, message: 'マスタデータの設定に失敗しました。' },
      { status: 500 }
    );
  }
} 