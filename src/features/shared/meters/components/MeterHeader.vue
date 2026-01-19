<template>
  <div class="mb-8">
    <!-- Title & Description -->
    <div class="mb-6 flex justify-between items-center gap-4">
      <div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {{ title }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ description }}
        </p>
      </div>
      <button
        v-if="showManageButton"
        @click="$emit('manage-meters')"
        class="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-white px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-100 transition-colors whitespace-nowrap shadow-sm"
      >
        <span class="material-symbols-outlined text-base">tune</span>
        {{ manageButtonLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  showManageButton?: boolean
  manageButtonLabel?: string
}>()

defineEmits<{
  'manage-meters': []
}>()
</script>
