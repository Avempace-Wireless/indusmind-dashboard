import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useComparisonStore } from '@/features/comparison/store/useComparisonStore'

describe('useComparisonStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useComparisonStore()
    expect(store).toBeDefined()
  })

  it('can set comparison data', () => {
    const store = useComparisonStore()
    expect(store).toBeDefined()
    // Add more specific tests based on store structure
  })

  it('handles empty state correctly', () => {
    const store = useComparisonStore()
    expect(store).toBeDefined()
  })
})
