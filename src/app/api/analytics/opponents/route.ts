import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    // 対戦相手別の詳細データを取得
    const notes = await prisma.note.findMany({
      where: {
        userId: userId,
        opponent: { not: null },
        resultId: { not: null }
      },
      include: {
        result: true,
        noteType: true,
        scoreSets: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 対戦相手別の詳細統計
    const opponentDetails = notes.reduce((acc, note) => {
      if (!note.opponent) return acc;
      
      if (!acc[note.opponent]) {
        acc[note.opponent] = {
          name: note.opponent,
          totalMatches: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winRate: 0,
          firstMatch: note.createdAt,
          lastMatch: note.createdAt,
          matches: [],
          typeStats: {},
          recentForm: [],
          averageSets: 0,
          totalSets: 0,
          totalMatchesWithSets: 0
        };
      }
      
      const opponent = acc[note.opponent];
      opponent.totalMatches++;
      opponent.lastMatch = note.createdAt;
      
      if (note.result?.name === '勝ち') opponent.wins++;
      else if (note.result?.name === '負け') opponent.losses++;
      else if (note.result?.name === '引き分け') opponent.draws++;
      
      // 試合詳細を記録
      opponent.matches.push({
        id: note.id,
        title: note.title,
        result: note.result?.name ?? null,
        noteType: note.noteType.name,
        createdAt: note.createdAt,
        scoreData: note.scoreSets.length > 0 ? JSON.stringify(note.scoreSets.map(set => ({
          setNumber: set.setNumber,
          myScore: set.myScore,
          opponentScore: set.opponentScore
        }))) : null,
        wonSets: note.wonSets,
        totalSets: note.totalSets,
        matchDuration: note.matchDuration,
        content: note.content,
        memo: note.memo
      });
      
      // 試合タイプ別統計
      const typeName = note.noteType.name;
      if (!opponent.typeStats[typeName]) {
        opponent.typeStats[typeName] = { total: 0, wins: 0, losses: 0, draws: 0, winRate: 0 };
      }
      opponent.typeStats[typeName].total++;
      if (note.result?.name === '勝ち') opponent.typeStats[typeName].wins++;
      else if (note.result?.name === '負け') opponent.typeStats[typeName].losses++;
      else if (note.result?.name === '引き分け') opponent.typeStats[typeName].draws++;
      
      // セット数統計
      if (note.totalSets && note.wonSets !== null) {
        opponent.totalSets += note.totalSets;
        opponent.totalMatchesWithSets++;
      }
      
      return acc;
    }, {} as Record<string, {
      name: string;
      totalMatches: number;
      wins: number;
      losses: number;
      draws: number;
      winRate: number;
      firstMatch: Date;
      lastMatch: Date;
      matches: Array<{
        id: string;
        title: string | null;
        result: string | null;
        noteType: string;
        createdAt: Date;
        scoreData: string | null;
        wonSets: number | null;
        totalSets: number | null;
        matchDuration: number | null;
        content: string | null;
        memo: string | null;
      }>;
      typeStats: Record<string, { total: number; wins: number; losses: number; draws: number; winRate: number }>;
      recentForm: string[];
      averageSets: number;
      totalSets: number;
      totalMatchesWithSets: number;
    }>);

    // 各対戦相手の詳細計算
    Object.keys(opponentDetails).forEach(opponentName => {
      const opponent = opponentDetails[opponentName];
      
      // 勝率計算
      opponent.winRate = opponent.totalMatches > 0 
        ? parseFloat((opponent.wins / opponent.totalMatches * 100).toFixed(1))
        : 0;
      
      // 平均セット数計算
      opponent.averageSets = opponent.totalMatchesWithSets > 0
        ? parseFloat((opponent.totalSets / opponent.totalMatchesWithSets).toFixed(1))
        : 0;
      
      // 最近の調子（最新5試合）
      opponent.recentForm = opponent.matches
        .slice(0, 5)
        .map(match => match.result || '不明');
      
      // 試合タイプ別勝率を計算
      Object.keys(opponent.typeStats).forEach(type => {
        const stats = opponent.typeStats[type];
        const winRate = stats.total > 0 ? (stats.wins / stats.total * 100).toFixed(1) : '0.0';
        opponent.typeStats[type] = { ...stats, winRate: parseFloat(winRate) };
      });
      
      // 試合を日付順にソート
      opponent.matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    // 対戦相手を勝率順にソート
    const sortedOpponents = Object.values(opponentDetails).sort((a, b) => b.winRate - a.winRate);

    // 全体統計
    const totalOpponents = sortedOpponents.length;
    const totalMatches = sortedOpponents.reduce((sum, opponent) => sum + opponent.totalMatches, 0);
    const averageWinRate = totalOpponents > 0 
      ? parseFloat((sortedOpponents.reduce((sum, opponent) => sum + opponent.winRate, 0) / totalOpponents).toFixed(1))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalOpponents,
          totalMatches,
          averageWinRate
        },
        opponents: sortedOpponents
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