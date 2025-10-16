# 🚀 Руководство по развертыванию на сервере

Это руководство описывает автоматическое развертывание проекта VozmiMenja + RentAdmin на сервере с помощью скрипта `server-deploy.sh`.

## 📋 Содержание

1. [Требования](#требования)
2. [Подготовка скрипта](#подготовка-скрипта)
3. [Первоначальная установка](#первоначальная-установка)
4. [Развертывание проекта](#развертывание-проекта)
5. [Обновление проекта](#обновление-проекта)
6. [Перезапуск сервисов](#перезапуск-сервисов)
7. [Устранение неполадок](#устранение-неполадок)

---

## 🔧 Требования

### Минимальные требования к серверу:

- **ОС**: Ubuntu 20.04+ / Debian 11+
- **RAM**: минимум 2GB
- **Диск**: минимум 10GB свободного места
- **Права**: root доступ (sudo)
- **Порты**: 80 (HTTP), 3001 (RentAdmin API), 3003 (VozmiMenja API)

### Необходимый доступ:

- SSH доступ к серверу
- Возможность выполнять команды с sudo

---

## 📝 Подготовка скрипта

### Шаг 1: Загрузка скрипта на сервер

Есть несколько способов загрузить скрипт на сервер:

#### Вариант А: Через SCP (если есть локальная копия)

```bash
scp server-deploy.sh user@your-server-ip:/tmp/
```

#### Вариант Б: Скачать напрямую на сервер

```bash
# Подключитесь к серверу
ssh user@your-server-ip

# Скачайте скрипт (если он в репозитории)
wget https://raw.githubusercontent.com/username/vozmimenya/main/server-deploy.sh

# Или создайте вручную
nano server-deploy.sh
# Скопируйте содержимое скрипта
```

#### Вариант В: Прямое копирование

```bash
# На сервере создайте файл
nano /tmp/server-deploy.sh

# Скопируйте содержимое из локального файла server-deploy.sh
# Сохраните (Ctrl+O, Enter, Ctrl+X)
```

### Шаг 2: Настройка параметров

Отредактируйте скрипт и укажите URL вашего Git-репозитория:

```bash
nano /tmp/server-deploy.sh
```

Найдите и измените строку:

```bash
GIT_REPO="https://github.com/username/vozmimenya.git"  # Замените на ваш репозиторий
```

На реальный URL вашего репозитория, например:

```bash
GIT_REPO="https://github.com/myusername/vozmimenya.git"
```

**Важно:** Если ваш репозиторий приватный, настройте SSH ключи или используйте токен доступа:

```bash
# Для приватного репозитория через SSH
GIT_REPO="git@github.com:myusername/vozmimenya.git"

# Для приватного репозитория через токен
GIT_REPO="https://TOKEN@github.com/myusername/vozmimenya.git"
```

### Шаг 3: Сделайте скрипт исполняемым

```bash
chmod +x /tmp/server-deploy.sh
```

---

## 🎯 Первоначальная установка

При первом запуске на новом сервере выполните команду `install`:

```bash
sudo /tmp/server-deploy.sh install
```

Эта команда:
- ✅ Обновит систему
- ✅ Установит необходимые пакеты (git, nginx, build-essential)
- ✅ Установит Node.js 20.x
- ✅ Установит PM2 глобально
- ✅ Создаст директории для проекта
- ✅ Настроит права доступа

**Время выполнения:** ~3-5 минут

После завершения вы увидите сообщение с инструкцией для следующего шага.

---

## 🚀 Развертывание проекта

После установки базовых зависимостей выполните развертывание:

```bash
sudo /tmp/server-deploy.sh update
```

Эта команда:
- ✅ Клонирует репозиторий в `/var/www/vozmimenya`
- ✅ Установит все npm зависимости
- ✅ Соберет все проекты (VozmiMenja API, RentAdmin API, RentAdmin Frontend)
- ✅ Настроит Nginx
- ✅ Запустит приложения через PM2
- ✅ Настроит автозапуск

**Время выполнения:** ~5-10 минут (зависит от скорости интернета)

### Что происходит при развертывании:

```
1. 💾 Создание бэкапа базы данных (если есть)
   ├─ Бэкап VozmiMenja database.sqlite
   └─ Бэкап RentAdmin database.sqlite3

2. 📥 Клонирование/обновление репозитория
   ├─ git clone или git pull
   └─ Обновление submodule rentadmin

3. 📦 Установка зависимостей
   ├─ VozmiMenja Server (npm install --production)
   ├─ VozmiMenja Client (npm install)
   ├─ RentAdmin Backend (npm install --production)
   └─ RentAdmin Frontend (npm install)

4. 🔨 Сборка проектов
   ├─ VozmiMenja Server (npm run build)
   ├─ RentAdmin Backend (npm run build)
   └─ RentAdmin Frontend (npm run build + копирование в /var/www/html/admin)

5. ⚙️ Настройка Nginx
   └─ Копирование конфигурации и проверка

6. 🚀 Запуск PM2
   ├─ Запуск vozmimenya-api (порт 3003)
   └─ Запуск rentadmin-api (порт 3001)

7. 🔄 Перезапуск сервисов
   ├─ systemctl restart nginx
   └─ pm2 restart all
```

После успешного развертывания вы увидите:

```
🎉 ОБНОВЛЕНИЕ ЗАВЕРШЕНО

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📋 ИНФОРМАЦИЯ О ДОСТУПЕ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 RentAdmin: http://SERVER_IP/admin/
📡 RentAdmin API: http://SERVER_IP/api/

📋 Проверка логов:
  sudo -u USER pm2 logs
  tail -f /var/log/nginx/access.log
  tail -f /var/log/nginx/error.log
```

---

## 🔄 Обновление проекта

Когда вы внесли изменения в код и запушили их в репозиторий, обновите проект на сервере:

```bash
sudo /tmp/server-deploy.sh update
```

Эта команда сделает то же самое, что и при первом развертывании:
- Создаст бэкап БД
- Обновит код из репозитория (`git pull`)
- Переустановит зависимости
- Пересоберет проекты
- Перезапустит сервисы

**Используйте эту команду каждый раз, когда нужно обновить код на сервере.**

---

## 🔄 Перезапуск сервисов

Если нужно просто перезапустить Nginx и PM2 без обновления кода:

```bash
sudo /tmp/server-deploy.sh restart
```

Эта команда:
- ✅ Перезапустит Nginx
- ✅ Перезапустит все PM2 процессы
- ✅ Покажет статус сервисов

**Время выполнения:** ~5-10 секунд

---

## 🔍 Проверка работы

### Проверка PM2 процессов

```bash
pm2 status
```

Должны быть запущены два процесса:
- `vozmimenya-api` (порт 3003)
- `rentadmin-api` (порт 3001)

### Проверка логов

```bash
# Логи PM2
pm2 logs

# Только VozmiMenja API
pm2 logs vozmimenya-api

# Только RentAdmin API
pm2 logs rentadmin-api

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Проверка Nginx

```bash
# Статус Nginx
sudo systemctl status nginx

# Проверка конфигурации
sudo nginx -t
```

### Тестирование API

```bash
# Проверка RentAdmin API
curl http://localhost/api/health

# Проверка VozmiMenja API (если есть health endpoint)
curl http://localhost:3003/api/health
```

### Доступ через браузер

- **RentAdmin**: `http://YOUR_SERVER_IP/admin/`
- **RentAdmin API**: `http://YOUR_SERVER_IP/api/`

---

## 🛠 Устранение неполадок

### Проблема: "Permission denied (publickey)" при git clone

**Решение:**

Если репозиторий приватный, настройте SSH ключ:

```bash
# Создайте SSH ключ
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Добавьте ключ на GitHub
cat ~/.ssh/id_rsa.pub
# Скопируйте и добавьте в Settings > SSH keys на GitHub

# Или используйте токен доступа
GIT_REPO="https://TOKEN@github.com/username/repo.git"
```

### Проблема: PM2 процессы не запускаются

**Проверка:**

```bash
# Проверьте логи PM2
pm2 logs

# Проверьте, собрались ли проекты
ls -la /var/www/vozmimenya/server/dist
ls -la /var/www/vozmimenya/rentadmin/backend/dist
```

**Решение:**

```bash
# Пересоберите проекты вручную
cd /var/www/vozmimenya/server
npm run build

cd /var/www/vozmimenya/rentadmin/backend
npm run build

# Перезапустите PM2
pm2 restart ecosystem.config.js
```

### Проблема: Nginx показывает 502 Bad Gateway

**Причины:**
- PM2 процессы не запущены
- Неправильные порты в конфигурации

**Проверка:**

```bash
# Проверьте PM2
pm2 status

# Проверьте, слушают ли процессы порты
ss -tlnp | grep -E "3001|3003"

# Проверьте конфигурацию Nginx
sudo nginx -t
```

**Решение:**

```bash
# Перезапустите PM2
pm2 restart all

# Перезапустите Nginx
sudo systemctl restart nginx
```

### Проблема: "npm ERR! Cannot find module"

**Решение:**

```bash
cd /var/www/vozmimenya

# Удалите node_modules и переустановите
rm -rf server/node_modules
rm -rf rentadmin/backend/node_modules

# Запустите update снова
sudo /tmp/server-deploy.sh update
```

### Проблема: База данных не работает

**Проверка бэкапов:**

```bash
# Посмотрите доступные бэкапы
ls -lh /var/www/vozmimenya/backups/

# Восстановите из бэкапа
cp /var/www/vozmimenya/backups/rentadmin-db-YYYYMMDD-HHMMSS.sqlite3 \
   /var/www/vozmimenya/rentadmin/backend/database.sqlite3

# Перезапустите
pm2 restart rentadmin-api
```

### Проблема: Недостаточно места на диске

**Проверка:**

```bash
df -h
```

**Очистка:**

```bash
# Очистить старые логи PM2
pm2 flush

# Очистить старые бэкапы (старше 7 дней)
find /var/www/vozmimenya/backups/ -mtime +7 -delete

# Очистить npm кэш
npm cache clean --force
```

---

## 📚 Дополнительная информация

### Структура директорий

```
/var/www/vozmimenya/
├── server/                      # VozmiMenja API
│   ├── dist/                    # Скомпилированный код
│   ├── logs/                    # Логи PM2
│   └── database.sqlite          # База данных
├── client/                      # VozmiMenja Frontend (для dev)
├── rentadmin/                   # RentAdmin субмодуль
│   ├── backend/
│   │   ├── dist/               # Скомпилированный код
│   │   ├── logs/               # Логи PM2
│   │   └── database.sqlite3    # База данных
│   └── frontend/
│       └── dist/               # Собранный frontend
├── logs/                        # Общие логи
├── backups/                     # Бэкапы БД
└── ecosystem.config.js          # Конфигурация PM2
```

### Полезные команды

```bash
# PM2
pm2 list                         # Список процессов
pm2 logs                         # Все логи
pm2 restart all                  # Перезапустить все
pm2 stop all                     # Остановить все
pm2 delete all                   # Удалить все процессы

# Nginx
sudo systemctl status nginx      # Статус
sudo systemctl restart nginx     # Перезапуск
sudo nginx -t                    # Проверка конфигурации
sudo tail -f /var/log/nginx/error.log  # Логи ошибок

# Система
df -h                            # Место на диске
free -h                          # Память
top                              # Процессы
htop                            # Продвинутый top
```

### Автоматизация обновлений

Можно настроить cron для автоматического обновления:

```bash
# Отредактируйте crontab
sudo crontab -e

# Добавьте строку (обновление каждый день в 3:00 ночи)
0 3 * * * /tmp/server-deploy.sh update >> /var/log/deploy.log 2>&1
```

---

## 🆘 Поддержка

Если возникли проблемы:

1. Проверьте логи: `pm2 logs` и `/var/log/nginx/error.log`
2. Проверьте статус: `pm2 status` и `sudo systemctl status nginx`
3. Попробуйте перезапустить: `sudo /tmp/server-deploy.sh restart`
4. Попробуйте полное обновление: `sudo /tmp/server-deploy.sh update`

---

## ✅ Чеклист развертывания

- [ ] Сервер соответствует минимальным требованиям
- [ ] Есть SSH доступ и sudo права
- [ ] Скрипт загружен на сервер
- [ ] В скрипте указан правильный GIT_REPO
- [ ] Скрипт сделан исполняемым (`chmod +x`)
- [ ] Выполнена команда `install`
- [ ] Выполнена команда `update`
- [ ] PM2 процессы запущены (`pm2 status`)
- [ ] Nginx работает (`systemctl status nginx`)
- [ ] Приложение доступно через браузер
- [ ] Логи не показывают ошибок

---

**Готово! 🎉 Ваш проект развернут на сервере.**
