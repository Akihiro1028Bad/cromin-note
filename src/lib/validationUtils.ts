// 対戦相手バリデーション専用関数
export const validateOpponents = (opponentIds: string[], categoryName?: string) => {
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

// 数値入力の表示・計算用変換関数
export const getDisplayValue = (value: string | number): string => {
  if (value === 0 || value === '0') return '';
  return String(value);
};

export const getNumericValue = (value: string | number): number => {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return isNaN(num) ? 0 : num;
};

// スコアデータが有効かどうかを判定する関数
export const isValidScoreData = (scores: { myScore: string | number; opponentScore: string | number }[]): boolean => {
  if (scores.length === 0) return false;
  return scores.every(set => {
    const myScore = getNumericValue(set.myScore);
    const opponentScore = getNumericValue(set.opponentScore);
    return myScore > 0 || opponentScore > 0;
  });
};

// フォームの基本バリデーション
export const validateBasicForm = (typeId: number | '' | null, title: string) => {
  const errors: {[key: string]: string} = {};

  if (!typeId) {
    errors.typeId = '種別を選択してください';
  }

  if (!title.trim()) {
    errors.title = 'タイトルを入力してください';
  }

  return errors;
};

// ゲーム練習・公式試合用の追加バリデーション
export const validateGameForm = (
  categoryId: number | null,
  opponentIds: string[],
  selectedCategoryName?: string,
  scoreData: { myScore: string | number; opponentScore: string | number }[] = []
) => {
  const errors: {[key: string]: string} = {};

  if (!categoryId) {
    errors.categoryId = 'カテゴリを選択してください';
  }

  // 対戦相手の詳細バリデーション
  const opponentValidation = validateOpponents(opponentIds, selectedCategoryName);
  if (!opponentValidation.isValid) {
    errors.opponentIds = opponentValidation.errorMessage;
  }

  if (!isValidScoreData(scoreData)) {
    errors.scoreData = 'スコアを入力してください';
  }

  return errors;
}; 