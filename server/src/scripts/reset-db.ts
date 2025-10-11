import { v4 as uuidv4 } from 'uuid'
import { database } from '../models/database'
import { equipmentModel } from '../models/Equipment'
import { promisify } from 'util'

const equipmentData = [
  {
    name: 'GoPro 13',
    category: 'Камеры',
    pricePerDay: 1500,
    quantity: 6,
    description: 'Последняя модель экшн-камеры GoPro с улучшенной стабилизацией и качеством видео 5.3K. Идеально подходит для съемки экстремального спорта, путешествий и создания динамичного контента.',
    specifications: {
      'Разрешение видео': '5.3K60, 4K120',
      'Разрешение фото': '27 МП',
      'Стабилизация': 'HyperSmooth 6.0',
      'Водонепроницаемость': 'До 10 м',
      'Вес': '153 г',
      'Аккумулятор': 'До 70 минут записи'
    },
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500',
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500'
    ]
  },
  {
    name: 'DJI Osmo Pocket 3',
    category: 'Камеры',
    pricePerDay: 1500,
    quantity: 2,
    description: 'Компактная камера с 3-осевым механическим подвесом и возможностью съемки в 4K. Отлично подходит для создания профессионального контента в путешествиях и повседневной съемке.',
    specifications: {
      'Разрешение видео': '4K/120fps, 1080p/240fps',
      'Разрешение фото': '64 МП',
      'Стабилизация': '3-осевой механический подвес',
      'Размер матрицы': '1-дюймовая CMOS',
      'Вес': '179 г',
      'Время работы': 'До 166 минут'
    },
    images: [
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500'
    ]
  },
  {
    name: 'Karcher SC4',
    category: 'Клининговое оборудование',
    pricePerDay: 680,
    quantity: 5,
    description: 'Пароочиститель для глубокой очистки различных поверхностей без использования химических средств. Эффективно удаляет грязь, жир и бактерии паром под высоким давлением.',
    specifications: {
      'Мощность': '2000 Вт',
      'Объем бака': '0.8 л',
      'Давление пара': '3.5 бар',
      'Время нагрева': '4 минуты',
      'Время работы': 'До 30 минут',
      'Длина шланга': '2 м'
    },
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
      'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=500'
    ]
  },
  {
    name: 'Karcher Puzzi 8/1',
    category: 'Клининговое оборудование',
    pricePerDay: 980,
    quantity: 8,
    description: 'Моющий пылесос для чистки ковров, обивки мебели и автомобильных сидений. Эффективно удаляет глубокие загрязнения и восстанавливает первоначальный вид текстиля.',
    specifications: {
      'Мощность всасывания': '200 Вт',
      'Объем бака для чистой воды': '8 л',
      'Объем бака для грязной воды': '7 л',
      'Расход моющего раствора': '1 л/мин',
      'Ширина всасывания': '240 мм',
      'Вес': '10.4 кг'
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'
    ]
  },
  {
    name: 'Karcher Puzzi 10/1',
    category: 'Клининговое оборудование',
    pricePerDay: 980,
    quantity: 1,
    description: 'Профессиональный моющий пылесос повышенной мощности для интенсивной чистки больших площадей. Подходит для коммерческого использования и сложных загрязнений.',
    specifications: {
      'Мощность всасывания': '250 Вт',
      'Объем бака для чистой воды': '10 л',
      'Объем бака для грязной воды': '9 л',
      'Расход моющего раствора': '1.2 л/мин',
      'Ширина всасывания': '240 мм',
      'Вес': '12.8 кг'
    },
    images: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
      'https://images.unsplash.com/photo-1603712725038-59cf0dfa7bb0?w=500'
    ]
  },
  {
    name: 'Karcher WD5',
    category: 'Клининговое оборудование',
    pricePerDay: 880,
    quantity: 1,
    description: 'Универсальный пылесос для сухой и влажной уборки. Подходит для уборки в мастерских, гаражах, а также для бытового использования.',
    specifications: {
      'Мощность': '1100 Вт',
      'Объем бака': '25 л',
      'Длина кабеля': '4 м',
      'Длина шланга': '2.2 м',
      'Уровень шума': '75 дБ',
      'Вес': '7.5 кг'
    },
    images: [
      'https://images.unsplash.com/photo-1558617047-f83c17c786a8?w=500',
      'https://images.unsplash.com/photo-1611249651286-0bfa1e7dc97d?w=500'
    ]
  },
  {
    name: 'Okami Q75',
    category: 'Клининговое оборудование',
    pricePerDay: 2200,
    quantity: 1,
    description: 'Профессиональный пылесос с высокой производительностью и надежностью. Предназначен для интенсивной коммерческой эксплуатации и уборки больших площадей.',
    specifications: {
      'Мощность': '1400 Вт',
      'Объем бака': '75 л',
      'Производительность': '250 м³/ч',
      'Уровень шума': '68 дБ',
      'Длина кабеля': '12 м',
      'Вес': '18 кг'
    },
    images: [
      'https://images.unsplash.com/photo-1558617841-d689d0b7b7a4?w=500',
      'https://images.unsplash.com/photo-1607781750899-7cf7c39cd01c?w=500'
    ]
  },
  {
    name: 'Робот-мойщик окон',
    category: 'Клининговое оборудование',
    pricePerDay: 780,
    quantity: 2,
    description: 'Автоматический робот-мойщик для очистки окон, стеклянных поверхностей, зеркал и кафеля. Безопасен в использовании и эффективно очищает труднодоступные места.',
    specifications: {
      'Мощность всасывания': '2800 Па',
      'Скорость очистки': '2.4 м²/мин',
      'Толщина стекла': 'От 5 до 15 мм',
      'Время работы': 'До 60 минут',
      'Управление': 'Дистанционное',
      'Вес': '900 г'
    },
    images: [
      'https://images.unsplash.com/photo-1581873372796-2d09d28e3900?w=500',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
    ]
  },
  {
    name: 'DJI Mic 2',
    category: 'Аудиооборудование',
    pricePerDay: 1500,
    quantity: 1,
    description: 'Беспроводная микрофонная система с кристально чистым звуком и радиусом действия до 250 метров. Идеально подходит для интервью, влогов и профессиональной съемки.',
    specifications: {
      'Частотный диапазон': '50 Гц - 20 кГц',
      'Радиус действия': 'До 250 м',
      'Время работы': 'До 18 часов',
      'Запись': '32-битная внутренняя запись',
      'Подключение': 'Lightning, USB-C, 3.5мм',
      'Вес передатчика': '30 г'
    },
    images: [
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500'
    ]
  }
]

async function resetDatabase() {
  try {
    console.log('🔄 Инициализация базы данных...')
    await database.init()

    const run = promisify(database.instance.run.bind(database.instance))

    console.log('🗑️  Очистка таблицы equipment...')
    await run('DELETE FROM equipment')
    console.log('✅ Таблица equipment очищена')

    console.log('📝 Добавление оборудования...')
    for (const item of equipmentData) {
      const id = uuidv4()
      await equipmentModel.create({
        id,
        ...item
      })
      console.log(`✅ Добавлено: ${item.name} (${item.quantity} шт.)`)
    }

    console.log('🎉 База данных успешно переинициализирована!')
    console.log(`📊 Всего добавлено: ${equipmentData.length} единиц оборудования`)

  } catch (error) {
    console.error('❌ Ошибка при сбросе базы данных:', error)
  } finally {
    await database.close()
    process.exit(0)
  }
}

resetDatabase()
