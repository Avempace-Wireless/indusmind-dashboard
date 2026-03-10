/**
 * Vue 3 Composable for Authentication
 * Manages login state, token storage, and user info
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as authAPI from '../services/authAPI'

// Global state
const isAuthenticated = ref(authAPI.hasValidToken())
const user = ref<any>(null)
const token = ref(authAPI.getToken() || '')
const loading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
  const router = useRouter()

  /**
   * Login user with username and password
   */
  async function login(username: string, password: string) {
    try {
      loading.value = true
      error.value = null

      console.log('[useAuth] Starting login for:', username)

      // Call backend login API
      const response = await authAPI.login({ username, password })

      console.log('[useAuth] Login API response:', response)

      // Store token
      authAPI.setToken(response.token)
      token.value = response.token

      isAuthenticated.value = true

      console.log('[useAuth] Login successful')

      // Auto redirect to dashboard after successful login
      setTimeout(() => {
        router.push({ name: 'dashboard' })
      }, 300)

      return response
    } catch (err: any) {
      console.error('[useAuth] Login error caught:', err)
      console.error('[useAuth] Error message:', err.message)
      const message = err.message || 'Login failed'
      error.value = message
      console.error('[useAuth] Error value set to:', error.value)
      throw err
    } finally {
      loading.value = false
      console.log('[useAuth] Loading set to false')
    }
  }

  /**
   * Logout user and clear stored data
   */
  function logout() {
    authAPI.clearToken()
    token.value = ''
    user.value = null
    isAuthenticated.value = false
    error.value = null

    console.log('[useAuth] Logout successful')

    // Redirect to signin
    router.push({ name: 'signin' })
  }

  /**
   * Clear error message
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    isAuthenticated: computed(() => isAuthenticated.value),
    user: computed(() => user.value),
    token: computed(() => token.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Methods
    login,
    logout,
    clearError
  }
}
