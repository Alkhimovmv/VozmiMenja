# Acquisition attribution: изолированный smoke

Этот runbook проверяет Puzzi, karaoke и camera без production, реальных credentials и внешних уведомлений. Он использует только временную SQLite-БД и синтетического администратора.

## Что именно проверяется

- public `POST /api/contact` сохраняет четыре UTM, отдельный `scenario`, офис и отсортированный комплект;
- contact-dedupe возвращает исходный id и не запускает повторное уведомление;
- временный admin видит лиды своего офиса и может вручную записать outcome `booked` с тестовой суммой;
- report возвращает отдельные строки `avito / puzzi-cleaning`, `polka / karaoke-kit`, `vk / travel-camera`;
- `booked` здесь означает только вручную отмеченный исход лида. Он не создаёт `Rental` и не меняет `contact_leads.status`.

## Подготовка

Запускать из корня репозитория. Порты `3106` и, для необязательной браузерной части, `5175` должны быть свободны.

```bash
SMOKE_DIR="$(mktemp -d /tmp/vozmimenya-acquisition-smoke.XXXXXX)"
cleanup() {
  trap - EXIT INT TERM

  if [[ -n "${SMOKE_CLIENT_PID:-}" ]]; then
    if kill -0 "$SMOKE_CLIENT_PID" 2>/dev/null; then
      kill "$SMOKE_CLIENT_PID"
    fi
    wait "$SMOKE_CLIENT_PID" 2>/dev/null || true
  fi
  if [[ -n "${SMOKE_SERVER_PID:-}" ]]; then
    if kill -0 "$SMOKE_SERVER_PID" 2>/dev/null; then
      kill "$SMOKE_SERVER_PID"
    fi
    wait "$SMOKE_SERVER_PID" 2>/dev/null || true
  fi

  if [[ -n "${SMOKE_DIR:-}" && "$SMOKE_DIR" == /tmp/vozmimenya-acquisition-smoke.* && -d "$SMOKE_DIR" ]]; then
    find "$SMOKE_DIR" -depth -delete
  elif [[ -n "${SMOKE_DIR:-}" ]]; then
    print -u2 -- "Refusing to remove unexpected smoke path: $SMOKE_DIR"
    return 1
  fi
}

trap cleanup EXIT INT TERM
SMOKE_SERVER_PID=''
SMOKE_CLIENT_PID=''

export DATABASE_PATH="$SMOKE_DIR/smoke.sqlite"
export JWT_SECRET='local-smoke-jwt-only'
export PORT=3106
export NODE_ENV=development

# Явно запрещаем внешние уведомления.
export TELEGRAM_BOT_TOKEN=''
export TELEGRAM_CHAT_ID=''
export NOTIFY_EMAIL_FROM=''
export NOTIFY_EMAIL_PASS=''
export NOTIFY_EMAIL_TO=''
export VK_BOT_TOKEN=''
export VK_PEER_ID=''

npm run seed --workspace=server

# Синтетические значения существуют только во временной БД.
env \
  MIGRATE_SUPERADMIN_PHONE=79990009101 \
  MIGRATE_SUPERADMIN_PASSWORD='SmokeSuper_2026!' \
  MIGRATE_ADMIN_PHONE=79990009102 \
  MIGRATE_ADMIN_PASSWORD='SmokeAdmin_2026!' \
  npm run migrate:auth --workspace=server

sqlite3 "$DATABASE_PATH" \
  "UPDATE offices SET name='Smoke Office 1', address='Temporary smoke only', user_id=(SELECT id FROM admin_users WHERE phone='79990009102') WHERE id=1;"

./node_modules/.bin/tsx server/src/index.ts >"$SMOKE_DIR/server.log" 2>&1 &
SMOKE_SERVER_PID=$!

SMOKE_SERVER_READY=false
for SMOKE_HEALTH_ATTEMPT in {1..30}; do
  if curl --silent --show-error --fail --max-time 1 http://localhost:3106/health >/dev/null 2>&1; then
    SMOKE_SERVER_READY=true
    break
  fi
  if ! kill -0 "$SMOKE_SERVER_PID" 2>/dev/null; then
    print -u2 -- 'Smoke server exited before becoming healthy'
    tail -n 80 "$SMOKE_DIR/server.log" >&2
    exit 1
  fi
  sleep 1
done

if [[ "$SMOKE_SERVER_READY" != true ]]; then
  print -u2 -- 'Smoke server did not become healthy within 30 seconds'
  tail -n 80 "$SMOKE_DIR/server.log" >&2
  exit 1
fi
```

Ни один пароль из примера не должен использоваться вне этой удаляемой БД.

## Создание трех лидов

```bash
curl --fail -H 'Content-Type: application/json' --data-binary @- http://localhost:3106/api/contact <<'JSON'
{"name":"Smoke Puzzi","phone":"+7 999 000-91-10","subject":"rental","message":"Smoke Puzzi campaign","sourcePage":"http://localhost:5175/arenda-moyushchego-pylesosa-dlya-divana-kovra-moskva?utm_source=avito&utm_medium=listing&utm_campaign=puzzi-cleaning&utm_content=volzhskaya-account-1","utmSource":"avito","utmMedium":"listing","utmCampaign":"puzzi-cleaning","utmContent":"volzhskaya-account-1","scenario":"puzzi-cleaning","officeId":1,"officeName":"Smoke Office 1","equipmentIds":["karcher-puzzi-8-1"]}
JSON

curl --fail -H 'Content-Type: application/json' --data-binary @- http://localhost:3106/api/contact <<'JSON'
{"name":"Smoke Karaoke","phone":"+7 999 000-91-20","subject":"rental","message":"Smoke Karaoke campaign","sourcePage":"http://localhost:5175/arenda-karaoke-komplekta-moskva?utm_source=polka&utm_medium=listing&utm_campaign=karaoke-kit&utm_content=dinamo-profile","utmSource":"polka","utmMedium":"listing","utmCampaign":"karaoke-kit","utmContent":"dinamo-profile","scenario":"karaoke-kit","officeId":1,"officeName":"Smoke Office 1","equipmentIds":["jbl-partybox-320","jbl-partybox-wireless-microphones"]}
JSON

curl --fail -H 'Content-Type: application/json' --data-binary @- http://localhost:3106/api/contact <<'JSON'
{"name":"Smoke Camera","phone":"+7 999 000-91-30","subject":"rental","message":"Smoke Camera campaign","sourcePage":"http://localhost:5175/arenda-kamery-dlya-puteshestviya-vloga-moskva?utm_source=vk&utm_medium=post&utm_campaign=travel-camera&utm_content=brand-community","utmSource":"vk","utmMedium":"post","utmCampaign":"travel-camera","utmContent":"brand-community","scenario":"travel-camera","officeId":1,"officeName":"Smoke Office 1","equipmentIds":["gopro-13"]}
JSON
```

Проверка сохраненных полей:

```bash
sqlite3 -header -column "$DATABASE_PATH" \
  "SELECT id,phone,utm_source,utm_medium,utm_campaign,utm_content,scenario,office_id,equipment_ids,status FROM contact_leads ORDER BY id;"
```

Ожидаются три строки с id `1..3`, office `1`, исходным `utm_content`, соответствующим scenario и `status=pending`.

## Dedupe

Комплект намеренно передаётся повторно с тем же телефоном и распознанным scenario, но другим сообщением/content:

```bash
curl --fail -H 'Content-Type: application/json' --data-binary @- http://localhost:3106/api/contact <<'JSON'
{"name":"Duplicate Puzzi","phone":"8 (999) 000-91-10","subject":"other","message":"different message ignored for recognized scenario","utmSource":"avito","utmMedium":"listing","utmCampaign":"puzzi-cleaning","utmContent":"duplicate-attempt","scenario":"puzzi-cleaning","officeId":1,"officeName":"Smoke Office 1","equipmentIds":["karcher-puzzi-8-1"]}
JSON

sqlite3 "$DATABASE_PATH" 'SELECT COUNT(*) FROM contact_leads;'
rg -c 'POST /api/contact' "$SMOKE_DIR/server.log"
rg -c '^Telegram бот не настроен, сообщение не отправлено$' "$SMOKE_DIR/server.log"
rg -c 'Email уведомления не настроены' "$SMOKE_DIR/server.log"
```

Ожидается `duplicate:true` с `id:1`, затем counts `3`, `4`, `3`, `3`: четыре запроса, но только три строки и три попытки каждого отключенного notifier.

Booking-dedupe устроен иначе: нормализованный телефон + даты/время + офис + отсортированный комплект; scenario в его ключ не входит. Contact без распознанного scenario использует fallback телефон + subject + message.

## Admin workflow и report

```bash
SMOKE_LOGIN_JSON="$(curl --fail -H 'Content-Type: application/json' \
  --data '{"phone":"+7 999 000-91-02","password":"SmokeAdmin_2026!"}' \
  http://localhost:3106/api/admin/auth/login)"
SMOKE_TOKEN="$(printf '%s' "$SMOKE_LOGIN_JSON" | jq -r '.token')"
test -n "$SMOKE_TOKEN" && test "$SMOKE_TOKEN" != null

curl --fail -X PATCH -H "Authorization: Bearer $SMOKE_TOKEN" -H 'Content-Type: application/json' \
  --data '{"result":"booked","revenue":3100}' http://localhost:3106/api/admin/contact-leads/1/workflow
curl --fail -X PATCH -H "Authorization: Bearer $SMOKE_TOKEN" -H 'Content-Type: application/json' \
  --data '{"result":"booked","revenue":4200}' http://localhost:3106/api/admin/contact-leads/2/workflow
curl --fail -X PATCH -H "Authorization: Bearer $SMOKE_TOKEN" -H 'Content-Type: application/json' \
  --data '{"result":"booked","revenue":5300}' http://localhost:3106/api/admin/contact-leads/3/workflow

curl --fail -H "Authorization: Bearer $SMOKE_TOKEN" http://localhost:3106/api/admin/lead-report | jq \
  '{periodDays,rows:[.rows[]|select((.source=="avito" and .campaign=="puzzi-cleaning") or (.source=="polka" and .campaign=="karaoke-kit") or (.source=="vk" and .campaign=="travel-camera"))]}'

sqlite3 -header -column "$DATABASE_PATH" \
  'SELECT id,status,lead_result,lead_revenue,office_id FROM contact_leads ORDER BY id;'
```

Ожидаемые report rows: Puzzi `3100`, karaoke `4200`, camera `5300`, в каждой один lead, один вручную отмеченный outcome и `100%`. SQL должен одновременно показать `lead_result=booked` и неизменный `status=pending`.

## Необязательная браузерная проверка CTA

```bash
env VITE_API_URL=http://localhost:3106/api \
  ./node_modules/.bin/vite client --host 0.0.0.0 --port 5175 >"$SMOKE_DIR/client.log" 2>&1 &
SMOKE_CLIENT_PID=$!

SMOKE_CLIENT_READY=false
for SMOKE_CLIENT_ATTEMPT in {1..30}; do
  if curl --silent --show-error --fail --max-time 1 http://localhost:5175/ >/dev/null 2>&1; then
    SMOKE_CLIENT_READY=true
    break
  fi
  if ! kill -0 "$SMOKE_CLIENT_PID" 2>/dev/null; then
    print -u2 -- 'Smoke client exited before becoming ready'
    tail -n 80 "$SMOKE_DIR/client.log" >&2
    exit 1
  fi
  sleep 1
done

if [[ "$SMOKE_CLIENT_READY" != true ]]; then
  print -u2 -- 'Smoke client did not become ready within 30 seconds'
  tail -n 80 "$SMOKE_DIR/client.log" >&2
  exit 1
fi
```

В независимых browser sessions открыть три URL из payload выше и проверить, что booking CTA содержит исходные `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`. Независимые sessions важны из-за first-touch session storage. Для отправки формы использовать только синтетический телефон из этого runbook.

## Cleanup

```bash
cleanup
test ! -e "$SMOKE_DIR"
```

`cleanup` сам снимает `EXIT/INT/TERM` trap, поэтому повторный вызов после нормального завершения не выполняется. Он посылает сигнал только PID, сохраненным непосредственно после запуска backend/frontend, и удаляет только каталог, прошедший проверку префикса `/tmp/vozmimenya-acquisition-smoke.*`.

## Последний подтвержденный прогон

04.11.2026: три public API create прошли; сохранены ожидаемые UTM/scenario/office/equipment; Puzzi duplicate вернул `id:1`; после четырех POST осталось три строки и три notifier-attempts. Admin workflow записал Puzzi `3 100 ₽`, karaoke `4 200 ₽`, camera `5 300 ₽`; все три status остались `pending`. Report вернул три строки, по одному вручную отмеченному outcome `booked`, 100% и соответствующую вручную атрибутированную сумму. Production и реальные уведомления не использовались.
