"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageTransition, LoadingSpinner } from "../../components";

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
  const [activeTab, setActiveTab] = useState<'overview' | 'trends'>('overview');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // URLパラメータからタブの状態を取得
  useEffect(() => {
    const tab = searchParams.get('tab') as 'overview' | 'opponents' | 'trends';
    if (tab && ['overview', 'opponents', 'trends'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
        <main className="min-h-screen bg-gray-100 pb-20">
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
        <main className="min-h-screen bg-gray-100 pb-20">
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
                <h1 className="text-lg font-bold text-gray-900 ml-2">成績分析</h1>
              </div>
              <button
                onClick={() => router.push("/notes/new")}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="px-4 pb-3">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 概要
              </button>
              <button
                onClick={() => router.push("/analytics/opponents")}
                className="flex-1 py-2 px-3 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                👥 対戦相手
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'trends'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📈 トレンド
              </button>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 基本統計カード */}
              <div className="grid grid-cols-2 gap-3">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
            </div>
          )}



          {activeTab === 'trends' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">最近の試合</h3>
                <div className="space-y-3">
                  {recentMatches.slice(0, 5).map((match) => (
                    <div key={match.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {match.title || "タイトルなし"}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          match.result === '勝ち' ? 'bg-green-100 text-green-700' :
                          match.result === '負け' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {match.result || '不明'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{match.opponent || '対戦相手不明'}</span>
                        <span>{new Date(match.createdAt).toLocaleDateString("ja-JP")}</span>
                      </div>
                    </div>
                  ))}
                  {recentMatches.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">📈</div>
                      <div>最近の試合データがありません</div>
                    </div>
                  )}
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