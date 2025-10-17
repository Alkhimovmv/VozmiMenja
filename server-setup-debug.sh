#!/bin/bash

# ================================================================================
# Отладочная версия скрипта для диагностики проблем
# ================================================================================

set -x  # Включить вывод всех команд для отладки

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Диагностика системы ===${NC}"
echo ""

# Проверка прав
echo -e "${BLUE}1. Проверка прав суперпользователя...${NC}"
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ Скрипт не запущен с sudo${NC}"
   exit 1
else
   echo -e "${GREEN}✅ Запущен с sudo${NC}"
fi
echo ""

# Проверка интернета
echo -e "${BLUE}2. Проверка интернет-соединения...${NC}"
if ping -c 1 -W 3 8.8.8.8 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Интернет работает${NC}"
else
    echo -e "${RED}❌ Нет интернет соединения${NC}"
    exit 1
fi
echo ""

# Проверка DNS
echo -e "${BLUE}3. Проверка DNS...${NC}"
if host google.com >/dev/null 2>&1; then
    echo -e "${GREEN}✅ DNS работает${NC}"
else
    echo -e "${YELLOW}⚠️  Проблемы с DNS${NC}"
fi
echo ""

# Проверка блокировок apt
echo -e "${BLUE}4. Проверка блокировок apt...${NC}"
if fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  apt заблокирован другим процессом${NC}"
    echo "Список процессов apt:"
    ps aux | grep -E 'apt|dpkg' | grep -v grep
    echo ""
    echo "Ждем 30 секунд..."
    sleep 30

    if fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; then
        echo -e "${RED}❌ apt все еще заблокирован${NC}"
        echo "Убейте процессы apt вручную или перезагрузите сервер"
        exit 1
    fi
else
    echo -e "${GREEN}✅ apt не заблокирован${NC}"
fi
echo ""

# Проверка репозиториев
echo -e "${BLUE}5. Проверка репозиториев apt...${NC}"
echo "Попытка обновления списка пакетов (с таймаутом 60 секунд)..."
timeout 60 apt-get update || {
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 124 ]; then
        echo -e "${RED}❌ Таймаут при обновлении пакетов${NC}"
        echo "Возможные причины:"
        echo "  - Медленное интернет соединение"
        echo "  - Проблемы с репозиториями в /etc/apt/sources.list"
        echo "  - Блокировка портов файрволом"
    else
        echo -e "${RED}❌ Ошибка при обновлении пакетов (код: $EXIT_CODE)${NC}"
    fi

    echo ""
    echo "Список репозиториев:"
    cat /etc/apt/sources.list
    echo ""
    echo "Дополнительные репозитории:"
    ls -la /etc/apt/sources.list.d/ 2>/dev/null || echo "Нет дополнительных репозиториев"
    exit 1
}
echo -e "${GREEN}✅ apt-get update выполнен успешно${NC}"
echo ""

# Проверка установки пакетов
echo -e "${BLUE}6. Проверка возможности установки пакетов...${NC}"
echo "Проверка curl..."
if command -v curl >/dev/null 2>&1; then
    echo -e "${GREEN}✅ curl уже установлен${NC}"
else
    echo "Установка curl..."
    apt-get install -y curl || {
        echo -e "${RED}❌ Не удалось установить curl${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ curl установлен${NC}"
fi
echo ""

echo -e "${BLUE}7. Информация о системе:${NC}"
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Kernel: $(uname -r)"
echo "Arch: $(uname -m)"
echo "RAM: $(free -h | grep Mem | awk '{print $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $4}') свободно"
echo ""

echo -e "${GREEN}=== Все проверки пройдены успешно! ===${NC}"
echo ""
echo "Теперь можно запустить основной скрипт:"
echo "  sudo ./server-setup.sh"
