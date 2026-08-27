#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Остановка объединённого проекта VozmiMenja${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Функция для остановки процесса
stop_process() {
    local PID_FILE=$1
    local NAME=$2

    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${BLUE}🛑 Остановка $NAME (PID: $PID)...${NC}"
            kill $PID 2>/dev/null
            sleep 1
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "${RED}⚠️  Принудительная остановка $NAME...${NC}"
                kill -9 $PID 2>/dev/null
            fi
            rm -f "$PID_FILE"
            echo -e "${GREEN}✅ $NAME остановлен${NC}"
        else
            echo -e "${BLUE}ℹ️  $NAME уже остановлен${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${BLUE}ℹ️  PID файл для $NAME не найден${NC}"
    fi
}

# Остановка всех процессов
stop_process "logs/vozmimenya-api.pid" "VozmiMenja API"
stop_process "logs/vozmimenya-frontend.pid" "VozmiMenja Frontend"

# Дополнительная очистка процессов на портах
echo ""
echo -e "${BLUE}Проверка портов...${NC}"

for port in 3002 5173; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo -e "${YELLOW}⚠️  Найден процесс на порту $port (PID: $PID), остановка...${NC}"
        kill -9 $PID 2>/dev/null
        echo -e "${GREEN}✅ Порт $port освобождён${NC}"
    fi
done

echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  ✅ Все сервисы остановлены!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
