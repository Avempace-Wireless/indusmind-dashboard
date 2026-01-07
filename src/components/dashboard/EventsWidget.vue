<template>
  <div class="flex flex-col rounded-xl bg-white dark:bg-[#1c2534] border border-gray-200 dark:border-[#2a3649] overflow-hidden flex-1">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2a3649]">
      <h3 class="text-gray-900 dark:text-white text-base font-bold">{{ title }}</h3>
      <button class="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
        {{ actionLabel }}
      </button>
    </div>

    <!-- Events list -->
    <div class="flex flex-col overflow-y-auto max-h-[300px]">
      <div
        v-for="(event, index) in events"
        :key="index"
        :class="[
          'flex gap-3 p-4 hover:bg-gray-50 dark:hover:bg-[#232f48] transition-colors cursor-pointer',
          index < events.length - 1 ? 'border-b border-gray-200 dark:border-[#2a3649]' : ''
        ]"
      >
        <!-- Event icon -->
        <div
          :class="[
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            getSeverityClass(event.severity)
          ]"
        >
          <span class="material-symbols-outlined text-lg">{{ event.icon }}</span>
        </div>

        <!-- Event content -->
        <div class="flex flex-col gap-0.5 flex-1">
          <p class="text-gray-900 dark:text-white text-sm font-medium">{{ event.message }}</p>
          <p class="text-gray-600 dark:text-text-muted text-xs">{{ event.time }} • {{ event.location }}</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="events.length === 0" class="flex flex-col items-center justify-center py-8 text-gray-600 dark:text-text-muted">
        <span class="material-symbols-outlined text-4xl mb-2">check_circle</span>
        <p class="text-sm">No recent events</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Event {
  message: string
  time: string
  location: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  icon: string
}

interface Props {
  title: string
  actionLabel: string
  events: Event[]
}

defineProps<Props>()

function getSeverityClass(severity: string): string {
  const classes: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-500',
    warning: 'bg-orange-500/10 text-orange-500',
    info: 'bg-blue-500/10 text-blue-500',
    success: 'bg-green-500/10 text-green-500'
  }
  return classes[severity] || classes.info
}
</script>
