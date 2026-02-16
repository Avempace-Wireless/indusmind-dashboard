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
