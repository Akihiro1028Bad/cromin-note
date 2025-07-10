import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// テンプレート編集
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: '認証トークンが必要です' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ success: false, message: '無効なトークンです' }, { status: 401 });

    const templateId = id;
    const body = await request.json();
    const { name, typeId, title, opponent, content, resultId, memo, condition, isPublic } = body;
    if (!name || !typeId) {
      return NextResponse.json({ success: false, message: 'テンプレート名と種別は必須です' }, { status: 400 });
    }

    // 所有者チェック
    const template = await prisma.noteTemplate.findUnique({ where: { id: templateId } });
    if (!template || template.userId !== user.userId) {
      return NextResponse.json({ success: false, message: 'テンプレートが見つからないか権限がありません' }, { status: 404 });
    }

    const updated = await prisma.noteTemplate.update({
      where: { id: templateId },
      data: {
        name,
        typeId,
        title,
        opponent,
        content,
        resultId,
        memo,
        condition,
        isPublic: !!isPublic
      }
    });
    return NextResponse.json({ success: true, template: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ success: false, message: 'テンプレート更新に失敗しました' }, { status: 500 });
  }
}

// テンプレート削除
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: '認証トークンが必要です' }, { status: 401 });
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ success: false, message: '無効なトークンです' }, { status: 401 });

    const templateId = id;
    // 所有者チェック
    const template = await prisma.noteTemplate.findUnique({ where: { id: templateId } });
    if (!template || template.userId !== user.userId) {
      return NextResponse.json({ success: false, message: 'テンプレートが見つからないか権限がありません' }, { status: 404 });
    }

    await prisma.noteTemplate.delete({ where: { id: templateId } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ success: false, message: 'テンプレート削除に失敗しました' }, { status: 500 });
  }
} 