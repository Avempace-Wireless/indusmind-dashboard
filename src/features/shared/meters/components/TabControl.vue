<template>
  <div class="w-full space-y-4">
    <!-- Tabs -->
    <div v-if="tabs.length > 1" class="flex gap-2 border-b border-gray-200 dark:border-gray-700">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('select-tab', tab.id)"
        :class="[
          'px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px]',
          activeTab === tab.id
            ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400'
            : 'text-gray-600 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
        ]"
      >
        <div class="flex items-center gap-2">
          <span v-if="tab.icon" class="material-symbols-outlined text-lg">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span v-if="tab.badge" class="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-teal-600 rounded-full">
            {{ tab.badge }}
          </span>
        </div>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="mt-6">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Tab {
  id: string
  label: string
  icon?: string
  badge?: number | string
}

defineProps<{
  tabs: Tab[]
  activeTab: string
}>()

const emit = defineEmits<{
  'select-tab': [tabId: string]
}>()
</script>
