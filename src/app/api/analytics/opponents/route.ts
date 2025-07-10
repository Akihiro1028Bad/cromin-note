import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getOpponentsData } from '@/lib/analytics';

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

    // 共通ロジックを使用してデータを取得
    const data = await getOpponentsData(userId);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Opponents API Error:', error);
    return NextResponse.json(
      { error: '対戦相手データの取得に失敗しました' },
      { status: 500 }
    );
  }
} 