module.exports = {
  apps: [
    // VozmiMenja API сервер (включает интегрированную админку)
    {
      name: 'vozmimenya-api',
      script: '/var/www/vozmimenya/server/dist/index.js',
      cwd: '/var/www/vozmimenya/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        FRONTEND_URL: 'https://vozmimenya.ru',
        env_file: '.env'
      },
      error_file: './server/logs/err.log',
      out_file: './server/logs/out.log',
      log_file: './server/logs/combined.log',
      time: true
    },
    // Публичный SSR-фронтенд. Изолирован от API и доступен только локальному Nginx.
    {
      name: 'vozmimenya-ssr',
      script: './ssr-server.mjs',
      cwd: '/var/www/vozmimenya/client',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        SSR_HOST: '127.0.0.1',
        SSR_PORT: 3004,
        SSR_API_URL: 'http://127.0.0.1:3003/api'
      },
      error_file: '/var/www/vozmimenya/logs/ssr-error.log',
      out_file: '/var/www/vozmimenya/logs/ssr-out.log',
      time: true
    }
  ]
}
