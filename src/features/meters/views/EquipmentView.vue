<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Breadcrumbs -->
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">{{ $t('sidebar.dashboard') }}</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">{{ $t('equipment.pageTitle') }}</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ $t('equipment.pageTitle') }}</h1>
              <span v-if="!isLoading" class="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {{ devices.length }} {{ $t('equipment.devicesMonitored') }} • {{ onlineCount }} {{ $t('equipment.online') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <div class="text-center">
          <div class="inline-block mb-4">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-slate-700 border-t-blue-600 dark:border-t-cyan-400"></div>
          </div>
          <p class="text-gray-600 dark:text-gray-400">{{ $t('equipment.loading') }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
        <div class="flex items-start gap-3">
          <svg class="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <h3 class="text-sm font-semibold text-red-800 dark:text-red-200">{{ $t('equipment.error') }}</h3>
            <p class="mt-1 text-sm text-red-700 dark:text-red-300">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="devices.length === 0" class="flex items-center justify-center py-16">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4m0 0L4 7m16 0l-8 4m0 0l8 4m-8-4v10m0 0l-8-4m0 0v10" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">{{ $t('equipment.noDevices') }}</h3>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ $t('equipment.noDevicesDescription') }}</p>
        </div>
      </div>

      <!-- Search and Filter Controls -->
      <div v-else class="flex flex-col gap-4">
        <!-- Search Bar -->
        <div class="flex items-center gap-3">
          <div class="flex-1 relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('equipment.search')"
              class="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
          <select
            v-model="selectedType"
            class="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="">{{ $t('equipment.filterAll') }}</option>
            <option value="meter">{{ $t('equipment.deviceType.meter') }}</option>
            <option value="sensor">{{ $t('equipment.deviceType.sensor') }}</option>
            <option value="controller">{{ $t('equipment.deviceType.controller') }}</option>
          </select>
        </div>

        <!-- Results Count -->
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ filteredDevices.length }} {{ filteredDevices.length === 1 ? $t('equipment.resultSingular') : $t('equipment.resultPlural') }}
        </p>
      </div>

      <!-- Equipment Table -->
      <div v-if="!isLoading && !error && filteredDevices.length > 0" class="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  {{ $t('equipment.table.name') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  {{ $t('equipment.table.type') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  {{ $t('equipment.table.status') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  {{ $t('equipment.table.currentValue') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  {{ $t('equipment.table.unit') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  {{ $t('equipment.table.lastUpdate') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="device in paginatedDevices" :key="device.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {{ device.name }}
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ device.label }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getDeviceBadgeClass(device)]">
                    {{ getDeviceType(device) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="[
                    'inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getDeviceStatus(device).isOnline
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
                  ]">
                    <span :class="[
                      'flex h-2 w-2 rounded-full',
                      getDeviceStatus(device).isOnline ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-600 dark:bg-gray-400'
                    ]"></span>
                    {{ getDeviceStatus(device).label }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                  {{ getDeviceValue(device) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {{ getDeviceUnit(device) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {{ formatLastUpdate(device) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('equipment.pagination.showing', { start: paginationStart, end: paginationEnd, total: filteredDevices.length }) }}
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ $t('common.previous') }}
            </button>
            <div class="flex items-center gap-1">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'px-3 py-2 rounded-lg border transition-colors',
                  currentPage === page
                    ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ $t('common.next') }}
            </button>
          </div>
        </div>
      </div>

      <!-- No Results State -->
      <div v-else-if="!isLoading && !error && devices.length > 0 && filteredDevices.length === 0" class="flex items-center justify-center py-16">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">{{ $t('equipment.noSearchResults') }}</h3>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ $t('equipment.noSearchResultsDescription') }}</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useViewLifecycle } from '@/composables/useViewLifecycle'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { getAllIndusmindCustomerDevices, type Device } from '@/services/deviceAPI'
import {
  fetchAllDevicesLatestTelemetry,
  formatTelemetryValue,
  isDeviceActive,
  type DeviceTelemetryData
} from '@/services/equipmentTelemetryAPI'

const { t } = useI18n()
const { isActive } = useViewLifecycle()

const devices = ref<Device[]>([])
const deviceTelemetry = ref<Map<string, DeviceTelemetryData>>(new Map())
const isLoading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedType = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
let telemetryInterval: ReturnType<typeof setInterval> | null = null

const onlineCount = computed(() => {
  let count = 0
  devices.value.forEach(device => {
    const telemetry = deviceTelemetry.value.get(device.deviceUUID)
    if (telemetry && telemetry.active) count++
  })
  return count
})

const getDeviceTypeEnum = (device: Device): string => {
  if (device.name.includes('PM2200')) return 'meter'
  if (device.name.includes('t_sensor')) return 'sensor'
  if (device.name.includes('_controller') || device.name.includes('Indusmind_Controller')) return 'controller'
  if (device.name.includes('Sensor') || device.name.includes('Capteur')) return 'sensor'
  return 'meter'
}

const getDeviceType = (device: Device): string => {
  const type = getDeviceTypeEnum(device)
  return t(`equipment.deviceType.${type}`)
}

const getDeviceBadgeClass = (device: Device): string => {
  const type = getDeviceTypeEnum(device)
  switch (type) {
    case 'meter':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
    case 'sensor':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
    case 'controller':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
    default:
      return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
  }
}

const filteredDevices = computed(() => {
  const filtered = devices.value.filter(device => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      device.label.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesType = selectedType.value === '' || getDeviceTypeEnum(device) === selectedType.value
    return matchesSearch && matchesType
  })

  // Sort by type first, then alphabetically by name
  const typeOrder: Record<string, number> = { 'meter': 1, 'sensor': 2, 'controller': 3 }
  return filtered.sort((a, b) => {
    const typeA = getDeviceTypeEnum(a)
    const typeB = getDeviceTypeEnum(b)
    const typeOrderA = typeOrder[typeA] || 99
    const typeOrderB = typeOrder[typeB] || 99

    if (typeOrderA !== typeOrderB) {
      return typeOrderA - typeOrderB
    }

    // Same type, sort alphabetically by name
    return a.name.localeCompare(b.name)
  })
})

const totalPages = computed(() => Math.ceil(filteredDevices.value.length / itemsPerPage))

const paginationStart = computed(() => (currentPage.value - 1) * itemsPerPage + 1)
const paginationEnd = computed(() => Math.min(currentPage.value * itemsPerPage, filteredDevices.value.length))

const paginatedDevices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredDevices.value.slice(start, start + itemsPerPage)
})

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const getDeviceValue = (device: Device): string => {
  const telemetry = deviceTelemetry.value.get(device.deviceUUID)
  if (!telemetry || !telemetry.telemetry) return '--'

  const type = getDeviceTypeEnum(device)
  let primaryKey = 'ActivePowerTotal'

  if (type === 'meter') {
    primaryKey = 'ActivePowerTotal'
  } else if (type === 'sensor') {
    primaryKey = 'Temperature'
  } else if (type === 'controller') {
    primaryKey = 'active'
  }

  const value = telemetry.telemetry[primaryKey]?.value

  return formatTelemetryValue(value, primaryKey)
}

const getDeviceStatus = (device: Device): { label: string; isOnline: boolean } => {
  const telemetry = deviceTelemetry.value.get(device.deviceUUID)
  if (!telemetry) {
    return { label: t('equipment.table.offline'), isOnline: false }
  }

  const active = isDeviceActive(telemetry.lastActivityTime)
  return {
    label: active ? t('equipment.table.online') : t('equipment.table.offline'),
    isOnline: active
  }
}

const getLastUpdate = (device: Device): number | null => {
  const telemetry = deviceTelemetry.value.get(device.deviceUUID)
  if (!telemetry) return null

  const type = getDeviceTypeEnum(device)
  let primaryKey = 'ActivePowerTotal'

  if (type === 'meter') {
    primaryKey = 'ActivePowerTotal'
  } else if (type === 'sensor') {
    primaryKey = 'Temperature'
  } else if (type === 'controller') {
    primaryKey = 'active'
  }

  return telemetry.telemetry[primaryKey]?.ts || telemetry.lastActivityTime || null
}

const getDeviceUnit = (device: Device): string => {
  const type = getDeviceTypeEnum(device)
  if (type === 'meter') return 'kW'
  if (type === 'sensor') return '°C'
  return '--'
}

const formatLastUpdate = (device: Device): string => {
  const lastUpdate = getLastUpdate(device)
  if (!lastUpdate) return '--'

  try {
    const date = new Date(lastUpdate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return t('equipment.table.justNow')
    if (diffMins < 60) return t('equipment.table.minutesAgo', { n: diffMins })
    if (diffHours < 24) return t('equipment.table.hoursAgo', { n: diffHours })
    if (diffDays < 7) return t('equipment.table.daysAgo', { n: diffDays })

    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '--'
  }
}

const fetchTelemetryData = async () => {
  try {
    // Fetch telemetry for all devices in a single bulk request
    const telemetryList = await fetchAllDevicesLatestTelemetry()

    // Convert array to map for quick lookup
    const telemetryMap = new Map<string, DeviceTelemetryData>()
    telemetryList.forEach(data => {
      telemetryMap.set(data.deviceUUID, data)
    })

    deviceTelemetry.value = telemetryMap
  } catch (err) {
    console.error('Error fetching telemetry data:', err)
  }
}

const fetchDevices = async () => {
  try {
    isLoading.value = true
    error.value = null
    devices.value = await getAllIndusmindCustomerDevices()

    // Fetch initial telemetry data using bulk API
    await fetchTelemetryData()

    // Set up auto-refresh every 10 seconds
    telemetryInterval = setInterval(() => {
      if (!isActive.value) return // Skip if component unmounted
      fetchTelemetryData()
    }, 10000)
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('equipment.fetchError')
    console.error('Error fetching devices:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDevices()
})

onUnmounted(() => {
  if (telemetryInterval) {
    clearInterval(telemetryInterval)
  }
})
</script>
