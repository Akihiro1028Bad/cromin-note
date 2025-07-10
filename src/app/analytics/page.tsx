"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import LoadingSpinner from "@/components/LoadingSpinner";


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
  yearlyStats: Record<string, { total: number; wins: number; losses: number; draws: number }>;
  opponentStats: Record<string, { 
    total: number; 
    wins: number; 
    losses: number; 
    draws: number; 
    winRate: number;
    lastMatch: string;
  }>;
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

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ログインが必要です');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/analytics/personal', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || 'データの取得に失敗しました');
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  if (error) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
          <div className="px-4 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">エラーが発生しました</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                再試行
              </button>
            </div>
          </div>
        </main>
      </PageTransition>
    );
  }

  if (!data) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
          <div className="px-4 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">データがありません</h1>
              <p className="text-gray-600 mb-6">試合記録を投稿して分析を開始しましょう！</p>
              <button
                onClick={() => router.push("/notes/new")}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                ノートを投稿する
              </button>
            </div>
          </div>
        </main>
      </PageTransition>
    );
  }

  const { overview, opponentStats, typeStats, recentMatches } = data;

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
        {/* スティッキーヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10" style={{ backgroundColor: '#ffffff' }}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-lg font-bold text-gray-900 ml-2">成績分析</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/")}
                  className="p-2 text-white hover:text-gray-200 transition-colors"
                  title="ダッシュボード"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push("/notes")}
                  className="p-2 text-white hover:text-gray-200 transition-colors"
                  title="ノート一覧"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          {/* 基本統計カード */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{overview.totalMatches}</div>
              <div className="text-sm text-gray-600">総試合数</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{overview.winRate}%</div>
              <div className="text-sm text-gray-600">勝率</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{overview.currentStreak}</div>
              <div className="text-sm text-gray-600">現在の連続</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">{overview.longestWinStreak}</div>
              <div className="text-sm text-gray-600">最高連勝</div>
            </div>
          </div>

          {/* 勝敗内訳カード */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">勝敗内訳</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">勝利</span>
                <span className="text-green-600 font-bold">{overview.wins}試合</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">敗戦</span>
                <span className="text-red-600 font-bold">{overview.losses}試合</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">引き分け</span>
                <span className="text-yellow-600 font-bold">{overview.draws}試合</span>
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-bold">合計</span>
                  <span className="text-blue-600 font-bold">{overview.totalMatches}試合</span>
                </div>
              </div>
            </div>
          </div>

          {/* 試合タイプ別成績カード */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">試合タイプ別成績</h3>
            <div className="space-y-3">
              {Object.entries(typeStats).map(([type, stats]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">{type}</span>
                  <div className="text-right">
                    <div className="text-blue-600 font-bold">{stats.winRate}%</div>
                    <div className="text-gray-500 text-xs">{stats.total}試合</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 対戦相手別成績カード */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-gray-900">対戦相手別成績</h3>
              <button
                onClick={() => router.push("/analytics/opponents")}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              >
                詳細
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(opponentStats)
                .slice(0, 5)
                .map(([opponent, stats]) => (
                  <div key={opponent} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-gray-900 font-semibold text-sm truncate">{opponent}</span>
                      <span className={`text-xs font-bold ${
                        stats.winRate >= 60 ? 'text-green-600' :
                        stats.winRate >= 40 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {stats.winRate}%
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs">
                      {stats.total}試合 ({stats.wins}勝{stats.losses}敗{stats.draws}分)
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 最近の試合カード */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">最近の試合</h3>
            <div className="space-y-3">
              {recentMatches.slice(0, 5).map((match) => (
                <div key={match.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <div className="text-gray-900 font-semibold text-sm">
                        {match.title || '無題'}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {match.opponent && `vs ${match.opponent}`} • {match.noteType}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      match.result === '勝ち' ? 'bg-green-100 text-green-800' :
                      match.result === '負け' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {match.result || '不明'}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(match.createdAt).toLocaleDateString('ja-JP')}
                    {match.wonSets && match.totalSets && 
                      ` • ${match.wonSets}-${match.totalSets - match.wonSets}`
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* フローティングアクションボタン */}
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={() => router.push("/notes/new")}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
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