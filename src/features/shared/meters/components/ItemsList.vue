<template>
  <div :class="containerClass">
    <div v-if="items.length === 0" class="text-center py-12">
      <span class="material-symbols-outlined text-5xl mb-3 block text-gray-400">{{ emptyIcon }}</span>
      <p class="text-gray-600 dark:text-gray-400">{{ emptyLabel }}</p>
    </div>

    <div v-else class="space-y-4">
      <slot name="items" :items="items" />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4">
      <button
        @click="$emit('prev-page')"
        :disabled="currentPage === 1"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      >
        {{ prevLabel }}
      </button>

      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ currentPage }} / {{ totalPages }}
        </span>
      </div>

      <button
        @click="$emit('next-page')"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
      >
        {{ nextLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: any[]
  totalPages: number
  currentPage: number
  emptyIcon?: string
  emptyLabel?: string
  containerClass?: string
  prevLabel?: string
  nextLabel?: string
}>()

const emit = defineEmits<{
  'prev-page': []
  'next-page': []
}>()
</script>
