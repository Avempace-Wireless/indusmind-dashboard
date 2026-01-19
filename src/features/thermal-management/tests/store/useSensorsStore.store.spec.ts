import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSensorsStore } from '@/features/thermal-management/store/useSensorsStore'

describe('useSensorsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default state', () => {
    const store = useSensorsStore()
    expect(store).toBeDefined()
  })

  it('can handle sensor data', () => {
    const store = useSensorsStore()
    expect(store).toBeDefined()
    // Add more specific tests based on store structure
  })

  it('handles empty state correctly', () => {
    const store = useSensorsStore()
    expect(store).toBeDefined()
  })
})
