# Инструкции по деплою исправлений

## Проблема
Картинки не отображались на https://vozmimenya.ru из-за того, что в базе данных хранились URL с `http://localhost:3002/uploads/...`

## Решение

### 1. Frontend (GitHub Pages) - автоматически
Frontend уже задеплоен через GitHub Actions на https://vozmimenya.ru
- ✅ Обновлена функция `getImageUrl` для обработки localhost URL
- ✅ Добавлены cache-busting заголовки
- ✅ Включены console.log для отладки

**Просто подождите 2-3 минуты после push и обновите страницу (Ctrl+Shift+R)**

### 2. Backend - требуется ручной деплой

#### Шаг 1: Обновить код на сервере

```bash
ssh user1@vm-1484f9c3f
cd /var/www/vozmimenya
git pull
```

#### Шаг 2: Пересобрать и перезапустить backend

```bash
cd server
npm run build
pm2 restart vozmimenya-api
# или если используется другой способ:
# sudo systemctl restart vozmimenya-api
```

#### Шаг 3: Запустить миграцию базы данных (опционально, но рекомендуется)

Это обновит существующие записи в БД, заменив `http://localhost:3002/uploads/...` на `/uploads/...`

```bash
cd /var/www/vozmimenya
./migrate-images.sh
```

Или вручную:
```bash
cd /var/www/vozmimenya/server
node src/scripts/migrate-image-urls.js
```

## Проверка работоспособности

### 1. Проверить Frontend
Откройте https://vozmimenya.ru в режиме инкогнито и проверьте консоль:

Должны появиться логи:
```
🔧 API_BASE_URL: https://api.vozmimenya.ru/api
🔧 VITE_API_URL: https://api.vozmimenya.ru/api
🔧 API_SERVER_URL: https://api.vozmimenya.ru
🖼️  getImageUrl input: /uploads/...
🖼️  Final URL: https://api.vozmimenya.ru/uploads/...
```

### 2. Проверить Backend
```bash
curl -I https://api.vozmimenya.ru/uploads/28894bb5-c734-4fe4-b195-a6c7b2b9a027.jpg
```

Должен вернуть `200 OK`

### 3. Проверить загрузку новых картинок через админку

1. Зайдите в https://vozmimenya.ru/admin/login (пароль: 20031997)
2. Создайте или отредактируйте оборудование
3. Загрузите картинку
4. В консоли backend должно появиться:
   ```
   ✅ Загружено изображений: 1
   📁 Пути: [ '/uploads/filename.jpg' ]
   ```
5. Картинка должна отображаться сразу

## Что было изменено

### Backend ([server/src/routes/admin.ts](server/src/routes/admin.ts))
```typescript
// Было:
const imageUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`)

// Стало:
const imageUrls = req.files.map(file => `/uploads/${file.filename}`)
```

### Frontend ([client/src/lib/utils.ts](client/src/lib/utils.ts))
- Улучшена обработка путей к картинкам
- Добавлена нормализация localhost URL
- Добавлено подробное логирование

## Результат

**До:**
- База данных: `"http://localhost:3002/uploads/file.jpg"`
- Frontend пытался загрузить: `http://localhost:3002/uploads/file.jpg` ❌

**После миграции БД:**
- База данных: `"/uploads/file.jpg"`
- Frontend загружает: `https://api.vozmimenya.ru/uploads/file.jpg` ✅

**Новые загрузки:**
- Backend возвращает: `"/uploads/file.jpg"`
- Frontend автоматически добавляет домен: `https://api.vozmimenya.ru/uploads/file.jpg` ✅

## Откат (если что-то пошло не так)

### Frontend
```bash
git revert HEAD
git push
```

### Backend
```bash
cd /var/www/vozmimenya
git revert HEAD
cd server
npm run build
pm2 restart vozmimenya-api
```

### База данных
Автоматически создается бэкап: `server/database.sqlite.backup-YYYYMMDD-HHMMSS`

Восстановление:
```bash
cd /var/www/vozmimenya/server
cp database.sqlite.backup-* database.sqlite
pm2 restart vozmimenya-api
```
