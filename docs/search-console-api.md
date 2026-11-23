# Яндекс Вебмастер и Google Search Console: API и переобход

Интеграция решает две задачи:

1. отправляет актуальный `https://vozmimenya.ru/sitemap.xml` в Google Search Console и на приоритетный переобход в Яндекс Вебмастер;
2. выгружает поисковые запросы, страницы, показы, клики, CTR и средние позиции в локальный каталог `seo-agent/exports/`.

## Важное ограничение Google

Обычный Google API key не дает доступа к закрытым данным Search Console. Нужен OAuth access token или service account, добавленный пользователем ресурса `vozmimenya.ru`. Google Indexing API не используется: для обычных страниц проката он не предназначен.

## Подключение

```bash
cp .env.search.example .env.search.local
```

### Яндекс

1. Создать OAuth-приложение Яндекса с доступом к API Вебмастера.
2. Получить OAuth-токен от аккаунта, на котором подтвержден `vozmimenya.ru`.
3. Записать токен только в `.env.search.local` как `YANDEX_WEBMASTER_TOKEN`.

### Google

1. В Google Cloud включить **Search Console API**.
2. Создать service account и скачать JSON-ключ вне репозитория.
3. В Search Console открыть ресурс сайта → **Настройки → Пользователи и разрешения** и добавить `client_email` из JSON как пользователя с полным доступом.
4. Указать абсолютный путь к JSON в `GOOGLE_APPLICATION_CREDENTIALS`. Ресурс по умолчанию: `sc-domain:vozmimenya.ru`.

Если используется OAuth вручную, временный access token можно передать переменной `GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN`.

## Проверка и запуск

```bash
npm run seo:console:status
npm run seo:console:submit
npm run seo:console:export
```

Полный цикл одной командой:

```bash
npm run seo:console:all
```

Экспорт по умолчанию охватывает последние 90 дней и создает:

- `gsc-query-pages.csv` и исходный JSON;
- `gsc-daily.json`;
- `yandex-popular-queries.csv` и исходный JSON;
- `yandex-query-history.json`;
- `summary.json` с результатом подключения и запуска.

Период меняется через `SEARCH_EXPORT_DAYS`. Данные и ключи исключены из Git.
