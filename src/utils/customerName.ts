/**
 * Read customerName from sessionStorage user object.
 */
function parseCustomerFromToken(token: string | null): string {
  if (!token) return ''

  const parts = token.split('.')
  if (parts.length !== 3) return ''

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(payload))
    return decoded?.customerName || ''
  } catch (error) {
    console.warn('[customerName] Failed to parse token payload', error)
    return ''
  }
}

export function getCustomerNameFromSession(): string {
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)
      if (user?.customerName) return user.customerName
    } catch (error) {
      console.warn('[customerName] Failed to parse stored user', error)
    }
  }

  // Fallback to token payload if user is missing or incomplete
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('auth_token')
  return parseCustomerFromToken(token)
}

/**
 * Get user information from sessionStorage
 */
export function getUserFromSession(): {
  id?: number | string
  email?: string
  name?: string
  firstName?: string
  lastName?: string
  role?: string
  customerName?: string
} {
  const storedUser = sessionStorage.getItem('user')
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)
      const firstName = user?.firstName || user?.firstname || ''
      const lastName = user?.lastName || user?.lastname || ''
      const name = user?.name || [firstName, lastName].filter(Boolean).join(' ')
      return {
        ...user,
        name,
        firstName,
        lastName,
      }
    } catch (error) {
      console.warn('[getUserFromSession] Failed to parse stored user', error)
    }
  }
  return {}
}
