import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ComparisonTable from '@/features/comparison/components/ComparisonTable.vue'
import { i18n } from '@/tests/setup'

describe('ComparisonTable', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
  })

  it('renders the component', () => {
    const wrapper = mount(ComparisonTable, {
      global: {
        plugins: [pinia, i18n]
      },
      props: {
        title: 'Comparison Table',
        columns: [],
        rows: []
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays table when data is provided', () => {
    const mockColumns = [
      { key: 'current', label: 'Current' },
      { key: 'previous', label: 'Previous' }
    ]
    const mockRows = [
      {
        meterName: 'Meter 1',
        color: '#3b82f6',
        data: { current: '100 kWh', previous: '90 kWh' },
        trend: '+11%',
        trendIcon: 'trending_up',
        trendClass: 'bg-green-50 text-green-700'
      },
      {
        meterName: 'Meter 2',
        color: '#10b981',
        data: { current: '200 kWh', previous: '180 kWh' },
        trend: '+11%',
        trendIcon: 'trending_up',
        trendClass: 'bg-green-50 text-green-700'
      }
    ]
    const wrapper = mount(ComparisonTable, {
      global: {
        plugins: [pinia, i18n]
      },
      props: {
        title: 'Meter Comparison',
        columns: mockColumns,
        rows: mockRows
      }
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Meter 1')
    expect(wrapper.text()).toContain('Meter 2')
  })
})
