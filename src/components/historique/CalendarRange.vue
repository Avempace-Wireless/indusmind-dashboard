<template>
  <div class="bg-white rounded-lg p-4 shadow border">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-semibold">Sélecteur de période</h4>
      <div class="text-sm text-gray-500">{{ label }}</div>
    </div>

    <div class="flex gap-2 mb-3">
      <input type="date" v-model="start" class="border rounded px-2 py-1" />
      <input type="date" v-model="end" class="border rounded px-2 py-1" />
    </div>

    <div class="flex gap-2">
      <button @click="selectLast('7')" class="px-3 py-1 bg-gray-100 rounded">7 jours</button>
      <button @click="selectLast('30')" class="px-3 py-1 bg-gray-100 rounded">30 jours</button>
      <button @click="selectLast('90')" class="px-3 py-1 bg-gray-100 rounded">90 jours</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ label?: string }>()
const emit = defineEmits<{
  (e: 'update:range', payload: { start: string; end: string }): void
}>()

const today = new Date()
const toDateInput = (d: Date) => d.toISOString().substring(0,10)
const subDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() - n); return r }
const start = ref(toDateInput(subDays(today, 6)))
const end = ref(toDateInput(today))

watch([start, end], () => {
  emit('update:range', { start: start.value, end: end.value })
})

const selectLast = (days: string) => {
  const n = parseInt(days)
  start.value = toDateInput(subDays(today, n - 1))
  end.value = toDateInput(today)
}
</script>
