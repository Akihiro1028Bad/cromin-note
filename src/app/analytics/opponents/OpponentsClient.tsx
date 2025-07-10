"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import { OpponentsData, OpponentData } from "@/lib/analytics";

interface OpponentsClientProps {
  initialData: OpponentsData;
}

export default function OpponentsClient({ initialData }: OpponentsClientProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<OpponentData | null>(null);
  const router = useRouter();

  const { overview, opponents } = initialData;

  if (!opponents || opponents.length === 0) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
          <div className="px-4 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">対戦相手データがありません</h1>
              <p className="text-gray-600 mb-6">試合記録を投稿して対戦相手データを蓄積しましょう！</p>
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
                <h1 className="text-lg font-bold text-gray-900 ml-2">対戦相手データ</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/")}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="ダッシュボード"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push("/notes")}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
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
          {/* 全体統計カード */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 text-center">
              <div className="text-xl font-bold text-blue-600 mb-1">{overview.totalOpponents}</div>
              <div className="text-xs text-gray-600">対戦相手数</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 text-center">
              <div className="text-xl font-bold text-green-600 mb-1">{overview.totalMatches}</div>
              <div className="text-xs text-gray-600">総試合数</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 text-center">
              <div className="text-xl font-bold text-yellow-600 mb-1">{overview.averageWinRate}%</div>
              <div className="text-xs text-gray-600">平均勝率</div>
            </div>
          </div>

          {/* 対戦相手一覧 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">対戦相手一覧</h3>
            <div className="space-y-3">
              {opponents.map((opponent) => (
                <div
                  key={opponent.name}
                  className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedOpponent(opponent)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-900 font-semibold text-sm truncate">{opponent.name}</span>
                    <span className={`text-xs font-bold ${
                      opponent.winRate >= 60 ? 'text-green-600' :
                      opponent.winRate >= 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {opponent.winRate}%
                    </span>
                  </div>
                  
                  <div className="text-gray-600 text-xs mb-2">
                    {opponent.totalMatches}試合 ({opponent.wins}勝{opponent.losses}敗{opponent.draws}分)
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>初戦: {new Date(opponent.firstMatch).toLocaleDateString('ja-JP')}</span>
                    <span>最終: {new Date(opponent.lastMatch).toLocaleDateString('ja-JP')}</span>
                  </div>
                  
                  {opponent.averageSets > 0 && (
                    <div className="text-xs text-blue-600 mt-2">
                      平均セット数: {opponent.averageSets}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 対戦相手詳細モーダル */}
        {selectedOpponent && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOpponent(null)}
          >
            <div
              className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* モーダルヘッダー */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">{selectedOpponent.name}</h2>
                <button
                  onClick={() => setSelectedOpponent(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* モーダルコンテンツ */}
              <div className="p-4 space-y-4">
                {/* 基本統計 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">基本統計</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">総試合数</span>
                      <span className="text-blue-600 font-bold">{selectedOpponent.totalMatches}試合</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">勝率</span>
                      <span className="text-green-600 font-bold">{selectedOpponent.winRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">勝利</span>
                      <span className="text-green-600 font-bold">{selectedOpponent.wins}試合</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">敗戦</span>
                      <span className="text-red-600 font-bold">{selectedOpponent.losses}試合</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">引き分け</span>
                      <span className="text-yellow-600 font-bold">{selectedOpponent.draws}試合</span>
                    </div>
                    {selectedOpponent.averageSets > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">平均セット数</span>
                        <span className="text-blue-600 font-bold">{selectedOpponent.averageSets}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 試合タイプ別成績 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">試合タイプ別成績</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedOpponent.typeStats).map(([type, stats]) => (
                      <div key={type} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{type}</span>
                        <div className="text-right">
                          <div className="text-blue-600 font-bold">{stats.winRate}%</div>
                          <div className="text-gray-500 text-xs">{stats.total}試合</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 最近の調子 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">最近の調子（最新5試合）</h3>
                  <div className="flex gap-2">
                    {selectedOpponent.recentForm.map((result, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          result === '勝ち' ? 'bg-green-100 text-green-800' :
                          result === '負け' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {result}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 試合履歴 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">試合履歴</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedOpponent.matches.slice(0, 10).map((match) => (
                      <div key={match.id} className="bg-white rounded-lg p-2">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <div className="text-gray-900 font-semibold text-sm">
                              {match.title || '無題'}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {match.noteType} • {new Date(match.createdAt).toLocaleDateString('ja-JP')}
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
                          {match.wonSets && match.totalSets && 
                            `スコア: ${match.wonSets}-${match.totalSets - match.wonSets}`
                          }
                          {match.matchDuration && ` • 試合時間: ${match.matchDuration}分`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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