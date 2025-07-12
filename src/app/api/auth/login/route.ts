import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { logger } from '@/lib/logger';

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
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  // 環境変数チェック
  logger.logEnvironmentCheck();
  
  // APIリクエストログ
  logger.logApiRequest('POST', '/api/auth/login', {
    requestId,
    endpoint: '/api/auth/login'
  });

  let email: string | undefined;
  let password: string | undefined;

  try {
    const body = await request.json();
    email = body.email;
    password = body.password;

    // バリデーション
    if (!email || !password) {
      logger.logError({
        error: new Error('Missing email or password'),
        context: {
          requestId,
          endpoint: '/api/auth/login',
          method: 'POST'
        },
        additionalInfo: {
          hasEmail: !!email,
          hasPassword: !!password
        }
      });
      
      return NextResponse.json(
        { success: false, message: 'メールアドレスとパスワードを入力してください。' },
        { status: 400 }
      );
    }

    // リトライ機能付きでユーザーログイン
    const result = await loginWithRetry(email, password);

    const duration = Date.now() - startTime;
    
    // データベース操作ログ
    logger.logDatabaseOperation('login', duration, {
      requestId,
      endpoint: '/api/auth/login',
      success: result?.success
    });

    if (result?.success && result.user && result.token) {
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
      // ログイン失敗のログ
      logger.logError({
        error: new Error(result?.message || 'Login failed'),
        context: {
          requestId,
          endpoint: '/api/auth/login',
          method: 'POST',
          duration: `${duration}ms`
        },
        additionalInfo: {
          loginSuccess: result?.success,
          hasUser: !!result?.user,
          hasToken: !!result?.token
        }
      });
      
      return NextResponse.json(
        { success: false, message: result?.message || 'ログインに失敗しました。' },
        { status: 401 }
      );
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // 詳細なエラーログ
    logger.logError({
      error,
      context: {
        requestId,
        endpoint: '/api/auth/login',
        method: 'POST',
        duration: `${duration}ms`
      },
      additionalInfo: {
        email: email || 'not provided',
        hasPassword: !!password,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }
    });
    
    // Prismaエラーの詳細な処理
    if (error instanceof Error) {
      if (error.message.includes('prepared statement') || error.message.includes('42P05')) {
        return NextResponse.json(
          { success: false, message: 'データベース接続エラーが発生しました。しばらく時間をおいて再度お試しください。' },
          { status: 503 }
        );
      }
      
      // Prisma Data Proxyエラーの処理
      if (error.message.includes('prisma://')) {
        logger.logError({
          error: new Error('Prisma Data Proxy configuration detected'),
          context: {
            requestId,
            endpoint: '/api/auth/login',
            method: 'POST'
          },
          additionalInfo: {
            originalError: error.message,
            suggestion: 'Check Vercel environment variables for Data Proxy settings'
          }
        });
        
        return NextResponse.json(
          { success: false, message: 'データベース設定エラーが発生しました。管理者にお問い合わせください。' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, message: `サーバーエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 