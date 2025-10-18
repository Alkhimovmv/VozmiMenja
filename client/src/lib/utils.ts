import { API_SERVER_URL } from './api'

export const getImageUrl = (imagePath: string): string => {
  console.log('🖼️  getImageUrl input:', imagePath)
  console.log('🖼️  API_SERVER_URL:', API_SERVER_URL)

  if (!imagePath) {
    console.log('🖼️  No image path, using placeholder')
    return '/placeholder-equipment.jpg'
  }

  // Заменяем localhost:3002 на production URL если найден
  if (imagePath.includes('localhost:3002')) {
    const url = imagePath.replace('http://localhost:3002', API_SERVER_URL)
    console.log('🖼️  Replaced localhost:3002, result:', url)
    return url
  }

  // Если уже полный URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('🖼️  Full URL detected:', imagePath)
    return imagePath
  }

  // Если путь начинается с /uploads
  if (imagePath.startsWith('/uploads')) {
    const url = `${API_SERVER_URL}${imagePath}`
    console.log('🖼️  /uploads path, result:', url)
    return url
  }

  // Если просто имя файла
  const url = `${API_SERVER_URL}/uploads/${imagePath}`
  console.log('🖼️  Filename only, result:', url)
  return url
}
