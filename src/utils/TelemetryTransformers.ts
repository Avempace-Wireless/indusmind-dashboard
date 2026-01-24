/**
 * TelemetryTransformers - Shared data transformation utilities
 *
 * Provides reusable transformation functions for converting raw telemetry data
 * into widget-specific formats. All transformations handle edge cases and use UTC.
 */

import type { TelemetryDataPoint, TimeSeriesPoint, TransformContext } from '@/types/widgetRegistry'
import { TimeUtils } from './TimeUtils'

export class TelemetryTransformers {
  /**
   * Extract latest value from telemetry data
   * Used for instant readings, current power, etc.
   */
  static latestValue(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): number {
    if (!data || data.length === 0) return 0

    // Data is typically already sorted DESC from API
    // But ensure we get the latest by timestamp
    const sorted = [...data].sort((a, b) => b.ts - a.ts)
    return sorted[0]?.value || 0
  }

  /**
   * Sum all values in the dataset
   * Used for total energy consumption, cumulative metrics
   */
  static sumValues(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): number {
    if (!data || data.length === 0) return 0
    return data.reduce((sum, point) => sum + (point.value || 0), 0)
  }

  /**
   * Calculate average of all values
   * Used for average power, mean temperature, etc.
   */
  static averageValue(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): number {
    if (!data || data.length === 0) return 0
    const sum = this.sumValues(data)
    return sum / data.length
  }

  /**
   * Find maximum value in dataset
   */
  static maxValue(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): number {
    if (!data || data.length === 0) return 0
    return Math.max(...data.map(d => d.value || 0))
  }

  /**
   * Find minimum value in dataset
   */
  static minValue(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): number {
    if (!data || data.length === 0) return 0
    return Math.min(...data.map(d => d.value || 0))
  }

  /**
   * Transform hourly readings into 24-hour breakdown
   * Returns array with hours, limiting to current hour if data is for today
   *
   * @param data Raw telemetry data points
   * @param context Transform context (automatically detects if data is today)
   * @returns Array of hourly data points
   */
  static hourlyBreakdown(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): TimeSeriesPoint[] {
    // Auto-detect if this is today's data by checking timestamps
    const now = TimeUtils.now()
    const todayStart = TimeUtils.getTodayStart()
    const currentHour = new Date(now).getHours() // Use local hours

    // Check if context explicitly sets isToday, or auto-detect from data timestamps
    let isToday = context?.isToday ?? false

    // Auto-detect: if we have data and all timestamps are from today
    if (!isToday && data && data.length > 0) {
      const allFromToday = data.every(point => point.ts >= todayStart && point.ts <= now)
      isToday = allFromToday
    }

    // For today's data, only show hours up to current hour
    // For past days, show all 24 hours
    const maxHour = isToday ? currentHour : 23

    if (!data || data.length === 0) {
      // Return empty hours up to maxHour
      return Array.from({ length: maxHour + 1 }, (_, hour) => ({
        timestamp: TimeUtils.createTodayHourTimestamp(hour),
        value: 0,
        label: `${hour}h`,
        hasData: false
      }))
    }

    // Group readings by hour (0-23) using LOCAL timezone
    const hourlyMap = new Map<number, { value: number; timestamp: number }>()

    data.forEach(reading => {
      const hour = new Date(reading.ts).getHours() // Use local hours instead of UTC
      const existing = hourlyMap.get(hour)

      if (existing) {
        // Sum values if multiple readings for same hour
        existing.value += reading.value || 0
      } else {
        hourlyMap.set(hour, {
          value: reading.value || 0,
          timestamp: reading.ts
        })
      }
    })

    // Create array with hours up to maxHour (current hour for today, 23 for past days)
    return Array.from({ length: maxHour + 1 }, (_, hour) => {
      const hourData = hourlyMap.get(hour)
      const timestamp = hourData?.timestamp || TimeUtils.createTodayHourTimestamp(hour)

      return {
        timestamp,
        value: hourData?.value || 0,
        label: `${hour}h`,
        hasData: hourlyMap.has(hour)
      }
    })
  }

  /**
   * Transform daily readings into monthly breakdown
   * Returns array with all days of the month, filling gaps with zero
   */
  static dailyBreakdown(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): TimeSeriesPoint[] {
    if (!data || data.length === 0) {
      const monthStart = TimeUtils.getMonthStart()
      const timestamps = TimeUtils.generateDailyTimestamps(monthStart)

      return timestamps.map(ts => ({
        timestamp: ts,
        value: 0,
        label: TimeUtils.formatDateLabel(ts),
        hasData: false
      }))
    }

    // Group readings by day
    const dailyMap = new Map<string, { value: number; timestamp: number }>()

    data.forEach(reading => {
      const dayKey = TimeUtils.formatDateLabel(reading.ts)
      const existing = dailyMap.get(dayKey)

      if (existing) {
        existing.value += reading.value || 0
      } else {
        dailyMap.set(dayKey, {
          value: reading.value || 0,
          timestamp: reading.ts
        })
      }
    })

    // Create full month array
    const monthStart = TimeUtils.getMonthStart()
    const timestamps = TimeUtils.generateDailyTimestamps(monthStart)

    return timestamps.map(ts => {
      const dayKey = TimeUtils.formatDateLabel(ts)
      const dayData = dailyMap.get(dayKey)

      return {
        timestamp: ts,
        value: dayData?.value || 0,
        label: TimeUtils.formatDateLabel(ts),
        hasData: dailyMap.has(dayKey)
      }
    })
  }

  /**
   * Transform instant readings into time series for line chart
   * Preserves all data points with their exact timestamps
   */
  static instantTimeSeries(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): TimeSeriesPoint[] {
    if (!data || data.length === 0) return []

    // Sort by timestamp ascending
    const sorted = [...data].sort((a, b) => a.ts - b.ts)

    return sorted.map(point => ({
      timestamp: point.ts,
      value: point.value || 0,
      label: TimeUtils.formatDateTimeLabel(point.ts),
      hasData: true
    }))
  }

  /**
   * Calculate percentage change between two values
   * Used for comparing today vs yesterday, current vs previous period
   */
  static percentageChange(
    current: number,
    previous: number
  ): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  /**
   * Transform data for comparison chart (e.g., today vs yesterday)
   * Returns paired data points aligned by hour/day
   */
  static comparisonBreakdown(
    currentData: TelemetryDataPoint[],
    previousData: TelemetryDataPoint[],
    context?: TransformContext
  ): Array<{
    timestamp: number
    current: number
    previous: number
    difference: number
    label: string
  }> {
    // Get hourly breakdowns for both datasets
    const currentHourly = this.hourlyBreakdown(currentData, context)
    const previousHourly = this.hourlyBreakdown(previousData, context)

    // Combine into comparison format
    return currentHourly.map((current, index) => {
      const previous = previousHourly[index]
      const difference = current.value - previous.value

      return {
        timestamp: current.timestamp,
        current: current.value,
        previous: previous.value,
        difference,
        label: current.label
      }
    })
  }

  /**
   * Calculate statistics for a dataset
   * Returns min, max, avg, sum, count
   */
  static calculateStats(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): {
    min: number
    max: number
    avg: number
    sum: number
    count: number
  } {
    if (!data || data.length === 0) {
      return { min: 0, max: 0, avg: 0, sum: 0, count: 0 }
    }

    return {
      min: this.minValue(data, context),
      max: this.maxValue(data, context),
      avg: this.averageValue(data, context),
      sum: this.sumValues(data, context),
      count: data.length
    }
  }

  /**
   * Format value with unit and decimals
   */
  static formatValue(
    value: number,
    unit: string = '',
    decimals: number = 1
  ): string {
    const formatted = value.toFixed(decimals)
    return unit ? `${formatted} ${unit}` : formatted
  }

  /**
   * Transform data for chart display with normalized heights
   * Used for bar charts where height needs to be 0-100%
   */
  static normalizedChartData(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): Array<{
    height: number
    value: number
    label: string
    timestamp: number
  }> {
    if (!data || data.length === 0) return []

    const hourly = this.hourlyBreakdown(data, context)

    // Calculate max from hours with data only (exclude zeros)
    const dataPoints = hourly.filter(h => h.hasData)
    const maxValue = dataPoints.length > 0
      ? Math.max(...dataPoints.map(d => d.value))
      : 1

    return hourly.map(point => ({
      height: point.hasData && maxValue > 0
        ? Math.max(5, (point.value / maxValue) * 100)
        : 0,
      value: point.value,
      label: point.label,
      timestamp: point.timestamp
    }))
  }

  /**
   * Group data by custom time interval
   * @param intervalMs Interval in milliseconds
   */
  static groupByInterval(
    data: TelemetryDataPoint[],
    intervalMs: number,
    aggregation: 'SUM' | 'AVG' | 'MAX' | 'MIN' = 'SUM'
  ): TimeSeriesPoint[] {
    if (!data || data.length === 0) return []

    // Sort by timestamp
    const sorted = [...data].sort((a, b) => a.ts - b.ts)

    // Group by interval
    const groups = new Map<number, number[]>()

    sorted.forEach(point => {
      const intervalKey = Math.floor(point.ts / intervalMs) * intervalMs
      const existing = groups.get(intervalKey) || []
      existing.push(point.value || 0)
      groups.set(intervalKey, existing)
    })

    // Aggregate each group
    const result: TimeSeriesPoint[] = []
    groups.forEach((values, timestamp) => {
      let aggregatedValue: number

      switch (aggregation) {
        case 'AVG':
          aggregatedValue = values.reduce((sum, v) => sum + v, 0) / values.length
          break
        case 'MAX':
          aggregatedValue = Math.max(...values)
          break
        case 'MIN':
          aggregatedValue = Math.min(...values)
          break
        case 'SUM':
        default:
          aggregatedValue = values.reduce((sum, v) => sum + v, 0)
      }

      result.push({
        timestamp,
        value: aggregatedValue,
        label: TimeUtils.formatDateTimeLabel(timestamp),
        hasData: true
      })
    })

    return result.sort((a, b) => a.timestamp - b.timestamp)
  }

  /**
   * Filter data by time range
   */
  static filterByTimeRange(
    data: TelemetryDataPoint[],
    startTs: number,
    endTs: number
  ): TelemetryDataPoint[] {
    if (!data || data.length === 0) return []
    return data.filter(point => point.ts >= startTs && point.ts <= endTs)
  }

  /**
   * Filter data to keep only today's data (UTC)
   */
  static filterToday(data: TelemetryDataPoint[]): TelemetryDataPoint[] {
    const todayStart = TimeUtils.getTodayStart()
    const todayEnd = TimeUtils.getTodayEnd()
    return this.filterByTimeRange(data, todayStart, todayEnd)
  }

  /**
   * Filter data to keep only yesterday's data (UTC)
   */
  static filterYesterday(data: TelemetryDataPoint[]): TelemetryDataPoint[] {
    const yesterdayStart = TimeUtils.getYesterdayStart()
    const yesterdayEnd = TimeUtils.getYesterdayEnd()
    return this.filterByTimeRange(data, yesterdayStart, yesterdayEnd)
  }

  /**
   * Detect and fill gaps in time series data
   * @param expectedIntervalMs Expected interval between points
   */
  static fillGaps(
    data: TelemetryDataPoint[],
    expectedIntervalMs: number,
    fillValue: number = 0
  ): TelemetryDataPoint[] {
    if (!data || data.length === 0) return []

    const sorted = [...data].sort((a, b) => a.ts - b.ts)
    const result: TelemetryDataPoint[] = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const current = sorted[i]
      const gap = current.ts - prev.ts

      // If gap is larger than expected interval, fill it
      if (gap > expectedIntervalMs * 1.5) {
        const numGaps = Math.floor(gap / expectedIntervalMs) - 1
        for (let j = 1; j <= numGaps; j++) {
          result.push({
            ts: prev.ts + (j * expectedIntervalMs),
            value: fillValue,
            key: current.key
          })
        }
      }

      result.push(current)
    }

    return result
  }

  /**
   * Calculate consumption for last 24 hours
   * Uses difference between end and start of period
   * From AccumulatedActiveEnergyDelivered key
   *
   * @param data Two-point boundary data (start and end of 24h period)
   * @returns Consumption value in kWh
   */
  static lastDayConsumption(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): number {
    if (!data || data.length < 2) return 0
    const sorted = [...data].sort((a, b) => a.ts - b.ts)
    const startValue = sorted[0].value
    const endValue = sorted[sorted.length - 1].value
    return Math.max(0, endValue - startValue)
  }

  /**
   * Calculate consumption for today (midnight to now)
   * Uses difference between end and start of today
   * From AccumulatedActiveEnergyDelivered key
   *
   * @param data Accumulated energy data for today
   * @returns Consumption value in kWh
   */
  static todayConsumption(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): number {
    if (!data || data.length < 1) return 0
    const sorted = [...data].sort((a, b) => a.ts - b.ts)

    // If only 1 point, return that value (energy since start of period)
    if (sorted.length === 1) {
      return Math.max(0, sorted[0].value)
    }

    // If multiple points, calculate difference
    const startValue = sorted[0].value
    const endValue = sorted[sorted.length - 1].value
    return Math.max(0, endValue - startValue)
  }

  /**
   * Calculate last month's total consumption
   * Uses difference between start and end of previous month
   * From AccumulatedActiveEnergyDelivered key
   *
   * @param data Accumulated energy data for last month period
   * @returns Consumption value in kWh
   */
  static lastMonthConsumption(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): number {
    if (!data || data.length < 1) return 0
    const sorted = [...data].sort((a, b) => a.ts - b.ts)

    if (sorted.length === 1) {
      return Math.max(0, sorted[0].value)
    }

    const startValue = sorted[0].value
    const endValue = sorted[sorted.length - 1].value
    return Math.max(0, endValue - startValue)
  }

  /**
   * Break down last 12 months into monthly consumption values
   * Each month shows total consumption for that month
   * Returns array suitable for chart display
   *
   * @param data Accumulated energy data for last 365 days
   * @returns Array of monthly consumption values and labels
   */
  static yearlyMonthlyBreakdown(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): TimeSeriesPoint[] {
    if (!data || data.length === 0) return []

    const sorted = [...data].sort((a, b) => a.ts - b.ts)
    const result: TimeSeriesPoint[] = []

    // Generate 12 monthly periods
    const now = Date.now()
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now)
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      monthEnd.setTime(monthEnd.getTime() - 1)

      // Find data points within this month
      const monthData = sorted.filter(
        d => d.ts >= monthStart.getTime() && d.ts <= monthEnd.getTime()
      )

      if (monthData.length >= 1) {
        let consumption = 0
        if (monthData.length >= 2) {
          consumption = monthData[monthData.length - 1].value - monthData[0].value
        } else if (monthData.length === 1) {
          consumption = monthData[0].value
        }

        result.push({
          timestamp: monthStart.getTime(),
          value: Math.max(0, consumption),
          label: monthStart.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit'
          })
        })
      } else {
        // No data for this month
        result.push({
          timestamp: monthStart.getTime(),
          value: 0,
          label: monthStart.toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit'
          }),
          hasData: false
        })
      }
    }

    return result
  }

  /**
   * Break down current month into daily consumption values
   * Each day shows total consumption for that day
   * Returns array suitable for chart display
   *
   * @param data Accumulated energy data for current month
   * @returns Array of daily consumption values and labels
   */
  static thisMonthDailyBreakdown(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): TimeSeriesPoint[] {
    if (!data || data.length === 0) return []

    const sorted = [...data].sort((a, b) => a.ts - b.ts)
    const result: TimeSeriesPoint[] = []

    // Get current month boundaries
    const now = new Date()
    const monthStart = new Date(now)
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    // Generate daily periods for current month
    const currentDay = new Date()
    const dayIterator = new Date(monthStart)

    while (dayIterator.getDate() <= currentDay.getDate() && dayIterator.getMonth() === monthStart.getMonth()) {
      const dayStart = new Date(dayIterator)
      dayStart.setHours(0, 0, 0, 0)

      const dayEnd = new Date(dayIterator)
      dayEnd.setDate(dayEnd.getDate() + 1)
      dayEnd.setHours(0, 0, 0, 0)
      dayEnd.setTime(dayEnd.getTime() - 1)

      // Find data points within this day
      const dayData = sorted.filter(
        d => d.ts >= dayStart.getTime() && d.ts <= dayEnd.getTime()
      )

      if (dayData.length >= 1) {
        let consumption = 0
        if (dayData.length >= 2) {
          consumption = dayData[dayData.length - 1].value - dayData[0].value
        } else if (dayData.length === 1) {
          consumption = dayData[0].value
        }

        result.push({
          timestamp: dayStart.getTime(),
          value: Math.max(0, consumption),
          label: `${dayStart.getDate()}`,
          hasData: dayData.length > 0
        })
      } else {
        result.push({
          timestamp: dayStart.getTime(),
          value: 0,
          label: `${dayStart.getDate()}`,
          hasData: false
        })
      }

      dayIterator.setDate(dayIterator.getDate() + 1)
    }

    return result
  }

  /**
   * Break down today into hourly consumption values
   * Each hour shows total consumption for that hour
   * Returns array suitable for chart display
   * Limits to current hour for today's data
   *
   * @param data Energy consumption data (deltaHourEnergyConsumtion or ActivePowerTotal)
   * @returns Array of hourly consumption values and labels
   */
  static todayHourlyBreakdown(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): TimeSeriesPoint[] {
    if (!data || data.length === 0) return []

    const result: TimeSeriesPoint[] = []
    const now = new Date()
    const currentHour = now.getHours()

    // Generate hourly periods for today (0h to current hour)
    for (let hour = 0; hour <= currentHour; hour++) {
      const hourStart = new Date()
      hourStart.setHours(hour, 0, 0, 0)

      const hourEnd = new Date()
      hourEnd.setHours(hour + 1, 0, 0, 0)

      // Find data points within this hour
      const hourData = data.filter(
        d => d.ts >= hourStart.getTime() && d.ts < hourEnd.getTime()
      )

      if (hourData.length > 0) {
        // Sum all values for this hour (deltaHourEnergyConsumtion is already per-hour)
        const consumption = hourData.reduce((sum, d) => sum + d.value, 0)

        result.push({
          timestamp: hourStart.getTime(),
          value: Math.max(0, consumption),
          label: `${hour}h`,
          hasData: true
        })
      } else {
        result.push({
          timestamp: hourStart.getTime(),
          value: 0,
          label: `${hour}h`,
          hasData: false
        })
      }
    }

    return result
  }

  /**
   * Calculate consumption for this month (from start to now)
   * Uses difference between latest and start of month value
   * From AccumulatedActiveEnergyDelivered key
   *
   * @param data Accumulated energy data for current month
   * @returns Consumption value in kWh
   */
  static thisMonthConsumption(
    data: TelemetryDataPoint[],
    context?: TransformContext
  ): number {
    if (!data || data.length < 1) return 0
    const sorted = [...data].sort((a, b) => a.ts - b.ts)

    if (sorted.length === 1) {
      return Math.max(0, sorted[0].value)
    }

    const startValue = sorted[0].value
    const endValue = sorted[sorted.length - 1].value
    return Math.max(0, endValue - startValue)
  }
}
