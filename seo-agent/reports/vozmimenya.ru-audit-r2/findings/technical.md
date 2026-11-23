# Техническое SEO + sitemap: vozmimenya.ru, повторный аудит (2026-11-09, r2)

Метод: curl без прокси (~1 запрос/сек) по всем 62 URL из sitemap, разбор сырого HTML (без JS), robots.txt, sitemap.xml, 404, заглушки редиректов, заголовки. `sitemap_discovery.py`: sitemap.xml объявлен в robots.txt, 200, kind=urlset, valid=true.

**Оценки: Technical 87 / 100 (было 82), Sitemap 90 / 100 (было 86).**

Сводка сверки: Technical (12 находок) - исправлено 3, частично 3, не исправлено 6 (из них 2 известны, хостинг GitHub Pages). Sitemap (7 пунктов) - исправлено 1 (пункт 7, инфо, без изменений = ок), частично 1, не исправлено 5. Итого 19 пунктов: исправлено 4, частично 4, не исправлено 11.

## Шаг 1. Сверка с прошлым аудитом

### Technical
| # | Прошлая находка | Статус | Доказательство сейчас |
|---|---|---|---|
| 1 | /equipment, /equipment/, /index.html: 200 + canonical на главную | НЕ ИСПРАВЛЕНО | `/equipment` и `/equipment/` -> 200, canonical `https://vozmimenya.ru/`, `robots: index, follow`; `/index.html` аналогично. В robots.txt по-прежнему `Allow: /equipment/`. Ссылок на /equipment/ в сыром HTML sitemap-страниц нет. |
| 2 | Нет заголовков безопасности | НЕ ИСПРАВЛЕНО (известно, GitHub Pages; план: docs/frontend-hosting-cloudru.md) | `curl -I /privacy`: нет HSTS/CSP/nosniff/XFO/Referrer-Policy; `server: GitHub.com`. |
| 3 | Кэш ассетов max-age=600 | НЕ ИСПРАВЛЕНО (известно, хостинг) | `/assets/index.BuIZekBd.js` 138 560 байт, `cache-control: max-age=600`; 17 preload/modulepreload на главной (было 34). |
| 4 | Нет `<img>` в пререндере | ЧАСТИЧНО | Карточки товара (13/13): 1 `<img>` с srcset (w400/w800 webp), sizes, alt, `loading=eager`, `fetchpriority=high` - хорошо. Статьи: 7 из 19 имеют 1-2 `<img>` (lazy, alt), 12 статей без картинок. Главная, все arenda-*, /blog, /sitemap, метро-страницы: 0 `<img>` (на листингах/категориях фото не видны ботам). |
| 5 | 404 без noindex, дефолтный латинский title | ИСПРАВЛЕНО | `GET /nonexistent-xyz` -> 404; тело: `<meta name="robots" content="noindex">`, `<title>Страница не найдена — ВозьмиМеня</title>`. Остаток: тело пустое, JS-редирект на `/?/path` (spa-github-pages), ссылок на разделы нет (см. N-9). `/404.html` напрямую отдаёт 200, но с noindex - допустимо. |
| 6 | meta http-equiv Cache-Control/Pragma/Expires | НЕ ИСПРАВЛЕНО | `no-store` meta присутствует на 62/62 страницах (при HTTP `max-age=600`). |
| 7 | Параметрические URL / слэш | ИСПРАВЛЕНО | `/equipment/gopro-13?x=1` -> canonical `/equipment/gopro-13` (в прошлый раз проверена только главная); `/?utm_source=x` -> `/`; `/arenda-gopro-moskva/`, `/blog/`, `/sitemap/` -> canonical без слэша. `/ARENDA-GOPRO-MOSKVA` -> 404. |
| 8 | Длинные title/description | ЧАСТИЧНО | Title >70 симв.: 20 страниц (было 24): 17 статей (74-91; все с суффиксом "\| Блог ВозьмиМеня"), 2 метро (71-72), DJI Osmo Pocket 3 (76). Description 178 симв. на DJI Osmo Pocket 3 остался (остальные <=164). Дублей title/description нет (62 уникальных). |
| 9 | LocalBusiness+AggregateRating на всех 64 страницах | ЧАСТИЧНО (в основном исправлено) | `AggregateRating` теперь только на 2 страницах: /arenda-tehniki-u-metro-volzhskaya-kuzminki и /arenda-tehniki-u-metro-dinamo (ratingValue 5, ratingCount 36). На остальных 60 нет. Нужно проверить, что на метро-страницах отзывы видны пользователю (передать в Schema/E-E-A-T). JSON-LD на всех страницах парсится без ошибок. |
| 10 | Тонкие служебные + /booking индекс и sitemap | НЕ ИСПРАВЛЕНО | /booking 102 слова, `index, follow`, в sitemap. /contact 107, /delivery 105, юр. страницы 92-97 слов (/offer 646, /requisites 188). |
| 11 | IndexNow ручной | НЕ ИСПРАВЛЕНО | Ключ `/62993ccc1ac672e0d223b701894ea14b.txt` -> 200, содержимое = ключ. Упоминание IndexNow только в docs/changelog.md, в scripts/, deploy-local.sh, .github, package.json нет. |
| 12 | changefreq/priority, lastmod | НЕ ИСПРАВЛЕНО | 124 тега priority/changefreq (62x2). lastmod: 13 URL = 2026-11-09, 13 URL = 2026-11-08 (26 из 62 за 2 дня; частично объяснимо коммитом 6db2dfe). |

### Sitemap
| # | Прошлая находка | Статус | Доказательство сейчас |
|---|---|---|---|
| S1 | priority/changefreq | НЕ ИСПРАВЛЕНО | `grep -c -E "priority\|changefreq"` = 124 строк (все 62 url); generate-sitemap.ts всё ещё содержит поля. |
| S2 | Генератор vs ручной sitemap, lastmod=today() | НЕ ИСПРАВЛЕНО | generate-sitemap.ts: `lastmod: today()` у всех статических; `npm run build` (корневой package.json) запускает `npm run sitemap --workspace=server` - риск перезаписи реальных дат на "сегодня" остаётся, зависит от защиты в deploy-local.sh. Живые даты разумны (09-09 ... 11-09), но 26 URL за 2 дня. |
| S3 | Метро-страницы шаблонны | ЧАСТИЧНО | Объём вырос (≈410 слов у каждой, было 375-390), но пересечение 4-грамм по меньшему документу 81% (Жаккар 68%) - прежний уровень. Intent-лендинги: 266-465 слов, пересечение между ними ~21%. |
| S4 | /equipment отдаёт 200 вместо 301 | НЕ ИСПРАВЛЕНО | см. T1. |
| S5 | Юр. страницы и /booking в sitemap | НЕ ИСПРАВЛЕНО (решение владельца) | privacy, cookies, terms, offer, rental-agreement, requisites, return-policy, /sitemap, /booking по-прежнему в sitemap (62 URL = 31 статичная + 13 оборудования + 19 статей). |
| S6 | HTML-карта /sitemap: списки подгружаются JS | ЧАСТИЧНО | Сырой HTML /sitemap: 12 из 13 карточек техники и 10 из 19 статей (было: статей 10 из 20). /blog в сыром HTML тоже 10 из 19 статей. |
| S7 | Прочее (booking/success noindex, soft 404 нет) | ИСПРАВЛЕНО / без изменений | Подтверждено: несуществующие URL -> реальный 404. |

Дополнительно подтверждено без изменений (ок): 62/62 URL = 200, без редиректов, canonical == loc на 62/62, `index, follow` на 62/62, один H1 на 62/62, viewport корректный, http->https и www->non-www 301 за один хоп (проверено `/x`), robots.txt валиден, Sitemap объявлен.

## Шаг 2. Новое и регрессии

### Проверка заявленных изменений (регрессий нет)
- Заглушки редиректов: оба URL отдают 200 (GitHub Pages) с `<link rel="canonical">` на целевой URL, `<meta http-equiv="refresh" content="0; url=...">`, `location.replace(path+search+hash)` и ссылкой в body. Цели: `/arenda-gopro-moskva` и `/blog/kak-ubrat-stroitelnuyu-pyl-posle-remonta` - обе в sitemap, 200, самоканоничны. Заглушек в sitemap нет; во всех 62 страницах ссылок на старые slug нет (grep по сырому HTML и по sitemap.xml пусто). В исходниках slug остаётся в client/src/content/redirects.json (ожидаемо), leadAttribution.ts и seed-скриптах и документах (не публичные ссылки).
- `<script type="application/json" id="__STATIC_DATA__">` есть на 13/13 карточках (1-2,6 КБ) и 19/19 статьях (3,7-10,8 КБ), JSON валиден (route + equipment/article). Лишнего веса немного (суммарно <11 КБ на страницу). Нет на листингах - правильно.
- Статьи: полный статический HTML, 587-1520 слов в сыром HTML (все 19), BlogPosting + BreadcrumbList в JSON-LD.
- 404.html: noindex, русский title (см. T5).

### Новые находки
| # | Severity | Находка | Доказательство | Рекомендация | Проверка |
|---|---|---|---|---|---|
| N-1 | Medium | Ряд коммерческих/служебных страниц не имеет ссылок в сыром HTML (шапка/подвал рендерятся JS) | По краулу 62 сырых HTML нет входящих ссылок на: /about, /terms, /privacy, /cookies, /kak-prohodit-arenda-tehniki, /sitemap, /blog/5-oshibok-pri-arende-oborudovaniya; /blog и /about в главной: `href="/blog"` 1, `href="/about"` 0. Они находятся только через sitemap.xml и после гидрации. | Вывести навигацию/подвал (о компании, как проходит аренда, документы, /sitemap) в пререндер; добавить 5-oshibok в списки статей и ссылки из релевантных лендингов. | Повторить краул сырого HTML: нет страниц с 0 входящих. |
| N-2 | Medium | Листинг блога и HTML-карта показывают в сыром HTML только 10 из 19 статей | `grep -o 'href="/blog/'` на /blog и /sitemap = 10 уникальных; всего статей 19. Остальные 9 доступны по ссылкам между статьями, а /blog/5-oshibok-... - только по sitemap. | Пререндерить в /blog и /sitemap все статьи (generate-static-route-entrypoints.js получает `limit=100`, но выводит 10), либо добавить пагинацию с настоящими href. | Тот же grep = 19. |
| N-3 | Low | Заглушки редиректов: soft-redirect через meta refresh, 200 вместо 301 | HTTP 200, `cache-control: max-age=600`; canonical на цель, сигнал для Google/Яндекса слабее 301. noindex отсутствует (правильно, иначе сигнал canonical потеряется). | Приемлемо на GitHub Pages; окончательно переехать на 301 после переноса на Nginx (Cloud.ru). Оставить заглушки минимум 6-12 мес. | После переноса: `curl -I` даёт 301. |
| N-4 | Low | `http-equiv` Cache-Control: no-store ещё присутствует на всех страницах (см. T6); рядом `Crawl-delay` в robots для Googlebot-группы отсутствует (ок), для `*` и Yandex есть: Google игнорирует, Яндекс тоже уже не учитывает | meta в 62/62 | Убрать meta; Crawl-delay удалить (скорость в Яндекс.Вебмастере). | grep пусто. |
| N-5 | Low | Изображения не в пререндере у листингов (главная, лендинги, /blog) и 12 статей без `<img>` | см. T4 | Добавить превью первых карточек (lazy, width/height), обложки статей. | `grep -c '<img'` > 0. |
| N-6 | Low | Метро-страницы: пересечение 81% остаётся | см. S3 | Уникальные данные точки (фото, маршрут, наличие), прежде чем увеличивать число станций. | Пересчёт 4-грамм <40%. |
| N-7 | Low | Метро-страницы: AggregateRating (5.0, 36 отзывов) - проверить видимость отзывов | JSON-LD в #20, #21 | Показывать отзывы на странице или удалить разметку. | Rich Results Test. |
| N-8 | Info | Размер основного JS 138,5 КБ при max-age=600 - прежнее | см. T3 | Перенос на Nginx/Cloud.ru. | - |
| N-9 | Info | 404.html без полезного контента/ссылок для пользователя без JS | пустой `<body>` | Добавить ссылки на главную, каталог, блог. | curl тела 404. |

Критичных (Critical/High) проблем не найдено.

## Что работает хорошо
- Все 62 URL: 200, canonical == URL, index/follow, один H1, уникальные title/description.
- Полный статический HTML у карточек (hero-фото с fetchpriority, srcset) и 19 статей; `__STATIC_DATA__` валиден.
- Заглушки редиректов настроены корректно и не утекают в sitemap и во внутренние ссылки.
- 404 с noindex и русским title; регистр URL даёт 404; параметры канонизируются.
- AggregateRating сокращён с 64 страниц до 2.
- Количество preload сократилось с 34 до 17.

## Приоритет
1. N-1/N-2: навигация и все статьи в сыром HTML (Medium, быстрый выигрыш в краулинге).
2. T1/S4: решить судьбу /equipment (клиентский `Navigate` -> настоящий 301 после переноса хостинга или реальный каталог).
3. T2/T3/N-3: перенос на Nginx (заголовки, кэш, 301).
4. T6/S1/S2: чистка meta cache, priority/changefreq, защита lastmod в генераторе.
5. T11: автоматизировать IndexNow в деплое.
6. T4/N-5, T8, S3/N-6, N-7: контентные и мелкие доработки.
