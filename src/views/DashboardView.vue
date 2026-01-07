<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <!-- Breadcrumbs & Header -->
      <div class="flex flex-col gap-6">
        <nav class="flex items-center text-sm font-medium text-text-muted">
          <a class="hover:text-white transition-colors" href="#">Accueil</a>
          <span class="mx-2 text-[#324467]">/</span>
          <a class="hover:text-white transition-colors" href="#">Tableau de bord</a>
          <span class="mx-2 text-[#324467]">/</span>
          <span class="text-primary">Temps réel</span>
        </nav>

        <!-- Page title with status -->
        <div class="flex flex-wrap justify-between items-end gap-4 border-b border-border-dark pb-6">
          <div class="flex flex-col gap-2">
            <h1 class="text-white text-3xl font-bold tracking-tight">Surveillance en temps réel</h1>
            <div class="flex items-center gap-3">
              <span :class="[
                'flex h-2.5 w-2.5 rounded-full animate-pulse',
                isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
              ]"></span>
              <p class="text-text-muted text-sm font-mono">
                {{ isConnected ? 'Connecté - ' : 'Déconnecté - ' }}Dernière mise à jour: {{ lastUpdateTime }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button class="flex h-9 items-center gap-2 rounded-lg border border-[#324467] bg-[#1c2534] px-4 text-sm font-medium text-white hover:bg-[#2a3649] transition-colors">
              <span class="material-symbols-outlined text-lg">print</span>
              Imprimer
            </button>
            <button @click="handleExport" :disabled="isExporting" class="flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              <span class="material-symbols-outlined text-lg">download</span>
              <span v-if="!isExporting">Exporter les données</span>
              <span v-else>Export en cours…</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Stats Grid (4 columns) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Puissance Actuelle"
          :value="currentPower"
          unit="kW"
          icon="bolt"
          :trend="2.1"
        />
        <StatCard
          label="Tension Moyenne"
          :value="dashboardStore.averageVoltage"
          unit="V"
          icon="electric_meter"
          :trend="0.1"
        />
        <StatCard
          label="Facteur de Puissance"
          :value="metrics?.averagePowerFactor || 0.98"
          unit=""
          icon="pie_chart"
          :trend="0"
          :show-trend="false"
        />
        <StatCard
          label="Fréquence"
          :value="dashboardStore.averageFrequency"
          unit="Hz"
          icon="waves"
          :trend="-0.01"
        />
      </div>

      <!-- Main Chart & Side Widgets -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Main Chart (2/3 width) -->
        <div class="xl:col-span-2">
          <ConsumptionChart
            title="Consommation en Direct"
            subtitle="Visualisation sur la dernière heure (60 mins)"
            :current-value="`${currentPower.toFixed(1)} kW`"
            peak-value="14:15"
            :data="chartData"
            :labels="chartLabels"
          />
        </div>

        <!-- Side Panel (1/3 width) -->
        <div class="flex flex-col gap-6">
          <!-- Phase Balance Widget -->
          <PhaseBalance
            title="Équilibrage des phases"
            :phases="[
              { label: 'Phase L1', value: 230.1, unit: 'V', percentage: 75, color: 'bg-blue-500' },
              { label: 'Phase L2', value: 229.8, unit: 'V', percentage: 72, color: 'bg-cyan-500' },
              { label: 'Phase L3', value: 230.4, unit: 'V', percentage: 78, color: 'bg-indigo-500' }
            ]"
          />

          <!-- Events Widget -->
          <EventsWidget
            title="Derniers Événements"
            action-label="Voir tout"
            :events="recentEvents"
          />
        </div>
      </div>

      <!-- Equipment Table -->
      <EquipmentTable
        title="État des Équipements Critiques"
        :column-labels="['Nom de l\'équipement', 'Statut', 'Consommation', 'Charge %', 'Dernier event', 'Actions']"
        :items="equipmentItems"
      />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import ConsumptionChart from '@/components/dashboard/ConsumptionChart.vue'
import PhaseBalance from '@/components/dashboard/PhaseBalance.vue'
import EventsWidget from '@/components/dashboard/EventsWidget.vue'
import EquipmentTable from '@/components/dashboard/EquipmentTable.vue'
import { useRealtimeData } from '@/composables/useRealtimeData'
import { historicalAPI } from '@/services/api'

const currentTime = ref(new Date())
const { dashboardStore, equipmentStore, alertsStore, initializeRealtimeData, stopRealtimeData } =
  useRealtimeData()

const lastUpdateTime = computed(() => {
  const hours = currentTime.value.getHours().toString().padStart(2, '0')
  const minutes = currentTime.value.getMinutes().toString().padStart(2, '0')
  const seconds = currentTime.value.getSeconds().toString().padStart(2, '0')
  const date = currentTime.value.toLocaleDateString('fr-FR')
  return `${date}, ${hours}:${minutes}:${seconds}`
})

const metrics = computed(() => dashboardStore.metrics)
const isConnected = computed(() => dashboardStore.isConnected)
const currentPower = computed(() => dashboardStore.currentPower)

// Chart data generation
const chartData = computed(() => {
  const readings = dashboardStore.recentReadings
  return readings.length > 0 ? readings.map((r) => r.power || 0).reverse() : [150, 145, 160, 140, 135, 150, 160]
})

const chartLabels = computed(() => {
  const readings = dashboardStore.recentReadings
  if (readings.length > 0) {
    return readings
      .map((r) => {
        const date = new Date(r.timestamp)
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
      })
      .reverse()
  }
  return ['13:30', '13:40', '13:50', '14:00', '14:10', '14:20', '14:30']
})

// Recent events from alerts - with proper type handling
const recentEvents = computed(() => {
  return alertsStore.alerts.slice(0, 3).map((alert) => {
    const severityMap: Record<string, 'critical' | 'warning' | 'info' | 'success'> = {
      Critical: 'critical',
      High: 'warning',
      Medium: 'info',
      Low: 'info',
      Informational: 'success',
      Emergency: 'critical',
    }
    const iconMap: Record<string, string> = {
      Critical: 'warning',
      High: 'info',
      Medium: 'info',
      Low: 'check_circle',
      Informational: 'check_circle',
      Emergency: 'warning',
    }
    return {
      message: alert.message,
      time: `il y a ${Math.round((Date.now() - alert.detectedAt.getTime()) / 60000)} min`,
      location: alert.equipmentId,
      severity: severityMap[alert.level] || 'info',
      icon: iconMap[alert.level] || 'check_circle',
    }
  })
})

// Equipment items from store - with proper type handling
interface EquipmentTableItem {
  name: string
  icon: string
  status: 'En ligne' | 'Arrêt' | 'Maintenance'
  consumption: string
  load: number
  lastEvent: string
}

const equipmentItems = computed<EquipmentTableItem[]>(() => {
  return equipmentStore.equipment.slice(0, 3).map((eq) => {
    const statusMap: Record<string, 'En ligne' | 'Arrêt' | 'Maintenance'> = {
      Online: 'En ligne',
      Offline: 'Arrêt',
      Maintenance: 'Maintenance',
      Alert: 'Maintenance',
    }
    return {
      name: eq.name,
      icon: 'dns',
      status: statusMap[eq.status] || 'Arrêt',
      consumption: `${(eq.specs?.power || 0).toFixed(1)} kW`,
      load: eq.specs?.load || 0,
      lastEvent: 'Aucun',
    }
  })
})

// Update time every second
let timeInterval: number | null = null

onMounted(async () => {
  // Start real-time data updates
  try {
    await initializeRealtimeData()
  } catch (error) {
    console.error('Failed to initialize real-time data:', error)
  }

  // Update display time every second
  timeInterval = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  // Stop real-time data updates
  stopRealtimeData()

  // Clear time interval
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// Exporter les données
const isExporting = ref(false)
async function handleExport() {
  if (isExporting.value) return
  isExporting.value = true
  try {
    const to = new Date()
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000) // last 24h
    const blob = await historicalAPI.exportData({
      from: from.toISOString(),
      to: to.toISOString(),
      format: 'csv',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'export-donnees.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Export failed:', e)
  } finally {
    isExporting.value = false
  }
}
</script>
