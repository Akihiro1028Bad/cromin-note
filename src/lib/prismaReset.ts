import { PrismaClient } from '@prisma/client';

// PrismaClientの完全なリセット機能
export const resetPrismaClient = async () => {
  try {
    // グローバル変数をクリア
    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined;
    };
    
    if (globalForPrisma.prisma) {
      await globalForPrisma.prisma.$disconnect();
      globalForPrisma.prisma = undefined;
      console.log('PrismaClient reset completed');
    }
  } catch (error) {
    console.error('Error resetting PrismaClient:', error);
  }
};

// 強制的な再接続
export const forceReconnect = async () => {
  try {
    await resetPrismaClient();
    
    // 少し待ってから新しいインスタンスを作成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 新しいPrismaClientインスタンスを作成
    const { prisma } = await import('./prisma');
    
    // 接続テスト
    await prisma.$queryRawUnsafe('SELECT 1');
    console.log('PrismaClient reconnection successful');
    
    return prisma;
  } catch (error) {
    console.error('Error during force reconnect:', error);
    throw error;
  }
}; 