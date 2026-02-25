<template>
  <div class="w-full h-full">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-3"></div>
        <p class="text-slate-500 dark:text-slate-400">{{ $t('common.loading') }}</p>
      </div>
    </div>
    <div v-else-if="sensorsWithData.length === 0" class="flex items-center justify-center h-64">
      <div class="text-center text-slate-500 dark:text-slate-400">
        <span class="material-symbols-outlined text-4xl mb-2 block opacity-50">thermostat</span>
        <p>{{ $t('globalMeters.noTemperatureSensors') || 'Aucun capteur de température disponible' }}</p>
      </div>
    </div>
    <div v-else class="w-full overflow-visible h-full flex flex-col">
      <!-- Chart.js Line Chart -->
      <div class="flex-1 min-h-0">
        <LineChart :data="chartData" :options="chartOptions" />
      </div>

      <!-- Chart Info -->
      <div class="mt-1 text-center text-xs text-slate-600 dark:text-slate-400 flex-shrink-0">
        <p>{{ $t('globalMeters.temperature24Hours') || 'Température sur 24 heures (Moyennes horaires)' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
import { getMeterColorByName } from '@/utils/meterColors'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ChartDataLabels)

const { t } = useI18n()

interface SensorData {
  deviceUUID: string
  sensorLabel: string
  sensorName: string
  data: Array<{
    timestamp: number
    value: number
    readableDate: string
  }>
}

const props = defineProps<{
  sensors: SensorData[]
  loading: boolean
  sensorColors?: Record<string, string>  // Map of deviceUUID -> color hex
}>()

// Filter sensors that have temperature data
const sensorsWithData = computed(() => {
  return props.sensors.filter(s => s.data && s.data.length > 0)
})

// Color palette for sensors - use passed colors or fall back to defaults
const DEFAULT_SENSOR_COLORS = [
  '#0891b2', // Cyan 600
  '#f59e0b', // Amber 500
  '#10b981', // Emerald 500
  '#3b82f6', // Blue 500
  '#8b5cf6', // Violet 500
  '#ec4899', // Pink 500
  '#14b8a6', // Teal 500
  '#6366f1'  // Indigo 500
]

const getSensorColor = (index: number, deviceUUID?: string, label?: string, name?: string) => {
  // If parent passed custom colors, use them for matching deviceUUID
  if (props.sensorColors && deviceUUID && props.sensorColors[deviceUUID]) {
    const hex = props.sensorColors[deviceUUID]
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    return {
      bg: hexToRgba(hex, 0.1),
      border: hex,
      point: hex
    }
  }

  // Fallback to default palette
  const hex = DEFAULT_SENSOR_COLORS[index % DEFAULT_SENSOR_COLORS.length]
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return {
    bg: hexToRgba(hex, 0.1),
    border: hex,
    point: hex
  }
}

// Prepare chart data
const chartData = computed(() => {
  if (sensorsWithData.value.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  // Use labels from first sensor with time formatting (HH:mm only, like ThermalManagementView charts)
  const labels = sensorsWithData.value[0].data.map(point => {
    // Use readableDate if available, otherwise format from timestamp
    if (point.readableDate) {
      return point.readableDate
    }
    const date = new Date(point.timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  })

  // Create datasets for each sensor
  const datasets = sensorsWithData.value.map((sensor, index) => {
    const colors = getSensorColor(index, sensor.deviceUUID, sensor.sensorLabel, sensor.sensorName)
    const data = sensor.data.map(point => point.value)

    return {
      label: sensor.sensorLabel,
      data: data,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      borderWidth: 2.5,
      tension: 0.4, // Smooth curves
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
      pointBackgroundColor: colors.point,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }
  })

  return {
    labels,
    datasets
  }
})

// Chart options
const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        bottom: 20,
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        callbacks: {
          title: function(context: any) {
            // Show full date and time in tooltip
            const dataIndex = context[0].dataIndex
            const sensor = sensorsWithData.value[0]
            if (sensor && sensor.data[dataIndex]) {
              const date = new Date(sensor.data[dataIndex].timestamp)
              const day = date.getDate().toString().padStart(2, '0')
              const month = (date.getMonth() + 1).toString().padStart(2, '0')
              const year = date.getFullYear()
              const hours = date.getHours().toString().padStart(2, '0')
              const minutes = date.getMinutes().toString().padStart(2, '0')
              return `${day}/${month}/${year} à ${hours}:${minutes}`
            }
            return context[0].label
          },
          label: function(context: any) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${label}: ${value.toFixed(1)}°C`
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 12,
          font: {
            size: 9
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            if (typeof value === 'number') {
              return value.toFixed(0)
            }
            return value
          },
          font: {
            size: 9
          },
          padding: 2,
        },
        suggestedMin: 15,
        suggestedMax: 30,
      }
    }
  }
})
</script>
