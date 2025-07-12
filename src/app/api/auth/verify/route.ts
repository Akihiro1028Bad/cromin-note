import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/auth';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Email verification API called');
    console.log('Request URL:', request.url);
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    console.log('Token received:', token ? `exists (length: ${token.length})` : 'not found');
    console.log('All search params:', Object.fromEntries(searchParams.entries()));

    if (!token) {
      console.log('No token provided');
      const errorUrl = new URL('/auth/error?message=確認トークンがありません。', request.url);
      console.log('Error redirect URL:', errorUrl.toString());
      return NextResponse.redirect(errorUrl);
    }

    // メール確認
    console.log('Calling verifyEmail function with token');
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
    
    // エラー時はエラーページにリダイレクト
    const errorMessage = error instanceof Error ? error.message : 'サーバーエラーが発生しました。';
    const errorUrl = new URL(`/auth/error?message=${encodeURIComponent(errorMessage)}`, request.url);
    console.log('Error redirect URL:', errorUrl.toString());
    return NextResponse.redirect(errorUrl);
  }
} 