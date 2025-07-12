const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateNicknames() {
  try {
    console.log('既存のユーザーにデフォルトのニックネームを設定しています...');
    
    // ニックネームがnullまたは空文字のユーザーを取得
    const usersWithoutNickname = await prisma.user.findMany({
      where: {
        OR: [
          { nickname: null },
          { nickname: '' }
        ]
      }
    });

    console.log(`${usersWithoutNickname.length}人のユーザーが見つかりました`);

    // 各ユーザーにデフォルトのニックネームを設定
    for (const user of usersWithoutNickname) {
      const defaultNickname = `ユーザー${user.id.slice(-6)}`; // IDの最後の6文字を使用
      
      await prisma.user.update({
        where: { id: user.id },
        data: { nickname: defaultNickname }
      });
      
      console.log(`ユーザー ${user.email} にニックネーム "${defaultNickname}" を設定しました`);
    }

    console.log('ニックネームの更新が完了しました');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateNicknames(); 