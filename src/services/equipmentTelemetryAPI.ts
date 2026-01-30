/**
 * Equipment Telemetry API Service
 * Fetches latest telemetry values and status for equipment/devices
 * Uses a single bulk API endpoint for all devices
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export interface LatestTelemetry {
  ts: number
  value: string | number
}

export interface DeviceTelemetryData {
  deviceUUID: string
  deviceName: string
  lastActivityTime?: number
  active: boolean
  telemetry: Record<string, LatestTelemetry>
}

export interface EquipmentTelemetryResponse {
  success: boolean
  data: DeviceTelemetryData[]
  error?: string
}

/**
 * Fetch latest telemetry for all customer devices in a single request
 * This is more efficient than making individual requests for each device
 */
export async function fetchAllDevicesLatestTelemetry(
  keys?: string[]
): Promise<DeviceTelemetryData[]> {
  try {
    const keysParam = keys ? `?keys=${keys.join(',')}` : ''
    const url = `${API_BASE_URL}/api/telemetry/latest${keysParam}`

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

    const data = await response.json()
    return data.data || data
  } catch (error) {
    console.error('[EquipmentTelemetryAPI] Error fetching latest telemetry for all devices:', error)
    throw error
  }
}

/**
 * Fetch latest telemetry for a single device
 * Returns the most recent values for all telemetry keys
 */
export async function fetchDeviceLatestTelemetry(
  deviceUUID: string,
  keys?: string[]
): Promise<DeviceTelemetryData> {
  try {
    const keysParam = keys ? `?keys=${keys.join(',')}` : ''
    const url = `${API_BASE_URL}/api/telemetry/${deviceUUID}/latest${keysParam}`

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

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`[EquipmentTelemetryAPI] Error fetching latest telemetry for ${deviceUUID}:`, error)
    throw error
  }
}

/**
 * Fetch latest telemetry for multiple devices in parallel
 * Note: For bulk operations, use fetchAllDevicesLatestTelemetry() instead
 * Returns telemetry data for all devices
 */
export async function fetchMultipleDevicesLatestTelemetry(
  deviceUUIDs: string[],
  keys?: string[]
): Promise<Map<string, DeviceTelemetryData>> {
  try {
    const promises = deviceUUIDs.map(uuid =>
      fetchDeviceLatestTelemetry(uuid, keys)
        .catch(error => {
          console.warn(`Failed to fetch telemetry for device ${uuid}:`, error)
          return null
        })
    )

    const results = await Promise.all(promises)

    const telemetryMap = new Map<string, DeviceTelemetryData>()
    results.forEach((data, index) => {
      if (data) {
        telemetryMap.set(deviceUUIDs[index], data)
      }
    })

    return telemetryMap
  } catch (error) {
    console.error('[EquipmentTelemetryAPI] Error fetching multiple devices telemetry:', error)
    throw error
  }
}

/**
 * Get the primary telemetry key for a device based on its type
 */
export function getPrimaryTelemetryKey(deviceName: string): string {
  if (deviceName.includes('PM2200')) return 'power' // Power meters
  if (deviceName.includes('t_sensor')) return 'temperature' // Temperature sensors
  if (deviceName.includes('Controller')) return 'status' // Controllers
  return 'power' // Default
}

/**
 * Get all relevant telemetry keys for a device
 */
export function getDeviceTelemetryKeys(deviceName: string): string[] {
  if (deviceName.includes('PM2200')) {
    return ['ActivePowerTotal', 'AccumulatedActiveEnergyDelivered']
  }
  if (deviceName.includes('t_sensor')) {
    return ['Temperature', 'Humidity']
  }
  if (deviceName.includes('Controller')) {
    return ['active', 'online']
  }
  return ['ActivePowerTotal', 'Temperature', 'active']
}

/**
 * Format telemetry value for display
 */
export function formatTelemetryValue(value: string | number | undefined, key: string): string {
  if (value === undefined || value === null) return '--'

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) return String(value)

  // Format based on telemetry key (using ThingsBoard capitalized keys)
  if (key === 'ActivePowerTotal') return numValue.toFixed(1) + ' kW'
  if (key === 'AccumulatedActiveEnergyDelivered') return numValue.toFixed(2) + ' kWh'
  if (key === 'Temperature') return numValue.toFixed(1) + ' °C'
  if (key === 'Humidity') return numValue.toFixed(1) + ' %'
  if (key === 'active') return value ? 'Active' : 'Inactive'

  // Default numeric formatting
  return numValue.toFixed(1)
}

/**
 * Check if device is active based on last activity time
 * Device is considered active if last activity was within the last 5 minutes
 */
export function isDeviceActive(lastActivityTime?: number): boolean {
  if (!lastActivityTime) return false
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000)
  return lastActivityTime > fiveMinutesAgo
}
