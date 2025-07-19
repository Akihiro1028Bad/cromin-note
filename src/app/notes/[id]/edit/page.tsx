"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { NoteType, Result, Note } from "@/types/database";
import { PageTransition, LoadingSpinner, ScoreInput, Button, OpponentSelect, CategorySelect } from '@/components';
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

interface ScoreSet {
  setNumber: number;
  myScore: number;
  opponentScore: number;
}

export default function EditNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  // 状態管理
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState<Note | null>(null);
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // フォーム状態
  const [typeId, setTypeId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [opponentIds, setOpponentIds] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [resultId, setResultId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [memo, setMemo] = useState('');
  const [condition, setCondition] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  // スコア記録状態
  const [scoreData, setScoreData] = useState<ScoreSet[]>([]);
  const [totalSets, setTotalSets] = useState(0);
  const [matchDuration, setMatchDuration] = useState(0);

  // 選択された種別とカテゴリをメモ化
  const selectedType = useMemo(
    () => noteTypes.find(t => t.id === typeId),
    [noteTypes, typeId]
  );

  const selectedCategory = useMemo(
    () => categories.find(c => c.id === categoryId),
    [categories, categoryId]
  );

  // スクロール位置を記録する関数
  const handleInputFocus = () => {
    setScrollPosition(window.scrollY);
  };

  // キーパッドが閉じた時にスクロール位置を調整する関数
  const handleInputBlur = () => {
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 100);
  };

  // データ取得
  useEffect(() => {
    if (!noteId) return;

    const fetchData = async () => {
      try {
        const [typesRes, resultsRes, noteRes] = await Promise.all([
          fetch('/api/notes/types'),
          fetch('/api/notes/results'),
          fetch(`/api/notes/${noteId}`)
        ]);
        
        if (!typesRes.ok || !resultsRes.ok || !noteRes.ok) {
          throw new Error('データ取得APIエラー');
        }
        
        const typesJson = await typesRes.json();
        const resultsJson = await resultsRes.json();
        const noteJson = await noteRes.json();
        
        // マスターデータ設定
        setNoteTypes(typesJson.noteTypes || []);
        setResults(resultsJson.results || []);
        setCategories(typesJson.categories || []);
        
        // ノートデータ設定
        const noteData = noteJson.note;
        setNote(noteData);
        setTypeId(noteData.typeId);
        setTitle(noteData.title || '');
        setContent(noteData.content || '');
        setResultId(noteData.resultId);
        setCategoryId(noteData.categoryId);
        setMemo(noteData.memo || '');
        setCondition(noteData.condition || '');
        setIsPublic(noteData.isPublic);
        
        // 対戦相手ID配列を設定（note_opponentsから取得）
        if (noteData.noteOpponents && Array.isArray(noteData.noteOpponents)) {
          const opponentIds = noteData.noteOpponents.map((no: any) => no.opponentId);
          setOpponentIds(opponentIds);
        } else {
          setOpponentIds([]);
        }
        
        // スコアデータ復元
        if (noteData.scoreData) {
          try {
            const parsedScoreData = JSON.parse(noteData.scoreData);
            setScoreData(parsedScoreData);
            setTotalSets(noteData.totalSets || parsedScoreData.length);
          } catch (e) {
            console.error('スコアデータの解析に失敗:', e);
            setScoreData([]);
            setTotalSets(0);
          }
        } else {
          setScoreData([]);
          setTotalSets(0);
        }
        
        // 試合時間復元
        setMatchDuration(noteData.matchDuration || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('ノートの取得に失敗しました。');
        router.push('/notes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [noteId, router]);

  // リアルタイムバリデーション
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // スコアデータが有効かどうかを判定する関数
  const isValidScoreData = (scores: ScoreSet[]): boolean => {
    if (scores.length === 0) return false;
    return scores.every(set => set.myScore > 0 || set.opponentScore > 0);
  };

  // 対戦相手バリデーション専用関数
  const validateOpponents = (opponentIds: string[], categoryName?: string) => {
    if (!categoryName) {
      return { isValid: false, errorMessage: 'カテゴリを選択してください' };
    }

    const isDoubles = categoryName === 'ダブルス' || categoryName === 'ミックスダブルス';
    
    if (isDoubles) {
      if (opponentIds.length < 2) {
        return { isValid: false, errorMessage: 'ダブルス・ミックスダブルスでは対戦相手を2人選択してください' };
      }
      if (!opponentIds[0] || !opponentIds[1]) {
        return { isValid: false, errorMessage: '対戦相手1と対戦相手2を両方選択してください' };
      }
    } else {
      if (opponentIds.length < 1 || !opponentIds[0]) {
        return { isValid: false, errorMessage: '対戦相手を選択してください' };
      }
    }

    return { isValid: true, errorMessage: '' };
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!typeId) {
      newErrors.typeId = '種別を選択してください';
    }

    if (!title.trim()) {
      newErrors.title = 'タイトルを入力してください';
    }

    if (selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') {
      if (!categoryId) {
        newErrors.categoryId = 'カテゴリを選択してください';
      }

      // 対戦相手の詳細バリデーション
      const opponentValidation = validateOpponents(opponentIds, selectedCategory?.name);
      if (!opponentValidation.isValid) {
        newErrors.opponentIds = opponentValidation.errorMessage;
      }

      if (!isValidScoreData(scoreData)) {
        newErrors.scoreData = 'スコアを入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // リアルタイムバリデーション
  useEffect(() => {
    if (noteTypes.length === 0) return;
    
    if (typeId || title.trim() || categoryId || opponentIds.length > 0 || scoreData.length > 0) {
      validateForm();
    }
  }, [typeId, title, categoryId, opponentIds, scoreData, selectedType, selectedCategory, noteTypes.length]);

  // 更新ボタンの無効化条件を明確化
  const isSubmitDisabled = () => {
    // 基本チェック
    if (submitting || !typeId || !title.trim()) return true;
    
    // ゲーム練習・公式試合の場合の追加チェック
    if (selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') {
      if (!categoryId) return true;
      
      // 対戦相手の詳細チェック
      const opponentValidation = validateOpponents(opponentIds, selectedCategory?.name);
      if (!opponentValidation.isValid) return true;
      
      if (!isValidScoreData(scoreData)) return true;
    }
    
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorMessages = Object.values(errors);
      if (errorMessages.length > 0) {
        alert(`入力内容に問題があります：\n${errorMessages.join('\n')}`);
      }
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('認証トークンが見つかりません。再度ログインしてください。');
        router.push('/auth/login');
        return;
      }

      if (!typeId || !title.trim()) {
        alert('種別とタイトルは必須です。');
        return;
      }

      const requestBody = {
        typeId: Number(typeId),
        title: title.trim(),
        opponentIds: Array.isArray(opponentIds) ? opponentIds : [],
        content: content || '',
        resultId: resultId ? Number(resultId) : null,
        categoryId: categoryId ? Number(categoryId) : null,
        memo: memo || '',
        condition: condition || '',
        isPublic: Boolean(isPublic),
        scoreData: scoreData.length > 0 ? JSON.stringify(scoreData) : null,
        totalSets: Number(totalSets) || 0,
        wonSets: scoreData.filter(set => set.myScore > set.opponentScore).length,
        matchDuration: Number(matchDuration) || 0
      };

      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await res.json();

      if (!res.ok) {
        let errorMessage = responseData.message || 'ノート更新APIエラー';
        
        if (res.status === 400) {
          errorMessage = `入力データに問題があります: ${responseData.message}`;
        } else if (res.status === 401) {
          errorMessage = '認証に失敗しました。再度ログインしてください。';
          router.push('/auth/login');
          return;
        } else if (res.status === 403) {
          errorMessage = 'このノートを編集する権限がありません。';
        } else if (res.status === 404) {
          errorMessage = 'ノートが見つかりません。';
          router.push('/notes');
          return;
        } else if (res.status >= 500) {
          errorMessage = `サーバーエラーが発生しました: ${responseData.message}`;
        }
        
        throw new Error(errorMessage);
      }

      if (responseData.success) {
        alert('ノートの更新が完了しました！');
        router.push(`/notes/${noteId}`);
      } else {
        throw new Error(responseData.message || 'ノートの更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      
      let errorMessage = 'ノートの更新に失敗しました';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        } else if (error.message.includes('JSON')) {
          errorMessage = 'サーバーからの応答が正しくありません。';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // 進捗計算
  const progressData = (() => {
    const isGameOrMatch = selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合';
    const total = isGameOrMatch ? 5 : 2;
    
    const requiredItems = isGameOrMatch 
      ? [
          typeId,
          title.trim(),
          categoryId,
          validateOpponents(opponentIds, selectedCategory?.name).isValid,
          isValidScoreData(scoreData)
        ]
      : [
          typeId,
          title.trim()
        ];
    
    const completed = requiredItems.filter(Boolean).length;
    return { completed, total, percentage: (completed / total) * 100 };
  })();

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  return (
    <PageTransition>
      <main className="min-h-screen bg-gray-50 pb-32">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="p-3 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 active:bg-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-gray-900">ノート編集</h1>
              <div className="w-12"></div>
            </div>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>必須項目の進捗</span>
            <span>{progressData.completed}/{progressData.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressData.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            
            {/* 基本情報セクション */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                基本情報
              </h2>
              
              {/* 種別選択 */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  種別 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {noteTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setTypeId(type.id)}
                      className={`p-4 text-left rounded-lg border-2 transition-all duration-200 active:scale-95 min-h-[56px] flex items-center ${
                        typeId === type.id
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : errors.typeId
                          ? 'border-red-300 bg-red-50 text-gray-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{type.name}</div>
                    </button>
                  ))}
                </div>
                {errors.typeId && <p className="mt-1 text-sm text-red-600">{errors.typeId}</p>}
              </div>

              {/* タイトル */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                  placeholder="タイトルを入力"
                  className={`w-full border-2 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>
            </section>

            {/* 対戦情報セクション（ゲーム練習・公式試合のみ） */}
            {(selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Image src="/icon.png" alt="クロスミントンアイコン" width={24} height={24} />
                  対戦情報
                </h2>
                
                {/* カテゴリ選択 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <CategorySelect
                    value={categoryId}
                    onChange={setCategoryId}
                    required={true}
                  />
                  {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
                </div>

                {/* 対戦相手 */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <OpponentSelect
                    value={opponentIds}
                    onChange={setOpponentIds}
                    category={selectedCategory?.name || ''}
                    isRequired={true}
                  />
                  {errors.opponentIds && <p className="mt-1 text-sm text-red-600">{errors.opponentIds}</p>}
                </div>
              </section>
            )}

            {/* 詳細記録セクション */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                詳細記録
              </h2>
              
              {/* スコア入力（ゲーム練習・公式試合のみ・必須） */}
              {(selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-base font-semibold text-gray-900">スコア記録</h3>
                    <span className="text-red-500 text-base">*</span>
                  </div>
                  <ScoreInput
                    scoreData={scoreData}
                    onScoreChange={setScoreData}
                    totalSets={totalSets}
                    onTotalSetsChange={setTotalSets}
                    matchDuration={matchDuration}
                    onMatchDurationChange={setMatchDuration}
                  />
                  {errors.scoreData && <p className="mt-1 text-sm text-red-600">{errors.scoreData}</p>}
                </div>
              )}

              {/* 内容 */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  内容
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                  placeholder="練習内容や試合の詳細を記録"
                  rows={5}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                />
              </div>

              {/* メモ */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  メモ
                </label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                  placeholder="追加のメモがあれば記録"
                  rows={4}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                />
              </div>

              {/* 体調 */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  体調
                </label>
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  onBlur={handleInputBlur}
                  onFocus={handleInputFocus}
                  placeholder="体調やコンディションを記録"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </section>

            {/* 設定セクション */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">⚙️</span>
                設定
              </h2>
              
              {/* 公開設定 */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">公開設定</h3>
                    <p className="text-sm text-gray-600 mt-1">他のプレイヤーに公開するかどうか</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* 非表示の必須フィールド（バリデーション用） */}
            <select
              value={typeId || ''}
              onChange={(e) => setTypeId(Number(e.target.value))}
              className="hidden"
              required
            >
              <option value="">種別を選択</option>
              {noteTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </form>
        </div>

        {/* 固定更新ボタン */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20 px-4 py-4">
          <Button
            color="blue"
            size="lg"
            onClick={() => handleSubmit(new Event('submit') as any)}
            disabled={isSubmitDisabled()}
            className="w-full min-h-[48px]"
          >
            {submitting ? '更新中...' : 'ノートを更新'}
          </Button>
        </div>
      </main>
    </PageTransition>
  );
} 