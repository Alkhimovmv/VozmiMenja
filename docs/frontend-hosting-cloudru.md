# Перенос фронтенда vozmimenya.ru с GitHub Pages на Nginx в Cloud.ru

Зачем: GitHub Pages не даёт настроить заголовки и кеш. Сейчас там нет HSTS, nosniff, Referrer-Policy и CSP, а у ассетов с хешем в имени `Cache-Control: max-age=600` вместо года. Nginx на Cloud.ru (тот же сервер, что и `api.vozmimenya.ru`) отдаёт ту же сборку `client/dist` с нужными заголовками.

Почему не Cloudflare перед Pages: российские провайдеры с 2025 года замедляют сайты за Cloudflare. Для московской аудитории и Яндекса это хуже, чем свой сервер в РФ.

## Что уже готово в репозитории

- `nginx/vozmimenya-site.conf` — сайт: HTTP→HTTPS и www→без www одним 301; отдача как на Pages (`/route` → `route.html` или `route/index.html`, неизвестный путь → `404.html` со статусом 404 и SPA-редиректом); `/index.html` и хвостовой слэш → 301 на канонический адрес; gzip.
- `nginx/snippets/vozmimenya-security-headers.conf` — HSTS (1 год, без includeSubDomains и preload), nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, CSP в режиме **Report-Only**.
- Кеш: `/assets/` и `/fonts/` — `max-age=31536000, immutable`; картинки — 30 дней; robots/sitemap/llms/ai-summary — 1 час; HTML — `no-cache` (перепроверка при каждом заходе).
- `deploy-local.sh update` уже собирает фронтенд вместе со статическим SEO-генератором и теперь атомарно подменяет `/var/www/html/vozmimenya.ru`.
- Конфиг проверен в контейнере `nginx:1.27-alpine` на реальной сборке: `nginx -t` OK, маршруты, 404, редиректы и заголовки соответствуют описанию выше.

## Шаги на сервере (владелец)

1. Обновить код и выложить фронтенд в Nginx-каталог:
   ```bash
   git pull
   sudo ./deploy-local.sh update
   ls /var/www/html/vozmimenya.ru/index.html
   ```
2. Выпустить сертификат на `vozmimenya.ru` и `www.vozmimenya.ru` **до** переключения DNS, через DNS-проверку (HTTP-проверка пока уходит на GitHub Pages):
   ```bash
   sudo certbot certonly --manual --preferred-challenges dns -d vozmimenya.ru -d www.vozmimenya.ru
   ```
   certbot попросит добавить TXT-запись `_acme-challenge.vozmimenya.ru` у регистратора. После переключения DNS продление можно перевести на webroot (`/var/www/certbot`, location уже есть в конфиге).
3. Установить конфиг и проверить:
   ```bash
   sudo cp nginx/snippets/vozmimenya-security-headers.conf /etc/nginx/snippets/
   sudo cp nginx/vozmimenya-site.conf /etc/nginx/sites-available/vozmimenya-site.conf
   sudo ln -s /etc/nginx/sites-available/vozmimenya-site.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
   Если в `sites-enabled` уже есть старый блок с `server_name vozmimenya.ru` (например, из `nginx.conf` репозитория с путём `/var/www/vozmimenya/client/dist`), его нужно отключить, иначе `nginx -t` предупредит о конфликте имён.
4. Проверить сайт с сервера до смены DNS:
   ```bash
   curl -sk --resolve vozmimenya.ru:443:127.0.0.1 -D - -o /dev/null https://vozmimenya.ru/ | grep -iE 'strict|cache-control|nosniff'
   curl -sk --resolve vozmimenya.ru:443:127.0.0.1 -o /dev/null -w '%{http_code}\n' https://vozmimenya.ru/arenda-gopro-moskva
   ```
5. Заранее (за сутки) снизить TTL A-записей до 300 с. Затем заменить A-записи `vozmimenya.ru` (сейчас 185.199.108–111.153, GitHub Pages) на `87.242.103.146`, `www` — CNAME на `vozmimenya.ru` или A на тот же IP.
6. После переключения: в настройках репозитория GitHub → Pages убрать custom domain, чтобы Pages не перехватывал домен. Workflow `deploy.yml` можно оставить как резервную копию сайта на `*.github.io` или отключить.

## Проверка после переключения

- `curl -sI https://vozmimenya.ru/` → `strict-transport-security`, `x-content-type-options: nosniff`, `referrer-policy`, `cache-control: no-cache`.
- `curl -sI https://vozmimenya.ru/assets/<любой index.*.js>` → `cache-control: public, max-age=31536000, immutable`.
- securityheaders.com — проверить, что все заголовки распознаны.
- Яндекс.Вебмастер и Google Search Console: «Проверка URL» на главной, карточке и статье; ошибок сканирования нет.
- Uptime-монитор (`.github/workflows/uptime.yml`) остаётся зелёным.

## Через 1–2 недели

- Открыть сайт с консолью браузера, пройти главную, карточку, бронь, контакты (карта), отзывы (виджет Яндекс Карт), PDF договора, проверить, что Метрика и Вебвизор пишут визиты. Если в консоли нет сообщений `Content-Security-Policy-Report-Only`, переименовать заголовок в `Content-Security-Policy`.
- Когда HTTPS стабилен на всех поддоменах (`api`, `schedule-admin`), можно добавить к HSTS `includeSubDomains`.
- Редиректы из `client/src/content/redirects.json` сейчас работают как страницы с meta refresh (200). На Nginx их можно сделать настоящими 301 через `location = /старый-путь { return 301 /новый-путь; }`.

## Откат

Вернуть A-записи на 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 и custom domain в настройках Pages. Сборка на Pages продолжает публиковаться workflow `deploy.yml`, пока его не отключили.
