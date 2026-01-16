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
} from '../types/metrics'
import { DEFAULT_METRICS as METRICS_CONFIG } from '../types/metrics'
import { useDashboardStore } from './useDashboardStore'
import { useMetersStore } from './useMetersStore'
import i18n from '../i18n'

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
    return enabledMetrics.value[0] || availableMetrics.value.find(m => m.type === 'consumption')!
  })

  // ===========================
  // Computed - Auto Resolution
  // ===========================
  const effectiveResolution = computed(() => {
    // Auto-switch: 1 date = hourly, multiple = daily
    if (selectedDates.value.length === 1) {
      return 'hourly' as const
    } else if (selectedDates.value.length > 1) {
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
    return dashboardStore.compteurs.filter(c =>
      metersStore.selectedMeterIds.includes(c.id)
    )
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
      // Hourly: show all hours in range with series per date per metric
      const hours = Array.from({ length: hourTo.value - hourFrom.value + 1 }, (_, i) => hourFrom.value + i)

      // Build series per active meter for the selected metric across the selected date (first selected date)
      const metric = selectedMetric.value
      const dateStr = selectedDates.value[0]
      visibleCompteurs.value.forEach((compteur, idx) => {
        const dayData = dateStr ? getMetricDataForDate(dateStr, metric.type, compteur.id) : null
        if (dayData) {
          const filteredData = filterDataByHourRange(dayData.hourlyData)
          const color = getMeterColor(compteur.id, idx)
          datasets.push({
            label: `${compteur.name}`,
            data: filteredData.map(d => d.value),
            borderColor: color,
            backgroundColor: hexToRgba(color, 0.1),
            yAxisID: metric.yAxisPosition === 'left' ? 'y' : 'y1',
            metricType: metric.type,
            date: dateStr,
          })
        }
      })

      return {
        labels: hours.map(h => `${h.toString().padStart(2, '0')}:00`),
        datasets,
      }
    } else {
      // Daily: show one dataset per metric with data points for each selected date
      // Build one dataset per meter for selected metric with points across selected dates
      const metric = selectedMetric.value
      visibleCompteurs.value.forEach((compteur, idx) => {
        const dataPoints: number[] = []
        selectedDates.value.forEach(dateStr => {
          const dayData = getMetricDataForDate(dateStr, metric.type, compteur.id)
          const total = dayData ? calculateFilteredTotal(dayData.hourlyData) : 0
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
        })
      })

      return {
        labels: selectedDates.value,
        datasets,
      }
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
      // TODO: Replace with actual API call
      // const response = await energyHistoryAPI.fetchData(query)

      // Mock data generation for now
      const mockData = generateMockHistoricalData(query)

      // Store data in cache (group by compteur ID from metricId)
      mockData.forEach(dailyData => {
        // Extract compteur ID from metricId (format: compteurId-metricType)
        const compteurId = dailyData.metricId.split('-')[0]
        const existing = historicalData.value.get(compteurId) || []
        historicalData.value.set(compteurId, [...existing, dailyData])
      })

    } catch (err) {
      error.value = 'Failed to fetch historical data'
      console.error('Fetch error:', err)
    } finally {
      loading.value = false
    }
  }

  async function refreshData() {
    if (selectedDates.value.length === 0 || enabledMetrics.value.length === 0) {
      return
    }

    const query: HistoricalDataQuery = {
      compteurIds: selectedCompteurs.value.map(c => c.id),
      startDate: new Date(selectedDates.value[0]),
      endDate: new Date(selectedDates.value[selectedDates.value.length - 1]),
      metricTypes: enabledMetricTypes.value,
      hourRange: { from: hourFrom.value, to: hourTo.value },
      resolution: '1hour',
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
    // For now, use first compteur's data
    if (selectedCompteurs.value.length === 0) return null

    const compteurId = compteurIdOverride || selectedCompteurs.value[0].id
    const compteurData = historicalData.value.get(compteurId) || []

    const found = compteurData.find(d => d.date === dateStr && d.metricType === metricType)
    if (found) return found

    // Generate mock data if not found
    return generateMockDailyData(dateStr, metricType, compteurId)
  }

  function filterDataByHourRange(hourlyData: HourlyDataPoint[]): HourlyDataPoint[] {
    return hourlyData.filter(d => d.hour >= hourFrom.value && d.hour <= hourTo.value)
  }

  function calculateFilteredTotal(hourlyData: HourlyDataPoint[]): number {
    const filtered = filterDataByHourRange(hourlyData)
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
