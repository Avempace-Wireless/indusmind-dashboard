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


/**
 * Helper: Calculate hourly consumption using differential method
 * DEPRECATED: Use calculateDifferentialConsumptionOptimized instead (moved inside useTelemetryDynamic)
 *
 * @param deviceUUID - Device to fetch from
 * @param startTs - Start of period (e.g., midnight)
 * @param endTs - End of period (e.g., now)
 * @param fetchFn - Fetch function to use
 * @returns Array of hourly consumption values
 */
async function calculateDifferentialConsumption(
  deviceUUID: string,
  startTs: number,
  endTs: number,
  fetchFn: (deviceUUID: string, config: TelemetryFetchConfig) => Promise<TelemetryDataPoint[]>,
  key: string = 'AccumulatedActiveEnergyDelivered'
): Promise<TelemetryDataPoint[]> {
  const now = Date.now()

  // Calculate hour boundaries
  const hoursInPeriod = Math.ceil((endTs - startTs) / (60 * 60 * 1000))
  const boundaryTimestamps: number[] = [startTs]

  for (let i = 1; i <= hoursInPeriod; i++) {
    boundaryTimestamps.push(startTs + i * 60 * 60 * 1000)
  }

  // Fetch all accumulated values in parallel with ±1 minute tolerance
  const fetchPromises = boundaryTimestamps.map((timestamp) =>
    fetchFn(deviceUUID, {
      keys: [key],
      startTs: timestamp - 60 * 1000, // 1 minute before
      endTs: timestamp + 60 * 1000, // 1 minute after
      agg: 'MAX',
      limit: 1,
      orderBy: 'DESC'
    }).catch(() => []) // Handle timeouts gracefully
  )

  const responses = await Promise.all(fetchPromises)

  // Extract accumulated values at each boundary
  const boundaryValues = responses.map((data) => {
    if (data.length === 0) return null
    return data[0].value
  })

  // Compute consumption for each hour
  const consumptionData: TelemetryDataPoint[] = []

  for (let i = 0; i < hoursInPeriod; i++) {
    const currentValue = boundaryValues[i + 1] // Value at end of hour
    const previousValue = boundaryValues[i] // Value at start of hour
    const hourEndTimestamp = boundaryTimestamps[i + 1]

    // Skip if we don't have current value
    if (currentValue === null) continue

    // If we don't have previous value, return 0 (can't compute difference)
    const consumption = previousValue === null ? 0 : currentValue - previousValue

    consumptionData.push({
      ts: hourEndTimestamp,
      value: Math.max(0, consumption), // Ensure non-negative
      key
    })
  }

  return consumptionData
}

export function useTelemetryDynamic() {
  const loading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * UNIFIED BATCH API: Make a SINGLE consolidated API call
   *
   * This is the ONE AND ONLY batch fetch function.
   * All other batch functions should call this internally.
   *
   * @param requests - Array of requests with different time ranges, keys, aggregations
   * @returns Map of deviceUUID -> array of TelemetryDataPoint[]
   */
  async function fetchBatchTelemetryOptimized(
    requests: Array<{ deviceUUID: string; config: TelemetryFetchConfig }>
  ): Promise<Map<string, TelemetryDataPoint[]>> {
    if (requests.length === 0) return new Map()

    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

    // Consolidate all requests into single batch payload
    const batchPayload = {
      requests: requests.map(r => ({
        deviceUUID: r.deviceUUID,
        keys: r.config.keys,
        startTs: r.config.startTs,
        endTs: r.config.endTs,
        interval: r.config.interval,
        agg: r.config.agg ? String(r.config.agg).toUpperCase() : undefined,
        limit: r.config.limit,
        orderBy: r.config.orderBy ? String(r.config.orderBy).toUpperCase() : undefined,
        useStrictDataTypes: (r.config as any).useStrictDataTypes,
        calculateDifferential: r.config.calculateDifferential,  // NEW: Pass to backend
        period: r.config.period  // NEW: Pass period context to backend
      }))
    }

    console.log(`[useTelemetryDynamic] 🚀 BATCH API with ${requests.length} requests (${requests.reduce((sum, r) => sum + r.config.keys.length, 0)} keys total)`)

    try {
      console.log('[BATCH CALL] fetchBatchTelemetryOptimized')
      const start = performance.now()
      const response = await fetch(`${backendUrl}/telemetry/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(batchPayload)
      })

      if (!response.ok) {
        throw new Error(`Batch API Error: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()
      const ms = Math.round(performance.now() - start)
      console.log(`[useTelemetryDynamic] ✓ Batch succeeded in ${ms}ms for ${Object.keys(responseData).length} devices`, {
        deviceCount: Object.keys(responseData).length,
        responseSample: Object.entries(responseData).slice(0, 2).map(([uuid, data]: [string, any]) => ({
          uuid: uuid.substring(0, 20),
          keys: Object.keys(data),
          totalPoints: Object.values(data).reduce((sum: number, v: any) => sum + (Array.isArray(v) ? v.length : 0), 0)
        }))
      })

      const results = new Map<string, TelemetryDataPoint[]>()

      // Parse response and return as map for easy consumption
      for (const [deviceUUID, deviceData] of Object.entries(responseData)) {
        const dataPoints: TelemetryDataPoint[] = []

        if (deviceData && typeof deviceData === 'object') {
          for (const [key, values] of Object.entries(deviceData)) {
            if (Array.isArray(values)) {
              for (const point of values) {
                if (point && typeof point === 'object' && 'ts' in point && 'value' in point) {
                  // Handle both string and number values
                  let numValue: number
                  if (typeof point.value === 'string') {
                    numValue = parseFloat(point.value)
                  } else if (typeof point.value === 'number') {
                    numValue = point.value
                  } else {
                    console.warn(`[useTelemetryDynamic] Skipping invalid value type for ${key}:`, typeof point.value, point.value)
                    continue
                  }

                  // Validate numeric value
                  if (isNaN(numValue)) {
                    console.warn(`[useTelemetryDynamic] Skipping NaN value for ${key}:`, point.value)
                    continue
                  }

                  dataPoints.push({
                    ts: point.ts as number,
                    value: numValue,
                    key,
                    // Preserve additional fields from differential calculations
                    ...(point as any).date && { date: (point as any).date },
                    ...(point as any).currentValue !== undefined && { currentValue: (point as any).currentValue },
                    ...(point as any).previousValue !== undefined && { previousValue: (point as any).previousValue }
                  })
                } else {
                  if (!point || typeof point !== 'object') {
                    console.warn(`[useTelemetryDynamic] Invalid point structure for key ${key}:`, point)
                  }
                }
              }
            } else {
              console.warn(`[useTelemetryDynamic] Key ${key} has non-array value:`, typeof values)
            }
          }
        }

        results.set(deviceUUID, dataPoints)
        console.log(`[useTelemetryDynamic] Parsed ${deviceUUID}:`, {
          totalPoints: dataPoints.length,
          uniqueKeys: [...new Set(dataPoints.map(p => p.key))].length
        })
      }

      return results
    } catch (err) {
      console.error('[useTelemetryDynamic] Batch failed:', err instanceof Error ? err.message : String(err))
      throw err
    }
  }

  /**
   * @deprecated Use fetchBatchTelemetryOptimized directly
   * This is now just an alias to avoid breaking existing code
   */
  async function fetchConsolidatedBatch(
    requests: Array<{ deviceUUID: string; config: TelemetryFetchConfig }>
  ): Promise<Map<string, TelemetryDataPoint[]>> {
    return fetchBatchTelemetryOptimized(requests)
  }

  /**
   * MASTER CONSOLIDATION: Fetch all device data in ONE API call
   *
   * This makes ONLY ONE /batch API call with ALL requests consolidated
   * For differential calculations, it builds ALL hour boundary requests upfront
   *
   * BEST WAY TO USE: Instead of making multiple separate calls:
   * ```ts
   * // ❌ BAD - Makes 5 API calls
   * const today = await fetchTodayHourly(deviceUUID)
   * const yesterday = await fetchYesterdayHourly(deviceUUID)
   * const current = await fetchCurrentValue(deviceUUID)
   * const instantaneous = await fetchInstantaneous(deviceUUID)
   * const chart = await fetchChartData(...)
   *
   * // ✅ GOOD - Makes 1 API call (ONLY ONE!)
   * const allData = await fetchAllDeviceDataUnified(deviceUUID, {
   *   currentValue: true,
   *   todayHourly: true,
   *   yesterdayHourly: true
   * })
   * const { currentValue, todayHourly, yesterdayHourly } = allData
   * ```
   *
   * @param deviceUUID - Device to fetch data for
   * @param requirements - Which data types are needed
   * @returns Organized response with data keyed by type
   */
  async function fetchAllDeviceDataUnified(
    deviceUUID: string,
    requirements: {
      currentValue?: boolean
      instantaneous?: boolean
      todayHourly?: boolean
      yesterdayHourly?: boolean
      chartData?: boolean
      todayOnly?: boolean
      lastDays?: number
    } = {}
  ): Promise<{
    currentValue?: number
    instantaneous?: TelemetryDataPoint[]
    todayHourly?: TelemetryDataPoint[]
    yesterdayHourly?: TelemetryDataPoint[]
    chartData?: TelemetryDataPoint[]
    allData?: TelemetryDataPoint[]
  }> {
    const now = Date.now()
    const allRequests: Array<{ deviceUUID: string; config: TelemetryFetchConfig }> = []

    console.log(`[useTelemetryDynamic] 🎯 UNIFIED CONSOLIDATION: Building ALL requests for 1 API call`)
    console.log(`[useTelemetryDynamic] Requirements:`, requirements)

    // 1. Current instantaneous value (latest)
    if (requirements.currentValue) {
      allRequests.push({
        deviceUUID,
        config: {
          keys: ['ActivePowerTotal'],
          startTs: now - 1000,
          endTs: now,
          limit: 1,
          orderBy: 'DESC' as const
        }
      })
    }

    // 2. Instantaneous readings (last 30 min, 5 min intervals)
    if (requirements.instantaneous) {
      allRequests.push({
        deviceUUID,
        config: {
          keys: ['ActivePowerTotal'],
          startTs: now - 30 * 60 * 1000,
          endTs: now,
          interval: 5 * 60 * 1000,
          agg: 'AVG' as const
        }
      })
    }

    // 3. Today's hourly - fetch ALL hour boundaries upfront (don't do differential calc later!)
    if (requirements.todayHourly) {
      const midnight = new Date()
      midnight.setHours(0, 0, 0, 0)
      const midnightMs = midnight.getTime()

      // Build requests for each hour boundary TODAY
      const hoursInPeriod = Math.ceil((now - midnightMs) / (60 * 60 * 1000))
      for (let i = 0; i <= hoursInPeriod; i++) {
        const timestamp = midnightMs + i * 60 * 60 * 1000
        allRequests.push({
          deviceUUID,
          config: {
            keys: ['AccumulatedActiveEnergyDelivered'],
            startTs: timestamp - 60 * 1000,
            endTs: timestamp + 60 * 1000,
            agg: 'MAX' as const,
            limit: 1,
            orderBy: 'DESC' as const
          }
        })
      }
    }

    // 4. Yesterday's hourly - fetch ALL hour boundaries upfront (don't do differential calc later!)
    if (requirements.yesterdayHourly) {
      const midnight = new Date()
      midnight.setHours(0, 0, 0, 0)
      const yesterdayMidnight = new Date(midnight)
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)
      const yesterdayMidnightMs = yesterdayMidnight.getTime()

      // Build requests for each hour boundary YESTERDAY (24 hours)
      for (let i = 0; i <= 24; i++) {
        const timestamp = yesterdayMidnightMs + i * 60 * 60 * 1000
        allRequests.push({
          deviceUUID,
          config: {
            keys: ['AccumulatedActiveEnergyDelivered'],
            startTs: timestamp - 60 * 1000,
            endTs: timestamp + 60 * 1000,
            agg: 'MAX' as const,
            limit: 1,
            orderBy: 'DESC' as const
          }
        })
      }
    }

    // 5. Chart data (depends on todayOnly or lastDays)
    if (requirements.chartData) {
      let startTs = now - 7 * 24 * 60 * 60 * 1000 // Default: 7 days
      if (requirements.todayOnly) {
        const midnight = new Date()
        midnight.setHours(0, 0, 0, 0)
        startTs = midnight.getTime()
      } else if (requirements.lastDays) {
        startTs = now - requirements.lastDays * 24 * 60 * 60 * 1000
      }

      allRequests.push({
        deviceUUID,
        config: {
          keys: ['ActivePowerTotal'],
          startTs,
          endTs: now,
          interval: 15 * 60 * 1000,
          agg: 'AVG' as const
        }
      })
    }

    if (allRequests.length === 0) {
      console.warn(`[useTelemetryDynamic] ⚠️  No requirements specified - returning empty`)
      return {}
    }

    console.log(`[useTelemetryDynamic] 🎯 UNIFIED: Built ${allRequests.length} total requests → Making 1 SINGLE API call`)

    // ============================================================================
    // MAKE SINGLE API CALL WITH ALL REQUESTS
    // This is consolidated in the backend to minimize ThingsBoard calls too!
    // ============================================================================
    const allResults = await fetchBatchTelemetryOptimized(allRequests)
    const allData = allResults.get(deviceUUID) || []

    console.log(`[useTelemetryDynamic] ✓ Single API call returned ${allData.length} total data points`)

    // Process and organize response by type
    const result: any = {
      allData
    }

    // Extract current value
    if (requirements.currentValue) {
      const currentData = allData.filter((dp: TelemetryDataPoint) => dp.key === 'ActivePowerTotal' && dp.ts > now - 2000)
      result.currentValue = currentData.length > 0 ? currentData[0].value : 0
    }

    // Extract instantaneous readings
    if (requirements.instantaneous) {
      result.instantaneous = allData.filter((dp: TelemetryDataPoint) => dp.key === 'ActivePowerTotal' && dp.ts > now - 30 * 60 * 1000)
    }

    // Compute today's hourly from boundary data
    if (requirements.todayHourly) {
      const midnight = new Date()
      midnight.setHours(0, 0, 0, 0)
      const midnightMs = midnight.getTime()

      // Extract boundary values for today
      const todayBoundaryData = allData.filter((dp: TelemetryDataPoint) =>
        dp.key === 'AccumulatedActiveEnergyDelivered' &&
        dp.ts >= midnightMs &&
        dp.ts < now + 2000
      )

      // Compute consumption from boundaries
      const consumptionData: TelemetryDataPoint[] = []
      const hoursInPeriod = Math.ceil((now - midnightMs) / (60 * 60 * 1000))

      for (let i = 0; i < hoursInPeriod; i++) {
        const currentBoundary = midnightMs + (i + 1) * 60 * 60 * 1000
        const previousBoundary = midnightMs + i * 60 * 60 * 1000

        const currentValue = todayBoundaryData.find((dp) => Math.abs(dp.ts - currentBoundary) <= 60 * 1000)?.value
        const previousValue = todayBoundaryData.find((dp) => Math.abs(dp.ts - previousBoundary) <= 60 * 1000)?.value

        if (currentValue !== undefined) {
          const consumption = previousValue !== undefined ? currentValue - previousValue : 0
          consumptionData.push({
            ts: currentBoundary,
            value: Math.max(0, consumption),
            key: 'AccumulatedActiveEnergyDelivered'
          })
        }
      }

      result.todayHourly = consumptionData
    }

    // Compute yesterday's hourly from boundary data
    if (requirements.yesterdayHourly) {
      const midnight = new Date()
      midnight.setHours(0, 0, 0, 0)
      const yesterdayMidnight = new Date(midnight)
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)
      const yesterdayMidnightMs = yesterdayMidnight.getTime()

      // Extract boundary values for yesterday
      const yesterdayBoundaryData = allData.filter((dp: TelemetryDataPoint) =>
        dp.key === 'AccumulatedActiveEnergyDelivered' &&
        dp.ts >= yesterdayMidnightMs &&
        dp.ts < midnight.getTime() + 2000
      )

      // Compute consumption from boundaries
      const consumptionData: TelemetryDataPoint[] = []

      for (let i = 0; i < 24; i++) {
        const currentBoundary = yesterdayMidnightMs + (i + 1) * 60 * 60 * 1000
        const previousBoundary = yesterdayMidnightMs + i * 60 * 60 * 1000

        const currentValue = yesterdayBoundaryData.find((dp) => Math.abs(dp.ts - currentBoundary) <= 60 * 1000)?.value
        const previousValue = yesterdayBoundaryData.find((dp) => Math.abs(dp.ts - previousBoundary) <= 60 * 1000)?.value

        if (currentValue !== undefined) {
          const consumption = previousValue !== undefined ? currentValue - previousValue : 0
          consumptionData.push({
            ts: currentBoundary,
            value: Math.max(0, consumption),
            key: 'AccumulatedActiveEnergyDelivered'
          })
        }
      }

      result.yesterdayHourly = consumptionData
    }

    // Extract chart data
    if (requirements.chartData) {
      result.chartData = allData.filter((dp: TelemetryDataPoint) => dp.key === 'ActivePowerTotal')
    }

    console.log(`[useTelemetryDynamic] ✓ UNIFIED response ready:`, {
      has_currentValue: result.currentValue !== undefined,
      has_instantaneous: result.instantaneous !== undefined,
      has_todayHourly: result.todayHourly !== undefined,
      has_yesterdayHourly: result.yesterdayHourly !== undefined,
      has_chartData: result.chartData !== undefined,
      totalDataPoints: result.allData?.length || 0
    })

    return result
  }

  /**
   * MASTER CONSOLIDATION: Fetch all device data in ONE API call (Legacy name)
   *
   * This is the ultimate consolidation function. Instead of:
   *   await fetchCurrentValue(...)    // API Call 1
   *   await fetchTodayHourly(...)     // API Call 2
   *   await fetchChartData(...)       // API Call 3
   *
   * Use this to make ALL requests in ONE API call:
   *   const allData = await fetchAllDeviceData(deviceUUID, {
   *     needsCurrent: true,
   *     needsTodayHourly: true,
   *     needsChartData: true,
   *     ...
   *   })
   *
   * Benefits:
   * - Single API call instead of N calls
   * - Backend consolidates identical requests
   * - 80-90% fewer API calls to ThingsBoard
   * - Parallel processing
   *
   * @param deviceUUID - Device to fetch data for
   * @param requirements - Which data types are needed
   * @returns Single unified response with all requested data
   */
  async function fetchAllDeviceData(
    deviceUUID: string,
    requirements: {
      currentValue?: boolean
      instantaneous?: boolean
      todayHourly?: boolean
      yesterdayHourly?: boolean
      chartData?: boolean
      todayOnly?: boolean
      lastDays?: number
    } = {}
  ): Promise<Map<string, TelemetryDataPoint[]>> {
    const now = Date.now()
    const requests: Array<{ deviceUUID: string; config: TelemetryFetchConfig }> = []

    console.log(`[useTelemetryDynamic] 🎯 MASTER CONSOLIDATION: Fetching all data for ${deviceUUID.substring(0, 20)}...`)
    console.log(`[useTelemetryDynamic] Requirements:`, requirements)

    // 1. Current instantaneous value (latest)
    if (requirements.currentValue) {
      requests.push({
        deviceUUID,
        config: {
          keys: ['ActivePowerTotal'],
          startTs: now - 1000,
          endTs: now,
          limit: 1,
          orderBy: 'DESC' as const
        }
      })
    }

    // 2. Instantaneous readings (last 30 min, 5 min intervals)
    if (requirements.instantaneous) {
      requests.push({
        deviceUUID,
        config: {
          keys: ['ActivePowerTotal'],
          startTs: now - 30 * 60 * 1000,
          endTs: now,
          interval: 5 * 60 * 1000,
          agg: 'AVG' as const
        }
      })
    }

    // 3. Today's hourly breakdown
    if (requirements.todayHourly) {
      const midnight = new Date()
      midnight.setHours(0, 0, 0, 0)
      requests.push({
        deviceUUID,
        config: {
          keys: ['AccumulatedActiveEnergyDelivered'],
          startTs: midnight.getTime(),
          endTs: now,
          interval: 60 * 60 * 1000,
          agg: 'MAX' as const
        }
      })
    }

    // 4. Yesterday's hourly breakdown
    if (requirements.yesterdayHourly) {
      const midnight = new Date()
      midnight.setHours(0, 0, 0, 0)
      const yesterdayMidnight = new Date(midnight)
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)

      requests.push({
        deviceUUID,
        config: {
          keys: ['AccumulatedActiveEnergyDelivered'],
          startTs: yesterdayMidnight.getTime(),
          endTs: midnight.getTime(),
          interval: 60 * 60 * 1000,
          agg: 'MAX' as const
        }
      })
    }

    // 5. Chart data (depends on todayOnly or lastDays)
    if (requirements.chartData) {
      let startTs = now - 7 * 24 * 60 * 60 * 1000 // Default: 7 days
      if (requirements.todayOnly) {
        const midnight = new Date()
        midnight.setHours(0, 0, 0, 0)
        startTs = midnight.getTime()
      } else if (requirements.lastDays) {
        startTs = now - requirements.lastDays * 24 * 60 * 60 * 1000
      }

      requests.push({
        deviceUUID,
        config: {
          keys: ['ActivePowerTotal'],
          startTs,
          endTs: now,
          interval: 15 * 60 * 1000,
          agg: 'AVG' as const
        }
      })
    }

    if (requests.length === 0) {
      console.warn(`[useTelemetryDynamic] ⚠️  No requirements specified - returning empty`)
      return new Map()
    }

    console.log(`[useTelemetryDynamic] 🎯 Consolidated to ${requests.length} requests (${requests.reduce((sum, r) => sum + r.config.keys.length, 0)} keys)`)

    // Make SINGLE API call with ALL requirements
    return await fetchBatchTelemetryOptimized(requests)
  }

  /**
   * OPTIMIZED: Calculate hourly consumption using differential method
   * Collects ALL requests first, then makes ONE batch API call
   * (instead of N calls for N hour boundaries)
   *
   * @param deviceUUID - Device to fetch from
   * @param startTs - Start of period (e.g., midnight)
   * @param endTs - End of period (e.g., now)
   * @param key - Accumulated energy key
   * @returns Array of hourly consumption values
   */
  async function calculateDifferentialConsumptionOptimized(
    deviceUUID: string,
    startTs: number,
    endTs: number,
    key: string = 'AccumulatedActiveEnergyDelivered'
  ): Promise<TelemetryDataPoint[]> {
    // Calculate hour boundaries
    const hoursInPeriod = Math.ceil((endTs - startTs) / (60 * 60 * 1000))
    const boundaryTimestamps: number[] = [startTs]

    for (let i = 1; i <= hoursInPeriod; i++) {
      boundaryTimestamps.push(startTs + i * 60 * 60 * 1000)
    }

    console.log(`[useTelemetryDynamic] 📊 DIFFERENTIAL: ${boundaryTimestamps.length} boundaries, collecting into single batch call`)

    // BUILD ALL REQUESTS FIRST (don't fetch yet!)
    const batchRequests: Array<{ deviceUUID: string; config: TelemetryFetchConfig }> = boundaryTimestamps.map((timestamp) => ({
      deviceUUID,
      config: {
        keys: [key],
        startTs: timestamp - 60 * 1000, // 1 minute before
        endTs: timestamp + 60 * 1000, // 1 minute after
        agg: 'MAX' as const,
        limit: 1,
        orderBy: 'DESC' as const
      }
    }))

    console.log(`[useTelemetryDynamic] 📊 DIFFERENTIAL: Built ${batchRequests.length} requests, making 1 batch API call...`)

    // MAKE SINGLE BATCH API CALL with all requests
    const results = await fetchBatchTelemetryOptimized(batchRequests)
    const allData = results.get(deviceUUID) || []

    console.log(`[useTelemetryDynamic] 📊 DIFFERENTIAL: Received ${allData.length} total data points from 1 batch call`)

    // Extract accumulated values at each boundary (from the single response)
    const boundaryValues = boundaryTimestamps.map((timestamp) => {
      // Find the closest data point to this timestamp (within ±1 minute)
      const closest = allData.find((dp: TelemetryDataPoint) => Math.abs(dp.ts - timestamp) <= 60 * 1000)
      return closest?.value || null
    })

    // Compute consumption for each hour
    const consumptionData: TelemetryDataPoint[] = []

    for (let i = 0; i < hoursInPeriod; i++) {
      const currentValue = boundaryValues[i + 1] // Value at end of hour
      const previousValue = boundaryValues[i] // Value at start of hour
      const hourEndTimestamp = boundaryTimestamps[i + 1]

      // Skip if we don't have current value
      if (currentValue === null) continue

      // If we don't have previous value, return 0 (can't compute difference)
      const consumption = previousValue === null ? 0 : currentValue - previousValue

      consumptionData.push({
        ts: hourEndTimestamp,
        value: Math.max(0, consumption), // Ensure non-negative
        key
      })
    }

    return consumptionData
  }

  /**
   * CORE: Generic Telemetry Fetch Function
   *
   * Now uses the batch API internally for single requests.
   *
   * Parameters:
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
      // Use batch API endpoint
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

      // Validate required config
      if (!config.keys || config.keys.length === 0) {
        throw new Error('No keys provided in telemetry config')
      }
      if (config.startTs === undefined || config.endTs === undefined) {
        throw new Error(`Missing time range: startTs=${config.startTs}, endTs=${config.endTs}`)
      }

      console.log(`[useTelemetryDynamic] → Fetching (via batch API):`, {
        device: deviceUUID.substring(0, 20) + '...',
        keys: config.keys,
        startTs: new Date(config.startTs).toISOString(),
        endTs: new Date(config.endTs).toISOString(),
        interval: config.interval ? `${config.interval / 1000}s` : 'none',
        agg: config.agg || 'NONE',
        limit: config.limit || 'none'
      })

      // Build batch request
      const batchPayload = {
        requests: [{
          deviceUUID,
          keys: config.keys,
          startTs: config.startTs,
          endTs: config.endTs,
          ...(config.interval && { interval: config.interval }),
          ...(config.agg && { agg: config.agg }),
          ...(config.limit && { limit: config.limit }),
          ...(config.orderBy && { orderBy: config.orderBy })
        }]
      }

      const response = await fetch(`${backendUrl}/telemetry/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(batchPayload)
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const batchResponse = await response.json()
      const deviceData = batchResponse[deviceUUID] || {}

      // Transform batch response to normalized format
      const dataPoints: TelemetryDataPoint[] = []

      for (const key of config.keys) {
        const keyData = deviceData[key] || []
        if (Array.isArray(keyData)) {
          for (const point of keyData) {
            if (point && typeof point === 'object' && 'ts' in point && 'value' in point) {
              dataPoints.push({
                ts: point.ts as number,
                value: typeof point.value === 'string' ? parseFloat(point.value as string) : (point.value as number),
                key
              })
            }
          }
        }
      }

      // Sort by timestamp ascending
      dataPoints.sort((a, b) => a.ts - b.ts)

      console.log(`[useTelemetryDynamic] ✓ Fetched ${dataPoints.length} data points for ${config.keys.join(', ')}`)

      // Update cache
      telemetryCache.set(cacheKey, {
        deviceUUID,
        config,
        data: dataPoints,
        fetchedAt: Date.now()
      })

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
   * Fetch hourly data for today using differential method
   * Computes hourly consumption as: currentHourValue - previousHourValue
   * Uses AccumulatedActiveEnergyDelivered instead of delta keys
   */
  async function fetchTodayHourly(
    deviceUUID: string,
    keys: string[] = ['AccumulatedActiveEnergyDelivered']
  ): Promise<TelemetryDataPoint[]> {
    const now = Date.now()
    const midnightToday = new Date()
    midnightToday.setHours(0, 0, 0, 0)
    const midnightTodayMs = midnightToday.getTime()

    console.log(`[useTelemetryDynamic] Fetching today hourly (differential) for ${deviceUUID.substring(0, 20)}...`)

    const result = await calculateDifferentialConsumptionOptimized(
      deviceUUID,
      midnightTodayMs,
      now,
      keys[0]
    )

    console.log(`[useTelemetryDynamic] Today hourly result:`, {
      consumptionPoints: result.length,
      data: result.map(dp => ({
        time: new Date(dp.ts).toLocaleTimeString(),
        value: dp.value
      }))
    })

    return result
  }

  /**
   * Fetch hourly data for yesterday using differential method
   * Computes hourly consumption as: currentHourValue - previousHourValue
   * Uses AccumulatedActiveEnergyDelivered instead of delta keys
   */
  async function fetchYesterdayHourly(
    deviceUUID: string,
    keys: string[] = ['AccumulatedActiveEnergyDelivered']
  ): Promise<TelemetryDataPoint[]> {
    const now = Date.now()
    const midnightToday = new Date()
    midnightToday.setHours(0, 0, 0, 0)
    const midnightTodayMs = midnightToday.getTime()

    // Yesterday: from midnight yesterday to midnight today
    const yesterdayStart = midnightTodayMs - 24 * 60 * 60 * 1000
    const yesterdayEnd = midnightTodayMs

    console.log(`[useTelemetryDynamic] Fetching yesterday hourly (differential) for ${deviceUUID.substring(0, 20)}...`)

    const result = await calculateDifferentialConsumptionOptimized(
      deviceUUID,
      yesterdayStart,
      yesterdayEnd,
      keys[0]
    )

    console.log(`[useTelemetryDynamic] Yesterday hourly result:`, {
      consumptionPoints: result.length,
      data: result.map(dp => ({
        time: new Date(dp.ts).toLocaleTimeString(),
        value: dp.value
      }))
    })

    return result
  }

  /**
   * Fetch hourly data for any custom period using differential method
   * Computes hourly consumption as: currentHourValue - previousHourValue
   * Uses AccumulatedActiveEnergyDelivered
   *
   * @param deviceUUID - Device to fetch from
   * @param startTs - Start of period (timestamp ms)
   * @param endTs - End of period (timestamp ms)
   * @param keys - Optional, defaults to ['AccumulatedActiveEnergyDelivered']
   * @returns Array of hourly consumption values
   */
  async function fetchHourlyDifferential(
    deviceUUID: string,
    startTs: number,
    endTs: number,
    keys: string[] = ['AccumulatedActiveEnergyDelivered']
  ): Promise<TelemetryDataPoint[]> {
    console.log(`[useTelemetryDynamic] Fetching hourly differential for ${deviceUUID.substring(0, 20)}... from ${new Date(startTs).toLocaleString()} to ${new Date(endTs).toLocaleString()}`)

    const result = await calculateDifferentialConsumptionOptimized(
      deviceUUID,
      startTs,
      endTs,
      keys[0]
    )

    console.log(`[useTelemetryDynamic] Hourly differential result:`, {
      period: `${new Date(startTs).toLocaleDateString()} - ${new Date(endTs).toLocaleDateString()}`,
      consumptionPoints: result.length,
      data: result.slice(0, 3).map(dp => ({
        time: new Date(dp.ts).toLocaleTimeString(),
        value: dp.value
      }))
    })

    return result
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
  /**
   * DEPRECATED: Use fetchBatchTelemetryOptimized instead
   * This function now internally uses the batch API.
   *
   * @deprecated Use fetchBatchTelemetryOptimized for better performance
   */
  async function fetchBatchTelemetry(
    requests: Array<{ deviceUUID: string; config: TelemetryFetchConfig }>
  ): Promise<Map<string, TelemetryDataPoint[]>> {
    console.warn('[useTelemetryDynamic] ⚠️  fetchBatchTelemetry is deprecated - use fetchBatchTelemetryOptimized instead')

    if (requests.length === 0) return new Map()

    // Convert to batch API format
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
    const batchPayload = {
      requests: requests.map(r => ({
        deviceUUID: r.deviceUUID,
        keys: r.config.keys,
        startTs: r.config.startTs,
        endTs: r.config.endTs,
        interval: r.config.interval,
        agg: r.config.agg ? String(r.config.agg).toUpperCase() : undefined,
        limit: r.config.limit,
        orderBy: r.config.orderBy ? String(r.config.orderBy).toUpperCase() : undefined,
        useStrictDataTypes: (r.config as any).useStrictDataTypes
      }))
    }

    try {
      const response = await fetch(`${backendUrl}/telemetry/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(batchPayload)
      })

      if (!response.ok) {
        throw new Error(`Batch API Error: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()
      const results = new Map<string, TelemetryDataPoint[]>()

      for (const [deviceUUID, deviceData] of Object.entries(responseData)) {
        const dataPoints: TelemetryDataPoint[] = []

        if (deviceData && typeof deviceData === 'object') {
          for (const [key, values] of Object.entries(deviceData)) {
            if (Array.isArray(values)) {
              for (const point of values) {
                if (point && typeof point === 'object' && 'ts' in point && 'value' in point) {
                  dataPoints.push({ ts: point.ts as number, value: typeof point.value === 'string' ? parseFloat(point.value as string) : (point.value as number), key })
                }
              }
            }
          }
        }
        results.set(deviceUUID, dataPoints)
      }

      return results
    } catch (err) {
      console.error('[useTelemetryDynamic] Deprecated fetchBatchTelemetry failed:', err)
      throw err
    }
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

  /**
   * Fetch chart data for multiple devices with period-specific aggregation
   *
   * Uses the optimized /chartBatch endpoint which:
   * - Today/Yesterday: Hourly aggregation with differential calculation
   * - 7days/30days: Daily aggregation with differential calculation
   * - Consolidates requests to minimize API calls
   * - Returns data ready for chart visualization
   *
   * @param requests - Array of chart data requests
   * @returns Map of deviceUUID -> array of data points
   */
  async function fetchChartBatch(
    requests: Array<{
      deviceUUID: string
      keys: string[]
      startTs: number
      endTs: number
      period: 'today' | 'yesterday' | '7days' | '30days'
    }>
  ): Promise<Map<string, any[]>> {
    if (!requests || requests.length === 0) {
      return new Map()
    }

    try {
      loading.value = true
      error.value = null

      console.log('[useTelemetryDynamic] Fetching chart batch with periods:', {
        periods: [...new Set(requests.map(r => r.period))],
        devices: [...new Set(requests.map(r => r.deviceUUID))].length
      })

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const response = await fetch(`${apiBaseUrl}/api/telemetry/chartBatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Convert response to Map format
      const results = new Map<string, any[]>()

      for (const [deviceUUID, deviceDataValue] of Object.entries(data as Record<string, any>)) {
        const dataPoints: any[] = []

        // Flatten device data (all keys combined)
        for (const [key, values] of Object.entries(deviceDataValue as Record<string, any>)) {
          if (Array.isArray(values)) {
            for (const point of values) {
              if (point && typeof point === 'object' && 'ts' in point && 'value' in point) {
                dataPoints.push({
                  ts: point.ts as number,
                  value: typeof point.value === 'string' ? parseFloat(point.value as string) : (point.value as number),
                  key,
                  date: point.date,
                  currentValue: point.currentValue,
                  previousValue: point.previousValue
                })
              }
            }
          }
        }

        results.set(deviceUUID, dataPoints)
      }

      console.log('[useTelemetryDynamic] ✓ Chart batch fetched successfully:', {
        devices: results.size,
        totalPoints: Array.from(results.values()).reduce((sum, arr) => sum + arr.length, 0)
      })

      return results
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('[useTelemetryDynamic] Chart batch failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    loading,
    error,

    // MASTER CONSOLIDATION: Fetch all data in ONE API call
    fetchAllDeviceDataUnified,
    fetchAllDeviceData,

    // OPTIMIZED: Single consolidated batch call for multiple diverse requests
    fetchConsolidatedBatch,
    fetchChartBatch,  // NEW: Chart-specific batch endpoint

    // Core generic fetch (use this for full control)
    fetchTelemetry,
    fetchBatchTelemetry,
    fetchBatchTelemetryOptimized,
    // Convenience methods (configurable wrappers)
    fetchCurrentValue,
    fetchInstantaneous,
    fetchTodayHourly,
    fetchYesterdayHourly,
    fetchHourlyDifferential,
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
