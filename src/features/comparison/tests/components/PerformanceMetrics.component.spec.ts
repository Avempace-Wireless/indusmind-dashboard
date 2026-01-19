import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import PerformanceMetrics from '@/features/comparison/components/PerformanceMetrics.vue'
import { i18n } from '@/tests/setup'

describe('PerformanceMetrics', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
  })

  it('renders the component', () => {
    const wrapper = mount(PerformanceMetrics, {
      global: {
        plugins: [pinia, i18n]
      },
      props: {
        title: 'Performance Metrics',
        metrics: []
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays metrics when provided', () => {
    const mockMetrics = [
      {
        key: 'average',
        label: 'Average',
        value: '150 kWh',
        change: 10
      },
      {
        key: 'min',
        label: 'Minimum',
        value: '100 kWh'
      },
      {
        key: 'max',
        label: 'Maximum',
        value: '200 kWh',
        target: '250 kWh',
        progress: 80
      }
    ]
    const wrapper = mount(PerformanceMetrics, {
      global: {
        plugins: [pinia, i18n]
      },
      props: {
        title: 'Performance Metrics',
        metrics: mockMetrics
      }
    })
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Average')
    expect(wrapper.text()).toContain('150 kWh')
  })
})
