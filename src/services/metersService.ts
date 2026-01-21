import { ref, onMounted } from 'vue'
import { MOCK_METERS, type Meter } from '@/data/mockData'

const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true'

/**
 * Fetch meters - uses mock data or API based on VITE_ENABLE_MOCK_DATA flag
 */
export const useMetersService = () => {
  const meters = ref<Meter[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isUsingMockData = ref(ENABLE_MOCK_DATA)

  const loadMeters = async () => {
    loading.value = true
    error.value = null

    try {
      if (ENABLE_MOCK_DATA) {
        // Use mock data
        console.log('[MOCK DATA] Loading meters from mock data')
        meters.value = MOCK_METERS
        isUsingMockData.value = true
      } else {
        // Fetch from API
        console.log('[API] Fetching meters from API')
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/meters`
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()
        meters.value = data
        isUsingMockData.value = false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load meters'
      error.value = errorMessage
      console.error('[ERROR] Failed to load meters:', errorMessage)

      // Fallback to mock data on error
      meters.value = MOCK_METERS
      isUsingMockData.value = true
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    loadMeters()
  })

  return {
    meters,
    loading,
    error,
    isUsingMockData,
    reload: loadMeters,
  }
}
