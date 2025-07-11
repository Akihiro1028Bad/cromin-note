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
    // 接続プール設定 - より厳格な設定
    __internal: {
      engine: {
        connectionLimit: 1,
        // 接続タイムアウト設定
        connectionTimeout: 10000, // 10秒
        // アイドルタイムアウト設定
        idleTimeout: 30000, // 30秒
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

// 接続管理用のヘルパー関数
export const withPrisma = async <T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> => {
  try {
    const result = await operation(prisma);
    return result;
  } catch (error) {
    console.error('Database operation error:', error);
    throw error;
  } finally {
    // 各操作後に接続を明示的に切断
    await prisma.$disconnect();
  }
};

// 定期的な接続クリーンアップ（5分ごと）
if (typeof window === 'undefined') { // サーバーサイドのみ
  setInterval(async () => {
    try {
      await prisma.$disconnect();
      console.log('Prisma connection cleaned up');
    } catch (error) {
      console.error('Connection cleanup error:', error);
    }
  }, 5 * 60 * 1000); // 5分
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