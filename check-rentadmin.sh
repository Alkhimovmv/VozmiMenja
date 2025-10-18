#!/bin/bash

# Скрипт для диагностики проблем RentAdmin
# Запускать на сервере: ./check-rentadmin.sh

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Диагностика RentAdmin ===${NC}"
echo ""

# Проверка PM2
echo -e "${YELLOW}1. Статус PM2:${NC}"
pm2 status

echo ""
echo -e "${YELLOW}2. Последние логи RentAdmin API (ошибки):${NC}"
pm2 logs rentadmin-api --lines 50 --err --nostream

echo ""
echo -e "${YELLOW}3. Последние логи RentAdmin API (вывод):${NC}"
pm2 logs rentadmin-api --lines 20 --out --nostream

echo ""
echo -e "${YELLOW}4. Проверка базы данных:${NC}"
if [ -f "rentadmin/backend/database.sqlite3" ]; then
    echo -e "${GREEN}✅ База данных найдена${NC}"
    ls -lh rentadmin/backend/database.sqlite3
else
    echo -e "${RED}❌ База данных НЕ найдена!${NC}"
    echo "Необходимо инициализировать базу данных"
fi

echo ""
echo -e "${YELLOW}5. Проверка портов:${NC}"
sudo netstat -tulpn | grep -E ':(3001|3003)' || echo "Порты 3001, 3003 не прослушиваются"

echo ""
echo -e "${YELLOW}6. Проверка собранных файлов:${NC}"
if [ -f "rentadmin/backend/dist/server.js" ]; then
    echo -e "${GREEN}✅ Backend собран${NC}"
else
    echo -e "${RED}❌ Backend НЕ собран!${NC}"
fi

echo ""
echo -e "${BLUE}=== Команды для исправления ===${NC}"
echo ""
echo "Пересобрать и перезапустить RentAdmin:"
echo "  cd /var/www/vozmimenya"
echo "  sudo ./deploy-local.sh update"
echo ""
echo "Посмотреть логи в реальном времени:"
echo "  pm2 logs rentadmin-api"
echo ""
echo "Перезапустить только RentAdmin API:"
echo "  pm2 restart rentadmin-api"
