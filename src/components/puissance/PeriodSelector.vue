<template>
  <div>
    <p class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-3">{{ t('puissance.labels.periodSelection') }}</p>

    <!-- Period Buttons -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="period in periods"
        :key="period.value"
        @click="$emit('period-change', period.value)"
        :class="[
          'px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border-2 flex items-center gap-2',
          selectedPeriod === period.value
            ? 'border-transparent text-white shadow-lg'
            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600'
        ]"
        :style="{
          backgroundColor: selectedPeriod === period.value ? meterColor : undefined,
        }"
      >
        <span class="material-symbols-outlined text-lg">{{ period.icon }}</span>
        {{ t(`puissance.periods.${period.value}`) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

interface Props {
  selectedPeriod: 'hour' | 'day' | 'week' | 'month' | 'year'
  meterColor: string
}

defineProps<Props>()

defineEmits<{
  'period-change': [period: 'hour' | 'day' | 'week' | 'month' | 'year']
}>()

const { t } = useI18n()

const periods = [
  { value: 'hour' as const, icon: 'schedule' },
  { value: 'day' as const, icon: 'calendar_today' },
  { value: 'week' as const, icon: 'date_range' },
  { value: 'month' as const, icon: 'calendar_month' },
  { value: 'year' as const, icon: 'event_note' },
]

</script>

<style scoped>
::-webkit-scrollbar {
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

:is(.dark ::-webkit-scrollbar-thumb) {
  background: #475569;
}
</style>
