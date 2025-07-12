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