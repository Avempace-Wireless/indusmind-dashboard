import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardMetrics, EnergyReading } from '@/types'
import { realtimeAPI } from '@/services/api'
import { getAllCompteursFromPM2200, type Compteur } from '@/services/deviceAPI'

// Mock compteur data (fallback) - matches PM2200 devices from deviceAPI
const mockCompteurs: Compteur[] = [
  {
    id: '8',
    name: 'PM2200 - TGBT Principal',
    category: 'PM2200',
    subtitle: 'TGBT Principal',
    color: 'red',
    instantaneous: 6479.5,
    today: 6366,
    yesterday: 5890,
    linkedEquipment: []
  },
  {
    id: '3',
    name: 'PM2200 - Climatisation Hall',
    category: 'PM2200',
    subtitle: 'Climatisation Hall',
    color: 'blue',
    instantaneous: 3785.5,
    today: 2134.5,
    yesterday: 2050,
    linkedEquipment: []
  },
  {
    id: '4',
    name: 'PM2200 - Compresseur Zone A',
    category: 'PM2200',
    subtitle: 'Compresseur Zone A',
    color: 'green',
    instantaneous: 4605,
    today: 4085.2,
    yesterday: 3950,
    linkedEquipment: []
  },
  {
    id: '5',
    name: 'PM2200 - TGBT Secondaire',
    category: 'PM2200',
    subtitle: 'TGBT Secondaire',
    color: 'yellow',
    instantaneous: 3387.8,
    today: 3039.6,
    yesterday: 2980,
    linkedEquipment: []
  },
  {
    id: '9',
    name: 'PM2200 - Éclairage Général',
    category: 'PM2200',
    subtitle: 'Éclairage Général',
    color: 'yellow',
    instantaneous: 2150.3,
    today: 1890.5,
    yesterday: 1820,
    linkedEquipment: []
  },
  {
    id: '10',
    name: 'PM2200 - Compresseur Zone B',
    category: 'PM2200',
    subtitle: 'Compresseur Zone B',
    color: 'green',
    instantaneous: 3920.1,
    today: 3450.8,
    yesterday: 3380,
    linkedEquipment: []
  },
  {
    id: '11',
    name: 'PM2200 - CVC Bureaux',
    category: 'PM2200',
    subtitle: 'CVC Bureaux',
    color: 'blue',
    instantaneous: 2890.5,
    today: 2560.2,
    yesterday: 2490,
    linkedEquipment: []
  },
  {
    id: '12',
    name: 'PM2200 - Ligne Production',
    category: 'PM2200',
    subtitle: 'Ligne Production',
    color: 'red',
    instantaneous: 5240.8,
    today: 4980.5,
    yesterday: 4850,
    linkedEquipment: []
  }
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

  /**
   * Load compteurs from PM2200 devices API
   */
  const loadCompteurs = async () => {
    try {
      const apiCompteurs = await getAllCompteursFromPM2200()
      if (apiCompteurs.length > 0) {
        compteurs.value = apiCompteurs
      } else {
        // Fallback to mock data if API returns empty
        compteurs.value = mockCompteurs
      }
    } catch (error) {
      console.error('Failed to load compteurs from API:', error)
      // Use mock data on error
      compteurs.value = mockCompteurs
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
