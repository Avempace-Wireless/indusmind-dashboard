import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthState } from '../types'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      // TODO: Call backend login API
      // For now, simulate successful login
      // const response = await apiClient.post('/auth/login', { email, password })

      // Mock successful login for development
      const mockToken = 'mock-jwt-token-' + Date.now()
      const mockUser: User = {
        id: '1',
        name: 'Demo User',
        email: email,
        role: 'Admin',
        createdAt: new Date(),
      }

      token.value = mockToken
      user.value = mockUser

      // Store token in sessionStorage for auth guard
      sessionStorage.setItem('auth_token', mockToken)
      sessionStorage.setItem('user', JSON.stringify(mockUser))

      loading.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      loading.value = false
      throw err
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    error.value = null

    // Clear sessionStorage
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('user')
  }

  const setUser = (newUser: User) => {
    user.value = newUser
  }

  const setToken = (newToken: string) => {
    token.value = newToken
  }

  const checkAuth = async () => {
    // TODO: Verify token validity, refresh if needed
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
