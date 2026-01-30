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
        <!-- Loading overlay -->
        <div v-if="isLoadingChart" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg z-10">
          <div class="flex flex-col items-center gap-3">
            <p class="text-sm text-slate-600 dark:text-slate-400 font-medium">{{ $t('common.loading') }}...</p>
          </div>
        </div>

        <!-- No data overlay -->
        <div v-else-if="hasNoData" class="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div class="flex flex-col items-center gap-3 text-center px-6">
            <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-5xl">query_stats</span>
            <p class="text-slate-900 dark:text-white font-semibold">{{ $t('dashboard.chart.noData.title') }}</p>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ $t('dashboard.chart.noData.description') }}</p>
          </div>
        </div>

        <canvas ref="chartRef" class="w-full"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chart, LineController, BarController, LinearScale, PointElement, LineElement, BarElement, CategoryScale, Tooltip, Legend, Filler } from 'chart.js'
import { getMeterColorByIndex } from '@/utils/meterColors'
import { useTelemetry, TELEMETRY_KEYS } from '@/composables/useTelemetry'
import { useApiData, useHybridMode, useMockData } from '@/config/dataMode'

Chart.register(LineController, BarController, LinearScale, PointElement, LineElement, BarElement, CategoryScale, Tooltip, Legend, Filler)

type ChartMode = 'energy' | 'temperature'
type PeriodValue = 'today' | 'yesterday' | '7days' | '30days'

interface Compteur {
  id: string
  name: string
  deviceUUID?: string
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

// Telemetry composable for real data
const { fetchChartData, loading: telemetryLoading } = useTelemetry()
const telemetryChartData = ref<any>(null)

// Disable telemetry calls in pure mock mode to avoid empty charts
const shouldUseTelemetry = computed(() => useApiData() && props.selectedCompteurs.some(c => !!c.deviceUUID))
const useTelemetryData = ref<boolean>(shouldUseTelemetry.value)
const isLoadingChart = ref(false)
const hasNoData = ref(false)

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
  props.selectedCompteurs.forEach((compteur, index) => {
    const baseValue = props.period === 'yesterday' ? compteur.yesterday : compteur.today

    // For energy, we show hourly/daily variation with index-based variation for differentiation
    if (props.period === 'today' || props.period === 'yesterday') {
      data[compteur.name] = Array.from(
        { length: dataLength },
        (_, i) => baseValue / 24 * (0.6 + Math.sin((i + index) / 8) * 0.3 + Math.random() * 0.1)
      )
    } else if (props.period === '7days') {
      data[compteur.name] = Array.from(
        { length: dataLength },
        (_, i) => baseValue * (0.8 + Math.sin((i + index) / 3) * 0.2 + Math.random() * 0.1)
      )
    } else {
      data[compteur.name] = Array.from(
        { length: dataLength },
        (_, i) => baseValue + Math.sin((i + index) / 10) * 100 + Math.random() * 50
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
  if (useTelemetryData.value) {
    loadTelemetryChartData()
  } else {
    renderChart()
  }
}, { immediate: false, flush: 'post' })

/**
 * Load real telemetry data for chart
 */
function fallbackToMockChart(reason: string) {
  console.info('[UnifiedChart] Falling back to mock chart data:', reason)
  useTelemetryData.value = false
  hasNoData.value = false
  isLoadingChart.value = false
  telemetryChartData.value = null
  renderChart()
}

async function loadTelemetryChartData() {
  // Skip telemetry entirely when we are in mock-only mode or no deviceUUID is available
  if (!shouldUseTelemetry.value) {
    fallbackToMockChart('telemetry disabled by data mode')
    return
  }

  const compteursWithUUID = props.selectedCompteurs.filter(c => c.deviceUUID)

  if (compteursWithUUID.length === 0) {
    if (useMockData() || useHybridMode()) {
      fallbackToMockChart('no compteurs expose deviceUUID')
      return
    }
    console.warn('[UnifiedChart] No compteurs with deviceUUID')
    hasNoData.value = true
    return
  }

  isLoadingChart.value = true
  hasNoData.value = false

  try {
    // Map period to API format
    const periodMap: Record<PeriodValue, '1h' | '6h' | '24h' | '7d' | '30d'> = {
      'today': '24h',
      'yesterday': '24h',
      '7days': '7d',
      '30days': '30d'
    }

    const apiPeriod = periodMap[props.period]

    // Determine keys based on mode and period
    let keys: string[]
    if (props.mode === 'energy') {
      // Use hourly energy delta for shorter periods, daily delta for 7d/30d
      keys = (apiPeriod === '7d' || apiPeriod === '30d')
        ? [...TELEMETRY_KEYS.ENERGY_DELTA_DAY]
        : [...TELEMETRY_KEYS.ENERGY_DELTA_HOUR]
    } else {
      keys = ['temperature']
    }

    // Fetch data for all compteurs in parallel
    const promises = compteursWithUUID.map(async (compteur, index) => {
      try {
        const data = await fetchChartData(
          compteur.deviceUUID!,
          apiPeriod,
          keys
        )
        return {
          compteur,
          data,
          colorIndex: index
        }
      } catch (err) {
        console.error(`[UnifiedChart] Failed to fetch data for ${compteur.name}:`, err)
        return null
      }
    })

    const results = (await Promise.all(promises)).filter(Boolean)

    if (results.length === 0) {
      console.warn('[UnifiedChart] No telemetry data available')
      if (useMockData() || useHybridMode()) {
        fallbackToMockChart('telemetry returned empty results')
        return
      }
      hasNoData.value = true
      isLoadingChart.value = false
      return
    }

    // Filter data to only include hourly boundaries for today/yesterday periods
    const shouldFilterHourly = (props.period === 'today' || props.period === 'yesterday')

    if (shouldFilterHourly && results[0]!.data.labels) {
      // Get timestamps from labels (assuming labels contain formatted time strings)
      // We need to filter based on actual data timestamps
      const firstDataset = results[0]!.data.datasets[0]
      if (firstDataset && firstDataset.data) {
        // Filter to only include data points at exact hour boundaries
        const hourlyIndices: number[] = []
        results[0]!.data.labels.forEach((label: string, index: number) => {
          // Check if label represents an exact hour (e.g., "14:00" not "14:18")
          // Match patterns like "14:00", "14h00", or just "14h"
          if (label.includes(':00') || /^\d{1,2}h$/.test(label) || label.endsWith('h00')) {
            hourlyIndices.push(index)
          }
        })

        console.log('[UnifiedChart] Filtering to hourly boundaries:', {
          originalCount: results[0]!.data.labels.length,
          filteredCount: hourlyIndices.length,
          originalLabels: results[0]!.data.labels,
          filteredLabels: hourlyIndices.map(i => results[0]!.data.labels[i])
        })

        // If we have hourly data, filter all results
        if (hourlyIndices.length > 0) {
          results.forEach(result => {
            if (result && result.data.labels && result.data.datasets) {
              // Filter labels
              result.data.labels = hourlyIndices.map(i => result.data.labels[i])

              // Filter all datasets
              result.data.datasets.forEach((dataset: any) => {
                if (dataset.data) {
                  dataset.data = hourlyIndices.map(i => dataset.data[i])
                }
              })
            }
          })
        }
      }
    }

    // Use first result's labels (all should have same timestamps)
    const labels = results[0]!.data.labels || []

    // Check if we have actual data
    const hasData = results.some(r => r!.data.datasets.some((ds: any) => ds.data.some((v: number) => v > 0)))

    if (!hasData || labels.length === 0) {
      console.warn('[UnifiedChart] API returned empty data')
      if (useMockData() || useHybridMode()) {
        fallbackToMockChart('telemetry payload missing data')
        return
      }
      hasNoData.value = true
      isLoadingChart.value = false
      return
    }

    // Build datasets from telemetry data
    const datasets = results.map((result) => {
      if (!result) return null
      const { compteur, data, colorIndex } = result
      const colorConfig = getMeterColorByIndex(colorIndex)

      // Get data for first key
      const dataValues = data.datasets[0]?.data || []
      console.log('dataValues for', compteur.name, dataValues);
      return {
        label: compteur.name,
        data: dataValues,
        backgroundColor: colorConfig.hex,
        borderColor: colorConfig.border,
        borderWidth: 2,
        borderRadius: 4
      }
    }).filter((ds): ds is NonNullable<typeof ds> => ds !== null)

    telemetryChartData.value = { labels, datasets }
    console.log('[UnifiedChart] Loaded telemetry chart data:', telemetryChartData.value)
    hasNoData.value = false
    renderTelemetryChart()
  } catch (error) {
    console.error('[UnifiedChart] Failed to load telemetry chart data:', error)
    if (useMockData() || useHybridMode()) {
      fallbackToMockChart('telemetry request failed')
    } else {
      hasNoData.value = true
    }
  } finally {
    isLoadingChart.value = false
  }
}

/**
 * Render chart with telemetry data
 */
function renderTelemetryChart() {
  if (!chartRef.value || !telemetryChartData.value) return

  const ctx = chartRef.value.getContext('2d')
  if (!ctx) return

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(ctx, {
    type: props.mode === 'energy' ? 'bar' : 'line',
    data: telemetryChartData.value,
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
              const unit = props.mode === 'energy' ? 'kWh' : '°C'
              return `${context.dataset.label}: ${typeof y === 'number' ? y.toFixed(1) : 0} ${unit}`
            }
          }
        },
        datalabels: {
          display: false
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
            color: isDarkMode.value ? '#cbd5e1' : '#64748b'
          },
          grid: {
            color: isDarkMode.value ? '#334155' : '#e2e8f0'
          }
        }
      }
    }
  })
}

onMounted(() => {
  if (useTelemetryData.value) {
    loadTelemetryChartData()
  } else {
    renderChart()
  }

  // Watch for dark mode changes (only re-render, no API call)
  const observer = new MutationObserver(() => {
    if (useTelemetryData.value && telemetryChartData.value) {
      renderTelemetryChart()
    } else {
      renderChart()
    }
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

// Toggle between telemetry and mock rendering when data mode or devices change
watch(shouldUseTelemetry, (shouldUse) => {
  useTelemetryData.value = shouldUse
  if (shouldUse) {
    loadTelemetryChartData()
  } else {
    fallbackToMockChart('telemetry disabled after data mode change')
  }
}, { immediate: true })

// Watch period and mode changes to refetch data
watch(() => [props.period, props.mode], () => {
  if (useTelemetryData.value) {
    loadTelemetryChartData()
  } else {
    renderChart()
  }
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
    // Build datasets dynamically from selected compteurs with distinct colors
    const datasets = props.selectedCompteurs.map((compteur, index) => {
      // Use shared color utility for consistent colors across dashboard
      const colorConfig = getMeterColorByIndex(index)

      const dataValues = data.data[compteur.name] || []
      console.log('dataValues for', compteur.name, dataValues);

      return {
        label: compteur.name,
        data: dataValues,
        backgroundColor: colorConfig.hex,
        borderColor: colorConfig.border,
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
