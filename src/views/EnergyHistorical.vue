<template>
  <AdminLayout>
    <!-- Page Header -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-700 pb-5">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Énergie - Historique Multi-Métriques
          </h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Analysez, comparez et visualisez tout type de métriques de consommation ou de performance dans le temps
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="exportToCSV"
            class="flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span class="material-symbols-outlined text-lg">file_download</span>
            CSV
          </button>
          <button
            @click="exportToPDF"
            class="flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span class="material-symbols-outlined text-lg">picture_as_pdf</span>
            PDF
          </button>
          <button
            @click="resetFilters"
            class="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <span class="material-symbols-outlined text-lg">refresh</span>
            Réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Grid: 70% Chart Area, 30% Controls -->
    <div class="grid grid-cols-1 xl:grid-cols-10 gap-6">
      <!-- Left Panel: Chart Area (70%) -->
        <div class="xl:col-span-7 space-y-6">
        <!-- Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="card in metricCardsData"
            :key="card.metricId"
            class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: card.metricColor }"></span>
            </div>
            <div class="space-y-1">
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ card.metricName }}</p>
              <h4 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ card.primaryValue.toFixed(2) }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ card.unit }} • {{ card.primaryDate }}</p>
            </div>
          </div>
        </div>

        <!-- View Mode Toggle (global) -->
        <div class="flex items-center justify-end">
          <div class="flex items-center rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button @click="viewMode = 'chart'" :class="['px-3 py-1.5 text-xs', viewMode === 'chart' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']">Graphique</button>
            <button @click="viewMode = 'table'" :class="['px-3 py-1.5 text-xs', viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300']">Tableau</button>
          </div>
        </div>

        <!-- Multi-Metric Chart -->
        <div v-show="viewMode === 'chart'" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Analyse {{ resolutionLabel }} par compteur</h3>
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
            <canvas ref="chartCanvas"></canvas>
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
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Historique détaillé</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ effectiveResolution === 'hourly' ? 'Tableau horaire' : 'Tableau quotidien' }} • {{ pagedRows.length }} entrées affichées
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button @click="isTableZoomed = true" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" title="Zoom Tableau">
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
                    {{ effectiveResolution === 'hourly' ? 'Heure' : 'Date' }}
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
              Page {{ currentPage }} / {{ totalPages }} • {{ itemsPerPage }} par page
            </div>
            <div class="flex items-center gap-2">
              <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50">Précédent</button>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50">Suivant</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Controls (30%) -->
      <div class="xl:col-span-3 space-y-6">
        <!-- Calendar Selector -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Calendrier</h3>
            <button
              @click="goToToday"
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Aujourd'hui
            </button>
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
              @click="day.isCurrentMonth && day.date && toggleDate(day.date)"
              @mousedown="day.isCurrentMonth && day.date && startDrag(day.date)"
              @mouseover="day.isCurrentMonth && isDragging && day.date && onDragOver(day.date)"
              @mouseup="endDrag"
              :disabled="!day.isCurrentMonth"
              :class="[
                'aspect-square flex items-center justify-center text-xs rounded-md transition-all relative',
                day.isCurrentMonth
                  ? day.isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : day.isToday
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
              ]"
            >
              {{ day.dateObj ? day.dateObj.getDate() : '' }}
              <span
                v-if="day.hasData"
                class="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-green-500"
              ></span>
            </button>
          </div>

          <!-- Period Presets -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Sélectionner une période:</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                @click="selectLast7Days"
                class="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                7 derniers jours
              </button>
              <button
                @click="selectLast30Days"
                class="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                30 derniers jours
              </button>
              <button
                @click="selectThisMonth"
                class="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Ce mois
              </button>
              <button
                @click="selectLastMonth"
                class="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Mois dernier
              </button>
            </div>
          </div>
        </div>

        <!-- Characteristics Filter (Meters Selection) -->
        <div class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">Caractéristiques</h3>
            <button @click="enableAllCompteurs" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">Tout</button>
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
          <h3 class="text-base font-semibold text-gray-900 dark:text-white">Tableau en plein écran</h3>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ effectiveResolution === 'hourly' ? 'Horaire' : 'Quotidien' }} • {{ tableData.length }} entrées</p>
        </div>
        <div class="flex items-center gap-2">
          <button @click="isTableZoomed = false" class="px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">Fermer</button>
        </div>
      </div>
      <div class="overflow-auto h-[calc(85vh-64px)]">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800">
                {{ effectiveResolution === 'hourly' ? 'Heure' : 'Date' }}
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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, LineController, BarController } from 'chart.js'
import AdminLayout from '../components/layout/AdminLayout.vue'
import { useEnergyHistoryStore } from '../stores/useEnergyHistoryStore'
import { storeToRefs } from 'pinia'

// Register Chart.js components
Chart.register(LineController, BarController, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

// ===========================
// Store Integration
// ===========================
const store = useEnergyHistoryStore()
const {
  availableMetrics,
  selectedDates,
  currentMonth,
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

function formatCell(v: number | undefined) {
  if (typeof v !== 'number') return '-'
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
// Computed Properties
// ===========================
const weekDays = computed(() => ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'])

const monthLabel = computed(() => {
  const month = currentMonth.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return month.charAt(0).toUpperCase() + month.slice(1)
})

const chartSubtitle = computed(() => {
  if (selectedDates.value.length === 0) return 'Sélectionnez des dates pour afficher les données'
  if (selectedDates.value.length === 1) return `Analyse pour ${selectedDates.value[0]}`
  if (selectedDates.value.length <= 3) return `Analyse pour ${selectedDates.value.join(' • ')}`
  return `Analyse pour ${selectedDates.value.length} dates sélectionnées`
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
  const dates = getDatesBetween(dragStart.value, dateStr)
  selectedDates.value = dates
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
  // Initialize with today's date
  goToToday()

  // Initialize chart
  initChart()

  // Load initial data
  refreshData()
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
