"use client";
import { useEffect, useState } from "react";
import { NoteWithRelations } from "@/types/database";
import { PageTransition, Button, LoadingSpinner } from '@/components';
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
      <main className="min-h-screen bg-bg-primary">
        {/* ヘッダー */}
        <div className="bg-bg-secondary border-b border-border-color shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-text-primary">みんなのノート</h1>
              <Button
                color="blue"
                size="md"
                onClick={() => router.push("/notes/new")}
              >
                新規作成
              </Button>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-6">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <div className="text-xl font-bold text-text-primary mb-4">まだ公開されたノートがありません</div>
              <div className="text-text-secondary mb-6">最初のノートを投稿してみましょう！</div>
              <Button 
                fullWidth 
                color="blue" 
                size="lg" 
                onClick={() => router.push("/notes/new")}
              >
                ノートを投稿する
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-bg-secondary rounded-lg shadow-sm border border-border-color overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200"
                  onClick={() => router.push(`/notes/${note.id}`)}
                >
                  {/* カードヘッダー */}
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
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
                      </div>
                      <span className="text-xs text-text-secondary">
                        {note.createdAt ? new Date(note.createdAt).toLocaleDateString('ja-JP') : '日付不明'}
                      </span>
                    </div>
                    
                    {/* タイトル */}
                    {note.title && (
                      <h3 className="font-semibold text-base text-text-primary line-clamp-1 mb-3">
                        {note.title}
                      </h3>
                    )}
                    
                    {/* 対戦相手 */}
                    {note.noteOpponents && note.noteOpponents.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                        <span className="text-primary">👤</span>
                        <span className="truncate">
                          {note.noteOpponents.map(no => no.opponent.name).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {/* 内容のプレビュー */}
                    {note.content && (
                      <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed mb-3">
                        {note.content}
                      </p>
                    )}
                    
                    {/* スコアの概要 */}
                    {note.scoreSets && note.scoreSets.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                        <span className="text-success">🏆</span>
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
                  <div className="px-4 py-3 bg-gray-50 border-t border-border-color">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="text-text-secondary">👤</span>
                        <span>{note.user.nickname || '匿名'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
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
            className="bg-primary text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:-translate-y-0.5"
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