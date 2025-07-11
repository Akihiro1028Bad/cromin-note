"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NoteType, Result } from "@/types/database";
import { PageTransition, LoadingSpinner, ScoreInput } from '@/components';

// スコアセット型
interface ScoreSet {
  setNumber: number;
  myScore: number;
  opponentScore: number;
}

export default function NewNotePage() {
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // フォーム状態
  const [typeId, setTypeId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [opponent, setOpponent] = useState('');
  const [content, setContent] = useState('');
  const [resultId, setResultId] = useState<number | ''>('');
  const [memo, setMemo] = useState('');
  const [condition, setCondition] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  // スコア記録機能
  const [scoreData, setScoreData] = useState<ScoreSet[]>([]);
  const [totalSets, setTotalSets] = useState(0);
  const [wonSets, setWonSets] = useState(0);
  const [matchDuration, setMatchDuration] = useState(0);

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [typesRes, resultsRes] = await Promise.all([
        fetch('/api/notes/types'),
        fetch('/api/notes/results')
      ]);
      if (!typesRes.ok || !resultsRes.ok) throw new Error('マスタデータ取得APIエラー');
      const typesJson = await typesRes.json();
      const resultsJson = await resultsRes.json();
      setNoteTypes(typesJson.types || []);
      setResults(resultsJson.results || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeId) return;

    setSubmitting(true);
    try {
      // 認証トークン取得
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          typeId,
          title,
          opponent,
          content,
          resultId,
          memo,
          condition,
          isPublic,
          scoreData: scoreData.length > 0 ? JSON.stringify(scoreData) : null,
          totalSets: totalSets > 0 ? totalSets : null,
          wonSets: wonSets > 0 ? wonSets : null,
          matchDuration: matchDuration > 0 ? matchDuration : null
        })
      });
      if (!res.ok) throw new Error('ノート投稿APIエラー');
      
      // 投稿完了後の選択肢を提供
      const shouldViewAnalytics = confirm('ノートの投稿が完了しました！\n\n成績分析ページで新しい記録を確認しますか？\n「OK」で分析ページ、「キャンセル」でノート一覧に移動します。');
      
      if (shouldViewAnalytics) {
        router.push('/analytics');
      } else {
        router.push('/notes');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert('ノートの投稿に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = noteTypes.find(t => t.id === typeId);

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-lg font-bold text-gray-900 ml-2">ノート投稿</h1>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || !typeId}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '投稿中...' : '投稿'}
              </button>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 種別選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                種別 <span className="text-red-500">*</span>
              </label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">種別を選択</option>
                {noteTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タイトルを入力"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 対戦相手 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対戦相手
              </label>
              <input
                type="text"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="対戦相手を入力"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 結果 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                結果
              </label>
              <select
                value={resultId}
                onChange={(e) => setResultId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">結果を選択</option>
                {results.map((result) => (
                  <option key={result.id} value={result.id}>
                    {result.name}
                  </option>
                ))}
              </select>
            </div>

                         {/* スコア入力 */}
             {(selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (
               <div className="bg-white rounded-lg p-4 border border-gray-200">
                 <ScoreInput
                   scoreData={scoreData}
                   onScoreChange={setScoreData}
                   totalSets={totalSets}
                   onTotalSetsChange={setTotalSets}
                   matchDuration={matchDuration}
                   onMatchDurationChange={setMatchDuration}
                 />
               </div>
             )}

            {/* 内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="練習内容や試合の詳細を記録"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* メモ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メモ
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="追加のメモがあれば記録"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* 体調 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                体調
              </label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="体調やコンディションを記録"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 公開設定 */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">公開設定</h3>
                  <p className="text-sm text-gray-600">他のプレイヤーに公開するかどうか</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </form>
        </div>
      </main>
    </PageTransition>
  );
} 