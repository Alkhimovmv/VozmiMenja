#!/bin/bash

# ================================================================================
# Скрипт первоначального развертывания VozmiMenja + RentAdmin на сервере
# ================================================================================
#
# Этот скрипт запускается ОДИН РАЗ на чистом сервере для:
# - Установки всех необходимых зависимостей (Node.js, PM2, Nginx, Certbot)
# - Настройки Nginx с доменами vozmimenya.ru и schedule-admin.vozmimenya.ru
# - Установки SSL сертификатов через Let's Encrypt
# - Сборки и запуска проектов VozmiMenja и RentAdmin
#
# ТРЕБОВАНИЯ:
# 1. Проект уже склонирован в /var/www/vozmimenya
# 2. Домены vozmimenya.ru и schedule-admin.vozmimenya.ru указывают на IP сервера
# 3. Порты 80 и 443 открыты в файрволе
#
# Использование:
#   sudo ./server-setup.sh
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
DOMAIN_ADMIN="schedule-admin.vozmimenya.ru"
NODE_VERSION="20"
ADMIN_EMAIL="admin@vozmimenya.ru"  # Для Let's Encrypt уведомлений

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
# Проверка что проект уже склонирован
# ================================================================================
print_step "Проверка наличия проекта"

if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Директория проекта $PROJECT_DIR не найдена!"
    echo "Сначала склонируйте проект в эту директорию"
    exit 1
fi

if [ ! -f "$PROJECT_DIR/ecosystem.config.js" ]; then
    print_error "Файл ecosystem.config.js не найден в $PROJECT_DIR"
    echo "Убедитесь, что проект правильно склонирован"
    exit 1
fi

print_success "Проект найден в $PROJECT_DIR"

# ================================================================================
# Установка системных зависимостей
# ================================================================================
print_step "Установка системных зависимостей"

echo "Обновление списка пакетов..."
apt-get update -qq

echo "Установка необходимых пакетов..."
apt-get install -y curl git nginx certbot python3-certbot-nginx build-essential

print_success "Системные зависимости установлены"

# ================================================================================
# Установка Node.js
# ================================================================================
print_step "Установка Node.js ${NODE_VERSION}.x"

if command -v node &> /dev/null; then
    NODE_INSTALLED_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    echo "Node.js уже установлен: $(node -v)"

    if [ "$NODE_INSTALLED_VERSION" -ge "$NODE_VERSION" ]; then
        print_success "Версия Node.js подходит"
    else
        print_warning "Установленная версия Node.js устарела, обновляем..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt-get install -y nodejs
    fi
else
    echo "Добавление репозитория NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -

    echo "Установка Node.js..."
    apt-get install -y nodejs
fi

echo "Установлена версия: $(node -v)"
echo "NPM версия: $(npm -v)"

print_success "Node.js установлен"

# ================================================================================
# Установка PM2
# ================================================================================
print_step "Установка PM2"

if command -v pm2 &> /dev/null; then
    echo "PM2 уже установлен: $(pm2 -v)"
else
    echo "Установка PM2 глобально..."
    npm install -g pm2

    # Настройка автозапуска PM2
    echo "Настройка автозапуска PM2..."
    env PATH=$PATH:/usr/bin pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
fi

print_success "PM2 установлен и настроен"

# ================================================================================
# Создание директорий
# ================================================================================
print_step "Настройка директорий"

mkdir -p $PROJECT_DIR/logs
mkdir -p $PROJECT_DIR/backups
mkdir -p $PROJECT_DIR/server/logs
mkdir -p $PROJECT_DIR/server/uploads
mkdir -p $PROJECT_DIR/rentadmin/backend/logs

# Создание директории для фронтенда VozmiMenja
mkdir -p /var/www/html/$DOMAIN_MAIN

# Создание директории для фронтенда RentAdmin
mkdir -p /var/www/html/admin

# Установка прав
if [ -n "$SUDO_USER" ]; then
    chown -R $SUDO_USER:$SUDO_USER $PROJECT_DIR
    chown -R $SUDO_USER:$SUDO_USER /var/www/html/$DOMAIN_MAIN
    chown -R $SUDO_USER:$SUDO_USER /var/www/html/admin
fi

print_success "Директории созданы и настроены"

# ================================================================================
# Установка зависимостей проекта
# ================================================================================
print_step "Установка зависимостей проекта"

cd $PROJECT_DIR

# VozmiMenja Server
if [ -d "server" ]; then
    echo "Установка зависимостей VozmiMenja Server..."
    cd server
    sudo -u $SUDO_USER npm install --production=false
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
    sudo -u $SUDO_USER npm install --production=false
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
    echo "Копирование VozmiMenja Frontend в /var/www/html/$DOMAIN_MAIN..."
    cp -r dist/* /var/www/html/$DOMAIN_MAIN/
    cd ..
    print_success "VozmiMenja Client собран"
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
    echo "Копирование RentAdmin Frontend в /var/www/html/admin..."
    cp -r dist/* /var/www/html/admin/
    cd ../..
    print_success "RentAdmin Frontend собран"
fi

print_success "Все проекты собраны"

# ================================================================================
# Настройка Nginx
# ================================================================================
print_step "Настройка Nginx"

# Создание конфигурации для VozmiMenja
cat > /etc/nginx/sites-available/$DOMAIN_MAIN << 'NGINX_MAIN'
# VozmiMenja - Главный сайт
server {
    listen 80;
    listen [::]:80;
    server_name vozmimenya.ru www.vozmimenya.ru;

    root /var/www/html/vozmimenya.ru;
    index index.html;

    # Логи
    access_log /var/log/nginx/vozmimenya-access.log;
    error_log /var/log/nginx/vozmimenya-error.log;

    # Frontend (React SPA)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # Статические файлы с кешированием
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API VozmiMenja (проксирование на Node.js)
    location /api/ {
        proxy_pass http://localhost:3003/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Загруженные файлы
    location /uploads/ {
        alias /var/www/vozmimenya/server/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
NGINX_MAIN

# Создание конфигурации для RentAdmin
cat > /etc/nginx/sites-available/$DOMAIN_ADMIN << 'NGINX_ADMIN'
# RentAdmin - Админ панель расписания
server {
    listen 80;
    listen [::]:80;
    server_name schedule-admin.vozmimenya.ru;

    root /var/www/html/admin;
    index index.html;

    # Логи
    access_log /var/log/nginx/rentadmin-access.log;
    error_log /var/log/nginx/rentadmin-error.log;

    # Frontend (React SPA)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }

    # Статические файлы с кешированием
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API RentAdmin (проксирование на Node.js)
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINX_ADMIN

# Активация конфигураций
ln -sf /etc/nginx/sites-available/$DOMAIN_MAIN /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/$DOMAIN_ADMIN /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
if nginx -t; then
    print_success "Конфигурация Nginx корректна"
else
    print_error "Ошибка в конфигурации Nginx"
    exit 1
fi

# Перезапуск Nginx
systemctl restart nginx
systemctl enable nginx

print_success "Nginx настроен и запущен"

# ================================================================================
# Установка SSL сертификатов
# ================================================================================
print_step "Установка SSL сертификатов через Let's Encrypt"

echo "Получение сертификата для $DOMAIN_MAIN..."
certbot --nginx -d $DOMAIN_MAIN -d www.$DOMAIN_MAIN --non-interactive --agree-tos --email $ADMIN_EMAIL --redirect

echo "Получение сертификата для $DOMAIN_ADMIN..."
certbot --nginx -d $DOMAIN_ADMIN --non-interactive --agree-tos --email $ADMIN_EMAIL --redirect

# Настройка автоматического обновления сертификатов
systemctl enable certbot.timer

print_success "SSL сертификаты установлены"

# ================================================================================
# Запуск PM2 приложений
# ================================================================================
print_step "Запуск приложений через PM2"

cd $PROJECT_DIR

# Запуск приложений
echo "Запуск приложений..."
sudo -u $SUDO_USER pm2 start ecosystem.config.js

# Сохранение конфигурации PM2
sudo -u $SUDO_USER pm2 save

# Показать статус
sudo -u $SUDO_USER pm2 status

print_success "Приложения запущены"

# ================================================================================
# Настройка файрвола (опционально)
# ================================================================================
print_step "Проверка файрвола"

if command -v ufw &> /dev/null; then
    echo "Настройка UFW..."
    ufw allow 22/tcp  # SSH
    ufw allow 80/tcp  # HTTP
    ufw allow 443/tcp # HTTPS
    ufw --force enable
    print_success "Файрвол настроен"
else
    print_warning "UFW не установлен, пропускаем настройку файрвола"
fi

# ================================================================================
# Финальная информация
# ================================================================================
print_step "🎉 РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО УСПЕШНО!"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  📋 ДОСТУП К ПРИЛОЖЕНИЯМ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "🌐 VozmiMenja:           ${BLUE}https://$DOMAIN_MAIN${NC}"
echo -e "🔧 RentAdmin:            ${BLUE}https://$DOMAIN_ADMIN${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  📋 ПОЛЕЗНЫЕ КОМАНДЫ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Управление PM2:"
echo "  pm2 status              - Статус приложений"
echo "  pm2 logs                - Просмотр всех логов"
echo "  pm2 logs vozmimenya-api - Логи VozmiMenja API"
echo "  pm2 logs rentadmin-api  - Логи RentAdmin API"
echo "  pm2 restart all         - Перезапуск всех приложений"
echo ""
echo "Логи Nginx:"
echo "  tail -f /var/log/nginx/vozmimenya-access.log"
echo "  tail -f /var/log/nginx/vozmimenya-error.log"
echo "  tail -f /var/log/nginx/rentadmin-access.log"
echo ""
echo "Обновление проекта:"
echo "  sudo ./server-update.sh - Обновить проект из Git"
echo ""
echo -e "${YELLOW}⚠️  ВАЖНО: Не забудьте настроить .env файлы с нужными переменными окружения!${NC}"
echo ""
