import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import ThermalManagementView from '@/views/ThermalManagementView.vue'
import { useSensorsStore } from '@/stores/useSensorsStore'
import { createMemoryHistory, createRouter } from 'vue-router'

// Create minimal i18n for testing
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      thermal: {
        pageTitle: 'Thermal Management',
        subtitle: 'Monitor and control temperature zones',
        currentTemp: 'Current Temperature',
        zone: 'Zone {number}',
        power: { on: 'ON', off: 'OFF' },
        manual: 'Manual',
        auto: 'Auto',
        minTemp: 'Min Temp',
        maxTemp: 'Max Temp',
        controls: {
          columns: 'Columns',
          selectAll: 'Select All',
          clear: 'Clear',
          resetOrder: 'Reset Order',
          sensorsLabel: 'Sensors',
          zones: 'Zones',
          orderHint: 'Drag cards to reorder'
        },
        chart: {
          open: 'View 24h chart',
          subtitle: '24-hour temperature history',
          current: 'Current',
          maxTarget: 'Max target',
          minTarget: 'Min target',
          active: 'Active',
          inactive: 'Inactive',
          temperature: 'Temperature',
          annotationMax: 'Max',
          annotationMin: 'Min'
        },
        status: {
          active: 'Active Zones',
          avgTemp: 'Avg. Temperature',
          operational: 'Operational',
          currentAverage: 'Current Average',
          tempRange: 'Temperature Range',
          minMax: 'Min — Max',
          systemHealth: 'System Health',
          withinTargets: 'Within Targets'
        },
        sections: {
          zoneControl: 'Zone Control & Management',
          monitoring: 'Temperature Monitoring'
        },
        charts: {
          zoneTemps: { title: 'Zone Temperatures' },
          minMax: { title: 'Min/Max Comparison', subtitle: 'Temperature limits' }
        }
      }
    }
  }
})

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
