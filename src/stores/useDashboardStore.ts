import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardMetrics, EnergyReading } from '../types'
import { realtimeAPI } from '../services/api'

// Mock compteur data (to be replaced with API)
interface Compteur {
  id: string
  name: string
  category: 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage'
  subtitle: string
  color: 'red' | 'green' | 'blue' | 'yellow'
  instantaneous: number // kW
  today: number // kWh
  yesterday: number // kWh
  linkedEquipment: string[]
}

const mockCompteurs: Compteur[] = [
  {
    id: 'compteur-1',
    name: 'TGBT',
    category: 'TGBT',
    subtitle: 'PM2200-TGBT-Indusmind',
    color: 'red',
    instantaneous: 6479.5,
    today: 6366,
    yesterday: 0,
    linkedEquipment: ['eq-1', 'eq-2', 'eq-3']
  },
  {
    id: 'compteur-2',
    name: 'Compresseurs',
    category: 'Compresseurs',
    subtitle: 'Compresseurs industriels',
    color: 'green',
    instantaneous: 4605,
    today: 4085.2,
    yesterday: 0,
    linkedEquipment: ['eq-4', 'eq-5']
  },
  {
    id: 'compteur-3',
    name: 'Clim',
    category: 'Clim',
    subtitle: 'Climatisation générale',
    color: 'blue',
    instantaneous: 3785.5,
    today: 2134.5,
    yesterday: 0,
    linkedEquipment: ['eq-6', 'eq-7']
  },
  {
    id: 'compteur-4',
    name: 'Éclairage',
    category: 'Éclairage',
    subtitle: 'Éclairage général',
    color: 'yellow',
    instantaneous: 3387.8,
    today: 3039.6,
    yesterday: 0,
    linkedEquipment: ['eq-8']
  },
  {
    id: 'compteur-5',
    name: 'Compresseur Zone 2',
    category: 'Compresseurs',
    subtitle: 'Compresseur secondaire',
    color: 'green',
    instantaneous: 2156.3,
    today: 1876.4,
    yesterday: 0,
    linkedEquipment: ['eq-9']
  },
  {
    id: 'compteur-6',
    name: 'Clim Bureau',
    category: 'Clim',
    subtitle: 'Climatisation bureaux',
    color: 'blue',
    instantaneous: 1245.7,
    today: 987.3,
    yesterday: 0,
    linkedEquipment: ['eq-10', 'eq-11']
  },
]

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const metrics = ref<DashboardMetrics | null>(null)
  const readings = ref<EnergyReading[]>([])
  const isConnected = ref(false)
  const lastUpdate = ref<Date | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const autoRefreshInterval = ref<number | null>(null)
  const compteurs = ref<Compteur[]>(mockCompteurs)
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
    initializeRealtimeUpdates,
    stopRealtimeUpdates,
    retryConnection,
    reset,
  }
})
