import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthState } from '@/types'
import * as authAPI from '@/services/authAPI'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const login = async (username: string, password: string) => {
    console.log('[useAuthStore] LOGIN FUNCTION CALLED - START')
    loading.value = true
    error.value = null
    try {
      console.log('[useAuthStore] Login attempt with username:', username)
      console.log('[useAuthStore] authAPI object:', authAPI)
      console.log('[useAuthStore] authAPI.login function:', authAPI.login)

      // Call backend login API with username and password
      console.log('[useAuthStore] About to call authAPI.login()')
      const response = await authAPI.login({ username, password })

      console.log('[useAuthStore] Login successful, token received')
      console.log('[useAuthStore] Response:', response)

      // Store token from response
      authAPI.setToken(response.token)
      token.value = response.token

      // Create user object from username/email
      // Extract name from email: john.doe@example.com -> John Doe
      const emailPart = username.split('@')[0] // john.doe
      const nameFromEmail = emailPart
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')

      const mockUser: User = {
        id: username,
        name: nameFromEmail,
        email: username,
        role: 'Manager',
        createdAt: new Date(),
      }

      user.value = mockUser

      // Store user in sessionStorage
      sessionStorage.setItem('auth_token', response.token)
      sessionStorage.setItem('user', JSON.stringify(mockUser))

      loading.value = false

      console.log('[useAuthStore] User stored and loading set to false')
    } catch (err) {
      console.error('[useAuthStore] Login error:', err)
      console.error('[useAuthStore] Error type:', typeof err)
      console.error('[useAuthStore] Error message:', err instanceof Error ? err.message : String(err))
      error.value = err instanceof Error ? err.message : 'Login failed'
      loading.value = false
      throw err
    }
  }

  const logout = () => {
    console.log('[useAuthStore] Logout initiated')
    user.value = null
    token.value = null
    error.value = null

    // Clear all auth tokens from storage
    authAPI.clearToken() // Clear from localStorage
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('user')
    localStorage.removeItem('auth_token')

    console.log('[useAuthStore] Auth tokens cleared from storage')
  }

  const setUser = (newUser: User) => {
    user.value = newUser
  }

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const checkAuth = async () => {
    // Verify token from localStorage or sessionStorage and restore user
    try {
      const storedToken = authAPI.getToken() || sessionStorage.getItem('auth_token')
      if (!storedToken) {
        // No token found — ensure logged out
        logout()
        return false
      }

      // Basic JWT expiry check (if token is JWT)
      const parts = storedToken.split('.')
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
          if (payload && payload.exp && typeof payload.exp === 'number') {
            const now = Math.floor(Date.now() / 1000)
            if (payload.exp < now) {
              // Token expired
              console.log('[useAuthStore] Token expired')
              logout()
              return false
            }
          }
        } catch (e) {
          console.warn('[useAuthStore] Failed to parse token payload', e)
        }
      }

      // Restore token and user
      token.value = storedToken

      // If user not set in store, try sessionStorage
      if (!user.value) {
        const storedUser = sessionStorage.getItem('user')
        if (storedUser) {
          try {
            user.value = JSON.parse(storedUser)
          } catch (e) {
            console.warn('[useAuthStore] Failed to parse stored user', e)
          }
        }
      }

      return true
    } catch (err) {
      console.error('[useAuthStore] checkAuth error:', err)
      logout()
      return false
    }
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,
    error,
    // Actions
    login,
    logout,
    setUser,
    setToken,
    checkAuth,
  }
})
