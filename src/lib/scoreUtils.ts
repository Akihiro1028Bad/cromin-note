export interface ScoreSet {
  setNumber: number;
  myScore: number;
  opponentScore: number;
}

// scoreData（JSON文字列）をScoreSet配列に変換
export function parseScoreData(scoreData: string | null): ScoreSet[] {
  if (!scoreData) return [];
  
  try {
    const parsed = JSON.parse(scoreData);
    if (Array.isArray(parsed)) {
      return parsed.map((set, index) => ({
        setNumber: set.setNumber || index + 1,
        myScore: set.myScore || 0,
        opponentScore: set.opponentScore || 0
      }));
    }
    return [];
  } catch (error) {
    console.error('Score data parsing error:', error);
    return [];
  }
}

// ScoreSet配列をJSON文字列に変換
export function stringifyScoreData(scoreSets: ScoreSet[]): string | null {
  if (!scoreSets || scoreSets.length === 0) return null;
  
  try {
    return JSON.stringify(scoreSets);
  } catch (error) {
    console.error('Score data stringify error:', error);
    return null;
  }
}

// 勝ったセット数を計算
export function calculateWonSets(scoreSets: ScoreSet[]): number {
  return scoreSets.filter(set => set.myScore > set.opponentScore).length;
}

// 試合結果を判定
export function getMatchResult(scoreSets: ScoreSet[]): string {
  if (scoreSets.length === 0) return '';
  
  const wonSets = calculateWonSets(scoreSets);
  const totalSets = scoreSets.length;
  
  if (wonSets > totalSets / 2) return '勝利';
  if (wonSets < totalSets / 2) return '敗戦';
  return '引き分け';
}

// スコア表示用の文字列を生成
export function formatScoreDisplay(scoreSets: ScoreSet[]): string {
  return scoreSets.map(set => `${set.myScore}-${set.opponentScore}`).join(', ');
} 