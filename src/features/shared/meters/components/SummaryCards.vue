<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
    <div
      v-for="item in items"
      :key="item.key"
      :class="[
        'bg-white dark:bg-gray-800 rounded-lg p-4 text-center',
        item.className
      ]"
    >
      <p :class="item.valueClass" class="text-2xl font-bold">
        {{ item.value }}
      </p>
      <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ item.label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface SummaryCardItem {
  key: string
  value: string | number
  label: string
  valueClass?: string
  className?: string
}

defineProps<{
  items: SummaryCardItem[]
}>()
</script>
