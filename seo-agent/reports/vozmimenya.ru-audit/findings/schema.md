# Структурированные данные (JSON-LD) — vozmimenya.ru

Дата проверки: 2026-11-09. Оценка категории: **68 / 100**.

Проверено (сырой HTML, curl; JSON-LD отдаётся сервером, одним `<script type="application/ld+json" data-static-seo="true">` с массивом): главная, /equipment/ (karcher-puzzi-8-1, jbl-partybox-320, gopro-13, dji-mic-2), arenda-pylesosov-moskva, arenda-gopro-moskva, arenda-tehniki-u-metro-dinamo, 3 статьи /blog/, /faq, /about, /contact. Все блоки парсятся как валидный JSON, @context = https://schema.org, URL абсолютные, плейсхолдеров нет. С UA Googlebot/YandexBot отдаётся та же разметка.

Генерация: `client/scripts/generate-static-route-entrypoints.js` (статические entrypoints; Organization/LocalBusiness ~стр. 596-660, ItemList ~686, Product ~860-900, BlogPosting ~924, FAQPage ~819), данные в `client/src/content/business.json`.

## Что обнаружено (по типам страниц)
| Страница | Блоки |
|---|---|
| Главная | WebPage, @graph(Organization, 2x LocalBusiness, WebSite), ItemList(12 Product+Offer) |
| /equipment/* | Product(+Offer, 2x UnitPriceSpecification), FAQPage, BreadcrumbList, общий @graph |
| arenda-* | CollectionPage, BreadcrumbList, @graph, ItemList(Product) |
| /blog/* | BlogPosting, BreadcrumbList, @graph |
| /faq, /about, /contact | WebPage, BreadcrumbList, @graph |

## Находки

### 1. [High] AggregateRating на LocalBusiness выводится на каждой странице, а рейтинг виден только на части
- Доказательство: `aggregateRating` (ratingValue 5, ratingCount 36, reviewCount 35) вложен в LocalBusiness «м. Волжская» внутри общего @graph, который присутствует на ВСЕХ проверенных страницах (товары, статьи, /faq, /about, /contact). Видимый рейтинг есть только на странице офиса Волжская (`OfficeRentalPage.tsx`, плашка «5,0 на Яндекс Картах · 35 отзывов») и в `EquipmentTrustStrip` на карточках. На главной в отрендеренном DOM рейтинга нет: блок «Отзывы» — виджет Яндекс.Карт, грузящийся только после cookie-согласия.
- Риск: (а) Google не показывает звёзды для самообслуживающих отзывов на LocalBusiness/Organization; (б) разметка, не соответствующая видимому контенту на странице, — нарушение правил по structured data, риск ручной меры; (в) отзывы на самом деле принадлежат стороннему сервису (Яндекс), а не собраны на сайте, и данные подтягиваются curl-ом в билде (`refreshYandexRatings`), с fallback на статичные числа из business.json — могут устареть.
- Рекомендация: убрать aggregateRating из глобального @graph; оставить (по желанию) только на странице офиса Волжская, где рейтинг виден, с указанием источника. Звёзд в Google это не даст — ценность только для Яндекса/GEO. Не переносить рейтинг на Organization/Product.
- Где править: `officeJsonLd()` в generate-static-route-entrypoints.js (стр. ~596-621) — добавлять `aggregateRating` только когда маршрут = `office.slug`.
- Проверка: curl страницы /contact и /about — `grep -c aggregateRating` должно быть 0; Rich Results Test / validator.schema.org.

### 2. [High] Устаревший серверный prerender выдаёт выдуманный рейтинг 4.9 / 412 отзывов
- Доказательство: `server/src/routes/prerender.ts:206` — `aggregateRating: {ratingValue:'4.9', reviewCount:'412'}` на каждом товаре; `nginx-prerender.conf` предполагает отдачу этого HTML ботам. На проде сейчас не активно (боты получают статику с рейтингом 5/36, /prerender/... даёт 404), но при включении конфига фейковый рейтинг и seller без @id попадут в индекс.
- Рекомендация: удалить поле aggregateRating из prerender.ts (или весь мёртвый маршрут и nginx-prerender.conf). 
- Проверка: `grep -rn "412" server/src/routes/prerender.ts` пусто.

### 3. [Medium] BlogPosting: даты без таймзоны/«T», нет image, автор — Organization
- Доказательство: `"datePublished": "2026-09-05 23:41:32"`, `"dateModified": "2026-10-10 11:10:54"` (формат БД, не ISO 8601; также `dateModified` одинаковый `2026-10-10 11:10:54` у всех 3 статей — похоже на массовую миграцию, а не реальную правку). У трёх проверенных статей нет `image` (в каталоге 8 из 18 статей без image — по локальным копиям страниц). author = `{Organization «ВозьмиМеня»}`.
- Рекомендация: приводить даты к `2026-09-05T23:41:32+03:00`; добавить `image` (обложка/OG-картинка, ≥1200 px) — fallback `og-image.jpg`; для E-E-A-T добавить реального автора `Person` (name, url на /about), либо оставить Organization осознанно. Не трогать dateModified искусственно.
- Где править: строки ~924-935 generate-static-route-entrypoints.js: `new Date(article.created_at.replace(' ','T')+'+03:00').toISOString()` (уточнить, в какой зоне хранится время в БД — в UTC, тогда суффикс `Z`); `image: image || og-image`.
- Пример:
```json
{"@type":"BlogPosting","headline":"…","image":["https://vozmimenya.ru/og-image.jpg"],
 "author":{"@type":"Person","name":"Имя Фамилия","url":"https://vozmimenya.ru/about"},
 "publisher":{"@id":"https://vozmimenya.ru/#organization"},
 "datePublished":"2026-09-05T23:41:32+03:00","dateModified":"2026-10-10T11:10:54+03:00"}
```
- Проверка: curl статьи, `jq` по datePublished; Rich Results Test (Article).

### 4. [Medium] Product для аренды: нет brand/sku, смешанные цены в одном Offer
- Доказательство: у Product (karcher-puzzi-8-1, gopro-13, dji-mic-2, jbl-partybox-320) нет `brand`, `sku`/`mpn`; Offer содержит `price: 980` и массив priceSpecification, где вторая спецификация — цена 500/сутки от 30 суток. Google для Product snippets берёт `offers.price`, вторая цена может трактоваться неоднозначно. `availability` всегда InStock (статично, не зависит от реальной занятости). `priceValidUntil` генерируется как «сегодня + 365 дней» при каждой сборке.
- Рекомендация: добавить `brand` (`{"@type":"Brand","name":"Karcher"}`), `sku`; для аренды допустимо оставить Product + Offer (rich-результат «Merchant listing» для аренды не гарантирован — это аренда, а не покупка; цель — понятность для поисковиков). Долгосрочный тариф лучше вынести во второй Offer (`name: "Аренда от 30 суток"`, `eligibleDuration`/`eligibleQuantity`) или оставить только в тексте. Если есть признак занятости — отражать в availability. Рассмотреть `additionalType: "https://www.productontology.org/id/Renting"` не требуется.
- Где править: стр. ~860-900 (Product), поля brand/sku добавить в данные оборудования или парсить из имени.
- Проверка: Rich Results Test «Product snippets» — 0 ошибок, предупреждения о brand/review исчезнут частично.

### 5. [Medium] В разметке есть сущности, которых нет в видимом тексте / NAP не везде
- Email `alkhimovmv@yandex.ru` есть в Organization, но не виден на /contact (там телефон +7 (993) 363-64-64 и Telegram). Телефон, адреса «Волжский бульвар, 51с15» и «ул. Расковой, 1», режим 24/7 — совпадают с видимым текстом (OK). Индексы 109462/125040 в тексте не показаны (допустимо).
- Режим работы `opens 00:00 / closes 23:59` — для 24/7 корректнее `opens 00:00, closes 23:59` допустим, но иначе: `"opens":"00:00","closes":"23:59"` не покрывает 1 минуту; Google трактует нормально. Отметка Info.
- Рекомендация: показать email на /contact либо убрать из JSON-LD; два отдела (LocalBusiness) с одним и тем же телефоном — норма.
- LocalBusiness «Динамо»: `hasMap` — произвольная ссылка Яндекс.Карт по координатам, нет карточки организации (sameAs); Волжская — есть. Добавить карточку Динамо, когда появится.
- `priceRange: "от 400 ₽ в сутки"` — желателен формат «400–2000 ₽» (Google просит диапазон; текстовое «от» допустимо, но не канонично).

### 6. [Medium] Общий @graph LocalBusiness×2 дублируется на каждой странице (вес ~3-4 КБ на страницу)
- Доказательство: идентичный граф Organization+2 LocalBusiness+WebSite повторяется на всех страницах, включая статьи и товары. Это не ошибка (используются @id), но на странице Динамо/Волжская нет `mainEntity`/`about` на соответствующий LocalBusiness: CollectionPage офиса ссылается `about` на Organization, а не на свой офис.
- Рекомендация: на страницах офисов (`/arenda-tehniki-u-metro-*`) поставить `about`/`mainEntity` = `{"@id":".../#office-dinamo"}`; на остальных страницах оставить только Organization+WebSite (офисы — на главной, /contact и страницах офисов).

### 7. [Medium] BreadcrumbList: товары — 2 уровня, название = SEO-заголовок
- Доказательство: на /equipment/karcher-puzzi-8-1 хлебные крошки: «ВозьмиМеня» → «Аренда Karcher Puzzi 8/1 в Москве — 980 ₽/сутки» (нет уровня каталога, длинное name с ценой). У arenda-* и статей крошки корректны (статьи: Главная → Блог → Статья; имена совпадают с H1/заголовком).
- Рекомендация: Главная → Каталог/категория (напр. «Пылесосы», https://vozmimenya.ru/arenda-pylesosov-moskva) → «Karcher Puzzi 8/1» (чистое название товара). Убедиться, что на странице видимая навигация-крошка соответствует.
- Где править: ~стр. 530-555 (breadcrumb builder) и вызов для product.

### 8. [Low] Описания в ItemList/Product обрезаны с «…»
- `description` в элементах ItemList заканчивается на «…» (обрезка по символам, «пылевых…»). Желательно обрезать по границе предложения или использовать короткое description (≤200 символов без многоточия). Мелочь.

### 9. [Info] FAQPage на карточках товаров
- Присутствует на /equipment/* (3 вопроса, ответы видимы на странице). С 7 мая 2026 Google не показывает FAQ rich results — SERP-эффекта нет, GEO-польза не подтверждена. Не удалять, новые не добавлять ради SERP. Часть ответов шаблонная (например, «подходит для уборки, чистки или сушки в зависимости от модели» у Puzzi) — улучшить текст ради читателя, а не разметки.
- /faq (страница вопросов) размечена как WebPage без FAQPage — оставить как есть.

### 10. [Info] sameAs содержит `wa.me/...` (ссылка-мессенджер, не профиль) — безвредно, можно убрать. ContactPoint без `contactType` разнообразия (только customer service) — достаточно; `areaServed: "RU"` у ContactPoint при городе Москва — несогласованно, но допустимо.

## Недостающие возможности
- Review/AggregateRating для товаров НЕ добавлять, пока на сайте нет собственных видимых отзывов о конкретных товарах.
- WebSite `potentialAction` SearchAction — только если появится поиск по сайту (сейчас Google его не показывает; не приоритет).
- Person-автор на статьях + страница автора (E-E-A-T).
- На /blog — `Blog` присутствует в коде (route === '/blog'), проверить, что на листинге есть ItemList/Blog с ссылками (вне выборки).
- Не рекомендуется: HowTo, новые FAQPage.

## Оценка
Сильные стороны: валидный JSON-LD, @id-граф, серверная отдача, единый NAP, UnitPriceSpecification, корректные BreadcrumbList на статьях, отсутствие deprecated-типов. Потери: рейтинг во всех страницах при частичной видимости (-12), фейковый рейтинг в мёртвом prerender (-5), даты/изображения/автор в BlogPosting (-7), Product без brand/sku и смешанные цены (-5), крошки товаров (-3). **Итого 68/100.**
