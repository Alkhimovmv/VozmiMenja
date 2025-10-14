# VozmiMenja + RentAdmin - Объединённый проект

Объединённый проект для аренды оборудования VozmiMenja и системы управления расписанием RentAdmin.

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Запустить все сервисы (4 приложения)
./start-dev.sh

# Остановить все сервисы
./stop-dev.sh

# Посмотреть логи
./logs-dev.sh
```

**Доступ:**
- VozmiMenja: http://localhost:5173
- RentAdmin: http://localhost:5177 (PIN: `20031997`)

Подробнее: [LOCAL_DEV.md](LOCAL_DEV.md)

### Развёртывание на сервер

```bash
# Первое развёртывание (полная установка)
./deploy.sh

# Обновление кода (без изменения БД)
./update.sh
```

## 📦 Структура проекта

```
VozmiMenja/
├── server/              # VozmiMenja API (порт 3003)
├── client/              # VozmiMenja Frontend (GitHub Pages)
├── rentadmin/
│   ├── backend/         # RentAdmin API (порт 3001)
│   └── frontend/        # RentAdmin Frontend
├── ecosystem.config.js  # PM2 конфиг (production)
├── deploy.sh            # Скрипт развёртывания
├── update.sh            # Скрипт обновления
├── start-dev.sh         # Запуск локально
└── stop-dev.sh          # Остановка локально
```

## 🌐 Production URL

| Приложение | URL | Описание |
|-----------|-----|----------|
| **VozmiMenja** | https://vozmimenya.ru | Публичный сайт аренды |
| **VozmiMenja API** | https://api.vozmimenya.ru | API для VozmiMenja |
| **RentAdmin** | https://schedule-admin.vozmimenya.ru | Админка расписания |

## 📋 Команды на сервере

```bash
# SSH подключение
ssh user1@87.242.103.146

# PM2 управление
pm2 status              # Статус процессов
pm2 logs                # Логи всех процессов
pm2 restart all         # Перезапуск всех
pm2 restart vozmimenya-api    # Перезапуск VozmiMenja
pm2 restart rentadmin-api     # Перезапуск RentAdmin

# Просмотр бэкапов
ls -lh /var/www/vozmimenya/backups/

# Nginx
sudo nginx -t           # Проверка конфигурации
sudo systemctl reload nginx  # Перезагрузка nginx
```

## 🔧 Технологии

### VozmiMenja
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, SQLite, TypeScript
- **Deploy**: GitHub Pages + Cloud.ru

### RentAdmin
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, SQLite, TypeScript, Knex
- **Deploy**: Cloud.ru (nginx)

## 💾 Бэкапы

Бэкапы создаются автоматически при каждом `deploy.sh` и `update.sh`:

- **База данных**: сохраняются на 7 дней
- **Код**: сохраняется на 3 дня
- **Uploads**: сохраняются на 7 дней

Расположение: `/var/www/vozmimenya/backups/`

## 📚 Документация

- [LOCAL_DEV.md](LOCAL_DEV.md) - Локальная разработка
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Руководство администратора
- [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) - Настройка Telegram бота

## 🔐 Переменные окружения

### VozmiMenja API (server/.env.production)
```env
NODE_ENV=production
PORT=3003
API_URL=https://api.vozmimenya.ru
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

### RentAdmin API (rentadmin/backend/.env.production)
```env
NODE_ENV=production
PORT=3001
PIN_CODE=20031997
API_URL=https://schedule-admin.vozmimenya.ru
```

## 🐛 Отладка

### Проверка API
```bash
# VozmiMenja API
curl https://api.vozmimenya.ru/api/equipment

# RentAdmin API
curl https://schedule-admin.vozmimenya.ru/api/health
```

### Логи
```bash
# На сервере
pm2 logs vozmimenya-api
pm2 logs rentadmin-api

# Локально
tail -f logs/vozmimenya-api.log
tail -f logs/rentadmin-api.log
```

## 📞 Контакты

- Email: info@vozmimenya.ru
- Telegram: @vozmimenya
- Телефон: +7 (XXX) XXX-XX-XX

## 📝 Лицензия

Proprietary - Все права защищены
