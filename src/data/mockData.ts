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
  current: number
  peak: number
  average: number
  total: number
  avgPowerLastMonth: number
  avgPowerThisMonth: number
  avgPowerYesterday: number
  avgPowerToday: number
  avgPowerBeforeYesterday: number
  instantaneousPower: number
}

export interface MeterMetrics {
  consumption: number
  power: number
  cost: number
  co2: number
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
  category: 'TGBT' | 'Compresseurs' | 'Clim' | 'Éclairage'
  subtitle: string
  type: string
  unit: string
  site: string
  color: 'red' | 'green' | 'blue' | 'yellow'
  icon: string
  status: 'online' | 'offline'
  linkedEquipment: string[]
  translationKey?: string
  elements?: MeterElement[]
  metrics: MeterMetrics
  timeSeries: TimeSeriesData
  kpis: KPIValues
}

export interface Sensor {
  id: string
  name: string
  label?: string
  zone: string
  readings: DataPoint[]
  timeSeries: TimeSeriesData
  minTemp: number
  maxTemp: number
  avgTemp: number
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
// Meter Categories
// ===========================

export const CATEGORIES = ['TGBT', 'Compresseurs', 'Clim', 'Éclairage'] as const

// ===========================
// Unified Meters Mock Data
// ===========================

export const MOCK_METERS: Meter[] = [
  // TGBT - Main Electrical Panel (with L1, L2, L3 elements)
  {
    id: '8',
    name: 'TGBT',
    category: 'TGBT',
    subtitle: 'PM2200-TGBT-Indusmind',
    type: 'Main Electrical Panel',
    unit: 'kWh',
    site: 'Main',
    color: 'red',
    icon: 'electric_bolt',
    status: 'online',
    linkedEquipment: ['eq-1', 'eq-2', 'eq-3'],
    elements: [
      {
        id: 'L1',
        name: 'L1',
        metrics: {
          consumption: 2122.5,
          power: 88.4,
          cost: 254.7,
          co2: 425.0,
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
          co2: 439.7,
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
          co2: 409.2,
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
      co2: 1273.9,
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

  // Compresseurs - Industrial Compressors (with Unit 1, 2, 3 elements)
  {
    id: '4',
    name: 'Compresseurs',
    category: 'Compresseurs',
    subtitle: 'Compresseurs industriels',
    type: 'Industrial Compressors',
    unit: 'kWh',
    site: 'Main',
    color: 'green',
    icon: 'compress',
    status: 'online',
    linkedEquipment: ['eq-4', 'eq-5'],
    translationKey: 'equipment.compressorsIndustrial',
    elements: [
      {
        id: 'Unit-1',
        name: 'Unit 1',
        metrics: {
          consumption: 1528.4,
          power: 63.7,
          cost: 183.4,
          co2: 305.7,
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
          co2: 290.6,
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
          co2: 220.7,
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
      cost: 490.2,
      co2: 817.0,
      temperature: 68
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

  // Clim - Cooling System (with Zone A, B elements)
  {
    id: '3',
    name: 'Clim',
    category: 'Clim',
    subtitle: 'Climatisation générale',
    type: 'General Cooling',
    unit: 'kWh',
    site: 'Main',
    color: 'blue',
    icon: 'ac_unit',
    status: 'online',
    linkedEquipment: ['eq-6', 'eq-7'],
    translationKey: 'equipment.climGeneral',
    elements: [
      {
        id: 'Zone-A',
        name: 'Zone A',
        metrics: {
          consumption: 1281.7,
          power: 53.4,
          cost: 153.8,
          co2: 256.3,
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
          co2: 170.6,
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
      cost: 256.1,
      co2: 426.9,
      temperature: 22
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

  // TGBT Secondaire - Secondary Main Panel
  {
    id: '5',
    name: 'PM2200 - TGBT Secondaire',
    category: 'TGBT',
    subtitle: 'TGBT Secondaire',
    type: 'Secondary Electrical Panel',
    unit: 'kWh',
    site: 'Secondary',
    color: 'yellow',
    icon: 'electric_bolt',
    status: 'online',
    linkedEquipment: ['eq-12'],
    translationKey: 'equipment.tgbtSecondary',
    metrics: {
      consumption: 3039.6,
      power: 126.6,
      cost: 364.7,
      co2: 607.9
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

  // Éclairage - Lighting System (single unit, no elements)
  {
    id: '9',
    name: 'Éclairage',
    category: 'Éclairage',
    subtitle: 'Éclairage général',
    type: 'General Lighting',
    unit: 'kWh',
    site: 'Main',
    color: 'yellow',
    icon: 'lightbulb',
    status: 'online',
    linkedEquipment: ['eq-8'],
    translationKey: 'equipment.lightingGeneral',
    metrics: {
      consumption: 3039.6,
      power: 126.6,
      cost: 364.7,
      co2: 607.9
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

  // Compresseur Zone 2 - Secondary Compressor
  {
    id: '10',
    name: 'Compresseur Zone 2',
    category: 'Compresseurs',
    subtitle: 'Compresseur secondaire',
    type: 'Secondary Compressor',
    unit: 'kWh',
    site: 'Zone 2',
    color: 'green',
    icon: 'compress',
    status: 'online',
    linkedEquipment: ['eq-9'],
    translationKey: 'equipment.compressorSecondary',
    metrics: {
      consumption: 1876.4,
      power: 78.2,
      cost: 225.2,
      co2: 375.3,
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
      avgPowerBeforeYesterday: 74.6,
      instantaneousPower: 78.2
    }
  },

  // Clim Bureau - Office Cooling
  {
    id: '11',
    name: 'Clim Bureau',
    category: 'Clim',
    subtitle: 'Climatisation bureaux',
    type: 'Office Cooling',
    unit: 'kWh',
    site: 'Office',
    color: 'blue',
    icon: 'ac_unit',
    status: 'online',
    linkedEquipment: ['eq-10', 'eq-11'],
    translationKey: 'equipment.climOffices',
    metrics: {
      consumption: 987.3,
      power: 41.1,
      cost: 118.5,
      co2: 197.5,
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

  // Production Line - Main Production Equipment
  {
    id: '12',
    name: 'Ligne Production',
    category: 'TGBT',
    subtitle: 'Ligne Production',
    type: 'Production Equipment',
    unit: 'kWh',
    site: 'Production',
    color: 'red',
    icon: 'factory',
    status: 'online',
    linkedEquipment: ['eq-13', 'eq-14'],
    translationKey: 'equipment.productionLine',
    metrics: {
      consumption: 5240.8,
      power: 218.4,
      cost: 628.9,
      co2: 1048.2
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
    id: 'sensor-1',
    name: 'Hall Principal',
    zone: 'Zona-A',
    minTemp: 18,
    maxTemp: 28,
    avgTemp: 22,
    readings: generateDailyData(22, 3),
    timeSeries: {
      hourly: generateHourlyData(22, 2),
      daily: generateDailyData(22, 3),
      monthly: generateMonthlyData(22, 3)
    }
  },
  {
    id: 'sensor-2',
    name: 'Salle Serveurs',
    zone: 'Zone-B',
    minTemp: 16,
    maxTemp: 24,
    avgTemp: 20,
    readings: generateDailyData(20, 2),
    timeSeries: {
      hourly: generateHourlyData(20, 1.5),
      daily: generateDailyData(20, 2),
      monthly: generateMonthlyData(20, 2)
    }
  },
  {
    id: 'sensor-3',
    name: 'Zone Production',
    zone: 'Zone-C',
    minTemp: 19,
    maxTemp: 30,
    avgTemp: 24,
    readings: generateDailyData(24, 4),
    timeSeries: {
      hourly: generateHourlyData(24, 2.5),
      daily: generateDailyData(24, 4),
      monthly: generateMonthlyData(24, 4)
    }
  },
  {
    id: 'sensor-4',
    name: 'Bureau Direction',
    zone: 'Zone-D',
    minTemp: 20,
    maxTemp: 26,
    avgTemp: 23,
    readings: generateDailyData(23, 2),
    timeSeries: {
      hourly: generateHourlyData(23, 1.5),
      daily: generateDailyData(23, 2),
      monthly: generateMonthlyData(23, 2)
    }
  },
  {
    id: 'sensor-5',
    name: 'Stockage Matières',
    zone: 'Zone-E',
    minTemp: 17,
    maxTemp: 29,
    avgTemp: 21,
    readings: generateDailyData(21, 3.5),
    timeSeries: {
      hourly: generateHourlyData(21, 2),
      daily: generateDailyData(21, 3.5),
      monthly: generateMonthlyData(21, 3.5)
    }
  },
  {
    id: 'sensor-6',
    name: 'Chaufferie',
    zone: 'Zone-F',
    minTemp: 25,
    maxTemp: 35,
    avgTemp: 30,
    readings: generateDailyData(30, 3),
    timeSeries: {
      hourly: generateHourlyData(30, 2),
      daily: generateDailyData(30, 3),
      monthly: generateMonthlyData(30, 3)
    }
  },
  {
    id: 'sensor-7',
    name: 'Atelier Mécanique',
    zone: 'Zone-G',
    minTemp: 18,
    maxTemp: 32,
    avgTemp: 25,
    readings: generateDailyData(25, 4.5),
    timeSeries: {
      hourly: generateHourlyData(25, 3),
      daily: generateDailyData(25, 4.5),
      monthly: generateMonthlyData(25, 4.5)
    }
  },
  {
    id: 'sensor-8',
    name: 'Zone Embaliage',
    zone: 'Zone-H',
    minTemp: 19,
    maxTemp: 27,
    avgTemp: 23,
    readings: generateDailyData(23, 2.5),
    timeSeries: {
      hourly: generateHourlyData(23, 2),
      daily: generateDailyData(23, 2.5),
      monthly: generateMonthlyData(23, 2.5)
    }
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

/**
 * Get meters by category
 */
export function getMetersByCategory(category: typeof CATEGORIES[number]): Meter[] {
  return MOCK_METERS.filter(meter => meter.category === category)
}

/**
 * Get meter by ID
 */
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
 * Get all categories
 */
export function getAllCategories(): readonly (typeof CATEGORIES[number])[] {
  return CATEGORIES
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
