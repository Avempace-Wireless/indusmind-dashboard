import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface GlobalState {
  sidebarOpen: boolean
  currentSite: string
  apiBaseUrl: string
  wsBaseUrl: string
}

export const useGlobalStore = defineStore('global', () => {
  const state = ref<GlobalState>({
    sidebarOpen: true,
    currentSite: 'Tunis',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/',
    wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:4000',
  })

  const toggleSidebar = () => {
    state.value.sidebarOpen = !state.value.sidebarOpen
  }

  const setSite = (site: string) => {
    state.value.currentSite = site
  }

  return {
    state,
    toggleSidebar,
    setSite,
  }
})
