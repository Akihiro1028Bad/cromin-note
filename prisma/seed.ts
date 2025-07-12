import { PrismaClient } from '@prisma/client'

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

  // Categoryのマスターデータ（シングルス、ダブルス、ミックスダブルス）
  const categories = [
    { name: 'シングルス' },
    { name: 'ダブルス' },
    { name: 'ミックスダブルス' }
  ]

  console.log('Categoryのマスターデータを挿入中...')
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
  }
  console.log('Categoryのマスターデータ挿入完了')

  console.log('マスターデータの挿入が完了しました！')
  
  // 挿入されたデータの確認
  const insertedTypes = await prisma.noteType.findMany({
    orderBy: { id: 'asc' }
  })
  const insertedResults = await prisma.result.findMany({
    orderBy: { id: 'asc' }
  })
  const insertedCategories = await prisma.category.findMany({
    orderBy: { id: 'asc' }
  })
  
  console.log('\n=== 挿入されたNoteType ===')
  insertedTypes.forEach((type: any) => {
    console.log(`ID: ${type.id}, Name: ${type.name}`)
  })
  
  console.log('\n=== 挿入されたResult ===')
  insertedResults.forEach((result: any) => {
    console.log(`ID: ${result.id}, Name: ${result.name}`)
  })

  console.log('\n=== 挿入されたCategory ===')
  insertedCategories.forEach((category: any) => {
    console.log(`ID: ${category.id}, Name: ${category.name}`)
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