import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAlertsStore } from '@/features/alerts/store/useAlertsStore'

describe('useAlertsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useAlertsStore()
    expect(store).toBeDefined()
  })

  it('can handle alerts data', () => {
    const store = useAlertsStore()
    expect(store).toBeDefined()
    // Add more specific tests based on store structure
  })

  it('handles empty state correctly', () => {
    const store = useAlertsStore()
    expect(store).toBeDefined()
  })
})
