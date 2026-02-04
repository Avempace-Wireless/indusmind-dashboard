/**
 * Dashboard Store with Telemetry Integration
 * Enhanced to fetch real telemetry data from ThingsBoard
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTelemetryDynamic, TELEMETRY_KEYS } from '@/composables/useTelemetryDynamic'
import type { Compteur } from '@/services/deviceAPI'

export const useDashboardTelemetryStore = defineStore('dashboardTelemetry', () => {
  const {
    fetchInstantaneous,
    fetchTodayHourly,
    fetchYesterdayHourly,
    fetchCurrentValue,
    fetchChartData
  } = useTelemetryDynamic()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Cache for device telemetry data
  const deviceDataCache = ref<Map<string, any>>(new Map())

  /**
   * Fetch real-time data for dashboard widgets
   */
  async function fetchDashboardData(compteurs: Compteur[]) {
    loading.value = true
    error.value = null

    try {
      const promises = compteurs
        .filter(c => c.deviceUUID)
        .map(async (compteur) => {
          try {
            // Fetch current instantaneous power
            const currentPower = await fetchCurrentValue(
              compteur.deviceUUID!,
              'ActivePowerTotal'
            )

            // Fetch today's energy total
            const todayEnergy = await fetchCurrentValue(
              compteur.deviceUUID!,
              'ActiveEnergyTotal'
            )

            // Fetch instantaneous readings for mini chart
            const instantReadings = await fetchInstantaneous(
              compteur.deviceUUID!,
              ['ActivePowerTotal']
            )

            // Fetch today's hourly readings using differential method
            const todayReadings = await fetchTodayHourly(
              compteur.deviceUUID!,
              ['AccumulatedActiveEnergyDelivered']
            )

            // Fetch yesterday's hourly readings using differential method
            const yesterdayReadings = await fetchYesterdayHourly(
              compteur.deviceUUID!,
              ['AccumulatedActiveEnergyDelivered']
            )

            // Calculate yesterday's total energy consumption
            const yesterdayEnergy = yesterdayReadings.length > 0
              ? yesterdayReadings.reduce((sum, d) => sum + d.value, 0)
              : 0

            return {
              id: compteur.id,
              deviceUUID: compteur.deviceUUID,
              name: compteur.name,
              instantaneous: currentPower,
              today: todayEnergy,
              yesterday: yesterdayEnergy,
              instantReadings,
              todayReadings,
              yesterdayReadings,
            }
          } catch (err) {
            console.error(`Failed to fetch data for ${compteur.name}:`, err)
            return {
              id: compteur.id,
              deviceUUID: compteur.deviceUUID,
              name: compteur.name,
              instantaneous: 0,
              today: 0,
              yesterday: 0,
              instantReadings: [],
              todayReadings: [],
            }
          }
        })

      const results = await Promise.all(promises)

      // Update cache
      results.forEach(result => {
        deviceDataCache.value.set(result.id, result)
      })

      return results
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get cached data for a device
   */
  function getCachedData(deviceId: string) {
    return deviceDataCache.value.get(deviceId)
  }

  /**
   * Clear cache
   */
  function clearCache() {
    deviceDataCache.value.clear()
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchDashboardData,
    getCachedData,
    clearCache,
  }
})
