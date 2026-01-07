/**
 * useCompteurSelection Composable
 * Manages compteur (meter) selection, aggregation, and persistence
 *
 * Handles:
 * - User's selected compteur IDs (via localStorage)
 * - Per-widget mode switching (Instantanée/Jour/Hier)
 * - Aggregation calculations (sum of selected compteurs)
 * - Equipment filtering by selected compteurs
 */

import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { useDashboardStore } from '@/stores/useDashboardStore'
import { useEquipmentStore } from '@/stores/useEquipmentStore'

// Type definitions
export interface Compteur {
  id: string
  name: string
  category: 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage'
  subtitle: string
  color: 'red' | 'green' | 'blue' | 'yellow'
  instantaneous: number // kW (current)
  today: number // kWh (cumulative today)
  yesterday: number // kWh (yesterday total)
  linkedEquipment: string[] // Equipment IDs linked to this compteur
}

export type CompteurMode = 'instantanée' | 'jour' | 'hier'

interface WidgetModes {
  [compteurId: string]: CompteurMode
}

/**
 * Composable for managing compteur selection and aggregation
 *
 * @returns {Object} Selection state, computations, and handlers
 */
export function useCompteurSelection() {
  const dashboardStore = useDashboardStore()
  const equipmentStore = useEquipmentStore()

  // ============================================================================
  // STATE
  // ============================================================================

  /**
   * Selected compteur IDs (persisted to localStorage)
   * Default: First 4 available compteurs
   */
  const selectedCompteurIds: Ref<string[]> = ref([])

  /**
   * Per-widget mode switching
   * Tracks which mode each compteur is displayed in
   * Default: All widgets in 'instantanée' mode
   */
  const widgetModes: Ref<WidgetModes> = ref({})

  /**
   * Flag: Is compteur selector modal visible?
   */
  const showCompteurSelector: Ref<boolean> = ref(false)

  // ============================================================================
  // INITIALIZATION & PERSISTENCE
  // ============================================================================

  /**
   * Load persisted compteur selection from localStorage
   * Fallback: First 4 available compteurs if no saved selection
   */
  function loadPersistedSelection() {
    try {
      const stored = localStorage.getItem('dashboard_selected_compteurs')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          selectedCompteurIds.value = parsed
        } else {
          selectDefaultCompteurs()
        }
      } else {
        selectDefaultCompteurs()
      }
    } catch (error) {
      console.error('Failed to load compteur selection from localStorage:', error)
      selectDefaultCompteurs()
    }

    // Initialize widget modes for selected compteurs
    selectedCompteurIds.value.forEach((id) => {
      if (!widgetModes.value[id]) {
        widgetModes.value[id] = 'instantanée'
      }
    })
  }

  /**
   * Select default 4 compteurs (first 4 available)
   */
  function selectDefaultCompteurs() {
    const availableCompteurs = dashboardStore.compteurs || []
    selectedCompteurIds.value = availableCompteurs.slice(0, 4).map((c) => c.id)
  }

  /**
   * Persist compteur selection to localStorage
   */
  function persistSelection() {
    try {
      localStorage.setItem('dashboard_selected_compteurs', JSON.stringify(selectedCompteurIds.value))
    } catch (error) {
      console.error('Failed to persist compteur selection to localStorage:', error)
    }
  }

  // ============================================================================
  // SELECTION MANAGEMENT
  // ============================================================================

  /**
   * Add a compteur to selection
   */
  function addCompteur(compteurId: string) {
    if (!selectedCompteurIds.value.includes(compteurId)) {
      selectedCompteurIds.value.push(compteurId)
      // Initialize mode for new compteur
      if (!widgetModes.value[compteurId]) {
        widgetModes.value[compteurId] = 'instantanée'
      }
      persistSelection()
    }
  }

  /**
   * Remove a compteur from selection
   */
  function removeCompteur(compteurId: string) {
    const index = selectedCompteurIds.value.indexOf(compteurId)
    if (index > -1) {
      selectedCompteurIds.value.splice(index, 1)
      // Clean up widget mode for removed compteur
      delete widgetModes.value[compteurId]
      persistSelection()
    }
  }

  /**
   * Set mode for a specific compteur widget
   */
  function setCompteurMode(compteurId: string, mode: CompteurMode) {
    widgetModes.value[compteurId] = mode
  }

  /**
   * Get value for a compteur in a specific mode
   */
  function getCompteurValue(compteurId: string, mode: CompteurMode): number {
    const compteur = dashboardStore.compteurs.find((c) => c.id === compteurId)
    if (!compteur) return 0

    switch (mode) {
      case 'instantanée':
        return compteur.instantaneous
      case 'jour':
        return compteur.today
      case 'hier':
        return compteur.yesterday
      default:
        return 0
    }
  }

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  /**
   * Selected compteur objects (full objects, not just IDs)
   */
  const selectedCompteurs = computed(() => {
    const compteurs = dashboardStore.compteurs || []
    return compteurs.filter((c) => selectedCompteurIds.value.includes(c.id))
  })

  /**
   * All available compteurs (for selector modal)
   */
  const availableCompteurs = computed(() => {
    return dashboardStore.compteurs || []
  })

  /**
   * Aggregated instantaneous power (sum of 'instantanée' mode values)
   * Used for real-time aggregated display
   */
  const aggregatedInstantaneous = computed(() => {
    return selectedCompteurs.value.reduce((sum, compteur) => {
      return sum + compteur.instantaneous
    }, 0)
  })

  /**
   * Aggregated today's consumption (sum of 'jour' mode values)
   */
  const aggregatedToday = computed(() => {
    return selectedCompteurs.value.reduce((sum, compteur) => {
      return sum + compteur.today
    }, 0)
  })

  /**
   * Aggregated yesterday's consumption (sum of 'hier' mode values)
   */
  const aggregatedYesterday = computed(() => {
    return selectedCompteurs.value.reduce((sum, compteur) => {
      return sum + compteur.yesterday
    }, 0)
  })

  /**
   * Mode-aware aggregation
   * Sums values based on each widget's current mode
   * Example: Widget 1 in 'instantanée' (12.5 kW) + Widget 2 in 'jour' (145 kWh) = sum of instantanée only (12.5)
   *
   * For display purposes, use aggregatedInstantaneous (sum of instantanée modes only)
   * This is the primary real-time metric
   */
  const aggregatedByMode = computed(() => {
    let sum = 0
    selectedCompteurs.value.forEach((compteur) => {
      const mode = widgetModes.value[compteur.id] || 'instantanée'
      sum += getCompteurValue(compteur.id, mode)
    })
    return sum
  })

  /**
   * Equipment filtered by selected compteurs
   * Returns only equipment linked to at least one selected compteur
   */
  const filteredEquipment = computed(() => {
    const selectedEquipmentIds = new Set<string>()

    selectedCompteurs.value.forEach((compteur) => {
      const linkedEquipment = compteur.linkedEquipment || []
      linkedEquipment.forEach((equipId) => {
        selectedEquipmentIds.add(equipId)
      })
    })

    const equipment = equipmentStore.equipment || []
    return equipment.filter((eq) => selectedEquipmentIds.has(eq.id))
  })

  /**
   * Count of selected compteurs
   */
  const selectedCount = computed(() => selectedCompteurIds.value.length)

  /**
   * Count of available compteurs
   */
  const availableCount = computed(() => (dashboardStore.compteurs || []).length)

  /**
   * Selection status text: "X of Y compteurs sélectionnés"
   */
  const selectionStatusText = computed(() => {
    return `${selectedCount.value} de ${availableCount.value} compteurs sélectionnés`
  })

  // ============================================================================
  // WATCHERS & SIDE EFFECTS
  // ============================================================================

  /**
   * Watch for changes to selected IDs and persist to localStorage
   */
  watch(selectedCompteurIds, () => {
    persistSelection()
  }, { deep: true })

  /**
   * Initialize on mount
   */
  function initialize() {
    loadPersistedSelection()
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    // State
    selectedCompteurIds,
    widgetModes,
    showCompteurSelector,

    // Computations
    selectedCompteurs,
    availableCompteurs,
    aggregatedInstantaneous,
    aggregatedToday,
    aggregatedYesterday,
    aggregatedByMode,
    filteredEquipment,
    selectedCount,
    availableCount,
    selectionStatusText,

    // Methods
    loadPersistedSelection,
    selectDefaultCompteurs,
    persistSelection,
    addCompteur,
    removeCompteur,
    setCompteurMode,
    getCompteurValue,
    initialize,
  }
}
