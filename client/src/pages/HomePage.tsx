import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEquipment, useEquipmentStats, useCategoryCounts } from '../hooks/useEquipment'
import EquipmentGrid from '../components/equipment/EquipmentGrid'
import HowItWorks from '../components/HowItWorks'
import Testimonials from '../components/Testimonials'
import SEO from '../components/SEO'
import { ChevronLeft, ChevronRight, Phone, Shield, Truck, Clock, Sparkles, Search, X } from 'lucide-react'

// Конфиг стилей по ключу категории из БД (без переименований — label берём с бэка)
const CAT_CONFIG: Record<string, { gradient: string; iconBg: string; blobColor: string }> = {
  'Пылесосы, уборка и клининг': { gradient: 'from-blue-100 to-indigo-200',   iconBg: 'bg-blue-500',   blobColor: 'rgba(147,197,253,0.7)' },
  'Камеры':                      { gradient: 'from-pink-100 to-rose-200',     iconBg: 'bg-pink-500',   blobColor: 'rgba(249,168,212,0.7)' },
  'Аудиооборудование':           { gradient: 'from-violet-100 to-purple-200', iconBg: 'bg-violet-500', blobColor: 'rgba(196,181,253,0.7)' },
}

// Иконки SVG для категорий
const CAT_ICONS: Record<string, JSX.Element> = {
  'Пылесосы, уборка и клининг': (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.659 1.591L19.5 14.5m-14.5 0l.75 2.25m13-2.25l-.75 2.25M5 14.5h14M5 14.5l-.75 2.25M19.5 14.5l.75 2.25M6 19.5h12" />
    </svg>
  ),
  'Камеры': (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  ),
  'Аудиооборудование': (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
    </svg>
  ),
}

const FALLBACK_STYLES = [
  { gradient: 'from-amber-50 via-amber-100 to-orange-100', iconBg: 'bg-amber-500' },
  { gradient: 'from-green-50 via-green-100 to-emerald-100', iconBg: 'bg-green-500' },
  { gradient: 'from-cyan-50 via-cyan-100 to-sky-100', iconBg: 'bg-cyan-500' },
]

const FALLBACK_ICON = (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
)


export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setSearch(searchParams.get('search') || '')
    setCategory(searchParams.get('category') || '')
    setPage(parseInt(searchParams.get('page') || '1', 10))
    if (searchParams.get('category')) {
      setTimeout(() => {
        document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [searchParams])

  const { data, isLoading, error } = useEquipment({
    page, limit: 12,
    category: category || undefined,
    search: search || undefined,
  })
  const { data: statsData } = useEquipmentStats()
  const { data: countsData } = useCategoryCounts()
  const counts = countsData?.data || {}

  // Строим список из того, что пришло с бэка; стили берём из модульных констант
  const CATS = Object.entries(counts).map(([key, count], i) => {
    const cfg = CAT_CONFIG[key]
    const fallback = FALLBACK_STYLES[i % FALLBACK_STYLES.length]
    return {
      value: key,
      count,
      label: ({ 'Аудиооборудование': 'Аудио', 'Пылесосы, уборка и клининг': 'Пылесосы и клининг' } as Record<string, string>)[key] ?? key,
      gradient: cfg?.gradient ?? fallback.gradient,
      iconBg: cfg?.iconBg ?? fallback.iconBg,
      blobColor: cfg?.blobColor ?? 'rgba(209,213,219,0.6)',
      icon: CAT_ICONS[key] ?? FALLBACK_ICON,
    }
  })
  const totalPages = data ? Math.ceil(data.total / 12) : 0

  const updateSearchParams = (updates: Record<string, string | number>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value.toString())
      else newParams.delete(key)
    })
    setSearchParams(newParams)
  }

  const handleCategoryChange = (newCategory: string) => {
    updateSearchParams({ category: newCategory, page: '1', search })
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
  }
  const handleSearchChange = (s: string) => updateSearchParams({ search: s, page: '1', category })

  const seoTitle = category
    ? `Аренда ${category} в Москве — цены, доставка 24/7`
    : search
    ? `Аренда ${search} в Москве | ВозьмиМеня`
    : 'Аренда оборудования в Москве — камеры, аудио, клининг | ВозьмиМеня'
  const seoDescription = category
    ? `Прокат ${category} в Москве. Низкие цены, доставка в день заказа, постамат 24/7. Бронируйте онлайн на vozmimenya.ru или звоните: +7 (993) 363-64-64`
    : search
    ? `Аренда ${search} в Москве. Доставка в день заказа, постамат 24/7, без залога. Звоните: +7 (993) 363-64-64`
    : 'Аренда профессионального оборудования в Москве: камеры, аудиотехника JBL, клининг. Доставка в день заказа, постамат 24/7, без залога. От 200 ₽/сутки.'

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={`https://vozmimenya.ru${category ? `?category=${encodeURIComponent(category)}` : ''}`}
      />

      {/* ── Mobile Hero ── */}
      <section className="md:hidden pt-4 pb-3">
        <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden p-5 min-h-[180px] flex flex-col justify-between"
          style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 40%, #ede9fe 100%)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.4) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 bg-white/80 border border-white/60 rounded-full px-2.5 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Доставка 24/7
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 leading-snug mb-1">
              Техника <span className="text-[#4F46E5]">напрокат</span> в Москве
            </h1>
            <p className="text-gray-500 text-xs mb-4">Пылесосы, камеры, колонки. От 400 ₽/день, без залога.</p>
            <button
              onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-bold px-5 py-2.5 rounded-xl"
            >
              Открыть каталог <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        </div>
      </section>

      {/* ── Desktop Hero ── */}
      <section className="hidden md:block pt-6 pb-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">

            {/* Left: headline card */}
            <div className="relative rounded-3xl p-8 md:p-10 flex flex-col justify-between overflow-hidden min-h-[420px]"
              style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 40%, #ede9fe 100%)' }}>
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white/70 border border-white/60 rounded-full px-3 py-1 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                    Доставка 24/7
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/80 border border-amber-200/60 rounded-full px-3 py-1">
                    ★ 4.8 на Яндексе
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                  Возьмите<br />
                  <span className="text-[#4F46E5]">технику на день</span><br />
                  а не на годы
                </h1>
                <p className="text-gray-500 text-base mb-8 max-w-md">
                  Камеры, моющие пылесосы, аудио и инструмент в аренду по Москве.
                  Привезём за 2–4 часа. Без залога для постоянных клиентов.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="#catalog"
                    onClick={(e) => { e.preventDefault(); document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }) }}
                    className="btn-pill-primary shadow-lg hover:shadow-indigo-200 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                    Открыть каталог
                    <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">›</span>
                  </a>
                  <a href="tel:+79933636464" className="btn-pill btn-secondary bg-white/70 backdrop-blur-sm">
                    <Phone className="w-4 h-4" />
                    +7 (993) 363-64-64
                  </a>
                </div>
              </div>
              <div className="relative z-10 grid grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/50">
                {[
                  { value: '8', unit: ' лет', label: 'НА РЫНКЕ' },
                  { value: '5K+', unit: '', label: 'КЛИЕНТОВ' },
                  { value: `${statsData?.data?.totalEquipment || '60'}+`, unit: '', label: 'ПОЗИЦИЙ' },
                  { value: '2-4ч', unit: '', label: 'ДОСТАВКА' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-none">
                      {s.value}<span className="text-base font-semibold text-gray-500">{s.unit}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 font-semibold tracking-wider mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col">
              <div className="relative rounded-3xl overflow-hidden flex-1 bg-slate-800 min-h-[300px]">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Доставим за 2–4 часа</p>
                    <h3 className="text-white text-2xl md:text-3xl font-bold mb-3 leading-tight">
                      Профессиональное<br />оборудование<br />в аренду
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Камеры GoPro, пылесосы для ремонта, микрофоны для подкастов — всё это можно взять на день или месяц. Доставка по Москве, работаем круглосуточно.
                    </p>
                  </div>
                  <div className="flex items-end justify-between mt-6">
                    <div className="text-5xl select-none">🚚</div>
                    <button
                      onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                      className="btn-primary"
                      style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '12px' }}>
                      В каталог <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Ribbon ── */}
      <section className="py-3">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-slate-900 px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, label: 'Гарантия качества', sub: 'Дезинфекция перед каждой выдачей' },
                { icon: Truck, label: 'Доставка 2–4 часа', sub: 'Курьер привозит и забирает' },
                { icon: Clock, label: 'Без скрытых наценок', sub: 'Прозрачное ценообразование' },
                { icon: Sparkles, label: 'Без залога', sub: 'Постоянным клиентам' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2563EB]/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#60A5FA]" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold leading-tight">{label}</div>
                    <div className="text-slate-400 text-xs">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-5 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-3xl font-bold text-gray-900">
              <span className="md:hidden">Категории</span>
              <span className="hidden md:inline">Что возьмём <span className="text-[#2563EB]">сегодня</span>?</span>
            </h2>
            <button
              onClick={() => handleCategoryChange('')}
              className="text-sm text-[#2563EB] font-semibold flex items-center gap-0.5"
            >
              Все <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile: compact grid */}
          <div className="grid grid-cols-3 gap-2.5 md:hidden">
            {CATS.map((cat) => {
              const isActive = category === cat.value
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`relative bg-gradient-to-br ${cat.gradient} rounded-2xl p-3 text-left overflow-hidden flex flex-col gap-2 active:scale-[0.97] transition-transform ${
                    isActive ? 'ring-2 ring-[#2563EB]' : ''
                  }`}
                >
                  <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full blur-xl pointer-events-none" style={{ background: cat.blobColor }} />
                  <div className={`w-9 h-9 ${cat.iconBg} rounded-xl flex items-center justify-center`}>
                    <div className="scale-75">{cat.icon}</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs leading-tight line-clamp-2">{cat.label}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{cat.count} поз.</div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Desktop: large cards */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            {CATS.map((cat) => {
              const isActive = category === cat.value
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`relative bg-gradient-to-br ${cat.gradient} rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group overflow-hidden min-h-[160px] flex flex-col justify-between ${
                    isActive ? 'ring-2 ring-[#2563EB] shadow-md' : ''
                  }`}
                >
                  <div className="absolute -bottom-6 -right-6 w-36 h-36 rounded-full blur-2xl pointer-events-none" style={{ background: cat.blobColor }} />
                  <div className="absolute -top-4 right-8 w-20 h-20 rounded-full blur-xl pointer-events-none" style={{ background: cat.blobColor, opacity: 0.7 }} />
                  <div>
                    <div className={`w-12 h-12 ${cat.iconBg} rounded-2xl flex items-center justify-center mb-5 shadow-sm`}>
                      {cat.icon}
                    </div>
                    <div className="font-bold text-gray-900 text-xl leading-tight">{cat.label}</div>
                    <div className="text-sm text-gray-500 mt-1">{cat.count} позиций</div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all flex items-center gap-0.5">
                      Смотреть <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Catalog ── */}
      <section id="catalog" className="py-4">
        <div className="container mx-auto px-4">
          {/* Mobile: search full width, then chips wrap */}
          <div className="md:hidden mb-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleCategoryChange('')} className={`chip ${category === '' ? 'chip-active' : ''}`}>Все</button>
              {CATS.map((cat) => (
                <button key={cat.value} onClick={() => handleCategoryChange(cat.value)} className={`chip ${category === cat.value ? 'chip-active' : ''}`}>{cat.label}</button>
              ))}
            </div>
          </div>

          {/* Desktop: chips left, search right (full remaining width) */}
          <div className="hidden md:flex md:items-center md:gap-3 mb-4">
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => handleCategoryChange('')} className={`chip ${category === '' ? 'chip-active' : ''}`}>Все</button>
              {CATS.map((cat) => (
                <button key={cat.value} onClick={() => handleCategoryChange(cat.value)} className={`chip ${category === cat.value ? 'chip-active' : ''}`}>{cat.label}</button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
              />
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {data && (
            <p className="text-sm text-gray-500 mb-2">
              Найдено: {data.total}{search && ` по запросу «${search}»`}{category && ` в категории «${category}»`}
            </p>
          )}

          <EquipmentGrid
            equipment={data?.data || []}
            loading={isLoading}
            error={error?.message || null}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => updateSearchParams({ page: page - 1, search, category })}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Назад
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pn: number
                  if (totalPages <= 5) pn = i + 1
                  else if (page <= 3) pn = i + 1
                  else if (page >= totalPages - 2) pn = totalPages - 4 + i
                  else pn = page - 2 + i
                  return (
                    <button
                      key={pn}
                      onClick={() => updateSearchParams({ page: pn, search, category })}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${page === pn ? 'bg-[#2563EB] text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                    >
                      {pn}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => updateSearchParams({ page: page + 1, search, category })}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 text-sm"
              >
                Вперёд <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] p-10 md:p-14 text-white grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-2">Звоним с 9:00 до 22:00, пишем 24/7</p>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight text-white">
                Подскажем<br />оборудование<br />
                <span className="text-yellow-300">за 5 минут</span>
              </h2>
              <p className="text-blue-100 text-sm mb-6">
                Расскажите задачу — подберём технику, рассчитаем стоимость и привезём в удобное время.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="tel:+79933636464"
                  className="flex items-center justify-center gap-2 bg-white text-gray-900 font-semibold px-6 py-3 rounded-2xl hover:bg-gray-50 transition-colors">
                  <Phone className="w-4 h-4" />
                  +7 (993) 363-64-64
                </a>
                <a href="https://t.me/VozmiMenyaRent" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white/15 border border-white/20 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-white/25 transition-colors">
                  Написать в Telegram
                </a>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-1 gap-3">
              {[
                { icon: '📍', label: 'ОФИС 1 — М. ВОЛЖСКАЯ', value: 'Волжский бульвар, 51с15' },
                { icon: '📍', label: 'ОФИС 2 — М. ДИНАМО', value: 'ул. Расковой, 1' },
                { icon: '⏰', label: 'ЧАСЫ РАБОТЫ', value: 'Круглосуточно, 24/7' },
                { icon: '✉️', label: 'EMAIL', value: 'alkhimovmv@yandex.ru' },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 flex items-center gap-4 border border-white/10">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-xs text-blue-200 font-semibold tracking-widest">{item.label}</div>
                    <div className="text-white font-bold text-sm">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <Testimonials />
    </div>
  )
}
