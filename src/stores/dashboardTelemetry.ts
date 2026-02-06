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
    fetchAllDeviceDataUnified,
    fetchCurrentValue
  } = useTelemetryDynamic()

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Cache for device telemetry data
  const deviceDataCache = ref<Map<string, any>>(new Map())

  /**
   * Fetch real-time data for dashboard widgets
   * OPTIMIZED: Collects ALL requests from ALL compteurs first,
   * then makes ONE single batch API call for everything
   */
  async function fetchDashboardData(compteurs: Compteur[]) {
    loading.value = true
    error.value = null

    try {
      const compteursWithUUID = compteurs.filter(c => c.deviceUUID)

      if (compteursWithUUID.length === 0) {
        loading.value = false
        return []
      }

      console.log('[dashboardTelemetry] 🎯 Collecting ALL requests for', compteursWithUUID.length, 'compteurs')

      const now = Date.now()
      const midnight = new Date()
      midnight.setHours(0, 0, 0, 0)
      const midnightMs = midnight.getTime()
      const yesterdayMidnight = new Date(midnight)
      yesterdayMidnight.setDate(yesterdayMidnight.getDate() - 1)
      const yesterdayMidnightMs = yesterdayMidnight.getTime()

      // ========================================================================
      // BUILD ALL REQUESTS FOR ALL COMPTEURS (collect first, don't fetch yet!)
      // ========================================================================
      const { fetchConsolidatedBatch } = useTelemetryDynamic()
      const allRequests: Array<{ deviceUUID: string; config: any }> = []

      for (const compteur of compteursWithUUID) {
        // 1. Current value
        allRequests.push({
          deviceUUID: compteur.deviceUUID!,
          config: {
            keys: ['ActivePowerTotal'],
            startTs: now - 1000,
            endTs: now,
            limit: 1,
            orderBy: 'DESC'
          }
        })

        // 2. Instantaneous readings (last 30 min)
        allRequests.push({
          deviceUUID: compteur.deviceUUID!,
          config: {
            keys: ['ActivePowerTotal'],
            startTs: now - 30 * 60 * 1000,
            endTs: now,
            interval: 5 * 60 * 1000,
            agg: 'AVG'
          }
        })

        // 3. Today's hourly boundaries
        const hoursInToday = Math.ceil((now - midnightMs) / (60 * 60 * 1000))
        for (let i = 0; i <= hoursInToday; i++) {
          const timestamp = midnightMs + i * 60 * 60 * 1000
          allRequests.push({
            deviceUUID: compteur.deviceUUID!,
            config: {
              keys: ['AccumulatedActiveEnergyDelivered'],
              startTs: timestamp - 60 * 1000,
              endTs: timestamp + 60 * 1000,
              agg: 'MAX',
              limit: 1,
              orderBy: 'DESC'
            }
          })
        }

        // 4. Yesterday's hourly boundaries (24 hours)
        for (let i = 0; i <= 24; i++) {
          const timestamp = yesterdayMidnightMs + i * 60 * 60 * 1000
          allRequests.push({
            deviceUUID: compteur.deviceUUID!,
            config: {
              keys: ['AccumulatedActiveEnergyDelivered'],
              startTs: timestamp - 60 * 1000,
              endTs: timestamp + 60 * 1000,
              agg: 'MAX',
              limit: 1,
              orderBy: 'DESC'
            }
          })
        }
      }

      console.log('[dashboardTelemetry] 🎯 Built', allRequests.length, 'total requests for', compteursWithUUID.length, 'compteurs')
      console.log('[dashboardTelemetry] 🚀 Making 1 SINGLE batch API call...')

      // ========================================================================
      // MAKE ONE SINGLE BATCH API CALL FOR ALL COMPTEURS
      // ========================================================================
      const batchResults = await fetchConsolidatedBatch(allRequests)

      console.log('[dashboardTelemetry] ✓ Received data for', batchResults.size, 'devices from 1 batch call')

      // Debug: Log detailed response structure
      for (const [deviceUUID, data] of batchResults.entries()) {
        const keyBreakdown: Record<string, number> = {}
        data.forEach((dp: any) => {
          keyBreakdown[dp.key] = (keyBreakdown[dp.key] || 0) + 1
        })
        console.log(`[dashboardTelemetry] Device ${deviceUUID.substring(0, 20)}... batch response breakdown:`, keyBreakdown, `(total: ${data.length} points)`)
      }

      // ========================================================================
      // PROCESS RESPONSE FOR EACH COMPTEUR
      // ========================================================================
      const results = compteursWithUUID.map((compteur) => {
        try {
          const deviceData = batchResults.get(compteur.deviceUUID!) || []

          // Extract current value
          const currentPowerData = deviceData.filter((dp: any) =>
            dp.key === 'ActivePowerTotal' && dp.ts > now - 2000
          )
          const currentPower = currentPowerData.length > 0 ? currentPowerData[0].value : 0

          // Extract instantaneous readings
          const instantReadings = deviceData.filter((dp: any) =>
            dp.key === 'ActivePowerTotal' && dp.ts > now - 30 * 60 * 1000
          )

          // Extract today's boundary data
          const todayBoundaryData = deviceData.filter((dp: any) =>
            dp.key === 'AccumulatedActiveEnergyDelivered' &&
            dp.ts >= midnightMs &&
            dp.ts <= now + 2000
          )

          console.log(`[dashboardTelemetry] Today boundary data for ${compteur.name}:`, {
            count: todayBoundaryData.length,
            timestamps: todayBoundaryData.map((d: any) => new Date(d.ts).toLocaleTimeString()).slice(0, 5),
            values: todayBoundaryData.map((d: any) => d.value).slice(0, 5)
          })

          // Compute today's hourly consumption from boundaries
          const todayReadings: any[] = []
          const hoursInToday = Math.ceil((now - midnightMs) / (60 * 60 * 1000))

          for (let i = 0; i < hoursInToday; i++) {
            const currentBoundary = midnightMs + (i + 1) * 60 * 60 * 1000
            const previousBoundary = midnightMs + i * 60 * 60 * 1000

            const currentValue = todayBoundaryData.find((dp: any) =>
              Math.abs(dp.ts - currentBoundary) <= 60 * 1000
            )?.value
            const previousValue = todayBoundaryData.find((dp: any) =>
              Math.abs(dp.ts - previousBoundary) <= 60 * 1000
            )?.value

            if (currentValue !== undefined) {
              const consumption = previousValue !== undefined ? currentValue - previousValue : 0
              todayReadings.push({
                ts: currentBoundary,
                value: Math.max(0, consumption),
                key: 'AccumulatedActiveEnergyDelivered'
              })
            }
          }

          // Extract yesterday's boundary data
          const yesterdayBoundaryData = deviceData.filter((dp: any) =>
            dp.key === 'AccumulatedActiveEnergyDelivered' &&
            dp.ts >= yesterdayMidnightMs &&
            dp.ts < midnightMs + 2000
          )

          // Compute yesterday's hourly consumption from boundaries
          const yesterdayReadings: any[] = []

          for (let i = 0; i < 24; i++) {
            const currentBoundary = yesterdayMidnightMs + (i + 1) * 60 * 60 * 1000
            const previousBoundary = yesterdayMidnightMs + i * 60 * 60 * 1000

            const currentValue = yesterdayBoundaryData.find((dp: any) =>
              Math.abs(dp.ts - currentBoundary) <= 60 * 1000
            )?.value
            const previousValue = yesterdayBoundaryData.find((dp: any) =>
              Math.abs(dp.ts - previousBoundary) <= 60 * 1000
            )?.value

            if (currentValue !== undefined) {
              const consumption = previousValue !== undefined ? currentValue - previousValue : 0
              yesterdayReadings.push({
                ts: currentBoundary,
                value: Math.max(0, consumption),
                key: 'AccumulatedActiveEnergyDelivered'
              })
            }
          }

          // Calculate totals
          const todayEnergy = todayReadings.length > 0
            ? todayReadings.reduce((sum, d) => sum + d.value, 0)
            : 0

          const yesterdayEnergy = yesterdayReadings.length > 0
            ? yesterdayReadings.reduce((sum, d) => sum + d.value, 0)
            : 0

          console.log('[dashboardTelemetry] ✓ Processed data for', compteur.name, {
            currentPower,
            todayEnergy,
            yesterdayEnergy,
            instantReadingsCount: instantReadings.length,
            todayReadingsCount: todayReadings.length,
            yesterdayReadingsCount: yesterdayReadings.length
          })

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
          console.error(`[dashboardTelemetry] Failed to process data for ${compteur.name}:`, err)
          return {
            id: compteur.id,
            deviceUUID: compteur.deviceUUID,
            name: compteur.name,
            instantaneous: 0,
            today: 0,
            yesterday: 0,
            instantReadings: [],
            todayReadings: [],
            yesterdayReadings: []
          }
        }
      })

      // Update cache
      results.forEach(result => {
        deviceDataCache.value.set(result.id, result)
      })

      console.log('[dashboardTelemetry] ✓ Completed: Fetched data for', results.length, 'compteurs in 1 API call')

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
