/**
 * Authentication API Service
 * Handles all API calls to backend login endpoint
 */

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export interface LoginResponse {
  success: boolean
  token: string
  message: string
}

export interface LoginCredentials {
  username: string
  password: string
}

/**
 * Call backend login API
 * Sends username/password to backend which calls external API
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const endpoint = `${API_URL}/auth/login`
    console.log('[authAPI] Calling login endpoint:', endpoint)
    console.log('[authAPI] Credentials:', { username: credentials.username })

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    console.log('[authAPI] Response status:', response.status)

    const data = await response.json()

    console.log('[authAPI] Response data:', { success: data.success, message: data.message })

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    return data
  } catch (error: any) {
    console.error('[authAPI] Login error:', error.message)
    throw error
  }
}

/**
 * Get stored token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('authToken')
}

/**
 * Store token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('authToken', token)
}

/**
 * Clear stored token from localStorage
 */
export function clearToken(): void {
  localStorage.removeItem('authToken')
}

/**
 * Check if token exists and is valid
 */
export function hasValidToken(): boolean {
  const token = getToken()
  if (!token) return false

  try {
    // Basic check: token should be a JWT-like string with dots
    return token.split('.').length === 3
  } catch {
    return false
  }
}
