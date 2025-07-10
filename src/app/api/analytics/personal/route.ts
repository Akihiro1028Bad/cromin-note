import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    // ユーザーの全ノートを取得（試合結果があるもののみ）
    const notes = await prisma.note.findMany({
      where: {
        userId: userId,
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

    // 基本統計
    const totalMatches = notes.length;
    const wins = notes.filter(note => note.result?.name === '勝ち').length;
    const losses = notes.filter(note => note.result?.name === '負け').length;
    const draws = notes.filter(note => note.result?.name === '引き分け').length;
    const winRate = totalMatches > 0 ? (wins / totalMatches * 100).toFixed(1) : '0.0';

    // 月別統計
    const monthlyStats = notes.reduce((acc, note) => {
      const month = note.createdAt.toISOString().substring(0, 7); // YYYY-MM形式
      if (!acc[month]) {
        acc[month] = { total: 0, wins: 0, losses: 0, draws: 0 };
      }
      acc[month].total++;
      if (note.result?.name === '勝ち') acc[month].wins++;
      else if (note.result?.name === '負け') acc[month].losses++;
      else if (note.result?.name === '引き分け') acc[month].draws++;
      return acc;
    }, {} as Record<string, { total: number; wins: number; losses: number; draws: number }>);

    // 年別統計
    const yearlyStats = notes.reduce((acc, note) => {
      const year = note.createdAt.getFullYear().toString();
      if (!acc[year]) {
        acc[year] = { total: 0, wins: 0, losses: 0, draws: 0 };
      }
      acc[year].total++;
      if (note.result?.name === '勝ち') acc[year].wins++;
      else if (note.result?.name === '負け') acc[year].losses++;
      else if (note.result?.name === '引き分け') acc[year].draws++;
      return acc;
    }, {} as Record<string, { total: number; wins: number; losses: number; draws: number }>);

    // 対戦相手別統計
    const opponentStats = notes.reduce((acc, note) => {
      if (!note.opponent) return acc;
      
      if (!acc[note.opponent]) {
        acc[note.opponent] = { total: 0, wins: 0, losses: 0, draws: 0, lastMatch: null, winRate: 0 };
      }
      
      acc[note.opponent].total++;
      if (note.result?.name === '勝ち') acc[note.opponent].wins++;
      else if (note.result?.name === '負け') acc[note.opponent].losses++;
      else if (note.result?.name === '引き分け') acc[note.opponent].draws++;
      
      if (
        !acc[note.opponent]!.lastMatch ||
        (acc[note.opponent]!.lastMatch !== null && note.createdAt > (acc[note.opponent]!.lastMatch as Date))
      ) {
        acc[note.opponent]!.lastMatch = note.createdAt;
      }
      
      return acc;
    }, {} as Record<string, { 
      total: number; 
      wins: number; 
      losses: number; 
      draws: number; 
      lastMatch: Date | null;
      winRate: number;
    }>);

    // 対戦相手別勝率を計算
    Object.keys(opponentStats).forEach(opponent => {
      const stats = opponentStats[opponent];
      const winRate = stats.total > 0 ? (stats.wins / stats.total * 100).toFixed(1) : '0.0';
      opponentStats[opponent] = { ...stats, winRate: parseFloat(winRate) };
    });

    // 試合タイプ別統計
    const typeStats = notes.reduce((acc, note) => {
      const typeName = note.noteType.name;
      if (!acc[typeName]) {
        acc[typeName] = { total: 0, wins: 0, losses: 0, draws: 0, winRate: 0 };
      }
      acc[typeName].total++;
      if (note.result?.name === '勝ち') acc[typeName].wins++;
      else if (note.result?.name === '負け') acc[typeName].losses++;
      else if (note.result?.name === '引き分け') acc[typeName].draws++;
      return acc;
    }, {} as Record<string, { total: number; wins: number; losses: number; draws: number; winRate: number }>);

    // 試合タイプ別勝率を計算
    Object.keys(typeStats).forEach(type => {
      const stats = typeStats[type];
      const winRate = stats.total > 0 ? (stats.wins / stats.total * 100).toFixed(1) : '0.0';
      typeStats[type] = { ...stats, winRate: parseFloat(winRate) };
    });

    // 最近の試合（最新10試合）
    const recentMatches = notes.slice(0, 10).map(note => ({
      id: note.id,
      title: note.title,
      opponent: note.opponent,
      result: note.result?.name,
      noteType: note.noteType.name,
      createdAt: note.createdAt,
      scoreData: note.scoreSets.length > 0 ? JSON.stringify(note.scoreSets.map(set => ({
        setNumber: set.setNumber,
        myScore: set.myScore,
        opponentScore: set.opponentScore
      }))) : null,
      wonSets: note.wonSets,
      totalSets: note.totalSets
    }));

    // 連続記録
    let currentStreak = 0;
    let longestWinStreak = 0;
    let longestLoseStreak = 0;
    let tempWinStreak = 0;
    let tempLoseStreak = 0;

    for (const note of notes) {
      if (note.result?.name === '勝ち') {
        tempWinStreak++;
        tempLoseStreak = 0;
        if (tempWinStreak > longestWinStreak) {
          longestWinStreak = tempWinStreak;
        }
        if (currentStreak === 0) currentStreak = tempWinStreak;
      } else if (note.result?.name === '負け') {
        tempLoseStreak++;
        tempWinStreak = 0;
        if (tempLoseStreak > longestLoseStreak) {
          longestLoseStreak = tempLoseStreak;
        }
        if (currentStreak === 0) currentStreak = -tempLoseStreak;
      } else {
        tempWinStreak = 0;
        tempLoseStreak = 0;
        if (currentStreak === 0) currentStreak = 0;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalMatches,
          wins,
          losses,
          draws,
          winRate: parseFloat(winRate),
          currentStreak,
          longestWinStreak,
          longestLoseStreak
        },
        monthlyStats,
        yearlyStats,
        opponentStats,
        typeStats,
        recentMatches
      }
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: '分析データの取得に失敗しました' },
      { status: 500 }
    );
  }
} 