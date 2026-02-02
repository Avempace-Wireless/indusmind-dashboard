/**
 * Unified Mock Data
 * Central source for all mock meter and sensor data
 * Used by stores (useMetersStore, useSensorsStore) and views
 */

// ===========================
// Interfaces
// ===========================

export interface DataPoint {
  timestamp: string
  value: number
  quality: 'good' | 'estimated' | 'missing' | 'fair' | 'poor'
}

export interface TimeSeriesData {
  hourly: DataPoint[]
  daily: DataPoint[]
  monthly: DataPoint[]
}

export interface KPIValues {
  // Legacy power KPIs (kW)
  current: number | null
  peak: number | null
  average: number | null
  total: number | null
  avgPowerLastMonth: number | null
  avgPowerThisMonth: number | null
  avgPowerYesterday: number | null
  avgPowerToday: number | null
  avgPowerBeforeYesterday: number | null
  instantaneousPower: number | null
  // Energy consumption KPIs (kWh)
  instantaneousConsumption?: number | null  // Current power consumption (kW) - same as instantaneousPower but named for clarity
  consumedThisHour?: number | null
  consumedToday?: number | null
  consumedYesterday?: number | null
  consumedDayBeforeYesterday?: number | null
  consumedThisMonth?: number | null
  consumedLastMonth?: number | null
  realtimeCurrentYear?: number | null
  realtimeCurrentMonth?: number | null
}

export interface MeterMetrics {
  consumption: number
  power: number
  cost: number
  voltage?: number
  current?: number
  temperature?: number
}

export interface MeterElement {
  id: string
  name: string
  metrics: MeterMetrics
  timeSeries: TimeSeriesData
  kpis: KPIValues
}

export interface Meter {
  id: string
  name: string
  label: string
  deviceUUID: string
  accessToken: string
  subtitle?: string
  type?: string
  unit: string
  site?: string
  color?: string // Auto-assigned or custom
  icon?: string
  status: 'online' | 'offline'
  linkedEquipment?: string[]
  translationKey?: string
  elements?: MeterElement[]
  metrics: MeterMetrics
  timeSeries: TimeSeriesData
  kpis: KPIValues
  assignedToCustomer: boolean
  customerId: number
  createdAt: string
  updatedAt: string
}

export interface Sensor {
  id: string
  name: string
  label: string
  deviceUUID: string
  accessToken: string
  zone?: string
  readings: DataPoint[]
  timeSeries: TimeSeriesData
  minTemp: number
  maxTemp: number
  avgTemp: number
  assignedToCustomer: boolean
  customerId: number
  createdAt: string
  updatedAt: string
  mode?: 'manuel' | 'auto' // Operating mode
}

export interface Controller {
  id: string
  name: string
  label: string
  deviceUUID: string
  accessToken: string
  controlledSensors?: string[] // IDs of sensors this controller manages
  assignedToCustomer: boolean
  customerId: number
  createdAt: string
  updatedAt: string
}

// ===========================
// Helper Functions for Data Generation
// ===========================

function generateHourlyData(baseValue: number, variation: number): DataPoint[] {
  const data: DataPoint[] = []
  const now = new Date()

  for (let i = 23; i >= 0; i--) {
    const date = new Date(now)
    date.setHours(date.getHours() - i)

    // Peak hours: 6am-10pm (6-22), low at night (22-6)
    const hour = date.getHours()
    const peakMultiplier = hour >= 6 && hour < 22 ? 1 + (hour - 6) * 0.02 : 0.7

    const value = baseValue * peakMultiplier + (Math.random() - 0.5) * variation
    data.push({
      timestamp: date.toISOString().substring(11, 16),
      value: parseFloat(value.toFixed(2)),
      quality: 'good'
    })
  }

  return data
}

function generateDailyData(baseValue: number, variation: number, days: number = 30): DataPoint[] {
  const data: DataPoint[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const value = baseValue + (Math.random() - 0.5) * variation
    data.push({
      timestamp: date.toISOString().substring(0, 10),
      value: parseFloat(value.toFixed(2)),
      quality: 'good'
    })
  }

  return data
}

function generateMonthlyData(baseValue: number, variation: number, months: number = 12): DataPoint[] {
  const data: DataPoint[] = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - i)
    date.setDate(1)
    date.setHours(0, 0, 0, 0)

    const value = baseValue * 30 + (Math.random() - 0.5) * variation * 30
    data.push({
      timestamp: date.toISOString().substring(0, 7),
      value: parseFloat(value.toFixed(2)),
      quality: 'good'
    })
  }

  return data
}

// ===========================
// Unified Meters Mock Data
// ===========================

export const MOCK_METERS: Meter[] = [
  // PM2200-TGBT-Indusmind - Main Electrical Panel (with L1, L2, L3 elements)
  {
    id: '8',
    name: 'PM2200-TGBT-Indusmind',
    label: 'TGBT',
    deviceUUID: '545ffcb0-ab9c-11f0-a05e-97f672464deb',
    accessToken: 'UgPrFSjDhgKUquEwyIB8',
    subtitle: 'PM2200-TGBT-Indusmind',
    type: 'Main Electrical Panel',
    unit: 'kWh',
    site: 'Main',
    color: '#ef4444',
    icon: 'electric_bolt',
    status: 'online',
    linkedEquipment: ['eq-1', 'eq-2', 'eq-3'],
    assignedToCustomer: true,
    customerId: 2,
    createdAt: '2025-10-18T21:03:25.881Z',
    updatedAt: '2025-10-18T21:03:25.881Z',
    elements: [
      {
        id: 'L1',
        name: 'L1',
        metrics: {
          consumption: 2122.5,
          power: 88.4,
          cost: 254.7,
          voltage: 230,
          current: 384.3
        },
        timeSeries: {
          hourly: generateHourlyData(88, 15),
          daily: generateDailyData(2100, 200),
          monthly: generateMonthlyData(2100, 200)
        },
        kpis: {
          current: 88.4,
          peak: 102.5,
          average: 85.2,
          total: 2122.5,
          avgPowerLastMonth: 85.2,
          avgPowerThisMonth: 88.4,
          avgPowerYesterday: 86.1,
          avgPowerToday: 88.4,
          avgPowerBeforeYesterday: 84.9,
          instantaneousPower: 88.4
        }
      },
      {
        id: 'L2',
        name: 'L2',
        metrics: {
          consumption: 2198.3,
          power: 91.6,
          cost: 263.8,
          voltage: 230,
          current: 398.3
        },
        timeSeries: {
          hourly: generateHourlyData(91, 16),
          daily: generateDailyData(2180, 210),
          monthly: generateMonthlyData(2180, 210)
        },
        kpis: {
          current: 91.6,
          peak: 106.2,
          average: 88.5,
          total: 2198.3,
          avgPowerLastMonth: 88.5,
          avgPowerThisMonth: 91.6,
          avgPowerYesterday: 89.4,
          avgPowerToday: 91.6,
          avgPowerBeforeYesterday: 87.8,
          instantaneousPower: 91.6
        }
      },
      {
        id: 'L3',
        name: 'L3',
        metrics: {
          consumption: 2045.8,
          power: 85.2,
          cost: 245.5,
          voltage: 230,
          current: 370.4
        },
        timeSeries: {
          hourly: generateHourlyData(85, 14),
          daily: generateDailyData(2040, 190),
          monthly: generateMonthlyData(2040, 190)
        },
        kpis: {
          current: 85.2,
          peak: 98.7,
          average: 82.1,
          total: 2045.8,
          avgPowerLastMonth: 82.1,
          avgPowerThisMonth: 85.2,
          avgPowerYesterday: 83.5,
          avgPowerToday: 85.2,
          avgPowerBeforeYesterday: 81.6,
          instantaneousPower: 85.2
        }
      }
    ],
    metrics: {
      consumption: 6366.6,
      power: 265.2,
      cost: 764.0,
      voltage: 400,
      current: 1153.0
    },
    timeSeries: {
      hourly: generateHourlyData(265, 45),
      daily: generateDailyData(6320, 600),
      monthly: generateMonthlyData(6320, 600)
    },
    kpis: {
      current: 265.2,
      peak: 307.4,
      average: 255.8,
      total: 6366.6,
      avgPowerLastMonth: 255.8,
      avgPowerThisMonth: 265.2,
      avgPowerYesterday: 259.0,
      avgPowerToday: 265.2,
      avgPowerBeforeYesterday: 254.3,
      instantaneousPower: 265.2
    }
  },

  // PM2200-Compresseur - Industrial Compressors (with Unit 1, 2, 3 elements)
  {
    id: '4',
    name: 'PM2200-Compresseur',
    label: 'Compresseur',
    deviceUUID: '04f2b660-2f80-11f0-81a4-050c01ec03ef',
    accessToken: 'AbaCddzoPbEuQMlfGMy9',
    subtitle: 'Compresseurs industriels',
    type: 'Industrial Compressors',
    unit: 'kWh',
    site: 'Main',
    color: '#22c55e',
    icon: 'compress',
    status: 'online',
    linkedEquipment: ['eq-4', 'eq-5'],
    translationKey: 'equipment.compressorsIndustrial',
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-05-18T19:12:49.107Z',
    updatedAt: '2025-11-03T11:12:16.410Z',
    elements: [
      {
        id: 'Unit-1',
        name: 'Unit 1',
        metrics: {
          consumption: 1528.4,
          power: 63.7,
          cost: 183.4,
          temperature: 72
        },
        timeSeries: {
          hourly: generateHourlyData(63, 10),
          daily: generateDailyData(1520, 140),
          monthly: generateMonthlyData(1520, 140)
        },
        kpis: {
          current: 63.7,
          peak: 75.2,
          average: 61.5,
          total: 1528.4,
          avgPowerLastMonth: 61.5,
          avgPowerThisMonth: 63.7,
          avgPowerYesterday: 62.4,
          avgPowerToday: 63.7,
          avgPowerBeforeYesterday: 60.8,
          instantaneousPower: 63.7
        }
      },
      {
        id: 'Unit-2',
        name: 'Unit 2',
        metrics: {
          consumption: 1453.2,
          power: 60.5,
          cost: 174.4,
          temperature: 68
        },
        timeSeries: {
          hourly: generateHourlyData(60, 9),
          daily: generateDailyData(1450, 130),
          monthly: generateMonthlyData(1450, 130)
        },
        kpis: {
          current: 60.5,
          peak: 71.3,
          average: 58.4,
          total: 1453.2,
          avgPowerLastMonth: 58.4,
          avgPowerThisMonth: 60.5,
          avgPowerYesterday: 59.2,
          avgPowerToday: 60.5,
          avgPowerBeforeYesterday: 57.9,
          instantaneousPower: 60.5
        }
      },
      {
        id: 'Unit-3',
        name: 'Unit 3',
        metrics: {
          consumption: 1103.6,
          power: 46.0,
          cost: 132.4,
          temperature: 65
        },
        timeSeries: {
          hourly: generateHourlyData(46, 7),
          daily: generateDailyData(1100, 100),
          monthly: generateMonthlyData(1100, 100)
        },
        kpis: {
          current: 46.0,
          peak: 54.2,
          average: 44.4,
          total: 1103.6,
          avgPowerLastMonth: 44.4,
          avgPowerThisMonth: 46.0,
          avgPowerYesterday: 45.1,
          avgPowerToday: 46.0,
          avgPowerBeforeYesterday: 43.9,
          instantaneousPower: 46.0
        }
      }
    ],
    metrics: {
      consumption: 4085.2,
      power: 170.2,
      cost: 490.2
    },
    timeSeries: {
      hourly: generateHourlyData(170, 26),
      daily: generateDailyData(4050, 370),
      monthly: generateMonthlyData(4050, 370)
    },
    kpis: {
      current: 170.2,
      peak: 200.7,
      average: 164.3,
      total: 4085.2,
      avgPowerLastMonth: 164.3,
      avgPowerThisMonth: 170.2,
      avgPowerYesterday: 166.7,
      avgPowerToday: 170.2,
      avgPowerBeforeYesterday: 162.6,
      instantaneousPower: 170.2
    }
  },

  // PM2200-Climatisation - Cooling System (with Zone A, B elements)
  {
    id: '3',
    name: 'PM2200-Climatisation',
    label: 'Climatisation',
    deviceUUID: 'f3f72da0-2f7f-11f0-81a4-050c01ec03ef',
    accessToken: 'OYdnyzPDNZvOyeS1uild',
    subtitle: 'Climatisation générale',
    type: 'General Cooling',
    unit: 'kWh',
    site: 'Main',
    color: '#3b82f6',
    icon: 'ac_unit',
    status: 'online',
    linkedEquipment: ['eq-6', 'eq-7'],
    translationKey: 'equipment.climGeneral',
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-05-18T19:12:24.369Z',
    updatedAt: '2025-11-03T11:12:16.270Z',
    elements: [
      {
        id: 'Zone-A',
        name: 'Zone A',
        metrics: {
          consumption: 1281.7,
          power: 53.4,
          cost: 153.8,
          temperature: 22
        },
        timeSeries: {
          hourly: generateHourlyData(53, 8),
          daily: generateDailyData(1280, 120),
          monthly: generateMonthlyData(1280, 120)
        },
        kpis: {
          current: 53.4,
          peak: 62.9,
          average: 51.5,
          total: 1281.7,
          avgPowerLastMonth: 51.5,
          avgPowerThisMonth: 53.4,
          avgPowerYesterday: 52.3,
          avgPowerToday: 53.4,
          avgPowerBeforeYesterday: 50.9,
          instantaneousPower: 53.4
        }
      },
      {
        id: 'Zone-B',
        name: 'Zone B',
        metrics: {
          consumption: 852.8,
          power: 35.5,
          cost: 102.3,
          temperature: 23
        },
        timeSeries: {
          hourly: generateHourlyData(35, 6),
          daily: generateDailyData(850, 80),
          monthly: generateMonthlyData(850, 80)
        },
        kpis: {
          current: 35.5,
          peak: 41.8,
          average: 34.3,
          total: 852.8,
          avgPowerLastMonth: 34.3,
          avgPowerThisMonth: 35.5,
          avgPowerYesterday: 34.8,
          avgPowerToday: 35.5,
          avgPowerBeforeYesterday: 33.9,
          instantaneousPower: 35.5
        }
      }
    ],
    metrics: {
      consumption: 2134.5,
      power: 88.9,
      cost: 256.1
    },
    timeSeries: {
      hourly: generateHourlyData(88, 14),
      daily: generateDailyData(2130, 200),
      monthly: generateMonthlyData(2130, 200)
    },
    kpis: {
      current: 88.9,
      peak: 104.7,
      average: 85.8,
      total: 2134.5,
      avgPowerLastMonth: 85.8,
      avgPowerThisMonth: 88.9,
      avgPowerYesterday: 87.1,
      avgPowerToday: 88.9,
      avgPowerBeforeYesterday: 84.8,
      instantaneousPower: 88.9
    }
  },

  // PM2200-TGBT - Secondary Main Panel
  {
    id: '5',
    name: 'PM2200-TGBT',
    label: 'TGBT',
    deviceUUID: 'da5fd130-2f7f-11f0-81a4-050c01ec03ef',
    accessToken: 'kMj8u3wYEaBfhzZvQsoY',
    subtitle: 'TGBT Secondaire',
    type: 'Secondary Electrical Panel',
    unit: 'kWh',
    site: 'Secondary',
    color: '#eab308',
    icon: 'electric_bolt',
    status: 'online',
    linkedEquipment: ['eq-12'],
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-05-18T19:13:15.059Z',
    updatedAt: '2025-11-03T11:12:16.539Z',
    metrics: {
      consumption: 3039.6,
      power: 126.6,
      cost: 364.7
    },
    timeSeries: {
      hourly: generateHourlyData(126, 20),
      daily: generateDailyData(3020, 280),
      monthly: generateMonthlyData(3020, 280)
    },
    kpis: {
      current: 126.6,
      peak: 149.2,
      average: 122.2,
      total: 3039.6,
      avgPowerLastMonth: 122.2,
      avgPowerThisMonth: 126.6,
      avgPowerYesterday: 124.1,
      avgPowerToday: 126.6,
      avgPowerBeforeYesterday: 121.0,
      instantaneousPower: 126.6
    }
  },

  // PM2200-Eclairage - Lighting System (adding more based on naming pattern)
  {
    id: '9',
    name: 'PM2200-Eclairage',
    label: 'Éclairage',
    deviceUUID: 'da5fd140-2f7f-11f0-81a4-050c01ec03ef',
    accessToken: 'kMj8u3wYEaBfhzZvQsoY',
    subtitle: 'Éclairage général',
    type: 'General Lighting',
    unit: 'kWh',
    site: 'Main',
    color: '#eab308',
    icon: 'lightbulb',
    status: 'online',
    linkedEquipment: ['eq-8'],
    translationKey: 'equipment.lightingGeneral',
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-06-15T10:30:00.000Z',
    updatedAt: '2025-11-03T11:12:16.000Z',
    metrics: {
      consumption: 3039.6,
      power: 126.6,
      cost: 364.7
    },
    timeSeries: {
      hourly: generateHourlyData(126, 20),
      daily: generateDailyData(3020, 280),
      monthly: generateMonthlyData(3020, 280)
    },
    kpis: {
      current: 126.6,
      peak: 149.2,
      average: 122.2,
      total: 3039.6,
      avgPowerLastMonth: 122.2,
      avgPowerThisMonth: 126.6,
      avgPowerYesterday: 124.1,
      avgPowerToday: 126.6,
      avgPowerBeforeYesterday: 121.0,
      instantaneousPower: 126.6
    }
  },

  // PM2200-Compresseur-2 - Secondary Compressor
  {
    id: '10',
    name: 'PM2200-Compresseur-2',
    label: 'Compresseur Zone 2',
    deviceUUID: '04f2b670-2f80-11f0-81a4-050c01ec03ef',
    accessToken: 'BbaCddzoPbEuQMlfGMy9',
    subtitle: 'Compresseur secondaire',
    type: 'Secondary Compressor',
    unit: 'kWh',
    site: 'Zone 2',
    color: '#22c55e',
    icon: 'compress',
    status: 'online',
    linkedEquipment: ['eq-9'],
    translationKey: 'equipment.compressorSecondary',
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-06-01T14:00:00.000Z',
    updatedAt: '2025-11-03T11:12:17.000Z',
    metrics: {
      consumption: 1876.4,
      power: 78.2,
      cost: 225.2,
      temperature: 70
    },
    timeSeries: {
      hourly: generateHourlyData(78, 12),
      daily: generateDailyData(1870, 170),
      monthly: generateMonthlyData(1870, 170)
    },
    kpis: {
      current: 78.2,
      peak: 92.1,
      average: 75.5,
      total: 1876.4,
      avgPowerLastMonth: 75.5,
      avgPowerThisMonth: 78.2,
      avgPowerYesterday: 76.7,
      avgPowerToday: 78.2,
      avgPowerBeforeYesterday: 75.1,
      instantaneousPower: 78.2
    }
  },

  // PM2200-Climatisation-Bureau - Office Cooling
  {
    id: '11',
    name: 'PM2200-Climatisation-Bureau',
    label: 'Clim Bureau',
    deviceUUID: 'f3f72db0-2f7f-11f0-81a4-050c01ec03ef',
    accessToken: 'PYdnyzPDNZvOyeS1uild',
    subtitle: 'Climatisation bureaux',
    type: 'Office Cooling',
    unit: 'kWh',
    site: 'Office',
    color: '#3b82f6',
    icon: 'ac_unit',
    status: 'online',
    linkedEquipment: ['eq-10', 'eq-11'],
    translationKey: 'equipment.climOffices',
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-06-10T09:15:00.000Z',
    updatedAt: '2025-11-03T11:12:18.000Z',
    metrics: {
      consumption: 987.3,
      power: 41.1,
      cost: 118.5,
      temperature: 21
    },
    timeSeries: {
      hourly: generateHourlyData(41, 7),
      daily: generateDailyData(980, 90),
      monthly: generateMonthlyData(980, 90)
    },
    kpis: {
      current: 41.1,
      peak: 48.4,
      average: 39.7,
      total: 987.3,
      avgPowerLastMonth: 39.7,
      avgPowerThisMonth: 41.1,
      avgPowerYesterday: 40.3,
      avgPowerToday: 41.1,
      avgPowerBeforeYesterday: 39.2,
      instantaneousPower: 41.1
    }
  },

  // PM2200-Production - Main Production Equipment
  {
    id: '12',
    name: 'PM2200-Production',
    label: 'Ligne Production',
    deviceUUID: '545ffcc0-ab9c-11f0-a05e-97f672464deb',
    accessToken: 'VgPrFSjDhgKUquEwyIB8',
    subtitle: 'Ligne Production',
    type: 'Production Equipment',
    unit: 'kWh',
    site: 'Production',
    color: '#ef4444',
    icon: 'factory',
    status: 'online',
    linkedEquipment: ['eq-13', 'eq-14'],
    translationKey: 'equipment.productionLine',
    assignedToCustomer: true,
    customerId: 2,
    createdAt: '2025-07-01T08:00:00.000Z',
    updatedAt: '2025-11-03T11:12:19.000Z',
    metrics: {
      consumption: 5240.8,
      power: 218.4,
      cost: 628.9
    },
    timeSeries: {
      hourly: generateHourlyData(218, 35),
      daily: generateDailyData(5200, 500),
      monthly: generateMonthlyData(5200, 500)
    },
    kpis: {
      current: 218.4,
      peak: 256.8,
      average: 210.5,
      total: 5240.8,
      avgPowerLastMonth: 210.5,
      avgPowerThisMonth: 218.4,
      avgPowerYesterday: 214.2,
      avgPowerToday: 218.4,
      avgPowerBeforeYesterday: 208.9,
      instantaneousPower: 218.4
    }
  }
]

// ===========================
// Unified Sensors Mock Data
// ===========================

export const MOCK_SENSORS: Sensor[] = [
  {
    id: '1',
    name: 'Indusmind_T_Sensor_95E64C',
    label: 'Zone 2',
    deviceUUID: 'fc1ce180-3030-11f0-81a4-050c01ec03ef',
    accessToken: 'uesmGoF8Kn3OWHYIsaVE',
    zone: 'Zone-2',
    minTemp: 18,
    maxTemp: 28,
    avgTemp: 22,
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-05-18T19:11:32.021Z',
    updatedAt: '2025-11-03T11:12:16.005Z',
    readings: generateDailyData(22, 3),
    timeSeries: {
      hourly: generateHourlyData(22, 2),
      daily: generateDailyData(22, 3),
      monthly: generateMonthlyData(22, 3)
    }
  },
  {
    id: '2',
    name: 'Indusmind_T_Sensor_9527CC',
    label: 'Zone 1',
    deviceUUID: 'c44ae4c0-2f7f-11f0-81a4-050c01ec03ef',
    accessToken: '01NdZW9LlxH8TNRm8ZDz',
    zone: 'Zone-1',
    minTemp: 16,
    maxTemp: 24,
    avgTemp: 20,
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-05-18T19:11:57.663Z',
    updatedAt: '2025-11-03T11:12:16.137Z',
    readings: generateDailyData(20, 2),
    timeSeries: {
      hourly: generateHourlyData(20, 1.5),
      daily: generateDailyData(20, 2),
      monthly: generateMonthlyData(20, 2)
    }
  },
  {
    id: '6',
    name: 'Indusmind_T_Sensor_95DC2C',
    label: 'Zone 3',
    deviceUUID: 'd5054c60-348e-11f0-ba36-29b3a8b296dd',
    accessToken: 'C6o7mVoRWXq1h0pdn13L',
    zone: 'Zone-3',
    minTemp: 19,
    maxTemp: 30,
    avgTemp: 24,
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-05-19T09:09:06.971Z',
    updatedAt: '2025-11-03T11:12:16.671Z',
    readings: generateDailyData(24, 4),
    timeSeries: {
      hourly: generateHourlyData(24, 2.5),
      daily: generateDailyData(24, 4),
      monthly: generateMonthlyData(24, 4)
    }
  },
  // Additional sensors to expand the data set
  {
    id: '13',
    name: 'Indusmind_T_Sensor_95E751',
    label: 'Bureau Direction',
    deviceUUID: 'fc1ce190-3030-11f0-81a4-050c01ec03ef',
    accessToken: 'vfsmGoF8Kn3OWHYIsaVE',
    zone: 'Zone-4',
    minTemp: 20,
    maxTemp: 26,
    avgTemp: 23,
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-06-20T10:00:00.000Z',
    updatedAt: '2025-11-03T11:12:20.000Z',
    readings: generateDailyData(23, 2),
    timeSeries: {
      hourly: generateHourlyData(23, 1.5),
      daily: generateDailyData(23, 2),
      monthly: generateMonthlyData(23, 2)
    }
  },
  {
    id: '14',
    name: 'Indusmind_T_Sensor_95E852',
    label: 'Stockage Matières',
    deviceUUID: 'c44ae4d0-2f7f-11f0-81a4-050c01ec03ef',
    accessToken: '02NdZW9LlxH8TNRm8ZDz',
    zone: 'Zone-5',
    minTemp: 17,
    maxTemp: 29,
    avgTemp: 21,
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-06-25T14:30:00.000Z',
    updatedAt: '2025-11-03T11:12:21.000Z',
    readings: generateDailyData(21, 3.5),
    timeSeries: {
      hourly: generateHourlyData(21, 2),
      daily: generateDailyData(21, 3.5),
      monthly: generateMonthlyData(21, 3.5)
    }
  },
  {
    id: '15',
    name: 'Indusmind_T_Sensor_95E953',
    label: 'Chaufferie',
    deviceUUID: 'd5054c70-348e-11f0-ba36-29b3a8b296dd',
    accessToken: 'D7o7mVoRWXq1h0pdn13L',
    zone: 'Zone-6',
    minTemp: 25,
    maxTemp: 35,
    avgTemp: 30,
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-07-01T08:00:00.000Z',
    updatedAt: '2025-11-03T11:12:22.000Z',
    readings: generateDailyData(30, 3),
    timeSeries: {
      hourly: generateHourlyData(30, 2),
      daily: generateDailyData(30, 3),
      monthly: generateMonthlyData(30, 3)
    }
  },
  {
    id: '16',
    name: 'Indusmind_T_Sensor_95EA54',
    label: 'Atelier Mécanique',
    deviceUUID: 'fc1ce1a0-3030-11f0-81a4-050c01ec03ef',
    accessToken: 'wgsmGoF8Kn3OWHYIsaVE',
    zone: 'Zone-7',
    minTemp: 18,
    maxTemp: 32,
    avgTemp: 25,
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-07-10T09:15:00.000Z',
    updatedAt: '2025-11-03T11:12:23.000Z',
    readings: generateDailyData(25, 4.5),
    timeSeries: {
      hourly: generateHourlyData(25, 3),
      daily: generateDailyData(25, 4.5),
      monthly: generateMonthlyData(25, 4.5)
    }
  },
  {
    id: '17',
    name: 'Indusmind_T_Sensor_95EB55',
    label: 'Zone Emballage',
    deviceUUID: 'c44ae4e0-2f7f-11f0-81a4-050c01ec03ef',
    accessToken: '03NdZW9LlxH8TNRm8ZDz',
    zone: 'Zone-8',
    minTemp: 19,
    maxTemp: 27,
    avgTemp: 23,
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-07-15T13:45:00.000Z',
    updatedAt: '2025-11-03T11:12:24.000Z',
    readings: generateDailyData(23, 2.5),
    timeSeries: {
      hourly: generateHourlyData(23, 2),
      daily: generateDailyData(23, 2.5),
      monthly: generateMonthlyData(23, 2.5)
    }
  }
]

// ===========================
// Controllers Mock Data
// ===========================

export const MOCK_CONTROLLERS: Controller[] = [
  {
    id: '7',
    name: 'Indusmind_Controller_A80C6C',
    label: 'Indusmind_Controller_A80C6C',
    deviceUUID: '5ddb6820-44a8-11f0-9944-971940e1d7c1',
    accessToken: 'aH4S96e7Wzof3LRcljRv',
    controlledSensors: ['1', '2', '6'], // Controls first 3 sensors
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-06-11T22:39:40.337Z',
    updatedAt: '2025-11-03T11:12:16.802Z'
  },
  {
    id: '18',
    name: 'Indusmind_Controller_A80D7D',
    label: 'Indusmind_Controller_A80D7D',
    deviceUUID: '5ddb6830-44a8-11f0-9944-971940e1d7c1',
    accessToken: 'bI5T07f8Xzpg4MSdmkSw',
    controlledSensors: ['13', '14', '15'], // Controls sensors 13-15
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-07-20T10:00:00.000Z',
    updatedAt: '2025-11-03T11:12:25.000Z'
  },
  {
    id: '19',
    name: 'Indusmind_Controller_A80E8E',
    label: 'Indusmind_Controller_A80E8E',
    deviceUUID: '5ddb6840-44a8-11f0-9944-971940e1d7c1',
    accessToken: 'cJ6U18g9Yaqh5NTenl Tx',
    controlledSensors: ['16', '17'], // Controls sensors 16-17
    assignedToCustomer: true,
    customerId: 1,
    createdAt: '2025-07-25T14:30:00.000Z',
    updatedAt: '2025-11-03T11:12:26.000Z'
  }
]

// ===========================
// Sensor Color Palette (for thermal management view)
// ===========================

export const SENSOR_COLOR_PALETTE = [
  '#f97316', // orange
  '#ef4444', // red
  '#3b82f6', // blue
  '#22c55e', // green
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#f59e0b'  // amber
]

// ===========================
// Helper Functions
// ===========================

export function getMeterById(id: string): Meter | undefined {
  return MOCK_METERS.find(meter => meter.id === id)
}

/**
 * Get element data from meter
 */
export function getElementData(meterId: string, elementId: string): MeterElement | undefined {
  const meter = getMeterById(meterId)
  if (!meter?.elements) return undefined
  return meter.elements.find(el => el.id === elementId)
}

/**
 * Get sensor by ID
 */
export function getSensorById(id: string): Sensor | undefined {
  return MOCK_SENSORS.find(sensor => sensor.id === id)
}

/**
 * Get all sensors
 */
export function getAllSensors(): Sensor[] {
  return MOCK_SENSORS
}

/**
 * Get controller by ID
 */
export function getControllerById(id: string): Controller | undefined {
  return MOCK_CONTROLLERS.find(controller => controller.id === id)
}

/**
 * Get all controllers
 */
export function getAllControllers(): Controller[] {
  return MOCK_CONTROLLERS
}

/**
 * Get sensors controlled by a controller
 */
export function getSensorsByController(controllerId: string): Sensor[] {
  const controller = getControllerById(controllerId)
  if (!controller?.controlledSensors) return []
  return controller.controlledSensors
    .map(sensorId => getSensorById(sensorId))
    .filter(Boolean) as Sensor[]
}

/**
 * Filter devices by type (PM2200, Sensor, Controller)
 */
export function filterDevicesByType(type: 'meter' | 'sensor' | 'controller'): (Meter | Sensor | Controller)[] {
  switch (type) {
    case 'meter':
      return MOCK_METERS.filter(m => m.name.startsWith('PM2200'))
    case 'sensor':
      return MOCK_SENSORS.filter(s => s.name.startsWith('Indusmind_T_Sensor'))
    case 'controller':
      return MOCK_CONTROLLERS.filter(c => c.name.startsWith('Indusmind_Controller'))
    default:
      return []
  }
}
