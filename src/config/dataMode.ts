/**
 * Data Mode Configuration
 *
 * Controls whether the application uses real API data, mock data, or a hybrid approach.
 * Set via VITE_DATA_MODE environment variable.
 *
 * Modes:
 * - "api": Use only real API responses (production)
 * - "mock": Use only mock data (development/testing)
 * - "hybrid": Use API with fallback to mock data for unavailable endpoints (default)
 */

export type DataMode = 'api' | 'mock' | 'hybrid'

export const dataMode: DataMode = (import.meta.env.VITE_DATA_MODE as DataMode) || 'hybrid'

/**
 * Check if mock data should be used
 */
export const useMockData = (): boolean => {
  return dataMode === 'mock'
}

/**
 * Check if API should be used
 */
export const useApiData = (): boolean => {
  return dataMode === 'api' || dataMode === 'hybrid'
}

/**
 * Check if hybrid mode (API with mock fallback) is enabled
 */
export const useHybridMode = (): boolean => {
  return dataMode === 'hybrid'
}

/**
 * Check if only API data should be used (no fallback)
 */
export const useApiOnly = (): boolean => {
  return dataMode === 'api'
}

/**
 * Log current data mode for debugging
 */
export const logDataMode = (): void => {
  console.log(`[DataMode] Current mode: ${dataMode}`)
  console.log(`[DataMode] Use mock: ${useMockData()}`)
  console.log(`[DataMode] Use API: ${useApiData()}`)
  console.log(`[DataMode] Hybrid mode: ${useHybridMode()}`)
}

// Log mode on startup in development
if (import.meta.env.DEV) {
  logDataMode()
}
