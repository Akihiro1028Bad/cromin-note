import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, nickname, password } = await request.json();

    // バリデーション
    if (!email || !nickname || !password) {
      return NextResponse.json(
        { success: false, message: 'メールアドレス、ニックネーム、パスワードを入力してください。' },
        { status: 400 }
      );
    }

    // ニックネームのバリデーション
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

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'パスワードは6文字以上で入力してください。' },
        { status: 400 }
      );
    }

    // メールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '有効なメールアドレスを入力してください。' },
        { status: 400 }
      );
    }

    // ユーザー登録
    const result = await registerUser(email, nickname.trim(), password, request);

    if (result.success) {
      return NextResponse.json(
        { success: true, message: result.message },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Registration API error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code
    });
    return NextResponse.json(
      { success: false, message: `サーバーエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 