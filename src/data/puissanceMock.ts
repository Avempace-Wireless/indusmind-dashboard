export interface HourPoint { timestamp: string; value: number }
export interface DayPoint { date: string; value: number }

function isoHour(base: Date, hour: number){
  const d = new Date(base)
  d.setHours(hour,0,0,0)
  return d.toISOString()
}

function rand(base=100, variance=20){
  return parseFloat((base + (Math.random()-0.5)*variance).toFixed(2))
}

const now = new Date()
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0,0,0)

function genHourly(base:number){
  const arr: HourPoint[] = []
  for(let h=0; h<24; h++) arr.push({ timestamp: isoHour(startOfToday,h), value: rand(base,30) })
  return arr
}

function genDaily(base:number){
  const days = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()
  const arr: DayPoint[] = []
  for(let d=1; d<=days; d++){
    const date = new Date(now.getFullYear(), now.getMonth(), d)
    arr.push({ date: date.toISOString().substring(0,10), value: parseFloat((base + (Math.random()-0.5)*40).toFixed(2)) })
  }
  return arr
}

function genMonthly(base:number){
  const arr: DayPoint[] = []
  for(let m=0; m<12; m++){
    const date = new Date(now.getFullYear(), m, 1)
    arr.push({ date: date.toISOString().substring(0,7), value: parseFloat((base + (Math.random()-0.5)*80).toFixed(2)) })
  }
  return arr
}

export const puissanceMeters = {
  tgbt: {
    id: 'tgbt',
    name: 'TGBT',
    color: '#E53935',
    kpis: {
      avgLastMonth: 210.5,
      avgThisMonth: 198.3,
      avgYesterday: 205.2,
      avgToday: 190.1,
      avgDayBeforeYesterday: 187.6,
      instantThisHour: 195.4,
    },
    monthlyPower: genMonthly(200),
    dailyPower: genDaily(200),
    hourlyPower: genHourly(200),
  },
  compresseur: {
    id: 'compresseur',
    name: 'Compresseur',
    color: '#43A047',
    kpis: {
      avgLastMonth: 120.5,
      avgThisMonth: 118.3,
      avgYesterday: 125.2,
      avgToday: 110.1,
      avgDayBeforeYesterday: 113.6,
      instantThisHour: 119.4,
    },
    monthlyPower: genMonthly(120),
    dailyPower: genDaily(120),
    hourlyPower: genHourly(120),
  },
  climatisation: {
    id: 'climatisation',
    name: 'Climatisation',
    color: '#3B82F6',
    kpis: {
      avgLastMonth: 65.0,
      avgThisMonth: 70.2,
      avgYesterday: 72.1,
      avgToday: 68.4,
      avgDayBeforeYesterday: 69.0,
      instantThisHour: 71.3,
    },
    monthlyPower: genMonthly(70),
    dailyPower: genDaily(70),
    hourlyPower: genHourly(70),
  },
  eclairage: {
    id: 'eclairage',
    name: 'Éclairage',
    color: '#F59E0B',
    kpis: {
      avgLastMonth: 25.0,
      avgThisMonth: 22.2,
      avgYesterday: 24.1,
      avgToday: 20.4,
      avgDayBeforeYesterday: 21.0,
      instantThisHour: 23.3,
    },
    monthlyPower: genMonthly(22),
    dailyPower: genDaily(22),
    hourlyPower: genHourly(22),
  }
}

export const meterList = ['tgbt','compresseur','climatisation','eclairage']
