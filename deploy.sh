#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SERVER_USER="user1"
SERVER_HOST="87.242.103.146"
SERVER_PATH="/var/www/vozmimenya"

# Определить корневую директорию проекта
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Проверка что мы в правильной директории
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${RED}❌ Ошибка: не найден ecosystem.config.js${NC}"
    echo -e "${RED}   Запустите скрипт из корня проекта VozmiMenja${NC}"
    exit 1
fi

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Развёртывание VozmiMenja + RentAdmin на сервер${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""
echo -e "${BLUE}📁 Рабочая директория: ${SCRIPT_DIR}${NC}"
echo ""

# Шаг 1: Сборка проектов локально
echo -e "${GREEN}📦 Шаг 1: Сборка проектов локально${NC}"
echo ""

# VozmiMenja API
echo -e "${BLUE}🔨 Сборка VozmiMenja API...${NC}"
cd "$SCRIPT_DIR/server"
npm install --production=false
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка сборки VozmiMenja API${NC}"
    exit 1
fi
cd ..

# RentAdmin API
echo -e "${BLUE}🔨 Сборка RentAdmin API...${NC}"
cd rentadmin/backend
npm install --production=false
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка сборки RentAdmin API${NC}"
    exit 1
fi
cd ../..

# VozmiMenja Frontend
echo -e "${BLUE}🔨 Сборка VozmiMenja Frontend...${NC}"
cd client
npm install
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка сборки VozmiMenja Frontend${NC}"
    exit 1
fi
cd ..

# RentAdmin Frontend
echo -e "${BLUE}🔨 Сборка RentAdmin Frontend...${NC}"
cd rentadmin/frontend
npm install
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка сборки RentAdmin Frontend${NC}"
    exit 1
fi
cd ../..

echo -e "${GREEN}✅ Все проекты собраны успешно${NC}"
echo ""

# Шаг 2: Создание бэкапа на сервере
echo -e "${GREEN}💾 Шаг 2: Создание бэкапа на сервере${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /var/www/vozmimenya

# Создать директорию для бэкапов
mkdir -p backups

# Бэкап базы данных VozmiMenja
if [ -f server/database.sqlite ]; then
    echo "Бэкап VozmiMenja database.sqlite..."
    cp server/database.sqlite backups/vozmimenya-db-$(date +%Y%m%d-%H%M%S).sqlite
fi

# Бэкап базы данных RentAdmin
if [ -f rentadmin/backend/database.sqlite3 ]; then
    echo "Бэкап RentAdmin database.sqlite3..."
    cp rentadmin/backend/database.sqlite3 backups/rentadmin-db-$(date +%Y%m%d-%H%M%S).sqlite3
fi

# Бэкап загруженных файлов VozmiMenja
if [ -d server/uploads ]; then
    echo "Бэкап VozmiMenja uploads..."
    tar -czf backups/vozmimenya-uploads-$(date +%Y%m%d-%H%M%S).tar.gz server/uploads/
fi

# Удалить старые бэкапы (старше 7 дней)
find backups/ -name "*.sqlite*" -mtime +7 -delete
find backups/ -name "*.tar.gz" -mtime +7 -delete

echo "✅ Бэкапы созданы"
ENDSSH

echo ""

# Шаг 3: Синхронизация файлов на сервер
echo -e "${GREEN}🚀 Шаг 3: Загрузка файлов на сервер${NC}"
echo ""

rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'rentadmin/.git' \
  --exclude 'logs' \
  --exclude 'backups' \
  --exclude '*.log' \
  --exclude '.env' \
  --exclude 'server/database.sqlite' \
  --exclude 'rentadmin/backend/database.sqlite3' \
  --exclude 'rentadmin/backend/*.sqlite3' \
  ./ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка при загрузке файлов${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Файлы загружены${NC}"
echo ""

# Шаг 4: Установка зависимостей и перезапуск на сервере
echo -e "${GREEN}⚙️  Шаг 4: Установка зависимостей и перезапуск${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /var/www/vozmimenya

# Создать директории для логов
mkdir -p server/logs
mkdir -p rentadmin/backend/logs

# Установить production зависимости для VozmiMenja API
echo "📦 Установка зависимостей VozmiMenja API..."
cd server
npm install --production
cd ..

# Установить production зависимости для RentAdmin API
echo "📦 Установка зависимостей RentAdmin API..."
cd rentadmin/backend
npm install --production
cd ../..

# Перезапустить PM2 процессы
echo "🔄 Перезапуск PM2 процессов..."
pm2 restart ecosystem.config.js

# Показать статус
pm2 status

echo ""
echo "✅ Развёртывание завершено!"
ENDSSH

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  ✅ Развёртывание успешно завершено!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${BLUE}🌐 Доступ к приложениям:${NC}"
echo -e "   • VozmiMenja:      https://vozmimenya.ru"
echo -e "   • VozmiMenja API:  https://api.vozmimenya.ru"
echo -e "   • RentAdmin:       https://schedule-admin.vozmimenya.ru"
echo ""
echo -e "${BLUE}📋 Проверка:${NC}"
echo -e "   ssh ${SERVER_USER}@${SERVER_HOST}"
echo -e "   pm2 status"
echo -e "   pm2 logs"
echo ""
