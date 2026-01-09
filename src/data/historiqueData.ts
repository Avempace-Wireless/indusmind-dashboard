export interface SeriesPoint { timestamp: string; value: number }

export interface MeterSeries {
  id: string
  name: string
  color: string
  series: SeriesPoint[]
}

// Simple helper to generate hourly series for a date range
function generateHourlySeries(start: Date, hours: number, base = 100) {
  const s: SeriesPoint[] = []
  for (let i = 0; i < hours; i++) {
    const d = new Date(start)
    d.setHours(d.getHours() + i)
    s.push({ timestamp: d.toISOString(), value: parseFloat((base + Math.random() * 40 - 20).toFixed(2)) })
  }
  return s
}

const now = new Date()
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)

export const mockMeters: MeterSeries[] = [
  { id: 'm1', name: 'Building 1 - Main', color: '#ef4444', series: generateHourlySeries(todayStart, 24, 120) },
  { id: 'm2', name: 'Building 1 - Sub A', color: '#22c55e', series: generateHourlySeries(todayStart, 24, 80) },
  { id: 'm3', name: 'Building 2 - Main', color: '#3b82f6', series: generateHourlySeries(todayStart, 24, 95) },
]
