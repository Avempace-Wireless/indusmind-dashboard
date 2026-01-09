import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Equipment, EquipmentStatus } from '../types'
import { equipmentAPI } from '../services/api'

export const useEquipmentStore = defineStore('equipment', () => {
  const equipment = ref<Equipment[]>([])
  const selectedId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const selected = computed(() => equipment.value.find((e) => e.id === selectedId.value))
  const onlineCount = computed(() => equipment.value.filter((e) => e.status === 'Online').length)
  const offlineCount = computed(() => equipment.value.filter((e) => e.status === 'Offline').length)
  const totalPower = computed(
    () =>
      equipment.value.reduce((sum, e) => {
        const power = e.specs?.power || 0
        return sum + power
      }, 0) || 0
  )
  const averageLoad = computed(() => {
    if (equipment.value.length === 0) return 0
    const sum = equipment.value.reduce((acc, e) => {
      const load = e.specs?.load || 0
      return acc + load
    }, 0)
    return sum / equipment.value.length
  })

  /**
   * Load all equipment from API
   */
  const loadEquipment = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await equipmentAPI.getAll()

      if (response.success) {
        equipment.value = response.data || []
      } else {
        error.value = 'Failed to load equipment'
      }
    } catch (err) {
      error.value = 'Error loading equipment'
      console.error('Load equipment error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Get details for single equipment
   */
  const getEquipmentDetail = async (id: string) => {
    try {
      loading.value = true
      const response = await equipmentAPI.getById(id)
      if (response.success) {
        const item = equipment.value.find((e) => e.id === id)
        if (item) {
          Object.assign(item, response.data)
        }
      }
      return response.data
    } catch (err) {
      console.error('Get equipment detail error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Create new equipment
   */
  const addEquipment = async (newEquipment: Partial<Equipment>) => {
    try {
      loading.value = true
      error.value = null
      const response = await equipmentAPI.create(newEquipment)

      if (response.success) {
        equipment.value.push(response.data)
        return response.data
      } else {
        error.value = 'Failed to create equipment'
      }
    } catch (err) {
      error.value = 'Error creating equipment'
      console.error('Add equipment error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Update existing equipment
   */
  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      loading.value = true
      error.value = null
      const response = await equipmentAPI.update(id, updates)

      if (response.success) {
        const item = equipment.value.find((e) => e.id === id)
        if (item) {
          Object.assign(item, response.data)
        }
        return response.data
      } else {
        error.value = 'Failed to update equipment'
      }
    } catch (err) {
      error.value = 'Error updating equipment'
      console.error('Update equipment error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove equipment
   */
  const removeEquipment = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      const response = await equipmentAPI.delete(id)

      if (response.success) {
        equipment.value = equipment.value.filter((e) => e.id !== id)
        if (selectedId.value === id) {
          selectedId.value = null
        }
      } else {
        error.value = 'Failed to delete equipment'
      }
    } catch (err) {
      error.value = 'Error deleting equipment'
      console.error('Remove equipment error:', err)
    } finally {
      loading.value = false
    }
  }

  const setSelected = (id: string | null) => {
    selectedId.value = id
  }

  /**
   * Clear local cache
   */
  const reset = () => {
    equipment.value = []
    selectedId.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    equipment,
    selectedId,
    loading,
    error,
    // Computed
    selected,
    onlineCount,
    offlineCount,
    totalPower,
    averageLoad,
    // Actions
    loadEquipment,
    getEquipmentDetail,
    addEquipment,
    updateEquipment,
    removeEquipment,
    setSelected,
    reset,
  }
})
