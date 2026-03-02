/**
 * Thermal Telemetry API Service
 * Fetches telemetry data for temperature sensors from backend API
 * Backend endpoint: GET /api/telemetry/thermal
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

/**
 * Temperature sensor telemetry response (from backend)
 */
export interface SensorTelemetry {
  deviceUUID: string
  temperature: number | null
  humidity: number | null
  dewPoint: number | null
  timestamp: string | null
  lastUpdate: number | null // Unix timestamp in milliseconds
}

/**
 * Thermal sensor with full data (from backend API)
 */
export interface ThermalSensorData {
  id: number
  deviceUUID: string
  name: string
  label: string
  zone: string
  // Metadata
  active: boolean | null
  powerStatus: boolean | null
  displayName: string | null
  hideAutoMode: boolean | null
  delay: number | null
  // Configuration (from ThingsBoard attributes)
  mode: string | null
  minTemp: number | null
  maxTemp: number | null
  relay: string | null
  controllerUUID: string | null
  // Current telemetry
  temperature: number | null
  humidity: number | null
  dewPoint: number | null
  rawData: {
    Temperature?: number
    Humidity?: number
    DewPoint?: number
  } | null
  timestamp: string | null
  lastUpdate: number | null
}

/**
 * Thermal management dashboard data (from backend API)
 */
export interface ThermalDashboardData {
  sensors: ThermalSensorData[]
  summary: {
    totalSensors: number
    activeSensors: number
    averageTemperature: number | null
    minTemperature: number | null
    maxTemperature: number | null
  }
  lastFetch: number
  status: 'success' | 'partial' | 'error'
  message?: string
}

/**
 * Backend API response format
 */
interface ThermalAPIResponse {
  success: boolean
  data: {
    sensors: ThermalSensorData[]
    summary: {
      totalSensors: number
      activeSensors: number
      averageTemperature: number | null
      minTemperature: number | null
      maxTemperature: number | null
    }
  }
  meta: {
    requestedAt: number
    sensorCount: number
  }
  debug?: any
}

/**
 * Fetch all thermal sensor data from backend
 * Calls GET /api/telemetry/thermal
 * @param debug - Include debug information
 * @returns Thermal dashboard data with all sensors
 */
export async function fetchThermalDashboardData(
  debug: boolean = false
): Promise<ThermalDashboardData> {
  try {
    const url = `${API_BASE_URL}/api/telemetry/thermal${debug ? '?debug=true' : ''}`

    console.log('[ThermalAPI] Fetching thermal sensor data from:', url)

    const response = await axios.get<ThermalAPIResponse>(url, {
      timeout: 30000, // 30 second timeout for multiple sensors
    })

    if (!response.data.success) {
      throw new Error('Backend API returned success=false')
    }

    const { sensors, summary } = response.data.data

    console.log(`[ThermalAPI] Received ${sensors.length} sensors from backend`)

    return {
      sensors,
      summary,
      lastFetch: response.data.meta.requestedAt,
      status: 'success',
    }

  } catch (error: any) {
    console.error('[ThermalAPI] Error fetching thermal dashboard data:', error)

    // Return error state with empty data
    return {
      sensors: [],
      summary: {
        totalSensors: 0,
        activeSensors: 0,
        averageTemperature: null,
        minTemperature: null,
        maxTemperature: null,
      },
      lastFetch: Date.now(),
      status: 'error',
      message: error.message || 'Failed to fetch thermal data',
    }
  }
}

/**
 * Update sensor operating mode (manuel or auto)
 * Calls POST /api/telemetry/thermal/mode
 * @param deviceUUID - UUID of the sensor device
 * @param mode - Operating mode ('manuel' or 'auto')
 * @returns Success response or error
 */
export async function updateSensorMode(
  deviceUUID: string,
  mode: 'manuel' | 'auto'
): Promise<{
  success: boolean
  message: string
}> {
  try {
    if (!['manuel', 'auto'].includes(mode)) {
      throw new Error(`Invalid mode: ${mode}. Must be 'manuel' or 'auto'`)
    }

    const url = `${API_BASE_URL}/api/telemetry/thermal/mode`
    const response = await axios.post(url, {
      deviceUUID,
      mode,
    })

    if (response.data.success) {
      console.log(`[ThermalAPI] Mode updated to '${mode}' for device ${deviceUUID}`)
      return {
        success: true,
        message: response.data.message || `Mode updated to '${mode}' successfully`,
      }
    } else {
      console.error(`[ThermalAPI] Failed to update mode:`, response.data.message)
      return {
        success: false,
        message: response.data.message || 'Failed to update mode',
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[ThermalAPI] Error updating sensor mode:`, errorMessage)
    return {
      success: false,
      message: errorMessage,
    }
  }
}

// ============================================================================
// CHART DATA APIs
// ============================================================================

/**
 * Temperature chart sensor data shape (shared by 24h and monthly)
 */
export interface TemperatureChartSensor {
  deviceUUID: string
  sensorLabel: string
  sensorName: string
  data: Array<{
    timestamp: number
    value?: number
    readableDate: string
    min?: number
    max?: number
  }>
}

/**
 * Fetch 24-hour temperature chart data
 * Calls GET /api/telemetry/thermal/chart-data
 * @param sensorIds - Optional array of sensor UUIDs to filter
 * @returns Chart data with hourly averaged temperature per sensor
 */
export async function fetchTemperatureChart24h(
  sensorIds?: string[]
): Promise<{ success: boolean; data: { sensors: TemperatureChartSensor[] } }> {
  try {
    const params = new URLSearchParams()
    if (sensorIds && sensorIds.length > 0) {
      params.set('sensorIds', sensorIds.join(','))
    }
    const qs = params.toString()
    const url = `${API_BASE_URL}/api/telemetry/thermal/chart-data${qs ? '?' + qs : ''}`

    console.log('[ThermalAPI] Fetching 24h chart data from:', url)
    const response = await axios.get(url, { timeout: 30000 })

    return {
      success: response.data?.success ?? false,
      data: { sensors: response.data?.data?.sensors ?? [] },
    }
  } catch (error) {
    console.error('[ThermalAPI] Error fetching 24h chart:', error)
    return { success: false, data: { sensors: [] } }
  }
}

/**
 * Fetch a single week of daily min/max temperature chart data.
 * Calls GET /api/telemetry/thermal/chart-weekly?startTs=...&endTs=...
 */
async function fetchOneWeek(
  startTs: number,
  endTs: number,
  sensorIds?: string[]
): Promise<{ success: boolean; data: { sensors: TemperatureChartSensor[] } }> {
  const params = new URLSearchParams()
  params.set('startTs', String(startTs))
  params.set('endTs', String(endTs))
  if (sensorIds && sensorIds.length > 0) {
    params.set('sensorIds', sensorIds.join(','))
    console.log(`[ThermalAPI] Filtering to ${sensorIds.length} sensor(s):`, sensorIds)
  } else {
    console.warn('[ThermalAPI] WARNING: No sensorIds filter - fetching ALL sensors!')
  }

  const url = `${API_BASE_URL}/api/telemetry/thermal/chart-weekly?${params.toString()}`

  try {
    const response = await axios.get(url, { timeout: 20000 })
    const sensors: TemperatureChartSensor[] = response.data?.data?.sensors ?? []
    return { success: response.data?.success ?? false, data: { sensors } }
  } catch (error) {
    console.error('[ThermalAPI] Error fetching week chunk:', error)
    return { success: false, data: { sensors: [] } }
  }
}

/**
 * Merge new week sensors into the accumulated sensors array.
 * For each sensor already present, append the new data points (sorted by timestamp).
 * For new sensors, push them directly.
 */
function mergeSensors(
  accumulated: TemperatureChartSensor[],
  incoming: TemperatureChartSensor[]
): TemperatureChartSensor[] {
  const merged = [...accumulated]

  for (const sensor of incoming) {
    const existing = merged.find(s => s.deviceUUID === sensor.deviceUUID)
    if (existing) {
      // Append and sort by timestamp
      existing.data = [...existing.data, ...sensor.data].sort(
        (a, b) => a.timestamp - b.timestamp
      )
    } else {
      merged.push({ ...sensor, data: [...sensor.data] })
    }
  }

  return merged
}

/**
 * Fetch monthly temperature chart data progressively, one week at a time.
 *
 * Splits the last 30 days into weekly chunks. Fetches the newest week first
 * and calls `onWeekReady` immediately so the chart shows data early.
 * Then fetches the remaining 3 weeks in parallel and calls `onWeekReady`
 * after each resolves to progressively fill the chart.
 *
 * @param onWeekReady - callback invoked with the accumulated sensors after each week loads
 * @param sensorIds  - optional sensor UUID filter
 * @returns final merged result
 */
export async function fetchTemperatureChartMonthly(
  onWeekReady: (sensors: TemperatureChartSensor[]) => void,
  sensorIds?: string[]
): Promise<{ success: boolean; data: { sensors: TemperatureChartSensor[] } }> {
  const DAY_MS = 86_400_000
  const WEEK_MS = 7 * DAY_MS
  const now = Date.now()
  const monthAgo = now - 30 * DAY_MS

  // Build weekly segments (oldest → newest)
  const segments: Array<{ startTs: number; endTs: number }> = []
  let cursor = monthAgo
  while (cursor < now) {
    const segEnd = Math.min(cursor + WEEK_MS, now)
    segments.push({ startTs: cursor, endTs: segEnd })
    cursor = segEnd
  }

  console.log(`[ThermalAPI] Progressive monthly load: ${segments.length} weekly chunks (oldest first)`)

  let accumulated: TemperatureChartSensor[] = []

  // Fetch weeks SEQUENTIALLY from oldest to newest
  // Sequential avoids overwhelming the 6-slot semaphore with too many concurrent calls
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    console.log(`[ThermalAPI] Fetching week ${i + 1}/${segments.length}...`)
    const result = await fetchOneWeek(seg.startTs, seg.endTs, sensorIds)
    if (result.success && result.data.sensors.length > 0) {
      accumulated = mergeSensors(accumulated, result.data.sensors)
      console.log(`[ThermalAPI] Week ${i + 1}/${segments.length} ready — ${accumulated.reduce((n, s) => n + s.data.length, 0)} points, calling onWeekReady`)
      onWeekReady(accumulated)
    } else {
      console.log(`[ThermalAPI] Week ${i + 1}/${segments.length} — no data or failed`)
    }
  }

  console.log(`[ThermalAPI] Monthly load complete — ${accumulated.length} sensors, ${accumulated.reduce((n, s) => n + s.data.length, 0)} total points`)

  return {
    success: accumulated.length > 0,
    data: { sensors: accumulated },
  }
}
