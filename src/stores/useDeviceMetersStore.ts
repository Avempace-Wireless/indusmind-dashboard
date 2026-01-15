/**
 * Meters Store (Enhanced)
 * Manages PM2200 electrical meters with device API integration
 *
 * Features:
 * - Fetches meters from device API
 * - Enforces max 8 meter selection limit
 * - Persists selection across views and page reloads
 * - Provides color mapping for chart consistency
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as deviceAPI from '../services/deviceAPI'
import type { Meter } from '../services/deviceAPI'

/**
 * Maximum number of meters that can be selected for visualization
 */
const MAX_SELECTABLE_METERS = 8

/**
 * Enhanced Meter for internal use (includes UI metadata)
 */
export interface MeterUIState extends Meter {
  color?: string
  icon?: string
}

/**
 * Meters Store
 * Single source of truth for PM2200 electrical meters
 */
export const useMetersStore = defineStore('meters', () => {
  // ===========================
  // STATE
  // ===========================

  const allMeters = ref<Meter[]>([])
  const selectedMeterIds = ref<string[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastModified = ref<Date | null>(null)

  // Color palette for meters (rotates through colors)
  const colorPalette = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ]

  // ===========================
  // ACTIONS
  // ===========================

  /**
   * Fetch all available meters from API
   * Called on app startup or when data refresh is needed
   */
  async function fetchMeters() {
    try {
      isLoading.value = true
      error.value = null
      allMeters.value = await deviceAPI.getAllMeters()
      // Restore previously selected meters if available
      restoreSelection()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch meters'
      console.error('Error fetching meters:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set selected meters by ID array
   * Enforces max 8 selection limit
   */
  function setSelectedMeters(meterIds: string[]) {
    // Enforce max selection limit
    const validIds = meterIds.slice(0, MAX_SELECTABLE_METERS)

    // Validate that IDs exist in allMeters
    const filteredIds = validIds.filter(id =>
      allMeters.value.some(m => m.id === id)
    )

    selectedMeterIds.value = filteredIds
    lastModified.value = new Date()
    persistSelection()
  }

  /**
   * Toggle a single meter selection
   * Respects max 8 selection limit
   */
  function toggleMeter(meterId: string) {
    const idx = selectedMeterIds.value.indexOf(meterId)

    if (idx > -1) {
      // Remove if already selected
      selectedMeterIds.value.splice(idx, 1)
    } else {
      // Add if not selected and under limit
      if (selectedMeterIds.value.length < MAX_SELECTABLE_METERS) {
        selectedMeterIds.value.push(meterId)
      }
    }

    lastModified.value = new Date()
    persistSelection()
  }

  /**
   * Clear all selections
   */
  function clearSelection() {
    selectedMeterIds.value = []
    lastModified.value = new Date()
    persistSelection()
  }

  /**
   * Select all available meters (up to max 8)
   */
  function selectAllMeters() {
    const meterIds = allMeters.value
      .slice(0, MAX_SELECTABLE_METERS)
      .map(m => m.id)
    setSelectedMeters(meterIds)
  }

  /**
   * Restore selection from localStorage
   * Called after fetching meters to restore user's previous selection
   */
  function restoreSelection() {
    try {
      const saved = localStorage.getItem('dashboard:meters:selected')
      if (saved) {
        const ids = JSON.parse(saved)
        // Validate that saved IDs still exist
        const validIds = ids.filter((id: string) =>
          allMeters.value.some(m => m.id === id)
        )
        if (validIds.length > 0) {
          selectedMeterIds.value = validIds
          return
        }
      }
    } catch (e) {
      console.warn('Failed to restore meter selection:', e)
    }
    // No valid saved selection, start empty
    selectedMeterIds.value = []
  }

  /**
   * Persist current selection to localStorage
   */
  function persistSelection() {
    try {
      localStorage.setItem(
        'dashboard:meters:selected',
        JSON.stringify(selectedMeterIds.value)
      )
    } catch (e) {
      console.warn('Failed to persist meter selection:', e)
    }
  }

  /**
   * Clear persisted selection (on logout, reset, etc.)
   */
  function clearPersisted() {
    try {
      localStorage.removeItem('dashboard:meters:selected')
    } catch (e) {
      console.warn('Failed to clear persisted meter selection:', e)
    }
  }

  /**
   * Search meters by name or label
   */
  async function searchMeters(query: string): Promise<Meter[]> {
    if (!query.trim()) return allMeters.value
    return deviceAPI.searchMeters(query)
  }

  // ===========================
  // GETTERS
  // ===========================

  /**
   * Get selected meter objects (not just IDs)
   */
  const selectedMeters = computed(() =>
    allMeters.value.filter(m => selectedMeterIds.value.includes(m.id))
  )

  /**
   * Get meter by ID
   */
  function getMeterById(id: string): Meter | undefined {
    return allMeters.value.find(m => m.id === id)
  }

  /**
   * Get color for a specific meter based on selection order
   */
  function getMeterColor(meterId: string): string {
    const index = selectedMeterIds.value.indexOf(meterId)
    if (index === -1) return '#999999' // gray if not selected
    return colorPalette[index % colorPalette.length]
  }

  /**
   * Get color map for all selected meters
   * Useful for passing to chart components
   */
  const selectedMeterColors = computed(() =>
    Object.fromEntries(
      selectedMeters.value.map(m => [m.id, getMeterColor(m.id)])
    )
  )

  /**
   * Check if a meter is selected
   */
  function isMeterSelected(meterId: string): boolean {
    return selectedMeterIds.value.includes(meterId)
  }

  /**
   * Check if we can select more meters
   */
  const canSelectMore = computed(() =>
    selectedMeterIds.value.length < MAX_SELECTABLE_METERS
  )

  /**
   * Get selection stats
   */
  const stats = computed(() => ({
    total: allMeters.value.length,
    selected: selectedMeterIds.value.length,
    remaining: MAX_SELECTABLE_METERS - selectedMeterIds.value.length,
    maxSelectable: MAX_SELECTABLE_METERS,
  }))

  /**
   * Get first selected meter (primary meter)
   * Used in Power and History views for primary selection
   */
  const primaryMeter = computed(() =>
    selectedMeters.value[0] || null
  )

  return {
    // State
    allMeters,
    selectedMeterIds,
    isLoading,
    error,
    lastModified,

    // Constants
    MAX_SELECTABLE_METERS,

    // Actions
    fetchMeters,
    setSelectedMeters,
    toggleMeter,
    clearSelection,
    selectAllMeters,
    restoreSelection,
    persistSelection,
    clearPersisted,
    searchMeters,

    // Getters
    selectedMeters,
    selectedMeterColors,
    canSelectMore,
    stats,
    primaryMeter,

    // Methods
    getMeterById,
    getMeterColor,
    isMeterSelected,
  }
})
