<template>
  <div class="flex flex-col rounded-xl bg-white dark:bg-[#1c2534] border border-gray-200 dark:border-[#2a3649]">
    <!-- Header with title and time range selector -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-gray-200 dark:border-[#2a3649]">
      <div class="flex flex-col gap-1">
        <h2 class="text-gray-900 dark:text-white text-lg font-bold">{{ title }}</h2>
        <p class="text-gray-600 dark:text-text-muted text-sm">{{ subtitle }}</p>
      </div>

      <!-- Time Range Selector -->
      <div class="flex bg-gray-100 dark:bg-[#111722] rounded-lg p-1 border border-gray-200 dark:border-[#2a3649]">
        <button
          v-for="range in timeRanges"
          :key="range"
          @click="selectedTimeRange = range"
          :class="[
            'px-3 py-1 rounded text-xs font-medium transition-all',
            selectedTimeRange === range
              ? 'bg-white dark:bg-[#232f48] text-primary-600 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-text-muted hover:text-primary-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#232f48]'
          ]"
        >
          {{ range }}
        </button>
      </div>
    </div>

    <!-- Chart body -->
    <div class="p-6 flex flex-col gap-6">
      <!-- Current value header -->
      <div class="flex items-baseline gap-4 flex-wrap">
        <p class="text-gray-900 dark:text-white text-4xl font-bold font-mono tracking-tight">{{ currentValue }}</p>
        <span v-if="showPeakInfo" class="text-green-500 text-sm font-medium flex items-center gap-1">
          <span class="material-symbols-outlined text-sm">arrow_upward</span>
          Peak: {{ peakValue }}
        </span>
      </div>

      <!-- Canvas for Chart.js -->
      <div class="relative w-full h-64">
        <canvas ref="chartRef" class="w-full"></canvas>
      </div>

      <!-- X-axis labels -->
      <div class="flex justify-between text-xs font-mono text-gray-600 dark:text-text-muted">
        <span v-for="(label, index) in xAxisLabels" :key="index">{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Chart, LineController, LinearScale, PointElement, LineElement, CategoryScale, Tooltip, Filler } from 'chart.js'

Chart.register(LineController, LinearScale, PointElement, LineElement, CategoryScale, Tooltip, Filler)

interface Props {
  title: string
  subtitle: string
  currentValue: string
  peakValue: string
  showPeakInfo?: boolean
  data: number[]
  labels: string[]
}

const props = withDefaults(defineProps<Props>(), {
  showPeakInfo: true
})

const chartRef = ref<HTMLCanvasElement>()
const selectedTimeRange = ref('1h')
const timeRanges = ['15m', '1h', '24h', '7j']

// Use props labels for x-axis, fallback to default if not provided
const xAxisLabels = computed(() => props.labels && props.labels.length > 0 ? props.labels : [])

onMounted(() => {
  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: xAxisLabels.value,
      datasets: [
        {
          label: 'Consumption',
          data: props.data,
          borderColor: '#135bec',
          backgroundColor: 'rgba(19, 91, 236, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointBackgroundColor: '#135bec',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#135bec',
          borderWidth: 1,
          cornerRadius: 4,
          padding: 8,
          titleColor: '#ffffff',
          bodyColor: '#ffffff'
        },
        datalabels: {
          display: false
        }
      },
      scales: {
        x: {
          display: false,
          grid: {
            display: false
          }
        },
        y: {
          display: false,
          grid: {
            color: '#2a3649',
            display: false
          }
        }
      }
    }
  })
})
</script>
