<template>
  <div class="w-full h-full">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-3"></div>
        <p class="text-slate-500 dark:text-slate-400">{{ $t('common.loading') }}</p>
      </div>
    </div>
    <div v-else-if="meters.length === 0" class="flex items-center justify-center h-64">
      <div class="text-center text-slate-500 dark:text-slate-400">
        <span class="material-symbols-outlined text-4xl mb-2 block opacity-50">bar_chart</span>
        <p>{{ $t('globalMeters.selectMetersToVisualize') }}</p>
      </div>
    </div>
    <div v-else class="w-full overflow-visible h-full flex flex-col">
      <!-- Chart.js Bar Chart -->
      <div class="flex-1 min-h-0">
        <BarChart :data="chartData" :options="chartOptions" />
      </div>

      <!-- Chart Info -->
      <div class="mt-1 text-center text-xs text-slate-600 dark:text-slate-400 flex-shrink-0">
        <p>{{ $t('globalMeters.yearlyEnergyConsumption') }} ({{ $t('globalMeters.dailyAverage') }})</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar as BarChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ChartDataPoint {
  ts: number
  value: number
}

interface Meter {
  id: string
  name: string
  yearlyData: ChartDataPoint[]
}

const props = defineProps<{
  meters: Meter[]
  loading: boolean
}>()

// Filter meters that have yearly data
const metersWithData = computed(() => {
  return props.meters.filter(m => m.yearlyData && m.yearlyData.length > 0)
})

// Color palette for meters
const getMeterColor = (index: number) => {
  const colors = [
    { bg: 'rgba(16, 185, 129, 0.7)', border: 'rgba(16, 185, 129, 1)' }, // green
    { bg: 'rgba(59, 130, 246, 0.7)', border: 'rgba(59, 130, 246, 1)' }, // blue
    { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgba(239, 68, 68, 1)' },   // red
    { bg: 'rgba(245, 158, 11, 0.7)', border: 'rgba(245, 158, 11, 1)' }, // orange
    { bg: 'rgba(139, 92, 246, 0.7)', border: 'rgba(139, 92, 246, 1)' }, // purple
    { bg: 'rgba(236, 72, 153, 0.7)', border: 'rgba(236, 72, 153, 1)' }, // pink
  ]
  return colors[index % colors.length]
}

// Prepare chart data - use last 90 days for better visibility
const chartData = computed(() => {
  if (metersWithData.value.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  // Get the longest dataset to determine labels
  const maxDataLength = Math.max(...metersWithData.value.map(m => m.yearlyData.length))
  const displayPoints = Math.min(90, maxDataLength) // Show last 90 days for better readability

  // Generate labels from timestamps (take from first meter)
  const firstMeter = metersWithData.value[0]
  const labels = firstMeter.yearlyData
    .slice(-displayPoints)
    .map(point => {
      const date = new Date(point.ts)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    })

  // Create datasets for each meter
  const datasets = metersWithData.value.map((meter, index) => {
    const colors = getMeterColor(index)
    const data = meter.yearlyData.slice(-displayPoints).map(point => point.value)

    return {
      label: meter.name,
      data: data,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
    }
  })

  return {
    labels,
    datasets
  }
})

// Calculate max value from data and round to nice number
const maxDataValue = computed(() => {
  let max = 0
  metersWithData.value.forEach(meter => {
    const displayPoints = Math.min(90, meter.yearlyData.length)
    meter.yearlyData.slice(-displayPoints).forEach(point => {
      if (point.value > max) max = point.value
    })
  })

  // Round up to nearest nice number
  if (max === 0) return 100

  // Calculate appropriate rounding based on magnitude
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)))
  const roundTo = magnitude >= 1000 ? 5000 : magnitude >= 100 ? 1000 : magnitude >= 10 ? 100 : 10

  return Math.ceil(max / roundTo) * roundTo
})

// Chart options with better scaling
const chartOptions = computed<ChartOptions<'bar'>>(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        bottom: 20,
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 12,
        callbacks: {
          title: function(context) {
            // Get the data point index
            const index = context[0].dataIndex
            const firstMeter = metersWithData.value[0]
            if (firstMeter && firstMeter.yearlyData[index]) {
              const displayPoints = Math.min(90, firstMeter.yearlyData.length)
              const dataPoint = firstMeter.yearlyData.slice(-displayPoints)[index]
              const date = new Date(dataPoint.ts)
              // Format as DD/MM/YYYY
              const day = date.getDate().toString().padStart(2, '0')
              const month = (date.getMonth() + 1).toString().padStart(2, '0')
              const year = date.getFullYear()
              return `${day}/${month}/${year}`
            }
            return context[0].label
          },
          label: function(context) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            if (value === null || value === undefined) return `${label}: --`
            return `${label}: ${value.toFixed(2)} kWh`
          }
        }
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 20,
          font: {
            size: 9
          },
          callback: function(value, index, values) {
            const label = this.getLabelForValue(Number(value))
            // Show every 4th label to avoid crowding
            if (index % 4 === 0) {
              return label
            }
            return ''
          }
        }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          maxTicksLimit: 6,
          stepSize: 5000,
          callback: function(value) {
            const numValue = Number(value)
            // Use abbreviations for large numbers
            if (numValue >= 1000) {
              return (numValue / 1000).toFixed(0) + 'k'
            }
            return numValue.toFixed(0)
          },
          font: {
            size: 9
          },
          padding: 2,
        },
        // Better scaling for small values
        suggestedMin: 0,
        suggestedMax: maxDataValue.value,
      }
    }
  }
})
</script>
