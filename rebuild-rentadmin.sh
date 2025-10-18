#!/bin/bash

# Полная переустановка RentAdmin с чистой БД
# ВНИМАНИЕ: Удаляет ВСЕ данные из БД!
# Использование: ./rebuild-rentadmin.sh

set -e

echo "🔥 ПОЛНАЯ ПЕРЕУСТАНОВКА RentAdmin"
echo "⚠️  ВНИМАНИЕ: Все данные БД будут удалены!"
read -p "Продолжить? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Отменено"
    exit 0
fi

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd rentadmin/backend

# 1. Остановить PM2
echo -e "${YELLOW}🛑 Остановка PM2...${NC}"
pm2 delete rentadmin-api 2>/dev/null || echo "Процесс не был запущен"

# 2. Удалить ВСЕ файлы БД
echo -e "${YELLOW}🗑️  Удаление ВСЕХ файлов БД...${NC}"
rm -f *.sqlite*
echo -e "${GREEN}✅ Все БД удалены${NC}"

# 3. Удалить dist и node_modules
echo -e "${YELLOW}🗑️  Очистка dist и node_modules...${NC}"
rm -rf dist
rm -rf node_modules

# 4. Установка зависимостей
echo -e "${YELLOW}📦 Установка зависимостей...${NC}"
npm install
npm install --save-dev @types/jsonwebtoken @types/cors

# 5. Создание НОВОЙ БД
echo -e "${YELLOW}📊 Создание новой БД...${NC}"
touch database.sqlite3

# 6. Запуск миграций
echo -e "${YELLOW}🔄 Запуск миграций...${NC}"
NODE_ENV=production npx knex migrate:latest

# 7. Проверка таблиц
echo -e "${YELLOW}🔍 Проверка таблиц...${NC}"
TABLES=$(sqlite3 database.sqlite3 ".tables")
echo -e "${GREEN}Созданные таблицы:${NC}"
sqlite3 database.sqlite3 ".tables"

if [[ $TABLES != *"equipment"* ]] || [[ $TABLES != *"rentals"* ]]; then
    echo -e "${RED}❌ Таблицы не созданы!${NC}"
    exit 1
fi

# 8. Сборка проекта
echo -e "${YELLOW}📦 Сборка TypeScript...${NC}"
npm run build

# 9. Запуск PM2
echo -e "${YELLOW}🚀 Запуск PM2...${NC}"
NODE_ENV=production pm2 start dist/server.js --name rentadmin-api --update-env
pm2 save

# 10. Проверка
echo -e "${YELLOW}📊 Статус PM2:${NC}"
pm2 list

echo ""
echo -e "${GREEN}✅✅✅ ПЕРЕУСТАНОВКА ЗАВЕРШЕНА!${NC}"
echo -e "${YELLOW}📝 Проверьте логи: pm2 logs rentadmin-api${NC}"
echo -e "${YELLOW}🌐 API должен работать на http://localhost:3001${NC}"
