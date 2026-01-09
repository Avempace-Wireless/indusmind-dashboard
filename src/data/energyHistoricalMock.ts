export interface EnergyPoint {
  timestamp: string
  value: number // kWh
}

export interface DailyEnergySeries {
  date: string // YYYY-MM-DD
  totalMWh: number
  hourlyData: EnergyPoint[]
}

function generateHourlyData(baseDate: string, baseValue = 150): EnergyPoint[] {
  const data: EnergyPoint[] = []
  const [year, month, day] = baseDate.split('-').map(Number)

  for (let hour = 0; hour < 24; hour++) {
    const d = new Date(year, month - 1, day, hour, 0, 0)
    const variance = Math.sin((hour / 24) * Math.PI * 2) * 50 + (Math.random() - 0.5) * 30
    const value = parseFloat((baseValue + variance).toFixed(2))
    data.push({
      timestamp: d.toISOString(),
      value: Math.max(0, value)
    })
  }

  return data
}

function calculateTotalMWh(hourlyData: EnergyPoint[]): number {
  const totalKWh = hourlyData.reduce((sum, point) => sum + point.value, 0)
  return parseFloat((totalKWh / 1000).toFixed(3))
}

// Generate data for current month
const today = new Date()
const currentYear = today.getFullYear()
const currentMonth = today.getMonth() + 1

export const energyHistoricalData: DailyEnergySeries[] = []

for (let day = 1; day <= 31; day++) {
  const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const baseValue = 120 + (day % 7) * 20 + (Math.random() - 0.5) * 40
  const hourlyData = generateHourlyData(dateStr, baseValue)

  energyHistoricalData.push({
    date: dateStr,
    totalMWh: calculateTotalMWh(hourlyData),
    hourlyData
  })
}

// Helper to get data for specific date
export function getEnergyDataForDate(dateStr: string): DailyEnergySeries | undefined {
  return energyHistoricalData.find(d => d.date === dateStr)
}

// Helper to get data for date range
export function getEnergyDataForRange(startDate: string, endDate: string): DailyEnergySeries[] {
  return energyHistoricalData.filter(d => d.date >= startDate && d.date <= endDate)
}

export const characteristics = [
  { id: 'energy', label: 'Énergie', enabled: true },
  { id: 'co2', label: 'CO2', enabled: false },
  { id: 'cost', label: 'Coût', enabled: false },
  { id: 'consumption', label: 'Consommation', enabled: false }
]
