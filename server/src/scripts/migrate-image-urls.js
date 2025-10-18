const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');

function promisifyRun(db) {
  return (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  };
}

function promisifyAll(db) {
  return (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  };
}

async function migrate() {
  const db = new sqlite3.Database(dbPath);
  const run = promisifyRun(db);
  const all = promisifyAll(db);

  try {
    console.log('🔄 Начало миграции URL картинок...');

    // Получаем все записи оборудования
    const equipment = await all('SELECT id, name, images FROM equipment');

    let updatedCount = 0;
    let totalImages = 0;

    for (const item of equipment) {
      try {
        const images = JSON.parse(item.images);
        let hasChanges = false;

        // Заменяем localhost:3002 на относительные пути
        const updatedImages = images.map((img) => {
          totalImages++;
          if (img.includes('localhost:3002')) {
            hasChanges = true;
            // Заменяем http://localhost:3002/uploads/file.jpg на /uploads/file.jpg
            return img.replace('http://localhost:3002', '');
          }
          if (img.includes('localhost:3001')) {
            hasChanges = true;
            // Также заменяем localhost:3001 если такие есть
            return img.replace('http://localhost:3001', '');
          }
          return img;
        });

        if (hasChanges) {
          // Обновляем запись в БД
          await run(
            'UPDATE equipment SET images = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [JSON.stringify(updatedImages), item.id]
          );
          updatedCount++;
          console.log(`✅ Обновлено: ${item.name} (${item.id})`);
        }
      } catch (error) {
        console.error(`❌ Ошибка обработки ${item.id}:`, error.message);
      }
    }

    console.log('\n📊 Результаты миграции:');
    console.log(`   Всего записей оборудования: ${equipment.length}`);
    console.log(`   Обновлено записей: ${updatedCount}`);
    console.log(`   Всего картинок обработано: ${totalImages}`);
    console.log('\n✅ Миграция завершена успешно');
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    throw error;
  } finally {
    await new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Критическая ошибка:', error);
    process.exit(1);
  });
