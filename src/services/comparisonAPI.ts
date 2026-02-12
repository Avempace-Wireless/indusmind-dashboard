/**
 * Comparison API Service
 *
 * Frontend service for the Comparison View.
 * Calls backend comparison endpoints to fetch real telemetry data
 * with differential energy calculations.
 *
 * Endpoints:
 * - POST /api/telemetry/comparison          → time series data
 * - POST /api/telemetry/comparison/kpis     → KPI summary
 * - POST /api/telemetry/comparison/summary  → per-meter statistics
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ComparisonRequestBody {
  meters: string[]
  startTs: number
  endTs: number
  resolution: 'hourly' | 'daily' | 'weekly' | 'monthly'
}

export interface MeterTimeSeriesData {
  meterId: string
  values: Array<{ ts: number; value: number }>
  totalConsumption: number
}

export interface ComparisonDataResponse {
  success: boolean
  data: MeterTimeSeriesData[]
  meta: {
    meters: string[]
    resolution: string
    startTs: number
    endTs: number
    totalDataPoints: number
    executionTimeMs: number
    apiCallCount: number
    requestedAt: number
  }
}

export interface ComparisonKPIsResponse {
  success: boolean
  data: {
    highest: {
      meterId: string
      value: number
      peakDate?: string
      peakValue?: number
    }
    lowest: {
      meterId: string
      value: number
      minDate?: string
      minValue?: number
    }
    average: number
    total: number
    variance: number
    meterTotals: Array<{
      meterId: string
      totalConsumption: number
      peakDate?: string
      peakValue?: number
    }>
  }
  meta: {
    meters: string[]
    startTs: number
    endTs: number
    executionTimeMs: number
    requestedAt: number
  }
}

export interface ComparisonSummaryResponse {
  success: boolean
  data: {
    meters: Array<{
      meterId: string
      totalConsumption: number
      avgDaily: number
      peakDay: { ts: number; value: number } | null
      minDay: { ts: number; value: number } | null
      trend: 'up' | 'down' | 'stable'
      trendPercent: number
    }>
    periodTotals: Array<{
      ts: number
      label: string
      totalAllMeters: number
    }>
  }
  meta: {
    meters: string[]
    resolution: string
    startTs: number
    endTs: number
    executionTimeMs: number
    requestedAt: number
  }
}

// ─── Timeout & Logging Helpers ───────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 120_000 // 2-minute timeout for large date ranges

/**
 * Wrapper around fetch with AbortController timeout and request/response logging.
 */
async function fetchWithTimeout<T>(
  url: string,
  body: ComparisonRequestBody,
  label: string,
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  console.log(`[ComparisonAPI] ${label} → POST`, {
    meters: body.meters.length,
    range: `${new Date(body.startTs).toISOString()} → ${new Date(body.endTs).toISOString()}`,
    resolution: body.resolution,
  })

  const startTime = performance.now()

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    const elapsed = Math.round(performance.now() - startTime)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      console.error(`[ComparisonAPI] ${label} ✗ HTTP ${response.status} (${elapsed}ms):`, errorData)
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data: T = await response.json()
    console.log(`[ComparisonAPI] ${label} ✓ (${elapsed}ms)`)
    return data
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      const elapsed = Math.round(performance.now() - startTime)
      console.error(`[ComparisonAPI] ${label} ✗ TIMEOUT after ${elapsed}ms`)
      throw new Error(`Request timeout: ${label} took longer than ${timeoutMs / 1000}s`)
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

// ─── API Functions ───────────────────────────────────────────────────────────

/**
 * Fetch comparison time series data for multiple meters.
 * Returns differential energy consumption per interval for each meter.
 */
export async function fetchComparisonData(
  body: ComparisonRequestBody
): Promise<ComparisonDataResponse> {
  return fetchWithTimeout<ComparisonDataResponse>(
    `${API_BASE_URL}/api/telemetry/comparison`,
    body,
    'comparison/data'
  )
}

/**
 * Fetch KPI summary for multiple meters.
 * Returns highest, lowest, average, total, variance calculations.
 */
export async function fetchComparisonKPIs(
  body: ComparisonRequestBody
): Promise<ComparisonKPIsResponse> {
  return fetchWithTimeout<ComparisonKPIsResponse>(
    `${API_BASE_URL}/api/telemetry/comparison/kpis`,
    body,
    'comparison/kpis'
  )
}

/**
 * Fetch detailed per-meter statistics with trend analysis.
 * Returns per-meter totals, daily averages, peak/min days, trend direction.
 */
export async function fetchComparisonSummary(
  body: ComparisonRequestBody
): Promise<ComparisonSummaryResponse> {
  return fetchWithTimeout<ComparisonSummaryResponse>(
    `${API_BASE_URL}/api/telemetry/comparison/summary`,
    body,
    'comparison/summary'
  )
}

// ─── Combined response interface ────────────────────────────────────────────

export interface ComparisonAllResponse {
  success: boolean
  comparison: ComparisonDataResponse
  kpis: ComparisonKPIsResponse
  summary: ComparisonSummaryResponse
}

/**
 * Fetch ALL comparison data in a single request (data + KPIs + summary).
 * Saves 2 HTTP round-trips compared to calling the 3 endpoints separately.
 */
export async function fetchComparisonAll(
  body: ComparisonRequestBody
): Promise<ComparisonAllResponse> {
  return fetchWithTimeout<ComparisonAllResponse>(
    `${API_BASE_URL}/api/telemetry/comparison/all`,
    body,
    'comparison/all'
  )
}

/**
 * Helper: Build request body from store state
 */
export function buildComparisonRequest(
  deviceUUIDs: string[],
  selectedDates: string[],
  resolution: 'hourly' | 'daily' | 'weekly' | 'monthly'
): ComparisonRequestBody {
  if (selectedDates.length === 0) {
    throw new Error('At least one date must be selected')
  }

  // Sort dates and derive start/end timestamps
  // Parse date strings as LOCAL dates (not UTC) to avoid timezone shifts
  const sortedDates = [...selectedDates].sort()

  const [sYear, sMonth, sDay] = sortedDates[0].split('-').map(Number)
  const startDate = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0)

  const [eYear, eMonth, eDay] = sortedDates[sortedDates.length - 1].split('-').map(Number)
  const endDate = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999)

  return {
    meters: deviceUUIDs,
    startTs: startDate.getTime(),
    endTs: endDate.getTime(),
    resolution,
  }
}
