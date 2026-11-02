-- Загрузка парка, выручка и маржа доставки за последние 90 дней.
-- Только чтение. Запуск на сервере: sqlite3 -header -column <путь к database.sqlite> < scripts/analytics/fleet-utilization.sql

.print '== 1. Загрузка и выручка по позициям (90 дней) =='
WITH win AS (SELECT date('now', '-90 days') AS from_d, date('now') AS to_d),
r AS (
  SELECT r.*,
    MAX(julianday(date(r.start_date)), julianday(win.from_d)) AS s,
    MIN(julianday(date(r.end_date)), julianday(win.to_d)) AS e
  FROM rentals r, win
  WHERE r.status = 'completed'
    AND date(r.end_date) >= win.from_d
    AND date(r.start_date) <= win.to_d
),
items AS (
  SELECT r.id AS rental_id, r.s, r.e, COALESCE(r.rental_price, 0) AS rental_price, rei.equipment_id
  FROM r JOIN rental_equipment_items rei ON rei.rental_id = r.id
  UNION ALL
  SELECT r.id, r.s, r.e, COALESCE(r.rental_price, 0), r.equipment_id
  FROM r
  WHERE NOT EXISTS (SELECT 1 FROM rental_equipment_items rei WHERE rei.rental_id = r.id)
),
weighted AS (
  SELECT items.*,
    CASE WHEN COALESCE(eq.base_price, 0) > 0 THEN eq.base_price ELSE 1 END AS item_weight,
    SUM(CASE WHEN COALESCE(eq.base_price, 0) > 0 THEN eq.base_price ELSE 1 END)
      OVER (PARTITION BY items.rental_id) AS rental_weight
  FROM items JOIN rental_equipment eq ON eq.id = items.equipment_id
)
SELECT
  eq.name AS позиция,
  eq.quantity AS шт,
  COUNT(DISTINCT weighted.rental_id) AS аренд,
  ROUND(COALESCE(SUM(MAX(weighted.e - weighted.s, 1)), 0), 0) AS дней_в_аренде,
  ROUND(100.0 * COALESCE(SUM(MAX(weighted.e - weighted.s, 1)), 0) / (MAX(eq.quantity, 1) * 90), 0) AS загрузка_проц,
  ROUND(COALESCE(SUM(weighted.rental_price * weighted.item_weight / NULLIF(weighted.rental_weight, 0)), 0), 0) AS выручка,
  ROUND(
    COALESCE(SUM(weighted.rental_price * weighted.item_weight / NULLIF(weighted.rental_weight, 0)), 0)
      / NULLIF(SUM(MAX(weighted.e - weighted.s, 1)), 0),
    0
  ) AS руб_в_день_факт
FROM rental_equipment eq
LEFT JOIN weighted ON weighted.equipment_id = eq.id
GROUP BY eq.id
ORDER BY загрузка_проц DESC;

.print ''
.print '== 2. Источники клиентов (90 дней) =='
SELECT source AS источник, COUNT(*) AS аренд, ROUND(SUM(COALESCE(rental_price, 0)), 0) AS выручка,
  ROUND(AVG(COALESCE(rental_price, 0)), 0) AS средний_чек
FROM rentals WHERE date(start_date) >= date('now', '-90 days')
GROUP BY source ORDER BY выручка DESC;

.print ''
.print '== 3. Доставка: сколько взяли с клиента и сколько потратили (90 дней) =='
SELECT COUNT(*) AS доставок,
  ROUND(SUM(COALESCE(delivery_price, 0)), 0) AS взяли_с_клиентов,
  ROUND(SUM(COALESCE(delivery_costs, 0)), 0) AS потратили,
  ROUND(SUM(COALESCE(delivery_price, 0)) - SUM(COALESCE(delivery_costs, 0)), 0) AS маржа_доставки
FROM rentals WHERE needs_delivery = 1 AND date(start_date) >= date('now', '-90 days');

.print ''
.print '== 4. Офисы: аренды и выручка (90 дней) =='
SELECT o.name AS офис, COUNT(r.id) AS аренд, ROUND(SUM(COALESCE(r.rental_price, 0)), 0) AS выручка
FROM rentals r LEFT JOIN offices o ON o.id = r.office_id
WHERE date(r.start_date) >= date('now', '-90 days')
GROUP BY r.office_id ORDER BY выручка DESC;

.print ''
.print '== 5. Расходы по категориям (90 дней) =='
SELECT COALESCE(category, 'без категории') AS категория, ROUND(SUM(amount), 0) AS сумма
FROM expenses WHERE date(date) >= date('now', '-90 days')
GROUP BY category ORDER BY сумма DESC;

.print ''
.print '== 6. День недели старта аренды (365 дней) — для выходного тарифа =='
SELECT CASE strftime('%w', start_date) WHEN '0' THEN 'вс' WHEN '1' THEN 'пн' WHEN '2' THEN 'вт' WHEN '3' THEN 'ср'
  WHEN '4' THEN 'чт' WHEN '5' THEN 'пт' ELSE 'сб' END AS день, COUNT(*) AS аренд
FROM rentals WHERE date(start_date) >= date('now', '-365 days')
GROUP BY strftime('%w', start_date) ORDER BY аренд DESC;
