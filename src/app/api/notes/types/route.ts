import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logger.info('ノートタイプと結果のマスターデータ取得開始')

    // NoteTypeとResultのマスターデータを取得
    const [noteTypes, results, categories] = await Promise.all([
      prisma.noteType.findMany({
        orderBy: { id: 'asc' }
      }),
      prisma.result.findMany({
        orderBy: { id: 'asc' }
      }),
      prisma.category.findMany({
        orderBy: { id: 'asc' }
      })
    ])

    logger.info(`ノートタイプ: ${noteTypes.length}件, 結果: ${results.length}件, カテゴリ: ${categories.length}件を取得`)

    return NextResponse.json({
      noteTypes,
      results,
      categories
    })
  } catch (error) {
    logger.error('マスターデータ取得エラー:', error)
    return NextResponse.json(
      { error: 'マスターデータの取得に失敗しました' },
      { status: 500 }
    )
  }
} 