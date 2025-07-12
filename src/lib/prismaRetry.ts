import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import { updateMetrics } from './prismaHealth';

// 再接続制御用の変数
let lastReconnectTime = 0;
const RECONNECT_COOLDOWN = 60000; // 1分間のクールダウン

// 接続管理用のヘルパー関数（リトライ機能付き）
export const withPrisma = async <T>(operation: (prisma: PrismaClient) => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: Error;
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation(prisma);
      
      // 成功時のメトリクス更新
      updateMetrics(true);
      const duration = Date.now() - startTime;
      
      if (duration > 1000) { // 1秒以上かかった場合は警告
        console.warn(`Slow database operation: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      // 失敗時のメトリクス更新
      updateMetrics(false);
      console.error(`Database operation attempt ${attempt} failed:`, error);
      
      // 接続エラーの場合のみリトライ
      if (error instanceof Error && (
        error.message.includes('prepared statement') ||
        error.message.includes('42P05') ||
        error.message.includes('26000') ||
        error.message.includes('08P01') ||
        error.message.includes('connection') ||
        error.message.includes('timeout') ||
        error.message.includes('pool') ||
        error.message.includes('too many connections')
      )) {
        if (attempt < maxRetries) {
          const now = Date.now();
          
          // 再接続のクールダウン期間をチェック
          if (now - lastReconnectTime > RECONNECT_COOLDOWN) {
            try {
              await prisma.$disconnect();
              console.log('Prisma connection reset due to error');
              // 再接続を待つ
              await new Promise(resolve => setTimeout(resolve, 1000));
              await prisma.$connect();
              console.log('Prisma connection reconnected');
              lastReconnectTime = now;
            } catch (disconnectError) {
              console.error('Connection reset error:', disconnectError);
            }
          } else {
            console.log('Skipping reconnect due to cooldown period');
          }
          
          // 指数バックオフ（より長い間隔）
          const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
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