import { database } from '../models/database'
import { adminUserModel } from '../models/AdminUser'

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} environment variable is required`)
  return value
}

function validatePassword(name: string, password: string): string {
  if (password.length < 12) throw new Error(`${name} must contain at least 12 characters`)
  return password
}

const maskPhone = (phone: string) => phone.length > 4 ? `***${phone.slice(-4)}` : '***'

async function main() {
  const superadminPhone = requireEnv('MIGRATE_SUPERADMIN_PHONE')
  const adminPhone = requireEnv('MIGRATE_ADMIN_PHONE')
  const superadminPassword = validatePassword(
    'MIGRATE_SUPERADMIN_PASSWORD',
    requireEnv('MIGRATE_SUPERADMIN_PASSWORD'),
  )
  const adminPassword = validatePassword(
    'MIGRATE_ADMIN_PASSWORD',
    requireEnv('MIGRATE_ADMIN_PASSWORD'),
  )
  if (superadminPassword === adminPassword) {
    throw new Error('Superadmin and admin passwords must be different')
  }

  // Создаём суперадмина
  await database.init()
  let superadmin = await adminUserModel.findByPhone(superadminPhone)
  if (!superadmin) {
    superadmin = await adminUserModel.create(superadminPhone, superadminPassword, 'superadmin', 'Супер Администратор')
    console.log(`✅ Создан суперадмин: ${maskPhone(superadminPhone)} (id=${superadmin.id})`)
  } else {
    await adminUserModel.updatePassword(superadmin.id, superadminPassword)
    console.log(`ℹ️  Суперадмин уже существует (id=${superadmin.id}), обновлён пароль`)
  }

  // Создаём обычного админа
  let admin = await adminUserModel.findByPhone(adminPhone)
  if (!admin) {
    admin = await adminUserModel.create(adminPhone, adminPassword, 'admin', 'Администратор')
    console.log(`✅ Создан администратор: ${maskPhone(adminPhone)} (id=${admin.id})`)
  } else {
    await adminUserModel.updatePassword(admin.id, adminPassword)
    console.log(`ℹ️  Администратор уже существует (id=${admin.id}), обновлён пароль`)
  }

  // Привязываем все существующие данные к суперадмину
  await database.run(
    `UPDATE offices SET user_id = ? WHERE user_id IS NULL`,
    [superadmin.id]
  )
  console.log(`✅ Офисы привязаны к суперадмину`)

  await database.run(
    `UPDATE rental_equipment SET user_id = ? WHERE user_id IS NULL`,
    [superadmin.id]
  )
  console.log(`✅ Оборудование привязано к суперадмину`)

  console.log('\n✅ Миграция завершена')
  console.log(`   Суперадмин: ${maskPhone(superadminPhone)}`)
  console.log(`   Администратор: ${maskPhone(adminPhone)}`)

  await database.close()
}

main().catch(err => {
  console.error('❌ Ошибка миграции:', err)
  process.exit(1)
})
