<template>
  <div class="w-full h-full">
    <div v-if="loading" class="flex items-center justify-center h-full">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-3"></div>
        <p class="text-slate-500 dark:text-slate-400">{{ $t('common.loading') }}</p>
      </div>
    </div>
    <div v-else-if="meters.length === 0" class="flex items-center justify-center h-full">
      <div class="text-center text-slate-500 dark:text-slate-400">
        <span class="material-symbols-outlined text-4xl mb-2 block opacity-50">bar_chart</span>
        <p>{{ $t('globalMeters.selectMetersToVisualize') }}</p>
      </div>
    </div>
    <div v-else class="w-full overflow-visible h-full flex flex-col">
      <!-- Chart.js Chart -->
      <div class="flex-1 min-h-0">
        <BarChart v-if="chartType === 'bar'" :data="chartData" :options="chartOptions" />
        <LineChart v-else :data="lineChartData" :options="lineChartOptions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar as BarChart, Line as LineChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { getMeterColorByName } from '@/utils/meterColors'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler, ChartDataLabels)

interface ChartDataPoint {
  ts: number
  value: number
}

interface Meter {
  id: string
  name: string
  hourlyDataDifferential: ChartDataPoint[]
}

const props = defineProps<{
  meters: Meter[]
  loading: boolean
  chartType?: 'bar' | 'line'
}>()

// Default chart type to bar
const chartType = computed(() => props.chartType || 'bar')

// Filter meters that have hourly data
const metersWithData = computed(() => {
  return props.meters.filter(m => m.hourlyDataDifferential && m.hourlyDataDifferential.length > 0)
})

// Color palette for meters
const getMeterColor = (index: number, name?: string) => {
  const color = getMeterColorByName(name, index)
  return {
    bg: `${color.hex}B3`,
    border: color.hex,
  }
}

// Extract all timestamps and labels for use in chart and tooltips
// Normalize timestamps to the hour level to avoid duplicates
const chartTimestamps = computed(() => {
  if (metersWithData.value.length === 0) return []

  const hourTimestamps = new Set<number>()
  metersWithData.value.forEach(meter => {
    meter.hourlyDataDifferential.forEach(point => {
      // Normalize to the start of the hour
      const date = new Date(point.ts)
      date.setMinutes(0, 0, 0)
      hourTimestamps.add(date.getTime())
    })
  })

  return Array.from(hourTimestamps).sort((a, b) => a - b)
})

const hourLabels = computed(() => {
  return chartTimestamps.value.map(ts => {
    const date = new Date(ts)
    const hours = date.getHours().toString().padStart(2, '0')
    return `${hours}h`
  })
})

// Prepare chart data - display all hourly data points
const chartData = computed(() => {
  if (metersWithData.value.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const sortedTimestamps = chartTimestamps.value
  const labels = hourLabels.value

  // Create datasets for each meter
  const datasets = metersWithData.value.map((meter, index) => {
    const colors = getMeterColor(index, meter.name)

    // Create a map of normalized timestamp -> value for this meter
    // Aggregate values that fall within the same hour
    const valueMap = new Map<number, number>()
    meter.hourlyDataDifferential.forEach(point => {
      // Normalize to the start of the hour
      const date = new Date(point.ts)
      date.setMinutes(0, 0, 0)
      const normalizedTs = date.getTime()

      // Aggregate values for the same hour (sum them)
      const existingValue = valueMap.get(normalizedTs) || 0
      valueMap.set(normalizedTs, existingValue + (point.value ?? 0))
    })

    // Map data to match all timestamps
    const data = sortedTimestamps.map(ts => valueMap.get(ts) ?? 0)

    return {
      label: meter.name,
      data: data,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
      barThickness: 'flex' as const,
      maxBarThickness: 30,
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
    meter.hourlyDataDifferential.forEach(point => {
      if (point.value > max) max = point.value
    })
  })

  if (max === 0) return 100

  // Round up to nearest nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)))
  const roundTo = magnitude >= 100 ? 100 : magnitude >= 10 ? 10 : 1
  return Math.ceil(max / roundTo) * roundTo
})

// Chart options
const chartOptions = computed<ChartOptions<'bar'>>(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 5,
        left: 5,
        right: 5,
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
      datalabels: {
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
            const index = context[0].dataIndex
            return hourLabels.value[index] || context[0].label
          },
          label: function(context) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            if (value === null || value === undefined) return `${label}: --`

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
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
          font: {
            size: 9,
            weight: 'normal'
          },
          color: 'rgba(71, 85, 105, 1)',
        }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        grid: {
          color: 'rgba(203, 213, 225, 0.3)',
          drawTicks: false,
        },
        border: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 5,
          callback: function(value) {
            const numValue = Number(value)
            if (numValue >= 1000) {
              return (numValue / 1000).toFixed(1) + 'k'
            }
            return numValue.toFixed(0)
          },
          font: {
            size: 9
          },
          padding: 4,
          color: 'rgba(100, 116, 139, 1)',
        },
        suggestedMin: 0,
        suggestedMax: maxDataValue.value,
      }
    }
  }
})

// Line chart data
const lineChartData = computed(() => {
  if (metersWithData.value.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const sortedTimestamps = chartTimestamps.value
  const labels = hourLabels.value

  const datasets = metersWithData.value.map((meter, index) => {
    const colors = getMeterColor(index, meter.name)

    // Create a map of normalized timestamp -> value for this meter
    // Aggregate values that fall within the same hour
    const valueMap = new Map<number, number>()
    meter.hourlyDataDifferential.forEach(point => {
      // Normalize to the start of the hour
      const date = new Date(point.ts)
      date.setMinutes(0, 0, 0)
      const normalizedTs = date.getTime()

      // Aggregate values for the same hour (sum them)
      const existingValue = valueMap.get(normalizedTs) || 0
      valueMap.set(normalizedTs, existingValue + (point.value ?? 0))
    })

    const data = sortedTimestamps.map(ts => valueMap.get(ts) ?? 0)

    return {
      label: meter.name,
      data: data,
      borderColor: colors.border,
      backgroundColor: colors.border,
      borderWidth: 2,
      fill: false,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBackgroundColor: colors.border,
    }
  })

  return {
    labels,
    datasets
  }
})

// Line chart options
const lineChartOptions = computed<ChartOptions<'line'>>(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 5,
        left: 5,
        right: 5,
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
      datalabels: {
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
            const index = context[0].dataIndex
            return hourLabels.value[index] || context[0].label
          },
          label: function(context) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            if (value === null || value === undefined) return `${label}: --`

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
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
          font: {
            size: 9,
            weight: 'normal'
          },
          color: 'rgba(71, 85, 105, 1)',
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(203, 213, 225, 0.3)',
          drawTicks: false,
        },
        border: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 5,
          callback: function(value) {
            const numValue = Number(value)
            if (numValue >= 1000) {
              return (numValue / 1000).toFixed(1) + 'k'
            }
            return numValue.toFixed(0)
          },
          font: {
            size: 9
          },
          padding: 4,
          color: 'rgba(100, 116, 139, 1)',
        },
        suggestedMin: 0,
        suggestedMax: maxDataValue.value,
      }
    }
  }
})
</script>
