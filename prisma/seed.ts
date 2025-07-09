import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('マスターデータの挿入を開始します...')

  // NoteTypeのマスターデータ（現在の実装に合わせて設計）
  const noteTypes = [
    { name: '練習' },
    { name: 'ゲーム練習' },  // 対戦相手・結果フィールドが表示される
    { name: '公式試合' },    // 試合名・対戦相手・結果フィールドが表示される
  ]

  console.log('NoteTypeのマスターデータを挿入中...')
  for (const noteType of noteTypes) {
    await prisma.noteType.upsert({
      where: { name: noteType.name },
      update: {},
      create: noteType
    })
  }
  console.log('NoteTypeのマスターデータ挿入完了')

  // Resultのマスターデータ（現在の実装に合わせて設計）
  const results = [
    { name: '勝ち' },
    { name: '負け' },
    { name: '引き分け' },
    { name: '練習のみ' },
    { name: '未定' }
  ]

  console.log('Resultのマスターデータを挿入中...')
  for (const result of results) {
    await prisma.result.upsert({
      where: { name: result.name },
      update: {},
      create: result
    })
  }
  console.log('Resultのマスターデータ挿入完了')

  console.log('マスターデータの挿入が完了しました！')
  
  // 挿入されたデータの確認
  const insertedTypes = await prisma.noteType.findMany({
    orderBy: { id: 'asc' }
  })
  const insertedResults = await prisma.result.findMany({
    orderBy: { id: 'asc' }
  })
  
  console.log('\n=== 挿入されたNoteType ===')
  insertedTypes.forEach(type => {
    console.log(`ID: ${type.id}, Name: ${type.name}`)
  })
  
  console.log('\n=== 挿入されたResult ===')
  insertedResults.forEach(result => {
    console.log(`ID: ${result.id}, Name: ${result.name}`)
  })
}

main()
  .catch((e) => {
    console.error('エラーが発生しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 