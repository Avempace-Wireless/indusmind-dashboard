<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Breadcrumbs & Header -->
      <div class="flex flex-col gap-6">
        <nav class="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
          <a class="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">{{ $t('navigation.home') }}</a>
          <span class="mx-2 text-slate-400 dark:text-slate-600">/</span>
          <a class="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">{{ $t('navigation.dashboard') }}</a>
          <span class="mx-2 text-slate-400 dark:text-slate-600">/</span>
          <span class="text-blue-600 dark:text-blue-400">{{ $t('navigation.realtime') }}</span>
        </nav>

        <!-- Page title with status and Manage Meters button -->
        <div class="border-b border-slate-200 dark:border-border-dark pb-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
            <h1 class="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{{ $t('dashboard.title') }}</h1>
            <button
              @click="showCompteurSelector = true"
              class="flex w-full sm:w-auto items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-white px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-100 transition-colors whitespace-nowrap shadow-sm self-start"
            >
              <span class="material-symbols-outlined text-base">tune</span>
              {{ $t('dashboard.manageMeters') }}
            </button>
          </div>
          <div class="flex items-center gap-3">
            <span :class="[
              'flex h-2.5 w-2.5 rounded-full animate-pulse',
              isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
            ]"></span>
            <p class="text-slate-600 dark:text-slate-400 text-sm font-mono">
              {{ isConnected ? $t('dashboard.status.connected') : $t('dashboard.status.disconnected') }}{{ $t('dashboard.status.lastUpdate') }} {{ lastUpdateTime }}
            </p>
          </div>
        </div>
      </div>

      <!-- CompteurSelector Modal -->
      <CompteurSelector
        :is-open="showCompteurSelector"
        :all-compteurs="allCompteurs"
        :selected-ids="selectedCompteurIds"
        @apply="handleCompteurSelection"
        @close="showCompteurSelector = false"
      />

      <!-- Meter Widgets Grid (Dynamic, responsive) -->
      <div v-if="dashboardLoading" class="w-full h-96 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 gap-4">
        <p class="text-lg font-medium">{{ $t('common.loading') }}</p>
      </div>
      <div v-else :class="[
        'grid gap-6',
        gridLayoutClass
      ]">
        <div v-if="selectedCompteurs.length === 0" class="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-border-dark bg-gray-50 dark:bg-[#0f1419] p-12 text-center">
          <span class="material-symbols-outlined text-gray-400 dark:text-text-muted text-5xl mb-4">
            dashboard
          </span>
          <p class="text-gray-900 dark:text-white text-lg font-semibold mb-2">{{ $t('dashboard.noMetersSelected.title') }}</p>
          <p class="text-gray-600 dark:text-text-muted text-sm mb-6">{{ $t('dashboard.noMetersSelected.description') }}</p>
<button
  @click="showCompteurSelector = true"
  class="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-bold text-white transition-colors shadow-lg"
>
  <span class="material-symbols-outlined text-lg">add</span>
  {{ $t('dashboard.noMetersSelected.action') }}
</button>
        </div>

        <CompteurWidget
          v-for="(compteur, index) in enrichedCompteurs"
          :key="compteur.id"
          :compteur="compteur"
          :color-index="index"
          :current-mode="widgetModes[compteur.id]"
          :is-loading="telemetryLoading"
          @update:mode="(mode) => setWidgetMode(compteur.id, mode)"
        />

        <!-- Skeleton loaders while loading -->
        <CompteurWidgetSkeleton v-if="dashboardLoading" />
        <CompteurWidgetSkeleton v-if="dashboardLoading && selectedCompteurs.length > 1" />
      </div>

      <!-- Unified Chart with Side Widgets -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Unified Chart (Energy & Temperature) - Takes 2 columns on XL -->
        <div class="xl:col-span-2">
          <Suspense>
            <template #default>
              <UnifiedChart
                :mode="chartMode"
                :period="chartPeriod"
                :subtitle="unifiedChartSubtitle"
                :selected-compteurs="enrichedCompteurs"
                @update:mode="chartMode = $event"
                @update:period="chartPeriod = $event"
              />
            </template>
            <template #fallback>
              <ChartSkeleton />
            </template>
          </Suspense>
        </div>

        <!-- Side Widgets -->
        <div class="flex flex-col gap-6">
          <!-- Phase Balance Widget -->
          <Suspense>
            <template #default>
              <PhaseBalance
                :title="$t('dashboard.phaseBalance.title')"
                :phases="phaseBalanceData"
              />
            </template>
            <template #fallback>
              <ChartSkeleton />
            </template>
          </Suspense>

          <!-- Events Widget -->
          <Suspense>
            <template #default>
              <EventsWidget
                :title="$t('dashboard.recentEvents.title')"
                :action-label="$t('dashboard.recentEvents.viewAll')"
                :events="recentEvents"
              />
            </template>
            <template #fallback>
              <ChartSkeleton />
            </template>
          </Suspense>
        </div>
      </div>

      <!-- Equipment Status Table -->
      <div class="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('dashboard.equipment.title') }}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">{{ $t('dashboard.equipment.columns.meter') }}</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">{{ $t('dashboard.equipment.columns.type') }}</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">{{ $t('dashboard.equipment.columns.status') }}</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">{{ $t('dashboard.equipment.columns.currentValue') }}</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">{{ $t('dashboard.equipment.columns.unit') }}</th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">{{ $t('dashboard.equipment.columns.lastUpdate') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <!-- Energy Meters -->
              <tr v-for="compteur in enrichedCompteurs" :key="compteur.id" class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td class="px-6 py-3 text-slate-900 dark:text-slate-100 font-medium">{{ compteur.name }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ $t('dashboard.equipment.columns.energy') }}</td>
                <td class="px-6 py-3">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getCompteurStatus(compteur) === 'online'
                      ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200'
                      : getCompteurStatus(compteur) === 'error'
                      ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  ]">
                    {{ getCompteurStatusLabel(compteur) }}
                  </span>
                </td>
                <td class="px-6 py-3 text-slate-900 dark:text-slate-100 font-mono">{{ (compteur.instantaneous ?? 0).toFixed(1) }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ $t('common.unit.kw') }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ getCompteurLastUpdate(compteur) }}</td>
              </tr>
              <!-- Temperature Zones -->
              <tr v-for="zone in temperatureZones" :key="zone.id" class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td class="px-6 py-3 text-slate-900 dark:text-slate-100 font-medium">{{ zone.name }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ $t('dashboard.equipment.columns.temperature') }}</td>
                <td class="px-6 py-3">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getTemperatureStatus(zone) === 'normal'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200'
                      : getTemperatureStatus(zone) === 'alert'
                      ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  ]">
                    {{ getTemperatureStatusLabel(zone) }}
                  </span>
                </td>
                <td class="px-6 py-3 text-slate-900 dark:text-slate-100 font-mono">{{ zone.value.toFixed(1) }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ $t('common.unit.celsius') }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ getTemperatureLastUpdate(zone) }}</td>
              </tr>
              <!-- Empty state -->
              <tr v-if="enrichedCompteurs.length === 0 && temperatureZones.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  {{ $t('dashboard.equipment.noData') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import CompteurWidget from '@/components/dashboard/CompteurWidget.vue'
import CompteurWidgetSkeleton from '@/components/skeletons/CompteurWidgetSkeleton.vue'
import ChartSkeleton from '@/components/skeletons/ChartSkeleton.vue'

// Lazy load heavy components to improve initial load time
const UnifiedChart = defineAsyncComponent(() => import('@/components/dashboard/UnifiedChart.vue'))
const PhaseBalance = defineAsyncComponent(() => import('@/components/dashboard/PhaseBalance.vue'))
const EventsWidget = defineAsyncComponent(() => import('@/components/dashboard/EventsWidget.vue'))

import { useRealtimeData } from '@/composables/useRealtimeData'
import { useCompteurSelection, type CompteurMode } from '@/composables/useCompteurSelection'
import { useMetersStore } from '@/stores/useMetersStore'
import { useTelemetryDynamic } from '@/composables/useTelemetryDynamic'
import { DEFAULT_WIDGET_CONFIG, getTimeRange } from '@/config/telemetryConfig'
import { useApiOnly } from '@/config/dataMode'
import { watch } from 'vue'

// ============================================================================
// COMPOSABLES & STORES
// ============================================================================

const { t } = useI18n()

const currentTime = ref(new Date())
const chartMode = ref<'energy' | 'temperature'>('energy')
const chartPeriod = ref<'today' | 'yesterday' | '7days' | '30days'>('today')

// ✅ HANDLE MODAL VISIBILITY WITH LOCAL STATE
const showCompteurSelector = ref(false)

// Get metersStore for syncing selections
const metersStore = useMetersStore()

const { dashboardStore, equipmentStore, alertsStore, initializeRealtimeData, stopRealtimeData } =
  useRealtimeData()

const {
  widgetModes,
  selectedCompteurs,
  selectedCompteurIds,
  availableCompteurs: allCompteurs,
  aggregatedInstantaneous,
  filteredEquipment,
  selectionStatusText: compteurSelectionStatus,
  setCompteurMode,
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

// Telemetry composable for real API data
const {
  fetchBatchTelemetry,
  fetchCurrentValue,
  loading: telemetryLoading,
  error: telemetryError,
} = useTelemetryDynamic()

// Telemetry data cache for widgets
const telemetryCache = ref<Map<string, any>>(new Map())

// Temperature telemetry cache
const temperatureTelemetryCache = ref<Map<string, any>>(new Map())

// Temperature zone device mapping
// Maps zone IDs to their corresponding sensor device UUIDs
const TEMPERATURE_ZONE_DEVICES = {
  'zone-1': { deviceUUID: 'c44ae4c0-2f7f-11f0-81a4-050c01ec03ef', sensorId: '2' },  // Zone 1 (ZAP 1&3)
  'zone-4': { deviceUUID: 'fc1ce190-3030-11f0-81a4-050c01ec03ef', sensorId: '13' }, // Zone 4 (ZAP2 EM)
  'zone-6': { deviceUUID: 'd5054c70-348e-11f0-ba36-29b3a8b296dd', sensorId: '15' }  // Zone 6 (ZAP2 SLS / Chaufferie)
}

// Track if we're in API-only mode
const isApiOnlyMode = computed(() => useApiOnly())

// Track telemetry fetch status
const telemetryFetchStatus = ref<'idle' | 'loading' | 'success' | 'failed' | 'no-devices' | 'no-data'>('idle')

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

const lastUpdateTime = computed(() => {
  const hours = currentTime.value.getHours().toString().padStart(2, '0')
  const minutes = currentTime.value.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.value.getSeconds().toString().padStart(2, '0')
  const date = currentTime.value.toLocaleDateString('fr-FR')
  return `${date}, ${hours}:${minutes}:${seconds}`
})

const metrics = computed(() => dashboardStore.metrics)
const isConnected = computed(() => dashboardStore.isConnected)
const dashboardLoading = computed(() => dashboardStore.loading || telemetryLoading.value)

/**
 * Enriched compteurs with real telemetry data
 * In API-only mode, ONLY use API data (never fall back to mock)
 * In hybrid mode, fall back to mock data if API data is unavailable
 */
const enrichedCompteurs = computed(() => {
  return selectedCompteurs.value.map(compteur => {
    const telemetryData = telemetryCache.value.get(compteur.id)

    if (telemetryData) {
      // In API-only mode, use API data exclusively (even if 0)
      if (isApiOnlyMode.value) {
        return {
          ...compteur,
          instantaneous: telemetryData.currentPower ?? 0,
          today: telemetryData.todayEnergy ?? 0,
          yesterday: telemetryData.yesterdayEnergy ?? 0,
          instantReadings: telemetryData.instantReadings || [],
          todayReadings: telemetryData.todayReadings || [],
          hasData: telemetryData.hasData,
          isApiError: telemetryData.isApiError
        }
      }

      // In hybrid mode, fall back to mock if API returns nothing
      return {
        ...compteur,
        instantaneous: telemetryData.currentPower ?? compteur.instantaneous,
        today: telemetryData.todayEnergy ?? compteur.today,
        yesterday: telemetryData.yesterdayEnergy ?? compteur.yesterday,
        instantReadings: telemetryData.instantReadings || [],
        todayReadings: telemetryData.todayReadings || [],
      }
    }

    // No telemetry data cached - in API-only mode, show no data
    if (isApiOnlyMode.value) {
      return {
        ...compteur,
        instantaneous: 0,
        today: 0,
        yesterday: 0,
        instantReadings: [],
        todayReadings: [],
        hasData: false,
        isApiError: false
      }
    }

    // In hybrid/mock mode, use original mock data
    return compteur
  })
})

/**
 * Unified chart subtitle
 */
const unifiedChartSubtitle = computed(() => {
  return t('dashboard.unifiedChart.subtitle', { count: selectedCompteurs.value.length })
})

/**
 * Temperature zones data for equipment table
 * Dynamically fetched from API or uses fallback data
 */
const temperatureZones = computed(() => {
  // If in API-only mode and no cached data, return empty or show no-data state
  if (isApiOnlyMode.value && temperatureTelemetryCache.value.size === 0) {
    return []
  }

  // Use cached temperature data if available
  const zones = []

  // Zone 6 (ZAP2 SLS)
  const zone6Data = temperatureTelemetryCache.value.get('zone-6')
  zones.push({
    id: 'zone-6',
    name: t('temperature.zones.zone6'),
    value: zone6Data?.value ?? (isApiOnlyMode.value ? 0 : 48.6),
    status: zone6Data?.status ?? 'Normal',
    lastUpdate: zone6Data?.lastUpdate ?? t('common.justNow')
  })

  // Zone 4 (ZAP2 EM)
  const zone4Data = temperatureTelemetryCache.value.get('zone-4')
  zones.push({
    id: 'zone-4',
    name: t('temperature.zones.zone4'),
    value: zone4Data?.value ?? (isApiOnlyMode.value ? 0 : -17.2),
    status: zone4Data?.status ?? (isApiOnlyMode.value ? t('common.noData') : t('dashboard.equipment.status.alert')),
    lastUpdate: zone4Data?.lastUpdate ?? (isApiOnlyMode.value ? t('common.noData') : '1 min ago')
  })

  // Zone 1 (ZAP 1&3)
  const zone1Data = temperatureTelemetryCache.value.get('zone-1')
  zones.push({
    id: 'zone-1',
    name: t('temperature.zones.zone1'),
    value: zone1Data?.value ?? (isApiOnlyMode.value ? 0 : 56.3),
    status: zone1Data?.status ?? 'Normal',
    lastUpdate: zone1Data?.lastUpdate ?? t('common.justNow')
  })

  return zones
})

const recentEvents = computed(() => {
  return alertsStore.alerts.slice(0, 3).map((alert) => {
    const severityMap: Record<string, 'critical' | 'warning' | 'info' | 'success'> = {
      Critical: 'critical',
      High: 'warning',
      Medium: 'info',
      Low: 'info',
      Informational: 'success',
      Emergency: 'critical',
    }
    const iconMap: Record<string, string> = {
      Critical: 'warning',
      High: 'info',
      Medium: 'info',
      Low: 'check_circle',
      Informational: 'check_circle',
      Emergency: 'warning',
    }
    return {
      message: t(alert.message),
      time: `il y a ${Math.round((Date.now() - alert.detectedAt.getTime()) / 60000)} min`,
      location: alert.equipmentId,
      severity: severityMap[alert.level] || 'info',
      icon: iconMap[alert.level] || 'check_circle',
    }
  })
})

interface EquipmentTableItem {
  name: string
  icon: string
  status: 'En ligne' | 'Arrêt' | 'Maintenance'
  consumption: string
  load: number
  lastEvent: string
}

const equipmentItems = computed<EquipmentTableItem[]>(() => {
  // Filter to show only equipment linked to selected compteurs
  return filteredEquipment.value.map((eq) => {
    const statusMap: Record<string, 'En ligne' | 'Arrêt' | 'Maintenance'> = {
      Online: 'En ligne',
      Offline: 'Arrêt',
      Maintenance: 'Maintenance',
      Alert: 'Maintenance',
    }
    return {
      name: eq.name,
      icon: 'dns',
      status: statusMap[eq.status] || 'Arrêt',
      consumption: `${(eq.specs?.power || 0).toFixed(1)} kW`,
      load: eq.specs?.load || 0,
      lastEvent: 'Aucun',
    }
  })
})

/**
 * Phase balance data based on selected compteurs aggregate
 */
const phaseBalanceData = computed(() => {
  const total = aggregatedInstantaneous.value
  // Simulate realistic phase distribution (33% each with slight variations)
  const l1 = total * 0.35
  const l2 = total * 0.32
  const l3 = total * 0.33
  const maxPhase = Math.max(l1, l2, l3)

  return [
    {
      label: t('dashboard.phaseBalance.phase.l1'),
      value: 230.1,
      unit: t('common.unit.volt'),
      percentage: Math.round((l1 / maxPhase) * 100),
      color: 'bg-blue-500'
    },
    {
      label: t('dashboard.phaseBalance.phase.l2'),
      value: 229.8,
      unit: t('common.unit.volt'),
      percentage: Math.round((l2 / maxPhase) * 100),
      color: 'bg-cyan-500'
    },
    {
      label: t('dashboard.phaseBalance.phase.l3'),
      value: 230.4,
      unit: t('common.unit.volt'),
      percentage: Math.round((l3 / maxPhase) * 100),
      color: 'bg-indigo-500'
    }
  ]
})

/**
 * Responsive grid layout based on selected meter count
 */
const gridLayoutClass = computed(() => {
  const count = selectedCompteurs.value.length

  if (count === 0) return 'grid-cols-1'
  if (count === 1) return 'grid-cols-1 md:grid-cols-1'
  if (count === 2) return 'grid-cols-1 md:grid-cols-2'
  if (count === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  // 4 or more: full responsive layout
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
})

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

let timeInterval: number | null = null

/**
 * Fetch telemetry data for selected compteurs using dynamic batch fetching
 * In API-only mode, shows "no data" if API fails - does NOT fall back to mock
 */
async function fetchTelemetryData() {
  const compteursWithUUID = selectedCompteurs.value.filter(c => c.deviceUUID)

  if (compteursWithUUID.length === 0) {
    telemetryFetchStatus.value = 'no-devices'
    console.warn('[DashboardView] No compteurs with deviceUUID to fetch telemetry')
    return
  }

  telemetryFetchStatus.value = 'loading'
  console.log('[DashboardView] Fetching telemetry for', compteursWithUUID.length, 'devices using DYNAMIC batch fetch')
  console.log('[DashboardView] API-only mode:', isApiOnlyMode.value)

  try {
    // Get instantaneous config from telemetryConfig
    const instantConfig = DEFAULT_WIDGET_CONFIG.instantaneousReadings
    const dailyConfig = DEFAULT_WIDGET_CONFIG.dailyReadings

    // Calculate time ranges
    const now = Date.now()
    const { startTs: todayStart, endTs: todayEnd } = getTimeRange('today')

    // Build batch requests - fully dynamic from config
    const batchRequests = compteursWithUUID.flatMap(compteur => [
      // Current value (latest single value) - need time range even with limit=1
      {
        deviceUUID: compteur.deviceUUID!,
        config: {
          keys: [DEFAULT_WIDGET_CONFIG.instantaneous.key],
          startTs: now - 24 * 60 * 60 * 1000, // Last 24 hours
          endTs: now,
          limit: 1,
          agg: 'NONE' as const
        }
      },
      // Today's cumulative energy - need time range
      {
        deviceUUID: compteur.deviceUUID!,
        config: {
          keys: [DEFAULT_WIDGET_CONFIG.daily.key],
          startTs: todayStart,
          endTs: todayEnd,
          limit: 1,
          agg: 'NONE' as const
        }
      },
      // Instantaneous readings (time-series chart data)
      {
        deviceUUID: compteur.deviceUUID!,
        config: {
          keys: instantConfig.keys,
          startTs: now - instantConfig.timeRange,
          endTs: now,
          interval: instantConfig.interval,
          agg: instantConfig.agg
        }
      },
      // Daily hourly readings (today's hourly breakdown)
      {
        deviceUUID: compteur.deviceUUID!,
        config: {
          keys: dailyConfig.keys,
          startTs: todayStart,
          endTs: todayEnd,
          interval: dailyConfig.interval,
          agg: dailyConfig.agg
        }
      }
    ])

    console.log(`[DashboardView] Batch fetching ${batchRequests.length} requests for ${compteursWithUUID.length} devices`)

    // Execute batch fetch (parallel, with caching & deduplication)
    const results = await fetchBatchTelemetry(batchRequests)

    // Process results and update cache
    let hasAnyData = false
    compteursWithUUID.forEach(compteur => {
      const deviceData = results.get(compteur.deviceUUID!) || []

      if (deviceData.length > 0) {
        hasAnyData = true
      }

      // Extract values by key
      const currentPowerData = deviceData.filter(d => d.key === DEFAULT_WIDGET_CONFIG.instantaneous.key)
      const todayEnergyData = deviceData.filter(d => d.key === DEFAULT_WIDGET_CONFIG.daily.key)
      const instantReadings = deviceData.filter(d => instantConfig.keys.includes(d.key))
      const todayReadings = deviceData.filter(d => dailyConfig.keys.includes(d.key))

      const telemetryData = {
        id: compteur.id,
        currentPower: currentPowerData.length > 0 ? currentPowerData[0].value : 0,
        todayEnergy: todayEnergyData.length > 0 ? todayEnergyData[0].value : 0,
        yesterdayEnergy: 0,
        instantReadings,
        todayReadings,
        hasData: deviceData.length > 0
      }

      telemetryCache.value.set(compteur.id, telemetryData)

      console.log(`[DashboardView] ✓ Telemetry cached for ${compteur.name}:`, {
        currentPower: telemetryData.currentPower,
        todayEnergy: telemetryData.todayEnergy,
        instantReadingsCount: instantReadings.length,
        todayReadingsCount: todayReadings.length,
        hasData: hasAnyData
      })
    })

    // Set status based on whether we got any data
    telemetryFetchStatus.value = hasAnyData ? 'success' : 'no-data'
    console.log('[DashboardView] ✓ Batch telemetry fetch complete, status:', telemetryFetchStatus.value)
  } catch (error) {
    // In API-only mode, don't fall back - show error state
    if (isApiOnlyMode.value) {
      console.error('[DashboardView] API-only mode: Failed to fetch telemetry data (no fallback):', error)
      telemetryFetchStatus.value = 'no-data'

      // Clear cache when in API-only mode and API fails
      telemetryCache.value.clear()

      // Don't use mock data - show "no data available"
      selectedCompteurs.value.forEach(compteur => {
        telemetryCache.value.set(compteur.id, {
          id: compteur.id,
          currentPower: 0,
          todayEnergy: 0,
          yesterdayEnergy: 0,
          instantReadings: [],
          todayReadings: [],
          hasData: false,
          isApiError: true
        })
      })
    } else {
      // In hybrid mode, we might have partial data
      console.error('[DashboardView] Failed to fetch telemetry data:', error)
      telemetryFetchStatus.value = 'failed'
    }
  }
}

/**
 * Fetch temperature telemetry data for temperature zones
 * NOTE: Currently temperature sensors are not available in the API
 * This function is ready for when the API includes Indusmind_T_Sensor devices
 */
async function fetchTemperatureData() {
  console.log('[DashboardView] Temperature sensors not yet available in API')
  console.log('[DashboardView] Temperature zones will use mock data until API is updated')

  // Clear cache in API-only mode since sensors aren't in API yet
  if (isApiOnlyMode.value) {
    temperatureTelemetryCache.value.clear()
    console.log('[DashboardView] API-only mode: No temperature sensors available')
    return
  }

  // When temperature sensors are added to the API, uncomment this code:
  /*
  try {
    // Build batch requests for temperature sensors
    const batchRequests = Object.entries(TEMPERATURE_ZONE_DEVICES).map(([zoneId, device]) => ({
      deviceUUID: device.deviceUUID,
      config: {
        keys: ['temperature'],
        limit: 1,
        agg: 'NONE' as const
      }
    }))

    console.log(`[DashboardView] Batch fetching ${batchRequests.length} temperature requests`)

    // Execute batch fetch
    const results = await fetchBatchTelemetry(batchRequests)

    // Process results and update temperature cache
    let hasAnyData = false
    Object.entries(TEMPERATURE_ZONE_DEVICES).forEach(([zoneId, device]) => {
      const deviceData = results.get(device.deviceUUID) || []

      if (deviceData.length > 0) {
        hasAnyData = true
      }

      // Extract temperature value
      const tempData = deviceData.filter(d => d.key === 'temperature')
      const tempValue = tempData.length > 0 ? tempData[0].value : null

      // Determine status based on temperature thresholds
      let status = 'Normal'
      if (tempValue !== null) {
        if (tempValue < 0 || tempValue > 40) {
          status = t('dashboard.equipment.status.alert')
        }
      } else {
        status = t('common.noData')
      }

      const temperatureData = {
        zoneId,
        value: tempValue ?? 0,
        status,
        lastUpdate: deviceData.length > 0 ? t('common.justNow') : t('common.noData'),
        hasData: deviceData.length > 0
      }

      temperatureTelemetryCache.value.set(zoneId, temperatureData)

      console.log(`[DashboardView] ✓ Temperature cached for ${zoneId}:`, {
        value: temperatureData.value,
        status: temperatureData.status,
        hasData: temperatureData.hasData
      })
    })

    console.log('[DashboardView] ✓ Temperature fetch complete, has data:', hasAnyData)
  } catch (error) {
    console.error('[DashboardView] Failed to fetch temperature data:', error)

    if (isApiOnlyMode.value) {
      // In API-only mode, clear cache and show no data
      temperatureTelemetryCache.value.clear()
    }
  }
  */
}

onMounted(async () => {
  // Initialize compteur selection (for legacy widgets)
  initializeCompteurSelection()

  // Load compteurs from PM2200 devices API
  try {
    await dashboardStore.loadCompteurs()
    console.log('Loaded compteurs:', dashboardStore.compteurs.length)
    console.log('Compteur IDs:', dashboardStore.compteurs.map(c => c.id))
  } catch (error) {
    console.error('Failed to load compteurs:', error)
  }

  // Validate and clean up invalid localStorage selection
  if (dashboardStore.compteurs.length > 0) {
    // Restore from localStorage and clean up any invalid IDs
    metersStore.restoreSelection()
    const savedSelection = localStorage.getItem('meters:selected')
    console.log('Saved selection from localStorage:', savedSelection)
    console.log('Current selection after restore:', metersStore.selectedMeterIds)
  }

  // Start real-time data updates
  try {
    await initializeRealtimeData()
  } catch (error) {
    console.error('Failed to initialize real-time data:', error)
  }

  // Fetch initial telemetry data
  await fetchTelemetryData()

  // Fetch initial temperature data
  await fetchTemperatureData()

  // Update time display every second (no API calls)
  timeInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

// Watch for compteur selection changes and fetch telemetry
watch(selectedCompteurs, async (newCompteurs) => {
  if (newCompteurs.length > 0) {
    await fetchTelemetryData()
  }
}, { deep: true })

onUnmounted(() => {
  // Stop real-time data updates
  stopRealtimeData()

  // Clear time interval
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle compteur selection from modal
 * Syncs selections to the centralized metersStore
 */
function handleCompteurSelection(selectedIds: string[]) {
  // Update the metersStore with the selected IDs
  metersStore.setSelectedMeters(selectedIds)
  showCompteurSelector.value = false
}

/**
 * Set widget mode for a specific compteur
 */
function setWidgetMode(compteurId: string, mode: CompteurMode) {
  setCompteurMode(compteurId, mode)
}

/**
 * Get dynamic status for a compteur based on telemetry data
 */
function getCompteurStatus(compteur: any): 'online' | 'offline' | 'error' {
  if (compteur.isApiError) return 'error'
  if (compteur.hasData === false) return 'offline'
  if ((compteur.instantaneous ?? 0) > 0) return 'online'
  return 'offline'
}

/**
 * Get localized status label for a compteur
 */
function getCompteurStatusLabel(compteur: any): string {
  const status = getCompteurStatus(compteur)
  switch (status) {
    case 'online':
      return t('dashboard.equipment.status.online')
    case 'error':
      return isApiOnlyMode.value ? t('common.noData') : t('dashboard.equipment.status.offline')
    case 'offline':
      return t('dashboard.equipment.status.offline')
  }
}

/**
 * Get last update time for a compteur
 */
function getCompteurLastUpdate(compteur: any): string {
  const telemetryData = telemetryCache.value.get(compteur.id)

  if (!telemetryData || telemetryData.isApiError) {
    return isApiOnlyMode.value ? t('common.noData') : t('dashboard.equipment.status.offline')
  }

  // If we have recent data, show "just now"
  if (telemetryData.hasData && telemetryData.currentPower !== undefined) {
    return t('common.justNow')
  }

  return t('dashboard.equipment.status.offline')
}

/**
 * Get dynamic status for a temperature zone
 * Uses the status from zone data (from API or computed)
 */
function getTemperatureStatus(zone: any): 'normal' | 'alert' | 'offline' {
  // Check if we have valid data
  if (!zone.value || zone.value === 0) return 'offline'

  // Use the status from the zone data
  // The status can be 'Normal', a translation key, or 'Alert'
  const zoneStatus = zone.status
  if (typeof zoneStatus === 'string') {
    const statusLower = zoneStatus.toLowerCase()
    if (statusLower.includes('alert') || statusLower.includes('alerte')) {
      return 'alert'
    }
  }

  return 'normal'
}

/**
 * Get localized status label for a temperature zone
 */
function getTemperatureStatusLabel(zone: any): string {
  const status = getTemperatureStatus(zone)
  switch (status) {
    case 'normal':
      return 'Normal'
    case 'alert':
      return zone.status // Return the original status (already translated)
    case 'offline':
      return isApiOnlyMode.value ? t('common.noData') : t('dashboard.equipment.status.offline')
  }
}

/**
 * Get last update time for a temperature zone
 */
function getTemperatureLastUpdate(zone: any): string {
  // For temperature zones, use the lastUpdate from zone data
  // In API-only mode, check if data is available
  if (isApiOnlyMode.value && (!zone.value || zone.value === 0)) {
    return t('common.noData')
  }

  return zone.lastUpdate || t('common.justNow')
}
</script>
