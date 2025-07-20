import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    // クエリパラメータの取得
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    // ユーザーの全ノートを取得（試合結果があるもののみ）
    const notes = await prisma.note.findMany({
      where: {
        userId: userId,
        resultId: { not: null },
        noteOpponents: {
          some: {}
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

    // 対戦相手別統計を計算
    const opponentMap = new Map<string, {
      name: string;
      totalMatches: number;
      wins: number;
      losses: number;
      draws: number;
      matches: any[];
      scorePatterns: Map<string, number>;
      matchDurations: number[];
      totalSets: number[];
      lastMatch: Date | null;
      firstMatch: Date | null;
    }>();

    notes.forEach(note => {
      note.noteOpponents.forEach(noteOpponent => {
        const opponentName = noteOpponent.opponent.name;
        
        if (!opponentMap.has(opponentName)) {
          opponentMap.set(opponentName, {
            name: opponentName,
            totalMatches: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            matches: [],
            scorePatterns: new Map(),
            matchDurations: [],
            totalSets: [],
            lastMatch: null,
            firstMatch: null
          });
        }
        
        const opponentData = opponentMap.get(opponentName)!;
        opponentData.totalMatches++;
        opponentData.matches.push(note);
        
        // 勝敗カウント
        if (note.result?.name === '勝ち') opponentData.wins++;
        else if (note.result?.name === '負け') opponentData.losses++;
        else if (note.result?.name === '引き分け') opponentData.draws++;
        
        // スコアパターン分析
        if (note.scoreSets.length > 0) {
          const scorePattern = calculateScorePattern(note.scoreSets);
          const current = opponentData.scorePatterns.get(scorePattern) || 0;
          opponentData.scorePatterns.set(scorePattern, current + 1);
        }
        
        // 試合時間
        if (note.matchDuration) {
          opponentData.matchDurations.push(note.matchDuration);
        }
        
        // セット数
        if (note.totalSets) {
          opponentData.totalSets.push(note.totalSets);
        }
        
        // 最初と最後の試合日
        if (!opponentData.firstMatch || note.createdAt < opponentData.firstMatch) {
          opponentData.firstMatch = note.createdAt;
        }
        if (!opponentData.lastMatch || note.createdAt > opponentData.lastMatch) {
          opponentData.lastMatch = note.createdAt;
        }
      });
    });

    // 対戦相手データを配列に変換
    let opponents = Array.from(opponentMap.values())
      .filter(opponent => 
        !search || opponent.name.toLowerCase().includes(search.toLowerCase())
      )
      .map(opponent => {
        const winRate = opponent.totalMatches > 0 ? 
          (opponent.wins / opponent.totalMatches * 100) : 0;
        
        const avgMatchDuration = opponent.matchDurations.length > 0 ?
          Math.round(opponent.matchDurations.reduce((a, b) => a + b, 0) / opponent.matchDurations.length) : 0;
        
        const avgSets = opponent.totalSets.length > 0 ?
          Math.round((opponent.totalSets.reduce((a, b) => a + b, 0) / opponent.totalSets.length) * 10) / 10 : 0;
        
        const currentStreak = calculateCurrentStreak(opponent.matches);
        const longestWinStreak = calculateLongestStreak(opponent.matches, 'win');
        const longestLoseStreak = calculateLongestStreak(opponent.matches, 'loss');
        
        return {
          name: opponent.name,
          totalMatches: opponent.totalMatches,
          wins: opponent.wins,
          losses: opponent.losses,
          draws: opponent.draws,
          winRate: Math.round(winRate * 10) / 10,
          avgMatchDuration,
          avgSets,
          currentStreak,
          longestWinStreak,
          longestLoseStreak,
          lastMatch: opponent.lastMatch?.toISOString() || null,
          firstMatch: opponent.firstMatch?.toISOString() || null
        };
      });

    // 名前順でソート
    opponents = opponents.sort((a, b) => a.name.localeCompare(b.name, 'ja'));



    // 制限を適用
    if (limit > 0) {
      opponents = opponents.slice(0, limit);
    }

    // 統計サマリーを計算
    const totalOpponents = opponentMap.size;
    const avgWinRate = opponents.length > 0 ? 
      Math.round(opponents.reduce((sum, o) => sum + o.winRate, 0) / opponents.length * 10) / 10 : 0;
    const maxWinStreak = Math.max(...opponents.map(o => o.longestWinStreak), 0);

    return NextResponse.json({
      success: true,
      data: {
        opponents,
        summary: {
          totalOpponents,
          avgWinRate,
          maxWinStreak
        }
      }
    });

  } catch (error) {
    console.error('Opponents API Error:', error);
    return NextResponse.json(
      { error: '対戦相手データの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// スコアパターンを計算する関数
function calculateScorePattern(scoreSets: any[]): string {
  if (scoreSets.length === 0) return '';
  
  const totalMyScore = scoreSets.reduce((sum, set) => sum + set.myScore, 0);
  const totalOpponentScore = scoreSets.reduce((sum, set) => sum + set.opponentScore, 0);
  
  return `${totalMyScore}-${totalOpponentScore}`;
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



 