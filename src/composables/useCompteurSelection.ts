/**
 * useCompteurSelection Composable
 * Manages compteur (meter) selection and per-widget modes
 *
 * REFACTORED: Now uses centralized useMetersStore for selection
 * ✅ Meter selection synced across all views (Dashboard, Power, History, Comparison)
 * ✅ Selection persisted to localStorage via useMetersStore
 * ✅ Single source of truth for available meters
 *
 * Handles:
 * - Per-widget mode switching (Instantanée/Jour/Hier)
 * - Aggregation calculations (sum of selected compteurs)
 * - Equipment filtering by selected compteurs
 */

import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMetersStore } from '@/stores/useMetersStore'
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore'
import { useEquipmentStore } from '@/stores/useEquipmentStore'

// Type definitions
export interface Compteur {
  id: string
  name: string
  category: 'PM2200' | 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage'
  subtitle: string
  color: 'red' | 'green' | 'blue' | 'yellow'
  instantaneous: number // kW (current)
  today: number // kWh (cumulative today)
  yesterday: number // kWh (yesterday total)
  linkedEquipment: string[] // Equipment IDs linked to this compteur
  translationKey?: string
}

export type CompteurMode = 'instantanée' | 'jour' | 'hier'

interface WidgetModes {
  [compteurId: string]: CompteurMode
}

/**
 * Composable for managing compteur selection and aggregation
 * NOW USES CENTRALIZED useMetersStore
 *
 * @returns {Object} Selection state, computations, and handlers
 */
export function useCompteurSelection() {
  // ✅ USE CENTRALIZED STORE
  const metersStore = useMetersStore()
  const { selectedMeterIds, allMeters, selectedMeters } = storeToRefs(metersStore)

  const dashboardStore = useDashboardStore()
  const equipmentStore = useEquipmentStore()

  // ============================================================================
  // STATE
  // ============================================================================

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
  // COMPUTED PROPERTIES (using centralized store)
  // ============================================================================

  /**
   * ✅ GET SELECTED METER IDs FROM CENTRALIZED STORE
   * This is now a direct reference, no local state needed
   */
  const selectedCompteurIds = computed(() => selectedMeterIds.value)

  /**
   * ✅ GET ALL AVAILABLE METERS FROM CENTRALIZED STORE
   * Maps them to Compteur interface for backwards compatibility
   */
  const availableCompteurs = computed<Compteur[]>(() =>
    dashboardStore.compteurs
  )

  /**
   * ✅ GET SELECTED COMPTEURS (filtered from all available)
   * Synced from centralized store, updates across all views
   */
  const selectedCompteurs = computed<Compteur[]>(() =>
    availableCompteurs.value.filter(c => selectedMeterIds.value.includes(c.id))
  )

  /**
   * Select all available compteurs by default
   */
  function selectDefaultCompteurs() {
    metersStore.selectAllMeters()
  }

  /**
   * Persist compteur selection to localStorage
   *
   * NOTE: Now delegated to useMetersStore.persistSelection()
   * This function kept for backwards compatibility
   */
  function persistSelection() {
    metersStore.persistSelection()
  }

  /**
   * Add a compteur to selection (via centralized store)
   */
  function addCompteur(compteurId: string) {
    metersStore.toggleMeter(compteurId)
    // Initialize mode for new compteur
    if (!widgetModes.value[compteurId]) {
      widgetModes.value[compteurId] = 'instantanée'
    }
  }

  /**
   * Remove a compteur from selection (via centralized store)
   */
  function removeCompteur(compteurId: string) {
    metersStore.toggleMeter(compteurId)
    // Clean up widget mode for removed compteur
    delete widgetModes.value[compteurId]
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

  /**
   * Load persisted compteur selection from localStorage
   *
   * NOTE: This is now handled by useMetersStore.restoreSelection()
   * Called on app startup in main.ts
   * Kept for backwards compatibility if called directly
   */
  function loadPersistedSelection() {
    // useMetersStore now handles this in restoreSelection()
    // This function kept for backwards compatibility
    try {
      const stored = localStorage.getItem('dashboard_selected_compteurs')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          metersStore.setSelectedMeters(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load compteur selection from localStorage:', error)
    }

    // Initialize widget modes for selected compteurs
    selectedMeterIds.value.forEach((id) => {
      if (!widgetModes.value[id]) {
        widgetModes.value[id] = 'instantanée'
      }
    })
  }

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
  // WATCHERS & INITIALIZATION
  // ============================================================================

  /**
   * Watch for changes in selected meter IDs and initialize widget modes
   */
  watch(
    selectedMeterIds,
    (newIds) => {
      // Ensure widget modes are initialized for new selections
      newIds.forEach((id) => {
        if (!widgetModes.value[id]) {
          widgetModes.value[id] = 'instantanée'
        }
      })
    },
    { deep: true }
  )

  /**
   * Initialize composable on first use
   */
  function initialize() {
    // Ensure all meters are selected if none are currently selected
    if (selectedMeterIds.value.length === 0) {
      metersStore.selectAllMeters()
    }

    // Ensure widget modes are initialized for current selection
    selectedMeterIds.value.forEach((id) => {
      if (!widgetModes.value[id]) {
        widgetModes.value[id] = 'instantanée'
      }
    })
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
