import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'path'
import { database } from './models/database'
import equipmentRoutes from './routes/equipment'
import bookingsRoutes from './routes/bookings'
import adminRoutes from './routes/admin'
import contactRoutes from './routes/contact'
import rentalEquipmentRoutes from './routes/rentalEquipment'
import rentalsRoutes from './routes/rentals'
import expensesRoutes from './routes/expenses'
import customersRoutes from './routes/customers'
import analyticsRoutes from './routes/analytics'
import articlesRoutes from './routes/articles'
import lockersRoutes from './routes/lockers'
import officesRoutes from './routes/offices'
import { schedulerService } from './services/scheduler'

// Явно указываем путь к .env относительно этого файла
dotenv.config({ path: path.join(__dirname, '../../.env') })

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://192.168.1.44:5173', 'http://192.168.0.32:5175'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Логирование запросов (только в development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
  })
}

// Статическая раздача загруженных файлов с CORS и долгим кешированием
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Cross-Origin-Resource-Policy', 'cross-origin')
  // Кеширование изображений на 1 год (immutable для оптимизации)
  res.header('Cache-Control', 'public, max-age=31536000, immutable')
  next()
}, express.static(path.join(__dirname, '../uploads')))

// API Routes
app.use('/api/equipment', equipmentRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/articles', articlesRoutes)

// Admin API Routes (RentAdmin integrated) - ВАЖНО: регистрируем специфичные роуты ДО общего /api/admin
app.use('/api/admin/equipment', rentalEquipmentRoutes) // Используем rental_equipment для админки
app.use('/api/admin/rentals', rentalsRoutes)
app.use('/api/admin/expenses', expensesRoutes)
app.use('/api/admin/customers', customersRoutes)
app.use('/api/admin/analytics', analyticsRoutes)
app.use('/api/admin/lockers', lockersRoutes)
app.use('/api/admin/offices', officesRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
})

// Initialize database and start server
async function startServer() {
  try {
    await database.init()
    console.log('✅ База данных инициализирована')

    // Инициализируем планировщик уведомлений
    schedulerService.init()

    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`)
      console.log(`📋 Health check: http://localhost:${PORT}/health`)
      console.log(`🔧 API: http://localhost:${PORT}/api`)
    })
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Получен сигнал SIGINT, завершение работы...')
  schedulerService.stop()
  await database.close()
  console.log('✅ База данных закрыта')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🔄 Получен сигнал SIGTERM, завершение работы...')
  schedulerService.stop()
  await database.close()
  console.log('✅ База данных закрыта')
  process.exit(0)
})

startServer()