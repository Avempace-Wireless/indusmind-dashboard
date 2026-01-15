<template>
  <AdminLayout>
    <!-- Page Header -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-700 pb-5">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ t('energyHistory.title') }}
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {{ t('energyHistory.subtitle') }}
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showCompteurSelector = true"
            class="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-white px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-100 transition-colors whitespace-nowrap shadow-sm"
          >
            <span class="material-symbols-outlined text-base">tune</span>
            {{ t('dashboard.manageMeters') }}
          </button>
          <button
            @click="exportToCSV"
            class="flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span class="material-symbols-outlined text-lg">file_download</span>
            {{ t('energyHistory.buttons.csv') }}
          </button>
          <button
            @click="exportToPDF"
            class="flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span class="material-symbols-outlined text-lg">picture_as_pdf</span>
            {{ t('energyHistory.buttons.pdf') }}
          </button>

        </div>
      </div>
    </div>

    <!-- Select Meters Card -->
    <div class="mb-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg p-5 border-2 border-slate-300 dark:border-slate-600">
      <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
        Select Meter to Analyze
      </h3>

      <!-- Primary Meter Selection -->
      <button
        @click="showCompteurSelector = true"
        class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium flex items-center gap-2 transition"
      >
        <span class="material-symbols-outlined">tune</span>
        {{ primaryMeter ? primaryMeter.name : 'Select Meter' }}
      </button>

      <!-- Optional: Show Comparison Meters -->
      <div v-if="comparisonMeters.length > 0" class="mt-4">
        <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Comparison Meters:</p>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="meter in comparisonMeters"
            :key="meter.id"
            class="px-3 py-1 rounded-full text-xs font-medium text-white"
            :style="{ backgroundColor: meter.color || '#3b82f6' }"
          >
            {{ meter.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- CompteurSelector Modal -->
    <CompteurSelector
      :is-open="showCompteurSelector"
      :all-compteurs="allCompteurs"
      :selected-ids="selectedMeterIds"
      @apply="handleCompteurSelection"
      @close="showCompteurSelector = false"
    />

    <!-- Selected Meters Display -->
    <div v-if="selectedMetersFromStore.length > 0" class="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-2xl" :style="{ color: getCategoryColor(currentCategory || 'TGBT') }">
            {{ getCategoryIcon(currentCategory || 'TGBT') }}
          </span>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ currentCategory ? $t(getCategoryTranslationKey(currentCategory)) : $t('common.allMeters') }}
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ selectedMetersFromStore.length }} {{ selectedMetersFromStore.length === 1 ? $t('common.meter') : $t('common.meters') }}
              <span v-if="selectedElement" class="ml-2">• {{ $t('puissance.element') }}: <span class="font-medium">{{ selectedElement }}</span></span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="px-3 py-1 rounded-full text-xs font-medium" :style="{
            backgroundColor: getCategoryColor(currentCategory || 'TGBT') + '20',
            color: getCategoryColor(currentCategory || 'TGBT')
          }">
            {{ selectedMetersFromStore.map(m => m.name).join(', ') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid: 70% Chart Area, 30% Controls -->
    <div class="grid grid-cols-1 xl:grid-cols-10 gap-6">
      <!-- Left Panel: Chart Area (70%) -->
        <div class="xl:col-span-7 space-y-6">

        <!-- View Mode Toggle (global) -->
        <div class="flex items-center justify-end">
          <div class="flex items-center rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button @click="viewMode = 'chart'" :class="['px-3 py-1.5 text-xs', viewMode === 'chart' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']">{{ t('energyHistory.viewMode.chart') }}</button>
            <button @click="viewMode = 'table'" :class="['px-3 py-1.5 text-xs', viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']">{{ t('energyHistory.viewMode.table') }}</button>
          </div>
        </div>

        <!-- Multi-Metric Chart -->
        <div v-show="viewMode === 'chart'" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('energyHistory.chart.title', { resolution: resolutionLabel }) }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ chartSubtitle }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="toggleChartType"
                class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                title="Toggle Chart Type"
              >
                <span class="material-symbols-outlined">{{ chartType === 'line' ? 'bar_chart' : 'show_chart' }}</span>
              </button>
            </div>
          </div>

          <!-- Chart Canvas -->
          <div class="relative" style="height: 400px;">
            <!-- Empty State -->
            <div v-if="!hasChartData" class="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <span class="material-symbols-outlined text-6xl mb-4 opacity-30">bar_chart</span>
              <p class="text-lg font-medium">{{ emptyStateMessage }}</p>
              <p class="text-sm mt-2">{{ t('energyHistory.emptyState.hint') }}</p>
            </div>
            <!-- Chart -->
            <canvas v-show="hasChartData" ref="chartCanvas"></canvas>
          </div>

          <!-- Chart Legend (Interactive) -->
          <div class="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              v-for="dataset in chartData.datasets"
              :key="dataset.label"
              @click="toggleDataset(dataset.label)"
              :class="[
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                hiddenDatasets.includes(dataset.label)
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              ]"
            >
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: dataset.borderColor }"></span>
              {{ dataset.label }}
            </button>
          </div>
        </div>

        <!-- Data Table -->
        <div v-show="viewMode === 'table'" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('energyHistory.table.title') }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ t(`energyHistory.table.subtitle.${effectiveResolution}`) }} • {{ t('energyHistory.table.entries', { count: pagedRows.length }) }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button @click="isTableZoomed = true" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" :title="t('energyHistory.table.zoomIn')">
                  <span class="material-symbols-outlined">zoom_in</span>
                </button>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800">
                    {{ t(`energyHistory.table.columns.${effectiveResolution === 'hourly' ? 'hour' : 'date'}`) }}
                  </th>
                   <template v-for="compteur in visibleCompteurs" :key="compteur.id">
                     <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                       {{ compteur.name }}
                     </th>
                   </template>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="row in pagedRows" :key="row.time" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900">
                    {{ row.time }}
                  </td>
                  <template v-for="compteur in visibleCompteurs" :key="compteur.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                      {{ formatCell(row[compteur.id]) }}
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ t('energyHistory.pagination.page', { current: currentPage, total: totalPages }) }} • {{ t('energyHistory.pagination.perPage', { count: itemsPerPage }) }}
            </div>
            <div class="flex items-center gap-2">
              <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50">{{ t('energyHistory.pagination.previous') }}</button>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50">{{ t('energyHistory.pagination.next') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Controls (30%) -->
      <div class="xl:col-span-3 space-y-6">
        <!-- Calendar Selector -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('energyHistory.calendar.title') }}</h3>
            <button
              @click="goToToday"
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {{ t('energyHistory.buttons.today') }}
            </button>
          </div>

          <!-- Period Presets -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">{{ t('energyHistory.calendar.periods.title') }}</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="selectLast7Days"
                :class="[
                  'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                  activePeriodPreset === 'last7Days'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                {{ t('energyHistory.calendar.periods.last7Days') }}
              </button>
              <button
                @click="selectLast30Days"
                :class="[
                  'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                  activePeriodPreset === 'last30Days'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                {{ t('energyHistory.calendar.periods.last30Days') }}
              </button>
              <button
                @click="selectThisMonth"
                :class="[
                  'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                  activePeriodPreset === 'thisMonth'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                {{ t('energyHistory.calendar.periods.thisMonth') }}
              </button>
              <button
                @click="selectLastMonth"
                :class="[
                  'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                  activePeriodPreset === 'lastMonth'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                {{ t('energyHistory.calendar.periods.lastMonth') }}
              </button>
            </div>
          </div>

           <!-- Selected Dates Range Info -->
          <div v-if="selectedDates.length > 0" class="mb-4 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div class="flex items-center justify-between">
              <div class="text-xs">
                <span class="font-semibold text-blue-900 dark:text-blue-100">
                  {{ t('energyHistory.calendar.daysSelected', { count: selectedDates.length }) }}
                </span>
                <div v-if="selectedDates.length > 1" class="text-blue-700 dark:text-blue-300 mt-1">
                  {{ selectedDates[0] }} → {{ selectedDates[selectedDates.length - 1] }}
                </div>
              </div>
              <button
                @click="goToToday"
                class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                {{ t('common.clear') }}
              </button>
            </div>
          </div>

          <!-- Month Navigation -->
          <div class="flex items-center justify-between mb-4">
            <button
              @click="prevMonth"
              class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <span class="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ monthLabel }}
            </span>
            <button
              @click="nextMonth"
              class="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <span class="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>

          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div
              v-for="day in weekDays"
              :key="day"
              class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
            >
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days -->
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="(day, index) in calendarDays"
              :key="index"
              @click="day.date && toggleDate(day.date)"
              @mousedown="day.date && startDrag(day.date)"
              @mouseover="isDragging && day.date && onDragOver(day.date)"
              @mouseup="endDrag"
              :disabled="!day.date"
              :class="[
                'aspect-square flex items-center justify-center text-xs rounded-md transition-all relative',
                day.isCurrentMonth
                  ? day.isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : day.isToday
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : day.isSelected
                  ? 'bg-blue-500 text-white font-medium'
                  : 'text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              ]"
            >
              {{ day.dateObj ? day.dateObj.getDate() : '' }}
              <span
                v-if="day.hasData"
                class="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-green-500"
              ></span>
            </button>
          </div>


        </div>

        <!-- Characteristics Filter (Meters Selection) -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('energyHistory.characteristics.title') }}</h3>
            <button @click="enableAllCompteurs" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">{{ t('energyHistory.buttons.selectAll') }}</button>
          </div>
          <div class="space-y-3">
            <label
              v-for="compteur in selectedCompteurs"
              :key="compteur.id"
              class="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                :checked="activeCompteurIds.includes(compteur.id) || activeCompteurIds.length === 0"
                @change="toggleCompteurActive(compteur.id)"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600"
              />
              <span class="flex items-center gap-2 flex-1">
                <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: getMeterColor(compteur.name) }"></span>
                <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {{ compteur.name }}
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
  <!-- Table Zoom Overlay -->
  <Teleport to="body">
    <div v-if="isTableZoomed" class="table-zoom-overlay" @click.self="isTableZoomed = false">
      <div class="table-zoom-content rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ t('energyHistory.table.fullscreen') }}</h3>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ t(`energyHistory.resolution.${effectiveResolution}`) }} • {{ t('energyHistory.table.entries', { count: tableData.length }) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="isTableZoomed = false" class="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">{{ t('common.close') }}</button>
        </div>
      </div>
      <div class="overflow-auto h-[calc(85vh-64px)]">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800">
                {{ t(`energyHistory.table.columns.${effectiveResolution === 'hourly' ? 'hour' : 'date'}`) }}
              </th>
              <template v-for="compteur in visibleCompteurs" :key="compteur.id">
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {{ compteur.name }}
                </th>
              </template>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="row in tableData" :key="row.time" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900">
                {{ row.time }}
              </td>
              <template v-for="compteur in visibleCompteurs" :key="compteur.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                  {{ formatCell(row[compteur.id]) }}
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, LineController, BarController } from 'chart.js'
import AdminLayout from '../components/layout/AdminLayout.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import { useEnergyHistoryStore } from '../stores/useEnergyHistoryStore'
import { useMetersStore } from '../stores/useMetersStore'
import { useDashboardStore } from '@/stores/useDashboardStore'
import { useCompteurSelection } from '@/composables/useCompteurSelection'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

// Register Chart.js components
Chart.register(LineController, BarController, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

// ===========================
// Store Integration
// ===========================
const { t, locale } = useI18n()
const store = useEnergyHistoryStore()
const metersStore = useMetersStore()
const dashboardStore = useDashboardStore()
const { selectedMeterIds } = storeToRefs(metersStore)

// Use the same composable as DashboardView and PuissanceView for consistency
const {
  availableCompteurs: allCompteurs,
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

// UI State for Meter Selection
const showCompteurSelector = ref(false)

// Handle meter selection from modal
function handleCompteurSelection(selectedIds: string[]) {
  metersStore.setSelectedMeters(selectedIds)
  showCompteurSelector.value = false
}

// Primary meter selection
const primaryMeter = computed(() => metersStore.selectedMeters[0] || null)

// Comparison meters (remaining selections after primary)
const comparisonMeters = computed(() => metersStore.selectedMeters.slice(1))

const {
  availableMetrics,
  selectedDates,
  currentMonth,
  activePeriodPreset,
  hourFrom,
  hourTo,
  photovoltaicEnabled,
  photovoltaicPercentage,
  enabledMetrics,
  primaryDate,
  effectiveResolution,
  resolutionLabel,
  calendarDays,
  chartData,
  metricCardsData,
  tableData,
  selectedCompteurs,
  visibleCompteurs,
  activeCompteurIds,
  selectedMetric,
} = storeToRefs(store)

const {
  toggleMetric,
  toggleDate,
  prevMonth,
  nextMonth,
  goToToday,
  selectLast7Days,
  selectLast30Days,
  selectThisMonth,
  selectLastMonth,
  setTimeRange,
  toggleCompteurActive,
  enableAllCompteurs,
  resetFilters,
  exportToCSV,
  exportToPDF,
  refreshData,
} = store

// ===========================
// Local State
// ===========================
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null
const chartType = ref<'line' | 'bar'>('line')

// Meter color mapping (dashboard theme)
const METER_COLORS: Record<string, string> = {
  'TGBT': '#ef4444',        // red-500
  'Compresseurs': '#10b981', // green-500
  'Clim': '#3b82f6',        // blue-500
  'Cooling': '#3b82f6',     // blue-500 (alias)
  'Éclairage': '#eab308',   // yellow-500
  'Eclairage': '#eab308',   // yellow-500 (alias)
  'Lighting': '#eab308',    // yellow-500 (alias)
}

function getMeterColor(meterName: string): string {
  return METER_COLORS[meterName] || '#3b82f6'
}

function formatCell(v: any) {
  // Handle if v is an object with a value property
  if (v && typeof v === 'object' && 'value' in v) {
    v = v.value
  }

  if (typeof v !== 'number' || isNaN(v)) return '-'

  const dp = selectedMetric.value.decimalPlaces
  return v.toFixed(dp)
}
const hiddenDatasets = ref<string[]>([])
const viewMode = ref<'chart' | 'table'>('chart')
const isTableZoomed = ref(false)
const itemsPerPage = ref(100)
const currentPage = ref(1)

const totalPages = computed(() => {
  const total = tableData.value.length
  return Math.max(1, Math.ceil(total / itemsPerPage.value))
})

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return tableData.value.slice(start, end)
})

function prevPage() {
  currentPage.value = Math.max(1, currentPage.value - 1)
}

function nextPage() {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
}

function resetTableZoom() {
  // Reset paging
  currentPage.value = 1
  itemsPerPage.value = effectiveResolution.value === 'hourly' ? 24 : Math.min(100, tableData.value.length)
}

// Calendar drag-to-select
const isDragging = ref(false)
const dragStart = ref<string | null>(null)

// ===========================
// Category Selection - Synced with Centralized Meter Selection
// ===========================

/**
 * Selected category for UI filtering
 * When changed, updates the centralized meter selection
 */
const selectedCategory = ref<string | null>(null)
const selectedElement = ref<string | null>(null)

/**
 * Available meter categories from centralized store
 */
const meterCategories = computed(() => {
  const categories = Array.from(new Set(metersStore.allMeters.map(m => m.category)))
  const order = ['TGBT', 'Compresseurs', 'Clim', 'Éclairage']
  return categories.sort((a, b) => order.indexOf(a) - order.indexOf(b)).slice(0, 4)
})

/**
 * Currently selected meters from centralized store
 * This is the SINGLE SOURCE OF TRUTH
 */
const selectedMetersFromStore = computed(() => metersStore.selectedMeters)

/**
 * Filtered meters based on category (for UI display only)
 * Does NOT affect data - data comes from selectedMetersFromStore
 */
const filteredMetersForDisplay = computed(() => {
  if (!selectedCategory.value) return metersStore.allMeters
  return metersStore.allMeters.filter(m => m.category === selectedCategory.value)
})

/**
 * Get current category from selected meters
 * Auto-detects category from actually selected meters
 */
const currentCategory = computed(() => {
  if (selectedMetersFromStore.value.length === 0) return null
  // Get category from first selected meter
  return selectedMetersFromStore.value[0]?.category || null
})

/**
 * Get elements for current meter (if any)
 * Used for element selection UI (e.g., TGBT L1/L2/L3)
 */
const currentMeterElements = computed(() => {
  const firstMeter = selectedMetersFromStore.value[0]
  if (firstMeter && (firstMeter as any).elements) {
    const elements = (firstMeter as any).elements
    // Extract element IDs or names (handle both string[] and MeterElement[])
    if (Array.isArray(elements) && elements.length > 0) {
      if (typeof elements[0] === 'string') {
        return elements // Already strings (element IDs/names)
      } else if (typeof elements[0] === 'object' && elements[0].id) {
        return elements.map((el: any) => el.id) // Extract IDs from MeterElement objects
      }
    }
  }
  return []
})

// Category Helper Functions
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'TGBT': '#ef4444',           // Red
    'Compresseurs': '#22c55e',    // Green
    'Clim': '#3b82f6',            // Blue
    'Éclairage': '#f59e0b',       // Amber
    'Eclairage': '#f59e0b'        // Amber (alternative spelling)
  }
  return colors[category] || '#6b7280'
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'TGBT': 'electrical_services',
    'Compresseurs': 'settings',
    'Clim': 'ac_unit',
    'Éclairage': 'lightbulb'
  }
  return icons[category] || 'power'
}

function getCategoryTranslationKey(category: string): string {
  const keys: Record<string, string> = {
    'TGBT': 'categories.tgbt',
    'Compresseurs': 'categories.compressors',
    'Clim': 'categories.cooling',
    'Éclairage': 'categories.lighting'
  }
  return keys[category] || category
}

function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount))
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount))
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// ===========================
// Watchers - Sync Category with Centralized Selection
// ===========================

/**
 * When category changes, update centralized meter selection
 * This ensures ALL views see the same selected meters
 */
watch(selectedCategory, (newCategory) => {
  if (!newCategory) {
    // If no category selected, clear meter selection
    metersStore.clearSelection()
    selectedElement.value = null
    return
  }

  // Get all meters in this category
  const categoryMeterIds = metersStore.allMeters
    .filter(m => m.category === newCategory)
    .map(m => m.id)

  // Update centralized selection
  if (categoryMeterIds.length > 0) {
    metersStore.setSelectedMeters(categoryMeterIds)
  }

  // Auto-select first element if available
  if (currentMeterElements.value.length > 0) {
    selectedElement.value = currentMeterElements.value[0]
  } else {
    selectedElement.value = null
  }
}, { flush: 'post' })

/**
 * Initialize category from currently selected meters
 * Runs once on mount to sync UI with existing selection
 */
watch(
  () => selectedMetersFromStore.value,
  (meters) => {
    if (meters.length > 0 && !selectedCategory.value) {
      // Set category to match first selected meter
      selectedCategory.value = meters[0].category
    }
  },
  { immediate: true }
)

/**
 * Sync activeCompteurIds when selectedCompteurs changes
 * This ensures charts update when meter selection changes
 */
watch(
  () => selectedCompteurs.value,
  async (newCompteurs) => {
    if (newCompteurs.length > 0) {
      // Wait for next tick to ensure computed values have updated
      await nextTick()
      // Update activeCompteurIds to match new selection
      activeCompteurIds.value = newCompteurs.map(c => c.id)
      // Refresh data to load new meter data
      await refreshData()
    }
  },
  { immediate: true }
)

// ===========================
// Computed Properties
// ===========================
const weekDays = computed(() => [
  t('energyHistory.calendar.weekdays.mon'),
  t('energyHistory.calendar.weekdays.tue'),
  t('energyHistory.calendar.weekdays.wed'),
  t('energyHistory.calendar.weekdays.thu'),
  t('energyHistory.calendar.weekdays.fri'),
  t('energyHistory.calendar.weekdays.sat'),
  t('energyHistory.calendar.weekdays.sun')
])

const monthLabel = computed(() => {
  const localeCode = locale.value === 'en' ? 'en-US' : 'fr-FR'
  const month = currentMonth.value.toLocaleDateString(localeCode, { month: 'long', year: 'numeric' })
  return month.charAt(0).toUpperCase() + month.slice(1)
})

const chartSubtitle = computed(() => {
  if (selectedDates.value.length === 0) return t('energyHistory.chart.subtitle.noData')
  if (selectedDates.value.length === 1) return t('energyHistory.chart.subtitle.singleDay', { date: selectedDates.value[0] })
  if (selectedDates.value.length <= 3) return t('energyHistory.chart.subtitle.multipleDays', { dates: selectedDates.value.join(' • ') })
  return t('energyHistory.chart.subtitle.daysCount', { count: selectedDates.value.length })
})

/**
 * Check if we have valid data to display
 * Prevents rendering empty charts
 */
const hasValidData = computed(() => {
  return visibleCompteurs.value.length > 0 &&
         selectedDates.value.length > 0 &&
         enabledMetrics.value.length > 0
})

/**
 * Check if chart has data to render
 */
const hasChartData = computed(() => {
  return hasValidData.value &&
         chartData.value.datasets.length > 0 &&
         chartData.value.labels.length > 0
})

/**
 * Get empty state message
 */
const emptyStateMessage = computed(() => {
  if (visibleCompteurs.value.length === 0) {
    return t('energyHistory.emptyState.noMeters')
  }
  if (selectedDates.value.length === 0) {
    return t('energyHistory.emptyState.noDates')
  }
  if (enabledMetrics.value.length === 0) {
    return t('energyHistory.emptyState.noMetrics')
  }
  return t('energyHistory.emptyState.noData')
})

// ===========================
// Chart Methods
// ===========================
function initChart() {
  if (!chartCanvas.value) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // Prepare datasets (filter hidden ones)
  const visibleDatasets = chartData.value.datasets
    .filter(ds => !hiddenDatasets.value.includes(ds.label))
    .map(ds => {
      const baseConfig = {
        label: ds.label,
        data: ds.data,
        borderColor: ds.borderColor,
        backgroundColor: ds.backgroundColor,
        yAxisID: ds.yAxisID,
        borderWidth: 2,
      }

      // For daily mode (multiple days), use bar chart by default for better visibility
      if (effectiveResolution.value === 'daily' && chartType.value === 'line') {
        return {
          ...baseConfig,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          type: 'line' as const,
        }
      }

      return {
        ...baseConfig,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        type: chartType.value,
      }
    })

  // Determine if we need dual Y-axes
  const hasLeftAxis = visibleDatasets.some(ds => ds.yAxisID === 'y')
  const hasRightAxis = visibleDatasets.some(ds => ds.yAxisID === 'y1')

  chartInstance = new Chart(ctx, {
    type: chartType.value,
    data: {
      labels: chartData.value.labels,
      datasets: visibleDatasets as any,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false, // Using custom legend
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              if (context.parsed.y !== null) {
                // Find metric for this dataset
                const metricMatch = enabledMetrics.value.find(m =>
                  context.dataset.label?.includes(m.name)
                )
                const unit = metricMatch?.unit || ''
                label += context.parsed.y.toFixed(2) + ' ' + unit
              }
              return label
            }
          }
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: '#6b7280',
          },
        },
        y: {
          display: hasLeftAxis,
          position: 'left',
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: '#6b7280',
          },
        },
        y1: {
          display: hasRightAxis,
          position: 'right',
          grid: {
            display: false,
          },
          ticks: {
            color: '#6b7280',
          },
        },
      },
    },
  })
}

function toggleDataset(label: string) {
  const index = hiddenDatasets.value.indexOf(label)
  if (index > -1) {
    hiddenDatasets.value.splice(index, 1)
  } else {
    hiddenDatasets.value.push(label)
  }
  initChart()
}

function zoomIn() {
  // Simple zoom: reduce hour range
  if (hourTo.value - hourFrom.value > 6) {
    const mid = Math.floor((hourFrom.value + hourTo.value) / 2)
    const range = Math.floor((hourTo.value - hourFrom.value) / 2)
    setTimeRange(Math.max(0, mid - range), Math.min(23, mid + range))
  }
}

function resetZoom() {
  setTimeRange(0, 23)
}

function toggleChartType() {
  chartType.value = chartType.value === 'line' ? 'bar' : 'line'
  initChart()
}

// ===========================
// Calendar Drag-to-Select
// ===========================
function startDrag(dateStr: string | null) {
  if (!dateStr) return
  isDragging.value = true
  dragStart.value = dateStr
}

function onDragOver(dateStr: string | null) {
  if (!isDragging.value || !dragStart.value || !dateStr) return

  // Get dates between start and current
  const draggedDates = getDatesBetween(dragStart.value, dateStr)

  // Merge with existing selections (preserve previous selections)
  const existingDates = selectedDates.value.filter(d => !draggedDates.includes(d))
  selectedDates.value = [...existingDates, ...draggedDates]
}

function endDrag() {
  isDragging.value = false
  dragStart.value = null
}

function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = []
  let startDate = new Date(start)
  let endDate = new Date(end)

  if (startDate > endDate) {
    ;[startDate, endDate] = [endDate, startDate]
  }

  const current = new Date(startDate)
  while (current <= endDate) {
    dates.push(store.formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

function removeDate(dateStr: string) {
  const index = selectedDates.value.indexOf(dateStr)
  if (index > -1) {
    selectedDates.value.splice(index, 1)
  }
}

// ===========================
// Lifecycle Hooks
// ===========================
onMounted(() => {
  // Restore and clean up any invalid meter IDs from localStorage
  metersStore.restoreSelection()

  // Initialize compteur selection (syncs with DashboardView and PuissanceView)
  initializeCompteurSelection()

  // Select all available meters
  metersStore.selectAllMeters()
  selectedCategory.value = null // No specific category filter

  // Initialize with today's date
  goToToday()

  // Initialize chart
  initChart()
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})

// ===========================
// Watchers
// ===========================
watch(
  () => chartData.value,
  () => {
    initChart()
  },
  { deep: true }
)

// Re-init chart when toggling back to chart view
watch(viewMode, (m) => {
  if (m === 'chart') {
    initChart()
  }
})

// Adjust table paging when resolution changes
watch(effectiveResolution, (res) => {
  currentPage.value = 1
  itemsPerPage.value = res === 'hourly' ? 24 : Math.min(100, tableData.value.length)
})

watch([hourFrom, hourTo], () => {
  // Validate range
  if (hourFrom.value > hourTo.value) {
    hourFrom.value = hourTo.value
  }
  // Refresh data when hour range changes
  refreshData()
})

// Refresh data when dates or enabled metrics change
watch([selectedDates, enabledMetrics], () => {
  refreshData()
}, { deep: true })
</script>

<style scoped>
.table-zoom-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 2rem;
}

.table-zoom-content {
  width: 95vw;
  max-width: 95vw;
  height: 85vh;
  max-height: 85vh;
  background: var(--color-bg, #fff);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
/* Add any component-specific styles here */
.sticky {
  position: sticky;
}

/* Smooth transitions */
button {
  transition: all 0.2s ease-in-out;
}

/* Custom scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Dark mode scrollbar */
@media (prefers-color-scheme: dark) {
  .overflow-x-auto::-webkit-scrollbar-track {
    background: #1f2937;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb {
    background: #4b5563;
  }

  .overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
}
</style>
