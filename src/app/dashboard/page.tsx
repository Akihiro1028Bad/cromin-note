"use client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, LoadingSpinner } from '@/components';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AnalyticsData {
  overview: {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    currentStreak: number;
    longestWinStreak: number;
    longestLoseStreak: number;
  };
  monthlyStats: Record<string, { total: number; wins: number; losses: number; draws: number }>;
  typeStats: Record<string, { total: number; wins: number; losses: number; draws: number; winRate: number }>;
  recentMatches: Array<{
    id: string;
    title: string | null;
    opponent: string | null;
    result: string | null;
    noteType: string;
    createdAt: string;
    scoreData: string | null;
    wonSets: number | null;
    totalSets: number | null;
  }>;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchAnalytics();
    }
  }, [user, loading]);

  const fetchAnalytics = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/analytics/personal", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
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
  if (!user) {
    router.replace('/auth');
    return <LoadingSpinner size="lg" className="min-h-screen" />;
  }
  if (apiLoading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (apiError) return <div className="p-8 text-red-500">{apiError}</div>;

  // 今月の年月（YYYY-MM）
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonthStats = analytics?.monthlyStats?.[ym];
  const recentNotes = analytics?.recentMatches?.slice(0, 3) || [];


  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/notes/new")}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push("/analytics")}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
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
          {/* 今月の記録数 */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-gray-900">今月の記録数</h2>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                <div className="text-lg font-bold text-blue-700">{thisMonthStats?.total ?? 0}</div>
                <div className="text-xs text-gray-600">投稿</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                <div className="text-lg font-bold text-green-700">{thisMonthStats?.wins ?? 0}</div>
                <div className="text-xs text-gray-600">勝ち</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                <div className="text-lg font-bold text-red-700">{thisMonthStats?.losses ?? 0}</div>
                <div className="text-xs text-gray-600">負け</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                <div className="text-lg font-bold text-yellow-700">{thisMonthStats?.draws ?? 0}</div>
                <div className="text-xs text-gray-600">分け</div>
              </div>
            </div>
          </div>

          {/* 直近のノート一覧 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">直近のノート</h2>
              <button
                onClick={() => router.push("/mypage")}
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
                      <span className="text-blue-600 font-bold text-sm">{note.noteType}</span>
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
                  <div className="font-semibold text-sm text-gray-900 mb-1">
                    {note.title || "タイトルなし"}
                  </div>
                  {note.opponent && (
                    <div className="text-xs text-gray-500">
                      対戦相手: {note.opponent}
                    </div>
                  )}
                </div>
              ))}
              {recentNotes.length === 0 && (
                <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-gray-200">
                  <div className="text-4xl mb-2">📝</div>
                  <div>直近のノートはありません</div>
                </div>
              )}
            </div>
          </div>

          {/* クイックアクション */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-gray-900">クイックアクション</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/notes/new")}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                ノート投稿
              </button>
              <button
                onClick={() => router.push("/notes")}
                className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                みんなのノート
              </button>
              <button
                onClick={() => router.push("/analytics")}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                成績分析
              </button>
            </div>
          </div>

          {/* 統計サマリー */}
          {analytics?.overview && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-base font-bold mb-3 text-gray-900">統計サマリー</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-700">{analytics.overview.totalMatches}</div>
                  <div className="text-xs text-gray-600">総試合数</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-700">{analytics.overview.winRate}%</div>
                  <div className="text-xs text-gray-600">勝率</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-700">{analytics.overview.currentStreak}</div>
                  <div className="text-xs text-gray-600">現在の連続</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-700">{analytics.overview.longestWinStreak}</div>
                  <div className="text-xs text-gray-600">最高連勝</div>
                </div>
              </div>
            </div>
          )}
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