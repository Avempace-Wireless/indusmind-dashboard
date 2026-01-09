import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CorrectiveAction, AuditLog } from '../types'

export const useReportsStore = defineStore('reports', () => {
  const correctiveActions = ref<CorrectiveAction[]>([])
  const auditLogs = ref<AuditLog[]>([])
  const loading = ref(false)

  const addCorrectiveAction = (action: CorrectiveAction) => {
    correctiveActions.value.push(action)
  }

  const updateCorrectiveAction = (id: string, updates: Partial<CorrectiveAction>) => {
    const action = correctiveActions.value.find((a) => a.id === id)
    if (action) {
      Object.assign(action, updates)
      // Add audit trail entry
      if (updates.status) {
        action.auditTrail.push({
          id: `${Date.now()}`,
          userId: 'current-user', // TODO: get from auth store
          action: `Status changed to ${updates.status}`,
          entity: 'CorrectiveAction',
          entityId: id,
          timestamp: new Date(),
          ipAddress: 'unknown', // TODO: get from backend
        })
      }
    }
  }

  const addAuditLog = (log: AuditLog) => {
    auditLogs.value.push(log)
  }

  const generateISO50001Report = async (startDate: Date, endDate: Date) => {
    loading.value = true
    try {
      // TODO: Call API to generate ISO 50001 compliance report
    } finally {
      loading.value = false
    }
  }

  return {
    correctiveActions,
    auditLogs,
    loading,
    addCorrectiveAction,
    updateCorrectiveAction,
    addAuditLog,
    generateISO50001Report,
  }
})
