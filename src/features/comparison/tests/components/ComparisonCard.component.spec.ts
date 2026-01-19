import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ComparisonCard from '@/features/comparison/components/ComparisonCard.vue'
import { i18n } from '@/tests/setup'

describe('ComparisonCard', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
  })

  it('renders the component', () => {
    const wrapper = mount(ComparisonCard, {
      global: {
        plugins: [pinia, i18n]
      },
      props: {
        label: 'Test Card',
        icon: 'bolt',
        backgroundColor: '#3b82f6',
        currentValue: '100 kWh',
        previousValue: '90 kWh',
        unit: 'kWh'
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the correct label', () => {
    const wrapper = mount(ComparisonCard, {
      global: {
        plugins: [pinia, i18n]
      },
      props: {
        label: 'Energy Consumption',
        icon: 'bolt',
        backgroundColor: '#3b82f6',
        currentValue: '250 kWh',
        previousValue: '200 kWh',
        unit: 'kWh'
      }
    })
    expect(wrapper.text()).toContain('Energy Consumption')
  })
})
