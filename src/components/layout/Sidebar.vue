<template>
  <aside
    :class="{ 'w-64': !collapsed, 'w-20': collapsed }"
    class="bg-gray-900 text-white transition-all duration-300 flex flex-col border-r border-gray-800 h-screen overflow-hidden"
  >
    <!-- Logo -->
    <div class="p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
      <div v-if="!collapsed" class="text-xl font-bold">IndusMind</div>
      <button @click="toggleSidebar" class="p-1 hover:bg-gray-800 rounded">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
      <!-- Group 1: Dashboard & Monitoring -->
      <router-link
        to="/dashboard"
        :class="isActive('dashboard')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">dashboard</span>
        <span v-if="!collapsed">Dashboard</span>
      </router-link>

      <!-- Group 2: Consumption Analysis -->
      <div v-if="!collapsed" class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Consumption
      </div>
      <router-link
        to="/consumption"
        :class="isActive('consumption')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">flash_on</span>
        <span v-if="!collapsed">Consumption</span>
      </router-link>

      <router-link
        to="/base-load"
        :class="isActive('base-load')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">trending_flat</span>
        <span v-if="!collapsed">Base Load</span>
      </router-link>

      <router-link
        to="/peak-demand"
        :class="isActive('peak-demand')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">trending_up</span>
        <span v-if="!collapsed">Peak Demand</span>
      </router-link>

      <!-- Group 3: Analysis & Insights -->
      <div v-if="!collapsed" class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
        Analysis
      </div>
      <router-link
        to="/analysis"
        :class="isActive('analysis')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">analytics</span>
        <span v-if="!collapsed">Analysis</span>
      </router-link>

      <router-link
        to="/cost-analysis"
        :class="isActive('cost-analysis')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">payments</span>
        <span v-if="!collapsed">Cost Analysis</span>
      </router-link>

      <router-link
        to="/comparison"
        :class="isActive('comparison')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">compare_arrows</span>
        <span v-if="!collapsed">Comparison</span>
      </router-link>

      <!-- Group 4: Reports -->
      <div v-if="!collapsed" class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
        Reports
      </div>
      <router-link
        to="/reports"
        :class="isActive('reports')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">description</span>
        <span v-if="!collapsed">Reports</span>
      </router-link>

      <router-link
        to="/history"
        :class="isActive('history')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">history</span>
        <span v-if="!collapsed">History</span>
      </router-link>

      <!-- Group 5: Alerts & Notifications -->
      <div v-if="!collapsed" class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
        Alerts
      </div>
      <router-link
        to="/alerts"
        :class="isActive('alerts')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">notifications_active</span>
        <span v-if="!collapsed" class="flex-1">Alerts</span>
        <span v-if="!collapsed && unacknowledgedAlerts > 0"
              class="px-2 py-0.5 text-xs font-semibold bg-red-600 rounded-full">
          {{ unacknowledgedAlerts }}
        </span>
      </router-link>

      <router-link
        to="/alert-config"
        :class="isActive('alert-config')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">tune</span>
        <span v-if="!collapsed">Alert Rules</span>
      </router-link>

      <!-- Group 6: Performance & KPIs -->
      <div v-if="!collapsed" class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
        Performance
      </div>
      <router-link
        to="/performance"
        :class="isActive('performance')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">speed</span>
        <span v-if="!collapsed">KPI Dashboard</span>
      </router-link>

      <router-link
        to="/benchmarking"
        :class="isActive('benchmarking')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">bar_chart</span>
        <span v-if="!collapsed">Benchmarking</span>
      </router-link>

      <!-- Group 7: Inventory & Assets -->
      <div v-if="!collapsed" class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
        Inventory
      </div>
      <router-link
        to="/equipment"
        :class="isActive('equipment')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">devices</span>
        <span v-if="!collapsed">Equipment</span>
      </router-link>

      <router-link
        to="/locations"
        :class="isActive('locations')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">location_on</span>
        <span v-if="!collapsed">Sites & Locations</span>
      </router-link>

      <!-- Group 8: Settings & Configuration -->
      <div v-if="!collapsed" class="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
        Configuration
      </div>
      <router-link
        to="/settings"
        :class="isActive('settings')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">settings</span>
        <span v-if="!collapsed">Settings</span>
      </router-link>

      <router-link
        to="/users"
        :class="isActive('users')"
        class="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:bg-gray-800"
      >
        <span class="material-symbols-outlined text-xl">group</span>
        <span v-if="!collapsed">User Management</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-800 flex-shrink-0">
      <button @click="logout" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span v-if="!collapsed">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGlobalStore } from '@/stores/useGlobalStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAlertsStore } from '@/stores/useAlertsStore'

const route = useRoute()
const router = useRouter()
const globalStore = useGlobalStore()
const authStore = useAuthStore()
const alertsStore = useAlertsStore()

const collapsed = computed(() => !globalStore.state.sidebarOpen)
const unacknowledgedAlerts = computed(() => alertsStore.unacknowledgedCount)

const toggleSidebar = () => {
  globalStore.toggleSidebar()
}

const isActive = (name: string) => {
  return route.name === name ? 'bg-blue-600' : ''
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
