<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Energy Consumption</h3>
      <div class="text-xs text-gray-500 dark:text-gray-400">Today</div>
    </div>

    <div class="relative h-48">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div class="mt-4 text-center">
      <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ formattedValue }}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">kWh</p>
      <div class="flex items-center justify-center gap-2 mt-2">
        <span :class="trendClass">
          <svg v-if="trend > 0" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          {{ Math.abs(trend).toFixed(1) }}%
        </span>
        <span class="text-xs text-gray-400">vs yesterday</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

interface Props {
  value: number
  trend: number
  history: number[]
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  trend: 0,
  history: () => [],
})

const formattedValue = computed(() => props.value.toFixed(2))

const trendClass = computed(() => {
  if (props.trend > 0) return 'text-red-500 flex items-center'
  if (props.trend < 0) return 'text-green-500 flex items-center'
  return 'text-gray-500 flex items-center'
})

const chartData = computed(() => ({
  labels: props.history.map((_, i) => `${i}h`),
  datasets: [
    {
      label: 'kWh',
      data: props.history,
      borderColor: '#135bec',
      backgroundColor: 'rgba(19, 91, 236, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        color: '#9ca3af',
        font: {
          size: 10,
        },
      },
    },
    y: {
      display: true,
      grid: {
        color: 'rgba(156, 163, 175, 0.1)',
      },
      ticks: {
        color: '#9ca3af',
        font: {
          size: 10,
        },
      },
    },
  },
}
</script>
