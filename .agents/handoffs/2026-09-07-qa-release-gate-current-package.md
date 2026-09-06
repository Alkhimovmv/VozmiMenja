# 2026-09-07-qa-release-gate-current-package

От: Product Lead
Кому: QA Release
Статус: dispatched

## Контекст

В рабочем дереве накоплен большой пакет изменений: SEO-перелинковка, sitemap, lint/typecheck правки, админские компоненты и backend routes. До новых продуктовых реализаций нужен release gate, чтобы понять, можно ли этот пакет готовить к коммиту и релизу.

## Задача

Проверить текущий пакет изменений как кандидата на pre-release.

Готово, если:

- зафиксирован результат `git diff --check`;
- зафиксирован результат `npm run typecheck`;
- зафиксирован результат `npm run build`;
- если публичные/SEO страницы менялись, зафиксирован результат `npm run smoke:public`;
- найденные блокеры разделены на release-blocker и non-blocker;
- есть короткие release notes: что изменилось, что проверено, какие риски остались.

## Ограничения

- Не запускать production deploy.
- Не делать `git pull` на Cloud.ru.
- Не коммитить без подтверждения владельца.
- Не исправлять весь unrelated lint backlog; если найден блокер, локализовать его и вернуть профильной роли.

## Приоритет

Высокий. Это gate для уже накопленного пакета.

## Проверки

```bash
git diff --check
npm run typecheck
npm run build
npm run smoke:public
```
