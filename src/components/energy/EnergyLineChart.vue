<template>
  <div class="bg-white rounded-lg shadow-sm border p-4">
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="font-semibold text-lg">{{ title }}</div>
        <div class="text-sm text-gray-500">{{ subtitle }}</div>
      </div>
      <div class="flex items-center gap-2">
        <button @click="$emit('zoom')" class="p-2 hover:bg-gray-100 rounded" title="Zoom">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/>
          </svg>
        </button>
        <button @click="$emit('reset')" class="p-2 hover:bg-gray-100 rounded" title="Reset">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
        <button @click="$emit('export')" class="p-2 hover:bg-gray-100 rounded" title="Export">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
        </button>
      </div>
    </div>

    <div style="height: 400px;">
      <canvas ref="chartRef"></canvas>
    </div>

    <div v-if="series.length > 0" class="mt-4 flex items-center gap-4 justify-center">
      <div v-for="(s, idx) in series" :key="idx" class="flex items-center gap-2">
        <div class="w-4 h-4 rounded" :style="{ backgroundColor: s.color }"></div>
        <span class="text-sm text-gray-700">{{ s.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, LineController, Filler, Tooltip, Legend)

interface SeriesData {
  label: string
  color: string
  data: number[]
  fill?: boolean | number
}

const props = defineProps<{
  title?: string
  subtitle?: string
  labels: string[]
  series: SeriesData[]
}>()

defineEmits<{
  zoom: []
  reset: []
  export: []
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: ChartJS | any = null

const initChart = () => {
  if (!chartRef.value) return
  if (chart) chart.destroy()

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  const datasets = props.series.map((s, idx) => ({
    label: s.label,
    data: s.data,
    borderColor: s.color,
    backgroundColor: s.fill !== false ? hexToRgba(s.color, 0.2) : 'transparent',
    fill: s.fill !== undefined ? s.fill : false,
    tension: 0.4,
    pointRadius: 3,
    pointHoverRadius: 5,
    borderWidth: 2
  }))

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          callback: (value) => `${value} kWh`
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context: any) => {
            const value = (context.parsed?.y) ?? 'N/A'
            const formatted = typeof value === 'number' ? value.toFixed(2) : value
            return `${context.dataset.label}: ${formatted} kWh`
          }
        }
      },
      datalabels: {
        display: false
      }
    }
  }

  chart = new ChartJS(ctx, {
    type: 'line' as any,
    data: {
      labels: props.labels,
      datasets
    },
    options
  })
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

onMounted(initChart)
watch(() => [props.labels, props.series], () => initChart(), { deep: true })
onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>
