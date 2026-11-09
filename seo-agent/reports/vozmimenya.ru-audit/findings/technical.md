# Техническое SEO: vozmimenya.ru (аудит 2026-11-09)

Проверено: все 64 URL из sitemap.xml (все отвечают 200, 100% с canonical = собственный URL, robots "index, follow", ровно один H1, viewport, JSON-LD, уникальные title и description), robots.txt, редиректы, заголовки, 404-поведение, IndexNow-ключ. Метод: curl (без прокси, ~1 запрос/сек) + разбор HTML.

**Оценка категории: 82 / 100**

## Находки

### 1. [Medium] Невалидные/«мягкие» URL отдают 200 и canonical на главную (/equipment, /equipment/, /index.html)
- Доказательство: `GET /equipment` и `/equipment/` -> 200, `<link rel="canonical" href="https://vozmimenya.ru/">`; `/index.html` -> 200, canonical `/`. В robots.txt при этом явно `Allow: /equipment/`, значит раздел воспринимается как существующий.
- Риск: soft-404/дубли главной; поисковик может склеить их в главную, но краулинговый бюджет и сигналы размываются; если на /equipment есть внутренние ссылки, они «утекают» в дубль.
- Рекомендация: убедиться, что на /equipment нет внутренних ссылок и его нет в sitemap (сейчас нет); либо сделать там настоящий каталог (лист техники) с собственным canonical, либо редирект на /. На GitHub Pages 301 нативно не настроить: вариант – `<meta http-equiv="refresh">` + canonical, либо реальная страница каталога. /index.html – оставить (canonical уже верный).
- Проверка: `curl -s https://vozmimenya.ru/equipment | grep canonical` должен показывать собственный URL каталога, либо страница возвращает 404.

### 2. [Medium] Заголовки безопасности отсутствуют (ограничение GitHub Pages)
- Доказательство: `curl -I https://vozmimenya.ru/privacy` — нет `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy`, `Permissions-Policy`. Есть только `access-control-allow-origin: *` (штатно для Pages).
- Рекомендация: поставить перед Pages прокси/CDN (Cloudflare или Nginx на Cloud.ru, у вас он уже есть) и добавить HSTS (max-age=31536000; includeSubDomains после проверки), nosniff, Referrer-Policy: strict-origin-when-cross-origin, CSP (сначала Report-Only). Заодно получите 301-редиректы и контроль Cache-Control. Прямое влияние на ранжирование малое, но влияет на доверие и защиту форм бронирования.
- Проверка: securityheaders.com / `curl -I` показывает заголовки; HTTPS-редирект уже работает.

### 3. [Medium] Нет контроля кеширования статики: max-age=600 для хешированных ассетов
- Доказательство: `/assets/index.DBlcden-.js` -> `cache-control: max-age=600`, 138 КБ (40 КБ gzip); 34 тега modulepreload/preload на главной. Файлы с хешем в имени можно кешировать на год (`immutable`).
- Рекомендация: при переходе на CDN/Nginx — `Cache-Control: public, max-age=31536000, immutable` для /assets/ и /fonts/, HTML оставить коротким. Улучшит повторные визиты и LCP/INP в поле.
- Проверка: `curl -I` на ассет; PageSpeed «Efficient cache policy» исчезает.

### 4. [Medium] Изображения отсутствуют в пререндеренном HTML (0 тегов `<img>` на всех проверенных страницах)
- Доказательство: `grep -c '<img'` по главной, /arenda-gopro-moskva, /blog, /equipment/karcher-puzzi-8-1, статье блога = 0; при этом og:image есть (`/uploads/...jpg`). Картинки появляются только после гидрации JS.
- Риск: Google Images и Яндекс.Картинки хуже видят фото техники; LCP-картинка не обнаруживается preload-сканером (LCP-кандидат зависит от JS 138 КБ + загрузки API на api.vozmimenya.ru).
- Рекомендация: включить `<img>` (с width/height, alt, `fetchpriority="high"` для главного фото, `loading="lazy"` для остальных) в пререндер карточек/каталогов в scripts/ пререндера. Для карточки товара — preload главного фото.
- Проверка: `curl -s URL | grep -c '<img'` > 0; Lighthouse: LCP-элемент найден в HTML.

### 5. [Low] Кастомный 404: корректный статус, но через JS-редирект и без noindex
- Доказательство: `GET /nonexistent-xyz` -> HTTP 404 (хорошо), тело — `404.html` со скриптом spa-github-pages: JS перенаправляет на `/?/nonexistent-xyz`; title «VozmiMenja - Аренда оборудования» (латиница, дефолт), `noindex` нет. Регистр: `/ARENDA-GOPRO-MOSKVA` -> 404 (корректно, но пользователь потеряет трафик).
- Риск: пользователь после JS-редиректа видит SPA (она сама решает, показывать ли 404-страницу), а бот видит 404 — это нормально. Минор: нет полезного контента для бота и нет `noindex`.
- Рекомендация: добавить в client/public/404.html `<meta name="robots" content="noindex">`, русский title и ссылки на главные разделы.
- Проверка: `curl -s .../nonexistent | grep noindex`.

### 6. [Low] Противоречивые `<meta http-equiv>` cache-control
- Доказательство: во всех страницах `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">`, `Pragma: no-cache`, `Expires: 0`, при HTTP-заголовке `max-age=600`.
- Рекомендация: удалить эти meta (браузеры/боты их игнорируют, но это мусор и путаница; Lighthouse может ругаться на bfcache). Проверка: нет в `view-source`.

### 7. [Low] Параметрические URL отдают 200 с canonical на чистый URL
- Доказательство: `/?utm_source=x` -> canonical `/`; `/equipment/gopro-13?x=1` -> 200 (canonical на чистый — подтверждено для главной). Трейлинг-слэш `/arenda-gopro-moskva/` -> 200 с canonical без слэша.
- Оценка: приемлемо (canonical + Clean-param для Яндекса работают). Рекомендация: убедиться, что canonical у `?x=1` для карточки равен чистому URL (в тесте проверена только главная). Проверка: `curl -s "URL?x=1" | grep canonical`.

### 8. [Low] Мета-описания и title: единичные выходы за длину
- Доказательство: title >70 символов — 24 страницы (в основном блог: 74–93 симв.; /arenda-tehniki-u-metro-volzhskaya-kuzminki 72; /equipment/dji-osmo-pocket-3-creator-combo 76); description 178 симв. на странице DJI Osmo Pocket 3.
- Рекомендация: сократить title блога до ~60–65 симв. (Google обрежет в сниппете), хотя это не блокер. Дубликатов title/description нет.

### 9. [Low] Одинаковый блок LocalBusiness + AggregateRating в JSON-LD на всех 64 страницах
- Доказательство: в каждом HTML присутствуют `LocalBusiness`, `AggregateRating`, `ContactPoint` (на статьях блога и юридических страницах тоже).
- Риск: самооценочный AggregateRating на всех страницах без видимых отзывов — риск ручных мер за «misleading structured data» (Google требует, чтобы рейтинг был виден на странице). Рекомендация: оставить LocalBusiness на главной/контактах/точках выдачи, AggregateRating — только там, где реально показаны отзывы и источник проверяем. Передать в раздел Schema/E-E-A-T для верификации. Проверка: Rich Results Test.

### 10. [Info] Тонкий пререндер служебных страниц
- /about, /contact, /delivery, /booking, /privacy, /terms и др. — 91–111 слов (почти весь шаблон: «Где получить технику…»). Для юридических страниц нормально; /booking, /about, /delivery, /contact — коммерческие, стоит усилить контент (см. отчёт по контенту). /booking: рассмотреть `noindex` (форма без самостоятельного поискового интента), но он в sitemap — выбрать одно: либо noindex и убрать из sitemap, либо оставить.

### 11. [Info] IndexNow: работает частично
- Ключ `https://vozmimenya.ru/62993ccc1ac672e0d223b701894ea14b.txt` -> 200, содержимое = имя ключа (валидно). В docs/changelog.md зафиксирована отправка 12 URL (HTTP 202). Автоматической отправки при деплое в scripts/ не найдено (grep indexnow по scripts/ и server/src — пусто) — отправка ручная.
- Рекомендация: добавить шаг в деплой/CI: отправлять изменённые URL в `https://yandex.com/indexnow` и `api.indexnow.org` (Bing, Naver, Yandex). Проверка: ответ 200/202 в логе деплоя.

### 12. [Info] sitemap.xml: lastmod есть у всех 64 URL, но changefreq/priority — устаревшие поля, игнорируются Google
- Sitemap валиден (`sitemap_discovery.py`: kind=urlset, valid=true; /sitemap_index.xml и др. — 404, это нормально). Проверить, что lastmod меняется только при реальных правках (14 URL = 2026-11-08 — похоже на массовое обновление, Google со временем перестаёт доверять lastmod).

## Что работает хорошо
- HTTPS везде; http:// и www -> 301 на https://vozmimenya.ru/ одним хопом (нет цепочек).
- Все 64 URL из sitemap = 200, самоссылающийся canonical, `index, follow`, один H1, viewport (`width=device-width`, зум разрешён), favicon/manifest, Yandex/Google verification.
- Статический пререндер: контент, title, description, canonical, JSON-LD (Product, FAQPage, BlogPosting, BreadcrumbList, ItemList) видны без выполнения JS; ответ быстрый (0.2–1 с TTFB на CDN Fastly, gzip включён).
- robots.txt корректен: Sitemap объявлен и валиден, служебные /admin/ /api/ закрыты, Clean-param для Яндекса, AI-боты разрешены; llms.txt и ai-summary.json доступны.
- Нет дублей title/description; чистые ЧПУ в нижнем регистре; 404-статус для несуществующих URL.
- Шрифты self-hosted, `font-display: swap`, preload; JS 40 КБ gzip основной бандл + code-splitting.
- IndexNow-ключ развёрнут.

## Приоритет исправлений
1. Medium: добавить `<img>` в пререндер (LCP, Images).
2. Medium: CDN/прокси перед Pages -> заголовки безопасности, кеш ассетов, 301.
3. Medium: разобраться с /equipment (дубль главной).
4. Low: проверить AggregateRating на всех страницах; noindex в 404.html; убрать http-equiv cache meta; автоматизировать IndexNow.
