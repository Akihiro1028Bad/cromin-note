"use client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, Button, LoadingSpinner } from '@/components';
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'app'>('profile');
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShouldRedirect(true);
    }
  }, [user, loading]);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/auth/login");
    }
  }, [shouldRedirect]); // routerを依存関係から削除

  // URLパラメータからタブの状態を取得
  useEffect(() => {
    const tab = searchParams.get('tab') as 'profile' | 'account' | 'app';
    if (tab && ['profile', 'account', 'app'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (shouldRedirect) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <button
                  onClick={() => router.push("/home")}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-lg font-bold text-gray-900 ml-2">設定</h1>
              </div>
            </div>
          </div>


        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* プロフィール情報 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">プロフィール情報</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ニックネーム
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.nickname || ''}
                      placeholder="ニックネームを入力"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">メールアドレスは変更できません</p>
                  </div>
                  <Button fullWidth color="blue" size="md">
                    <span className="text-white font-bold">プロフィールを更新</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* パスワード変更 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">パスワード変更</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      現在のパスワード
                    </label>
                    <input
                      type="password"
                      placeholder="現在のパスワードを入力"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      新しいパスワード
                    </label>
                    <input
                      type="password"
                      placeholder="新しいパスワードを入力"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      新しいパスワード（確認）
                    </label>
                    <input
                      type="password"
                      placeholder="新しいパスワードを再入力"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button fullWidth color="blue" size="md">
                    <span className="text-white font-bold">パスワードを変更</span>
                  </Button>
                </div>
              </div>

              {/* アカウント削除 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-bold text-red-600 mb-4">危険な操作</h2>
                <p className="text-sm text-gray-600 mb-4">
                  アカウントを削除すると、すべてのデータが完全に削除され、復元できません。
                </p>
                <Button fullWidth color="red" size="md">
                  <span className="text-white font-bold">アカウントを削除</span>
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'app' && (
            <div className="space-y-6">
              {/* アプリ設定 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">アプリ設定</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">プッシュ通知</h3>
                      <p className="text-sm text-gray-600">新しいノートや更新のお知らせ</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">ダークモード</h3>
                      <p className="text-sm text-gray-600">ダークテーマを使用</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* ログアウト */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">セッション</h2>
                <Button fullWidth color="red" size="md" onClick={handleLogout}>
                  <span className="text-white font-bold">ログアウト</span>
                </Button>
              </div>

              {/* アプリ情報 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">アプリ情報</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>バージョン</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ビルド</span>
                    <span>2024.1.1</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ボトムナビゲーション */}

      </main>
    </PageTransition>
  );
} 