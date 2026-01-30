import { ref, computed } from 'vue'

export interface PuissanceKPIs {
  instantaneousPower: number | null
  consumedThisHour: number | null
  consumedToday: number | null
  consumedYesterday: number | null
  consumedThisMonth: number | null
  consumedLastMonth: number | null
}

export interface PuissanceChartData {
  hourly: Array<{ ts: number; value: number }>
  daily: Array<{ ts: number; value: number }>
  monthly: Array<{ ts: number; value: number }>
}

export interface PuissanceResponse {
  success: boolean
  data: {
    instantaneousPower: number | null
    consumedThisHour: number | null
    consumedToday: number | null
    consumedYesterday: number | null
    consumedThisMonth: number | null
    consumedLastMonth: number | null
    hourlyData: Array<{ ts: number; value: number }>
    dailyData: Array<{ ts: number; value: number }>
    monthlyData: Array<{ ts: number; value: number }>
  }
  meta: {
    deviceUUID: string
    deviceName: string
    requestedAt: number
  }
  debug?: {
    requests: Array<{
      id: string
      keys: string[]
      startTs: number
      endTs: number
      interval?: number
      agg?: string
      resultPoints: number
    }>
  }
}

/**
 * Composable for Puissance KPI data fetching
 * Uses the new dedicated /api/telemetry/:deviceUUID/puissance endpoint
 */
export function usePuissance() {
  const kpis = ref<Record<string, PuissanceKPIs>>({})
  const chartData = ref<Record<string, PuissanceChartData>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastRequestTime = ref<number>(0)
  const cache = new Map<string, { data: PuissanceResponse; timestamp: number }>()

  const CACHE_DURATION = 30000 // 30 seconds

  /**
   * Fetch Puissance KPI data for a single device
   */
  async function fetchPuissanceKPIs(deviceUUID: string, options?: { debug?: boolean; useCache?: boolean }) {
    isLoading.value = true
    error.value = null

    try {
      const now = Date.now()
      const useCache = options?.useCache !== false

      // Check cache first
      if (useCache && cache.has(deviceUUID)) {
        const cached = cache.get(deviceUUID)!
        if (now - cached.timestamp < CACHE_DURATION) {
          console.log(`[usePuissance] Using cached data for ${deviceUUID}`)
          updateFromResponse(deviceUUID, cached.data)
          return cached.data
        }
      }

      // Build query string
      const params = new URLSearchParams()
      if (options?.debug) params.append('debug', 'true')

      // Fetch from new API endpoint (note: no /api prefix, backend routes are mounted directly)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const endpoint = `${apiBaseUrl}/telemetry/${deviceUUID}/puissance${params.toString() ? '?' + params.toString() : ''}`

      console.log(`[usePuissance] Fetching from: ${endpoint}`)

      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: PuissanceResponse = await response.json()

      if (!result.success) {
        throw new Error(result.data ? 'Failed to fetch data' : 'API returned error')
      }

      // Cache the result
      cache.set(deviceUUID, { data: result, timestamp: now })

      // Update local state
      updateFromResponse(deviceUUID, result)

      console.log(`[usePuissance] Fetched data for ${result.meta.deviceName}`)

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      error.value = message
      console.error(`[usePuissance] Error fetching data: ${message}`, { deviceUUID, error: err })
      throw err
    } finally {
      isLoading.value = false
      lastRequestTime.value = Date.now()
    }
  }

  /**
   * Update local state from API response
   */
  function updateFromResponse(deviceUUID: string, response: PuissanceResponse) {
    kpis.value[deviceUUID] = {
      instantaneousPower: response.data.instantaneousPower,
      consumedThisHour: response.data.consumedThisHour,
      consumedToday: response.data.consumedToday,
      consumedYesterday: response.data.consumedYesterday,
      consumedThisMonth: response.data.consumedThisMonth,
      consumedLastMonth: response.data.consumedLastMonth,
    }

    chartData.value[deviceUUID] = {
      hourly: response.data.hourlyData || [],
      daily: response.data.dailyData || [],
      monthly: response.data.monthlyData || [],
    }
  }

  /**
   * Get KPIs for a specific device
   */
  function getKPIs(deviceUUID: string): PuissanceKPIs {
    return (
      kpis.value[deviceUUID] || {
        instantaneousPower: null,
        consumedThisHour: null,
        consumedToday: null,
        consumedYesterday: null,
        consumedThisMonth: null,
        consumedLastMonth: null,
      }
    )
  }

  /**
   * Get chart data for a specific device
   */
  function getChartData(deviceUUID: string): PuissanceChartData {
    return (
      chartData.value[deviceUUID] || {
        hourly: [],
        daily: [],
        monthly: [],
      }
    )
  }

  /**
   * Clear cache for all devices or specific device
   */
  function clearCache(deviceUUID?: string) {
    if (deviceUUID) {
      cache.delete(deviceUUID)
    } else {
      cache.clear()
    }
  }

  return {
    kpis: computed(() => kpis.value),
    chartData: computed(() => chartData.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    lastRequestTime: computed(() => lastRequestTime.value),
    fetchPuissanceKPIs,
    getKPIs,
    getChartData,
    clearCache,
  }
}
