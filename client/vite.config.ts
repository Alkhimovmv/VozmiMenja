import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Для кастомного домена vozmimenya.ru
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
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
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
