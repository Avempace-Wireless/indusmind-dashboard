import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes,
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Set document title (translation handled in components)
  if (to.meta.title) {
    const title = to.meta.title as string
    if (!title.includes('.')) {
      // It's a plain string, not a translation key
      document.title = `${title} | IndusMind Energy Dashboard`
    }
  } else {
    document.title = 'Dashboard | IndusMind Energy Dashboard'
  }

  // Check authentication
  const token = sessionStorage.getItem('auth_token')
  const isAuthenticated = !!token
  const requiresAuth = to.meta.requiresAuth !== false // Default to true

  if (requiresAuth && !isAuthenticated && to.name !== 'Login') {
    // Redirect to login if not authenticated
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && isAuthenticated) {
    // Redirect to global-meters if already logged in
    next({ name: 'global-meters' })
  } else {
    next()
  }
})

export default router
