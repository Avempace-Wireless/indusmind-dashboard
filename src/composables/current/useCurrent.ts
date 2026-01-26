import { ref, computed } from 'vue'
import { useApiData } from '@/config/dataMode'

export interface CurrentData {
  meterId: string
  timestamp: number
  current: number  // Single current value in Amperes
  voltage: number  // Voltage in Volts
  power: number    // Calculated power in kW
  max: number
  min: number
}

export interface CurrentChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }>
}

// API Response types
export interface CurrentKPIData {
  instantaneousCurrent: number | null
  lastHourMin: number | null
  lastHourAverage: number | null
  lastHourMax: number | null
  todayAverage: number | null
  hourlyData: Array<{ ts: number; value: number }>
  widgetData: Array<{ ts: number; value: number }>
  dailyWeekData: Array<{ ts: number; value: number }>
  dailyMonthData: Array<{ ts: number; value: number }>
}

export interface CurrentKPIResponse {
  success: boolean
  data: CurrentKPIData
  meta: {
    deviceUUID: string
    deviceName: string
    requestedAt: number
    timezone?: string
  }
}

/**
 * Composable for managing current data
 * Handles both API and mock data modes
 */
export function useCurrent() {
  const isApiModeEnabled = useApiData()

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentDataCache = ref<Map<string, CurrentKPIData>>(new Map())

  /**
   * Generate mock current data
   */
  function generateMockCurrentData(meterId: string): CurrentData {
    const current = Math.random() * 50 + 10 // 10-60A
    const voltage = 230 // Standard voltage
    const power = (current * voltage) / 1000 // kW

    return {
      meterId,
      timestamp: Date.now(),
      current: Math.round(current * 100) / 100,
      voltage,
      power: Math.round(power * 100) / 100,
      max: Math.round((current * 1.2) * 100) / 100,
      min: Math.round((current * 0.8) * 100) / 100,
    }
  }

  /**
   * Fetch current KPI data from API
   */
  async function fetchCurrentKPIs(deviceUUID: string, options?: { useCache?: boolean }): Promise<CurrentKPIData | null> {
    try {
      // Check cache first if enabled
      if (options?.useCache !== false && currentDataCache.value.has(deviceUUID)) {
        const cachedData = currentDataCache.value.get(deviceUUID)
        if (cachedData) {
          console.log('[useCurrent] Using cached data for device:', deviceUUID)
          return cachedData
        }
      }

      isLoading.value = true
      error.value = null

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const url = `${baseUrl}/api/telemetry/${deviceUUID}/current`

      console.log('[useCurrent] Fetching current data from:', url)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch current data: ${response.statusText}`)
      }

      const json = await response.json()
      if (!json.success || !json.data) {
        throw new Error('Invalid API response structure')
      }

      const data = json.data as CurrentKPIData
      currentDataCache.value.set(deviceUUID, data)
      console.log('[useCurrent] Current KPI data fetched:', data)

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch current data'
      console.error('[useCurrent] Error fetching current KPIs:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get current KPI data - API or mock
   */
  async function getCurrentData(deviceUUID: string): Promise<CurrentData | null> {
    try {
      if (isApiModeEnabled) {
        const kpiData = await fetchCurrentKPIs(deviceUUID)
        if (!kpiData) return null

        // Transform API response to CurrentData format
        return {
          meterId: deviceUUID,
          timestamp: Date.now(),
          current: kpiData.instantaneousCurrent ?? 0,
          voltage: 230,
          power: ((kpiData.instantaneousCurrent ?? 0) * 230) / 1000,
          max: kpiData.lastHourMax ?? 0,
          min: kpiData.lastHourMin ?? 0,
        }
      } else {
        return generateMockCurrentData(deviceUUID)
      }
    } catch (err) {
      console.error('[useCurrent] Error in getCurrentData:', err)
      return null
    }
  }

  /**
   * Fetch current chart data for historical display
   */
  async function getChartData(deviceUUID: string, period: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<CurrentChartData | null> {
    try {
      if (!isApiModeEnabled) {
        // Generate mock chart data
        const labels: string[] = []
        const currentData: number[] = []

        // Generate hourly data for the past 24 hours
        const now = new Date()
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 3600000)
          labels.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))

          const current = Math.random() * 50 + 10
          currentData.push(Math.round(current * 100) / 100)
        }

        return {
          labels,
          datasets: [
            {
              label: 'Current (A)',
              data: currentData,
              borderColor: '#3B82F6',
              backgroundColor: '#3B82F620',
            },
          ],
        }
      }

      // API mode: fetch from current KPI data
      const kpiData = await fetchCurrentKPIs(deviceUUID)
      if (!kpiData) return null

      let dataPoints: Array<{ ts: number; value: number }> = []

      switch (period) {
        case 'hour':
          dataPoints = kpiData.widgetData
          break
        case 'day':
          dataPoints = kpiData.hourlyData
          break
        case 'week':
          dataPoints = kpiData.dailyWeekData
          break
        case 'month':
          dataPoints = kpiData.dailyMonthData
          break
        default:
          dataPoints = kpiData.hourlyData
      }

      const labels = dataPoints.map(p => {
        const date = new Date(p.ts)
        if (period === 'hour') {
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        } else if (period === 'day') {
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        } else {
          return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        }
      })

      const currentDataValues = dataPoints.map(p => p.value)

      return {
        labels,
        datasets: [
          {
            label: 'Current (A)',
            data: currentDataValues,
            borderColor: '#3B82F6',
            backgroundColor: '#3B82F620',
          },
        ],
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch chart data'
      console.error('[useCurrent] Error fetching chart:', err)
      return null
    }
  }

  /**
   * Fetch current data for multiple meters
   */
  async function fetchCurrentData(deviceUUIDs: string[]): Promise<Map<string, CurrentKPIData>> {
    const results = new Map<string, CurrentKPIData>()

    for (const deviceUUID of deviceUUIDs) {
      const data = await fetchCurrentKPIs(deviceUUID)
      if (data) {
        results.set(deviceUUID, data)
      }
    }

    return results
  }

  /**
   * Clear cache
   */
  function clearCache() {
    currentDataCache.value.clear()
  }

  return {
    isLoading,
    error,
    getCurrentData,
    getChartData,
    fetchCurrentKPIs,
    fetchCurrentData,
    clearCache,
  }
}
