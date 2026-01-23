/**
 * WidgetDataProvider - Centralized widget data fetching and transformation
 *
 * Orchestrates data fetching for multiple widgets with intelligent batching,
 * caching, and automatic transformation based on widget registry configuration.
 */

import type {
  WidgetConfig,
  DataRequirement,
  WidgetDataResult,
  BatchDataRequest,
  BatchDataResult,
  TelemetryDataPoint,
  TransformContext
} from '@/types/widgetRegistry'
import { TimeUtils } from '@/utils/TimeUtils'
import { fetchDeviceTelemetry, type TelemetryQueryParams } from './telemetryAPI'

export class WidgetDataProvider {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private readonly cacheTTL: number = 5 * 60 * 1000 // 5 minutes
  private pendingRequests: Map<string, Promise<any>> = new Map()

  /**
   * Fetch data for a single widget
   */
  async fetchWidgetData(
    widgetConfig: WidgetConfig,
    deviceUUID: string,
    context?: TransformContext
  ): Promise<WidgetDataResult> {
    const result: WidgetDataResult = {
      widgetId: widgetConfig.id,
      deviceUUID,
      data: {},
      rawData: {},
      loading: true,
      fetchedAt: TimeUtils.now()
    }

    try {
      // Fetch data for each requirement
      const requirementPromises = widgetConfig.dataRequirements.map(async (req) => {
        const data = await this.fetchRequirementData(deviceUUID, req, context)

        // Apply transformation if specified
        const transformedData = req.transform
          ? req.transform(data, context)
          : data

        return {
          requirementId: req.id,
          data: transformedData,
          rawData: data
        }
      })

      const results = await Promise.all(requirementPromises)

      // Map results by requirement ID
      results.forEach(({ requirementId, data, rawData }) => {
        result.data[requirementId] = data
        result.rawData![requirementId] = rawData
      })

      result.loading = false
      result.cached = false
    } catch (error) {
      result.loading = false
      result.error = error as Error
    }

    return result
  }

  /**
   * Fetch data for multiple widgets in batch
   * Optimizes API calls by grouping requests
   */
  async fetchBatchData(
    request: BatchDataRequest
  ): Promise<BatchDataResult> {
    const { deviceUUID, widgets, context } = request

    const result: BatchDataResult = {
      deviceUUID,
      results: {},
      loading: true,
      errors: {}
    }

    try {
      // Fetch data for all widgets in parallel
      const widgetPromises = widgets.map(async (widget) => {
        try {
          const widgetData = await this.fetchWidgetData(widget, deviceUUID, context)
          return { widgetId: widget.id, data: widgetData }
        } catch (error) {
          return {
            widgetId: widget.id,
            error: error as Error
          }
        }
      })

      const widgetResults = await Promise.all(widgetPromises)

      // Map results
      widgetResults.forEach(({ widgetId, data, error }) => {
        if (data) {
          result.results[widgetId] = data
        }
        if (error) {
          result.errors[widgetId] = error
        }
      })

      result.loading = false
    } catch (error) {
      result.loading = false
      // Overall batch error
      console.error('Batch data fetch failed:', error)
    }

    return result
  }

  /**
   * Fetch data for a single data requirement
   */
  private async fetchRequirementData(
    deviceUUID: string,
    requirement: DataRequirement,
    context?: TransformContext
  ): Promise<TelemetryDataPoint[]> {
    // Generate cache key
    const cacheKey = this.generateCacheKey(deviceUUID, requirement)

    // Check cache
    const cached = this.getCached(cacheKey)
    if (cached) {
      return cached
    }

    // Check for pending request to avoid duplicate calls
    const pending = this.pendingRequests.get(cacheKey)
    if (pending) {
      return pending
    }

    // Resolve time range
    const { startTs, endTs } = TimeUtils.resolveTimeRange(requirement.timeRange)

    // Build API request config
    const config: TelemetryQueryParams = {
      keys: requirement.telemetryKeys,
      startTs,
      endTs,
      interval: requirement.interval,
      agg: requirement.aggregation === 'COUNT' ? 'SUM' : requirement.aggregation as any,
      limit: requirement.limit,
      orderBy: requirement.orderBy
    }

    // Make API call
    const requestPromise = fetchDeviceTelemetry(deviceUUID, config)
      .then((response: any) => {
        // Extract data points from response
        const dataPoints: TelemetryDataPoint[] = []

        // Response format: { success: true, data: { [key: string]: TelemetryDataPoint[] } }
        const telemetryData = response.data || {}
        requirement.telemetryKeys.forEach(key => {
          const keyData = telemetryData[key] || []
          keyData.forEach((point: any) => {
            dataPoints.push({
              ts: point.ts,
              value: typeof point.value === 'string' ? parseFloat(point.value) : point.value,
              key
            })
          })
        })

        // Cache the result
        this.setCached(cacheKey, dataPoints)
        this.pendingRequests.delete(cacheKey)

        return dataPoints
      })
      .catch((error: any) => {
        this.pendingRequests.delete(cacheKey)
        throw error
      })

    this.pendingRequests.set(cacheKey, requestPromise)
    return requestPromise
  }

  /**
   * Generate cache key for a data requirement
   */
  private generateCacheKey(deviceUUID: string, requirement: DataRequirement): string {
    const { startTs, endTs } = TimeUtils.resolveTimeRange(requirement.timeRange)

    return [
      deviceUUID,
      requirement.telemetryKeys.join(','),
      startTs,
      endTs,
      requirement.interval || 'none',
      requirement.aggregation || 'NONE',
      requirement.limit || 'all',
      requirement.orderBy || 'ASC'
    ].join('|')
  }

  /**
   * Get cached data if available and not expired
   */
  private getCached(key: string): TelemetryDataPoint[] | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const age = TimeUtils.now() - cached.timestamp
    if (age > this.cacheTTL) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Cache data with timestamp
   */
  private setCached(key: string, data: TelemetryDataPoint[]): void {
    this.cache.set(key, {
      data,
      timestamp: TimeUtils.now()
    })
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Clear cache for specific device
   */
  clearDeviceCache(deviceUUID: string): void {
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (key.startsWith(deviceUUID)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number
    keys: string[]
    oldestEntry: number | null
    newestEntry: number | null
  } {
    const keys = Array.from(this.cache.keys())
    const timestamps = Array.from(this.cache.values()).map(v => v.timestamp)

    return {
      size: this.cache.size,
      keys,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null
    }
  }
}

// Singleton instance
export const widgetDataProvider = new WidgetDataProvider()
