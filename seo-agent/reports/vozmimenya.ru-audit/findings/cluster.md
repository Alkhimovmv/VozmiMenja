# Контент-архитектура и кластеры: vozmimenya.ru

Дата: 2026-11-09 · Зона: семантические кластеры, каннибализация, hub/spoke, внутренние ссылки
Статус: **ФИНАЛ**

## 0. Методика и ограничения

- Инвентаризация: `sitemap-urls.txt` (63 URL): 1 главная, 14 посадочных `arenda-*` (10 товарных и сценарных плюс 4 сервисных/локальных), 13 карточек `/equipment/`, 20 статей `/blog/`, сервисные и юридические страницы.
- Живые страницы через WebFetch: `/blog`, `/arenda-gopro-moskva`, `/arenda-kamery-dlya-puteshestviya-vloga-moskva`, `/arenda-kolonki-dlya-vecherinki-moskva`, `/arenda-pylesosov-moskva` и 6 статей (title/H1/H2/ссылки).
- Код: `client/scripts/generate-static-route-entrypoints.js` (статический HTML), `client/src/pages/*.tsx` (SPA), `EquipmentDetailsPage.tsx`, а также прошлый аудит `seo-agent/reports/2026-09-07-internal-links-audit.md`.
- **Ограничение по SERP.** Проверено 8 запросов («аренда колонки jbl москва», «аренда моющего пылесоса москва», «аренда gopro москва», «прокат моющего пылесоса для химчистки дивана москва», «прокат Karcher Puzzi Москва», «аренда караоке системы на дом москва», «аренда петличного микрофона москва dji mic», «аренда строительного пылесоса karcher москва»). Доступный инструмент поиска работает только с US-региона: в выдаче в основном olx.kz, lalafo.kg, kaspi.kz и магазины. Это не московская выдача Яндекса и Google, поэтому **настоящую матрицу пересечений топ-10 по этим данным построить нельзя**. Ниже матрица оценочная: она основана на интенте, совпадении товарного набора и формулировок title/H1. Выводы нужно проверить кластеризатором по топ-10 Яндекса (Москва, lr=213) в Topvisor, Key Collector или Rush Analytics, «жёсткий» режим, порог 4.
- Наблюдение из выдачи: по всем 8 запросам в выдаче много маркетплейсов, объявлений и Яндекс Карт, специализированных прокатов мало. Значит, ниша не перегрета, и локальная выдача (Яндекс Карты, 2 точки с рейтингом 5,0) здесь важнее, чем количество статей.

## 1. Текущая карта кластеров (что уже покрыто)

| Кластер | Хаб (pillar) | Посадочные-споки | Карточки | Статьи блога |
|---|---|---|---|---|
| A. Пылесосы и клининг | `/arenda-pylesosov-moskva` | `/arenda-stroitelnogo-pylesosa-posle-remonta-moskva`, `/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva`, `/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva` | puzzi-8-1, puzzi-10-1, wd5, sc4, okami-q75, sushilka-vacmaster | kak-ubrat-stroitelnuyu-pyl, kak-vybrat-pylesos-dlya-uborki-posle-remonta, kak-pochistit-divan-i-kover, puzzi-8-1-ili-10-1, stroitelnij-pylesos-puzzi-ili-paroochistitel, professionalny-pylesy-dlya-klininga, himchistka-salona-avtomobilya, protechka-v-kvartire, uborka-kvartiry-pered-sdachej, robot-mojshchik-okon (10 шт.) |
| B. Камеры | `/arenda-gopro-moskva` | `/arenda-kamery-dlya-puteshestviya-vloga-moskva` | gopro-13, insta360-x5, dji-osmo-pocket-3 | gopro-dlya-nachinayushchih, kakuyu-kameru-vzyat-v-puteshestvie, gopro-ili-insta360, top-3-kamery-dlya-svadeb-2025 (4 шт.) |
| C. Аудио (колонки, караоке, микрофоны) | `/arenda-audiooborudovaniya-moskva` | `/arenda-kolonki-dlya-vecherinki-moskva`, `/arenda-karaoke-komplekta-moskva`, `/arenda-mikrofona-dlya-intervyu-moskva` | jbl-partybox-320, jbl-partybox-710, mikrofony-jbl, dji-mic-2 | kolonka-dlya-vecherinki, kolonka-na-dachu, karaoke-doma, dji-mic-2-dlya-intervyu, kachestvennyj-zvuk-dji-mic-2 (5 шт.) |
| D. Сценарии и мероприятия (межкатегорийный) | `/arenda-tehniki-dlya-meropriyatiya-moskva` | нет | нет | top-3-kamery-dlya-svadeb-2025 (фактически) |
| E. Сервис и локальность (Москва) | главная `/` | `/arenda-tehniki-u-metro-volzhskaya-kuzminki`, `/arenda-tehniki-u-metro-dinamo`, `/samovyvoz-24-7-postamat`, `/arenda-tehniki-na-mesyac-moskva`, `/delivery`, `/kak-prohodit-arenda-tehniki`, `/faq` | нет | 5-oshibok-pri-arende-oborudovaniya |

Перекос: кластер A перегружен (10 статей, часть дублирует друг друга), кластеры B и C покрыты статьями слабо, у кластера D нет контентной поддержки.

Замечание по очереди: в `semantic-queue.md` тема «Камера для Reels и Shorts: GoPro, Osmo Pocket или Insta360» отмечена `[x]`, но такого URL в sitemap нет. Вероятно, её закрыли статьёй gopro-ili-insta360. Нужно либо снять отметку, либо явно указать, какой URL её закрывает.

## 2. Каннибализация (оценочная матрица пересечений)

Шкала соответствует методике: 7–10 означает одну страницу (склеить), 4–6 означает один кластер (нужно разнести интенты), 2–3 означает перелинковку, 0–1 означает отдельные страницы. Оценка экспертная, см. раздел 0.

| # | Пара URL | Общий интент / ключ | Оценка | Риск | Решение |
|---|---|---|---|---|---|
| K1 | `/arenda-gopro-moskva` ↔ `/arenda-kamery-dlya-puteshestviya-vloga-moskva` | «аренда камеры/экшн-камеры москва». Одинаковый набор из 3 SKU, одинаковые H2 («…в аренду», «Частые вопросы», «Где получить»), объём около 350 слов | 7–8 | **HIGH** | Разнести интенты. Хаб получает «аренда gopro / экшн-камеры / камеры москва». Спок получает «аренда камеры для влога / для путешествия / osmo pocket 3 аренда». В споке на первом месте Osmo Pocket 3 и готовые комплекты (камера + DJI Mic 2 + карта + пауэрбанк), отдельные FAQ про поездку. Если отличающийся контент дать не получится, сделать 301 на хаб |
| K2 | `/blog/kakuyu-kameru-vzyat-v-puteshestvie-gopro-dji-insta360` ↔ `/blog/gopro-ili-insta360-chto-vzyat-dlya-poezdki-sporta-i-bloga` | «какую камеру взять в поездку». Одни и те же 3 модели, обе статьи про поездку | 7 | **HIGH** | Сузить вторую статью до чистого сравнения «GoPro 13 vs Insta360 X5» и убрать «поездку» из title и H1. Путешествия оставить только за первой статьёй |
| K3 | blog travel-статьи ↔ `/arenda-kamery-dlya-puteshestviya-vloga-moskva` | «камера для путешествия» | 4–5 | MED | Статьи информационные, посадочная коммерческая: в title статей должно быть «как выбрать», в title посадочной «аренда … москва». Из обеих статей нужна обязательная ссылка на посадочную с анкором «аренда камеры для путешествия» |
| K4 | `/blog/kak-vybrat-pylesos-dlya-uborki-posle-remonta` ↔ `/blog/kak-ubrat-stroitelnuyu-pyl-posle-remonta` | «пылесос / уборка после ремонта». У первой статьи H2 «Когда нужен строительный…», «Когда добавить Puzzi», «Когда нужен пароочиститель» | 7 | **HIGH** | Склеить: 301 с kak-vybrat… на kak-ubrat…, перенеся уникальные блоки («На сколько дней брать», «Частые ошибки»). В каталоге всего одна строительная модель (WD5), поэтому отдельная статья «как выбрать» пользы не даёт |
| K5 | `/blog/stroitelnij-pylesos-puzzi-ili-paroochistitel-chto-vzyat` ↔ kak-vybrat-pylesos-dlya-uborki-posle-remonta ↔ uborka-kvartiry-pered-sdachej | «что взять для уборки» | 5 | MED | После K4 оставить: «что взять» как сравнение 3 типов техники и «перед сдачей» как сценарий на один день. **Не создавать** тему из очереди «Чем отличается строительный пылесос от моющего»: она полностью совпадает со stroitelnij-pylesos-puzzi-ili-paroochistitel, её лучше сделать H2 внутри этой статьи |
| K6 | `/blog/professionalny-pylesy-dlya-klininga` ↔ `/arenda-pylesosov-moskva` | «профессиональный пылесос для уборки», общий интент без сценария | 4 | MED | Переписать статью под отдельный интент «Клининг или аренда техники: что выгоднее» (в статье уже есть раздел «Стоимость: клининг vs аренда»). Slug сохранить. Это одновременно закрывает пропуск №1 из раздела 4 без новой страницы |
| K7 | `/blog/kachestvennyj-zvuk-dlya-video-dji-mic-2` ↔ `/blog/dji-mic-2-dlya-intervyu-kak-zapisat-chistyj-zvuk-bez-studii` | «dji mic 2 чистый звук» | 6–7 | **HIGH** | Перепрофилировать первую в «DJI Mic 2: настройка, режимы и подключение к телефону и камере» (инструкция), вторую оставить под интервью. Убрать «в 2025» из title и H1 (сейчас ноябрь 2026, год устарел) |
| K8 | `/blog/kolonka-dlya-vecherinki-kakuyu-jbl-partybox-vzyat-v-arendu` ↔ `/arenda-kolonki-dlya-vecherinki-moskva` | «колонка для вечеринки + аренда». В title статьи есть слово «в аренду» | 5–6 | MED-HIGH | Убрать «в аренду» из title статьи, сделать «Как выбрать JBL PartyBox: 320 или 710 — мощность, гости, помещение». Коммерческий ключ оставить за посадочной |
| K9 | `/arenda-audiooborudovaniya-moskva` ↔ `/arenda-kolonki-dlya-vecherinki-moskva` | «аренда колонки jbl москва». Title хаба «Аренда колонок JBL и аудиооборудования», title спока «…| JBL PartyBox» | 5 | MED | Хаб получает «аренда аудиооборудования / звука / звукового оборудования москва», «JBL» из начала title хаба убрать. Спок получает «аренда колонки jbl / jbl partybox москва» и «колонки для вечеринки» |
| K10 | `/blog/karaoke-doma-komplekt-jbl-partybox-i-dva-mikrofona` ↔ `/arenda-karaoke-komplekta-moskva` | «караоке комплект» | 4 | LOW-MED | Различие допустимо: статья «караоке дома: как организовать», посадочная «аренда караоке москва». Нужна обязательная ссылка из статьи на посадочную в первом экране |
| K11 | `/blog/top-3-kamery-dlya-svadeb-2025` ↔ тема очереди «Что взять для съемки свадьбы гостю» | «камера на свадьбу» | 7 | MED (будущая) | Не создавать новую статью: обновить существующую (убрать «2025» из H1 и title, slug оставить, добавить DJI Mic 2) и подвесить к кластеру D |
| K12 | `/arenda-tehniki-dlya-meropriyatiya-moskva` ↔ `/arenda-audiooborudovaniya-moskva` | «аренда звука на мероприятие» | 3–4 | LOW | Посадочная мероприятий собирает сценарии (праздник, выступление, съёмка) и ведёт в споки. Ссылки должны идти в обе стороны |
| K13 | `/arenda-pylesosov-moskva` ↔ `/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva` | «аренда моющего пылесоса москва». H1 хаба: «Аренда пылесоса в Москве — Karcher Puzzi и WD5» | 4–5 | MED | H1 и title хаба оставить общими («аренда пылесоса / прокат пылесоса москва»), «Puzzi» убрать из H1 хаба. Спок получает «аренда моющего пылесоса / puzzi / для химчистки дивана» |
| K14 | Карточки `/equipment/*` ↔ посадочные | Модельные запросы («аренда karcher puzzi 10/1», «аренда jbl partybox 710», «аренда gopro 13») | 2–3 | LOW | Модельные запросы закреплены за карточками, сценарные за посадочными. Нужны ссылки в обе стороны: карточка → спок сценария (сейчас карточки ведут только на хаб и один гайд) |

## 3. Главная архитектурная проблема: статический HTML «сплющивает» граф ссылок

В SPA-версии (`Category*Page.tsx`, `*RentalPage.tsx`) хабы и споки связаны блоками сценариев: «Гайд по GoPro», «Камера для поездки» и т. п. Но **в статическом HTML, который отдаётся без JS (`generate-static-route-entrypoints.js`), этих связей нет**:

1. **Хабы → споки.** У `/arenda-gopro-moskva` в отданном HTML нет ссылки на `/arenda-kamery-dlya-puteshestviya-vloga-moskva` и ни на одну статью (проверено через WebFetch: фраз «Гайд по GoPro» и «Камера для поездки» в HTML нет, около 350 слов). У `/arenda-pylesosov-moskva` нет ссылок на 3 своих спока. Есть только карточки, сквозное меню из 3 хабов и футер.
2. **Статьи.** Функция `markdownToPlainSections()` (строка ~1109) делает `.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')`, то есть **вырезает все контекстные ссылки из тела статьи**, и отдаёт только первые 6 абзацев. Работа прошлого аудита (3+ внутренние ссылки на статью) в отдаваемом HTML не видна.
3. **«Другие статьи»** — это одни и те же 5 последних статей для всех страниц (`articleLinks(remoteData, 5)`, без учёта темы). Статья про DJI Mic 2 ссылается на робот-мойщик окон и протечку, а не на свой кластер.
4. Блок «Полезные ссылки» в каждой статье одинаковый: 3 хаба и `/booking`. Статья про колонки ссылается на пылесосы, на свой спок не ссылается.

Google выполняет JS и, скорее всего, видит SPA-ссылки. Яндекс рендерит JS выборочно, для молодого сайта стоит считать, что он опирается на исходный HTML. **Для Яндекса структура hub/spoke сейчас практически плоская.** Это самая выгодная правка в моей зоне: изменение кода без новых страниц.

Что сделать (для Frontend/Backend, правка `generate-static-route-entrypoints.js`):
- В `markdownToPlainSections` сохранять внутренние ссылки (относительные `/…`) как `<a href>`, внешние оставлять текстом. Отдавать весь текст статьи, а не только 6 абзацев, или хотя бы H2-разделы.
- В `buildArticleBody` вместо 3 сквозных хабов ставить хаб своего кластера, профильный спок и 2–3 статьи того же кластера (категория статьи уже есть в БД, как и маппинг в `BlogArticlePage.tsx` и `getCategoryGuideHref`).
- В `routeSections` для каждого хаба добавить блок «Подберите под задачу» со ссылками на споки и 2–3 гайда, а для каждого спока — блок «Ещё по теме» (хаб, соседний спок, 2 статьи). Ссылки взять из матрицы в разделе 6.

## 4. Пропущенные темы (максимум 9 новых единиц, без тонких страниц)

Приоритет: деньги рядом с запросом, есть SKU в каталоге, нет пересечения с существующими URL. Для каждой темы указан тип страницы и интент.

| # | Тема / основной ключ | Тип | Интент | Кластер | Почему стоит делать | Анти-дубль |
|---|---|---|---|---|---|---|
| 1 | «Аренда пылесоса для сбора воды и сушилки ковров после затопления в Москве» (аренда водососа / осушителя / сушилки для ковра) | Посадочная (сценарий) | Commercial | A | Срочный, «горячий» запрос. Есть WD5 (влажная уборка, бак 25 л) и Vacmaster. Сейчас есть только статья про протечку, коммерческой страницы нет | Статья про протечку остаётся информационной и ведёт на новую посадочную |
| 2 | «Аренда робота-мойщика окон в Москве» | **Не новая страница**: усилить карточку `/equipment/okami-q75` (title, H1, FAQ, сезонный текст) | Commercial | A | Один SKU, отдельная посадочная получится тонкой. Сезонный спрос весной и осенью | Блог-статья уже есть, ей нужна ссылка на карточку |
| 3 | «Химчистка дивана: сделать самому с арендой Puzzi или заказать клининг — что выгоднее» | Перепрофилирование `professionalny-pylesy-dlya-klininga` (K6) | Commercial investigation | A | Самая конверсионная информационная тема для Puzzi | Не пересекается с kak-pochistit (это инструкция) |
| 4 | «Чем заправлять Karcher Puzzi: средство, пропорции, сколько нужно на диван и ковёр» | Статья | Informational (how-to) | A | Частый вопрос перед арендой, снижает нагрузку на поддержку, ведёт на карточки Puzzi | В kak-pochistit и puzzi-8-1-ili-10-1 этому посвящено не больше абзаца |
| 5 | «Пароочиститель Karcher SC4: что можно и что нельзя чистить паром» | Статья (спок к посадочной пароочистителя) | Informational | A (подкластер «пар») | У подкластера «пароочиститель» есть только посадочная и сравнение. Вопросы «можно ли паром ламинат / кожу / плиту» массовые | Не пересекается со «что взять» |
| 6 | «Insta360 X5 для новичка: как снимать 360° и делать ролик в приложении» | Статья | Informational | B | Пара к гайду по GoPro. У кластера B мало статей, есть SKU | GoPro-гайд и сравнения не затрагивает |
| 7 | «Как снять подводное видео на GoPro: море, бассейн, снорклинг» | Статья (сезонная, публиковать к весне) | Informational | B | Отпускной сценарий: аренда на неделю или месяц, связка с `/arenda-tehniki-na-mesyac-moskva` | Отдельный интент «под водой» |
| 8 | «Как снять обзор или Reels на телефон с внешним микрофоном» (из очереди, Medium) | Статья | Informational | C (микрофоны) с мостом в B | Связывает DJI Mic 2 и Osmo Pocket, закрывает отметку «Reels» в очереди | Не пересекается с двумя статьями про Mic 2 после K7 |
| 9 | «Звук для выступления, презентации или тоста: колонка с микрофоном на 20–100 человек» | Статья-спок для кластера D | Informational / commercial investigation | D (мероприятия) | Даёт посадочной мероприятий контентную опору (сейчас 0 статей). Есть PartyBox и JBL-микрофоны | Отличие от «колонки для вечеринки»: речь, а не музыка |

Чего **не** делать: новые метро-страницы без физической точки, отдельные страницы под каждый синоним («прокат» и «аренда»), страница «чем отличается строительный пылесос от моющего» (K5), отдельная статья про съёмку свадьбы гостем (K11), «камера для Reels» как отдельная посадочная (это интент спока K1).

Микрофоны: вместо новой страницы расширить `/arenda-mikrofona-dlya-intervyu-moskva` до «Аренда микрофона в Москве: петличные DJI Mic 2 и радиомикрофоны JBL» (H1 и title). Slug можно оставить. Тогда общий запрос «аренда микрофона москва» получит целевую страницу, а «для интервью» станет H2 и сценарием. Альтернатива — отдать «аренда микрофона» хабу аудио, но он перегружен колонками.

## 5. Целевая схема hub-and-spoke (закрепление ключей)

```
/ (главная: «аренда техники москва», «прокат техники москва»)
├── A  /arenda-pylesosov-moskva  [аренда/прокат пылесоса москва]
│   ├── /arenda-stroitelnogo-pylesosa-posle-remonta-moskva  [аренда строительного пылесоса]
│   │     blog: kak-ubrat-stroitelnuyu-pyl (+301 из kak-vybrat-pylesos…), uborka-kvartiry-pered-sdachej
│   ├── /arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva  [аренда моющего пылесоса / puzzi]
│   │     blog: kak-pochistit-divan, puzzi-8-1-ili-10-1, himchistka-salona-avto, NEW#3 (клининг vs аренда), NEW#4 (чем заправлять Puzzi)
│   ├── /arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva  [аренда пароочистителя]
│   │     blog: stroitelnij-pylesos-puzzi-ili-paroochistitel (сравнение типов), NEW#5 (что чистить паром)
│   └── NEW#1 посадочная «после затопления»  [аренда пылесоса для воды / сушилки ковров]
│         blog: protechka-v-kvartire; карточки wd5, sushilka-vacmaster
│     (карточка okami-q75 + blog robot-mojshchik-okon: прямой спок хаба)
├── B  /arenda-gopro-moskva  [аренда gopro / экшн-камеры / камеры москва]
│   ├── /arenda-kamery-dlya-puteshestviya-vloga-moskva  [камера для влога/путешествия, osmo pocket 3]
│   │     blog: kakuyu-kameru-vzyat-v-puteshestvie, NEW#7 (подводная съёмка)
│   └── blog: gopro-dlya-nachinayushchih, gopro-ili-insta360 (только сравнение), NEW#6 (Insta360 X5)
├── C  /arenda-audiooborudovaniya-moskva  [аренда аудиооборудования / звука]
│   ├── /arenda-kolonki-dlya-vecherinki-moskva  [аренда колонки jbl / partybox / для вечеринки]
│   │     blog: kolonka-dlya-vecherinki (→ «как выбрать»), kolonka-na-dachu
│   ├── /arenda-karaoke-komplekta-moskva  [аренда караоке]
│   │     blog: karaoke-doma
│   └── /arenda-mikrofona-dlya-intervyu-moskva  [аренда микрофона (расширить), петличка, для интервью]
│         blog: dji-mic-2-dlya-intervyu, kachestvennyj-zvuk (→ настройка DJI Mic 2), NEW#8 (Reels с микрофоном)
├── D  /arenda-tehniki-dlya-meropriyatiya-moskva  [аренда техники/звука на мероприятие]  (межкластерный)
│     → споки C (колонки, караоке, микрофон) + B (камеры); blog: top-3-kamery-dlya-svadeb (обновить), NEW#9 (звук для выступления)
└── E  сервис/локальность: metro-volzhskaya, metro-dinamo, samovyvoz-24-7, na-mesyac, delivery, kak-prohodit, faq
      blog: 5-oshibok-pri-arende
```

Итого: 5 кластеров, 4 хаба плюс сервисный, 2–4 спока на кластер. Добавляется не больше 1 новой посадочной (#1) и 7 статей (#4–#9, а #3 — перепрофилирование). Ещё 1 статья склеивается (K4).

## 6. Матрица внутренних ссылок (обязательные, рекомендуемые, опциональные)

Обязательные ссылки (M) должны присутствовать **в исходном HTML** (см. раздел 3).

### M — обязательные, в обе стороны «хаб ↔ спок»
| От | К | Анкор (пример) |
|---|---|---|
| `/arenda-pylesosov-moskva` | 3 посадочных-спока + NEW#1 + `/equipment/okami-q75` | «строительный пылесос после ремонта», «моющий пылесос для дивана», «пароочиститель для кухни и ванной», «пылесос для воды после протечки», «робот для мытья окон» |
| каждый спок A | `/arenda-pylesosov-moskva` | «все пылесосы и клининговая техника в аренду» |
| `/arenda-gopro-moskva` | `/arenda-kamery-dlya-puteshestviya-vloga-moskva`, gopro-dlya-nachinayushchih, gopro-ili-insta360 | «камера для путешествия и влога», «гайд по GoPro», «GoPro или Insta360» |
| `/arenda-kamery-dlya-puteshestviya-vloga-moskva` | `/arenda-gopro-moskva` | «все экшн-камеры в аренду» |
| `/arenda-audiooborudovaniya-moskva` | колонки, караоке, микрофон | «колонка JBL PartyBox для вечеринки», «караоке-комплект», «микрофон в аренду» |
| споки C | `/arenda-audiooborudovaniya-moskva` | «всё аудиооборудование» |
| `/arenda-tehniki-dlya-meropriyatiya-moskva` | колонки, караоке, микрофон, `/arenda-gopro-moskva` | по сценариям |
| каждая статья | свой спок (не хаб) + 1–2 карточки | см. дерево в разделе 5 |
| каждый спок | 2+ статьи своей ветки | «как выбрать…», «инструкция…» |

### R — рекомендуемые (внутри кластера)
- kak-ubrat-stroitelnuyu-pyl ↔ uborka-kvartiry-pered-sdachej ↔ stroitelnij-pylesos-puzzi-ili-paroochistitel
- kak-pochistit-divan ↔ puzzi-8-1-ili-10-1 ↔ himchistka-salona-avto ↔ NEW#3 ↔ NEW#4
- protechka-v-kvartire ↔ NEW#1 ↔ `/equipment/sushilka-vacmaster` ↔ `/equipment/karcher-wd5`
- kakuyu-kameru-vzyat-v-puteshestvie ↔ gopro-ili-insta360 ↔ gopro-dlya-nachinayushchih ↔ NEW#6 ↔ NEW#7
- kolonka-dlya-vecherinki ↔ kolonka-na-dachu ↔ karaoke-doma
- dji-mic-2-dlya-intervyu ↔ kachestvennyj-zvuk-dji-mic-2 ↔ NEW#8
- top-3-kamery-dlya-svadeb ↔ NEW#9 ↔ `/arenda-tehniki-dlya-meropriyatiya-moskva`
- Карточки → **спок сценария**, а не только хаб. Сейчас `getCategoryLandingHref` возвращает только хаб. Предлагаемое соответствие: puzzi-* → моющий спок, wd5 → строительный спок, sc4 → спок пароочистителя, osmo-pocket-3 → спок влога, partybox-* → спок колонок и караоке, mikrofony-jbl → караоке, dji-mic-2 → спок микрофона.

### O — опциональные (между кластерами)
- NEW#8 (Reels с микрофоном) → `/arenda-kamery-dlya-puteshestviya-vloga-moskva` (камера + микрофон)
- `/arenda-mikrofona-dlya-intervyu-moskva` ↔ `/arenda-kamery-dlya-puteshestviya-vloga-moskva` (комплект для влога; в SPA ссылка уже есть, в статику её нужно добавить)
- kolonka-na-dachu → `/arenda-tehniki-na-mesyac-moskva` (сезон на даче)
- NEW#7 → `/arenda-tehniki-na-mesyac-moskva` (отпуск)
- все споки → ближайшая точка: `/arenda-tehniki-u-metro-volzhskaya-kuzminki`, `/arenda-tehniki-u-metro-dinamo` (уже сквозные)

Проверка входящих ссылок: при этой матрице каждый спок получает не меньше 3 входящих (хаб, 2+ статьи, карточки). Страниц-сирот нет: NEW#1 получает ссылки от хаба A, статьи про протечку, карточек WD5 и Vacmaster.

## 7. JSON-совместимые находки (для audit-data.json → Content Architecture)

```json
{
  "category": "Content Architecture",
  "serp_overlap_method": "estimated (intent + SKU set + title/H1); live Moscow Yandex/Google top-10 unavailable from US-only search tool",
  "clusters": [
    {"id": "A", "pillar": "/arenda-pylesosov-moskva", "spokes": ["/arenda-stroitelnogo-pylesosa-posle-remonta-moskva", "/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva", "/arenda-paroochistitelya-dlya-kuhni-plitki-vannoy-moskva", "NEW:arenda-pylesosa-dlya-vody-i-sushilki-posle-zatopleniya-moskva"], "blog_count": 10},
    {"id": "B", "pillar": "/arenda-gopro-moskva", "spokes": ["/arenda-kamery-dlya-puteshestviya-vloga-moskva"], "blog_count": 4},
    {"id": "C", "pillar": "/arenda-audiooborudovaniya-moskva", "spokes": ["/arenda-kolonki-dlya-vecherinki-moskva", "/arenda-karaoke-komplekta-moskva", "/arenda-mikrofona-dlya-intervyu-moskva"], "blog_count": 5},
    {"id": "D", "pillar": "/arenda-tehniki-dlya-meropriyatiya-moskva", "spokes": [], "blog_count": 1},
    {"id": "E", "pillar": "/", "spokes": ["/arenda-tehniki-u-metro-volzhskaya-kuzminki", "/arenda-tehniki-u-metro-dinamo", "/samovyvoz-24-7-postamat", "/arenda-tehniki-na-mesyac-moskva"], "blog_count": 1}
  ],
  "findings": [
    {"id": "CA-1", "severity": "high", "title": "Static HTML strips in-body article links and hub->spoke links", "evidence": "generate-static-route-entrypoints.js markdownToPlainSections() replaces [text](url) with text; hub routeSections contain only product lists", "fix": "render internal <a> in static body; add topical related blocks per cluster"},
    {"id": "CA-2", "severity": "high", "title": "Cannibalization: camera hub vs travel/vlog landing (same 3 SKUs, same structure)", "urls": ["/arenda-gopro-moskva", "/arenda-kamery-dlya-puteshestviya-vloga-moskva"], "fix": "split intent (action-cam vs vlog/travel kits) or 301"},
    {"id": "CA-3", "severity": "high", "title": "Duplicate blog posts: renovation vacuum", "urls": ["/blog/kak-vybrat-pylesos-dlya-uborki-posle-remonta", "/blog/kak-ubrat-stroitelnuyu-pyl-posle-remonta"], "fix": "merge + 301"},
    {"id": "CA-4", "severity": "high", "title": "Duplicate blog posts: travel camera", "urls": ["/blog/kakuyu-kameru-vzyat-v-puteshestvie-gopro-dji-insta360", "/blog/gopro-ili-insta360-chto-vzyat-dlya-poezdki-sporta-i-bloga"], "fix": "re-scope second to pure GoPro vs Insta360 comparison"},
    {"id": "CA-5", "severity": "high", "title": "Duplicate blog posts: DJI Mic 2; outdated year 2025 in title", "urls": ["/blog/kachestvennyj-zvuk-dlya-video-dji-mic-2", "/blog/dji-mic-2-dlya-intervyu-kak-zapisat-chistyj-zvuk-bez-studii"], "fix": "re-scope first to setup guide, drop year"},
    {"id": "CA-6", "severity": "medium", "title": "Blog vs landing: 'колонка для вечеринки ... в аренду'", "urls": ["/blog/kolonka-dlya-vecherinki-kakuyu-jbl-partybox-vzyat-v-arendu", "/arenda-kolonki-dlya-vecherinki-moskva"], "fix": "remove commercial modifier from blog title"},
    {"id": "CA-7", "severity": "medium", "title": "Hub titles steal spoke keywords (JBL in audio hub, Puzzi in vacuum hub H1)", "fix": "generalize hub title/H1"},
    {"id": "CA-8", "severity": "medium", "title": "'Other articles' block is identical (latest 5) on every page, not topical", "fix": "same-cluster related articles"},
    {"id": "CA-9", "severity": "medium", "title": "Equipment cards link only to category hub, not to scenario spoke", "fix": "map SKU -> scenario landing"},
    {"id": "CA-10", "severity": "medium", "title": "Event cluster D has no supporting content; top-3-kamery-dlya-svadeb-2025 outdated", "fix": "refresh + NEW#9"},
    {"id": "CA-11", "severity": "low", "title": "Queue inconsistency: 'Камера для Reels и Shorts' marked done, no URL", "fix": "fix queue status"}
  ],
  "new_topics_max": 9,
  "merges": [{"from": "/blog/kak-vybrat-pylesos-dlya-uborki-posle-remonta", "to": "/blog/kak-ubrat-stroitelnuyu-pyl-posle-remonta", "type": "301"}],
  "rescopes": ["/blog/professionalny-pylesy-dlya-klininga", "/blog/gopro-ili-insta360-chto-vzyat-dlya-poezdki-sporta-i-bloga", "/blog/kachestvennyj-zvuk-dlya-video-dji-mic-2", "/blog/kolonka-dlya-vecherinki-kakuyu-jbl-partybox-vzyat-v-arendu", "/blog/top-3-kamery-dlya-svadeb-2025", "/arenda-mikrofona-dlya-intervyu-moskva"]
}
```

## 8. Порядок внедрения (предложение; нужно подтверждение владельца для 301 и смены title)

1. CA-1: ссылки в статическом HTML (код, без новых страниц). Максимальный эффект для Яндекса.
2. CA-2…CA-7: разнести интенты (title, H1, 1 склейка с 301). Это изменения с SEO-риском, нужно согласие владельца.
3. CA-8, CA-9: тематические блоки «Ещё по теме» и маппинг карточка → спок.
4. Новый контент: NEW#1 (посадочная после затопления) и NEW#3 (перепрофилирование), затем #4, #5, #8, #9, затем #6, а #7 к весне.
5. Перед всем этим: кластеризация реального семантического ядра по топ-10 Яндекса (Москва), чтобы подтвердить оценки K1–K14.

Источники SERP-проверки (не по Москве, использовались только как сигнал о составе выдачи): allfordj.ru, doctorhead.ru, market.yandex.ru, ichip.ru, price.ru, yandex.com/maps, olx.kz, lalafo.kg, obyavleniya.kaspi.kz, cian.ru.
