// Energy History - Multi-Metric Framework Types

export type MetricType =
  | 'energy'
  | 'co2'
  | 'cost'
  | 'consumption'
  | 'photovoltaic'
  | 'peak_cost'
  | 'billing'
  | 'savings'
  | 'water'
  | 'gas'
  | 'efficiency'
  | 'utilization'
  | 'yield'
  | 'availability'
  | 'temperature'
  | 'pressure'
  | 'flow_rate'
  | 'power_usage_effectiveness'
  | 'occupancy'
  | 'hvac_efficiency'
  | 'custom'

export type MetricUnit =
  | 'kWh'
  | 'MWh'
  | 'kg'
  | 't'
  | 'EUR'
  | 'USD'
  | 'm³'
  | 'L'
  | '%'
  | 'W'
  | 'kW'
  | 'MW'
  | '°C'
  | 'bar'
  | 'm³/h'
  | 'ratio'
  | 'persons'
  | 'custom'

export interface MetricDefinition {
  id: string
  type: MetricType
  name: string
  unit: MetricUnit
  color: string
  icon: string
  description: string
  yAxisPosition: 'left' | 'right'
  decimalPlaces: number
  enabled: boolean
  category: 'energy' | 'environmental' | 'financial' | 'operational' | 'custom'
}

export interface HourlyDataPoint {
  hour: number // 0-23
  value: number
  timestamp?: Date
  quality?: 'good' | 'estimated' | 'missing'
}

export interface DailyMetricData {
  date: string // YYYY-MM-DD
  metricId: string
  metricType: MetricType
  hourlyData: HourlyDataPoint[]
  totalValue: number
  averageValue: number
  peakValue: number
  peakHour: number
  minValue: number
  minHour: number
}

export interface CompteurMetricData {
  compteId: string
  compteurName: string
  dailyData: DailyMetricData[]
}

export interface HistoricalDataQuery {
  compteurIds: string[]
  startDate: Date
  endDate: Date
  metricTypes: MetricType[]
  hourRange?: { from: number; to: number } // 0-23
  resolution: '15min' | '1hour' | 'daily'
  includeEstimated?: boolean
}

export interface MetricComparison {
  primaryDate: string
  secondaryDate?: string
  metricId: string
  primaryTotal: number
  secondaryTotal?: number
  difference?: number
  percentageChange?: number
  hourlyComparison: Array<{
    hour: number
    primaryValue: number
    secondaryValue?: number
    difference?: number
  }>
}

export interface ChartDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  yAxisID: string
  fill: boolean
  tension: number
  pointRadius: number
  pointHoverRadius: number
  borderWidth: number
}

// Predefined metric configurations
export const DEFAULT_METRICS: Record<MetricType, Omit<MetricDefinition, 'id' | 'enabled'>> = {
  energy: {
    type: 'energy',
    name: 'Énergie',
    unit: 'kWh',
    color: '#3b82f6', // blue-500
    icon: 'bolt',
    description: 'Consommation énergétique totale',
    yAxisPosition: 'left',
    decimalPlaces: 2,
    category: 'energy',
  },
  co2: {
    type: 'co2',
    name: 'CO₂',
    unit: 'kg',
    color: '#10b981', // green-500
    icon: 'eco',
    description: 'Émissions de dioxyde de carbone',
    yAxisPosition: 'right',
    decimalPlaces: 2,
    category: 'environmental',
  },
  cost: {
    type: 'cost',
    name: 'Coût',
    unit: 'EUR',
    color: '#f59e0b', // amber-500
    icon: 'euro',
    description: 'Coût énergétique total',
    yAxisPosition: 'right',
    decimalPlaces: 2,
    category: 'financial',
  },
  consumption: {
    type: 'consumption',
    name: 'Consommation',
    unit: 'kWh',
    color: '#8b5cf6', // violet-500
    icon: 'trending_up',
    description: 'Taux de consommation',
    yAxisPosition: 'left',
    decimalPlaces: 2,
    category: 'energy',
  },
  photovoltaic: {
    type: 'photovoltaic',
    name: 'Photovoltaïque',
    unit: 'kWh',
    color: '#facc15', // yellow-400
    icon: 'solar_power',
    description: 'Production solaire photovoltaïque',
    yAxisPosition: 'left',
    decimalPlaces: 2,
    category: 'energy',
  },
  peak_cost: {
    type: 'peak_cost',
    name: 'Coût Pic',
    unit: 'EUR',
    color: '#ef4444', // red-500
    icon: 'show_chart',
    description: 'Coût pendant les heures de pointe',
    yAxisPosition: 'right',
    decimalPlaces: 2,
    category: 'financial',
  },
  billing: {
    type: 'billing',
    name: 'Facture',
    unit: 'EUR',
    color: '#06b6d4', // cyan-500
    icon: 'receipt_long',
    description: 'Facturation périodique',
    yAxisPosition: 'right',
    decimalPlaces: 2,
    category: 'financial',
  },
  savings: {
    type: 'savings',
    name: 'Économies',
    unit: 'EUR',
    color: '#84cc16', // lime-500
    icon: 'savings',
    description: 'Économies réalisées',
    yAxisPosition: 'right',
    decimalPlaces: 2,
    category: 'financial',
  },
  water: {
    type: 'water',
    name: 'Eau',
    unit: 'm³',
    color: '#0ea5e9', // sky-500
    icon: 'water_drop',
    description: 'Consommation d\'eau',
    yAxisPosition: 'left',
    decimalPlaces: 2,
    category: 'operational',
  },
  gas: {
    type: 'gas',
    name: 'Gaz',
    unit: 'm³',
    color: '#f97316', // orange-500
    icon: 'local_fire_department',
    description: 'Consommation de gaz',
    yAxisPosition: 'left',
    decimalPlaces: 2,
    category: 'energy',
  },
  efficiency: {
    type: 'efficiency',
    name: 'Efficacité',
    unit: '%',
    color: '#14b8a6', // teal-500
    icon: 'speed',
    description: 'Rendement opérationnel',
    yAxisPosition: 'right',
    decimalPlaces: 1,
    category: 'operational',
  },
  utilization: {
    type: 'utilization',
    name: 'Utilisation',
    unit: '%',
    color: '#8b5cf6', // violet-500
    icon: 'analytics',
    description: 'Taux d\'utilisation des capacités',
    yAxisPosition: 'right',
    decimalPlaces: 1,
    category: 'operational',
  },
  yield: {
    type: 'yield',
    name: 'Rendement',
    unit: 'ratio',
    color: '#a855f7', // purple-500
    icon: 'track_changes',
    description: 'Rendement de production',
    yAxisPosition: 'right',
    decimalPlaces: 3,
    category: 'operational',
  },
  availability: {
    type: 'availability',
    name: 'Disponibilité',
    unit: '%',
    color: '#22c55e', // green-500
    icon: 'check_circle',
    description: 'Disponibilité système',
    yAxisPosition: 'right',
    decimalPlaces: 2,
    category: 'operational',
  },
  temperature: {
    type: 'temperature',
    name: 'Température',
    unit: '°C',
    color: '#dc2626', // red-600
    icon: 'thermostat',
    description: 'Température ambiante ou process',
    yAxisPosition: 'right',
    decimalPlaces: 1,
    category: 'operational',
  },
  pressure: {
    type: 'pressure',
    name: 'Pression',
    unit: 'bar',
    color: '#7c3aed', // violet-600
    icon: 'compress',
    description: 'Pression système',
    yAxisPosition: 'right',
    decimalPlaces: 2,
    category: 'operational',
  },
  flow_rate: {
    type: 'flow_rate',
    name: 'Débit',
    unit: 'm³/h',
    color: '#2563eb', // blue-600
    icon: 'water',
    description: 'Débit de fluide',
    yAxisPosition: 'left',
    decimalPlaces: 2,
    category: 'operational',
  },
  power_usage_effectiveness: {
    type: 'power_usage_effectiveness',
    name: 'PUE',
    unit: 'ratio',
    color: '#059669', // emerald-600
    icon: 'wb_iridescent',
    description: 'Efficacité énergétique (Power Usage Effectiveness)',
    yAxisPosition: 'right',
    decimalPlaces: 2,
    category: 'operational',
  },
  occupancy: {
    type: 'occupancy',
    name: 'Occupation',
    unit: 'persons',
    color: '#4f46e5', // indigo-600
    icon: 'group',
    description: 'Taux d\'occupation',
    yAxisPosition: 'right',
    decimalPlaces: 0,
    category: 'operational',
  },
  hvac_efficiency: {
    type: 'hvac_efficiency',
    name: 'Efficacité HVAC',
    unit: '%',
    color: '#0891b2', // cyan-600
    icon: 'hvac',
    description: 'Efficacité de climatisation',
    yAxisPosition: 'right',
    decimalPlaces: 1,
    category: 'operational',
  },
  custom: {
    type: 'custom',
    name: 'Personnalisé',
    unit: 'custom',
    color: '#64748b', // slate-500
    icon: 'tune',
    description: 'Métrique personnalisée',
    yAxisPosition: 'left',
    decimalPlaces: 2,
    category: 'custom',
  },
}
