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
        FRONTEND_URL: 'https://vozmimenya.ru'
      },
      error_file: './server/logs/err.log',
      out_file: './server/logs/out.log',
      log_file: './server/logs/combined.log',
      time: true
    }
  ]
}
