import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// テンプレート一覧取得
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: '認証トークンが必要です' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ success: false, message: '無効なトークンです' }, { status: 401 });

    const templates = await prisma.noteTemplate.findMany({
      where: { userId: user.userId },
      include: {
        noteType: { select: { id: true, name: true } },
        result: { select: { id: true, name: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json({ success: true, templates }, { status: 200 });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ success: false, message: 'テンプレート取得に失敗しました' }, { status: 500 });
  }
}

// テンプレート新規作成
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: '認証トークンが必要です' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ success: false, message: '無効なトークンです' }, { status: 401 });

    const body = await request.json();
    const { 
      name, 
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
    } = body;
    if (!name || !typeId) {
      return NextResponse.json({ success: false, message: 'テンプレート名と種別は必須です' }, { status: 400 });
    }

    const template = await prisma.noteTemplate.create({
      data: {
        userId: user.userId,
        name,
        typeId,
        title,
        opponent,
        content,
        resultId,
        memo,
        condition,
        isPublic: !!isPublic,
        scoreData: scoreData || null,
        totalSets: totalSets ? Number(totalSets) : null,
        wonSets: wonSets ? Number(wonSets) : null,
        matchDuration: matchDuration ? Number(matchDuration) : null
      }
    });
    return NextResponse.json({ success: true, template }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ success: false, message: 'テンプレート作成に失敗しました' }, { status: 500 });
  }
} 