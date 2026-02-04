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
        <p>{{ $t('globalMeters.yearlyEnergyConsumption') }} - Consommation Mensuelle</p>
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

interface ChartDataPoint {
  ts: number
  value: number
  accumulated?: number
  previousAccumulated?: number
  readableTime?: string
}

interface Meter {
  id: string
  name: string
  yearlyDataDifferential: ChartDataPoint[]
}

const props = defineProps<{
  meters: Meter[]
  loading: boolean
}>()

// Filter meters that have yearly data
const metersWithData = computed(() => {
  return props.meters.filter(m => m.yearlyDataDifferential && m.yearlyDataDifferential.length > 0)
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

// Extract all timestamps and labels for use in chart and tooltips
const chartTimestamps = computed(() => {
  if (metersWithData.value.length === 0) return []

  const allTimestamps = new Set<number>()
  metersWithData.value.forEach(meter => {
    meter.yearlyDataDifferential.forEach(point => {
      allTimestamps.add(point.ts)
    })
  })

  return Array.from(allTimestamps).sort((a, b) => a - b)
})

const monthLabels = computed(() => {
  return chartTimestamps.value.map(ts => {
    const date = new Date(ts)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  })
})

// Prepare chart data - display all monthly data points
const chartData = computed(() => {
  if (metersWithData.value.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const sortedTimestamps = chartTimestamps.value
  const labels = monthLabels.value

  // Create datasets for each meter
  const datasets = metersWithData.value.map((meter, index) => {
    const colors = getMeterColor(index)

    // Create a map of timestamp -> value for this meter
    const valueMap = new Map<number, number>()
    meter.yearlyDataDifferential.forEach(point => {
      // Store value (0 if null/undefined to display all months)
      valueMap.set(point.ts, point.value ?? 0)
    })

    // Map data to match all timestamps (0 if meter doesn't have data for that month)
    const data = sortedTimestamps.map(ts => valueMap.get(ts) ?? 0)

    return {
      label: meter.name,
      data: data,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      barThickness: 'flex' as const,
      maxBarThickness: 60,
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
    meter.yearlyDataDifferential.forEach(point => {
      if (point.value > max) max = point.value
    })
  })

  // Round up to nearest nice number
  if (max === 0) return 100000

  // Calculate appropriate rounding based on magnitude
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)))

  // For large values (100k+), round to nearest 100k or 500k
  if (max >= 100000) {
    const roundTo = magnitude >= 1000000 ? 500000 : 100000
    return Math.ceil(max / roundTo) * roundTo
  }

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
        top: 10,
        bottom: 5,
        left: 10,
        right: 10,
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
            // Display day and month in tooltip (e.g., "31 Oct")
            const index = context[0].dataIndex
            return monthLabels.value[index] || context[0].label
          },
          label: function(context) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            if (value === null || value === undefined) return `${label}: --`

            // Format large numbers with thousand separators
            const formattedValue = value.toLocaleString('fr-FR', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            })
            return `${label}: ${formattedValue} kWh`
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
          maxTicksLimit: 6,
          font: {
            size: 10,
            weight: 'normal'
          },
          color: 'rgba(71, 85, 105, 1)', // slate-600
        }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        grid: {
          color: 'rgba(203, 213, 225, 0.3)', // slate-300 with opacity
          drawTicks: false,
        },
        border: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
          callback: function(value) {
            const numValue = Number(value)
            // Use abbreviations for large numbers (e.g., 750k, 1.6M)
            if (numValue >= 1000000) {
              return (numValue / 1000000).toFixed(1) + 'M'
            }
            if (numValue >= 1000) {
              return (numValue / 1000).toFixed(0) + 'k'
            }
            return numValue.toFixed(0)
          },
          font: {
            size: 10
          },
          padding: 8,
          color: 'rgba(100, 116, 139, 1)', // slate-500
        },
        // Better scaling for large values
        suggestedMin: 0,
        suggestedMax: maxDataValue.value,
      }
    }
  }
})
</script>
