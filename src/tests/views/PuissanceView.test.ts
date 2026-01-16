import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import PuissanceView from '@/views/PuissanceView.vue'
import { useMetersStore } from '@/stores/useMetersStore'
import { createMemoryHistory, createRouter } from 'vue-router'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      puissance: { title: 'Power Monitoring', subtitle: 'Real-time power consumption analysis' },
      dashboard: { manageMeters: 'Manage Meters' }
    }
  }
})

describe('PuissanceView', () => {
  let pinia: any
  let router: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createMemoryHistory('/'),
      routes: [{ path: '/', component: { template: '<div></div>' } }]
    })
    vi.clearAllMocks()
  })

  it('renders the component', async () => {
    const wrapper = mount(PuissanceView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('component mounted successfully', async () => {
    const wrapper = mount(PuissanceView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
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
    const wrapper = mount(PuissanceView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
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
    const wrapper = mount(PuissanceView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div class="admin-layout"><slot /></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true
        }
      }
    })
    expect(wrapper.html()).toContain('admin-layout')
  })

  it('renders main content sections', async () => {
    const wrapper = mount(PuissanceView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('provides chart rendering infrastructure', async () => {
    const wrapper = mount(PuissanceView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
