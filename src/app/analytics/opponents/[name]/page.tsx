'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PageTransition from '../../../../components/PageTransition';
import LoadingSpinner from '../../../../components/LoadingSpinner';

interface OpponentDetail {
  overview: {
    name: string;
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    currentStreak: number;
    longestWinStreak: number;
    longestLoseStreak: number;
    firstMatch: string;
    lastMatch: string;
  };
  recentMatches: Array<{
    id: string;
    title: string;
    result: string;
    scoreData: string | null;
    createdAt: string;
  }>;
  trends: {
    monthlyStats: Array<{ month: string; winRate: number }>;
    yearlyStats: Array<{ year: string; winRate: number }>;
  };
  tactics: Array<{
    type: string;
    description: string;
    effectiveness: number;
  }>;
  matchAnalysis: {
    practice: {
      matches: number;
      wins: number;
      losses: number;
      winRate: number;
    };
    official: {
      matches: number;
      wins: number;
      losses: number;
      winRate: number;
    };
    twoSetMatches: {
      matches: number;
      wins: number;
      losses: number;
      winRate: number;
    };
    threeSetMatches: {
      matches: number;
      wins: number;
      losses: number;
      winRate: number;
    };
  };

}

export default function OpponentDetailPage() {
  const [data, setData] = useState<OpponentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchOpponentDetail();
  }, [params.name]);

  const fetchOpponentDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ログインが必要です');
        setLoading(false);
        return;
      }

      const opponentName = decodeURIComponent(params.name as string);
      const res = await fetch(`/api/analytics/opponents/${encodeURIComponent(opponentName)}`, {
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
      console.error('Opponent detail fetch error:', error);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClick = (matchId: string) => {
    router.push(`/notes/${matchId}`);
  };

  const formatScore = (scoreData: string | null) => {
    if (!scoreData) return '';
    try {
      const scores = JSON.parse(scoreData);
      return scores.map((set: any) => `${set.myScore}-${set.opponentScore}`).join(', ');
    } catch {
      return '';
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  if (error) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-gray-100 pb-20">
          <div className="px-4 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">エラーが発生しました</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchOpponentDetail}
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
              <div className="text-6xl mb-4">👤</div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">対戦相手データがありません</h1>
              <p className="text-gray-600 mb-6">この対戦相手との試合記録が見つかりませんでした。</p>
              <button
                onClick={() => router.push("/analytics/opponents")}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                対戦相手一覧に戻る
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <button
                  onClick={() => router.push("/analytics/opponents")}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-lg font-bold text-gray-900 ml-2">{data.overview.name} の詳細分析</h1>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4 space-y-4">
          {/* 基本統計 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">基本統計</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">総対戦:</span>
                <span className="font-semibold">{data.overview.totalMatches}戦</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">勝率:</span>
                <span className="font-semibold text-green-600">{data.overview.winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">勝利:</span>
                <span className="font-semibold text-green-600">{data.overview.wins}勝</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">敗戦:</span>
                <span className="font-semibold text-red-600">{data.overview.losses}敗</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">現在の連続:</span>
                <span className="font-semibold">
                  {data.overview.currentStreak > 0 ? `${data.overview.currentStreak}連勝` : 
                   data.overview.currentStreak < 0 ? `${Math.abs(data.overview.currentStreak)}連敗` : 'なし'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最高連勝:</span>
                <span className="font-semibold">{data.overview.longestWinStreak}連勝</span>
              </div>
            </div>
          </div>

          {/* 全試合共通分析 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="space-y-4">
              {/* 練習試合 */}
              <div className="border-b border-gray-100 pb-3 last:border-b-0">
                <h4 className="font-semibold text-gray-800 mb-2">練習試合</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">試合数:</span>
                    <span className="font-semibold">{data.matchAnalysis.practice.matches}戦</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">勝率:</span>
                    <span className="font-semibold text-green-600">{data.matchAnalysis.practice.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">勝利:</span>
                    <span className="font-semibold text-green-600">{data.matchAnalysis.practice.wins}勝</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">敗戦:</span>
                    <span className="font-semibold text-red-600">{data.matchAnalysis.practice.losses}敗</span>
                  </div>
                </div>
              </div>

              {/* 公式試合 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">公式試合</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">試合数:</span>
                    <span className="font-semibold">{data.matchAnalysis.official.matches}戦</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">勝率:</span>
                    <span className="font-semibold text-green-600">{data.matchAnalysis.official.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">勝利:</span>
                    <span className="font-semibold text-green-600">{data.matchAnalysis.official.wins}勝</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">敗戦:</span>
                    <span className="font-semibold text-red-600">{data.matchAnalysis.official.losses}敗</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2セット以上試合の分析 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="space-y-4">
              {/* 2セット先取 */}
              <div className="border-b border-gray-100 pb-3 last:border-b-0">
                <h4 className="font-semibold text-gray-800 mb-2">ストレートで終わった場合</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">試合数:</span>
                    <span className="font-semibold">{data.matchAnalysis.twoSetMatches.matches}戦</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">勝率:</span>
                    <span className="font-semibold text-green-600">{data.matchAnalysis.twoSetMatches.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">勝利:</span>
                    <span className="font-semibold text-green-600">{data.matchAnalysis.twoSetMatches.wins}勝</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">敗戦:</span>
                    <span className="font-semibold text-red-600">{data.matchAnalysis.twoSetMatches.losses}敗</span>
                  </div>
                </div>
              </div>

              {/* 3セット戦 */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">ファイナル行った場合</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">試合数:</span>
                    <span className="font-semibold">{data.matchAnalysis.threeSetMatches.matches}戦</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">勝率:</span>
                    <span className="font-semibold text-green-600">{data.matchAnalysis.threeSetMatches.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">勝利:</span>
                    <span className="font-semibold text-green-600">{data.matchAnalysis.threeSetMatches.wins}勝</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">敗戦:</span>
                    <span className="font-semibold text-red-600">{data.matchAnalysis.threeSetMatches.losses}敗</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 全試合履歴 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">全試合履歴</h3>
            <div className="space-y-2">
              {data.recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="border-b border-gray-100 pb-3 last:border-b-0 cursor-pointer hover:bg-gray-50 rounded-lg p-3 transition-colors"
                  onClick={() => handleMatchClick(match.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{match.title || 'タイトルなし'}</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        match.result === '勝ち' ? 'bg-green-100 text-green-700' :
                        match.result === '負け' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {match.result || '不明'}
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(match.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  {match.scoreData && (
                    <div className="text-sm text-gray-600">
                      スコア: {formatScore(match.scoreData)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>



          {/* 戦術提案 */}
          {data.tactics.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-3">戦術提案</h3>
              <div className="space-y-3">
                {data.tactics.map((tactic, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 text-lg">💡</span>
                      <p className="text-sm text-gray-700">{tactic.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  );
} 