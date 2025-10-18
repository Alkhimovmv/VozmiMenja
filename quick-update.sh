#!/bin/bash

# Быстрое обновление VozmiMenja Frontend на сервере
# Запускать прямо на сервере: sudo ./quick-update.sh

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Быстрое обновление VozmiMenja Frontend${NC}"

# Проверка что мы в правильной директории
if [ ! -f "ecosystem.config.js" ]; then
    echo -e "${RED}❌ Не найден ecosystem.config.js${NC}"
    echo "Запустите скрипт из /var/www/vozmimenya"
    exit 1
fi

# Обновление package.json из Git (если нужно)
echo -e "${BLUE}📥 Обновление кода...${NC}"
git pull || echo "Git pull пропущен"

# Сборка VozmiMenja Frontend
echo -e "${BLUE}🔨 Сборка VozmiMenja Frontend...${NC}"
cd client
npm install
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка сборки${NC}"
    exit 1
fi

# Копирование в nginx
echo -e "${BLUE}📦 Копирование в nginx...${NC}"
sudo rm -rf /var/www/html/vozmimenya.ru/*
sudo cp -r dist/* /var/www/html/vozmimenya.ru/
sudo chown -R www-data:www-data /var/www/html/vozmimenya.ru

echo -e "${GREEN}✅ VozmiMenja Frontend обновлен!${NC}"
echo ""
echo -e "${BLUE}Проверьте: https://vozmimenya.ru${NC}"
