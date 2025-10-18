#!/bin/bash

# Скрипт инициализации базы данных RentAdmin
# Запускать на сервере: ./init-rentadmin-db.sh

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Инициализация базы данных RentAdmin ===${NC}"
echo ""

# Проверка директории
if [ ! -d "rentadmin/backend" ]; then
    echo -e "${RED}❌ Директория rentadmin/backend не найдена${NC}"
    exit 1
fi

cd rentadmin/backend

# Проверка наличия knex
if [ ! -f "node_modules/.bin/knex" ]; then
    echo -e "${BLUE}📦 Установка зависимостей...${NC}"
    npm install
fi

# Создание временного knexfile.js для миграций
echo -e "${BLUE}📝 Создание конфигурации...${NC}"
cat > knexfile.js << 'EOF'
module.exports = {
  production: {
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './dist/migrations',
    }
  }
};
EOF

# Запуск миграций
echo -e "${BLUE}🔨 Запуск миграций...${NC}"
export NODE_ENV=production
npx knex migrate:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Миграции выполнены успешно!${NC}"

    # Проверка созданной БД
    if [ -f "database.sqlite3" ]; then
        echo -e "${GREEN}✅ База данных создана: database.sqlite3${NC}"
        ls -lh database.sqlite3
    else
        echo -e "${RED}❌ База данных не найдена после миграций${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Ошибка выполнения миграций${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Следующие шаги:${NC}"
echo "1. Перезапустите RentAdmin API:"
echo "   pm2 restart rentadmin-api"
echo ""
echo "2. Проверьте логи:"
echo "   pm2 logs rentadmin-api"
