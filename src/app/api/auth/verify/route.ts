import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('Email verification API called');
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    console.log('Token received:', token ? 'exists' : 'not found');

    if (!token) {
      console.log('No token provided');
      return NextResponse.json(
        { success: false, message: '確認トークンがありません。' },
        { status: 400 }
      );
    }

    // メール確認
    console.log('Calling verifyEmail function');
    const result = await verifyEmail(token);
    console.log('verifyEmail result:', result);

    if (result.success) {
      // 成功時はログインページにリダイレクト
      console.log('Email verification successful, redirecting to login');
      const redirectUrl = new URL('/auth/login?verified=true', request.url);
      console.log('Redirect URL:', redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    } else {
      // 失敗時はエラーページにリダイレクト
      console.log('Email verification failed:', result.message);
      const errorUrl = new URL(`/auth/error?message=${encodeURIComponent(result.message)}`, request.url);
      console.log('Error URL:', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error('Email verification API error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code
    });
    
    // エラー時はJSONレスポンスを返す（リダイレクトではなく）
    return NextResponse.json(
      { 
        success: false, 
        message: 'サーバーエラーが発生しました。',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 