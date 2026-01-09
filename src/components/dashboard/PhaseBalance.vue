<template>
  <div class="flex flex-col rounded-xl bg-white dark:bg-[#1c2534] border border-gray-200 dark:border-[#2a3649] p-6 gap-4">
    <div class="flex items-center justify-between">
      <h3 class="text-gray-900 dark:text-white text-base font-bold">{{ title }}</h3>
      <span class="material-symbols-outlined text-gray-600 dark:text-text-muted">equalizer</span>
    </div>

    <div class="flex flex-col gap-4">
      <div v-for="(phase, index) in phases" :key="index" class="flex flex-col gap-1">
        <!-- Label and value -->
        <div class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-text-muted">{{ phase.label }}</span>
          <span class="text-gray-900 dark:text-white font-mono">{{ phase.value }} {{ phase.unit }}</span>
        </div>

        <!-- Progress bar -->
        <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-[#111722]">
          <div
            :style="{ width: phase.percentage + '%' }"
            :class="[
              'h-full rounded-full transition-all',
              phase.color
            ]"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Phase {
  label: string
  value: number | string
  unit: string
  percentage: number
  color: string
}

interface Props {
  title: string
  phases: Phase[]
}

defineProps<Props>()
</script>
