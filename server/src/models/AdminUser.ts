import bcrypt from 'bcrypt'
import { run, get, all } from './database'

export type AdminRole = 'superadmin' | 'admin'

export interface AdminUser {
  id: number
  phone: string
  password_hash: string
  role: AdminRole
  name: string | null
  created_at: string
  updated_at: string
}

export interface AdminUserPublic {
  id: number
  phone: string
  role: AdminRole
  name: string | null
  created_at: string
}

const SALT_ROUNDS = 12

export const adminUserModel = {
  async create(phone: string, password: string, role: AdminRole = 'admin', name?: string): Promise<AdminUser> {
    const normalized = normalizePhone(phone)
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)
    const result = await run(
      `INSERT INTO admin_users (phone, password_hash, role, name) VALUES (?, ?, ?, ?)`,
      [normalized, password_hash, role, name || null]
    )
    return this.findById((result as any).lastID) as Promise<AdminUser>
  },

  async findByPhone(phone: string): Promise<AdminUser | null> {
    const normalized = normalizePhone(phone)
    const row = await get(`SELECT * FROM admin_users WHERE phone = ?`, [normalized])
    return row || null
  },

  async findById(id: number): Promise<AdminUser | null> {
    const row = await get(`SELECT * FROM admin_users WHERE id = ?`, [id])
    return row || null
  },

  async findAll(): Promise<AdminUserPublic[]> {
    const rows = await all(`SELECT id, phone, role, name, created_at FROM admin_users ORDER BY id`)
    return rows
  },

  async verifyPassword(user: AdminUser, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash)
  },

  async updatePassword(id: number, password: string): Promise<void> {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)
    await run(
      `UPDATE admin_users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [password_hash, id]
    )
  },

  async updateRole(id: number, role: AdminRole): Promise<void> {
    await run(
      `UPDATE admin_users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [role, id]
    )
  },

  async updateName(id: number, name: string): Promise<void> {
    await run(
      `UPDATE admin_users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, id]
    )
  },

  async delete(id: number): Promise<void> {
    await run(`DELETE FROM admin_users WHERE id = ?`, [id])
  },

  toPublic(user: AdminUser): AdminUserPublic {
    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      created_at: user.created_at,
    }
  },
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^8/, '7')
}
