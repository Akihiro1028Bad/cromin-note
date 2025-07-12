'use client'

import { useState, useEffect, useRef } from 'react'
import OpponentModal from './OpponentModal'

interface Opponent {
  id: string
  name: string
}

interface OpponentSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  category: string
  isRequired?: boolean
  disabled?: boolean
}

export default function OpponentSelect({ 
  value, 
  onChange, 
  category, 
  isRequired = false, 
  disabled = false 
}: OpponentSelectProps) {
  const [opponents, setOpponents] = useState<Opponent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOpponentIds, setSelectedOpponentIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // 前回の値を記録
  const prevSelectedOpponentIdsRef = useRef<string[]>([])
  const prevValueRef = useRef<string[]>([])

  // カテゴリに応じてシングルスかダブルスかを判定
  const isDoubles = category === 'ダブルス' || category === 'ミックスダブルス'

  // 対戦相手一覧を取得
  const fetchOpponents = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/opponents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('対戦相手の取得に失敗しました')
      }
      const data = await response.json()
      setOpponents(data.opponents || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpponents()
  }, [])

  // 初期値の設定
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(prevValueRef.current)) {
      setSelectedOpponentIds(value || [])
      prevValueRef.current = [...value]
    }
  }, [value])

  // 選択された対戦相手の変更を親コンポーネントに通知
  useEffect(() => {
    const currentSelected = JSON.stringify(selectedOpponentIds)
    const prevSelected = JSON.stringify(prevSelectedOpponentIdsRef.current)
    
    // 実際に値が変更された場合のみ親コンポーネントに通知
    if (currentSelected !== prevSelected) {
      onChange(selectedOpponentIds)
      prevSelectedOpponentIdsRef.current = [...selectedOpponentIds]
    }
  }, [selectedOpponentIds]) // onChangeを依存関係から削除

  // 対戦相手を選択（指定された位置に設定）
  const handleOpponentSelect = (opponentId: string, position: number) => {
    const newSelected = [...selectedOpponentIds]
    newSelected[position] = opponentId
    setSelectedOpponentIds(newSelected)
  }

  // 選択をクリア
  const handleClearSelection = (position: number) => {
    const newSelected = [...selectedOpponentIds]
    newSelected[position] = ''
    setSelectedOpponentIds(newSelected)
  }

  // 新規対戦相手登録後の処理
  const handleOpponentCreated = (opponent: Opponent) => {
    setOpponents(prev => [...prev, opponent])
    // 新しく登録された対戦相手を最初の空いている位置に自動選択
    const emptyPosition = selectedOpponentIds.findIndex(id => !id)
    if (emptyPosition !== -1) {
      handleOpponentSelect(opponent.id, emptyPosition)
    } else if (selectedOpponentIds.length < (isDoubles ? 2 : 1)) {
      // 配列が短い場合は追加
      const newSelected = [...selectedOpponentIds]
      newSelected.push(opponent.id)
      setSelectedOpponentIds(newSelected)
    }
  }

  // 検索クエリに基づいて対戦相手をフィルタリング
  const filteredOpponents = opponents.filter(opponent =>
    opponent.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // バリデーション
  const isValid = () => {
    if (!isRequired) return true
    if (isDoubles) {
      return selectedOpponentIds.length >= 2 && selectedOpponentIds[0] && selectedOpponentIds[1]
    }
    return selectedOpponentIds.length >= 1 && selectedOpponentIds[0]
  }

  // 選択された対戦相手の名前を取得
  const getSelectedOpponentName = (position: number): string => {
    const opponentId = selectedOpponentIds[position]
    if (!opponentId) return ''
    const opponent = opponents.find(o => o.id === opponentId)
    return opponent?.name || ''
  }

  if (loading) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          対戦相手 {isRequired && <span className="text-red-500">*</span>}
        </label>
        <div className="space-y-2">
          <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
          {isDoubles && <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          対戦相手 {isRequired && <span className="text-red-500">*</span>}
        </label>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        対戦相手 {isRequired && <span className="text-red-500">*</span>}
      </label>

      {/* 選択欄 */}
      <div className="space-y-2">
        {/* 1番目の選択欄 */}
        <OpponentSelectField
          value={getSelectedOpponentName(0)}
          onSelect={(opponentName) => {
            const opponent = opponents.find(o => o.name === opponentName)
            if (opponent) {
              handleOpponentSelect(opponent.id, 0)
            }
          }}
          onClear={() => handleClearSelection(0)}
          opponents={opponents}
          disabled={disabled}
          label="1番目の対戦相手"
          placeholder={isDoubles ? "1番目の対戦相手を選択" : "対戦相手を選択"}
        />

        {/* 2番目の選択欄（ダブルスの場合のみ） */}
        {isDoubles && (
          <OpponentSelectField
            value={getSelectedOpponentName(1)}
            onSelect={(opponentName) => {
              const opponent = opponents.find(o => o.name === opponentName)
              if (opponent) {
                handleOpponentSelect(opponent.id, 1)
              }
            }}
            onClear={() => handleClearSelection(1)}
            opponents={opponents}
            disabled={disabled}
            label="2番目の対戦相手"
            placeholder="2番目の対戦相手を選択"
          />
        )}
      </div>

      {/* 新規登録ボタン */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
        className="mt-3 w-full h-10 px-4 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 disabled:border-gray-200 disabled:text-gray-400 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        新規対戦相手を登録
      </button>

      {isRequired && !isValid() && (
        <p className="mt-1 text-sm text-red-600">
          {isDoubles ? '2名の対戦相手を選択してください' : '対戦相手を選択してください'}
        </p>
      )}

      {/* 対戦相手選択モーダル */}
      <OpponentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpponentCreated={handleOpponentCreated}
      />
    </div>
  )
}

// 個別の選択欄コンポーネント
interface OpponentSelectFieldProps {
  value: string
  onSelect: (opponentName: string) => void
  onClear: () => void
  opponents: Opponent[]
  disabled: boolean
  label: string
  placeholder: string
}

function OpponentSelectField({
  value,
  onSelect,
  onClear,
  opponents,
  disabled,
  label,
  placeholder
}: OpponentSelectFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 検索クエリに基づいて対戦相手をフィルタリング
  const filteredOpponents = opponents.filter(opponent =>
    opponent.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpponentSelect = (opponentName: string) => {
    onSelect(opponentName)
    setIsModalOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="w-full">
      {/* 選択ボタン */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
        className={`w-full h-14 px-4 border rounded-lg text-left flex items-center justify-between transition-colors ${
          disabled 
            ? 'bg-gray-100 text-gray-400 border-gray-200' 
            : value
            ? 'bg-blue-50 border-blue-300 text-blue-900'
            : 'bg-white border-gray-300 text-gray-500 hover:border-blue-400 active:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="truncate text-base">
            {value || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {value && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              className="text-red-500 hover:text-red-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* 選択モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
            {/* ヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {label}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 検索ボックス */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="対戦相手を検索..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* 対戦相手リスト */}
            <div className="flex-1 overflow-y-auto">
              {opponents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm">登録された対戦相手がいません</p>
                </div>
              ) : filteredOpponents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm">「{searchQuery}」に一致する対戦相手が見つかりません</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredOpponents.map((opponent) => (
                    <button
                      key={opponent.id}
                      type="button"
                      onClick={() => handleOpponentSelect(opponent.name)}
                      disabled={disabled}
                      className={`w-full px-4 py-4 text-left hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors ${
                        value === opponent.name
                          ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-500' 
                          : 'text-gray-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium">{opponent.name}</span>
                        {value === opponent.name && (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="p-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 