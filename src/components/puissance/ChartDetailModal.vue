<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="overlay">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 dark:bg-black/70 z-[100000] backdrop-blur-sm"
        @click="closeModal"
      />
    </Transition>

    <!-- Modal -->
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100001] flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-slate-700">
          <!-- Header -->
          <div class="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ dynamicChartTitle }}</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ dynamicSubtitle }}</p>
            </div>
            <button
              @click="closeModal"
              class="ml-4 p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition text-gray-600 dark:text-gray-400"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-8">
            <!-- Period Selector -->
            <div class="mb-4">
              <PeriodSelector
                :selected-period="selectedPeriod"
                :meter-color="meterColor"
                @period-change="onPeriodChange"
              />
            </div>

            <!-- Chart Container with Range Slider -->
            <div class="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 mb-4">
              <div style="position: relative; height: 400px;">
                <canvas ref="detailChartRef"></canvas>
              </div>

              <!-- Range Slider inside chart card -->
              <div class="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
                <RangeSlider
                  :model-value="{ start: xStart, end: xEnd }"
                  :max="Math.max(0, periodData.labels.length - 1)"
                  :thumb-color="meterColor"
                  @update:model-value="onRangeChange"
                />
              </div>
            </div>

            <!-- Statistics -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                <p class="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">{{ t('puissance.labels.average') }}</p>
                <p class="text-2xl font-bold mt-2" :style="{ color: meterColor }">{{ avgValue.toFixed(1) }} kW</p>
              </div>
              <div class="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                <p class="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">{{ t('puissance.labels.peak') }}</p>
                <p class="text-2xl font-bold mt-2" :style="{ color: meterColor }">{{ maxValue.toFixed(1) }} kW</p>
              </div>
              <div class="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                <p class="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">{{ t('puissance.labels.minimum') }}</p>
                <p class="text-2xl font-bold mt-2" :style="{ color: meterColor }">{{ minValue.toFixed(1) }} kW</p>
              </div>
              <div class="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                <p class="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold">{{ t('puissance.labels.total') }}</p>
                <p class="text-2xl font-bold mt-2" :style="{ color: meterColor }">{{ totalValue.toFixed(1) }} kWh</p>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-8 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3">
            <button
              @click="exportChart"
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              <span class="material-symbols-outlined inline mr-2 text-lg align-text-bottom">download</span>
              {{ t('common.export') }}
            </button>
            <button
              @click="closeModal"
              class="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:shadow-lg transition"
            >
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import Chart from 'chart.js/auto'
import PeriodSelector from './PeriodSelector.vue'
import RangeSlider from './RangeSlider.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, LineElement, LineController, PointElement, Title, Tooltip, Legend)

interface Props {
  isOpen: boolean
  chartTitle: string
  chartSubtitle: string
  meterName: string
  meterColor: string
  data: number[]
  labels: string[]
  hourlyData?: { labels: string[]; values: number[] }
  dailyData?: { labels: string[]; values: number[] }
  weeklyData?: { labels: string[]; values: number[] }
  monthlyData?: { labels: string[]; values: number[] }
  yearlyData?: { labels: string[]; values: number[] }
}


const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const selectedPeriod = ref<'hour' | 'day' | 'week' | 'month' | 'year'>('day')
const { t, locale } = useI18n()
const detailChartRef = ref<HTMLCanvasElement | null>(null)
let detailChartInstance: Chart | null = null

// X-axis range controls (indices)
const xStart = ref(0)
const xEnd = ref(0)

// Keep slider bounds in sync with incoming labels
watch(
  () => props.labels,
  (newLabels) => {
    const last = Math.max(0, newLabels.length - 1)
    xStart.value = 0
    xEnd.value = last
  },
  { immediate: true }
)

// Visible slices driven by slider and period selection
const visibleLabels = computed(() => {
  const labels = periodData.value.labels
  const start = Math.max(0, Math.min(xStart.value, labels.length - 1))
  const end = Math.max(start, Math.min(xEnd.value, labels.length - 1))
  return labels.slice(start, end + 1)
})

const visibleData = computed(() => {
  const data = periodData.value.values
  const start = Math.max(0, Math.min(xStart.value, data.length - 1))
  const end = Math.max(start, Math.min(xEnd.value, data.length - 1))
  return data.slice(start, end + 1)
})
const onRangeChange = (newRange: { start: number; end: number }) => {
  xStart.value = newRange.start
  xEnd.value = newRange.end
}

// Get data based on selected period
const periodData = computed(() => {
  switch (selectedPeriod.value) {
    case 'hour':
      return props.hourlyData || { labels: props.labels, values: props.data }
    case 'day':
      return props.dailyData || { labels: props.labels, values: props.data }
    case 'week':
      return props.weeklyData || props.dailyData || { labels: props.labels, values: props.data }
    case 'month':
      return props.monthlyData || { labels: props.labels, values: props.data }
    case 'year':
      return props.yearlyData || props.monthlyData || { labels: props.labels, values: props.data }
    default:
      return { labels: props.labels, values: props.data }
  }
})

// Dynamic chart title based on period (i18n)
const dynamicChartTitle = computed(() => {
  try {
    return t(`puissance.chartTitles.${selectedPeriod.value}`, { meter: props.meterName })
  } catch (e) {
    return props.chartTitle
  }
})

// Dynamic subtitle based on period (i18n)
const dynamicSubtitle = computed(() => {
  try {
    return t(`puissance.subtitles.${selectedPeriod.value}`)
  } catch (e) {
    return props.chartSubtitle
  }
})

const onPeriodChange = (period: 'hour' | 'day' | 'week' | 'month' | 'year') => {
  selectedPeriod.value = period
  // Reset slider to show full range of new period data
  xStart.value = 0
  xEnd.value = Math.max(0, periodData.value.labels.length - 1)
}

const closeModal = () => {
  emit('close')
}

const avgValue = computed(() => {
  const data = periodData.value.values
  if (data.length === 0) return 0
  return data.reduce((a, b) => a + b, 0) / data.length
})

const maxValue = computed(() => {
  const data = periodData.value.values
  return data.length === 0 ? 0 : Math.max(...data)
})

const minValue = computed(() => {
  const data = periodData.value.values
  return data.length === 0 ? 0 : Math.min(...data)
})


const totalValue = computed(() => {
  return props.data.reduce((a, b) => a + b, 0)
})

const initDetailChart = () => {
  if (!detailChartRef.value) return

  if (detailChartInstance) {
    detailChartInstance.destroy()
  }

  const ctx = detailChartRef.value.getContext('2d')
  if (!ctx) return

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#d1d5db' : '#374151'
  const gridColor = isDark ? '#334155' : '#e5e7eb'

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: textColor,
          font: { size: 12 },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: props.meterColor,
        borderWidth: 2,
        padding: 12,
        displayColors: true,
      },
    },
    scales: {
      y: {
        ticks: {
          color: textColor,
          font: { size: 11 },
          callback: (value) => `${value} kW`,
        },
        grid: {
          color: gridColor,
        },
        beginAtZero: true,
      },
      x: {
        ticks: {
          color: textColor,
          font: { size: 10 },
        },
        grid: {
          display: false,
        },
      },
    },
  }

  // Format labels to locale-aware month/day names when appropriate
  const dfMonth = new Intl.DateTimeFormat(locale.value, { month: 'short' })
  const dfDate = new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: 'short' })
  const formatLabel = (lbl: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(lbl)) {
      const d = new Date(lbl)
      return dfDate.format(d)
    }
    if (/^[A-Za-z]{3}$/.test(lbl)) {
      const monthIndex = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(lbl)
      if (monthIndex >= 0) return dfMonth.format(new Date(2020, monthIndex, 1))
    }
    return lbl
  }

  detailChartInstance = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels: visibleLabels.value.map(formatLabel),
      datasets: [
        {
          label: dynamicChartTitle.value,
          data: visibleData.value,
          backgroundColor: props.meterColor,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: props.meterColor,
        },
      ],
    },
    options: chartOptions,
  })
}

const exportChart = () => {
  if (!detailChartRef.value) return
  const link = document.createElement('a')
  link.href = (detailChartInstance?.canvas as any)?.toDataURL() || ''
  link.download = `${props.chartTitle}-${selectedPeriod.value}.png`
  link.click()
}

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        initDetailChart()
      }, 100)
    }
  }
)

watch(
  () => [props.labels, props.data],
  () => {
    initDetailChart()
  },
  { deep: true }
)

// Re-init chart when locale changes so axis labels update
watch(
  () => locale.value,
  () => {
    if (props.isOpen) initDetailChart()
  }
)

// Re-sync slider bounds when data changes
watch(
  () => props.labels.length,
  (newLen) => {
    if (newLen > 0) {
      xEnd.value = Math.max(0, newLen - 1)
      xStart.value = 0
    }
  }
)

// Update chart when slider changes without recreating
watch([xStart, xEnd], () => {
  if (!detailChartInstance) return
  detailChartInstance.data.labels = visibleLabels.value as any
  ;(detailChartInstance.data.datasets[0].data as any) = visibleData.value
  detailChartInstance.update('none')
})

// Update chart label when period changes
watch(
  () => selectedPeriod.value,
  () => {
    if (!detailChartInstance) return
    detailChartInstance.data.datasets[0].label = dynamicChartTitle.value
    detailChartInstance.data.labels = visibleLabels.value as any
    ;(detailChartInstance.data.datasets[0].data as any) = visibleData.value
    detailChartInstance.update('active')
  }
)
</script>

<style scoped>
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
