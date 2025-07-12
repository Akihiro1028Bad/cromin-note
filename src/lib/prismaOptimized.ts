import { prisma } from './prisma';

// 最適化されたクエリ実行関数
export const optimizedQuery = async <T>(
  operation: () => Promise<T>,
  options: {
    timeout?: number;
    retries?: number;
    cache?: boolean;
  } = {}
): Promise<T> => {
  const { timeout = 5000, retries = 2, cache = false } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // タイムアウト付きでクエリを実行
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        )
      ]);
      
      return result;
    } catch (error) {
      console.error(`Query attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      // 指数バックオフ
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error('All query attempts failed');
};

// バッチ処理用のヘルパー
export const batchQuery = async <T>(
  operations: (() => Promise<T>)[],
  batchSize: number = 5
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(operation => optimizedQuery(operation))
    );
    results.push(...batchResults);
  }
  
  return results;
};

// 接続状態の監視
export const getConnectionStatus = async () => {
  try {
    const startTime = Date.now();
    await prisma.$queryRawUnsafe('SELECT 1');
    const duration = Date.now() - startTime;
    
    return {
      status: 'connected',
      latency: duration,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}; 