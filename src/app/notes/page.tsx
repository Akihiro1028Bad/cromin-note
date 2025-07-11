"use client";
import { useEffect, useState } from "react";
import { NoteWithRelations } from "@/types/database";
import { PageTransition, AnimatedButton, LoadingSpinner } from '@/components';
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes/public');
      if (!res.ok) throw new Error('ノート取得APIエラー');
      const json = await res.json();
      console.log('Fetched notes data:', json.notes); // デバッグ用
      // 日付データのデバッグ
      if (json.notes && json.notes.length > 0) {
        console.log('First note createdAt:', json.notes[0].createdAt);
      }
      setNotes(json.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100">
        {/* ヘッダー - モバイルファースト */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">みんなのノート</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/")}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
                <button
                  onClick={() => router.push("/analytics")}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* 統計情報 - モバイル最適化 */}
          <div className="px-4 pb-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                <div className="text-lg font-bold text-blue-700">{notes.length}</div>
                <div className="text-xs text-gray-600">公開ノート</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                <div className="text-lg font-bold text-green-700">
                  {notes.filter(note => note.result?.name === '勝ち').length}
                </div>
                <div className="text-xs text-gray-600">勝利記録</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
                <div className="text-lg font-bold text-purple-700">
                  {new Set(notes.map(note => note.user.nickname)).size}
                </div>
                <div className="text-xs text-gray-600">参加プレイヤー</div>
              </div>
            </div>
          </div>
        </div>

        {/* ノート一覧 */}
        <div className="px-4 py-4">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏓</div>
              <div className="text-xl font-bold text-gray-900 mb-4">まだ公開されたノートがありません</div>
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
                        </div>
                        <span className="text-xs text-gray-400">
                          {note.createdAt ? new Date(note.createdAt).toLocaleDateString('ja-JP') : '日付不明'}
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
                      {note.scoreSets && note.scoreSets.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="text-green-500">🏆</span>
                          <span>
                            {(() => {
                              const wonSets = note.scoreSets.filter((set) => set.myScore > set.opponentScore).length;
                              const totalSets = note.scoreSets.length;
                              return `${wonSets}/${totalSets} セット`;
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* カードフッター */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="text-gray-400">👤</span>
                          <span>{note.user.nickname || '匿名'}</span>
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
      </main>
    </PageTransition>
  );
} 