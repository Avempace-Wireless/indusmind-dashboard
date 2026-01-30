import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export interface ChartDataPoint {
  timestamp: number
  date: string
  readableDate: string
  value: number
}

export interface SensorChartData {
  deviceUUID: string
  sensorLabel: string
  sensorName: string
  data: ChartDataPoint[]
}

export interface ThermalChartResponse {
  success: boolean
  data: {
    sensors: SensorChartData[]
  }
}

export interface RelayControlResponse {
  success: boolean
  message: string
  data?: any
}

/**
 * Fetch aggregated temperature chart data from backend
 * 24-hour window with hourly intervals, average aggregation
 * @param sensorIds Optional array of sensor UUIDs to filter
 * @param startTimestamp Optional start timestamp in milliseconds - will be aligned to HH:00:00
 * @returns Chart data for temperature visualization
 */
export async function fetchThermalChartData(sensorIds?: string[], startTimestamp?: number): Promise<ThermalChartResponse> {
  try {
    let url = `${API_BASE_URL}/api/telemetry/thermal/chart-data`

    const params: string[] = []

    if (sensorIds && sensorIds.length > 0) {
      params.push(`sensorIds=${sensorIds.join(',')}`)
    }

    if (startTimestamp !== undefined) {
      params.push(`startTimestamp=${startTimestamp}`)
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`
    }

    const response = await axios.get<ThermalChartResponse>(url)
    return response.data
  } catch (error) {
    console.error('[ThermalChartAPI] Failed to fetch chart data:', error)
    throw error
  }
}

/**
 * Control relay (start/stop) for a temperature sensor zone
 * @param deviceUUID UUID of the temperature sensor device
 * @param action 'start' or 'stop' - relay state command
 * @returns Control result
 */
export async function controlThermalRelay(
  deviceUUID: string,
  action: 'start' | 'stop'
): Promise<RelayControlResponse> {
  try {
    const response = await axios.post<RelayControlResponse>(
      `${API_BASE_URL}/api/telemetry/thermal/relay-control`,
      {
        deviceUUID,
        action
      }
    )
    return response.data
  } catch (error) {
    console.error(`[ThermalChartAPI] Failed to control relay (${action}):`, error)
    throw error
  }
}

/**
 * Convert chart data to ApexCharts compatible format
 * @param chartData Sensor chart data
 * @returns ApexCharts series format
 */
export function convertToChartSeries(chartData: SensorChartData[]) {
  return chartData.map(sensor => ({
    name: sensor.sensorLabel,
    data: sensor.data.map(point => ({
      x: new Date(point.timestamp).getTime(),
      y: point.value,
    })),
  }))
}
