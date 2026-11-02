import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: '/', // Для кастомного домена vozmimenya.ru
  resolve: {
    alias: {
      'base64-js': fileURLToPath(new URL('./src/shims/base64-js.ts', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    headers: {
      // Кеширование для dev сервера
      'Cache-Control': 'public, max-age=31536000',
    },
  },
  build: {
    // Оптимизация сборки для производства
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Удалить console.log в продакшене
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rolldownOptions: {
      output: {
        // Разделение кода на чанки. Явные приоритеты обязательны: группа забирает и зависимости
        // своих модулей, и без приоритета react/jsx-runtime оседал в markdown- или pdf-чанке,
        // из-за чего они грузились на каждой странице.
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 100 },
            { name: 'router-vendor', test: /[\\/]node_modules[\\/](react-router|react-router-dom|@remix-run)[\\/]/, priority: 90 },
            { name: 'query-vendor', test: /[\\/]node_modules[\\/]@tanstack[\\/]/, priority: 90 },
            { name: 'api-vendor', test: /[\\/]node_modules[\\/]axios[\\/]/, priority: 90 },
            { name: 'icons-vendor', test: /[\\/]node_modules[\\/]lucide-react[\\/]/, priority: 90 },
            { name: 'date-vendor', test: /[\\/]node_modules[\\/](date-fns|react-datepicker)[\\/]/, priority: 80 },
            { name: 'pdf-font-vendor', test: /[\\/]node_modules[\\/](@react-pdf[\\/]font|fontkit|unicode-properties)/, priority: 70 },
            { name: 'pdf-layout-vendor', test: /[\\/]node_modules[\\/](@react-pdf[\\/](layout|textkit)|linebreak|hyphen)/, priority: 70 },
            { name: 'pdf-core-vendor', test: /[\\/]node_modules[\\/](@react-pdf[\\/]pdfkit|pdfkit|png-js|jpeg-exif)/, priority: 70 },
            { name: 'pdf-vendor', test: /[\\/]node_modules[\\/](@react-pdf|restructure|yoga-layout)/, priority: 60 },
          ],
        },
        // Оптимизация имен файлов для кэширования
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    // Увеличить лимит предупреждения о размере чанка
    chunkSizeWarningLimit: 1000,
    // Сжатие и оптимизация ресурсов
    cssCodeSplit: true,
    sourcemap: false, // Отключить source maps в продакшене
    reportCompressedSize: true,
    // Дополнительная оптимизация
    assetsInlineLimit: 4096, // Инлайнить маленькие изображения
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    exclude: [],
  },
})
