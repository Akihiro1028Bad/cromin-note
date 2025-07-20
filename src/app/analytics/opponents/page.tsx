"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition, LoadingSpinner } from "../../../components";

interface OpponentStats {
  name: string;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgMatchDuration: number;
  avgSets: number;
  currentStreak: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  lastMatch: string | null;
  firstMatch: string | null;
}

interface OpponentsData {
  opponents: OpponentStats[];
  summary: {
    totalOpponents: number;
    avgWinRate: number;
    maxWinStreak: number;
  };
}

export default function OpponentsPage() {
  const [data, setData] = useState<OpponentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchOpponents();
  }, []);

  const fetchOpponents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ログインが必要です');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({
        limit: '50'
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const res = await fetch(`/api/analytics/opponents?${params}`, {
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
      console.error('Opponents fetch error:', error);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchOpponents();
  };





  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  if (error) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-gray-100 pb-20">
          <div className="px-4 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">エラーが発生しました</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={fetchOpponents}
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

  if (!data || data.opponents.length === 0) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-gray-100 pb-20">
          <div className="px-4 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">対戦相手データがありません</h1>
              <p className="text-gray-600 mb-6">試合記録を投稿して対戦相手分析を開始しましょう！</p>
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

  const { opponents, summary } = data;

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <button
                  onClick={() => router.push("/analytics")}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-lg font-bold text-gray-900 ml-2">対戦相手分析</h1>
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
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          {/* 検索・フィルター */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="対戦相手名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                検索
              </button>
            </div>
          </div>

          

          {/* 対戦相手一覧 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">対戦相手一覧</h3>
            <div className="space-y-3">
              {opponents.map((opponent) => (
                <div
                  key={opponent.name}
                  className="border-b border-gray-100 pb-3 last:border-b-0 cursor-pointer hover:bg-gray-50 rounded-lg p-3 transition-colors"
                  onClick={() => router.push(`/analytics/opponents/${encodeURIComponent(opponent.name)}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{opponent.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {opponent.lastMatch ? new Date(opponent.lastMatch).toLocaleDateString("ja-JP") : 'なし'}
                    </span>
                  </div>
                  

                </div>
              ))}
            </div>
          </div>
        </div>


      </main>
    </PageTransition>
  );
}

 