interface ApiErrorResponseData {
  error?: string
  message?: string
}

interface ApiErrorLike {
  response?: {
    status?: number
    data?: ApiErrorResponseData
  }
  message?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!isRecord(error)) {
    return fallback
  }

  const apiError = error as ApiErrorLike
  return apiError.response?.data?.error || apiError.response?.data?.message || apiError.message || fallback
}

export const hasApiStatus = (error: unknown, status: number): boolean => {
  if (!isRecord(error)) {
    return false
  }

  return (error as ApiErrorLike).response?.status === status
}
