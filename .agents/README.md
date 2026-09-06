# VozmiMenja Multi-Agent Workspace

Эта папка помогает вести проект как несколько рабочих чатов/агентов, но с одним общим репозиторием и единым release-gate.

## Как делить чаты

1. `Product Lead` остается главным штабом: приоритеты, скоуп, релизы, спорные решения.
2. `Frontend UX` берет основной сайт, админку, формы, конверсию и визуальные улучшения.
3. `Backend Automation` берет API, базу, заявки, уведомления, интеграции и деплойную устойчивость.
4. `SEO Content` берет блог, посадочные, sitemap, schema, внутренние ссылки и семантику.
5. `QA Release` проверяет регрессии, smoke, сборку, Cloud.ru checklist и проблемные логи.

## Правило синхронизации

- Каждый агент перед работой читает `AGENTS.md`, `.agents/board.md` и свой файл из `.agents/roles/`.
- Каждый агент может использовать доступные skills, MCP, connectors и plugins, если они явно подходят задаче. Перед использованием skill агент читает его `SKILL.md`.
- Если задача затрагивает чужую область, агент оставляет handoff в `.agents/handoffs/`.
- Перед push/deploy все изменения должны пройти через `QA Release` или хотя бы release checklist из `.agents/roles/qa-release.md`.
- Production обновляется только владельцем проекта: `git pull` затем `sudo ./deploy-local.sh update`.

## ECC Universal / Skills / MCP / Connectors / Plugins

- `ecc-universal` доступен как CLI: `npx --package ecc-universal ecc <command>`.
- Агенты могут использовать ECC для консультаций, подбора skills/components, диагностики и onboarding-планов: `ecc consult`, `ecc catalog`, `ecc doctor`, `ecc plan`.
- ECC-команды, которые меняют файлы или install-state, сначала запускать только с `--dry-run`; применять изменения можно только после явного подтверждения владельца.
- `skills` использовать для повторяемых рабочих процессов: документы, сайты, браузер, исследования, установки новых skills.
- `MCP/connectors` использовать для внешних систем и живых данных: GitHub, Метрика/Search Console, Telegram, таблицы, таск-трекеры, если они подключены.
- `plugins` использовать как набор skills/connectors, а не как магическую замену проверкам.
- Не хранить секреты в skill-файлах и не раскрывать токены в ответах.
- Если нужного connector/plugin нет в текущей среде, агент фиксирует это и предлагает безопасный fallback.

## ECC Workflows

Начинать нужно с workflow, а не с полного каталога ECC.

| Что делаем | Стартовая поверхность |
| --- | --- |
| Новая фича | `/ecc:plan "описать фичу"`, затем `tdd-workflow` |
| Баг | Сначала воспроизвести через failing test или smoke, затем `tdd-workflow` |
| Ревью нового кода | `/code-review` |
| Сломалась сборка | `/build-fix` |
| Чистка кода | `/refactor-clean` |
| Давит контекст | `/context-budget` |
| Длинная сессия закончилась | `/save-session` или `/learn-eval` |
| Вернуться позже | `/resume-session` |
| Аудит agent config | `/security-scan` или `npx -y ecc-agentshield scan --path .` |

Если slash-команды недоступны в текущем harness, использовать CLI fallback:

```bash
npx --package ecc-universal ecc consult "описать задачу и нужный workflow"
npx --package ecc-universal ecc catalog
npx --package ecc-universal ecc doctor
```

Для Claude Code plugin используется namespaced форма: `/ecc:plan "Add authentication"`.
Для manual installs может быть доступна короткая совместимая форма: `/plan "Add authentication"`.

## Быстрый выбор агента

- Не видны заявки, падает API, миграции, уведомления: `backend-automation.md`.
- Неудобная форма, карточки, админка, мобильная версия: `frontend-ux.md`.
- Статьи, SEO, мета, sitemap, перелинковка: `seo-content.md`.
- Что делать дальше, как расставить приоритеты: `product-lead.md`.
- Перед релизом или после ошибки на сервере: `qa-release.md`.

## Стартовые промпты для новых чатов

```md
Ты Product Lead Agent для VozmiMenja. Прочитай AGENTS.md, .agents/README.md, .agents/board.md и .agents/roles/product-lead.md. Используй ECC workflows, если они подходят задаче: /ecc:plan для фич, /context-budget для длинного контекста, /code-review для ревью. Production deploy только после подтверждения владельца.
```

```md
Ты Frontend UX Agent для VozmiMenja. Прочитай AGENTS.md, .agents/README.md, .agents/board.md и .agents/roles/frontend-ux.md. Фокус: сайт, админка, формы, дизайн, конверсия. Для фич начинай с /ecc:plan, для багов сначала воспроизведение, для UI-проверки используй browser skill, если доступен.
```

```md
Ты Backend Automation Agent для VozmiMenja. Прочитай AGENTS.md, .agents/README.md, .agents/board.md и .agents/roles/backend-automation.md. Фокус: API, база, заявки, уведомления, Cloud.ru. Для фич используй /ecc:plan и tdd-workflow, для сборки /build-fix, для диагностики ECC можно ecc doctor/consult.
```

```md
Ты SEO Content Agent для VozmiMenja. Прочитай AGENTS.md, .agents/README.md, .agents/board.md, .agents/roles/seo-content.md и seo-agent/*. Фокус: SEO, блог, посадочные, sitemap. Для инициатив используй /ecc:plan, статьи добавляй через миграции/seed, проверяй checklist, не плодить тонкие страницы.
```

```md
Ты QA Release Agent для VozmiMenja. Прочитай AGENTS.md, .agents/README.md, .agents/board.md и .agents/roles/qa-release.md. Фокус: проверки, релизы, ошибки после deploy. Используй /code-review для diff, /build-fix для сборки, /security-scan или ecc-agentshield для agent/config audit.
```
