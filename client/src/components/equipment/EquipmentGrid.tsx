import type { Equipment } from '../../types'
import EquipmentCard from './EquipmentCard'
import LoadingSpinner from '../ui/LoadingSpinner'

interface EquipmentGridProps {
  equipment: Equipment[]
  loading?: boolean
  error?: string | null
}

export default function EquipmentGrid({ equipment, loading, error }: EquipmentGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 text-lg mb-2">Ошибка загрузки</div>
        <div className="text-gray-600">{error}</div>
      </div>
    )
  }

  if (equipment.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-500 text-lg mb-2">Оборудование не найдено</div>
        <div className="text-gray-400">Попробуйте изменить параметры поиска</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {equipment.map((item) => (
        <EquipmentCard key={item.id} equipment={item} />
      ))}
    </div>
  )
}