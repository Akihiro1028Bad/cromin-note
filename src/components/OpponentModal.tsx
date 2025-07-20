'use client'

import { useState, useEffect } from 'react'

interface OpponentModalProps {
  isOpen: boolean
  onClose: () => void
  onOpponentCreated: (opponent: { id: string; name: string }) => void
}

export default function OpponentModal({ isOpen, onClose, onOpponentCreated }: OpponentModalProps) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // モーダルが開かれた時に状態をリセット
  useEffect(() => {
    if (isOpen) {
      setName('')
      setError(null)
      setSubmitting(false)
    }
  }, [isOpen])

  const handleSubmit = async () => {
    // バリデーションエラーの場合は即座に処理
    if (!name.trim()) {
      setError('対戦相手名を入力してください')
      return
    }

    // 送信中状態を設定
    setSubmitting(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/opponents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '対戦相手の登録に失敗しました')
      }

      // 成功時の処理
      onOpponentCreated(data.opponent)
      setName('')
      setError(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    // 状態を即座にリセット
    setName('')
    setError(null)
    setSubmitting(false)
    onClose()
  }

  // オーバーレイクリックでの閉じる処理
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  // ESCキーでの閉じる処理
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">対戦相手を登録</h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対戦相手名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                // 入力時にエラーをクリア
                if (error) {
                  setError(null)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !submitting && name.trim()) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
              placeholder="対戦相手の名前を入力"
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '登録中...' : '登録'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 