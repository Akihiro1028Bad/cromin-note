import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/auth';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Email Verification API Called ===');
    console.log('Request URL:', request.url);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set'
    });
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    console.log('Token received:', token ? `exists (length: ${token.length})` : 'not found');
    console.log('Token preview:', token ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}` : 'none');
    console.log('All search params:', Object.fromEntries(searchParams.entries()));
    console.log('=====================================');

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
    console.error('=== Email Verification API Error ===');
    console.error('Email verification API error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      name: error instanceof Error ? error.name : undefined,
      constructor: error?.constructor?.name,
      isPrismaError: error instanceof Error && error.message.includes('prisma'),
      isConnectionError: error instanceof Error && (
        error.message.includes('connection') || 
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED')
      ),
      isDatasourceError: error instanceof Error && error.message.includes('datasource'),
      isUrlError: error instanceof Error && error.message.includes('URL')
    });
    
    // エラー時はエラーページにリダイレクト
    const errorMessage = error instanceof Error ? error.message : 'サーバーエラーが発生しました。';
    const errorUrl = new URL(`/auth/error?message=${encodeURIComponent(errorMessage)}`, request.url);
    console.log('Error redirect URL:', errorUrl.toString());
    console.error('=====================================');
    return NextResponse.redirect(errorUrl);
  }
} 