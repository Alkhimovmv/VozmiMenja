import { useState } from 'react'
import { Filter, X, Camera, Sparkles, Music } from 'lucide-react'
import { useCategoryCounts } from '../../hooks/useEquipment'

interface EquipmentFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onClearFilters?: () => void
}

const categories = [
  { value: '', label: 'Все категории', icon: Filter },
  { value: 'Камеры', label: 'Камеры', icon: Camera },
  { value: 'Пылесосы, уборка и клининг', label: 'Пылесосы, уборка и клининг', icon: Sparkles },
  { value: 'Аудиооборудование', label: 'Аудио', icon: Music },
]

export default function EquipmentFilters({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onClearFilters
}: EquipmentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: countsData } = useCategoryCounts()
  const counts = countsData?.data || {}

  const clearFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    } else {
      onCategoryChange('')
      onSearchChange('')
    }
  }

  const hasActiveFilters = selectedCategory || searchQuery

  // Calculate total for "Все категории"
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        {/* Mobile filter toggle */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg"
          >
            <Filter className="w-4 h-4" />
            <span>Фильтры</span>
            {hasActiveFilters && (
              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                {[selectedCategory, searchQuery].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              <span>Очистить</span>
            </button>
          )}
        </div>

        {/* Filter content */}
        <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon
                const count = category.value === '' ? totalCount : (counts[category.value] || 0)

                return (
                  <button
                    key={category.value}
                    onClick={() => onCategoryChange(category.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                    {count > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedCategory === category.value
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Search */}
            <div className="flex-1 lg:max-w-xs lg:ml-6">
              <input
                type="text"
                placeholder="Поиск по названию..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Clear filters (desktop) */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="hidden lg:flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                <span>Очистить фильтры</span>
              </button>
            )}
          </div>

          {/* Active filters summary */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                  <span>Категория: {categories.find(c => c.value === selectedCategory)?.label}</span>
                  <button
                    onClick={() => onCategoryChange('')}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                  <span>Поиск: "{searchQuery}"</span>
                  <button
                    onClick={() => onSearchChange('')}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
