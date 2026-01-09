<template>
  <div class="bg-white rounded-lg shadow-sm border p-4">
    <div class="flex items-center justify-between mb-4">
      <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <div class="font-semibold text-sm">{{ monthLabel }}</div>
      <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center text-xs mb-2">
      <div v-for="day in weekDays" :key="day" class="text-gray-500 font-medium py-1">{{ day }}</div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div v-for="(day, idx) in calendarDays" :key="idx">
        <button
          v-if="day"
          @click="toggleDate(day.dateStr)"
          @mousedown="startDrag(day.dateStr)"
          @mouseenter="onDragOver(day.dateStr)"
          @mouseup="endDrag"
          :class="[
            'w-full aspect-square rounded text-xs font-medium transition-colors',
            isSelected(day.dateStr) ? 'bg-green-500 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700',
            !day.inMonth ? 'opacity-40' : ''
          ]"
        >
          {{ day.day }}
        </button>
        <div v-else class="w-full aspect-square"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  selectedDates: string[]
}>()

const emit = defineEmits<{
  'update:selectedDates': [dates: string[]]
}>()

const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const isDragging = ref(false)
const dragStartDate = ref<string | null>(null)

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const monthLabel = computed(() => {
  const monthNames = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC']
  return `${monthNames[currentMonth.value]} ${currentYear.value}`
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = (firstDay.getDay() + 6) % 7 // Monday = 0

  const days: Array<{ day: number; dateStr: string; inMonth: boolean } | null> = []

  // Add empty cells for days before month start
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevMonthDay = new Date(currentYear.value, currentMonth.value, -(startDayOfWeek - i - 1))
    days.push({
      day: prevMonthDay.getDate(),
      dateStr: formatDate(prevMonthDay),
      inMonth: false
    })
  }

  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear.value, currentMonth.value, day)
    days.push({
      day,
      dateStr: formatDate(date),
      inMonth: true
    })
  }

  // Fill remaining cells
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const nextMonthDay = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push({
      day: i,
      dateStr: formatDate(nextMonthDay),
      inMonth: false
    })
  }

  return days
})

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isSelected(dateStr: string): boolean {
  return props.selectedDates.includes(dateStr)
}

function toggleDate(dateStr: string) {
  const selected = [...props.selectedDates]
  const index = selected.indexOf(dateStr)

  if (index >= 0) {
    selected.splice(index, 1)
  } else {
    selected.push(dateStr)
  }

  emit('update:selectedDates', selected.sort())
}

function startDrag(dateStr: string) {
  isDragging.value = true
  dragStartDate.value = dateStr
}

function onDragOver(dateStr: string) {
  if (isDragging.value && dragStartDate.value) {
    // Select range between dragStartDate and current date
    const start = dragStartDate.value
    const end = dateStr
    const range = getDateRange(start, end)
    emit('update:selectedDates', range)
  }
}

function endDrag() {
  isDragging.value = false
  dragStartDate.value = null
}

function getDateRange(start: string, end: string): string[] {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const [first, last] = startDate <= endDate ? [startDate, endDate] : [endDate, startDate]

  const dates: string[] = []
  const current = new Date(first)

  while (current <= last) {
    dates.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}
</script>
