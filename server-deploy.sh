#!/bin/bash

# ================================================================================
# Скрипт автоматического развертывания VozmiMenja + RentAdmin на сервере
# ================================================================================
#
# Использование:
#   ./server-deploy.sh install    - Первоначальная установка
#   ./server-deploy.sh update     - Обновление проекта
#   ./server-deploy.sh restart    - Перезапуск сервисов
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
GIT_REPO="https://github.com/username/vozmimenya.git"  # Замените на ваш репозиторий
NODE_VERSION="20"  # Версия Node.js

# ================================================================================
# Функция вывода сообщений
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
    echo "Настройка автозапуска PM2..."
    pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

    print_success "PM2 установлен"
}

# ================================================================================
# Создание директорий и настройка прав
# ================================================================================
setup_directories() {
    print_step "Настройка директорий"

    # Создание основной директории проекта
    echo "Создание директории $PROJECT_DIR..."
    mkdir -p $PROJECT_DIR

    # Создание директорий для логов
    mkdir -p $PROJECT_DIR/logs
    mkdir -p $PROJECT_DIR/backups

    # Настройка прав (если запущено через sudo, отдаём права пользователю)
    if [ -n "$SUDO_USER" ]; then
        echo "Установка прав для пользователя $SUDO_USER..."
        chown -R $SUDO_USER:$SUDO_USER $PROJECT_DIR
    fi

    print_success "Директории созданы"
}

# ================================================================================
# Клонирование/обновление репозитория
# ================================================================================
clone_or_update_repo() {
    print_step "Получение исходного кода"

    if [ -d "$PROJECT_DIR/.git" ]; then
        echo "Репозиторий уже клонирован, обновляем..."
        cd $PROJECT_DIR

        # Сохранение локальных изменений
        sudo -u $SUDO_USER git stash

        # Обновление
        sudo -u $SUDO_USER git pull origin main

        # Обновление подмодуля rentadmin
        if [ -d "$PROJECT_DIR/rentadmin/.git" ]; then
            cd $PROJECT_DIR/rentadmin
            sudo -u $SUDO_USER git pull origin main
            cd $PROJECT_DIR
        fi

        print_success "Репозиторий обновлён"
    else
        echo "Клонирование репозитория из $GIT_REPO..."

        # Если директория не пуста, делаем бэкап
        if [ "$(ls -A $PROJECT_DIR)" ]; then
            print_warning "Директория не пуста, создаём бэкап..."
            mv $PROJECT_DIR $PROJECT_DIR.backup.$(date +%Y%m%d_%H%M%S)
            mkdir -p $PROJECT_DIR
        fi

        cd $(dirname $PROJECT_DIR)
        sudo -u $SUDO_USER git clone $GIT_REPO $(basename $PROJECT_DIR)
        cd $PROJECT_DIR

        # Инициализация подмодулей (если есть)
        if [ -f ".gitmodules" ]; then
            sudo -u $SUDO_USER git submodule update --init --recursive
        fi

        print_success "Репозиторий клонирован"
    fi
}

# ================================================================================
# Установка зависимостей проекта
# ================================================================================
install_project_dependencies() {
    print_step "Установка зависимостей проекта"

    cd $PROJECT_DIR

    # VozmiMenja Server
    if [ -d "server" ]; then
        echo "Установка зависимостей VozmiMenja Server..."
        cd server
        sudo -u $SUDO_USER npm install --production
        cd ..
    fi

    # VozmiMenja Client
    if [ -d "client" ]; then
        echo "Установка зависимостей VozmiMenja Client..."
        cd client
        sudo -u $SUDO_USER npm install
        cd ..
    fi

    # RentAdmin Backend
    if [ -d "rentadmin/backend" ]; then
        echo "Установка зависимостей RentAdmin Backend..."
        cd rentadmin/backend
        sudo -u $SUDO_USER npm install --production
        cd ../..
    fi

    # RentAdmin Frontend
    if [ -d "rentadmin/frontend" ]; then
        echo "Установка зависимостей RentAdmin Frontend..."
        cd rentadmin/frontend
        sudo -u $SUDO_USER npm install
        cd ../..
    fi

    print_success "Зависимости установлены"
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
        sudo -u $SUDO_USER npm run build
        cd ..
    fi

    # RentAdmin Backend
    if [ -d "rentadmin/backend" ] && [ -f "rentadmin/backend/package.json" ]; then
        echo "Сборка RentAdmin Backend..."
        cd rentadmin/backend
        sudo -u $SUDO_USER npm run build
        cd ../..
    fi

    # RentAdmin Frontend
    if [ -d "rentadmin/frontend" ] && [ -f "rentadmin/frontend/package.json" ]; then
        echo "Сборка RentAdmin Frontend..."
        cd rentadmin/frontend
        sudo -u $SUDO_USER npm run build
        cd ../..

        # Копирование собранного frontend в директорию nginx
        echo "Копирование RentAdmin Frontend в /var/www/html/admin..."
        mkdir -p /var/www/html/admin
        cp -r rentadmin/frontend/dist/* /var/www/html/admin/
    fi

    print_success "Проекты собраны"
}

# ================================================================================
# Создание бэкапа базы данных
# ================================================================================
backup_database() {
    print_step "Создание бэкапа базы данных"

    cd $PROJECT_DIR
    mkdir -p backups

    # Бэкап VozmiMenja database
    if [ -f "server/database.sqlite" ]; then
        echo "Бэкап VozmiMenja database.sqlite..."
        cp server/database.sqlite backups/vozmimenya-db-$(date +%Y%m%d-%H%M%S).sqlite
    fi

    # Бэкап RentAdmin database
    if [ -f "rentadmin/backend/database.sqlite3" ]; then
        echo "Бэкап RentAdmin database.sqlite3..."
        cp rentadmin/backend/database.sqlite3 backups/rentadmin-db-$(date +%Y%m%d-%H%M%S).sqlite3
    fi

    # Удаление старых бэкапов (старше 7 дней)
    find backups/ -name "*.sqlite*" -mtime +7 -delete 2>/dev/null || true

    print_success "Бэкапы созданы"
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
        if nginx -t; then
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

    # Создание директорий для логов
    mkdir -p server/logs
    mkdir -p rentadmin/backend/logs

    # Запуск/перезапуск PM2 приложений
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
    sudo -u $SUDO_USER pm2 status

    print_success "PM2 приложения запущены"
}

# ================================================================================
# Перезапуск сервисов
# ================================================================================
restart_services() {
    print_step "Перезапуск сервисов"

    # Перезапуск Nginx
    echo "Перезапуск Nginx..."
    systemctl restart nginx

    # Перезапуск PM2
    echo "Перезапуск PM2..."
    cd $PROJECT_DIR
    sudo -u $SUDO_USER pm2 restart ecosystem.config.js

    # Показать статус
    echo ""
    echo "Статус Nginx:"
    systemctl status nginx --no-pager -l
    echo ""
    echo "Статус PM2:"
    sudo -u $SUDO_USER pm2 status

    print_success "Сервисы перезапущены"
}

# ================================================================================
# Первоначальная установка
# ================================================================================
install() {
    print_step "🚀 НАЧАЛО УСТАНОВКИ"

    check_root "$@"
    install_dependencies
    install_nodejs
    install_pm2
    setup_directories

    print_warning "Для клонирования репозитория укажите URL в переменной GIT_REPO"
    echo "Отредактируйте скрипт и укажите правильный URL репозитория:"
    echo "GIT_REPO=\"https://github.com/username/vozmimenya.git\""
    echo ""
    echo "После этого запустите:"
    echo "  sudo $0 update    - для клонирования и запуска проекта"

    print_success "🎉 УСТАНОВКА БАЗОВЫХ КОМПОНЕНТОВ ЗАВЕРШЕНА"
}

# ================================================================================
# Обновление проекта
# ================================================================================
update() {
    print_step "🔄 НАЧАЛО ОБНОВЛЕНИЯ"

    check_root "$@"

    # Создание бэкапа перед обновлением
    if [ -d "$PROJECT_DIR" ] && [ -d "$PROJECT_DIR/.git" ]; then
        backup_database
    fi

    clone_or_update_repo
    install_project_dependencies
    build_projects
    setup_nginx
    start_pm2
    restart_services

    print_success "🎉 ОБНОВЛЕНИЕ ЗАВЕРШЕНО"

    # Информация о доступе
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  📋 ИНФОРМАЦИЯ О ДОСТУПЕ${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "🌐 RentAdmin: http://$(hostname -I | awk '{print $1}')/admin/"
    echo "📡 RentAdmin API: http://$(hostname -I | awk '{print $1}')/api/"
    echo ""
    echo "📋 Проверка логов:"
    echo "  sudo -u $SUDO_USER pm2 logs"
    echo "  tail -f /var/log/nginx/access.log"
    echo "  tail -f /var/log/nginx/error.log"
    echo ""
}

# ================================================================================
# Главная функция
# ================================================================================
main() {
    case "${1:-}" in
        install)
            install "$@"
            ;;
        update)
            update "$@"
            ;;
        restart)
            check_root "$@"
            restart_services
            ;;
        *)
            echo "Использование: $0 {install|update|restart}"
            echo ""
            echo "Команды:"
            echo "  install  - Первоначальная установка системных зависимостей"
            echo "  update   - Клонирование/обновление и развертывание проекта"
            echo "  restart  - Перезапуск всех сервисов"
            echo ""
            echo "Примеры:"
            echo "  sudo $0 install   # Первый запуск - установка зависимостей"
            echo "  sudo $0 update    # Развертывание/обновление проекта"
            echo "  sudo $0 restart   # Перезапуск сервисов"
            exit 1
            ;;
    esac
}

# Запуск
main "$@"
