import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'メールアドレスが必要です。' },
        { status: 400 }
      );
    }

    // ユーザーをメール確認済みに更新
    const user = await prisma.user.update({
      where: { email },
      data: {
        emailVerified: true,
        verificationToken: null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'メール確認が完了しました。',
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified
        }
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