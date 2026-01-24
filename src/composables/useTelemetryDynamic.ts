/**
 * Enhanced Telemetry Composable - Fully Dynamic & Configuration-Driven
 *
 * This composable exposes all ThingsBoard API parameters and provides:
 * - Generic fetchTelemetry with full parameter control
 * - Intelligent caching with 5-minute TTL
 * - Batch fetching for multiple devices
 * - Data mode awareness (api/mock/hybrid)
 *
 * Usage:
 * ```ts
 * const { fetchTelemetry } = useTelemetryDynamic()
 *
 * const data = await fetchTelemetry(deviceUUID, {
 *   keys: ['ActivePowerTotal', 'Current_Avg'],
 *   startTs: Date.now() - 3600000,
 *   endTs: Date.now(),
 *   interval: 300000,
 *   agg: 'AVG',
 *   limit: 100
 * })
 * ```
 */

import { ref } from 'vue'
import type { AggregationType, TelemetryFetchConfig } from '@/config/telemetryConfig'
import { TIME_INTERVALS } from '@/config/telemetryConfig'
import { useApiOnly, useApiData } from '@/config/dataMode'

export interface TelemetryDataPoint {
  ts: number
  value: number
  key: string
}

export interface TelemetryCache {
  deviceUUID: string
  config: TelemetryFetchConfig
  data: TelemetryDataPoint[]
  fetchedAt: number
}

// Global cache with TTL
const telemetryCache = new Map<string, TelemetryCache>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Generate deterministic cache key from config
 */
function getCacheKey(deviceUUID: string, config: TelemetryFetchConfig): string {
  const keyStr = config.keys.sort().join(',')
  const params = `${config.startTs || 'latest'}-${config.endTs || 'now'}-${config.interval || 'none'}-${config.agg || 'none'}-${config.limit || 'all'}`
  return `${deviceUUID}:${keyStr}:${params}`
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(cache: TelemetryCache): boolean {
  return Date.now() - cache.fetchedAt < CACHE_TTL
}

export function useTelemetryDynamic() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * CORE: Generic Telemetry Fetch Function
   *
   * Exposes all ThingsBoard API parameters:
   * - keys: Array of telemetry key names
   * - startTs: Start timestamp (ms)
   * - endTs: End timestamp (ms)
   * - interval: Aggregation interval (ms)
   * - agg: Aggregation function (AVG, MIN, MAX, SUM, COUNT, NONE)
   * - limit: Max number of data points
   */
  async function fetchTelemetry(
    deviceUUID: string,
    config: TelemetryFetchConfig
  ): Promise<TelemetryDataPoint[]> {

    // Skip API calls in mock-only mode
    if (!useApiData()) {
      console.log('[useTelemetryDynamic] Mock mode enabled - skipping API call')
      return []
    }

    // Check cache first
    const cacheKey = getCacheKey(deviceUUID, config)
    const cached = telemetryCache.get(cacheKey)

    if (cached && isCacheValid(cached)) {
      console.log(`[useTelemetryDynamic] ✓ Cache hit: ${cacheKey}`)
      return cached.data
    }

    loading.value = true
    error.value = null

    try {
      // Call backend proxy instead of ThingsBoard directly (avoids CORS issues)
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const params = new URLSearchParams()

      // Build query parameters - keys is ALWAYS required
      if (!config.keys || config.keys.length === 0) {
        throw new Error('No keys provided in telemetry config')
      }
      params.append('keys', config.keys.join(','))

      // startTs and endTs are ALWAYS required by backend
      if (config.startTs === undefined || config.endTs === undefined) {
        throw new Error(`Missing time range: startTs=${config.startTs}, endTs=${config.endTs}`)
      }
      params.append('startTs', config.startTs.toString())
      params.append('endTs', config.endTs.toString())

      // Optional parameters
      if (config.interval !== undefined) params.append('interval', config.interval.toString())
      if (config.agg) params.append('agg', config.agg)
      if (config.limit !== undefined) params.append('limit', config.limit.toString())
      params.append('orderBy', config.orderBy || 'ASC')

      const url = `${backendUrl}/telemetry/${deviceUUID}/timeseries?${params.toString()}`

      console.log(`[useTelemetryDynamic] → Fetching:`, {
        device: deviceUUID.substring(0, 20) + '...',
        keys: config.keys,
        startTs: config.startTs ? new Date(config.startTs).toISOString() : 'MISSING',
        endTs: config.endTs ? new Date(config.endTs).toISOString() : 'MISSING',
        timeRange: config.startTs && config.endTs
          ? `${new Date(config.startTs).toLocaleString()} to ${new Date(config.endTs).toLocaleString()}`
          : 'INVALID',
        interval: config.interval ? `${config.interval / 1000}s` : 'none',
        agg: config.agg || 'NONE',
        limit: config.limit || 'none',
        url: url
      })

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          // Add authentication if needed:
          // 'Authorization': `Bearer ${getAuthToken()}`
        },
      })

      if (!response.ok) {
        throw new Error(`ThingsBoard API Error: ${response.status} ${response.statusText}`)
      }

      const apiData = await response.json()

      console.log(`[useTelemetryDynamic] Raw API response:`, {
        status: response.ok,
        statusCode: response.status,
        hasData: !!apiData.data,
        apiDataKeys: Object.keys(apiData),
        dataObject: apiData.data,
        fullResponse: JSON.stringify(apiData, null, 2)
      })

      // Transform ThingsBoard response to normalized format
      const dataPoints: TelemetryDataPoint[] = []

      // Handle wrapped response from backend (data key) vs direct ThingsBoard response
      const responseData = apiData.data || apiData

      console.log(`[useTelemetryDynamic] Processing response data:`, {
        isWrapped: !!apiData.data,
        responseDataType: typeof responseData,
        responseDataKeys: typeof responseData === 'object' ? Object.keys(responseData) : 'not-object',
        requestedKeys: config.keys,
        responseDataStructure: JSON.stringify(Object.keys(responseData))
      })

      for (const key of config.keys) {
        const keyData = responseData[key] || []
        console.log(`[useTelemetryDynamic] ✓ KEY VERIFICATION "${key}":`, {
          keyExists: key in responseData,
          keyDataType: typeof keyData,
          keyDataLength: keyData.length,
          keyDataSample: keyData.length > 0 ? keyData.slice(0, 3) : 'EMPTY - NO DATA FOR THIS KEY',
          fullKeyData: keyData,
          allAvailableKeys: Object.keys(responseData)
        })

        for (const point of keyData) {
          dataPoints.push({
            ts: point.ts,
            value: typeof point.value === 'string' ? parseFloat(point.value) : point.value,
            key
          })
        }
      }

      // Sort by timestamp ascending
      dataPoints.sort((a, b) => a.ts - b.ts)

      console.log(`[useTelemetryDynamic] ✓ Transformed to ${dataPoints.length} data points:`, {
        dataPoints: dataPoints.slice(0, 5),
        allDataPoints: dataPoints
      })

      // Update cache
      telemetryCache.set(cacheKey, {
        deviceUUID,
        config,
        data: dataPoints,
        fetchedAt: Date.now()
      })

      console.log(`[useTelemetryDynamic] ✓ Fetched ${dataPoints.length} data points for ${config.keys.join(', ')}`)
      return dataPoints

    } catch (err) {
      error.value = err as Error
      console.error('[useTelemetryDynamic] ✗ Fetch error:', err)

      // In API-only mode, throw error
      // In hybrid mode, return empty (component will fall back to mock)
      if (useApiOnly()) {
        throw err
      }
      return []

    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch current value (latest single value for a key)
   */
  async function fetchCurrentValue(
    deviceUUID: string,
    key: string
  ): Promise<number> {
    const data = await fetchTelemetry(deviceUUID, {
      keys: [key],
      limit: 1,
      agg: 'NONE'
    })

    return data.length > 0 ? data[0].value : 0
  }

  /**
   * Fetch instantaneous readings
   * Configurable time range and interval
   */
  async function fetchInstantaneous(
    deviceUUID: string,
    keys: string[],
    timeRange: number = TIME_INTERVALS.ONE_HOUR,
    interval: number = TIME_INTERVALS.FIVE_MINUTES
  ): Promise<TelemetryDataPoint[]> {
    const endTs = Date.now()
    const startTs = endTs - timeRange

    return fetchTelemetry(deviceUUID, {
      keys,
      startTs,
      endTs,
      interval,
      agg: 'AVG'
    })
  }

  /**
   * Fetch hourly data for today (midnight to now)
   */
  async function fetchTodayHourly(
    deviceUUID: string,
    keys: string[]
  ): Promise<TelemetryDataPoint[]> {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return fetchTelemetry(deviceUUID, {
      keys,
      startTs: today.getTime(),
      endTs: now.getTime(),
      interval: TIME_INTERVALS.ONE_HOUR,
      agg: 'SUM'
    })
  }

  /**
   * Fetch chart data with full control over parameters
   *
   * @param deviceUUID - Device identifier
   * @param keys - Telemetry keys to fetch
   * @param startTs - Start timestamp in milliseconds
   * @param endTs - End timestamp in milliseconds
   * @param interval - Aggregation interval in milliseconds
   * @param agg - Aggregation function
   * @param limit - Optional max number of points
   */
  async function fetchChartData(
    deviceUUID: string,
    keys: string[],
    startTs: number,
    endTs: number,
    interval: number,
    agg: AggregationType = 'AVG',
    limit?: number
  ): Promise<TelemetryDataPoint[]> {
    return fetchTelemetry(deviceUUID, {
      keys,
      startTs,
      endTs,
      interval,
      agg,
      limit
    })
  }

  /**
   * BATCH FETCH: Fetch telemetry for multiple devices in parallel
   *
   * Prevents redundant API calls and improves performance
   *
   * @param requests - Array of fetch requests with deviceUUID and config
   * @returns Map of deviceUUID to data points
   */
  async function fetchBatchTelemetry(
    requests: Array<{ deviceUUID: string; config: TelemetryFetchConfig }>
  ): Promise<Map<string, TelemetryDataPoint[]>> {
    console.log(`[useTelemetryDynamic] Batch fetching for ${requests.length} requests`, {
      requests: requests.map(r => ({
        deviceUUID: r.deviceUUID.substring(0, 20) + '...',
        keys: r.config.keys
      }))
    })

    const results = new Map<string, TelemetryDataPoint[]>()

    // Deduplicate requests
    const uniqueRequests = new Map<string, { deviceUUID: string; config: TelemetryFetchConfig }>()
    for (const req of requests) {
      const key = getCacheKey(req.deviceUUID, req.config)
      if (!uniqueRequests.has(key)) {
        uniqueRequests.set(key, req)
      }
    }

    console.log(`[useTelemetryDynamic] Deduplicated to ${uniqueRequests.size} unique requests`)

    // Fetch all in parallel
    const promises = Array.from(uniqueRequests.values()).map(async ({ deviceUUID, config }) => {
      try {
        const data = await fetchTelemetry(deviceUUID, config)
        console.log(`[useTelemetryDynamic] ✓ Batch result for ${deviceUUID.substring(0, 20)}...: ${data.length} points`, {
          data: data.slice(0, 3),
          fullData: data
        })
        return { deviceUUID, data, error: null }
      } catch (err) {
        console.error(`[useTelemetryDynamic] ✗ Batch fetch error for ${deviceUUID.substring(0, 20)}...`, err)
        return { deviceUUID, data: [], error: err as Error }
      }
    })

    const settled = await Promise.all(promises)

    for (const result of settled) {
      // Merge results for same deviceUUID
      const existing = results.get(result.deviceUUID) || []
      const merged = [...existing, ...result.data]
      results.set(result.deviceUUID, merged)

      console.log(`[useTelemetryDynamic] Merged results for ${result.deviceUUID.substring(0, 20)}...: ${merged.length} total points`)

      if (result.error) {
        console.warn(`[useTelemetryDynamic] Failed for ${result.deviceUUID}:`, result.error.message)
      }
    }

    console.log(`[useTelemetryDynamic] ✓ Batch complete. Final results:`, {
      deviceCount: results.size,
      resultsPerDevice: Array.from(results.entries()).map(([uuid, data]) => ({
        device: uuid.substring(0, 20) + '...',
        pointCount: data.length
      })),
      fullResults: results
    })

    return results
  }

  /**
   * Clear entire cache
   */
  function clearCache() {
    const size = telemetryCache.size
    telemetryCache.clear()
    console.log(`[useTelemetryDynamic] Cache cleared (${size} entries removed)`)
  }

  /**
   * Clear cache for specific device
   */
  function clearDeviceCache(deviceUUID: string) {
    const keysToDelete: string[] = []

    for (const [key, value] of telemetryCache.entries()) {
      if (value.deviceUUID === deviceUUID) {
        keysToDelete.push(key)
      }
    }

    for (const key of keysToDelete) {
      telemetryCache.delete(key)
    }

    console.log(`[useTelemetryDynamic] Cleared ${keysToDelete.length} cache entries for device ${deviceUUID}`)
  }

  /**
   * Get cache statistics for monitoring
   */
  function getCacheStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0

    for (const cache of telemetryCache.values()) {
      if (isCacheValid(cache)) {
        validEntries++
      } else {
        expiredEntries++
      }
    }

    return {
      totalEntries: telemetryCache.size,
      validEntries,
      expiredEntries,
      ttlMs: CACHE_TTL,
      ttlMinutes: CACHE_TTL / 60000
    }
  }

  return {
    // State
    loading,
    error,

    // Core generic fetch (use this for full control)
    fetchTelemetry,
    fetchBatchTelemetry,

    // Convenience methods (configurable wrappers)
    fetchCurrentValue,
    fetchInstantaneous,
    fetchTodayHourly,
    fetchChartData,

    // Cache management
    clearCache,
    clearDeviceCache,
    getCacheStats
  }
}

// Export legacy TELEMETRY_KEYS constant for backward compatibility
export const TELEMETRY_KEYS = {
  POWER: 'ActivePowerTotal',
  ENERGY_CUMULATIVE: 'AccumulatedActiveEnergyDelivered',
  ENERGY_DELTA_HOUR: 'deltaHourEnergyConsumtion',
  ENERGY_DELTA_DAY: 'deltaDayEnergyConsumtion',
  CURRENT: 'Current_Avg',
  VOLTAGE_LL: 'VoltageL_L_Avg',
  VOLTAGE_LN: 'VoltageL_N_Avg',
  FREQUENCY: 'Frequency',
  POWER_FACTOR: 'PowerFactor',
  TEMPERATURE: 'temperature'
} as const
