/**
 * Sensors Store
 * Manages Indusmind temperature sensors with device API integration
 *
 * Features:
 * - Fetches sensors from device API
 * - Fetches telemetry data (temperature, humidity, dew point)
 * - Enforces max 8 sensor selection limit
 * - Persists selection across views and page reloads
 * - Provides color mapping for chart consistency
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MOCK_SENSORS, SENSOR_COLOR_PALETTE, getAllSensors } from '@/data/mockData'
import type { Sensor } from '@/data/mockData'
import { getAllIndusmindCustomerDevices } from '@/services/deviceAPI'
import { fetchThermalDashboardData, type ThermalDashboardData } from '@/services/thermalTelemetryAPI'
import { useApiData, useMockData } from '@/config/dataMode'

/**
 * Maximum number of sensors that can be selected for visualization
 */
const MAX_SELECTABLE_SENSORS = 8

/**
 * Sensors Store
 * Single source of truth for temperature sensors
 */
export const useSensorsStore = defineStore('sensors', () => {
  // ===========================
  // STATE
  // ===========================

  const allSensors = ref<Sensor[]>([])
  const selectedSensorIds = ref<string[]>([])
  const isLoading = ref(false)
  const isFetchingTelemetry = ref(false)
  const error = ref<string | null>(null)
  const telemetryError = ref<string | null>(null)
  const lastModified = ref<Date | null>(null)
  const thermalData = ref<ThermalDashboardData | null>(null)

  // Color palette for sensors (different from meters)
  const colorPalette = SENSOR_COLOR_PALETTE

    /**
     * All available sensors (for views that need full list)
     */
    const availableSensors = computed(() => allSensors.value)

  // ===========================
  // ACTIONS
  // ===========================

  /**
   * Fetch all available sensors from API or mock data
   * Filters devices to get only temperature sensors (names containing "T_Sensor")
   * Called on app startup or when data refresh is needed
   */
  async function fetchSensors() {
    try {
      isLoading.value = true
      error.value = null

      if (useApiData()) {
        // Fetch from API and filter for temperature sensors
        const devices = await getAllIndusmindCustomerDevices()

        if (devices && devices.length > 0) {
          // Filter devices: only keep temperature sensors
          const tempSensors = devices.filter((device: any) =>
            device.name.includes('T_Sensor') || device.label?.includes('Zone')
          )

          // Map API devices to Sensor format
          allSensors.value = tempSensors.map((device: any, index: number) => ({
            id: device.id?.toString() || device.deviceUUID,
            name: device.name,
            label: device.label || device.name,
            deviceUUID: device.deviceUUID,
            accessToken: device.accessToken,
            zone: device.label || `Zone ${index + 1}`,
            minTemp: 18, // Default values, could be fetched from telemetry
            maxTemp: 28,
            avgTemp: 22,
            readings: [],
            timeSeries: { hourly: [], daily: [], monthly: [] },
            assignedToCustomer: device.assignedToCustomer || false,
            customerId: device.customerId || 0,
            createdAt: device.createdAt || new Date().toISOString(),
            updatedAt: device.updatedAt || new Date().toISOString()
          }))

          console.log('[SensorsStore] Fetched temperature sensors from API:', allSensors.value.length)
        } else {
          // Fallback to mock data if API fails
          console.warn('[SensorsStore] API returned no data, using mock sensors')
          allSensors.value = getAllSensors()
        }
      } else {
        // Use mock data
        allSensors.value = getAllSensors()
        console.log('[SensorsStore] Using mock sensors:', allSensors.value.length)
      }

      // Restore previously selected sensors if available
      restoreSelection()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch sensors'
      console.error('[SensorsStore] Error fetching sensors:', err)
      // Fallback to mock data on error
      allSensors.value = getAllSensors()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch telemetry data for all available sensors
   * Fetches temperature, humidity, dew point, and historical readings
   * Called to refresh real-time sensor data
   */
  async function fetchSensorsTelemetry() {
    try {
      isFetchingTelemetry.value = true
      telemetryError.value = null

      const sensorsToFetch = useApiData() ? allSensors.value : []

      if (sensorsToFetch.length === 0) {
        console.log('[SensorsStore] No sensors to fetch telemetry for')
        thermalData.value = null
        return
      }

      // Convert Sensor interface to Device format for API
      const devices = sensorsToFetch.map((sensor: any) => ({
        id: sensor.id,
        name: sensor.name,
        label: sensor.label,
        deviceUUID: sensor.deviceUUID,
        accessToken: sensor.accessToken,
        assignedToCustomer: sensor.assignedToCustomer,
        customerId: sensor.customerId,
        createdAt: sensor.createdAt,
        updatedAt: sensor.updatedAt,
      }))

      console.log('[SensorsStore] Fetching telemetry for', devices.length, 'sensors')
      thermalData.value = await fetchThermalDashboardData(false)

      if (thermalData.value.status === 'error') {
        telemetryError.value = thermalData.value.message || 'Failed to fetch telemetry'
        console.error('[SensorsStore] Telemetry fetch error:', telemetryError.value)
      } else if (thermalData.value.status === 'partial') {
        console.warn('[SensorsStore] Partial telemetry data:', thermalData.value.message)
      }

      console.log('[SensorsStore] Telemetry fetched:', thermalData.value.sensors.length, 'sensors')
    } catch (err) {
      telemetryError.value = err instanceof Error ? err.message : 'Failed to fetch telemetry'
      console.error('[SensorsStore] Error fetching telemetry:', err)
      thermalData.value = null
    } finally {
      isFetchingTelemetry.value = false
    }
  }

  /**
   * Set selected sensors by ID array
   * Enforces max 8 selection limit
   */
  function setSelectedSensors(sensorIds: string[]) {
    // Enforce max selection limit
    const validIds = sensorIds.slice(0, MAX_SELECTABLE_SENSORS)

    // Validate that IDs exist in allSensors
    const filteredIds = validIds.filter(id =>
      allSensors.value.some(s => s.id === id)
    )

    selectedSensorIds.value = filteredIds
    lastModified.value = new Date()
    persistSelection()
  }

  /**
   * Toggle a single sensor selection
   * Respects max 8 selection limit
   */
  function toggleSensor(sensorId: string) {
    const idx = selectedSensorIds.value.indexOf(sensorId)

    if (idx > -1) {
      // Remove if already selected
      selectedSensorIds.value.splice(idx, 1)
    } else {
      // Add if not selected and under limit
      if (selectedSensorIds.value.length < MAX_SELECTABLE_SENSORS) {
        selectedSensorIds.value.push(sensorId)
      }
    }

    lastModified.value = new Date()
    persistSelection()
  }

  /**
   * Clear all selections
   */
  function clearSelection() {
    selectedSensorIds.value = []
    lastModified.value = new Date()
    persistSelection()
  }

  /**
   * Select all available sensors (up to max 8)
   */
  function selectAllSensors() {
    const sensorIds = allSensors.value
      .slice(0, MAX_SELECTABLE_SENSORS)
      .map(s => s.id)
    setSelectedSensors(sensorIds)
  }

  /**
   * Restore selection from localStorage
   * Called after fetching sensors to restore user's previous selection
   */
  function restoreSelection() {
    try {
      const saved = localStorage.getItem('dashboard:sensors:selected')
      if (saved) {
        const ids = JSON.parse(saved)
        // Validate that saved IDs still exist
        const validIds = ids.filter((id: string) =>
          allSensors.value.some(s => s.id === id)
        )
        if (validIds.length > 0) {
          selectedSensorIds.value = validIds
          return
        }
      }
    } catch (e) {
      console.warn('Failed to restore sensor selection:', e)
    }
    // No valid saved selection, start empty
    selectedSensorIds.value = []
  }

  /**
   * Persist current selection to localStorage
   */
  function persistSelection() {
    try {
      localStorage.setItem(
        'dashboard:sensors:selected',
        JSON.stringify(selectedSensorIds.value)
      )
    } catch (e) {
      console.warn('Failed to persist sensor selection:', e)
    }
  }

  /**
   * Clear persisted selection (on logout, reset, etc.)
   */
  function clearPersisted() {
    try {
      localStorage.removeItem('dashboard:sensors:selected')
    } catch (e) {
      console.warn('Failed to clear persisted sensor selection:', e)
    }
  }

  /**
   * Search sensors by name or label
   */
  function searchSensors(query: string): Sensor[] {
    if (!query.trim()) return allSensors.value
    const lowerQuery = query.toLowerCase()
    return allSensors.value.filter(s =>
      s.name.toLowerCase().includes(lowerQuery) ||
        (s.zone?.toLowerCase() ?? '').includes(lowerQuery)
    )
  }

  // ===========================
  // GETTERS
  // ===========================

  /**
   * Get selected sensor objects (not just IDs)
   */
  const selectedSensors = computed(() =>
    allSensors.value.filter(s => selectedSensorIds.value.includes(s.id))
  )

  /**
   * Get sensor by ID
   */
  function getSensorById(id: string): Sensor | undefined {
    return allSensors.value.find(s => s.id === id)
  }

  /**
   * Get color for a specific sensor based on selection order
   */
  function getSensorColor(sensorId: string): string {
    const index = selectedSensorIds.value.indexOf(sensorId)
    if (index === -1) return '#999999' // gray if not selected
    return colorPalette[index % colorPalette.length]
  }

  /**
   * Get color map for all selected sensors
   * Useful for passing to chart components
   */
  const selectedSensorColors = computed(() =>
    Object.fromEntries(
      selectedSensors.value.map(s => [s.id, getSensorColor(s.id)])
    )
  )

  /**
   * Check if a sensor is selected
   */
  function isSensorSelected(sensorId: string): boolean {
    return selectedSensorIds.value.includes(sensorId)
  }

  /**
   * Check if we can select more sensors
   */
  const canSelectMore = computed(() =>
    selectedSensorIds.value.length < MAX_SELECTABLE_SENSORS
  )

  /**
   * Get selection stats
   */
  const stats = computed(() => ({
    total: allSensors.value.length,
    selected: selectedSensorIds.value.length,
    remaining: MAX_SELECTABLE_SENSORS - selectedSensorIds.value.length,
    maxSelectable: MAX_SELECTABLE_SENSORS,
  }))

  return {
    // State
    allSensors,
    selectedSensorIds,
    isLoading,
    error,
    lastModified,

    // Constants
    MAX_SELECTABLE_SENSORS,

    // Actions
    fetchSensors,
    setSelectedSensors,
    toggleSensor,
    clearSelection,
    selectAllSensors,
    restoreSelection,
    persistSelection,
    clearPersisted,
    searchSensors,

    // Getters
    availableSensors,
    selectedSensors,
    selectedSensorColors,
    canSelectMore,
    stats,
    thermalData,
    isFetchingTelemetry,
    telemetryError,

    // Methods
    getSensorById,
    getSensorColor,
    isSensorSelected,
    fetchSensorsTelemetry,
  }
})
