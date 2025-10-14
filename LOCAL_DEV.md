# Локальная разработка объединённого проекта

## 🚀 Быстрый старт

```bash
cd /home/maxim/VozmiMenja

# Запустить все сервисы
./start-dev.sh

# Посмотреть логи
./logs-dev.sh

# Остановить все сервисы
./stop-dev.sh
```

## 📦 Структура проекта

```
VozmiMenja/
├── server/              # VozmiMenja API (порт 3003)
├── client/              # VozmiMenja Frontend (порт 5173)
├── rentadmin/
│   ├── backend/         # RentAdmin API (порт 3001)
│   └── frontend/        # RentAdmin Frontend (порт 3000)
└── logs/                # Логи всех сервисов
```

## 🌐 URL для разработки

| Сервис | URL | Порт |
|--------|-----|------|
| **VozmiMenja Frontend** | http://localhost:5173 | 5173 |
| **VozmiMenja API** | http://localhost:3003/api | 3003 |
| **RentAdmin Frontend** | http://localhost:3000 | 3000 |
| **RentAdmin API** | http://localhost:3001/api | 3001 |

## 🛠️ Команды разработки

### Запуск отдельных сервисов

#### VozmiMenja API
```bash
cd server
npm install
npm run dev
# Доступен на http://localhost:3003/api
```

#### VozmiMenja Frontend
```bash
cd client
npm install
npm run dev
# Доступен на http://localhost:5173
```

#### RentAdmin API
```bash
cd rentadmin/backend
npm install
npm run dev
# Доступен на http://localhost:3001/api
```

#### RentAdmin Frontend
```bash
cd rentadmin/frontend
npm install
npm start
# Доступен на http://localhost:3000
```

### Сборка для production

#### VozmiMenja
```bash
# API
cd server
npm run build

# Frontend
cd ../client
npm run build
```

#### RentAdmin
```bash
# API
cd rentadmin/backend
npm run build

# Frontend
cd ../frontend
npm run build
```

## 📋 Полезные команды

### Проверка портов
```bash
# Проверить какие порты заняты
lsof -i :3001
lsof -i :3003
lsof -i :5173
lsof -i :3000

# Освободить порт (замените 3001 на нужный)
lsof -ti:3001 | xargs kill -9
```

### Просмотр логов
```bash
# Интерактивный выбор логов
./logs-dev.sh

# Или напрямую:
tail -f logs/vozmimenya-api.log
tail -f logs/rentadmin-api.log
tail -f logs/vozmimenya-frontend.log
tail -f logs/rentadmin-frontend.log

# Все логи сразу
tail -f logs/*.log
```

### База данных

#### VozmiMenja (SQLite)
```bash
cd server
sqlite3 database.sqlite

# Примеры команд:
.tables
SELECT * FROM equipment;
.quit
```

#### RentAdmin (SQLite)
```bash
cd rentadmin/backend
sqlite3 database.sqlite3

# Примеры команд:
.tables
SELECT * FROM bookings;
.quit
```

## 🔧 Переменные окружения

### VozmiMenja API (server/.env)
```env
NODE_ENV=development
PORT=3003
API_URL=http://localhost:3003
FRONTEND_URL=http://localhost:5173
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
```

### VozmiMenja Frontend (client/.env)
```env
VITE_API_URL=http://localhost:3003/api
```

### RentAdmin API (rentadmin/backend/.env)
```env
NODE_ENV=development
PORT=3001
DB_CLIENT=sqlite3
DB_FILENAME=./database.sqlite3
JWT_SECRET=your_secret
PIN_CODE=20031997
CORS_ORIGIN=http://localhost:3000
```

### RentAdmin Frontend (rentadmin/frontend/.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## 🐛 Отладка

### VozmiMenja API не запускается
1. Проверьте порт 3003: `lsof -i :3003`
2. Проверьте логи: `cat logs/vozmimenya-api.log`
3. Убедитесь что database.sqlite существует

### RentAdmin API не запускается
1. Проверьте порт 3001: `lsof -i :3001`
2. Проверьте логи: `cat logs/rentadmin-api.log`
3. Запустите миграции: `cd rentadmin/backend && npm run db:migrate`

### Frontend не подключается к API
1. Проверьте что API запущен
2. Проверьте CORS настройки в API
3. Проверьте URL в .env файлах

### Ошибка "port already in use"
```bash
# Найти процесс на порту
lsof -i :3001

# Убить процесс
kill -9 <PID>

# Или автоматически
lsof -ti:3001 | xargs kill -9
```

## 📦 Установка зависимостей после git clone

```bash
# В корне проекта выполните:
cd /home/maxim/VozmiMenja

# VozmiMenja
cd server && npm install && cd ..
cd client && npm install && cd ..

# RentAdmin
cd rentadmin/backend && npm install && cd ../..
cd rentadmin/frontend && npm install && cd ../..
```

## 🔄 Git workflow

```bash
# Добавить изменения
git add .
git commit -m "feat: описание изменений"
git push

# Обновить из репозитория
git pull

# Проверить статус
git status
```

## 🚀 Production deployment

См. [DEPLOY_UNIFIED.md](DEPLOY_UNIFIED.md) для инструкций по развёртыванию на сервере.
