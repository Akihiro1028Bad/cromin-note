"use client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, LoadingSpinner, Button } from '@/components';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShouldRedirect(true);
    }
  }, [user, loading]);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/auth');
    }
  }, [shouldRedirect, router]);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nickname })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('プロフィールを更新しました');
        setIsEditing(false);
      } else {
        setError(data.message || '更新に失敗しました');
      }
    } catch (error) {
      setError('更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (shouldRedirect) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-gray-900 ml-2">プロフィール</h1>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-6">
          <div className="max-w-md mx-auto">
            {/* プロフィール情報 */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">プロフィール情報</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50 text-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">メールアドレスは変更できません</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ニックネーム
                  </label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="ニックネームを入力"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <Button
                          color="blue"
                          size="md"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? '保存中...' : '保存'}
                        </Button>
                        <Button
                          color="gray"
                          size="md"
                          onClick={() => {
                            setIsEditing(false);
                            setNickname(user?.nickname || '');
                            setError(null);
                          }}
                          disabled={isSaving}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{nickname || '未設定'}</span>
                      <Button
                        color="blue"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        編集
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* メッセージ */}
              {message && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {message}
                  </div>
                </div>
              )}

              {/* エラーメッセージ */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}
            </div>

            {/* アカウント情報 */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">アカウント情報</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">登録日</span>
                  <span className="text-sm text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ja-JP') : '不明'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">メール確認</span>
                  <span className={`text-sm ${user?.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.emailVerified ? '完了' : '未完了'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
} 