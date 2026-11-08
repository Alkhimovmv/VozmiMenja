#!/bin/bash

# ================================================================================
# Скрипт развертывания VozmiMenja с интегрированной админкой
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
SITEMAP_SNAPSHOT_DIR=""
SITEMAP_HAD_SOURCE=0

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
# Временный снимок sitemap
# ================================================================================
snapshot_generated_sitemap() {
    local sitemap_path="$PROJECT_DIR/client/public/sitemap.xml"

    restore_generated_sitemap
    SITEMAP_SNAPSHOT_DIR=$(mktemp -d "${TMPDIR:-/tmp}/vozmimenya-sitemap.XXXXXX")
    SITEMAP_HAD_SOURCE=0

    if [ -f "$sitemap_path" ]; then
        cp -p "$sitemap_path" "$SITEMAP_SNAPSHOT_DIR/sitemap.xml"
        SITEMAP_HAD_SOURCE=1
    fi
}

restore_generated_sitemap() {
    [ -n "$SITEMAP_SNAPSHOT_DIR" ] || return 0

    local sitemap_path="$PROJECT_DIR/client/public/sitemap.xml"
    if [ "$SITEMAP_HAD_SOURCE" -eq 1 ]; then
        cp -p "$SITEMAP_SNAPSHOT_DIR/sitemap.xml" "$sitemap_path"
    else
        rm -f "$sitemap_path"
    fi

    rm -f "$SITEMAP_SNAPSHOT_DIR/sitemap.xml"
    rmdir "$SITEMAP_SNAPSHOT_DIR"
    SITEMAP_SNAPSHOT_DIR=""
    SITEMAP_HAD_SOURCE=0
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
    apt-get install -y curl git nginx build-essential chromium || apt-get install -y curl git nginx build-essential chromium-browser

    print_success "Системные зависимости установлены"
}

ensure_chromium() {
    if command -v google-chrome >/dev/null 2>&1 || command -v chromium >/dev/null 2>&1 || command -v chromium-browser >/dev/null 2>&1; then
        print_success "Chrome/Chromium найден"
        return 0
    fi

    print_step "Установка Chromium для SEO-smoke"
    apt-get update -qq
    apt-get install -y chromium || apt-get install -y chromium-browser
    print_success "Chromium установлен"
}

ensure_xdg_settings() {
    if command -v xdg-settings >/dev/null 2>&1; then
        print_success "xdg-settings найден"
        return 0
    fi

    print_step "Создание xdg-settings shim для headless Chromium"
    cat > /usr/local/bin/xdg-settings <<'EOF'
#!/bin/sh
exit 0
EOF
    chmod 755 /usr/local/bin/xdg-settings
    print_success "xdg-settings shim создан"
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

    # Настройка прав
    if [ -n "$SUDO_USER" ]; then
        echo "Установка прав для пользователя $SUDO_USER..."
        chown -R $SUDO_USER:$SUDO_USER $PROJECT_DIR
    fi

    print_success "Директории созданы"
}

# ================================================================================
# Установка зависимостей проекта
# ================================================================================
install_project_dependencies() {
    print_step "Установка зависимостей проекта"

    cd $PROJECT_DIR

    # VozmiMenja Server (включая интегрированную админку)
    if [ -d "server" ] && [ -f "server/package.json" ]; then
        echo "Установка зависимостей VozmiMenja Server..."
        cd server
        sudo -u $SUDO_USER npm install --production
        sudo -u $SUDO_USER npm rebuild sqlite3 --build-from-source
        cd ..
    fi

    # VozmiMenja Client (нужны все зависимости для сборки)
    if [ -d "client" ] && [ -f "client/package.json" ]; then
        echo "Установка зависимостей VozmiMenja Client..."
        cd client
        sudo -u $SUDO_USER npm install
        cd ..
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

    # Бэкап VozmiMenja database (включая данные админки)
    if [ -f "server/database.sqlite" ]; then
        echo "Бэкап VozmiMenja database.sqlite..."
        BACKUP_FILE="backups/vozmimenya-db-${BACKUP_DATE}.sqlite"
        # Сервер в этот момент ещё работает: обычный cp может скопировать файл посреди записи.
        # VACUUM INTO даёт согласованный снимок; cp остаётся запасным вариантом.
        if command -v sqlite3 >/dev/null 2>&1 && sqlite3 server/database.sqlite "VACUUM INTO '${BACKUP_FILE}'"; then
            print_success "БД сохранена (снимок sqlite3): ${BACKUP_FILE}"
        elif (cd server && node -e "
            const sqlite3 = require('sqlite3')
            const db = new sqlite3.Database('database.sqlite')
            db.run('VACUUM INTO ?', ['../${BACKUP_FILE}'], (err) => { db.close(); process.exit(err ? 1 : 0) })
        "); then
            print_success "БД сохранена (снимок node): ${BACKUP_FILE}"
        else
            cp server/database.sqlite "${BACKUP_FILE}"
            print_warning "Снимок не удался, БД скопирована через cp: ${BACKUP_FILE}"
        fi
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
    # Генератор обновляет tracked client/public/sitemap.xml перед frontend-сборкой.
    # Возвращаем исходник после копирования dist, чтобы следующий git pull не блокировался.
    snapshot_generated_sitemap
    trap restore_generated_sitemap EXIT

    # VozmiMenja Server (включая интегрированную админку)
    if [ -d "server" ] && [ -f "server/package.json" ]; then
        echo "Сборка VozmiMenja Server (включая API админки)..."
        cd server

        # Установка dev зависимостей для сборки
        sudo -u $SUDO_USER npm install
        sudo -u $SUDO_USER npm rebuild sqlite3 --build-from-source
        sudo -u $SUDO_USER NODE_OPTIONS="--max-old-space-size=512" npm run build
        sudo -u $SUDO_USER npm run seed:catalog-additions
        sudo -u $SUDO_USER npm run migrate:catalog-equipment-links
        sudo -u $SUDO_USER npm run seed:blog-growth
        sudo -u $SUDO_USER npm run audit:content-prices
        sudo -u $SUDO_USER npm run sitemap

        # Удаление dev зависимостей после сборки
        sudo -u $SUDO_USER npm prune --production
        cd ..
        print_success "VozmiMenja Server собран"
    fi

    # VozmiMenja Frontend (включая интегрированную админку)
    if [ -d "client" ] && [ -f "client/package.json" ]; then
        echo "Сборка VozmiMenja Frontend (включая UI админки)..."
        cd client
        # Установка всех зависимостей (включая dev) для сборки
        sudo -u $SUDO_USER npm install

        # Создаём временный swap если мало RAM (защита от OOM killer)
        TOTAL_RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
        if [ "$TOTAL_RAM_MB" -lt 1500 ]; then
            echo "⚠️  Мало RAM (${TOTAL_RAM_MB}MB), создаём временный swap..."
            if [ ! -f /swapfile_build ]; then
                fallocate -l 1G /swapfile_build
                chmod 600 /swapfile_build
                mkswap /swapfile_build
            fi
            swapon /swapfile_build 2>/dev/null || true
        fi

        sudo -u $SUDO_USER NODE_OPTIONS="--max-old-space-size=512" npm run build
        EXIT_CODE=$?

        # Убираем временный swap
        swapoff /swapfile_build 2>/dev/null || true
        rm -f /swapfile_build

        [ $EXIT_CODE -ne 0 ] && { print_error "Сборка frontend завершилась с ошибкой"; exit 1; }
        cd ..

        # Копирование собранного frontend в директорию nginx
        if [ -d "client/dist" ]; then
            echo "Копирование Frontend в /var/www/html/vozmimenya.ru..."
            mkdir -p /var/www/html/vozmimenya.ru
            rm -rf /var/www/html/vozmimenya.ru/*
            cp -r client/dist/* /var/www/html/vozmimenya.ru/
            chown -R www-data:www-data /var/www/html/vozmimenya.ru
            print_success "Frontend развернут в /var/www/html/vozmimenya.ru"
        fi
    fi

    restore_generated_sitemap
    trap - EXIT

    print_success "Все проекты собраны"
}

# ================================================================================
# Настройка Nginx
# ================================================================================
setup_nginx() {
    print_step "Проверка Nginx"

    # Проверка конфигурации nginx
    if nginx -t 2>/dev/null; then
        print_success "Конфигурация Nginx корректна"
    else
        print_warning "Nginx не установлен или есть ошибки в конфигурации"
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

    # Запуск/перезапуск PM2 приложений от имени пользователя
    if sudo -u $SUDO_USER pm2 list | grep -q "vozmimenya-api"; then
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
        if sudo -u $SUDO_USER pm2 list | grep -q "vozmimenya-api"; then
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
    echo "🌐 VozmiMenja:     http://${SERVER_IP}/"
    echo "🔐 Админка:        http://${SERVER_IP}/admin/rent/login"
    echo "📡 API:            http://${SERVER_IP}:3003/api/"
    echo "📡 API админки:    http://${SERVER_IP}:3003/api/admin/"
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
    ensure_chromium
    ensure_xdg_settings
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
    ensure_chromium
    ensure_xdg_settings
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

# Запуск при прямом вызове; guard позволяет тестировать функции без запуска deploy.
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
    main "$@"
fi
