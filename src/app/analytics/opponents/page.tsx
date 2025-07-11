"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, LoadingSpinner } from '@/components';
import { OpponentsData } from "@/lib/analytics";

export default function OpponentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<OpponentsData | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      fetchOpponentsData();
    }
  }, [user, loading]);

  const fetchOpponentsData = async () => {
    setApiLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/analytics/opponents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || "データ取得に失敗しました");
      }
    } catch {
      setError("データ取得に失敗しました");
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
  if (error) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
          <div className="px-4 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">エラーが発生しました</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchOpponentsData}
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

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">対戦相手別成績</h1>
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          {data && (
            <div className="space-y-4">
              {/* 全体統計 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-3">📊 全体統計</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{data.overview.totalOpponents}</div>
                    <div className="text-sm text-gray-600">対戦相手数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{data.overview.totalMatches}</div>
                    <div className="text-sm text-gray-600">総試合数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{data.overview.averageWinRate}%</div>
                    <div className="text-sm text-gray-600">平均勝率</div>
                  </div>
                </div>
              </div>

              {/* 対戦相手別詳細 */}
              {data.opponents.map((opponent) => (
                <div key={opponent.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{opponent.name}</h3>
                    <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                      opponent.winRate >= 60 ? 'bg-green-100 text-green-700' :
                      opponent.winRate >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {opponent.winRate}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{opponent.totalMatches}</div>
                      <div className="text-xs text-gray-600">試合数</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{opponent.wins}</div>
                      <div className="text-xs text-gray-600">勝利</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{opponent.losses}</div>
                      <div className="text-xs text-gray-600">敗戦</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">{opponent.draws}</div>
                      <div className="text-xs text-gray-600">引き分け</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    最終対戦: {new Date(opponent.lastMatch).toLocaleDateString('ja-JP')}
                  </div>
                  
                  {/* 最近の調子 */}
                  {opponent.recentForm.length > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs text-gray-600">最近の調子:</span>
                      {opponent.recentForm.map((result, index) => (
                        <span
                          key={index}
                          className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                            result === '勝ち' ? 'bg-green-100 text-green-700' :
                            result === '負け' ? 'bg-red-100 text-red-700' :
                            result === '引き分け' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {result === '勝ち' ? 'W' : result === '負け' ? 'L' : result === '引き分け' ? 'D' : '?'}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* セット統計 */}
                  {opponent.totalMatchesWithSets > 0 && (
                    <div className="text-xs text-gray-500">
                      平均セット数: {opponent.averageSets} ({opponent.totalMatchesWithSets}試合)
                    </div>
                  )}
                </div>
              ))}
              
              {data.opponents.length === 0 && (
                <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-gray-200">
                  <div className="text-4xl mb-2">👥</div>
                  <div>対戦相手データがありません</div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  );
} 