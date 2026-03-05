<template>
  <ThemeProvider>
    <SidebarProvider>
      <RouterView />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import { useMetersStore } from './stores/useMetersStore'
import { useAuthStore } from './features/auth/store/useAuthStore'
import { useDashboardStore } from './features/dashboard/store/useDashboardStore'

const metersStore = useMetersStore()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

// On app startup, load meters from customer devices API and restore selection
onMounted(async () => {
  // Restore user data from sessionStorage on app load
  try {
    const storedUser = sessionStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      authStore.setUser(user)
    }
  } catch (error) {
    console.error('[App] Failed to restore user data:', error)
  }

  // Load compteurs from API so meters can be hydrated
  await dashboardStore.loadCompteurs()

  // Hydrate meters store from compteurs and restore selection
  if (dashboardStore.compteurs.length > 0) {
    metersStore.setAllMetersFromCompteurs(dashboardStore.compteurs)
  }
  metersStore.restoreSelection()
})
</script>
