import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEquipment, useEquipmentStats } from '../hooks/useEquipment'
import EquipmentGrid from '../components/equipment/EquipmentGrid'
import EquipmentFilters from '../components/equipment/EquipmentFilters'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import SEO from '../components/SEO'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const searchParam = searchParams.get('search') || ''
    const categoryParam = searchParams.get('category') || ''
    const pageParam = parseInt(searchParams.get('page') || '1', 10)

    setSearch(searchParam)
    setCategory(categoryParam)
    setPage(pageParam)
  }, [searchParams])

  const { data, isLoading, error } = useEquipment({
    page,
    limit: 12,
    category: category || undefined,
    search: search || undefined
  })

  const { data: statsData } = useEquipmentStats()

  const totalPages = data ? Math.ceil(data.total / 12) : 0

  const updateSearchParams = (updates: Record<string, string | number>) => {
    const newParams = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString())
      } else {
        newParams.delete(key)
      }
    })

    setSearchParams(newParams)
  }

  const handleCategoryChange = (newCategory: string) => {
    updateSearchParams({
      category: newCategory,
      page: '1',
      search: search
    })
  }

  const handleSearchChange = (newSearch: string) => {
    updateSearchParams({
      search: newSearch,
      page: '1',
      category: category
    })
  }

  const handleClearFilters = () => {
    updateSearchParams({
      search: '',
      category: '',
      page: '1'
    })
  }

  const seoTitle = category
    ? `Аренда ${category} в Москве`
    : search
    ? `Поиск: ${search} - Аренда оборудования`
    : undefined

  const seoDescription = category
    ? `Аренда ${category} в Москве по выгодным ценам. Широкий выбор профессиональной техники. Доставка, гарантия качества. Звоните: +7 (917) 525-50-95`
    : 'Аренда профессионального оборудования в Москве: камеры, клининговая техника, аудиооборудование. Низкие цены, быстрая доставка, гарантия качества.'

  return (
    <div className="min-h-screen">
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={`https://vozmimenya.ru${category ? `?category=${encodeURIComponent(category)}` : ''}`}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700 text-white py-20 md:py-28">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-primary-50 to-purple-100 bg-clip-text text-transparent leading-tight">
            Аренда профессионального оборудования
          </h1>
          <p className="text-xl md:text-2xl text-primary-50 mb-12 max-w-3xl mx-auto leading-relaxed">
            Камеры, клининговое оборудование и аудиотехника
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-4xl mx-auto">
            <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/15 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-br from-white to-primary-100 bg-clip-text text-transparent">
                {statsData?.data?.totalEquipment || 0}
              </div>
              <div className="relative text-primary-100 font-medium">единиц техники</div>
            </div>
            <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/15 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-br from-white to-primary-100 bg-clip-text text-transparent">
                {statsData?.data?.totalCategories || 0}
              </div>
              <div className="relative text-primary-100 font-medium">категории</div>
            </div>
            <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 hover:bg-white/15 border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-br from-white to-primary-100 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="relative text-primary-100 font-medium">поддержка</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <EquipmentFilters
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
        searchQuery={search}
        onSearchChange={handleSearchChange}
        onClearFilters={handleClearFilters}
      />

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Results header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {category ? `Категория: ${category}` : 'Весь каталог'}
              </h2>
              {data && (
                <p className="text-gray-600">
                  Найдено {data.total} единиц оборудования
                  {search && ` по запросу "${search}"`}
                </p>
              )}
            </div>
          </div>

          {/* Equipment Grid */}
          <EquipmentGrid
            equipment={data?.data || []}
            loading={isLoading}
            error={error?.message || null}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => updateSearchParams({ page: page - 1, search, category })}
                disabled={page === 1}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Предыдущая</span>
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (page <= 3) {
                    pageNumber = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = page - 2 + i
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => updateSearchParams({ page: pageNumber, search, category })}
                      className={`px-3 py-2 border rounded-lg ${
                        page === pageNumber
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => updateSearchParams({ page: page + 1, search, category })}
                disabled={page === totalPages}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <span>Следующая</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Testimonials Section */}
      <Testimonials />
    </div>
  )
}