import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type {
  MetricType,
  MetricDefinition,
  DailyMetricData,
  HourlyDataPoint,
  HistoricalDataQuery,
  DEFAULT_METRICS,
} from '@/types/metrics'
import { DEFAULT_METRICS as METRICS_CONFIG } from '@/types/metrics'
import { useDashboardStore } from '@/features/dashboard/store/useDashboardStore'
import { useMetersStore } from '@/stores/useMetersStore'
import { useEnergyHistory, type EnergyHistoryResponse, type EnergyHistoryQuery } from '@/composables/useEnergyHistory'
import { TimeUtils } from '@/utils/TimeUtils'
import i18n from '@/i18n'
import { getMeterOrderRank } from '@/utils/meterColors'

/**
 * Energy History Store - Multi-Metric Historical Data Analysis
 *
 * Manages:
 * - Multiple metric types (energy, CO2, cost, consumption, etc.)
 * - Date selection and comparison
 * - Time range filtering (hour-based)
 * - Calendar state and navigation
 * - Data fetching and caching
 * - Integration with centralized meter selection
 */
export const useEnergyHistoryStore = defineStore('energyHistory', () => {
  const dashboardStore = useDashboardStore()

  // ✅ USE CENTRALIZED METER STORE
  const metersStore = useMetersStore()
  const { selectedMeterIds } = storeToRefs(metersStore)

  // ===========================
  // State - Metric Configuration
  // ===========================
  const availableMetrics = ref<MetricDefinition[]>([
    {
      id: 'metric-energy',
      enabled: false,
      ...METRICS_CONFIG.energy,
    },
    {
      id: 'metric-co2',
      enabled: false,
      ...METRICS_CONFIG.co2,
    },
    {
      id: 'metric-cost',
      enabled: false,
      ...METRICS_CONFIG.cost,
    },
    {
      id: 'metric-consumption',
      enabled: true,
      ...METRICS_CONFIG.consumption,
    },
  ])

  // ===========================
  // State - Date Selection
  // ===========================
  const selectedDates = ref<string[]>([]) // Format: YYYY-MM-DD
  const currentMonth = ref(new Date())
  const activePeriodPreset = ref<'last7Days' | 'last4Weeks' | 'last3Months' | 'last30Days' | 'thisMonth' | 'lastMonth' | null>(null)

  // ===========================
  // State - Time Range Filter
  // ===========================
  const hourFrom = ref(0) // 0-23
  const hourTo = ref(23) // 0-23

  // ===========================
  // State - Data Storage
  // ===========================
  const historicalData = ref<Map<string, DailyMetricData[]>>(new Map()) // Key: compteurId-date-metricType
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ===========================
  // State - Additional Options
  // ===========================
  const photovoltaicEnabled = ref(false)
  const photovoltaicPercentage = ref(15) // Default 15%

  // ===========================
  // State - Resolution/Period
  // ===========================
  const resolution = ref<'hourly' | 'daily'>('hourly') // Hourly for 1 day, daily for multiple

  // ===========================
  // Computed - Enabled Metrics
  // ===========================
  const enabledMetrics = computed(() =>
    availableMetrics.value.filter(m => m.enabled)
  )

  const enabledMetricTypes = computed<MetricType[]>(() =>
    enabledMetrics.value.map(m => m.type)
  )

  // Single selected characteristic (metric type)
  const selectedMetric = computed(() => {
    const enabled = enabledMetrics.value[0]
    if (!enabled) {
      const fallback = availableMetrics.value.find(m => m.type === 'consumption')!
      console.warn('No enabled metrics, using fallback consumption:', {
        fallback: fallback?.type,
        hasYAxisPosition: !!fallback?.yAxisPosition,
      })
      return fallback
    }
    console.log('selectedMetric computed:', {
      type: enabled.type,
      enabled: enabled.enabled,
      yAxisPosition: enabled.yAxisPosition,
      hasProperties: {
        type: !!enabled.type,
        yAxisPosition: !!enabled.yAxisPosition,
        unit: !!enabled.unit,
      },
    })
    return enabled
  })

  // ===========================
  // Computed - Auto Resolution
  // ===========================
  const effectiveResolution = computed(() => {
    // Check the actual data structure to determine resolution
    // Preference: If we have 4+ selected dates AND detect daily pattern, use DAILY
    // Otherwise: Check if ANY device has daily pattern (hour=12, length=1)

    console.log('[effectiveResolution] Computing... historicalDataSize:', historicalData.value.size, 'selectedDatesLength:', selectedDates.value.length)

    // Track what we find across all devices
    let foundDailyPattern = false
    let foundHourlyPattern = false

    if (historicalData.value.size > 0) {
      // Check ALL devices, not just the first one
      for (const [deviceUUID, deviceDates] of historicalData.value.entries()) {
        console.log(`[effectiveResolution] Checking device ${deviceUUID}: ${deviceDates.length} dates`)

        if (deviceDates.length > 0) {
          const firstDate = deviceDates[0]
          const allHour12 = firstDate.hourlyData.length === 1 && firstDate.hourlyData[0].hour === 12

          console.log('[effectiveResolution] First date details:', {
            date: firstDate.date,
            hourlyDataLength: firstDate.hourlyData.length,
            hour: firstDate.hourlyData[0]?.hour,
            allHour12,
          })

          if (allHour12) {
            foundDailyPattern = true
            console.log('[effectiveResolution] ✓ Found DAILY pattern in device:', deviceUUID)
          } else if (firstDate.hourlyData.length > 1) {
            foundHourlyPattern = true
            console.log('[effectiveResolution] Found HOURLY pattern in device:', deviceUUID)
          }
        }
      }
    }

    // Decision logic:
    // 1. If we found daily pattern, prefer daily (even if some devices have hourly)
    // 2. If only hourly pattern found, use hourly
    // 3. Otherwise, use fallback based on selectedDates count
    if (foundDailyPattern) {
      console.log('[effectiveResolution] ✓ RETURNING DAILY (found daily pattern across devices)')
      return 'daily' as const
    }

    if (foundHourlyPattern && selectedDates.value.length <= 3) {
      console.log('[effectiveResolution] ✓ RETURNING HOURLY (found hourly pattern and <= 3 dates)')
      return 'hourly' as const
    }

    // Auto-switch: 3 days or less = hourly, 4+ days = daily
    const fallbackResolution = selectedDates.value.length <= 3 ? 'hourly' : 'daily'
    console.log('[effectiveResolution] ✓ RETURNING FALLBACK:', fallbackResolution,
                '(selectedDatesLength:', selectedDates.value.length, ')')

    return fallbackResolution
  })

  const resolutionLabel = computed(() =>
    effectiveResolution.value === 'hourly' ? 'Horaire' : 'Quotidien'
  )

  // ===========================
  // Computed - Selected Compteurs
  // ===========================
  /**
   * Get selected compteurs from dashboard store
   * Filters actual compteur data by IDs from centralized meter selection
   */
  const selectedCompteurs = computed(() => {
    // Get actual compteur data from dashboardStore filtered by centralized selection
    const result = dashboardStore.compteurs.filter(c =>
      metersStore.selectedMeterIds.includes(c.id)
    )
    .sort((a, b) => {
      const rankDiff = getMeterOrderRank(a.name) - getMeterOrderRank(b.name)
      if (rankDiff !== 0) return rankDiff
      return (a.name ?? '').localeCompare(b.name ?? '')
    })
    console.log('selectedCompteurs computed:', {
      dashboardCompteurs: dashboardStore.compteurs.length,
      dashboardCompteurIds: dashboardStore.compteurs.map(c => c.id),
      selectedMeterIds: metersStore.selectedMeterIds,
      result: result.map(c => ({ id: c.id, name: c.name })),
    })
    return result
  })

  // User-selected active meters within selectedCompteurs
  const activeCompteurIds = ref<string[]>([])

  const visibleCompteurs = computed(() => {
    const ids = activeCompteurIds.value
    const list = selectedCompteurs.value
    const filtered = ids.length === 0 ? list : list.filter(c => ids.includes(c.id))
    return [...filtered].sort((a, b) => {
      const rankDiff = getMeterOrderRank(a.name) - getMeterOrderRank(b.name)
      if (rankDiff !== 0) return rankDiff
      return (a.name ?? '').localeCompare(b.name ?? '')
    })
  })

  function toggleCompteurActive(id: string) {
    const idx = activeCompteurIds.value.indexOf(id)
    if (idx >= 0) {
      activeCompteurIds.value.splice(idx, 1)
    } else {
      activeCompteurIds.value.push(id)
    }
    // Ensure at least one meter remains visible
    if (activeCompteurIds.value.length === 0 && selectedCompteurs.value.length > 0) {
      activeCompteurIds.value.push(selectedCompteurs.value[0].id)
    }
  }

  function enableAllCompteurs() {
    activeCompteurIds.value = selectedCompteurs.value.map(c => c.id)
  }

  // ===========================
  // Computed - Primary & Secondary Dates
  // ===========================
  const primaryDate = computed(() => selectedDates.value[0] || null)

  function normalizeSelectedDates(dates: string[]): string[] {
    if (dates.length <= 1) return dates

    const sorted = [...dates].sort()
    const minDate = sorted[0]
    const maxDate = sorted[sorted.length - 1]
    const continuous = getDatesBetween(minDate, maxDate)

    return continuous
  }

  watch(
    () => selectedDates.value,
    dates => {
      if (dates.length <= 1) return

      const normalized = normalizeSelectedDates(dates)
      if (normalized.length !== dates.length || normalized.some((d, i) => d !== dates[i])) {
        selectedDates.value = normalized
      }
    },
    { deep: true }
  )

  // ===========================
  // Computed - Calendar Days
  // ===========================
  const calendarDays = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay() // 0 = Sunday

    const days: Array<{
      date: string | null
      dateObj: Date | null
      isCurrentMonth: boolean
      isToday: boolean
      isSelected: boolean
      hasData: boolean
    }> = []

    // Add previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    const leadingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1 // Adjust for Monday start
    for (let i = leadingDays; i > 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i + 1)
      const dateStr = TimeUtils.toLocalDateStr(date)
      days.push({
        date: dateStr,
        dateObj: date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: selectedDates.value.includes(dateStr),
        hasData: false,
      })
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = TimeUtils.toLocalDateStr(date)
      const today = new Date()
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()

      days.push({
        date: dateStr,
        dateObj: date,
        isCurrentMonth: true,
        isToday,
        isSelected: selectedDates.value.includes(dateStr),
        hasData: hasDataForDate(dateStr),
      })
    }

    // Add next month's leading days to fill the grid (42 cells = 6 weeks)
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      const dateStr = TimeUtils.toLocalDateStr(date)
      days.push({
        date: dateStr,
        dateObj: date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: selectedDates.value.includes(dateStr),
        hasData: false,
      })
    }

    return days
  })

  // ===========================
  // Computed - Chart Data
  // ===========================
  const chartData = computed(() => {
    // ⚠️ CRITICAL: Don't compute chart while loading API data
    // Wait for loading flag to be false before building chart
    if (loading.value) {
      console.log('📊 [chartData] SKIPPING - Still loading from API (loading.value=true)')
      return { labels: [], datasets: [] }
    }

    console.log('📊 [chartData] Computed fired:', {
      selectedDatesCount: selectedDates.value.length,
      selectedDates: selectedDates.value,
      effectiveResolution: effectiveResolution.value,
      visibleCount: visibleCompteurs.value.length,
      historicalDataSize: historicalData.value.size,
      selectedMetricType: selectedMetric.value?.type,
      chartWillBe: effectiveResolution.value === 'hourly' ? `HOURLY (${selectedDates.value.length * 24} labels)` : `DAILY (${selectedDates.value.length} labels)`,
    })

    const datasets: Array<{
      label: string
      data: (number | null)[]
      borderColor: string
      backgroundColor: string
      yAxisID: string
      metricType: MetricType
      spanGaps?: boolean
      date?: string
    }> = []

    if (effectiveResolution.value === 'hourly') {
      // Hourly: aggregate by hour across ALL selected dates (< 8)
      const metric = selectedMetric.value
      let dateStr = selectedDates.value[0]

      console.log('[Chart] ⏰ Entering HOURLY mode, effectiveResolution:', effectiveResolution.value,
                  'selectedDatesLength:', selectedDates.value.length,
                  'historicalDataSize:', historicalData.value.size)

      // If no date selected, use the first available date from stored data
      if (!dateStr && historicalData.value.size > 0) {
        for (const [_, data] of historicalData.value.entries()) {
          const firstEntry = data.find(d => d.metricType === metric?.type)
          if (firstEntry) {
            dateStr = firstEntry.date
            break
          }
        }
      }

      console.log('[Chart] Hourly mode init:', {
        selectedDateStr: selectedDates.value[0],
        usedDateStr: dateStr,
        metric: metric?.type,
        historicalDataSize: historicalData.value.size,
      })

      if (!metric) {
        console.warn('No metric selected in chartData')
        return { labels: [], datasets: [] }
      }

      console.log('[Chart] ✓ Metric found, proceeding with hourly per-day display')

      // ✅ HOURLY MODE: Display each selected day's 24-hour breakdown sequentially
      let datesToUse = selectedDates.value.length > 0 ? [...selectedDates.value] : (dateStr ? [dateStr] : [])

      console.log('[Chart] 🔍 Selected dates for chart:', {
        selectedDatesCount: selectedDates.value.length,
        selectedDates: selectedDates.value.slice(0, 10),
        datesToUse: datesToUse.slice(0, 10)
      })

      // Sort dates chronologically - YYYY-MM-DD format sorts correctly with localeCompare
      datesToUse.sort((a, b) => a.localeCompare(b))
      console.log('[Chart] Hourly mode - Sorted dates:', datesToUse)

      if (datesToUse.length === 0) {
        console.log('[Chart] No dates for hourly display, returning empty')
        return { labels: [], datasets: [] }
      }

      console.log('[Chart] Hourly per-day display for dates (sorted):', datesToUse)

      // Build labels using ACTUAL API TIMESTAMPS
      // Extract timestamps from first compteur's data (all compteurs have same hours from API)
      const firstCompteur = visibleCompteurs.value[0]
      const timestampMap = new Map<number, string>() // Map timestamp key to label
      const hourIndices = new Map<number, number>() // Map timestamp key to array index

      // Collect all timestamps from API responses for all dates
      datesToUse.forEach((dStr) => {
        const dayData = firstCompteur ? getMetricDataForDate(dStr, metric.type, firstCompteur.id) : null

        if (dayData && dayData.hourlyData) {
          dayData.hourlyData.forEach(d => {
            if (d.timestamp) {
              const date = new Date(d.timestamp)
              const hour = date.getHours()
              const timeLabel = `${hour.toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

              // Create composite key for day+hour to handle multi-day data
              const dateStr = TimeUtils.toLocalDateStr(date)
              const compositeKey = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:00:00`).getTime()
              timestampMap.set(compositeKey, `${dateStr} ${timeLabel}`)
            }
          })
        } else {
          // Date has no data - add empty placeholders for all 24 hours to show gaps
          for (let hour = 0; hour < 24; hour++) {
            const timeLabel = `${hour.toString().padStart(2, '0')}:00`
            const compositeKey = new Date(`${dStr}T${hour.toString().padStart(2, '0')}:00:00`).getTime()
            timestampMap.set(compositeKey, `${dStr} ${timeLabel}`)
          }
        }
      })

      // If no timestamps from API, fall back to generated labels
      let allLabels: string[]
      if (timestampMap.size === 0) {
        console.warn('[Chart] No API timestamps available, using generated labels')
        allLabels = []
        datesToUse.forEach((dStr) => {
          for (let hour = 0; hour < 24; hour++) {
            allLabels.push(`${dStr} ${hour.toString().padStart(2, '0')}:00`)
          }
        })
      } else {
        // Use actual API timestamps, sorted chronologically
        const sortedTimestamps = Array.from(timestampMap.keys()).sort((a, b) => a - b)
        allLabels = sortedTimestamps.map(ts => timestampMap.get(ts)!)

        // Build hour index map for data population
        sortedTimestamps.forEach((ts, idx) => {
          hourIndices.set(ts, idx)
        })

        console.log('[Chart] Using API timestamps:', {
          count: allLabels.length,
          sample: allLabels.slice(0, 5)
        })
      }

      // Build datasets for each compteur
      visibleCompteurs.value.forEach((compteur, idx) => {
        // Initialize all slots as null
        const allData: (number | null)[] = new Array(allLabels.length).fill(null)

        datesToUse.forEach((dStr) => {
          const dayData = getMetricDataForDate(dStr, metric.type, compteur.id)

          if (dayData && dayData.hourlyData) {
            dayData.hourlyData.forEach(d => {
              // Find position using timestamp if available
              if (d.timestamp && hourIndices.size > 0) {
                const date = new Date(d.timestamp)
                const hour = date.getHours()
                const dateStr = TimeUtils.toLocalDateStr(date)
                const compositeKey = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:00:00`).getTime()
                const idx = hourIndices.get(compositeKey)

                if (idx !== undefined) {
                  allData[idx] = d.value ?? null
                }
              } else {
                // Fallback to calculated index when no timestamps
                const dayIdx = datesToUse.indexOf(dStr)
                if (dayIdx >= 0) {
                  const globalIdx = dayIdx * 24 + d.hour
                  if (globalIdx < allData.length) {
                    allData[globalIdx] = d.value ?? null
                  }
                }
              }
            })
          }
        })

        const color = getMeterColor(compteur.id, idx)
        datasets.push({
          label: `${compteur.name}`,
          data: allData,
          borderColor: color,
          backgroundColor: color,
          yAxisID: metric.yAxisPosition === 'left' ? 'y' : 'y1',
          metricType: metric.type,
          spanGaps: false, // Display gaps for null values instead of connecting across them
        })
      })

      const result = {
        labels: allLabels,
        datasets,
      }

      // Note: API now returns only completed hours, so no need to filter incomplete hours here

      console.log('chartData returning (hourly per-day):', {
        labelsLength: result.labels.length,
        datasetsLength: result.datasets.length,
        dateCount: datesToUse.length,
        sampleLabels: result.labels.slice(0, 5),
      })
      return result
    } else {
      // Daily: show one dataset per metric with data points for each selected date
      // Build one dataset per meter for selected metric with points across selected dates
      const metric = selectedMetric.value

      if (!metric) {
        console.warn('No metric selected in chartData')
        return { labels: [], datasets: [] }
      }

      // Sort dates chronologically for daily mode - YYYY-MM-DD format sorts correctly with localeCompare
      let datesToUse = [...selectedDates.value]
      datesToUse.sort((a, b) => a.localeCompare(b))

      // 🔍 DIAGNOSTIC: Show what dates are stored vs selected
      const allStoredDates = new Set<string>()
      for (const [_, records] of historicalData.value.entries()) {
        records.forEach(r => allStoredDates.add(r.date))
      }

      console.log('[Chart] Daily mode - DATE MISMATCH CHECK:', {
        selectedDates: datesToUse.slice(0, 5),
        storedDates: Array.from(allStoredDates).sort().slice(0, 5),
        selectedCount: datesToUse.length,
        storedCount: allStoredDates.size,
        firstSelectedDate: datesToUse[0],
        firstStoredDate: Array.from(allStoredDates).sort()[0],
      })

      // First pass: identify which dates have any data across all meters
      const datesWithData = new Set<string>()

      datesToUse.forEach((dateStr, dateIdx) => {
        const hasDataForThisDate = visibleCompteurs.value.some((compteur, meterIdx) => {
          const dayData = getMetricDataForDate(dateStr, metric.type, compteur.id)
          const hasData = dayData && dayData.hourlyData && dayData.hourlyData.length > 0
          return hasData
        })

        if (hasDataForThisDate) {
          datesWithData.add(dateStr)
        }
      })

      console.log('[Chart] Daily mode - Dates with data:', {
        totalSelected: datesToUse.length,
        withData: datesWithData.size,
        datesWithData: Array.from(datesWithData).sort(),
      })

      // ⚠️ IMPORTANT: Use ALL selected dates as labels to show gaps
      // Don't filter - show all dates and use null for missing data
      const datesToDisplay = datesToUse // Use ALL dates, not filtered

      // Build datasets only for dates that have data
      console.log('[Chart] Daily mode - Building datasets:', {
        visibleCompteurCount: visibleCompteurs.value.length,
        visibleCompteurs: visibleCompteurs.value.map(c => ({
          id: c.id,
          name: c.name,
          deviceUUID: (c as any).deviceUUID,
          hasDeviceUUID: !!(c as any).deviceUUID,
        })),
        storedDeviceUUIDs: Array.from(historicalData.value.keys()),
        datesToDisplay: datesToDisplay.length,
      })

      visibleCompteurs.value.forEach((compteur, idx) => {
        const dataPoints: (number | null)[] = []
        const sampleValues: any[] = []

        console.log(`[Chart] Daily - Processing compteur ${idx + 1}/${visibleCompteurs.value.length}: ${compteur.id}`)

        datesToDisplay.forEach(dateStr => {
          const dayData = getMetricDataForDate(dateStr, metric.type, compteur.id)

          if (!dayData || !dayData.hourlyData || dayData.hourlyData.length === 0) {
            dataPoints.push(null)
            sampleValues.push({ date: dateStr, value: null })
            return
          }

          const total = calculateFilteredTotal(dayData.hourlyData)
          dataPoints.push(total)
          sampleValues.push({ date: dateStr, value: total })
        })

        const color = getMeterColor(compteur.id, idx)
        const dataset = {
          label: `${compteur.name}`,
          data: dataPoints,
          borderColor: color,
          backgroundColor: color,
          yAxisID: metric.yAxisPosition === 'left' ? 'y' : 'y1',
          metricType: metric.type,
          spanGaps: false,
        }

        console.log(`[Chart Daily] Dataset for ${compteur.name}:`, {
          label: dataset.label,
          dataLength: dataPoints.length,
          nonNullCount: dataPoints.filter(v => v !== null).length,
          minValue: dataPoints.filter(v => v !== null).length > 0 ? Math.min(...dataPoints.filter(v => v !== null)) : null,
          maxValue: dataPoints.filter(v => v !== null).length > 0 ? Math.max(...dataPoints.filter(v => v !== null)) : null,
          allValues: dataPoints,
          sampleValues
        })

        datasets.push(dataset)
      })

      const result = {
        labels: datesToDisplay,
        datasets,
      }

      // Log exact data structure being returned
      console.log('chartData returning (daily) - FINAL RESULT:', {
        selectedDatesCount: datesToUse.length,
        displayedDatesCount: datesToDisplay.length,
        labelsLength: result.labels.length,
        datasetsLength: result.datasets.length,
        displayedLabels: result.labels,
        datasetsWithValues: result.datasets.map((d, idx) => ({
          index: idx,
          label: d.label,
          dataLength: d.data.length,
          data: d.data,
          nonNullCount: d.data.filter(v => v !== null).length,
          borderColor: d.borderColor,
          backgroundColor: d.backgroundColor,
          yAxisID: d.yAxisID
        }))
      })
      return result
    }
  })

  // ===========================
  // Computed - Metric Cards Data (per meter)
  // ===========================
  const metricCardsData = computed(() => {
    const metric = selectedMetric.value
    const dates = selectedDates.value
    const numDays = dates.length || 1

    return visibleCompteurs.value.map((compteur, idx) => {
      // Calculate sum across all selected dates
      let sumTotal = 0
      dates.forEach(dateStr => {
        const data = getMetricDataForDate(dateStr, metric.type, compteur.id)
        if (data && data.hourlyData) {
          const total = calculateFilteredTotal(data.hourlyData)
          sumTotal += total ?? 0 // Use 0 if total is null
        }
      })

      // Calculate average when multiple days selected
      const displayValue = numDays > 1 ? sumTotal / numDays : sumTotal
      const locale = i18n.global.locale.value
      const daysText = locale === 'en' ? 'days' : 'jours'
      const dateLabel = numDays === 1 ? dates[0] : `${numDays} ${daysText}`

      return {
        metricId: compteur.id,
        metricName: compteur.name,
        metricIcon: 'bolt',
        metricColor: getMeterColor(compteur.id, idx),
        unit: metric.unit,
        primaryValue: displayValue,
        primaryDate: dateLabel,
        peakValue: 0,
        averageValue: 0,
        difference: 0,
        percentageChange: 0,
      }
    })
  })

  // ===========================
  // Computed - Table Data
  // ===========================
  const tableData = computed(() => {
    if (effectiveResolution.value === 'hourly') {
      // Hourly table: use hours directly from sorted API response
      const metric = selectedMetric.value
      const dateStr = selectedDates.value[0]

      // Get first compteur's data to determine available hours (API already sorts them)
      const firstCompteur = visibleCompteurs.value[0]
      const firstData = firstCompteur ? getMetricDataForDate(dateStr, metric.type, firstCompteur.id) : null

      if (!firstData?.hourlyData || firstData.hourlyData.length === 0) {
        return [] // No data available
      }

      // Use hours directly from API response (already sorted)
      let hourlyRows = firstData.hourlyData.map(h => {
        const row: any = {
          hour: h.hour,
          time: `${h.hour.toString()}`,
        }

        // Add columns for each active meter with values from API
        visibleCompteurs.value.forEach(compteur => {
          const data = dateStr ? getMetricDataForDate(dateStr, metric.type, compteur.id) : null
          const hourData = data?.hourlyData.find(hd => hd.hour === h.hour)
          row[compteur.id] = hourData?.value ?? null // null when no data instead of 0
        })

        return row
      })

      // Filter out current incomplete hour (if viewing today)
      const today = new Date()
      const todayStr = TimeUtils.toLocalDateStr(today)
      if (dateStr === todayStr) {
        const currentHour = today.getHours()
        // Remove the current incomplete hour (don't show consumption until the hour ends)
        hourlyRows = hourlyRows.filter(row => row.hour < currentHour)
      }

      return hourlyRows
    } else {
      // Daily table: rows per date with actual data
      const metric = selectedMetric.value

      return selectedDates.value.map(dateStr => {
        const row: any = {
          date: dateStr,
          time: dateStr,
        }

        // Add columns for each active meter (daily totals) for the selected metric
        visibleCompteurs.value.forEach(compteur => {
          const data = getMetricDataForDate(dateStr, metric.type, compteur.id)
          // calculateFilteredTotal now returns null when no data exists
          const total = data ? calculateFilteredTotal(data.hourlyData) : null
          row[compteur.id] = total
        })

        return row
      })
    }
  })

  // ===========================
  // Actions - Metric Management
  // ===========================
  function toggleMetric(metricId: string) {
    const metric = availableMetrics.value.find(m => m.id === metricId)
    if (!metric) return
    const enable = !metric.enabled
    availableMetrics.value.forEach(m => (m.enabled = false))
    metric.enabled = enable
    // Ensure at least one stays enabled
    if (!availableMetrics.value.some(m => m.enabled)) {
      const fallback = availableMetrics.value.find(m => m.type === 'consumption')
      if (fallback) fallback.enabled = true
    }
  }

  function selectMetricType(type: MetricType) {
    const allowed: MetricType[] = ['energy', 'co2', 'cost', 'consumption']
    if (!allowed.includes(type)) return
    availableMetrics.value.forEach(m => (m.enabled = m.type === type))
  }

  function enableMetric(metricId: string) {
    const metric = availableMetrics.value.find(m => m.id === metricId)
    if (metric) metric.enabled = true
  }

  function disableMetric(metricId: string) {
    const metric = availableMetrics.value.find(m => m.id === metricId)
    if (metric) metric.enabled = false
  }

  // ===========================
  // Actions - Date Selection
  // ===========================
  function toggleDate(dateStr: string) {
    const index = selectedDates.value.indexOf(dateStr)
    if (index > -1) {
      // Prevent removing interior dates to avoid gaps
      if (selectedDates.value.length > 1) {
        const sorted = [...selectedDates.value].sort()
        const first = sorted[0]
        const last = sorted[sorted.length - 1]
        if (dateStr !== first && dateStr !== last) {
          return
        }
      }

      // Remove date if already selected (only edges allowed)
      selectedDates.value.splice(index, 1)
    } else {
      // Add date and fill gaps to create continuous range
      const newDates = [...selectedDates.value, dateStr]

      if (newDates.length === 1) {
        // First date selected
        selectedDates.value = newDates
      } else {
        // Sort dates to find min and max
        const sortedDates = newDates.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime())
        const minDate = sortedDates[0]
        const maxDate = sortedDates[sortedDates.length - 1]

        // Calculate continuous range
        const continuousRange = getDatesBetween(
          TimeUtils.toLocalDateStr(minDate),
          TimeUtils.toLocalDateStr(maxDate)
        )

        // Use continuous range (fills gaps automatically)
        selectedDates.value = continuousRange
      }
    }
    // Clear preset when manually selecting dates
    activePeriodPreset.value = null
  }

  function selectSingleDate(dateStr: string) {
    selectedDates.value = [dateStr]
  }

  function selectDateRange(startDate: string, endDate: string) {
    // Select dates between start and end (for drag-to-select)
    const dates = getDatesBetween(startDate, endDate)
    selectedDates.value = dates
  }

  function clearDates() {
    selectedDates.value = []
  }

  // ===========================
  // Actions - Calendar Navigation
  // ===========================
  function prevMonth() {
    currentMonth.value = new Date(
      currentMonth.value.getFullYear(),
      currentMonth.value.getMonth() - 1,
      1
    )
    // Clear preset indicator when manually navigating
    activePeriodPreset.value = null
  }

  function nextMonth() {
    currentMonth.value = new Date(
      currentMonth.value.getFullYear(),
      currentMonth.value.getMonth() + 1,
      1
    )
    // Clear preset indicator when manually navigating
    activePeriodPreset.value = null
  }

  function goToToday() {
    currentMonth.value = new Date()
    // Always select today's date
    selectSingleDate(TimeUtils.toLocalDateStr(new Date()))
    // Clear preset indicator
    activePeriodPreset.value = null
  }

  // ===========================
  // Actions - Period Presets
  // ===========================
  function selectLast7Days() {
    const today = new Date()
    console.log('[EnergyHistory Store] selectLast7Days called, today:', today.toISOString())
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(TimeUtils.toLocalDateStr(date))
    }
    selectedDates.value = dates
    activePeriodPreset.value = 'last7Days'
    console.log('[EnergyHistory Store] selectLast7Days set dates:', dates.length, 'first:', dates[0], 'last:', dates[dates.length - 1])
    // Navigate calendar to current month
    currentMonth.value = new Date(today)
  }

  function selectLast4Weeks() {
    const today = new Date()
    console.log('[EnergyHistory Store] selectLast4Weeks called, today:', today.toISOString())
    const dates: string[] = []
    // Generate all 28 dates for a full 4-week range to align with ComparisonView
    const start4w = new Date(today)
    start4w.setDate(start4w.getDate() - 27)
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(TimeUtils.toLocalDateStr(date))
    }
    selectedDates.value = dates
    activePeriodPreset.value = 'last4Weeks'
    console.log('[EnergyHistory Store] selectLast4Weeks set dates:', dates.length, 'first:', dates[0], 'last:', dates[dates.length - 1])
    // Navigate calendar to earliest selected month
    currentMonth.value = start4w
  }

  function selectLast3Months() {
    const today = new Date()
    console.log('[EnergyHistory Store] selectLast3Months called, today:', today.toISOString())
    const dates: string[] = []
    // Generate all ~90 dates for a full 3-month range (fixed loop like selectLast4Weeks)
    const start3m = new Date(today)
    start3m.setDate(start3m.getDate() - 89)
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(TimeUtils.toLocalDateStr(date))
    }
    selectedDates.value = dates
    activePeriodPreset.value = 'last3Months'
    console.log('[EnergyHistory Store] selectLast3Months set dates:', dates.length, 'first:', dates[0], 'last:', dates[dates.length - 1])
    // Navigate calendar to earliest selected month
    currentMonth.value = start3m
  }

  // ===========================
  // Actions - Time Range
  // ===========================
  function setTimeRange(from: number, to: number) {
    hourFrom.value = Math.max(0, Math.min(23, from))
    hourTo.value = Math.max(0, Math.min(23, to))
  }

  // ===========================
  // Actions - Data Fetching
  // ===========================
  async function fetchHistoricalData(query: HistoricalDataQuery) {
    loading.value = true
    error.value = null

    try {
      // Get the useEnergyHistory composable instance
      const energyHistory = useEnergyHistory()

      // ✅ MAP METER IDs TO ACTUAL THINGSBOARD DEVICE UUIDs
      const deviceUUIDs = query.compteurIds.map(meterId => {
        const compteur = selectedCompteurs.value.find(c => c.id === meterId)
        return compteur?.deviceUUID || meterId  // Use deviceUUID, fallback to ID if not available
      })

      // Build API query from our internal query format
      const apiQuery: EnergyHistoryQuery = {
        deviceUUIDs: deviceUUIDs,  // ✅ USE ACTUAL THINGSBOARD DEVICE UUIDs
        startDate: query.startDate.getTime(),
        endDate: query.endDate.getTime(),
        metricTypes: query.metricTypes as ('energy' | 'co2' | 'cost' | 'consumption')[],
        resolution: query.resolution === '1hour' || selectedDates.value.length === 1 ? 'hourly' : 'daily',
        hourFrom: query.hourRange?.from,
        hourTo: query.hourRange?.to,
      }

      console.log('[energyHistoryStore] ⏳ FETCH STARTING', {
        timestamp: new Date().toISOString(),
        deviceUUIDs: apiQuery.deviceUUIDs,
        startDate: new Date(apiQuery.startDate).toISOString(),
        endDate: new Date(apiQuery.endDate).toISOString(),
        metricTypes: apiQuery.metricTypes,
        resolution: apiQuery.resolution,
      })

      // Fetch from API
      console.log('[energyHistoryStore] 🔄 Calling energyHistory.fetchEnergyHistory...')
      const response: EnergyHistoryResponse = await energyHistory.fetchEnergyHistory(apiQuery, true)

      console.log('[energyHistoryStore] ✅ API response received:', {
        timestamp: new Date().toISOString(),
        success: response.success,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        deviceCount: response.meta?.deviceUUIDs?.length || 0,
        metrics: response.meta?.metricTypes || [],
        resolution: response.meta?.resolution,
      })

      // Log detailed structure of response data
      const dataStructure: any = {}
      if (response.data) {
        for (const deviceUUID of Object.keys(response.data)) {
          const deviceMetrics = response.data[deviceUUID]
          dataStructure[deviceUUID] = {}
          for (const metricType of Object.keys(deviceMetrics)) {
            const dataPoints = deviceMetrics[metricType]
            dataStructure[deviceUUID][metricType] = dataPoints?.length || 0
          }
        }
      }
      console.log('[energyHistoryStore] Response data structure:', dataStructure)

      // ✅ CLEAR OLD DATA BEFORE STORING NEW DATA
      historicalData.value.clear()
      console.log('[energyHistoryStore] 🗑️ Cleared old historical data')

      // ✅ SAFETY CHECK: Verify response.data is not empty
      const responseDataKeys = Object.keys(response.data)
      console.log('[energyHistoryStore] 🔍 Checking response.data before processing:', {
        hasData: response.data && responseDataKeys.length > 0,
        keyCount: responseDataKeys.length,
        keys: responseDataKeys,
      })

      if (!response.data || responseDataKeys.length === 0) {
        console.warn('[energyHistoryStore] ⚠️ WARNING: API returned empty response.data!')
        error.value = 'API returned empty data'
        return
      }

      console.log('[energyHistoryStore] ✅ Response.data validation PASSED, starting device iteration')

      // Transform API response to internal format
      let deviceProcessedCount = 0
      let metricsProcessedCount = 0
      let dataPointsProcessedCount = 0

      // Iterate through each device in the response
      for (const deviceUUID of responseDataKeys) {
        const deviceData = response.data[deviceUUID]
        console.log(`[energyHistoryStore] 📦 DEVICE ${deviceProcessedCount + 1}/${responseDataKeys.length}: ${deviceUUID}`, {
          metricsAvailable: Object.keys(deviceData),
          metricCount: Object.keys(deviceData).length,
        })

        let deviceMetricsCount = 0

        // Iterate through each metric for this device
        for (const metricType of Object.keys(deviceData) as MetricType[]) {
          const dataPoints = deviceData[metricType]
          console.log(`  └─ [METRIC] ${metricType}: ${dataPoints?.length || 0} points`)

          // ✅ SKIP IF NO DATA POINTS (empty array from API)
          if (!dataPoints || dataPoints.length === 0) {
            console.log(`     ⊘ Skipping empty metric: ${metricType}`)
            continue  // Skip to next metric/device
          }

          console.log(`     ✓ Processing ${dataPoints.length} data points for ${metricType}`, {
            firstTimestamp: dataPoints[0].timestamp,
            firstDate: dataPoints[0].date,
            firstValue: dataPoints[0].value,
            lastDate: dataPoints[dataPoints.length - 1].date,
            lastValue: dataPoints[dataPoints.length - 1].value,
          })

          deviceMetricsCount++
          metricsProcessedCount++

          // Convert DataPoint[] to HourlyDataPoint[] format
          const hourlyData: HourlyDataPoint[] = dataPoints.map((dp, index) => {
            const date = new Date(dp.timestamp)
            const hour = date.getHours()
            return {
              hour,
              value: dp.value,
              quality: dp.hasData ? 'good' : 'missing',
              timestamp: date,  // ✅ ADD TIMESTAMP FOR CHART DISPLAY
            }
          })

          // Group by date for storage
          const dateToPoints = new Map<string, HourlyDataPoint[]>()
          dataPoints.forEach((dp, index) => {
            const date = new Date(dp.timestamp)
            const dateStr = TimeUtils.toLocalDateStr(date) // ✅ Use consistent date formatting
            if (!dateToPoints.has(dateStr)) {
              dateToPoints.set(dateStr, [])
            }
            const hour = date.getHours()
            dateToPoints.get(dateStr)!.push({
              hour,
              value: dp.value,
              quality: dp.hasData ? 'good' : 'missing',
              timestamp: date,  // ✅ ADD TIMESTAMP FOR CHART DISPLAY
            })
          })

          console.log(`     ✓ Grouped into ${dateToPoints.size} dates:`, {
            dates: Array.from(dateToPoints.keys()).sort(),
            pointsPerDate: Array.from(dateToPoints.entries()).map(([d, pts]) => `${d}: ${pts.length}pt`),
          })

          // Create daily data records for storage
          let storedCount = 0
          dateToPoints.forEach((pointsForDate, dateStr) => {
            const totalValue = pointsForDate.reduce((sum, d) => sum + d.value, 0)
            const averageValue = totalValue / pointsForDate.length
            const peakData = pointsForDate.reduce((max, d) => d.value > max.value ? d : max)
            const minData = pointsForDate.reduce((min, d) => d.value < min.value ? d : min)

            const dailyData: DailyMetricData = {
              date: dateStr,
              metricId: `${deviceUUID}-${metricType}`,
              metricType,
              hourlyData: pointsForDate,
              totalValue,
              averageValue,
              peakValue: peakData.value,
              peakHour: peakData.hour,
              minValue: minData.value,
              minHour: minData.hour,
            }

            // Store by device UUID
            const existing = historicalData.value.get(deviceUUID) || []
            historicalData.value.set(deviceUUID, [...existing, dailyData])
            storedCount++
            dataPointsProcessedCount++
          })

          console.log(`     ✓ Stored ${storedCount} daily records to historicalData[${deviceUUID}]`)
        }

        deviceProcessedCount++
        console.log(`  ✓ Device ${deviceUUID} complete: ${deviceMetricsCount} metrics processed`)
      }

      console.log('[energyHistoryStore] ✨ DATA STORAGE COMPLETE:', {
        timestamp: new Date().toISOString(),
        devicesProcessed: deviceProcessedCount,
        metricsProcessed: metricsProcessedCount,
        dataPointsProcessed: dataPointsProcessedCount,
        deviceCountStored: historicalData.value.size,
        deviceUUIDs: Array.from(historicalData.value.keys()),
        totalRecords: Array.from(historicalData.value.values()).reduce((sum, arr) => sum + arr.length, 0),
        summary: Array.from(historicalData.value.entries()).map(([uuid, records]) => ({
          deviceUUID: uuid,
          recordCount: records.length,
          dates: [...new Set(records.map(r => r.date))].sort(),
          sampleDates: [...new Set(records.map(r => r.date))].sort().slice(0, 10),
        }))
      })

      console.log('[energyHistoryStore] 🎯 Current selectedDates:', {
        count: selectedDates.value.length,
        dates: selectedDates.value.slice(0, 10)
      })

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = `Failed to fetch historical data: ${message}`
      console.error('[energyHistoryStore] ❌ FETCH ERROR:', {
        timestamp: new Date().toISOString(),
        message,
        stack: err instanceof Error ? err.stack : undefined,
      })
    } finally {
      console.log('[energyHistoryStore] 🏁 FETCH COMPLETE', {
        timestamp: new Date().toISOString(),
        loading: false,
        historicalDataSize: historicalData.value.size,
        error: error.value,
      })
      loading.value = false
    }
  }

  /**
   * Process API response and populate `historicalData` in store
   * Mirrors the transformation in `fetchHistoricalData` but takes a response directly
   */
  function processAPIResponse(response: EnergyHistoryResponse) {
    // Clear previous data
    historicalData.value.clear()

    // Detect resolution from API response
    const apiResolution = response.meta?.resolution || 'hourly'
    console.log('[processAPIResponse] Starting with resolution:', apiResolution)
    console.log('[processAPIResponse] Response structure:', {
      dataKeys: Object.keys(response.data),
      dataCount: Object.keys(response.data).length,
      firstDeviceKey: Object.keys(response.data)[0],
      firstDeviceMetrics: Object.keys(response.data[Object.keys(response.data)[0]] || {}),
    })

    // Iterate through each device
    for (const deviceUUID of Object.keys(response.data)) {
      const deviceData = response.data[deviceUUID]
      console.log(`[processAPIResponse] Processing device: ${deviceUUID}`)

      // Iterate through each metric for this device
      for (const metricType of Object.keys(deviceData) as MetricType[]) {
        const dataPoints = deviceData[metricType]
        console.log(`[processAPIResponse] Device ${deviceUUID} metric ${metricType}: ${dataPoints?.length || 0} points`)

        // Skip empty arrays
        if (!dataPoints || dataPoints.length === 0) {
          console.warn(`[processAPIResponse] Skipping empty metric: ${metricType}`)
          continue
        }

        // Group by date
        const dateToPoints = new Map<string, HourlyDataPoint[]>()
        dataPoints.forEach((dp, idx) => {
          const dateObj = new Date(dp.timestamp)
          let dateStr: string
          let hour: number

          if (apiResolution === 'daily') {
            // Daily data: always convert timestamp to local date format (YYYY-MM-DD)
            dateStr = TimeUtils.toLocalDateStr(dateObj)
            hour = 12
          } else {
            // Hourly data: extract hour from timestamp
            dateStr = TimeUtils.toLocalDateStr(dateObj)
            hour = dateObj.getHours()
          }

          if (idx === 0) {
            console.log(`[processAPIResponse] First data point: dateStr=${dateStr}, hour=${hour}, value=${dp.value}`)
          }

          if (!dateToPoints.has(dateStr)) {
            dateToPoints.set(dateStr, [])
          }
          dateToPoints.get(dateStr)!.push({
            hour,
            value: dp.value,
            quality: dp.hasData ? 'good' : 'missing',
            timestamp: dateObj,
          })
        })

        console.log(`[processAPIResponse] ${metricType} grouped into ${dateToPoints.size} dates`)

        // Create daily records and store
        dateToPoints.forEach((pointsForDate, dateStr) => {
          const totalValue = pointsForDate.reduce((sum, d) => sum + d.value, 0)
          const averageValue = pointsForDate.length > 0 ? totalValue / pointsForDate.length : 0
          const peakData = pointsForDate.reduce((max, d) => (d.value > max.value ? d : max))
          const minData = pointsForDate.reduce((min, d) => (d.value < min.value ? d : min))

          const dailyData: DailyMetricData = {
            date: dateStr,
            metricId: `${deviceUUID}-${metricType}`,
            metricType,
            hourlyData: pointsForDate,
            totalValue,
            averageValue,
            peakValue: peakData.value,
            peakHour: peakData.hour,
            minValue: minData.value,
            minHour: minData.hour,
          }

          const existing = historicalData.value.get(deviceUUID) || []
          historicalData.value.set(deviceUUID, [...existing, dailyData])
        })
      }
    }

    console.log('[processAPIResponse] Final historicalData:', {
      size: historicalData.value.size,
      keys: Array.from(historicalData.value.keys()),
      entrySummary: Array.from(historicalData.value.entries()).map(([key, value]) => ({
        deviceUUID: key,
        datesCount: value.length,
        firstFewDates: value.slice(0, 3).map(d => ({ date: d.date, metricType: d.metricType }))
      }))
    })
  }

  async function refreshData() {
    // Check for required data
    if (selectedDates.value.length === 0) {
      console.warn('[energyHistoryStore] refreshData: No dates selected')
      return
    }

    // Filter to only enabled metrics
    const enabledMetricsOnly = enabledMetrics.value.filter(m => m.enabled)
    if (enabledMetricsOnly.length === 0) {
      console.warn('[energyHistoryStore] refreshData: No metrics enabled')
      return
    }

    // Ensure we have selected meters; if not, auto-select from available compteurs
    if (selectedCompteurs.value.length === 0 && dashboardStore.compteurs.length > 0) {
      console.log('[energyHistoryStore] Auto-selecting 8 meters for refreshData')
      const defaultIds = dashboardStore.compteurs.slice(0, 8).map(c => c.id)
      metersStore.setSelectedMeters(defaultIds)
    }

    if (selectedCompteurs.value.length === 0) {
      // No meters available; avoid calling API with empty selection
      console.warn('[energyHistoryStore] refreshData: No meters available')
      return
    }

    // Sort dates and convert to milliseconds
    const sortedDates = [...selectedDates.value].sort()

    // Start of first date (00:00:00)
    const startDateObj = new Date(sortedDates[0])
    startDateObj.setHours(0, 0, 0, 0)
    const startDate = startDateObj

    // End of last date (23:59:59)
    const endDateObj = new Date(sortedDates[sortedDates.length - 1])
    endDateObj.setHours(23, 59, 59, 999)
    const endDate = endDateObj

    console.log('[energyHistoryStore] refreshData executing with:', {
      selectedDateStrings: sortedDates,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startTimestamp: startDate.getTime(),
      endTimestamp: endDate.getTime(),
      meters: selectedCompteurs.value.map(c => c.id),
      meterCount: selectedCompteurs.value.length,
      metricTypes: enabledMetricTypes.value,
      resolution: effectiveResolution.value,
    })

    const query: HistoricalDataQuery = {
      compteurIds: selectedCompteurs.value.map(c => c.id),
      startDate,
      endDate,
      metricTypes: enabledMetricTypes.value,
      hourRange: { from: hourFrom.value, to: hourTo.value },
      resolution: effectiveResolution.value === 'hourly' ? '1hour' : 'daily',
    }

    await fetchHistoricalData(query)
  }

  // ===========================
  // Actions - Export
  // ===========================
  function exportToCSV() {
    const csv = generateCSV(tableData.value, enabledMetrics.value)
    downloadFile(csv, 'energy-history.csv', 'text/csv')
  }

  function exportToPDF() {
    // TODO: Implement PDF export
    console.log('PDF export not yet implemented')
  }

  // ===========================
  // Actions - Reset
  // ===========================
  function resetFilters() {
    selectedDates.value = []
    hourFrom.value = 0
    hourTo.value = 23
    photovoltaicEnabled.value = false

    // Reset to default metrics (only energy enabled)
    availableMetrics.value.forEach(m => {
      m.enabled = m.type === 'energy'
    })
  }

  // ===========================
  // Helpers
  // ===========================
  function formatDate(date: Date): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function hasDataForDate(dateStr: string): boolean {
    // Mark data available for the last 90 days (covers most use cases)
    const today = new Date()
    const date = new Date(dateStr)
    const diff = (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 90
  }

  function getMetricDataForDate(dateStr: string, metricType: MetricType, compteurIdOverride?: string): DailyMetricData | null {
    // Get data for specific date and metric type
    if (selectedCompteurs.value.length === 0) {
      console.warn('getMetricDataForDate: No selected compteurs')
      return null
    }

    const compteurId = compteurIdOverride || selectedCompteurs.value[0].id
    const compteur = selectedCompteurs.value.find(c => c.id === compteurId)
    const deviceUUID = compteur?.deviceUUID || compteurId

    // Try to find exact match in fetched data
    const compteurData = historicalData.value.get(deviceUUID) || []
    const found = compteurData.find(d => d.date === dateStr && d.metricType === metricType)

    // Debug logging for date matching
    if (!found && compteurData.length > 0) {
      const availableDates = compteurData.filter(d => d.metricType === metricType).map(d => d.date)
      console.log(`[getMetricDataForDate] ❌ No match for date="${dateStr}", metric="${metricType}", device="${deviceUUID.substring(0, 8)}"`, {
        requestedDate: dateStr,
        availableDates: availableDates.slice(0, 10),
        totalAvailable: availableDates.length
      })
    }

    return found || null
  }

  function filterDataByHourRange(hourlyData: HourlyDataPoint[]): HourlyDataPoint[] {
    return hourlyData.filter(d => d.hour >= hourFrom.value && d.hour <= hourTo.value)
  }

  function calculateFilteredTotal(hourlyData: HourlyDataPoint[]): number | null {
    // For daily resolution (hour=12, single entry), return total directly without filtering
    // The daily value is already a complete aggregate, not a per-hour breakdown
    if (hourlyData.length === 1 && hourlyData[0].hour === 12) {
      // This is daily resolution - return the single daily value
      return hourlyData[0].value
    }

    // For hourly resolution, filter by hour range and sum
    const filtered = filterDataByHourRange(hourlyData)
    if (filtered.length === 0) {
      return null // No data after filtering = gap
    }
    return filtered.reduce((sum, d) => sum + d.value, 0)
  }

  function getDatesBetween(start: string, end: string): string[] {
    const dates: string[] = []
    let startDate = new Date(start)
    let endDate = new Date(end)

    // Swap if needed
    if (startDate > endDate) {
      ;[startDate, endDate] = [endDate, startDate]
    }

    const current = new Date(startDate)
    while (current <= endDate) {
      dates.push(TimeUtils.toLocalDateStr(current))
      current.setDate(current.getDate() + 1)
    }

    return dates
  }

  function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // ===========================
  // Chart Data Generation
  // ===========================
  /**
   * Get meter color from centralized store
   * Ensures consistent colors across all views
   */
  function getMeterColor(meterId: string, fallbackIndex: number = 0): string {
    const meter = metersStore.getMeterById(meterId)
    if (meter) {
      return metersStore.getMeterColor(meterId)
    }

    // Fallback palette for unknown meters
    const FALLBACK_PALETTE = [
      '#8b5cf6', // violet-500
      '#06b6d4', // cyan-500
      '#f59e0b', // amber-500
      '#22c55e', // emerald-500
    ]
    return FALLBACK_PALETTE[fallbackIndex % FALLBACK_PALETTE.length]
  }

  function adjustColorBrightness(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, Math.min(255, (num >> 16) + amount))
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
  }

  function generateCSV(data: any[], metrics: MetricDefinition[]): string {
    const metric = selectedMetric.value
    const headers = ['Time', ...visibleCompteurs.value.map(c => `${c.name} [${metric.unit}]`)]
    const rows = [headers.join(',')]

    data.forEach(row => {
      const values = [row.time]
      visibleCompteurs.value.forEach(c => {
        const v = row[c.id]
        values.push(typeof v === 'number' ? v.toFixed(metric.decimalPlaces) : '0')
      })
      rows.push(values.join(','))
    })

    return rows.join('\n')
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  // Deterministic pseudo-random generator seeded by string
  function stringHash(seed: string): number {
    let h = 2166136261 >>> 0
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = Math.imul(h, 16777619) >>> 0
    }
    return h >>> 0
  }

  function lcg(seed: number) {
    let s = seed >>> 0
    return () => {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0
      return (s >>> 0) / 4294967296
    }
  }

  function deterministicNoise(key: string): number {
    const rand = lcg(stringHash(key))
    return rand()
  }

  function generateMockDailyData(dateStr: string, metricType: MetricType, compteurId: string): DailyMetricData {
    // ✅ TRY TO GET DATA FROM CENTRALIZED SOURCE FIRST
    const meterData = metersStore.getFullMeterData(compteurId)

    if (meterData && metricType === 'consumption') {
      // Use centralized hourly data for consumption metric
      const hourlyData: HourlyDataPoint[] = meterData.timeSeries.hourly.map((dataPoint, index) => ({
        hour: index,
        value: dataPoint.value,
        quality: (dataPoint.quality === 'fair' || dataPoint.quality === 'poor') ? 'estimated' : (dataPoint.quality as 'good' | 'estimated' | 'missing') || 'good'
      }))

      const totalValue = hourlyData.reduce((sum, d) => sum + d.value, 0)
      const averageValue = totalValue / hourlyData.length
      const peakData = hourlyData.reduce((max, d) => d.value > max.value ? d : max)
      const minData = hourlyData.reduce((min, d) => d.value < min.value ? d : min)

      return {
        date: dateStr,
        metricId: `${compteurId}-${metricType}`,
        metricType,
        hourlyData,
        totalValue,
        averageValue,
        peakValue: peakData.value,
        peakHour: peakData.hour,
        minValue: minData.value,
        minHour: minData.hour,
      }
    }

    // ✅ FALLBACK: Generate mock data for other metrics
    const hourlyData: HourlyDataPoint[] = []

    for (let hour = 0; hour < 24; hour++) {
      let value = 0
      const baseKey = `${compteurId}|${metricType}|${dateStr}|${hour}`
      const base = deterministicNoise(baseKey)
      const dailyCycle = Math.sin((hour / 24) * Math.PI * 2)
      const cyclePos = (dailyCycle + 1) / 2 // 0..1

      switch (metricType) {
        case 'energy':
          // 40..110 kWh, peaking mid-day, deterministic noise
          value = 40 + cyclePos * 70 + base * 5
          break

        case 'consumption':
          // 30..95 kWh, similar to energy but slightly lower
          value = 30 + cyclePos * 65 + base * 4
          break
        case 'temperature':
          // 18..26 °C, peaks in afternoon
          value = 18 + cyclePos * 8 + base * 0.4
          break
        default:
          // Stable deterministic 0..100 baseline for other metrics
          value = base * 100
      }

      hourlyData.push({ hour, value, quality: 'good' })
    }

    const totalValue = hourlyData.reduce((sum, d) => sum + d.value, 0)
    const averageValue = totalValue / hourlyData.length
    const peakData = hourlyData.reduce((max, d) => d.value > max.value ? d : max)
    const minData = hourlyData.reduce((min, d) => d.value < min.value ? d : min)

    return {
      date: dateStr,
      metricId: `${compteurId}-${metricType}`,
      metricType,
      hourlyData,
      totalValue,
      averageValue,
      peakValue: peakData.value,
      peakHour: peakData.hour,
      minValue: minData.value,
      minHour: minData.hour,
    }
  }

  function generateMockHistoricalData(query: HistoricalDataQuery): DailyMetricData[] {
    const data: DailyMetricData[] = []

    const current = new Date(query.startDate)
    const end = new Date(query.endDate)

    while (current <= end) {
      const dateStr = TimeUtils.toLocalDateStr(current)

      query.compteurIds.forEach(compteurId => {
        query.metricTypes.forEach(metricType => {
          data.push(generateMockDailyData(dateStr, metricType, compteurId))
        })
      })

      current.setDate(current.getDate() + 1)
    }

    return data
  }

  return {
    // State
    availableMetrics,
    selectedDates,
    currentMonth,
    activePeriodPreset,
    hourFrom,
    hourTo,
    loading,
    error,
    photovoltaicEnabled,
    photovoltaicPercentage,
    resolution,
    historicalData,

    // Computed
    enabledMetrics,
    enabledMetricTypes,
    selectedMetric,
    effectiveResolution,
    resolutionLabel,
    selectedCompteurs,
    visibleCompteurs,
    activeCompteurIds,
    primaryDate,
    calendarDays,
    chartData,
    metricCardsData,
    tableData,

    // Actions - Metrics
    toggleMetric,
    selectMetricType,
    enableMetric,
    disableMetric,

    // Actions - Compteurs
    toggleCompteurActive,
    enableAllCompteurs,

    // Actions - Dates
    toggleDate,
    selectSingleDate,
    selectDateRange,
    clearDates,

    // Actions - Calendar
    prevMonth,
    nextMonth,
    goToToday,
    selectLast7Days,
    selectLast4Weeks,
    selectLast3Months,

    // Actions - Time Range
    setTimeRange,

    // Actions - Data
    fetchHistoricalData,
    processAPIResponse,
    refreshData,

    // Actions - Export
    exportToCSV,
    exportToPDF,

    // Actions - Reset
    resetFilters,

    // Helpers
    formatDate,
  }
})
