#!/bin/bash

# ================================================================================
# Скрипт развертывания VozmiMenja + RentAdmin (без клонирования из Git)
# ================================================================================
#
# Использование:
#   ./deploy-local.sh install    - Установка зависимостей системы
#   ./deploy-local.sh deploy     - Развертывание проекта (сборка + запуск)
#   ./deploy-local.sh update     - Обновление (сборка + перезапуск)
#   ./deploy-local.sh restart    - Перезапуск сервисов
#   ./deploy-local.sh stop       - Остановка всех сервисов
#
# ================================================================================

set -e  # Остановка при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Конфигурация - определяем директорию проекта
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR"
NODE_VERSION="20"

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
check_root() {
    if [[ $EUID -ne 0 ]]; then
       print_error "Этот скрипт нужно запускать с правами sudo"
       echo "Используйте: sudo $0 $1"
       exit 1
    fi
}

# ================================================================================
# Установка зависимостей системы
# ================================================================================
install_dependencies() {
    print_step "Установка системных зависимостей"

    # Обновление пакетов
    echo "Обновление списка пакетов..."
    apt-get update -qq

    # Установка необходимых пакетов
    echo "Установка необходимых пакетов..."
    apt-get install -y curl git nginx build-essential

    print_success "Системные зависимости установлены"
}

# ================================================================================
# Установка Node.js
# ================================================================================
install_nodejs() {
    print_step "Установка Node.js"

    if command -v node &> /dev/null; then
        NODE_INSTALLED_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        echo "Node.js уже установлен: $(node -v)"

        if [ "$NODE_INSTALLED_VERSION" -ge "$NODE_VERSION" ]; then
            print_success "Версия Node.js подходит"
            return 0
        else
            print_warning "Установленная версия Node.js устарела, обновляем..."
        fi
    fi

    # Установка NodeSource репозитория
    echo "Добавление репозитория NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -

    # Установка Node.js
    echo "Установка Node.js ${NODE_VERSION}.x..."
    apt-get install -y nodejs

    # Проверка установки
    echo "Установлена версия: $(node -v)"
    echo "NPM версия: $(npm -v)"

    print_success "Node.js установлен"
}

# ================================================================================
# Установка PM2
# ================================================================================
install_pm2() {
    print_step "Установка PM2"

    if command -v pm2 &> /dev/null; then
        echo "PM2 уже установлен: $(pm2 -v)"
        print_success "PM2 найден"
        return 0
    fi

    echo "Установка PM2 глобально..."
    npm install -g pm2

    # Настройка автозапуска PM2
    if [ -n "$SUDO_USER" ]; then
        echo "Настройка автозапуска PM2..."
        pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
    fi

    print_success "PM2 установлен"
}

# ================================================================================
# Создание директорий
# ================================================================================
setup_directories() {
    print_step "Настройка директорий"

    cd $PROJECT_DIR

    # Создание директорий для логов
    echo "Создание директорий для логов..."
    mkdir -p logs
    mkdir -p backups
    mkdir -p server/logs
    mkdir -p rentadmin/backend/logs

    # Создание директории для nginx (если нужно)
    mkdir -p /var/www/html/admin

    # Настройка прав
    if [ -n "$SUDO_USER" ]; then
        echo "Установка прав для пользователя $SUDO_USER..."
        chown -R $SUDO_USER:$SUDO_USER $PROJECT_DIR
        chown -R www-data:www-data /var/www/html/admin
    fi

    print_success "Директории созданы"
}

# ================================================================================
# Установка зависимостей проекта
# ================================================================================
install_project_dependencies() {
    print_step "Установка зависимостей проекта"

    cd $PROJECT_DIR

    # VozmiMenja Server
    if [ -d "server" ] && [ -f "server/package.json" ]; then
        echo "Установка зависимостей VozmiMenja Server..."
        cd server
        sudo -u $SUDO_USER npm install --production
        cd ..
    fi

    # VozmiMenja Client (для dev)
    if [ -d "client" ] && [ -f "client/package.json" ]; then
        echo "Установка зависимостей VozmiMenja Client..."
        cd client
        sudo -u $SUDO_USER npm install
        cd ..
    fi

    # RentAdmin Backend
    if [ -d "rentadmin/backend" ] && [ -f "rentadmin/backend/package.json" ]; then
        echo "Установка зависимостей RentAdmin Backend..."
        cd rentadmin/backend
        sudo -u $SUDO_USER npm install --production
        cd ../..
    fi

    # RentAdmin Frontend
    if [ -d "rentadmin/frontend" ] && [ -f "rentadmin/frontend/package.json" ]; then
        echo "Установка зависимостей RentAdmin Frontend..."
        cd rentadmin/frontend
        sudo -u $SUDO_USER npm install
        cd ../..
    fi

    print_success "Зависимости установлены"
}

# ================================================================================
# Создание бэкапа базы данных
# ================================================================================
backup_database() {
    print_step "Создание бэкапа базы данных"

    cd $PROJECT_DIR
    mkdir -p backups

    BACKUP_DATE=$(date +%Y%m%d-%H%M%S)

    # Бэкап VozmiMenja database
    if [ -f "server/database.sqlite" ]; then
        echo "Бэкап VozmiMenja database.sqlite..."
        cp server/database.sqlite backups/vozmimenya-db-${BACKUP_DATE}.sqlite
        print_success "VozmiMenja БД сохранена: backups/vozmimenya-db-${BACKUP_DATE}.sqlite"
    fi

    # Бэкап RentAdmin database
    if [ -f "rentadmin/backend/database.sqlite3" ]; then
        echo "Бэкап RentAdmin database.sqlite3..."
        cp rentadmin/backend/database.sqlite3 backups/rentadmin-db-${BACKUP_DATE}.sqlite3
        print_success "RentAdmin БД сохранена: backups/rentadmin-db-${BACKUP_DATE}.sqlite3"
    fi

    # Удаление старых бэкапов (старше 7 дней)
    echo "Удаление старых бэкапов (старше 7 дней)..."
    find backups/ -name "*.sqlite*" -mtime +7 -delete 2>/dev/null || true

    print_success "Бэкапы созданы"
}

# ================================================================================
# Сборка проектов
# ================================================================================
build_projects() {
    print_step "Сборка проектов"

    cd $PROJECT_DIR

    # VozmiMenja Server
    if [ -d "server" ] && [ -f "server/package.json" ]; then
        echo "Сборка VozmiMenja Server..."
        cd server

        # Установка dev зависимостей для сборки
        sudo -u $SUDO_USER npm install
        sudo -u $SUDO_USER npm run build

        # Удаление dev зависимостей после сборки
        sudo -u $SUDO_USER npm prune --production
        cd ..
        print_success "VozmiMenja Server собран"
    fi

    # RentAdmin Backend
    if [ -d "rentadmin/backend" ] && [ -f "rentadmin/backend/package.json" ]; then
        echo "Сборка RentAdmin Backend..."
        cd rentadmin/backend

        # Установка dev зависимостей для сборки
        sudo -u $SUDO_USER npm install
        sudo -u $SUDO_USER npm run build

        # Удаление dev зависимостей после сборки
        sudo -u $SUDO_USER npm prune --production
        cd ../..
        print_success "RentAdmin Backend собран"
    fi

    # RentAdmin Frontend
    if [ -d "rentadmin/frontend" ] && [ -f "rentadmin/frontend/package.json" ]; then
        echo "Сборка RentAdmin Frontend..."
        cd rentadmin/frontend
        sudo -u $SUDO_USER npm run build
        cd ../..

        # Копирование собранного frontend в директорию nginx
        if [ -d "rentadmin/frontend/dist" ]; then
            echo "Копирование RentAdmin Frontend в /var/www/html/admin..."
            rm -rf /var/www/html/admin/*
            cp -r rentadmin/frontend/dist/* /var/www/html/admin/
            chown -R www-data:www-data /var/www/html/admin
            print_success "RentAdmin Frontend развернут в /var/www/html/admin"
        fi
    fi

    print_success "Все проекты собраны"
}

# ================================================================================
# Настройка Nginx
# ================================================================================
setup_nginx() {
    print_step "Настройка Nginx"

    cd $PROJECT_DIR

    # Копирование конфигурации nginx
    if [ -f "rentadmin/nginx-system.conf" ]; then
        echo "Копирование конфигурации nginx..."
        cp rentadmin/nginx-system.conf /etc/nginx/nginx.conf

        # Проверка конфигурации
        if nginx -t 2>/dev/null; then
            print_success "Конфигурация Nginx корректна"
        else
            print_error "Ошибка в конфигурации Nginx"
            return 1
        fi
    else
        print_warning "Файл nginx-system.conf не найден, пропускаем настройку Nginx"
    fi
}

# ================================================================================
# Запуск PM2 приложений
# ================================================================================
start_pm2() {
    print_step "Запуск PM2 приложений"

    cd $PROJECT_DIR

    # Проверка наличия собранных файлов
    if [ ! -f "server/dist/index.js" ]; then
        print_error "VozmiMenja Server не собран! Запустите сначала: sudo $0 deploy"
        return 1
    fi

    if [ ! -f "rentadmin/backend/dist/server.js" ]; then
        print_error "RentAdmin Backend не собран! Запустите сначала: sudo $0 deploy"
        return 1
    fi

    # Запуск/перезапуск PM2 приложений от имени пользователя
    if sudo -u $SUDO_USER pm2 list | grep -q "vozmimenya-api\|rentadmin-api"; then
        echo "Перезапуск существующих приложений..."
        sudo -u $SUDO_USER pm2 restart ecosystem.config.js
    else
        echo "Запуск новых приложений..."
        sudo -u $SUDO_USER pm2 start ecosystem.config.js
    fi

    # Сохранение конфигурации PM2
    sudo -u $SUDO_USER pm2 save

    # Показать статус
    echo ""
    sudo -u $SUDO_USER pm2 status

    print_success "PM2 приложения запущены"
}

# ================================================================================
# Остановка PM2 приложений
# ================================================================================
stop_pm2() {
    print_step "Остановка PM2 приложений"

    cd $PROJECT_DIR

    if [ -n "$SUDO_USER" ]; then
        if sudo -u $SUDO_USER pm2 list | grep -q "vozmimenya-api\|rentadmin-api"; then
            echo "Остановка PM2 приложений..."
            sudo -u $SUDO_USER pm2 stop ecosystem.config.js
            sudo -u $SUDO_USER pm2 save
            print_success "PM2 приложения остановлены"
        else
            print_warning "PM2 приложения не запущены"
        fi
    fi
}

# ================================================================================
# Перезапуск сервисов
# ================================================================================
restart_services() {
    print_step "Перезапуск сервисов"

    # Перезапуск Nginx
    echo "Перезапуск Nginx..."
    systemctl restart nginx
    print_success "Nginx перезапущен"

    # Перезапуск PM2
    echo "Перезапуск PM2..."
    cd $PROJECT_DIR
    if [ -n "$SUDO_USER" ]; then
        sudo -u $SUDO_USER pm2 restart ecosystem.config.js
        echo ""
        sudo -u $SUDO_USER pm2 status
    fi

    print_success "Сервисы перезапущены"
}

# ================================================================================
# Показать статус
# ================================================================================
show_status() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  📋 СТАТУС СЕРВИСОВ${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Статус Nginx
    echo -e "${YELLOW}Nginx:${NC}"
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}  ✅ Работает${NC}"
    else
        echo -e "${RED}  ❌ Остановлен${NC}"
    fi

    # Статус PM2
    echo ""
    echo -e "${YELLOW}PM2 Приложения:${NC}"
    if [ -n "$SUDO_USER" ]; then
        sudo -u $SUDO_USER pm2 list
    fi

    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  📡 ДОСТУП${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    SERVER_IP=$(hostname -I | awk '{print $1}')
    echo "🌐 RentAdmin: http://${SERVER_IP}/admin/"
    echo "📡 RentAdmin API: http://${SERVER_IP}/api/"
    echo "📡 VozmiMenja API: http://${SERVER_IP}:3003/api/"
    echo ""
}

# ================================================================================
# Первоначальная установка
# ================================================================================
install() {
    print_step "🚀 УСТАНОВКА СИСТЕМНЫХ ЗАВИСИМОСТЕЙ"

    check_root "$@"

    install_dependencies
    install_nodejs
    install_pm2
    setup_directories

    print_success "🎉 УСТАНОВКА БАЗОВЫХ КОМПОНЕНТОВ ЗАВЕРШЕНА"
    echo ""
    print_warning "Следующий шаг: sudo $0 deploy"
}

# ================================================================================
# Развертывание проекта
# ================================================================================
deploy() {
    print_step "🚀 РАЗВЕРТЫВАНИЕ ПРОЕКТА"

    check_root "$@"

    setup_directories
    install_project_dependencies
    backup_database
    build_projects
    setup_nginx
    start_pm2
    systemctl restart nginx

    print_success "🎉 РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО"
    show_status
}

# ================================================================================
# Обновление проекта
# ================================================================================
update() {
    print_step "🔄 ОБНОВЛЕНИЕ ПРОЕКТА"

    check_root "$@"

    backup_database
    install_project_dependencies
    build_projects
    restart_services

    print_success "🎉 ОБНОВЛЕНИЕ ЗАВЕРШЕНО"
    show_status
}

# ================================================================================
# Остановка сервисов
# ================================================================================
stop() {
    check_root "$@"
    stop_pm2
    show_status
}

# ================================================================================
# Главная функция
# ================================================================================
main() {
    # Проверка что мы в правильной директории
    if [ ! -f "$PROJECT_DIR/ecosystem.config.js" ]; then
        print_error "Не найден ecosystem.config.js"
        echo "Запустите скрипт из корня проекта VozmiMenja"
        exit 1
    fi

    case "${1:-}" in
        install)
            install "$@"
            ;;
        deploy)
            deploy "$@"
            ;;
        update)
            update "$@"
            ;;
        restart)
            check_root "$@"
            restart_services
            show_status
            ;;
        stop)
            stop "$@"
            ;;
        status)
            show_status
            ;;
        *)
            echo "Использование: $0 {install|deploy|update|restart|stop|status}"
            echo ""
            echo "Команды:"
            echo "  install  - Установка системных зависимостей (Node.js, PM2, Nginx)"
            echo "  deploy   - Полное развертывание (установка зависимостей + сборка + запуск)"
            echo "  update   - Обновление (пересборка + перезапуск)"
            echo "  restart  - Перезапуск всех сервисов"
            echo "  stop     - Остановка PM2 приложений"
            echo "  status   - Показать статус сервисов"
            echo ""
            echo "Примеры:"
            echo "  sudo $0 install   # Первый запуск - установка зависимостей"
            echo "  sudo $0 deploy    # Развертывание проекта"
            echo "  sudo $0 update    # Обновление после изменений в коде"
            echo "  sudo $0 restart   # Быстрый перезапуск"
            echo "  sudo $0 status    # Проверка статуса"
            exit 1
            ;;
    esac
}

# Запуск
main "$@"
