/**
 * Utility to export meter data in various formats
 * Useful for debugging, testing, and data analysis
 */

import { MOCK_METERS } from '../data/mockData'

/**
 * Export all meter data as JSON string
 */
export function exportAllMetersJSON(): string {
  return JSON.stringify(MOCK_METERS, null, 2)
}

/**
 * Export specific meter data as JSON
 */
export function exportMeterJSON(meterId: string): string {
  const meter = MOCK_METERS.find(m => m.id === meterId)
  if (!meter) {
    throw new Error(`Meter ${meterId} not found`)
  }
  return JSON.stringify(meter, null, 2)
}

/**
 * Export meter data for a given type label
 * (uses meter.type field; pass the type string you want to filter on)
 */
export function exportCategoryJSON(typeLabel: string): string {
  const meters = MOCK_METERS.filter(m => (m.type ?? 'meter') === typeLabel)
  return JSON.stringify(meters, null, 2)
}

/**
 * Export element data for multi-element meters
 */
export function exportElementJSON(meterId: string, elementId: string): string {
  const meter = MOCK_METERS.find(m => m.id === meterId)
  if (!meter) {
    throw new Error(`Meter ${meterId} not found`)
  }

  const element = meter.elements?.find(el => el.id === elementId)
  if (!element) {
    throw new Error(`Element ${elementId} not found in meter ${meterId}`)
  }

  return JSON.stringify(element, null, 2)
}

/**
 * Export hourly time series data for a meter
 */
export function exportHourlyDataJSON(meterId: string, elementId?: string): string {
  const meter = MOCK_METERS.find(m => m.id === meterId)
  if (!meter) {
    throw new Error(`Meter ${meterId} not found`)
  }

  if (elementId && meter.elements) {
    const element = meter.elements.find(el => el.id === elementId)
    if (!element) {
      throw new Error(`Element ${elementId} not found`)
    }
    return JSON.stringify(element.timeSeries.hourly, null, 2)
  }

  return JSON.stringify(meter.timeSeries.hourly, null, 2)
}

/**
 * Export daily time series data for a meter
 */
export function exportDailyDataJSON(meterId: string, elementId?: string): string {
  const meter = MOCK_METERS.find(m => m.id === meterId)
  if (!meter) {
    throw new Error(`Meter ${meterId} not found`)
  }

  if (elementId && meter.elements) {
    const element = meter.elements.find(el => el.id === elementId)
    if (!element) {
      throw new Error(`Element ${elementId} not found`)
    }
    return JSON.stringify(element.timeSeries.daily, null, 2)
  }

  return JSON.stringify(meter.timeSeries.daily, null, 2)
}

/**
 * Export monthly time series data for a meter
 */
export function exportMonthlyDataJSON(meterId: string, elementId?: string): string {
  const meter = MOCK_METERS.find(m => m.id === meterId)
  if (!meter) {
    throw new Error(`Meter ${meterId} not found`)
  }

  if (elementId && meter.elements) {
    const element = meter.elements.find(el => el.id === elementId)
    if (!element) {
      throw new Error(`Element ${elementId} not found`)
    }
    return JSON.stringify(element.timeSeries.monthly, null, 2)
  }

  return JSON.stringify(meter.timeSeries.monthly, null, 2)
}

/**
 * Download JSON file with meter data
 */
export function downloadMeterDataJSON(meterId: string, elementId?: string) {
  const filename = elementId
    ? `${meterId}-${elementId}-data.json`
    : `${meterId}-data.json`

  const json = elementId
    ? exportElementJSON(meterId, elementId)
    : exportMeterJSON(meterId)

  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Download all meters data as JSON file
 */
export function downloadAllMetersJSON() {
  const json = exportAllMetersJSON()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'all-meters-data.json'
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Log meter data to console for debugging
 */
export function logMeterData(meterId: string, elementId?: string) {
  const meter = MOCK_METERS.find(m => m.id === meterId)
  if (!meter) {
    console.error(`Meter ${meterId} not found`)
    return
  }

  if (elementId && meter.elements) {
    const element = meter.elements.find(el => el.id === elementId)
    if (!element) {
      console.error(`Element ${elementId} not found`)
      return
    }
    console.log(`📊 Element Data: ${meter.name} - ${element.name}`, element)
  } else {
    console.log(`📊 Meter Data: ${meter.name}`, meter)
  }
}
