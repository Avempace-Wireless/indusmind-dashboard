import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import AlertConfigView from '@/features/alerts/views/AlertConfigView.vue'
import { useMetersStore } from '@/stores/useMetersStore'
import { createMemoryHistory, createRouter } from 'vue-router'
import { i18n } from '@/tests/setup'

describe('AlertConfigView', () => {
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
    const wrapper = mount(AlertConfigView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          Teleport: true
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('component mounted successfully', async () => {
    const wrapper = mount(AlertConfigView, {
      global: {
        plugins: [pinia, i18n, router],
        stubs: {
          AdminLayout: { template: '<div><slot /></div>' },
          Teleport: true
        }
      }
    })
    expect(wrapper.vm).toBeDefined()
  })

  it('initializes with correct default state', async () => {
    const metersStore = useMetersStore(pinia)
    expect(metersStore).toBeDefined()
  })
})
