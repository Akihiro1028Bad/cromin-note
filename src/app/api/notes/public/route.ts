import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const notes = await prisma.note.findMany({
      where: {
        isPublic: true
      },
      include: {
        user: {
          select: {
            nickname: true
          }
        },
        noteType: {
          select: {
            name: true
          }
        },
        result: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const mappedNotes = notes.map(note => ({
      ...note,
      note_type: note.noteType,
      noteType: undefined,
      // 日付フィールドを明示的に含める
      created_at: note.createdAt,
      updated_at: note.updatedAt,
      // スコア関連フィールドを明示的に含める
      score_data: note.scoreData,
      total_sets: note.totalSets,
      won_sets: note.wonSets,
      match_duration: note.matchDuration
    }));

    return NextResponse.json(
      { success: true, notes: mappedNotes },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching public notes:', error);
    return NextResponse.json(
      { success: false, message: '公開ノートの取得に失敗しました。' },
      { status: 500 }
    );
  }
} 