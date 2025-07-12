'use client'

import { useState, useEffect } from 'react'

interface OpponentInputProps {
  opponent: string
  onOpponentChange: (value: string) => void
  noteType: string
  isRequired?: boolean
  disabled?: boolean
}

export default function OpponentInput({ 
  opponent, 
  onOpponentChange, 
  noteType, 
  isRequired = false, 
  disabled = false 
}: OpponentInputProps) {
  const [opponent1, setOpponent1] = useState('')
  const [opponent2, setOpponent2] = useState('')

  // 種別に応じてシングルスかダブルスかを判定
  const isDoubles = noteType === 'ダブルス' || noteType === 'ミックスダブルス'

  // 初期値の設定
  useEffect(() => {
    if (opponent) {
      const opponents = opponent.split(',').map(o => o.trim())
      setOpponent1(opponents[0] || '')
      setOpponent2(opponents[1] || '')
    } else {
      setOpponent1('')
      setOpponent2('')
    }
  }, [opponent])

  // 対戦相手の変更を親コンポーネントに通知
  useEffect(() => {
    if (isDoubles) {
      const opponents = [opponent1, opponent2].filter(o => o.trim())
      onOpponentChange(opponents.join(', '))
    } else {
      onOpponentChange(opponent1)
    }
  }, [opponent1, opponent2, isDoubles, onOpponentChange])

  // バリデーション
  const isValid = () => {
    if (!isRequired) return true
    if (isDoubles) {
      return opponent1.trim() && opponent2.trim()
    }
    return opponent1.trim()
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        対戦相手 {isRequired && <span className="text-red-500">*</span>}
      </label>
      
      {isDoubles ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">対戦相手1</label>
            <input
              type="text"
              value={opponent1}
              onChange={(e) => setOpponent1(e.target.value)}
              placeholder="対戦相手1の名前"
              disabled={disabled}
              required={isRequired}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
                ${isRequired && !opponent1.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">対戦相手2</label>
            <input
              type="text"
              value={opponent2}
              onChange={(e) => setOpponent2(e.target.value)}
              placeholder="対戦相手2の名前"
              disabled={disabled}
              required={isRequired}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
                ${isRequired && !opponent2.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}
              `}
            />
          </div>
        </div>
      ) : (
        <input
          type="text"
          value={opponent1}
          onChange={(e) => setOpponent1(e.target.value)}
          placeholder="対戦相手の名前"
          disabled={disabled}
          required={isRequired}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
            ${isRequired && !opponent1.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'}
          `}
        />
      )}
      
      {isRequired && !isValid() && (
        <p className="mt-1 text-sm text-red-600">
          {isDoubles ? '対戦相手1と対戦相手2を入力してください' : '対戦相手を入力してください'}
        </p>
      )}
    </div>
  )
} 