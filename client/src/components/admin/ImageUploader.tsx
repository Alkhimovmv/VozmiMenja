import { useState } from 'react'
import { apiClient } from '../../lib/api'
import { getImageUrl } from '../../lib/utils'
import { ArrowUp, ArrowDown, X } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
}

export default function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError('')

    try {
      const filesArray = Array.from(files)
      const response = await apiClient.uploadImages(filesArray)

      if (response.success && response.data) {
        const newImages = [...images.filter(img => img.trim() !== ''), ...response.data]
        onImagesChange(newImages)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Ошибка при загрузке изображений')
    } finally {
      setIsUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleImageUrlChange = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    onImagesChange(newImages)
  }

  const addImageUrl = () => {
    onImagesChange([...images, ''])
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages.length > 0 ? newImages : [''])
  }

  const moveImageUp = (index: number) => {
    if (index === 0) return
    const newImages = [...images]
    const temp = newImages[index]
    newImages[index] = newImages[index - 1]
    newImages[index - 1] = temp
    onImagesChange(newImages)
  }

  const moveImageDown = (index: number) => {
    if (index === images.length - 1) return
    const newImages = [...images]
    const temp = newImages[index]
    newImages[index] = newImages[index + 1]
    newImages[index + 1] = temp
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Загрузить изображения с устройства
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
          />
          {isUploading && (
            <span className="text-sm text-gray-500">Загрузка...</span>
          )}
        </div>
        {uploadError && (
          <p className="mt-1 text-sm text-red-600">{uploadError}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Макс размер: 5МБ. Форматы: JPG, PNG, GIF, WebP
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Или введите URL изображений
        </label>
        {images.length === 0 && (
          <p className="text-sm text-gray-500 mb-3">
            Нажмите "+ Добавить URL" ниже или загрузите файлы выше
          </p>
        )}
        {images.map((image, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={image}
              onChange={(e) => handleImageUrlChange(index, e.target.value)}
            />
            {image && (
              <img
                src={getImageUrl(image)}
                alt={`Preview ${index}`}
                className="w-12 h-12 object-cover rounded border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => moveImageUp(index)}
                disabled={index === 0}
                className="px-2 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                title="Переместить вверх"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveImageDown(index)}
                disabled={index === images.length - 1}
                className="px-2 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                title="Переместить вниз"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="px-2 py-2 bg-red-500 text-white rounded-md hover:bg-gray-600 text-sm"
                title="Удалить"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addImageUrl}
          className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
        >
          + Добавить URL
        </button>
      </div>

      {images.filter(img => img.trim() !== '').length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Предпросмотр изображений (перетащите для изменения порядка)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {images.filter(img => img.trim() !== '').map((image, index) => {
              const actualIndex = images.indexOf(image)
              return (
                <div key={index} className="relative group">
                  <img
                    src={getImageUrl(image)}
                    alt={`Equipment ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => moveImageUp(actualIndex)}
                      disabled={actualIndex === 0}
                      className="bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-800 disabled:opacity-30"
                      title="Переместить влево"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImageDown(actualIndex)}
                      disabled={actualIndex === images.length - 1}
                      className="bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-gray-800 disabled:opacity-30"
                      title="Переместить вправо"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(actualIndex)}
                      className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      title="Удалить"
                    >
                      ×
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
