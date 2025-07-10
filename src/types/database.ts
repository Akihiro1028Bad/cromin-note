export interface User {
  id: string
  nickname: string | null
  createdAt: string
}

export interface NoteType {
  id: number
  name: string
  description: string | null
  createdAt: string
}

export interface Result {
  id: number
  name: string
  createdAt: string
}

export interface ScoreSet {
  id: string
  noteId: string
  setNumber: number
  myScore: number
  opponentScore: number
}

export interface Note {
  id: string
  userId: string
  typeId: number
  title: string | null
  opponent: string | null
  content: string | null
  resultId: number | null
  memo: string | null
  condition: string | null
  isPublic: boolean
  totalSets: number | null
  wonSets: number | null
  matchDuration: number | null
  createdAt: string
  updatedAt: string
}

export interface NoteWithRelations extends Note {
  user: User
  noteType: NoteType
  result: Result | null
  scoreSets: ScoreSet[]
} 