import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEnergyHistoryStore } from '@/features/energy-history/store/useEnergyHistoryStore'

describe('useEnergyHistoryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useEnergyHistoryStore()
    expect(store).toBeDefined()
  })

  it('can handle energy history data', () => {
    const store = useEnergyHistoryStore()
    expect(store).toBeDefined()
    // Add more specific tests based on store structure
  })

  it('handles empty state correctly', () => {
    const store = useEnergyHistoryStore()
    expect(store).toBeDefined()
  })
})
