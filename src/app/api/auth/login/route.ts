import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// リトライ機能付きのログイン実行
async function loginWithRetry(email: string, password: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await loginUser(email, password);
      return result;
    } catch (error) {
      console.error(`Login attempt ${attempt} failed:`, error);
      
      // 最後の試行でない場合は少し待ってからリトライ
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // 指数バックオフ
        continue;
      }
      
      // 最後の試行でも失敗した場合はエラーを投げる
      throw error;
    }
  }
}

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

    // リトライ機能付きでユーザーログイン
    const result = await loginWithRetry(email, password);

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
      code: (error as any)?.code,
      name: error instanceof Error ? error.name : undefined
    });
    
    // Prismaエラーの詳細な処理
    if (error instanceof Error) {
      if (error.message.includes('prepared statement') || error.message.includes('42P05')) {
        return NextResponse.json(
          { success: false, message: 'データベース接続エラーが発生しました。しばらく時間をおいて再度お試しください。' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, message: `サーバーエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 