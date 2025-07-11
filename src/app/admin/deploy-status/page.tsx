'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface MigrationInfo {
  version: string;
  checksum: string;
  execution_time: number;
  applied_at: string;
}

interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface DeployStatus {
  status: string;
  timestamp: string;
  database: {
    connected: boolean;
    migrations: MigrationInfo[];
    tables: TableInfo[];
    stats: {
      users: number;
      notes: number;
      noteTypes: number;
      results: number;
    };
  };
  deployment: {
    environment: string;
    prismaVersion: string;
    nodeVersion: string;
  };
}

export default function DeployStatusPage() {
  const { user, loading } = useAuth();
  const [deployStatus, setDeployStatus] = useState<DeployStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployStatus = async () => {
    setLoadingStatus(true);
    setError(null);
    
    try {
      const response = await fetch('/api/deploy/check-migration');
      if (!response.ok) {
        throw new Error('Failed to fetch deployment status');
      }
      
      const data = await response.json();
      setDeployStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDeployStatus();
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
          <h1 className="text-3xl font-bold text-gray-900">デプロイ状態確認</h1>
          <p className="mt-2 text-gray-600">マイグレーションとデータベース構造の確認</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* デプロイ情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">デプロイ情報</h2>
            {loadingStatus ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : deployStatus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">環境:</span>
                  <span className="font-medium">{deployStatus.deployment.environment}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Prisma バージョン:</span>
                  <span className="font-medium">{deployStatus.deployment.prismaVersion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Node.js バージョン:</span>
                  <span className="font-medium">{deployStatus.deployment.nodeVersion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">最終更新:</span>
                  <span className="font-medium">
                    {new Date(deployStatus.timestamp).toLocaleString('ja-JP')}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">デプロイ情報を取得できませんでした</p>
            )}
          </div>

          {/* 統計情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">データベース統計</h2>
            {loadingStatus ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : deployStatus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ユーザー数:</span>
                  <span className="font-medium">{deployStatus.database.stats.users.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ノート数:</span>
                  <span className="font-medium">{deployStatus.database.stats.notes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ノートタイプ数:</span>
                  <span className="font-medium">{deployStatus.database.stats.noteTypes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">結果数:</span>
                  <span className="font-medium">{deployStatus.database.stats.results.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">統計情報を取得できませんでした</p>
            )}
          </div>
        </div>

        {/* マイグレーション履歴 */}
        {deployStatus?.database.migrations && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">マイグレーション履歴</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      バージョン
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      実行時間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      適用日時
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deployStatus.database.migrations.map((migration, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {migration.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {migration.execution_time}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(migration.applied_at).toLocaleString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* テーブル構造 */}
        {deployStatus?.database.tables && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">テーブル構造</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      テーブル名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カラム名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      データ型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NULL許可
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deployStatus.database.tables.map((table, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {table.table_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {table.column_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {table.data_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {table.is_nullable === 'YES' ? '許可' : '禁止'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
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
            onClick={fetchDeployStatus}
            disabled={loadingStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingStatus ? '更新中...' : '更新'}
          </button>
        </div>
      </div>
    </div>
  );
} 