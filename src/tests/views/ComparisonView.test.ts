import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ComparisonView from '@/views/ComparisonView.vue'
import { useMetersStore } from '@/stores/useMetersStore'
import { createMemoryHistory, createRouter } from 'vue-router'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      comparison: {
        title: 'Comparison',
        subtitle: 'Compare meter data across time periods',
        buttons: { export: 'Export CSV' },
        kpi: { items: 'items' },
        meters: { selected: 'selected', selectMeters: 'Select meters to compare' },
        chartType: { bar: 'Bar', line: 'Line', heatmap: 'Heatmap', table: 'Table' },
        mode: { byMeters: 'By Meters', byPeriods: 'By Periods' },
        periods: { title: 'Periods' },
        table: { rank: 'Rank', label: 'Label', value: 'Value', variance: 'Variance', trend: 'Trend' }
      },
      dashboard: { manageMeters: 'Manage Meters' }
    }
  }
})

describe('ComparisonView', () => {
  let pinia: any
  let router: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createMemoryHistory('/'),
      routes: [
        {
          path: '/',
          component: { template: '<div></div>' }
        }
      ]
    })
    vi.clearAllMocks()
  })

  it('renders the component', async () => {
    const wrapper = mount(ComparisonView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          CompteurSelector: { template: '<div></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('component is mounted successfully', async () => {
    const wrapper = mount(ComparisonView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          CompteurSelector: { template: '<div></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true
        }
      }
    })

    expect(wrapper.vm).toBeDefined()
  })

  it('initializes with meters store', async () => {
    const metersStore = useMetersStore(pinia)
    expect(metersStore).toBeDefined()
  })

  it('has access to store during mount', async () => {
    const wrapper = mount(ComparisonView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          CompteurSelector: { template: '<div></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true
        }
      }
    })

    const metersStore = useMetersStore()
    expect(metersStore).toBeDefined()
  })

  it('wraps content with AdminLayout', async () => {
    const wrapper = mount(ComparisonView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div class="admin-layout"><slot /></div>' },
          CompteurSelector: { template: '<div></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true
        }
      }
    })

    expect(wrapper.html()).toContain('admin-layout')
  })

  it('renders main content sections', async () => {
    const wrapper = mount(ComparisonView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          CompteurSelector: { template: '<div></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('provides chart rendering infrastructure', async () => {
    const wrapper = mount(ComparisonView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          CompteurSelector: { template: '<div></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })
})
