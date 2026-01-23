/**
 * Widget Registry Configuration
 *
 * Declarative widget definitions for the dashboard.
 * Each widget specifies its data requirements, transformations, and rendering component.
 */

import type { WidgetRegistry } from '@/types/widgetRegistry'
import { TelemetryTransformers } from '@/utils/TelemetryTransformers'
import { TimeUtils } from '@/utils/TimeUtils'

// Import widget components (we'll use existing ones for now)
import CompteurWidget from '@/components/dashboard/CompteurWidget.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import ConsumptionChart from '@/components/dashboard/ConsumptionChart.vue'

/**
 * Meter Widget Registry
 * Defines different modes for meter monitoring widgets
 */
export const METER_WIDGET_REGISTRY: WidgetRegistry = {
  /**
   * Instantaneous Power Widget
   * Shows current power consumption with recent readings chart
   */
  'meter-instant-power': {
    id: 'meter-instant-power',
    type: 'composite',
    label: 'Puissance Instantanée',
    description: 'Affiche la puissance actuelle et l\'historique récent',
    component: CompteurWidget,
    category: 'power',
    requiresDevice: true,

    dataRequirements: [
      {
        id: 'currentPower',
        telemetryKeys: ['ActivePowerTotal'],
        timeRange: {
          type: 'relative',
          value: -24,
          unit: 'hours'
        },
        limit: 1,
        orderBy: 'DESC',
        transform: TelemetryTransformers.latestValue
      },
      {
        id: 'instantReadings',
        telemetryKeys: ['ActivePowerTotal'],
        timeRange: {
          type: 'relative',
          value: -1,
          unit: 'hours'
        },
        interval: TimeUtils.INTERVALS.MINUTE_5,
        aggregation: 'AVG',
        transform: TelemetryTransformers.instantTimeSeries
      }
    ],

    defaultProps: {
      mode: 'instantanée'
    }
  },

  /**
   * Today Energy Widget
   * Shows today's total energy consumption with hourly breakdown
   */
  'meter-today-energy': {
    id: 'meter-today-energy',
    type: 'composite',
    label: 'Énergie Aujourd\'hui',
    description: 'Consommation énergétique du jour avec répartition horaire',
    component: CompteurWidget,
    category: 'energy',
    requiresDevice: true,

    dataRequirements: [
      {
        id: 'todayEnergy',
        telemetryKeys: ['deltaDayEnergyConsumtion'],
        timeRange: {
          type: 'absolute',
          get startTs() { return TimeUtils.getTodayStart() },
          get endTs() { return TimeUtils.getTodayEnd() }
        },
        limit: 1,
        orderBy: 'DESC',
        transform: TelemetryTransformers.latestValue
      },
      {
        id: 'todayReadings',
        telemetryKeys: ['deltaHourEnergyConsumtion'],
        timeRange: {
          type: 'absolute',
          get startTs() { return TimeUtils.getTodayStart() },
          get endTs() { return TimeUtils.getTodayEnd() }
        },
        interval: TimeUtils.INTERVALS.HOUR_1,
        aggregation: 'SUM',
        transform: TelemetryTransformers.hourlyBreakdown
      }
    ],

    defaultProps: {
      mode: 'jour'
    }
  },

  /**
   * Yesterday Energy Widget
   * Shows yesterday's total energy consumption with hourly breakdown
   */
  'meter-yesterday-energy': {
    id: 'meter-yesterday-energy',
    type: 'composite',
    label: 'Énergie Hier',
    description: 'Consommation énergétique d\'hier avec répartition horaire',
    component: CompteurWidget,
    category: 'energy',
    requiresDevice: true,

    dataRequirements: [
      {
        id: 'yesterdayEnergy',
        telemetryKeys: ['deltaHourEnergyConsumtion'],
        timeRange: {
          type: 'absolute',
          get startTs() { return TimeUtils.getYesterdayStart() },
          get endTs() { return TimeUtils.getYesterdayEnd() }
        },
        aggregation: 'SUM',
        transform: (data) => TelemetryTransformers.sumValues(data)
      },
      {
        id: 'yesterdayReadings',
        telemetryKeys: ['deltaHourEnergyConsumtion'],
        timeRange: {
          type: 'absolute',
          get startTs() { return TimeUtils.getYesterdayStart() },
          get endTs() { return TimeUtils.getYesterdayEnd() }
        },
        interval: TimeUtils.INTERVALS.HOUR_1,
        aggregation: 'SUM',
        transform: TelemetryTransformers.hourlyBreakdown
      }
    ],

    defaultProps: {
      mode: 'hier'
    }
  },

  /**
   * Power Comparison Widget
   * Compares today vs yesterday power consumption
   */
  'meter-comparison': {
    id: 'meter-comparison',
    type: 'comparison',
    label: 'Comparaison Jour/Hier',
    description: 'Compare la consommation d\'aujourd\'hui avec celle d\'hier',
    component: ConsumptionChart,
    category: 'analysis',
    requiresDevice: true,

    dataRequirements: [
      {
        id: 'todayHourly',
        telemetryKeys: ['deltaHourEnergyConsumtion'],
        timeRange: {
          type: 'absolute',
          get startTs() { return TimeUtils.getTodayStart() },
          get endTs() { return TimeUtils.getTodayEnd() }
        },
        interval: TimeUtils.INTERVALS.HOUR_1,
        aggregation: 'SUM',
        transform: TelemetryTransformers.hourlyBreakdown
      },
      {
        id: 'yesterdayHourly',
        telemetryKeys: ['deltaHourEnergyConsumtion'],
        timeRange: {
          type: 'absolute',
          get startTs() { return TimeUtils.getYesterdayStart() },
          get endTs() { return TimeUtils.getYesterdayEnd() }
        },
        interval: TimeUtils.INTERVALS.HOUR_1,
        aggregation: 'SUM',
        transform: TelemetryTransformers.hourlyBreakdown
      }
    ]
  },

  /**
   * Simple KPI Card - Current Power
   */
  'kpi-current-power': {
    id: 'kpi-current-power',
    type: 'value',
    label: 'Puissance Actuelle',
    component: StatCard,
    category: 'power',
    requiresDevice: true,

    dataRequirements: [
      {
        id: 'value',
        telemetryKeys: ['ActivePowerTotal'],
        timeRange: {
          type: 'relative',
          value: -24,
          unit: 'hours'
        },
        limit: 1,
        orderBy: 'DESC',
        transform: TelemetryTransformers.latestValue
      }
    ],

    defaultProps: {
      unit: 'kW',
      decimals: 1,
      icon: 'bolt'
    }
  },

  /**
   * Simple KPI Card - Today Energy
   */
  'kpi-today-energy': {
    id: 'kpi-today-energy',
    type: 'value',
    label: 'Énergie Aujourd\'hui',
    component: StatCard,
    category: 'energy',
    requiresDevice: true,

    dataRequirements: [
      {
        id: 'value',
        telemetryKeys: ['deltaDayEnergyConsumtion'],
        timeRange: {
          type: 'absolute',
          get startTs() { return TimeUtils.getTodayStart() },
          get endTs() { return TimeUtils.getTodayEnd() }
        },
        limit: 1,
        orderBy: 'DESC',
        transform: TelemetryTransformers.latestValue
      }
    ],

    defaultProps: {
      unit: 'kWh',
      decimals: 2,
      icon: 'energy_savings_leaf'
    }
  },

  /**
   * Hourly Energy Chart
   */
  'chart-hourly-energy': {
    id: 'chart-hourly-energy',
    type: 'chart',
    label: 'Répartition Horaire',
    component: ConsumptionChart,
    category: 'energy',
    requiresDevice: true,

    dataRequirements: [
      {
        id: 'hourlyData',
        telemetryKeys: ['deltaHourEnergyConsumtion'],
        timeRange: {
          type: 'absolute',
          get startTs() { return TimeUtils.getTodayStart() },
          get endTs() { return TimeUtils.getTodayEnd() }
        },
        interval: TimeUtils.INTERVALS.HOUR_1,
        aggregation: 'SUM',
        transform: TelemetryTransformers.normalizedChartData
      }
    ],

    defaultProps: {
      unit: 'kWh',
      showLabels: true
    }
  },

  /**
   * Weekly Energy Trend
   */
  'chart-weekly-energy': {
    id: 'chart-weekly-energy',
    type: 'chart',
    label: 'Tendance Hebdomadaire',
    component: ConsumptionChart,
    category: 'energy',
    requiresDevice: true,

    dataRequirements: [
      {
        id: 'weeklyData',
        telemetryKeys: ['deltaDayEnergyConsumtion'],
        timeRange: {
          type: 'relative',
          value: -7,
          unit: 'days'
        },
        interval: TimeUtils.INTERVALS.DAY_1,
        aggregation: 'SUM',
        transform: TelemetryTransformers.dailyBreakdown
      }
    ],

    defaultProps: {
      unit: 'kWh',
      showLabels: true
    }
  },

  /**
   * Current Power KPI Card
   * Shows instantaneous power consumption as single metric
   */
  'kpi-active-power': {
    id: 'kpi-active-power',
    type: 'value',
    label: 'Puissance Actuelle',
    description: 'Puissance instantanée en kilowatts',
    component: StatCard,
    category: 'power',
    requiresDevice: true,

    dataRequirements: [
      {
        id: 'currentValue',
        telemetryKeys: ['ActivePowerTotal'],
        timeRange: {
          type: 'relative',
          value: -24,
          unit: 'hours'
        },
        limit: 1,
        orderBy: 'DESC',
        transform: TelemetryTransformers.latestValue
      },
      {
        id: 'previousValue',
        telemetryKeys: ['ActivePowerTotal'],
        timeRange: {
          type: 'relative',
          value: -48,
          unit: 'hours'
        },
        limit: 1,
        orderBy: 'DESC',
        transform: TelemetryTransformers.latestValue
      }
    ],

    defaultProps: {
      unit: 'kW',
      decimals: 2,
      showTrend: true
    }
  },

  /**
   * Energy Today KPI Card
   * Shows energy consumed today as single metric
   */
  'kpi-energy-today': {
    id: 'kpi-energy-today',
    type: 'value',
    label: 'Énergie Aujourd\'hui',
    description: 'Énergie consommée depuis minuit',
    component: StatCard,
    category: 'energy',
    requiresDevice: true,

    dataRequirements: [
      {
        id: 'currentValue',
        telemetryKeys: ['deltaDayEnergyConsumtion'],
        timeRange: {
          type: 'today'
        },
        limit: 1,
        orderBy: 'DESC',
        transform: TelemetryTransformers.latestValue
      },
      {
        id: 'previousValue',
        telemetryKeys: ['deltaDayEnergyConsumtion'],
        timeRange: {
          type: 'yesterday'
        },
        limit: 1,
        orderBy: 'DESC',
        transform: TelemetryTransformers.latestValue
      }
    ],

    defaultProps: {
      unit: 'kWh',
      decimals: 1,
      showTrend: true
    }
  },

  /**
   * Average Current KPI Card
   * Shows average electrical current
   */
  'kpi-average-current': {
    id: 'kpi-average-current',
    type: 'value',
    label: 'Courant Moyen',
    description: 'Courant électrique moyen',
    component: StatCard,
    category: 'electrical',
    requiresDevice: true,

    dataRequirements: [
      {
        id: 'currentValue',
        telemetryKeys: ['Current_Avg'],
        timeRange: {
          type: 'relative',
          value: -1,
          unit: 'hours'
        },
        aggregation: 'AVG',
        transform: TelemetryTransformers.latestValue
      }
    ],

    defaultProps: {
      unit: 'A',
      decimals: 2,
      showTrend: false
    }
  }
}

/**
 * Get widget configuration by ID
 */
export function getWidgetConfig(widgetId: string) {
  return METER_WIDGET_REGISTRY[widgetId] || null
}

/**
 * Get all widgets by category
 */
export function getWidgetsByCategory(category: string) {
  return Object.values(METER_WIDGET_REGISTRY).filter(
    widget => widget.category === category
  )
}

/**
 * Get all widgets by type
 */
export function getWidgetsByType(type: string) {
  return Object.values(METER_WIDGET_REGISTRY).filter(
    widget => widget.type === type
  )
}

/**
 * Get all available widget IDs
 */
export function getAllWidgetIds(): string[] {
  return Object.keys(METER_WIDGET_REGISTRY)
}

/**
 * Check if widget requires device context
 */
export function widgetRequiresDevice(widgetId: string): boolean {
  const config = getWidgetConfig(widgetId)
  return config?.requiresDevice || false
}

/**
 * Export default registry
 */
export default METER_WIDGET_REGISTRY
