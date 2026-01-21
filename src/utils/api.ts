import type { ApiError } from '@/types'

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  token?: string
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${baseUrl}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      throw new Error(error.message || `API Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error)
    throw error
  }
}

export const apiClient = {
  get: <T,>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: 'GET', token }),

  post: <T,>(endpoint: string, body: any, token?: string) =>
    apiRequest<T>(endpoint, { method: 'POST', body, token }),

  put: <T,>(endpoint: string, body: any, token?: string) =>
    apiRequest<T>(endpoint, { method: 'PUT', body, token }),

  delete: <T,>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE', token }),
}
