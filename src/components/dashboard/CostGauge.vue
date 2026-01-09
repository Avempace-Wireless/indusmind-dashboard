<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('compteur.realTimeCost') }}</h3>
      <div class="text-xs text-gray-500 dark:text-gray-400">per hour</div>
    </div>

    <div class="h-48 flex flex-col justify-center">
      <div class="text-center">
        <div class="flex items-baseline justify-center gap-1">
          <span class="text-5xl font-bold text-gray-900 dark:text-white">{{ currencySymbol }}{{ formattedCost }}</span>
          <span class="text-2xl text-gray-500 dark:text-gray-400">/hr</span>
        </div>

        <div class="mt-4 flex items-center justify-center gap-2">
          <span :class="savingsClass" class="flex items-center gap-1">
            <svg v-if="savings > 0" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            {{ currencySymbol }}{{ Math.abs(savings).toFixed(2) }}
          </span>
          <span class="text-sm text-gray-400">{{ savings > 0 ? 'saved' : 'over budget' }}</span>
        </div>
      </div>

      <!-- Daily/Monthly Projection -->
      <div class="mt-6 grid grid-cols-2 gap-4">
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p class="text-xs text-gray-500 dark:text-gray-400">Today</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ currencySymbol }}{{ dailyCost }}</p>
        </div>
        <div class="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded">
          <p class="text-xs text-gray-500 dark:text-gray-400">Month (Est.)</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ currencySymbol }}{{ monthlyCost }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  costPerHour: number
  baseline: number
  currency?: string
}

const props = withDefaults(defineProps<Props>(), {
  costPerHour: 0,
  baseline: 0,
  currency: 'TND',
})

const currencySymbol = computed(() => {
  const symbols: Record<string, string> = {
    'TND': 'د.ت',
    'EUR': '€',
    'USD': '$',
  }
  return symbols[props.currency] || props.currency + ' '
})

const formattedCost = computed(() => props.costPerHour.toFixed(2))

const savings = computed(() => props.baseline - props.costPerHour)

const savingsClass = computed(() => {
  if (savings.value > 0) return 'text-green-600 dark:text-green-400 font-medium'
  if (savings.value < 0) return 'text-red-600 dark:text-red-400 font-medium'
  return 'text-gray-600 dark:text-gray-400 font-medium'
})

const dailyCost = computed(() => (props.costPerHour * 24).toFixed(2))

const monthlyCost = computed(() => (props.costPerHour * 24 * 30).toFixed(0))
</script>
