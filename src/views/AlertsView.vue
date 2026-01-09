<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Breadcrumbs -->
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Alerts</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Alert Management</h1>
              <span v-if="unacknowledgedCount > 0" class="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {{ filteredAlerts.length }} total alerts • {{ unacknowledgedCount }} require attention
            </p>
          </div>
        <div class="flex gap-3">
          <button
            @click="exportAlerts"
            class="flex h-9 items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">download</span>
            Export
          </button>
          <button
            @click="showFilters = !showFilters"
            class="flex h-9 items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">filter_list</span>
            Filters
          </button>
          <button
            @click="acknowledgeAll"
            v-if="unacknowledgedCount > 0"
            class="flex h-9 items-center gap-2 rounded-lg bg-[#135bec] px-4 text-sm font-bold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-600 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">done_all</span>
            Acknowledge All
          </button>
        </div>
      </div>
      </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Filters Sidebar -->
      <div v-if="showFilters" class="lg:col-span-1">
        <AlertFilters
          :equipment-list="equipmentNames"
          @update:filters="handleFilterChange"
        />
      </div>

      <!-- Alerts List -->
      <div :class="showFilters ? 'lg:col-span-3' : 'lg:col-span-4'">
        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div
            v-for="level in alertLevels"
            :key="level"
            class="bg-white dark:bg-gray-800 rounded-lg p-4 text-center"
          >
            <p :class="levelColorClass(level)" class="text-2xl font-bold">
              {{ getLevelCount(level) }}
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ level }}</p>
          </div>
        </div>

        <!-- Alert List -->
        <div v-if="filteredAlerts.length === 0" class="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-gray-600 dark:text-gray-400">No alerts match your filters</p>
        </div>

        <div v-else class="space-y-4">
          <AlertItem
            v-for="alert in paginatedAlerts"
            :key="alert.id"
            :alert="alert"
            @acknowledge="handleAcknowledge"
            @view-details="handleViewDetails"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Previous
          </button>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>

      <!-- Alert Details Modal (placeholder) -->
      <div v-if="selectedAlert" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="selectedAlert = null">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full m-4" @click.stop>
          <h2 class="text-xl font-bold mb-4">Alert Details</h2>
          <p>Details for alert {{ selectedAlert }}</p>
          <button @click="selectedAlert = null" class="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useAlertsStore } from '@/stores/useAlertsStore'
import { useEquipmentStore } from '@/stores/useEquipmentStore'
import { useWebSocket } from '@/composables/useWebSocket'
import AlertItem from '@/components/alerts/AlertItem.vue'
import AlertFilters from '@/components/alerts/AlertFilters.vue'
import type { AlertLevel } from '@/types'

const alertsStore = useAlertsStore()
const equipmentStore = useEquipmentStore()
const { isConnected } = useWebSocket('alerts:new')
const { t } = useI18n()

const showFilters = ref(true)
const currentPage = ref(1)
const itemsPerPage = 10
const selectedAlert = ref<string | null>(null)

const filters = ref({
  levels: ['Emergency', 'Critical', 'High', 'Medium', 'Low', 'Informational'] as AlertLevel[],
  equipment: '',
  status: 'all' as 'all' | 'acknowledged' | 'unacknowledged',
  dateFrom: '',
  dateTo: '',
  search: '',
})

const alertLevels: AlertLevel[] = ['Emergency', 'Critical', 'High', 'Medium', 'Low', 'Informational']

const filteredAlerts = computed(() => {
  return alertsStore.alerts.filter(alert => {
    // Level filter
    if (!filters.value.levels.includes(alert.level as AlertLevel)) return false

    // Equipment filter
    if (filters.value.equipment && alert.equipmentId !== filters.value.equipment) return false

    // Status filter
    if (filters.value.status === 'acknowledged' && !alert.acknowledgedAt) return false
    if (filters.value.status === 'unacknowledged' && alert.acknowledgedAt) return false

    // Date filter
    if (filters.value.dateFrom) {
      const alertDate = new Date(alert.detectedAt)
      const fromDate = new Date(filters.value.dateFrom)
      if (alertDate < fromDate) return false
    }
    if (filters.value.dateTo) {
      const alertDate = new Date(alert.detectedAt)
      const toDate = new Date(filters.value.dateTo)
      toDate.setHours(23, 59, 59)
      if (alertDate > toDate) return false
    }

    // Search filter
    if (filters.value.search) {
      const searchLower = filters.value.search.toLowerCase()
      const translatedMessage = t(alert.message).toLowerCase()
      return translatedMessage.includes(searchLower) ||
             alert.equipmentId.toLowerCase().includes(searchLower)
    }

    return true
  })
})

const paginatedAlerts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAlerts.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredAlerts.value.length / itemsPerPage))

const unacknowledgedCount = computed(() => alertsStore.alerts.filter(a => !a.acknowledgedAt).length)

const equipmentNames = computed(() => {
  return [...new Set(alertsStore.alerts.map(a => a.equipmentId))]
})

const getLevelCount = (level: AlertLevel) => {
  return alertsStore.alerts.filter(a => a.level === level).length
}

const levelColorClass = (level: string) => {
  const classes = {
    'Emergency': 'text-purple-600 dark:text-purple-400',
    'Critical': 'text-red-600 dark:text-red-400',
    'High': 'text-orange-600 dark:text-orange-400',
    'Medium': 'text-yellow-600 dark:text-yellow-400',
    'Low': 'text-green-600 dark:text-green-400',
    'Informational': 'text-blue-600 dark:text-blue-400',
  }
  return classes[level as keyof typeof classes] || 'text-gray-600'
}

const handleFilterChange = (newFilters: any) => {
  filters.value = newFilters
  currentPage.value = 1 // Reset to first page on filter change
}

const handleAcknowledge = (id: string) => {
  const userId = 'user-1' // Get from auth store in production
  alertsStore.acknowledgeAlert(id, userId)
}

const acknowledgeAll = () => {
  const userId = 'user-1'
  alertsStore.alerts
    .filter(a => !a.acknowledgedAt)
    .forEach(a => alertsStore.acknowledgeAlert(a.id, userId))
}

const exportAlerts = () => {
  // Export alerts to CSV
  const csvContent = [
    ['Timestamp', 'Equipment', 'Level', 'Message', 'Status'].join(','),
    ...filteredAlerts.value.map(a =>
      [a.detectedAt, a.equipmentId, a.level, `"${a.message}"`, a.acknowledgedAt ? 'Acknowledged' : 'Active'].join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `alerts-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

const handleViewDetails = (id: string) => {
  selectedAlert.value = id
}

onMounted(() => {
  // Initialize with mock alerts
  alertsStore.$patch({
    alerts: [
      {
        id: '1',
        equipmentId: 'eq-001',
        level: 'High',
        message: 'Power consumption exceeding threshold',
        description: 'Power consumption has exceeded 90% of target',
        detectedAt: new Date(Date.now() - 300000),
        acknowledgedAt: undefined,
        acknowledgedBy: undefined,
        status: 'New',
        currentValue: 135
      }
    ]
  })
})

onUnmounted(() => {
  // Cleanup
})
</script>
