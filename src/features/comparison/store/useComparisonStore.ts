import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore'
import { useMetersStore } from '@/stores/useMetersStore'
import i18n from '@/i18n'
import type { MetricType } from '@/types/metrics'

export type ComparisonMode = 'byMeters' | 'matrix'
export type AggregationLevel = 'hourly' | 'daily' | 'weekly' | 'monthly'
export type ChartTypeComparison = 'bar' | 'line' | 'heatmap' | 'table'

export interface ViewOptions {
  showRanking: boolean
  showVariance: boolean
  highlightOutliers: boolean
  showTrendArrows: boolean
  showAverageLine: boolean
}

/**
 * Comparison Store - Multi-Meter & Multi-Period Analysis
 *
 * Manages:
 * - Comparison modes (by meters, by periods, matrix)
 * - Multi-meter selection (via centralized useMetersStore)
 * - Multi-period selection
 * - Aggregation levels
 * - Chart types and view options
 * - Comparative data calculations
 */
export const useComparisonStore = defineStore('comparison', () => {
  const dashboardStore = useDashboardStore()

  // ✅ USE CENTRALIZED METER STORE
  const metersStore = useMetersStore()
  const { selectedMeterIds: centralizedSelectedMeterIds } = storeToRefs(metersStore)

  // ===========================
  // State
  // ===========================

  // Comparison mode
  const comparisonMode = ref<ComparisonMode>('byMeters')

  // Selected periods (date strings or period identifiers)
  const selectedPeriods = ref<string[]>([])

  // Selected metric for comparison
  const selectedMetric = ref<MetricType>('consumption')

  // Aggregation level
  const aggregationLevel = ref<AggregationLevel>('daily')

  // Chart type
  const chartType = ref<ChartTypeComparison>('bar')

  // View options
  const viewOptions = ref<ViewOptions>({
    showRanking: true,
    showVariance: true,
    highlightOutliers: true,
    showTrendArrows: true,
    showAverageLine: true
  })

  // Custom date range
  const dateRangeStart = ref<Date | null>(null)
  const dateRangeEnd = ref<Date | null>(null)

  // Calendar state
  const currentMonth = ref(new Date())
  const selectedDates = ref<string[]>([])

  // ===========================
  // Computed - Available Data
  // ===========================

  const availableMeters = computed(() => {
    // Use all compteur data as available meters to match centralized selection
    return dashboardStore.compteurs
  })

  /**
   * ✅ PROXY TO CENTRALIZED METER STORE
   * Exports selectedMeterIds for backwards compatibility
   */
  const selectedMeterIds = computed(() => centralizedSelectedMeterIds.value)

  const selectedMeters = computed(() => {
    // ✅ USE CENTRALIZED METER STORE IDs
    if (centralizedSelectedMeterIds.value.length === 0) {
      return availableMeters.value
    }
    return availableMeters.value.filter(m => centralizedSelectedMeterIds.value.includes(m.id))
  })

  const calendarDays = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

    const days = []
    for (let i = 0; i < adjustedStart; i++) {
      days.push({ dateObj: null, isCurrentMonth: false, isSelected: false, isToday: false, hasData: false, date: null })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day)
      const dateStr = dateObj.toISOString().split('T')[0]
      const isToday = dateObj.getTime() === today.getTime()
      const isSelected = selectedDates.value.includes(dateStr)
      const hasData = hasDataForDate(dateStr)

      days.push({
        dateObj,
        isCurrentMonth: true,
        isSelected,
        isToday,
        hasData,
        date: dateStr
      })
    }

    return days
  })

  // ===========================
  // Computed - Comparison Data
  // ===========================

  const comparisonData = computed(() => {
    const data: any[] = []

    // Build base date list from selections (dates preferred)
    let dateList: string[] = selectedDates.value.length > 0
      ? [...selectedDates.value]
      : [...selectedPeriods.value]

    // Default to last 7 days if nothing selected
    if (dateList.length === 0) {
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        dateList.push(d.toISOString().split('T')[0])
      }
    }

    // Group periods according to aggregationLevel
    const localeCode = i18n.global.locale.value === 'en' ? 'en-US' : 'fr-FR'
    const groups: Record<string, string[]> = {}

    if (aggregationLevel.value === 'daily') {
      dateList.forEach(d => { groups[d] = [d] })
    } else if (aggregationLevel.value === 'weekly') {
      dateList.forEach(d => {
        const lbl = getWeekLabel(d, localeCode)
        if (!groups[lbl]) groups[lbl] = []
        groups[lbl].push(d)
      })
    } else if (aggregationLevel.value === 'monthly') {
      dateList.forEach(d => {
        const lbl = getMonthLabel(d, localeCode)
        if (!groups[lbl]) groups[lbl] = []
        groups[lbl].push(d)
      })
    } else {
      // hourly: take most recent date and generate 24 hours
      const baseDate = dateList[dateList.length - 1]
      for (let h = 0; h < 24; h++) {
        const hh = String(h).padStart(2, '0')
        const lbl = `${baseDate} ${hh}:00`
        // Use a seed token combining date + hour
        const token = `${baseDate}T${hh}`
        groups[lbl] = [token]
      }
    }

    const labels = Object.keys(groups)

    // Helper to aggregate values for a meter over a group of date tokens
    const aggregateValue = (meterId: string, tokens: string[]) => {
      // Sum of mocked values; if hourly, tokens already encode hour
      const total = tokens.reduce((sum, t) => sum + generateMockValue(meterId, t), 0)
      return total
    }

    if (comparisonMode.value === 'byMeters') {
      // Compare meters using the first group label
      const firstLabel = labels[0]
      const tokens = groups[firstLabel]
      selectedMeters.value.forEach(meter => {
        const value = aggregateValue(meter.id, tokens)
        data.push({
          id: meter.id,
          label: meter.name,
          value,
          color: metersStore.getMeterColor(meter.id)
        })
      })
    } else {
      // Matrix: meters × aggregated period groups
      selectedMeters.value.forEach(meter => {
        labels.forEach(lbl => {
          const tokens = groups[lbl]
          const value = aggregateValue(meter.id, tokens)
          data.push({
            meterId: meter.id,
            meterLabel: meter.name,
            periodId: lbl,
            periodLabel: lbl,
            value,
            color: metersStore.getMeterColor(meter.id)
          })
        })
      })
    }

    return data
  })

  // Aggregation labels for the current selection (used by the view)
  const aggregatedLabels = computed(() => {
    let dateList: string[] = selectedDates.value.length > 0 ? [...selectedDates.value] : [...selectedPeriods.value]
    if (dateList.length === 0) {
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        dateList.push(d.toISOString().split('T')[0])
      }
    }
    const localeCode = i18n.global.locale.value === 'en' ? 'en-US' : 'fr-FR'
    const labels: string[] = []
    if (aggregationLevel.value === 'daily') {
      return dateList
    } else if (aggregationLevel.value === 'weekly') {
      const set = new Set<string>()
      dateList.forEach(d => set.add(getWeekLabel(d, localeCode)))
      return Array.from(set)
    } else if (aggregationLevel.value === 'monthly') {
      const set = new Set<string>()
      dateList.forEach(d => set.add(getMonthLabel(d, localeCode)))
      return Array.from(set)
    } else {
      const baseDate = dateList[dateList.length - 1]
      for (let h = 0; h < 24; h++) {
        const hh = String(h).padStart(2, '0')
        labels.push(`${baseDate} ${hh}:00`)
      }
      return labels
    }
  })

  const activePeriodLabel = computed(() => aggregatedLabels.value[0] || '')

  // Helpers for aggregation labels
  function getMonthLabel(dateStr: string, localeCode: string): string {
    const d = new Date(dateStr)
    const s = d.toLocaleDateString(localeCode, { month: 'long', year: 'numeric' })
    return s
  }

  function getWeekLabel(dateStr: string, localeCode: string): string {
    const d = new Date(dateStr)
    // ISO week calculation: Thursday-based week
    const target = new Date(d.valueOf())
    const dayNr = (d.getDay() + 6) % 7
    target.setDate(target.getDate() - dayNr + 3)
    const firstThursday = new Date(target.getFullYear(), 0, 4)
    const diff = target.valueOf() - firstThursday.valueOf()
    const week = 1 + Math.round(diff / (7 * 24 * 3600 * 1000))
    const year = target.getFullYear()
    const isFrench = localeCode.startsWith('fr')
    return isFrench ? `Semaine ${week} ${year}` : `Week ${week} ${year}`
  }

  const kpiCards = computed(() => {
    if (comparisonData.value.length === 0) return []

    const values = comparisonData.value.map(d => d.value).filter(v => v !== undefined)
    const total = values.reduce((sum, v) => sum + v, 0)
    const average = total / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    const variance = values.length > 1
      ? ((max - min) / average * 100).toFixed(1)
      : '0.0'

    const maxItem = comparisonData.value.find(d => d.value === max)
    const minItem = comparisonData.value.find(d => d.value === min)

    return [
      {
        label: i18n.global.t('comparison.kpi.highest'),
        value: max.toFixed(2),
        subtitle: maxItem?.label || '',
        color: '#10b981',
        icon: 'trending_up'
      },
      {
        label: i18n.global.t('comparison.kpi.lowest'),
        value: min.toFixed(2),
        subtitle: minItem?.label || '',
        color: '#6b7280',
        icon: 'trending_down'
      },
      {
        label: i18n.global.t('comparison.kpi.average'),
        value: average.toFixed(2),
        subtitle: i18n.global.t('comparison.kpi.allMeters'),
        color: '#3b82f6',
        icon: 'analytics'
      },
      {
        label: i18n.global.t('comparison.kpi.total'),
        value: total.toFixed(2),
        subtitle: `${values.length} ${i18n.global.t('comparison.kpi.items')}`,
        color: '#8b5cf6',
        icon: 'summarize'
      },
      {
        label: i18n.global.t('comparison.kpi.variance'),
        value: `±${variance}%`,
        subtitle: i18n.global.t('comparison.kpi.fromAverage'),
        color: '#f59e0b',
        icon: 'percent'
      }
    ]
  })

  const comparisonTable = computed(() => {
    const rows = comparisonData.value.map((item, index) => {
      const avg = kpiCards.value.find(k => k.label === i18n.global.t('comparison.kpi.average'))?.value || 0
      const avgNum = parseFloat(avg.toString())
      const variance = avgNum !== 0 ? ((item.value - avgNum) / avgNum * 100).toFixed(1) : '0.0'

      return {
        rank: index + 1,
        label: comparisonMode.value === 'byMeters' ? (item.label || item.meterLabel) : (item.periodLabel || item.label || item.meterLabel),
        value: item.value.toFixed(2),
        variance: parseFloat(variance),
        varianceText: `${parseFloat(variance) > 0 ? '+' : ''}${variance}%`,
        trend: parseFloat(variance) > 5 ? 'up' : parseFloat(variance) < -5 ? 'down' : 'stable',
        color: item.color
      }
    })

    // Sort by value descending
    rows.sort((a, b) => parseFloat(b.value) - parseFloat(a.value))

    // Update ranks
    rows.forEach((row, index) => {
      row.rank = index + 1
    })

    return rows
  })

  // ===========================
  // Actions - Selection
  // ===========================

  /**
   * ✅ TOGGLE METER USING CENTRALIZED STORE
   */
  function toggleMeter(meterId: string) {
    metersStore.toggleMeter(meterId)
  }

  /**
   * ✅ SELECT ALL METERS USING CENTRALIZED STORE
   */
  function selectAllMeters() {
    metersStore.selectAllMeters()
  }

  /**
   * ✅ DESELECT ALL METERS USING CENTRALIZED STORE
   */
  function deselectAllMeters() {
    metersStore.clearSelection()
  }

  function setComparisonMode(mode: ComparisonMode) {
    comparisonMode.value = mode

    // Initialize data for the new mode if needed
    if (centralizedSelectedMeterIds.value.length === 0) {
      selectAllMeters()
    }

    // For matrix mode, ensure we have periods selected
    if (mode === 'matrix' && selectedDates.value.length === 0 && selectedPeriods.value.length === 0) {
      selectPeriodPreset('last7Days')
    }
  }

  function setChartType(type: ChartTypeComparison) {
    chartType.value = type
  }

  function setAggregationLevel(level: AggregationLevel) {
    aggregationLevel.value = level
  }

  function toggleViewOption(option: keyof ViewOptions) {
    viewOptions.value[option] = !viewOptions.value[option]
  }

  function selectPeriodPreset(preset: string) {
    const today = new Date()
    const dates: string[] = []

    switch (preset) {
      case 'last7Days':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          dates.push(date.toISOString().split('T')[0])
        }
        break
      case 'last4Weeks':
        for (let i = 3; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - (i * 7))
          dates.push(date.toISOString().split('T')[0])
        }
        break
      case 'last3Months':
        for (let i = 2; i >= 0; i--) {
          const date = new Date(today)
          date.setMonth(date.getMonth() - i)
          dates.push(date.toISOString().split('T')[0])
        }
        break
      default:
        dates.push(today.toISOString().split('T')[0])
    }

    selectedDates.value = dates
    selectedPeriods.value = dates
  }

  function toggleDate(dateStr: string) {
    const index = selectedDates.value.indexOf(dateStr)
    if (index === -1) {
      // Allow selecting any number of days
      selectedDates.value.push(dateStr)
      selectedPeriods.value.push(dateStr)
    } else {
      selectedDates.value.splice(index, 1)
      const periodIndex = selectedPeriods.value.indexOf(dateStr)
      if (periodIndex !== -1) {
        selectedPeriods.value.splice(periodIndex, 1)
      }
    }
  }

  function clearDates() {
    selectedDates.value = []
    selectedPeriods.value = []
  }

  function prevMonth() {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
  }

  function nextMonth() {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
  }

  function goToToday() {
    currentMonth.value = new Date()
  }

  function resetFilters() {
    metersStore.clearSelection()
    selectedPeriods.value = []
    comparisonMode.value = 'byMeters'
    aggregationLevel.value = 'daily'
    chartType.value = 'bar'
    viewOptions.value = {
      showRanking: true,
      showVariance: true,
      highlightOutliers: true,
      showTrendArrows: true,
      showAverageLine: true
    }
  }

  function exportToCSV() {
    const rows = comparisonTable.value
    const headers = ['Rank', 'Label', 'Value', 'Variance %', 'Trend']
    const csvContent = [
      headers.join(','),
      ...rows.map(r => [r.rank, r.label, r.value, r.variance, r.trend].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `comparison-${new Date().toISOString()}.csv`
    link.click()
  }

  // ===========================
  // Helpers
  // ===========================

  function getMeterColor(meterName: string): string {
    const colors: Record<string, string> = {
      'TGBT': '#ef4444',
      'Compresseurs': '#10b981',
      'Clim': '#3b82f6',
      'Éclairage': '#eab308'
    }
    return colors[meterName] || '#6b7280'
  }

  function generateMockValue(meterId: string, period: string): number {
    // Deterministic mock data generation with realistic patterns
    const hash = (meterId + period).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)

    // Base values per meter type (more realistic consumption patterns)
    const baseValues: Record<string, number> = {
      'TGBT': 1500,        // Main electrical panel - highest consumption
      'Compresseurs': 1200, // Compressors - high but variable
      'Clim': 800,         // HVAC - moderate
      'Éclairage': 300     // Lighting - lowest
    }

    // Find meter name from ID
    const meter = availableMeters.value.find(m => m.id === meterId)
    const meterName = meter?.name || 'TGBT'
    const baseValue = baseValues[meterName] || 1000

    // Add controlled variation (±20%)
    const variation = (Math.abs(hash) % 40) - 20 // -20 to +20
    const variationFactor = 1 + (variation / 100)

    return baseValue * variationFactor
  }

  function hasDataForDate(dateStr: string): boolean {
    // Mock: has data for last 90 days
    const date = new Date(dateStr)
    const today = new Date()
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff >= 0 && daysDiff <= 90
  }

  // Initialize with defaults
  selectPeriodPreset('last7Days')

  return {
    // State
    comparisonMode,
    selectedMeterIds,
    selectedPeriods,
    selectedDates,
    selectedMetric,
    aggregationLevel,
    chartType,
    viewOptions,
    dateRangeStart,
    dateRangeEnd,
    currentMonth,

    // Computed
    availableMeters,
    selectedMeters,
    comparisonData,
    aggregatedLabels,
    activePeriodLabel,
    kpiCards,
    comparisonTable,
    calendarDays,

    // Actions
    toggleMeter,
    selectAllMeters,
    deselectAllMeters,
    setComparisonMode,
    setChartType,
    setAggregationLevel,
    toggleViewOption,
    selectPeriodPreset,
    toggleDate,
    clearDates,
    prevMonth,
    nextMonth,
    goToToday,
    resetFilters,
    exportToCSV,
    getMeterColor
  }
})
