/**
 * Telemetry Configuration
 *
 * Centralized configuration for all telemetry data fetching.
 * Change keys, aggregations, intervals, and time ranges here to affect entire dashboard.
 */

export type AggregationType = 'AVG' | 'MIN' | 'MAX' | 'SUM' | 'COUNT' | 'NONE'

export interface TelemetryKeyConfig {
  key: string
  label: string
  unit: string
  decimals: number
  aggregation: AggregationType
  description: string
}

export interface TelemetryFetchConfig {
  keys: string[]
  startTs?: number
  endTs?: number
  interval?: number
  agg?: AggregationType
  limit?: number
  orderBy?: 'ASC' | 'DESC'
  calculateDifferential?: boolean  // NEW: Server-side differential calculation
  period?: 'today' | 'yesterday' | '7days' | '30days'  // NEW: Period context
}

export interface WidgetDataConfig {
  instantaneous: TelemetryKeyConfig
  daily: TelemetryKeyConfig
  yesterday: TelemetryKeyConfig
  instantaneousReadings: {
    keys: string[]
    interval: number // milliseconds
    timeRange: number // milliseconds
    agg: AggregationType
  }
  dailyReadings: {
    keys: string[]
    interval: number
    agg: AggregationType
  }
}

/**
 * Predefined telemetry key configurations
 */
export const TELEMETRY_KEY_CONFIGS: Record<string, TelemetryKeyConfig> = {
  // Power & Energy
  ActivePowerTotal: {
    key: 'ActivePowerTotal',
    label: 'Active Power',
    unit: 'kW',
    decimals: 1,
    aggregation: 'AVG',
    description: 'Total active power across 3 phases'
  },
  AccumulatedActiveEnergyDelivered: {
    key: 'AccumulatedActiveEnergyDelivered',
    label: 'Cumulative Energy',
    unit: 'kWh',
    decimals: 2,
    aggregation: 'NONE',
    description: 'Total cumulative energy delivered'
  },

  // Delta Energy Keys
  deltaDayEnergyConsumtion: {
    key: 'deltaDayEnergyConsumtion',
    label: 'Daily Consumption',
    unit: 'kWh',
    decimals: 2,
    aggregation: 'SUM',
    description: 'Energy consumed since midnight'
  },
  deltaHourEnergyConsumtion: {
    key: 'deltaHourEnergyConsumtion',
    label: 'Hourly Consumption',
    unit: 'kWh',
    decimals: 2,
    aggregation: 'SUM',
    description: 'Energy consumed in last hour'
  },
  deltaHalfHourEnergyConsumtion: {
    key: 'deltaHalfHourEnergyConsumtion',
    label: 'Half-Hour Consumption',
    unit: 'kWh',
    decimals: 2,
    aggregation: 'SUM',
    description: 'Energy consumed in last 30 minutes'
  },
  deltaFiveMinutesEnergyConsumtion: {
    key: 'deltaFiveMinutesEnergyConsumtion',
    label: '5-Min Consumption',
    unit: 'kWh',
    decimals: 3,
    aggregation: 'SUM',
    description: 'Energy consumed in last 5 minutes'
  },

  // Electrical Measurements
  Current_Avg: {
    key: 'Current_Avg',
    label: 'Average Current',
    unit: 'A',
    decimals: 1,
    aggregation: 'AVG',
    description: 'Average current across 3 phases'
  },
  VoltageL_L_Avg: {
    key: 'VoltageL_L_Avg',
    label: 'Line-to-Line Voltage',
    unit: 'V',
    decimals: 1,
    aggregation: 'AVG',
    description: 'Average line-to-line voltage'
  },
  VoltageL_N_Avg: {
    key: 'VoltageL_N_Avg',
    label: 'Line-to-Neutral Voltage',
    unit: 'V',
    decimals: 1,
    aggregation: 'AVG',
    description: 'Average line-to-neutral voltage'
  },
  Frequency: {
    key: 'Frequency',
    label: 'Frequency',
    unit: 'Hz',
    decimals: 2,
    aggregation: 'AVG',
    description: 'Grid frequency'
  },
  PowerFactor: {
    key: 'PowerFactor',
    label: 'Power Factor',
    unit: '',
    decimals: 3,
    aggregation: 'AVG',
    description: 'Power factor (cos φ)'
  },

  // Temperature
  temperature: {
    key: 'temperature',
    label: 'Temperature',
    unit: '°C',
    decimals: 1,
    aggregation: 'AVG',
    description: 'Ambient temperature'
  }
}

/**
 * Default widget data configuration
 * Change these to modify what data widgets display
 */
export const DEFAULT_WIDGET_CONFIG: WidgetDataConfig = {
  // Instantaneous power display
  instantaneous: TELEMETRY_KEY_CONFIGS.ActivePowerTotal,

  // Daily energy consumption
  daily: TELEMETRY_KEY_CONFIGS.deltaDayEnergyConsumtion,

  // Yesterday's energy consumption
  yesterday: {
    key: 'deltaDayEnergyConsumtion',
    label: 'Yesterday Consumption',
    unit: 'kWh',
    decimals: 2,
    aggregation: 'SUM',
    description: 'Energy consumed yesterday'
  },

  // Mini-chart for instantaneous readings (last hour, 5-min intervals)
  instantaneousReadings: {
    keys: ['ActivePowerTotal'],
    interval: 5 * 60 * 1000, // 5 minutes
    timeRange: 60 * 60 * 1000, // 1 hour
    agg: 'AVG'
  },

  // Daily hourly readings
  dailyReadings: {
    keys: ['deltaHourEnergyConsumtion'],
    interval: 60 * 60 * 1000, // 1 hour
    agg: 'SUM'
  }
}

/**
 * Chart configuration presets
 */
export interface ChartConfig {
  keys: string[]
  interval: number
  agg: AggregationType
  limit?: number
}

export const CHART_CONFIGS: Record<string, ChartConfig> = {
  // Real-time monitoring (last hour)
  realtime: {
    keys: ['ActivePowerTotal'],
    interval: 5 * 60 * 1000, // 5 minutes
    agg: 'AVG',
    limit: 12
  },

  // Today's consumption (hourly)
  today: {
    keys: ['deltaHourEnergyConsumtion'],
    interval: 60 * 60 * 1000, // 1 hour
    agg: 'SUM',
    limit: 24
  },

  // Yesterday's consumption (hourly)
  yesterday: {
    keys: ['deltaHourEnergyConsumtion'],
    interval: 60 * 60 * 1000, // 1 hour
    agg: 'SUM',
    limit: 24
  },

  // Last 7 days
  week: {
    keys: ['deltaDayEnergyConsumtion'],
    interval: 24 * 60 * 60 * 1000, // 1 day
    agg: 'SUM',
    limit: 7
  },

  // Last 30 days
  month: {
    keys: ['deltaDayEnergyConsumtion'],
    interval: 24 * 60 * 60 * 1000, // 1 day
    agg: 'SUM',
    limit: 30
  }
}

/**
 * Time interval constants
 */
export const TIME_INTERVALS = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  FIFTEEN_MINUTES: 15 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000
} as const

/**
 * Get time range for period
 */
export function getTimeRange(period: 'today' | 'yesterday' | '7days' | '30days'): { startTs: number; endTs: number } {
  const now = Date.now()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (period) {
    case 'today':
      return {
        startTs: today.getTime(),
        endTs: now
      }

    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        startTs: yesterday.getTime(),
        endTs: today.getTime()
      }

    case '7days':
      return {
        startTs: now - TIME_INTERVALS.ONE_WEEK,
        endTs: now
      }

    case '30days':
      return {
        startTs: now - TIME_INTERVALS.ONE_MONTH,
        endTs: now
      }
  }
}

/**
 * Get chart configuration for period
 */
export function getChartConfigForPeriod(period: 'today' | 'yesterday' | '7days' | '30days', mode: 'energy' | 'temperature'): ChartConfig & { startTs: number; endTs: number } {
  const { startTs, endTs } = getTimeRange(period)

  if (mode === 'temperature') {
    return {
      keys: ['temperature'],
      interval: period === 'today' || period === 'yesterday' ? TIME_INTERVALS.FIVE_MINUTES : TIME_INTERVALS.ONE_HOUR,
      agg: 'AVG',
      startTs,
      endTs,
      limit: 100
    }
  }

  // Energy mode
  switch (period) {
    case 'today':
      return {
        ...CHART_CONFIGS.today,
        startTs,
        endTs
      }

    case 'yesterday':
      return {
        ...CHART_CONFIGS.yesterday,
        startTs,
        endTs
      }

    case '7days':
      return {
        ...CHART_CONFIGS.week,
        startTs,
        endTs
      }

    case '30days':
      return {
        ...CHART_CONFIGS.month,
        startTs,
        endTs
      }
  }
}

/**
 * Format value with proper decimals and unit
 */
export function formatTelemetryValue(value: number, keyConfig: TelemetryKeyConfig): string {
  return `${value.toFixed(keyConfig.decimals)}${keyConfig.unit ? ' ' + keyConfig.unit : ''}`
}

/**
 * Get key configuration by key name
 */
export function getKeyConfig(key: string): TelemetryKeyConfig {
  return TELEMETRY_KEY_CONFIGS[key] || {
    key,
    label: key,
    unit: '',
    decimals: 2,
    aggregation: 'AVG',
    description: ''
  }
}
