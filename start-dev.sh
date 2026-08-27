#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Запуск объединённого проекта VozmiMenja${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Функция для проверки доступности порта
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${YELLOW}⚠️  Порт $1 уже занят!${NC}"
        return 1
    fi
    return 0
}

# Проверка портов
echo -e "${BLUE}Проверка доступности портов...${NC}"
check_port 3002
check_port 5173
echo ""

# Установка зависимостей если нужно
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}Установка зависимостей VozmiMenja API...${NC}"
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}Установка зависимостей VozmiMenja Frontend...${NC}"
    cd client && npm install && cd ..
fi

echo ""
echo -e "${GREEN}✅ Запуск серверов...${NC}"
echo ""

# Создаём каталог логов
mkdir -p logs

# Запуск VozmiMenja API (порт 3002)
echo -e "${BLUE}🚀 Запуск VozmiMenja API на порту 3002...${NC}"
cd server
npm run dev > ../logs/vozmimenya-api.log 2>&1 &
VOZMIMENYA_API_PID=$!
echo $VOZMIMENYA_API_PID > ../logs/vozmimenya-api.pid
cd ..

# Ждём запуска API
echo -e "${YELLOW}⏳ Ожидание запуска API серверов (5 секунд)...${NC}"
sleep 5

# Запуск VozmiMenja Frontend (порт 5173)
echo -e "${BLUE}🚀 Запуск VozmiMenja Frontend на порту 5173...${NC}"
cd client
npm run dev > ../logs/vozmimenya-frontend.log 2>&1 &
VOZMIMENYA_FRONTEND_PID=$!
echo $VOZMIMENYA_FRONTEND_PID > ../logs/vozmimenya-frontend.pid
cd ..

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  ✅ VozmiMenja запущен!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo -e "${BLUE}📡 API:${NC}"
echo -e "   • VozmiMenja API:  http://localhost:3002/api"
echo ""
echo -e "${BLUE}🌐 Веб-приложение:${NC}"
echo -e "   • VozmiMenja:      http://localhost:5173"
echo ""
echo -e "${BLUE}📋 Логи:${NC}"
echo -e "   • tail -f logs/vozmimenya-api.log"
echo -e "   • tail -f logs/vozmimenya-frontend.log"
echo ""
echo -e "${YELLOW}⚠️  Для остановки всех сервисов запустите: ./stop-dev.sh${NC}"
echo ""
