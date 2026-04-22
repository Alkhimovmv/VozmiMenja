# VozmiMenja — Система управления арендой оборудования

Монолитный проект: публичный сайт аренды оборудования + интегрированная админка для управления арендами, расписанием, финансами и постоматами.

## Стек

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Query, React Router
- **Backend**: Node.js, Express, TypeScript, SQLite, Zod
- **Deploy**: PM2 + Nginx на VPS

## Структура проекта

```
VozmiMenja/
├── server/                  # API сервер (Express + SQLite)
│   ├── src/
│   │   ├── routes/          # API роуты
│   │   ├── models/          # Модели БД (Rental, Locker, Expense, ...)
│   │   ├── middleware/      # Auth, upload
│   │   ├── services/        # Scheduler (Telegram уведомления)
│   │   └── utils/           # Трансформеры и утилиты
│   └── .env                 # Переменные окружения (не в git)
├── client/                  # React приложение
│   └── src/
│       ├── pages/admin/     # Страницы админки
│       ├── components/admin/ # Компоненты админки
│       ├── api/admin/       # API клиент
│       └── hooks/           # useAuth, useOffice, ...
├── ecosystem.config.js      # PM2 конфиг (production)
├── deploy.sh                # Деплой на сервер
├── start-dev.sh             # Запуск локально
└── nginx.conf               # Конфиг Nginx
```

## Быстрый старт (локально)

```bash
# Установить зависимости
cd server && npm install
cd ../client && npm install

# Запустить
./start-dev.sh

# Или раздельно:
cd server && npm run dev      # API на :3002
cd client && npm run dev      # Frontend на :5173
```

Админка доступна по адресу: http://localhost:5173/admin/rentals

## Переменные окружения

Создай файл `server/.env`:

```env
NODE_ENV=development
PORT=3002
FRONTEND_URL=http://localhost:5173

# Пароль для входа в админку
ADMIN_PASSWORD=твой_пароль

# Telegram уведомления (опционально)
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

## Production URLs

| | URL |
|---|---|
| Публичный сайт | https://vozmimenya.ru |
| API | https://api.vozmimenya.ru |
| Админка | https://vozmimenya.ru/admin |

## Деплой на сервер

```bash
# Первый деплой
./deploy.sh

# Обновление кода
./update.sh
```

### Управление на сервере

```bash
pm2 status                      # Статус процессов
pm2 logs vozmimenya-api         # Логи
pm2 restart vozmimenya-api      # Перезапуск

sudo nginx -t                   # Проверка конфига Nginx
sudo systemctl reload nginx
```

### Переменные окружения на сервере

На сервере нужно создать `server/.env` вручную (не через git):

```env
NODE_ENV=production
PORT=3003
FRONTEND_URL=https://vozmimenya.ru
ADMIN_PASSWORD=надёжный_пароль
TELEGRAM_BOT_TOKEN=токен_бота
TELEGRAM_CHAT_ID=id_чата
```

После изменения `.env` — перезапустить: `pm2 restart vozmimenya-api`

## Функциональность

### Публичный сайт
- Каталог оборудования для аренды
- Форма бронирования
- Блог со статьями
- SEO-страницы категорий

### Админка (`/admin`)
- **Аренды** — список, фильтрация, создание/редактирование
- **График** — диаграмма Ганта по неделям
- **Арендаторы** — история клиентов
- **Финансы** — доходы, расходы, прибыль по месяцам
- **Ячейки постомата** — управление ячейками и оборудованием в них
- **Оборудование** — справочник единиц оборудования
- **Настройка офисов** — мультиофисность, конфигурация постомата

### Мультиофисность
Система поддерживает несколько офисов. Каждый офис имеет независимые:
- аренды, расписание, финансы, ячейки постомата
- конфигурацию постомата (ряды, количество ячеек, размеры)

Список арендаторов общий для всех офисов.

## База данных

SQLite, файл: `database.sqlite` (в корне проекта).

Основные таблицы: `rentals`, `rental_equipment`, `rental_equipment_items`, `expenses`, `lockers`, `offices`, `customers`, `articles`.

Миграции применяются автоматически при запуске сервера через `database.init()`.

## Бэкапы

Создаются автоматически при каждом деплое:
- `database.sqlite` — хранится 7 дней
- Расположение на сервере: `/var/www/vozmimenya/backups/`
