import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { withPrisma } from '@/lib/prismaRetry';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// プロフィール取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '認証が必要です。' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: '無効なトークンです。' },
        { status: 401 }
      );
    }

    // ユーザー情報取得
    const result = await withPrisma(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          nickname: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return { success: true, user };
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, message: 'ユーザーが見つかりません。' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user: result.user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'プロフィールの取得に失敗しました。' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: '認証が必要です。' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: '無効なトークンです。' },
        { status: 401 }
      );
    }

    const { nickname } = await request.json();

    // バリデーション
    if (!nickname) {
      return NextResponse.json(
        { success: false, message: 'ニックネームを入力してください。' },
        { status: 400 }
      );
    }

    if (nickname.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'ニックネームは2文字以上で入力してください。' },
        { status: 400 }
      );
    }

    if (nickname.trim().length > 20) {
      return NextResponse.json(
        { success: false, message: 'ニックネームは20文字以下で入力してください。' },
        { status: 400 }
      );
    }

    // プロフィール更新
    const result = await withPrisma(async (prisma) => {
      const updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: { nickname: nickname.trim() },
        select: {
          id: true,
          email: true,
          nickname: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return { success: true, user: updatedUser };
    });

    if (result.success) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'プロフィールを更新しました。',
          user: result.user
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'プロフィールの更新に失敗しました。' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
} 