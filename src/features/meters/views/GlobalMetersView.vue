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
      <div v-if="selectedCompteurs.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 animate-fadeIn" style="min-height: calc(100vh - 200px);">
        <div class="max-w-md w-full text-center">
          <!-- Icon with gradient background -->
          <div class="relative inline-flex items-center justify-center mb-6">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-2xl rounded-full"></div>
            <div class="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 p-6 rounded-2xl border-2 border-blue-200 dark:border-cyan-900 shadow-lg">
              <span class="material-symbols-outlined text-blue-600 dark:text-cyan-400" style="font-size: 64px;">devices</span>
            </div>
          </div>

          <!-- Title & Description -->
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {{ $t('globalMeters.selectMetersToVisualize') || 'Sélectionner des compteurs' }}
          </h2>
          <p class="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
            {{ $t('globalMeters.noMetersDescription') || 'Choisissez les compteurs à afficher pour visualiser leurs données en temps réel et suivre leur consommation énergétique.' }}
          </p>

          <!-- Action Button -->
          <button
            @click="showCompteurSelector = true"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span class="material-symbols-outlined text-xl">add_circle</span>
            {{ $t('globalMeters.selectMeters') || 'Sélectionner des compteurs' }}
          </button>

          <!-- Info Card -->
          <div class="mt-8 bg-blue-50 dark:bg-slate-800/50 border border-blue-200 dark:border-slate-700 rounded-lg p-4">
            <div class="flex items-start gap-3 text-left">
              <span class="material-symbols-outlined text-blue-600 dark:text-cyan-400 text-xl flex-shrink-0 mt-0.5">info</span>
              <div class="flex-1">
                <h4 class="text-sm font-semibold text-blue-900 dark:text-cyan-100 mb-1">
                  {{ $t('globalMeters.quickTip') || 'Astuce' }}
                </h4>
                <p class="text-xs text-blue-700 dark:text-cyan-300">
                  {{ $t('globalMeters.tipDescription') || 'Vous pouvez sélectionner jusqu\'à 8 compteurs pour une vue d\'ensemble optimale.' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoadingAPI && isFirstLoad" class="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-cyan-900 rounded-xl p-4 shadow-md animate-fadeIn">
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0">
            <div class="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 dark:border-cyan-700 border-t-blue-600 dark:border-t-cyan-400"></div>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-blue-600 dark:text-cyan-400 text-lg">cloud_download</span>
              <h3 class="text-sm font-semibold text-blue-900 dark:text-cyan-100">{{ $t('common.loading') || 'Chargement des données...' }}</h3>
            </div>
            <p class="text-xs text-blue-700 dark:text-cyan-300">{{ $t('globalMeters.fetchingMeterData') || 'Récupération des données des compteurs...' }}</p>
          </div>
          <div class="flex-shrink-0">
            <div class="flex items-center gap-1">
              <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 0ms"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 150ms"></div>
              <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid: 2/3 (Left - Cards) + 1/3 (Right - Charts) - Responsive -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-1 overflow-hidden pb-2 lg:h-[calc(100vh-110px)] h-auto">
        <!-- Left Panel: Meter Cards (2/3 width on lg, full width below lg) -->
        <div class="col-span-1 lg:col-span-2 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg p-0.5 md:p-1 border border-slate-200 dark:border-slate-700 min-h-0 lg:overflow-y-auto">
          <!-- Deterministic Grid: Adapts based on meter count -->
          <div class="grid gap-1 md:gap-2 flex-1 min-h-0 p-0.5 md:p-1 auto-rows-fr" :style="getMetersGridStyle()">
            <div
              v-for="(compteur, index) in enrichedCompteurs"
              :key="compteur.id"
              class="rounded-xl bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all overflow-hidden relative border-2 flex flex-col"
              :style="{
                borderColor: getChartColor(index),
                boxShadow: `0 8px 16px -2px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 0 2px ${getChartColor(index)}15`,
                minHeight: 'clamp(200px, 40vh, 350px)',
                ...getCardGridSpan(index, enrichedCompteurs.length)
              }"
            >
              <!-- Top accent line -->
              <div class="absolute top-0 left-0 right-0 h-1" :style="{ backgroundColor: getChartColor(index) }"></div>

              <!-- Card Header with color accent and custom tooltip -->
              <div :class="[
                'px-4 py-1.5 flex-shrink-0 border-b-2 relative group/header flex items-start justify-between gap-2 overflow-hidden',
                `border-${getMeterColorTailwind(index)}-400 dark:border-${getMeterColorTailwind(index)}-500`
              ]" :style="{ backgroundColor: `${getChartColor(index)}08`, minHeight: '90px' }">
                <div class="flex-1 min-w-0 overflow-hidden">
                  <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight break-words pt-1">{{ compteur.name }}</h3>
                  <p class="text-xs text-slate-500 dark:text-slate-500 leading-tight mt-1">{{ compteur.subtitle || $t('globalMeters.energyMeter') }}</p>
                </div>
                <span :class="[
                  'inline-flex h-1.5 w-1.5 rounded-full flex-shrink-0 mt-2',
                  compteur.status === 'online'
                    ? 'bg-green-500 animate-pulse shadow-[0_0_3px_rgba(34,197,94,0.5)]'
                    : 'bg-red-500 shadow-[0_0_3px_rgba(239,68,68,0.5)]'
                ]"></span>


                <!-- Custom Tooltip -->
                <div class="absolute bottom-full left-1/2 mb-3 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-sm rounded-md whitespace-nowrap z-50 opacity-0 invisible group-hover/header:opacity-100 group-hover/header:visible transition-all duration-150 shadow-lg" style="transform: translateX(-50%);">
                  {{ compteur.name }}
                  <!-- Tooltip arrow -->
                  <div class="absolute top-full left-1/2 w-0 h-0" style="transform: translateX(-50%); border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid rgb(15, 23, 42);"></div>
                </div>
              </div>

              <!-- Card Content - Responsive Height -->
              <div class="px-0.5 md:px-1 py-0 flex-1 flex flex-col justify-center gap-0 min-h-0">
                <!-- Instantaneous Power -->
                <div class="text-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-0 border border-slate-200 dark:border-slate-700 flex-1 flex flex-col justify-center items-center">
                  <div>
                    <span class="font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">
                      {{ $t('globalMeters.instantaneousPower') }}
                    </span>
                  </div>
                  <div class="flex items-baseline justify-center gap-0.5 mt-0.25">
                    <span class="font-extrabold leading-none" :style="{ fontSize: 'clamp(20px, 5vmin, 45px)', color: getChartColor(index) }">
                      {{ formatValue(compteur.instantaneous) }}
                    </span>
                    <span class="font-bold text-slate-900 dark:text-slate-100" style="font-size: clamp(8px, 1vmin, 12px);">kW</span>
                  </div>
                </div>

                <!-- Today vs Yesterday Comparison - Proportional -->
                <div class="grid grid-cols-2 gap-0 flex-1">
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-0 border border-green-200 dark:border-green-900/30 flex flex-col justify-center items-center">
                    <p class="text-green-800 dark:text-green-300 font-extrabold" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">{{ $t('globalMeters.today') }}</p>
                    <p class="text-green-900 dark:text-green-200 font-bold leading-tight" style="font-size: clamp(14px, 2.3vmin, 24px); line-height: 1.1;">{{ formatValue(compteur.today) }}</p>
                    <p class="text-green-800 dark:text-green-300 font-bold" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">kWh</p>
                  </div>
                  <div class="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/30 dark:to-slate-900/30 rounded-lg p-0 border border-slate-300 dark:border-slate-700/50 flex flex-col justify-center items-center">
                    <p class="text-slate-700 dark:text-slate-300 font-extrabold" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">{{ $t('globalMeters.yesterday') }}</p>
                    <p class="text-slate-800 dark:text-slate-200 font-bold leading-tight" style="font-size: clamp(14px, 2.3vmin, 24px); line-height: 1.1;">{{ formatValue(compteur.yesterday) }}</p>
                    <p class="text-slate-700 dark:text-slate-300 font-bold" style="font-size: clamp(10px, 1.5vmin, 14px); line-height: 1;">kWh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Charts (1/3 width on lg, 1/2 on sm, full width on mobile) -->
        <div class="col-span-1 flex flex-col gap-1 min-h-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 rounded-lg p-0.5 md:p-1 border border-slate-200 dark:border-slate-700 lg:overflow-y-auto">
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
            <div class="flex-1 p-0.5 md:p-1.5 flex flex-col bg-white dark:bg-gray-800 min-h-0">
              <div v-if="enrichedCompteurs.length === 0 || enrichedCompteurs.every(m => m.hourlyData.length === 0)" class="w-full h-full flex items-center justify-center">
                <p class="text-gray-500 dark:text-gray-400 font-semibold">{{ $t('common.noData') || 'No data available' }}</p>
              </div>
              <EnergyConsumptionChart
                v-else
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
            <div class="flex-1 p-0.5 md:p-1.5 flex flex-col bg-white dark:bg-gray-800 min-h-0">
              <div v-if="temperatureChartData.length === 0" class="w-full h-full flex items-center justify-center">
                <p class="text-gray-500 dark:text-gray-400 font-semibold">{{ $t('common.noData') || 'No data available' }}</p>
              </div>
              <TemperatureChart
                v-else
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
const isFirstLoad = ref(true)
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

  // Refresh global meters data every 10 seconds when meters are selected
  refreshInterval = setInterval(() => {
    if (selectedCompteurs.value.length > 0) {
      fetchGlobalMetersData(false)
    }
  }, 10000)

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
async function fetchGlobalMetersData(showLoader = true) {
  const deviceUUIDs = selectedCompteurs.value
    .filter((c) => c.deviceUUID)
    .map((c) => c.deviceUUID!)

  if (deviceUUIDs.length === 0) {
    globalMetersList.value = []
    return
  }

  if (showLoader && isFirstLoad.value) {
    isLoadingAPI.value = true
  }
  const response = await fetchGlobalMeters(deviceUUIDs, false)
  if (showLoader && isFirstLoad.value) {
    isLoadingAPI.value = false
    isFirstLoad.value = false
  }

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

// Enrich selected compteurs with API data only (no mock data)
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
        instantaneous: apiData.instantaneous ?? undefined,
        currentPower: apiData.instantaneous ?? undefined, // For ComparisonChart
        today: apiData.today ?? undefined,
        yesterday: apiData.yesterday ?? undefined,
        hourlyData: apiData.hourlyData || [],
        monthlyData: apiData.monthlyData || [],
        yearlyData: apiData.yearlyData || [],
      }
    } else {
      // No API data available - return undefined values that will display as "--"
      return {
        ...compteur,
        id: compteur.id,
        name: compteur.name,
        status: 'offline' as const,
        instantaneous: undefined,
        currentPower: undefined,
        today: undefined,
        yesterday: undefined,
        hourlyData: [],
        monthlyData: [],
        yearlyData: [],
      }
    }
  })
})



// Dynamic panel sizing based on meter count - STRICT 2/3 - 1/3 split
const leftPanelStyle = computed(() => {
  // Always 2/3 width (66.666%) to preserve consistent layout ratio
  return { flex: '0 0 66.666%' }
})

const rightPanelStyle = computed(() => {
  // Always 1/3 width (33.333%) to preserve consistent layout ratio
  return { flex: '0 0 33.333%' }
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

// Helper function to make overflow items span properly
const getCardGridSpan = (index: number, totalCount: number): Record<string, any> => {
  // 5 meters: first row (0-2) at 33% each, second row (3-4) at 50% each
  if (totalCount === 5) {
    if (index <= 2) return { gridColumn: 'span 2' }  // Items 0-2: 2 cols = 33%
    if (index >= 3) return { gridColumn: 'span 3' }  // Items 3-4: 3 cols = 50%
  }

  // 7 meters: first row (0-3) at 25% each, second row (4-6) at 33.33% each
  if (totalCount === 7) {
    if (index <= 3) return { gridColumn: 'span 3' }  // Items 0-3: 3 cols = 25%
    if (index >= 4) return { gridColumn: 'span 4' }  // Items 4-6: 4 cols = 33.33%
  }

  // 3 meters: last item spans full
  if (totalCount === 3 && index === 2) {
    return { gridColumn: '1 / -1' }
  }

  return {}
}

// Deterministic grid style based on number of meters
// No hard-coded widths per meter count - uses CSS Grid for automatic layout
const getMetersGridStyle = () => {
  const count = enrichedCompteurs.value.length

  // Responsive breakpoint for mobile
  if (window.innerWidth < 768) {
    // Mobile: single column, responsive height
    return 'grid-template-columns: 1fr; grid-auto-rows: minmax(180px, auto);'
  }

  // Desktop: deterministic layouts based on meter count
  // Each layout ensures cards are evenly distributed and fill width
  switch (count) {
    case 1:
      // 1 meter: 1 widget full width
      return 'grid-template-columns: 1fr; grid-auto-rows: 1fr;'

    case 2:
      // 2 meters: 1 per row (2 rows), full width each
      return 'grid-template-columns: 1fr; grid-auto-rows: 1fr;'

    case 3:
      // 3 meters: 2 on first row, 1 on second row (full width shared)
      // Use CSS Grid template to create uneven rows
      return 'grid-template-columns: repeat(2, 1fr); grid-auto-rows: 1fr;'

    case 4:
      // 4 meters: 2 per row (2 rows)
      return 'grid-template-columns: repeat(2, 1fr); grid-auto-rows: 1fr;'

    case 5:
      // 5 meters: 3 on first row (33% each), 2 on second row (50% each)
      return 'grid-template-columns: repeat(6, 1fr); grid-auto-rows: 1fr;'

    case 6:
      // 6 meters: 3 per row (2 rows)
      return 'grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr;'

    case 7:
      // 7 meters: 4 on first row (25% each), 3 on second row (33.33% each)
      return 'grid-template-columns: repeat(12, 1fr); grid-auto-rows: 1fr;'

    case 8:
      // 8 meters: 4 per row (2 rows)
      return 'grid-template-columns: repeat(4, 1fr); grid-auto-rows: 1fr;'

    default:
      // Fallback for edge cases: responsive auto-fit
      return 'grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); grid-auto-rows: 1fr;'
  }
}

// Keep old getGridStyle for any backward compatibility (deprecated)
const getGridStyle = () => {
  return getMetersGridStyle()
}
</script>

<style scoped>
/* Fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

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
