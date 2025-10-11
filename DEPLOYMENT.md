# Инструкция по деплою VozmiMenya

## Архитектура

- **Фронтенд (клиент)**: GitHub Pages с автоматическим деплоем
  - Домен: vozmimenya.ru (Custom Domain в GitHub Pages)
  - SSL: автоматически от GitHub
- **Бэкенд API**: Cloud.ru (87.242.103.146) с nginx и PM2
  - Поддомен: api.vozmimenya.ru
  - SSL: Let's Encrypt
- **Домен**: куплен на Рег.ру

---

## Часть 1: Деплой бэкенда на Cloud.ru

### 1.1 Подключение к серверу

```bash
ssh root@87.242.103.146
```

### 1.2 Установка необходимого ПО (если ещё не установлено)

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Установка PM2 глобально
sudo npm install -g pm2

# Установка nginx (если ещё не установлен)
sudo apt install -y nginx

# Установка certbot для SSL сертификатов
sudo apt install -y certbot python3-certbot-nginx
```

### 1.3 Создание директории для проекта

```bash
# Создать директорию для проекта
sudo mkdir -p /var/www/vozmimenya
sudo chown -R $USER:$USER /var/www/vozmimenya
cd /var/www/vozmimenya
```

### 1.4 Клонирование и настройка проекта

```bash
# Клонировать репозиторий (замените на ваш URL)
git clone https://github.com/YOUR_USERNAME/VozmiMenja.git .

# Или загрузить файлы через SCP с локального компьютера:
# scp -r /home/maxim/VozmiMenja/server root@87.242.103.146:/var/www/vozmimenya/

# Перейти в директорию сервера
cd server

# Установить зависимости
npm install

# Скопировать production env файл
cp .env.production .env

# Отредактировать .env файл (проверить настройки)
nano .env
```

### 1.5 Сборка и запуск бэкенда

```bash
# Собрать TypeScript в JavaScript
npm run build

# Создать директорию для логов
mkdir -p logs

# База данных и изображения уже есть в git
# Если нужно пересоздать БД, запустите:
# npm run seed

# Запустить сервер через PM2
pm2 start ecosystem.config.js

# Сохранить конфигурацию PM2 для автозапуска
pm2 save
pm2 startup

# Проверить статус
pm2 status
pm2 logs vozmimenya-server
```

### 1.6 Настройка nginx

```bash
# Скопировать конфигурацию nginx
sudo cp /var/www/vozmimenya/nginx/vozmimenya.conf /etc/nginx/sites-available/vozmimenya.conf

# Отредактировать конфигурацию (если нужно)
sudo nano /etc/nginx/sites-available/vozmimenya.conf

# Создать символическую ссылку
sudo ln -s /etc/nginx/sites-available/vozmimenya.conf /etc/nginx/sites-enabled/

# Проверить конфигурацию nginx
sudo nginx -t

# Перезапустить nginx
sudo systemctl restart nginx
```

### 1.7 Настройка SSL сертификата (Let's Encrypt)

```bash
# Получить SSL сертификат для домена
sudo certbot --nginx -d vozmimenya.ru -d www.vozmimenya.ru

# Certbot автоматически настроит nginx для HTTPS
# Сертификат будет автоматически обновляться

# Проверить автообновление
sudo certbot renew --dry-run
```

### 1.8 Настройка firewall (если нужно)

```bash
# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # SSH
sudo ufw enable
sudo ufw status
```

### 1.9 Проверка работы бэкенда

```bash
# Проверить, что API отвечает
curl http://localhost:3003/api/equipment

# Проверить через домен (после настройки DNS)
curl https://vozmimenya.ru/api/equipment
```

---

## Часть 2: Деплой фронтенда на сервер

### 2.1 Сборка фронтенда локально

```bash
# На локальном компьютере
cd /home/maxim/VozmiMenja/client

# Собрать production версию
npm run build

# Проверить, что создалась папка dist
ls -la dist/
```

### 2.2 Копирование фронтенда на сервер

```bash
# Скопировать собранный фронтенд на сервер
scp -r dist/* root@87.242.103.146:/var/www/vozmimenya/client/dist/

# Или через rsync (рекомендуется)
rsync -avz --delete dist/ root@87.242.103.146:/var/www/vozmimenya/client/dist/
```

### 2.3 Альтернатива: Собрать на сервере

Если не хотите собирать локально, можете собрать прямо на сервере:

```bash
# На сервере
cd /var/www/vozmimenya/client
npm install
npm run build

# Файлы окажутся в /var/www/vozmimenya/client/dist/
```

---

## Часть 3: Настройка DNS на Рег.ру

1. Войдите в личный кабинет на https://www.reg.ru
2. Перейдите в раздел **Домены** → выберите **vozmimenya.ru**
3. Нажмите **Управление зоной** или **Редактировать зону**
4. Удалите все существующие A-записи для @ (если есть)
5. Добавьте следующие записи:

**Для основного домена (vozmimenya.ru):**
```
Тип записи: A
Субдомен: @ (или оставьте пустым)
IP-адрес: 87.242.103.146
TTL: 3600
```

**Для www поддомена:**
```
Тип записи: A
Субдомен: www
IP-адрес: 87.242.103.146
TTL: 3600
```

**ВАЖНО:** Мы указываем IP вашего сервера Cloud.ru (87.242.103.146), а НЕ GitHub Pages IP!

6. Сохраните изменения
7. Подождите распространения DNS (обычно 15-30 минут, максимум 24 часа)

**Проверка DNS:**
```bash
# На локальном компьютере или на сервере проверьте:
nslookup vozmimenya.ru
# Должен показать: 87.242.103.146

ping vozmimenya.ru
# Должен пинговать 87.242.103.146

# Или онлайн: https://www.whatsmydns.net/#A/vozmimenya.ru
```

#### Шаг 3: Удалить файл CNAME (не нужен для нашей архитектуры)

Поскольку мы используем ваш сервер Cloud.ru, а не GitHub Pages для домена, удалите CNAME:

```bash
rm /home/maxim/VozmiMenja/client/public/CNAME
```

GitHub Pages будет доступен по адресу `YOUR_USERNAME.github.io/VozmiMenja`, но основной сайт будет на `vozmimenya.ru` через ваш сервер.

#### Шаг 4: НЕ настраивайте Custom Domain в GitHub Pages

**ВАЖНО:** Оставьте поле Custom Domain в GitHub Pages пустым! Мы используем другую архитектуру - фронтенд будет собираться на GitHub Pages, но основной домен будет на вашем сервере через nginx.

### 2.5 Обновить vite.config.ts для кастомного домена

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/',  // Для кастомного домена используем корень
  // ... остальная конфигурация
})
```

### 2.6 Закоммитить изменения и запушить

```bash
cd /home/maxim/VozmiMenja

# Добавить изменения
git add .
git commit -m "Configure deployment for GitHub Pages and custom domain"
git push origin main
```

GitHub Actions автоматически запустит деплой. Проверить статус можно в разделе `Actions` вашего репозитория.

---

## Часть 3: Финальная настройка nginx на сервере

### 3.1 Обновить nginx конфигурацию

Поскольку фронтенд теперь на GitHub Pages (vozmimenya.ru), а бэкенд на Cloud.ru, нужно обновить nginx:

```bash
sudo nano /etc/nginx/sites-available/vozmimenya.conf
```

**Вариант 1: Если фронтенд на GitHub Pages использует основной домен (vozmimenya.ru)**

В этом случае API должен быть на поддомене:

```nginx
# Конфигурация для api.vozmimenya.ru
server {
    listen 80;
    server_name api.vozmimenya.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.vozmimenya.ru;

    ssl_certificate /etc/letsencrypt/live/api.vozmimenya.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.vozmimenya.ru/privkey.pem;

    location / {
        proxy_pass http://localhost:3003/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        proxy_pass http://localhost:3003/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Тогда нужно обновить API URL:
- В `client/.env.production`: `VITE_API_URL=https://api.vozmimenya.ru`
- В `server/.env.production`: `FRONTEND_URL=https://vozmimenya.ru`

**Вариант 2: Если используете www.vozmimenya.ru для фронтенда**

API на основном домене vozmimenya.ru (рекомендуется):

```nginx
server {
    listen 80;
    server_name vozmimenya.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vozmimenya.ru;

    ssl_certificate /etc/letsencrypt/live/vozmimenya.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vozmimenya.ru/privkey.pem;

    # API и uploads
    location /api {
        proxy_pass http://localhost:3003/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header 'Access-Control-Allow-Origin' 'https://www.vozmimenya.ru' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type' always;
    }

    location /uploads {
        proxy_pass http://localhost:3003/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header 'Access-Control-Allow-Origin' 'https://www.vozmimenya.ru' always;
    }
}
```

Тогда URL будут:
- Фронтенд: `https://www.vozmimenya.ru`
- API: `https://vozmimenya.ru/api`
- В GitHub Pages Custom domain: `www.vozmimenya.ru`

### 3.2 Получить SSL для API (если используется поддомен)

```bash
# Только если используете api.vozmimenya.ru
sudo certbot --nginx -d api.vozmimenya.ru
```

### 3.3 Перезапустить nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Часть 4: Проверка и тестирование

### 4.1 Проверка бэкенда

```bash
# Проверить статус PM2
pm2 status

# Проверить логи
pm2 logs vozmimenya-server --lines 50

# Тест API
curl https://vozmimenya.ru/api/equipment
# или
curl https://api.vozmimenya.ru/equipment
```

### 4.2 Проверка фронтенда

Откройте в браузере:
- https://vozmimenya.ru (или https://www.vozmimenya.ru)

Проверьте:
- ✅ Главная страница загружается
- ✅ Оборудование отображается (данные с API)
- ✅ Форма бронирования работает
- ✅ Форма обратной связи отправляет в Telegram
- ✅ SSL сертификат активен (замок в адресной строке)

### 4.3 Проверка Telegram уведомлений

1. Отправьте `/start` боту в Telegram (ID: 8274899003)
2. Заполните форму на сайте
3. Проверьте, что уведомление пришло в Telegram

---

## Часть 5: Обновление проекта

### 5.1 Обновление фронтенда

Фронтенд обновляется автоматически при push в GitHub:

```bash
cd /home/maxim/VozmiMenja

# Внести изменения в код
# ...

# Закоммитить и запушить
git add .
git commit -m "Update: описание изменений"
git push origin main
```

GitHub Actions автоматически соберёт и задеплоит новую версию (~2-3 минуты).

### 5.2 Обновление бэкенда

```bash
# На сервере Cloud.ru
ssh root@87.242.103.146
cd /var/www/vozmimenya

# Получить последние изменения
git pull origin main

# Перейти в server
cd server

# Установить новые зависимости (если есть)
npm install

# Пересобрать
npm run build

# Перезапустить PM2
pm2 restart vozmimenya-server

# Проверить логи
pm2 logs vozmimenya-server
```

### 5.3 Обновление БД (если нужно)

```bash
cd /var/www/vozmimenya/server

# Пересоздать БД (ВНИМАНИЕ: удалит все данные!)
npm run reset-db
npm run seed

# Или запустить миграции (если есть)
npm run migrate
```

---

## Часть 6: Мониторинг и обслуживание

### 6.1 Полезные команды PM2

```bash
pm2 status                    # Статус процессов
pm2 logs vozmimenya-server    # Просмотр логов
pm2 restart vozmimenya-server # Перезапуск
pm2 stop vozmimenya-server    # Остановка
pm2 start vozmimenya-server   # Запуск
pm2 monit                     # Мониторинг в реальном времени
```

### 6.2 Просмотр логов nginx

```bash
sudo tail -f /var/log/nginx/vozmimenya-access.log
sudo tail -f /var/log/nginx/vozmimenya-error.log
```

### 6.3 Бэкап БД

```bash
# Создать бэкап
cd /var/www/vozmimenya/server
cp database.sqlite database.backup-$(date +%Y%m%d).sqlite

# Автоматический ежедневный бэкап (добавить в crontab)
crontab -e
# Добавить строку:
# 0 3 * * * cp /var/www/vozmimenya/server/database.sqlite /var/www/vozmimenya/backups/db-$(date +\%Y\%m\%d).sqlite
```

---

## Часть 7: Решение проблем

### Проблема: API не отвечает

```bash
# Проверить статус PM2
pm2 status

# Проверить логи
pm2 logs vozmimenya-server --err

# Проверить порт
sudo netstat -tulpn | grep 3003
```

### Проблема: 502 Bad Gateway

```bash
# Проверить, запущен ли бэкенд
pm2 status

# Перезапустить бэкенд
pm2 restart vozmimenya-server

# Проверить конфигурацию nginx
sudo nginx -t
```

### Проблема: CORS ошибки

Убедитесь, что в `server/.env.production` правильно указан `FRONTEND_URL`:
```
FRONTEND_URL=https://www.vozmimenya.ru
```

### Проблема: SSL сертификат не работает

```bash
# Обновить сертификат
sudo certbot renew --force-renewal

# Перезапустить nginx
sudo systemctl restart nginx
```

---

## Итоговая архитектура

```
┌─────────────────────────────────────────────┐
│  Пользователь                                │
│  браузер: https://vozmimenya.ru              │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
┌─────────────────┐  ┌─────────────────────────┐
│  GitHub Pages   │  │  Cloud.ru               │
│  Фронтенд       │  │  87.242.103.146         │
│  React SPA      │  │                         │
└─────────────────┘  │  ┌──────────────────┐   │
                     │  │  nginx (443)     │   │
                     │  │  SSL/HTTPS       │   │
                     │  └────────┬─────────┘   │
                     │           │             │
                     │  ┌────────▼─────────┐   │
                     │  │  Node.js (3003)  │   │
                     │  │  PM2 + Express   │   │
                     │  └────────┬─────────┘   │
                     │           │             │
                     │  ┌────────▼─────────┐   │
                     │  │  SQLite DB       │   │
                     │  └──────────────────┘   │
                     │                         │
                     │  ┌──────────────────┐   │
                     │  │  Telegram Bot    │◄──┤
                     │  └──────────────────┘   │
                     └─────────────────────────┘
```

---

## Контакты и поддержка

- **Домен**: vozmimenya.ru
- **Сервер**: 87.242.103.146
- **Email**: alkhimovmv@yandex.ru
- **Telegram Bot**: @your_bot_name

Проект готов к деплою! 🚀
