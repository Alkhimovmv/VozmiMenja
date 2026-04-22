// Трансформация моделей из camelCase в snake_case для ответов API

export function rentalToSnakeCase(rental: any) {
  return {
    id: rental.id,
    equipment_id: rental.equipmentId,
    instance_number: rental.instanceNumber,
    start_date: rental.startDate,
    end_date: rental.endDate,
    customer_name: rental.customerName,
    customer_phone: rental.customerPhone,
    needs_delivery: rental.needsDelivery,
    delivery_address: rental.deliveryAddress,
    rental_price: rental.rentalPrice,
    delivery_price: rental.deliveryPrice,
    delivery_costs: rental.deliveryCosts,
    source: rental.source,
    comment: rental.comment,
    status: rental.status,
    office_id: rental.officeId || 1,
    created_at: rental.createdAt,
    updated_at: rental.updatedAt,
    equipment_name: rental.equipmentName,
    equipment_list: rental.equipmentList?.map((item: any) => ({
      id: item.id,
      name: item.name,
      instance_number: item.instanceNumber
    }))
  }
}

export function equipmentToSnakeCase(equipment: any) {
  return {
    id: equipment.id,
    name: equipment.name,
    quantity: equipment.quantity,
    description: equipment.description,
    base_price: equipment.basePrice,
    created_at: equipment.createdAt,
    updated_at: equipment.updatedAt
  }
}

export function equipmentToRentalFormat(equipment: any) {
  return {
    id: equipment.id,
    name: equipment.name,
    category: 'Оборудование',
    price_per_day: equipment.basePrice,
    quantity: equipment.quantity,
    available_quantity: equipment.quantity,
    images: [],
    description: equipment.description || '',
    specifications: {},
    created_at: equipment.createdAt,
    updated_at: equipment.updatedAt
  }
}
