# 2026-09-07 Scenario Landing Construction Vacuum Frontend

От: Product Lead
Кому: Frontend UX
Статус: assigned / implementation next

## Product Lead follow-up 2026-09-08

Это главный следующий шаг команды. Отчет по источникам заявок остается в паузе: пока с сайта мало лидов, важнее создать коммерческий вход в заявку.

Приоритет реализации:

1. Отдельная публичная страница и route `/arenda-stroitelnogo-pylesosa-posle-remonta-moskva`.
2. Telegram-first CTA с контекстом страницы.
3. Практический выбор техники после ремонта: WD5 / Puzzi / SC4.
4. Внутренние ссылки на категорию, WD5, статьи, доставку и FAQ.
5. Видимый FAQ + `FAQPage` schema.

Не добавлять страницу в sitemap до Product Lead review и QA.

## Контекст

Нужно привлечь больше заявок с сайта, поэтому отчет по источникам заявок пока отложен. Следующая ростовая ставка - одна MVP сценарная посадочная под intent `аренда строительного пылесоса после ремонта в Москве`.

SEO/content brief готов:

- `seo-agent/reports/2026-09-07-construction-vacuum-landing-brief.md`

## Что сделано

- Выбран один сценарный MVP вместо пачки районных или SEO-страниц.
- Зафиксированы H1, title/description, структура, FAQ, внутренние ссылки и ограничения по обещаниям.
- Уточнен критерий не-дубля с `/arenda-pylesosov-moskva`: новая страница должна решать сценарий уборки после ремонта, а не копировать категорию.

## Что нужно дальше

Собрать frontend MVP страницы:

- рабочий URL: `/arenda-stroitelnogo-pylesosa-posle-remonta-moskva`;
- hero с задачей после ремонта и CTA в Telegram;
- быстрый выбор: строительный пылесос / моющий Puzzi / пароочиститель;
- блок Karcher WD5 как основной товарный CTA;
- ссылки на категорию, статьи, доставку и FAQ;
- видимый FAQ с корректной `FAQPage` schema;
- breadcrumbs: Главная -> Пылесосы -> После ремонта.

Не делать:

- не создавать массовый генератор посадочных;
- не менять цены, юридические условия, залог или delivery-обещания;
- не добавлять страницу в sitemap до финального review Product Lead + QA;
- не делать production deploy.

## Риски

- Каннибализация `/arenda-pylesosov-moskva`, если страница станет общей категорией.
- Неподтвержденные обещания про наличие, доставку, расходники или залог.
- Перегруженный mobile layout, если таблицу выбора сделать слишком широкой.

## Файлы

Ожидаемые зоны:

- `client/src/App.tsx`
- `client/src/pages/`
- `client/src/components/SEO.tsx`
- возможно `client/src/pages/SitemapPage.tsx` и `server/src/scripts/generate-sitemap.ts` после review

## Проверки

```bash
npm run lint
npm run typecheck
npm run build
SMOKE_BASE_URL=http://127.0.0.1:4173 npm run smoke:public
```

## Product Lead acceptance

Готово, если страница помогает пользователю выбрать технику после ремонта, ведет к Telegram/брони, не дублирует категорию пылесосов и не содержит непроверенных бизнес-обещаний.
