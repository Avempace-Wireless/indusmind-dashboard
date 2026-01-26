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

/**
 * Composable for managing current data
 * Handles both API and mock data modes
 */
export function useCurrent() {
  const isApiModeEnabled = useApiData()

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentDataCache = ref<Map<string, CurrentData>>(new Map())

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
   * Fetch current data for a specific meter
   */
  async function getCurrentData(meterId: string): Promise<CurrentData | null> {
    try {
      isLoading.value = true
      error.value = null

      // Check cache first
      if (currentDataCache.value.has(meterId)) {
        const cachedData = currentDataCache.value.get(meterId)
        if (cachedData && Date.now() - cachedData.timestamp < 5000) { // 5-second cache
          return cachedData
        }
      }

      let data: CurrentData

      if (isApiModeEnabled) {
        // TODO: Implement API call
        // const response = await fetch(`/api/meters/${meterId}/current`)
        // data = await response.json()
        data = generateMockCurrentData(meterId)
      } else {
        data = generateMockCurrentData(meterId)
      }

      currentDataCache.value.set(meterId, data)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch current data'
      console.error('[useCurrent] Error:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch current chart data for historical display
   */
  async function getChartData(meterId: string, hours: number = 24): Promise<CurrentChartData | null> {
    try {
      isLoading.value = true

      const labels: string[] = []
      const currentData: number[] = []

      // Generate hourly data for the past N hours
      const now = new Date()
      for (let i = hours - 1; i >= 0; i--) {
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
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch chart data'
      console.error('[useCurrent] Error fetching chart:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch current data for multiple meters
   */
  async function fetchCurrentData(meterIds: string[]): Promise<Map<string, CurrentData>> {
    const results = new Map<string, CurrentData>()

    for (const meterId of meterIds) {
      const data = await getCurrentData(meterId)
      if (data) {
        results.set(meterId, data)
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
    fetchCurrentData,
    clearCache,
  }
}
