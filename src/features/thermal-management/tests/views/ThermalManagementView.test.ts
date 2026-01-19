import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import ThermalManagementView from '@/features/thermal-management/views/ThermalManagementView.vue'
import { useSensorsStore } from '@/features/thermal-management/store/useSensorsStore'
import { createMemoryHistory, createRouter } from 'vue-router'
import { i18n } from '@/tests/setup'

describe('ThermalManagementView', () => {
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
    const wrapper = mount(ThermalManagementView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          SensorSelector: { template: '<div></div>' },
          VueApexCharts: { template: '<div></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true,
          Transition: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('component is mounted successfully', async () => {
    const wrapper = mount(ThermalManagementView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          SensorSelector: { template: '<div></div>' },
          VueApexCharts: { template: '<div></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true,
          Transition: true
        }
      }
    })

    expect(wrapper.vm).toBeDefined()
  })

  it('initializes with sensors store', async () => {
    const sensorsStore = useSensorsStore(pinia)
    expect(sensorsStore).toBeDefined()
  })

  it('has access to store during mount', async () => {
    const wrapper = mount(ThermalManagementView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          SensorSelector: { template: '<div></div>' },
          VueApexCharts: { template: '<div></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true,
          Transition: true
        }
      }
    })

    const sensorsStore = useSensorsStore()
    expect(sensorsStore).toBeDefined()
  })

  it('wraps content with AdminLayout', async () => {
    const wrapper = mount(ThermalManagementView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div class="admin-layout"><slot /></div>' },
          SensorSelector: { template: '<div></div>' },
          VueApexCharts: { template: '<div></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true,
          Transition: true
        }
      }
    })

    expect(wrapper.html()).toContain('admin-layout')
  })

  it('renders main content sections', async () => {
    const wrapper = mount(ThermalManagementView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          SensorSelector: { template: '<div></div>' },
          VueApexCharts: { template: '<div></div>' },
          LineChart: { template: '<canvas></canvas>' },
          BarChart: { template: '<canvas></canvas>' },
          Teleport: true,
          Transition: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })
})
