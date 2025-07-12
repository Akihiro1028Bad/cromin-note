"use client";
import { useState, useEffect } from "react";

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
  const [showScoreInput, setShowScoreInput] = useState(initialShow);

  // スコアデータが存在する場合は表示状態を維持
  useEffect(() => {
    console.log('ScoreInput: scoreData.length =', scoreData.length, 'showScoreInput =', showScoreInput);
    if (scoreData.length > 0 && !showScoreInput) {
      console.log('ScoreInput: スコアデータが存在するため、表示状態をtrueに設定します');
      setShowScoreInput(true);
    }
  }, [scoreData.length, showScoreInput]);

  // initialShowプロパティが変更された場合の処理
  useEffect(() => {
    console.log('ScoreInput: initialShow =', initialShow);
    if (initialShow) {
      console.log('ScoreInput: initialShowがtrueのため、表示状態をtrueに設定します');
      setShowScoreInput(true);
    }
  }, [initialShow]);

  // コンポーネントマウント時の初期化
  useEffect(() => {
    console.log('ScoreInput: コンポーネントマウント時の状態');
    console.log('  - scoreData:', scoreData);
    console.log('  - totalSets:', totalSets);
    console.log('  - matchDuration:', matchDuration);
    console.log('  - initialShow:', initialShow);
    console.log('  - showScoreInput:', showScoreInput);
  }, []);

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
    // セット番号を再振り分け
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

  const handleToggleScoreInput = () => {
    setShowScoreInput(!showScoreInput);
    // 閉じる場合はスコアデータをクリア
    if (showScoreInput) {
      onScoreChange([]);
      onTotalSetsChange(0);
      onMatchDurationChange(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* スコア入力の表示/非表示切り替え */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleToggleScoreInput}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {showScoreInput ? '閉じる' : 'スコアを記録'}
        </button>
      </div>

      {/* スコア入力フォーム */}
      {showScoreInput && (
        <div className="space-y-4">
          {/* セット数選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              セット数
            </label>
            <select
              value={totalSets}
              onChange={(e) => onTotalSetsChange(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              試合時間（分）
            </label>
            <input
              type="number"
              min="1"
              max="300"
              value={matchDuration || ''}
              onChange={(e) => onMatchDurationChange(Number(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: 45"
            />
          </div>

          {/* スコア入力 */}
          {totalSets > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  各セットのスコア
                </label>
                <button
                  type="button"
                  onClick={addSet}
                  disabled={scoreData.length >= totalSets}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  セット追加
                </button>
              </div>

              {scoreData.map((set, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <span className="text-sm font-bold text-blue-600 min-w-[60px]">
                    {set.setNumber}セット
                  </span>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="number"
                      min="0"
                      max="21"
                      value={set.myScore}
                      onChange={(e) => updateSetScore(index, 'myScore', Number(e.target.value) || 0)}
                      className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <span className="text-blue-600 font-bold">-</span>
                    <input
                      type="number"
                      min="0"
                      max="21"
                      value={set.opponentScore}
                      onChange={(e) => updateSetScore(index, 'opponentScore', Number(e.target.value) || 0)}
                      className="w-16 border border-gray-300 rounded-lg px-3 py-2 text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSet(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-semibold transition-colors"
                  >
                    削除
                  </button>
                </div>
              ))}

              {/* 結果表示 */}
              {scoreData.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-900">
                    <div className="font-semibold mb-1">試合結果</div>
                    <div>スコア: {formatScore(scoreData)}</div>
                    <div>勝ったセット: {calculateWonSets()} / {scoreData.length}</div>
                    <div className="font-bold mt-1">結果: {getMatchResult()}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 