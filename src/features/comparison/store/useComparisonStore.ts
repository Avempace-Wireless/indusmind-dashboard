import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore'
import { useMetersStore } from '@/stores/useMetersStore'
import { TimeUtils } from '@/utils/TimeUtils'
import i18n from '@/i18n'
import type { MetricType } from '@/types/metrics'
import {
  fetchComparisonAll,
  buildComparisonRequest,
  type ComparisonDataResponse,
  type ComparisonKPIsResponse,
  type ComparisonSummaryResponse,
  type MeterTimeSeriesData,
} from '@/services/comparisonAPI'

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
  const comparisonMode = ref<ComparisonMode>('matrix')

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
  // API State (REAL DATA)
  // ===========================

  /** Loading state for API calls */
  const isLoading = ref(false)

  /** Error message from last API call */
  const apiError = ref<string | null>(null)

  /** Raw API response: time series data per meter */
  const apiTimeSeriesData = ref<MeterTimeSeriesData[]>([])

  /** Raw API response: KPI summary */
  const apiKPIsData = ref<ComparisonKPIsResponse['data'] | null>(null)

  /** Raw API response: per-meter summary with trends */
  const apiSummaryData = ref<ComparisonSummaryResponse['data'] | null>(null)

  /** API metadata (execution time, etc.) */
  const apiMeta = ref<ComparisonDataResponse['meta'] | null>(null)

  /** Whether we've fetched data at least once */
  const hasLoadedOnce = ref(false)

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
      const dateStr = toLocalDateStr(dateObj.getTime())
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
  // Computed - Comparison Data (REAL API DATA)
  // ===========================

  /**
   * Transform API time series data into the format expected by the view.
   *
   * byMeters mode: one data item per meter (total consumption)
   * matrix mode: one data item per meter × period combination
   */
  /**
   * Build a deviceUUID → Compteur lookup from all available sources.
   * Tries dashboardStore.compteurs first, then metersStore.allMeters.
   */
  function findMeterByUUID(deviceUUID: string) {
    // Primary: dashboardStore.compteurs
    let meter = availableMeters.value.find(m => m.deviceUUID === deviceUUID)
    if (meter) return meter

    // Fallback: metersStore.allMeters (may have been hydrated differently)
    const storeMeter = metersStore.allMeters.find(m => m.deviceUUID === deviceUUID)
    if (storeMeter) {
      return {
        id: storeMeter.id,
        name: storeMeter.name,
        deviceUUID: storeMeter.deviceUUID,
      }
    }

    return null
  }

  const comparisonData = computed(() => {
    const data: any[] = []

    // If no API data yet, return empty
    if (apiTimeSeriesData.value.length === 0) return data

    const localeCode = i18n.global.locale.value === 'en' ? 'en-US' : 'fr-FR'

    // Log UUID→Compteur matching for diagnostics
    const unmatchedUUIDs: string[] = []

    if (comparisonMode.value === 'byMeters') {
      // One entry per meter with total consumption
      apiTimeSeriesData.value.forEach(meterData => {
        const meter = findMeterByUUID(meterData.meterId)
        if (!meter) unmatchedUUIDs.push(meterData.meterId)
        const meterId = meter?.id || meterData.meterId
        data.push({
          id: meterId,
          meterId,
          deviceUUID: meterData.meterId,
          label: meter?.name || meterData.meterId.substring(0, 8),
          value: meterData.totalConsumption,
          color: metersStore.getMeterColor(meterId)
        })
      })
    } else {
      // Matrix mode: meters × aggregated periods
      // Group time series values by aggregation level
      apiTimeSeriesData.value.forEach(meterData => {
        const meter = findMeterByUUID(meterData.meterId)
        if (!meter) unmatchedUUIDs.push(meterData.meterId)

        // Group values by the current aggregation level
        const groups = groupByAggregationLevel(meterData.values, aggregationLevel.value, localeCode)

        for (const [label, totalValue] of Object.entries(groups)) {
          data.push({
            meterId: meter?.id || meterData.meterId,
            deviceUUID: meterData.meterId,
            meterLabel: meter?.name || meterData.meterId.substring(0, 8),
            periodId: label,
            periodLabel: label,
            value: totalValue,
            color: metersStore.getMeterColor(meter?.id || meterData.meterId)
          })
        }
      })
    }

    if (unmatchedUUIDs.length > 0) {
      console.warn('[ComparisonStore] ⚠️ Could not map UUIDs to meter IDs:', unmatchedUUIDs,
        'Available compteurs:', availableMeters.value.map(m => ({ id: m.id, name: m.name, uuid: m.deviceUUID })))
    }

    return data
  })

  // Aggregation labels derived from real API data
  const aggregatedLabels = computed(() => {
    if (apiTimeSeriesData.value.length === 0) return []

    // Get unique timestamps from the first meter's data
    const firstMeter = apiTimeSeriesData.value[0]
    if (!firstMeter || firstMeter.values.length === 0) return []

    const localeCode = i18n.global.locale.value === 'en' ? 'en-US' : 'fr-FR'

    // Group timestamps by current aggregation level
    const groups = groupByAggregationLevel(firstMeter.values, aggregationLevel.value, localeCode)
    return Object.keys(groups)
  })

  /**
   * Generate complete expected labels from selectedDates (not just API data).
   * This ensures the chart shows ALL selected dates, even if some have no data.
   */
  const expectedLabels = computed(() => {
    const dates = selectedDates.value.length > 0 ? selectedDates.value : selectedPeriods.value
    if (dates.length === 0) return []

    const localeCode = i18n.global.locale.value === 'en' ? 'en-US' : 'fr-FR'
    const labelSet = new Set<string>()

    // For daily aggregation, use dates directly
    if (aggregationLevel.value === 'daily') {
      dates.forEach(dateStr => {
        labelSet.add(dateStr)
      })
    } else {
      // For hourly/weekly/monthly, generate labels from date strings
      dates.forEach(dateStr => {
        // Parse YYYY-MM-DD as local date
        const [year, month, day] = dateStr.split('-').map(Number)
        const date = new Date(year, month - 1, day, 12, 0, 0) // noon to avoid DST edge cases
        const ts = date.getTime()

        let label: string
        if (aggregationLevel.value === 'hourly') {
          // For hourly, we'd need to generate all 24 hours - skip for now
          const dateLocal = toLocalDateStr(ts)
          const hh = String(date.getHours()).padStart(2, '0')
          label = `${dateLocal} ${hh}:00`
        } else if (aggregationLevel.value === 'weekly') {
          label = getWeekLabel(dateStr, localeCode)
        } else {
          label = getMonthLabel(dateStr, localeCode)
        }
        labelSet.add(label)
      })
    }

    return Array.from(labelSet).sort()
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
    // Use real API KPI data when available
    if (apiKPIsData.value) {
      const kpi = apiKPIsData.value
      const highestMeter = availableMeters.value.find(m => m.deviceUUID === kpi.highest.meterId)
      const lowestMeter = availableMeters.value.find(m => m.deviceUUID === kpi.lowest.meterId)

      const highestName = highestMeter?.name || kpi.highest.meterId.substring(0, 8)
      const lowestName = lowestMeter?.name || kpi.lowest.meterId.substring(0, 8)
      const peakSuffix = kpi.highest.peakDate
        ? i18n.global.t('comparison.kpi.peakOn', { date: kpi.highest.peakDate })
        : ''
      const minSuffix = kpi.lowest.minDate
        ? i18n.global.t('comparison.kpi.minOn', { date: kpi.lowest.minDate })
        : ''

      return [
        {
          label: i18n.global.t('comparison.kpi.highest'),
          value: kpi.highest.value.toFixed(2),
          subtitle: highestName,
          color: '#10b981',
          icon: 'trending_up',
          description: i18n.global.t('comparison.kpi.highestDesc'),
          detail: kpi.highest.peakDate
            ? i18n.global.t('comparison.kpi.highestDetail', {
                value: kpi.highest.peakValue?.toFixed(2),
                date: kpi.highest.peakDate
              })
            : undefined,
          tooltip: i18n.global.t('comparison.kpi.highestTooltip', {
            meter: highestName,
            total: kpi.highest.value.toFixed(2),
            peak: peakSuffix
          })
        },
        {
          label: i18n.global.t('comparison.kpi.lowest'),
          value: kpi.lowest.value.toFixed(2),
          subtitle: lowestName,
          color: '#6b7280',
          icon: 'trending_down',
          description: i18n.global.t('comparison.kpi.lowestDesc'),
          detail: kpi.lowest.minDate
            ? i18n.global.t('comparison.kpi.lowestDetail', {
                value: kpi.lowest.minValue?.toFixed(2),
                date: kpi.lowest.minDate
              })
            : undefined,
          tooltip: i18n.global.t('comparison.kpi.lowestTooltip', {
            meter: lowestName,
            total: kpi.lowest.value.toFixed(2),
            min: minSuffix
          })
        },
        {
          label: i18n.global.t('comparison.kpi.average'),
          value: kpi.average.toFixed(2),
          subtitle: i18n.global.t('comparison.kpi.allMeters'),
          color: '#3b82f6',
          icon: 'analytics',
          description: i18n.global.t('comparison.kpi.averageDesc'),
          detail: i18n.global.t('comparison.kpi.averageDetail', { count: kpi.meterTotals.length }),
          tooltip: i18n.global.t('comparison.kpi.averageTooltip', {
            average: kpi.average.toFixed(2),
            total: kpi.total.toFixed(2),
            count: kpi.meterTotals.length
          })
        },
        {
          label: i18n.global.t('comparison.kpi.total'),
          value: kpi.total.toFixed(2),
          subtitle: `${kpi.meterTotals.length} ${i18n.global.t('comparison.kpi.items')}`,
          color: '#8b5cf6',
          icon: 'summarize',
          description: i18n.global.t('comparison.kpi.totalDesc'),
          detail: i18n.global.t('comparison.kpi.totalDetail', { count: kpi.meterTotals.length }),
          tooltip: i18n.global.t('comparison.kpi.totalTooltip', { total: kpi.total.toFixed(2) })
        },
        {
          label: i18n.global.t('comparison.kpi.variance'),
          value: `±${kpi.variance.toFixed(1)}%`,
          subtitle: i18n.global.t('comparison.kpi.fromAverage'),
          color: '#f59e0b',
          icon: 'percent',
          description: i18n.global.t('comparison.kpi.varianceDesc'),
          detail: i18n.global.t('comparison.kpi.varianceDetail', {
            value: (kpi.highest.value - kpi.lowest.value).toFixed(2)
          }),
          tooltip: i18n.global.t('comparison.kpi.varianceTooltip', {
            variance: kpi.variance.toFixed(1),
            max: kpi.highest.value.toFixed(2),
            min: kpi.lowest.value.toFixed(2),
            average: kpi.average.toFixed(2)
          })
        }
      ]
    }

    // Fallback: compute from comparisonData (for empty/loading states)
    if (comparisonData.value.length === 0) return []

    const values = comparisonData.value.map((d: any) => d.value).filter((v: number) => v !== undefined)
    const total = values.reduce((sum: number, v: number) => sum + v, 0)
    const average = total / values.length
    const max = Math.max(...values)
    const min = Math.min(...values)
    const variance = values.length > 1
      ? ((max - min) / average * 100).toFixed(1)
      : '0.0'

    const maxItem = comparisonData.value.find((d: any) => d.value === max)
    const minItem = comparisonData.value.find((d: any) => d.value === min)

    return [
      {
        label: i18n.global.t('comparison.kpi.highest'),
        value: max.toFixed(2),
        subtitle: maxItem?.label || '',
        color: '#10b981',
        icon: 'trending_up',
        description: i18n.global.t('comparison.kpi.highestDesc'),
        tooltip: i18n.global.t('comparison.kpi.highestTooltip', {
          meter: maxItem?.label || i18n.global.t('comparison.table.meter'),
          total: max.toFixed(2),
          peak: ''
        })
      },
      {
        label: i18n.global.t('comparison.kpi.lowest'),
        value: min.toFixed(2),
        subtitle: minItem?.label || '',
        color: '#6b7280',
        icon: 'trending_down',
        description: i18n.global.t('comparison.kpi.lowestDesc'),
        tooltip: i18n.global.t('comparison.kpi.lowestTooltip', {
          meter: minItem?.label || i18n.global.t('comparison.table.meter'),
          total: min.toFixed(2),
          min: ''
        })
      },
      {
        label: i18n.global.t('comparison.kpi.average'),
        value: average.toFixed(2),
        subtitle: i18n.global.t('comparison.kpi.allMeters'),
        color: '#3b82f6',
        icon: 'analytics',
        description: i18n.global.t('comparison.kpi.averageDesc'),
        detail: i18n.global.t('comparison.kpi.averageDetail', { count: values.length }),
        tooltip: i18n.global.t('comparison.kpi.averageTooltip', {
          average: average.toFixed(2),
          total: total.toFixed(2),
          count: values.length
        })
      },
      {
        label: i18n.global.t('comparison.kpi.total'),
        value: total.toFixed(2),
        subtitle: `${values.length} ${i18n.global.t('comparison.kpi.items')}`,
        color: '#8b5cf6',
        icon: 'summarize',
        description: i18n.global.t('comparison.kpi.totalDesc'),
        detail: i18n.global.t('comparison.kpi.totalDetail', { count: values.length }),
        tooltip: i18n.global.t('comparison.kpi.totalTooltip', { total: total.toFixed(2) })
      },
      {
        label: i18n.global.t('comparison.kpi.variance'),
        value: `±${variance}%`,
        subtitle: i18n.global.t('comparison.kpi.fromAverage'),
        color: '#f59e0b',
        icon: 'percent',
        description: i18n.global.t('comparison.kpi.varianceDesc'),
        detail: i18n.global.t('comparison.kpi.varianceDetail', { value: (max - min).toFixed(2) }),
        tooltip: i18n.global.t('comparison.kpi.varianceTooltip', {
          variance,
          max: max.toFixed(2),
          min: min.toFixed(2),
          average: average.toFixed(2)
        })
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
  // Computed - Detailed Table (date × meter matrix)
  // ===========================

  /**
   * Build a detailed comparison table: one row per date/period,
   * with columns for each meter showing consumption and vs-average %.
   */
  const detailedTableMeters = computed(() => {
    return apiTimeSeriesData.value.map(meterData => {
      const meter = findMeterByUUID(meterData.meterId)
      return {
        id: meter?.id || meterData.meterId,
        name: meter?.name || meterData.meterId.substring(0, 8),
        color: metersStore.getMeterColor(meter?.id || meterData.meterId),
      }
    })
  })

  const detailedTableRows = computed(() => {
    if (apiTimeSeriesData.value.length === 0) return []

    const localeCode = i18n.global.locale.value === 'en' ? 'en-US' : 'fr-FR'

    // Collect all dates/labels from all meters
    const labelMap = new Map<string, Map<string, number>>() // label → (meterId → value)

    apiTimeSeriesData.value.forEach(meterData => {
      const meter = findMeterByUUID(meterData.meterId)
      const meterId = meter?.id || meterData.meterId

      const groups = groupByAggregationLevel(meterData.values, aggregationLevel.value, localeCode)
      for (const [label, totalValue] of Object.entries(groups)) {
        if (!labelMap.has(label)) {
          labelMap.set(label, new Map())
        }
        labelMap.get(label)!.set(meterId, totalValue)
      }
    })

    // Build rows sorted by label
    const sortedLabels = Array.from(labelMap.keys()).sort()
    const meterIds = detailedTableMeters.value.map(m => m.id)

    // Calculate column averages for %
    const meterTotals = new Map<string, { sum: number; count: number }>()
    for (const [, meterMap] of labelMap) {
      for (const [meterId, val] of meterMap) {
        if (!meterTotals.has(meterId)) meterTotals.set(meterId, { sum: 0, count: 0 })
        const t = meterTotals.get(meterId)!
        t.sum += val
        t.count++
      }
    }
    const meterAvg = new Map<string, number>()
    for (const [meterId, t] of meterTotals) {
      meterAvg.set(meterId, t.count > 0 ? t.sum / t.count : 0)
    }

    return sortedLabels.map(label => {
      const meterMap = labelMap.get(label)!
      const values: Record<string, { value: number; pct: number }> = {}
      let rowTotal = 0

      meterIds.forEach(id => {
        const val = meterMap.get(id) ?? 0
        const avg = meterAvg.get(id) ?? 0
        const pct = avg !== 0 ? ((val - avg) / avg) * 100 : 0
        values[id] = { value: val, pct }
        rowTotal += val
      })

      return { label, values, total: rowTotal }
    })
  })

  // ===========================
  // Actions - API Fetching
  // ===========================

  /**
   * Fetch real comparison data from the backend API.
   * Calls all three endpoints in parallel:
   * - /comparison (time series)
   * - /comparison/kpis
   * - /comparison/summary
   */
  async function fetchComparisonDataFromAPI() {
    // Get device UUIDs for selected meters
    const deviceUUIDs = selectedMeters.value
      .map(m => m.deviceUUID)
      .filter((uuid): uuid is string => !!uuid)

    // Log the mapping for diagnostics
    const meterMapping = selectedMeters.value.map(m => ({
      id: m.id,
      name: m.name,
      uuid: m.deviceUUID || '❌ MISSING',
    }))
    console.log('[ComparisonStore] Meter UUID mapping:', meterMapping)

    const missingUUID = selectedMeters.value.filter(m => !m.deviceUUID)
    if (missingUUID.length > 0) {
      console.warn('[ComparisonStore] ⚠️ Meters without deviceUUID (excluded from request):',
        missingUUID.map(m => `${m.id}:${m.name}`))
    }

    if (deviceUUIDs.length === 0) {
      apiError.value = 'No meters with device UUIDs selected'
      return
    }

    // Determine dates to use
    let dates = selectedDates.value.length > 0
      ? [...selectedDates.value]
      : [...selectedPeriods.value]

    // Default to last 7 days if nothing selected
    if (dates.length === 0) {
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        dates.push(toLocalDateStr(d.getTime()))
      }
    }

    isLoading.value = true
    apiError.value = null

    try {
      // Auto-downgrade hourly to daily for ranges > 30 days (backend rejects hourly > 30d)
      let effectiveResolution = aggregationLevel.value
      const sortedDates = [...dates].sort()
      const rangeStart = new Date(sortedDates[0])
      const rangeEnd = new Date(sortedDates[sortedDates.length - 1])
      const rangeDays = Math.ceil((rangeEnd.getTime() - rangeStart.getTime()) / 86_400_000)

      if (effectiveResolution === 'hourly' && rangeDays > 30) {
        console.warn(`[ComparisonStore] Auto-downgrading hourly → daily for ${rangeDays}-day range`)
        effectiveResolution = 'daily'
      }

      const requestBody = buildComparisonRequest(
        deviceUUIDs,
        dates,
        effectiveResolution
      )

      console.log('[ComparisonStore] Fetching comparison data:', {
        meters: deviceUUIDs.length,
        dates: dates.length,
        rangeDays,
        resolution: effectiveResolution,
        startTs: new Date(requestBody.startTs).toISOString(),
        endTs: new Date(requestBody.endTs).toISOString()
      })

      // Single combined API call — returns data + KPIs + summary in one response
      // Eliminates 2 extra HTTP round-trips for much faster loading
      const allResponse = await fetchComparisonAll(requestBody)

      const dataResponse = allResponse.comparison
      const kpisResponse = allResponse.kpis
      const summaryResponse = allResponse.summary

      // Update all API state
      apiTimeSeriesData.value = dataResponse.data
      apiMeta.value = dataResponse.meta
      apiKPIsData.value = kpisResponse.data
      apiSummaryData.value = summaryResponse.data
      hasLoadedOnce.value = true

      // Log per-meter data point counts to help diagnose missing data
      const perMeterSummary = dataResponse.data.map(m => ({
        meterId: m.meterId.substring(0, 8),
        points: m.values.length,
        total: m.totalConsumption.toFixed(2),
      }))
      console.log('[ComparisonStore] ✅ Data loaded:', {
        meters: dataResponse.data.length,
        totalPoints: dataResponse.meta.totalDataPoints,
        executionMs: dataResponse.meta.executionTimeMs,
        apiCalls: dataResponse.meta.apiCallCount,
        perMeter: perMeterSummary,
      })

      // Warn about meters with no data
      const emptyMeters = dataResponse.data.filter(m => m.values.length === 0)
      if (emptyMeters.length > 0) {
        console.warn('[ComparisonStore] ⚠️ Meters with no data:', emptyMeters.map(m => m.meterId.substring(0, 8)))
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      apiError.value = msg
      console.error('[ComparisonStore] ❌ API error:', msg)
    } finally {
      isLoading.value = false
    }
  }

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
          dates.push(toLocalDateStr(date.getTime()))
        }
        break
      case 'last4Weeks':
        // Generate all 28 dates for a full 4-week range
        for (let i = 27; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          dates.push(toLocalDateStr(date.getTime()))
        }
        break
      case 'last3Months': {
        // Generate all dates for a full 3-month range
        const start3m = new Date(today)
        start3m.setMonth(start3m.getMonth() - 3)
        const totalDays = Math.round((today.getTime() - start3m.getTime()) / 86_400_000)
        for (let i = totalDays; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          dates.push(toLocalDateStr(date.getTime()))
        }
        break
      }
      default:
        dates.push(toLocalDateStr(today.getTime()))
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
    comparisonMode.value = 'matrix'
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

  /**
   * Group time series values by aggregation level.
   * Returns a map of label → summed value.
   */
  /**
   * Format a timestamp as a local date string (YYYY-MM-DD).
   * Delegates to TimeUtils.toLocalDateStr.
   */
  const toLocalDateStr = (ts: number) => TimeUtils.toLocalDateStr(ts)

  function groupByAggregationLevel(
    values: Array<{ ts: number; value: number }>,
    level: AggregationLevel,
    localeCode: string
  ): Record<string, number> {
    const groups: Record<string, number> = {}

    for (const v of values) {
      let label: string

      if (level === 'hourly') {
        const d = new Date(v.ts)
        const dateStr = toLocalDateStr(v.ts)
        const hh = String(d.getHours()).padStart(2, '0')
        label = `${dateStr} ${hh}:00`
      } else if (level === 'daily') {
        label = toLocalDateStr(v.ts)
      } else if (level === 'weekly') {
        label = getWeekLabel(toLocalDateStr(v.ts), localeCode)
      } else {
        label = getMonthLabel(toLocalDateStr(v.ts), localeCode)
      }

      groups[label] = (groups[label] || 0) + v.value
    }

    return groups
  }

  function hasDataForDate(dateStr: string): boolean {
    // Has data for last 90 days
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

    // API State
    isLoading,
    apiError,
    apiTimeSeriesData,
    apiKPIsData,
    apiSummaryData,
    apiMeta,
    hasLoadedOnce,

    // Computed
    availableMeters,
    selectedMeters,
    comparisonData,
    aggregatedLabels,
    expectedLabels,
    activePeriodLabel,
    kpiCards,
    comparisonTable,
    detailedTableMeters,
    detailedTableRows,
    calendarDays,

    // Actions
    fetchComparisonDataFromAPI,
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
