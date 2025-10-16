# 🚀 Руководство по развертыванию на сервере Cloud.ru

Это руководство описывает процесс развертывания проектов **VozmiMenja** и **RentAdmin** на сервере Cloud.ru с доменами:
- `https://vozmimenya.ru` - основной сайт VozmiMenja
- `https://schedule-admin.vozmimenya.ru` - панель администратора RentAdmin

## 📋 Оглавление

1. [Требования](#требования)
2. [Подготовка сервера](#подготовка-сервера)
3. [Первоначальное развертывание](#первоначальное-развертывание)
4. [Обновление проекта](#обновление-проекта)
5. [Управление сервисами](#управление-сервисами)
6. [Устранение неполадок](#устранение-неполадок)

---

## 📦 Требования

### На сервере должно быть:
- Ubuntu 20.04 LTS или выше
- Минимум 2 GB RAM
- Минимум 20 GB свободного места на диске
- Открытые порты: 22 (SSH), 80 (HTTP), 443 (HTTPS)

### DNS настройки:
Убедитесь, что DNS записи указывают на IP вашего сервера:
```
vozmimenya.ru                    -> A record -> IP сервера
www.vozmimenya.ru                -> A record -> IP сервера
schedule-admin.vozmimenya.ru     -> A record -> IP сервера
```

Проверить можно командой:
```bash
dig vozmimenya.ru +short
dig schedule-admin.vozmimenya.ru +short
```

---

## 🔧 Подготовка сервера

### 1. Подключитесь к серверу через SSH

```bash
ssh user@your-server-ip
```

### 2. Обновите систему

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Клонируйте проект

```bash
# Создайте директорию для проектов
sudo mkdir -p /var/www

# Клонируйте основной проект VozmiMenja
cd /var/www
sudo git clone https://github.com/your-username/vozmimenya.git vozmimenya

# Установите права доступа
sudo chown -R $USER:$USER /var/www/vozmimenya
```

### 4. Настройте переменные окружения

Создайте файлы `.env` для каждого проекта:

#### VozmiMenja Server (.env)
```bash
cd /var/www/vozmimenya/server
nano .env
```

Добавьте:
```env
NODE_ENV=production
PORT=3003
DATABASE_URL=./database.sqlite
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

#### RentAdmin Backend (.env)
```bash
cd /var/www/vozmimenya/rentadmin/backend
nano .env
```

Добавьте:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=./database.sqlite3
```

---

## 🚀 Первоначальное развертывание

После клонирования проекта и настройки `.env` файлов запустите скрипт первоначального развертывания:

```bash
cd /var/www/vozmimenya
sudo ./server-setup.sh
```

### Что делает скрипт `server-setup.sh`:

1. ✅ Устанавливает системные зависимости (Node.js, Nginx, Certbot)
2. ✅ Устанавливает и настраивает PM2 для управления процессами
3. ✅ Создает необходимые директории
4. ✅ Устанавливает зависимости проектов (npm install)
5. ✅ Собирает все проекты (npm run build)
6. ✅ Настраивает Nginx с конфигурациями для доменов
7. ✅ Устанавливает SSL сертификаты через Let's Encrypt
8. ✅ Запускает приложения через PM2
9. ✅ Настраивает файрвол (UFW)

### Время выполнения:
Около 10-15 минут в зависимости от скорости интернета.

### После завершения:

Проверьте, что сайты доступны:
- https://vozmimenya.ru
- https://schedule-admin.vozmimenya.ru

Проверьте статус приложений:
```bash
pm2 status
```

Вы должны увидеть два запущенных приложения:
- `vozmimenya-api` (порт 3003)
- `rentadmin-api` (порт 3001)

---

## 🔄 Обновление проекта

Когда вы внесли изменения в код и хотите обновить проект на сервере **БЕЗ ПОТЕРИ ДАННЫХ** (базы данных, загруженные файлы):

```bash
cd /var/www/vozmimenya
sudo ./server-update.sh
```

### Что делает скрипт `server-update.sh`:

1. ✅ **Создает бэкапы** баз данных и загруженных файлов
2. ✅ Обновляет код из Git репозитория (`git pull`)
3. ✅ Обновляет зависимости (`npm install`)
4. ✅ Пересобирает проекты (`npm run build`)
5. ✅ Обновляет статические файлы фронтенда
6. ✅ Перезапускает PM2 приложения **без даунтайма**
7. ✅ Очищает старые логи и бэкапы

### Время выполнения:
Около 3-5 минут.

### Автоматические бэкапы:

Скрипт создает бэкапы перед каждым обновлением:
```
/var/www/vozmimenya/backups/
├── vozmimenya-db-20250116-143022.sqlite
├── rentadmin-db-20250116-143022.sqlite3
└── vozmimenya-uploads-20250116-143022.tar.gz
```

Старые бэкапы (>30 дней) удаляются автоматически.

---

## 🎛️ Управление сервисами

### PM2 команды

**Просмотр статуса:**
```bash
pm2 status
```

**Просмотр логов:**
```bash
# Все логи
pm2 logs

# Логи конкретного приложения
pm2 logs vozmimenya-api
pm2 logs rentadmin-api

# Последние 100 строк
pm2 logs --lines 100
```

**Перезапуск приложений:**
```bash
# Перезапуск всех приложений
pm2 restart all

# Перезапуск конкретного приложения
pm2 restart vozmimenya-api
pm2 restart rentadmin-api
```

**Остановка/запуск:**
```bash
pm2 stop all
pm2 start all
pm2 delete all  # Полное удаление из PM2
```

**Мониторинг ресурсов:**
```bash
pm2 monit
```

### Nginx команды

**Проверка конфигурации:**
```bash
sudo nginx -t
```

**Перезапуск Nginx:**
```bash
sudo systemctl restart nginx
sudo systemctl reload nginx   # Без разрыва соединений
```

**Статус Nginx:**
```bash
sudo systemctl status nginx
```

**Логи Nginx:**
```bash
# Access логи
sudo tail -f /var/log/nginx/vozmimenya-access.log
sudo tail -f /var/log/nginx/rentadmin-access.log

# Error логи
sudo tail -f /var/log/nginx/vozmimenya-error.log
sudo tail -f /var/log/nginx/rentadmin-error.log
```

### SSL сертификаты

**Проверка срока действия сертификатов:**
```bash
sudo certbot certificates
```

**Ручное обновление сертификатов:**
```bash
sudo certbot renew
```

**Автообновление настроено через systemd timer:**
```bash
sudo systemctl status certbot.timer
```

---

## 🔍 Устранение неполадок

### Проблема: Сайт не открывается

**1. Проверьте статус PM2:**
```bash
pm2 status
```

Если приложение не запущено:
```bash
pm2 restart all
```

**2. Проверьте логи приложения:**
```bash
pm2 logs --err --lines 50
```

**3. Проверьте Nginx:**
```bash
sudo systemctl status nginx
sudo nginx -t
```

**4. Проверьте порты:**
```bash
sudo ss -tlnp | grep -E ':(80|443|3001|3003)'
```

### Проблема: SSL сертификат не работает

**Проверьте сертификаты:**
```bash
sudo certbot certificates
```

**Обновите сертификаты:**
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

### Проблема: База данных повреждена

**Восстановите из бэкапа:**
```bash
# Остановите приложения
pm2 stop all

# Восстановите БД из последнего бэкапа
cd /var/www/vozmimenya/backups
ls -lt *.sqlite*  # Посмотрите список бэкапов

# Восстановите нужный бэкап
cp vozmimenya-db-TIMESTAMP.sqlite ../server/database.sqlite
cp rentadmin-db-TIMESTAMP.sqlite3 ../rentadmin/backend/database.sqlite3

# Запустите приложения
pm2 restart all
```

### Проблема: Недостаточно памяти

**Проверьте использование памяти:**
```bash
free -h
pm2 monit
```

**Увеличьте swap (если нужно):**
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Проблема: Порты заняты

**Проверьте, какие процессы используют порты:**
```bash
sudo lsof -i :3001
sudo lsof -i :3003
sudo lsof -i :80
sudo lsof -i :443
```

**Убейте процесс (если нужно):**
```bash
sudo kill -9 PID
```

---

## 📊 Мониторинг

### Проверка состояния системы

**Использование диска:**
```bash
df -h
du -sh /var/www/vozmimenya/*
```

**Размер логов:**
```bash
du -sh /var/www/vozmimenya/server/logs
du -sh /var/log/nginx
```

**Размер бэкапов:**
```bash
du -sh /var/www/vozmimenya/backups
```

### Автоматическая очистка

Скрипт обновления автоматически удаляет:
- Логи старше 7 дней
- Бэкапы старше 30 дней

---

## 🔐 Безопасность

### Рекомендации:

1. **Регулярно обновляйте систему:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Настройте файрвол:**
   ```bash
   sudo ufw status
   ```

3. **Измените SSH порт** (опционально):
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Измените Port 22 на другой порт
   sudo systemctl restart sshd
   ```

4. **Используйте SSH ключи** вместо паролей

5. **Регулярно проверяйте логи** на подозрительную активность:
   ```bash
   sudo tail -f /var/log/auth.log
   ```

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи: `pm2 logs`
2. Проверьте статус: `pm2 status` и `sudo systemctl status nginx`
3. Посмотрите этот файл в разделе [Устранение неполадок](#устранение-неполадок)

---

## 📝 Changelog

### Версия 1.0 (2025-01-16)
- Первая версия скриптов развертывания
- Поддержка VozmiMenja и RentAdmin
- Автоматическая установка SSL
- Система бэкапов

---

**Создано с ❤️ для проекта VozmiMenja**
