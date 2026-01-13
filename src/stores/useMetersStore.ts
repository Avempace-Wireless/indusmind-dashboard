import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
   * Fetched once from API or config, cached in memory
   */
  const allMeters = ref<MeterMetadata[]>([
    {
      id: 'compteur-1',
      name: 'TGBT',
      category: 'TGBT',
      subtitle: 'PM2200-TGBT-Indusmind',
      unit: 'kWh',
      site: 'Main',
      color: 'red',
      icon: 'electric_bolt',
      status: 'online',
      linkedEquipment: ['eq-1', 'eq-2', 'eq-3']
    },
    {
      id: 'compteur-2',
      name: 'Compresseurs',
      category: 'Compresseurs',
      subtitle: 'Compresseurs industriels',
      unit: 'kWh',
      site: 'Main',
      color: 'green',
      icon: 'compress',
      status: 'online',
      linkedEquipment: ['eq-4', 'eq-5'],
      translationKey: 'equipment.compressorsIndustrial'
    },
    {
      id: 'compteur-3',
      name: 'Clim',
      category: 'Clim',
      subtitle: 'Climatisation générale',
      unit: 'kWh',
      site: 'Main',
      color: 'blue',
      icon: 'ac_unit',
      status: 'online',
      linkedEquipment: ['eq-6', 'eq-7'],
      translationKey: 'equipment.climGeneral'
    },
    {
      id: 'compteur-4',
      name: 'Éclairage',
      category: 'Éclairage',
      subtitle: 'Éclairage général',
      unit: 'kWh',
      site: 'Main',
      color: 'yellow',
      icon: 'lightbulb',
      status: 'online',
      linkedEquipment: ['eq-8'],
      translationKey: 'equipment.lightingGeneral'
    },
    {
      id: 'compteur-5',
      name: 'Compresseur Zone 2',
      category: 'Compresseurs',
      subtitle: 'Compresseur secondaire',
      unit: 'kWh',
      site: 'Zone 2',
      color: 'green',
      icon: 'compress',
      status: 'online',
      linkedEquipment: ['eq-9'],
      translationKey: 'equipment.compressorSecondary'
    },
    {
      id: 'compteur-6',
      name: 'Clim Bureau',
      category: 'Clim',
      subtitle: 'Climatisation bureaux',
      unit: 'kWh',
      site: 'Office',
      color: 'blue',
      icon: 'ac_unit',
      status: 'online',
      linkedEquipment: ['eq-10', 'eq-11'],
      translationKey: 'equipment.climOffices'
    }
  ])

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
   * Falls back to default (first 4 meters) if no saved selection
   */
  function restoreSelection() {
    try {
      const saved = localStorage.getItem('meters:selected')
      if (saved) {
        const restored = JSON.parse(saved)
        // Validate that restored IDs still exist
        const validIds = restored.filter((id: string) =>
          allMeters.value.some(m => m.id === id)
        )
        if (validIds.length > 0) {
          selectedMeterIds.value = validIds
          return
        }
      }
      // Default: select first 4 meters if no valid saved selection
      selectAllMeters()
    } catch (e) {
      console.warn('Failed to restore meter selection:', e)
      // On error, select all as fallback
      selectAllMeters()
    }
  }

  /**
   * Persist current selection to localStorage
   * Called automatically after any selection change
   */
  function persistSelection() {
    try {
      localStorage.setItem('meters:selected', JSON.stringify(selectedMeterIds.value))
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
      green: '#10b981',
      blue: '#3b82f6',
      yellow: '#eab308',
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

    // Getters (computed)
    selectedMeters,
    meterStats,
    selectedMeterColors,

    // Methods (functions)
    getMeterById,
    getMeterColor,
    getMetersByCategory,
    isMeterSelected,
  }
})
