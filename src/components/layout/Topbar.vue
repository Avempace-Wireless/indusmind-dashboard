<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
    <!-- Left: Breadcrumb/Title -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ routeTitle }}
      </h1>
    </div>

    <!-- Right: Alerts, Settings, User -->
    <div class="flex items-center gap-4">
      <!-- Alert Badge -->
      <button class="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <span v-if="unacknowledgedCount > 0" class="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
          {{ unacknowledgedCount }}
        </span>
      </button>

      <!-- Theme Toggle -->
      <button
        @click="toggleTheme"
        class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
      >
        <svg v-if="isDark" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12.3 6.2c3.9-.4 7.1 2.5 6.7 6.4-.2 2.3-1.5 4.4-3.5 5.5-2 1.1-4.5.9-6.3-.5-1.8-1.4-2.8-3.6-2.8-5.8 0-3.5 2.8-6.5 6.2-6.8.1 0 .2.1.1.2-.1.1-.1.1 0 .2 3.2.4 5.7 3.1 5.2 6.3-.3 1.9-1.3 3.6-2.8 4.7-1.5 1.1-3.5 1.3-5.3.6-1.8-.7-3-2.4-3-4.3 0-3 2.4-5.4 5.4-5.6.1 0 .1 0 .1.1 0 0-.1.1 0 .2z"
          />
        </svg>
        <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 18a6 6 0 100-12 6 6 0 000 12zM12 2v4m0 12v4M4.22 4.22l2.83 2.83m5.9 5.9l2.83 2.83M2 12h4m12 0h4m-1.78-7.78l-2.83 2.83m-5.9 5.9l-2.83 2.83"
          />
        </svg>
      </button>

      <!-- User Menu -->
      <div class="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
        <div class="text-right">
          <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user?.name || 'User' }}</div>
          <div class="text-xs text-gray-500">{{ user?.role || 'Operator' }}</div>
        </div>
        <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {{ initials }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAlertsStore } from '@/stores/useAlertsStore'

const route = useRoute()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const alertsStore = useAlertsStore()

const routeTitle = computed(() => {
  const titles: Record<string, string> = {
    Dashboard: 'Dashboard',
    Alerts: 'Alerts',
    Equipment: 'Equipment',
    History: 'Historical Data',
    Reports: 'Reports & Compliance',
    Settings: 'Settings',
  }
  return titles[route.name as string] || 'Dashboard'
})

const isDark = computed(() => settingsStore.settings.theme === 'dark')

const user = computed(() => authStore.user)

const unacknowledgedCount = computed(() => alertsStore.unacknowledgedCount)

const initials = computed(() => {
  if (!user.value) return 'U'
  const parts = user.value.name.split(' ')
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
})

const toggleTheme = () => {
  const newTheme = isDark.value ? 'light' : 'dark'
  settingsStore.setTheme(newTheme)
}
</script>
