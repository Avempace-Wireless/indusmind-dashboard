import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore'
import { useMetersStore } from '@/stores/useMetersStore'
import { TimeUtils } from '@/utils/TimeUtils'
import i18n from '@/i18n'
import type { MetricType } from '@/types/metrics'
import {
  type ComparisonDataResponse,
  type ComparisonKPIsResponse,
  type ComparisonSummaryResponse,
  type MeterTimeSeriesData,
} from '@/services/comparisonAPI'

export type ComparisonMode = 'byMeters' | 'matrix'
export type AggregationLevel = 'hourly' | 'daily'
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

  // Aggregation level - auto-determined from selected dates (≤3 days = hourly, >3 = daily)
  const aggregationLevel = computed<AggregationLevel>(() => {
    const dates = selectedDates.value.length > 0 ? selectedDates.value : selectedPeriods.value
    return dates.length <= 3 ? 'hourly' : 'daily'
  })

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

    const labelSet = new Set<string>()

    // For daily aggregation, use dates directly
    if (aggregationLevel.value === 'daily') {
      dates.forEach(dateStr => {
        labelSet.add(dateStr)
      })
    } else {
      // For hourly, generate 24 labels per day (00:00 → 23:00)
      dates.forEach(dateStr => {
        for (let hour = 0; hour < 24; hour++) {
          labelSet.add(`${dateStr} ${String(hour).padStart(2, '0')}:00`)
        }
      })
    }

    return Array.from(labelSet).sort()
  })

  const activePeriodLabel = computed(() => aggregatedLabels.value[0] || '')

  // ===========================
  // Helper: Calculate KPIs by Daily Aggregation
  // ===========================
  /**
   * Calculate KPIs based on daily aggregation (not by meter).
   * This prevents aggregate meter totals from skewing the results.
   *
   * Returns: highest day, lowest day, average daily consumption, variance
   */
  function calculateDailyKPIs() {
    if (apiTimeSeriesData.value.length === 0) {
      return null
    }

    // Build daily totals: { dateStr: totalConsumption }
    const dailyTotals = new Map<string, number>()
    const dailyDetails = new Map<string, { date: string; total: number }>()

    apiTimeSeriesData.value.forEach(meterData => {
      meterData.values.forEach(({ ts, value }) => {
        const dateStr = TimeUtils.toLocalDateStr(ts) // "YYYY-MM-DD" format
        const currentTotal = dailyTotals.get(dateStr) || 0
        dailyTotals.set(dateStr, currentTotal + value)

        if (!dailyDetails.has(dateStr)) {
          dailyDetails.set(dateStr, { date: dateStr, total: 0 })
        }
        const detail = dailyDetails.get(dateStr)!
        detail.total = (dailyDetails.get(dateStr)?.total || 0) + value
      })
    })

    if (dailyTotals.size === 0) return null

    // Convert to array and sort
    const dailyArray = Array.from(dailyTotals.entries()).map(([date, total]) => ({
      date,
      total
    }))

    // Find highest and lowest day
    const highestDay = dailyArray.reduce((max, d) => d.total > max.total ? d : max)
    const lowestDay = dailyArray.reduce((min, d) => d.total < min.total ? d : min)

    // Calculate average
    const totalSum = dailyArray.reduce((sum, d) => sum + d.total, 0)
    const average = totalSum / dailyArray.length

    // Calculate variance (percentage difference between max and min relative to average)
    const variance = average > 0 ? ((highestDay.total - lowestDay.total) / average * 100) : 0

    return {
      highest: {
        value: highestDay.total,
        peakDate: highestDay.date,
        peakValue: highestDay.total
      },
      lowest: {
        value: lowestDay.total,
        minDate: lowestDay.date,
        minValue: lowestDay.total
      },
      average,
      total: totalSum,
      variance,
      dailyCount: dailyArray.length,
      meterTotals: apiKPIsData.value?.meterTotals || []
    }
  }

  const kpiCards = computed(() => {
    // Always one card per meter, regardless of comparison mode
    // In matrix mode, comparisonData has meter × period entries — aggregate per meter
    const meterTotals = new Map<string, { label: string; value: number; color: string }>()

    comparisonData.value.forEach((item: any) => {
      const meterId = item.id || item.meterId || ''
      const meterName = item.label || item.meterLabel || 'Unknown'
      const value = item.value ?? 0

      if (meterTotals.has(meterId)) {
        meterTotals.get(meterId)!.value += value
      } else {
        meterTotals.set(meterId, {
          label: meterName,
          value,
          color: metersStore.getMeterColor(meterId)
        })
      }
    })

    return Array.from(meterTotals.values()).map(m => ({
      label: m.label,
      value: m.value.toFixed(2),
      color: m.color,
      tooltip: `${m.label}: ${m.value.toFixed(2)} kWh`
    }))
  })

  const comparisonTable = computed(() => {
    const items = comparisonData.value

    // ── Per-meter averages ──
    const meterStats = new Map<string, { sum: number; count: number }>()
    items.forEach((item: any) => {
      const mid = item.id || item.meterId || ''
      if (!meterStats.has(mid)) meterStats.set(mid, { sum: 0, count: 0 })
      const s = meterStats.get(mid)!
      s.sum += item.value
      s.count++
    })
    const meterAvg = new Map<string, number>()
    for (const [mid, s] of meterStats) {
      meterAvg.set(mid, s.count > 0 ? s.sum / s.count : 0)
    }

    // ── Build chronological previous-date value per meter ──
    // Group items by meter, sort each group by period, build a lookup: meterId → periodLabel → prevValue
    const meterPeriods = new Map<string, { period: string; value: number }[]>()
    items.forEach((item: any) => {
      const mid = item.id || item.meterId || ''
      const period = item.periodLabel || item.periodId || item.label || ''
      if (!meterPeriods.has(mid)) meterPeriods.set(mid, [])
      meterPeriods.get(mid)!.push({ period, value: item.value ?? 0 })
    })
    // Sort each meter's periods chronologically and build prev-value map
    const prevValueLookup = new Map<string, Map<string, number>>() // meterId → periodLabel → previousPeriodValue
    for (const [mid, periods] of meterPeriods) {
      periods.sort((a, b) => a.period.localeCompare(b.period))
      const lookup = new Map<string, number>()
      for (let i = 1; i < periods.length; i++) {
        lookup.set(periods[i].period, periods[i - 1].value)
      }
      prevValueLookup.set(mid, lookup)
    }

    const rows = items.map((item: any, index: number) => {
      const mid = item.id || item.meterId || ''
      const avg = meterAvg.get(mid) ?? 0
      const val = item.value ?? 0
      const period = item.periodLabel || item.periodId || item.label || ''

      // Écart = (value − meter avg) / meter avg × 100
      const varianceNum = avg !== 0 ? ((val - avg) / avg) * 100 : 0
      const varianceStr = varianceNum.toFixed(1)

      // Tendance = compare to same meter's previous date value
      const meterLookup = prevValueLookup.get(mid)
      const prevVal = meterLookup?.get(period)
      let trendPct = 0
      let trendDir: 'up' | 'down' | 'stable' = 'stable'
      let prevDateLabel = ''
      if (prevVal !== undefined && prevVal !== 0) {
        trendPct = ((val - prevVal) / prevVal) * 100
        trendDir = trendPct > 2 ? 'up' : trendPct < -2 ? 'down' : 'stable'
        // Find which period was previous
        const periods = meterPeriods.get(mid)!
        const idx = periods.findIndex(p => p.period === period)
        if (idx > 0) prevDateLabel = periods[idx - 1].period
      }

      // Tooltip formulas (i18n)
      const tt = i18n.global.t
      const varianceTooltip = tt('comparison.kpi.varianceFormula', {
        value: val.toFixed(2),
        avg: avg.toFixed(2),
        result: varianceStr
      })
      const trendTooltip = prevVal !== undefined
        ? tt('comparison.kpi.trendFormula', {
            prevDate: prevDateLabel,
            value: val.toFixed(2),
            prevValue: prevVal.toFixed(2),
            result: `${trendPct > 0 ? '+' : ''}${trendPct.toFixed(1)}`
          })
        : tt('comparison.kpi.noPreviousPeriod')

      return {
        rank: index + 1,
        label: comparisonMode.value === 'byMeters'
          ? (item.label || item.meterLabel)
          : (item.periodLabel || item.label || item.meterLabel),
        meterId: mid,
        meterLabel: item.label || item.meterLabel || '',
        value: val.toFixed(2),
        variance: parseFloat(varianceStr),
        varianceText: `${parseFloat(varianceStr) > 0 ? '+' : ''}${varianceStr}%`,
        varianceTooltip,
        trend: trendDir,
        trendPct: parseFloat(trendPct.toFixed(1)),
        trendText: prevVal !== undefined ? `${trendPct > 0 ? '+' : ''}${trendPct.toFixed(1)}%` : '—',
        trendTooltip,
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
   * Fetch comparison data using the fast Energy History API.
   * Uses GET /telemetry/energy-history with parallel per-day fetching.
   * Transforms response into MeterTimeSeriesData[] format for the store.
   */
  async function fetchComparisonDataFromAPI() {
    // Prevent concurrent API calls
    if (isLoading.value) {
      console.log('[ComparisonStore] ⏭️ Skipping fetch - already loading')
      return
    }

    // Get device UUIDs for selected meters
    const deviceUUIDs = selectedMeters.value
      .map(m => m.deviceUUID)
      .filter((uuid): uuid is string => !!uuid)

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

    const startTime = performance.now()

    try {
      // Resolution is auto-determined by aggregationLevel computed
      const effectiveResolution: 'hourly' | 'daily' = aggregationLevel.value
      const sortedDates = [...dates].sort()

      // Build timestamps (parse as local dates)
      const [sYear, sMonth, sDay] = sortedDates[0].split('-').map(Number)
      const startDate = new Date(sYear, sMonth - 1, sDay, 0, 0, 0, 0)

      const [eYear, eMonth, eDay] = sortedDates[sortedDates.length - 1].split('-').map(Number)
      const endDate = new Date(eYear, eMonth - 1, eDay, 23, 59, 59, 999)

      // Build energy-history API URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const params = new URLSearchParams({
        devices: deviceUUIDs.join(','),
        startDate: startDate.getTime().toString(),
        endDate: endDate.getTime().toString(),
        metrics: 'consumption',
        resolution: effectiveResolution,
        hourFrom: '0',
        hourTo: '23',
      })

      console.log('[ComparisonStore] 🚀 Fetching via Energy History API:', {
        meters: deviceUUIDs.length,
        dates: dates.length,
        resolution: effectiveResolution,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      })

      const response = await fetch(`${apiBaseUrl}/telemetry/energy-history?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error('Energy History API returned error')
      }

      const elapsed = Math.round(performance.now() - startTime)

      // Transform energy-history response → MeterTimeSeriesData[]
      const meterTimeSeries: MeterTimeSeriesData[] = deviceUUIDs.map(uuid => {
        const deviceData = result.data?.[uuid]
        const consumptionPoints = deviceData?.consumption || []

        // Convert DataPoint[] → { ts, value }[]
        const values = consumptionPoints
          .filter((p: any) => p.hasData !== false)
          .map((p: any) => ({
            ts: p.timestamp,
            value: typeof p.value === 'number' ? p.value : 0,
          }))

        const totalConsumption = values.reduce((sum: number, v: any) => sum + v.value, 0)

        return {
          meterId: uuid,
          values,
          totalConsumption,
        }
      })

      // Update store state
      apiTimeSeriesData.value = meterTimeSeries
      apiMeta.value = {
        meters: deviceUUIDs,
        resolution: effectiveResolution,
        startTs: startDate.getTime(),
        endTs: endDate.getTime(),
        totalDataPoints: meterTimeSeries.reduce((sum, m) => sum + m.values.length, 0),
        executionTimeMs: elapsed,
        apiCallCount: 1,
        requestedAt: Date.now(),
      }
      apiKPIsData.value = null
      apiSummaryData.value = null
      hasLoadedOnce.value = true

      // Log summary
      const perMeterSummary = meterTimeSeries.map(m => ({
        meterId: m.meterId.substring(0, 8),
        points: m.values.length,
        total: m.totalConsumption.toFixed(2),
      }))
      console.log(`[ComparisonStore] ✅ Energy History API loaded in ${elapsed}ms:`, {
        meters: meterTimeSeries.length,
        totalPoints: apiMeta.value.totalDataPoints,
        perMeter: perMeterSummary,
      })

      const emptyMeters = meterTimeSeries.filter(m => m.values.length === 0)
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
      } else {
        label = toLocalDateStr(v.ts)
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
