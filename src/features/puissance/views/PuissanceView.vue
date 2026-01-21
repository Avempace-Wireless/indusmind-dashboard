<template>
  <AdminLayout>
    <!-- Header Section -->
    <div class="mb-8">
      <!-- Title & Description -->
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {{ $t('puissance.pageTitle') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('puissance.pageDescription') }}
          </p>
        </div>
        <button
          @click="showCompteurSelector = true"
          class="flex w-full sm:w-auto items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-white px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-100 transition-colors whitespace-nowrap shadow-sm self-start"
        >
          <span class="material-symbols-outlined text-base">tune</span>
          {{ $t('dashboard.manageMeters') }}
        </button>
      </div>

      <!-- CompteurSelector Modal -->
      <CompteurSelector
        :is-open="showCompteurSelector"
        :all-compteurs="allCompteurs"
        :selected-ids="selectedMeterIdsArray"
        @apply="handleCompteurSelection"
        @close="showCompteurSelector = false"
      />

      <!-- Controls Section - Compact Meter Selection -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-4 border-2 border-slate-300 dark:border-slate-600 mb-4">
        <div v-if="validSelectedMeterIds.length > 0 && currentMeterId" class="space-y-3">
          <!-- Header: Title + Manage Button -->
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {{ $t('compteur.selector.title') }}
            </h3>
          </div>

          <!-- All Meters Pills - Grid Layout -->
          <div v-if="validSelectedMeterIds.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <button
              v-for="(meterId, index) in validSelectedMeterIds"
              :key="meterId"
              @click="selectMeter(index)"
              :class="[
                'px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border-2 flex items-center justify-center gap-1 relative overflow-hidden group',
                currentMeterIndex === index
                  ? 'text-white shadow-lg scale-105 border-transparent'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
              ]"
              :style="currentMeterIndex === index ? { backgroundColor: metersStore.getMeterColor(meterId) } : {}"
            >
              <!-- Background gradient for non-selected -->
              <div
                v-if="currentMeterIndex !== index"
                class="absolute inset-0 opacity-0 group-hover:opacity-5 transition"
                :style="{ backgroundColor: metersStore.getMeterColor(meterId) }"
              />

              <!-- Content -->
              <span v-if="currentMeterIndex === index" class="material-symbols-outlined text-sm flex-shrink-0">check_circle</span>
              <span class="truncate relative z-10">{{ getMeterName(meterId) }}</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
          <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">inbox</span>
          <p class="text-sm">{{ $t('dashboard.noMetersSelected.description') }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State - Improved with current meter info -->
    <div v-if="!isMeterDataReady && validSelectedMeterIds.length > 0" class="flex items-center justify-center py-16">
      <div class="text-center">
        <div class="inline-block mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-teal-600"></div>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ $t('common.loading') }} {{ currentMeterId ? getMeterName(currentMeterId) : $t('common.meterData') }}</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400">{{ $t('puissance.labels.fetchingData') }}</p>
        <div class="mt-4 flex items-center justify-center gap-2">
          <div class="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></div>
          <span class="text-xs text-slate-500 dark:text-slate-500">{{ $t('common.meter') }} {{ currentMeterIndex + 1 }} {{ $t('common.of') }} {{ validSelectedMeterIds.length }}</span>
        </div>
      </div>
    </div>

    <!-- No Data Message - When meter has no elements/data -->
    <div v-else-if="isMeterDataReady && currentMeterData && (!currentMeterData.elements || currentMeterData.elements.length === 0)" class="flex items-center justify-center py-16">
      <div class="text-center max-w-md">
        <span class="material-symbols-outlined text-5xl mb-3 block text-slate-400">info</span>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ $t('puissance.labels.noElementData') }}</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
          <strong>{{ currentMeterId ? getMeterName(currentMeterId) : $t('common.thisMeter') }}</strong> {{ $t('puissance.labels.noElementBreakdown') }}
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-500">
          {{ $t('puissance.labels.tryDifferentMeter') }}
        </p>
      </div>
    </div>

    <!-- Display Mode Toggle - Only show when data is ready AND has elements -->
    <div
      v-if="isMeterDataReady && currentMeterData && (currentMeterData.elements && currentMeterData.elements.length > 0)"
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 px-1"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{{ $t('puissance.displayMode') }}</span>
      </h2>
      <div class="flex flex-wrap gap-2 w-full sm:w-auto">
        <button
          @click="viewMode = 'overview'"
          :class="[
            'px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 border text-sm font-medium',
            viewMode === 'overview'
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md border-transparent'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700'
          ]"
        >
          <span class="material-symbols-outlined">dashboard</span>
          {{ $t('puissance.tabs.overview') }}
        </button>
        <button
          @click="viewMode = 'charts'"
          :class="[
            'px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 border text-sm font-medium',
            viewMode === 'charts'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md border-transparent'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700'
          ]"
        >
          <span class="material-symbols-outlined">bar_chart</span>
          {{ $t('puissance.tabs.charts') }}
        </button>
        <button
          @click="viewMode = 'tables'"
          :class="[
            'px-3 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 border text-sm font-medium',
            viewMode === 'tables'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md border-transparent'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700'
          ]"
        >
          <span class="material-symbols-outlined">table_chart</span>
          {{ $t('puissance.tabs.tables') }}
        </button>
      </div>
    </div>

    <!-- Overview View: 2-Column Layout (Widgets Left, Charts Right) - Only if has elements -->
    <div v-if="isMeterDataReady && currentMeterData && (currentMeterData.elements && currentMeterData.elements.length > 0) && viewMode === 'overview'" class="space-y-8 animate-fadeIn">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: KPI Cards (1 col) -->
        <div v-if="displayElements.kpis" class="lg:col-span-1 space-y-4">
            <div class="flex items-center gap-3 mb-4">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.metrics') }}</h2>
          </div>

          <!-- KPI Cards in Column -->
          <div v-if="currentMeterData" class="space-y-3">
            <KPICard
              v-for="(kpiKey, idx) in visibleKpiKeys"
              :key="idx"
              :title="$t(`puissance.kpi.${kpiKey}`)"
              :value="(currentMeterData.kpiValues as unknown as Record<string, number>)[kpiKey]"
              :unit="$t('common.unit.kw')"
              :meter-name="currentMeterData.name"
              :meter-color="currentMeterData.color"
            />
          </div>
        </div>

        <!-- Right Column: Charts (2 cols) -->
        <div v-if="displayElements.charts" :class="[displayElements.kpis ? 'lg:col-span-2' : 'lg:col-span-3', 'space-y-6']">
          <!-- Monthly Chart -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                  <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.overview.yearly') }}</h2>
                </div>
              <button
                @click="showChartModal('monthly')"
                :class="['px-3 py-2 rounded-lg text-sm font-medium hover:transition border', getDetailButtonClasses(currentMeterData.color)]"
              >
                <span class="material-symbols-outlined inline text-lg align-text-bottom mr-1">zoom_in</span>
                {{ $t('common.viewDetails') }}
              </button>
            </div>
            <BarChart
              :title="$t('puissance.charts.monthlyPower')"
              :subtitle="$t('puissance.charts.monthlyAverage')"
              :labels="currentMeterData.monthlyData.labels"
              :data="currentMeterData.monthlyData.values"
              :bar-color="currentMeterData.color"
            />
          </div>

          <!-- Daily and Hourly Charts -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.daily') }}</h3>
                </div>
                <button
                  @click="showChartModal('daily')"
                  :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
                >
                  <span class="material-symbols-outlined text-lg">zoom_in</span>
                </button>
              </div>
              <BarChart
                :title="$t('puissance.charts.dailyPower')"
                :subtitle="$t('puissance.charts.monthlyAverage')"
                :labels="currentMeterData.dailyData.labels"
                :data="currentMeterData.dailyData.values"
                :bar-color="currentMeterData.color"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.hourly') }}</h3>
                </div>
                <button
                  @click="showChartModal('hourly')"
                  :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
                >
                  <span class="material-symbols-outlined text-lg">zoom_in</span>
                </button>
              </div>
              <BarChart
                :title="$t('puissance.charts.hourlyPower')"
                :subtitle="$t('puissance.charts.monthlyAverage')"
                :labels="currentMeterData.hourlyData.labels"
                :data="currentMeterData.hourlyData.values"
                :bar-color="currentMeterData.color"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts View: Full Width Charts - Only if has elements -->
    <div v-else-if="isMeterDataReady && currentMeterData && (currentMeterData.elements && currentMeterData.elements.length > 0) && viewMode === 'charts'" class="space-y-8 animate-fadeIn">
      <!-- Monthly Chart -->
      <div>
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.yearlyOverview') }}</h2>
          </div>
          <button
            @click="showChartModal('monthly')"
            :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
          >
            <span class="material-symbols-outlined inline text-lg align-text-bottom mr-1">zoom_in</span>
            {{ $t('common.viewDetails') }}
          </button>
        </div>
        <BarChart
          :title="$t('puissance.charts.monthlyPower')"
          :subtitle="$t('puissance.charts.monthlyAverage')"
          :labels="currentMeterData.monthlyData.labels"
          :data="currentMeterData.monthlyData.values"
          :bar-color="currentMeterData.color"
        />
      </div>

      <!-- Daily and Hourly Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
              <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.daily') }}</h2>
            </div>
            <button
              @click="showChartModal('daily')"
              :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <BarChart
            :title="$t('puissance.charts.dailyPower')"
            :subtitle="$t('puissance.charts.monthlyAverage')"
            :labels="currentMeterData.dailyData.labels"
            :data="currentMeterData.dailyData.values"
            :bar-color="currentMeterData.color"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
              <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.hourly') }}</h2>
            </div>
            <button
              @click="showChartModal('hourly')"
              :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <BarChart
            :title="$t('puissance.charts.hourlyPower')"
            :subtitle="$t('puissance.charts.monthlyAverage')"
            :labels="currentMeterData.hourlyData.labels"
            :data="currentMeterData.hourlyData.values"
            :bar-color="currentMeterData.color"
          />
        </div>
      </div>
    </div>

    <!-- Tables View: Full Width Tables - Only if has elements -->
    <div v-else-if="isMeterDataReady && currentMeterData && (currentMeterData.elements && currentMeterData.elements.length > 0) && viewMode === 'tables'" class="space-y-8 animate-fadeIn">
      <!-- Hourly Table -->
      <div>
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.hourlyData') }}</h2>
          </div>
          <button
            @click="showTableModal('hourly')"
            :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
          >
            <span class="material-symbols-outlined inline text-lg align-text-bottom mr-1">zoom_in</span>
            {{ $t('common.viewDetails') }}
          </button>
        </div>
        <DataTable
          :title="$t('puissance.tables.hourlyPower', { meter: currentMeterData.name })"
          :realtime-label="$t('puissance.tables.realtimeLastDay')"
          :columns="[
            { key: 'timestamp', label: $t('puissance.tables.columns.timestamp'), format: 'time' },
            { key: 'power', label: $t('puissance.tables.columns.power'), format: 'number' },
          ]"
          :data="currentMeterData.hourlyTableData"
          :items-per-page="15"
        />
      </div>

      <!-- Daily Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.dailyTotal') }}</h2>
          </div>
            <button
              @click="showTableModal('daily')"
              :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <DataTable
            :title="$t('puissance.tables.dailyTotal')"
            :realtime-label="$t('puissance.tables.realtimeMonth')"
            :columns="[
              { key: 'timestamp', label: $t('puissance.tables.columns.date'), format: 'date' },
              { key: 'power', label: $t('puissance.tables.columns.dailyPower'), format: 'number' },
            ]"
            :data="currentMeterData.dailyTableData"
            :items-per-page="15"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.dailyAverage') }}</h2>
          </div>
            <button
              @click="showTableModal('monthly')"
              :class="['px-3 py-2 rounded-lg text-sm font-medium transition border', getDetailButtonClasses(currentMeterData.color)]"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <DataTable
            :title="$t('puissance.tables.dailyAverage')"
            :realtime-label="$t('puissance.tables.realtimeMonth')"
            :columns="[
              { key: 'timestamp', label: $t('puissance.tables.columns.month'), format: 'date' },
              { key: 'power', label: $t('puissance.tables.columns.averagePower'), format: 'number' },
            ]"
            :data="currentMeterData.dailyAverageData"
            :items-per-page="15"
          />
        </div>
      </div>
    </div>

    <!-- Chart Detail Modal -->
    <ChartDetailModal
      v-if="currentMeterData"
      :is-open="chartModalOpen"
      :chart-title="chartModalData.title"
      :chart-subtitle="chartModalData.subtitle"
      :meter-name="currentMeterData.name"
      :meter-color="currentMeterData.color"
      :data="chartModalData.data"
      :labels="chartModalData.labels"
      :hourly-data="chartModalData.hourlyData"
      :daily-data="chartModalData.dailyData"
      :weekly-data="chartModalData.weeklyData"
      :monthly-data="chartModalData.monthlyData"
      :yearly-data="chartModalData.yearlyData"
      @close="chartModalOpen = false"
    />

    <!-- Table Detail Modal -->
    <TableDetailModal
      v-if="currentMeterData"
      :is-open="tableModalOpen"
      :table-title="tableModalData.title"
      :meter-name="currentMeterData.name"
      :columns="tableModalData.columns"
      :hourly-data="currentMeterData.hourlyTableData"
      :daily-data="currentMeterData.dailyTableData"
      :monthly-data="currentMeterData.dailyAverageData"
      :initial-period="tableModalData.initialPeriod"
      @close="tableModalOpen = false"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import KPICard from '@/components/puissance/KPICard.vue'
import BarChart from '@/components/puissance/BarChart.vue'
import DataTable from '@/components/puissance/DataTable.vue'
import ChartDetailModal from '@/components/puissance/ChartDetailModal.vue'
import TableDetailModal from '@/components/puissance/TableDetailModal.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import { useMetersStore } from '@/stores/useMetersStore'
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore'
import { useCompteurSelection } from '@/composables/useCompteurSelection'
import { getMeterColorByIndex } from '@/utils/meterColors'
import type { Meter, KPIValues } from '@/data/mockData'

const { t } = useI18n()

// ✅ USE COMPOSABLE FOR CENTRALIZED METER MANAGEMENT
const metersStore = useMetersStore()
const dashboardStore = useDashboardStore()

// Use the same composable as DashboardView for consistency
const {
  selectedCompteurIds,
  availableCompteurs: allCompteurs,
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

// Get selected meter IDs as a reactive computed
const selectedMeterIds = computed(() => selectedCompteurIds.value)

// Filter out any meter IDs that don't exist in allCompteurs (to avoid showing "Unknown")
const validSelectedMeterIds = computed(() => {
  return selectedMeterIds.value.filter(meterId => {
    return allCompteurs.value.some(c => c.id === meterId)
  })
})

// Create a separate ref that tracks the array for prop passing
const selectedMeterIdsArray = computed(() => [...selectedMeterIds.value])

// ✅ TRACK CURRENTLY DISPLAYED METER
const currentMeterIndex = ref(0)
const currentMeterId = computed(() => validSelectedMeterIds.value[currentMeterIndex.value] || null)

// Functions to navigate between selected meters
function selectMeter(index: number) {
  currentMeterIndex.value = index
}

function previousMeter() {
  if (currentMeterIndex.value > 0) {
    currentMeterIndex.value--
  }
}

function nextMeter() {
  if (currentMeterIndex.value < selectedMeterIds.value.length - 1) {
    currentMeterIndex.value++
  }
}

// Watch for changes in validSelectedMeterIds to keep index valid
watch(validSelectedMeterIds, (newIds) => {
  if (currentMeterIndex.value >= newIds.length && newIds.length > 0) {
    currentMeterIndex.value = newIds.length - 1
  } else if (newIds.length === 0) {
    currentMeterIndex.value = 0
  }
})

// UI State
const showCompteurSelector = ref(false)

// Handle meter selection from modal
function handleCompteurSelection(selectedIds: string[]) {
  metersStore.setSelectedMeters(selectedIds)
  showCompteurSelector.value = false
}

// Helper function to get meter name by ID
function getMeterName(meterId: string): string {
  const compteur = allCompteurs.value.find(c => c.id === meterId)
  return compteur?.name || 'Unknown'
}

// Helper function to get meter color by index
function getMeterColorByIndexHelper(index: number): string {
  return getMeterColorByIndex(index).hex
}

/**
 * Get button color classes based on meter's color for "Details" buttons
 * Provides color-coded styling that matches the selected meter
 */
function getDetailButtonClasses(meterColor: string): string {
  const colorMap: Record<string, string> = {
    'red': 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800',
    'green': 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800',
    'blue': 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    'yellow': 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
  }
  return colorMap[meterColor] || colorMap['blue'] // Default to blue
}

// ===========================
// AUTO-SELECT 8 METERS ON MOUNT
// ===========================
onMounted(async () => {
  // Initialize compteur selection (syncs with DashboardView)
  await initializeCompteurSelection()

  // Restore and clean up any invalid meter IDs from localStorage
  metersStore.restoreSelection()

  // Auto-select first 8 meters if none are selected after restoration
  if (selectedMeterIds.value.length === 0 && dashboardStore.compteurs.length > 0) {
    const defaultSelection = dashboardStore.compteurs.slice(0, 8).map(c => c.id)
    metersStore.setSelectedMeters(defaultSelection)
    console.log('Auto-selected 8 meters for Puissance view:', defaultSelection)
  } else if (selectedMeterIds.value.length > 0) {
    console.log('Restored selected meters for Puissance view:', selectedMeterIds.value)
  }
})
// Type for Transformed Data
// ===========================
interface TransformedMeterData {
  name: string
  color: string
  icon: string
  category: 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage'
  elements: string[]
  kpiValues: KPIValues
  hourlyData: { labels: string[]; values: number[] }
  dailyData: { labels: string[]; values: number[] }
  monthlyData: { labels: string[]; values: number[] }
  hourlyTableData: Array<{ timestamp: string; power: number; efficiency: number; status: string }>
  dailyTableData: Array<{ timestamp: string; power: number; average: number }>
  dailyAverageData: Array<{ timestamp: string; power: number; days: number }>
}

// Selected meter (single-meter view, but from the centralized selected list)
const selectedMeter = ref('tgbt')

// View mode toggle
const viewMode = ref<'overview' | 'charts' | 'tables'>('overview')

// Modal states
const chartModalOpen = ref(false)
const tableModalOpen = ref(false)

const chartModalData = ref({
  title: '',
  subtitle: '',
  data: [] as number[],
  labels: [] as string[],
  hourlyData: { labels: [] as string[], values: [] as number[] },
  dailyData: { labels: [] as string[], values: [] as number[] },
  weeklyData: { labels: [] as string[], values: [] as number[] },
  monthlyData: { labels: [] as string[], values: [] as number[] },
  yearlyData: { labels: [] as string[], values: [] as number[] },
})

const tableModalData = ref({
  title: '',
  columns: [] as any[],
  initialPeriod: 'hourly' as 'hourly' | 'daily' | 'monthly',
})

// ✅ ALL AVAILABLE METERS FROM CENTRALIZED STORE
const meters = computed(() => metersStore.allMeters.map(meter => ({
  id: meter.id,
  name: meter.name,
  color: meter.color,
  icon: meter.icon,
  category: meter.type ?? 'meter'
})))

// Meter categories for filtering - Only display main 4 categories
const mainCategories: string[] = ['TGBT', 'Compresseurs', 'Clim', 'Éclairage']
const meterCategories = computed(() => {
  const availableCategories = new Set(meters.value.map(m => m.category))
  // Return only main categories that exist in data
  return mainCategories.filter((cat) => availableCategories.has(cat))
})

// Filter meters by selected category
const filteredMeters = computed(() => {
  if (!selectedCategory.value) {
    return meters.value
  }
  return meters.value.filter(m => m.category === selectedCategory.value)
})

// Category filter state - defaults to first available category
const selectedCategory = ref<string | null>('TGBT')

// Selected element state (for meters with multiple elements)
const selectedElement = ref<string | null>(null)

/**
 * Watch category changes and auto-select first meter
 */
watch(
  () => selectedCategory.value,
  (newCategory) => {
    // When category changes, auto-select the first available meter
    const filtered = filteredMeters.value
    if (filtered.length > 0) {
      selectedMeter.value = filtered[0].id
    }
  }
)

// Display elements selection
const displayElements = ref({
  kpis: true,
  charts: true,
  summary: true
})

// Visible KPI keys based on filter
const visibleKpiKeys = computed(() => {
  if (!displayElements.value.kpis) return []
  return kpiKeys
})

/**
 * Current meter data - using centralized metersData.ts
 * Returns full meter data with time series and KPIs
 * If element is selected, returns element-specific data
 * Updates when currentMeterId changes (navigation between selected meters)
 */
const currentMeterData = computed<TransformedMeterData | null>(() => {
  // Use currentMeterId which changes when user navigates between selected meters
  if (!currentMeterId.value) return null

  return transformMeterData(currentMeterId.value)
})

/**
 * Transform meter data from centralized format to view format
 */
function transformMeterData(meterId: string): TransformedMeterData | null {
  const selectedMeterObj = metersStore.allMeters.find(m => m.id === meterId)
  if (!selectedMeterObj) return null

  // Get full meter data from centralized source
  const fullData = metersStore.getFullMeterData(meterId)
  if (!fullData) return null

  // Calculate average power from metrics for table status
  const avgPower = fullData.metrics.power

  // If element selected, return element-specific data
  if (selectedElement.value && fullData.elements && fullData.elements.length > 0) {
    const elementData = metersStore.getElementData(meterId, selectedElement.value)
    if (elementData) {
      const elementAvgPower = elementData.metrics.power
      // Transform element data to match expected format
      return {
        name: `${fullData.name} - ${elementData.name}`,
        color: metersStore.getMeterColor(meterId),
        icon: selectedMeterObj.icon ?? 'default_icon',
        category: (fullData.type ?? 'meter') as 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage',
        elements: fullData.elements.map(el => el.id),
        kpiValues: elementData.kpis,
        hourlyData: {
          labels: elementData.timeSeries.hourly.map(d => d.timestamp),
          values: elementData.timeSeries.hourly.map(d => d.value)
        },
        dailyData: {
          labels: elementData.timeSeries.daily.map(d => d.timestamp),
          values: elementData.timeSeries.daily.map(d => d.value)
        },
        monthlyData: {
          labels: elementData.timeSeries.monthly.map(d => d.timestamp),
          values: elementData.timeSeries.monthly.map(d => d.value)
        },
        hourlyTableData: elementData.timeSeries.hourly.map((d, i) => ({
          timestamp: d.timestamp,
          power: d.value,
          efficiency: Math.round(85 + Math.random() * 10),
          status: d.value > elementAvgPower ? 'high' : 'normal'
        })),
        dailyTableData: elementData.timeSeries.daily.map(d => ({
          timestamp: d.timestamp,
          power: d.value * 24,
          average: d.value
        })),
        dailyAverageData: elementData.timeSeries.monthly.map(d => ({
          timestamp: d.timestamp,
          power: d.value,
          days: 30
        }))
      }
    }
  }

  // Return aggregated meter data
  return {
    name: fullData.name,
    color: metersStore.getMeterColor(meterId),
    icon: selectedMeterObj.icon ?? 'default_icon',
    category: (fullData.type ?? 'meter') as 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage',
    elements: fullData.elements?.map(el => el.id) || [],
    kpiValues: fullData.kpis,
    hourlyData: {
      labels: fullData.timeSeries.hourly.map(d => d.timestamp),
      values: fullData.timeSeries.hourly.map(d => d.value)
    },
    dailyData: {
      labels: fullData.timeSeries.daily.map(d => d.timestamp),
      values: fullData.timeSeries.daily.map(d => d.value)
    },
    monthlyData: {
      labels: fullData.timeSeries.monthly.map(d => d.timestamp),
      values: fullData.timeSeries.monthly.map(d => d.value)
    },
    hourlyTableData: fullData.timeSeries.hourly.map((d, i) => ({
      timestamp: d.timestamp,
      power: d.value,
      efficiency: Math.round(85 + Math.random() * 10),
      status: d.value > avgPower ? 'high' : 'normal'
    })),
    dailyTableData: fullData.timeSeries.daily.map(d => ({
      timestamp: d.timestamp,
      power: d.value * 24,
      average: d.value
    })),
    dailyAverageData: fullData.timeSeries.monthly.map(d => ({
      timestamp: d.timestamp,
      power: d.value,
      days: 30
    }))
  }
}

/**
 * Safe check if currentMeterData is loaded and valid
 */
const isMeterDataReady = computed(() => {
  return currentMeterData.value &&
         currentMeterData.value.kpiValues !== undefined &&
         currentMeterData.value.monthlyData !== undefined
})

// KPI keys in order
const kpiKeys = [
  'avgPowerLastMonth',
  'avgPowerThisMonth',
  'avgPowerYesterday',
  'avgPowerToday',
  'avgPowerBeforeYesterday',
  'instantaneousPower',
]

/**
 * Get color for category badge
 */
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'TGBT': '#ef4444',           // Red
    'Compresseurs': '#22c55e',    // Green
    'Clim': '#3b82f6',            // Blue
    'Éclairage': '#f59e0b',       // Amber
    'Eclairage': '#f59e0b'        // Amber (alternative spelling)
  }
  return colors[category] || '#6b7280' // Gray fallback
}

/**
 * Get icon for category
 */
function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'TGBT': 'bolt',              // Electrical/main power
    'Compresseurs': 'air',        // Air compressor
    'Clim': 'ac_unit',            // Air conditioning
    'Éclairage': 'light_mode',    // Lighting
    'Eclairage': 'light_mode',    // Lighting (alternative spelling)
  }
  return icons[category] || 'electric_meter'
}

/**
 * Get translation key for category
 */
function getCategoryTranslationKey(category: string): string {
  const keys: Record<string, string> = {
    'TGBT': 'categories.tgbt',
    'Compresseurs': 'categories.compressors',
    'Clim': 'categories.cooling',
    'Éclairage': 'categories.lighting',
    'Eclairage': 'categories.lighting'
  }
  return keys[category] || category
}

/**
 * Adjust hex color brightness
 */
function adjustBrightness(color: string, amount: number): string {
  const usePound = color[0] === '#'
  const col = usePound ? color.slice(1) : color
  const num = parseInt(col, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return (usePound ? '#' : '') + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
}

/**
 * Watch for meter changes and auto-select element
 * TGBT-Specific Behavior:
 * - If meter has only 1 element → auto-display (no selection needed)
 * - If meter has multiple elements → auto-select first element
 * - If meter has no elements → clear element selection
 */
watch(
  () => currentMeterData.value,
  (newMeterData) => {
    if (!newMeterData) {
      selectedElement.value = null
      return
    }

    // If meter has elements
    if (newMeterData.elements && newMeterData.elements.length > 0) {
      // Auto-select first element if none selected or current selection is invalid
      if (!selectedElement.value || !newMeterData.elements.includes(selectedElement.value)) {
        selectedElement.value = newMeterData.elements[0]
      }
    } else {
      // No elements - clear selection
      selectedElement.value = null
    }
  },
  { immediate: true }
)

const showChartModal = (chartType: 'monthly' | 'daily' | 'hourly') => {
  if (!currentMeterData.value) return

  let title = ''
  let subtitle = ''
  let data: number[] = []
  let labels: string[] = []

  switch (chartType) {
    case 'monthly':
      title = t('puissance.charts.monthlyPower')
      subtitle = t('puissance.charts.monthlyAverage')
      data = currentMeterData.value.monthlyData.values
      labels = currentMeterData.value.monthlyData.labels
      break
    case 'daily':
      title = t('puissance.charts.dailyPower')
      subtitle = t('puissance.charts.dailyAverage')
      data = currentMeterData.value.dailyData.values
      labels = currentMeterData.value.dailyData.labels
      break
    case 'hourly':
      title = t('puissance.charts.hourlyPower')
      subtitle = t('puissance.charts.hourlyAverage')
      data = currentMeterData.value.hourlyData.values
      labels = currentMeterData.value.hourlyData.labels
      break
  }

  chartModalData.value = {
    title,
    subtitle,
    data,
    labels,
    hourlyData: currentMeterData.value.hourlyData,
    dailyData: currentMeterData.value.dailyData,
    weeklyData: currentMeterData.value.dailyData,
    monthlyData: currentMeterData.value.monthlyData,
    yearlyData: currentMeterData.value.monthlyData,
  }
  chartModalOpen.value = true
}

const showTableModal = (tableType: 'hourly' | 'daily' | 'monthly') => {
  if (!currentMeterData.value) return

  let title = ''
  let format: 'time' | 'date' | 'datetime' | 'number' | 'default' = 'time'

  switch (tableType) {
    case 'hourly':
      title = t('puissance.tables.hourlyPower', { meter: currentMeterData.value.name })
      format = 'time'
      break
    case 'daily':
      title = t('puissance.tables.dailyTotal')
      format = 'date'
      break
    case 'monthly':
      title = t('puissance.tables.dailyAverage')
      format = 'date'
      break
  }

  const columns = [
    { key: 'timestamp', label: t('puissance.tables.columns.timestamp'), format },
    { key: 'power', label: t('puissance.tables.columns.power'), format: 'number' as const },
  ]

  tableModalData.value = { title, columns, initialPeriod: tableType }
  tableModalOpen.value = true
}
</script>

<style scoped>
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

::-webkit-scrollbar {
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

:is(.dark ::-webkit-scrollbar-thumb) {
  background: #475569;
}
</style>
