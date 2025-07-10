import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'メールアドレスが必要です。' },
        { status: 400 }
      );
    }

    // ユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'ユーザーが見つかりません。' },
        { status: 404 }
      );
    }

    // 検証トークンを取得
    const verificationToken = user.verificationToken;
    const emailVerified = user.emailVerified;

    return NextResponse.json(
      { 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          emailVerified,
          verificationToken: verificationToken ? 'exists' : 'null'
        },
        verificationUrl: verificationToken ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${verificationToken}` : null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test verification error:', error);
    return NextResponse.json(
      { success: false, message: `エラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 