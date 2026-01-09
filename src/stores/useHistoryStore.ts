import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EnergyReading } from '../types'

export const useHistoryStore = defineStore('history', () => {
  const readings = ref<EnergyReading[]>([])
  const loading = ref(false)
  const dateRange = ref<{ start: Date; end: Date } | null>(null)

  const fetchHistoricalData = async (
    startDate: Date,
    endDate: Date,
    equipmentId?: string,
    resolution: '15min' | '1hour' | 'daily' = '15min'
  ) => {
    loading.value = true
    try {
      // TODO: Call API to fetch historical data
      dateRange.value = { start: startDate, end: endDate }
    } finally {
      loading.value = false
    }
  }

  const clearHistory = () => {
    readings.value = []
    dateRange.value = null
  }

  return {
    readings,
    loading,
    dateRange,
    fetchHistoricalData,
    clearHistory,
  }
})
