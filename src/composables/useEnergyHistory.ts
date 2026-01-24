/**
 * useEnergyHistory - Composable for fetching energy history data
 *
 * Provides reactive energy history data with caching and error handling
 * for the EnergyHistorical view and its components.
 */

import { ref, computed } from 'vue'

export interface EnergyHistoryQuery {
  deviceUUIDs: string[]
  startDate: number // Unix timestamp in ms
  endDate: number // Unix timestamp in ms
  metricTypes: ('energy' | 'co2' | 'cost' | 'consumption')[]
  resolution: 'hourly' | 'daily'
  hourFrom?: number
  hourTo?: number
}

export interface DataPoint {
  timestamp: number
  value: number
  hasData: boolean
}

export interface EnergyHistoryResponse {
  success: boolean
  data: {
    [deviceUUID: string]: {
      [metricType: string]: DataPoint[]
    }
  }
  meta: {
    deviceUUIDs: string[]
    metricTypes: string[]
    resolution: 'hourly' | 'daily'
    startDate: number
    endDate: number
    requestedAt: number
  }
  debug?: any
}

export function useEnergyHistory() {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<EnergyHistoryResponse | null>(null)
  const lastRequestTime = ref<number>(0)

  // Cache
  const cache = new Map<string, { data: EnergyHistoryResponse; timestamp: number }>()
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Generate cache key from query parameters
   */
  function getCacheKey(query: EnergyHistoryQuery): string {
    return [
      query.deviceUUIDs.join(','),
      query.startDate,
      query.endDate,
      query.metricTypes.join(','),
      query.resolution,
      query.hourFrom ?? 'none',
      query.hourTo ?? 'none'
    ].join('|')
  }

  /**
   * Check if cached data is valid (not expired)
   */
  function isCacheValid(cacheEntry: { data: EnergyHistoryResponse; timestamp: number }): boolean {
    return Date.now() - cacheEntry.timestamp < CACHE_DURATION
  }

  /**
   * Fetch energy history data
   */
  async function fetchEnergyHistory(query: EnergyHistoryQuery, useCache = true): Promise<EnergyHistoryResponse> {
    const cacheKey = getCacheKey(query)

    // Check cache first
    if (useCache && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!
      if (isCacheValid(cached)) {
        console.log('[useEnergyHistory] Using cached data')
        data.value = cached.data
        return cached.data
      }
    }

    // Fetch from API
    isLoading.value = true
    error.value = null

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

      // Build query string
      const params = new URLSearchParams()
      params.append('devices', query.deviceUUIDs.join(','))
      params.append('startDate', query.startDate.toString())
      params.append('endDate', query.endDate.toString())
      params.append('metrics', query.metricTypes.join(','))
      params.append('resolution', query.resolution)

      if (query.hourFrom !== undefined) {
        params.append('hourFrom', query.hourFrom.toString())
      }
      if (query.hourTo !== undefined) {
        params.append('hourTo', query.hourTo.toString())
      }

      const endpoint = `${apiBaseUrl}/telemetry/energy-history?${params.toString()}`
      console.log(`[useEnergyHistory] Fetching from: ${endpoint}`)

      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result: EnergyHistoryResponse = await response.json()

      if (!result.success) {
        throw new Error('API returned error response')
      }

      // Cache the result
      cache.set(cacheKey, { data: result, timestamp: Date.now() })
      data.value = result
      lastRequestTime.value = Date.now()

      console.log('[useEnergyHistory] Successfully fetched data', {
        devices: result.meta.deviceUUIDs.length,
        metrics: result.meta.metricTypes,
        dataPoints: Object.values(result.data).reduce(
          (sum, device) => sum + Object.values(device).reduce(
            (dsum, metric) => dsum + metric.length, 0
          ), 0
        )
      })

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      error.value = message
      console.error('[useEnergyHistory] Error fetching data:', message)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get data for a specific device and metric
   */
  function getDeviceMetricData(deviceUUID: string, metricType: string): DataPoint[] {
    if (!data.value?.data[deviceUUID]?.[metricType]) {
      return []
    }
    return data.value.data[deviceUUID][metricType]
  }

  /**
   * Get all data for a specific device
   */
  function getDeviceData(deviceUUID: string) {
    if (!data.value?.data[deviceUUID]) {
      return {}
    }
    return data.value.data[deviceUUID]
  }

  /**
   * Get aggregated data across all devices for a metric
   */
  function getAggregatedMetricData(metricType: string): DataPoint[] {
    if (!data.value?.data) {
      return []
    }

    // Create map to aggregate by timestamp
    const aggregated = new Map<number, { sum: number; count: number; hasData: boolean }>()

    for (const deviceUUID in data.value.data) {
      const metricData = data.value.data[deviceUUID][metricType]
      if (!metricData) continue

      for (const point of metricData) {
        if (!aggregated.has(point.timestamp)) {
          aggregated.set(point.timestamp, { sum: 0, count: 0, hasData: false })
        }

        const entry = aggregated.get(point.timestamp)!
        entry.sum += point.value
        entry.count += 1
        entry.hasData = entry.hasData || point.hasData
      }
    }

    // Convert to average values
    return Array.from(aggregated.entries())
      .map(([timestamp, entry]) => ({
        timestamp,
        value: entry.count > 0 ? entry.sum / entry.count : 0,
        hasData: entry.hasData
      }))
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  /**
   * Clear cache
   */
  function clearCache() {
    cache.clear()
  }

  /**
   * Clear cache for specific device
   */
  function clearDeviceCache(deviceUUID: string) {
    const keysToDelete: string[] = []
    cache.forEach((_, key) => {
      if (key.startsWith(deviceUUID)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => cache.delete(key))
  }

  return {
    // State (reactive)
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    data: computed(() => data.value),
    lastRequestTime: computed(() => lastRequestTime.value),

    // Methods
    fetchEnergyHistory,
    getDeviceMetricData,
    getDeviceData,
    getAggregatedMetricData,
    clearCache,
    clearDeviceCache
  }
}
