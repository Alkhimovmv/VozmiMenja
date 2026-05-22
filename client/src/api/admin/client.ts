import axios from 'axios';
import type { AxiosInstance } from 'axios';

// API URL для админки - используем основной API VozmiMenja с префиксом /admin
const DEFAULT_API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/admin`
  : 'http://localhost:3002/api/admin';

// Список возможных API серверов в порядке приоритета
const API_SERVERS = import.meta.env.MODE === 'development'
  ? [
      DEFAULT_API_URL,                         // Приоритет - VITE_API_URL/admin
      'http://localhost:3002/api/admin',       // Локальная разработка VozmiMenja
      'https://vozmimenya.ru/api/admin',       // Production сервер
    ]
  : [
      DEFAULT_API_URL,  // Production - только VITE_API_URL/admin
    ];

// Текущий API URL
let currentApiUrl: string = DEFAULT_API_URL;

// Функция для проверки доступности API сервера
async function checkServerHealth(baseURL: string): Promise<boolean> {
  try {
    // Извлекаем базовый URL без /api/admin
    const healthUrl = baseURL.replace('/api/admin', '/health');
    const response = await axios.get(healthUrl, {
      timeout: 5000,
      withCredentials: false
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

// Функция для поиска рабочего API сервера
async function findWorkingServer(): Promise<string> {
  console.log('🔍 Поиск доступного API сервера...');

  for (const server of API_SERVERS) {
    console.log(`Проверяю ${server}...`);
    const isWorking = await checkServerHealth(server);
    if (isWorking) {
      console.log(`✅ Найден рабочий сервер: ${server}`);
      return server;
    }
  }

  console.warn('⚠️ Ни один сервер не доступен, использую первый по умолчанию');
  return API_SERVERS[0];
}

// Создание API клиента
function createApiClient(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });
}

// Инициализация API клиента
async function initializeApiClient(): Promise<AxiosInstance> {
  // В production не проверяем серверы, используем заданный URL напрямую
  if (import.meta.env.MODE === 'production') {
    currentApiUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/admin`
      : 'https://vozmimenya.ru/api/admin';
    console.log(`🔧 Production mode: using fixed API URL: ${currentApiUrl}`);
  } else {
    currentApiUrl = await findWorkingServer();
  }
  const client = createApiClient(currentApiUrl);

  // Request interceptor для добавления токена и заголовка просмотра от имени
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const viewAsUserId = localStorage.getItem('viewAsUserId');
    if (viewAsUserId) {
      config.headers['X-View-As-User'] = viewAsUserId;
    }
    return config;
  });

  // Response interceptor с автоматическим переключением серверов
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      // Если 401 - проблемы с авторизацией
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/admin/rent/login';
        return Promise.reject(error);
      }

      // Если сервер недоступен - попробуем переключиться (только в dev режиме)
      if (import.meta.env.MODE !== 'production' && !error.response && (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'TIMEOUT')) {
        console.log('❌ Сервер недоступен, ищем альтернативу...');

        // Ищем новый рабочий сервер
        const newServerUrl = await findWorkingServer();

        if (newServerUrl !== currentApiUrl) {
          console.log(`🔄 Переключаемся с ${currentApiUrl} на ${newServerUrl}`);
          currentApiUrl = newServerUrl;

          // Создаем новый клиент
          const newClient = createApiClient(newServerUrl);

          // Повторяем запрос с новым клиентом
          try {
            const retryConfig = { ...error.config };
            retryConfig.baseURL = newServerUrl;
            delete retryConfig._retry; // Избегаем бесконечных повторов

            const token = localStorage.getItem('authToken');
            if (token) {
              retryConfig.headers.Authorization = `Bearer ${token}`;
            }

            const response = await newClient.request(retryConfig);
            return response;
          } catch (retryError) {
            console.error('Повторный запрос также неудачен:', retryError);
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

// Экспортируем промис с API клиентом
export const apiClientPromise = initializeApiClient();

// Для обратной совместимости - ленивый API клиент
export const apiClient = new Proxy({} as AxiosInstance, {
  get(_target, prop) {
    return async (...args: any[]) => {
      const client = await apiClientPromise;
      return (client as any)[prop](...args);
    };
  }
});

// Функция для получения текущего URL API
export const getCurrentApiUrl = (): string => currentApiUrl;

// Функция для принудительного переключения на конкретный сервер
export const switchToServer = async (serverUrl: string): Promise<void> => {
  const isWorking = await checkServerHealth(serverUrl);
  if (isWorking) {
    currentApiUrl = serverUrl;
    console.log(`Принудительно переключились на: ${serverUrl}`);
  } else {
    console.error(`Сервер ${serverUrl} недоступен`);
    throw new Error(`Server ${serverUrl} is not available`);
  }
};

export default apiClient;