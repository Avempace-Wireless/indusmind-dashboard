<template>
  <AdminLayout>
    <!-- Header Section -->
    <div class="mb-8">
      <!-- Title & Description -->
      <div class="mb-6">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('puissance.pageTitle') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Real-time power monitoring and analysis for selected equipment meters
        </p>
      </div>

      <!-- Controls Section - Two Separate Cards on Same Line -->
      <div class="flex flex-row gap-4">
        <!-- Select Meters Card -->
        <div class="flex-[2] bg-white dark:bg-slate-900 rounded-xl shadow-lg p-5 border-2 border-slate-300 dark:border-slate-600">
          <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
            {{ $t('compteur.selector.title') }}
          </h3>

          <!-- Category Cards with Icons Below -->
          <div class="grid grid-cols-4 gap-2 mb-4">
            <button
              v-for="category in meterCategories"
              :key="category"
              @click="selectedCategory = selectedCategory === category ? null : category"
              :class="[
                'px-2 py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2',
                selectedCategory === category
                  ? 'text-white shadow-lg border-transparent'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              ]"
              :style="selectedCategory === category ? {
                background: `linear-gradient(135deg, ${getCategoryColor(category)} 0%, ${adjustBrightness(getCategoryColor(category), -15)} 100%)`
              } : {}"
              :title="$t('common.filter') + ': ' + category"
            >
              <!-- Category Icon -->
              <span class="material-symbols-outlined text-xl">{{ getCategoryIcon(category) }}</span>
              <!-- Category Label -->
              <span class="text-xs font-medium text-center leading-tight">{{ $t(getCategoryTranslationKey(category)) }}</span>
            </button>
          </div>

          <!-- Elements Selection (if meter has multiple elements) -->
          <div v-if="currentMeterData.elements && currentMeterData.elements.length > 1">
            <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
              {{ $t('puissance.selectElement') }}
            </p>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="element in currentMeterData.elements"
                :key="element"
                @click="selectedElement = element"
                :class="[
                  'px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-200',
                  selectedElement === element
                    ? 'text-white shadow-md border-2 border-transparent'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                ]"
                :style="selectedElement === element ? {
                  background: `linear-gradient(135deg, ${currentMeterData.color} 0%, ${adjustBrightness(currentMeterData.color, -15)} 100%)`
                } : {}"
              >
                {{ element }}
              </button>
            </div>
          </div>
        </div>

        <!-- Display Mode Card -->
        <div class="flex-[1] bg-white dark:bg-slate-900 rounded-xl shadow-lg p-5 border-2 border-slate-300 dark:border-slate-600">
          <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
            {{ $t('puissance.displayMode') }}
          </p>
          <div class="grid grid-cols-3 gap-2">
            <button
              @click="viewMode = 'overview'"
              :class="[
                'px-2 py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2',
                viewMode === 'overview'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md border-transparent'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              ]"
            >
              <span class="material-symbols-outlined text-xl">dashboard</span>
              <span class="text-xs font-medium text-center leading-tight">{{ $t('puissance.views.overview') }}</span>
            </button>
            <button
              @click="viewMode = 'charts'"
              :class="[
                'px-2 py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2',
                viewMode === 'charts'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md border-transparent'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              ]"
            >
              <span class="material-symbols-outlined text-xl">bar_chart</span>
              <span class="text-xs font-medium text-center leading-tight">{{ $t('puissance.views.charts') }}</span>
            </button>
            <button
              @click="viewMode = 'tables'"
              :class="[
                'px-2 py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-300 border-2',
                viewMode === 'tables'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md border-transparent'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
              ]"
            >
              <span class="material-symbols-outlined text-xl">table_chart</span>
              <span class="text-xs font-medium text-center leading-tight">{{ $t('puissance.views.tables') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!isMeterDataReady" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <p class="mt-4 text-slate-600 dark:text-slate-400">Loading meter data...</p>
      </div>
    </div>    <!-- Overview View: 2-Column Layout (Widgets Left, Charts Right) -->
    <div v-if="isMeterDataReady && viewMode === 'overview'" class="space-y-8 animate-fadeIn">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: KPI Cards (1 col) -->
        <div v-if="displayElements.kpis" class="lg:col-span-1 space-y-4">
            <div class="flex items-center gap-3 mb-4">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.metrics') }}</h2>
          </div>

          <!-- KPI Cards in Column -->
          <div class="space-y-3">
            <KPICard
              v-for="(kpiKey, idx) in visibleKpiKeys"
              :key="idx"
              :title="$t(`puissance.kpi.${kpiKey}`)"
              :value="(currentMeterData.kpiValues as Record<string, number>)[kpiKey]"
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
                class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
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
                  class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
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
                  class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
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

    <!-- Charts View: Full Width Charts -->
    <div v-else-if="isMeterDataReady && viewMode === 'charts'" class="space-y-8 animate-fadeIn">
      <!-- Monthly Chart -->
      <div>
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.yearlyOverview') }}</h2>
          </div>
          <button
            @click="showChartModal('monthly')"
            class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
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
              class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
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
              class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
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

    <!-- Tables View: Full Width Tables -->
    <div v-else-if="isMeterDataReady && viewMode === 'tables'" class="space-y-8 animate-fadeIn">
      <!-- Hourly Table -->
      <div>
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.hourlyData') }}</h2>
          </div>
          <button
            @click="showTableModal('hourly')"
            class="px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition border border-purple-200 dark:border-purple-800"
          >
            <span class="material-symbols-outlined inline text-lg align-text-bottom mr-1">zoom_in</span>
            {{ $t('common.viewDetails') }}
          </button>
        </div>
        <DataTable
          :title="$t('puissance.tables.hourlyPower', { meter: currentMeterData.name })"
          :realtime-label="$t('puissance.tables.realtimeLastDay')"
          :columns="[
            { key: 'timestamp', label: $t('puissance.tables.columns.timestamp'), format: 'default' },
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
              class="px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition border border-purple-200 dark:border-purple-800"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <DataTable
            :title="$t('puissance.tables.dailyTotal')"
            :realtime-label="$t('puissance.tables.realtimeMonth')"
            :columns="[
              { key: 'timestamp', label: $t('puissance.tables.columns.timestamp'), format: 'default' },
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
              class="px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition border border-purple-200 dark:border-purple-800"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <DataTable
            :title="$t('puissance.tables.dailyAverage')"
            :realtime-label="$t('puissance.tables.realtimeMonth')"
            :columns="[
              { key: 'timestamp', label: $t('puissance.tables.columns.timestamp'), format: 'default' },
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
      :is-open="tableModalOpen"
      :table-title="tableModalData.title"
      :meter-name="currentMeterData.name"
      :columns="tableModalData.columns"
      :hourly-data="currentMeterData.hourlyTableData"
      :daily-data="currentMeterData.dailyTableData"
      :monthly-data="currentMeterData.dailyAverageData"
      @close="tableModalOpen = false"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import KPICard from '@/components/puissance/KPICard.vue'
import BarChart from '@/components/puissance/BarChart.vue'
import DataTable from '@/components/puissance/DataTable.vue'
import ChartDetailModal from '@/components/puissance/ChartDetailModal.vue'
import TableDetailModal from '@/components/puissance/TableDetailModal.vue'
import { allMeters } from '@/data/puissanceData'
import { useMetersStore } from '@/stores/useMetersStore'

const { t } = useI18n()

// ✅ USE CENTRALIZED METER STORE
const metersStore = useMetersStore()
const { selectedMeterIds } = storeToRefs(metersStore)

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
})

// ✅ ALL AVAILABLE METERS FROM CENTRALIZED STORE
const meters = computed(() => metersStore.allMeters.map(meter => ({
  id: meter.id,
  name: meter.name,
  color: meter.color,
  icon: meter.icon,
  category: meter.category
})))

// Meter categories for filtering - Only display main 4 categories
const mainCategories: ('TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage')[] = ['TGBT', 'Compresseurs', 'Clim', 'Éclairage']
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
 * Map category name to static data key
 * Handles ID mismatch between centralized store and static puissanceData
 */
function getCategoryDataKey(category: string): string {
  const mapping: Record<string, string> = {
    'TGBT': 'tgbt',
    'Compresseurs': 'compressor',
    'Compresseur': 'compressor',
    'Clim': 'cooling',
    'Climatisation': 'cooling',
    'Éclairage': 'lighting',
    'Eclairage': 'lighting',
  }
  return mapping[category] || 'tgbt'
}

/**
 * Current meter data - safely resolves meter by category
 * Guards against undefined by:
 * 1. Finding the selected meter from store
 * 2. Mapping its category to static data key
 * 3. Returning valid meter data or fallback to TGBT
 */
const currentMeterData = computed(() => {
  // Find the currently selected meter from the store
  const selectedMeterObj = metersStore.allMeters.find(m => m.id === selectedMeter.value)

  // If no meter found, default to first available meter or TGBT
  if (!selectedMeterObj) {
    return allMeters.tgbt
  }

  // Map the meter's category to the static data key
  const dataKey = getCategoryDataKey(selectedMeterObj.category)

  // Return the corresponding meter data, fallback to TGBT if key not found
  return allMeters[dataKey] || allMeters.tgbt
})

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
    'Éclairage': '#f59e0b',       // Warm amber (more professional)
    'Eclairage': '#f59e0b',       // Warm amber (alternative spelling)
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
  let title = ''
  const columns = [
    { key: 'timestamp', label: t('puissance.tables.columns.timestamp'), format: 'default' as const },
    { key: 'power', label: t('puissance.tables.columns.power'), format: 'number' as const },
  ]

  switch (tableType) {
    case 'hourly':
      title = t('puissance.tables.hourlyPower', { meter: currentMeterData.value.name })
      break
    case 'daily':
      title = t('puissance.tables.dailyTotal')
      break
    case 'monthly':
      title = t('puissance.tables.dailyAverage')
      break
  }

  tableModalData.value = { title, columns }
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
