# Готовность для AI-агентов — vozmimenya.ru (проверка 2026-11-09)

Оценка: **82/100** (оценка аудитора; не путать с Lighthouse и с Agent-UX эвристикой).
Agent-UX эвристика (скрипт, статус complete): главная 100, карточка /equipment/karcher-sc4 100, /booking 97.

## Lighthouse Agentic Browsing
Не получено: PSI вернул HTTP 429 (квота без API-ключа) для mobile и desktop. Версия Lighthouse и X/N неизвестны, не оцениваю. Проверить: настроить Google API key (`/seo google setup`) и запустить `lighthouse_agentic.py https://vozmimenya.ru --strategy both`.

## Политика доступа (robots.txt)
- Обучение (GPTBot, ClaudeBot): Allow /, закрыты только /admin/ и /api/. Content-Signal нет, `ai-train` не заявлен.
- Поиск (OAI-SearchBot, PerplexityBot, Googlebot, Bingbot, Yandex): разрешён.
- Действия по запросу пользователя (ChatGPT-User, Claude-User): разрешён. Perplexity-User и Google-Agent отдельных групп не имеют (по документации вендоров robots.txt они часто игнорируют).
- Note: у /booking нет Disallow, всё ок. User-agent: * содержит Allow-список, но Allow: / тоже есть — лишнее, но безвредное.

## Находки

### P2 — В форме /booking поле «Оборудование *» без доступного имени
- Доказательство: a11y-дерево, combobox с name ''. В SelfServiceBookingPage.tsx:~383 стоит `<div className="block"><span>Оборудование *</span><select ...>` — span не связан с select. Скрипт также насчитал 1 безымянный интерактивный узел.
- Влияние: агент не поймёт, что именно этот select выбирает товар (это ключевой шаг брони).
- Рекомендация: заменить div на `<label>` или добавить `id`+`htmlFor` / `aria-label="Оборудование"`.
- Проверка: `agent_ux_check.py https://vozmimenya.ru/booking --json` -> unnamed_interactive = 0.

### P2 — Поля дат/времени: части даты называются «Day Day», «Hours Hours» и т.п.
- Доказательство: a11y-дерево /booking: spinbutton «Day Day / Month Month / Year Year», «Show date picker». Внутри `<input type="date">` внутри `<label>` — нативное поведение Chromium, агенту нужны точные значения.
- Рекомендация: добавить `aria-label` («Дата начала аренды», «Дата возврата», «Время получения/возврата») и `autocomplete`/`name` как есть; формат ISO yyyy-mm-dd при заполнении агентом работает, держать `min`.
- Проверка: a11y-дерево, поля имеют осмысленные имена.

### P2 — /booking: сырой HTML почти пустой (102 слова, нет `<title>` в исходном ответе)
- Доказательство: curl /booking — 12.9 КБ SPA-оболочка; форма появляется только после JS. На главной (283 слов) и карточке (416 слов) контент в сыром HTML есть (server-rendered pass).
- Влияние: агенты без JS (многие fetch-агенты) не увидят форму и её поля; Lighthouse/браузерные агенты увидят.
- Рекомендация: пререндер /booking (в репо есть nginx-prerender.conf для /equipment) либо SSR хотя бы заголовка, title и описания шагов; в llms.txt уже есть описание брони.
- Проверка: `curl -s https://vozmimenya.ru/booking | grep -c "Отправить бронь"` > 0.

### P3 — Поля формы читаемы, подписи есть
Положительно: подписи у ФИО, телефона, способов получения (radio), согласий (3 checkbox), кнопка «Отправить бронь» — role=button с именем. Нет div-кнопок. Агент способен: выбрать оборудование (после исправления подписи), даты, контакты, отправить. Отправку не проверял (реальных заявок не создавал).

### P3 — Content-Signal не заявлен
- Доказательство: в robots.txt нет Content-Signal. Это драфт/предпочтение (Cloudflare Content Signals + IETF draft, проверено 2026-09-23 по vendor-matrix), Google его не применяет.
- Рекомендация (опционально): `Content-Signal: search=yes, ai-input=yes, ai-train=no` в нужных группах, если владелец хочет запретить обучение. Решение по политике — за владельцем.

### P3 — Возможности (не дефекты)
- llms.txt: есть (200, text/plain, 8.5 КБ, llms-full.txt тоже 200), проходит правила Lighthouse. Содержит ссылки на категории; стоит добавить ссылку на /equipment/ каталог и условия оплаты/залога, если ещё нет.
- Markdown-отдача: нет `Accept: text/markdown` и `.md`-соседей (/index.md 404); альтернатива llms.txt есть. Возможность, ни один массовый агент не подтверждён.
- WebMCP (W3C CG draft, не стандарт; проверено 2026-09-23): 0 registerTool. Возможность: инструменты search_equipment / create_booking_draft на той же логике, что форма. Только после согласования (бронь создаёт заявку).
- ai-catalog.json (/.well-known/ai-catalog.json, драфт): 404. API Catalog, OAuth, agent-card, UCP: 404, нужны только при наличии соответствующих сервисов. Web Bot Auth (proposal): не используется.
- 404-пробa: неизвестный URL отдаёт настоящий 404 (soft-404 нет).

## Итог по оценке
Сильно: SSR главной и карточек, открытый robots для AI-агентов, llms.txt, семантичные кнопки/ссылки, форма с подписями. Минусы: неподписанный select товара, нестандартные имена полей дат, /booking без SSR, не получен Lighthouse-балл (PSI 429).
