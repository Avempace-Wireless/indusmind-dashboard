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
  hourlyData: Array<{ ts: number; date: string; value: number }>
  widgetData: Array<{ ts: number; date: string; value: number }>
  dailyWeekData: Array<{ ts: number; date: string; value: number }>
  dailyMonthData: Array<{ ts: number; date: string; value: number }>
  dailyYearData: Array<{ ts: number; date: string; month: number; value: number }>
}

export interface CurrentOverviewData {
  instantaneousCurrent: number | null
  lastHourAverage: number | null
  todayAverage: number | null
  hourlyData: Array<{ ts: number; date: string; value: number }>
}

export interface CurrentChartDataResponse {
  hourly24h: Array<{ ts: number; date: string; value: number }>
  dailyMonth: Array<{ ts: number; date: string; value: number | null }>
  weeklyData: Array<{ ts: number; date: string; value: number }>
  monthlyYear: Array<{ ts: number; date: string; month: number; monthYear: string; value: number | null }>
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
  const overviewDataCache = ref<Map<string, CurrentOverviewData>>(new Map())
  const chartDataCache = ref<Map<string, CurrentChartDataResponse>>(new Map())

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
   * Fetch current overview data from optimized API endpoint
   * Use this for initial dashboard load - much faster than full /current endpoint
   */
  async function fetchCurrentOverview(deviceUUID: string, options?: { useCache?: boolean }): Promise<CurrentOverviewData | null> {
    try {
      // Check cache first if enabled
      if (options?.useCache !== false && overviewDataCache.value.has(deviceUUID)) {
        const cachedData = overviewDataCache.value.get(deviceUUID)
        if (cachedData) {
          console.log('[useCurrent] Using cached overview data for device:', deviceUUID)
          return cachedData
        }
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const url = `${baseUrl}/api/telemetry/${deviceUUID}/current/overview`

      console.log('[useCurrent] Fetching current overview from:', url)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch current overview: ${response.statusText}`)
      }

      const json = await response.json()
      if (!json.success || !json.data) {
        throw new Error('Invalid API response structure')
      }

      const data = json.data as CurrentOverviewData
      overviewDataCache.value.set(deviceUUID, data)
      console.log('[useCurrent] Current overview data fetched:', data)

      return data
    } catch (err) {
      console.error('[useCurrent] Error fetching current overview:', err)
      return null
    }
  }

  /**
   * Fetch current chart data from optimized API endpoint
   * Use this for chart displays - loads in parallel with overview
   */
  async function fetchCurrentChartData(deviceUUID: string, options?: { useCache?: boolean }): Promise<CurrentChartDataResponse | null> {
    try {
      // Check cache first if enabled
      if (options?.useCache !== false && chartDataCache.value.has(deviceUUID)) {
        const cachedData = chartDataCache.value.get(deviceUUID)
        if (cachedData) {
          console.log('[useCurrent] Using cached chart data for device:', deviceUUID)
          return cachedData
        }
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const url = `${baseUrl}/api/telemetry/${deviceUUID}/current/chart`

      console.log('[useCurrent] Fetching current chart data from:', url)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch current chart data: ${response.statusText}`)
      }

      const json = await response.json()
      if (!json.success || !json.data) {
        throw new Error('Invalid API response structure')
      }

      const data = json.data as CurrentChartDataResponse
      chartDataCache.value.set(deviceUUID, data)
      console.log('[useCurrent] Current chart data fetched:', data)

      return data
    } catch (err) {
      console.error('[useCurrent] Error fetching current chart data:', err)
      return null
    }
  }

  /**
   * Fetch both overview and chart data in parallel (recommended for component mount)
   * This loads all data upfront so charts and tables are instantly available
   */
  async function fetchCurrentDataOptimized(deviceUUID: string, options?: { useCache?: boolean }): Promise<{
    overview: CurrentOverviewData | null
    chartData: CurrentChartDataResponse | null
  }> {
    try {
      isLoading.value = true
      error.value = null

      console.log('[useCurrent] Fetching optimized current data (overview + chart) for:', deviceUUID)

      // Fetch both endpoints in parallel
      const [overview, chartData] = await Promise.all([
        fetchCurrentOverview(deviceUUID, options),
        fetchCurrentChartData(deviceUUID, options),
      ])

      console.log('[useCurrent] Optimized data fetched:', {
        hasOverview: !!overview,
        hasChartData: !!chartData,
      })

      return { overview, chartData }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch current data'
      console.error('[useCurrent] Error fetching optimized current data:', err)
      return { overview: null, chartData: null }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch current KPI data from API (legacy endpoint - use fetchCurrentDataOptimized instead)
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
   * Now uses the optimized chart data cache
   */
  async function getChartData(deviceUUID: string, period: 'day' | 'week' | 'month' | 'year' = 'day'): Promise<CurrentChartData | null> {
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

      // API mode: use cached chart data if available, otherwise fetch
      let chartDataResponse = chartDataCache.value.get(deviceUUID)

      if (!chartDataResponse) {
        // Fetch chart data if not cached
        const fetchedData = await fetchCurrentChartData(deviceUUID)
        if (!fetchedData) return null
        chartDataResponse = fetchedData
      }

      let dataPoints: Array<{ ts: number; value: number | null }> = []

      switch (period) {
        case 'day':
          dataPoints = chartDataResponse.hourly24h
          console.log('[useCurrent] Day period - using hourly24h:', dataPoints?.length)
          break
        case 'week':
          dataPoints = chartDataResponse.weeklyData
          console.log('[useCurrent] Week period - using weeklyData:', dataPoints?.length)
          break
        case 'month':
          dataPoints = chartDataResponse.dailyMonth
          console.log('[useCurrent] Month period - using dailyMonth:', dataPoints?.length)
          break
        case 'year':
          dataPoints = chartDataResponse.monthlyYear
          console.log('[useCurrent] Year period - using monthlyYear:', dataPoints?.length)
          break
        default:
          dataPoints = chartDataResponse.hourly24h
      }

      const labels = dataPoints.map(p => {
        const date = new Date(p.ts)
        if (period === 'day') {
          // Return HH:00 format for daily (aggregated by hour)
          const hours = String(date.getHours()).padStart(2, '0')
          return `${hours}:00`
        } else if (period === 'week') {
          // Return full date (day/month/year) for week data with day-of-week index for sorting
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1 // Convert to Mon=0, Sun=6
          const day = String(date.getDate()).padStart(2, '0')
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const year = date.getFullYear()
          return `${dayIndex}:${day}/${month}/${year}` // Format: dayIndex:DD/MM/YYYY
        } else if (period === 'month') {
          // Return DD/MM/YYYY format for month
          const day = String(date.getDate()).padStart(2, '0')
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const year = date.getFullYear()
          return `${day}/${month}/${year}`
        } else if (period === 'year') {
          // Return full date (month/year) with month number for sorting
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const year = date.getFullYear()
          const monthName = date.toLocaleDateString('en-US', { month: 'short' })
          return `${month}:${monthName}/${year}` // Format: MM:MonthName/YYYY
        } else {
          return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        }
      })

      console.log('[useCurrent] Generated labels:', labels?.length, 'first few:', labels?.slice(0, 3))

      const currentDataValues = dataPoints.map(p => p.value ?? 0)

      const result = {
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

      console.log('[useCurrent] Returning chart data:', {
        labelsCount: result.labels.length,
        dataCount: result.datasets[0].data.length,
        first3Labels: result.labels.slice(0, 3)
      })

      return result
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
    overviewDataCache.value.clear()
    chartDataCache.value.clear()
  }

  return {
    isLoading,
    error,
    getCurrentData,
    getChartData,
    fetchCurrentKPIs,
    fetchCurrentOverview,
    fetchCurrentChartData,
    fetchCurrentDataOptimized,
    fetchCurrentData,
    clearCache,
  }
}
