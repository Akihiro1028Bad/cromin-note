import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    // 認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 401 });
    }

    const userId = decoded.userId;
    const resolvedParams = await params;
    const opponentName = decodeURIComponent(resolvedParams.name);

    // 特定の対戦相手との試合を取得
    const notes = await prisma.note.findMany({
      where: {
        userId: userId,
        resultId: { not: null },
        noteOpponents: {
          some: {
            opponent: {
              name: opponentName
            }
          }
        }
      },
      include: {
        result: true,
        noteType: true,
        category: true,
        scoreSets: true,
        noteOpponents: {
          include: {
            opponent: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (notes.length === 0) {
      return NextResponse.json(
        { error: '対戦相手が見つかりません' },
        { status: 404 }
      );
    }

    // 基本統計を計算
    const totalMatches = notes.length;
    const wins = notes.filter(note => note.result?.name === '勝ち').length;
    const losses = notes.filter(note => note.result?.name === '負け').length;
    const draws = notes.filter(note => note.result?.name === '引き分け').length;
    const winRate = totalMatches > 0 ? (wins / totalMatches * 100) : 0;



    const currentStreak = calculateCurrentStreak(notes);
    const longestWinStreak = calculateLongestStreak(notes, 'win');
    const longestLoseStreak = calculateLongestStreak(notes, 'loss');

    // 全試合履歴
    const recentMatches = notes.map(note => ({
      id: note.id,
      title: note.title,
      result: note.result?.name,
      scoreData: note.scoreSets.length > 0 ? JSON.stringify(note.scoreSets.map(set => ({
        setNumber: set.setNumber,
        myScore: set.myScore,
        opponentScore: set.opponentScore
      }))) : null,
      matchDuration: note.matchDuration,
      totalSets: note.totalSets,
      wonSets: note.wonSets,
      createdAt: note.createdAt.toISOString()
    }));

    // トレンド分析（月別・年別）
    const trends = calculateTrends(notes);

    // 戦術提案
    const tactics = generateTacticsSuggestions(notes);

    // 新しい分析データを計算
    const matchAnalysis = calculateMatchAnalysis(notes);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          name: opponentName,
          totalMatches,
          wins,
          losses,
          draws,
          winRate: Math.round(winRate * 10) / 10,
          currentStreak,
          longestWinStreak,
          longestLoseStreak,
          firstMatch: notes[notes.length - 1]?.createdAt.toISOString(),
          lastMatch: notes[0]?.createdAt.toISOString()
        },
        recentMatches,
        trends,
        tactics,
        matchAnalysis
      }
    });

  } catch (error) {
    console.error('Opponent Detail API Error:', error);
    return NextResponse.json(
      { error: '対戦相手詳細データの取得に失敗しました' },
      { status: 500 }
    );
  }
}



// トレンド分析を計算する関数
function calculateTrends(notes: any[]): { monthlyStats: any[], yearlyStats: any[] } {
  const monthlyStats = new Map<string, { matches: number, wins: number }>();
  const yearlyStats = new Map<string, { matches: number, wins: number }>();

  notes.forEach(note => {
    const month = note.createdAt.toISOString().substring(0, 7); // YYYY-MM
    const year = note.createdAt.getFullYear().toString();
    const isWin = note.result?.name === '勝ち';

    // 月別統計
    if (!monthlyStats.has(month)) {
      monthlyStats.set(month, { matches: 0, wins: 0 });
    }
    const monthData = monthlyStats.get(month)!;
    monthData.matches++;
    if (isWin) monthData.wins++;

    // 年別統計
    if (!yearlyStats.has(year)) {
      yearlyStats.set(year, { matches: 0, wins: 0 });
    }
    const yearData = yearlyStats.get(year)!;
    yearData.matches++;
    if (isWin) yearData.wins++;
  });

  return {
    monthlyStats: Array.from(monthlyStats.entries())
      .map(([month, data]) => ({
        month,
        winRate: Math.round((data.wins / data.matches * 100) * 10) / 10
      }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    yearlyStats: Array.from(yearlyStats.entries())
      .map(([year, data]) => ({
        year,
        winRate: Math.round((data.wins / data.matches * 100) * 10) / 10
      }))
      .sort((a, b) => a.year.localeCompare(b.year))
  };
}

// 戦術提案を生成する関数
function generateTacticsSuggestions(notes: any[]): any[] {
  const suggestions: any[] = [];
  
  const winningMatches = notes.filter(note => note.result?.name === '勝ち');
  
  if (winningMatches.length === 0) {
    suggestions.push({
      type: 'general',
      description: 'まだ勝利した試合がないため、基本的な戦術の見直しを検討してください',
      effectiveness: 3
    });
  }

  return suggestions;
}



// 現在の連続記録を計算する関数
function calculateCurrentStreak(matches: any[]): number {
  if (matches.length === 0) return 0;
  
  let streak = 0;
  for (const match of matches) {
    if (match.result?.name === '勝ち') {
      if (streak >= 0) streak++;
      else break;
    } else if (match.result?.name === '負け') {
      if (streak <= 0) streak--;
      else break;
    } else {
      break;
    }
  }
  
  return streak;
}

// 最長連続記録を計算する関数
function calculateLongestStreak(matches: any[], type: 'win' | 'loss'): number {
  let longestStreak = 0;
  let currentStreak = 0;
  
  for (const match of matches) {
    if (type === 'win' && match.result?.name === '勝ち') {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (type === 'loss' && match.result?.name === '負け') {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return longestStreak;
}

// 試合分析データを計算する関数
function calculateMatchAnalysis(notes: any[]): any {
  // 練習試合と公式試合を分類
  const practiceMatches = notes.filter(note => 
    note.noteType?.name === '練習' || note.noteType?.name === 'ゲーム練習'
  );
  const officialMatches = notes.filter(note => 
    note.noteType?.name === '公式試合'
  );

  // 練習試合の戦績
  const practiceWins = practiceMatches.filter(note => note.result?.name === '勝ち').length;
  const practiceLosses = practiceMatches.filter(note => note.result?.name === '負け').length;
  const practiceWinRate = practiceMatches.length > 0 ? 
    Math.round((practiceWins / practiceMatches.length * 100) * 10) / 10 : 0;

  // 公式試合の戦績
  const officialWins = officialMatches.filter(note => note.result?.name === '勝ち').length;
  const officialLosses = officialMatches.filter(note => note.result?.name === '負け').length;
  const officialWinRate = officialMatches.length > 0 ? 
    Math.round((officialWins / officialMatches.length * 100) * 10) / 10 : 0;

  // 2セット以上ある試合を抽出
  const multiSetMatches = notes.filter(note => note.totalSets && note.totalSets >= 2);

  // 2セット先取で終わった試合（2-0勝利、0-2敗戦）
  const twoSetWins = multiSetMatches.filter(note => {
    if (note.result?.name !== '勝ち' || !note.scoreSets || note.scoreSets.length < 2) return false;
    const wonSets = note.scoreSets.filter((set: any) => set.myScore > set.opponentScore).length;
    return wonSets === 2;
  }).length;

  const twoSetLosses = multiSetMatches.filter(note => {
    if (note.result?.name !== '負け' || !note.scoreSets || note.scoreSets.length < 2) return false;
    const wonSets = note.scoreSets.filter((set: any) => set.myScore > set.opponentScore).length;
    return wonSets === 0;
  }).length;

  // 3セットにもつれ込んだ試合（2-1勝利、1-2敗戦）
  const threeSetWins = multiSetMatches.filter(note => {
    if (note.result?.name !== '勝ち' || !note.scoreSets || note.scoreSets.length < 3) return false;
    const wonSets = note.scoreSets.filter((set: any) => set.myScore > set.opponentScore).length;
    return wonSets === 2;
  }).length;

  const threeSetLosses = multiSetMatches.filter(note => {
    if (note.result?.name !== '負け' || !note.scoreSets || note.scoreSets.length < 3) return false;
    const wonSets = note.scoreSets.filter((set: any) => set.myScore > set.opponentScore).length;
    return wonSets === 1;
  }).length;

  // 2セット先取試合の勝率計算
  const twoSetTotal = twoSetWins + twoSetLosses;
  const twoSetWinRate = twoSetTotal > 0 ? 
    Math.round((twoSetWins / twoSetTotal * 100) * 10) / 10 : 0;

  // 3セット戦の勝率計算
  const threeSetTotal = threeSetWins + threeSetLosses;
  const threeSetWinRate = threeSetTotal > 0 ? 
    Math.round((threeSetWins / threeSetTotal * 100) * 10) / 10 : 0;

  return {
    practice: {
      matches: practiceMatches.length,
      wins: practiceWins,
      losses: practiceLosses,
      winRate: practiceWinRate
    },
    official: {
      matches: officialMatches.length,
      wins: officialWins,
      losses: officialLosses,
      winRate: officialWinRate
    },
    twoSetMatches: {
      matches: twoSetTotal,
      wins: twoSetWins,
      losses: twoSetLosses,
      winRate: twoSetWinRate
    },
    threeSetMatches: {
      matches: threeSetTotal,
      wins: threeSetWins,
      losses: threeSetLosses,
      winRate: threeSetWinRate
    }
  };
}



 