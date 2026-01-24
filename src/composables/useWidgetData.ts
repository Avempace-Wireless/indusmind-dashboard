/**
 * useWidgetData - Composable for automatic widget data fetching
 *
 * Provides reactive widget data based on widget registry configuration.
 * Handles loading states, errors, and automatic refresh.
 */

import { ref, computed, watch, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'
import type { WidgetConfig, WidgetDataResult, TransformContext } from '@/types/widgetRegistry'
import { widgetDataProvider } from '@/services/WidgetDataProvider'

export interface UseWidgetDataOptions {
  /** Widget configuration or ID from registry */
  widget: WidgetConfig | Ref<WidgetConfig> | ComputedRef<WidgetConfig>

  /** Device UUID to fetch data for */
  deviceUUID: Ref<string> | string

  /** Additional context for transformations */
  context?: Ref<TransformContext> | TransformContext | ComputedRef<TransformContext>

  /** Enable automatic refresh */
  autoRefresh?: boolean

  /** Refresh interval in milliseconds (default: 5 minutes) */
  refreshInterval?: number

  /** Fetch data immediately on mount */
  immediate?: boolean
}

export function useWidgetData(options: UseWidgetDataOptions) {
  const {
    widget: widgetInput,
    deviceUUID,
    context,
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    immediate = true
  } = options

  // Reactive state
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<Record<string, any>>({})
  const rawData = ref<Record<string, any>>({})
  const fetchedAt = ref<number | null>(null)
  const cached = ref(false)

  // Get reactive widget value
  const widget = computed(() => {
    if (!widgetInput) return null as any
    if (typeof widgetInput === 'object' && 'value' in widgetInput) {
      return (widgetInput as any).value
    }
    return widgetInput
  })

  // Get reactive device UUID value
  const deviceUUIDValue = computed(() =>
    typeof deviceUUID === 'string' ? deviceUUID : deviceUUID.value
  )

  // Get reactive context value
  const contextValue = computed(() =>
    !context ? undefined :
    'value' in context ? context.value : context
  )

  // Refresh timer
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  /**
   * Fetch widget data
   */
  const fetchData = async () => {
    if (!deviceUUIDValue.value) {
      error.value = new Error('Device UUID is required')
      return
    }

    loading.value = true
    error.value = null

    try {
      const result: WidgetDataResult = await widgetDataProvider.fetchWidgetData(
        widget.value,
        deviceUUIDValue.value,
        contextValue.value
      )

      data.value = result.data
      rawData.value = result.rawData || {}
      fetchedAt.value = result.fetchedAt || null
      cached.value = result.cached || false
      error.value = result.error || null
    } catch (err) {
      error.value = err as Error
      console.error(`Error fetching data for widget ${widget.value?.id || 'unknown'}:`, err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh widget data
   */
  const refresh = async () => {
    // Clear cache for this device to force fresh fetch
    widgetDataProvider.clearDeviceCache(deviceUUIDValue.value)
    await fetchData()
  }

  /**
   * Start auto-refresh
   */
  const startAutoRefresh = () => {
    if (refreshTimer) return

    refreshTimer = setInterval(() => {
      fetchData()
    }, refreshInterval)
  }

  /**
   * Stop auto-refresh
   */
  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  // Watch for device UUID changes
  watch(deviceUUIDValue, (newUUID, oldUUID) => {
    if (newUUID && newUUID !== oldUUID) {
      fetchData()
    }
  })

  // Watch for context changes
  watch(contextValue, () => {
    fetchData()
  }, { deep: true })

  // Lifecycle hooks
  onMounted(() => {
    if (immediate && deviceUUIDValue.value) {
      fetchData()
    }

    if (autoRefresh) {
      startAutoRefresh()
    }
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  // Computed helpers
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => !!error.value)
  const hasData = computed(() => Object.keys(data.value).length > 0)
  const isEmpty = computed(() => !loading.value && !hasError.value && !hasData.value)

  /**
   * Get data for a specific requirement by ID
   */
  const getRequirementData = <T = any>(requirementId: string): T | null => {
    return data.value[requirementId] || null
  }

  /**
   * Get raw data for a specific requirement by ID
   */
  const getRawData = <T = any>(requirementId: string): T | null => {
    return rawData.value[requirementId] || null
  }

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    data: computed(() => data.value),
    rawData: computed(() => rawData.value),
    fetchedAt: computed(() => fetchedAt.value),
    cached: computed(() => cached.value),

    // Computed helpers
    isLoading,
    hasError,
    hasData,
    isEmpty,

    // Methods
    fetchData,
    refresh,
    getRequirementData,
    getRawData,

    // Auto-refresh control
    startAutoRefresh,
    stopAutoRefresh
  }
}

/**
 * Composable for fetching data for multiple widgets
 */
export interface UseMultiWidgetDataOptions {
  /** Array of widget configurations */
  widgets: WidgetConfig[]

  /** Device UUID to fetch data for */
  deviceUUID: Ref<string> | string

  /** Additional context for transformations */
  context?: Ref<TransformContext> | TransformContext

  /** Enable automatic refresh */
  autoRefresh?: boolean

  /** Refresh interval in milliseconds */
  refreshInterval?: number

  /** Fetch data immediately on mount */
  immediate?: boolean
}

export function useMultiWidgetData(options: UseMultiWidgetDataOptions) {
  const {
    widgets,
    deviceUUID,
    context,
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000,
    immediate = true
  } = options

  // Reactive state
  const loading = ref(false)
  const errors = ref<Record<string, Error>>({})
  const results = ref<Record<string, any>>({})

  // Get reactive values
  const deviceUUIDValue = computed(() =>
    typeof deviceUUID === 'string' ? deviceUUID : deviceUUID.value
  )

  const contextValue = computed(() =>
    !context ? undefined :
    'value' in context ? context.value : context
  )

  // Refresh timer
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  /**
   * Fetch data for all widgets
   */
  const fetchData = async () => {
    if (!deviceUUIDValue.value) return

    loading.value = true
    errors.value = {}

    try {
      const result = await widgetDataProvider.fetchBatchData({
        deviceUUID: deviceUUIDValue.value,
        widgets,
        context: contextValue.value
      })

      results.value = result.results
      errors.value = result.errors
    } catch (err) {
      console.error('Error fetching multi-widget data:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Refresh all widget data
   */
  const refresh = async () => {
    widgetDataProvider.clearDeviceCache(deviceUUIDValue.value)
    await fetchData()
  }

  /**
   * Start auto-refresh
   */
  const startAutoRefresh = () => {
    if (refreshTimer) return
    refreshTimer = setInterval(fetchData, refreshInterval)
  }

  /**
   * Stop auto-refresh
   */
  const stopAutoRefresh = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  // Watch for changes
  watch(deviceUUIDValue, (newUUID, oldUUID) => {
    if (newUUID && newUUID !== oldUUID) {
      fetchData()
    }
  })

  watch(contextValue, () => {
    fetchData()
  }, { deep: true })

  // Lifecycle
  onMounted(() => {
    if (immediate && deviceUUIDValue.value) {
      fetchData()
    }
    if (autoRefresh) {
      startAutoRefresh()
    }
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  /**
   * Get result for specific widget
   */
  const getWidgetData = (widgetId: string) => {
    return results.value[widgetId] || null
  }

  /**
   * Get error for specific widget
   */
  const getWidgetError = (widgetId: string) => {
    return errors.value[widgetId] || null
  }

  return {
    // State
    loading: computed(() => loading.value),
    errors: computed(() => errors.value),
    results: computed(() => results.value),

    // Computed helpers
    isLoading: computed(() => loading.value),
    hasErrors: computed(() => Object.keys(errors.value).length > 0),
    hasData: computed(() => Object.keys(results.value).length > 0),

    // Methods
    fetchData,
    refresh,
    getWidgetData,
    getWidgetError,

    // Auto-refresh control
    startAutoRefresh,
    stopAutoRefresh
  }
}
