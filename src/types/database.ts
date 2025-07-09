export interface User {
  id: string
  nickname: string | null
  created_at: string
}

export interface NoteType {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface Result {
  id: number
  name: string
  created_at: string
}

export interface Note {
  id: string
  user_id: string
  type_id: number
  title: string | null
  opponent: string | null
  content: string | null
  result_id: number | null
  memo: string | null
  condition: string | null
  is_public: boolean
  score_data: string | null
  total_sets: number | null
  won_sets: number | null
  match_duration: number | null
  created_at: string
  updated_at: string
}

export interface NoteWithRelations extends Note {
  user: User
  note_type: NoteType
  result: Result | null
} 