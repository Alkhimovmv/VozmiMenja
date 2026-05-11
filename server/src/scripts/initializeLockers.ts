import { lockerModel } from '../models/Locker';

const LOCKERS_CONFIG = [
  // Ряд 4 (сверху): 6 маленьких ячеек (1-6)
  { number: '1', size: 'small' as const, row: 4, position: 1 },
  { number: '2', size: 'small' as const, row: 4, position: 2 },
  { number: '3', size: 'small' as const, row: 4, position: 3 },
  { number: '4', size: 'small' as const, row: 4, position: 4 },
  { number: '5', size: 'small' as const, row: 4, position: 5 },
  { number: '6', size: 'small' as const, row: 4, position: 6 },

  // Ряд 3: 3 средние ячейки (7-9)
  { number: '7', size: 'medium' as const, row: 3, position: 1 },
  { number: '8', size: 'medium' as const, row: 3, position: 2 },
  { number: '9', size: 'medium' as const, row: 3, position: 3 },

  // Ряд 2: 2 большие ячейки (10-11)
  { number: '10', size: 'large' as const, row: 2, position: 1 },
  { number: '11', size: 'large' as const, row: 2, position: 2 },

  // Ряд 1 (снизу): 2 большие ячейки (12-13)
  { number: '12', size: 'large' as const, row: 1, position: 1 },
  { number: '13', size: 'large' as const, row: 1, position: 2 },
];

export async function initializeLockers(officeId: number = 1): Promise<void> {
  console.log(`Инициализация ячеек постомата для офиса ${officeId}...`);

  for (const config of LOCKERS_CONFIG) {
    try {
      const existing = await lockerModel.findByLockerNumber(config.number, officeId);

      if (!existing) {
        const code = await lockerModel.generateUniqueCode();

        await lockerModel.create({
          lockerNumber: config.number,
          accessCode: code,
          description: `Ячейка ${config.number} (${config.size})`,
          items: [],
          size: config.size,
          rowNumber: config.row,
          positionInRow: config.position,
          isActive: true,
          officeId,
        });

        console.log(`✅ Создана ячейка ${config.number} (офис ${officeId})`);
      } else {
        console.log(`⏭️  Ячейка ${config.number} уже существует в офисе ${officeId}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка создания ячейки ${config.number}:`, error);
    }
  }

  console.log('✅ Инициализация завершена');
}
