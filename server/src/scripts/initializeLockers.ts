import { lockerModel } from '../models/Locker';
import { database } from '../models/database';
import type { LockerSize } from '../models/Locker';

export async function initializeLockers(officeId: number = 1): Promise<void> {
  console.log(`Инициализация ячеек постомата для офиса ${officeId}...`);

  // Берём locker_rows из настроек офиса
  const office = await database.get('SELECT locker_rows FROM offices WHERE id = ?', [officeId]);
  if (!office) {
    throw new Error(`Офис ${officeId} не найден`);
  }

  let lockerRows: Array<{ row: number; count: number; size: string }> = [];
  try {
    lockerRows = JSON.parse(office.locker_rows || '[]');
  } catch {
    throw new Error('Некорректный формат locker_rows в настройках офиса');
  }

  if (lockerRows.length === 0) {
    throw new Error('В настройках офиса не задана конфигурация ячеек');
  }

  // Генерируем список ячеек из locker_rows (ряды идут сверху вниз по убыванию row)
  // Нумеруем последовательно начиная с 1, от верхнего ряда к нижнему
  const sortedRows = [...lockerRows].sort((a, b) => b.row - a.row);

  let lockerNumber = 1;
  for (const rowConfig of sortedRows) {
    for (let position = 1; position <= rowConfig.count; position++) {
      const numberStr = String(lockerNumber);
      try {
        const existing = await lockerModel.findByLockerNumber(numberStr, officeId);
        if (!existing) {
          const code = await lockerModel.generateUniqueCode();
          await lockerModel.create({
            lockerNumber: numberStr,
            accessCode: code,
            description: `Ячейка ${numberStr} (${rowConfig.size})`,
            items: [],
            size: rowConfig.size as LockerSize,
            rowNumber: rowConfig.row,
            positionInRow: position,
            isActive: true,
            officeId,
          });
          console.log(`✅ Создана ячейка ${numberStr} (ряд ${rowConfig.row}, позиция ${position})`);
        } else {
          console.log(`⏭️  Ячейка ${numberStr} уже существует в офисе ${officeId}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка создания ячейки ${numberStr}:`, error);
      }
      lockerNumber++;
    }
  }

  console.log('✅ Инициализация завершена');
}
