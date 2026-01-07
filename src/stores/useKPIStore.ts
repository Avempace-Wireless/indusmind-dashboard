import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EnPI, EnergyBaseline } from '../types'

export const useKPIStore = defineStore('kpi', () => {
  const enPIs = ref<EnPI[]>([])
  const baselines = ref<EnergyBaseline[]>([])
  const loading = ref(false)

  const addEnPI = (enpi: EnPI) => {
    enPIs.value.push(enpi)
  }

  const updateEnPI = (id: string, updates: Partial<EnPI>) => {
    const enpi = enPIs.value.find((e) => e.id === id)
    if (enpi) {
      Object.assign(enpi, updates)
    }
  }

  const calculateEnPI = (id: string, currentValue: number) => {
    const enpi = enPIs.value.find((e) => e.id === id)
    if (enpi) {
      enpi.currentValue = currentValue
      if (enpi.currentValue !== undefined) {
        enpi.trend = ((currentValue - enpi.targetValue) / enpi.targetValue) * 100
      }
    }
  }

  const setBaseline = (baseline: EnergyBaseline) => {
    baseline.immutable = true
    const existingIndex = baselines.value.findIndex((b) => b.id === baseline.id)
    if (existingIndex !== -1) {
      baseline.version = baselines.value[existingIndex].version + 1
      baselines.value.splice(existingIndex, 1, baseline)
    } else {
      baselines.value.push(baseline)
    }
  }

  const fetchKPIData = async () => {
    loading.value = true
    try {
      // TODO: Call API to fetch KPI data
    } finally {
      loading.value = false
    }
  }

  return {
    enPIs,
    baselines,
    loading,
    addEnPI,
    updateEnPI,
    calculateEnPI,
    setBaseline,
    fetchKPIData,
  }
})
