"use client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, Button, LoadingSpinner } from '@/components';
import { useRouter, useSearchParams } from "next/navigation";
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

interface AnalyticsData {
  overview: {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    currentStreak: number;
  };
  recentMatches: Array<{
    id: string;
    title: string | null;
    opponent: string | null;
    result: string | null;
    noteType: string;
    createdAt: string;
  }>;
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'stats'>('overview');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
      return;
    }

    if (!loading && user) {
      fetchData();
    }
  }, [user, loading]);

  // URLパラメータからタブの状態を取得
  useEffect(() => {
    const tab = searchParams.get('tab') as 'overview' | 'notes' | 'stats';
    if (tab && ['overview', 'notes', 'stats'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchData = async () => {
    setApiLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // 並行してデータを取得
      const [notesRes, analyticsRes] = await Promise.all([
        fetch("/api/notes/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/analytics/personal", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const notesJson = await notesRes.json();
      const analyticsJson = await analyticsRes.json();

      if (notesJson.success) {
        const transformedNotes = notesJson.data.map((note: any) => ({
          id: note.id,
          title: note.title,
          content: note.content,
          noteType: note.noteType?.name || '不明',
          result: note.result?.name || null,
          opponent: note.opponent,
          isPublic: note.isPublic,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        }));
        setNotes(transformedNotes);
      }

      if (analyticsJson.success) {
        setAnalytics(analyticsJson.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setApiLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (apiLoading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  const recentNotes = notes.slice(0, 3);

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100">
        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* ユーザー情報 */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{user?.nickname || 'ユーザー'}</h2>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* 統計サマリー */}
              {analytics && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-blue-700">{analytics.overview.totalMatches}</div>
                    <div className="text-sm text-gray-600">総試合数</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                    <div className="text-2xl font-bold text-green-700">{analytics.overview.winRate}%</div>
                    <div className="text-sm text-gray-600">勝率</div>
                  </div>
                </div>
              )}

              {/* 最近のノート */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">最近のノート</h3>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    すべて見る
                  </button>
                </div>
                <div className="space-y-3">
                  {recentNotes.map(note => (
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
                          {note.result && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              note.result === '勝ち' ? 'bg-green-100 text-green-700' :
                              note.result === '負け' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {note.result}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(note.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <div className="font-semibold text-sm text-gray-900">
                        {note.title || "タイトルなし"}
                      </div>
                    </div>
                  ))}
                  {recentNotes.length === 0 && (
                    <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-gray-200">
                      <div className="text-4xl mb-2">📝</div>
                      <div>まだノートがありません</div>
                    </div>
                  )}
                </div>
              </div>

              {/* クイックアクション */}
              <div className="space-y-3">
                <Button fullWidth color="blue" size="lg" onClick={() => router.push("/notes/new")}>
                  <span className="text-white font-bold">新しいノートを作成</span>
                </Button>
                <Button fullWidth color="green" size="lg" onClick={() => router.push("/notes")}>
                  <span className="text-white font-bold">みんなのノートを見る</span>
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">マイノート</h2>
                <button
                  onClick={() => router.push("/notes")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  みんなのノート
                </button>
              </div>
              
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
                    {note.content && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-2">
                        {note.content}
                      </p>
                    )}
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              {analytics ? (
                <>
                  {/* 基本統計 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-blue-700">{analytics.overview.totalMatches}</div>
                      <div className="text-sm text-gray-600">総試合数</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-green-700">{analytics.overview.wins}</div>
                      <div className="text-sm text-gray-600">勝利</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-red-700">{analytics.overview.losses}</div>
                      <div className="text-sm text-gray-600">敗戦</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                      <div className="text-2xl font-bold text-yellow-700">{analytics.overview.winRate}%</div>
                      <div className="text-sm text-gray-600">勝率</div>
                    </div>
                  </div>

                  {/* 詳細分析ボタン */}
                  <Button fullWidth color="purple" size="lg" onClick={() => router.push("/analytics")}>
                    <span className="text-white font-bold">詳細分析を見る</span>
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-gray-200">
                  <div className="text-4xl mb-2">📊</div>
                  <div>統計データがありません</div>
                </div>
              )}
            </div>
          )}
        </div>


      </main>
    </PageTransition>
  );
} 