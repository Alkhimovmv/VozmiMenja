module.exports = {
  apps: [
    // VozmiMenja API сервер
    {
      name: 'vozmimenya-api',
      script: './server/dist/index.js',
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
    },
    // RentAdmin API сервер
    {
      name: 'rentadmin-api',
      script: './rentadmin/backend/dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        CORS_ORIGIN: 'https://vozmimenya.ru'
      },
      error_file: './rentadmin/backend/logs/err.log',
      out_file: './rentadmin/backend/logs/out.log',
      log_file: './rentadmin/backend/logs/combined.log',
      time: true
    }
  ]
}
