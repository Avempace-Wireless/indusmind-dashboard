
/**
 * History Store with Telemetry Integration
 * Fetches historical telemetry data for energy history view
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchDeviceTelemetry, getTimeRange, type TelemetryQueryParams } from '@/services/telemetryAPI'
import type { Compteur } from '@/services/deviceAPI'

export interface HistoricalDataPoint {
  timestamp: number
  date: string
  [meterKey: string]: number | string // Dynamic meter values
}

export const useHistoryTelemetryStore = defineStore('historyTelemetry', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const historicalData = ref<HistoricalDataPoint[]>([])

  /**
   * Fetch historical data for multiple devices
   * @param compteurs - Selected meters with deviceUUID
   * @param period - Time period ('24h', '7d', '30d', etc.)
   * @param keys - Telemetry keys to fetch (e.g., ['ActiveEnergyTotal'])
   * @param aggregation - Aggregation function ('AVG', 'SUM', 'MAX', 'MIN')
   */
  async function fetchHistoricalData(
    compteurs: Compteur[],
    period: '1h' | '6h' | '24h' | '7d' | '30d',
    keys: string[] = ['ActiveEnergyTotal'],
    aggregation: 'AVG' | 'SUM' | 'MAX' | 'MIN' = 'AVG'
  ) {
    loading.value = true
    error.value = null
    historicalData.value = []

    try {
      const { startTs, endTs, interval } = getTimeRange(period)

      // Fetch data for all compteurs
      const promises = compteurs
        .filter(c => c.deviceUUID)
        .map(async (compteur) => {
          try {
            const response = await fetchDeviceTelemetry(compteur.deviceUUID!, {
              keys,
              startTs,
              endTs,
              interval,
              agg: aggregation,
              orderBy: 'ASC',
            })

            return {
              compteur,
              data: response.data,
            }
          } catch (err) {
            console.error(`Failed to fetch history for ${compteur.name}:`, err)
            return {
              compteur,
              data: {},
            }
          }
        })

      const results = await Promise.all(promises)

      // Transform to chart-friendly format
      // Collect all unique timestamps
      const timestampSet = new Set<number>()
      results.forEach(result => {
        Object.values(result.data).forEach((dataPoints: any) => {
          dataPoints.forEach((dp: any) => timestampSet.add(dp.ts))
        })
      })

      const sortedTimestamps = Array.from(timestampSet).sort((a, b) => a - b)

      // Build data points
      historicalData.value = sortedTimestamps.map(ts => {
        const dataPoint: HistoricalDataPoint = {
          timestamp: ts,
          date: new Date(ts).toLocaleString(),
        }

        // Add each meter's values
        results.forEach(({ compteur, data }) => {
          keys.forEach(key => {
            const meterKey = `${compteur.name}_${key}`
            const dataPoints = data[key] || []
            const point = dataPoints.find((dp: any) => dp.ts === ts)
            dataPoint[meterKey] = point ? parseFloat(String(point.value)) : 0
          })
        })

        return dataPoint
      })

      return historicalData.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch historical data'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch custom date range
   */
  async function fetchCustomRange(
    compteurs: Compteur[],
    startDate: Date,
    endDate: Date,
    intervalMs: number,
    keys: string[] = ['ActiveEnergyTotal'],
    aggregation: 'AVG' | 'SUM' | 'MAX' | 'MIN' = 'AVG'
  ) {
    loading.value = true
    error.value = null

    try {
      const startTs = startDate.getTime()
      const endTs = endDate.getTime()

      const promises = compteurs
        .filter(c => c.deviceUUID)
        .map(async (compteur) => {
          try {
            const response = await fetchDeviceTelemetry(compteur.deviceUUID!, {
              keys,
              startTs,
              endTs,
              interval: intervalMs,
              agg: aggregation,
              orderBy: 'ASC',
            })

            return {
              compteur,
              data: response.data,
            }
          } catch (err) {
            console.error(`Failed to fetch custom range for ${compteur.name}:`, err)
            return {
              compteur,
              data: {},
            }
          }
        })

      const results = await Promise.all(promises)

      // Transform similar to fetchHistoricalData
      const timestampSet = new Set<number>()
      results.forEach(result => {
        Object.values(result.data).forEach((dataPoints: any) => {
          dataPoints.forEach((dp: any) => timestampSet.add(dp.ts))
        })
      })

      const sortedTimestamps = Array.from(timestampSet).sort((a, b) => a - b)

      historicalData.value = sortedTimestamps.map(ts => {
        const dataPoint: HistoricalDataPoint = {
          timestamp: ts,
          date: new Date(ts).toLocaleString(),
        }

        results.forEach(({ compteur, data }) => {
          keys.forEach(key => {
            const meterKey = `${compteur.name}_${key}`
            const dataPoints = data[key] || []
            const point = dataPoints.find((dp: any) => dp.ts === ts)
            dataPoint[meterKey] = point ? parseFloat(String(point.value)) : 0
          })
        })

        return dataPoint
      })

      return historicalData.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch custom range data'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear historical data
   */
  function clearData() {
    historicalData.value = []
    error.value = null
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    historicalData: computed(() => historicalData.value),
    fetchHistoricalData,
    fetchCustomRange,
    clearData,
  }
})
