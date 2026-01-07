import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CostRecord, TariffInfo } from '../types'

export const useBillingStore = defineStore('billing', () => {
  const costRecords = ref<CostRecord[]>([])
  const loading = ref(false)
  const tariffInfo = ref<TariffInfo>({
    peakRate: 0.25,
    offPeakRate: 0.15,
    peakHours: '09:00-21:00',
    currency: 'TND',
  })

  const fetchCostData = async (startDate: Date, endDate: Date) => {
    loading.value = true
    try {
      // TODO: Call API to fetch cost data
    } finally {
      loading.value = false
    }
  }

  const calculateProjectedCost = (consumption: number, days: number): number => {
    const avgCost = costRecords.value.reduce((sum, r) => sum + r.totalCost, 0) / costRecords.value.length
    return (avgCost / 30) * days
  }

  const updateTariff = (newTariff: Partial<TariffInfo>) => {
    tariffInfo.value = { ...tariffInfo.value, ...newTariff }
  }

  return {
    costRecords,
    loading,
    tariffInfo,
    fetchCostData,
    calculateProjectedCost,
    updateTariff,
  }
})
