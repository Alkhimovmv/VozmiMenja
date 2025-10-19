#!/bin/bash

# Скрипт переноса рабочей БД RentAdmin с локального компьютера на сервер
# Использование: ./sync-rentadmin-db.sh

set -e

echo "📦 Перенос БД RentAdmin с локального компьютера на сервер"

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Копируем локальную БД как production БД
echo -e "${YELLOW}📋 Копирование локальной БД...${NC}"
cp rentadmin/backend/dev.sqlite3 rentadmin/backend/database.sqlite3

# 2. Добавляем БД в git (временно убираем из .gitignore)
echo -e "${YELLOW}📝 Добавление БД в git...${NC}"
git add -f rentadmin/backend/database.sqlite3

# 3. Коммитим
echo -e "${YELLOW}💾 Коммит БД...${NC}"
git commit -m "Add RentAdmin database with tables

Рабочая БД с таблицами equipment, rentals, expenses

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Пушим
echo -e "${YELLOW}🚀 Отправка на GitHub...${NC}"
git push

echo -e "${GREEN}✅ БД отправлена на GitHub!${NC}"
echo ""
echo -e "${YELLOW}На сервере выполните:${NC}"
echo "cd /var/www/vozmimenya"
echo "git pull"
echo "cd rentadmin/backend"
echo "pm2 restart rentadmin-api"
echo "pm2 logs rentadmin-api"
