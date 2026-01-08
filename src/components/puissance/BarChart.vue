<template>
  <div class="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
      <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ title }}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ subtitle }}</p>
    </div>
    <!-- Chart Container -->
    <div class="p-6">
      <div style="position: relative; height: 320px;">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'

// Register all components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
)

interface Props {
  title: string
  subtitle: string
  labels: string[]
  data: number[]
  barColor: string
  tooltipLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  tooltipLabel: 'kW',
})

const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const initChart = () => {
  if (!chartRef.value) return

  // Destroy existing chart instance
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartRef.value.getContext('2d')
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
        borderColor: props.barColor,
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y
            return `${props.tooltipLabel}: ${(value || 0).toFixed(1)}`
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: textColor,
          font: { size: 11 },
          callback: (value) => `${value} ${props.tooltipLabel}`,
          stepSize: undefined,
        },
        grid: {
          color: gridColor,
        },
        beginAtZero: true,
      },
      x: {
        ticks: {
          color: textColor,
          font: { size: 11 },
        },
        grid: {
          display: false,
        },
      },
    },
  }

  chartInstance = new ChartJS(ctx, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [
        {
          label: props.subtitle,
          data: props.data,
          backgroundColor: props.barColor,
          borderRadius: 6,
          borderSkipped: false,
          hoverBackgroundColor: props.barColor,
        },
      ],
    },
    options: chartOptions,
  })
}

onMounted(() => {
  initChart()
})

watch(
  () => [props.labels, props.data, props.barColor],
  () => {
    initChart()
  },
  { deep: true }
)
</script>

<style scoped>
canvas {
  max-height: 320px;
}
</style>
