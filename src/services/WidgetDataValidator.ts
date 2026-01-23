/**
 * Widget Data Validation & Diagnostic Tool
 *
 * This file provides comprehensive validation of:
 * 1. Widget configuration parameters
 * 2. API request building
 * 3. Data transformation accuracy
 * 4. Backend response handling
 *
 * Use this to verify each widget gets correct data from the backend.
 */

import type { WidgetConfig, DataRequirement } from '@/types/widgetRegistry'
import { METER_WIDGET_REGISTRY } from '@/config/widgetRegistry'
import { TimeUtils } from '@/utils/TimeUtils'
import { TelemetryTransformers } from '@/utils/TelemetryTransformers'

export interface WidgetValidation {
  widgetId: string
  valid: boolean
  errors: string[]
  warnings: string[]
  requirements: RequirementValidation[]
  expectedAPICall: {
    endpoint: string
    method: string
    params: Record<string, any>
  }
}

export interface RequirementValidation {
  requirementId: string
  telemetryKeys: string[]
  timeRange: {
    description: string
    startTs: number
    endTs: number
    durationMs: number
  }
  aggregation: string
  interval: string
  expectedTransform: string
}

/**
 * Validate all widget configurations
 */
export class WidgetDataValidator {
  /**
   * Validate a single widget configuration
   */
  static validateWidget(widgetId: string): WidgetValidation {
    const widget = METER_WIDGET_REGISTRY[widgetId]

    if (!widget) {
      return {
        widgetId,
        valid: false,
        errors: [`Widget "${widgetId}" not found in registry`],
        warnings: [],
        requirements: [],
        expectedAPICall: {
          endpoint: 'N/A',
          method: 'GET',
          params: {}
        }
      }
    }

    const validation: WidgetValidation = {
      widgetId: widget.id,
      valid: true,
      errors: [],
      warnings: [],
      requirements: [],
      expectedAPICall: {
        endpoint: `/api/telemetry/{deviceUUID}/timeseries`,
        method: 'GET',
        params: {}
      }
    }

    // Validate each data requirement
    widget.dataRequirements.forEach((req) => {
      const reqValidation = this.validateRequirement(req, widget.id)
      validation.requirements.push(reqValidation)

      if (reqValidation.telemetryKeys.length === 0) {
        validation.errors.push(`Requirement "${req.id}": No telemetry keys specified`)
        validation.valid = false
      }

      if (!req.timeRange) {
        validation.errors.push(`Requirement "${req.id}": No time range specified`)
        validation.valid = false
      }
    })

    // Validate component
    if (!widget.component) {
      validation.errors.push('No component specified')
      validation.valid = false
    }

    // Validate category
    if (!widget.category) {
      validation.warnings.push('No category specified')
    }

    return validation
  }

  /**
   * Validate a single data requirement
   */
  static validateRequirement(req: DataRequirement, widgetId: string): RequirementValidation {
    const now = TimeUtils.now()
    const timeRange = TimeUtils.resolveTimeRange(req.timeRange)

    return {
      requirementId: req.id,
      telemetryKeys: req.telemetryKeys,
      timeRange: {
        description: this.describeTimeRange(req.timeRange),
        startTs: timeRange.startTs,
        endTs: timeRange.endTs,
        durationMs: timeRange.endTs - timeRange.startTs
      },
      aggregation: req.aggregation || 'NONE',
      interval: this.describeInterval(req.interval),
      expectedTransform: this.describeTransform(req.transform)
    }
  }

  /**
   * Validate data retrieved from backend
   */
  static validateBackendData(
    widgetId: string,
    data: Record<string, any>,
    expectedRequirements: DataRequirement[]
  ): {
    valid: boolean
    errors: string[]
    dataPoints: number
    sampleData: any
  } {
    const result = {
      valid: true,
      errors: [] as string[],
      dataPoints: 0,
      sampleData: {} as any
    }

    expectedRequirements.forEach((req) => {
      const reqData = data[req.id]

      if (!reqData) {
        result.errors.push(`Missing data for requirement: ${req.id}`)
        result.valid = false
      } else if (Array.isArray(reqData)) {
        result.dataPoints += reqData.length

        if (reqData.length === 0) {
          result.errors.push(
            `Requirement "${req.id}": Empty data array for keys [${req.telemetryKeys.join(', ')}]`
          )
        } else {
          result.sampleData[req.id] = reqData.slice(0, 3) // First 3 points
        }
      } else if (typeof reqData === 'number' || typeof reqData === 'string') {
        result.dataPoints += 1
        result.sampleData[req.id] = reqData
      } else {
        result.errors.push(`Requirement "${req.id}": Unexpected data format: ${typeof reqData}`)
        result.valid = false
      }
    })

    return result
  }

  /**
   * Generate API call parameters for widget
   */
  static generateAPIParams(
    widget: WidgetConfig,
    deviceUUID: string
  ): Record<string, any>[] {
    return widget.dataRequirements.map((req) => {
      const timeRange = TimeUtils.resolveTimeRange(req.timeRange)

      return {
        requirementId: req.id,
        endpoint: `/api/telemetry/${deviceUUID}/timeseries`,
        params: {
          keys: req.telemetryKeys.join(','),
          startTs: timeRange.startTs,
          endTs: timeRange.endTs,
          interval: req.interval || 'NONE',
          agg: req.aggregation || 'NONE',
          limit: req.limit || 10000,
          orderBy: req.orderBy || 'ASC'
        },
        expectedDataFormat: {
          telemetryKey: ['{ ts: number, value: number | string }']
        }
      }
    })
  }

  /**
   * Validate all widgets in registry
   */
  static validateAllWidgets(): Map<string, WidgetValidation> {
    const results = new Map<string, WidgetValidation>()

    Object.keys(METER_WIDGET_REGISTRY).forEach((widgetId) => {
      const validation = this.validateWidget(widgetId)
      results.set(widgetId, validation)
    })

    return results
  }

  /**
   * Generate validation report
   */
  static generateReport(): string {
    const validations = this.validateAllWidgets()
    const report: string[] = []

    report.push('# Widget Data Validation Report\n')
    report.push(`Generated: ${new Date().toISOString()}\n`)
    report.push('---\n')

    let totalWidgets = 0
    let validWidgets = 0

    validations.forEach((validation) => {
      totalWidgets++

      if (validation.valid) {
        validWidgets++
        report.push(`✅ ${validation.widgetId}`)
      } else {
        report.push(`❌ ${validation.widgetId}`)
        validation.errors.forEach((error) => {
          report.push(`   ERROR: ${error}`)
        })
      }

      validation.warnings.forEach((warning) => {
        report.push(`   ⚠️  ${warning}`)
      })

      report.push(
        `   Requirements: ${validation.requirements.length} data requirements`
      )

      validation.requirements.forEach((req) => {
        report.push(`   - ${req.requirementId}: [${req.telemetryKeys.join(', ')}]`)
        report.push(`     Time Range: ${req.timeRange.description}`)
        report.push(`     Duration: ${(req.timeRange.durationMs / 1000 / 60).toFixed(0)} minutes`)
        report.push(`     Aggregation: ${req.aggregation}`)
      })

      report.push('')
    })

    report.push('\n---\n')
    report.push(`Summary: ${validWidgets}/${totalWidgets} widgets valid\n`)

    return report.join('\n')
  }

  // Helper methods
  private static describeTimeRange(timeRange: any): string {
    if (timeRange.type === 'today') {
      return 'Today (00:00 - 23:59 UTC)'
    }
    if (timeRange.type === 'yesterday') {
      return 'Yesterday (full 24h UTC)'
    }
    if (timeRange.type === 'relative') {
      return `Last ${Math.abs(timeRange.value)} ${timeRange.unit}`
    }
    if (timeRange.type === 'absolute') {
      return `Custom range (${new Date(timeRange.startTs).toISOString()} to ${new Date(timeRange.endTs).toISOString()})`
    }
    return 'Unknown'
  }

  private static describeInterval(interval: number | undefined): string {
    if (!interval) return 'NONE (raw data)'
    if (interval === 300000) return '5 minutes'
    if (interval === 3600000) return '1 hour'
    if (interval === 86400000) return '1 day'
    return `${(interval / 60000).toFixed(0)} minutes`
  }

  private static describeTransform(transform: any): string {
    if (!transform) return 'None (raw data)'
    if (transform === TelemetryTransformers.latestValue) return 'Latest value'
    if (transform === TelemetryTransformers.hourlyBreakdown) return 'Hourly breakdown'
    if (transform === TelemetryTransformers.dailyBreakdown) return 'Daily breakdown'
    if (transform === TelemetryTransformers.instantTimeSeries) return 'Time series'
    return 'Custom transformer'
  }
}

/**
 * Data Request Builder - Constructs exact API requests
 */
export class DataRequestBuilder {
  /**
   * Build complete API request for widget
   */
  static buildWidgetRequest(
    widget: WidgetConfig,
    deviceUUID: string
  ): {
    url: string
    params: Record<string, any>
    headers: Record<string, string>
  }[] {
    return widget.dataRequirements.map((req) => {
      const timeRange = TimeUtils.resolveTimeRange(req.timeRange)

      const params = {
        keys: req.telemetryKeys.join(','),
        startTs: timeRange.startTs,
        endTs: timeRange.endTs,
        ...(req.interval && { interval: req.interval }),
        ...(req.aggregation && { agg: req.aggregation }),
        ...(req.limit && { limit: req.limit }),
        ...(req.orderBy && { orderBy: req.orderBy })
      }

      return {
        url: `/api/telemetry/${deviceUUID}/timeseries`,
        params,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      }
    })
  }

  /**
   * Build and log complete request details
   */
  static debugWidgetRequest(widget: WidgetConfig, deviceUUID: string, requirementId?: string) {
    console.group(`📊 Widget Request Debug: ${widget.id}`)

    const requests = this.buildWidgetRequest(widget, deviceUUID)

    requests.forEach((req, index) => {
      const req_obj = widget.dataRequirements[index]

      console.group(`Requirement ${index + 1}: ${req_obj.id}`)
      console.log('Telemetry Keys:', req_obj.telemetryKeys)
      console.log('URL:', req.url)
      console.log('Parameters:', req.params)
      console.log('Time Range:', {
        start: new Date(req.params.startTs).toISOString(),
        end: new Date(req.params.endTs).toISOString()
      })
      console.table(req.params)
      console.groupEnd()
    })

    console.groupEnd()
  }
}

/**
 * Browser console helpers for debugging
 */
export function setupDebugTools() {
  if (typeof window !== 'undefined') {
    ;(window as any).__widgetDebug = {
      validateWidget: (widgetId: string) => {
        const validation = WidgetDataValidator.validateWidget(widgetId)
        console.table(validation)
        return validation
      },
      validateAll: () => {
        const report = WidgetDataValidator.generateReport()
        console.log(report)
        return report
      },
      debugRequest: (widgetId: string, deviceUUID: string) => {
        const widget = METER_WIDGET_REGISTRY[widgetId]
        if (widget) {
          DataRequestBuilder.debugWidgetRequest(widget, deviceUUID)
        } else {
          console.error(`Widget not found: ${widgetId}`)
        }
      },
      listWidgets: () => {
        const widgets = Object.keys(METER_WIDGET_REGISTRY)
        console.table(widgets)
        return widgets
      }
    }

    console.log('✅ Widget Debug Tools Loaded')
    console.log('Usage:')
    console.log('  __widgetDebug.validateWidget("meter-instant-power")')
    console.log('  __widgetDebug.validateAll()')
    console.log('  __widgetDebug.debugRequest("meter-instant-power", "device-uuid")')
    console.log('  __widgetDebug.listWidgets()')
  }
}
