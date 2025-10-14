#!/bin/bash

# Цвета для вывода
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Логи объединённого проекта VozmiMenja${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

PS3="Выберите логи для просмотра: "
options=(
    "VozmiMenja API"
    "RentAdmin API"
    "VozmiMenja Frontend"
    "RentAdmin Frontend"
    "Все логи вместе"
    "Выход"
)

select opt in "${options[@]}"
do
    case $opt in
        "VozmiMenja API")
            echo -e "${GREEN}📋 Логи VozmiMenja API (Ctrl+C для выхода):${NC}"
            tail -f logs/vozmimenya-api.log
            ;;
        "RentAdmin API")
            echo -e "${GREEN}📋 Логи RentAdmin API (Ctrl+C для выхода):${NC}"
            tail -f logs/rentadmin-api.log
            ;;
        "VozmiMenja Frontend")
            echo -e "${GREEN}📋 Логи VozmiMenja Frontend (Ctrl+C для выхода):${NC}"
            tail -f logs/vozmimenya-frontend.log
            ;;
        "RentAdmin Frontend")
            echo -e "${GREEN}📋 Логи RentAdmin Frontend (Ctrl+C для выхода):${NC}"
            tail -f logs/rentadmin-frontend.log
            ;;
        "Все логи вместе")
            echo -e "${GREEN}📋 Все логи вместе (Ctrl+C для выхода):${NC}"
            tail -f logs/*.log
            ;;
        "Выход")
            break
            ;;
        *) echo "Неверный выбор";;
    esac
done
