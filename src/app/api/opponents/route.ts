import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logger.info('対戦相手一覧取得開始')

    // 認証チェック
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: '無効なトークンです。' },
        { status: 401 }
      )
    }

    // ユーザーごとの対戦相手を取得
    const opponents = await prisma.opponent.findMany({
      where: {
        userId: decoded.userId
      },
      orderBy: { name: 'asc' }
    })

    logger.info(`対戦相手: ${opponents.length}件を取得`)

    return NextResponse.json({
      opponents
    })
  } catch (error) {
    logger.error('対戦相手取得エラー:', error)
    return NextResponse.json(
      { error: '対戦相手の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { success: false, message: '認証されていません。' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: '無効なトークンです。' },
        { status: 401 }
      )
    }

    const { name } = await request.json()

    // バリデーション
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: '対戦相手名は必須です。' },
        { status: 400 }
      )
    }

    // 既存の対戦相手名との重複チェック（同じユーザー内で）
    const existingOpponent = await prisma.opponent.findUnique({
      where: {
        name_userId: {
          name: name.trim(),
          userId: decoded.userId
        }
      }
    })

    if (existingOpponent) {
      return NextResponse.json(
        { success: false, message: 'この対戦相手名は既に登録されています。' },
        { status: 400 }
      )
    }

    // 対戦相手作成
    const opponent = await prisma.opponent.create({
      data: {
        name: name.trim(),
        userId: decoded.userId
      }
    })

    logger.info(`対戦相手作成: ${opponent.name} (ID: ${opponent.id})`)

    return NextResponse.json(
      { success: true, opponent },
      { status: 201 }
    )
  } catch (error) {
    logger.error('対戦相手作成エラー:', error)
    return NextResponse.json(
      { success: false, message: '対戦相手の作成に失敗しました。' },
      { status: 500 }
    )
  }
} 