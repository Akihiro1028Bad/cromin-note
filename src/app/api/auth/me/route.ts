import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('API /auth/me - Request received');
  
  try {
    // Authorizationヘッダーからトークンを取得
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('API /auth/me - Auth header check:', {
      authHeader: authHeader ? 'exists' : 'not found',
      token: token ? 'exists' : 'not found'
    });

    if (!token) {
      console.log('API /auth/me - No token provided');
      return NextResponse.json(
        { success: false, message: '認証されていません。' },
        { status: 401 }
      );
    }

    // トークン検証
    console.log('API /auth/me - Verifying token');
    const decoded = verifyToken(token);
    if (!decoded) {
      console.log('API /auth/me - Invalid token');
      return NextResponse.json(
        { success: false, message: '無効なトークンです。' },
        { status: 401 }
      );
    }

    console.log('API /auth/me - Token verified, userId:', decoded.userId);

    // ユーザー情報取得
    console.log('API /auth/me - Fetching user from database');
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

    if (!user) {
      console.log('API /auth/me - User not found in database');
      return NextResponse.json(
        { success: false, message: 'ユーザーが見つかりません。' },
        { status: 404 }
      );
    }

    console.log('API /auth/me - User found:', {
      id: user.id,
      email: user.email,
      nickname: user.nickname
    });

    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error('API /auth/me - Error details:', {
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