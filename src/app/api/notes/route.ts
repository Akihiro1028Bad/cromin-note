import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    const { 
      typeId, 
      title, 
      opponent, 
      content, 
      resultId, 
      memo, 
      condition, 
      isPublic,
      scoreData,
      totalSets,
      wonSets,
      matchDuration
    } = await request.json();

    // バリデーション
    if (!typeId) {
      return NextResponse.json(
        { success: false, message: 'ノート種別は必須です。' },
        { status: 400 }
      );
    }

    // スコアデータをパース
    let scoreSets = [];
    if (scoreData) {
      try {
        const parsedScoreData = JSON.parse(scoreData);
        scoreSets = parsedScoreData.map((set: any, index: number) => ({
          setNumber: set.setNumber || index + 1,
          myScore: set.myScore,
          opponentScore: set.opponentScore
        }));
      } catch (error) {
        console.error('Score data parsing error:', error);
      }
    }

    // ノート作成
    const note = await prisma.note.create({
      data: {
        userId: decoded.userId,
        typeId: Number(typeId),
        title: title || null,
        opponent: opponent || null,
        content: content || null,
        resultId: resultId ? Number(resultId) : null,
        memo: memo || null,
        condition: condition || null,
        isPublic: isPublic || false,
        totalSets: totalSets ? Number(totalSets) : null,
        wonSets: wonSets ? Number(wonSets) : null,
        matchDuration: matchDuration ? Number(matchDuration) : null,
        scoreSets: {
          create: scoreSets
        }
      },
      include: {
        scoreSets: true
      }
    });

    return NextResponse.json(
      { success: true, note },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { success: false, message: 'ノートの作成に失敗しました。' },
      { status: 500 }
    );
  }
} 