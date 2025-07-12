import { NextRequest, NextResponse } from 'next/server';
import { resendVerificationEmail } from '@/lib/auth';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // バリデーション
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'メールアドレスを入力してください。' },
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

    // 認証メール再送信
    const result = await resendVerificationEmail(email);

    if (result.success) {
      return NextResponse.json(
        { success: true, message: result.message },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Resend verification API error:', error);
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
} 