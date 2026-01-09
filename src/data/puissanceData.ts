/**
 * Mock data for Puissance (Power) view
 * Contains hourly, daily, and monthly power data for 4 meters
 */

export interface MeterData {
  id: string
  name: string
  color: string
  icon: string
  kpiValues: {
    avgPowerLastMonth: number
    avgPowerThisMonth: number
    avgPowerYesterday: number
    avgPowerToday: number
    avgPowerBeforeYesterday: number
    instantaneousPower: number
  }
  monthlyData: {
    labels: string[]
    values: number[]
  }
  dailyData: {
    labels: string[]
    values: number[]
  }
  hourlyData: {
    labels: string[]
    values: number[]
  }
  hourlyTableData: Array<{ timestamp: string; power: number }>
  dailyTableData: Array<{ timestamp: string; power: number }>
  dailyAverageData: Array<{ timestamp: string; power: number }>
}

// Generate realistic hourly data for the current day
function generateHourlyData() {
  const labels: string[] = []
  const values: number[] = []

  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0')
    labels.push(`${hour}:00`)

    // Peak hours 8-18, low at night
    let baseValue = 80
    if (i >= 6 && i < 22) {
      baseValue = 100 + Math.random() * 50
    } else {
      baseValue = 50 + Math.random() * 30
    }

    values.push(parseFloat(baseValue.toFixed(1)))
  }

  return { labels, values }
}

// Generate hourly table data (last 24 hours)
function generateHourlyTableData(baseMultiplier: number) {
  const data: Array<{ timestamp: string; power: number }> = []
  const now = new Date()

  for (let i = 23; i >= 0; i--) {
    const date = new Date(now)
    date.setHours(date.getHours() - i)
    const timestamp = date.toISOString().substring(0, 16).replace('T', ' ')
    const hour = date.getHours()

    let power = 80
    if (hour >= 6 && hour < 22) {
      power = (100 + Math.random() * 50) * baseMultiplier
    } else {
      power = (50 + Math.random() * 30) * baseMultiplier
    }

    data.push({
      timestamp,
      power: parseFloat(power.toFixed(1)),
    })
  }

  return data
}

// Generate daily table data for current month
function generateDailyTableData(baseMultiplier: number) {
  const data: Array<{ timestamp: string; power: number }> = []
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(now.getFullYear(), now.getMonth(), day)
    const timestamp = date.toISOString().substring(0, 10)
    const power = (100 + Math.random() * 40) * baseMultiplier

    data.push({
      timestamp,
      power: parseFloat(power.toFixed(1)),
    })
  }

  return data
}

// Generate daily average data
function generateDailyAverageData(baseMultiplier: number) {
  const data: Array<{ timestamp: string; power: number }> = []
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const timestamp = date.toISOString().substring(0, 10)
    const power = (90 + Math.random() * 45) * baseMultiplier

    data.push({
      timestamp,
      power: parseFloat(power.toFixed(1)),
    })
  }

  return data
}

// Generate daily data for current month
function generateDailyData(baseMultiplier: number = 1) {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const labels: string[] = []
  const values: number[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    labels.push(`${day}`)
    const power = (100 + Math.random() * 40) * baseMultiplier
    values.push(parseFloat(power.toFixed(1)))
  }

  return { labels, values }
}

// Generate monthly data
function generateMonthlyData(baseMultiplier: number = 1) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const labels = months
  const values = months.map(() => {
    const power = (95 + Math.random() * 45) * baseMultiplier
    return parseFloat(power.toFixed(1))
  })

  return { labels, values }
}

// TGBT Meter
export const tgbtMeter: MeterData = {
  id: 'tgbt',
  name: 'TGBT',
  color: '#ef4444', // Red
  icon: 'bolt',
  kpiValues: {
    avgPowerLastMonth: 125.4,
    avgPowerThisMonth: 118.3,
    avgPowerYesterday: 98.7,
    avgPowerToday: 102.3,
    avgPowerBeforeYesterday: 0,
    instantaneousPower: 110.6,
  },
  monthlyData: generateMonthlyData(1),
  dailyData: generateDailyData(1),
  hourlyData: generateHourlyData(),
  hourlyTableData: generateHourlyTableData(1),
  dailyTableData: generateDailyTableData(1),
  dailyAverageData: generateDailyAverageData(1),
}

// Compressor Meter
export const compressorMeter: MeterData = {
  id: 'compressor',
  name: 'Compresseur',
  color: '#22c55e', // Green
  icon: 'bolt',
  kpiValues: {
    avgPowerLastMonth: 85.2,
    avgPowerThisMonth: 92.1,
    avgPowerYesterday: 88.5,
    avgPowerToday: 91.7,
    avgPowerBeforeYesterday: 0,
    instantaneousPower: 89.3,
  },
  monthlyData: generateMonthlyData(0.75),
  dailyData: generateDailyData(0.75),
  hourlyData: (() => {
    const data = generateHourlyData()
    return {
      labels: data.labels,
      values: data.values.map(v => v * 0.75),
    }
  })(),
  hourlyTableData: generateHourlyTableData(0.75),
  dailyTableData: generateDailyTableData(0.75),
  dailyAverageData: generateDailyAverageData(0.75),
}

// Cooling Meter
export const coolingMeter: MeterData = {
  id: 'cooling',
  name: 'Climatisation',
  color: '#3b82f6', // Blue
  icon: 'bolt',
  kpiValues: {
    avgPowerLastMonth: 65.3,
    avgPowerThisMonth: 72.5,
    avgPowerYesterday: 68.2,
    avgPowerToday: 75.1,
    avgPowerBeforeYesterday: 0,
    instantaneousPower: 71.8,
  },
  monthlyData: generateMonthlyData(0.55),
  dailyData: generateDailyData(0.55),
  hourlyData: (() => {
    const data = generateHourlyData()
    return {
      labels: data.labels,
      values: data.values.map(v => v * 0.55),
    }
  })(),
  hourlyTableData: generateHourlyTableData(0.55),
  dailyTableData: generateDailyTableData(0.55),
  dailyAverageData: generateDailyAverageData(0.55),
}

// Lighting Meter
export const lightingMeter: MeterData = {
  id: 'lighting',
  name: 'Éclairage',
  color: '#eab308', // Yellow
  icon: 'bolt',
  kpiValues: {
    avgPowerLastMonth: 35.8,
    avgPowerThisMonth: 38.2,
    avgPowerYesterday: 36.5,
    avgPowerToday: 39.2,
    avgPowerBeforeYesterday: 0,
    instantaneousPower: 37.6,
  },
  monthlyData: generateMonthlyData(0.35),
  dailyData: generateDailyData(0.35),
  hourlyData: (() => {
    const data = generateHourlyData()
    return {
      labels: data.labels,
      values: data.values.map(v => v * 0.35),
    }
  })(),
  hourlyTableData: generateHourlyTableData(0.35),
  dailyTableData: generateDailyTableData(0.35),
  dailyAverageData: generateDailyAverageData(0.35),
}

// All meters
export const allMeters: Record<string, MeterData> = {
  tgbt: tgbtMeter,
  compressor: compressorMeter,
  cooling: coolingMeter,
  lighting: lightingMeter,
}
