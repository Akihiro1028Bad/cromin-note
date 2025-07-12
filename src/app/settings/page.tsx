"use client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, Button, LoadingSpinner } from '@/components';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
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
  }, [shouldRedirect, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (shouldRedirect) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100 pb-20">
                {/* タブナビゲーション */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 pb-3">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'profile', label: 'プロフィール', icon: '👤' },
                { id: 'account', label: 'アカウント', icon: '🔐' },
                { id: 'app', label: 'アプリ', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="flex justify-around py-2">
            {[
              { id: 'profile', label: 'プロフィール', icon: '👤' },
              { id: 'account', label: 'アカウント', icon: '🔐' },
              { id: 'app', label: 'アプリ', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </PageTransition>
  );
} 