/**
 * Widget Registry Type Definitions
 *
 * Provides type-safe configuration for the declarative widget system.
 * Widgets are defined by their data requirements, transformations, and rendering components.
 */

import type { Component } from 'vue'

/**
 * Telemetry data point from ThingsBoard API
 */
export interface TelemetryDataPoint {
  ts: number  // Unix timestamp in milliseconds
  value: number
  key?: string
}

/**
 * Transformed time series point for charts
 */
export interface TimeSeriesPoint {
  timestamp: number
  value: number
  label: string
  hasData?: boolean
}

/**
 * Time range specification for telemetry queries
 */
export interface TimeRange {
  type: 'absolute' | 'relative'
  startTs?: number  // For absolute ranges
  endTs?: number
  value?: number    // For relative ranges (e.g., -24)
  unit?: 'hours' | 'days' | 'weeks'
}

/**
 * Aggregation types supported by ThingsBoard
 */
export type AggregationType = 'AVG' | 'SUM' | 'MAX' | 'MIN' | 'COUNT' | 'NONE'

/**
 * Transform function type - converts raw telemetry to widget-specific format
 */
export type TransformFunction<T = any> = (
  data: TelemetryDataPoint[],
  context?: Record<string, any>
) => T

/**
 * Data requirement specification for a widget
 * Declares what telemetry data the widget needs and how to fetch it
 */
export interface DataRequirement {
  /** Telemetry keys to fetch (e.g., ['ActivePowerTotal']) */
  telemetryKeys: string[]

  /** Time range for the query */
  timeRange: TimeRange

  /** Aggregation type (default: NONE for raw data) */
  aggregation?: AggregationType

  /** Interval for time-series aggregation in milliseconds */
  interval?: number

  /** Maximum number of data points to fetch */
  limit?: number

  /** Sort order (ASC or DESC) */
  orderBy?: 'ASC' | 'DESC'

  /** Transform function to apply to fetched data */
  transform?: TransformFunction

  /** Unique identifier for this data requirement */
  id: string
}

/**
 * Widget configuration metadata
 * Fully declarative specification of a widget's behavior
 */
export interface WidgetConfig {
  /** Unique widget identifier */
  id: string

  /** Widget type category */
  type: 'value' | 'chart' | 'table' | 'comparison' | 'composite'

  /** Display name for the widget */
  label: string

  /** Optional description */
  description?: string

  /** Vue component to render */
  component: Component

  /** Data requirements for this widget */
  dataRequirements: DataRequirement[]

  /** Default props to pass to the component */
  defaultProps?: Record<string, any>

  /** Whether widget supports real-time updates */
  realtime?: boolean

  /** Refresh interval in milliseconds (if realtime) */
  refreshInterval?: number

  /** Widget category for organization */
  category?: 'energy' | 'power' | 'cost' | 'alerts' | 'analysis'

  /** Icon identifier (optional) */
  icon?: string

  /** Whether widget requires device context */
  requiresDevice?: boolean

  /** Whether widget requires date range selection */
  requiresDateRange?: boolean
}

/**
 * Widget data fetch result
 * Contains fetched and transformed data for a specific widget
 */
export interface WidgetDataResult {
  /** Widget configuration ID */
  widgetId: string

  /** Device UUID this data belongs to */
  deviceUUID?: string

  /** Transformed data mapped by requirement ID */
  data: Record<string, any>

  /** Raw telemetry data (for debugging) */
  rawData?: Record<string, TelemetryDataPoint[]>

  /** Loading state */
  loading: boolean

  /** Error state */
  error?: Error

  /** Timestamp of last fetch */
  fetchedAt?: number

  /** Whether data is from cache */
  cached?: boolean
}

/**
 * Widget registry - maps widget IDs to configurations
 */
export type WidgetRegistry = Record<string, WidgetConfig>

/**
 * Context passed to transform functions
 */
export interface TransformContext {
  /** Device metadata */
  device?: {
    uuid: string
    name?: string
    type?: string
  }

  /** Time range context */
  timeRange?: {
    start: Date
    end: Date
    label?: string
  }

  /** Flag to indicate if data is for today (limits hours to current hour) */
  isToday?: boolean

  /** User preferences */
  preferences?: {
    locale?: string
    timezone?: string
    units?: 'metric' | 'imperial'
  }

  /** Additional context data */
  [key: string]: any
}

/**
 * Batch data fetch request
 */
export interface BatchDataRequest {
  /** Device UUID to fetch data for */
  deviceUUID: string

  /** Widget configurations to fetch data for */
  widgets: WidgetConfig[]

  /** Additional context */
  context?: TransformContext
}

/**
 * Batch data fetch result
 */
export interface BatchDataResult {
  /** Device UUID */
  deviceUUID: string

  /** Results mapped by widget ID */
  results: Record<string, WidgetDataResult>

  /** Overall loading state */
  loading: boolean

  /** Any errors encountered */
  errors: Record<string, Error>
}
