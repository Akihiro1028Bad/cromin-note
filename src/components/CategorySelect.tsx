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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カテゴリ {required && <span className="text-red-500">*</span>}
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          カテゴリ {required && <span className="text-red-500">*</span>}
        </label>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        カテゴリ {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled}
        required={required}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
          ${!value && required ? 'border-red-300 bg-red-50' : 'border-gray-300'}
        `}
      >
        <option value="">カテゴリを選択してください</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {!value && required && (
        <p className="mt-1 text-sm text-red-600">カテゴリを選択してください</p>
      )}
    </div>
  )
} 