import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // 接続プール設定 - 1000ユーザー対応
    __internal: {
      engine: {
        connectionLimit: 20, // 同時接続数を増加
        // 接続タイムアウト設定
        connectionTimeout: 30000, // 30秒（適度な値）
        // アイドルタイムアウト設定
        idleTimeout: 600000, // 10分（長めに設定）
        // 接続プールの最大サイズ
        poolSize: 50, // プールサイズを増加
      },
    },
  });
};

// シングルトンパターンでPrismaクライアントを管理
let prismaInstance: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prismaInstance = createPrismaClient();
} else {
  if (!globalThis.__prisma) {
    globalThis.__prisma = createPrismaClient();
  }
  prismaInstance = globalThis.__prisma;
}

export const prisma = prismaInstance;

// シンプルなキャッシュ機能
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const withCache = async <T>(
  key: string,
  operation: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // デフォルト5分
): Promise<T> => {
  const now = Date.now();
  const cached = cache.get(key);
  
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return cached.data as T;
  }
  
  const data = await operation();
  cache.set(key, { data, timestamp: now, ttl });
  
  return data;
};

// キャッシュクリア機能
export const clearCache = (pattern?: string) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// 接続状態監視
let connectionHealthCheck: NodeJS.Timeout | null = null;
let connectionMetrics = {
  totalOperations: 0,
  failedOperations: 0,
  lastHealthCheck: new Date(),
  connectionErrors: 0
};

const startHealthCheck = () => {
  if (connectionHealthCheck) return;
  
  connectionHealthCheck = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      connectionMetrics.lastHealthCheck = new Date();
      console.log('Prisma connection health check: OK', {
        totalOperations: connectionMetrics.totalOperations,
        failedOperations: connectionMetrics.failedOperations,
        errorRate: connectionMetrics.totalOperations > 0 
          ? ((connectionMetrics.failedOperations / connectionMetrics.totalOperations) * 100).toFixed(2) + '%'
          : '0%'
      });
    } catch (error) {
      connectionMetrics.connectionErrors++;
      console.error('Prisma connection health check: FAILED', error);
      // 接続が不安定な場合は再接続を試行
      try {
        await prisma.$disconnect();
        console.log('Prisma connection reset due to health check failure');
      } catch (disconnectError) {
        console.error('Connection reset error:', disconnectError);
      }
    }
  }, 30 * 1000); // 30秒ごと（より頻繁に監視）
};

// 本番環境でもヘルスチェックを開始
if (typeof window === 'undefined') {
  startHealthCheck();
}

// 接続管理用のヘルパー関数（リトライ機能付き）
export const withPrisma = async <T>(operation: (prisma: PrismaClient) => Promise<T>, maxRetries = 5): Promise<T> => {
  let lastError: Error;
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation(prisma);
      
      // 成功時のメトリクス更新
      connectionMetrics.totalOperations++;
      const duration = Date.now() - startTime;
      
      if (duration > 1000) { // 1秒以上かかった場合は警告
        console.warn(`Slow database operation: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      connectionMetrics.failedOperations++;
      console.error(`Database operation attempt ${attempt} failed:`, error);
      
      // 接続エラーの場合のみリトライ
      if (error instanceof Error && (
        error.message.includes('prepared statement') ||
        error.message.includes('42P05') ||
        error.message.includes('connection') ||
        error.message.includes('timeout') ||
        error.message.includes('pool') ||
        error.message.includes('too many connections')
      )) {
        if (attempt < maxRetries) {
          // 指数バックオフ（より長い間隔）
          const delay = Math.min(2000 * Math.pow(2, attempt - 1), 30000);
          console.log(`Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // 接続エラー以外または最後の試行の場合は即座にエラーを投げる
      throw error;
    }
  }
  
  throw lastError!;
};

// 定期的な接続クリーンアップ（30分ごと）- 頻度を下げる
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') { // 開発環境のみ
  setInterval(async () => {
    try {
      // 接続状態を確認
      await prisma.$queryRaw`SELECT 1`;
      console.log('Prisma connection health check passed');
    } catch (error) {
      console.error('Connection health check failed:', error);
      // エラー時のみ再接続
      try {
        await prisma.$disconnect();
        console.log('Prisma connection reset due to health check failure');
      } catch (disconnectError) {
        console.error('Connection reset error:', disconnectError);
      }
    }
  }, 30 * 60 * 1000); // 30分
}

// グレースフルシャットダウン
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// SIGTERMシグナルでの切断
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// SIGINTシグナルでの切断
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// 未処理のPromise拒否をキャッチ
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await prisma.$disconnect();
});

// 未処理の例外をキャッチ
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await prisma.$disconnect();
  process.exit(1);
}); 