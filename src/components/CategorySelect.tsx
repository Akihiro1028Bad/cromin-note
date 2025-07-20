'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: number
  name: string
}

interface CategorySelectProps {
  value: number | null
  onChange: (value: number | null) => void
  required?: boolean
  disabled?: boolean
}

export default function CategorySelect({ value, onChange, required = false, disabled = false }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/notes/types')
        if (!response.ok) {
          throw new Error('カテゴリの取得に失敗しました')
        }
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="w-full">
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          カテゴリ {required && <span className="text-red-500">*</span>}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <label className="block text-lg font-semibold text-gray-900 mb-4">
          カテゴリ {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-red-500 text-base p-4 bg-red-50 rounded-lg border border-red-200">{error}</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <label className="block text-base font-semibold text-gray-900 mb-3">
        カテゴリ {required && <span className="text-red-500">*</span>}
      </label>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            disabled={disabled}
            className={`p-4 text-center rounded-lg border-2 transition-all duration-200 active:scale-95 ${
              value === category.id
                ? 'border-blue-500 bg-blue-50 text-blue-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="font-medium">{category.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
} 