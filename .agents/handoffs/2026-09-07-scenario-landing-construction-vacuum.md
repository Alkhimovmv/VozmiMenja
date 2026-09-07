# 2026-09-07 Scenario Landing Construction Vacuum

От: Product Lead
Кому: SEO Content + Frontend UX
Статус: ready

## Контекст

После отчета `seo-agent/reports/2026-09-07-landing-template-and-article-semantics.md` первый безопасный MVP для посадочных - сценарная страница про уборку после ремонта. Районные страницы пока не берем: нет подтвержденных данных по доставке/спросу, а риск тонкого SEO выше пользы.

## Задача

Подготовить одну сценарную посадочную страницу под intent `аренда строительного пылесоса после ремонта в Москве`.

Рекомендуемый рабочий slug обсуждаемый, не публиковать без Product Lead review:

- `/arenda-stroitelnogo-pylesosa-posle-remonta-moskva`

## Цель

Увеличить переходы и заявки на Karcher WD5 и категорию пылесосов из поискового intent "уборка после ремонта / строительная пыль / строительный пылесос в аренду".

## Готово, если

- SEO Content подготовил структуру H1/H2, title/description, FAQ и внутренние ссылки.
- Frontend UX оценил, как встроить страницу без ощущения doorway/тонкой страницы.
- На странице есть реальные товарные CTA: Karcher WD5, категория пылесосов, Telegram-подбор.
- Есть ссылки на существующие статьи:
  - `/blog/kak-ubrat-stroitelnuyu-pyl-posle-remonta`
  - `/blog/kak-vybrat-pylesos-dlya-uborki-posle-remonta`
- Есть ссылки на:
  - `/arenda-pylesosov-moskva`
  - `/equipment/0519e3d0-e02f-4f8e-b77d-0c80fe58a9cc`
  - `/delivery`
  - `/faq`
- Не меняются цены, юридические условия и массовая URL-структура.

## Ограничения

- Не создавать больше одной посадочной в рамках MVP.
- Не делать production deploy без owner approval.
- Не обещать наличие/доставку в конкретное время сверх текущих бизнес-условий.
- Не публиковать страницу в sitemap, если контент не прошел review.

## Проверки

После реализации:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `SMOKE_BASE_URL=http://127.0.0.1:4173 npm run smoke:public`

## Product Lead acceptance

Я приму MVP, если страница решает конкретную задачу клиента, ведет к заявке и не выглядит как SEO-дубль существующей категории `/arenda-pylesosov-moskva`.
