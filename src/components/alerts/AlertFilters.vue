<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
    <h3 class="font-semibold text-gray-900 dark:text-white mb-4">Filter Alerts</h3>

    <div class="space-y-4">
      <!-- Level Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Severity Level
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="level in levels"
            :key="level"
            @click="toggleLevel(level)"
            :class="[
              'px-3 py-1 rounded text-sm font-medium transition',
              selectedLevels.includes(level)
                ? levelActiveClass(level)
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            {{ level }}
          </button>
        </div>
      </div>

      <!-- Equipment Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Equipment
        </label>
        <select
          v-model="selectedEquipment"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Equipment</option>
          <option v-for="eq in equipmentList" :key="eq" :value="eq">
            {{ eq }}
          </option>
        </select>
      </div>

      <!-- Status Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <div class="flex gap-2">
          <button
            @click="selectedStatus = 'all'"
            :class="[
              'flex-1 px-3 py-2 rounded text-sm font-medium transition',
              selectedStatus === 'all'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            All
          </button>
          <button
            @click="selectedStatus = 'unacknowledged'"
            :class="[
              'flex-1 px-3 py-2 rounded text-sm font-medium transition',
              selectedStatus === 'unacknowledged'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            New
          </button>
          <button
            @click="selectedStatus = 'acknowledged'"
            :class="[
              'flex-1 px-3 py-2 rounded text-sm font-medium transition',
              selectedStatus === 'acknowledged'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            Acknowledged
          </button>
        </div>
      </div>

      <!-- Date Range -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date Range
        </label>
        <div class="grid grid-cols-2 gap-2">
          <input
            v-model="dateFrom"
            type="date"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
          <input
            v-model="dateTo"
            type="date"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      <!-- Search -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search
        </label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search alerts..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <!-- Clear Filters -->
      <button
        @click="clearFilters"
        class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition"
      >
        Clear All Filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AlertLevel } from '@/types'

interface Filters {
  levels: AlertLevel[]
  equipment: string
  status: 'all' | 'acknowledged' | 'unacknowledged'
  dateFrom: string
  dateTo: string
  search: string
}

interface Props {
  equipmentList: string[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update:filters': [filters: Filters]
}>()

const levels: AlertLevel[] = ['Emergency', 'Critical', 'High', 'Medium', 'Low', 'Informational']
const selectedLevels = ref<AlertLevel[]>([...levels])
const selectedEquipment = ref('')
const selectedStatus = ref<'all' | 'acknowledged' | 'unacknowledged'>('all')
const dateFrom = ref('')
const dateTo = ref('')
const searchQuery = ref('')

const toggleLevel = (level: AlertLevel) => {
  const index = selectedLevels.value.indexOf(level)
  if (index > -1) {
    selectedLevels.value.splice(index, 1)
  } else {
    selectedLevels.value.push(level)
  }
  emitFilters()
}

const levelActiveClass = (level: string) => {
  const classes = {
    'Informational': 'bg-blue-500 text-white',
    'Low': 'bg-green-500 text-white',
    'Medium': 'bg-yellow-500 text-white',
    'High': 'bg-orange-500 text-white',
    'Critical': 'bg-red-500 text-white',
    'Emergency': 'bg-purple-500 text-white',
  }
  return classes[level as keyof typeof classes] || 'bg-gray-500 text-white'
}

const clearFilters = () => {
  selectedLevels.value = [...levels]
  selectedEquipment.value = ''
  selectedStatus.value = 'all'
  dateFrom.value = ''
  dateTo.value = ''
  searchQuery.value = ''
  emitFilters()
}

const emitFilters = () => {
  emit('update:filters', {
    levels: selectedLevels.value,
    equipment: selectedEquipment.value,
    status: selectedStatus.value,
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    search: searchQuery.value,
  })
}

watch([selectedEquipment, selectedStatus, dateFrom, dateTo, searchQuery], () => {
  emitFilters()
})
</script>
