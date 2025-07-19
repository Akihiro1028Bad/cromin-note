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
  const [currentStep, setCurrentStep] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // フォーム状態
  const [typeId, setTypeId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [opponentIds, setOpponentIds] = useState<string[]>([]); // 変更: 対戦相手ID配列
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

  // 種別に応じたステップ定義
  const getSteps = () => {
    const isGameOrMatch = selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合';
    
    if (isGameOrMatch) {
      return [
        { id: 0, title: '基本情報', icon: '📝' },
        { id: 1, title: '対戦情報', icon: <Image src="/icon.png" alt="クロスミントンアイコン" width={24} height={24} style={{display:'inline',verticalAlign:'middle'}} /> },
        { id: 2, title: '詳細記録', icon: '📊' },
        { id: 3, title: '設定', icon: '⚙️' }
      ];
    } else {
      return [
        { id: 0, title: '基本情報', icon: '📝' },
        { id: 1, title: '詳細記録', icon: '📊' },
        { id: 2, title: '設定', icon: '⚙️' }
      ];
    }
  };

  const steps = getSteps();

  // 現在のステップを種別に応じて調整
  const adjustCurrentStep = (newTypeId: number) => {
    const newType = noteTypes.find(t => t.id === newTypeId);
    const isGameOrMatch = newType?.name === 'ゲーム練習' || newType?.name === '公式試合';
    
    if (!isGameOrMatch && currentStep >= 1) {
      // 練習系の場合は対戦情報ステップをスキップ
      setCurrentStep(Math.max(0, currentStep - 1));
    }
  };

  // スワイプナビゲーション
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 30; // 感度を上げる（50から30に変更）
    const isRightSwipe = distance < -30; // 感度を上げる（-50から-30に変更）

    if (isLeftSwipe && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (isRightSwipe && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
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

  // バリデーション関数
  const isValidScoreData = (scores: ScoreSet[]): boolean => {
    if (scores.length === 0) return false;
    return scores.every(set => set.myScore > 0 || set.opponentScore > 0);
  };

  const isValidOpponent = (opponentIds: string[], category: string): boolean => {
    if (opponentIds.length === 0) return false;
    
    const isDoubles = category === 'ダブルス' || category === 'ミックスダブルス';
    if (isDoubles) {
      return opponentIds.length >= 2;
    }
    
    return opponentIds.length >= 1;
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

      if (!isValidOpponent(opponentIds, selectedCategory?.name || '')) {
        newErrors.opponentIds = '対戦相手を入力してください';
      }

      if (!isValidScoreData(scoreData)) {
        newErrors.scoreData = 'スコアを入力してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 進捗計算をメモ化
  const progressData = useMemo(() => {
    const isGameOrMatch = selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合';
    const total = isGameOrMatch ? 5 : 2;
    
    const requiredItems = isGameOrMatch 
      ? [
          typeId,
          title.trim(),
          categoryId,
          isValidOpponent(opponentIds, selectedCategory?.name || ''),
          isValidScoreData(scoreData)
        ]
      : [
          typeId,
          title.trim()
        ];
    
    const completed = requiredItems.filter(Boolean).length;
    return { completed, total, percentage: (completed / total) * 100 };
  }, [
    selectedType?.name,
    title,
    typeId,
    categoryId,
    opponentIds,
    scoreData,
    selectedCategory?.name
  ]);

  // リアルタイムバリデーション
  useEffect(() => {
    if (typeId || title.trim()) {
      validateForm();
    }
  }, [typeId, title, categoryId, opponentIds, scoreData, selectedType, selectedCategory]);

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // エラーメッセージを表示
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

      const requestBody = {
        typeId,
        title,
        opponentIds, // 変更: 対戦相手ID配列を送信
        content,
        resultId,
        categoryId,
        memo,
        condition,
        isPublic,
        scoreData: JSON.stringify(scoreData),
        totalSets,
        wonSets: scoreData.filter(set => set.myScore > set.opponentScore).length,
        matchDuration
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
        throw new Error(responseData.message || 'ノート更新APIエラー');
      }

      if (responseData.success) {
        router.replace(`/notes/${noteId}`);
      } else {
        throw new Error(responseData.message || 'ノートの更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      alert(`ノートの更新に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 種別選択時の処理
  const handleTypeSelect = (newTypeId: number) => {
    setTypeId(newTypeId);
    adjustCurrentStep(newTypeId);
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (!note) return <div className="p-8">ノートが見つかりません。</div>;
  
  // 権限チェック
  if (!user || note.userId !== user.id) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-bg-primary">
          <div className="px-4 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-xl font-bold text-text-primary mb-4">アクセス拒否</h1>
              <p className="text-text-secondary mb-6">このノートを編集する権限がありません。</p>
              <div className="space-y-3">
                <Button 
                  fullWidth 
                  color="blue" 
                  size="lg" 
                  onClick={() => router.back()}
                >
                  戻る
                </Button>
                <Button 
                  fullWidth 
                  color="gray" 
                  size="md" 
                  onClick={() => router.push("/home")}
                >
                  ホームに戻る
                </Button>
              </div>
            </div>
          </div>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main 
        className="min-h-screen bg-gray-50 pb-32"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="p-3 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100 active:bg-gray-200"
                title="戻る"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-bold text-gray-900">ノート編集</h1>
              <div className="w-12"></div> {/* 中央寄せのためのスペーサー */}
            </div>
          </div>
        </div>

        {/* ステップインジケーター */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-8 h-0.5 mx-2 transition-all duration-200 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-2">
            <span className="text-sm font-medium text-gray-700">
              {steps[currentStep].title}
            </span>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-4">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            
            {/* ステップ0: 基本情報 */}
            {currentStep === 0 && (
              <div className="space-y-4">
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
                        onClick={() => handleTypeSelect(type.id)}
                        className={`p-4 text-left rounded-lg border-2 transition-all duration-200 active:scale-95 min-h-[56px] flex items-center ${
                          typeId === type.id
                            ? 'border-blue-500 bg-blue-50 text-blue-900'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{type.name}</div>
                      </button>
                    ))}
                  </div>
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
                    placeholder="タイトルを入力"
                    className={`w-full border-2 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>
              </div>
            )}

            {/* ステップ1: 対戦情報（ゲーム練習・公式試合のみ） */}
            {currentStep === 1 && (selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (
              <div className="space-y-4">
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
              </div>
            )}

            {/* ステップ1: 詳細記録（練習系の場合）または ステップ2: 詳細記録（ゲーム練習・公式試合の場合） */}
            {((currentStep === 1 && !(selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合')) || 
              (currentStep === 2 && (selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合'))) && (
              <div className="space-y-4">
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
                    placeholder="体調やコンディションを記録"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* ステップ2: 設定（練習系の場合）または ステップ3: 設定（ゲーム練習・公式試合の場合） */}
            {((currentStep === 2 && !(selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合')) || 
              (currentStep === 3 && (selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合'))) && (
              <div className="space-y-4">
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
              </div>
            )}

            {/* 非表示の必須フィールド（バリデーション用） */}
            <select
              value={typeId || ''}
              onChange={(e) => setTypeId(Number(e.target.value) || null)}
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

        {/* ナビゲーションボタン */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20 px-4 py-4">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium transition-all duration-200 active:bg-gray-200 min-h-[48px]"
              >
                戻る
              </button>
            )}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 active:bg-blue-700 min-h-[48px]"
              >
                次へ
              </button>
            ) : (
              <Button
                color="blue"
                size="lg"
                onClick={() => handleSubmit(new Event('submit') as any)}
                disabled={submitting || !typeId || !title.trim() || 
                  ((selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (!isValidScoreData(scoreData) || !isValidOpponent(opponentIds, selectedCategory?.name || '') || !categoryId))}
                className="flex-1 min-h-[48px]"
              >
                {submitting ? '更新中...' : '更新'}
              </Button>
            )}
          </div>
          
          {/* 進捗バー */}
          {!submitting && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>必須項目</span>
                <span>{progressData.completed}/{progressData.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressData.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* フローティングアクションボタン */}
        <div className="fixed bottom-20 right-4 z-30">
          <button
            onClick={() => handleSubmit(new Event('submit') as any)}
            disabled={submitting || !typeId || !title.trim() || 
              ((selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (!isValidScoreData(scoreData) || !isValidOpponent(opponentIds, selectedCategory?.name || '') || !categoryId))}
            className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
              submitting || !typeId || !title.trim() || 
              ((selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (!isValidScoreData(scoreData) || !isValidOpponent(opponentIds, selectedCategory?.name || '') || !categoryId))
                ? 'bg-gray-300 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }`}
          >
            {submitting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      </main>
    </PageTransition>
  );
} 