<template>
  <div class="space-y-4">
    <!-- Breadcrumbs -->
    <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
      <router-link
        v-for="(breadcrumb, index) in breadcrumbs"
        :key="index"
        :to="breadcrumb.to"
        :class="[
          'hover:text-gray-900 dark:hover:text-white transition-colors',
          breadcrumb.active ? 'text-gray-900 dark:text-white' : ''
        ]"
      >
        {{ breadcrumb.label }}
      </router-link>
    </nav>

    <!-- Header -->
    <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ title }}</h1>
            <slot name="badge" />
          </div>
          <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {{ subtitle }}
          </p>
        </div>
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Breadcrumb {
  label: string
  to: string
  active?: boolean
}

defineProps<{
  title: string
  subtitle?: string
  breadcrumbs: Breadcrumb[]
}>()
</script>
