# 🚀 Локальное развертывание на сервере

Этот скрипт предназначен для развертывания проекта, который **уже находится на сервере** (без клонирования из Git).

## 📋 Быстрый старт

### 1. Первоначальная установка (только один раз)

Установите системные зависимости:

```bash
sudo ./deploy-local.sh install
```

Это установит:
- Node.js 20.x
- PM2 (менеджер процессов)
- Nginx (веб-сервер)
- Необходимые системные пакеты

### 2. Развертывание проекта

```bash
sudo ./deploy-local.sh deploy
```

Это выполнит:
- ✅ Создание необходимых директорий
- ✅ Установку зависимостей для всех проектов
- ✅ Создание бэкапа баз данных
- ✅ Сборку проектов (VozmiMenja API, RentAdmin API, RentAdmin Frontend)
- ✅ Настройку Nginx
- ✅ Запуск приложений через PM2

### 3. Обновление после изменений

Когда вы изменили код и хотите пересобрать проект:

```bash
sudo ./deploy-local.sh update
```

---

## 🎯 Все команды

```bash
sudo ./deploy-local.sh install   # Установка системных зависимостей
sudo ./deploy-local.sh deploy    # Полное развертывание
sudo ./deploy-local.sh update    # Обновление (пересборка + перезапуск)
sudo ./deploy-local.sh restart   # Быстрый перезапуск сервисов
sudo ./deploy-local.sh stop      # Остановка PM2 приложений
sudo ./deploy-local.sh status    # Проверка статуса
```

---

## 📁 Что делает скрипт

### `install` - Установка зависимостей

1. Обновляет систему
2. Устанавливает Node.js 20.x
3. Устанавливает PM2 глобально
4. Устанавливает Nginx
5. Создает необходимые директории

### `deploy` - Развертывание

1. **Создает директории**: logs, backups, и т.д.
2. **Устанавливает npm зависимости**:
   - `server/` - VozmiMenja API
   - `client/` - VozmiMenja Frontend (для dev)
   - `rentadmin/backend/` - RentAdmin API
   - `rentadmin/frontend/` - RentAdmin Frontend
3. **Создает бэкап БД**:
   - `server/database.sqlite` → `backups/vozmimenya-db-YYYYMMDD-HHMMSS.sqlite`
   - `rentadmin/backend/database.sqlite3` → `backups/rentadmin-db-YYYYMMDD-HHMMSS.sqlite3`
4. **Собирает проекты**:
   - VozmiMenja Server: `npm run build` → `server/dist/`
   - RentAdmin Backend: `npm run build` → `rentadmin/backend/dist/`
   - RentAdmin Frontend: `npm run build` → `rentadmin/frontend/dist/`
5. **Копирует frontend**: `rentadmin/frontend/dist/` → `/var/www/html/admin/`
6. **Настраивает Nginx**: копирует `rentadmin/nginx-system.conf` → `/etc/nginx/nginx.conf`
7. **Запускает PM2**: запускает приложения согласно `ecosystem.config.js`
8. **Перезапускает Nginx**

### `update` - Обновление

1. Создает бэкап БД
2. Переустанавливает npm зависимости
3. Пересобирает все проекты
4. Перезапускает сервисы

### `restart` - Перезапуск

Просто перезапускает Nginx и PM2 без пересборки.

### `stop` - Остановка

Останавливает только PM2 приложения (Nginx продолжит работать).

### `status` - Статус

Показывает состояние Nginx и PM2 приложений.

---

## 🗂 Структура после развертывания

```
/var/www/vozmimenya/  (или ваша текущая директория)
├── server/
│   ├── dist/                    # Собранный VozmiMenja API ✅
│   ├── logs/                    # Логи PM2
│   └── database.sqlite          # База данных VozmiMenja
├── client/
│   └── (для разработки)
├── rentadmin/
│   ├── backend/
│   │   ├── dist/               # Собранный RentAdmin API ✅
│   │   ├── logs/               # Логи PM2
│   │   └── database.sqlite3    # База данных RentAdmin
│   └── frontend/
│       └── dist/               # Собранный frontend
├── logs/                        # Общие логи
├── backups/                     # Бэкапы БД
│   ├── vozmimenya-db-*.sqlite
│   └── rentadmin-db-*.sqlite3
└── ecosystem.config.js          # Конфигурация PM2

/var/www/html/admin/             # RentAdmin Frontend (обслуживается Nginx) ✅
```

---

## 🔍 Проверка работы

### Проверка PM2

```bash
pm2 status
pm2 logs              # Все логи
pm2 logs vozmimenya-api    # Только VozmiMenja
pm2 logs rentadmin-api     # Только RentAdmin
```

### Проверка Nginx

```bash
sudo systemctl status nginx
sudo nginx -t         # Проверка конфигурации
```

### Проверка портов

```bash
ss -tlnp | grep -E "3001|3003|80"
```

Должны быть открыты:
- `3001` - RentAdmin API
- `3003` - VozmiMenja API
- `80` - Nginx

### Проверка через curl

```bash
curl http://localhost/api/health          # RentAdmin API
curl http://localhost:3003/api/           # VozmiMenja API (если есть endpoint)
```

### Проверка в браузере

- **RentAdmin**: `http://YOUR_SERVER_IP/admin/`
- **RentAdmin API**: `http://YOUR_SERVER_IP/api/`

---

## 🛠 Устранение неполадок

### PM2 процессы не запускаются

**Проблема**: Процессы падают сразу после запуска

**Решение**:

```bash
# Проверьте логи
pm2 logs

# Проверьте, что проекты собрались
ls -la server/dist/
ls -la rentadmin/backend/dist/

# Если dist/ пусты, пересоберите
sudo ./deploy-local.sh deploy
```

### Nginx показывает 502 Bad Gateway

**Причина**: PM2 процессы не работают

**Решение**:

```bash
# Проверьте PM2
pm2 status

# Если процессы не работают
pm2 restart all

# Если не помогло, пересоберите
sudo ./deploy-local.sh deploy
```

### Ошибка "npm ERR! Cannot find module"

**Решение**:

```bash
# Удалите node_modules и переустановите
cd /path/to/project
rm -rf server/node_modules
rm -rf rentadmin/backend/node_modules
rm -rf rentadmin/frontend/node_modules

sudo ./deploy-local.sh deploy
```

### Frontend не обновляется

**Проблема**: Браузер показывает старую версию

**Решение**:

```bash
# Пересоберите frontend
cd rentadmin/frontend
npm run build
sudo cp -r dist/* /var/www/html/admin/

# Очистите кэш браузера (Ctrl+Shift+R)
```

### База данных повреждена

**Восстановление из бэкапа**:

```bash
# Посмотрите доступные бэкапы
ls -lh backups/

# Восстановите нужный
cp backups/rentadmin-db-20250116-120000.sqlite3 \
   rentadmin/backend/database.sqlite3

# Перезапустите
pm2 restart rentadmin-api
```

---

## 📊 Мониторинг

### Просмотр логов в реальном времени

```bash
# PM2 логи
pm2 logs

# Nginx логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Мониторинг ресурсов

```bash
pm2 monit              # Интерактивный монитор PM2
htop                   # Монитор системы
df -h                  # Место на диске
free -h                # Память
```

---

## 🔄 Типичный рабочий процесс

### Первый запуск на сервере

```bash
# 1. Установите зависимости
sudo ./deploy-local.sh install

# 2. Разверните проект
sudo ./deploy-local.sh deploy

# 3. Проверьте статус
sudo ./deploy-local.sh status
```

### Обновление после изменений в коде

```bash
# Если вы изменили код локально и скопировали на сервер
sudo ./deploy-local.sh update
```

### Быстрый перезапуск

```bash
# Если нужно просто перезапустить без пересборки
sudo ./deploy-local.sh restart
```

---

## ⚡ Автоматизация

### Автоматическое обновление по расписанию

Если хотите автоматически обновлять проект (например, после git pull):

```bash
# Создайте скрипт
sudo nano /usr/local/bin/auto-update-vozmimenya.sh
```

Содержимое:

```bash
#!/bin/bash
cd /path/to/vozmimenya
git pull origin main
./deploy-local.sh update
```

Настройте cron:

```bash
sudo crontab -e

# Добавьте (обновление каждый день в 3:00)
0 3 * * * /usr/local/bin/auto-update-vozmimenya.sh >> /var/log/auto-update.log 2>&1
```

---

## 📝 Важные замечания

1. **Бэкапы**: Скрипт автоматически создает бэкапы БД перед каждым обновлением
2. **Старые бэкапы**: Автоматически удаляются бэкапы старше 7 дней
3. **Production зависимости**: После сборки скрипт удаляет dev-зависимости (`npm prune --production`)
4. **Права**: Скрипт правильно устанавливает права для пользователя и www-data

---

## ✅ Контрольный список

После развертывания проверьте:

- [ ] `pm2 status` показывает 2 запущенных процесса (vozmimenya-api, rentadmin-api)
- [ ] `sudo systemctl status nginx` показывает active (running)
- [ ] `ls -la server/dist/` - директория не пустая
- [ ] `ls -la rentadmin/backend/dist/` - директория не пустая
- [ ] `ls -la /var/www/html/admin/` - есть index.html
- [ ] RentAdmin открывается в браузере
- [ ] API отвечает на запросы
- [ ] Логи не показывают критических ошибок

---

**Готово! 🎉 Ваш проект развернут и работает.**
