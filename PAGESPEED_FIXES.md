# Исправления для Google PageSpeed Insights

## ✅ Выполненные исправления

### 1. Кеширование статических ресурсов (10 мин → 1 год)
**Проблема:** Статические файлы кешировались только на 10 минут
**Решение:**
- Добавлен заголовок `Cache-Control: public, max-age=31536000, immutable` для `/uploads` в `server/src/index.ts`
- Настроено долгое кеширование в `client/vite.config.ts`

**Файлы:**
- `server/src/index.ts` (строка 50)
- `client/vite.config.ts` (строки 11-14)

### 2. Добавлены width/height атрибуты для изображений
**Проблема:** Отсутствовали явные размеры для логотипов, что вызывало CLS (смещение макета)
**Решение:** Добавлены `width` и `height` атрибуты для всех логотипов

**Файлы:**
- `client/src/components/layout/Header.tsx` (строки 34-35)
- `client/src/components/layout/Footer.tsx` (строки 23-24)

### 3. Улучшена доступность (accessibility)
**Проблема:** Кнопка мобильного меню не имела aria-label
**Решение:** Добавлены `aria-label` и `aria-expanded` атрибуты

**Файл:**
- `client/src/components/layout/Header.tsx` (строки 142-143)

### 4. Улучшена контрастность WhatsApp кнопок
**Проблема:** Кнопки с `bg-green-600` имели недостаточную контрастность
**Решение:** Изменен цвет с `bg-green-600` на `bg-green-700` для лучшей контрастности

**Файлы:**
- `client/src/components/HowItWorks.tsx` (строка 92)
- `client/src/pages/DeliveryPage.tsx` (строка 210)

### 5. Добавлен preconnect для API
**Проблема:** Отсутствовало предварительное подключение к API домену
**Решение:** Добавлены `preconnect` и `dns-prefetch` для `api.vozmimenya.ru`

**Файл:**
- `client/index.html` (строки 69-70)

### 6. Исправлены 404 ошибки
**Проблема:** Prefetch запросы к `/about` и `/contact` возвращали 404
**Решение:** Удалены prefetch ссылки, так как это SPA и страницы загружаются через клиентский роутинг

**Файл:**
- `client/index.html` (удалены строки с prefetch)

---

## 📋 Рекомендации для дальнейшей оптимизации

### 1. Оптимизация изображений
**Текущая проблема:** Изображения загружаются в оригинальных размерах и форматах (JPG/PNG)

**Рекомендуемые действия:**

#### A. Конвертация в WebP/AVIF
Используйте современные форматы изображений для уменьшения размера:

```bash
# Установка sharp для конвертации
npm install sharp

# Скрипт для конвертации всех изображений в WebP
node scripts/convert-images-to-webp.js
```

Пример скрипта для конвертации:
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '../server/uploads');

fs.readdirSync(uploadsDir).forEach(file => {
  if (file.match(/\.(jpg|jpeg|png)$/i)) {
    const inputPath = path.join(uploadsDir, file);
    const outputPath = path.join(uploadsDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

    sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath)
      .then(() => console.log(`Converted ${file} to WebP`));
  }
});
```

#### B. Генерация responsive изображений
Создайте несколько размеров для каждого изображения:

```javascript
const sizes = [320, 640, 960, 1280, 1920];

sizes.forEach(size => {
  sharp(inputPath)
    .resize(size)
    .webp({ quality: 85 })
    .toFile(`${outputPath}-${size}w.webp`);
});
```

#### C. Обновление компонента для srcset
В `client/src/components/EquipmentCard.tsx` и других местах:

```tsx
<img
  srcSet={`
    ${imageUrl}-320w.webp 320w,
    ${imageUrl}-640w.webp 640w,
    ${imageUrl}-960w.webp 960w,
    ${imageUrl}-1280w.webp 1280w
  `}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  src={imageUrl}
  alt={alt}
  loading="lazy"
  decoding="async"
/>
```

### 2. Блокирующий CSS
**Проблема:** CSS блокирует первоначальную отрисовку страницы

**Решения:**

#### A. Critical CSS (для продакшена)
Используйте плагин для встраивания критического CSS:

```bash
npm install vite-plugin-critical
```

В `vite.config.ts`:
```typescript
import { critical } from 'vite-plugin-critical';

export default defineConfig({
  plugins: [
    react(),
    critical({
      base: './dist/',
      inline: true,
      minify: true,
      extract: true,
      dimensions: [
        { height: 900, width: 375 },  // mobile
        { height: 720, width: 1280 }, // desktop
      ],
    })
  ]
});
```

#### B. Отложенная загрузка некритичных стилей
Для не критичных стилей можно использовать:

```html
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
```

### 3. Удаление неиспользуемого JavaScript
**Текущая экономия:** ~21 КБ

**Решение:** Проверьте и удалите неиспользуемый код из `vendor.js`

Используйте анализ bundle:
```bash
npm install -D rollup-plugin-visualizer
```

В `vite.config.ts`:
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  react(),
  visualizer({
    open: true,
    filename: 'bundle-analysis.html'
  })
]
```

### 4. Nginx конфигурация (для продакшена)
Добавьте в конфигурацию Nginx:

```nginx
# Кеширование статических ресурсов
location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|avif)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip сжатие
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Brotli сжатие (если доступно)
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/javascript application/json image/svg+xml;
```

---

## 🎯 Ожидаемые улучшения после всех оптимизаций

- **LCP (Largest Contentful Paint):** Улучшение на ~40-60%
- **FCP (First Contentful Paint):** Улучшение на ~30-50%
- **CLS (Cumulative Layout Shift):** Улучшение до 0 (добавлены размеры изображений)
- **Общий Performance Score:** +20-30 баллов
- **Accessibility Score:** +5-10 баллов
- **Размер загружаемых данных:** Сокращение на ~1.7 МБ (после конвертации в WebP)

---

## 📝 Чеклист для деплоя

- [x] Настроено долгое кеширование статических ресурсов
- [x] Добавлены width/height для изображений
- [x] Добавлены aria-label для кнопок
- [x] Исправлена контрастность кнопок
- [x] Добавлен preconnect для API
- [x] Удалены prefetch для несуществующих страниц
- [ ] Конвертировать изображения в WebP/AVIF
- [ ] Создать responsive версии изображений (srcset)
- [ ] Настроить Critical CSS
- [ ] Настроить Nginx для gzip/brotli сжатия
- [ ] Провести финальное тестирование на PageSpeed Insights

---

## 🔍 Тестирование

После деплоя протестируйте на:
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

**Целевые метрики:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100
