<template>
  <div class="flex flex-col rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
    <!-- Header with title, mode switch, and period selector -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-700">
      <div class="flex flex-col gap-1">
        <h2 class="text-slate-900 dark:text-white text-lg font-bold">{{ chartTitle }}</h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm">{{ subtitle }}</p>
      </div>

      <div class="flex items-center gap-4 flex-wrap">
        <!-- Mode Switch -->
        <div class="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
          <button
            v-for="m in modes"
            :key="m"
            @click="emit('update:mode', m)"
            :class="[
              'px-4 py-1.5 rounded text-xs font-medium transition-all',
              mode === m
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white'
            ]"
          >
            {{ m === 'energy' ? $t('dashboard.energy') : $t('dashboard.temperature') }}
          </button>
        </div>

        <!-- Period Selector -->
        <div class="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
          <button
            v-for="p in periods"
            :key="p.value"
            @click="emit('update:period', p.value)"
            :class="[
              'px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap',
              period === p.value
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white'
            ]"
          >
            {{ p.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Chart body -->
    <div class="p-6 flex flex-col gap-6">
      <!-- Current value header -->
      <div class="flex items-baseline gap-4 flex-wrap">
        <p class="text-slate-900 dark:text-white text-4xl font-bold font-mono tracking-tight">
          {{ currentValue }}
        </p>
        <span class="text-slate-500 dark:text-slate-400 text-sm font-medium">
          {{ mode === 'energy' ? $t('common.unit.kwh') : $t('common.unit.celsius') }}
        </span>
      </div>

      <!-- Canvas for Chart.js -->
      <div class="relative w-full h-80">
        <canvas ref="chartRef" class="w-full"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chart, LineController, BarController, LinearScale, PointElement, LineElement, BarElement, CategoryScale, Tooltip, Legend, Filler } from 'chart.js'

Chart.register(LineController, BarController, LinearScale, PointElement, LineElement, BarElement, CategoryScale, Tooltip, Legend, Filler)

type ChartMode = 'energy' | 'temperature'
type PeriodValue = 'today' | 'yesterday' | '7days' | '30days'

interface Compteur {
  id: string
  name: string
  category: string
  color: 'red' | 'green' | 'blue' | 'yellow'
  instantaneous: number
  today: number
  yesterday: number
}

interface Props {
  mode: ChartMode
  period: PeriodValue
  subtitle: string
  selectedCompteurs: Compteur[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:mode': [mode: ChartMode]
  'update:period': [period: PeriodValue]
}>()

const { t } = useI18n()

const modes: ChartMode[] = ['energy', 'temperature']

const periods = computed(() => [
  { value: 'today', label: t('dashboard.period.today') },
  { value: 'yesterday', label: t('dashboard.period.yesterday') },
  { value: '7days', label: t('dashboard.period.sevenDays') },
  { value: '30days', label: t('dashboard.period.thirtyDays') }
] as const)

const chartRef = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

// Detect dark mode
const isDarkMode = computed(() => {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark')
  }
  return false
})

// Chart title based on mode
const chartTitle = computed(() => {
  return props.mode === 'energy'
    ? t('dashboard.energy')
    : t('dashboard.temperature')
})

// Color mapping for compteur categories
const compteurColors = {
  'TGBT': { bg: '#ef4444', border: '#dc2626' },
  'Compresseurs': { bg: '#22c55e', border: '#16a34a' },
  'Clim': { bg: '#3b82f6', border: '#1d4ed8' },
  'Climatisation': { bg: '#3b82f6', border: '#1d4ed8' },
  'Éclairage': { bg: '#eab308', border: '#ca8a04' }
}

// Generate energy data based on selected compteurs
function generateEnergyData() {
  if (props.selectedCompteurs.length === 0) {
    // Return empty data if no compteurs selected
    const getLabels = () => {
      switch (props.period) {
        case 'today':
        case 'yesterday':
          return Array.from({ length: 24 }, (_, i) => `${i}h`)
        case '7days':
          return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
        case '30days':
          return Array.from({ length: 30 }, (_, i) => `J${i + 1}`)
        default:
          return []
      }
    }
    return {
      labels: getLabels(),
      data: {}
    }
  }

  // Get base values depending on period
  const getDataLength = (): number => {
    switch (props.period) {
      case 'today':
      case 'yesterday':
        return 24
      case '7days':
        return 7
      case '30days':
        return 30
      default:
        return 24
    }
  }

  const getLabels = (): string[] => {
    switch (props.period) {
      case 'today':
      case 'yesterday':
        return Array.from({ length: 24 }, (_, i) => `${i}h`)
      case '7days':
        return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      case '30days':
        return Array.from({ length: 30 }, (_, i) => `J${i + 1}`)
      default:
        return Array.from({ length: 24 }, (_, i) => `${i}h`)
    }
  }

  const dataLength = getDataLength()
  const labels = getLabels()
  const data: Record<string, number[]> = {}

  // Generate data for each selected compteur
  props.selectedCompteurs.forEach((compteur) => {
    const baseValue = props.period === 'yesterday' ? compteur.yesterday : compteur.today

    // For energy, we show hourly/daily variation
    if (props.period === 'today' || props.period === 'yesterday') {
      data[compteur.name] = Array.from(
        { length: dataLength },
        (_, i) => baseValue / 24 * (0.6 + Math.sin(i / 8) * 0.3 + Math.random() * 0.1)
      )
    } else if (props.period === '7days') {
      data[compteur.name] = Array.from(
        { length: dataLength },
        (_, i) => baseValue * (0.8 + Math.sin(i / 3) * 0.2 + Math.random() * 0.1)
      )
    } else {
      data[compteur.name] = Array.from(
        { length: dataLength },
        (_, i) => baseValue + Math.sin(i / 10) * 100 + Math.random() * 50
      )
    }
  })

  return { labels, data }
}

// Generate temperature data based on period
function generateTemperatureData() {
  const getLabels = (): string[] => {
    switch (props.period) {
      case 'today':
      case 'yesterday':
        return Array.from({ length: 24 }, (_, i) => `${i}h`)
      case '7days':
        return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
      case '30days':
        return Array.from({ length: 30 }, (_, i) => `J${i + 1}`)
      default:
        return Array.from({ length: 24 }, (_, i) => `${i}h`)
    }
  }

  const getDataLength = (): number => {
    switch (props.period) {
      case 'today':
      case 'yesterday':
        return 24
      case '7days':
        return 7
      case '30days':
        return 30
      default:
        return 24
    }
  }

  const dataLength = getDataLength()
  const labels = getLabels()

  // Generate temperature data based on period
  if (props.period === 'today' || props.period === 'yesterday') {
    return {
      labels,
      data: {
        zone6: Array.from({ length: 24 }, (_, i) => 48 + Math.sin(i / 8) * 2 + Math.random() * 0.5),
        zone4: Array.from({ length: 24 }, (_, i) => -17 + Math.sin(i / 8) * 1 + Math.random() * 0.3),
        zone1: Array.from({ length: 24 }, (_, i) => 56 + Math.sin(i / 8) * 1.5 + Math.random() * 0.4)
      }
    }
  } else if (props.period === '7days') {
    return {
      labels,
      data: {
        zone6: [48.6, 47.2, 49.1, 48.5, 47.8, 46.5, 45.2],
        zone4: [-17.2, -16.8, -17.5, -17.0, -16.5, -15.8, -15.2],
        zone1: [56.3, 55.8, 57.2, 56.5, 55.9, 54.2, 53.1]
      }
    }
  } else {
    return {
      labels,
      data: {
        zone6: Array.from({ length: 30 }, (_, i) => 48 + Math.sin(i / 10) * 2 + Math.random() * 1),
        zone4: Array.from({ length: 30 }, (_, i) => -17 + Math.sin(i / 10) * 1 + Math.random() * 0.5),
        zone1: Array.from({ length: 30 }, (_, i) => 56 + Math.sin(i / 10) * 1.5 + Math.random() * 0.8)
      }
    }
  }
}

// Data based on mode and period
const chartData = computed(() => {
  if (props.mode === 'energy') {
    return generateEnergyData()
  } else {
    return generateTemperatureData()
  }
})

const currentValue = computed(() => {
  if (props.mode === 'energy') {
    if (props.selectedCompteurs.length === 0) return '0.0'

    const total = props.selectedCompteurs.reduce((sum, c) => {
      return sum + (props.period === 'yesterday' ? c.yesterday : c.today)
    }, 0)
    return total.toFixed(1)
  } else {
    return '48.6'
  }
})

// Watch for mode or period changes to update chart
watch([() => props.mode, () => props.period, () => props.selectedCompteurs.length, () => props.selectedCompteurs.map(c => c.id).join(','), isDarkMode], () => {
  renderChart()
}, { immediate: false, flush: 'post' })

onMounted(() => {
  renderChart()

  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    renderChart()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

function renderChart() {
  if (!chartRef.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const data = chartData.value as any

  if (props.mode === 'energy') {
    // Build datasets dynamically from selected compteurs
    const datasets = props.selectedCompteurs.map((compteur) => {
      const colorMap = compteurColors[compteur.category as keyof typeof compteurColors] ||
                      compteurColors[compteur.name as keyof typeof compteurColors] ||
                      { bg: '#6b7280', border: '#4b5563' }

      const dataValues = data.data[compteur.name] || []

      return {
        label: compteur.name,
        data: dataValues,
        backgroundColor: colorMap.bg,
        borderColor: colorMap.border,
        borderWidth: 1,
        borderRadius: 4
      }
    })

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels || [],
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            onClick: (e: any, legendItem: any, legend: any) => {
              const index = legendItem.datasetIndex
              const chart = legend.chart
              const meta = chart.getDatasetMeta(index)
              meta.hidden = !meta.hidden
              chart.update()
            },
            labels: {
              usePointStyle: true,
              padding: 15,
              color: isDarkMode.value ? '#cbd5e1' : '#64748b'
            }
          },
          tooltip: {
            backgroundColor: isDarkMode.value ? '#1e293b' : '#334155',
            titleColor: '#f1f5f9',
            bodyColor: '#f1f5f9',
            borderColor: isDarkMode.value ? '#475569' : '#64748b',
            borderWidth: 1,
            callbacks: {
              label: (context: any) => {
                const y = context.parsed.y
                return `${context.dataset.label}: ${typeof y === 'number' ? y.toFixed(1) : 0} kWh`
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: isDarkMode.value ? '#cbd5e1' : '#64748b'
            },
            grid: {
              color: isDarkMode.value ? '#334155' : '#e2e8f0'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value: any) => `${value}`,
              color: isDarkMode.value ? '#cbd5e1' : '#64748b'
            },
            grid: {
              color: isDarkMode.value ? '#334155' : '#e2e8f0'
            }
          }
        }
      }
    } as any)
  } else {
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Zone 6 (ZAP2 SLS)',
            data: data.data.zone6,
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#f97316'
          },
          {
            label: 'Zone 4 (ZAP2 EM)',
            data: data.data.zone4,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#06b6d4'
          },
          {
            label: 'Zone 1 (ZAP 1&3)',
            data: data.data.zone1,
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#a855f7'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            onClick: (e: any, legendItem: any, legend: any) => {
              const index = legendItem.datasetIndex
              const chart = legend.chart
              const meta = chart.getDatasetMeta(index)
              meta.hidden = !meta.hidden
              chart.update()
            },
            labels: {
              usePointStyle: true,
              padding: 15,
              color: isDarkMode.value ? '#cbd5e1' : '#64748b'
            }
          },
          tooltip: {
            backgroundColor: isDarkMode.value ? '#1e293b' : '#334155',
            titleColor: '#f1f5f9',
            bodyColor: '#f1f5f9',
            borderColor: isDarkMode.value ? '#475569' : '#64748b',
            borderWidth: 1,
            callbacks: {
              label: (context: any) => {
                const y = context.parsed.y
                return `${context.dataset.label}: ${typeof y === 'number' ? y.toFixed(1) : 0} °C`
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: isDarkMode.value ? '#cbd5e1' : '#64748b'
            },
            grid: {
              color: isDarkMode.value ? '#334155' : '#e2e8f0'
            }
          },
          y: {
            ticks: {
              callback: (value: any) => `${value}°C`,
              color: isDarkMode.value ? '#cbd5e1' : '#64748b'
            },
            grid: {
              color: isDarkMode.value ? '#334155' : '#e2e8f0'
            }
          }
        }
      }
    } as any)
  }
}
</script>
