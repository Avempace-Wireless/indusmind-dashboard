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
import { useMetersStore } from './stores/useDeviceMetersStore'
import { useAuthStore } from './features/auth/store/useAuthStore'

const metersStore = useMetersStore()
const authStore = useAuthStore()

// On app startup, load meters from customer devices API and clean up localStorage
onMounted(async () => {
  // Restore user data from sessionStorage on app load
  try {
    const storedUser = sessionStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      authStore.setUser(user)
      console.log('[App] User data restored on app load:', user)
    }
  } catch (error) {
    console.error('[App] Failed to restore user data:', error)
  }

  // Fetch meters from API (now uses customer devices API)
  await metersStore.fetchMeters()

  // Clean up and restore selection
  metersStore.restoreSelection()
})
</script>
