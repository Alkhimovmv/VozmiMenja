import { useState, useEffect } from 'react'
import { apiClient } from '../../lib/api'
import type { Equipment, PricingTier } from '../../types'
import ImageUploader from './ImageUploader'
import { Plus, X } from 'lucide-react'

interface EquipmentFormProps {
  equipment: Equipment | null
  onClose: () => void
}

interface SpecificationEntry {
  key: string
  value: string
}

export default function EquipmentForm({ equipment, onClose }: EquipmentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    quantity: 1,
    availableQuantity: 1,
    images: [''],
    specifications: {} as Record<string, string>,
    pricing: {
      day1_10to20: 0,
      day1: 0,
      days2: 0,
      days3: 0,
      days7: 0,
      days14: 0,
      days30: 0,
    } as PricingTier,
  })

  const [specificationsList, setSpecificationsList] = useState<SpecificationEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        category: equipment.category,
        description: equipment.description,
        quantity: equipment.quantity,
        availableQuantity: equipment.availableQuantity,
        images: equipment.images.length > 0 ? equipment.images : [''],
        specifications: equipment.specifications || {},
        pricing: equipment.pricing || {
          day1_10to20: equipment.pricePerDay,
          day1: equipment.pricePerDay,
          days2: equipment.pricePerDay,
          days3: equipment.pricePerDay,
          days7: equipment.pricePerDay,
          days14: equipment.pricePerDay,
          days30: equipment.pricePerDay,
        },
      })

      // Конвертируем объект характеристик в массив
      const specs = equipment.specifications || {}
      const specsList = Object.entries(specs).map(([key, value]) => ({ key, value }))
      setSpecificationsList(specsList.length > 0 ? specsList : [{ key: '', value: '' }])
    } else {
      setSpecificationsList([{ key: '', value: '' }])
    }
  }, [equipment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Конвертируем массив характеристик обратно в объект
      const specifications: Record<string, string> = {}
      specificationsList.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          specifications[spec.key.trim()] = spec.value.trim()
        }
      })

      // Нормализуем изображения: убираем localhost URL, оставляем только относительные пути
      const normalizedImages = formData.images
        .filter(img => img.trim() !== '')
        .map(img => {
          if (img.includes('localhost:3002') || img.includes('localhost:3001')) {
            return img.replace(/http:\/\/localhost:\d+/, '')
          }
          return img
        })

      const dataToSend = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        quantity: formData.quantity,
        availableQuantity: formData.availableQuantity,
        images: normalizedImages,
        specifications,
        pricing: formData.pricing,
        pricePerDay: formData.pricing.day1, // Для обратной совместимости
      }

      console.log('Data to send:', dataToSend)

      if (equipment) {
        await apiClient.updateEquipment(equipment.id, dataToSend)
      } else {
        await apiClient.createEquipment(dataToSend)
      }
      onClose()
    } catch (err) {
      setError('Ошибка при сохранении оборудования')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImagesChange = (newImages: string[]) => {
    setFormData({ ...formData, images: newImages })
  }

  const addSpecification = () => {
    setSpecificationsList([...specificationsList, { key: '', value: '' }])
  }

  const removeSpecification = (index: number) => {
    setSpecificationsList(specificationsList.filter((_, i) => i !== index))
  }

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specificationsList]
    newSpecs[index][field] = value
    setSpecificationsList(newSpecs)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {equipment ? 'Редактировать оборудование' : 'Добавить оборудование'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Цены</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1 день 10:00-20:00 (₽) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.pricing.day1_10to20}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, day1_10to20: Number(e.target.value) }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1 сутки (₽) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.pricing.day1}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, day1: Number(e.target.value) }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2 суток (₽/сутки) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.pricing.days2}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, days2: Number(e.target.value) }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3 суток (₽/сутки) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.pricing.days3}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, days3: Number(e.target.value) }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Неделя (₽/сутки) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.pricing.days7}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, days7: Number(e.target.value) }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2 недели (₽/сутки) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.pricing.days14}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, days14: Number(e.target.value) }
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Месяц (₽/сутки) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={formData.pricing.days30}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, days30: Number(e.target.value) }
                  })}
                />
              </div>
            </div>
          </div>


          {/* Specifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Характеристики</h3>
              <button
                type="button"
                onClick={addSpecification}
                className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
            <div className="space-y-2">
              {specificationsList.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Название (например: Мощность)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    value={spec.key}
                    onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Значение (например: 2000 Вт)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    title="Удалить"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {specificationsList.length === 0 && (
                <p className="text-sm text-gray-500">Нет характеристик. Нажмите "Добавить" для создания.</p>
              )}
            </div>
          </div>

          {/* Images */}
          <ImageUploader
            images={formData.images}
            onImagesChange={handleImagesChange}
          />

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
