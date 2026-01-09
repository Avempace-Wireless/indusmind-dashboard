<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Compteur Selector Modal -->
      <CompteurSelector
        :is-open="showCompteurSelector"
        :all-compteurs="allCompteurs"
        :selected-ids="selectedCompteurIds"
        @apply="handleCompteurSelection"
        @close="showCompteurSelector = false"
      />

      <!-- Breadcrumbs & Header -->
      <div class="flex flex-col gap-6">
        <nav class="flex items-center text-sm font-medium text-slate-600 dark:text-slate-400">
          <a class="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">{{ $t('navigation.home') }}</a>
          <span class="mx-2 text-slate-400 dark:text-slate-600">/</span>
          <a class="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors" href="#">{{ $t('navigation.dashboard') }}</a>
          <span class="mx-2 text-slate-400 dark:text-slate-600">/</span>
          <span class="text-blue-600 dark:text-blue-400">{{ $t('navigation.realtime') }}</span>
        </nav>

        <!-- Page title with status -->
        <div class="flex flex-wrap justify-between items-end gap-4 border-b border-slate-200 dark:border-border-dark pb-6">
          <div class="flex flex-col gap-2">
            <h1 class="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{{ $t('dashboard.title') }}</h1>
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
      </div>

      <!-- Compteur Selector Control -->
      <div class="flex justify-end">
        <button
          @click="showCompteurSelector = true"
          class="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
        >
          <span class="material-symbols-outlined text-base">tune</span>
          {{ $t('dashboard.manageMeters') }}
        </button>
      </div>

      <!-- Compteur Widgets Grid (Dynamic, responsive) -->
      <div :class="[
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
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-lg"
          >
            <span class="material-symbols-outlined text-lg">add</span>
            {{ $t('dashboard.noMetersSelected.action') }}
          </button>
        </div>

        <CompteurWidget
          v-for="compteur in selectedCompteurs"
          :key="compteur.id"
          :compteur="compteur"
          :current-mode="widgetModes[compteur.id]"
          @update:mode="(mode) => setWidgetMode(compteur.id, mode)"
        />
      </div>

      <!-- Unified Chart with Side Widgets -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Unified Chart (Energy & Temperature) - Takes 2 columns on XL -->
        <div class="xl:col-span-2">
          <UnifiedChart
            :mode="chartMode"
            :period="chartPeriod"
            :subtitle="unifiedChartSubtitle"
            :selected-compteurs="selectedCompteurs"
            @update:mode="chartMode = $event"
            @update:period="chartPeriod = $event"
          />
        </div>

        <!-- Side Widgets -->
        <div class="flex flex-col gap-6">
          <!-- Phase Balance Widget -->
          <PhaseBalance
            :title="$t('dashboard.phaseBalance.title')"
            :phases="phaseBalanceData"
          />

          <!-- Events Widget -->
          <EventsWidget
            :title="$t('dashboard.recentEvents.title')"
            :action-label="$t('dashboard.recentEvents.viewAll')"
            :events="recentEvents"
          />
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
              <!-- Energy Compteurs -->
              <tr v-for="compteur in selectedCompteurs" :key="compteur.id" class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td class="px-6 py-3 text-slate-900 dark:text-slate-100 font-medium">{{ compteur.name }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ $t('dashboard.equipment.columns.energy') }}</td>
                <td class="px-6 py-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200">
                    {{ $t('dashboard.equipment.status.online') }}
                  </span>
                </td>
                <td class="px-6 py-3 text-slate-900 dark:text-slate-100 font-mono">{{ compteur.instantaneous.toFixed(1) }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ $t('common.unit.kw') }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ $t('common.justNow') }}</td>
              </tr>
              <!-- Temperature Zones -->
              <tr v-for="zone in temperatureZones" :key="zone.id" class="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <td class="px-6 py-3 text-slate-900 dark:text-slate-100 font-medium">{{ zone.name }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ $t('dashboard.equipment.columns.temperature') }}</td>
                <td class="px-6 py-3">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    zone.status === 'Normal'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200'
                      : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200'
                  ]">
                    {{ zone.status }}
                  </span>
                </td>
                <td class="px-6 py-3 text-slate-900 dark:text-slate-100 font-mono">{{ zone.value.toFixed(1) }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ $t('common.unit.celsius') }}</td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-400">{{ zone.lastUpdate }}</td>
              </tr>
              <!-- Empty state -->
              <tr v-if="selectedCompteurs.length === 0 && temperatureZones.length === 0">
                <td colspan="6" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                  {{ $t('dashboard.equipment.noData') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import UnifiedChart from '@/components/dashboard/UnifiedChart.vue'
import PhaseBalance from '@/components/dashboard/PhaseBalance.vue'
import EventsWidget from '@/components/dashboard/EventsWidget.vue'
import CompteurWidget from '@/components/dashboard/CompteurWidget.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import { useRealtimeData } from '@/composables/useRealtimeData'
import { useCompteurSelection, type CompteurMode } from '@/composables/useCompteurSelection'

// ============================================================================
// COMPOSABLES
// ============================================================================

const { t } = useI18n()

const currentTime = ref(new Date())
const chartMode = ref<'energy' | 'temperature'>('energy')
const chartPeriod = ref<'today' | 'yesterday' | '7days' | '30days'>('today')

const { dashboardStore, equipmentStore, alertsStore, initializeRealtimeData, stopRealtimeData } =
  useRealtimeData()

const {
  selectedCompteurIds,
  widgetModes,
  showCompteurSelector,
  selectedCompteurs,
  availableCompteurs: allCompteurs,
  aggregatedInstantaneous,
  filteredEquipment,
  selectionStatusText: compteurSelectionStatus,
  setCompteurMode,
  addCompteur,
  removeCompteur,
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

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

/**
 * Unified chart subtitle
 */
const unifiedChartSubtitle = computed(() => {
  return t('dashboard.unifiedChart.subtitle', { count: selectedCompteurs.value.length })
})

/**
 * Temperature zones data for equipment table
 */
const temperatureZones = computed(() => {
  return [
    { id: 'zone-6', name: t('temperature.zones.zone6'), value: 48.6, status: 'Normal', lastUpdate: t('common.justNow') },
    { id: 'zone-4', name: t('temperature.zones.zone4'), value: -17.2, status: t('dashboard.equipment.status.alert'), lastUpdate: '1 min ago' },
    { id: 'zone-1', name: t('temperature.zones.zone1'), value: 56.3, status: 'Normal', lastUpdate: t('common.justNow') }
  ]
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
 * Responsive grid layout based on selected compteur count
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

onMounted(async () => {
  // Initialize compteur selection
  initializeCompteurSelection()

  // Start real-time data updates
  try {
    await initializeRealtimeData()
  } catch (error) {
    console.error('Failed to initialize real-time data:', error)
  }

  // Update display time every second
  timeInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

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
 */
function handleCompteurSelection(selectedIds: string[]) {
  // Clear existing selections
  selectedCompteurIds.value.forEach((id) => {
    if (!selectedIds.includes(id)) {
      removeCompteur(id)
    }
  })

  // Add new selections
  selectedIds.forEach((id) => {
    if (!selectedCompteurIds.value.includes(id)) {
      addCompteur(id)
    }
  })

  showCompteurSelector.value = false
}

/**
 * Set widget mode for a specific compteur
 */
function setWidgetMode(compteurId: string, mode: CompteurMode) {
  setCompteurMode(compteurId, mode)
}
</script>
