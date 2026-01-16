<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click.self="close"
  >
    <!-- Overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>

    <!-- Modal -->
    <div class="flex min-h-screen items-center justify-center p-4">
      <div
        class="relative w-full max-w-2xl rounded-lg bg-white dark:bg-slate-900 shadow-xl transform transition-all"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              {{ $t('thermal.manageSensors') }}
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {{ $t('common.selectUpTo') }}
              <span class="font-semibold">{{ MAX_SELECTABLE_SENSORS }}</span>
              {{ $t('common.items') }}
              ({{ selectedCount }}/{{ MAX_SELECTABLE_SENSORS }})
            </p>
          </div>
          <button
            @click="close"
            class="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Search Input -->
          <div class="mb-6">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('common.search')"
              class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="flex items-center justify-center py-8">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mb-2"></div>
              <p class="text-slate-600 dark:text-slate-400">{{ $t('common.loading') }}</p>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredSensors.length === 0" class="text-center py-8">
            <span class="material-symbols-outlined text-4xl text-slate-400 mb-2 block">
              thermometer
            </span>
            <p class="text-slate-600 dark:text-slate-400">
              {{ $t('common.noResults') }}
            </p>
          </div>

          <!-- Sensors List with Pagination -->
          <div v-else>
            <!-- Sensors Grid -->
            <div class="space-y-2 mb-6 max-h-96 overflow-y-auto">
              <div
                v-for="sensor in paginatedSensors"
                :key="sensor.id"
                @click="toggleSensor(sensor.id)"
                class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                :class="[
                  isSensorSelected(sensor.id)
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
                ]"
              >
                <!-- Checkbox -->
                <input
                  type="checkbox"
                  :checked="isSensorSelected(sensor.id)"
                  :disabled="!isSensorSelected(sensor.id) && !canSelectMore"
                  class="w-4 h-4 rounded cursor-pointer"
                  @click.stop="toggleSensor(sensor.id)"
                />

                <!-- Sensor Info -->
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-900 dark:text-white truncate">
                    {{ sensor.name }}
                  </p>
                  <p class="text-sm text-slate-600 dark:text-slate-400 truncate">
                    {{ sensor.label || sensor.zone }}
                  </p>
                </div>

                <!-- Color Indicator (if selected) -->
                <div
                  v-if="isSensorSelected(sensor.id)"
                  class="w-4 h-4 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: getSensorColor(sensor.id) }"
                ></div>
              </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex items-center justify-between mb-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {{ $t('common.previous') }}
              </button>

              <span class="text-sm text-slate-600 dark:text-slate-400">
                {{ $t('common.page') }} {{ currentPage }} {{ $t('common.of') }} {{ totalPages }}
              </span>

              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                {{ $t('common.next') }}
              </button>
            </div>

            <!-- Items Per Page -->
            <div class="flex items-center justify-center gap-2 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <span class="text-sm text-slate-600 dark:text-slate-400">{{ $t('common.itemsPerPage') }}</span>
              <select
                v-model.number="itemsPerPage"
                class="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="15">15</option>
                <option :value="20">20</option>
              </select>
            </div>

            <!-- Selection Info -->
            <div class="text-center text-sm text-slate-600 dark:text-slate-400 mb-4">
              {{ selectedCount }}/{{ MAX_SELECTABLE_SENSORS }} {{ $t('common.selected') }}
              <span v-if="selectedCount === MAX_SELECTABLE_SENSORS" class="block mt-1 text-amber-600 dark:text-amber-400">
                {{ $t('common.maxSelectionReached') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
          <button
            @click="clearSelection"
            class="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {{ $t('common.clearAll') }}
          </button>
          <button
            @click="apply"
            class="flex-1 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium transition"
          >
            {{ $t('common.apply') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSensorsStore } from '@/stores/useSensorsStore'
import type { Sensor } from '@/services/deviceAPI'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  apply: [sensorIds: string[]]
}>()

const sensorsStore = useSensorsStore()

// Local state
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Get constant
const MAX_SELECTABLE_SENSORS = sensorsStore.MAX_SELECTABLE_SENSORS

// Fetch sensors on mount
const isLoading = computed(() => sensorsStore.isLoading)
const error = computed(() => sensorsStore.error)

// Filtered sensors based on search
const filteredSensors = computed(() => {
  if (!searchQuery.value.trim()) {
    return sensorsStore.allSensors
  }

  const query = searchQuery.value.toLowerCase()
  return sensorsStore.allSensors.filter(sensor =>
    sensor.name.toLowerCase().includes(query) ||
    ((sensor.label ?? sensor.zone ?? '')).toLowerCase().includes(query)
  )
})

// Pagination
const totalPages = computed(() =>
  Math.ceil(filteredSensors.value.length / itemsPerPage.value)
)

const paginatedSensors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSensors.value.slice(start, end)
})

// Selection state
const localSelectedIds = ref<string[]>([...sensorsStore.selectedSensorIds])

const selectedCount = computed(() => localSelectedIds.value.length)
const canSelectMore = computed(
  () => selectedCount.value < MAX_SELECTABLE_SENSORS
)

// Methods
function isSensorSelected(sensorId: string): boolean {
  return localSelectedIds.value.includes(sensorId)
}

function getSensorColor(sensorId: string): string {
  return sensorsStore.getSensorColor(sensorId)
}

function toggleSensor(sensorId: string) {
  const idx = localSelectedIds.value.indexOf(sensorId)
  if (idx > -1) {
    localSelectedIds.value.splice(idx, 1)
  } else if (canSelectMore.value) {
    localSelectedIds.value.push(sensorId)
  }
}

function clearSelection() {
  localSelectedIds.value = []
}

function apply() {
  sensorsStore.setSelectedSensors(localSelectedIds.value)
  emit('apply', localSelectedIds.value)
  close()
}

function close() {
  // Reset to previous state
  localSelectedIds.value = [...sensorsStore.selectedSensorIds]
  searchQuery.value = ''
  currentPage.value = 1
  emit('close')
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Watch for page changes or filtered results
watch(() => filteredSensors.value.length, () => {
  currentPage.value = 1
})

// Watch for open state and fetch sensors if needed
watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal && sensorsStore.allSensors.length === 0) {
      await sensorsStore.fetchSensors()
    }
  }
)
</script>

<style scoped>
/* Smooth animations */
.fixed {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
