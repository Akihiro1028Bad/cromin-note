"use client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, LoadingSpinner, Button } from '@/components';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Note {
  id: string;
  title: string | null;
  content: string | null;
  noteType: string;
  result: string | null;
  opponent: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  setWinRate: number;
  totalMatchTime: number;
}

export default function MyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShouldRedirect(true);
    }
  }, [user, loading]);

  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/auth");
    }
  }, [shouldRedirect, router]);

  useEffect(() => {
    if (!loading && user) {
      fetchUserData();
    }
  }, [user, loading]);

  const fetchUserData = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notes/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setNotes(json.data);
      } else {
        setApiError(json.error || "データ取得に失敗しました");
      }
    } catch {
      setApiError("データ取得に失敗しました");
    } finally {
      setApiLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (shouldRedirect) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (apiLoading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (apiError) return <div className="p-8 text-red-500">{apiError}</div>;

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900">マイページ</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push("/analytics")}
                  className="p-2 text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          {/* ユーザー情報 */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-gray-900">ユーザー情報</h2>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-sm text-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-500">📧</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">👤</span>
                  <span>{user?.nickname || 'ニックネーム未設定'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-gray-900">統計情報</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                <div className="text-lg font-bold text-blue-700">{notes.length}</div>
                <div className="text-xs text-gray-600">投稿</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                <div className="text-lg font-bold text-green-700">{notes.filter(note => note.isPublic).length}</div>
                <div className="text-xs text-gray-600">公開</div>
              </div>
            </div>
          </div>

          {/* 試合結果統計 */}
          {stats && (
            <div className="mb-6">
              <h3 className="text-base font-bold mb-3 text-gray-900">🏆 試合結果統計</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-lg font-bold text-blue-700">{stats.totalMatches}</div>
                  <div className="text-xs text-gray-600">試合数</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-lg font-bold text-green-700">{stats.wins}</div>
                  <div className="text-xs text-gray-600">勝利</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-lg font-bold text-red-700">{stats.losses}</div>
                  <div className="text-xs text-gray-600">敗戦</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-lg font-bold text-yellow-700">{stats.winRate}%</div>
                  <div className="text-xs text-gray-600">勝率</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-sm font-bold text-blue-700">{stats.setWinRate}%</div>
                  <div className="text-xs text-gray-600">セット勝率</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                  <div className="text-sm font-bold text-purple-700">{Math.round(stats.totalMatchTime / 60)}分</div>
                  <div className="text-xs text-gray-600">総試合時間</div>
                </div>
              </div>
            </div>
          )}

          {/* 自分のノート一覧 */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-gray-900">自分のノート一覧</h2>
            {notes.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <div className="text-xl font-bold text-gray-900 mb-4">まだノートがありません</div>
                <div className="text-gray-600 mb-6">最初のノートを投稿してみましょう！</div>
                <Button fullWidth color="blue" size="lg" onClick={() => router.push("/notes/new")}>
                  <span className="text-white font-bold">ノートを投稿する</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map(note => (
                  <div 
                    key={note.id} 
                    className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/notes/${note.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {note.noteType}
                        </span>
                        {note.isPublic && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            公開
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                    <div className="font-semibold text-base text-gray-900 line-clamp-1 mb-2">
                      {note.title || "タイトルなし"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="text-blue-500">👤</span>
                      <span>投稿者: {user?.nickname || '匿名'}</span>
                    </div>
                    {note.content && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-2">
                        {note.content}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      {note.result && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          note.result === '勝ち' ? 'bg-green-100 text-green-700' :
                          note.result === '負け' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {note.result}
                        </span>
                      )}
                      {note.opponent && (
                        <span className="text-xs text-gray-500">
                          対戦相手: {note.opponent}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/notes/${note.id}/edit`);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                      >
                        編集
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // 削除機能は後で実装
                          alert('削除機能は準備中です');
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                      >
                        削除
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span>更新日: {new Date(note.updatedAt).toLocaleDateString("ja-JP")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* フローティングアクションボタン（FAB） */}
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={() => router.push("/notes/new")}
            className="bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </main>
    </PageTransition>
  );
} 