/**
 * TimeUtils - Centralized UTC timestamp handling
 *
 * All time operations use UTC to avoid timezone issues.
 * This utility provides consistent time range calculations, hour extraction, and formatting.
 */

import type { TimeRange } from '@/types/widgetRegistry'

export class TimeUtils {
  /**
   * Get current UTC timestamp in milliseconds
   */
  static now(): number {
    return Date.now()
  }

  /**
   * Extract UTC hour (0-23) from timestamp
   */
  static getUTCHour(timestamp: number): number {
    return new Date(timestamp).getUTCHours()
  }

  /**
   * Extract UTC day of month from timestamp
   */
  static getUTCDay(timestamp: number): number {
    return new Date(timestamp).getUTCDate()
  }

  /**
   * Extract UTC month (0-11) from timestamp
   */
  static getUTCMonth(timestamp: number): number {
    return new Date(timestamp).getUTCMonth()
  }

  /**
   * Extract UTC year from timestamp
   */
  static getUTCYear(timestamp: number): number {
    return new Date(timestamp).getUTCFullYear()
  }

  /**
   * Create UTC timestamp for specific hour of today
   * @param hour Hour (0-23)
   * @returns UTC timestamp
   */
  static createTodayHourTimestamp(hour: number): number {
    const date = new Date()
    date.setUTCHours(hour, 0, 0, 0)
    return date.getTime()
  }

  /**
   * Create UTC timestamp for specific date and hour
   */
  static createUTCTimestamp(year: number, month: number, day: number, hour = 0, minute = 0, second = 0): number {
    const date = new Date()
    date.setUTCFullYear(year)
    date.setUTCMonth(month)
    date.setUTCDate(day)
    date.setUTCHours(hour, minute, second, 0)
    return date.getTime()
  }

  /**
   * Get start of today (00:00:00 UTC)
   */
  static getTodayStart(): number {
    const now = new Date()
    now.setUTCHours(0, 0, 0, 0)
    return now.getTime()
  }

  /**
   * Get end of today (23:59:59.999 UTC)
   */
  static getTodayEnd(): number {
    const now = new Date()
    now.setUTCHours(23, 59, 59, 999)
    return now.getTime()
  }

  /**
   * Get start of yesterday (00:00:00 UTC)
   */
  static getYesterdayStart(): number {
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(0, 0, 0, 0)
    return yesterday.getTime()
  }

  /**
   * Get end of yesterday (23:59:59.999 UTC)
   */
  static getYesterdayEnd(): number {
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    yesterday.setUTCHours(23, 59, 59, 999)
    return yesterday.getTime()
  }

  /**
   * Get start of current week (Monday 00:00:00 UTC)
   */
  static getWeekStart(): number {
    const now = new Date()
    const day = now.getUTCDay()
    const diff = day === 0 ? 6 : day - 1 // Monday is first day
    const monday = new Date(now)
    monday.setUTCDate(now.getUTCDate() - diff)
    monday.setUTCHours(0, 0, 0, 0)
    return monday.getTime()
  }

  /**
   * Get start of current month (1st day, 00:00:00 UTC)
   */
  static getMonthStart(): number {
    const now = new Date()
    now.setUTCDate(1)
    now.setUTCHours(0, 0, 0, 0)
    return now.getTime()
  }

  /**
   * Get start of current year (Jan 1, 00:00:00 UTC)
   */
  static getYearStart(): number {
    const now = new Date()
    now.setUTCMonth(0, 1)
    now.setUTCHours(0, 0, 0, 0)
    return now.getTime()
  }

  /**
   * Add hours to a timestamp
   */
  static addHours(timestamp: number, hours: number): number {
    return timestamp + (hours * 60 * 60 * 1000)
  }

  /**
   * Add days to a timestamp
   */
  static addDays(timestamp: number, days: number): number {
    return timestamp + (days * 24 * 60 * 60 * 1000)
  }

  /**
   * Add weeks to a timestamp
   */
  static addWeeks(timestamp: number, weeks: number): number {
    return timestamp + (weeks * 7 * 24 * 60 * 60 * 1000)
  }

  /**
   * Convert relative time range to absolute timestamps
   * @param timeRange Time range specification
   * @returns { startTs, endTs }
   */
  static resolveTimeRange(timeRange: TimeRange): { startTs: number; endTs: number } {
    if (timeRange.type === 'absolute') {
      return {
        startTs: timeRange.startTs || 0,
        endTs: timeRange.endTs || this.now()
      }
    }

    // Relative time range
    const endTs = this.now()
    const value = timeRange.value || 0
    let startTs: number

    switch (timeRange.unit) {
      case 'hours':
        startTs = this.addHours(endTs, value)
        break
      case 'days':
        startTs = this.addDays(endTs, value)
        break
      case 'weeks':
        startTs = this.addWeeks(endTs, value)
        break
      default:
        startTs = this.addHours(endTs, value)
    }

    return { startTs, endTs }
  }

  /**
   * Format timestamp to hour label (e.g., "14h")
   */
  static formatHourLabel(timestamp: number): string {
    return `${this.getUTCHour(timestamp)}h`
  }

  /**
   * Format timestamp to date label (e.g., "23/01")
   */
  static formatDateLabel(timestamp: number): string {
    const date = new Date(timestamp)
    const day = date.getUTCDate().toString().padStart(2, '0')
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    return `${day}/${month}`
  }

  /**
   * Format timestamp to datetime label (e.g., "23/01 14h")
   */
  static formatDateTimeLabel(timestamp: number): string {
    const dateLabel = this.formatDateLabel(timestamp)
    const hour = this.getUTCHour(timestamp)
    return `${dateLabel} ${hour}h`
  }

  /**
   * Format timestamp to ISO string in UTC
   */
  static toISOString(timestamp: number): string {
    return new Date(timestamp).toISOString()
  }

  /**
   * Check if two timestamps are on the same UTC day
   */
  static isSameDay(ts1: number, ts2: number): boolean {
    const d1 = new Date(ts1)
    const d2 = new Date(ts2)
    return (
      d1.getUTCFullYear() === d2.getUTCFullYear() &&
      d1.getUTCMonth() === d2.getUTCMonth() &&
      d1.getUTCDate() === d2.getUTCDate()
    )
  }

  /**
   * Check if timestamp is today (UTC)
   */
  static isToday(timestamp: number): boolean {
    return this.isSameDay(timestamp, this.now())
  }

  /**
   * Check if timestamp is yesterday (UTC)
   */
  static isYesterday(timestamp: number): boolean {
    const yesterdayStart = this.getYesterdayStart()
    return this.isSameDay(timestamp, yesterdayStart)
  }

  /**
   * Get duration in milliseconds between two timestamps
   */
  static getDuration(startTs: number, endTs: number): number {
    return Math.abs(endTs - startTs)
  }

  /**
   * Get duration in hours
   */
  static getDurationHours(startTs: number, endTs: number): number {
    return this.getDuration(startTs, endTs) / (60 * 60 * 1000)
  }

  /**
   * Get duration in days
   */
  static getDurationDays(startTs: number, endTs: number): number {
    return this.getDuration(startTs, endTs) / (24 * 60 * 60 * 1000)
  }

  /**
   * Generate array of hourly timestamps for a given day
   * @param dayStart Start of day timestamp (00:00:00)
   * @returns Array of 24 timestamps (one per hour)
   */
  static generateHourlyTimestamps(dayStart: number): number[] {
    const date = new Date(dayStart)
    date.setUTCHours(0, 0, 0, 0)

    return Array.from({ length: 24 }, (_, hour) => {
      const ts = new Date(date)
      ts.setUTCHours(hour, 0, 0, 0)
      return ts.getTime()
    })
  }

  /**
   * Generate array of daily timestamps for a given month
   * @param monthStart Start of month timestamp
   * @returns Array of timestamps for each day
   */
  static generateDailyTimestamps(monthStart: number): number[] {
    const date = new Date(monthStart)
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

    return Array.from({ length: daysInMonth }, (_, day) => {
      return this.createUTCTimestamp(year, month, day + 1, 0, 0, 0)
    })
  }

  /**
   * Constants for common intervals (in milliseconds)
   */
  static readonly INTERVALS = {
    MINUTE_1: 60 * 1000,
    MINUTE_5: 5 * 60 * 1000,
    MINUTE_15: 15 * 60 * 1000,
    MINUTE_30: 30 * 60 * 1000,
    HOUR_1: 60 * 60 * 1000,
    HOUR_6: 6 * 60 * 60 * 1000,
    HOUR_12: 12 * 60 * 60 * 1000,
    DAY_1: 24 * 60 * 60 * 1000,
    WEEK_1: 7 * 24 * 60 * 60 * 1000,
    MONTH_30: 30 * 24 * 60 * 60 * 1000
  } as const

  /**
   * Format a timestamp or Date as a LOCAL date string (YYYY-MM-DD).
   * Uses getFullYear/getMonth/getDate (local timezone) instead of
   * toISOString().split('T')[0] (UTC) to avoid off-by-one day errors
   * when the local timezone is ahead of UTC (e.g. UTC+1).
   */
  static toLocalDateStr(input: number | Date): string {
    const d = input instanceof Date ? input : new Date(input)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }
}
