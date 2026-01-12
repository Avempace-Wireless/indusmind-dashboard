<template>
  <div
    :class="[
      'p-4 border-l-4 rounded-lg shadow-sm transition-all hover:shadow-md',
      levelClass
    ]"
  >
    <div class="flex items-start justify-between">
      <!-- Alert Content -->
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <span :class="badgeClass" class="px-2 py-1 rounded text-xs font-semibold uppercase">
            {{ alert.level }}
          </span>
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ formattedTime }}
          </span>
          <span v-if="!alert.acknowledgedAt" class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded text-xs font-medium">
            New
          </span>
        </div>

        <h4 class="font-semibold text-gray-900 dark:text-white mb-1">
          {{ alert.equipmentId }}
        </h4>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {{ t(alert.message) }}
        </p>
        <p v-if="alert.description" class="text-sm text-gray-500 dark:text-gray-400">
          {{ t(alert.description) }}
        </p>

        <!-- Notes (if acknowledged) -->
        <div v-if="alert.acknowledgedAt" class="mt-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm">
          <p class="text-gray-700 dark:text-gray-300">
            <span class="font-medium">Acknowledged</span> at {{ formatDate(alert.acknowledgedAt) }}
          </p>
          <p v-if="alert.acknowledgedBy" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            by {{ alert.acknowledgedBy }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-2 ml-4">
        <button
          v-if="!alert.acknowledgedAt"
          @click="$emit('acknowledge', alert.id)"
          class="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm transition"
        >
          Acknowledge
        </button>
        <button
          @click="$emit('view-details', alert.id)"
          class="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded text-sm transition"
        >
          Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Alert } from '@/types'

interface Props {
  alert: Alert
}

const props = defineProps<Props>()
const { t } = useI18n()

defineEmits<{
  acknowledge: [id: string]
  'view-details': [id: string]
}>()

const formattedTime = computed(() => {
  const date = new Date(props.alert.detectedAt)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
  return date.toLocaleDateString()
})

const formatDate = (dateString?: Date) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

const levelClass = computed(() => {
  const classes = {
    'Informational': 'bg-blue-50 dark:bg-blue-900/10 border-blue-500',
    'Low': 'bg-green-50 dark:bg-green-900/10 border-green-500',
    'Medium': 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-500',
    'High': 'bg-orange-50 dark:bg-orange-900/10 border-orange-500',
    'Critical': 'bg-red-50 dark:bg-red-900/10 border-red-500',
    'Emergency': 'bg-purple-50 dark:bg-purple-900/10 border-purple-500',
  }
  return classes[props.alert.level as keyof typeof classes] || classes['Informational']
})

const badgeClass = computed(() => {
  const classes = {
    'Informational': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'Low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'Medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'High': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'Critical': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'Emergency': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  }
  return classes[props.alert.level as keyof typeof classes] || classes['Informational']
})
</script>
