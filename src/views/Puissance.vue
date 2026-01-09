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

      <div class="flex items-center gap-2">
        <button v-for="m in meterList" :key="m" @click="selectMeter(m)"
          :class="['px-4 py-2 rounded font-medium', selectedMeter===m ? 'text-white':'text-gray-700']"
          :style="selectedMeter===m ? {'backgroundColor': meters[m].color } : {'backgroundColor':'#f3f4f6'}">
          {{ meters[m].name }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div class="lg:col-span-2 grid grid-cols-3 gap-4">
        <KpiCard v-for="(k, idx) in kpiList" :key="idx" :title="k.title" :meterName="meters[selectedMeter].name" :value="k.value" :color="meters[selectedMeter].color"/>
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
        <DataTable title="Realtime – last day" subtitle="Puissance heure par heure" :columns="hourlyColumns" :rows="hourlyTableRows" :pageSize="8" rowKey="timestamp" />
      </div>
      <div class="lg:col-span-1">
        <DataTable title="Realtime – current month so far" subtitle="Puissance totale 24h" :columns="dailyColumns" :rows="dailyTableRows" :pageSize="8" rowKey="date" />
      </div>
      <div class="lg:col-span-1">
        <DataTable title="Realtime – current month so far" subtitle="Puissance moyenne journalière" :columns="dailyAvgColumns" :rows="dailyAvgRows" :pageSize="8" rowKey="date" />
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
import KpiCard from '@/components/puissance/KpiCard.vue'
import PowerBarChart from '@/components/puissance/PowerBarChart.vue'
import DataTable from '@/components/puissance/DataTable.vue'
import { reactive, ref, computed } from 'vue'
import { puissanceMeters, meterList } from '@/data/puissanceMock'

const meters = puissanceMeters as any
const meterListRef = meterList

const selectedMeter = ref('compresseur')
function selectMeter(id:string){ selectedMeter.value = id }

// KPI list derived from selected meter
const kpiList = computed(()=>{
  const k = meters[selectedMeter.value].kpis
  return [
    { title: 'Puissance moyenne du mois dernier', value: k.avgLastMonth },
    { title: 'Puissance moyenne ce mois-ci', value: k.avgThisMonth },
    { title: 'Puissance moyenne hier', value: k.avgYesterday },
    { title: "Puissance moyenne aujourd'hui", value: k.avgToday },
    { title: 'Puissance moyenne avant-hier', value: k.avgDayBeforeYesterday },
    { title: "Puissance instantanée (cette heure)", value: k.instantThisHour },
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

// expose to template
const meterList = meterListRef

// initial selection default
selectMeter(selectedMeter.value)
</script>
