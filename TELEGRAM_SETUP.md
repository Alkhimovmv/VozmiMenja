# Настройка Telegram уведомлений

## Проблема
Уведомления о бронированиях не приходят в Telegram.

## Причина
На сервере не настроены переменные окружения для Telegram бота.

## Решение

### 1. Получить токен бота

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot` или `/mybots` если бот уже создан
3. Следуйте инструкциям и получите токен вида: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### 2. Получить Chat ID

**Способ 1: Через специального бота**
1. Найдите в Telegram бота [@userinfobot](https://t.me/userinfobot)
2. Отправьте ему любое сообщение
3. Он пришлет ваш Chat ID (число вида `123456789`)

**Способ 2: Через API**
1. Отправьте любое сообщение вашему боту
2. Откройте: `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
3. Найдите: `"chat":{"id":123456789}`

### 3. Настроить на сервере

```bash
ssh user1@vm-1484f9c3f
cd /var/www/vozmimenya/server
nano .env
```

Добавьте:
```env
TELEGRAM_BOT_TOKEN=ваш_токен_здесь
TELEGRAM_CHAT_ID=ваш_chat_id_здесь
```

### 4. Перезапустить

```bash
pm2 restart vozmimenya-api
pm2 logs vozmimenya-api --lines 20
```

Должно появиться: `✅ Telegram бот инициализирован`

### 5. Тестирование

Создайте бронирование на https://vozmimenya.ru - должно прийти уведомление.
