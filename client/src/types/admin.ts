export interface RentalEquipmentInstance {
  instance_number: number;
  serial_number: string | null;
  comment: string | null;
}

export type LockerCommandStatus = 'pending' | 'processing' | 'done' | 'failed';

export interface LockerCommand {
  id: number;
  office_id: number;
  locker_id: number;
  status: LockerCommandStatus;
  created_at: string;
  taken_at: string | null;
  finished_at: string | null;
  error: string | null;
}

export interface PostomatStatus {
  office_id: number;
  online: boolean;
  last_seen: string | null;
  version: string | null;
  uptime: number | null;
  hostname: string | null;
}

// DEPRECATED: старая модель для rental_equipment (использовалась до перехода на общую таблицу equipment)
export interface RentalEquipment {
  id: number;
  name: string;
  quantity: number;
  description?: string;
  base_price: number | null;
  office_id?: number;
  instances?: RentalEquipmentInstance[];
  created_at: string;
  updated_at: string;
}

// DEPRECATED: старый DTO для rental_equipment
export interface CreateRentalEquipmentDto {
  name: string;
  quantity: number;
  description?: string;
  base_price: number | null;
  office_id?: number;
  instances?: RentalEquipmentInstance[];
}

export type RentalSource = 'авито' | 'сайт' | 'рекомендация' | 'карты';
export type RentalStatus = 'pending' | 'active' | 'completed' | 'overdue';

export interface Rental {
  id: number;
  equipment_id: number;
  instance_number?: number; // Номер экземпляра для диаграммы Ганта
  start_date: string;
  end_date: string;
  customer_name: string;
  customer_phone: string;
  needs_delivery: boolean;
  delivery_address?: string;
  rental_price: number | null;
  delivery_price: number | null;
  delivery_costs: number | null;
  source: RentalSource;
  comment?: string;
  status: RentalStatus;
  locker_id?: number | null;
  total_price: number;
  profit: number;
  created_at: string;
  updated_at: string;
  equipment_name?: string;
  equipment_list?: Array<{ id: number; name: string; instance_number: number }>; // Список оборудования с номерами экземпляров
}

export interface EquipmentInstance {
  equipment_id: number;
  instance_number: number;
}

export interface CreateRentalDto {
  equipment_id: number;
  equipment_ids?: number[]; // Устаревшее поле для обратной совместимости
  equipment_instances?: EquipmentInstance[]; // Новое поле с номерами экземпляров
  start_date: string;
  end_date: string;
  customer_name: string;
  customer_phone: string;
  needs_delivery: boolean;
  delivery_address?: string;
  rental_price: number | null;
  delivery_price?: number | null;
  delivery_costs?: number | null;
  source: RentalSource;
  comment?: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number | null;
  date: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseDto {
  description: string;
  amount: number | null;
  date: string;
  category?: string;
}

export type CustomerTag = 'regular' | 'problem' | null;

export interface Customer {
  customer_name: string;
  customer_phone: string;
  rental_count: number;
  tag: CustomerTag;
  note: string | null;
}

export interface CustomerNote {
  customer_phone: string;
  tag: CustomerTag;
  note: string | null;
}

export interface FinancialSummary {
  total_revenue: number;
  rental_revenue: number;
  delivery_revenue: number;
  total_costs: number;
  delivery_costs: number;
  operational_expenses: number;
  net_profit: number;
  total_rentals: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  month_name: string;
  total_revenue: number;
  net_profit: number;
  rental_count: number;
}

export interface EquipmentUtilization {
  id: number;
  name: string;
  quantity: number;
  total_rentals: number;
  total_revenue: number;
}

export type LockerSize = 'large' | 'medium' | 'small';

export interface LockerEquipmentItem {
  id: number;
  equipment_id: number;
  equipment_name: string;
  instance_number: number;
  is_free: boolean;
  customer_last_name: string | null;
}

export interface Locker {
  id: number;
  locker_number: string;
  access_code: string;
  description?: string;
  items: string[]; // legacy
  size: LockerSize;
  row_number: number;
  position_in_row: number;
  is_active: boolean;
  needs_check: boolean;
  equipment_items: LockerEquipmentItem[];
  total_equipment: number;
  free_equipment: number;
  office_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLockerDto {
  locker_number: string;
  access_code: string;
  description?: string;
  items?: string[];
  size?: LockerSize;
  row_number?: number;
  position_in_row?: number;
  is_active?: boolean;
}

export interface SetLockerEquipmentDto {
  items: Array<{ equipment_id: number; instance_number: number }>;
}
