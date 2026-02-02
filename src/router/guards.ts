/**
 * Route Guards for Authentication
 * Protects routes that require authentication
 */

import { useAuth } from '../composables/useAuth'

/**
 * Guard to require authentication
 * Redirects to signin if not authenticated
 */
export async function requireAuth(to: any, from: any, next: any) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated.value) {
    next()
  } else {
    next({ name: 'signin' })
  }
}

/**
 * Guard to prevent authenticated users from accessing signin/signup
 * Redirects to dashboard if already authenticated
 */
export async function requireNoAuth(to: any, from: any, next: any) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value) {
    next()
  } else {
    next({ name: 'dashboard' })
  }
}
