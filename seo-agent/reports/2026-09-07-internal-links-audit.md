# Internal Links Audit

Дата: 2026-09-07

## Цель

Понять, какие опубликованные страницы стоит усилить внутренними ссылками, чтобы улучшить crawlability, распределить вес на коммерческие лендинги и карточки оборудования, не создавая тонкие SEO-страницы.

## Проверенный источник

- Локальная БД: `server/database.sqlite`
- Публичный sitemap: `client/public/sitemap.xml`
- Роутинг и шаблоны: `client/src/App.tsx`, `client/src/pages/BlogPage.tsx`, `client/src/pages/BlogArticlePage.tsx`, `client/src/pages/Category*.tsx`, `client/src/pages/EquipmentDetailsPage.tsx`

## Что Уже Хорошо

- Sitemap содержит главную, 3 категорийные посадочные, блог, HTML-карту сайта, служебные страницы, 11 карточек оборудования и 11 опубликованных статей.
- Новые growth-статьи из `seed-blog-growth-articles.ts` в целом проходят внутреннюю перелинковку: 3-5 уникальных внутренних ссылок на статью.
- Страница статьи автоматически добавляет категорийный CTA-блок: блоговые материалы получают ссылки на релевантную посадочную и ключевые карточки.
- Карточки оборудования ведут обратно на категорийную посадочную и один категорийный гайд.
- Категорийные посадочные уже имеют блоки сценариев с ссылками на оборудование и статьи.

## Проблемные Страницы

### HIGH: статьи без внутренних ссылок в теле

1. `/blog/5-oshibok-pri-arende-oborudovaniya`
   - Сейчас: 0 внутренних ссылок в markdown.
   - Риск: статья не передает вес на коммерческие страницы и не помогает пользователю перейти к выбору оборудования.
   - Усилить ссылками:
     - `/arenda-pylesosov-moskva` с анкором `строительный или моющий пылесос в аренду`
     - `/arenda-gopro-moskva` с анкором `камера для съемки в аренду`
     - `/arenda-audiooborudovaniya-moskva` с анкором `микрофон или колонка в аренду`

2. `/blog/kachestvennyj-zvuk-dlya-video-dji-mic-2`
   - Сейчас: 0 внутренних ссылок в markdown.
   - Риск: коммерчески сильная статья про микрофон не ведет на карточку DJI Mic 2 и аудио-лендинг.
   - Усилить ссылками:
     - `/equipment/1232f00f-dc96-46df-b1e4-2d724ede3ef8` с анкором `DJI Mic 2`
     - `/arenda-audiooborudovaniya-moskva` с анкором `аренда микрофонов и аудиооборудования`
     - `/arenda-gopro-moskva` или `/equipment/5e1bd056-e6e8-4e92-ae17-519a56f564ad` для сценария видео/влога

3. `/blog/top-3-kamery-dlya-svadeb-2025`
   - Сейчас: 0 внутренних ссылок в markdown.
   - Риск: статья с коммерческим intent по съемке мероприятий не передает вес на камеры.
   - Усилить ссылками:
     - `/arenda-gopro-moskva` с анкором `камеры для съемки мероприятий в аренду`
     - `/equipment/64e19704-b0dc-4879-9b90-6adc4eddd923` с анкором `GoPro 13`
     - `/equipment/5e1bd056-e6e8-4e92-ae17-519a56f564ad` с анкором `DJI Osmo Pocket 3 Creator Combo`
     - `/equipment/98794938-b0c8-4a7d-b182-b6645ba8039b` с анкором `Insta360 X5`

### MEDIUM: статьи ниже контентного порога 3 ссылок

1. `/blog/gopro-dlya-nachinayushchih-polnoe-rukovodstvo`
   - Сейчас: 2 уникальные внутренние ссылки.
   - Добавить ссылку на `/equipment/64e19704-b0dc-4879-9b90-6adc4eddd923` и связать с тревел-статьей `/blog/kakuyu-kameru-vzyat-v-puteshestvie-gopro-dji-insta360`.
   - Дополнительно убрать слабую ссылку `[есть в аренде](/)`, потому что анкор ведет на главную без понятного intent.

2. `/blog/kak-vybrat-pylesos-dlya-uborki-posle-remonta`
   - Сейчас: 1 уникальная внутренняя ссылка.
   - Добавить ссылки на `/equipment/0519e3d0-e02f-4f8e-b77d-0c80fe58a9cc`, `/blog/kak-ubrat-stroitelnuyu-pyl-posle-remonta` и при необходимости на Puzzi-модели для финальной чистки мебели.

3. `/blog/professionalny-pylesy-dlya-klininga`
   - Сейчас: 1 уникальная внутренняя ссылка.
   - Добавить ссылки на `/equipment/0519e3d0-e02f-4f8e-b77d-0c80fe58a9cc`, `/equipment/51022efa-99b7-4c93-a5ad-0f19851f6c1a`, `/equipment/f2260efd-d0e7-4622-91b0-c90a2cbc64ad`.
   - Категория в БД сейчас `Пылесосы`, а основная категория каталога `Пылесосы, уборка и клининг`; лучше унифицировать при следующем seed/content refresh.

## Куда Сейчас Идет Вес Из Статей

- `/arenda-pylesosov-moskva`: 5 статей
- `/equipment/51022efa-99b7-4c93-a5ad-0f19851f6c1a`: 3 статьи
- `/equipment/f2260efd-d0e7-4622-91b0-c90a2cbc64ad`: 3 статьи
- `/arenda-audiooborudovaniya-moskva`: 2 статьи
- `/arenda-gopro-moskva`: 2 статьи
- `/equipment/1232f00f-dc96-46df-b1e4-2d724ede3ef8`: 2 статьи
- Остальные ключевые карточки камер/аудио получают по 1 ссылке из markdown.

## Рекомендуемая Следующая Поставка

Сделать небольшой content refresh старых статей через отдельный seed/migration:

1. Обновить 6 статей из разделов HIGH/MEDIUM.
2. Довести каждую до 3+ внутренних ссылок в markdown.
3. Убрать или смягчить непроверенные цены, скидки, штрафы и комплектации в старых статьях.
4. Перегенерировать sitemap.
5. Проверить `npm run sitemap --workspace=server`, `npm run typecheck`, `npm run build`.

## Риски

- В старых статьях есть конкретные цены, скидки, штрафы и комплектации, которые могут не совпадать с текущим каталогом. Их лучше не усиливать ссылками без контентного refresh.
- Нет данных Search Console/Яндекс.Вебмастера, поэтому приоритеты основаны на локальной структуре сайта, sitemap, коммерческой близости и текущей БД.
- Автоматической проверки битых внутренних ссылок пока нет; после правок стоит добавить отдельный скрипт или расширить `smoke:public`.

## Выполнено В Этой Итерации

- В `seed:blog-growth` добавлен идемпотентный refresh для трех статей из блока HIGH.
- `/blog/5-oshibok-pri-arende-oborudovaniya` доведена до 3 внутренних ссылок: пылесосы, камеры, аудио.
- `/blog/kachestvennyj-zvuk-dlya-video-dji-mic-2` доведена до 3 внутренних ссылок: DJI Mic 2, аудио-лендинг, камеры.
- `/blog/top-3-kamery-dlya-svadeb-2025` доведена до 4 внутренних ссылок: камеры-лендинг, GoPro 13, DJI Osmo Pocket 3, Insta360 X5.
- Локально выполнены `npm run seed:blog-growth --workspace=server`, `npm run sitemap --workspace=server`, `npm run typecheck`, `npm run build`.
- `SMOKE_BASE_URL=http://localhost:4173 npm run smoke:public` пройден на preview-сборке: 26 публичных URL вернули 200.
- `npm run lint` сейчас не проходит из-за существующих admin-файлов с `any` (`LockersPage`, `LoginPage`, `OfficesPage`, `RentalsPage`, `SiteBookingsPage`, `UsersPage`); это отдельный release-риск, не связанный с текущими SEO/content-правками.
