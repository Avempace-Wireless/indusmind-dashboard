<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Page Header with Breadcrumbs -->
      <PageHeader
        title="Alert Management"
        :subtitle="`${filteredAlerts.length} total alerts • ${unacknowledgedCount} require attention`"
        :breadcrumbs="[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Alerts', to: '/alerts', active: true }
        ]"
      >
        <template #badge>
          <span v-if="unacknowledgedCount > 0" class="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
        </template>
        <template #actions>
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
            v-if="unacknowledgedCount > 0"
            @click="acknowledgeAll"
            class="flex h-9 items-center gap-2 rounded-lg bg-[#135bec] px-4 text-sm font-bold text-white shadow-lg shadow-blue-900/40 hover:bg-blue-600 transition-colors"
          >
            <span class="material-symbols-outlined text-lg">done_all</span>
            Acknowledge All
          </button>
        </template>
      </PageHeader>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Filters Sidebar -->
        <div v-if="showFilters" class="lg:col-span-1">
          <AlertFilters
            :equipment-list="equipmentNames"
            @update:filters="handleFilterChange"
          />
        </div>

        <!-- Alerts List Content -->
        <div :class="showFilters ? 'lg:col-span-3' : 'lg:col-span-4'">
          <!-- Summary Cards -->
          <SummaryCards
            :items="summaryCardItems"
            class="mb-6"
          />

          <!-- Alert Items List -->
          <ItemsList
            :items="filteredAlerts"
            :total-pages="totalPages"
            :current-page="currentPage"
            empty-icon="shield_alert"
            empty-label="No alerts match your filters"
            @prev-page="currentPage--"
            @next-page="currentPage++"
          >
            <template #items="{ items }">
              <div class="space-y-4">
                <AlertItem
                  v-for="alert in paginatedAlerts"
                  :key="alert.id"
                  :alert="alert"
                  @acknowledge="handleAcknowledge"
                  @view-details="handleViewDetails"
                />
              </div>
            </template>
          </ItemsList>
        </div>
      </div>

      <!-- Alert Details Modal -->
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
import { useAlertsStore } from '@/features/alerts/store/useAlertsStore'
import { useEquipmentStore } from '@/stores/useEquipmentStore'
import { useWebSocket } from '@/composables/useWebSocket'
import AlertItem from '@/components/alerts/AlertItem.vue'
import AlertFilters from '@/components/alerts/AlertFilters.vue'
import { PageHeader, SummaryCards, ItemsList } from '@/features/shared/meters/components'
import type { AlertLevel } from '@/types'
import type { SummaryCardItem } from '@/features/shared/meters/components'

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

const summaryCardItems = computed<SummaryCardItem[]>(() => {
  const levelColorMap: Record<AlertLevel, string> = {
    'Emergency': 'text-purple-600 dark:text-purple-400',
    'Critical': 'text-red-600 dark:text-red-400',
    'High': 'text-orange-600 dark:text-orange-400',
    'Medium': 'text-yellow-600 dark:text-yellow-400',
    'Low': 'text-green-600 dark:text-green-400',
    'Informational': 'text-blue-600 dark:text-blue-400',
  }

  return alertLevels.map(level => ({
    key: level.toLowerCase(),
    value: String(getLevelCount(level)),
    label: level,
    valueClass: levelColorMap[level],
    className: 'col-span-1'
  }))
})

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
