/**
 * useEnergyHistoryComparison
 * 
 * Adapter to use the fast energy-history API in the comparison view
 * Converts energy-history API responses to comparison view format
 */

import { ref, computed } from 'vue'
import { useMetersStore } from '@/stores/useMetersStore'

interface ComparisonDataPoint {
  id: string
  meterId: string
  meterLabel: string
  label: string
  value: number
  color: string
  periodLabel?: string
  periodId?: string
  deviceUUID: string
}

export function useEnergyHistoryComparison() {
  const metersStore = useMetersStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const comparisonData = ref<ComparisonDataPoint[]>([])

  /**
   * Fetch comparison data using energy-history API
   * Much faster than the old /comparison endpoint
   */
  async function fetchComparisonDataFromEnergyHistory(options: {
    deviceUUIDs: string[]
    startDate: number // Unix timestamp ms
    endDate: number // Unix timestamp ms
    selectedDates: string[] // Array of YYYY-MM-DD strings
    resolution: 'hourly' | 'daily' // 'daily' for comparison
    metric: 'consumption' | 'energy' // Main metric to use
  }) {
    isLoading.value = true
    error.value = null
    comparisonData.value = []

    try {
      // Build query for energy-history API
      const queryParams = new URLSearchParams({
        devices: options.deviceUUIDs.join(','),
        startDate: options.startDate.toString(),
        endDate: options.endDate.toString(),
        metrics: options.metric,
        resolution: options.resolution
      })

      // Add selectedDates if provided (enables fast per-day parallel fetching)
      if (options.selectedDates.length > 0) {
        queryParams.append('selectedDates', options.selectedDates.join(','))
      }

      console.log('[ComparisonEnergyHistory] Fetching from /telemetry/energy-history', {
        url: `/api/telemetry/energy-history?${queryParams}`,
        deviceCount: options.deviceUUIDs.length,
        dateCount: options.selectedDates.length,
        metric: options.metric
      })

      const response = await fetch(`/api/telemetry/energy-history?${queryParams}`)

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error('Invalid API response format')
      }

      // Transform API response to comparison format
      transformEnergyHistoryToComparison(
        result.data,
        options.deviceUUIDs,
        options.selectedDates,
        options.resolution
      )

      console.log('[ComparisonEnergyHistory] ✓ Fetched', comparisonData.value.length, 'data points')
      return comparisonData.value
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      error.value = message
      console.error('[ComparisonEnergyHistory] Error:', message)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Transform energy-history API response to comparison view format
   * 
   * API response structure:
   * {
   *   "device-uuid": {
   *     "consumption": [
   *       { timestamp: 1707945600000, value: 125.5, hasData: true },
   *       ...
   *     ]
   *   }
   * }
   * 
   * Comparison format:
   * {
   *   id: "meter-id",
   *   meterId: "meter-id",
   *   meterLabel: "Meter Name",
   *   label: "2024-01-01", // period label
   *   periodLabel: "2024-01-01",
   *   value: 125.5,
   *   color: "#ef4444",
   *   deviceUUID: "uuid"
   * }
   */
  function transformEnergyHistoryToComparison(
    apiData: Record<string, Record<string, any[]>>,
    deviceUUIDs: string[],
    selectedDates: string[],
    resolution: 'hourly' | 'daily'
  ) {
    const dataPoints: ComparisonDataPoint[] = []

    // For each device UUID
    for (const deviceUUID of deviceUUIDs) {
      const meter = findMeterByUUID(deviceUUID)
      const meterId = meter?.id || deviceUUID
      const meterLabel = meter?.name || deviceUUID.substring(0, 8)
      const color = metersStore.getMeterColor(meterId)

      // Get the metric data for this device
      const deviceData = apiData[deviceUUID]
      if (!deviceData) {
        console.warn(`[ComparisonEnergyHistory] No data found for device ${deviceUUID}`)
        continue
      }

      // Get the first metric available (should be 'consumption' or 'energy')
      const metricKey = Object.keys(deviceData)[0]
      const metricData = deviceData[metricKey] || []

      // Each data point represents a day (or hour if resolution='hourly')
      metricData.forEach((point: any) => {
        const timestamp = point.timestamp || 0
        const date = new Date(timestamp)
        
        // Format date label based on resolution
        let periodLabel = ''
        if (resolution === 'daily') {
          // YYYY-MM-DD
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          periodLabel = `${year}-${month}-${day}`
        } else if (resolution === 'hourly') {
          // YYYY-MM-DD HH:00
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          const hour = String(date.getHours()).padStart(2, '0')
          periodLabel = `${year}-${month}-${day} ${hour}:00`
        }

        // Only include if it has data
        if (point.hasData && point.value !== null && point.value !== undefined) {
          dataPoints.push({
            id: meterId,
            meterId,
            deviceUUID,
            meterLabel,
            label: meterLabel,
            value: parseFloat(point.value),
            color,
            periodLabel,
            periodId: periodLabel
          })
        }
      })
    }

    comparisonData.value = dataPoints
  }

  /**
   * Find meter by device UUID
   */
  function findMeterByUUID(deviceUUID: string) {
    return metersStore.allMeters.find(m => m.deviceUUID === deviceUUID)
  }

  return {
    isLoading,
    error,
    comparisonData: computed(() => comparisonData.value),
    fetchComparisonDataFromEnergyHistory
  }
}
