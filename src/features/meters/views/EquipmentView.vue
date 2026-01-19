<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Breadcrumbs -->
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Equipment</span>
      </nav>

      <!-- Header -->
      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Equipment Monitoring</h1>
              <span class="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {{ equipmentList.length }} devices monitored • {{ activeCount }} online
            </p>
          </div>
        <div class="flex gap-2">
          <button class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2">
            <span class="material-symbols-outlined">tune</span>
            Filters
          </button>
          <button class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition flex items-center gap-2">
            <span class="material-symbols-outlined">add</span>
            Add Equipment
          </button>
        </div>
        </div>
      </div>

      <!-- Equipment Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="equipment in equipmentList"
          :key="equipment.id"
          class="flex flex-col rounded-xl bg-white dark:bg-[#1c2534] border border-gray-200 dark:border-[#2a3649] p-6 hover:shadow-lg dark:hover:shadow-black/30 transition-shadow cursor-pointer group"
        >
          <!-- Equipment Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div
                :style="{ backgroundColor: getStatusColor(equipment.status) + '20' }"
                class="h-10 w-10 rounded-lg flex items-center justify-center"
              >
                <span
                  :style="{ color: getStatusColor(equipment.status) }"
                  class="material-symbols-outlined"
                >
                  {{ equipment.icon }}
                </span>
              </div>
              <div>
                <h3 class="text-gray-900 dark:text-white font-bold">{{ equipment.name }}</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">{{ equipment.id }}</p>
              </div>
            </div>
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getStatusBadgeClass(equipment.status)
              ]"
            >
              {{ equipment.status }}
            </span>
          </div>

          <!-- Metrics -->
          <div class="space-y-3 mb-4 flex-1">
            <!-- Power Consumption -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Power</span>
              <span class="text-lg font-bold font-mono text-gray-900 dark:text-white">{{ equipment.power }}</span>
            </div>

            <!-- Load Percentage -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Load</span>
              <span class="text-lg font-bold font-mono text-gray-900 dark:text-white">{{ equipment.load }}%</span>
            </div>
            <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-[#111722]">
              <div
                :style="{ width: equipment.load + '%' }"
                :class="[
                  'h-full rounded-full transition-all',
                  equipment.load < 50 ? 'bg-green-500' :
                  equipment.load < 80 ? 'bg-yellow-500' :
                  'bg-red-500'
                ]"
              ></div>
            </div>

            <!-- Temperature -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Temperature</span>
              <span class="text-lg font-bold font-mono text-gray-900 dark:text-white">{{ equipment.temperature }}°C</span>
            </div>
          </div>

          <!-- Last Update -->
          <div class="pb-4 border-t border-gray-200 dark:border-[#2a3649] pt-4 text-xs text-gray-600 dark:text-gray-400">
            Last updated: {{ equipment.lastUpdate }}
          </div>

          <!-- Actions -->
          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="selectedEquipment = equipment" class="flex-1 px-3 py-2 bg-gray-100 dark:bg-[#232f48] hover:bg-gray-200 dark:hover:bg-[#324467] text-gray-900 dark:text-white rounded text-sm font-medium transition">
              <span class="material-symbols-outlined text-lg inline">info</span>
              Details
            </button>
            <button class="flex-1 px-3 py-2 bg-primary-100 dark:bg-primary-500/20 hover:bg-primary-200 dark:hover:bg-primary-500/30 text-primary-600 dark:text-primary-400 rounded text-sm font-medium transition">
              <span class="material-symbols-outlined text-lg inline">tune</span>
              Control
            </button>
          </div>
        </div>
      </div>

      <!-- Equipment Details Modal -->
      <div v-if="selectedEquipment" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="selectedEquipment = null">
        <div class="bg-white dark:bg-[#1c2534] rounded-lg p-6 max-w-2xl w-full m-4" @click.stop>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedEquipment.name }} Details</h2>
            <button @click="selectedEquipment = null" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 dark:bg-[#111722] rounded">
              <p class="text-sm text-gray-600 dark:text-gray-400">Current Power</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedEquipment.power }}</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-[#111722] rounded">
              <p class="text-sm text-gray-600 dark:text-gray-400">Load</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedEquipment.load }}%</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-[#111722] rounded">
              <p class="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedEquipment.temperature }}°C</p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-[#111722] rounded">
              <p class="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p :class="['text-2xl font-bold', getStatusColorClass(selectedEquipment.status)]">{{ selectedEquipment.status }}</p>
            </div>
          </div>
          <button @click="selectedEquipment = null" class="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'

interface Equipment {
  id: string
  name: string
  icon: string
  status: 'Online' | 'Offline' | 'Maintenance'
  power: string
  load: number
  temperature: number
  lastUpdate: string
}

const selectedEquipment = ref<Equipment | null>(null)

const equipmentList: Equipment[] = [
  {
    id: 'EQ-001',
    name: 'Main Panel',
    icon: 'dashboard_customize',
    status: 'Online',
    power: '2.45 kW',
    load: 65,
    temperature: 38,
    lastUpdate: '30 seconds ago'
  },
  {
    id: 'EQ-002',
    name: 'Transformer',
    icon: 'settings',
    status: 'Online',
    power: '1.85 kW',
    load: 48,
    temperature: 42,
    lastUpdate: '1 minute ago'
  },
  {
    id: 'EQ-003',
    name: 'Inverter',
    icon: 'power_settings_new',
    status: 'Online',
    power: '0.92 kW',
    load: 32,
    temperature: 35,
    lastUpdate: '30 seconds ago'
  },
  {
    id: 'EQ-004',
    name: 'Solar Array',
    icon: 'wb_sunny',
    status: 'Online',
    power: '3.12 kW',
    load: 78,
    temperature: 45,
    lastUpdate: '30 seconds ago'
  },
  {
    id: 'EQ-005',
    name: 'Battery Pack',
    icon: 'battery_charging_full',
    status: 'Maintenance',
    power: '0.45 kW',
    load: 22,
    temperature: 28,
    lastUpdate: '5 minutes ago'
  },
  {
    id: 'EQ-006',
    name: 'Backup Gen',
    icon: 'auto_awesome',
    status: 'Offline',
    power: '0.00 kW',
    load: 0,
    temperature: 25,
    lastUpdate: '2 hours ago'
  }
]

const activeCount = computed(() => equipmentList.filter(e => e.status === 'Online').length)

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Online': '#22c55e',
    'Maintenance': '#f97316',
    'Offline': '#ef4444'
  }
  return colors[status] || '#6b7280'
}

function getStatusColorClass(status: string): string {
  const classes: Record<string, string> = {
    'Online': 'text-green-600 dark:text-green-400',
    'Maintenance': 'text-orange-600 dark:text-orange-400',
    'Offline': 'text-red-600 dark:text-red-400'
  }
  return classes[status] || 'text-gray-600 dark:text-gray-400'
}

function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    'Online': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    'Maintenance': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    'Offline': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  }
  return classes[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
}
</script>
