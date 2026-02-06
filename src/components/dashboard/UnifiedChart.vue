<template>
  <div class="flex flex-col rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
    <!-- Header with title, mode switch, and period selector -->
    <div class="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-700">
      <div class="flex flex-col gap-1">
        <h2 class="text-slate-900 dark:text-white text-lg font-bold">{{ chartTitle }}</h2>
        <p class="text-slate-600 dark:text-slate-400 text-sm">{{ subtitle }}</p>
      </div>

      <div class="flex items-center gap-4 flex-wrap">
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
import { useTelemetryDynamic, TELEMETRY_KEYS } from '@/composables/useTelemetryDynamic'
import { useApiData, useHybridMode, useMockData } from '@/config/dataMode'
import { getTimeRange } from '@/config/telemetryConfig'

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
  isTemperatureApi?: boolean // If true, fetch real temperature data from API instead of mock
}

const props = withDefaults(defineProps<Props>(), {
  isTemperatureApi: false
})

const emit = defineEmits<{
  'update:period': [period: PeriodValue]
}>()

const { t } = useI18n()

// Telemetry composable for real data - use dynamic version with differential support
const { fetchAllDeviceDataUnified, fetchChartData, loading: telemetryLoading } = useTelemetryDynamic()
const telemetryChartData = ref<any>(null)

// Disable telemetry calls in pure mock mode to avoid empty charts
const shouldUseTelemetry = computed(() => useApiData() && props.selectedCompteurs.some(c => !!c.deviceUUID))
const useTelemetryData = ref<boolean>(shouldUseTelemetry.value)
const isLoadingChart = ref(false)
const hasNoData = ref(false)

const periods = computed(() => [
  { value: 'today', label: t('dashboard.period.today') },
  { value: 'yesterday', label: t('dashboard.period.yesterday') },
  { value: '7days', label: t('dashboard.period.sevenDays') }
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
    hasNoData.value = true
  }
}, { immediate: false, flush: 'post' })

/**
 * Load real telemetry data for chart
 */
function fallbackToMockChart(reason: string) {
  console.info('[UnifiedChart] No data available:', reason)
  useTelemetryData.value = false
  hasNoData.value = true
  isLoadingChart.value = false
  telemetryChartData.value = null
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
    const periodMap: Record<PeriodValue, 'today' | 'yesterday' | '7days' | '30days'> = {
      'today': 'today',
      'yesterday': 'yesterday',
      '7days': '7days',
      '30days': '30days'
    }

    const apiPeriod = periodMap[props.period]
    const { startTs, endTs } = getTimeRange(apiPeriod)

    // ========================================================================
    // OPTIMIZED: Use /chartBatch endpoint for chart data
    // Handles period-specific aggregation and differential calculation
    // ========================================================================
    console.log('[UnifiedChart] 🎯 Loading chart data for', compteursWithUUID.length, 'compteurs using /chartBatch')

    const { fetchChartBatch } = useTelemetryDynamic()

    // Build chart batch requests for all selected compteurs
    const chartBatchRequests = compteursWithUUID.map(compteur => ({
      deviceUUID: compteur.deviceUUID!,
      keys: ['AccumulatedActiveEnergyDelivered'],
      startTs,
      endTs,
      period: apiPeriod
    }))

    console.log('[UnifiedChart] Batch requests:', {
      count: chartBatchRequests.length,
      period: apiPeriod,
      timeRange: { start: new Date(startTs).toISOString(), end: new Date(endTs).toISOString() }
    })

    // Make ONE batch call for ALL compteurs with period-specific aggregation
    const chartResults = await fetchChartBatch(chartBatchRequests)

    console.log('[UnifiedChart] ✓ Received chart data for', chartResults.size, 'devices')

    // Log DETAILED API response for debugging data mismatch
    console.log('[UnifiedChart] 📊 DETAILED API RESPONSE:', {
      deviceCount: chartResults.size,
      devices: Array.from(chartResults.keys()),
      allDeviceData: Array.from(chartResults.entries()).map(([uuid, dataPoints]: any) => ({
        deviceUUID: uuid,
        pointCount: Array.isArray(dataPoints) ? dataPoints.length : 'not-array',
        allValues: Array.isArray(dataPoints) ? dataPoints.map((p: any) => p.value) : 'N/A',
        timestamps: Array.isArray(dataPoints) ? dataPoints.map((p: any) => new Date(p.ts).toLocaleString('fr-FR')) : 'N/A'
      }))
    })

    console.log('[UnifiedChart] Chart results (raw Map):', {
      deviceCount: chartResults.size,
      devices: Array.from(chartResults.keys()),
      firstDeviceData: chartResults.size > 0 ? chartResults.values().next().value?.slice(0, 3) : null
    })

    // Process results for chart display
    if (props.mode === 'energy') {
      const energyData: Record<string, number[]> = {}
      const timestampMap = new Map<number, string>() // Map ts -> formatted label
      const allTimestamps = new Set<number>()
      const deviceNameMap = new Map<string, string>() // Map deviceUUID -> compteur name

      // Build device UUID to compteur name mapping
      compteursWithUUID.forEach(compteur => {
        if (compteur.deviceUUID) {
          deviceNameMap.set(compteur.deviceUUID, compteur.name)
        }
      })

      console.log('[UnifiedChart] Device name mapping:', {
        count: deviceNameMap.size,
        mapping: Array.from(deviceNameMap.entries()).map(([uuid, name]) => `${uuid} -> ${name}`)
      })

      // First pass: collect all unique timestamps from all devices
      chartResults.forEach((dataPoints: any, deviceUUID: string) => {
        const compteurName = deviceNameMap.get(deviceUUID)
        console.log(`[UnifiedChart] Processing device ${deviceUUID} (${compteurName}):`, {
          dataPointsCount: Array.isArray(dataPoints) ? dataPoints.length : 'not an array',
          dataPoints: Array.isArray(dataPoints) ? dataPoints.slice(0, 2) : dataPoints
        })

        if (Array.isArray(dataPoints)) {
          dataPoints.forEach((point: any) => {
            if (point && point.ts) {
              allTimestamps.add(point.ts)
            }
          })
        }
      })

      // Sort all timestamps
      const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b)
      console.log('[UnifiedChart] Sorted timestamps:', {
        count: sortedTimestamps.length,
        samples: sortedTimestamps.slice(0, 3).map(ts => new Date(ts).toISOString())
      })

      // Generate labels from actual timestamps with date + time
      sortedTimestamps.forEach((ts: number) => {
        const date = new Date(ts)
        let label: string

        switch (props.period) {
          case 'today':
          case 'yesterday':
            // Format: "05/02 14:30" (date + time, hourly data)
            const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            const dateStr = date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
            label = `${dateStr} ${time}`
            break
          case '7days':
            // Format: "05/02 00:00" (date + time, daily data)
            const dailyDateStr = date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
            const dailyTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            label = `${dailyDateStr} ${dailyTime}`
            break
          case '30days':
            // Format: "05/02 00:00" (date + time, daily data)
            const monthDateStr = date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
            const monthTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            label = `${monthDateStr} ${monthTime}`
            break
          default:
            const defaultTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            const defaultDateStr = date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
            label = `${defaultDateStr} ${defaultTime}`
        }

        timestampMap.set(ts, label)
      })

      const labels = sortedTimestamps.map(ts => timestampMap.get(ts) || String(ts))

      console.log('[UnifiedChart] Labels generated:', {
        count: labels.length,
        samples: labels.slice(0, 3)
      })

      // Second pass: process each compteur's data in timestamp order
      chartResults.forEach((dataPoints: any, deviceUUID: string) => {
        const compteur = compteursWithUUID.find(c => c.deviceUUID === deviceUUID)
        const compteurName = compteur?.name || deviceNameMap.get(deviceUUID) || deviceUUID

        console.log(`[UnifiedChart] Processing device data for ${compteurName} (${deviceUUID}):`, {
          dataPointsType: typeof dataPoints,
          dataPointsIsArray: Array.isArray(dataPoints),
          dataPointsLength: Array.isArray(dataPoints) ? dataPoints.length : 'N/A',
          sampleData: Array.isArray(dataPoints) ? dataPoints.slice(0, 2) : dataPoints
        })

        if (!compteur || !Array.isArray(dataPoints)) {
          console.warn(`[UnifiedChart] Skipping device - compteur: ${compteur?.name || 'NOT FOUND'}, dataPoints is array: ${Array.isArray(dataPoints)}`)
          return
        }

        // Create a map of ts -> value for this compteur
        const dataByTs = new Map<number, number>()
        dataPoints.forEach((point: any) => {
          if (point && point.ts !== undefined && point.value !== undefined) {
            dataByTs.set(point.ts, typeof point.value === 'string' ? parseFloat(point.value) : point.value)
          }
        })

        console.log(`[UnifiedChart] Data map for ${compteur.name}:`, {
          mappedPoints: dataByTs.size,
          sampleMappings: Array.from(dataByTs.entries()).slice(0, 3).map(([ts, val]) => `${new Date(ts).toLocaleTimeString('fr-FR')}: ${val}`)
        })

        // Build data array aligned with sorted timestamps
        const consumptionValues = sortedTimestamps.map(ts => dataByTs.get(ts) ?? 0)

        if (consumptionValues.length > 0) {
          energyData[compteur.name] = consumptionValues
          console.log(`[UnifiedChart] ✓ Processed ${compteur.name}:`, {
            dataPoints: consumptionValues.length,
            nonZeroValues: consumptionValues.filter(v => v > 0).length,
            firstValues: consumptionValues.slice(0, 3),
            timestamps: sortedTimestamps.slice(0, 3).map(ts => new Date(ts).toLocaleString('fr-FR'))
          })
        } else {
          console.warn(`[UnifiedChart] No consumption values for ${compteur.name}`)
        }
      })

      // Update chart data
      telemetryChartData.value = {
        labels,
        data: energyData
      }

      console.log('[UnifiedChart] Chart data prepared:', {
        labelCount: labels.length,
        sampleLabels: labels.slice(0, 3),
        deviceCount: Object.keys(energyData).length,
        pointsPerDevice: Object.entries(energyData).map(([name, values]) => `${name}: ${values.length} (${values.filter(v => v > 0).length} non-zero)`)
      })

      console.log('[UnifiedChart] Final energyData object:', energyData)

      // Compare final rendered data with API response
      console.log('[UnifiedChart] 🔍 DATA COMPARISON - BEFORE RENDERING:', {
        'API returned': Array.from(chartResults.entries()).map(([uuid, points]: any) => ({
          uuid: uuid.substring(0, 8),
          apiPointCount: Array.isArray(points) ? points.length : 'N/A',
          apiValues: Array.isArray(points) ? points.map((p: any) => p.value) : 'N/A'
        })),
        'Chart will render': Object.entries(energyData).map(([name, values]) => ({
          compteurName: name,
          renderedPointCount: values.length,
          renderedValues: values
        }))
      })

      hasNoData.value = Object.keys(energyData).length === 0
    } else if (props.mode === 'temperature' && props.isTemperatureApi) {
      // Temperature mode with API data - fetch real temperature sensors
      console.log('[UnifiedChart] Temperature mode: fetching from API')

      const { fetchChartBatch } = useTelemetryDynamic()

      // Build temperature chart batch requests
      const temperatureBatchRequests = [{
        startTs,
        endTs,
        period: apiPeriod
      }]

      console.log('[UnifiedChart] Temperature batch request:', {
        period: apiPeriod,
        timeRange: { start: new Date(startTs).toISOString(), end: new Date(endTs).toISOString() }
      })

      try {
        // Make API call to /api/telemetry/temperatureChartBatch
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
        const response = await fetch(`${baseUrl}/api/telemetry/temperatureChartBatch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: temperatureBatchRequests
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const temperatureResult = await response.json()

        console.log('[UnifiedChart] ✓ Received temperature data:', {
          dataPoints: temperatureResult.Temperature?.length || 0,
          response: temperatureResult
        })

        // Process temperature data for chart
        const temperatureData: Record<string, number[]> = {}
        const timestampMap = new Map<number, string>()
        const allTimestamps = new Set<number>()
        const sensorNameMap = new Map<string, string>()

        // Build sensor name mapping from API response
        if (Array.isArray(temperatureResult.Temperature)) {
          temperatureResult.Temperature.forEach((point: any) => {
            if (point.deviceUUID && point.sensorName) {
              sensorNameMap.set(point.deviceUUID, point.sensorName)
            }
            if (point.ts) {
              allTimestamps.add(point.ts)
            }
          })
        }

        console.log('[UnifiedChart] Temperature sensor mapping:', {
          count: sensorNameMap.size,
          sensors: Array.from(sensorNameMap.values())
        })

        // Sort all timestamps
        const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b)
        console.log('[UnifiedChart] Temperature timestamps:', {
          count: sortedTimestamps.length,
          samples: sortedTimestamps.slice(0, 3).map(ts => new Date(ts).toLocaleString('fr-FR'))
        })

        // Generate labels from timestamps
        sortedTimestamps.forEach((ts: number) => {
          const date = new Date(ts)
          let label: string

          switch (props.period) {
            case 'today':
            case 'yesterday':
              const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
              const dateStr = date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
              label = `${dateStr} ${time}`
              break
            case '7days':
              const dailyDateStr = date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
              const dailyTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
              label = `${dailyDateStr} ${dailyTime}`
              break
            default:
              const defaultTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
              const defaultDateStr = date.toLocaleDateString('fr-FR', { month: '2-digit', day: '2-digit' })
              label = `${defaultDateStr} ${defaultTime}`
          }

          timestampMap.set(ts, label)
        })

        const labels = sortedTimestamps.map(ts => timestampMap.get(ts) || String(ts))

        console.log('[UnifiedChart] Temperature labels:', {
          count: labels.length,
          samples: labels.slice(0, 3)
        })

        // Group temperature data by sensor - use same pattern as energy chart
        // First pass: create a map of ts -> dataByPoint for each sensor
        const temperatureByTsAndSensor = new Map<string, Map<number, number>>()

        if (Array.isArray(temperatureResult.Temperature)) {
          temperatureResult.Temperature.forEach((point: any) => {
            const sensorName = point.sensorName || 'Unknown Sensor'

            if (!temperatureByTsAndSensor.has(sensorName)) {
              temperatureByTsAndSensor.set(sensorName, new Map<number, number>())
            }

            const dataByTs = temperatureByTsAndSensor.get(sensorName)!
            const value = typeof point.value === 'string' ? parseFloat(point.value) : point.value
            dataByTs.set(point.ts, isNaN(value) ? 0 : value)
          })
        }

        console.log('[UnifiedChart] Temperature data by sensor:', {
          sensorCount: temperatureByTsAndSensor.size,
          sensors: Array.from(temperatureByTsAndSensor.keys())
        })

        // Second pass: align each sensor's data to sorted timestamps
        temperatureByTsAndSensor.forEach((dataByTs, sensorName) => {
          const temperatureValues = sortedTimestamps.map(ts => dataByTs.get(ts) ?? 0)

          if (temperatureValues.length > 0) {
            temperatureData[sensorName] = temperatureValues
            console.log(`[UnifiedChart] ✓ Processed sensor ${sensorName}:`, {
              dataPoints: temperatureValues.length,
              nonZeroValues: temperatureValues.filter(v => v !== 0).length,
              minValue: Math.min(...temperatureValues.filter(v => v !== 0)),
              maxValue: Math.max(...temperatureValues.filter(v => v !== 0)),
              firstValues: temperatureValues.slice(0, 3)
            })
          } else {
            console.warn(`[UnifiedChart] No temperature values for sensor ${sensorName}`)
          }
        })

        console.log('[UnifiedChart] Final temperature data:', {
          sensorCount: Object.keys(temperatureData).length,
          sensors: Object.entries(temperatureData).map(([name, values]) => `${name}: ${values.length} points (${values.filter(v => v !== 0).length} non-zero)`)
        })

        telemetryChartData.value = {
          labels,
          data: temperatureData
        }

        // Mark that we're using telemetry data so renderChart() will use telemetryChartData
        useTelemetryData.value = true
        const hasTemperatureData = Object.keys(temperatureData).length > 0 && labels.length > 0
        hasNoData.value = !hasTemperatureData

        console.log('[UnifiedChart] Temperature API data ready for rendering:', {
          useTelemetryData: useTelemetryData.value,
          dataAvailable: !!telemetryChartData.value,
          sensorCount: Object.keys(temperatureData).length
        })
      } catch (apiError) {
        console.error('[UnifiedChart] Failed to fetch temperature API data:', apiError)
        useTelemetryData.value = false
        hasNoData.value = true
        isLoadingChart.value = false
        return
      }
    } else {
      // Temperature mode without API enabled - show no data
      console.log('[UnifiedChart] Temperature mode: API not enabled, showing no data')
      useTelemetryData.value = false
      hasNoData.value = true
      isLoadingChart.value = false
      return
    }

    // Render the chart with the fetched data only if we have data
    if (!hasNoData.value) {
      renderChart()
    }
  } catch (error) {
    console.error('[UnifiedChart] Failed to load telemetry chart data:', error)
    useTelemetryData.value = false
    hasNoData.value = true
    isLoadingChart.value = false
    return
  } finally {
    isLoadingChart.value = false
  }
}


onMounted(() => {
  if (useTelemetryData.value) {
    loadTelemetryChartData()
  } else {
    // Don't show mock data - let the API load or show no data
    hasNoData.value = true
  }

  // Watch for dark mode changes (only re-render, no API call)
  const observer = new MutationObserver(() => {
    if (!hasNoData.value && useTelemetryData.value) {
      renderChart()  // Only re-render chart on dark mode change if we have data
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
    // Show no data if not using telemetry
    hasNoData.value = true
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

  // USE TELEMETRY DATA IF AVAILABLE, OTHERWISE FALL BACK TO MOCK
  const data = useTelemetryData.value && telemetryChartData.value
    ? telemetryChartData.value
    : chartData.value as any

  console.log('[UnifiedChart renderChart] Using data source:', {
    useTelemetryData: useTelemetryData.value,
    hasTelemetryData: !!telemetryChartData.value,
    source: useTelemetryData.value && telemetryChartData.value ? 'telemetry API' : 'mock/computed'
  })

  if (props.mode === 'energy') {
    // Build datasets dynamically from selected compteurs with distinct colors
    const datasets = props.selectedCompteurs.map((compteur, index) => {
      // Use shared color utility for consistent colors across dashboard
      const colorConfig = getMeterColorByIndex(index)

      const dataValues = data.data[compteur.name] || []

      console.log('[UnifiedChart renderChart] dataValues for', compteur.name, ':', {
        isArray: Array.isArray(dataValues),
        length: dataValues.length,
        values: dataValues,
        firstThree: dataValues.slice(0, 3),
        lastThree: dataValues.slice(-3),
        sum: dataValues.reduce((a: number, b: number) => a + b, 0),
        isUsingTelemetry: useTelemetryData.value,
        chartDataSource: telemetryChartData.value ? 'telemetryChartData' : 'chartData (mock)'
      });

      return {
        label: compteur.name,
        data: dataValues,
        backgroundColor: colorConfig.hex,
        borderColor: colorConfig.border,
        borderWidth: 1,
        borderRadius: 4
      }
    })

    console.log('[UnifiedChart renderChart] FINAL CHART STRUCTURE:', {
      labels: data.labels,
      labelCount: data.labels?.length || 0,
      sampleLabels: data.labels?.slice(0, 3),
      datasetsCount: datasets.length,
      allDatasets: datasets.map((d: any) => ({
        label: d.label,
        pointCount: d.data.length,
        dataValues: d.data,
        sum: typeof d.data[0] === 'number' ? (d.data as number[]).reduce((a, b) => a + b, 0) : 'N/A'
      }))
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
    // Temperature chart - build datasets dynamically from actual sensor data
    const temperatureColors = [
      '#f97316', // orange
      '#06b6d4', // cyan
      '#a855f7', // purple
      '#ef4444', // red
      '#22c55e', // green
      '#eab308', // yellow
      '#ec4899'  // pink
    ]

    const datasets = Object.entries(data.data).map(([sensorName, values], index) => {
      const color = temperatureColors[index % temperatureColors.length]

      console.log(`[UnifiedChart] Temperature dataset for ${sensorName}:`, {
        color,
        dataLength: Array.isArray(values) ? values.length : 'not-array',
        sampleValues: Array.isArray(values) ? values.slice(0, 3) : 'N/A'
      })

      return {
        label: sensorName,
        data: values,
        borderColor: color,
        backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: color
      }
    })

    console.log('[UnifiedChart] Creating temperature chart with datasets:', {
      datasetCount: datasets.length,
      datasets: datasets.map(d => ({ label: d.label, color: d.borderColor }))
    })

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: datasets
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
                return `${context.dataset.label}: ${typeof y === 'number' ? y.toFixed(1) : 0}°C`
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
            beginAtZero: false,
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
