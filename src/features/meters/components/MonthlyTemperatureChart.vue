<template>
  <div class="w-full h-full">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"></div>
        <p class="text-slate-500 dark:text-slate-400">{{ $t('common.loading') }}</p>
      </div>
    </div>
    <div v-else-if="sensorsWithData.length === 0" class="flex items-center justify-center h-64">
      <div class="text-center text-slate-500 dark:text-slate-400">
        <span class="material-symbols-outlined text-4xl mb-2 block opacity-50">thermostat</span>
        <p>{{ $t('globalMeters.noTemperatureSensors', 'No temperature data available') }}</p>
      </div>
    </div>
    <div v-else class="w-full overflow-visible h-full flex flex-col">
      <!-- Sensor selector dropdown -->
      <div class="flex-shrink-0 mb-2 px-2">
        <select
          v-model="localSelectedSensorId"
          class="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-200"
        >
          <option v-for="sensor in availableSensors" :key="sensor.deviceUUID" :value="sensor.deviceUUID">
            {{ sensor.sensorLabel }}
          </option>
        </select>
      </div>

      <div class="flex-1 min-h-0">
        <LineChart :data="chartData" :options="chartOptions" />
      </div>
      <div class="mt-1 text-center text-xs text-slate-600 dark:text-slate-400 flex-shrink-0 flex items-center justify-center gap-2">
        <p>{{ $t('globalMeters.temperatureMonthlyInfo', 'Min/Max temperature over last 30 days') }}</p>
        <!-- Loading more indicator -->
        <div v-if="loadingMore" class="flex items-center gap-1">
          <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style="animation-delay: 0ms"></div>
          <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style="animation-delay: 150ms"></div>
          <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style="animation-delay: 300ms"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Line as LineChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ChartDataLabels)

const { t } = useI18n()

interface MonthlyDataPoint {
  timestamp: number
  readableDate: string
  min: number
  max: number
}

interface SensorData {
  deviceUUID: string
  sensorLabel: string
  sensorName: string
  data: MonthlyDataPoint[]
}

interface SensorOption {
  deviceUUID: string
  sensorLabel: string
}

const props = defineProps<{
  sensors: SensorData[]  // Currently loaded sensor data
  availableSensors: SensorOption[]  // All available sensors for dropdown
  loading: boolean
  loadingMore?: boolean  // True while fetching additional data after first response
  selectedSensorId?: string  // Controlled from parent
}>()

const emit = defineEmits<{
  sensorSelected: [sensorId: string]
}>()

const sensorsWithData = computed(() => {
  return props.sensors.filter(s => s.data && s.data.length > 0)
})

// Local selected sensor ID (synced with prop)
const localSelectedSensorId = ref<string>(props.selectedSensorId || '')

// Auto-select first sensor when available sensors load
watch(() => props.availableSensors, (newSensors) => {
  if (newSensors.length > 0 && !localSelectedSensorId.value) {
    const firstSensorId = newSensors[0].deviceUUID
    localSelectedSensorId.value = firstSensorId
    console.log('[MonthlyChart] Auto-selected first sensor:', firstSensorId)
    emit('sensorSelected', firstSensorId)
  }
}, { immediate: true })

// Sync with parent's selectedSensorId prop
watch(() => props.selectedSensorId, (newId) => {
  if (newId && newId !== localSelectedSensorId.value) {
    localSelectedSensorId.value = newId
  }
})

// Emit when user manually changes selection (but not on auto-selection)
const isManualChange = ref(false)
watch(localSelectedSensorId, (newId, oldId) => {
  if (newId && newId !== oldId) {
    // Only emit if this is a manual change from the dropdown
    // Auto-selection is handled by the availableSensors watch
    emit('sensorSelected', newId)
    console.log('[MonthlyChart] Sensor selection changed:', newId)
  }
})

// Get currently selected sensor data
const selectedSensor = computed(() => {
  return sensorsWithData.value.find(s => s.deviceUUID === localSelectedSensorId.value) || sensorsWithData.value[0]
})

// Color palette for min / max
const MIN_COLOR = '#6366f1'
const MAX_COLOR = '#ef4444'

const chartData = computed(() => {
  if (!selectedSensor.value || selectedSensor.value.data.length === 0) {
    return { labels: [], datasets: [] }
  }

  const sensor = selectedSensor.value
  const labels = sensor.data.map(p => p.readableDate)

  const datasets: any[] = [
    {
      label: 'Min',
      data: sensor.data.map(p => p.min),
      borderColor: MIN_COLOR,
      backgroundColor: `${MIN_COLOR}20`,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.3,
      fill: false,
    },
    {
      label: 'Max',
      data: sensor.data.map(p => p.max),
      borderColor: MAX_COLOR,
      backgroundColor: `${MAX_COLOR}20`,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.3,
      fill: false,
    }
  ]

  return { labels, datasets }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { bottom: 10 } },
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 8,
          font: { size: 11 }
        }
      },
      datalabels: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 13, weight: 'bold' as const },
        bodyFont: { size: 12 },
        padding: 12,
        callbacks: {
          title: (ctx: any) => {
            const sensorName = selectedSensor.value?.sensorLabel || ''
            const dateLabel = ctx[0]?.label || ''
            return [sensorName, dateLabel]
          },
          label: (ctx: any) => {
            const label = ctx.dataset.label || ''
            const value = ctx.parsed.y
            return `${label}: ${value.toFixed(1)}°C`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, minRotation: 45, autoSkip: true, maxTicksLimit: 15, font: { size: 9 } },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          callback: (v: any) => typeof v === 'number' ? v.toFixed(0) : v,
          font: { size: 9 },
          padding: 2,
        },
        suggestedMin: 10,
        suggestedMax: 35,
      },
    },
  }
})
</script>
