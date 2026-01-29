<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-0 px-1 py-1 global-meters-view">
      <!-- Ultra-compact Header -->
      <div class="flex items-center justify-between gap-2" style="padding: 4px 0; border-bottom: 1px solid #e2e8f0; --tw-border-opacity: 1;">
        <h1 class="text-slate-900 dark:text-white text-sm font-bold">
          {{ $t('globalMeters.pageTitle') }}
        </h1>
        <button
          @click="showCompteurSelector = true"
          class="flex items-center gap-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          style="font-size: 11px; padding: 3px 6px;"
        >
          <span class="material-symbols-outlined" style="font-size: 14px;">tune</span>
          {{ $t('globalMeters.selectMeters') }}
        </button>
      </div>

      <!-- CompteurSelector Modal -->
      <CompteurSelector
        :is-open="showCompteurSelector"
        :all-compteurs="availableCompteurs"
        :selected-ids="selectedCompteurIds"
        @apply="handleCompteurSelection"
        @close="showCompteurSelector = false"
      />

      <!-- Main Content: Full responsive layout -->
      <div v-if="selectedCompteurs.length === 0" class="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700">
        <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-7xl mb-4">devices</span>
        <p class="text-slate-600 dark:text-slate-400 text-xl font-semibold mb-2">{{ $t('globalMeters.selectMetersToVisualize') }}</p>
        <button
          @click="showCompteurSelector = true"
          class="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm font-bold text-white transition-colors shadow-lg"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          {{ $t('globalMeters.selectMeters') }}
        </button>
      </div>

      <!-- Content Grid - Full page with cards left (1/2 or 2/3), charts right (1/2 or 1/3) -->
      <div v-else class="flex flex-col md:flex-row gap-1 overflow-y-auto md:overflow-hidden pb-2" style="height: calc(100vh - 110px);">
        <!-- Left Panel: Meter Cards - Dynamic width based on meter count -->
        <div class="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg p-0.5 md:p-1 border border-slate-200 dark:border-slate-700 flex flex-col min-h-0 overflow-y-auto md:overflow-hidden" :style="leftPanelStyle">
          <div class="grid gap-1 md:gap-2 flex-1 min-h-0 auto-rows-fr" :style="getGridStyle()">
            <div
              v-for="(compteur, index) in enrichedCompteurs"
              :key="compteur.id"
              class="rounded-xl bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all overflow-hidden relative border-2 flex flex-col"
              :style="{
                borderColor: getChartColor(index),
                boxShadow: `0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 0 2px ${getChartColor(index)}15`,
                minHeight: 'clamp(200px, 40vh, 350px)'
              }"
            >
              <!-- Card Header with color accent - Responsive -->
              <div :class="[
                'px-1 md:px-2 py-0.5 md:py-1 flex-shrink-0',
                `border-b-2 border-${getMeterColorTailwind(index)}-400 dark:border-${getMeterColorTailwind(index)}-500`
              ]" :style="{ backgroundColor: `${getChartColor(index)}08` }">
                <div class="flex items-center gap-0.5 md:gap-1 mb-0.25">
                  <span class="material-symbols-outlined" :style="{ fontSize: 'clamp(12px, 2vmin, 16px)', color: getChartColor(index) }">bolt</span>
                  <h3 class="font-bold text-slate-900 dark:text-slate-50 flex-1 truncate" style="font-size: clamp(9px, 1.3vmin, 13px);">{{ compteur.name }}</h3>
                  <span :class="[
                    'inline-flex h-1.5 w-1.5 rounded-full flex-shrink-0',
                    compteur.status === 'online'
                      ? 'bg-green-500 animate-pulse shadow-[0_0_3px_rgba(34,197,94,0.5)]'
                      : 'bg-red-500 shadow-[0_0_3px_rgba(239,68,68,0.5)]'
                  ]"></span>
                </div>
                <p class="text-slate-600 dark:text-slate-300 font-medium" style="font-size: clamp(7px, 0.9vmin, 9px);">{{ compteur.subtitle || $t('globalMeters.energyMeter') }}</p>
              </div>

              <!-- Card Content - Responsive Height -->
              <div class="px-0.5 md:px-1 py-0 flex-1 flex flex-col justify-center gap-0 min-h-0">
                <!-- Instantaneous Power -->
                <div class="text-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-0 border border-slate-200 dark:border-slate-700 flex-1 flex flex-col justify-center items-center">
                  <div>
                    <span class="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider" style="font-size: clamp(5px, 0.6vmin, 7px); line-height: 1;">
                      {{ $t('globalMeters.instantaneousPower') }}
                    </span>
                  </div>
                  <div class="flex items-baseline justify-center gap-0.5 mt-0.25">
                    <span class="font-extrabold leading-none" :style="{ fontSize: 'clamp(20px, 5vmin, 48px)', color: getChartColor(index) }">
                      {{ formatValue(compteur.instantaneous) }}
                    </span>
                    <span class="font-bold text-slate-900 dark:text-slate-100" style="font-size: clamp(8px, 1vmin, 12px);">kW</span>
                  </div>
                </div>

                <!-- Today vs Yesterday Comparison - Proportional -->
                <div class="grid grid-cols-2 gap-0 flex-1">
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-0 border border-green-200 dark:border-green-900/30 flex flex-col justify-center items-center">
                    <p class="text-green-700 dark:text-green-400 font-bold" style="font-size: clamp(5px, 0.6vmin, 7px); line-height: 1;">{{ $t('globalMeters.today') }}</p>
                    <p class="text-green-900 dark:text-green-200 font-bold leading-tight" style="font-size: clamp(14px, 2.3vmin, 24px); line-height: 1.1;">{{ formatValue(compteur.today) }}</p>
                    <p class="text-green-700 dark:text-green-300 font-medium" style="font-size: clamp(5px, 0.6vmin, 7px); line-height: 1;">kWh</p>
                  </div>
                  <div class="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-900/30 rounded-lg p-0 border border-slate-300 dark:border-slate-700/50 flex flex-col justify-center items-center">
                    <p class="text-slate-600 dark:text-slate-400 font-bold" style="font-size: clamp(5px, 0.6vmin, 7px); line-height: 1;">{{ $t('globalMeters.yesterday') }}</p>
                    <p class="text-slate-800 dark:text-slate-200 font-bold leading-tight" style="font-size: clamp(14px, 2.3vmin, 24px); line-height: 1.1;">{{ formatValue(compteur.yesterday) }}</p>
                    <p class="text-slate-600 dark:text-slate-400 font-medium" style="font-size: clamp(5px, 0.6vmin, 7px); line-height: 1;">kWh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Charts - Takes remaining space -->
        <div class="flex-1 grid grid-cols-1 gap-1 min-h-0 md:flex md:flex-col rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 md:p-1" :style="rightPanelStyle">
          <!-- Energy Chart -->
          <div class="overflow-hidden rounded-lg md:rounded-xl border border-green-300 md:border-2 dark:border-green-800 bg-white shadow-lg dark:bg-gray-800 flex flex-col flex-1 min-h-0">
            <div class="border-b border-green-300 md:border-b-2 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 px-1.5 md:px-3 py-1 md:py-1.5 flex-shrink-0">
              <div class="flex items-center gap-1 md:gap-2">
                <div class="h-1 w-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                <h3 class="text-xs md:text-xs font-bold text-gray-900 dark:text-white">
                  {{ $t('globalMeters.energyConsumption') }} (kWh)
                </h3>
              </div>
            </div>
            <div class="flex-1 p-0.5 md:p-1.5 flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 min-h-0">
              <EnergyConsumptionChart
                :meters="enrichedCompteurs"
                :loading="isLoadingAPI"
              />
            </div>
          </div>

          <!-- Temperature Chart -->
          <div class="overflow-hidden rounded-lg md:rounded-xl border border-purple-300 md:border-2 dark:border-purple-800 bg-white shadow-lg dark:bg-gray-800 flex flex-col flex-1 min-h-0">
            <div class="border-b border-purple-300 md:border-b-2 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 px-1.5 md:px-3 py-1 md:py-1.5 flex-shrink-0">
              <div class="flex items-center gap-1 md:gap-2">
                <div class="h-1 w-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                <h3 class="text-xs md:text-xs font-bold text-gray-900 dark:text-white">
                  {{ $t('globalMeters.temperatureChart') }}
                </h3>
              </div>
            </div>
            <div class="flex-1 p-0.5 md:p-1.5 flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 min-h-0">
              <TemperatureChart
                :sensors="temperatureChartData"
                :loading="isLoadingTemperature"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import EnergyConsumptionChart from '@/features/meters/components/EnergyConsumptionChart.vue'
import TemperatureChart from '@/features/meters/components/TemperatureChart.vue'
import { getMeterColorByIndex } from '@/utils/meterColors'
import { useCompteurSelection } from '@/composables/useCompteurSelection'
import { useRealtimeData } from '@/composables/useRealtimeData'
import { useGlobalMeters, type GlobalMeterData } from '@/composables/useGlobalMeters'
import { useMetersStore } from '@/stores/useMetersStore'

const { t } = useI18n()

// Stores
const metersStore = useMetersStore()

// State
const showCompteurSelector = ref(false)
const currentTime = ref(new Date())
const globalMetersList = ref<GlobalMeterData[]>([])
const isLoadingAPI = ref(false)
const temperatureChartData = ref<any[]>([])
const isLoadingTemperature = ref(false)

// Initialize composables (same as DashboardView)
const {
  selectedCompteurs,
  selectedCompteurIds,
  availableCompteurs,
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

const { dashboardStore, initializeRealtimeData, stopRealtimeData } = useRealtimeData()

const { fetchGlobalMeters, fetchTemperatureChart, loading: globalMetersLoading, error: globalMetersError } = useGlobalMeters()

// Track connection status
const isConnected = computed(() => dashboardStore.isConnected)

// Update time every second for status display
let clockInterval: number | null = null
let refreshInterval: number | null = null

onMounted(() => {
  // Initialize meter selection
  initializeCompteurSelection()

  // Initialize real-time data
  initializeRealtimeData()

  // Update clock
  clockInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  // Refresh global meters data every 30 seconds when meters are selected
  refreshInterval = setInterval(() => {
    if (selectedCompteurs.value.length > 0) {
      fetchGlobalMetersData()
    }
  }, 30000)

  // Initial fetch if meters are already selected
  if (selectedCompteurs.value.length > 0) {
    fetchGlobalMetersData()
  }

  // Fetch temperature data on mount
  fetchTemperatureData()
})

onUnmounted(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
  }
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  stopRealtimeData()
})

// Watch for compteur selection changes and fetch API data
watch(selectedCompteurs, async (newCompteurs, oldCompteurs) => {
  console.log('[GlobalMetersView] Selection changed:', newCompteurs.length, 'meters')
  if (newCompteurs.length > 0) {
    await fetchGlobalMetersData()
  } else {
    globalMetersList.value = []
  }
}, { deep: true })

// Fetch global meters data from API
async function fetchGlobalMetersData() {
  const deviceUUIDs = selectedCompteurs.value
    .filter((c) => c.deviceUUID)
    .map((c) => c.deviceUUID!)

  if (deviceUUIDs.length === 0) {
    globalMetersList.value = []
    return
  }

  isLoadingAPI.value = true
  const response = await fetchGlobalMeters(deviceUUIDs, false)
  isLoadingAPI.value = false

  if (response && response.success) {
    globalMetersList.value = response.data
    console.log('[GlobalMetersView] Updated meter data from API:', globalMetersList.value)
  }
}

// Fetch temperature chart data
async function fetchTemperatureData() {
  isLoadingTemperature.value = true
  const response = await fetchTemperatureChart()
  isLoadingTemperature.value = false

  if (response && response.success) {
    temperatureChartData.value = response.data.sensors
    console.log('[GlobalMetersView] Updated temperature chart data:', temperatureChartData.value)
  }
}

// Computed
const lastUpdateTime = computed(() => {
  const hours = currentTime.value.getHours().toString().padStart(2, '0')
  const minutes = currentTime.value.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.value.getSeconds().toString().padStart(2, '0')
  const date = currentTime.value.toLocaleDateString('fr-FR')
  return `${date} ${hours}:${minutes}:${seconds}`
})

const handleCompteurSelection = (selectedIds: string[]) => {
  // Update the metersStore with the selected IDs
  metersStore.setSelectedMeters(selectedIds)
  showCompteurSelector.value = false
  // The watch on selectedCompteurs will trigger API fetch
}

// Enrich selected compteurs with API data or fallback to mock data
const enrichedCompteurs = computed(() => {
  return selectedCompteurs.value.map((compteur, index) => {
    // Try to find corresponding API data
    const apiData = globalMetersList.value.find((m) => m.deviceUUID === compteur.deviceUUID)

    if (apiData) {
      // Use real API data
      return {
        ...compteur,
        id: compteur.id,
        name: compteur.name,
        status: apiData.status,
        instantaneous: apiData.instantaneous ?? 0,
        currentPower: apiData.instantaneous ?? 0, // For ComparisonChart
        today: apiData.today ?? 0,
        yesterday: apiData.yesterday ?? 0,
        hourlyData: apiData.hourlyData || [],
        monthlyData: apiData.monthlyData || [],
        yearlyData: apiData.yearlyData || [],
      }
    } else {
      // Fallback to mock data while loading
      const basePower = 45 + index * 12 + Math.random() * 15
      const todayEnergy = 320 + index * 50 + Math.random() * 80
      const yesterdayEnergy = todayEnergy - 20 + Math.random() * 40

      return {
        ...compteur,
        id: compteur.id,
        name: compteur.name,
        status: 'online' as const,
        instantaneous: basePower,
        currentPower: basePower,
        today: todayEnergy,
        yesterday: yesterdayEnergy,
        hourlyData: [],
        monthlyData: [],
        yearlyData: [],
      }
    }
  })
})

// Dynamic panel sizing based on meter count
const leftPanelStyle = computed(() => {
  const count = selectedCompteurs.value.length
  // When 8 meters, use 2/3 for cards and 1/3 for charts; otherwise 1/2 each
  if (count === 8) {
    return { flex: '0 0 66.666%' }
  }
  return { flex: '1' }
})

const rightPanelStyle = computed(() => {
  const count = selectedCompteurs.value.length
  // When 8 meters, use 1/3 for charts; otherwise 1/2
  if (count === 8) {
    return { flex: '0 0 33.333%' }
  }
  return { flex: '1' }
})

// Methods
const getMeterColorTailwind = (index: number) => {
  return getMeterColorByIndex(index).tailwind
}

const getDelta = (compteur: any) => {
  return compteur.today - compteur.yesterday
}

const formatValue = (value: number | undefined): string => {
  if (value === undefined || value === null) return '--'
  return value.toFixed(1)
}

const getChartColor = (index: number) => {
  const colors = [
    'rgba(16, 185, 129, 1)',   // green
    'rgba(59, 130, 246, 1)',   // blue
    'rgba(239, 68, 68, 1)',    // red
    'rgba(245, 158, 11, 1)',   // orange
    'rgba(139, 92, 246, 1)',   // purple
    'rgba(236, 72, 153, 1)',   // pink
    'rgba(34, 211, 238, 1)',   // cyan
    'rgba(20, 184, 166, 1)',   // teal
  ]
  return colors[index % colors.length]
}

// Responsive grid style based on number of meters
const getGridStyle = () => {
  const count = selectedCompteurs.value.length

  // For small screens (mobile), allow scrolling with single column
  if (window.innerWidth < 768) {
    return 'grid-template-columns: 1fr; grid-auto-rows: minmax(200px, auto);'
  }

  // For medium+ screens, optimize layout based on meter count
  if (count === 1) {
    return 'grid-template-columns: 1fr; grid-auto-rows: 1fr;'
  } else if (count === 2) {
    return 'grid-template-columns: repeat(2, 1fr); grid-auto-rows: 1fr;'
  } else if (count === 3) {
    return 'grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr;'
  } else if (count === 4) {
    return 'grid-template-columns: repeat(2, 1fr); grid-auto-rows: 1fr;'
  } else if (count === 8) {
    // For 8 meters: 4 cards per line (2 rows of 4)
    return 'grid-template-columns: repeat(4, 1fr); grid-auto-rows: 1fr;'
  } else {
    // For 5-7 or 9+ meters, use responsive auto-fit
    return 'grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); grid-auto-rows: 1fr;'
  }
}
</script>

<style scoped>
/* Hide scrollbars while keeping scroll functionality */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

/* Reduce sidebar margin for GlobalMetersView to maximize card space */
:global(.global-meters-view) {
  margin-left: calc(-10px + (100% - 100%));
}

/* Adjust for expanded sidebar */
:global(.sidebar-expanded.global-meters-view),
:global(.sidebar-hovered.global-meters-view) {
  margin-left: -90px;
}
</style>
