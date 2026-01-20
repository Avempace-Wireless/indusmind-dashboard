import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardMetrics, EnergyReading } from '@/types'
import { realtimeAPI } from '@/services/api'
import { getAllCompteursFromPM2200, getAllCompteursFromCustomerDevices, type Compteur } from '@/services/deviceAPI'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const metrics = ref<DashboardMetrics | null>(null)
  const readings = ref<EnergyReading[]>([])
  const isConnected = ref(false)
  const lastUpdate = ref<Date | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const autoRefreshInterval = ref<number | null>(null)
  const compteurs = ref<Compteur[]>([])
  let unsubscribeRealtimeUpdates: (() => void) | null = null

  // Computed
  const isHealthy = computed(() => metrics.value?.operationalStatus === 'Healthy')
  const hasAlerts = computed(() => metrics.value?.operationalStatus === 'Critical')
  const recentReadings = computed(() => readings.value.slice(0, 10))
  const currentPower = computed(() => metrics.value?.totalPower || 0)
  const averagePower = computed(() => {
    if (readings.value.length === 0) return 0
    const sum = readings.value.reduce((acc, r) => acc + (r.power || 0), 0)
    return sum / readings.value.length
  })
  const averageVoltage = computed(() => {
    if (readings.value.length === 0) return 0
    const sum = readings.value.reduce((acc, r) => acc + (r.voltage || 0), 0)
    return sum / readings.value.length
  })
  const averageFrequency = computed(() => {
    if (readings.value.length === 0) return 50
    const sum = readings.value.reduce((acc, r) => acc + (r.voltage || 50), 0)
    return sum / readings.value.length
  })

  // Actions
  const updateMetrics = (newMetrics: DashboardMetrics) => {
    metrics.value = newMetrics
    lastUpdate.value = new Date()
    error.value = null
  }

  const addReading = (reading: EnergyReading) => {
    readings.value.unshift(reading)
    // Keep last 100 readings in memory
    if (readings.value.length > 100) {
      readings.value.pop()
    }
  }

  const setConnected = (connected: boolean) => {
    isConnected.value = connected
    if (!connected) {
      error.value = 'Real-time connection lost. Retrying...'
    } else {
      error.value = null
    }
  }

  /**
   * Initialize real-time data streaming
   */
  const initializeRealtimeUpdates = () => {
    if (unsubscribeRealtimeUpdates) {
      return // Already initialized
    }

    loading.value = true
    setConnected(true)

    // Subscribe to WebSocket updates
    unsubscribeRealtimeUpdates = realtimeAPI.subscribeToUpdates(
      (data) => {
        if (data.type === 'meter:update' && data.data) {
          const newMetrics: DashboardMetrics = {
            totalPower: data.data.power,
            totalConsumption: 0, // Will be calculated from readings
            averagePowerFactor: 0.98,
            costPerHour: 0, // Will be calculated based on tariff
            operationalStatus: 'Healthy',
            lastUpdated: new Date(data.data.timestamp),
          }
          updateMetrics(newMetrics)

          // Add to readings history
          addReading({
            equipmentId: 'main',
            timestamp: new Date(data.data.timestamp),
            power: data.data.power,
            consumption: 0,
            powerFactor: 0.98,
            voltage: data.data.voltage,
            current: 0,
            status: 'Normal',
          })
        }
      },
      (error) => {
        console.error('Real-time update error:', error)
        setConnected(false)
      }
    )

    // Set up auto-refresh as fallback (every 30 seconds)
    autoRefreshInterval.value = window.setInterval(() => {
      if (!isConnected.value) {
        retryConnection()
      }
    }, 30000)

    loading.value = false
  }

  /**
   * Load initial metrics from API
   */
  const loadInitialMetrics = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await realtimeAPI.getCurrentMetrics()

      if (response.success) {
        const data = response.data
        const newMetrics: DashboardMetrics = {
          totalPower: data.currentPower,
          totalConsumption: 0,
          averagePowerFactor: data.powerFactor,
          costPerHour: 0,
          operationalStatus: 'Healthy',
          lastUpdated: new Date(data.timestamp),
        }
        updateMetrics(newMetrics)

        // Add initial reading
        addReading({
          equipmentId: 'main',
          timestamp: new Date(data.timestamp),
          power: data.currentPower,
          consumption: 0,
          powerFactor: data.powerFactor,
          voltage: data.voltage,
          current: 0,
          status: 'Normal',
        })
      }
    } catch (err) {
      error.value = 'Failed to load metrics'
      console.error('Load metrics error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Retry connection on failure
   */
  const retryConnection = async () => {
    console.log('Retrying connection...')
    try {
      await loadInitialMetrics()
      setConnected(true)
    } catch (err) {
      setConnected(false)
    }
  }

  /**
   * Stop real-time updates and clean up
   */
  const stopRealtimeUpdates = () => {
    if (unsubscribeRealtimeUpdates) {
      unsubscribeRealtimeUpdates()
      unsubscribeRealtimeUpdates = null
    }
    if (autoRefreshInterval.value) {
      clearInterval(autoRefreshInterval.value)
      autoRefreshInterval.value = null
    }
    setConnected(false)
  }

  const reset = () => {
    stopRealtimeUpdates()
    metrics.value = null
    readings.value = []
    isConnected.value = false
    lastUpdate.value = null
    loading.value = false
    error.value = null
  }

  /**
   * Load compteurs from customer devices API
   * Only uses API data - no mock fallback
   */
  const loadCompteurs = async () => {
    loading.value = true
    error.value = null
    try {
      // Load from customer devices API
      const customerCompteurs = await getAllCompteursFromCustomerDevices()

      compteurs.value = customerCompteurs

      if (customerCompteurs.length > 0) {
        console.log(`Loaded ${customerCompteurs.length} compteurs from customer devices API`)
      } else {
        console.warn('Customer API returned no devices')
      }
    } catch (error) {
      console.error('Failed to load compteurs from API:', error)
        error.value = error instanceof Error ? error.message : 'Failed to load compteurs'
      // Clear compteurs on error - don't show "Unknown" devices
      compteurs.value = []
      } finally {
        loading.value = false
    }
  }

  return {
    // State
    metrics,
    readings,
    isConnected,
    lastUpdate,
    loading,
    error,
    compteurs,
    // Computed
    isHealthy,
    hasAlerts,
    recentReadings,
    currentPower,
    averagePower,
    averageVoltage,
    averageFrequency,
    // Actions
    updateMetrics,
    addReading,
    setConnected,
    loadInitialMetrics,
    loadCompteurs,
    initializeRealtimeUpdates,
    stopRealtimeUpdates,
    retryConnection,
    reset,
  }
})
