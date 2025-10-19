#!/bin/bash

# Скрипт исправления БД RentAdmin
# Проблема: knexfile.js ищет production.sqlite3, а она пустая
# Решение: копируем рабочую dev.sqlite3 в production.sqlite3

set -e

echo "🔧 Исправление БД RentAdmin"
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Проверка что мы в правильной директории
if [ ! -f "rentadmin/backend/dev.sqlite3" ]; then
    echo -e "${RED}❌ Файл rentadmin/backend/dev.sqlite3 не найден!${NC}"
    echo "Запустите скрипт из корня проекта VozmiMenja"
    exit 1
fi

cd rentadmin/backend

# 1. Показываем текущее состояние
echo -e "${YELLOW}📊 Текущее состояние БД:${NC}"
echo -n "dev.sqlite3: "
ls -lh dev.sqlite3 | awk '{print $5}'
echo -n "production.sqlite3: "
ls -lh production.sqlite3 | awk '{print $5}'
echo ""

# 2. Копируем рабочую БД
echo -e "${YELLOW}📋 Копирование dev.sqlite3 → production.sqlite3...${NC}"
cp dev.sqlite3 production.sqlite3

# 3. Проверяем таблицы
echo -e "${YELLOW}🔍 Проверка таблиц в production.sqlite3:${NC}"
TABLES=$(sqlite3 production.sqlite3 ".tables")
echo "$TABLES"

if [[ $TABLES == *"equipment"* ]] && [[ $TABLES == *"rentals"* ]]; then
    echo -e "${GREEN}✅ Таблицы найдены!${NC}"
else
    echo -e "${RED}❌ Таблицы не найдены!${NC}"
    exit 1
fi

# 4. Добавляем в git
echo -e "${YELLOW}📝 Добавление production.sqlite3 в git...${NC}"
git add -f production.sqlite3

# 5. Коммит
echo -e "${YELLOW}💾 Коммит БД...${NC}"
git commit -m "Fix: Copy working database to production.sqlite3

RentAdmin was looking for production.sqlite3 but file was empty.
Copied working dev.sqlite3 with all tables.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 6. Пуш
echo -e "${YELLOW}🚀 Отправка на GitHub...${NC}"
git push

echo ""
echo -e "${GREEN}✅✅✅ БД ИСПРАВЛЕНА И ОТПРАВЛЕНА!${NC}"
echo ""
echo -e "${YELLOW}На сервере выполните:${NC}"
echo "cd /var/www/vozmimenya"
echo "git pull"
echo "cd rentadmin/backend"
echo "pm2 restart rentadmin-api"
echo "pm2 logs rentadmin-api"
