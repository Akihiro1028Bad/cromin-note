import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

async function main() {
  console.log('🌱 マスターデータの挿入を開始します...')
  console.log('🔧 環境:', process.env.NODE_ENV || 'development')
  console.log('🗄️ データベースURL:', process.env.DATABASE_URL?.substring(0, 20) + '...')

  // 既存データの確認
  const existingNoteTypes = await prisma.noteType.count()
  const existingResults = await prisma.result.count()
  const existingCategories = await prisma.category.count()
  
  console.log('📊 既存データ数:')
  console.log(`  NoteType: ${existingNoteTypes}`)
  console.log(`  Result: ${existingResults}`)
  console.log(`  Category: ${existingCategories}`)

  // すべてのマスタデータが既に存在する場合はスキップ
  const totalExpected = 3 + 5 + 3 // NoteType(3) + Result(5) + Category(3)
  const totalExisting = existingNoteTypes + existingResults + existingCategories
  
  if (totalExisting >= totalExpected) {
    console.log('✅ すべてのマスタデータが既に存在します。スキップします。')
    return
  }

  // NoteTypeのマスターデータ（現在の実装に合わせて設計）
  const noteTypes = [
    { name: '練習' },
    { name: 'ゲーム練習' },  // 対戦相手・結果フィールドが表示される
    { name: '公式試合' },    // 試合名・対戦相手・結果フィールドが表示される
  ]

  console.log('NoteTypeのマスターデータを挿入中...')
  let noteTypeInserted = 0
  let noteTypeSkipped = 0
  for (const noteType of noteTypes) {
    const result = await prisma.noteType.upsert({
      where: { name: noteType.name },
      update: {},
      create: noteType
    })
    if (result.createdAt === result.updatedAt) {
      noteTypeInserted++
    } else {
      noteTypeSkipped++
    }
  }
  console.log(`NoteTypeのマスターデータ挿入完了 (新規: ${noteTypeInserted}, 既存: ${noteTypeSkipped})`)

  // Resultのマスターデータ（現在の実装に合わせて設計）
  const results = [
    { name: '勝ち' },
    { name: '負け' },
    { name: '引き分け' },
    { name: '練習のみ' },
    { name: '未定' }
  ]

  console.log('Resultのマスターデータを挿入中...')
  let resultInserted = 0
  let resultSkipped = 0
  for (const result of results) {
    const resultRecord = await prisma.result.upsert({
      where: { name: result.name },
      update: {},
      create: result
    })
    if (resultRecord.createdAt === resultRecord.updatedAt) {
      resultInserted++
    } else {
      resultSkipped++
    }
  }
  console.log(`Resultのマスターデータ挿入完了 (新規: ${resultInserted}, 既存: ${resultSkipped})`)

  // Categoryのマスターデータ（シングルス、ダブルス、ミックスダブルス）
  const categories = [
    { name: 'シングルス' },
    { name: 'ダブルス' },
    { name: 'ミックスダブルス' }
  ]

  console.log('Categoryのマスターデータを挿入中...')
  let categoryInserted = 0
  let categorySkipped = 0
  for (const category of categories) {
    const categoryRecord = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
    if (categoryRecord.createdAt === categoryRecord.updatedAt) {
      categoryInserted++
    } else {
      categorySkipped++
    }
  }
  console.log(`Categoryのマスターデータ挿入完了 (新規: ${categoryInserted}, 既存: ${categorySkipped})`)

  console.log('✅ マスターデータの挿入が完了しました！')
  
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
    console.error('❌ エラーが発生しました:', e)
    console.error('スタックトレース:', e.stack)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('🔌 データベース接続を切断しました')
  }) 