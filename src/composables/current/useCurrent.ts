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

      // API mode: fetch from current KPI data
      const kpiData = await fetchCurrentKPIs(deviceUUID)
      if (!kpiData) return null

      let dataPoints: Array<{ ts: number; value: number }> = []

      switch (period) {
        case 'day':
          dataPoints = kpiData.hourlyData
          console.log('[useCurrent] Day period - dataPoints:', dataPoints?.length)
          break
        case 'week':
          dataPoints = kpiData.dailyWeekData
          console.log('[useCurrent] Week period - dataPoints:', dataPoints?.length)
          break
        case 'month':
          dataPoints = kpiData.dailyMonthData
          console.log('[useCurrent] Month period - dataPoints:', dataPoints?.length)
          break
        case 'year':
          dataPoints = kpiData.dailyYearData
          console.log('[useCurrent] Year period - dataPoints:', dataPoints?.length)
          break
        default:
          dataPoints = kpiData.hourlyData
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
          // Return DD/MM/YYYY format for month (backend already returns date property in this format)
          // Use the date property from backend if available, otherwise format from timestamp
          if ('date' in p && typeof p.date === 'string') {
            return p.date // Backend returns "DD/MM/YYYY"
          }
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

      const currentDataValues = dataPoints.map(p => p.value)

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
