# Быстрая инструкция по деплою VozmiMenya

## Шаг 1: Настройте DNS на Рег.ру

1. Войдите на https://www.reg.ru
2. Домены → vozmimenya.ru → Управление зоной
3. Добавьте A-записи:

```
Тип: A, Субдомен: @, IP: 87.242.103.146
Тип: A, Субдомен: www, IP: 87.242.103.146
```

4. Проверьте через 15-30 минут:
```bash
ping vozmimenya.ru  # Должен показать 87.242.103.146
```

---

## Шаг 2: Скопируйте БД и изображения на сервер

```bash
# С локального компьютера
scp /home/maxim/VozmiMenja/server/database.sqlite root@87.242.103.146:/var/www/vozmimenya/server/
scp -r /home/maxim/VozmiMenja/server/uploads root@87.242.103.146:/var/www/vozmimenya/server/
```

---

## Шаг 3: Скопируйте nginx конфигурацию

```bash
# С локального компьютера
scp /home/maxim/VozmiMenja/nginx/vozmimenya.conf root@87.242.103.146:/tmp/

# На сервере
sudo cp /tmp/vozmimenya.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/vozmimenya.conf /etc/nginx/sites-enabled/
sudo nginx -t
```

---

## Шаг 4: Получите SSL сертификат

```bash
# На сервере (остановить nginx на время получения сертификата)
sudo systemctl stop nginx
sudo certbot certonly --standalone -d vozmimenya.ru -d www.vozmimenya.ru
sudo systemctl start nginx
```

---

## Шаг 5: Соберите и скопируйте фронтенд

```bash
# На локальном компьютере
cd /home/maxim/VozmiMenja/client
npm run build

# Создать директорию на сервере
ssh root@87.242.103.146 "mkdir -p /var/www/vozmimenya/client/dist"

# Скопировать собранные файлы
rsync -avz --delete dist/ root@87.242.103.146:/var/www/vozmimenya/client/dist/
```

---

## Шаг 6: Перезапустите nginx

```bash
# На сервере
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

## Проверка

1. **API**: https://vozmimenya.ru/api/equipment
2. **Фронтенд**: https://vozmimenya.ru
3. **Логи PM2**: `pm2 logs vozmimenya-server`
4. **Логи nginx**: `sudo tail -f /var/log/nginx/vozmimenya-error.log`

---

## Обновление проекта в будущем

### Обновить бэкенд:
```bash
cd /var/www/vozmimenya/server
git pull
npm install
npm run build
pm2 restart vozmimenya-server
```

### Обновить фронтенд:
```bash
# Локально
cd /home/maxim/VozmiMenja/client
npm run build
rsync -avz --delete dist/ root@87.242.103.146:/var/www/vozmimenya/client/dist/
```

---

## Текущие URL

- Фронтенд: https://vozmimenya.ru
- API: https://vozmimenya.ru/api
- Изображения: https://vozmimenya.ru/uploads
- Админка: https://vozmimenya.ru/admin/login
