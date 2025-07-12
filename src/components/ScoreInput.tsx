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
  // 前回のtotalSetsを記録
  const prevTotalSetsRef = useRef(totalSets);
  const prevScoreDataLengthRef = useRef(scoreData.length);

  // セット数が変更された時に自動でスコア入力欄を生成
  useEffect(() => {
    const prevTotalSets = prevTotalSetsRef.current;
    const prevScoreDataLength = prevScoreDataLengthRef.current;

    // totalSetsまたはscoreData.lengthが変更された場合のみ処理
    if (totalSets !== prevTotalSets || scoreData.length !== prevScoreDataLength) {
      if (totalSets > 0) {
        if (scoreData.length === 0) {
          // スコアデータが空の場合は新しく生成
          const newScoreData = Array.from({ length: totalSets }, (_, index) => ({
            setNumber: index + 1,
            myScore: 0,
            opponentScore: 0
          }));
          onScoreChange(newScoreData);
        } else if (scoreData.length !== totalSets) {
          // セット数が変更された場合は既存データを調整
          if (scoreData.length < totalSets) {
            // セット数が増えた場合は追加
            const additionalSets = Array.from({ length: totalSets - scoreData.length }, (_, index) => ({
              setNumber: scoreData.length + index + 1,
              myScore: 0,
              opponentScore: 0
            }));
            onScoreChange([...scoreData, ...additionalSets]);
          } else {
            // セット数が減った場合は削除
            const adjustedScores = scoreData.slice(0, totalSets).map((score, index) => ({
              ...score,
              setNumber: index + 1
            }));
            onScoreChange(adjustedScores);
          }
        }
      } else if (totalSets === 0) {
        // セット数が0にリセットされた場合はスコアデータをクリア
        onScoreChange([]);
      }
    }

    // 現在の値を記録
    prevTotalSetsRef.current = totalSets;
    prevScoreDataLengthRef.current = scoreData.length;
  }, [totalSets, scoreData.length]); // onScoreChangeを依存関係から削除

  // スコアデータが有効かどうかを判定する関数
  const isValidScoreData = (scores: ScoreSet[]): boolean => {
    if (scores.length === 0) return false;
    
    // 全てのセットで0-0以外のスコアが入力されているかチェック
    return scores.every(set => set.myScore > 0 || set.opponentScore > 0);
  };

  // 現在のスコアデータが有効かどうかを判定
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

  return (
    <div className="space-y-4">
      {/* セット数選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          セット数
        </label>
        <select
          value={totalSets}
          onChange={(e) => onTotalSetsChange(Number(e.target.value))}
          className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="例: 45"
        />
      </div>

      {/* スコア入力 */}
      {totalSets > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-medium text-gray-700">
              各セットのスコア
            </label>
            <button
              type="button"
              onClick={addSet}
              disabled={scoreData.length >= totalSets}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              セット追加
            </button>
          </div>

          {scoreData.map((set, index) => {
            // このセットが0-0かどうかを判定
            const isUnfilled = set.myScore === 0 && set.opponentScore === 0;
            
            return (
              <div
                key={index}
                className={`border rounded-lg p-3 shadow-sm ${
                  isUnfilled 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-white border-gray-200'
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
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    削除
                  </button>
                </div>
                
                {/* スコア入力エリア */}
                <div className="flex items-center justify-center gap-4">
                  {/* 自分のスコア */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">自分のスコア</label>
                    <select
                      value={set.myScore}
                      onChange={(e) => updateSetScore(index, 'myScore', Number(e.target.value))}
                      className="w-full h-12 border-2 border-blue-200 rounded-lg px-4 text-center text-lg font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((score) => (
                        <option key={score} value={score}>
                          {score}点
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* VS */}
                  <div className="flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-500">VS</span>
                  </div>

                  {/* 相手のスコア */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">相手のスコア</label>
                    <select
                      value={set.opponentScore}
                      onChange={(e) => updateSetScore(index, 'opponentScore', Number(e.target.value))}
                      className="w-full h-12 border-2 border-red-200 rounded-lg px-4 text-center text-lg font-bold text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((score) => (
                        <option key={score} value={score}>
                          {score}点
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* セット結果表示 */}
                {set.myScore > 0 || set.opponentScore > 0 ? (
                  <div className="mt-3 text-center">
                    <span className={`text-sm font-semibold ${
                      set.myScore > set.opponentScore 
                        ? 'text-green-600' 
                        : set.myScore < set.opponentScore 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                    }`}>
                      {set.myScore > set.opponentScore ? '勝利' : set.myScore < set.opponentScore ? '敗戦' : '引き分け'}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 text-center">
                    <span className="text-sm text-gray-400">未入力</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* 試合結果サマリー */}
          {scoreData.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">試合結果</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">スコア: </span>
                  <span className="font-semibold text-gray-800">{formatScore(scoreData)}</span>
                </div>
                <div>
                  <span className="text-gray-600">結果: </span>
                  <span className={`font-semibold ${
                    getMatchResult() === '勝利' ? 'text-green-600' : 
                    getMatchResult() === '敗戦' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getMatchResult()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">獲得セット: </span>
                  <span className="font-semibold text-gray-800">{calculateWonSets()}/{scoreData.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">試合時間: </span>
                  <span className="font-semibold text-gray-800">{matchDuration}分</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 