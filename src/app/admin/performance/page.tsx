'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';

interface PerformanceMetrics {
  status: string;
  timestamp: string;
  database: {
    connected: boolean;
    responseTime: string;
    metrics: {
      totalUsers: number;
      totalNotes: number;
      publicNotes: number;
    };
  };
  recommendations: {
    warning?: string;
    info?: string;
  };
}

export default function PerformancePage() {
  const { user, loading } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health/db');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMetrics();
      // 5分ごとに更新
      const interval = setInterval(fetchMetrics, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">アクセス拒否</h1>
          <p className="text-gray-600">このページにアクセスするにはログインが必要です。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">パフォーマンス監視</h1>
          <p className="mt-2 text-gray-600">システムの健康状態とパフォーマンスメトリクス</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* データベース状態 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">データベース状態</h2>
            {loadingMetrics ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : metrics ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">接続状態:</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    metrics.database.connected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metrics.database.connected ? '接続中' : '切断'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">応答時間:</span>
                  <span className="font-medium">{metrics.database.responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">最終更新:</span>
                  <span className="font-medium">
                    {new Date(metrics.timestamp).toLocaleString('ja-JP')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">メトリクスを取得できませんでした</p>
            )}
          </div>

          {/* 統計情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">統計情報</h2>
            {loadingMetrics ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : metrics ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">総ユーザー数:</span>
                  <span className="font-medium">{metrics.database.metrics.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">総ノート数:</span>
                  <span className="font-medium">{metrics.database.metrics.totalNotes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">公開ノート数:</span>
                  <span className="font-medium">{metrics.database.metrics.publicNotes.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">統計情報を取得できませんでした</p>
            )}
          </div>
        </div>

        {/* 推奨事項 */}
        {metrics?.recommendations && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">推奨事項</h2>
            <div className="space-y-3">
              {metrics.recommendations.warning && (
                <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">{metrics.recommendations.warning}</p>
                  </div>
                </div>
              )}
              {metrics.recommendations.info && (
                <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">{metrics.recommendations.info}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">エラー: {error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 更新ボタン */}
        <div className="flex justify-center">
          <button
            onClick={fetchMetrics}
            disabled={loadingMetrics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMetrics ? '更新中...' : '更新'}
          </button>
        </div>
      </div>
    </div>
  );
} 