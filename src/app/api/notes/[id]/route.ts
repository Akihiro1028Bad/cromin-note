import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ノート取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        noteType: true,
        result: true,
        user: {
          select: {
            id: true,
            nickname: true
          }
        }
      }
    });

    if (!note) {
      return NextResponse.json(
        { success: false, message: 'ノートが見つかりません。' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, note },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { success: false, message: 'ノートの取得に失敗しました。' },
      { status: 500 }
    );
  }
}

// ノート更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // ノートの所有者チェック
    const existingNote = await prisma.note.findUnique({
      where: { id: params.id }
    });

    if (!existingNote) {
      return NextResponse.json(
        { success: false, message: 'ノートが見つかりません。' },
        { status: 404 }
      );
    }

    if (existingNote.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'このノートを編集する権限がありません。' },
        { status: 403 }
      );
    }

    const { typeId, title, opponent, content, resultId, memo, condition, isPublic } = await request.json();

    // ノート更新
    const note = await prisma.note.update({
      where: { id: params.id },
      data: {
        typeId: Number(typeId),
        title: title || null,
        opponent: opponent || null,
        content: content || null,
        resultId: resultId ? Number(resultId) : null,
        memo: memo || null,
        condition: condition || null,
        isPublic: isPublic || false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(
      { success: true, note },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { success: false, message: 'ノートの更新に失敗しました。' },
      { status: 500 }
    );
  }
}

// ノート削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // ノートの所有者チェック
    const existingNote = await prisma.note.findUnique({
      where: { id: params.id }
    });

    if (!existingNote) {
      return NextResponse.json(
        { success: false, message: 'ノートが見つかりません。' },
        { status: 404 }
      );
    }

    if (existingNote.userId !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'このノートを削除する権限がありません。' },
        { status: 403 }
      );
    }

    // ノート削除
    await prisma.note.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { success: true, message: 'ノートを削除しました。' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { success: false, message: 'ノートの削除に失敗しました。' },
      { status: 500 }
    );
  }
} 