<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Total Power</h3>
      <div :class="statusClass">
        <svg class="w-2 h-2 fill-current" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="4" />
        </svg>
      </div>
    </div>

    <div class="relative h-48">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>

    <div class="mt-4 text-center">
      <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ formattedValue }}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">kW</p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
        Target: {{ target }} kW
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  value: number
  target: number
  max: number
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  target: 100,
  max: 150,
})

const formattedValue = computed(() => props.value.toFixed(1))

const percentage = computed(() => (props.value / props.max) * 100)

const statusClass = computed(() => {
  const percent = (props.value / props.target) * 100
  if (percent >= 90) return 'text-red-500'
  if (percent >= 70) return 'text-yellow-500'
  return 'text-green-500'
})

const chartData = computed(() => ({
  labels: ['Current', 'Remaining'],
  datasets: [
    {
      data: [props.value, Math.max(0, props.max - props.value)],
      backgroundColor: [
        props.value / props.target >= 0.9 ? '#ef4444' :
        props.value / props.target >= 0.7 ? '#f59e0b' : '#10b981',
        '#e5e7eb'
      ],
      borderWidth: 0,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '75%',
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context: any) => {
          return `${context.label}: ${context.parsed} kW`
        }
      }
    },
  },
}
</script>
