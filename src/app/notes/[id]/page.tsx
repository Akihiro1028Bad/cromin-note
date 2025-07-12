"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NoteWithRelations } from "@/types/database";
import { PageTransition, LoadingSpinner, Button } from '@/components';
import { parseScoreData, formatScoreDisplay, getMatchResult } from "@/lib/scoreUtils";
import { useAuth } from "@/hooks/useAuth";

export default function NoteDetailPage() {
  const { user } = useAuth();
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
        <main className="min-h-screen bg-bg-primary">
          <div className="px-4 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h1 className="text-xl font-bold text-text-primary mb-4">エラー</h1>
              <p className="text-text-secondary mb-6">{error || 'ノートが見つかりません'}</p>
              <div className="space-y-3">
                <Button 
                  fullWidth 
                  color="blue" 
                  size="lg" 
                  onClick={() => router.push("/home")}
                >
                  ホームに戻る
                </Button>
                <Button 
                  fullWidth 
                  color="gray" 
                  size="md" 
                  onClick={() => router.push("/notes")}
                >
                  ノート一覧
                </Button>
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
      <main className="min-h-screen bg-bg-primary">
        {/* ヘッダー */}
        <div className="bg-bg-secondary border-b border-border-color shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-text-secondary hover:text-text-primary transition-colors duration-200 rounded-lg hover:bg-gray-100"
                  title="戻る"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-lg font-bold text-text-primary">ノート詳細</h1>
                  <p className="text-xs text-text-secondary">
                    {note.noteType?.name || '不明'} • {new Date(note.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* 自分のノートの場合のみ編集ボタンを表示 */}
                {user && note.userId === user.id && (
                  <Button
                    color="blue"
                    size="md"
                    onClick={() => router.replace(`/notes/${note.id}/edit`)}
                  >
                    編集
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-6">
          {/* ノート詳細カード */}
          <div className="bg-bg-secondary rounded-lg shadow-sm border border-border-color overflow-hidden">
            {/* ヘッダー情報 */}
            <div className="p-4 border-b border-border-color">
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {note.noteType?.name || '不明'}
                  </span>
                  {note.result && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      note.result.name === '勝ち' ? 'bg-success/10 text-success' :
                      note.result.name === '負け' ? 'bg-danger/10 text-danger' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {note.result.name}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    note.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {note.isPublic ? '公開' : '非公開'}
                  </span>
                </div>
                <span className="text-xs text-text-secondary">
                  {new Date(note.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>

              {/* タイトル */}
              {note.title && (
                <h2 className="text-lg font-bold text-text-primary mb-2">
                  {note.title}
                </h2>
              )}

              {/* 対戦相手 */}
              {note.noteOpponents && note.noteOpponents.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="text-primary">👤</span>
                  <span>
                    対戦相手: {note.noteOpponents.map(no => no.opponent.name).join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* メインコンテンツ */}
            <div className="p-4 space-y-4">
              {/* 内容 */}
              {note.content && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-text-secondary">📝</span>
                    <span className="font-medium text-text-primary text-sm">内容</span>
                  </div>
                  <p className="text-text-primary leading-relaxed whitespace-pre-wrap text-sm">
                    {note.content}
                  </p>
                </div>
              )}

              {/* スコア・試合詳細（試合時のみ） */}
              {(scoreData || note.noteType?.name === 'ゲーム練習' || note.noteType?.name === '公式試合') && (
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-primary">🏆</span>
                    <span className="font-bold text-primary text-sm">試合スコア・詳細</span>
                  </div>
                  <div className="text-primary text-sm space-y-2">
                    {scoreData && (() => {
                      const scoreSets = parseScoreData(scoreData);
                      if (scoreSets.length > 0) {
                        const result = getMatchResult(scoreSets);
                        const wonSets = scoreSets.filter((set) => set.myScore > set.opponentScore).length;
                        const lostSets = scoreSets.filter((set) => set.myScore < set.opponentScore).length;
                        const totalSets = scoreSets.length;
                        
                        return (
                          <>
                            <div className="font-semibold">勝ち負け: {result}</div>
                            <div>セット: {wonSets}-{lostSets}</div>
                            
                            {/* セット別スコア */}
                            <div className="mt-2 pt-2 border-t border-primary/20">
                              <div className="font-medium mb-1">セット別スコア:</div>
                              {scoreSets.map((set, index) => (
                                <div key={index} className="text-primary">
                                  セット{set.setNumber}: {set.myScore}-{set.opponentScore}
                                </div>
                              ))}
                            </div>
                            
                            {note.matchDuration && (
                              <div>試合時間: {note.matchDuration}分</div>
                            )}
                          </>
                        );
                      } else {
                        return <div>スコアデータの読み込みに失敗しました</div>;
                      }
                    })()}
                    
                    {/* DBに保存されたセット数（スコアデータがない場合） */}
                    {!scoreData && note.totalSets && note.wonSets && (
                      <>
                        <div className="font-semibold">勝ち負け: {note.wonSets > note.totalSets / 2 ? '勝ち' : '負け'}</div>
                        <div>セット: {note.wonSets}-{note.totalSets - note.wonSets}</div>
                        {note.matchDuration && (
                          <div>試合時間: {note.matchDuration}分</div>
                        )}
                      </>
                    )}
                    
                    {/* データがない場合のメッセージ */}
                    {!scoreData && !note.totalSets && (
                      <div className="italic">
                        スコアやセット数の詳細データがありません
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* メモ・体調 */}
              {(note.memo || note.condition) && (
                <div className="bg-warning/5 rounded-lg p-3 border border-warning/20">
                  <div className="space-y-3">
                    {note.memo && (
                      <div className="flex items-start gap-2 text-warning">
                        <span className="text-warning mt-0.5">💭</span>
                        <div>
                          <span className="font-medium text-sm">メモ</span>
                          <div className="text-text-primary mt-1 whitespace-pre-wrap text-sm">{note.memo}</div>
                        </div>
                      </div>
                    )}
                    {note.condition && (
                      <div className="flex items-center gap-2 text-warning">
                        <span className="text-warning">💪</span>
                        <div>
                          <span className="font-medium text-sm">体調・気分</span>
                          <div className="text-text-primary mt-1 text-sm">{note.condition}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="px-4 py-3 bg-gray-50 border-t border-border-color">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <span className="text-text-secondary">👤</span>
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
            className="w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
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