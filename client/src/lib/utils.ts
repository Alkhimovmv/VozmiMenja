import { API_SERVER_URL } from './api'

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-equipment.jpg'

  // Если уже полный URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Если путь начинается с /uploads
  if (imagePath.startsWith('/uploads')) {
    return `${API_SERVER_URL}${imagePath}`
  }

  // Если просто имя файла
  return `${API_SERVER_URL}/uploads/${imagePath}`
}
