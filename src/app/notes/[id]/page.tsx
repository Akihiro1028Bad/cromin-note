"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NoteWithRelations } from "@/types/database";
import { PageTransition, LoadingSpinner } from '@/components';
import { parseScoreData, formatScoreDisplay, getMatchResult } from "@/lib/scoreUtils";

export default function NoteDetailPage() {
  const [note, setNote] = useState<NoteWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  useEffect(() => {
    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  const fetchNote = async () => {
    try {
      const res = await fetch(`/api/notes/${noteId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('ノートが見つかりません');
        } else {
          throw new Error('ノート取得エラー');
        }
        return;
      }
      const data = await res.json();
      setNote(data.note);
    } catch (error) {
      console.error('Error fetching note:', error);
      setError('ノートの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  if (error || !note) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
          <div className="px-4 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h1 className="text-xl font-bold text-gray-900 mb-4">エラー</h1>
              <p className="text-gray-600 mb-6">{error || 'ノートが見つかりません'}</p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/")}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  ダッシュボード
                </button>
                <button
                  onClick={() => router.push("/notes")}
                  className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  ノート一覧
                </button>
              </div>
            </div>
          </div>
        </main>
      </PageTransition>
    );
  }

  // スコアデータをscoreSetsから生成
  const generateScoreData = () => {
    if (!note.scoreSets || note.scoreSets.length === 0) return null;
    return JSON.stringify(note.scoreSets.map(set => ({
      setNumber: set.setNumber,
      myScore: set.myScore,
      opponentScore: set.opponentScore
    })));
  };

  const scoreData = generateScoreData();

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
                <h1 className="text-lg font-bold text-gray-900 ml-2">ノート詳細</h1>
              </div>
              {/* 自分のノートの場合のみ編集ボタンを表示 */}
              {note.userId && (
                <button
                  onClick={() => router.push(`/notes/${note.id}/edit`)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  編集
                </button>
              )}
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          {/* ノート詳細カード */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* ヘッダー情報 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {note.noteType?.name || '不明'}
                  </span>
                  {note.result && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      note.result.name === '勝ち' ? 'bg-green-100 text-green-800' :
                      note.result.name === '負け' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {note.result.name}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    note.isPublic ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {note.isPublic ? '公開' : '非公開'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(note.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>

              {/* タイトル */}
              {note.title && (
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {note.title}
                </h2>
              )}

              {/* 対戦相手 */}
              {note.opponent && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-blue-500">👤</span>
                  <span>対戦相手: {note.opponent}</span>
                </div>
              )}
            </div>

            {/* メインコンテンツ */}
            <div className="p-4 space-y-4">
              {/* 内容 */}
              {note.content && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-500">📝</span>
                    <span className="font-medium text-gray-700 text-sm">内容</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                    {note.content}
                  </p>
                </div>
              )}

              {/* スコア情報 */}
              {scoreData && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-blue-600">🏆</span>
                    <span className="font-bold text-blue-700 text-sm">試合スコア</span>
                  </div>
                  <div className="text-blue-600 text-sm space-y-1">
                    {(() => {
                      const scoreSets = parseScoreData(scoreData);
                      if (scoreSets.length > 0) {
                        const result = getMatchResult(scoreSets);
                        const scoreText = formatScoreDisplay(scoreSets);
                        return (
                          <>
                            <div className="font-semibold">結果: {result}</div>
                            <div>スコア: {scoreText}</div>
                            <div>獲得セット: {note.wonSets}/{note.totalSets}</div>
                            {note.matchDuration && <div>試合時間: {note.matchDuration}分</div>}
                          </>
                        );
                      } else {
                        return <div>スコアデータの読み込みに失敗しました</div>;
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* 試合詳細（試合時のみ） */}
              {(note.noteType?.name === 'ゲーム練習' || note.noteType?.name === '公式試合') && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-green-600">📊</span>
                    <span className="font-bold text-green-700 text-sm">試合詳細</span>
                  </div>
                  <div className="text-green-600 text-sm space-y-1">
                    {/* DBに保存されたセット数 */}
                    {note.totalSets && note.wonSets && (
                      <>
                        <div className="font-semibold">セット数: {note.wonSets}/{note.totalSets}</div>
                        <div className="text-green-500">
                          勝率: {Math.round((note.wonSets / note.totalSets) * 100)}%
                        </div>
                      </>
                    )}
                    
                    {/* DBに保存されたスコアデータ */}
                    {scoreData && (() => {
                      const scoreSets = parseScoreData(scoreData);
                      if (scoreSets.length > 0) {
                        const totalPoints = scoreSets.reduce((sum, set) => sum + set.myScore + set.opponentScore, 0);
                        const myTotalPoints = scoreSets.reduce((sum, set) => sum + set.myScore, 0);
                        const opponentTotalPoints = scoreSets.reduce((sum, set) => sum + set.opponentScore, 0);
                        
                        return (
                          <>
                            <div className="font-semibold">総得点: {myTotalPoints}-{opponentTotalPoints}</div>
                            <div className="text-green-500">
                              得点率: {Math.round((myTotalPoints / totalPoints) * 100)}%
                            </div>
                            
                            {/* セット別スコア */}
                            <div className="mt-2 pt-2 border-t border-green-200">
                              <div className="font-medium mb-1">セット別スコア:</div>
                              {scoreSets.map((set, index) => (
                                <div key={index} className="text-green-600">
                                  セット{set.setNumber}: {set.myScore}-{set.opponentScore}
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      } else {
                        return <div>スコアデータの読み込みに失敗しました</div>;
                      }
                    })()}
                    
                    {/* DBに保存された試合時間 */}
                    {note.matchDuration && (
                      <div className="text-green-500">
                        試合時間: {note.matchDuration}分
                      </div>
                    )}
                    
                    {/* データがない場合のメッセージ */}
                    {!note.totalSets && !scoreData && (
                      <div className="text-green-500 italic">
                        セット数やスコアの詳細データがありません
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* メモ・体調 */}
              {(note.memo || note.condition) && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                  <div className="space-y-3">
                    {note.memo && (
                      <div className="flex items-start gap-2 text-yellow-700">
                        <span className="text-yellow-500 mt-0.5">💭</span>
                        <div>
                          <span className="font-medium text-sm">メモ</span>
                          <div className="text-gray-700 mt-1 whitespace-pre-wrap text-sm">{note.memo}</div>
                        </div>
                      </div>
                    )}
                    {note.condition && (
                      <div className="flex items-center gap-2 text-yellow-700">
                        <span className="text-yellow-500">💪</span>
                        <div>
                          <span className="font-medium text-sm">体調・気分</span>
                          <div className="text-gray-700 mt-1 text-sm">{note.condition}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span className="text-gray-400">👤</span>
                  <span>投稿者: {note.user?.nickname || '匿名'}</span>
                </div>
              </div>
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