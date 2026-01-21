/**
 * Telemetry API Service
 * Fetches timeseries data from ThingsBoard via backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export interface TelemetryDataPoint {
  ts: number
  value: string | number
}

export interface TelemetryResponse {
  success: boolean
  data: Record<string, TelemetryDataPoint[]>
  error?: string
  device?: {
    uuid: string
    name: string
    accessToken: string
  }
  meta?: {
    entityType: string
    entityId: string
    keys: string[]
    startTs: number
    endTs: number
    interval?: number
    agg?: string
    orderBy?: string
    limit?: number
  }
}

export interface TelemetryQueryParams {
  keys: string[]
  startTs: number
  endTs: number
  interval?: number
  agg?: 'NONE' | 'AVG' | 'MIN' | 'MAX' | 'SUM'
  orderBy?: 'ASC' | 'DESC'
  limit?: number
  useStrictDataTypes?: boolean
}

/**
 * Fetch telemetry timeseries data for a specific device
 *
 * @param deviceUUID - Device UUID from selected compteur
 * @param params - Query parameters for telemetry
 * @returns Timeseries data grouped by key
 */
export async function fetchDeviceTelemetry(
  deviceUUID: string,
  params: TelemetryQueryParams
): Promise<TelemetryResponse> {
  const queryParams = new URLSearchParams()
  queryParams.set('keys', params.keys.join(','))
  queryParams.set('startTs', params.startTs.toString())
  queryParams.set('endTs', params.endTs.toString())

  if (params.interval) queryParams.set('interval', params.interval.toString())
  if (params.agg) queryParams.set('agg', params.agg)
  if (params.orderBy) queryParams.set('orderBy', params.orderBy)
  if (params.limit) queryParams.set('limit', params.limit.toString())
  if (params.useStrictDataTypes) queryParams.set('useStrictDataTypes', 'true')

  const url = `${API_BASE_URL}/telemetry/${deviceUUID}/timeseries?${queryParams.toString()}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data: TelemetryResponse = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch telemetry data')
    }

    return data
  } catch (error) {
    console.error('[TelemetryAPI] Fetch error:', error)
    throw error
  }
}

/**
 * Helper: Get time range for common periods
 */
export function getTimeRange(period: '1h' | '6h' | '24h' | '7d' | '30d'): { startTs: number; endTs: number; interval: number } {
  const now = Date.now()
  const ranges = {
    '1h': { ms: 60 * 60 * 1000, interval: 5 * 60 * 1000 }, // 5min intervals
    '6h': { ms: 6 * 60 * 60 * 1000, interval: 15 * 60 * 1000 }, // 15min intervals
    '24h': { ms: 24 * 60 * 60 * 1000, interval: 60 * 60 * 1000 }, // 1h intervals
    '7d': { ms: 7 * 24 * 60 * 60 * 1000, interval: 6 * 60 * 60 * 1000 }, // 6h intervals
    '30d': { ms: 30 * 24 * 60 * 60 * 1000, interval: 24 * 60 * 60 * 1000 }, // 1d intervals
  }

  const range = ranges[period]
  return {
    startTs: now - range.ms,
    endTs: now,
    interval: range.interval,
  }
}

/**
 * Transform telemetry response to chart-friendly format
 *
 * @param telemetryData - Raw telemetry data from API
 * @returns Array of { timestamp, [key]: value } for charting libraries
 */
export function transformTelemetryForChart(
  telemetryData: Record<string, TelemetryDataPoint[]>
): Array<Record<string, number | string>> {
  // Collect all unique timestamps
  const timestampSet = new Set<number>()
  Object.values(telemetryData).forEach((dataPoints) => {
    dataPoints.forEach((dp) => timestampSet.add(dp.ts))
  })

  const sortedTimestamps = Array.from(timestampSet).sort((a, b) => a - b)

  // Build chart data points
  return sortedTimestamps.map((ts) => {
    const dataPoint: Record<string, number | string> = {
      timestamp: ts,
      time: new Date(ts).toLocaleString(), // Human-readable time
    }

    // Add each key's value at this timestamp
    Object.entries(telemetryData).forEach(([key, dataPoints]) => {
      const point = dataPoints.find((dp) => dp.ts === ts)
      dataPoint[key] = point ? parseFloat(String(point.value)) : 0
    })

    return dataPoint
  })
}

/**
 * Fetch telemetry for multiple devices (for comparing meters)
 */
export async function fetchMultiDeviceTelemetry(
  deviceUUIDs: string[],
  params: TelemetryQueryParams
): Promise<Array<{ deviceUUID: string; data: TelemetryResponse }>> {
  const promises = deviceUUIDs.map(async (uuid) => ({
    deviceUUID: uuid,
    data: await fetchDeviceTelemetry(uuid, params),
  }))

  return Promise.all(promises)
}
