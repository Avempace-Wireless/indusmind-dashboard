/**
 * Telemetry Data Composable
 * Fetches and manages real telemetry data from ThingsBoard
 */

import { ref, computed } from 'vue'
import { fetchDeviceTelemetry, getTimeRange, transformTelemetryForChart, type TelemetryQueryParams } from '@/services/telemetryAPI'

export interface TelemetryReading {
  timestamp: number
  value: number
  height: number // For chart display (percentage)
}

export interface DeviceTelemetryData {
  deviceUUID: string
  deviceName: string
  instantaneous: TelemetryReading[]
  todayHourly: TelemetryReading[]
  yesterdayHourly: TelemetryReading[]
  currentValue: number
  unit: string
}

/**
 * Telemetry keys for PM2200 meters
 */
export const TELEMETRY_KEYS = {
  POWER: ['ActivePowerTotal'],
  ENERGY_CUMULATIVE: ['AccumulatedActiveEnergyDelivered'],
  ENERGY_DELTA_HOUR: ['deltaHourEnergyConsumtion'],
  ENERGY_DELTA_HALFHOUR: ['deltaHalfHourEnergyConsumtion'],
  ENERGY_DELTA_FIVEMIN: ['deltaFiveMinutesEnergyConsumtion'],
  ENERGY_DELTA_DAY: ['deltaDayEnergyConsumtion', 'dailyEnergyDelta'],
  CURRENT: ['Current_Avg'],
  VOLTAGE: ['Voltage_Avg'],
  FREQUENCY: ['Frequency'],
} as const

export function useTelemetry() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch instantaneous data (last 30 minutes, 5-min intervals)
   */
  async function fetchInstantaneous(
    deviceUUID: string,
    keys: string[] = [...TELEMETRY_KEYS.POWER]
  ): Promise<TelemetryReading[]> {
    try {
      loading.value = true
      error.value = null

      const { startTs, endTs, interval } = getTimeRange('1h')

      const response = await fetchDeviceTelemetry(deviceUUID, {
        keys,
        startTs,
        endTs,
        interval,
        agg: 'AVG',
        orderBy: 'ASC',
      })

      // Transform to readings (take first key's data)
      const firstKey = keys[0]
      const dataPoints = response.data[firstKey] || []

      const maxValue = Math.max(...dataPoints.map((dp) => parseFloat(String(dp.value))))

      return dataPoints.map((dp) => ({
        timestamp: dp.ts,
        value: parseFloat(String(dp.value)),
        height: maxValue > 0 ? (parseFloat(String(dp.value)) / maxValue) * 100 : 0,
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch instantaneous data'
      console.error('[useTelemetry] Instantaneous fetch error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch today's hourly data using differential method
   * Computes hourly consumption as: hourlyValue - previousHourValue
   * Uses AccumulatedActiveEnergyDelivered instead of delta keys
   */
  async function fetchTodayHourly(
    deviceUUID: string,
    keys: string[] = ['AccumulatedActiveEnergyDelivered']
  ): Promise<TelemetryReading[]> {
    try {
      loading.value = true
      error.value = null

      const key = keys[0] // Use first key (AccumulatedActiveEnergyDelivered)
      const now = Date.now()

      // Calculate hour boundaries for today
      const midnightToday = new Date()
      midnightToday.setHours(0, 0, 0, 0)
      const midnightTodayMs = midnightToday.getTime()

      // Calculate how many complete + partial hours we have today
      const hoursInDay = Math.ceil((now - midnightTodayMs) / (60 * 60 * 1000))

      // Create timestamps for boundaries: midnight, 01:00, 02:00, ..., up to current hour
      // We need hoursInDay + 1 values (start and end of each hour)
      const boundaryTimestamps: number[] = [midnightTodayMs] // Start with midnight

      for (let i = 1; i <= hoursInDay; i++) {
        boundaryTimestamps.push(midnightTodayMs + i * 60 * 60 * 1000)
      }

      // Fetch all accumulated values in parallel with ±1 minute tolerance window
      const fetchPromises = boundaryTimestamps.map((timestamp) =>
        fetchDeviceTelemetry(deviceUUID, {
          keys: [key],
          startTs: timestamp - 60 * 1000, // 1 minute before
          endTs: timestamp + 60 * 1000, // 1 minute after
          agg: 'MAX',
          limit: 1,
          orderBy: 'DESC',
        }).catch(() => ({ data: { [key]: [] } })) // Handle timeouts gracefully
      )

      const responses = await Promise.all(fetchPromises)

      // Extract accumulated values at each boundary
      const boundaryValues = responses.map((response) => {
        const dataPoints = response.data[key] || []
        if (dataPoints.length === 0) return null
        return parseFloat(String(dataPoints[0].value))
      })

      // Compute consumption for each hour using differential method
      const consumptionData: TelemetryReading[] = []

      for (let i = 0; i < hoursInDay; i++) {
        const currentValue = boundaryValues[i + 1] // Value at end of hour
        const previousValue = boundaryValues[i] // Value at start of hour

        const hourEndTimestamp = boundaryTimestamps[i + 1]

        // Skip if we don't have current value
        if (currentValue === null) continue

        // If we don't have previous value, return 0 (can't compute difference)
        const consumption = previousValue === null ? 0 : currentValue - previousValue

        consumptionData.push({
          timestamp: hourEndTimestamp,
          value: Math.max(0, consumption), // Ensure non-negative
          height: 0, // Will normalize after all values collected
        })
      }

      // Normalize heights based on max value in today's consumption
      const maxValue = Math.max(...consumptionData.map((dp) => dp.value), 0)
      consumptionData.forEach((dp) => {
        dp.height = maxValue > 0 ? (dp.value / maxValue) * 100 : 0
      })
console.log('[useTelemetry] Today hourly data:', {
  boundaryCount: boundaryTimestamps.length,
  hoursProcessed: hoursInDay,
  consumptionPoints: consumptionData.length,
  data: consumptionData,
  timestamps: consumptionData.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    value: d.value,
    height: d.height,
  })),
})
      return consumptionData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch today hourly data'
      console.error('[useTelemetry] Today hourly fetch error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch yesterday's hourly data
   */
  async function fetchYesterdayHourly(
    deviceUUID: string,
    keys: string[] = [...TELEMETRY_KEYS.ENERGY_DELTA_HOUR]
  ): Promise<TelemetryReading[]> {
    try {
      loading.value = true
      error.value = null

      const now = Date.now()
      const oneDayMs = 24 * 60 * 60 * 1000

      // Yesterday: from 48h ago to 24h ago
      const startTs = now - 2 * oneDayMs
      const endTs = now - oneDayMs
      const interval = 60 * 60 * 1000 // 1 hour

      const response = await fetchDeviceTelemetry(deviceUUID, {
        keys,
        startTs,
        endTs,
        interval,
        agg: 'AVG',
        orderBy: 'ASC',
      })

      const firstKey = keys[0]
      const dataPoints = response.data[firstKey] || []

      const maxValue = Math.max(...dataPoints.map((dp) => parseFloat(String(dp.value))))

      return dataPoints.map((dp) => ({
        timestamp: dp.ts,
        value: parseFloat(String(dp.value)),
        height: maxValue > 0 ? (parseFloat(String(dp.value)) / maxValue) * 100 : 0,
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch yesterday hourly data'
      console.error('[useTelemetry] Yesterday hourly fetch error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch chart data for a given period
   */
  async function fetchChartData(
    deviceUUID: string,
    period: '1h' | '6h' | '24h' | '7d' | '30d',
    keys: string[] = [...TELEMETRY_KEYS.POWER]
  ) {
    try {
      loading.value = true
      error.value = null

      const { startTs, endTs, interval } = getTimeRange(period)

      // Choose aggregation based on metric type
      const isEnergy = keys.some(k => k.toLowerCase().includes('energy'))

      const response = await fetchDeviceTelemetry(deviceUUID, {
        keys,
        startTs,
        endTs,
        interval,
        agg: isEnergy ? 'SUM' : 'AVG',
        orderBy: 'ASC',
      })

      // Transform to chart-friendly format, filling missing time points with zeros
      const chartData = transformTelemetryForChart(response.data, startTs, endTs, interval)

      // Format labels based on period
      const labels = chartData.map((dp) => {
        const ts = dp.timestamp as number
        const d = new Date(ts)
        switch (period) {
          case '1h':
          case '6h':
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          case '24h':
            // For 24h period, round to nearest hour and show only hours
            const roundedHour = Math.round(d.getHours() + d.getMinutes() / 60)
            const finalHour = roundedHour === 24 ? 0 : roundedHour
            return `${finalHour.toString().padStart(2, '0')}:00`
          case '7d':
            return d.toLocaleDateString([], { weekday: 'short' })
          case '30d':
            return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
          default:
            return d.toLocaleString()
        }
      })

      return {
        labels,
        datasets: keys.map((key, index) => ({
          label: key,
          data: chartData.map((dp) => dp[key] as number),
          borderColor: getChartColor(index),
          backgroundColor: getChartColor(index, 0.1),
          tension: 0.4,
        })),
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch chart data'
      console.error('[useTelemetry] Chart data fetch error:', err)
      return {
        labels: [],
        datasets: [],
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch current (latest) value for a specific key
   */
  async function fetchCurrentValue(
    deviceUUID: string,
    key: string
  ): Promise<number> {
    try {
      const { startTs, endTs } = getTimeRange('1h')

      const response = await fetchDeviceTelemetry(deviceUUID, {
        keys: [key],
        startTs,
        endTs,
        agg: 'NONE',
        limit: 1,
        orderBy: 'DESC',
      })

      const dataPoints = response.data[key] || []
      if (dataPoints.length > 0) {
        return parseFloat(String(dataPoints[0].value))
      }

      return 0
    } catch (err) {
      console.error('[useTelemetry] Current value fetch error:', err)
      return 0
    }
  }

  /**
   * Helper: Get chart color by index
   */
  function getChartColor(index: number, alpha = 1): string {
    const colors = [
      `rgba(59, 130, 246, ${alpha})`, // Blue
      `rgba(16, 185, 129, ${alpha})`, // Green
      `rgba(249, 115, 22, ${alpha})`, // Orange
      `rgba(236, 72, 153, ${alpha})`, // Pink
      `rgba(139, 92, 246, ${alpha})`, // Purple
      `rgba(245, 158, 11, ${alpha})`, // Amber
    ]
    return colors[index % colors.length]
  }

  /**
   * Fetch calculated KPI values from backend
   * Calls: GET /api/telemetry/:deviceUUID/kpis
   */
  async function fetchCalculatedKPIs(
    deviceUUID: string,
    startTs: number,
    endTs: number,
    includeDebug: boolean = false
  ): Promise<{
    instantaneousConsumption: number
    consumedThisHour: number
    consumedToday: number
    consumedYesterday: number
    consumedDayBeforeYesterday: number
    consumedThisMonth: number
    consumedLastMonth: number
    timestamp: number
  } | null> {
    try {
      loading.value = true
      error.value = null

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/telemetry/${deviceUUID}/kpis`
      const params = new URLSearchParams()
      params.append('startTs', startTs.toString())
      params.append('endTs', endTs.toString())
      if (includeDebug) {
        params.append('debug', 'true')
      }

      console.log(`[useTelemetry] 📊 Fetching calculated KPIs from backend:`, {
        url: apiUrl,
        deviceUUID,
        startTs: new Date(startTs).toISOString(),
        endTs: new Date(endTs).toISOString(),
      })

      const response = await fetch(`${apiUrl}?${params.toString()}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.success || !data.kpis) {
        throw new Error('Invalid response format')
      }

      console.log(`[useTelemetry] ✅ KPIs fetched successfully:`, data.kpis)

      return data.kpis
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch KPIs'
      error.value = errorMsg
      console.error('[useTelemetry] KPI fetch error:', errorMsg)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchInstantaneous,
    fetchTodayHourly,
    fetchYesterdayHourly,
    fetchChartData,
    fetchCurrentValue,
    fetchCalculatedKPIs,
    TELEMETRY_KEYS,
  }
}
