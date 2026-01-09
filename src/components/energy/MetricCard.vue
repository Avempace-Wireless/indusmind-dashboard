<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <div class="text-sm text-gray-600 mb-2">{{ date }}</div>
    <div class="text-3xl font-bold text-gray-900">{{ formattedValue }}</div>
    <div class="text-sm text-gray-500 mt-1">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  date: string
  value: number // MWh
  label?: string
}>()

const formattedValue = computed(() => `${props.value.toFixed(3)} MWh`)
</script>
