<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="period in periods"
      :key="period.value"
      @click="selectPeriod(period.value)"
      :class="[
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border whitespace-nowrap',
        selectedPeriod === period.value
          ? 'text-white shadow-md border-transparent'
          : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
      ]"
      :style="selectedPeriod === period.value ? { backgroundColor: meterColor } : {}"
    >
      <span class="material-symbols-outlined inline mr-2 text-base align-text-bottom">{{ period.icon }}</span>
      {{ period.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  selectedPeriod: 'hour' | 'day' | 'week' | 'month' | 'year'
  meterColor: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  periodChange: [period: 'hour' | 'day' | 'week' | 'month' | 'year']
}>()

const { t } = useI18n()

const periods = computed(() => [
  { value: 'hour' as const, label: t('current.periods.hour'), icon: 'schedule' },
  { value: 'day' as const, label: t('current.periods.day'), icon: 'wb_sunny' },
  { value: 'week' as const, label: t('current.periods.week'), icon: 'date_range' },
  { value: 'month' as const, label: t('current.periods.month'), icon: 'calendar_month' },
  { value: 'year' as const, label: t('current.periods.year'), icon: 'calendar_today' },
])

const selectPeriod = (period: 'hour' | 'day' | 'week' | 'month' | 'year') => {
  emit('periodChange', period)
}
</script>
