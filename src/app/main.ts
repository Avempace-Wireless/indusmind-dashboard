import '@/assets/styles/main.css'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'
import 'simplebar-vue/dist/simplebar.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import { Chart as ChartJS } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import i18n from '@/i18n'
import { useMetersStore } from '@/stores/useMetersStore'
import { setupDebugTools } from '@/services/WidgetDataValidator'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(VueApexCharts)

// Disable data labels globally to avoid numbers/text drawn on charts
ChartJS.register(ChartDataLabels)
if (ChartJS.defaults.plugins?.datalabels) {
  ChartJS.defaults.plugins.datalabels.display = false
}

if (typeof window !== 'undefined') {
  const apexDefaults = (window as any).Apex || {}
  ;(window as any).Apex = {
    ...apexDefaults,
    dataLabels: {
      enabled: false,
    },
  }
}

// Initialize centralized meter selection from localStorage
const metersStore = useMetersStore()
metersStore.restoreSelection()

// Initialize widget debug tools in development
if (import.meta.env.DEV) {
  setupDebugTools()
  console.log('🔧 Widget Data Validator loaded - use __widgetDebug in console')
}

app.mount('#app')
