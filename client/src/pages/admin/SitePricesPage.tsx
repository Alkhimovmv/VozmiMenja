import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'
import { apiClient } from '../../lib/api'
import type { Equipment, PricingTier } from '../../types'

const priceFields: Array<{
  key: keyof PricingTier
  label: string
  help?: string
}> = [
  { key: 'day1_10to20', label: '1 день 10:00-20:00' },
  { key: 'day1', label: '1 сутки' },
  { key: 'days2', label: '2 суток' },
  { key: 'days3', label: '3 суток' },
  { key: 'days4', label: '4+ суток', help: 'Ставка или пакет' },
  { key: 'days7', label: '7 суток', help: 'Ставка или пакет' },
  { key: 'days14', label: '14 суток', help: 'Ставка или пакет' },
  { key: 'days30', label: '30 суток', help: 'Ставка или пакет' },
  { key: 'weekendDay', label: 'Пт-Сб-Вс' },
  { key: 'weekendDay10to20', label: 'Пт-Сб-Вс 10:00-20:00' },
]

const buildPricing = (equipment: Equipment): PricingTier => {
  const fallback = Number(equipment.pricePerDay) || 0

  return {
    day1_10to20: equipment.pricing?.day1_10to20 ?? fallback,
    day1: equipment.pricing?.day1 ?? fallback,
    days2: equipment.pricing?.days2 ?? fallback,
    days3: equipment.pricing?.days3 ?? fallback,
    days4: equipment.pricing?.days4 ?? 0,
    days7: equipment.pricing?.days7 ?? fallback,
    days14: equipment.pricing?.days14 ?? fallback,
    days30: equipment.pricing?.days30 ?? fallback,
    weekendDay: equipment.pricing?.weekendDay ?? 0,
    weekendDay10to20: equipment.pricing?.weekendDay10to20 ?? 0,
  }
}

type DraftState = Record<string, PricingTier>

export default function SitePricesPage() {
  const queryClient = useQueryClient()
  const [drafts, setDrafts] = useState<DraftState>({})
  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-equipment-prices'],
    queryFn: () => apiClient.getEquipment({ limit: 200 }),
  })

  const equipment = useMemo(() => data?.data ?? [], [data?.data])

  useEffect(() => {
    if (equipment.length === 0) return

    setDrafts((current) => {
      const next = { ...current }
      equipment.forEach((item) => {
        if (!next[item.id]) {
          next[item.id] = buildPricing(item)
        }
      })
      return next
    })
  }, [equipment])

  const filteredEquipment = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return equipment

    return equipment.filter((item) =>
      [item.name, item.category].some((value) => value.toLowerCase().includes(query))
    )
  }, [equipment, search])

  const saveMutation = useMutation({
    mutationFn: async (item: Equipment) => {
      const pricing = drafts[item.id]
      if (!pricing) return

      await apiClient.updatePublicEquipmentPricing(item.id, pricing, Number(pricing.day1) || 0)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['public-equipment-prices'] })
      await queryClient.invalidateQueries({ queryKey: ['equipment'] })
      toast.success('Цены сохранены')
    },
    onError: (mutationError) => {
      toast.error(mutationError instanceof Error ? mutationError.message : 'Не удалось сохранить цены')
    },
  })

  const updateDraft = (equipmentId: string, field: keyof PricingTier, value: string) => {
    setDrafts((current) => ({
      ...current,
      [equipmentId]: {
        ...current[equipmentId],
        [field]: Math.max(0, Number(value) || 0),
      },
    }))
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Не удалось загрузить товары сайта.
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Цены на сайте</h1>
          <p className="mt-1 text-sm text-gray-500">
            Редактирование тарифов публичных карточек оборудования.
          </p>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по названию или категории"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-80"
        />
      </div>

      <div className="space-y-4">
        {filteredEquipment.map((item) => {
          const pricing = drafts[item.id] ?? buildPricing(item)
          const isSaving = saveMutation.isPending && saveMutation.variables?.id === item.id

          return (
            <section key={item.id} className="rounded-lg bg-white p-4 shadow sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
                  <div className="mt-1 text-sm text-gray-500">{item.category}</div>
                </div>

                <button
                  type="button"
                  onClick={() => saveMutation.mutate(item)}
                  disabled={isSaving}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Сохраняю...' : 'Сохранить'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {priceFields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="block text-sm font-medium text-gray-700">{field.label}</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={Number(pricing[field.key]) || 0}
                      onChange={(event) => updateDraft(item.id, field.key, event.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {field.help && <span className="mt-1 block text-xs text-gray-400">{field.help}</span>}
                  </label>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="rounded-lg bg-white px-6 py-12 text-center text-gray-500 shadow">
          По этому поиску ничего не найдено.
        </div>
      )}
    </div>
  )
}
