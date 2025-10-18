#!/bin/bash

# Скрипт деплоя RentAdmin на production сервер
# Использование: ./deploy-rentadmin.sh

set -e  # Остановиться при ошибке

echo "🚀 Начинаю деплой RentAdmin..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Установка недостающих типов
echo -e "${YELLOW}📦 Установка TypeScript типов...${NC}"
npm install --save-dev @types/jsonwebtoken @types/cors 2>/dev/null || echo "Типы уже установлены"

# 2. Сборка проекта
echo -e "${YELLOW}📦 Сборка TypeScript...${NC}"
npm run build

# 2. Удаление старых БД (кроме production)
echo -e "${YELLOW}🗑️  Удаление временных БД...${NC}"
rm -f dev.sqlite3
rm -f test.sqlite3
echo -e "${GREEN}✅ Временные БД удалены${NC}"

# 3. Проверка наличия миграций
echo -e "${YELLOW}🔍 Проверка миграций...${NC}"
if [ ! -d "src/migrations" ]; then
    echo -e "${RED}❌ Папка миграций не найдена!${NC}"
    exit 1
fi

# 4. Запуск миграций
echo -e "${YELLOW}📊 Запуск миграций БД...${NC}"
NODE_ENV=production npx knex migrate:latest

# 5. Проверка таблиц
echo -e "${YELLOW}🔍 Проверка таблиц БД...${NC}"
TABLES=$(sqlite3 database.sqlite3 ".tables")
if [[ $TABLES == *"equipment"* ]] && [[ $TABLES == *"rentals"* ]]; then
    echo -e "${GREEN}✅ Таблицы созданы успешно:${NC}"
    sqlite3 database.sqlite3 ".tables"
else
    echo -e "${RED}❌ Таблицы не созданы!${NC}"
    exit 1
fi

# 6. Перезапуск PM2
echo -e "${YELLOW}🔄 Перезапуск PM2...${NC}"
pm2 delete rentadmin-api 2>/dev/null || echo "Процесс не был запущен"
NODE_ENV=production pm2 start dist/server.js --name rentadmin-api --update-env
pm2 save

# 7. Проверка статуса
echo -e "${YELLOW}📊 Статус PM2:${NC}"
pm2 list

echo -e "${GREEN}✅ Деплой завершён успешно!${NC}"
echo -e "${YELLOW}📝 Проверьте логи: pm2 logs rentadmin-api${NC}"
