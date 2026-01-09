<template>
  <div class="flex flex-col rounded-xl bg-white dark:bg-[#1c2534] border border-gray-200 dark:border-[#2a3649] overflow-hidden">
    <!-- Header with search -->
    <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a3649]">
      <h3 class="text-gray-900 dark:text-white text-lg font-bold">{{ title }}</h3>

      <!-- Search input -->
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-600 dark:text-text-muted text-lg">
          search
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search..."
          class="h-9 w-64 rounded-lg border border-gray-300 dark:border-[#324467] bg-gray-50 dark:bg-[#111722] pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <!-- Header -->
        <thead class="bg-gray-50 dark:bg-[#1a2333] text-xs uppercase text-gray-600 dark:text-text-muted border-b border-gray-200 dark:border-[#2a3649]">
          <tr>
            <th class="px-6 py-4 font-medium">{{ columnLabels[0] }}</th>
            <th class="px-6 py-4 font-medium">{{ columnLabels[1] }}</th>
            <th class="px-6 py-4 font-medium">{{ columnLabels[2] }}</th>
            <th class="px-6 py-4 font-medium">{{ columnLabels[3] }}</th>
            <th class="px-6 py-4 font-medium">{{ columnLabels[4] }}</th>
            <th class="px-6 py-4 font-medium text-right">{{ columnLabels[5] }}</th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="divide-y divide-gray-200 dark:divide-[#2a3649] text-sm text-gray-900 dark:text-white">
          <tr v-for="(item, index) in filteredItems" :key="index" class="hover:bg-gray-50 dark:hover:bg-[#232f48] transition-colors">
            <!-- Equipment name with icon -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  :style="{ backgroundColor: getIconBgColor(item.icon) }"
                  class="h-8 w-8 rounded flex items-center justify-center"
                >
                  <span :style="{ color: getIconColor(item.icon) }" class="material-symbols-outlined text-lg">
                    {{ item.icon }}
                  </span>
                </div>
                <span class="font-medium">{{ item.name }}</span>
              </div>
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span
                :class="[
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                  getStatusClasses(item.status)
                ]"
              >
                {{ item.status }}
              </span>
            </td>

            <!-- Consumption -->
            <td class="px-6 py-4 font-mono">{{ item.consumption }}</td>

            <!-- Load percentage -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <span class="w-8 text-right font-mono text-xs">{{ item.load }}%</span>
                <div class="h-1.5 w-24 rounded-full bg-gray-200 dark:bg-[#111722]">
                  <div
                    :style="{ width: item.load + '%' }"
                    :class="['h-full rounded-full transition-all', getLoadBarColor(item.load)]"
                  ></div>
                </div>
              </div>
            </td>

            <!-- Last event -->
            <td class="px-6 py-4 text-gray-600 dark:text-text-muted">{{ item.lastEvent }}</td>

            <!-- Actions -->
            <td class="px-6 py-4 text-right">
              <button class="text-gray-600 dark:text-text-muted hover:text-gray-900 dark:hover:text-white transition-colors">
                <span class="material-symbols-outlined">more_vert</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer with pagination -->
    <div v-if="showPagination" class="p-4 border-t border-gray-200 dark:border-[#2a3649] bg-gray-50 dark:bg-[#1a2333]">
      <div class="flex items-center justify-between text-xs text-gray-600 dark:text-text-muted">
        <p>Showing {{ filteredItems.length }} of {{ items.length }} equipment</p>
        <div class="flex gap-2">
          <button class="px-2 py-1 hover:text-gray-900 dark:hover:text-white transition-colors">Previous</button>
          <button class="px-2 py-1 text-gray-900 dark:text-white font-bold">1</button>
          <button class="px-2 py-1 hover:text-gray-900 dark:hover:text-white transition-colors">2</button>
          <button class="px-2 py-1 hover:text-gray-900 dark:hover:text-white transition-colors">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Equipment {
  name: string
  icon: string
  status: 'En ligne' | 'Arrêt' | 'Maintenance'
  consumption: string
  load: number
  lastEvent: string
}

interface Props {
  title: string
  columnLabels: string[]
  items: Equipment[]
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPagination: true
})

const searchQuery = ref('')

const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items
  const query = searchQuery.value.toLowerCase()
  return props.items.filter((item: Equipment) => item.name.toLowerCase().includes(query))
})

function getIconBgColor(icon: string): string {
  const colors: Record<string, string> = {
    ac_unit: '#3b82f620',
    dns: '#a855f720',
    precision_manufacturing: '#f97316aa20'
  }
  return colors[icon] || '#3b82f620'
}

function getIconColor(icon: string): string {
  const colors: Record<string, string> = {
    ac_unit: '#3b82f6',
    dns: '#a855f7',
    precision_manufacturing: '#f97316'
  }
  return colors[icon] || '#3b82f6'
}

function getStatusClasses(status: string): string {
  const classes: Record<string, string> = {
    'En ligne': 'bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500',
    'Arrêt': 'bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500',
    'Maintenance': 'bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-500'
  }
  return classes[status] || classes['En ligne']
}

function getLoadBarColor(load: number): string {
  if (load < 50) return 'bg-green-500'
  if (load < 80) return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>
