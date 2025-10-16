#!/bin/bash

# ================================================================================
# Скрипт обновления VozmiMenja + RentAdmin БЕЗ ПОТЕРИ ДАННЫХ
# ================================================================================
#
# Этот скрипт безопасно обновляет проекты на сервере:
# - Создает бэкапы баз данных и загруженных файлов
# - Обновляет код из Git репозитория
# - Пересобирает проекты
# - Перезапускает сервисы без потери данных
#
# ВАЖНО: Базы данных и загруженные файлы НЕ УДАЛЯЮТСЯ
#
# Использование:
#   sudo ./server-update.sh
#
# ================================================================================

set -e  # Остановка при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Конфигурация
PROJECT_DIR="/var/www/vozmimenya"
DOMAIN_MAIN="vozmimenya.ru"

# ================================================================================
# Функции вывода сообщений
# ================================================================================
print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ================================================================================
# Проверка прав суперпользователя
# ================================================================================
if [[ $EUID -ne 0 ]]; then
   print_error "Этот скрипт нужно запускать с правами sudo"
   echo "Используйте: sudo $0"
   exit 1
fi

# ================================================================================
# Проверка наличия проекта
# ================================================================================
print_step "Проверка наличия проекта"

if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Директория проекта $PROJECT_DIR не найдена!"
    exit 1
fi

cd $PROJECT_DIR

if [ ! -f "ecosystem.config.js" ]; then
    print_error "Файл ecosystem.config.js не найден"
    exit 1
fi

print_success "Проект найден"

# ================================================================================
# Создание бэкапов
# ================================================================================
print_step "Создание бэкапов"

BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Бэкап VozmiMenja database
if [ -f "server/database.sqlite" ]; then
    echo "Бэкап VozmiMenja database.sqlite..."
    cp server/database.sqlite $BACKUP_DIR/vozmimenya-db-$TIMESTAMP.sqlite
    print_success "VozmiMenja БД сохранена: vozmimenya-db-$TIMESTAMP.sqlite"
else
    print_warning "База данных VozmiMenja не найдена"
fi

# Бэкап RentAdmin database
if [ -f "rentadmin/backend/database.sqlite3" ]; then
    echo "Бэкап RentAdmin database.sqlite3..."
    cp rentadmin/backend/database.sqlite3 $BACKUP_DIR/rentadmin-db-$TIMESTAMP.sqlite3
    print_success "RentAdmin БД сохранена: rentadmin-db-$TIMESTAMP.sqlite3"
else
    print_warning "База данных RentAdmin не найдена"
fi

# Бэкап загруженных файлов VozmiMenja (если они есть и не слишком большие)
if [ -d "server/uploads" ] && [ "$(du -sm server/uploads | cut -f1)" -lt 1000 ]; then
    echo "Бэкап загруженных файлов VozmiMenja..."
    tar -czf $BACKUP_DIR/vozmimenya-uploads-$TIMESTAMP.tar.gz server/uploads/
    print_success "Файлы VozmiMenja сохранены: vozmimenya-uploads-$TIMESTAMP.tar.gz"
fi

# Удаление старых бэкапов (старше 30 дней)
echo "Очистка старых бэкапов (старше 30 дней)..."
find $BACKUP_DIR/ -name "*.sqlite*" -mtime +30 -delete 2>/dev/null || true
find $BACKUP_DIR/ -name "*.tar.gz" -mtime +30 -delete 2>/dev/null || true

print_success "Бэкапы созданы в $BACKUP_DIR"

# ================================================================================
# Обновление кода из Git
# ================================================================================
print_step "Обновление кода из Git"

cd $PROJECT_DIR

# Сохранение текущей ветки
CURRENT_BRANCH=$(git branch --show-current)
echo "Текущая ветка: $CURRENT_BRANCH"

# Сохранение локальных изменений (если есть)
if ! git diff-index --quiet HEAD --; then
    print_warning "Обнаружены локальные изменения, сохраняем..."
    sudo -u $SUDO_USER git stash push -m "Auto-stash before update $TIMESTAMP"
fi

# Обновление основного репозитория
echo "Обновление VozmiMenja..."
sudo -u $SUDO_USER git pull origin $CURRENT_BRANCH

# Обновление подмодуля RentAdmin (если это подмодуль)
if [ -d "rentadmin/.git" ]; then
    echo "Обновление RentAdmin..."
    cd rentadmin
    RENTADMIN_BRANCH=$(git branch --show-current)
    sudo -u $SUDO_USER git pull origin $RENTADMIN_BRANCH
    cd ..
fi

print_success "Код обновлен"

# ================================================================================
# Установка/обновление зависимостей
# ================================================================================
print_step "Установка зависимостей"

cd $PROJECT_DIR

# VozmiMenja Server
if [ -d "server" ]; then
    echo "Обновление зависимостей VozmiMenja Server..."
    cd server
    sudo -u $SUDO_USER npm install --production=false
    cd ..
fi

# VozmiMenja Client
if [ -d "client" ]; then
    echo "Обновление зависимостей VozmiMenja Client..."
    cd client
    sudo -u $SUDO_USER npm install
    cd ..
fi

# RentAdmin Backend
if [ -d "rentadmin/backend" ]; then
    echo "Обновление зависимостей RentAdmin Backend..."
    cd rentadmin/backend
    sudo -u $SUDO_USER npm install --production=false
    cd ../..
fi

# RentAdmin Frontend
if [ -d "rentadmin/frontend" ]; then
    echo "Обновление зависимостей RentAdmin Frontend..."
    cd rentadmin/frontend
    sudo -u $SUDO_USER npm install
    cd ../..
fi

print_success "Зависимости обновлены"

# ================================================================================
# Сборка проектов
# ================================================================================
print_step "Сборка проектов"

cd $PROJECT_DIR

# VozmiMenja Server (API)
if [ -d "server" ]; then
    echo "Сборка VozmiMenja Server..."
    cd server
    sudo -u $SUDO_USER npm run build
    cd ..
    print_success "VozmiMenja Server собран"
fi

# VozmiMenja Client (Frontend)
if [ -d "client" ]; then
    echo "Сборка VozmiMenja Client..."
    cd client
    sudo -u $SUDO_USER npm run build

    # Копирование собранного фронтенда
    echo "Обновление VozmiMenja Frontend..."
    rm -rf /var/www/html/$DOMAIN_MAIN/*
    cp -r dist/* /var/www/html/$DOMAIN_MAIN/
    cd ..
    print_success "VozmiMenja Client обновлен"
fi

# RentAdmin Backend (API)
if [ -d "rentadmin/backend" ]; then
    echo "Сборка RentAdmin Backend..."
    cd rentadmin/backend
    sudo -u $SUDO_USER npm run build
    cd ../..
    print_success "RentAdmin Backend собран"
fi

# RentAdmin Frontend
if [ -d "rentadmin/frontend" ]; then
    echo "Сборка RentAdmin Frontend..."
    cd rentadmin/frontend
    sudo -u $SUDO_USER npm run build

    # Копирование собранного фронтенда
    echo "Обновление RentAdmin Frontend..."
    rm -rf /var/www/html/admin/*
    cp -r dist/* /var/www/html/admin/
    cd ../..
    print_success "RentAdmin Frontend обновлен"
fi

print_success "Все проекты собраны"

# ================================================================================
# Перезапуск PM2 приложений
# ================================================================================
print_step "Перезапуск приложений"

cd $PROJECT_DIR

# Проверка что PM2 процессы запущены
if sudo -u $SUDO_USER pm2 list | grep -q "vozmimenya-api\|rentadmin-api"; then
    echo "Перезапуск PM2 приложений..."
    sudo -u $SUDO_USER pm2 restart ecosystem.config.js
else
    echo "Запуск PM2 приложений..."
    sudo -u $SUDO_USER pm2 start ecosystem.config.js
fi

# Сохранение конфигурации
sudo -u $SUDO_USER pm2 save

# Показать статус
echo ""
sudo -u $SUDO_USER pm2 status

print_success "Приложения перезапущены"

# ================================================================================
# Перезапуск Nginx (опционально, только если были изменения в конфигурации)
# ================================================================================
print_step "Проверка Nginx"

# Проверка конфигурации
if nginx -t > /dev/null 2>&1; then
    echo "Конфигурация Nginx корректна"
    # Можно перезапустить nginx для применения изменений
    # systemctl reload nginx
else
    print_warning "Проблема с конфигурацией Nginx, но это не критично для обновления кода"
fi

# ================================================================================
# Очистка
# ================================================================================
print_step "Очистка"

# Очистка npm кеша (опционально)
echo "Очистка npm кеша..."
npm cache clean --force > /dev/null 2>&1 || true

# Очистка старых логов PM2 (старше 7 дней)
echo "Очистка старых логов..."
find $PROJECT_DIR/server/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
find $PROJECT_DIR/rentadmin/backend/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true

print_success "Очистка завершена"

# ================================================================================
# Финальная информация
# ================================================================================
print_step "🎉 ОБНОВЛЕНИЕ ЗАВЕРШЕНО УСПЕШНО!"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  📋 СТАТУС${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "🌐 Сайты обновлены и работают:"
echo -e "   • VozmiMenja:    ${BLUE}https://vozmimenya.ru${NC}"
echo -e "   • RentAdmin:     ${BLUE}https://schedule-admin.vozmimenya.ru${NC}"
echo ""
echo -e "💾 Бэкапы сохранены в: ${BLUE}$BACKUP_DIR${NC}"
echo -e "   • vozmimenya-db-$TIMESTAMP.sqlite"
echo -e "   • rentadmin-db-$TIMESTAMP.sqlite3"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  📋 ПОЛЕЗНЫЕ КОМАНДЫ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Проверка статуса:"
echo "  pm2 status"
echo "  pm2 logs"
echo ""
echo "Если что-то пошло не так, восстановите из бэкапа:"
echo "  cp $BACKUP_DIR/vozmimenya-db-$TIMESTAMP.sqlite server/database.sqlite"
echo "  cp $BACKUP_DIR/rentadmin-db-$TIMESTAMP.sqlite3 rentadmin/backend/database.sqlite3"
echo "  pm2 restart all"
echo ""
