import { vi } from 'vitest'
import { createI18n } from 'vue-i18n'

// Mock i18n
export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      dashboard: { manageMeters: 'Manage Meters', title: 'Dashboard' },
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
          sensorsLabel: 'Sensors'
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
          minMax: { title: 'Min/Max Comparison', subtitle: 'Temperature limits vs current' }
        }
      },
      comparison: {
        title: 'Comparison',
        subtitle: 'Compare meter data across time periods',
        buttons: { export: 'Export CSV' },
        kpi: { items: 'items' },
        meters: { selected: 'selected', selectMeters: 'Select meters to compare' },
        chartType: { bar: 'Bar', line: 'Line', heatmap: 'Heatmap', table: 'Table' },
        mode: { byMeters: 'By Meters', byPeriods: 'By Periods' },
        periods: { title: 'Periods' },
        table: {
          rank: 'Rank',
          label: 'Label',
          value: 'Value',
          variance: 'Variance',
          trend: 'Trend'
        }
      },
      energyHistory: {
        title: 'Energy History',
        subtitle: 'Historical energy consumption data',
        dateRange: 'Date Range'
      },
      puissance: {
        title: 'Power Monitoring',
        subtitle: 'Real-time power consumption'
      }
    }
  }
})

// Mock canvas context for Chart.js
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === '2d') {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: [] })),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn()
      }))
    }
  }
  return null
})

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => '')

// Mock global modules
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock Chart.js with all required exports
const ChartConstructor = vi.fn(function() {
  this.destroy = vi.fn()
  this.resize = vi.fn()
  this.update = vi.fn()
})
ChartConstructor.register = vi.fn()

vi.mock('chart.js', () => ({
  Chart: ChartConstructor,
  registerables: [],
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  BarElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  Filler: vi.fn(),
  BarController: vi.fn(),
  LineController: vi.fn()
}))
