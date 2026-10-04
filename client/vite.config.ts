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
    rollupOptions: {
      output: {
        // Разделение кода на чанки для лучшей загрузки
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (
              id.includes('@react-pdf/font') ||
              id.includes('fontkit') ||
              id.includes('unicode-properties')
            ) {
              return 'pdf-font-vendor'
            }
            if (
              id.includes('@react-pdf/layout') ||
              id.includes('@react-pdf/textkit') ||
              id.includes('linebreak') ||
              id.includes('hyphen')
            ) {
              return 'pdf-layout-vendor'
            }
            if (
              id.includes('@react-pdf/pdfkit') ||
              id.includes('pdfkit') ||
              id.includes('png-js') ||
              id.includes('jpeg-exif')
            ) {
              return 'pdf-core-vendor'
            }
            if (
              id.includes('@react-pdf') ||
              id.includes('restructure') ||
              id.includes('yoga-layout')
            ) {
              return 'pdf-vendor'
            }
            if (id.includes('lucide-react') || id.includes('lucide')) {
              return 'icons-vendor'
            }
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('micromark') || id.includes('unified')) {
              return 'markdown-vendor'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor'
            }
            if (id.includes('axios')) {
              return 'api-vendor'
            }
            if (id.includes('date-fns') || id.includes('react-datepicker')) {
              return 'date-vendor'
            }
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            if (id.includes('/react/') || id.includes('/react-dom/')) {
              return 'react-vendor'
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor'
            }
            return 'vendor'
          }
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
