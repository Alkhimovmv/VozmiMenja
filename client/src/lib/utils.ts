import { API_SERVER_URL } from './api'

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    return '/placeholder-equipment.jpg'
  }

  // Заменяем localhost URL на относительные пути (для старых данных из БД)
  let normalizedPath = imagePath
  if (imagePath.includes('localhost:3002') || imagePath.includes('localhost:3001')) {
    normalizedPath = imagePath.replace(/http:\/\/localhost:\d+/, '')
  }

  // Если уже полный URL (не localhost)
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    return normalizedPath
  }

  // Если путь начинается с /uploads (стандартный случай)
  if (normalizedPath.startsWith('/uploads')) {
    return `${API_SERVER_URL}${normalizedPath}`
  }

  // Если просто имя файла (legacy)
  return `${API_SERVER_URL}/uploads/${normalizedPath}`
}

// React 18 не знает camelCase-свойство fetchPriority и молча выбрасывает его из DOM.
// Атрибут в нижнем регистре браузер понимает; приведение типа — только для TypeScript.
export const fetchPriorityAttr = (priority: 'high' | 'low' | 'auto') =>
  ({ fetchpriority: priority }) as unknown as Record<string, never>

// srcset из уменьшенных копий фото. undefined, если копий нет: тогда браузер берёт src (оригинал).
export const getImageSrcSet = (variants?: Array<{ width: number; url: string }>): string | undefined =>
  variants?.length ? variants.map((variant) => `${getImageUrl(variant.url)} ${variant.width}w`).join(', ') : undefined
