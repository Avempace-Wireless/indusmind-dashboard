/**
 * Sensors Store
 * Manages Indusmind temperature sensors with device API integration
 *
 * Features:
 * - Fetches sensors from device API
 * - Enforces max 8 sensor selection limit
 * - Persists selection across views and page reloads
 * - Provides color mapping for chart consistency
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as deviceAPI from '../services/deviceAPI'
import type { Sensor } from '../services/deviceAPI'

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
  const error = ref<string | null>(null)
  const lastModified = ref<Date | null>(null)

  // Color palette for sensors (different from meters)
  const colorPalette = [
    '#f97316', // orange
    '#ef4444', // red
    '#3b82f6', // blue
    '#10b981', // green
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#8b5cf6', // purple
    '#f59e0b', // amber
  ]

  // ===========================
  // ACTIONS
  // ===========================

  /**
   * Fetch all available sensors from API
   * Called on app startup or when data refresh is needed
   */
  async function fetchSensors() {
    try {
      isLoading.value = true
      error.value = null
      allSensors.value = await deviceAPI.getAllSensors()
      // Restore previously selected sensors if available
      restoreSelection()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch sensors'
      console.error('Error fetching sensors:', err)
    } finally {
      isLoading.value = false
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
  async function searchSensors(query: string): Promise<Sensor[]> {
    if (!query.trim()) return allSensors.value
    return deviceAPI.searchSensors(query)
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
    selectedSensors,
    selectedSensorColors,
    canSelectMore,
    stats,

    // Methods
    getSensorById,
    getSensorColor,
    isSensorSelected,
  }
})
