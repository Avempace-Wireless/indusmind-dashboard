import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
import i18n from '@/i18n'

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
  const activePeriodPreset = ref<'last7Days' | 'last30Days' | 'thisMonth' | 'lastMonth' | null>(null)

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
    // ✅ Requirement: show hourly when selected days < 8, else daily
    if (selectedDates.value.length < 8 && selectedDates.value.length > 0) {
      return 'hourly' as const
    }
    if (selectedDates.value.length >= 8) {
      return 'daily' as const
    }
    return resolution.value
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
    if (ids.length === 0) return list
    return list.filter(c => ids.includes(c.id))
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
      const dateStr = formatDate(date)
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
      const dateStr = formatDate(date)
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
      const dateStr = formatDate(date)
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
    console.log('📊 [chartData] Computed fired:', {
      selectedDatesCount: selectedDates.value.length,
      selectedDates: selectedDates.value,
      effectiveResolution: effectiveResolution.value,
      visibleCount: visibleCompteurs.value.length,
      historicalDataSize: historicalData.value.size,
      selectedMetricType: selectedMetric.value?.type,
    })

    const datasets: Array<{
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
      yAxisID: string
      metricType: MetricType
      date?: string
    }> = []

    if (effectiveResolution.value === 'hourly') {
      // Hourly: aggregate by hour across ALL selected dates (< 8)
      const metric = selectedMetric.value
      let dateStr = selectedDates.value[0]

      console.log('[Chart] ⏰ Entering HOURLY mode')

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

      // Sort dates chronologically - YYYY-MM-DD format sorts correctly with localeCompare
      datesToUse.sort((a, b) => a.localeCompare(b))
      console.log('[Chart] Hourly mode - Sorted dates:', datesToUse)

      if (datesToUse.length === 0) {
        console.log('[Chart] No dates for hourly display, returning empty')
        return { labels: [], datasets: [] }
      }

      console.log('[Chart] Hourly per-day display for dates (sorted):', datesToUse)

      // Build labels: for each date, append 24 hourly labels (e.g., "2025-01-24 00:00", "2025-01-24 01:00", ...)
      // Display ALL selected dates, even those with no data (they show as gaps)
      const allLabels: string[] = []

      datesToUse.forEach((dStr, dayIdx) => {
        for (let hour = 0; hour < 24; hour++) {
          allLabels.push(`${dStr} ${hour.toString().padStart(2, '0')}:00`)
        }
      })

      // Build datasets for each compteur
      visibleCompteurs.value.forEach((compteur, idx) => {
        // Initialize all slots as null (empty, not 0)
        const allData: (number | null)[] = new Array(datesToUse.length * 24).fill(null)

        datesToUse.forEach((dStr, dayIdx) => {
          const dayData = getMetricDataForDate(dStr, metric.type, compteur.id)

          // Even if dayData is null/empty, still create all 24 hour slots for this date
          // They remain null to show as gaps, not bars with 0
          if (dayData && dayData.hourlyData) {
            dayData.hourlyData.forEach(d => {
              const globalIdx = dayIdx * 24 + d.hour
              // Only set value where data exists; otherwise leave as null
              allData[globalIdx] = d.value ?? null
            })
          }
          // If no dayData, all 24 slots for this date stay null (gaps on chart)
        })

        const color = getMeterColor(compteur.id, idx)
        datasets.push({
          label: `${compteur.name}`,
          data: allData,
          borderColor: color,
          backgroundColor: hexToRgba(color, 0.1),
          yAxisID: metric.yAxisPosition === 'left' ? 'y' : 'y1',
          metricType: metric.type,
          spanGaps: false, // Display gaps for null values instead of connecting across them
        })
      })

      const result = {
        labels: allLabels,
        datasets,
      }
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
      console.log('[Chart] Daily mode - Sorted dates:', datesToUse)

      visibleCompteurs.value.forEach((compteur, idx) => {
        const dataPoints: (number | null)[] = []
        datesToUse.forEach(dateStr => {
          const dayData = getMetricDataForDate(dateStr, metric.type, compteur.id)
          // calculateFilteredTotal now returns null when no data exists
          const total = dayData && dayData.hourlyData ? calculateFilteredTotal(dayData.hourlyData) : null
          dataPoints.push(total)
        })
        const color = getMeterColor(compteur.id, idx)
        datasets.push({
          label: `${compteur.name}`,
          data: dataPoints,
          borderColor: color,
          backgroundColor: hexToRgba(color, 0.5),
          yAxisID: metric.yAxisPosition === 'left' ? 'y' : 'y1',
          metricType: metric.type,
          spanGaps: false, // Display gaps for null values instead of connecting across them
        })
      })

      const result = {
        labels: datesToUse,
        datasets,
      }
      console.log('chartData returning (daily):', { labelsLength: result.labels.length, datasetsLength: result.datasets.length, actualLabels: result.labels, sortedDates: datesToUse })
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
        sumTotal += data ? calculateFilteredTotal(data.hourlyData) : 0
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
      // Hourly table: rows per hour in range
      const hours = Array.from({ length: hourTo.value - hourFrom.value + 1 }, (_, i) => hourFrom.value + i)

      return hours.map(hour => {
        const row: any = {
          hour,
          time: `${hour.toString().padStart(2, '0')}:00`,
        }

        // Add columns for each active meter for the selected metric (first selected date)
        const metric = selectedMetric.value
        const dateStr = selectedDates.value[0]
        visibleCompteurs.value.forEach(compteur => {
          const data = dateStr ? getMetricDataForDate(dateStr, metric.type, compteur.id) : null
          const hourData = data?.hourlyData.find(h => h.hour === hour)
          row[compteur.id] = hourData?.value || 0
        })

        return row
      })
    } else {
      // Daily table: rows per date
      return selectedDates.value.map(dateStr => {
        const row: any = {
          date: dateStr,
          time: dateStr,
        }

        // Add columns for each active meter (daily totals) for the selected metric
        const metric = selectedMetric.value
        visibleCompteurs.value.forEach(compteur => {
          const data = getMetricDataForDate(dateStr, metric.type, compteur.id)
          const total = data ? calculateFilteredTotal(data.hourlyData) : 0
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
      selectedDates.value.splice(index, 1)
    } else {
      selectedDates.value.push(dateStr)
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
    selectSingleDate(formatDate(new Date()))
    // Clear preset indicator
    activePeriodPreset.value = null
  }

  // ===========================
  // Actions - Period Presets
  // ===========================
  function selectLast7Days() {
    const today = new Date()
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(formatDate(date))
    }
    selectedDates.value = dates
    activePeriodPreset.value = 'last7Days'
    // Navigate calendar to current month
    currentMonth.value = new Date(today)
  }

  function selectLast30Days() {
    const today = new Date()
    const dates: string[] = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(formatDate(date))
    }
    selectedDates.value = dates
    activePeriodPreset.value = 'last30Days'
    // Navigate calendar to current month (30 days might span 2 months)
    currentMonth.value = new Date(today)
  }

  function selectThisMonth() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const dates = getDatesBetween(formatDate(firstDay), formatDate(lastDay))
    selectedDates.value = dates
    activePeriodPreset.value = 'thisMonth'
    // Navigate calendar to current month
    currentMonth.value = new Date(today)
  }

  function selectLastMonth() {
    const today = new Date()
    const year = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear()
    const month = today.getMonth() === 0 ? 11 : today.getMonth() - 1
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const dates = getDatesBetween(formatDate(firstDay), formatDate(lastDay))
    selectedDates.value = dates
    activePeriodPreset.value = 'lastMonth'
    // Navigate calendar to LAST month (not current)
    currentMonth.value = new Date(year, month, 1)
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

      console.log('[energyHistoryStore] fetchHistoricalData calling API with:', {
        deviceUUIDs: apiQuery.deviceUUIDs,
        startDate: new Date(apiQuery.startDate),
        endDate: new Date(apiQuery.endDate),
        metricTypes: apiQuery.metricTypes,
        resolution: apiQuery.resolution,
      })

      // Fetch from API
      const response: EnergyHistoryResponse = await energyHistory.fetchEnergyHistory(apiQuery, true)

      console.log('[energyHistoryStore] API response received:', {
        success: response.success,
        deviceCount: response.meta.deviceUUIDs.length,
        metrics: response.meta.metricTypes,
        resolution: response.meta.resolution,
        rawResponseData: response.data,
      })

      // ✅ CLEAR OLD DATA BEFORE STORING NEW DATA
      historicalData.value.clear()
      console.log('[energyHistoryStore] Cleared old historical data')

      // Transform API response to internal format

      // Iterate through each device in the response
      for (const deviceUUID of Object.keys(response.data)) {
        const deviceData = response.data[deviceUUID]

        // Iterate through each metric for this device
        for (const metricType of Object.keys(deviceData) as MetricType[]) {
          const dataPoints = deviceData[metricType]

          // ✅ SKIP IF NO DATA POINTS (empty array from API)
          if (!dataPoints || dataPoints.length === 0) {
            console.log('[energyHistoryStore] Skipping empty data:', {
              deviceUUID,
              metricType,
              dataPointsLength: dataPoints?.length || 0,
            })
            continue  // Skip to next metric/device
          }

          console.log('[energyHistoryStore] Processing non-empty data:', {
            deviceUUID,
            metricType,
            dataPointsLength: dataPoints.length,
            firstDataPoint: dataPoints[0],
          })

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
            const dateStr = formatDate(date)
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

          // Create daily data records for storage
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

            // Store by device UUID (not compteur ID, but they should match)
            const existing = historicalData.value.get(deviceUUID) || []
            historicalData.value.set(deviceUUID, [...existing, dailyData])
          })
        }
      }

      console.log('[energyHistoryStore] Data stored:', {
        deviceCount: historicalData.value.size,
        deviceIds: Array.from(historicalData.value.keys()),
        sampleData: Array.from(historicalData.value.entries())[0] ? {
          device: Array.from(historicalData.value.entries())[0][0],
          recordCount: Array.from(historicalData.value.entries())[0][1].length,
          sample: Array.from(historicalData.value.entries())[0][1].slice(0, 2),
        } : null,
      })

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      error.value = `Failed to fetch historical data: ${message}`
      console.error('[energyHistoryStore] Fetch error:', err)
    } finally {
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

    // Iterate through each device
    for (const deviceUUID of Object.keys(response.data)) {
      const deviceData = response.data[deviceUUID]

      // Iterate through each metric for this device
      for (const metricType of Object.keys(deviceData) as MetricType[]) {
        const dataPoints = deviceData[metricType]

        // Skip empty arrays
        if (!dataPoints || dataPoints.length === 0) continue

        // Group by date
        const dateToPoints = new Map<string, HourlyDataPoint[]>()
        dataPoints.forEach(dp => {
          const dateObj = new Date(dp.timestamp)
          const dateStr = formatDate(dateObj)
          const hour = dateObj.getHours()
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

    // ✅ LOOKUP BY DEVICE UUID (API stores data by deviceUUID, not compteurId)
    const compteur = selectedCompteurs.value.find(c => c.id === compteurId)
    const deviceUUID = compteur?.deviceUUID || compteurId  // Use deviceUUID if available

    const compteurData = historicalData.value.get(deviceUUID) || []

    console.log('getMetricDataForDate: Looking up data', {
      compteurId,
      deviceUUID,
      dateStr,
      metricType,
      compteurDataLength: compteurData.length,
      availableKeys: Array.from(historicalData.value.keys()),
    })

    // Try to find exact match in fetched data
    const found = compteurData.find(d => d.date === dateStr && d.metricType === metricType)

    if (found) {
      console.log('getMetricDataForDate: Found real API data', {
        dateStr,
        metricType,
        compteurId,
        deviceUUID,
        hourlyCount: found.hourlyData.length,
        sampleValues: found.hourlyData.slice(0, 3).map(h => ({
          hour: h.hour,
          value: h.value,
          hasTimestamp: !!h.timestamp,
          timestamp: h.timestamp ? h.timestamp.toLocaleTimeString('fr-FR') : 'MISSING',
        })),
      })
      return found
    }

    // If no fetched data, return null (no mock data fallback)
    console.warn('getMetricDataForDate: No fetched data found for this date/metric - returning NULL', {
      dateStr,
      metricType,
      compteurId,
      deviceUUID,
      compteurDataLength: compteurData.length,
      availableDates: compteurData.slice(0, 3).map(d => d.date),
      availableMetrics: Array.from(new Set(compteurData.map(d => d.metricType))),
    })

    return null  // ✅ NO MOCK DATA - return null when no real data exists
  }

  function filterDataByHourRange(hourlyData: HourlyDataPoint[]): HourlyDataPoint[] {
    return hourlyData.filter(d => d.hour >= hourFrom.value && d.hour <= hourTo.value)
  }

  function calculateFilteredTotal(hourlyData: HourlyDataPoint[]): number | null {
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
      dates.push(formatDate(current))
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
        case 'co2':
          // 8..16 kg, proportional to energy
          value = 8 + cyclePos * 8 + base * 0.8
          break
        case 'cost':
          // 4..10 EUR, proportional to energy
          value = 4 + cyclePos * 6 + base * 0.5
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
      const dateStr = formatDate(current)

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
    selectLast30Days,
    selectThisMonth,
    selectLastMonth,

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
