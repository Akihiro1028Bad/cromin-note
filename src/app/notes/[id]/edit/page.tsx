"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { NoteType, Result, Note } from "@/types/database";
import { PageTransition, LoadingSpinner, ScoreInput, Button } from '@/components';
import { useAuth } from "@/hooks/useAuth";

interface ScoreSet {
  setNumber: number;
  myScore: number;
  opponentScore: number;
}

export default function EditNotePage() {
  const { user } = useAuth();
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  // フォーム状態
  const [typeId, setTypeId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [opponent, setOpponent] = useState('');
  const [content, setContent] = useState('');
  const [resultId, setResultId] = useState<number | ''>('');
  const [memo, setMemo] = useState('');
  const [condition, setCondition] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  // スコア記録状態
  const [scoreData, setScoreData] = useState<ScoreSet[]>([]);
  const [totalSets, setTotalSets] = useState(0);
  const [matchDuration, setMatchDuration] = useState(0);

  useEffect(() => {
    fetchData();
  }, [noteId]);

  // スコアデータが変更された場合のデバッグログ
  useEffect(() => {
    console.log('スコアデータが更新されました:', scoreData);
    console.log('ScoreInputに渡すprops:', {
      scoreData,
      totalSets,
      matchDuration,
      scoreDataLength: scoreData.length
    });
  }, [scoreData, totalSets, matchDuration]);

  const fetchData = async () => {
    try {
      const [typesRes, resultsRes, noteRes] = await Promise.all([
        fetch('/api/notes/types'),
        fetch('/api/notes/results'),
        fetch(`/api/notes/${noteId}`)
      ]);
      if (!typesRes.ok || !resultsRes.ok || !noteRes.ok) throw new Error('データ取得APIエラー');
      const typesJson = await typesRes.json();
      const resultsJson = await resultsRes.json();
      const noteJson = await noteRes.json();
      setNoteTypes(typesJson.types || []);
      setResults(resultsJson.results || []);
      const noteData = noteJson.note;
      setNote(noteData);
      setTypeId(noteData.typeId);
      setTitle(noteData.title || '');
      setOpponent(noteData.opponent || '');
      setContent(noteData.content || '');
      setResultId(noteData.resultId || '');
      setMemo(noteData.memo || '');
      setCondition(noteData.condition || '');
      setIsPublic(noteData.isPublic);
      
      // スコアデータの復元
      console.log('ノートデータ全体:', noteData);
      console.log('scoreDataフィールド:', noteData.scoreData);
      console.log('totalSetsフィールド:', noteData.totalSets);
      console.log('matchDurationフィールド:', noteData.matchDuration);
      
      if (noteData.scoreData) {
        try {
          const parsedScoreData = JSON.parse(noteData.scoreData);
          console.log('復元されたスコアデータ:', parsedScoreData);
          setScoreData(parsedScoreData);
          // セット数を正しく設定（保存されたセット数またはスコアデータの長さ）
          const savedTotalSets = noteData.totalSets || parsedScoreData.length;
          console.log('設定するセット数:', savedTotalSets);
          setTotalSets(savedTotalSets);
        } catch (e) {
          console.error('スコアデータの解析に失敗:', e);
          setScoreData([]);
          setTotalSets(0);
        }
      } else {
        console.log('scoreDataフィールドが存在しないため、空のスコアデータを設定します');
        setScoreData([]);
        setTotalSets(0);
      }
      
      // 試合時間の復元
      if (noteData.matchDuration) {
        setMatchDuration(noteData.matchDuration);
      } else {
        setMatchDuration(0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('ノートの取得に失敗しました。');
      router.push('/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeId || !note || !title.trim()) return;
    
    // ゲーム練習・公式試合の場合はスコアと対戦相手が必須
    if (selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') {
      if (!isValidScoreData(scoreData)) {
        alert('スコアを入力してください。');
        return;
      }
      if (!opponent.trim()) {
        alert('対戦相手を入力してください。');
        return;
      }
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
        opponent,
        content,
        resultId,
        memo,
        condition,
        isPublic,
        scoreData: JSON.stringify(scoreData),
        totalSets,
        wonSets: scoreData.filter(set => set.myScore > set.opponentScore).length,
        matchDuration
      };

      console.log('Updating note with data:', requestBody);

      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await res.json();
      
      console.log('Update response:', {
        status: res.status,
        success: responseData.success,
        message: responseData.message
      });

      if (!res.ok) {
        throw new Error(responseData.message || 'ノート更新APIエラー');
      }

      if (responseData.success) {
        console.log('Note updated successfully');
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

  const selectedType = noteTypes.find(t => t.id === typeId);

  // スコアデータが有効かどうかを判定する関数
  const isValidScoreData = (scores: ScoreSet[]): boolean => {
    if (scores.length === 0) return false;
    
    // 全てのセットで0-0以外のスコアが入力されているかチェック
    return scores.every(set => set.myScore > 0 || set.opponentScore > 0);
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (!note) return <div className="p-8">ノートが見つかりません。</div>;
  
  // 権限チェック: 自分のノートでない場合はアクセス拒否
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
      <main className="min-h-screen bg-bg-primary pb-24">
        {/* ヘッダー */}
        <div className="bg-bg-secondary border-b border-border-color shadow-sm sticky top-0 z-10">
          <div className="px-4 py-3">
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
                <h1 className="text-lg font-bold text-text-primary">ノート編集</h1>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="px-4 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 種別選択 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                種別 <span className="text-danger">*</span>
              </label>
              <select
                value={typeId}
                onChange={(e) => setTypeId(Number(e.target.value))}
                className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200 ${
                  !typeId ? 'border-red-300 bg-red-50' : 'border-border-color'
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
            </div>

            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                タイトル <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タイトルを入力"
                className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200 ${
                  !title.trim() ? 'border-red-300 bg-red-50' : 'border-border-color'
                }`}
                required
              />
            </div>

            {/* 対戦相手（ゲーム練習・公式試合のみ・必須） */}
            {(selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  対戦相手 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  placeholder="対戦相手を入力"
                  className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200 ${
                    !opponent.trim() ? 'border-red-300 bg-red-50' : 'border-border-color'
                  }`}
                  required
                />
              </div>
            )}

            {/* スコア入力（ゲーム練習・公式試合のみ・必須） */}
            {(selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (
              <div className="bg-bg-secondary rounded-lg p-4 border border-border-color">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-medium text-text-primary">スコア記録</h3>
                  <span className="text-danger text-sm">*</span>
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
              <label className="block text-sm font-medium text-text-primary mb-2">
                内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="練習内容や試合の詳細を記録"
                rows={4}
                className="w-full border border-border-color rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200 resize-none"
              />
            </div>

            {/* メモ */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                メモ
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="追加のメモがあれば記録"
                rows={3}
                className="w-full border border-border-color rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200 resize-none"
              />
            </div>

            {/* 体調 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                体調
              </label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="体調やコンディションを記録"
                className="w-full border border-border-color rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors duration-200"
              />
            </div>

            {/* 公開設定 */}
            <div className="bg-bg-secondary rounded-lg p-4 border border-border-color">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-primary">公開設定</h3>
                  <p className="text-sm text-text-secondary">他のプレイヤーに公開するかどうか</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
                      const total = selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合' ? 4 : 2;
                      const completed = [
                        typeId,
                        title.trim(),
                        selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合' ? opponent.trim() : true,
                        selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合' ? isValidScoreData(scoreData) : true
                      ].filter(Boolean).length;
                      return `${completed}/${total}`;
                    })()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(() => {
                        const total = selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合' ? 4 : 2;
                        const completed = [
                          typeId,
                          title.trim(),
                          selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合' ? opponent.trim() : true,
                          selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合' ? isValidScoreData(scoreData) : true
                        ].filter(Boolean).length;
                        return (completed / total) * 100;
                      })()}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* 更新ボタン */}
            <Button
              color="blue"
              size="lg"
              onClick={() => handleSubmit(new Event('submit') as any)}
              disabled={submitting || !typeId || !title.trim() || 
                ((selectedType?.name === 'ゲーム練習' || selectedType?.name === '公式試合') && (!isValidScoreData(scoreData) || !opponent.trim()))}
              className="w-full"
            >
              {submitting ? '更新中...' : '更新'}
            </Button>
          </div>
        </div>
      </main>
    </PageTransition>
  );
} 