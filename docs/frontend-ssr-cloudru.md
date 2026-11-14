# SSR публичного сайта VozmiMenja в Cloud.ru

Публичные страницы рендерит отдельный Node-процесс, а `/admin/*`, ассеты и аварийный frontend остаются статическими. API, база данных и административное SPA не зависят от SSR-процесса.

> Активация SSR в production, перезапуск PM2/Nginx и отправка sitemap выполняются только после явного подтверждения владельца «выкатывай».

## Состав и порты

| Компонент | Адрес | Процесс |
|---|---|---|
| API | `127.0.0.1:3003` | `vozmimenya-api` |
| SSR | `127.0.0.1:3004` | `vozmimenya-ssr` |
| Публичный HTTPS | `:443` | Nginx |

SSR получает данные из `http://127.0.0.1:3003/api`. Оба Node-порта слушают loopback и не должны быть открыты в интернет.

Артефакты:

- браузерная и статическая fallback-сборка: `/var/www/vozmimenya/client/dist`;
- серверный bundle: `/var/www/vozmimenya/client/dist-ssr/entry-server.js`;
- HTML-шаблон: `/var/www/vozmimenya/client/dist-ssr/template.html`;
- runtime: `/var/www/vozmimenya/client/ssr-server.mjs`;
- логи SSR: `/var/www/vozmimenya/logs/ssr-out.log` и `ssr-error.log`.

## Локальная проверка

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run smoke:ssr-hydration
git diff --check
```

`smoke:ssr-hydration` собирает браузерный bundle для локального mock API, запускает SSR и Chrome, проверяет отсутствие hydration/console/API ошибок, cookie-баннер, WhatsApp, форму брони и SPA-переход. Обычный `npm run build` после него снова создаёт production-сборку с production API.

Ручной запуск после production-сборки:

```bash
SSR_HOST=127.0.0.1 SSR_PORT=3004 \
SSR_API_URL=http://127.0.0.1:3003/api \
node client/ssr-server.mjs

curl -fsS http://127.0.0.1:3004/health
curl -fsS http://127.0.0.1:3003/health
curl -sS -D - http://127.0.0.1:3004/arenda-pylesosov-moskva -o /tmp/vozmimenya-ssr.html
grep -E '<h1|rel="canonical"|application/ld\+json' /tmp/vozmimenya-ssr.html
```

## Подготовка и активация на VM

До переключения сделать резервную копию активного Nginx-конфига:

```bash
sudo cp /etc/nginx/sites-available/vozmimenya-site.conf \
  /etc/nginx/sites-available/vozmimenya-site.conf.pre-ssr
```

После явного «выкатывай»:

```bash
cd /var/www/vozmimenya
git pull --ff-only
sudo ./deploy-local.sh update
```

Скрипт обязан:

1. собрать API, browser bundle, SSR bundle и статические route entrypoints;
2. проверить наличие SSR bundle, template и runtime;
3. атомарно заменить статический каталог;
4. запустить/перезапустить оба PM2-процесса;
5. дождаться `200` от обоих health endpoints;
6. выполнить `nginx -t` и только после этого `systemctl reload nginx`.

Если SSR-конфиг Nginx ещё не установлен:

```bash
sudo cp nginx/vozmimenya-site.conf /etc/nginx/sites-available/vozmimenya-site.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Canary после активации

```bash
curl -fsS http://127.0.0.1:3003/health
curl -fsS http://127.0.0.1:3004/health
sudo -u "$SUDO_USER" pm2 status

for route in / /arenda-pylesosov-moskva /equipment/karcher-puzzi-8-1 /blog /arenda-tehniki-u-metro-dinamo /booking; do
  curl -sS -o /dev/null -D - "https://vozmimenya.ru$route" \
    | grep -iE 'HTTP/|x-vozmimenja-render|x-ssr-cache|x-ssr-fallback|cache-control'
done

curl -sS -o /dev/null -w '%{http_code}\n' https://vozmimenya.ru/missing-page
curl -sS -o /dev/null -w '%{http_code}\n' https://vozmimenya.ru/admin/rent/login
```

Ожидается:

- публичные страницы — `200`, `X-VozmiMenja-Render: ssr`;
- повторный безопасный GET в течение минуты — `X-SSR-Cache: HIT`;
- `/booking` и `/booking/success` — без cache hit;
- неизвестный путь — настоящий `404` и `noindex`;
- `/admin/rent/login` — статическое SPA и не SSR.

## Кеш, отказ и наблюдение

- Nginx кеширует только безопасный публичный HTML `200` на 60 секунд.
- Query string не создаёт отдельные копии кеша; UTM не дробят кеш.
- Бронирование всегда обходит кеш.
- При SSR `502/503/504` Nginx ищет текущий `$uri`, `$uri.html`, `$uri/index.html` в статической сборке и добавляет `X-SSR-Fallback: static`.
- Неизвестный URL при fallback остаётся `404`, а не превращается в soft 404.
- При кратком upstream-сбое разрешена выдача stale-копии безопасной страницы.

Проверка логов и памяти:

```bash
sudo -u "$SUDO_USER" pm2 logs vozmimenya-ssr --lines 100
sudo -u "$SUDO_USER" pm2 describe vozmimenya-ssr
ps -o pid,rss,etime,command -C node
```

PM2 перезапускает SSR при превышении `256M`. Для uncached/cached TTFB:

```bash
curl -sS -o /dev/null -w 'code=%{http_code} ttfb=%{time_starttransfer} total=%{time_total}\n' \
  'https://vozmimenya.ru/arenda-pylesosov-moskva?cache_probe=1'
curl -sS -o /dev/null -w 'code=%{http_code} ttfb=%{time_starttransfer} total=%{time_total}\n' \
  'https://vozmimenya.ru/arenda-pylesosov-moskva?cache_probe=2'
```

Цель для cached HTML — TTFB менее 500 мс. Проверить главную, категорию, товар и статью.

## Индексация

После стабильного canary и только в рамках подтверждённой выкладки:

```bash
npm run seo:console:status
npm run seo:console:submit
```

Затем проверить главную, категорию, карточку и статью в Яндекс Вебмастере и Google Search Console. SSR не меняет canonical URL или sitemap URL.

## Откат на статику

Откат не затрагивает API и базу данных:

```bash
sudo cp /etc/nginx/sites-available/vozmimenya-site.conf.pre-ssr \
  /etc/nginx/sites-available/vozmimenya-site.conf
sudo nginx -t
sudo systemctl reload nginx
sudo -u "$SUDO_USER" pm2 stop vozmimenya-ssr
sudo -u "$SUDO_USER" pm2 save
```

После отката проверить главную, товар, статью, `/admin/rent/login`, API health и настоящий `404`. Статические route entrypoints остаются в `/var/www/html/vozmimenya.ru`, поэтому остановка SSR не требует пересборки и не влияет на API.
