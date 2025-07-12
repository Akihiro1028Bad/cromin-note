"use client";
import { useAuth } from "@/hooks/useAuth";
import { PageTransition, LoadingSpinner, Button } from '@/components';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface OpponentData {
  overview: {
    totalOpponents: number;
    totalMatches: number;
    averageWinRate: number;
  };
  opponents: Array<{
    name: string;
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    recentForm: string[];
    lastMatchDate: string;
  }>;
}

export default function OpponentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<OpponentData | null>(null);
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
      router.replace('/auth');
    }
  }, [shouldRedirect, router]);

  useEffect(() => {
    if (!loading && user) {
      fetchOpponentsData();
    }
  }, [user, loading]);

  const fetchOpponentsData = async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/analytics/opponents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
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
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">対戦相手別成績</h1>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          {/* 全体統計 */}
          {data && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">📊 全体統計</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">{data.overview.totalOpponents}</div>
                    <div className="text-sm text-gray-600">対戦相手数</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">{data.overview.totalMatches}</div>
                    <div className="text-sm text-gray-600">総試合数</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                    <div className="text-2xl font-bold text-purple-600">{data.overview.averageWinRate}%</div>
                    <div className="text-sm text-gray-600">平均勝率</div>
                  </div>
                </div>
              </div>

              {/* 対戦相手別詳細 */}
              <div className="space-y-4">
                {data.opponents.map((opponent, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">{opponent.name}</h3>
                    
                    <div className="grid grid-cols-4 gap-2 mt-3">
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

                    <div className="mt-3 text-sm text-gray-500 mb-2">
                      <span className="text-xs text-gray-600">最近の調子:</span>
                      <div className="flex gap-1 mt-1">
                        {opponent.recentForm.map((result, i) => (
                          <span
                            key={i}
                            className={`w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                              result === 'W' ? 'bg-green-500 text-white' :
                              result === 'L' ? 'bg-red-500 text-white' :
                              'bg-yellow-500 text-white'
                            }`}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      最終対戦: {new Date(opponent.lastMatchDate).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                ))}

                {data.opponents.length === 0 && (
                  <div className="text-center py-8 text-gray-400 bg-white rounded-lg border border-gray-200">
                    <div className="text-4xl mb-2">👥</div>
                    <div>対戦相手のデータがありません</div>
                    <div className="text-sm mt-2">試合記録を投稿して分析を開始しましょう！</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </PageTransition>
  );
} 