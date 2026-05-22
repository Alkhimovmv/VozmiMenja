import { database } from '../models/database'
import { adminUserModel } from '../models/AdminUser'

async function main() {
  await database.init()

  const SUPERADMIN_PHONE = '79175255095'
  const ADMIN_PHONE = '79190411761'
  const PASSWORD = 'Hesoyam-11'

  // Создаём суперадмина
  let superadmin = await adminUserModel.findByPhone(SUPERADMIN_PHONE)
  if (!superadmin) {
    superadmin = await adminUserModel.create(SUPERADMIN_PHONE, PASSWORD, 'superadmin', 'Супер Администратор')
    console.log(`✅ Создан суперадмин: ${SUPERADMIN_PHONE} (id=${superadmin.id})`)
  } else {
    await adminUserModel.updatePassword(superadmin.id, PASSWORD)
    console.log(`ℹ️  Суперадмин уже существует (id=${superadmin.id}), обновлён пароль`)
  }

  // Создаём обычного админа
  let admin = await adminUserModel.findByPhone(ADMIN_PHONE)
  if (!admin) {
    admin = await adminUserModel.create(ADMIN_PHONE, PASSWORD, 'admin', 'Администратор')
    console.log(`✅ Создан администратор: ${ADMIN_PHONE} (id=${admin.id})`)
  } else {
    await adminUserModel.updatePassword(admin.id, PASSWORD)
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
  console.log(`   Суперадмин: +${SUPERADMIN_PHONE} / ${PASSWORD}`)
  console.log(`   Администратор: +${ADMIN_PHONE} / ${PASSWORD}`)

  await database.close()
}

main().catch(err => {
  console.error('❌ Ошибка миграции:', err)
  process.exit(1)
})
