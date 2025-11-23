import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { apiClient } from '../lib/api'
import type { Equipment } from '../types'
import EquipmentForm from '../components/admin/EquipmentForm'
import ConfirmDialog from '../components/ConfirmDialog'
import { getImageUrl } from '../lib/utils'
import UnifiedAdminLayout from '../components/admin/UnifiedAdminLayout'

export default function AdminDashboardPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({ show: false, id: null })

  useEffect(() => {
    loadEquipment()
  }, [])

  const loadEquipment = async () => {
    try {
      const response = await apiClient.getEquipment({ limit: 1000 })
      setEquipment(response.data)
    } catch (error) {
      console.error('Error loading equipment:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const handleDelete = (id: string) => {
    setDeleteConfirm({ show: true, id })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return

    try {
      await apiClient.deleteEquipment(deleteConfirm.id)
      await loadEquipment()
      toast.success('Оборудование успешно удалено')
    } catch (error) {
      console.error('Error deleting equipment:', error)
      toast.error('Ошибка при удалении оборудования')
    } finally {
      setDeleteConfirm({ show: false, id: null })
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null })
  }

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingEquipment(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingEquipment(null)
    loadEquipment()
  }

  if (isLoading) {
    return (
      <UnifiedAdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-xl">Загрузка...</div>
        </div>
      </UnifiedAdminLayout>
    )
  }

  return (
    <UnifiedAdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Управление оборудованием</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={handleAddNew}
            className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm sm:text-base"
          >
            Добавить оборудование
          </button>
        </div>
      </div>

      {/* Equipment List - Desktop Table */}
      <div className="hidden md:block bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цены
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={getImageUrl(item.images[0])}
                            alt={item.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.pricing ? (
                        <div className="space-y-1">
                          <div>1д (10-20): {item.pricing.day1_10to20}₽</div>
                          <div>1 сутки: {item.pricing.day1}₽</div>
                          <div>2 суток: {item.pricing.days2}₽/сут</div>
                          <div>3 суток: {item.pricing.days3}₽/сут</div>
                          <div>Неделя: {item.pricing.days7}₽/сут</div>
                          <div>2 недели: {item.pricing.days14}₽/сут</div>
                          <div>Месяц: {item.pricing.days30}₽/сут</div>
                        </div>
                      ) : (
                        <div>{item.pricePerDay}₽/сутки</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      {/* Equipment List - Mobile Cards */}
      <div className="md:hidden space-y-4">
          {equipment.map((item) => (
            <div key={item.id} className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
              <div className="flex gap-4 mb-4">
                <img
                  className="h-20 w-20 rounded-md object-cover flex-shrink-0"
                  src={getImageUrl(item.images[0])}
                  alt={item.name}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
              </div>

              {item.pricing && (
                <div className="mb-4 text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>1 день (10:00-20:00):</span>
                    <span>{item.pricing.day1_10to20}₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 сутки:</span>
                    <span>{item.pricing.day1}₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2 суток:</span>
                    <span>{item.pricing.days2}₽/сутки</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3 суток:</span>
                    <span>{item.pricing.days3}₽/сутки</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Неделя:</span>
                    <span>{item.pricing.days7}₽/сутки</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2 недели:</span>
                    <span>{item.pricing.days14}₽/сутки</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Месяц:</span>
                    <span>{item.pricing.days30}₽/сутки</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Удалить
                </button>
              </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <EquipmentForm
          equipment={editingEquipment}
          onClose={handleFormClose}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        title="Удаление оборудования"
        message="Вы уверены, что хотите удалить это оборудование? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
      />
    </UnifiedAdminLayout>
  )
}
