#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  Миграция URL картинок в базе данных VozmiMenja         ║${NC}"
echo -e "${YELLOW}║  Заменяет localhost:3002 на относительные пути          ║${NC}"
echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Проверка, что скрипт запущен из корня проекта
if [ ! -f "server/package.json" ]; then
    echo -e "${RED}❌ Ошибка: запустите скрипт из корня проекта VozmiMenja${NC}"
    exit 1
fi

# Переход в директорию сервера
cd server

echo -e "${YELLOW}📦 Проверка зависимостей...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   Установка зависимостей...${NC}"
    npm install
fi

# Проверка существования файла базы данных
if [ ! -f "database.sqlite" ]; then
    echo -e "${RED}❌ Ошибка: файл database.sqlite не найден${NC}"
    echo -e "${YELLOW}   Путь: $(pwd)/database.sqlite${NC}"
    exit 1
fi

echo -e "${GREEN}✅ База данных найдена${NC}"
echo ""

# Создание резервной копии базы данных
BACKUP_FILE="database.sqlite.backup-$(date +%Y%m%d-%H%M%S)"
echo -e "${YELLOW}💾 Создание резервной копии: $BACKUP_FILE${NC}"
cp database.sqlite "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Резервная копия создана${NC}"
else
    echo -e "${RED}❌ Ошибка создания резервной копии${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔄 Запуск миграции...${NC}"
echo ""

# Запуск миграции
npm run migrate:images

MIGRATION_EXIT_CODE=$?

echo ""
if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✅ Миграция завершена успешно!                  ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📝 Резервная копия сохранена: server/$BACKUP_FILE${NC}"
    echo -e "${YELLOW}   В случае проблем можно восстановить:${NC}"
    echo -e "${YELLOW}   cp server/$BACKUP_FILE server/database.sqlite${NC}"
    echo ""
    echo -e "${GREEN}🚀 Теперь картинки будут использовать относительные пути /uploads/...${NC}"
    echo -e "${GREEN}   и функция getImageUrl будет работать корректно${NC}"
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║          ❌ Миграция завершилась с ошибкой               ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}🔄 Восстановление из резервной копии...${NC}"
    cp "$BACKUP_FILE" database.sqlite
    echo -e "${GREEN}✅ База данных восстановлена${NC}"
    exit 1
fi
