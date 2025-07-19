"use client";
import { useState, useEffect, useRef } from "react";

interface ScoreSet {
  setNumber: number;
  myScore: number;
  opponentScore: number;
}

interface ScoreInputProps {
  scoreData: ScoreSet[];
  onScoreChange: (scores: ScoreSet[]) => void;
  totalSets: number;
  onTotalSetsChange: (sets: number) => void;
  matchDuration: number;
  onMatchDurationChange: (duration: number) => void;
  initialShow?: boolean;
}

export default function ScoreInput({
  scoreData,
  onScoreChange,
  totalSets,
  onTotalSetsChange,
  matchDuration,
  onMatchDurationChange,
  initialShow = false
}: ScoreInputProps) {
  const prevTotalSetsRef = useRef(totalSets);
  const prevScoreDataLengthRef = useRef(scoreData.length);
  const [scrollPosition, setScrollPosition] = useState(0);

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

  // セット数が変更された時に自動でスコア入力欄を生成
  useEffect(() => {
    const prevTotalSets = prevTotalSetsRef.current;
    const prevScoreDataLength = prevScoreDataLengthRef.current;

    if (totalSets !== prevTotalSets || scoreData.length !== prevScoreDataLength) {
      if (totalSets > 0) {
        if (scoreData.length === 0) {
          const newScoreData = Array.from({ length: totalSets }, (_, index) => ({
            setNumber: index + 1,
            myScore: 0,
            opponentScore: 0
          }));
          onScoreChange(newScoreData);
        } else if (scoreData.length !== totalSets) {
          if (scoreData.length < totalSets) {
            const additionalSets = Array.from({ length: totalSets - scoreData.length }, (_, index) => ({
              setNumber: scoreData.length + index + 1,
              myScore: 0,
              opponentScore: 0
            }));
            onScoreChange([...scoreData, ...additionalSets]);
          } else {
            const adjustedScores = scoreData.slice(0, totalSets).map((score, index) => ({
              ...score,
              setNumber: index + 1
            }));
            onScoreChange(adjustedScores);
          }
        }
      } else if (totalSets === 0) {
        onScoreChange([]);
      }
    }

    prevTotalSetsRef.current = totalSets;
    prevScoreDataLengthRef.current = scoreData.length;
  }, [totalSets, scoreData.length]);

  // スコアデータが有効かどうかを判定する関数
  const isValidScoreData = (scores: ScoreSet[]): boolean => {
    if (scores.length === 0) return false;
    return scores.every(set => set.myScore > 0 || set.opponentScore > 0);
  };

  const hasValidScores = isValidScoreData(scoreData);

  const addSet = () => {
    const newSet: ScoreSet = {
      setNumber: scoreData.length + 1,
      myScore: 0,
      opponentScore: 0
    };
    onScoreChange([...scoreData, newSet]);
  };

  const removeSet = (index: number) => {
    const newScores = scoreData.filter((_, i) => i !== index);
    const renumberedScores = newScores.map((score, i) => ({
      ...score,
      setNumber: i + 1
    }));
    onScoreChange(renumberedScores);
  };

  const updateSetScore = (index: number, field: 'myScore' | 'opponentScore', value: number) => {
    const newScores = [...scoreData];
    newScores[index] = { ...newScores[index], [field]: value };
    onScoreChange(newScores);
  };

  const calculateWonSets = () => {
    return scoreData.filter(set => set.myScore > set.opponentScore).length;
  };

  const getMatchResult = () => {
    const wonSets = calculateWonSets();
    const totalSets = scoreData.length;
    if (totalSets === 0) return '';
    
    if (wonSets > totalSets / 2) return '勝利';
    if (wonSets < totalSets / 2) return '敗戦';
    return '引き分け';
  };

  const formatScore = (scores: ScoreSet[]) => {
    return scores.map(set => `${set.myScore}-${set.opponentScore}`).join(', ');
  };

  // 数値入力のバリデーション
  const validateScoreInput = (value: string): number => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return 0;
    if (num > 21) return 21;
    return num;
  };

  return (
    <div className="space-y-4">
      {/* セット数選択 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <label className="block text-base font-semibold text-gray-900 mb-3">
          セット数
        </label>
        <select
          value={totalSets}
          onChange={(e) => onTotalSetsChange(Number(e.target.value))}
          className={`w-full border-2 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
            totalSets === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        >
          <option value={0}>選択してください</option>
          <option value={1}>1セット</option>
          <option value={2}>2セット</option>
          <option value={3}>3セット</option>
          <option value={5}>5セット</option>
          <option value={7}>7セット</option>
        </select>
      </div>

      {/* 試合時間 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <label className="block text-base font-semibold text-gray-900 mb-3">
          試合時間（分）
        </label>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          max="300"
          value={matchDuration}
          onChange={(e) => {
            const value = e.target.value;
            const numValue = value === '' ? 0 : parseInt(value, 10);
            if (!isNaN(numValue) && numValue >= 0 && numValue <= 300) {
              onMatchDurationChange(numValue);
            }
          }}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="例: 45"
        />
      </div>

      {/* スコア入力 */}
      {totalSets > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              各セットのスコア
            </h3>
            <button
              type="button"
              onClick={addSet}
              disabled={scoreData.length >= totalSets}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 active:scale-95"
            >
              セット追加
            </button>
          </div>

          {scoreData.map((set, index) => {
            const isUnfilled = set.myScore === 0 && set.opponentScore === 0;
            
            return (
              <div
                key={index}
                className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all duration-200 ${
                  isUnfilled 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200'
                }`}
              >
                {/* セット番号と削除ボタン */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-blue-600">
                    {set.setNumber}セット
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSet(index)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95"
                  >
                    削除
                  </button>
                </div>
                
                {/* スコア入力エリア - スマホ特化レイアウト */}
                <div className="space-y-3">
                  {/* 自分のスコア */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">自分のスコア</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="21"
                      value={set.myScore}
                      onChange={(e) => updateSetScore(index, 'myScore', validateScoreInput(e.target.value))}
                      onBlur={handleInputBlur}
                      onFocus={handleInputFocus}
                      className="w-full h-12 border-2 border-blue-200 rounded-lg px-3 text-center text-lg font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                      placeholder="0"
                    />
                  </div>

                  {/* VS */}
                  <div className="flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-500">VS</span>
                  </div>

                  {/* 相手のスコア */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">相手のスコア</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="21"
                      value={set.opponentScore}
                      onChange={(e) => updateSetScore(index, 'opponentScore', validateScoreInput(e.target.value))}
                      onBlur={handleInputBlur}
                      onFocus={handleInputFocus}
                      className="w-full h-12 border-2 border-red-200 rounded-lg px-3 text-center text-lg font-bold text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* セット結果表示 */}
                {set.myScore > 0 || set.opponentScore > 0 ? (
                  <div className="mt-3 text-center">
                    <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                      set.myScore > set.opponentScore 
                        ? 'text-green-600 bg-green-50' 
                        : set.myScore < set.opponentScore 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-gray-600 bg-gray-50'
                    }`}>
                      {set.myScore > set.opponentScore ? '勝利' : set.myScore < set.opponentScore ? '敗戦' : '引き分け'}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 text-center">
                    <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">未入力</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* 試合結果サマリー */}
          {scoreData.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <h4 className="text-base font-semibold text-blue-900 mb-3">試合結果</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">スコア:</span>
                  <span className="font-semibold text-blue-900">{formatScore(scoreData)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">結果:</span>
                  <span className={`font-semibold px-2 py-1 rounded-lg text-sm ${
                    getMatchResult() === '勝利' ? 'text-green-600 bg-green-100' : 
                    getMatchResult() === '敗戦' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'
                  }`}>
                    {getMatchResult()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">獲得セット:</span>
                  <span className="font-semibold text-blue-900">{calculateWonSets()}/{scoreData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">試合時間:</span>
                  <span className="font-semibold text-blue-900">{matchDuration}分</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 