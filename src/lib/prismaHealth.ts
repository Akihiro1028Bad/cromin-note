import { prisma } from './prisma';

// 接続状態監視
let connectionHealthCheck: NodeJS.Timeout | null = null;
let connectionMetrics = {
  totalOperations: 0,
  failedOperations: 0,
  lastHealthCheck: new Date(),
  connectionErrors: 0
};

const startHealthCheck = () => {
  if (connectionHealthCheck || process.env.NODE_ENV !== 'development') return;
  
  // 開発環境でのみ5分間隔でヘルスチェック（頻度を大幅に抑制）
  connectionHealthCheck = setInterval(async () => {
    try {
      // ヘルスチェックは最小限に抑制
      await prisma.$queryRawUnsafe('SELECT 1');
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
      // 接続が不安定な場合でも再接続は最小限に抑制
      // 自動再接続は無効化（手動でのみ実行）
    }
  }, 5 * 60 * 1000); // 5分間隔に変更（元は1分間隔）
};

// 開発環境でのみヘルスチェックを開始（本番環境では無効化）
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  startHealthCheck();
}

// メトリクス更新用のヘルパー関数
export const updateMetrics = (success: boolean) => {
  connectionMetrics.totalOperations++;
  if (!success) {
    connectionMetrics.failedOperations++;
  }
};

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