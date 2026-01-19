<template>
  <div v-if="!isDataReady && selectedMeterIds.length > 0" class="flex items-center justify-center py-16">
    <div class="text-center">
      <div class="inline-block mb-4">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-teal-600"></div>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ loadingTitle }}</h3>
      <p class="text-sm text-slate-600 dark:text-slate-400">{{ loadingMessage }}</p>
      <div v-if="(totalMeters ?? 0) > 0" class="mt-4 flex items-center justify-center gap-2">
        <div class="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></div>
        <span class="text-xs text-slate-500 dark:text-slate-500">{{ (currentMeterIndex ?? 0) + 1 }} of {{ totalMeters }}</span>
      </div>
    </div>
  </div>

  <div v-else-if="isDataReady && hasData" class="space-y-4">
    <slot />
  </div>

  <div v-else-if="isDataReady && !hasData" class="flex items-center justify-center py-16">
    <div class="text-center max-w-md">
      <span class="material-symbols-outlined text-5xl mb-3 block text-slate-400">info</span>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ emptyTitle }}</h3>
      <p class="text-sm text-slate-600 dark:text-slate-400">{{ emptyMessage }}</p>
    </div>
  </div>

  <div v-else-if="selectedMeterIds.length === 0" class="flex items-center justify-center py-16">
    <div class="text-center max-w-md">
      <span class="material-symbols-outlined text-5xl mb-3 block text-slate-400">speed</span>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ $t('dashboard.noMetersSelected.title') }}</h3>
      <p class="text-sm text-slate-600 dark:text-slate-400">{{ $t('dashboard.noMetersSelected.description') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isDataReady: boolean
  hasData: boolean
  selectedMeterIds: string[]
  currentMeterIndex?: number
  totalMeters?: number
  loadingTitle?: string
  loadingMessage?: string
  emptyTitle?: string
  emptyMessage?: string
}>()
</script>
