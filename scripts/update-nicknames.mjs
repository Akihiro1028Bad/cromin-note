#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateNicknames() {
  try {
    console.log('🔄 ニックネーム更新スクリプト開始...');

    // ニックネームがnullまたは空文字のユーザーを取得
    const usersWithoutNickname = await prisma.user.findMany({
      where: {
        OR: [
          { nickname: null },
          { nickname: '' }
        ]
      }
    });

    console.log(`📊 ニックネームが未設定のユーザー数: ${usersWithoutNickname.length}`);

    if (usersWithoutNickname.length === 0) {
      console.log('✅ すべてのユーザーにニックネームが設定されています');
      return;
    }

    // 各ユーザーにデフォルトニックネームを設定
    for (const user of usersWithoutNickname) {
      const defaultNickname = `ユーザー${user.id.slice(-4)}`;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { nickname: defaultNickname }
      });

      console.log(`✅ ${user.email} → ${defaultNickname}`);
    }

    console.log('🎉 ニックネーム更新が完了しました！');

  } catch (error) {
    console.error('❌ ニックネーム更新でエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateNicknames(); 