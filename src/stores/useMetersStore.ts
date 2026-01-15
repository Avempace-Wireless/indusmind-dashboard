import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { METERS_DATA, type Meter, type MeterElement, getAllCategories } from '../data/metersData'

/**
 * Meter Metadata Interface
 * Defines the structure of meter information
 */
export interface MeterMetadata {
  id: string
  name: string
  category: 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage' | 'Other'
  subtitle: string
  unit: string // kWh, kW, V, A, etc.
  site: string // Physical location
  color: 'red' | 'green' | 'blue' | 'yellow' | string
  icon: string // Material icon name
  status: 'online' | 'offline'
  linkedEquipment: string[]
  translationKey?: string
  lastReadTime?: Date
  elements?: string[] // Element IDs (e.g., ['L1', 'L2', 'L3'])
}

/**
 * Centralized Meters Store
 * Single source of truth for:
 * - All available meters
 * - Selected meters (persisted across views)
 * - Meter metadata and colors
 *
 * This store ensures meter selection is:
 * ✅ Consistent across Dashboard, Power, History, Comparison
 * ✅ Persisted via localStorage
 * ✅ Updated from any view, reflected in all views
 */
export const useMetersStore = defineStore('meters', () => {
  // ===========================
  // STATE - Single Source of Truth
  // ===========================

  /**
   * All available meters in the system
   * Loaded from centralized data source
   */
  const allMeters = ref<MeterMetadata[]>(
    METERS_DATA.map(meter => ({
      id: meter.id,
      name: meter.name,
      category: meter.category,
      subtitle: meter.subtitle,
      unit: meter.unit,
      site: meter.site,
      color: meter.color,
      icon: meter.icon,
      status: meter.status,
      linkedEquipment: meter.linkedEquipment,
      translationKey: meter.translationKey,
      elements: meter.elements?.map(el => el.id) as any // Extract element IDs only
    }))
  )

  /**
   * Currently selected meter IDs
   * Cross-view visible state
   * Persisted to localStorage as 'meters:selected'
   */
  const selectedMeterIds = ref<string[]>([])

  /**
   * Last update timestamp for reactivity
   */
  const lastModified = ref<Date | null>(null)

  // ===========================
  // ACTIONS - State Mutations
  // ===========================

  /**
   * Toggle a single meter selection
   * Adds to selection if not selected, removes if selected
   *
   * @param meterId - Meter ID to toggle
   */
  function toggleMeter(meterId: string) {
    const idx = selectedMeterIds.value.indexOf(meterId)
    if (idx > -1) {
      selectedMeterIds.value.splice(idx, 1)
    } else {
      selectedMeterIds.value.push(meterId)
    }
    lastModified.value = new Date()
    persistSelection()
  }

  /**
   * Replace all selected meters with new selection
   * Clears previous selection and sets new one
   *
   * @param meterIds - Array of meter IDs to select
   */
  function setSelectedMeters(meterIds: string[]) {
    selectedMeterIds.value = meterIds
    lastModified.value = new Date()
    persistSelection()
  }

  /**
   * Select all available meters
   */
  function selectAllMeters() {
    selectedMeterIds.value = allMeters.value.map(m => m.id)
    lastModified.value = new Date()
    persistSelection()
  }

  /**
   * Deselect all meters (clear selection)
   */
  function clearSelection() {
    selectedMeterIds.value = []
    lastModified.value = new Date()
    persistSelection()
  }

  /**
   * Restore selection from localStorage
   * Called on app startup (in router guard or App.vue onMounted)
   * Validates and cleans up invalid IDs (e.g., old 'compteur-X' format)
   * Falls back to first 8 meters if no valid selection found
   */
  function restoreSelection() {
    try {
      const saved = localStorage.getItem('meters:selected')
      if (saved) {
        const restored = JSON.parse(saved)
        if (Array.isArray(restored)) {
          // Validate that restored IDs still exist in current meter list
          const validIds = restored.filter((id: string) =>
            allMeters.value.some(m => m.id === id)
          )

          // If we have valid IDs and some were filtered out, clean up localStorage
          if (validIds.length > 0 && validIds.length < restored.length) {
            console.warn('Cleaning up invalid meter IDs from localStorage:', restored.filter(id => !validIds.includes(id)))
            selectedMeterIds.value = validIds
            persistSelection() // Save cleaned list
            return
          }

          // If all IDs are valid, use them
          if (validIds.length > 0) {
            selectedMeterIds.value = validIds
            return
          }
        }
      }
      // Default: select first 8 meters if no valid saved selection
      selectedMeterIds.value = allMeters.value.slice(0, 8).map(m => m.id)
      persistSelection()
    } catch (e) {
      console.warn('Failed to restore meter selection:', e)
      // On error, select first 8 as fallback
      selectedMeterIds.value = allMeters.value.slice(0, 8).map(m => m.id)
      try {
        persistSelection()
      } catch (e2) {
        console.warn('Failed to save fallback selection:', e2)
      }
    }
  }

  /**
   * Persist current selection to localStorage
   * Validates IDs before persisting to ensure data integrity
   * Called automatically after any selection change
   */
  function persistSelection() {
    try {
      // Only save valid IDs that exist in allMeters
      const validIds = selectedMeterIds.value.filter((id: string) =>
        allMeters.value.some(m => m.id === id)
      )
      localStorage.setItem('meters:selected', JSON.stringify(validIds))
    } catch (e) {
      console.warn('Failed to persist meter selection:', e)
      // Quota exceeded or other error, continue without persistence
    }
  }

  /**
   * Clear all persisted data
   * Called on logout or reset
   */
  function clearPersisted() {
    try {
      localStorage.removeItem('meters:selected')
    } catch (e) {
      console.warn('Failed to clear persisted meter selection:', e)
    }
  }

  // ===========================
  // GETTERS - Computed Access
  // ===========================

  /**
   * Get currently selected meter objects (not just IDs)
   * Used by views to render selected meters
   */
  const selectedMeters = computed(() =>
    allMeters.value.filter(m => selectedMeterIds.value.includes(m.id))
  )

  /**
   * Get meter by ID with fallback
   * Returns meter object or undefined
   *
   * @param meterId - Meter ID to look up
   */
  function getMeterById(meterId: string): MeterMetadata | undefined {
    return allMeters.value.find(m => m.id === meterId)
  }

  /**
   * Get color for a specific meter
   * Used in charts across all views for consistent coloring
   *
   * @param meterId - Meter ID
   * @returns Hex color or fallback gray
   */
  function getMeterColor(meterId: string): string {
    const meter = getMeterById(meterId)
    if (!meter) return '#999999'

    // Map color names to hex values
    const colorMap: Record<string, string> = {
      red: '#ef4444',
      green: '#22c55e',
      blue: '#3b82f6',
      yellow: '#f59e0b',
    }

    return colorMap[meter.color] || meter.color
  }

  /**
   * Get all meters by category
   * Useful for grouping or filtering
   *
   * @param category - Meter category
   */
  function getMetersByCategory(category: string) {
    return allMeters.value.filter(m => m.category === category)
  }

  /**
   * Check if a specific meter is selected
   *
   * @param meterId - Meter ID
   */
  function isMeterSelected(meterId: string): boolean {
    return selectedMeterIds.value.includes(meterId)
  }

  /**
   * Get meter count statistics
   * Used for UI feedback (e.g., "3 of 6 selected")
   */
  const meterStats = computed(() => ({
    total: allMeters.value.length,
    selected: selectedMeterIds.value.length,
    online: allMeters.value.filter(m => m.status === 'online').length,
    offline: allMeters.value.filter(m => m.status === 'offline').length,
  }))

  /**
   * Get color map for all selected meters
   * Used for consistent chart coloring
   */
  const selectedMeterColors = computed(() =>
    Object.fromEntries(
      selectedMeters.value.map(m => [m.id, getMeterColor(m.id)])
    )
  )

  /**
   * Get meters by category
   */
  const metersByCategory = computed(() => {
    const grouped: Record<string, MeterMetadata[]> = {}
    allMeters.value.forEach(meter => {
      if (!grouped[meter.category]) {
        grouped[meter.category] = []
      }
      grouped[meter.category].push(meter)
    })
    return grouped
  })

  /**
   * Get full meter data (including time series and KPIs) for a meter
   */
  function getFullMeterData(meterId: string): Meter | undefined {
    return METERS_DATA.find(m => m.id === meterId)
  }

  /**
   * Get element data from a specific meter
   */
  function getElementData(meterId: string, elementId: string): MeterElement | undefined {
    const meter = getFullMeterData(meterId)
    if (!meter?.elements) return undefined
    return meter.elements.find(el => el.id === elementId)
  }

  /**
   * Get categories list
   */
  function getCategories() {
    return getAllCategories()
  }

  return {
    // State
    allMeters,
    selectedMeterIds,
    lastModified,

    // Actions
    toggleMeter,
    setSelectedMeters,
    selectAllMeters,
    clearSelection,
    restoreSelection,
    persistSelection,
    clearPersisted,
    getFullMeterData,
    getElementData,
    getCategories,

    // Getters (computed)
    selectedMeters,
    meterStats,
    selectedMeterColors,
    metersByCategory,

    // Methods (functions)
    getMeterById,
    getMeterColor,
    getMetersByCategory,
    isMeterSelected,
  }
})
