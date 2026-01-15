<template>
  <AdminLayout>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">Logo</div>
        <div>
          <div class="text-sm text-gray-500">Consommation électrique</div>
          <div class="text-2xl font-bold">Puissance</div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- Primary Meter Selection -->
        <button
          @click="showMeterSelector = true"
          class="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium flex items-center gap-2 transition"
        >
          <span class="material-symbols-outlined">tune</span>
          {{ primaryMeter ? primaryMeter.name : 'Select Meter' }}
        </button>

        <!-- Comparison Toggle -->
        <button
          @click="showComparisonPanel = !showComparisonPanel"
          :class="['px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition', showComparisonPanel ? 'bg-secondary-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']"
        >
          <span class="material-symbols-outlined">compare_arrows</span>
          Compare
        </button>
      </div>
    </div>

    <!-- Meter Selector Modal -->
    <MeterSelector
      :is-open="showMeterSelector"
      @apply="handlePrimaryMeterSelection"
      @close="showMeterSelector = false"
    />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="lg:col-span-2 grid grid-cols-3 gap-4">
        <KPICard v-for="(k, idx) in kpiList" :key="idx" :title="k.title" :meterName="meters[selectedMeter].name" :value="k.value" :unit="k.unit || 'kW'" :meterColor="meters[selectedMeter].color"/>
      </div>

      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow p-4 border">
          <div class="flex items-center justify-between mb-2">
            <div class="font-semibold">Détails compteur</div>
            <div class="text-sm text-gray-500">Couleur</div>
          </div>
          <div class="mt-4">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded" :style="{ backgroundColor: meters[selectedMeter].color }"></div>
              <div>{{ meters[selectedMeter].name }}</div>
            </div>
            <div class="mt-4 text-sm text-gray-600">Sélectionnez un compteur pour mettre à jour les graphiques et tableaux.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="lg:col-span-1">
        <PowerBarChart :labels="monthlyLabels" :data="monthlyData" :color="meters[selectedMeter].color" title="Puissance mensuelle – Année en cours" />
      </div>
      <div class="lg:col-span-1">
        <PowerBarChart :labels="dailyLabels" :data="dailyData" :color="meters[selectedMeter].color" title="Puissance journalière – Mois en cours" />
      </div>
      <div class="lg:col-span-1">
        <PowerBarChart :labels="hourlyLabels" :data="hourlyData" :color="meters[selectedMeter].color" title="Puissance heure par heure – Aujourd’hui" :highlightIndex="currentHourIndex" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="lg:col-span-1">
        <DataTable title="Realtime – last day" realtimeLabel="Puissance heure par heure" :columns="hourlyColumns" :data="hourlyTableRows" :itemsPerPage="8" />
      </div>
      <div class="lg:col-span-1">
        <DataTable title="Realtime – current month so far" realtimeLabel="Puissance totale 24h" :columns="dailyColumns" :data="dailyTableRows" :itemsPerPage="8" />
      </div>
      <div class="lg:col-span-1">
        <DataTable title="Realtime – current month so far" realtimeLabel="Puissance moyenne journalière" :columns="dailyAvgColumns" :data="dailyAvgRows" :itemsPerPage="8" />
      </div>
    </div>

    <div class="mt-12 text-center text-sm text-gray-500">
      <div>v1.0.3</div>
      <div>Powered by Indusmind</div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import MeterSelector from '@/components/common/MeterSelector.vue'
import KPICard from '@/components/puissance/KPICard.vue'
import PowerBarChart from '@/components/puissance/PowerBarChart.vue'
import DataTable from '@/components/puissance/DataTable.vue'
import { reactive, ref, computed, onMounted } from 'vue'
import { useMetersStore } from '@/stores/useMetersStore'
import { puissanceMeters, meterList as importedMeterList } from '@/data/puissanceMock'

const meters = puissanceMeters as any
const meterList = importedMeterList
const metersStore = useMetersStore()

// Initialize default meter selection on mount
onMounted(() => {
  // Restore selection from localStorage or set default (first 8 meters)
  metersStore.restoreSelection()
})

// UI State
const showMeterSelector = ref(false)
const showComparisonPanel = ref(false)

// Primary meter selection
const primaryMeter = computed(() => metersStore.selectedMeters[0] || null)

function handlePrimaryMeterSelection(meterIds: string[]) {
  metersStore.setSelectedMeters([meterIds[0]]) // Only keep first as primary
  showMeterSelector.value = false
}

// For backward compatibility with existing data structure
const selectedMeter = computed(() => {
  if (primaryMeter.value) {
    return importedMeterList.find(m => m === primaryMeter.value.id) || 'compresseur'
  }
  return 'compresseur'
})

// KPI list derived from selected meter
const kpiList = computed(()=>{
  const k = meters[selectedMeter.value].kpis
  return [
    { title: 'Puissance moyenne du mois dernier', value: k.avgLastMonth, unit: 'kW' },
    { title: 'Puissance moyenne ce mois-ci', value: k.avgThisMonth, unit: 'kW' },
    { title: 'Puissance moyenne hier', value: k.avgYesterday, unit: 'kW' },
    { title: "Puissance moyenne aujourd'hui", value: k.avgToday, unit: 'kW' },
    { title: 'Puissance moyenne avant-hier', value: k.avgDayBeforeYesterday, unit: 'kW' },
    { title: "Puissance instantanée (cette heure)", value: k.instantThisHour, unit: 'kW' },
  ]
})

// Charts data
const monthlyLabels = computed(()=> meters[selectedMeter.value].monthlyPower.map((p:any)=> p.date))
const monthlyData = computed(()=> meters[selectedMeter.value].monthlyPower.map((p:any)=> p.value))
const dailyLabels = computed(()=> meters[selectedMeter.value].dailyPower.map((p:any)=> p.date))
const dailyData = computed(()=> meters[selectedMeter.value].dailyPower.map((p:any)=> p.value))
const hourlyLabels = computed(()=> meters[selectedMeter.value].hourlyPower.map((p:any)=> new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })))
const hourlyData = computed(()=> meters[selectedMeter.value].hourlyPower.map((p:any)=> p.value))

const currentHourIndex = new Date().getHours()

// Tables
const hourlyTableRows = computed(()=> meters[selectedMeter.value].hourlyPower.map((p:any)=> ({ timestamp: p.timestamp, power: p.value })))
const dailyTableRows = computed(()=> meters[selectedMeter.value].dailyPower.map((p:any)=> ({ date: p.date, power: p.value })))
const dailyAvgRows = computed(()=> meters[selectedMeter.value].dailyPower.map((p:any)=> ({ date: p.date, avg: p.value })))

const hourlyColumns = [{ key: 'timestamp', label: 'Timestamp' }, { key: 'power', label: 'Puissance (kW)' }]
const dailyColumns = [{ key: 'date', label: 'Date' }, { key: 'power', label: 'Puissance journalière (kW)' }]
const dailyAvgColumns = [{ key: 'date', label: 'Date' }, { key: 'avg', label: 'Puissance moyenne journalière (kW)' }]
</script>
