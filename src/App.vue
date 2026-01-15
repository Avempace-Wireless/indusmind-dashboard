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

const metersStore = useMetersStore()

// On app startup, clean up invalid meter IDs from localStorage
onMounted(() => {
  // Clear and reinitialize with valid IDs
  metersStore.clearPersisted()
  metersStore.restoreSelection()
})
</script>
