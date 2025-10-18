import { API_SERVER_URL } from './api'

export const getImageUrl = (imagePath: string): string => {
  console.log('🖼️  getImageUrl input:', imagePath)
  console.log('🖼️  API_SERVER_URL:', API_SERVER_URL)

  if (!imagePath) {
    console.log('🖼️  No image path, using placeholder')
    return '/placeholder-equipment.jpg'
  }

  // Заменяем localhost URL на относительные пути (для старых данных из БД)
  let normalizedPath = imagePath
  if (imagePath.includes('localhost:3002') || imagePath.includes('localhost:3001')) {
    normalizedPath = imagePath.replace(/http:\/\/localhost:\d+/, '')
    console.log('🖼️  Normalized localhost URL to:', normalizedPath)
  }

  // Если уже полный URL (не localhost)
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    console.log('🖼️  Full URL detected:', normalizedPath)
    return normalizedPath
  }

  // Если путь начинается с /uploads (стандартный случай)
  if (normalizedPath.startsWith('/uploads')) {
    const url = `${API_SERVER_URL}${normalizedPath}`
    console.log('🖼️  Final URL:', url)
    return url
  }

  // Если просто имя файла (legacy)
  const url = `${API_SERVER_URL}/uploads/${normalizedPath}`
  console.log('🖼️  Legacy filename, final URL:', url)
  return url
}
