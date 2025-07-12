"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NoteType, Result } from "@/types/database";
import { PageTransition, LoadingSpinner, ScoreInput, Button, OpponentSelect, CategorySelect } from '@/components';

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
  const [opponentIds, setOpponentIds] = useState<string[]>([]); // 変更: 対戦相手ID配列
  const [content, setContent] = useState('');
  const [resultId, setResultId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
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
      
      console.log('Types API response:', typesJson);
      console.log('Results API response:', resultsJson);
      
      setNoteTypes(typesJson.noteTypes || []);
      setResults(resultsJson.results || []);
      setCategories(typesJson.categories || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeId || !title.trim()) return;
    
    // ゲーム練習・公式試合の場合はスコアと対戦相手が必須
    if (selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') {
      if (!isValidScoreData(scoreData)) {
        alert('スコアを入力してください。');
        return;
      }
      if (!isValidOpponent(opponentIds, selectedType.name)) {
        alert('対戦相手を入力してください。');
        return;
      }
      if (!categoryId) {
        alert('カテゴリを選択してください。');
        return;
      }
    }

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
          opponentIds, // 変更: 対戦相手ID配列を送信
          content,
          resultId,
          categoryId,
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
  const selectedCategory = categories.find(c => c.id === categoryId);

  // デバッグ用ログ
  console.log('Current noteTypes:', noteTypes);
  console.log('Current typeId:', typeId);
  console.log('Selected type:', selectedType);
  console.log('Current categories:', categories);
  console.log('Current categoryId:', categoryId);
  console.log('Selected category:', selectedCategory);

  // スコアデータが有効かどうかを判定する関数
  const isValidScoreData = (scores: ScoreSet[]): boolean => {
    if (scores.length === 0) return false;
    
    // 全てのセットで0-0以外のスコアが入力されているかチェック
    return scores.every(set => set.myScore > 0 || set.opponentScore > 0);
  };

  // 対戦相手が有効かどうかを判定する関数
  const isValidOpponent = (opponentIds: string[], noteType: string): boolean => {
    if (opponentIds.length === 0) return false;
    
    const isDoubles = noteType === 'ダブルス' || noteType === 'ミックスダブルス';
    if (isDoubles) {
      return opponentIds.length >= 2;
    }
    
    return opponentIds.length >= 1;
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-100 pb-24">
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
              <h1 className="text-lg font-bold text-gray-900 ml-2">ノート投稿</h1>
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
                className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  !typeId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              >
                <option value="">種別を選択</option>
                {noteTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {noteTypes.length === 0 && (
                <p className="mt-1 text-sm text-red-600">種別データが読み込まれていません</p>
              )}
            </div>

            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タイトルを入力"
                className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  !title.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
            </div>

            {/* カテゴリ選択（ゲーム練習・公式試合のみ・必須） */}
            {(selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (
              <CategorySelect
                value={categoryId}
                onChange={setCategoryId}
                required={true}
              />
            )}

            {/* 対戦相手（ゲーム練習・公式試合のみ・必須） */}
            {(selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (
              <OpponentSelect
                value={opponentIds}
                onChange={setOpponentIds}
                category={selectedCategory?.name || ''}
                isRequired={true}
              />
            )}

            {/* スコア入力（ゲーム練習・公式試合のみ・必須） */}
            {(selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-medium text-gray-700">スコア記録</h3>
                  <span className="text-red-500 text-sm">*</span>
                </div>
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

        {/* 固定フッター */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
          <div className="px-4 py-4">
            {/* 必須項目進捗バー */}
            {!submitting && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>必須項目</span>
                  <span>
                    {(() => {
                      const isGameOrMatch = selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合';
                      const total = isGameOrMatch ? 5 : 2;
                      
                      // 種別に応じて実際に必要な項目のみを配列に含める
                      const requiredItems = isGameOrMatch 
                        ? [
                            typeId,
                            title.trim(),
                            categoryId,
                            isValidOpponent(opponentIds, selectedType?.name || ''),
                            isValidScoreData(scoreData)
                          ]
                        : [
                            typeId,
                            title.trim()
                          ];
                      
                      const completed = requiredItems.filter(Boolean).length;
                      return `${completed}/${total}`;
                    })()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(() => {
                        const isGameOrMatch = selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合';
                        const total = isGameOrMatch ? 5 : 2;
                        
                        // 種別に応じて実際に必要な項目のみを配列に含める
                        const requiredItems = isGameOrMatch 
                          ? [
                              typeId,
                              title.trim(),
                              categoryId,
                              isValidOpponent(opponentIds, selectedType?.name || ''),
                              isValidScoreData(scoreData)
                            ]
                          : [
                              typeId,
                              title.trim()
                            ];
                        
                        const completed = requiredItems.filter(Boolean).length;
                        return (completed / total) * 100;
                      })()}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* 投稿ボタン */}
            <Button
              color="blue"
              size="lg"
              onClick={() => handleSubmit(new Event('submit') as any)}
              disabled={submitting || !typeId || !title.trim() || 
                ((selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (!isValidScoreData(scoreData) || !isValidOpponent(opponentIds, selectedType.name) || !categoryId))}
              className="w-full"
            >
              {submitting ? '投稿中...' : '投稿'}
            </Button>
          </div>
        </div>
      </main>
    </PageTransition>
  );
} 