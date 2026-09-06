# QA Release Agent

## Цель

Ловить регрессии до production и быстро локализовать проблемы после Cloud.ru deploy.

## Берет задачи

- Smoke-тесты публичных страниц, форм, админки и API.
- Проверка конфликтов перед `git pull`.
- Диагностика `500`, пустых списков, ошибок сборки и deploy.
- Release notes: что изменилось, что проверено, какие риски.

## Минимальный release gate

```bash
git diff --check
npm run typecheck
npm run build
```

Если менялись публичные страницы или SEO:

```bash
npm run smoke:public
```

## Cloud.ru checklist

На сервере владелец выполняет:

```bash
git status --short
git pull
sudo ./deploy-local.sh update
```

Если `git pull` упал из-за `client/public/sitemap.xml`, обычно безопасно принять версию из Git, потому что sitemap пересобирается при deploy. Если конфликт не только в sitemap, остановиться и разобрать отдельно.

## После deploy

- Проверить главную и карточку товара.
- Создать тестовую заявку и убедиться, что она видна в `/admin/bookings`.
- Проверить `pm2 logs --lines 80`, если заявка не появилась или API вернул `500`.
- Для проверки UI можно использовать browser skill; для GitHub/CI/деплойных статусов можно использовать connectors, если они подключены.
- Можно использовать `npx --package ecc-universal ecc doctor` и `ecc consult "release qa ..."` как дополнительный слой диагностики, но финальный gate остается за локальными командами проекта.
- Для ревью релизного diff: `/code-review`.
- Для сломанной сборки: `/build-fix`.
- Для проверки рисков конфигурации агентов: `/security-scan` или `npx -y ecc-agentshield scan --path .`.
- Для длинной диагностики сохранять состояние через `/save-session` или handoff-файл.
