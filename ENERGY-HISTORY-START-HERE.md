# Energy History View - Implementation Start Guide

## How to Resume Work

### 1. Read These Documents First
1. **ENERGY-HISTORY-IMPLEMENTATION-PROMPT.md** - Full requirements & context
2. **ENERGY-HISTORY-CHECKLIST.md** - Day-by-day checklist & architecture
3. **This document** - Code templates & quick start

---

## Day 1 Morning: Start Here

### Step 1: Update Data Structure (1.5 hours)

Create file: `src/data/energyMetrics.ts`

```typescript
// src/data/energyMetrics.ts

export interface Metric {
  id: string
  label: string
  unit: string
  category: 'energy' | 'environmental' | 'financial' | 'operational' | 'custom'
  type: 'absolute' | 'rate' | 'cost' | 'efficiency' | 'custom'
  color: string
  enabled: boolean
  aggregationType: 'sum' | 'average' | 'max' | 'min'
}

export interface TimeSeries {
  timestamp: string // ISO 8601
  value: number
  metricId: string
}

export interface TimeSeriesData {
  date: string // YYYY-MM-DD
  metric: Metric
  hourlyData: TimeSeries[]
  summary: {
    total: number
    average: number
    max: number
    min: number
    peak_hour: string
  }
}

// Default metrics configuration
export const DEFAULT_METRICS: Metric[] = [
  {
    id: 'energy',
    label: 'Énergie',
    unit: 'kWh',
    category: 'energy',
    type: 'absolute',
    color: '#10b981', // green
    enabled: true,
    aggregationType: 'sum'
  },
  {
    id: 'co2',
    label: 'CO2',
    unit: 'kg',
    category: 'environmental',
    type: 'absolute',
    color: '#ef4444', // red
    enabled: false,
    aggregationType: 'sum'
  },
  {
    id: 'cost',
    label: 'Coût',
    unit: 'EUR',
    category: 'financial',
    type: 'cost',
    color: '#f59e0b', // amber
    enabled: false,
    aggregationType: 'sum'
  },
  {
    id: 'solar',
    label: 'Photovoltaïque',
    unit: 'kWh',
    category: 'energy',
    type: 'absolute',
    color: '#fbbf24', // yellow
    enabled: false,
    aggregationType: 'sum'
  },
  {
    id: 'consumption_rate',
    label: 'Consommation',
    unit: 'kWh/h',
    category: 'operational',
    type: 'rate',
    color: '#3b82f6', // blue
    enabled: false,
    aggregationType: 'average'
  },
  {
    id: 'efficiency',
    label: 'Efficacité',
    unit: '%',
    category: 'operational',
    type: 'efficiency',
    color: '#8b5cf6', // purple
    enabled: false,
    aggregationType: 'average'
  },
  {
    id: 'savings',
    label: 'Économies',
    unit: 'EUR',
    category: 'financial',
    type: 'cost',
    color: '#06b6d4', // cyan
    enabled: false,
    aggregationType: 'sum'
  }
]

// Color mapping for quick access
export const METRIC_COLORS: Record<string, string> = {
  energy: '#10b981',
  co2: '#ef4444',
  cost: '#f59e0b',
  solar: '#fbbf24',
  consumption_rate: '#3b82f6',
  efficiency: '#8b5cf6',
  savings: '#06b6d4'
}
```

### Step 2: Update Mock Data (1.5 hours)

Update file: `src/data/energyHistoricalMock.ts`

```typescript
// src/data/energyHistoricalMock.ts

import { TimeSeriesData, Metric, TimeSeries, DEFAULT_METRICS } from './energyMetrics'

export type { TimeSeriesData, Metric }

// Generate hourly time series for a metric on a date
function generateMetricHourlyData(
  date: string,
  metric: Metric,
  baseValue: number
): TimeSeries[] {
  const data: TimeSeries[] = []
  const [year, month, day] = date.split('-').map(Number)

  for (let hour = 0; hour < 24; hour++) {
    const d = new Date(year, month - 1, day, hour, 0, 0)
    
    // Generate realistic variance based on metric type
    let variance = 0
    switch (metric.type) {
      case 'absolute':
        variance = Math.sin((hour / 24) * Math.PI * 2) * 50 + (Math.random() - 0.5) * 30
        break
      case 'rate':
        variance = Math.sin((hour / 24) * Math.PI * 2) * 20 + (Math.random() - 0.5) * 10
        break
      case 'cost':
        // Peak pricing 6-10am, 4-8pm
        const isPeakHour = (hour >= 6 && hour < 10) || (hour >= 16 && hour < 20)
        variance = isPeakHour ? baseValue * 0.3 : baseValue * -0.2
        break
      case 'efficiency':
        variance = (Math.random() - 0.5) * 5 // ±2.5%
        break
    }

    const value = parseFloat((baseValue + variance).toFixed(2))
    data.push({
      timestamp: d.toISOString(),
      value: Math.max(0, value),
      metricId: metric.id
    })
  }

  return data
}

// Calculate summary statistics
function calculateSummary(hourlyData: TimeSeries[]): TimeSeriesData['summary'] {
  const values = hourlyData.map(d => d.value)
  const total = values.reduce((a, b) => a + b, 0)
  const average = total / values.length
  const max = Math.max(...values)
  const min = Math.min(...values)
  
  const peakHourIdx = values.indexOf(max)
  const peakHour = String(peakHourIdx).padStart(2, '0') + ':00'

  return { total, average, max, min, peak_hour: peakHour }
}

// Generate all data for all metrics and dates
export function generateEnergyHistoricalData(): TimeSeriesData[] {
  const data: TimeSeriesData[] = []
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1

  // Generate for current month (31 days)
  for (let day = 1; day <= 31; day++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    // Generate for each metric
    for (const metric of DEFAULT_METRICS) {
      let baseValue = 100
      
      // Adjust base value based on metric type and day
      switch (metric.id) {
        case 'energy':
          baseValue = 120 + (day % 7) * 20 + (Math.random() - 0.5) * 40
          break
        case 'co2':
          baseValue = 80 + (day % 7) * 15 // Correlates with energy
          break
        case 'cost':
          baseValue = 50 + (day % 7) * 10 // Variable pricing
          break
        case 'solar':
          baseValue = 60 + (day % 7) * 15 // Weather dependent
          break
        case 'consumption_rate':
          baseValue = 5 + (day % 7) * 1
          break
        case 'efficiency':
          baseValue = 85 + (Math.random() - 0.5) * 10 // Usually 80-90%
          break
        case 'savings':
          baseValue = 30 + (day % 7) * 5
          break
      }

      const hourlyData = generateMetricHourlyData(dateStr, metric, baseValue)
      const summary = calculateSummary(hourlyData)

      data.push({
        date: dateStr,
        metric,
        hourlyData,
        summary
      })
    }
  }

  return data
}

// Cache generated data
let _cachedData: TimeSeriesData[] | null = null

export function getEnergyHistoricalData(): TimeSeriesData[] {
  if (!_cachedData) {
    _cachedData = generateEnergyHistoricalData()
  }
  return _cachedData
}

// Helper functions
export function getEnergyDataForDate(dateStr: string, metricId?: string): TimeSeriesData[] {
  const allData = getEnergyHistoricalData()
  const filtered = allData.filter(d => d.date === dateStr)
  
  if (metricId) {
    return filtered.filter(d => d.metric.id === metricId)
  }
  
  return filtered
}

export function getEnergyDataForRange(
  startDate: string,
  endDate: string,
  metricId?: string
): TimeSeriesData[] {
  const allData = getEnergyHistoricalData()
  const filtered = allData.filter(d => d.date >= startDate && d.date <= endDate)
  
  if (metricId) {
    return filtered.filter(d => d.metric.id === metricId)
  }
  
  return filtered
}

export function getAvailableDates(): string[] {
  const data = getEnergyHistoricalData()
  return [...new Set(data.map(d => d.date))].sort()
}

// Re-export for backward compatibility
export { DEFAULT_METRICS as characteristics }
```

### Step 3: Create Pinia Store (2 hours)

Create file: `src/stores/useEnergyHistoryStore.ts`

```typescript
// src/stores/useEnergyHistoryStore.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Metric, TimeSeriesData, DEFAULT_METRICS } from '@/data/energyMetrics'
import { getEnergyDataForDate, getEnergyDataForRange } from '@/data/energyHistoricalMock'

export const useEnergyHistoryStore = defineStore('energyHistory', () => {
  // State
  const selectedMetrics = ref<Metric[]>([DEFAULT_METRICS[0]]) // Start with energy
  const selectedDates = ref<string[]>([new Date().toISOString().split('T')[0]])
  const timeRange = ref({ from: 0, to: 23 })
  const chartData = ref<TimeSeriesData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const oneDayMode = ref(true)

  // Computed - get available dates with data
  const availableDates = computed(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const dates: string[] = []
    
    for (let day = 1; day <= 31; day++) {
      dates.push(`${year}-${month}-${String(day).padStart(2, '0')}`)
    }
    
    return dates
  })

  // Computed - get filtered chart data
  const filteredChartData = computed(() => {
    return chartData.value.filter(d => {
      const metricEnabled = selectedMetrics.value.some(m => m.id === d.metric.id)
      const dateSelected = selectedDates.value.includes(d.date)
      return metricEnabled && dateSelected
    })
  })

  // Computed - get data for metric cards (summary)
  const metricsSummary = computed(() => {
    return selectedMetrics.value.map(metric => {
      const data = filteredChartData.value.find(d => d.metric.id === metric.id)
      if (!data) return null

      return {
        metric,
        value: data.summary.total,
        average: data.summary.average,
        max: data.summary.max,
        min: data.summary.min,
        peakHour: data.summary.peak_hour
      }
    }).filter(Boolean)
  })

  // Computed - format for Chart.js
  const chartSeriesForVisualization = computed(() => {
    const series: any[] = []
    
    for (const date of selectedDates.value) {
      for (const metric of selectedMetrics.value) {
        const data = getEnergyDataForDate(date)
        const metricData = data.find(d => d.metric.id === metric.id)
        
        if (metricData) {
          series.push({
            label: `${date} - ${metric.label}`,
            data: metricData.hourlyData
              .filter((d, idx) => idx >= timeRange.value.from && idx <= timeRange.value.to)
              .map(d => d.value),
            borderColor: metric.color,
            backgroundColor: metric.color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
            fill: false,
            tension: 0.3
          })
        }
      }
    }
    
    return series
  })

  // Computed - format for table
  const tableData = computed(() => {
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
    const rows: any[] = []

    for (let hour = timeRange.value.from; hour <= timeRange.value.to; hour++) {
      const row: any = { hour: `${String(hour).padStart(2, '0')}:00` }

      for (const date of selectedDates.value) {
        for (const metric of selectedMetrics.value) {
          const data = getEnergyDataForDate(date)
          const metricData = data.find(d => d.metric.id === metric.id)
          
          if (metricData && metricData.hourlyData[hour]) {
            const key = `${date}_${metric.id}`
            row[key] = metricData.hourlyData[hour].value
          }
        }
      }

      rows.push(row)
    }

    return rows
  })

  // Actions
  const loadMetricsForDate = async (date: string) => {
    loading.value = true
    error.value = null
    
    try {
      // In real implementation, call API
      // For now, use mock data
      const data = getEnergyDataForRange(date, date)
      chartData.value = data
    } catch (err) {
      error.value = String(err)
    } finally {
      loading.value = false
    }
  }

  const loadMetricsForRange = async (startDate: string, endDate: string) => {
    loading.value = true
    error.value = null
    
    try {
      const data = getEnergyDataForRange(startDate, endDate)
      chartData.value = data
    } catch (err) {
      error.value = String(err)
    } finally {
      loading.value = false
    }
  }

  const selectMetrics = (metrics: Metric[]) => {
    selectedMetrics.value = metrics
  }

  const toggleMetric = (metricId: string) => {
    const idx = selectedMetrics.value.findIndex(m => m.id === metricId)
    if (idx >= 0) {
      selectedMetrics.value.splice(idx, 1)
    } else {
      const metric = DEFAULT_METRICS.find(m => m.id === metricId)
      if (metric) {
        selectedMetrics.value.push(metric)
      }
    }
  }

  const selectDates = (dates: string[]) => {
    if (oneDayMode.value && dates.length > 1) {
      selectedDates.value = [dates[0]]
    } else {
      selectedDates.value = dates
    }
  }

  const setTimeRange = (from: number, to: number) => {
    timeRange.value = { from, to }
  }

  const resetFilters = () => {
    selectedMetrics.value = [DEFAULT_METRICS[0]]
    selectedDates.value = [new Date().toISOString().split('T')[0]]
    timeRange.value = { from: 0, to: 23 }
  }

  const exportAsCSV = (): Blob => {
    // Implementation in next section
    const rows = tableData.value
    let csv = 'Hour'
    
    for (const date of selectedDates.value) {
      for (const metric of selectedMetrics.value) {
        csv += `,${date} (${metric.label})`
      }
    }
    
    csv += '\n'
    
    for (const row of rows) {
      csv += row.hour
      for (const date of selectedDates.value) {
        for (const metric of selectedMetrics.value) {
          const key = `${date}_${metric.id}`
          csv += `,${row[key] || ''}`
        }
      }
      csv += '\n'
    }
    
    return new Blob([csv], { type: 'text/csv' })
  }

  return {
    // State
    selectedMetrics,
    selectedDates,
    timeRange,
    chartData,
    loading,
    error,
    oneDayMode,
    
    // Computed
    availableDates,
    filteredChartData,
    metricsSummary,
    chartSeriesForVisualization,
    tableData,
    
    // Actions
    loadMetricsForDate,
    loadMetricsForRange,
    selectMetrics,
    toggleMetric,
    selectDates,
    setTimeRange,
    resetFilters,
    exportAsCSV
  }
})
```

---

## Day 1 Afternoon: Component Extraction

### Step 4: Extract Calendar Component (1 hour)

Create file: `src/components/energy/EnergyCalendar.vue`

```vue
<template>
  <div class="calendar-selector">
    <div class="calendar-selector__header">
      <button @click="prevMonth" class="calendar-selector__nav-btn" title="Previous month">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="calendar-selector__month-label">{{ monthLabel }}</div>
      <button @click="nextMonth" class="calendar-selector__nav-btn" title="Next month">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>

    <!-- Preset Comparison Buttons -->
    <div class="calendar-selector__presets">
      <button @click="compareSameDayLastWeek" class="calendar-selector__preset-btn">
        Same Day (-7d)
      </button>
      <button @click="compareSameDayLastMonth" class="calendar-selector__preset-btn">
        Same Day (-30d)
      </button>
      <button @click="compareWeekOverWeek" class="calendar-selector__preset-btn">
        Week vs Week
      </button>
    </div>

    <div class="calendar-selector__weekdays">
      <div v-for="day in weekDays" :key="day" class="calendar-selector__weekday">{{ day }}</div>
    </div>

    <div class="calendar-selector__grid">
      <div v-for="(day, idx) in calendarDays" :key="idx">
        <button
          v-if="day"
          @click="toggleDate(day.dateStr)"
          @mousedown="startDrag(day.dateStr)"
          @mouseenter="onDragOver(day.dateStr)"
          @mouseup="endDrag"
          :class="[
            'calendar-selector__day',
            { 'calendar-selector__day--selected': isSelected(day.dateStr) },
            { 'calendar-selector__day--today': isToday(day.dateStr) },
            { 'calendar-selector__day--other-month': !day.inMonth },
            { 'calendar-selector__day--disabled': !day.inMonth }
          ]"
          :title="`${day.dateStr}: ${hasData(day.dateStr) ? 'Has data' : 'No data'}`"
        >
          <span class="calendar-selector__day-number">{{ day.day }}</span>
          <span v-if="hasData(day.dateStr)" class="calendar-selector__day-indicator">●</span>
        </button>
        <div v-else class="calendar-selector__day calendar-selector__day--disabled"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  'update:dates': [dates: string[]]
}>()

const props = defineProps<{
  modelValue: string[]
  availableDates: string[]
}>()

const currentMonth = ref(new Date())
const selectedDates = ref(props.modelValue)
const isDragging = ref(false)
const dragStart = ref<string | null>(null)

const monthLabel = computed(() => {
  return currentMonth.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
})

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() || 7
  
  const days: any[] = []
  
  // Previous month's days
  for (let i = startingDayOfWeek - 1; i > 0; i--) {
    const date = new Date(year, month, -i + 1)
    days.push({
      day: date.getDate(),
      dateStr: formatDate(date),
      inMonth: false
    })
  }
  
  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    days.push({
      day,
      dateStr: formatDate(date),
      inMonth: true
    })
  }
  
  // Next month's days
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      day,
      dateStr: formatDate(date),
      inMonth: false
    })
  }
  
  return days
})

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date())
}

function isSelected(dateStr: string): boolean {
  return selectedDates.value.includes(dateStr)
}

function hasData(dateStr: string): boolean {
  return props.availableDates.includes(dateStr)
}

function toggleDate(dateStr: string) {
  const idx = selectedDates.value.indexOf(dateStr)
  if (idx >= 0) {
    selectedDates.value.splice(idx, 1)
  } else {
    selectedDates.value.push(dateStr)
  }
  emitUpdate()
}

function startDrag(dateStr: string) {
  isDragging.value = true
  dragStart.value = dateStr
  selectedDates.value = [dateStr]
}

function onDragOver(dateStr: string) {
  if (!isDragging.value || !dragStart.value) return
  
  const [y1, m1, d1] = dragStart.value.split('-').map(Number)
  const [y2, m2, d2] = dateStr.split('-').map(Number)
  
  const start = new Date(y1, m1 - 1, d1)
  const end = new Date(y2, m2 - 1, d2)
  
  if (start > end) {
    [start, end] = [end, start]
  }
  
  const range: string[] = []
  const current = new Date(start)
  while (current <= end) {
    range.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }
  
  selectedDates.value = range
}

function endDrag() {
  isDragging.value = false
  dragStart.value = null
  emitUpdate()
}

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1)
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1)
}

function compareSameDayLastWeek() {
  if (selectedDates.value.length === 0) return
  const [y, m, d] = selectedDates.value[0].split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() - 7)
  selectedDates.value = [selectedDates.value[0], formatDate(date)].sort()
  emitUpdate()
}

function compareSameDayLastMonth() {
  if (selectedDates.value.length === 0) return
  const [y, m, d] = selectedDates.value[0].split('-').map(Number)
  const date = new Date(y, m - 1 - 1, d)
  selectedDates.value = [selectedDates.value[0], formatDate(date)].sort()
  emitUpdate()
}

function compareWeekOverWeek() {
  if (selectedDates.value.length === 0) return
  const start = new Date(selectedDates.value[0].split('-').map(Number).slice(0, 3).join('-'))
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  
  selectedDates.value = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    selectedDates.value.push(formatDate(date))
  }
  emitUpdate()
}

function emitUpdate() {
  emit('update:dates', selectedDates.value)
}
</script>
```

### Step 5: Extract Characteristics Component (45 min)

Create file: `src/components/energy/EnergyCharacteristics.vue`

```vue
<template>
  <div class="characteristics-filter">
    <h3 class="characteristics-filter__title">Caractéristiques</h3>
    
    <input 
      type="text" 
      placeholder="Rechercher..."
      v-model="searchText"
      class="characteristics-filter__search"
    />
    
    <div class="characteristics-filter__list">
      <div v-for="category in categories" :key="category" class="characteristics-filter__category">
        <h4 class="characteristics-filter__category-title">{{ getCategoryLabel(category) }}</h4>
        
        <label 
          v-for="metric in getMetricsForCategory(category)"
          :key="metric.id"
          class="characteristics-filter__item"
          :class="{ 'characteristics-filter__item--active': isEnabled(metric.id) }"
        >
          <input
            type="checkbox"
            :checked="isEnabled(metric.id)"
            @change="toggle(metric.id)"
            class="characteristics-filter__checkbox"
          />
          <span class="characteristics-filter__label">
            {{ metric.label }}
            <span class="characteristics-filter__unit">({{ metric.unit }})</span>
          </span>
        </label>
      </div>
    </div>
    
    <div class="characteristics-filter__summary">
      {{ selectedCount }} / {{ totalCount }} selected
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Metric, DEFAULT_METRICS } from '@/data/energyMetrics'

const emit = defineEmits<{
  'update:metrics': [metrics: Metric[]]
}>()

const props = defineProps<{
  modelValue: Metric[]
}>()

const searchText = ref('')

const categories = ['energy', 'environmental', 'financial', 'operational']

const filteredMetrics = computed(() => {
  return DEFAULT_METRICS.filter(m => 
    m.label.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const selectedCount = computed(() => props.modelValue.length)
const totalCount = computed(() => DEFAULT_METRICS.length)

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    energy: 'Énergie',
    environmental: 'Environnemental',
    financial: 'Financier',
    operational: 'Opérationnel'
  }
  return labels[category] || category
}

function getMetricsForCategory(category: string): Metric[] {
  return filteredMetrics.value.filter(m => m.category === category)
}

function isEnabled(metricId: string): boolean {
  return props.modelValue.some(m => m.id === metricId)
}

function toggle(metricId: string) {
  const metric = DEFAULT_METRICS.find(m => m.id === metricId)
  if (!metric) return

  if (isEnabled(metricId)) {
    emit('update:metrics', props.modelValue.filter(m => m.id !== metricId))
  } else {
    emit('update:metrics', [...props.modelValue, metric])
  }
}
</script>
```

---

## CSS Updates Needed

Add to `src/assets/energy-dashboard.css`:

```css
/* Presets */
.calendar-selector__presets {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.calendar-selector__preset-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: white;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.calendar-selector__preset-btn:hover {
  background: #f3f4f6;
}

/* Calendar Day Indicator */
.calendar-selector__day-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  font-size: 0.5rem;
  color: #10b981;
}

/* Search Box */
.characteristics-filter__search {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.characteristics-filter__search:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Category Grouping */
.characteristics-filter__category {
  margin-bottom: 1rem;
}

.characteristics-filter__category-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

/* Metric Unit */
.characteristics-filter__unit {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 400;
  margin-left: 0.25rem;
}

/* Summary */
.characteristics-filter__summary {
  padding-top: 0.75rem;
  margin-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}
```

---

## Next Steps (After Day 1)

1. **Day 2**: Create MetricCards component + enhance Chart
2. **Day 3**: Create DataTable component + implement export
3. **Day 4**: Polish, testing, optimization
4. **Day 5**: Documentation, final deployment

---

**Status**: Ready to start implementation  
**Time Estimate**: 7-8 hours Day 1  
**Next Check-in**: After completing step 5  
