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

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Обновление VozmiMenja + RentAdmin на сервере${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Проверка что мы в правильной директории
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${RED}❌ Ошибка: запустите скрипт из корня проекта VozmiMenja${NC}"
    exit 1
fi

# Спросить подтверждение
echo -e "${YELLOW}⚠️  Это обновит код на сервере без изменения БД${NC}"
read -p "Продолжить? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Отменено"
    exit 0
fi
echo ""

# Шаг 1: Сборка проектов локально
echo -e "${GREEN}📦 Шаг 1: Сборка проектов локально${NC}"
echo ""

# VozmiMenja API
echo -e "${BLUE}🔨 Сборка VozmiMenja API...${NC}"
cd server
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка сборки VozmiMenja API${NC}"
    exit 1
fi
cd ..

# RentAdmin API
echo -e "${BLUE}🔨 Сборка RentAdmin API...${NC}"
cd rentadmin/backend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка сборки RentAdmin API${NC}"
    exit 1
fi
cd ../..

# RentAdmin Frontend
echo -e "${BLUE}🔨 Сборка RentAdmin Frontend...${NC}"
cd rentadmin/frontend
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка сборки RentAdmin Frontend${NC}"
    exit 1
fi
cd ../..

echo -e "${GREEN}✅ Все проекты собраны${NC}"
echo ""

# Шаг 2: Бэкап на сервере
echo -e "${GREEN}💾 Шаг 2: Создание бэкапа на сервере${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /var/www/vozmimenya
mkdir -p backups

# Бэкап текущего кода
echo "Бэкап текущего кода..."
tar -czf backups/code-backup-$(date +%Y%m%d-%H%M%S).tar.gz \
  --exclude='node_modules' \
  --exclude='logs' \
  --exclude='backups' \
  --exclude='*.sqlite*' \
  server/dist/ rentadmin/backend/dist/ rentadmin/frontend/dist/

# Удалить старые бэкапы кода (старше 3 дней)
find backups/ -name "code-backup-*.tar.gz" -mtime +3 -delete

echo "✅ Бэкап создан"
ENDSSH

echo ""

# Шаг 3: Загрузка обновлений
echo -e "${GREEN}🚀 Шаг 3: Загрузка обновлений на сервер${NC}"
echo ""

# Синхронизируем только собранные файлы
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'rentadmin/.git' \
  --exclude 'logs' \
  --exclude 'backups' \
  --exclude '*.log' \
  --exclude '.env' \
  --exclude 'server/database.sqlite' \
  --exclude 'server/uploads' \
  --exclude 'rentadmin/backend/database.sqlite3' \
  --exclude 'rentadmin/backend/*.sqlite3' \
  server/dist/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/server/dist/

rsync -avz --progress \
  rentadmin/backend/dist/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/rentadmin/backend/dist/

rsync -avz --progress \
  rentadmin/frontend/dist/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/rentadmin/frontend/dist/

# Синхронизируем конфиги
rsync -avz --progress \
  ecosystem.config.js \
  server/.env.production \
  rentadmin/backend/.env.production \
  ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка при загрузке файлов${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Файлы загружены${NC}"
echo ""

# Шаг 4: Перезапуск на сервере
echo -e "${GREEN}🔄 Шаг 4: Перезапуск приложений${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd /var/www/vozmimenya

# Перезапустить PM2 процессы
echo "🔄 Перезапуск PM2..."
pm2 restart ecosystem.config.js

# Подождать 2 секунды
sleep 2

# Показать статус
echo ""
pm2 status
echo ""

# Проверить что всё работает
echo "🔍 Проверка работоспособности..."
curl -s http://localhost:3003/api/equipment > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ VozmiMenja API работает"
else
    echo "⚠️  VozmiMenja API не отвечает"
fi

curl -s http://localhost:3001/api/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ RentAdmin API работает"
else
    echo "⚠️  RentAdmin API не отвечает"
fi

echo ""
echo "✅ Обновление завершено!"
ENDSSH

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  ✅ Обновление успешно завершено!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${BLUE}🌐 Приложения:${NC}"
echo -e "   • VozmiMenja:      https://vozmimenya.ru"
echo -e "   • VozmiMenja API:  https://api.vozmimenya.ru"
echo -e "   • RentAdmin:       https://schedule-admin.vozmimenya.ru"
echo ""
echo -e "${BLUE}📋 Логи:${NC}"
echo -e "   ssh ${SERVER_USER}@${SERVER_HOST}"
echo -e "   pm2 logs"
echo ""
