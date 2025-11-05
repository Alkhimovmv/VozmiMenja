# Руководство по деплою на продакшен

## Подготовка сервера

### 1. Установка необходимого ПО

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js (v18 или выше)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установка Nginx
sudo apt install -y nginx

# Установка PM2 для управления Node.js процессом
sudo npm install -g pm2

# Установка Certbot для SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Настройка проекта

```bash
# Клонирование репозитория
cd /var/www
sudo git clone <your-repo-url> vozmimenya
cd vozmimenya

# Установка зависимостей
npm install

# Создание .env файла для сервера
cd server
cp .env.example .env
nano .env  # Настроить переменные окружения
```

Пример `.env` для сервера:
```env
NODE_ENV=production
PORT=3002
DATABASE_URL=/var/www/vozmimenya/server/equipment-rental.db
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
FRONTEND_URL=https://vozmimenya.ru
```

### 3. Сборка фронтенда

```bash
cd /var/www/vozmimenya/client
npm run build
```

После сборки статические файлы будут в `/var/www/vozmimenya/client/dist`

### 4. Настройка Nginx

```bash
# Копирование конфигурации
sudo cp /var/www/vozmimenya/nginx.conf /etc/nginx/sites-available/vozmimenya

# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/vozmimenya /etc/nginx/sites-enabled/

# Удаление дефолтного сайта
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### 5. Настройка SSL сертификата

```bash
# Получение SSL сертификата от Let's Encrypt
sudo certbot --nginx -d vozmimenya.ru -d www.vozmimenya.ru

# Certbot автоматически обновит конфигурацию Nginx
# Проверка автообновления сертификата
sudo certbot renew --dry-run
```

### 6. Запуск Backend через PM2

```bash
cd /var/www/vozmimenya/server

# Запуск сервера через PM2
pm2 start npm --name "vozmimenya-server" -- run start

# Сохранение конфигурации PM2
pm2 save

# Настройка автозапуска PM2 при перезагрузке сервера
pm2 startup
# Выполните команду, которую выдаст PM2

# Просмотр логов
pm2 logs vozmimenya-server

# Просмотр статуса
pm2 status
```

## Обновление проекта

### Обновление через Git

```bash
cd /var/www/vozmimenya

# Получение последних изменений
git pull origin main

# Обновление зависимостей (если нужно)
npm install

# Пересборка фронтенда
cd client
npm run build

# Перезапуск backend
cd ..
pm2 restart vozmimenya-server

# Перезагрузка Nginx (если изменилась конфигурация)
sudo nginx -s reload
```

### Автоматическое обновление через GitHub Actions (опционально)

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/vozmimenya
            git pull origin main
            npm install
            cd client
            npm run build
            cd ..
            pm2 restart vozmimenya-server
```

## Мониторинг и логи

### PM2 мониторинг

```bash
# Просмотр статуса
pm2 status

# Просмотр логов
pm2 logs vozmimenya-server

# Мониторинг в реальном времени
pm2 monit

# Просмотр метрик
pm2 show vozmimenya-server
```

### Nginx логи

```bash
# Access log
sudo tail -f /var/log/nginx/vozmimenya_access.log

# Error log
sudo tail -f /var/log/nginx/vozmimenya_error.log
```

## Резервное копирование

### Бэкап базы данных

```bash
#!/bin/bash
# /var/www/vozmimenya/scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/vozmimenya"
DB_PATH="/var/www/vozmimenya/server/equipment-rental.db"

mkdir -p $BACKUP_DIR

# Создание бэкапа
cp $DB_PATH "$BACKUP_DIR/equipment-rental_$DATE.db"

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: equipment-rental_$DATE.db"
```

Добавьте в crontab:
```bash
# Бэкап каждый день в 3:00
0 3 * * * /var/www/vozmimenya/scripts/backup-db.sh
```

### Бэкап загруженных файлов

```bash
#!/bin/bash
# /var/www/vozmimenya/scripts/backup-uploads.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/vozmimenya"
UPLOADS_DIR="/var/www/vozmimenya/server/uploads"

mkdir -p $BACKUP_DIR

# Создание архива
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /var/www/vozmimenya/server uploads

# Удаление старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "uploads_*.tar.gz" -type f -mtime +30 -delete

echo "Uploads backup completed: uploads_$DATE.tar.gz"
```

## Производительность

### Оптимизация Nginx

Добавьте в `/etc/nginx/nginx.conf` (внутри блока http):

```nginx
# Worker процессы
worker_processes auto;
worker_rlimit_nofile 100000;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # Основные настройки
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Размеры буферов
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 8k;

    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;

    # Кэширование открытых файлов
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### Мониторинг системы

Установите htop и iotop для мониторинга:
```bash
sudo apt install htop iotop
```

## Безопасность

### Firewall (UFW)

```bash
# Установка UFW
sudo apt install ufw

# Разрешение SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включение firewall
sudo ufw enable

# Проверка статуса
sudo ufw status
```

### Fail2ban (защита от брутфорса)

```bash
# Установка
sudo apt install fail2ban

# Создание конфигурации для Nginx
sudo nano /etc/fail2ban/jail.local
```

Содержимое `/etc/fail2ban/jail.local`:
```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/vozmimenya_error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/vozmimenya_access.log

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/vozmimenya_access.log
```

```bash
# Перезапуск Fail2ban
sudo systemctl restart fail2ban
```

## Проверка после деплоя

1. **Проверка доступности сайта:**
   ```bash
   curl -I https://vozmimenya.ru
   ```

2. **Проверка API:**
   ```bash
   curl https://vozmimenya.ru/api/health
   ```

3. **Проверка SSL:**
   ```bash
   openssl s_client -connect vozmimenya.ru:443 -servername vozmimenya.ru
   ```

4. **Тест PageSpeed:**
   - [Google PageSpeed Insights](https://pagespeed.web.dev/?url=https://vozmimenya.ru)
   - [GTmetrix](https://gtmetrix.com/)

## Устранение проблем

### Backend не запускается

```bash
# Проверка логов PM2
pm2 logs vozmimenya-server --lines 100

# Проверка портов
sudo netstat -tulpn | grep :3002

# Перезапуск с очисткой
pm2 delete vozmimenya-server
pm2 start npm --name "vozmimenya-server" -- run start
```

### Nginx возвращает 502 Bad Gateway

```bash
# Проверка логов Nginx
sudo tail -n 100 /var/log/nginx/vozmimenya_error.log

# Проверка работы backend
curl http://localhost:3002/health

# Проверка конфигурации Nginx
sudo nginx -t
```

### Изображения не загружаются

```bash
# Проверка прав доступа
sudo chown -R www-data:www-data /var/www/vozmimenya/server/uploads
sudo chmod -R 755 /var/www/vozmimenya/server/uploads
```

## Контакты для поддержки

- Email: alkhimovmv@yandex.ru
- Telegram: @alhimooov
