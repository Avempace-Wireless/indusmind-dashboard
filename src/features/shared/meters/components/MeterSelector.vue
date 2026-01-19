<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-4 border-2 border-slate-300 dark:border-slate-600 mb-4">
    <div v-if="selectedMeterIds.length > 0" class="space-y-3">
      <!-- Header: Title -->
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          {{ selectorTitle }}
        </h3>
      </div>

      <!-- All Meters Pills - Grid Layout -->
      <div v-if="selectedMeterIds.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        <button
          v-for="meterId in selectedMeterIds"
          :key="meterId"
          @click="$emit('select', meterId)"
          :class="[
            'px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border-2 flex items-center justify-center gap-1 relative overflow-hidden group',
            isSelected(meterId)
              ? 'text-white shadow-lg scale-105 border-transparent'
              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
          ]"
          :style="isSelected(meterId) ? { backgroundColor: getMeterColor(meterId) } : {}"
        >
          <!-- Background gradient for non-selected -->
          <div
            v-if="!isSelected(meterId)"
            class="absolute inset-0 opacity-0 group-hover:opacity-5 transition"
            :style="{ backgroundColor: getMeterColor(meterId) }"
          />

          <!-- Content -->
          <span v-if="isSelected(meterId)" class="material-symbols-outlined text-sm flex-shrink-0">check_circle</span>
          <span class="truncate relative z-10">{{ getMeterName(meterId) }}</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
      <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">inbox</span>
      <p class="text-sm">{{ emptyStateLabel }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedMeterIds: string[]
  activeMeterIds?: string[]
  getMeterColor: (id: string) => string
  getMeterName: (id: string) => string
  selectorTitle?: string
  emptyStateLabel?: string
}>()

const emit = defineEmits<{
  select: [meterId: string]
}>()

const isSelected = (meterId: string) => {
  const props = defineProps<{
    activeMeterIds?: string[]
  }>()
  return !props.activeMeterIds || props.activeMeterIds.length === 0 || props.activeMeterIds.includes(meterId)
}
</script>
