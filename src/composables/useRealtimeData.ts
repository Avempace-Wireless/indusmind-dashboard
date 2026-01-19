/**
 * Composable for managing real-time data across the application
 * Handles WebSocket subscriptions, auto-refresh, and state synchronization
 */

import { onMounted, onUnmounted, ref } from 'vue'
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore'
import { useEquipmentStore } from '@/stores/useEquipmentStore'
import { useAlertsStore } from '@/features/alerts/store/useAlertsStore'

export function useRealtimeData() {
  const dashboardStore = useDashboardStore()
  const equipmentStore = useEquipmentStore()
  const alertsStore = useAlertsStore()

  const isInitialized = ref(false)
  const connectionStatus = ref<'connected' | 'disconnected' | 'reconnecting'>('disconnected')

  /**
   * Initialize all real-time data streams
   */
  const initializeRealtimeData = async () => {
    if (isInitialized.value) {
      return
    }

    try {
      connectionStatus.value = 'reconnecting'

      // Load initial data in parallel
      await Promise.all([
        dashboardStore.loadInitialMetrics(),
        equipmentStore.loadEquipment(),
        alertsStore.loadAlerts(),
      ])

      // Start WebSocket subscriptions
      dashboardStore.initializeRealtimeUpdates()

      // Set up periodic refresh for equipment (every 60 seconds)
      const equipmentRefreshInterval = setInterval(() => {
        equipmentStore.loadEquipment().catch((err) => {
          console.error('Equipment refresh failed:', err)
        })
      }, 60000)

      // Set up periodic refresh for alerts (every 30 seconds)
      const alertsRefreshInterval = setInterval(() => {
        alertsStore.loadAlerts().catch((err) => {
          console.error('Alerts refresh failed:', err)
        })
      }, 30000)

      connectionStatus.value = dashboardStore.isConnected ? 'connected' : 'disconnected'
      isInitialized.value = true

      // Return cleanup function
      return () => {
        clearInterval(equipmentRefreshInterval)
        clearInterval(alertsRefreshInterval)
        dashboardStore.stopRealtimeUpdates()
      }
    } catch (error) {
      console.error('Failed to initialize real-time data:', error)
      connectionStatus.value = 'disconnected'
      throw error
    }
  }

  /**
   * Stop all real-time data streams and cleanup
   */
  const stopRealtimeData = () => {
    dashboardStore.stopRealtimeUpdates()
    isInitialized.value = false
    connectionStatus.value = 'disconnected'
  }

  /**
   * Retry connection with exponential backoff
   */
  const retryConnection = async (maxRetries = 3, initialDelay = 1000) => {
    let retries = 0
    let delay = initialDelay

    while (retries < maxRetries) {
      try {
        connectionStatus.value = 'reconnecting'
        await dashboardStore.retryConnection()

        if (dashboardStore.isConnected) {
          connectionStatus.value = 'connected'
          return true
        }
      } catch (error) {
        console.error(`Retry attempt ${retries + 1} failed:`, error)
      }

      retries++
      if (retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      }
    }

    connectionStatus.value = 'disconnected'
    return false
  }

  return {
    // State
    isInitialized,
    connectionStatus,
    // Actions
    initializeRealtimeData,
    stopRealtimeData,
    retryConnection,
    // Store access
    dashboardStore,
    equipmentStore,
    alertsStore,
  }
}
