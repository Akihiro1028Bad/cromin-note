"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

import { PageTransition, AnimatedButton, LoadingSpinner } from '@/components';
import { motion } from "framer-motion";

// Prismaの生成された型を使用
type NoteWithPrismaRelations = {
  id: string;
  title: string | null;
  opponent: string | null;
  content: string | null;
  memo: string | null;
  condition: string | null;
  isPublic: boolean;
  typeId: number;
  resultId: number | null;
  scoreData: string | null;
  totalSets: number | null;
  wonSets: number | null;
  matchDuration: number | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    nickname: string | null;
  };
  noteType: {
    id: number;
    name: string;
  };
  result: {
    id: number;
    name: string;
  } | null;
};

export default function MyPage() {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState<NoteWithPrismaRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.replace("/auth");
      return;
    }

    fetchMyNotes();
  }, [user, authLoading, router]);

  const fetchMyNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch('/api/notes/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      console.log('My notes data:', data); // デバッグ用
      setNotes(data.notes || []);
    } catch {
      console.error('Error fetching notes');
    } finally {
      setLoading(false);
    }
  };

  // 試合結果の統計を計算
  const calculateMatchStats = () => {
    const gameNotes = notes.filter(note => 
      note.noteType?.name === 'ゲーム練習' || note.noteType?.name === '公式試合'
    );
    
    let totalMatches = 0;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let totalSets = 0;
    let wonSets = 0;
    let totalDuration = 0;

    gameNotes.forEach(note => {
      if (note.result) {
        totalMatches++;
        if (note.result.name === '勝ち') wins++;
        else if (note.result.name === '負け') losses++;
        else if (note.result.name === '引き分け') draws++;
      }
      
      if (note.totalSets) totalSets += note.totalSets;
      if (note.wonSets) wonSets += note.wonSets;
      if (note.matchDuration) totalDuration += note.matchDuration;
    });

    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    const setWinRate = totalSets > 0 ? Math.round((wonSets / totalSets) * 100) : 0;

    return {
      totalMatches,
      wins,
      losses,
      draws,
      winRate,
      totalSets,
      wonSets,
      setWinRate,
      totalDuration
    };
  };



  const handleDelete = async (noteId: string) => {
    if (!confirm('このノートを削除しますか？')) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      fetchMyNotes(); // 一覧を再取得
    } catch {
      console.error('Error deleting note');
      alert('削除に失敗しました。');
    }
  };

  if (authLoading || loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (!user) return null;

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100" style={{ backgroundColor: '#f3f4f6' }}>
        {/* ヘッダー - モバイルファースト */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10" style={{ backgroundColor: '#ffffff' }}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">マイページ</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="p-2 text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push("/notes")}
                  className="p-2 text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push("/analytics")}
                  className="p-2 text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ユーザー情報 */}
        <div className="px-4 py-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
            <h2 className="text-lg font-bold mb-3 text-gray-900">ユーザー情報</h2>
            <div className="text-sm text-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-500">📧</span>
                <span>{user.email}</span>
              </div>
              {user.nickname && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">👤</span>
                  <span>{user.nickname}</span>
                </div>
              )}
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-3 text-gray-900">統計情報</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                <div className="text-lg font-bold text-blue-700">{notes.length}</div>
                <div className="text-xs text-gray-600">投稿数</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                <div className="text-lg font-bold text-purple-700">
                  {notes.filter(note => note.isPublic).length}
                </div>
                <div className="text-xs text-gray-600">公開</div>
              </div>
            </div>
            
            {/* 試合結果統計 */}
            {(() => {
              const stats = calculateMatchStats();
              if (stats.totalMatches === 0) return null;
              
              return (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="text-base font-bold mb-3 text-gray-900">🏆 試合結果統計</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100">
                      <div className="text-sm font-bold text-green-700">{stats.totalMatches}</div>
                      <div className="text-xs text-gray-600">試合数</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100">
                      <div className="text-sm font-bold text-green-700">{stats.wins}</div>
                      <div className="text-xs text-gray-600">勝利</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 text-center border border-red-100">
                      <div className="text-sm font-bold text-red-700">{stats.losses}</div>
                      <div className="text-xs text-gray-600">敗戦</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2 text-center border border-yellow-100">
                      <div className="text-sm font-bold text-yellow-700">{stats.winRate}%</div>
                      <div className="text-xs text-gray-600">勝率</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
                      <div className="text-sm font-bold text-blue-700">{stats.setWinRate}%</div>
                      <div className="text-xs text-gray-600">セット勝率</div>
                    </div>
                    {stats.totalDuration > 0 && (
                      <div className="bg-indigo-50 rounded-lg p-2 text-center border border-indigo-100">
                        <div className="text-sm font-bold text-indigo-700">{Math.round(stats.totalDuration / 60)}h</div>
                        <div className="text-xs text-gray-600">総試合時間</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ノート一覧 */}
          <div>
            <h2 className="text-lg font-bold mb-3 text-gray-900">自分のノート一覧</h2>
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <div className="text-xl font-bold text-gray-900 mb-4">まだノートがありません</div>
                <div className="text-gray-600 mb-6">最初のノートを投稿してみましょう！</div>
                <AnimatedButton size="md" onClick={() => router.push("/notes/new") }>
                  <span className="text-white font-bold">ノートを投稿する</span>
                </AnimatedButton>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-95 transition-transform"
                    onClick={() => router.push(`/notes/${note.id}`)}
                  >
                    {/* カードヘッダー */}
                    <div className="p-4 pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {note.noteType?.name || `不明 (type_id: ${note.typeId})`}
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
                        <h3 className="font-semibold text-base text-gray-900 line-clamp-1 mb-2">
                          {note.title}
                        </h3>
                      )}
                      
                      {/* 対戦相手 */}
                      {note.opponent && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="text-blue-500">👤</span>
                          <span className="truncate">{note.opponent}</span>
                        </div>
                      )}
                      
                      {/* 内容のプレビュー */}
                      {note.content && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-2">
                          {note.content}
                        </p>
                      )}
                      
                      {/* スコアの概要 */}
                      {note.scoreData && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="text-green-500">🏆</span>
                          <span>
                            {(() => {
                              try {
                                const scores = JSON.parse(note.scoreData);
                                const wonSets = scores.filter((set: any) => set.myScore > set.opponentScore).length;
                                const totalSets = scores.length;
                                return `${wonSets}/${totalSets} セット`;
                              } catch (e) {
                                return 'スコアあり';
                              }
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* カードフッター */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => router.push(`/notes/${note.id}/edit`)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                          >
                            削除
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
        </div>
      </main>
    </PageTransition>
  );
} 