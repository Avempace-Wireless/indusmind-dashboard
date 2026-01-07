import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Alert, AlertLevel, AlertStatus } from '../types'
import { alertsAPI } from '../services/api'

export const useAlertsStore = defineStore('alerts', () => {
  // State
  const alerts = ref<Alert[]>([])
  const filter = ref<{ level?: AlertLevel; status?: AlertStatus; from?: string; to?: string }>({})
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({ page: 1, pageSize: 20, total: 0 })

  // Computed
  const filteredAlerts = computed(() => {
    return alerts.value.filter((alert) => {
      if (filter.value.level && alert.level !== filter.value.level) return false
      if (filter.value.status && alert.status !== filter.value.status) return false
      return true
    })
  })

  const unacknowledgedCount = computed(() => alerts.value.filter((a) => a.status === 'New').length)

  const criticalCount = computed(() =>
    alerts.value.filter((a) => a.level === 'Critical' || a.level === 'Emergency').length
  )

  const highPriorityCount = computed(
    () => alerts.value.filter((a) => a.level === 'Critical' || a.level === 'High').length
  )

  const byStatus = computed(() => ({
    active: alerts.value.filter((a) => a.status === 'New' || a.status === 'Acknowledged').length,
    acknowledged: alerts.value.filter((a) => a.status === 'Acknowledged').length,
    resolved: alerts.value.filter((a) => a.status === 'Resolved').length,
  }))

  const bySeverity = computed(() => ({
    critical: alerts.value.filter((a) => a.level === 'Critical').length,
    high: alerts.value.filter((a) => a.level === 'High').length,
    medium: alerts.value.filter((a) => a.level === 'Medium').length,
    low: alerts.value.filter((a) => a.level === 'Low').length,
  }))

  /**
   * Load alerts from API
   */
  const loadAlerts = async (params: Partial<typeof filter.value> = {}) => {
    try {
      loading.value = true
      error.value = null
      const response = await alertsAPI.getAlerts({
        status: filter.value.status as any,
        severity: filter.value.level?.toLowerCase() as any,
        from: filter.value.from,
        to: filter.value.to,
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
      })

      if (response.success) {
        alerts.value = response.data.items || []
        pagination.value = {
          page: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total,
        }
      } else {
        error.value = 'Failed to load alerts'
      }
    } catch (err) {
      error.value = 'Error loading alerts'
      console.error('Load alerts error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Add alert locally (from real-time updates)
   */
  const addAlert = (alert: Alert) => {
    // Don't add duplicate alerts (same equipment, same time window)
    const isDuplicate = alerts.value.some(
      (a) =>
        a.equipmentId === alert.equipmentId &&
        Math.abs(a.detectedAt.getTime() - alert.detectedAt.getTime()) < 5000
    )
    if (!isDuplicate) {
      alerts.value.unshift(alert)
    }
  }

  /**
   * Acknowledge alert via API
   */
  const acknowledgeAlert = async (alertId: string, userId: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await alertsAPI.acknowledge(alertId, userId)

      if (response.success) {
        const alert = alerts.value.find((a) => a.id === alertId)
        if (alert) {
          alert.status = 'Acknowledged'
          alert.acknowledgedAt = new Date()
          alert.acknowledgedBy = userId
        }
      } else {
        error.value = 'Failed to acknowledge alert'
      }
    } catch (err) {
      error.value = 'Error acknowledging alert'
      console.error('Acknowledge alert error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Acknowledge all active alerts
   */
  const acknowledgeAllAlerts = async (userId: string) => {
    const activeAlerts = alerts.value.filter((a) => a.status === 'New')
    const promises = activeAlerts.map((a) => acknowledgeAlert(a.id, userId))
    await Promise.all(promises)
  }

  /**
   * Resolve alert
   */
  const resolveAlert = (alertId: string) => {
    const alert = alerts.value.find((a) => a.id === alertId)
    if (alert) {
      alert.status = 'Resolved'
      alert.resolvedAt = new Date()
    }
  }

  const setFilter = (newFilter: Partial<typeof filter.value>) => {
    filter.value = { ...filter.value, ...newFilter }
    pagination.value.page = 1 // Reset to first page on filter change
  }

  const clearFilter = () => {
    filter.value = {}
    pagination.value.page = 1
  }

  const setPage = (page: number) => {
    pagination.value.page = page
  }

  const clearAlerts = () => {
    alerts.value = []
    pagination.value = { page: 1, pageSize: 20, total: 0 }
  }

  /**
   * Reset store
   */
  const reset = () => {
    clearAlerts()
    filter.value = {}
    loading.value = false
    error.value = null
  }

  return {
    // State
    alerts,
    filter,
    loading,
    error,
    pagination,
    // Computed
    filteredAlerts,
    unacknowledgedCount,
    criticalCount,
    highPriorityCount,
    byStatus,
    bySeverity,
    // Actions
    loadAlerts,
    addAlert,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    resolveAlert,
    setFilter,
    clearFilter,
    setPage,
    clearAlerts,
    reset,
  }
})
