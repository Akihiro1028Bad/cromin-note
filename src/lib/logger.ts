// Vercel環境での詳細なエラーログ機能
interface LogContext {
  endpoint?: string;
  method?: string;
  userId?: string;
  requestId?: string;
  timestamp?: string;
  environment?: string;
  [key: string]: any;
}

interface ErrorDetails {
  error: any;
  context?: LogContext;
  additionalInfo?: Record<string, any>;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private isVercel = !!process.env.VERCEL;

  // 情報ログ
  info(message: string, context?: LogContext): void {
    const logInfo = {
      type: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      environment: process.env.NODE_ENV || 'development',
      isVercel: this.isVercel,
      ...context
    };

    if (this.isVercel) {
      console.log('ℹ️ INFO:', JSON.stringify(logInfo, null, 2));
    } else {
      console.log('ℹ️ INFO:', logInfo);
    }
  }

  // 警告ログ
  warn(message: string, context?: LogContext): void {
    const logInfo = {
      type: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      environment: process.env.NODE_ENV || 'development',
      isVercel: this.isVercel,
      ...context
    };

    if (this.isVercel) {
      console.warn('⚠️ WARN:', JSON.stringify(logInfo, null, 2));
    } else {
      console.warn('⚠️ WARN:', logInfo);
    }
  }

  // エラーログ（簡易版）
  error(message: string, error?: any, context?: LogContext): void {
    if (error) {
      this.logError({ error, context, additionalInfo: { message } });
    } else {
      const logInfo = {
        type: 'ERROR',
        timestamp: new Date().toISOString(),
        message,
        environment: process.env.NODE_ENV || 'development',
        isVercel: this.isVercel,
        ...context
      };

      if (this.isVercel) {
        console.error('🚨 ERROR:', JSON.stringify(logInfo, null, 2));
      } else {
        console.error('🚨 ERROR:', logInfo);
      }
    }
  }

  // エラーログ（Vercel環境で詳細情報を出力）
  logError(details: ErrorDetails): void {
    const {
      error,
      context = {},
      additionalInfo = {}
    } = details;

    const errorInfo = {
      // 基本情報
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      isVercel: this.isVercel,
      
      // エラー詳細
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      errorCode: (error as any)?.code,
      
      // Prisma固有のエラー情報
      prismaError: this.extractPrismaError(error),
      
      // コンテキスト情報
      ...context,
      
      // 追加情報
      ...additionalInfo
    };

    // Vercel環境では詳細なログを出力
    if (this.isVercel) {
      console.error('🚨 VERCEL ERROR LOG:', JSON.stringify(errorInfo, null, 2));
    } else {
      console.error('🚨 ERROR LOG:', errorInfo);
    }
  }

  // Prismaエラーの詳細抽出
  private extractPrismaError(error: any): any {
    if (!error) return null;

    const prismaError = {
      code: (error as any)?.code,
      meta: (error as any)?.meta,
      clientVersion: (error as any)?.clientVersion,
      batchRequestIdx: (error as any)?.batchRequestIdx,
    };

    // 空のオブジェクトでない場合のみ返す
    return Object.values(prismaError).some(v => v !== undefined) ? prismaError : null;
  }

  // APIリクエストログ
  logApiRequest(method: string, endpoint: string, context?: LogContext): void {
    const logInfo = {
      type: 'API_REQUEST',
      timestamp: new Date().toISOString(),
      method,
      endpoint,
      environment: process.env.NODE_ENV || 'development',
      isVercel: this.isVercel,
      ...context
    };

    if (this.isVercel) {
      console.log('📡 API REQUEST:', JSON.stringify(logInfo, null, 2));
    } else {
      console.log('📡 API REQUEST:', logInfo);
    }
  }

  // データベース操作ログ
  logDatabaseOperation(operation: string, duration: number, context?: LogContext): void {
    const logInfo = {
      type: 'DATABASE_OPERATION',
      timestamp: new Date().toISOString(),
      operation,
      duration: `${duration}ms`,
      environment: process.env.NODE_ENV || 'development',
      isVercel: this.isVercel,
      ...context
    };

    if (this.isVercel) {
      console.log('🗄️ DATABASE OPERATION:', JSON.stringify(logInfo, null, 2));
    } else {
      console.log('🗄️ DATABASE OPERATION:', logInfo);
    }
  }

  // 環境変数チェックログ
  logEnvironmentCheck(): void {
    const envInfo = {
      type: 'ENVIRONMENT_CHECK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      isVercel: this.isVercel,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasGmailUser: !!process.env.GMAIL_USER,
      hasGmailAppPassword: !!process.env.GMAIL_APP_PASSWORD,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
      directUrlPrefix: process.env.DIRECT_URL?.substring(0, 20) + '...',
    };

    if (this.isVercel) {
      console.log('🔧 ENVIRONMENT CHECK:', JSON.stringify(envInfo, null, 2));
    } else {
      console.log('🔧 ENVIRONMENT CHECK:', envInfo);
    }
  }
}

export const logger = new Logger(); 