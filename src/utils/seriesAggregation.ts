export interface SeriesPoint { timestamp: string; value: number }

function toKey(date: Date, duration: 'hour'|'day'|'month'){
  const y = date.getFullYear()
  const m = String(date.getMonth()+1).padStart(2,'0')
  const d = String(date.getDate()).padStart(2,'0')
  const hh = String(date.getHours()).padStart(2,'0')
  if(duration==='hour') return `${y}-${m}-${d}T${hh}:00:00.000Z`
  if(duration==='day') return `${y}-${m}-${d}T00:00:00.000Z`
  return `${y}-${m}-01T00:00:00.000Z`
}

export function aggregateSeries(series: SeriesPoint[], duration: 'hour'|'day'|'month'){
  const map = new Map<string, number>()
  for (const p of series){
    const d = new Date(p.timestamp)
    if (isNaN(d.getTime())) continue
    let keyDate: Date
    if (duration==='hour') keyDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), 0,0,0))
    else if (duration==='day') keyDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0,0,0))
    else keyDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0,0,0))

    const key = toKey(keyDate, duration)
    map.set(key, (map.get(key) || 0) + p.value)
  }

  const out: SeriesPoint[] = Array.from(map.entries())
    .map(([k,v]) => ({ timestamp: k, value: parseFloat(v.toFixed(2)) }))
    .sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return out
}

export function unifiedTimestampsForMeters(meters: { series: SeriesPoint[] }[], duration: 'hour'|'day'|'month'){
  const set = new Set<string>()
  for(const m of meters){
    const agg = aggregateSeries(m.series, duration)
    agg.forEach(p => set.add(p.timestamp))
  }
  return Array.from(set).sort((a,b)=>new Date(a).getTime() - new Date(b).getTime())
}
