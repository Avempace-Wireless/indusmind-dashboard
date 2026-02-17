<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Breadcrumbs & Header -->
      <div class="flex flex-col gap-6">


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

        <!-- New Widget System (V2) - Feature Flagged -->
        <CompteurWidgetV2
          v-if="useNewWidgetSystem"
          v-for="(compteur, index) in enrichedCompteurs"
          :key="`v2-${compteur.id}`"
          :compteur="compteur"
          :color-index="index"
          :current-mode="widgetModes[compteur.id]"
          @update:mode="(mode) => setWidgetMode(compteur.id, mode)"
        />

        <!-- Legacy Widget System (V1) -->
        <CompteurWidget
          v-else
          v-for="(compteur, index) in enrichedCompteurs"
          :key="`v1-${compteur.id}`"
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

      <!-- Energy and Temperature Charts Side by Side -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Energy Chart (Left) -->
        <div>
          <Suspense>
            <template #default>
              <UnifiedChart
                mode="energy"
                :period="energyChartPeriod"
                :subtitle="$t('dashboard.unifiedChart.energy')"
                :selected-compteurs="enrichedCompteurs"
                @update:period="energyChartPeriod = $event"
              />
            </template>
            <template #fallback>
              <ChartSkeleton />
            </template>
          </Suspense>
        </div>

        <!-- Temperature Chart (Right) -->
        <div>
          <Suspense>
            <template #default>
              <UnifiedChart
                mode="temperature"
                :period="temperatureChartPeriod"
                :subtitle="$t('dashboard.unifiedChart.temperature')"
                :selected-compteurs="enrichedCompteurs"
                @update:period="temperatureChartPeriod = $event"
                is-temperature-api
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
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ $t('dashboard.equipment.title') }}</h3>
          </div>
          <!-- Search Bar -->
          <div class="relative">
            <input
              v-model="equipmentSearchQuery"
              type="text"
              :placeholder="$t('common.search') || 'Search equipment...'"
              class="w-full px-4 py-2 pl-10 pr-4 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <svg class="absolute left-3 top-2.5 h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th
                  @click="toggleEquipmentSort('name')"
                  class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    {{ $t('dashboard.equipment.columns.meter') }}
                    <span class="text-xs">
                      <span v-if="equipmentSortColumn === 'name' && equipmentSortDirection === 'asc'">▲</span>
                      <span v-else-if="equipmentSortColumn === 'name' && equipmentSortDirection === 'desc'">▼</span>
                      <span v-else class="text-slate-400">⇅</span>
                    </span>
                  </div>
                </th>
                <th
                  @click="toggleEquipmentSort('type')"
                  class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    {{ $t('dashboard.equipment.columns.type') }}
                    <span class="text-xs">
                      <span v-if="equipmentSortColumn === 'type' && equipmentSortDirection === 'asc'">▲</span>
                      <span v-else-if="equipmentSortColumn === 'type' && equipmentSortDirection === 'desc'">▼</span>
                      <span v-else class="text-slate-400">⇅</span>
                    </span>
                  </div>
                </th>
                <th
                  @click="toggleEquipmentSort('status')"
                  class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    {{ $t('dashboard.equipment.columns.status') }}
                    <span class="text-xs">
                      <span v-if="equipmentSortColumn === 'status' && equipmentSortDirection === 'asc'">▲</span>
                      <span v-else-if="equipmentSortColumn === 'status' && equipmentSortDirection === 'desc'">▼</span>
                      <span v-else class="text-slate-400">⇅</span>
                    </span>
                  </div>
                </th>
                <th
                  @click="toggleEquipmentSort('value')"
                  class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    {{ $t('dashboard.equipment.columns.currentValue') }}
                    <span class="text-xs">
                      <span v-if="equipmentSortColumn === 'value' && equipmentSortDirection === 'asc'">▲</span>
                      <span v-else-if="equipmentSortColumn === 'value' && equipmentSortDirection === 'desc'">▼</span>
                      <span v-else class="text-slate-400">⇅</span>
                    </span>
                  </div>
                </th>
                <th class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white">{{ $t('dashboard.equipment.columns.unit') }}</th>
                <th
                  @click="toggleEquipmentSort('lastUpdate')"
                  class="px-6 py-3 text-left font-semibold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div class="flex items-center gap-2">
                    {{ $t('dashboard.equipment.columns.lastUpdate') }}
                    <span class="text-xs">
                      <span v-if="equipmentSortColumn === 'lastUpdate' && equipmentSortDirection === 'asc'">▲</span>
                      <span v-else-if="equipmentSortColumn === 'lastUpdate' && equipmentSortDirection === 'desc'">▼</span>
                      <span v-else class="text-slate-400">⇅</span>
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <!-- Equipment Devices (Meters & Sensors) -->
              <tr v-for="device in displayedEquipmentDevices" :key="device.deviceUUID" class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td class="px-6 py-3 text-slate-900 dark:text-slate-100 font-medium">{{ device.name }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">
                  {{ getEquipmentDeviceType(device) === 'meter' ? $t('dashboard.equipment.columns.energy') : $t('dashboard.equipment.columns.temperature') }}
                </td>
                <td class="px-6 py-3">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getEquipmentDeviceStatus(device).isOnline
                      ? 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  ]">
                    {{ getEquipmentDeviceStatus(device).label }}
                  </span>
                </td>
                <td class="px-6 py-3 text-slate-900 dark:text-slate-100 font-mono">{{ getEquipmentDeviceValue(device) }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ getEquipmentDeviceUnit(device) }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ formatEquipmentLastUpdate(device) }}</td>
              </tr>
              <!-- Empty state -->
              <tr v-if="displayedEquipmentDevices.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  {{ $t('dashboard.equipment.noData') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination Controls -->
        <div v-if="equipmentTotalPages > 1" class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div class="text-sm text-slate-600 dark:text-slate-400">
            {{ $t('common.showing') || 'Showing' }}
            {{ ((equipmentCurrentPage - 1) * equipmentItemsPerPage) + 1 }}-{{ Math.min(equipmentCurrentPage * equipmentItemsPerPage, sortedEquipmentDevices.length) }}
            {{ $t('common.of') || 'of' }}
            {{ sortedEquipmentDevices.length }}
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="goToEquipmentPage(1)"
              :disabled="equipmentCurrentPage === 1"
              :class="[
                'px-3 py-1 text-sm rounded border transition-colors',
                equipmentCurrentPage === 1
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              &lt;&lt;
            </button>
            <button
              @click="goToEquipmentPage(equipmentCurrentPage - 1)"
              :disabled="equipmentCurrentPage === 1"
              :class="[
                'px-3 py-1 text-sm rounded border transition-colors',
                equipmentCurrentPage === 1
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              &lt;
            </button>
            <span class="px-4 py-1 text-sm text-slate-700 dark:text-slate-300">
              {{ equipmentCurrentPage }} / {{ equipmentTotalPages }}
            </span>
            <button
              @click="goToEquipmentPage(equipmentCurrentPage + 1)"
              :disabled="equipmentCurrentPage === equipmentTotalPages"
              :class="[
                'px-3 py-1 text-sm rounded border transition-colors',
                equipmentCurrentPage === equipmentTotalPages
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              &gt;
            </button>
            <button
              @click="goToEquipmentPage(equipmentTotalPages)"
              :disabled="equipmentCurrentPage === equipmentTotalPages"
              :class="[
                'px-3 py-1 text-sm rounded border transition-colors',
                equipmentCurrentPage === equipmentTotalPages
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              &gt;&gt;
            </button>
          </div>
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
import CompteurWidgetV2 from '@/components/dashboard/CompteurWidgetV2.vue'
import CompteurWidgetSkeleton from '@/components/skeletons/CompteurWidgetSkeleton.vue'
import ChartSkeleton from '@/components/skeletons/ChartSkeleton.vue'

// Lazy load heavy components to improve initial load time
const UnifiedChart = defineAsyncComponent(() => import('@/components/dashboard/UnifiedChart.vue'))

import { useRealtimeData } from '@/composables/useRealtimeData'
import { useCompteurSelection, type CompteurMode } from '@/composables/useCompteurSelection'
import { useMetersStore } from '@/stores/useMetersStore'
import { useTelemetryDynamic } from '@/composables/useTelemetryDynamic'
import { usePuissance } from '@/composables/usePuissance'
import { DEFAULT_WIDGET_CONFIG, getTimeRange } from '@/config/telemetryConfig'
import { useApiOnly } from '@/config/dataMode'
import { isFeatureEnabled } from '@/config/featureFlags'
import { watch } from 'vue'
import { getAllIndusmindCustomerDevices, type Device } from '@/services/deviceAPI'
import {
  fetchAllDevicesLatestTelemetry,
  formatTelemetryValue,
  isDeviceActive,
  type DeviceTelemetryData
} from '@/services/equipmentTelemetryAPI'

// ============================================================================
// FEATURE FLAGS
// ============================================================================

const useNewWidgetSystem = ref(isFeatureEnabled('useNewWidgetSystem'))
console.log('[DashboardView] Using new widget system:', useNewWidgetSystem.value)

// ============================================================================
// COMPOSABLES & STORES
// ============================================================================

const { t } = useI18n()

const currentTime = ref(new Date())
const energyChartPeriod = ref<'today' | 'yesterday' | '7days' | '30days'>('today')
const temperatureChartPeriod = ref<'today' | 'yesterday' | '7days' | '30days'>('today')

// Equipment table state
const allEquipmentDevices = ref<Device[]>([])
const equipmentTelemetry = ref<Map<string, DeviceTelemetryData>>(new Map())
let equipmentTelemetryInterval: ReturnType<typeof setInterval> | null = null

// Auto-refresh intervals
let telemetryRefreshInterval: ReturnType<typeof setInterval> | null = null

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
  fetchBatchTelemetryOptimized, // ⚡ use optimized single backend call
  fetchCurrentValue,
  fetchTelemetry,
  fetchHourlyDifferential,
  loading: telemetryLoading,
  error: telemetryError,
} = useTelemetryDynamic()

// Puissance composable for accurate consumption data (same as Puissance view)
const { fetchPuissanceKPIs } = usePuissance()

// Telemetry data cache for widgets - use reactive object instead of Map for Vue reactivity
const telemetryCache = ref<Record<string, any>>({})

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

// Equipment table state - search, pagination, and sorting
const equipmentSearchQuery = ref('')
const equipmentCurrentPage = ref(1)
const equipmentItemsPerPage = ref(5)
const equipmentSortColumn = ref<'name' | 'type' | 'status' | 'value' | 'lastUpdate'>('name')
const equipmentSortDirection = ref<'asc' | 'desc'>('asc')

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
    const telemetryData = telemetryCache.value[compteur.id]

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
          yesterdayReadings: telemetryData.yesterdayReadings || [],
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
        yesterdayReadings: telemetryData.yesterdayReadings || [],
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
 * Note: This has been replaced by the displayedEquipmentDevices computed property
 * which uses real API data from ThingsBoard. Keeping as comment for reference.
 */

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
 * Fetch telemetry data for selected compteurs using TWO strategies:
 * 1. Batch API: For instantaneous readings (ActivePowerTotal chart, current power)
 * 2. Puissance API: For consumption data (todayEnergy, yesterdayEnergy, hourly readings)
 *
 * The Puissance API uses the same proven approach as the Puissance view:
 * - Fetches each hour individually (point-in-time, not interval aggregation)
 * - Carries forward last known values for missing hours (no data gaps)
 * - Calculates correct differentials with no gaps from 00h to now
 * - Returns consumedToday as sum of hourly differentials
 *
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
  console.log('[DashboardView] Fetching telemetry for', compteursWithUUID.length, 'devices')
  console.log('[DashboardView] Strategy: Batch API (instantaneous) + Puissance API (consumption)')
  console.log('[DashboardView] API-only mode:', isApiOnlyMode.value)

  try {
    // Get instantaneous config from telemetryConfig
    const instantConfig = DEFAULT_WIDGET_CONFIG.instantaneousReadings

    // Calculate time ranges
    const now = Date.now()

    // ========================================================================
    // STEP 1: Batch API for instantaneous readings only
    // (ActivePowerTotal current value + chart data)
    // ========================================================================
    const batchRequests = compteursWithUUID.flatMap(compteur => [
      // Current value (latest single value)
      {
        deviceUUID: compteur.deviceUUID!,
        config: {
          keys: [DEFAULT_WIDGET_CONFIG.instantaneous.key],
          startTs: now - 24 * 60 * 60 * 1000,
          endTs: now,
          limit: 1,
          agg: 'NONE' as const,
          orderBy: 'DESC' as const
        }
      },
      // Instantaneous readings (time-series chart data, 5-min intervals)
      {
        deviceUUID: compteur.deviceUUID!,
        config: {
          keys: instantConfig.keys,
          startTs: now - instantConfig.timeRange,
          endTs: now,
          interval: instantConfig.interval,
          agg: instantConfig.agg
        }
      }
    ])

    console.log(`[DashboardView] 🎯 Request breakdown:`)
    console.log(`  - Batch API: ${batchRequests.length} requests (current power + instantaneous chart)`)
    console.log(`  - Puissance API: ${compteursWithUUID.length} requests (1 per meter for consumption)`)

    // ========================================================================
    // STEP 2: Execute BOTH in parallel
    // - Batch API: instantaneous data
    // - Puissance API: consumption data (same approach as Puissance view)
    // ========================================================================
    const [batchResults, ...puissanceResults] = await Promise.all([
      fetchBatchTelemetryOptimized(batchRequests),
      ...compteursWithUUID.map(compteur =>
        fetchPuissanceKPIs(compteur.deviceUUID!, { useCache: false })
          .catch(err => {
            console.error(`[DashboardView] Puissance API failed for ${compteur.name}:`, err)
            return null
          })
      )
    ])

    console.log('[DashboardView] ✓ Both APIs returned data')

    // ========================================================================
    // STEP 3: Merge results from both APIs into telemetry cache
    // ========================================================================
    let hasAnyData = false
    compteursWithUUID.forEach((compteur, index) => {
      const deviceData = batchResults.get(compteur.deviceUUID!) || []
      const puissanceData = puissanceResults[index]

      if (deviceData.length > 0 || puissanceData?.success) {
        hasAnyData = true
      }

      // From Batch API: Extract instantaneous readings and current power
      const instantReadings = deviceData
        .filter(d => instantConfig.keys.includes(d.key) && d.ts > now - instantConfig.timeRange)
        .sort((a, b) => a.ts - b.ts)

      const currentPowerData = deviceData
        .filter(d => d.key === 'ActivePowerTotal')
        .sort((a, b) => b.ts - a.ts)
        .slice(0, 1)

      // From Puissance API: Extract consumption data (same proven approach as Puissance view)
      // The Puissance API handles:
      // - Hourly point-in-time fetches (no interval aggregation gaps)
      // - Baseline from 23h previous day
      // - Carry-forward for missing hours
      // - Correct differential calculations from 00h to now
      let todayEnergyTotal = 0
      let yesterdayEnergyTotal = 0
      let todayReadings: Array<{ ts: number; value: number; key: string }> = []
      let yesterdayReadings: Array<{ ts: number; value: number; key: string }> = []

      if (puissanceData?.success && puissanceData.data) {
        // Use Puissance API values directly (same as Puissance view)
        todayEnergyTotal = puissanceData.data.consumedToday ?? 0
        yesterdayEnergyTotal = puissanceData.data.consumedYesterday ?? 0

        // Convert hourlyData to todayReadings format for charts
        // hourlyData contains today's hourly consumption (differential, from 00h to now)
        if (puissanceData.data.hourlyData && puissanceData.data.hourlyData.length > 0) {
          todayReadings = puissanceData.data.hourlyData.map((d: any) => ({
            ts: d.ts,
            value: d.value,
            key: 'AccumulatedActiveEnergyDelivered'
          }))
        }

        console.log(`[DashboardView] Puissance data for ${compteur.name}:`, {
          consumedToday: todayEnergyTotal,
          consumedYesterday: yesterdayEnergyTotal,
          hourlyPoints: todayReadings.length,
          hourlyData: todayReadings.map(d => ({
            time: new Date(d.ts).toLocaleTimeString(),
            value: d.value.toFixed(2)
          })),
          source: 'Puissance API (same as Puissance view)'
        })
      } else {
        console.warn(`[DashboardView] ⚠️ Puissance API returned no data for ${compteur.name}`)
      }

      // Use Puissance API instantaneous power if batch didn't return it
      const currentPower = currentPowerData.length > 0
        ? currentPowerData[0].value
        : (puissanceData?.data?.instantaneousPower ?? 0)

      console.log(`[DashboardView] Extracted data for ${compteur.name}:`, {
        currentPower,
        todayEnergyTotal,
        todayEnergySource: 'Puissance API (sum of hourly differentials)',
        yesterdayEnergyTotal,
        todayReadingsCount: todayReadings.length,
        instantReadingsCount: instantReadings.length
      })

      const telemetryData = {
        id: compteur.id,
        currentPower,
        todayEnergy: todayEnergyTotal,
        yesterdayEnergy: yesterdayEnergyTotal,
        instantReadings,
        todayReadings,
        yesterdayReadings,
        hasData: deviceData.length > 0 || (puissanceData?.success ?? false)
      }

      telemetryCache.value[compteur.id] = telemetryData

      console.log(`[DashboardView] ✓ Telemetry cached for ${compteur.name}:`, {
        currentPower: typeof currentPower === 'number' ? currentPower.toFixed(2) : currentPower,
        todayEnergy: telemetryData.todayEnergy.toFixed(2),
        yesterdayEnergy: telemetryData.yesterdayEnergy.toFixed(2),
        todayReadingsCount: todayReadings.length,
        instantReadingsCount: instantReadings.length,
        source: 'Puissance API + Batch API'
      })
    })

    // Set status based on whether we got any data
    telemetryFetchStatus.value = hasAnyData ? 'success' : 'no-data'
    console.log('[DashboardView] ✓ Telemetry fetch complete, status:', telemetryFetchStatus.value)
  } catch (error) {
    // In API-only mode, don't fall back - show error state
    if (isApiOnlyMode.value) {
      console.error('[DashboardView] API-only mode: Failed to fetch telemetry data (no fallback):', error)
      telemetryFetchStatus.value = 'no-data'

      // Clear cache when in API-only mode and API fails
      telemetryCache.value = {}

      // Don't use mock data - show "no data available"
      selectedCompteurs.value.forEach(compteur => {
        telemetryCache.value[compteur.id] = {
          id: compteur.id,
          currentPower: 0,
          todayEnergy: 0,
          yesterdayEnergy: 0,
          instantReadings: [],
          todayReadings: [],
          hasData: false,
          isApiError: true
        };
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

  // Fetch equipment devices and telemetry for table
  await fetchEquipmentDevices()

  // Update time display every second (no API calls)
  timeInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  // Set up auto-refresh for telemetry data every 20 seconds (silent, no loader)
  telemetryRefreshInterval = window.setInterval(() => {
    if (selectedCompteurs.value.length > 0) {
      console.log('[DashboardView] Silent telemetry refresh (20s interval)')
      fetchTelemetryData()
    }
  }, 20000)
})

// ============================================================================
// EQUIPMENT TABLE FUNCTIONS (API-based like EquipmentView)
// ============================================================================

/**
 * Fetch all equipment devices and their telemetry
 */
async function fetchEquipmentDevices() {
  try {
    allEquipmentDevices.value = await getAllIndusmindCustomerDevices()
    await fetchEquipmentTelemetry()

    // Set up auto-refresh every 10 seconds
    equipmentTelemetryInterval = setInterval(fetchEquipmentTelemetry, 10000)
  } catch (err) {
    console.error('[DashboardView] Error fetching equipment devices:', err)
  }
}

/**
 * Fetch telemetry for all equipment devices
 */
async function fetchEquipmentTelemetry() {
  try {
    const telemetryList = await fetchAllDevicesLatestTelemetry()
    const telemetryMap = new Map<string, DeviceTelemetryData>()
    telemetryList.forEach(data => {
      telemetryMap.set(data.deviceUUID, data)
    })
    equipmentTelemetry.value = telemetryMap
  } catch (err) {
    console.error('[DashboardView] Error fetching equipment telemetry:', err)
  }
}

/**
 * Get device type enum (meter, sensor, controller)
 */
function getEquipmentDeviceType(device: Device): string {
  if (device.name.includes('PM2200')) return 'meter'
  if (device.name.includes('t_sensor') || device.name.includes('Sensor')) return 'sensor'
  if (device.name.includes('_controller') || device.name.includes('Controller')) return 'controller'
  return 'meter'
}

/**
 * Get device value for display
 */
function getEquipmentDeviceValue(device: Device): string {
  const telemetry = equipmentTelemetry.value.get(device.deviceUUID)
  if (!telemetry || !telemetry.telemetry) return '--'

  const type = getEquipmentDeviceType(device)
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

/**
 * Get device status
 */
function getEquipmentDeviceStatus(device: Device): { label: string; isOnline: boolean } {
  const telemetry = equipmentTelemetry.value.get(device.deviceUUID)
  if (!telemetry) {
    return { label: t('dashboard.equipment.status.offline'), isOnline: false }
  }

  const active = isDeviceActive(telemetry.lastActivityTime)
  return {
    label: active ? t('dashboard.equipment.status.online') : t('dashboard.equipment.status.offline'),
    isOnline: active
  }
}

/**
 * Get device unit
 */
function getEquipmentDeviceUnit(device: Device): string {
  const type = getEquipmentDeviceType(device)
  if (type === 'meter') return t('common.unit.kw')
  if (type === 'sensor') return t('common.unit.celsius')
  return '--'
}

/**
 * Get device last update timestamp
 */
function getEquipmentLastUpdate(device: Device): number | null {
  const telemetry = equipmentTelemetry.value.get(device.deviceUUID)
  if (!telemetry) return null

  const type = getEquipmentDeviceType(device)
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

/**
 * Format last update for display
 */
function formatEquipmentLastUpdate(device: Device): string {
  const lastUpdate = getEquipmentLastUpdate(device)
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

/**
 * Filter equipment devices to show only relevant ones in dashboard
 */
const filteredEquipmentDevices = computed(() => {
  // Show meters and sensors only (not controllers)
  return allEquipmentDevices.value.filter(device => {
    const type = getEquipmentDeviceType(device)
    return type === 'meter' || type === 'sensor'
  })
})

/**
 * Search filtered equipment devices
 */
const searchedEquipmentDevices = computed(() => {
  if (!equipmentSearchQuery.value.trim()) {
    return filteredEquipmentDevices.value
  }

  const query = equipmentSearchQuery.value.toLowerCase().trim()
  return filteredEquipmentDevices.value.filter(device => {
    return (
      device.name.toLowerCase().includes(query) ||
      getEquipmentDeviceType(device).toLowerCase().includes(query) ||
      getEquipmentDeviceStatus(device).label.toLowerCase().includes(query)
    )
  })
})

/**
 * Sort searched equipment devices
 */
const sortedEquipmentDevices = computed(() => {
  const devices = [...searchedEquipmentDevices.value]

  devices.sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (equipmentSortColumn.value) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'type':
        aValue = getEquipmentDeviceType(a)
        bValue = getEquipmentDeviceType(b)
        break
      case 'status':
        aValue = getEquipmentDeviceStatus(a).isOnline ? 1 : 0
        bValue = getEquipmentDeviceStatus(b).isOnline ? 1 : 0
        break
      case 'value':
        aValue = parseFloat(getEquipmentDeviceValue(a)) || 0
        bValue = parseFloat(getEquipmentDeviceValue(b)) || 0
        break
      case 'lastUpdate':
        aValue = getEquipmentLastUpdate(a) || 0
        bValue = getEquipmentLastUpdate(b) || 0
        break
      default:
        return 0
    }

    if (aValue < bValue) return equipmentSortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return equipmentSortDirection.value === 'asc' ? 1 : -1
    return 0
  })

  return devices
})

/**
 * Paginated equipment devices for display
 */
const displayedEquipmentDevices = computed(() => {
  const start = (equipmentCurrentPage.value - 1) * equipmentItemsPerPage.value
  const end = start + equipmentItemsPerPage.value
  return sortedEquipmentDevices.value.slice(start, end)
})

/**
 * Total pages for pagination
 */
const equipmentTotalPages = computed(() => {
  return Math.ceil(sortedEquipmentDevices.value.length / equipmentItemsPerPage.value)
})

/**
 * Helper to toggle sort column and direction
 */
function toggleEquipmentSort(column: 'name' | 'type' | 'status' | 'value' | 'lastUpdate') {
  if (equipmentSortColumn.value === column) {
    equipmentSortDirection.value = equipmentSortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    equipmentSortColumn.value = column
    equipmentSortDirection.value = 'asc'
  }
}

/**
 * Helper to change page
 */
function goToEquipmentPage(page: number) {
  if (page >= 1 && page <= equipmentTotalPages.value) {
    equipmentCurrentPage.value = page
  }
}

// Reset to page 1 when search changes
watch(equipmentSearchQuery, () => {
  equipmentCurrentPage.value = 1
})

// Watch for compteur selection changes and fetch telemetry
watch(selectedCompteurs, async (newCompteurs) => {
  if (newCompteurs.length > 0) {
    await fetchTelemetryData()
  }
}, { deep: true })

// Watch for chart period changes and refetch data
watch([energyChartPeriod, temperatureChartPeriod], async ([newEnergyPeriod, newTempPeriod]) => {
  console.log('[DashboardView] Chart periods changed:', {
    energy: newEnergyPeriod,
    temperature: newTempPeriod
  })
  // Chart period changes will be handled by UnifiedChart components
  // which will request data for the new period
  // This is just for logging/debugging
}, { deep: true })

onUnmounted(() => {
  // Stop real-time data updates
  stopRealtimeData()

  // Clear time interval
  if (timeInterval) {
    clearInterval(timeInterval)
  }

  // Clear equipment telemetry interval
  if (equipmentTelemetryInterval) {
    clearInterval(equipmentTelemetryInterval)
  }

  // Clear telemetry refresh interval
  if (telemetryRefreshInterval) {
    clearInterval(telemetryRefreshInterval)
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
  const telemetryData = telemetryCache.value[compteur.id]

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
 * Legacy temperature zone helper functions
 * Note: These have been replaced by equipment helper functions (getEquipmentDeviceStatus, etc.)
 * Kept as comment for reference
 */

</script>
