import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'メールアドレスとパスワードを入力してください。' },
        { status: 400 }
      );
    }

    // ユーザーログイン
    const result = await loginUser(email, password);

    if (result.success && result.user && result.token) {
      // レスポンスにJWTトークンを含めて返す
      return NextResponse.json(
        { 
          success: true, 
          message: result.message,
          user: result.user,
          token: result.token
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login API error details:', {
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