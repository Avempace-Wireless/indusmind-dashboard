import { vi } from 'vitest'
import { createI18n } from 'vue-i18n'

// Mock i18n with all localization keys from en.json
const messages = {
  en: {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        close: 'Close',
        clear: 'Clear',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        loading: 'Loading...',
        meterData: 'meter data',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        justNow: 'Just now',
        meter: 'meter',
        meters: 'meters',
        allMeters: 'All Meters',
        unit: {
          kw: 'kW',
          celsius: '°C',
          volt: 'V',
          ampere: 'A',
          kwh: 'kWh'
        },
        viewDetails: 'View Details',
        selectUpTo: 'Select up to',
        items: 'items',
        noResults: 'No results found',
        selected: 'selected',
        maxSelectionReached: 'Maximum selection reached (8 max)',
        clearAll: 'Clear All',
        apply: 'Apply',
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        of: 'of',
        itemsPerPage: 'Items per page'
      },
      navigation: {
        home: 'Home',
        dashboard: 'Dashboard',
        realtime: 'Real-time',
        profile: 'My Profile',
        accountSettings: 'Account Settings',
        support: 'Help & Support'
      },
      dashboard: {
        title: 'Real-time Monitoring',
        pageTitle: 'Real-time Surveillance',
        status: {
          connected: 'Connected - ',
          disconnected: 'Disconnected - ',
          lastUpdate: 'Last update: '
        },
        manageMeters: 'Manage Meters',
        unifiedChart: {
          title: 'Energy & Temperature',
          subtitle: '{count} meter(s) selected'
        },
        energy: 'Energy',
        temperature: 'Temperature',
        equipment: {
          title: 'Equipment Status – Selected Meters',
          columns: {
            meter: 'Meter',
            type: 'Type',
            status: 'Status',
            currentValue: 'Current Value',
            unit: 'Unit',
            lastUpdate: 'Last Update',
            energy: 'Energy',
            temperature: 'Temperature'
          },
          status: {
            online: 'Online',
            offline: 'Offline'
          }
        },
        phaseBalance: {
          title: 'Phase Balance',
          phase: {
            l1: 'Phase L1',
            l2: 'Phase L2',
            l3: 'Phase L3'
          }
        },
        recentEvents: {
          title: 'Recent Events',
          viewAll: 'View all'
        }
      },
      compteur: {
        selector: {
          title: 'Select Meters'
        },
        time: {
          now: 'Now',
          min30: '-30min',
          min15: '-15min'
        }
      },
      equipment: {
        compressorsIndustrial: 'Industrial Compressors',
        compressorSecondary: 'Secondary Compressor',
        climGeneral: 'General Cooling',
        climOffices: 'Office Cooling',
        lightingGeneral: 'General Lighting'
      },
      alerts: {
        messages: {
          highConsumption: 'High consumption detected',
          criticalTemperature: 'Critical temperature',
          equipmentOffline: 'Equipment offline'
        }
      },
      thermal: {
        pageTitle: 'Temperature Control',
        title: 'Temperature Control',
        subtitle: 'Multi-zone temperature monitoring and control',
        currentTemp: 'Temperature',
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
        meters: { selected: 'selected' },
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
        subtitle: 'Historical energy consumption data'
      },
      puissance: {
        title: 'Power Monitoring',
        subtitle: 'Real-time power consumption'
      }
    }
  }

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages
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
}) as any

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => '')

// Mock global modules
globalThis.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})) as any

// Mock Chart.js to prevent real Chart initialization
const ChartConstructor: any = vi.fn(function(this: any, _context: any, _config: any) {
  this.destroy = vi.fn()
  this.resize = vi.fn()
  this.update = vi.fn(() => Promise.resolve())
  this.render = vi.fn()
  this.stop = vi.fn()
  this.reset = vi.fn()
  return this
})

ChartConstructor.register = vi.fn()
ChartConstructor.unregister = vi.fn()
ChartConstructor.getChart = vi.fn()

vi.mock('chart.js', () => ({
  Chart: ChartConstructor,
  registerables: [],
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  TimeScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  BarElement: vi.fn(),
  ArcElement: vi.fn(),
  RadarController: vi.fn(),
  DoughnutController: vi.fn(),
  PolarAreaController: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  Filler: vi.fn(),
  BarController: vi.fn(),
  LineController: vi.fn()
}))

// Mock vue-chartjs to prevent chart rendering in tests
vi.mock('vue-chartjs', () => ({
  Bar: {
    name: 'Bar',
    template: '<canvas></canvas>',
    props: ['data', 'options'],
    setup: () => ({})
  },
  Line: {
    name: 'Line',
    template: '<canvas></canvas>',
    props: ['data', 'options'],
    setup: () => ({})
  },
  Pie: {
    name: 'Pie',
    template: '<canvas></canvas>',
    props: ['data', 'options'],
    setup: () => ({})
  },
  Doughnut: {
    name: 'Doughnut',
    template: '<canvas></canvas>',
    props: ['data', 'options'],
    setup: () => ({})
  }
}))

