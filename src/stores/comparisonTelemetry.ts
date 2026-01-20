/**
 * Comparison Store with Telemetry Integration
 * Handles multi-device comparison with real telemetry data
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchMultiDeviceTelemetry, getTimeRange, type TelemetryQueryParams } from '@/services/telemetryAPI'
import type { Compteur } from '@/services/deviceAPI'

export interface ComparisonDataPoint {
  meterId: string
  meterName: string
  period: string
  value: number
  unit: string
}

export const useComparisonTelemetryStore = defineStore('comparisonTelemetry', () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const comparisonData = ref<ComparisonDataPoint[]>([])

  /**
   * Compare multiple devices over the same period
   * @param compteurs - Devices to compare
   * @param period - Time period
   * @param metric - Metric to compare (e.g., 'energy', 'power', 'consumption')
   */
  async function compareDevices(
    compteurs: Compteur[],
    period: '1h' | '6h' | '24h' | '7d' | '30d',
    metric: 'energy' | 'power' | 'consumption' = 'energy'
  ) {
    loading.value = true
    error.value = null
    comparisonData.value = []

    try {
      // Map metric to telemetry keys
      const keyMap = {
        energy: ['ActiveEnergyTotal'],
        power: ['ActivePowerTotal'],
        consumption: ['ActiveEnergyTotal'],
      }

      const keys = keyMap[metric]
      const { startTs, endTs, interval } = getTimeRange(period)

      // Fetch data for all devices
      const deviceUUIDs = compteurs
        .filter(c => c.deviceUUID)
        .map(c => c.deviceUUID!)

      if (deviceUUIDs.length === 0) {
        throw new Error('No devices with UUIDs available')
      }

      const results = await fetchMultiDeviceTelemetry(deviceUUIDs, {
        keys,
        startTs,
        endTs,
        interval,
        agg: metric === 'power' ? 'AVG' : 'SUM',
        orderBy: 'ASC',
      })

      // Transform to comparison format
      comparisonData.value = results.map(({ deviceUUID, data }) => {
        const compteur = compteurs.find(c => c.deviceUUID === deviceUUID)
        const firstKey = keys[0]
        const dataPoints = data.data[firstKey] || []

        // Calculate total/average based on metric
        const total = dataPoints.reduce(
          (sum: number, dp: any) => sum + parseFloat(String(dp.value)),
          0
        )
        const average = dataPoints.length > 0 ? total / dataPoints.length : 0

        return {
          meterId: compteur?.id || deviceUUID,
          meterName: compteur?.name || deviceUUID,
          period,
          value: metric === 'power' ? average : total,
          unit: metric === 'power' ? 'kW' : 'kWh',
        }
      })

      return comparisonData.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to compare devices'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Compare single device across multiple periods
   * @param compteur - Device to analyze
   * @param periods - Array of periods to compare
   * @param metric - Metric to compare
   */
  async function comparePeriodsForDevice(
    compteur: Compteur,
    periods: Array<'1h' | '6h' | '24h' | '7d' | '30d'>,
    metric: 'energy' | 'power' = 'energy'
  ) {
    if (!compteur.deviceUUID) {
      throw new Error('Device UUID not available')
    }

    loading.value = true
    error.value = null
    comparisonData.value = []

    try {
      const keyMap = {
        energy: ['ActiveEnergyTotal'],
        power: ['ActivePowerTotal'],
      }

      const keys = keyMap[metric]

      // Fetch data for each period
      const promises = periods.map(async (period) => {
        const { startTs, endTs, interval } = getTimeRange(period)

        try {
          const results = await fetchMultiDeviceTelemetry([compteur.deviceUUID!], {
            keys,
            startTs,
            endTs,
            interval,
            agg: metric === 'power' ? 'AVG' : 'SUM',
            orderBy: 'ASC',
          })

          const data = results[0]?.data.data[keys[0]] || []
          const total = data.reduce(
            (sum: number, dp: any) => sum + parseFloat(String(dp.value)),
            0
          )
          const average = data.length > 0 ? total / data.length : 0

          return {
            meterId: compteur.id,
            meterName: compteur.name,
            period,
            value: metric === 'power' ? average : total,
            unit: metric === 'power' ? 'kW' : 'kWh',
          }
        } catch (err) {
          console.error(`Failed to fetch period ${period}:`, err)
          return {
            meterId: compteur.id,
            meterName: compteur.name,
            period,
            value: 0,
            unit: metric === 'power' ? 'kW' : 'kWh',
          }
        }
      })

      comparisonData.value = await Promise.all(promises)
      return comparisonData.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to compare periods'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get ranking of devices by consumption/power
   */
  const ranking = computed(() => {
    return [...comparisonData.value].sort((a, b) => b.value - a.value)
  })

  /**
   * Get highest consumer
   */
  const highest = computed(() => {
    return ranking.value[0] || null
  })

  /**
   * Get lowest consumer
   */
  const lowest = computed(() => {
    return ranking.value[ranking.value.length - 1] || null
  })

  /**
   * Get total across all devices
   */
  const total = computed(() => {
    return comparisonData.value.reduce((sum, item) => sum + item.value, 0)
  })

  /**
   * Get average across all devices
   */
  const average = computed(() => {
    return comparisonData.value.length > 0
      ? total.value / comparisonData.value.length
      : 0
  })

  /**
   * Clear comparison data
   */
  function clearData() {
    comparisonData.value = []
    error.value = null
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    comparisonData: computed(() => comparisonData.value),
    ranking,
    highest,
    lowest,
    total,
    average,
    compareDevices,
    comparePeriodsForDevice,
    clearData,
  }
})
