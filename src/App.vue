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

const metersStore = useMetersStore()

// On app startup, load meters from customer devices API and clean up localStorage
onMounted(async () => {
  // Fetch meters from API (now uses customer devices API)
  await metersStore.fetchMeters()

  // Clean up and restore selection
  metersStore.restoreSelection()
})
</script>
