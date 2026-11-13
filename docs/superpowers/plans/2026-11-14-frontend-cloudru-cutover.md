# Cloud.ru Frontend Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перенести `vozmimenya.ru` и `www.vozmimenya.ru` с GitHub Pages на Nginx VM Cloud.ru `87.242.103.146` без планового простоя, с настоящими 301, заголовками безопасности, корректным кешем и проверенным откатом.

**Architecture:** Сначала репозиторий получает проверяемые Nginx-редиректы, затем сервер полностью готовится и тестируется через `curl --resolve`, пока DNS продолжает вести на GitHub Pages. DNS меняется только после валидного сертификата и pre-cutover gate; GitHub Pages остаётся резервом до завершения внешнего smoke.

**Tech Stack:** Nginx 1.18+, Let's Encrypt/Certbot DNS-01, REG.RU DNS, Cloud.ru Evolution VM, Vite static build, Node.js test runner, GitHub Actions.

---

### Task 1: Зафиксировать настоящие 301 тестом

**Files:**
- Create: `scripts/nginx-site.test.mjs`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`
- Test: `scripts/nginx-site.test.mjs`

- [ ] **Step 1: Написать падающий тест синхронизации redirects.json и Nginx**

Создать `scripts/nginx-site.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const ROOT = new URL('../', import.meta.url)

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

test('every frontend redirect is a permanent Nginx redirect that preserves query parameters', async () => {
  const [config, redirectsText] = await Promise.all([
    readFile(new URL('nginx/vozmimenya-site.conf', ROOT), 'utf8'),
    readFile(new URL('client/src/content/redirects.json', ROOT), 'utf8'),
  ])
  const redirects = JSON.parse(redirectsText)

  for (const [source, target] of Object.entries(redirects)) {
    const location = new RegExp(
      `location\\s*=\\s*${escapeRegExp(source)}\\s*\\{[\\s\\S]*?return\\s+301\\s+${escapeRegExp(target)}\\$is_args\\$args;[\\s\\S]*?\\}`,
    )
    assert.match(config, location, `${source} must redirect permanently to ${target}`)
  }
})
```

- [ ] **Step 2: Запустить тест и подтвердить RED**

Run:

```bash
node --test scripts/nginx-site.test.mjs
```

Expected: FAIL на первом маршруте из `client/src/content/redirects.json`, потому что точных Nginx locations ещё нет.

- [ ] **Step 3: Подключить тест к локальному и CI gate**

В `package.json` добавить:

```json
"test:nginx-site": "node --test scripts/nginx-site.test.mjs"
```

И дописать `&& npm run test:nginx-site` в корневой `test`.

В `.github/workflows/ci.yml` изменить Release script tests:

```yaml
- name: Release script tests
  run: npm run test:article-release && npm run test:indexnow && npm run test:search-console && npm run test:nginx-site
```

- [ ] **Step 4: Закоммитить RED-тест**

```bash
git add scripts/nginx-site.test.mjs package.json .github/workflows/ci.yml
git commit -m "test: require Nginx redirects for legacy URLs"
```

### Task 2: Реализовать серверные 301

**Files:**
- Modify: `nginx/vozmimenya-site.conf`
- Test: `scripts/nginx-site.test.mjs`

- [ ] **Step 1: Добавить точные locations перед общим `location /`**

```nginx
    # Старые публичные URL: настоящие 301 вместо HTML meta refresh.
    # Query string сохраняется для UTM и диагностических параметров.
    location = /arenda-kamery-dlya-puteshestviya-vloga-moskva {
        return 301 /arenda-gopro-moskva$is_args$args;
    }

    location = /blog/kak-vybrat-pylesos-dlya-uborki-posle-remonta {
        return 301 /blog/kak-ubrat-stroitelnuyu-pyl-posle-remonta$is_args$args;
    }

    location = /equipment {
        return 301 /$is_args$args;
    }
```

- [ ] **Step 2: Запустить GREEN-тест**

```bash
npm run test:nginx-site
```

Expected: PASS, 1 test passed, 0 failed.

- [ ] **Step 3: Проверить diff и закоммитить**

```bash
git diff --check
git add nginx/vozmimenya-site.conf
git commit -m "feat: serve legacy frontend redirects from Nginx"
```

### Task 3: Проверить сборку и Nginx локально

**Files:**
- Verify: `client/dist/`
- Verify: `nginx/vozmimenya-site.conf`
- Verify: `nginx/snippets/vozmimenya-security-headers.conf`

- [ ] **Step 1: Собрать frontend**

```bash
npm run build --workspace=client
```

Expected: exit 0; `client/dist/index.html` и хешированные `client/dist/assets/index.*.js` существуют.

- [ ] **Step 2: Подготовить одноразовый Nginx-контейнер**

```bash
nginx_test_dir=$(mktemp -d)
mkdir -p "$nginx_test_dir/certs"
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -subj '/CN=vozmimenya.ru' \
  -addext 'subjectAltName=DNS:vozmimenya.ru,DNS:www.vozmimenya.ru' \
  -keyout "$nginx_test_dir/certs/privkey.pem" \
  -out "$nginx_test_dir/certs/fullchain.pem"
docker run --rm \
  -v "$PWD/nginx/vozmimenya-site.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$PWD/nginx/snippets:/etc/nginx/snippets:ro" \
  -v "$PWD/client/dist:/var/www/html/vozmimenya.ru:ro" \
  -v "$nginx_test_dir/certs:/etc/letsencrypt/live/vozmimenya.ru:ro" \
  nginx:1.27-alpine nginx -t
```

Expected: `syntax is ok` и `test is successful`.

- [ ] **Step 3: Проверить поведение контейнера**

```bash
docker run --rm -d --name vozmimenya-nginx-test \
  -p 18080:80 -p 18443:443 \
  -v "$PWD/nginx/vozmimenya-site.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$PWD/nginx/snippets:/etc/nginx/snippets:ro" \
  -v "$PWD/client/dist:/var/www/html/vozmimenya.ru:ro" \
  -v "$nginx_test_dir/certs:/etc/letsencrypt/live/vozmimenya.ru:ro" \
  nginx:1.27-alpine

curl -skI --resolve vozmimenya.ru:18443:127.0.0.1 https://vozmimenya.ru:18443/
curl -skI --resolve vozmimenya.ru:18443:127.0.0.1 'https://vozmimenya.ru:18443/equipment?utm_source=test'
curl -skI --resolve vozmimenya.ru:18443:127.0.0.1 https://vozmimenya.ru:18443/not-a-real-page

docker stop vozmimenya-nginx-test
rm -rf "$nginx_test_dir"
```

Expected: главная `200`; `/equipment?utm_source=test` — `301` на `/?utm_source=test`; неизвестная страница — `404`; присутствуют HSTS, nosniff и CSP Report-Only.

- [ ] **Step 4: Запустить релевантный локальный gate**

```bash
npm run test:nginx-site
npm run typecheck
npm run build
```

Expected: все три команды exit 0. Полный `npm test` повторить и отдельно зафиксировать, воспроизвёлся ли исходный flaky race-тест `adminLeadWorkflow`.

### Task 4: Опубликовать ветку и получить зелёный CI

**Files:**
- Push: branch `ops/frontend-cloudru-cutover`
- Create: GitHub Pull Request into `main`

- [ ] **Step 1: Проверить историю и отсутствие секретов**

```bash
git status --short --branch
git log --oneline origin/main..HEAD
git diff --check origin/main...HEAD
changed_files=$(git diff --name-only origin/main...HEAD -- . ':!docs/superpowers/**')
if [ -n "$changed_files" ]; then
  printf '%s\n' "$changed_files" | while IFS= read -r file; do
    rg -n '(BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|YANDEX_WEBMASTER_TOKEN=|GOOGLE_APPLICATION_CREDENTIALS=.*\.json)' "$file" || true
  done
fi
```

Expected: только ожидаемые docs/test/Nginx-файлы; секреты не найдены.

- [ ] **Step 2: Push и PR**

```bash
git push -u origin ops/frontend-cloudru-cutover
```

Создать PR с заголовком `feat: prepare Cloud.ru frontend cutover` и описанием:

```markdown
## Что изменено

- добавлены настоящие Nginx 301 для всех маршрутов из redirects.json;
- добавлен автоматический тест синхронизации frontend-редиректов и Nginx;
- добавлен проверяемый план безопасного переключения Cloud.ru с rollback.

## Проверка

- npm run test:nginx-site
- npm run typecheck
- npm run build
- nginx -t в одноразовом контейнере

Production, DNS и GitHub Pages settings этим PR не изменяются.
```

- [ ] **Step 3: Дождаться CI и влить PR**

Expected: CI success; PR mergeable; после отдельного подтверждения владельца PR merged в `main`.

### Task 5: Подготовить VM и актуальную сборку

**Files on VM:**
- Repository checkout containing `deploy-local.sh`
- Build target: `/var/www/html/vozmimenya.ru`

- [ ] **Step 1: Сделать read-only preflight через Cloud.ru Execute Command/console**

```bash
set -eu
cd /home/maxim/VozmiMenja
git status --short --branch
git remote -v
df -h /
free -m
sudo nginx -T 2>/dev/null | grep -nE 'server_name .*vozmimenya\.ru|configuration file'
sudo certbot certificates
```

Expected: VM имеет свободное место; текущие изменения понятны; найден старый frontend server block; сертификата с обоими именами ещё нет.

- [ ] **Step 2: Обновить код и выполнить штатный deploy**

Перед этим действием получить отдельное подтверждение владельца «выкатывай».

```bash
set -eu
cd /home/maxim/VozmiMenja
git pull --ff-only origin main
sudo ./deploy-local.sh update
test -s /var/www/html/vozmimenya.ru/index.html
```

Expected: deploy завершён; PM2 и Nginx активны; index.html существует.

### Task 6: Выпустить сертификат через DNS-01

**External systems:**
- Cloud.ru VM console
- REG.RU DNS zone for `vozmimenya.ru`

- [ ] **Step 1: Запустить certbot без смены публичного DNS**

```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d vozmimenya.ru -d www.vozmimenya.ru
```

Certbot выведет одно или несколько точных TXT-значений для `_acme-challenge.vozmimenya.ru`. Не нажимать Enter до подтверждения authoritative DNS.

- [ ] **Step 2: Добавить TXT в REG.RU**

Перед сохранением DNS получить подтверждение владельца на передачу challenge и изменение записи. Создать TXT с именем `_acme-challenge`; если certbot выдал два значения одновременно, сохранить обе TXT-записи.

- [ ] **Step 3: Проверить TXT на авторитетных NS**

```bash
dig +short TXT _acme-challenge.vozmimenya.ru @ns1.hosting.reg.ru
dig +short TXT _acme-challenge.vozmimenya.ru @ns2.hosting.reg.ru
```

Expected: оба NS возвращают точные значения certbot. После этого продолжить certbot.

- [ ] **Step 4: Проверить выпущенный сертификат**

```bash
sudo certbot certificates
sudo openssl x509 -in /etc/letsencrypt/live/vozmimenya.ru/fullchain.pem \
  -noout -dates -ext subjectAltName
```

Expected: SAN содержит `vozmimenya.ru` и `www.vozmimenya.ru`.

### Task 7: Установить Nginx-конфиг и пройти pre-cutover gate

**Files on VM:**
- `/etc/nginx/snippets/vozmimenya-security-headers.conf`
- `/etc/nginx/sites-available/vozmimenya-site.conf`
- `/etc/nginx/sites-enabled/vozmimenya-site.conf`

- [ ] **Step 1: Скопировать новые конфиги и сохранить старые**

```bash
set -eu
cd /home/maxim/VozmiMenja
cutover_stamp=$(date +%Y%m%d-%H%M%S)
sudo mkdir -p "/etc/nginx/cutover-backup-$cutover_stamp" /etc/nginx/snippets /etc/nginx/sites-disabled
sudo cp -a /etc/nginx/sites-enabled "/etc/nginx/cutover-backup-$cutover_stamp/"
sudo install -m 0644 nginx/snippets/vozmimenya-security-headers.conf /etc/nginx/snippets/vozmimenya-security-headers.conf
sudo install -m 0644 nginx/vozmimenya-site.conf /etc/nginx/sites-available/vozmimenya-site.conf
sudo ln -sfn /etc/nginx/sites-available/vozmimenya-site.conf /etc/nginx/sites-enabled/vozmimenya-site.conf
```

- [ ] **Step 2: Найти и отключить только конфликтующий старый frontend block**

```bash
sudo grep -RIlE 'server_name[[:space:]]+([^;[:space:]]+[[:space:]]+)*vozmimenya\.ru([[:space:];])' \
  /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null
```

Просмотреть найденные файлы. Новый `vozmimenya-site.conf` оставить; другие файлы с точным `server_name vozmimenya.ru` переместить из enabled/conf.d в `/etc/nginx/sites-disabled/` с суффиксом cutover timestamp. Не трогать `api.vozmimenya.ru` и `schedule-admin.vozmimenya.ru`.

- [ ] **Step 3: Проверить и перечитать Nginx**

```bash
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl is-active nginx
```

Expected: syntax/test successful; service `active`.

- [ ] **Step 4: Проверить Cloud.ru до DNS без `-k`**

```bash
cloud_ip=87.242.103.146
curl --resolve vozmimenya.ru:443:$cloud_ip -sSI https://vozmimenya.ru/
curl --resolve vozmimenya.ru:443:$cloud_ip -sSI https://vozmimenya.ru/index.html
curl --resolve vozmimenya.ru:443:$cloud_ip -sSI 'https://vozmimenya.ru/equipment?utm_source=cutover'
curl --resolve vozmimenya.ru:443:$cloud_ip -sSI https://vozmimenya.ru/not-a-real-page
curl --resolve vozmimenya.ru:443:$cloud_ip -sS -o /dev/null -w '%{http_code}\n' https://vozmimenya.ru/arenda-tehniki-u-metro-volzhskaya-kuzminki
curl --resolve vozmimenya.ru:443:$cloud_ip -sS -o /dev/null -w '%{http_code}\n' https://vozmimenya.ru/arenda-tehniki-u-metro-dinamo
curl --resolve www.vozmimenya.ru:443:$cloud_ip -sSI https://www.vozmimenya.ru/
```

Expected: `/` 200; `/index.html` 301; `/equipment` 301 с query; неизвестный путь 404; обе локальные страницы 200; `www` 301 на основной домен; сертификат доверенный.

- [ ] **Step 5: Проверить кеш и заголовки**

```bash
asset_path=$(curl --resolve vozmimenya.ru:443:87.242.103.146 -sS https://vozmimenya.ru/ \
  | sed -n 's/.*src="\([^"]*\/assets\/[^"]*\.js\)".*/\1/p' | head -n 1)
curl --resolve vozmimenya.ru:443:87.242.103.146 -sSI "https://vozmimenya.ru$asset_path"
```

Expected: HTML `no-cache`; asset `public, max-age=31536000, immutable`; HSTS, nosniff, Referrer-Policy, Permissions-Policy и CSP Report-Only присутствуют.

### Task 8: Переключить DNS в REG.RU

**External system:** REG.RU DNS zone `vozmimenya.ru`

- [ ] **Step 1: Зафиксировать текущие записи для отката**

```bash
dig +noall +answer A vozmimenya.ru
dig +noall +answer CNAME www.vozmimenya.ru
```

Expected rollback values: A `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `www` CNAME `alkhimovmv.github.io`.

- [ ] **Step 2: Подготовить изменения в REG.RU**

- удалить четыре A-записи корня GitHub Pages;
- создать одну A-запись корня `87.242.103.146` с TTL 300–600;
- заменить `www` CNAME на `vozmimenya.ru.` с TTL 300–600.

Перед финальной кнопкой сохранения получить отдельное подтверждение владельца: изменение направит реальный пользовательский трафик на Cloud.ru.

- [ ] **Step 3: Проверить авторитетный DNS**

```bash
dig +short A vozmimenya.ru @ns1.hosting.reg.ru
dig +short A vozmimenya.ru @ns2.hosting.reg.ru
dig +short CNAME www.vozmimenya.ru @ns1.hosting.reg.ru
```

Expected: оба NS возвращают `87.242.103.146`; `www` возвращает `vozmimenya.ru.`.

### Task 9: Внешний smoke и завершение Pages cutover

**External systems:** production site, GitHub Pages settings, GitHub Actions

- [ ] **Step 1: Дождаться публичного DNS условием, а не фиксированной паузой**

```bash
for attempt in $(seq 1 30); do
  resolved=$(dig +short A vozmimenya.ru | sort -u | tr '\n' ' ')
  printf 'attempt=%s resolved=%s\n' "$attempt" "$resolved"
  [ "$resolved" = '87.242.103.146 ' ] && break
  sleep 20
done
```

Expected: публичный резолвер возвращает только `87.242.103.146` в пределах TTL.

- [ ] **Step 2: Выполнить production smoke**

```bash
curl -fsSI https://vozmimenya.ru/
curl -fsSI https://www.vozmimenya.ru/
curl -fsSI 'https://vozmimenya.ru/equipment?utm_source=cutover'
curl -sS -o /dev/null -w '%{http_code}\n' https://vozmimenya.ru/not-a-real-page
curl -fsS https://vozmimenya.ru/robots.txt >/dev/null
curl -fsS https://vozmimenya.ru/sitemap.xml >/dev/null
curl -fsS https://api.vozmimenya.ru/api/equipment >/dev/null
npm run smoke:public:prod
npm run smoke:seo:prod
```

Expected: redirects and 404 correct; public/API/SEO smoke exit 0.

- [ ] **Step 3: Проверить ключевые пользовательские сценарии в браузере**

Проверить главную, карточку товара, Волжскую, Динамо, блог, форму бронирования, карту, отзывы, PDF договора и отсутствие CSP Report-Only ошибок, блокирующих запросы. Создать тестовую заявку только после отдельного подтверждения владельца, потому что она меняет production-данные.

- [ ] **Step 4: Убрать custom domain GitHub Pages**

После 30–60 минут стабильной работы и повторного smoke открыть GitHub → Settings → Pages и удалить custom domain `vozmimenya.ru`. Перед финальным сохранением получить подтверждение владельца. Workflow Pages оставить включённым как резервную публикацию на `alkhimovmv.github.io`.

- [ ] **Step 5: Запустить/проверить uptime workflow**

Запустить `.github/workflows/uptime.yml` вручную или дождаться ближайшего запуска; все проверки должны быть зелёными.

### Task 10: Зафиксировать результат и путь отката

**Files:**
- Modify: `docs/frontend-hosting-cloudru.md`
- Modify: `docs/changelog.md`
- Modify: `.agents/board.md`

- [ ] **Step 1: Записать фактические данные cutover**

После слияния подготовительного PR начать документацию от обновлённого `main`:

```bash
git fetch origin
git switch -c ops/frontend-cloudru-cutover-record origin/main
```

Добавить в `docs/frontend-hosting-cloudru.md` раздел следующей структуры, заполнив значения только фактами из выполненных проверок:

```markdown
## Cutover выполнен

- Дата и время МСК: значение из `date --iso-8601=seconds` на VM.
- Production IP: `87.242.103.146`.
- Сертификат: фактический `notAfter` из `openssl x509` и SAN `vozmimenya.ru`, `www.vozmimenya.ru`.
- Pre-DNS smoke: HTTP/HTTPS, 301, 404, security headers и immutable cache — пройдено.
- Production smoke: public, SEO и API — пройдено.
- GitHub Pages custom domain: удалён после стабильной проверки; workflow сохранён.
- Rollback DNS: четыре A GitHub Pages и `www` CNAME `alkhimovmv.github.io`.
```

В `docs/changelog.md` добавить запись с теми же проверенными итогами без предположений.

- [ ] **Step 2: Отметить пункт аудита завершённым**

В `.agents/board.md` добавить строку только после успешного внешнего smoke:

```markdown
- [x] Release Task: перенести frontend с GitHub Pages на Nginx Cloud.ru с HTTPS, настоящими 301, security headers, immutable cache и проверенным rollback
```

- [ ] **Step 3: Проверить и закоммитить документацию**

```bash
git diff --check
git add docs/frontend-hosting-cloudru.md docs/changelog.md .agents/board.md
git commit -m "docs: record Cloud.ru frontend cutover"
git push -u origin ops/frontend-cloudru-cutover-record
```

Создать отдельный documentation PR в `main`; не писать напрямую в защищённую ветку.

- [ ] **Step 4: Оставить rollback доступным минимум сутки**

Не удалять старую Pages-публикацию и серверный Nginx backup минимум 24 часа. При критической ошибке вернуть четыре A GitHub Pages и `www` CNAME `alkhimovmv.github.io`, затем дождаться TTL и повторить smoke.

