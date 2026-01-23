/**
 * Feature Flags Configuration
 *
 * Centralized feature flag management for gradual rollout of new features.
 * Flags can be controlled via environment variables or local storage for testing.
 */

export interface FeatureFlags {
  /** Enable new widget registry system */
  useNewWidgetSystem: boolean

  /** Enable widget performance monitoring */
  enableWidgetPerformanceMonitoring: boolean

  /** Enable debug logging for widgets */
  enableWidgetDebugLogging: boolean

  /** Use WidgetDataProvider instead of manual batch requests */
  useWidgetDataProvider: boolean

  /** Enable BaseWidget wrapper for all widgets */
  useBaseWidget: boolean
}

/**
 * Default feature flag values
 */
const defaultFlags: FeatureFlags = {
  useNewWidgetSystem: false, // Disabled by default for safety
  enableWidgetPerformanceMonitoring: false,
  enableWidgetDebugLogging: import.meta.env.DEV, // Auto-enable in dev mode
  useWidgetDataProvider: false,
  useBaseWidget: false
}

/**
 * Get feature flag value from environment or localStorage
 */
function getFeatureFlagValue(key: keyof FeatureFlags, defaultValue: boolean): boolean {
  // Check environment variable first (for production deployment)
  const envKey = `VITE_FEATURE_${key.toUpperCase()}`
  const envValue = import.meta.env[envKey]
  if (envValue !== undefined) {
    return envValue === 'true' || envValue === '1'
  }

  // Check localStorage (for local testing/override)
  try {
    const localStorageKey = `feature_${key}`
    const localValue = localStorage.getItem(localStorageKey)
    if (localValue !== null) {
      return localValue === 'true'
    }
  } catch (e) {
    // localStorage might not be available
  }

  return defaultValue
}

/**
 * Feature flags singleton
 */
class FeatureFlagService {
  private flags: FeatureFlags

  constructor() {
    this.flags = {
      useNewWidgetSystem: getFeatureFlagValue('useNewWidgetSystem', defaultFlags.useNewWidgetSystem),
      enableWidgetPerformanceMonitoring: getFeatureFlagValue('enableWidgetPerformanceMonitoring', defaultFlags.enableWidgetPerformanceMonitoring),
      enableWidgetDebugLogging: getFeatureFlagValue('enableWidgetDebugLogging', defaultFlags.enableWidgetDebugLogging),
      useWidgetDataProvider: getFeatureFlagValue('useWidgetDataProvider', defaultFlags.useWidgetDataProvider),
      useBaseWidget: getFeatureFlagValue('useBaseWidget', defaultFlags.useBaseWidget)
    }

    if (this.flags.enableWidgetDebugLogging) {
      console.log('[FeatureFlags] Initialized:', this.flags)
    }
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag]
  }

  /**
   * Enable a feature (persists to localStorage for testing)
   */
  enable(flag: keyof FeatureFlags): void {
    this.flags[flag] = true
    try {
      localStorage.setItem(`feature_${flag}`, 'true')
      if (this.flags.enableWidgetDebugLogging) {
        console.log(`[FeatureFlags] Enabled: ${flag}`)
      }
    } catch (e) {
      console.error('[FeatureFlags] Failed to persist flag to localStorage:', e)
    }
  }

  /**
   * Disable a feature (persists to localStorage for testing)
   */
  disable(flag: keyof FeatureFlags): void {
    this.flags[flag] = false
    try {
      localStorage.setItem(`feature_${flag}`, 'false')
      if (this.flags.enableWidgetDebugLogging) {
        console.log(`[FeatureFlags] Disabled: ${flag}`)
      }
    } catch (e) {
      console.error('[FeatureFlags] Failed to persist flag to localStorage:', e)
    }
  }

  /**
   * Get all flags for debugging
   */
  getAllFlags(): FeatureFlags {
    return { ...this.flags }
  }

  /**
   * Reset all flags to defaults
   */
  resetAll(): void {
    Object.keys(defaultFlags).forEach(key => {
      const flagKey = key as keyof FeatureFlags
      this.flags[flagKey] = defaultFlags[flagKey]
      try {
        localStorage.removeItem(`feature_${key}`)
      } catch (e) {
        // Ignore
      }
    })
    if (this.flags.enableWidgetDebugLogging) {
      console.log('[FeatureFlags] Reset all flags to defaults')
    }
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagService()

// Export convenience functions
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return featureFlags.isEnabled(flag)
}

export function enableFeature(flag: keyof FeatureFlags): void {
  featureFlags.enable(flag)
}

export function disableFeature(flag: keyof FeatureFlags): void {
  featureFlags.disable(flag)
}

// Expose to window for debugging in browser console
if (typeof window !== 'undefined') {
  ;(window as any).__featureFlags = featureFlags
  console.log('💡 Feature flags available at window.__featureFlags')
  console.log('   Example: window.__featureFlags.enable("useNewWidgetSystem")')
}

/**
 * Vue composable for reactive feature flags
 */
import { ref, computed } from 'vue'

export function useFeatureFlags() {
  const flags = ref(featureFlags.getAllFlags())

  const isEnabled = (flag: keyof FeatureFlags) => computed(() => flags.value[flag])

  const enable = (flag: keyof FeatureFlags) => {
    featureFlags.enable(flag)
    flags.value = featureFlags.getAllFlags()
  }

  const disable = (flag: keyof FeatureFlags) => {
    featureFlags.disable(flag)
    flags.value = featureFlags.getAllFlags()
  }

  return {
    flags: computed(() => flags.value),
    isEnabled,
    enable,
    disable
  }
}
