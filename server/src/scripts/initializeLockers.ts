import { lockerModel } from '../models/Locker';

const LOCKERS_CONFIG = [
  // Ряд 1: 2 большие ячейки
  { number: '1', size: 'large' as const, row: 1, position: 1 },
  { number: '2', size: 'large' as const, row: 1, position: 2 },

  // Ряд 2: 2 большие ячейки
  { number: '3', size: 'large' as const, row: 2, position: 1 },
  { number: '4', size: 'large' as const, row: 2, position: 2 },

  // Ряд 3: 3 средние ячейки
  { number: '5', size: 'medium' as const, row: 3, position: 1 },
  { number: '6', size: 'medium' as const, row: 3, position: 2 },
  { number: '7', size: 'medium' as const, row: 3, position: 3 },

  // Ряд 4: 6 маленьких ячеек
  { number: '8', size: 'small' as const, row: 4, position: 1 },
  { number: '9', size: 'small' as const, row: 4, position: 2 },
  { number: '10', size: 'small' as const, row: 4, position: 3 },
  { number: '11', size: 'small' as const, row: 4, position: 4 },
  { number: '12', size: 'small' as const, row: 4, position: 5 },
  { number: '13', size: 'small' as const, row: 4, position: 6 },
];

export async function initializeLockers(): Promise<void> {
  console.log('Инициализация ячеек постомата...');

  for (const config of LOCKERS_CONFIG) {
    try {
      // Проверяем, существует ли ячейка
      const existing = await lockerModel.findByLockerNumber(config.number);

      if (!existing) {
        // Генерируем уникальный код
        const code = await lockerModel.generateUniqueCode();

        await lockerModel.create({
          lockerNumber: config.number,
          accessCode: code,
          description: `Ячейка ${config.number} (${config.size})`,
          size: config.size,
          rowNumber: config.row,
          positionInRow: config.position,
          isActive: true,
        });

        console.log(`✅ Создана ячейка ${config.number}`);
      } else {
        console.log(`⏭️  Ячейка ${config.number} уже существует`);
      }
    } catch (error) {
      console.error(`❌ Ошибка создания ячейки ${config.number}:`, error);
    }
  }

  console.log('✅ Инициализация завершена');
}
