# Быстрая инструкция: GitHub Pages + API на сервере

## Архитектура
- **Фронтенд**: vozmimenya.ru (GitHub Pages)
- **API**: api.vozmimenya.ru (Cloud.ru сервер 87.242.103.146)

---

## Шаг 1: Настройте DNS на Рег.ру

1. Войдите на https://www.reg.ru
2. Домены → vozmimenya.ru → Управление зоной
3. Добавьте записи:

### Для фронтенда (GitHub Pages):
```
Тип: A
Субдомен: @
IP: 185.199.108.153

Тип: A
Субдомен: @
IP: 185.199.109.153

Тип: A
Субдомен: @
IP: 185.199.110.153

Тип: A
Субдомен: @
IP: 185.199.111.153

Тип: CNAME
Субдомен: www
Значение: YOUR_GITHUB_USERNAME.github.io.
```

### Для API (ваш сервер):
```
Тип: A
Субдомен: api
IP: 87.242.103.146
```

4. Сохраните и подождите 15-30 минут

---

## Шаг 2: Создайте GitHub репозиторий

```bash
cd /home/maxim/VozmiMenja

# Инициализировать git
git init
git add .
git commit -m "Initial commit: VozmiMenya rental platform"

# Создайте репозиторий на https://github.com/new (назовите VozmiMenja)

# Добавьте remote и запушьте
git remote add origin https://github.com/YOUR_USERNAME/VozmiMenja.git
git branch -M main
git push -u origin main
```

---

## Шаг 3: Настройте GitHub Pages

1. Перейдите в Settings → Pages
2. Source: выберите **GitHub Actions**
3. Custom domain: введите **vozmimenya.ru**
4. Нажмите Save
5. Дождитесь проверки DNS (зелёная галочка)
6. Включите **Enforce HTTPS**

---

## Шаг 4: Деплой API на сервер

```bash
# Подключитесь к серверу
ssh root@87.242.103.146

# Создайте директорию
mkdir -p /var/www/vozmimenya/server
cd /var/www/vozmimenya

# Клонируйте репозиторий (или скопируйте файлы)
git clone https://github.com/YOUR_USERNAME/VozmiMenja.git .

# Установите зависимости
cd server
npm install
npm run build

# Скопируйте БД и изображения с локального компьютера
# (на локальном компьютере выполните:)
scp /home/maxim/VozmiMenja/server/database.sqlite user1@87.242.103.146:/var/www/vozmimenya/server/
scp -r /home/maxim/VozmiMenja/server/uploads user1@87.242.103.146:/var/www/vozmimenya/server/

# Скопируйте .env.production в .env
cp .env.production .env

# Создайте директорию для логов
mkdir -p logs

# Запустите через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Шаг 5: Настройте nginx для API

```bash
# Скопируйте конфигурацию
sudo cp /var/www/vozmimenya/nginx/vozmimenya-api.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/vozmimenya-api.conf /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t
```

---

## Шаг 6: Получите SSL для API

```bash
# Остановите nginx
sudo systemctl stop nginx

# Получите сертификат для api.vozmimenya.ru
sudo certbot certonly --standalone -d api.vozmimenya.ru

# Запустите nginx
sudo systemctl start nginx
sudo systemctl status nginx
```

---

## Проверка

1. **Фронтенд**: https://vozmimenya.ru (через несколько минут после деплоя)
2. **API**: https://api.vozmimenya.ru/api/equipment
3. **GitHub Actions**: https://github.com/YOUR_USERNAME/VozmiMenja/actions

---

## Обновление в будущем

### Обновить фронтенд:
```bash
git add .
git commit -m "Update frontend"
git push origin main
# GitHub Actions автоматически задеплоит
```

### Обновить API:
```bash
# На сервере
cd /var/www/vozmimenya
git pull
cd server
npm install
npm run build
pm2 restart vozmimenya-server
```

---

## Важные URL

- Фронтенд: https://vozmimenya.ru
- API: https://api.vozmimenya.ru/api
- Админка: https://vozmimenya.ru/admin/login
- GitHub Actions: https://github.com/YOUR_USERNAME/VozmiMenja/actions
