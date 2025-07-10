import { NextRequest, NextResponse } from 'next/server';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: 'ログアウトしました。' },
      { status: 200 }
    );

    // 認証クッキーを削除
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, message: 'ログアウトに失敗しました。' },
      { status: 500 }
    );
  }
} 