import { useMockData, useHybridMode } from '@/config/dataMode'

/**
 * Fetch data with automatic fallback to mock data in hybrid mode
 *
 * @param apiFn - Function that fetches from real API
 * @param mockFn - Function that returns mock data
 * @param options - Optional configuration
 * @returns Promise with data from API or mock
 *
 * @example
 * const devices = await fetchWithFallback(
 *   () => apiClient.get('/devices'),
 *   () => mockDevices,
 *   { logErrors: true }
 * )
 */
export async function fetchWithFallback<T>(
  apiFn: () => Promise<T>,
  mockFn: () => T | Promise<T>,
  options: {
    logErrors?: boolean
    fallbackOnError?: boolean
  } = {}
): Promise<T> {
  const { logErrors = true, fallbackOnError = useHybridMode() } = options

  // If mock mode is enabled, use mock data directly
  if (useMockData()) {
    if (logErrors) {
      console.log('[DataFetch] Using mock data (mock mode enabled)')
    }
    return await Promise.resolve(mockFn())
  }

  // Try API call
  try {
    const data = await apiFn()
    if (logErrors) {
      console.log('[DataFetch] Using API data')
    }
    return data
  } catch (error) {
    if (logErrors) {
      console.warn('[DataFetch] API call failed:', error)
    }

    // In hybrid mode, fallback to mock data
    if (fallbackOnError) {
      if (logErrors) {
        console.log('[DataFetch] Falling back to mock data')
      }
      return await Promise.resolve(mockFn())
    }

    // In API-only mode, throw the error
    throw error
  }
}

/**
 * Select data source based on current mode
 *
 * @param apiData - Data from API
 * @param mockData - Mock data
 * @returns Selected data based on current mode
 *
 * @example
 * const devices = selectDataSource(apiDevices, mockDevices)
 */
export function selectDataSource<T>(apiData: T | null, mockData: T): T {
  if (useMockData()) {
    return mockData
  }

  if (apiData === null && useHybridMode()) {
    console.log('[DataSource] API data unavailable, using mock data')
    return mockData
  }

  return apiData ?? mockData
}
