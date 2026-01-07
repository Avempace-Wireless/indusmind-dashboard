<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Equipment Status</h3>
      <div class="text-xs text-gray-500 dark:text-gray-400">{{ totalEquipment }} devices</div>
    </div>

    <div class="h-48">
      <!-- Status Summary -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ statusCounts.online }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">Online</p>
        </div>
        <div class="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
          <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ statusCounts.warning }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">Warning</p>
        </div>
        <div class="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
          <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ statusCounts.offline }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-400">Offline</p>
        </div>
      </div>

      <!-- Equipment List -->
      <div class="space-y-2 max-h-24 overflow-y-auto">
        <div
          v-for="equipment in equipmentList"
          :key="equipment.id"
          class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm"
        >
          <div class="flex items-center gap-2">
            <div :class="statusDotClass(equipment.status)" class="w-2 h-2 rounded-full"></div>
            <span class="font-medium text-gray-900 dark:text-white">{{ equipment.name }}</span>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ equipment.type }}</span>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500 dark:text-gray-400">Uptime (24h)</span>
        <span class="font-semibold text-gray-900 dark:text-white">{{ uptimePercentage }}%</span>
      </div>
      <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          class="bg-green-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${uptimePercentage}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Equipment {
  id: string
  name: string
  type: string
  status: 'online' | 'warning' | 'offline'
}

interface Props {
  equipment: Equipment[]
}

const props = withDefaults(defineProps<Props>(), {
  equipment: () => [],
})

const totalEquipment = computed(() => props.equipment.length)

const statusCounts = computed(() => {
  return props.equipment.reduce((acc, eq) => {
    acc[eq.status] = (acc[eq.status] || 0) + 1
    return acc
  }, { online: 0, warning: 0, offline: 0 } as Record<string, number>)
})

const equipmentList = computed(() => {
  return props.equipment.slice(0, 3) // Show top 3
})

const uptimePercentage = computed(() => {
  if (totalEquipment.value === 0) return 0
  return ((statusCounts.value.online / totalEquipment.value) * 100).toFixed(1)
})

const statusDotClass = (status: string) => {
  const classes = {
    online: 'bg-green-500',
    warning: 'bg-yellow-500',
    offline: 'bg-red-500',
  }
  return classes[status as keyof typeof classes] || 'bg-gray-500'
}
</script>
