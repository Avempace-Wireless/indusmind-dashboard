<template>
  <AdminLayout>
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Historique</h1>
      <p class="text-gray-600">Energy & Environmental Monitoring Dashboard</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Left Sidebar Controls -->
      <div class="lg:col-span-1 space-y-4">
        <div class="bg-white rounded-lg p-4 shadow border">
          <h3 class="font-semibold mb-2">Domaines</h3>
          <div class="flex flex-col gap-2">
            <button class="px-3 py-2 rounded text-left hover:bg-slate-50">Électricité</button>
            <button class="px-3 py-2 rounded text-left hover:bg-slate-50">Variables environnement</button>
            <button class="px-3 py-2 rounded text-left hover:bg-slate-50">Pression</button>
            <button class="px-3 py-2 rounded text-left hover:bg-slate-50">Température</button>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 shadow border">
          <h3 class="font-semibold mb-2">Compteurs</h3>
          <div v-for="m in meters" :key="m.id" class="flex items-center gap-2">
            <input type="checkbox" :id="m.id" v-model="selectedMeterIds" :value="m.id" />
            <label :for="m.id">{{ m.name }}</label>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 shadow border">
          <h3 class="font-semibold mb-2">Mesures</h3>
          <div class="flex flex-col gap-2">
            <label><input type="checkbox" v-model="measures" value="energy" /> Énergie</label>
            <label><input type="checkbox" v-model="measures" value="power" /> Puissance</label>
            <label><input type="checkbox" v-model="measures" value="temp" /> Température</label>
          </div>
        </div>
      </div>

      <!-- Main content: Filters + Chart -->
      <div class="lg:col-span-3 space-y-4">
                <div class="bg-white rounded-lg p-4 shadow border flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div>
                    <label class="text-sm">Période</label>
                    <select v-model="duration" class="ml-2 border rounded px-2 py-1">
                      <option value="hour">Horaire</option>
                      <option value="day">Journalier</option>
                      <option value="month">Mensuel</option>
                    </select>
                  </div>

                  <div>
                    <label class="text-sm">Mode</label>
                    <div class="inline-flex ml-2">
                      <button @click="periodMode='single'" :class="periodMode==='single'? 'bg-blue-500 text-white':'bg-gray-100'" class="px-3 py-1">Un jour</button>
                      <button @click="periodMode='range'" :class="periodMode==='range'? 'bg-blue-500 text-white':'bg-gray-100'" class="px-3 py-1">Plusieurs jours</button>
                    </div>
                  </div>

                </div>
                <div class="flex flex-col items-end gap-2">
                  <CalendarRange @update:range="onRangeUpdate" label="Période" />
                  <div class="flex gap-2">
                    <button @click="exportImage" class="px-3 py-2 bg-gray-100 rounded">Télécharger le graphique</button>
                    <button @click="exportCsv" class="px-3 py-2 bg-gray-100 rounded">Télécharger les données</button>
                  </div>
                </div>
              </div>

        <div class="bg-white rounded-lg p-4 shadow border">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold">Graphique</h3>
              <p class="text-sm text-gray-500">Comparaison multi-compteurs</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-sm">
n                <div class="text-xl font-bold">{{ totalConsumption }} kWh</div>
                Consommation totale
                <div class="text-xl font-bold">{{ totalConsumption }} kWh</div>
              </div>
              <div>
                <label class="text-sm">Afficher zoom</label>
                <input type="checkbox" v-model="showZoom" />
              </div>
            </div>
          </div>

          <HistoryChart :meters="filteredActiveMeters" :duration="duration" :show-zoom="showZoom" />

        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { ref, computed } from 'vue'
import HistoryChart from '@/components/historique/HistoryChart.vue'
import { mockMeters } from '@/data/historiqueData'

import CalendarRange from '@/components/historique/CalendarRange.vue'

const duration = ref<'hour'|'day'|'month'>('hour')
const periodMode = ref<'single'|'range'>('single')
const singleDate = ref(new Date().toISOString().substring(0,10))
const rangeStart = ref(new Date().toISOString().substring(0,10))
const rangeEnd = ref(new Date().toISOString().substring(0,10))
const showZoom = ref(true)

const meters = ref(mockMeters)
const selectedMeterIds = ref<string[]>([meters.value[0].id])
const measures = ref<string[]>(['energy'])

function toDateStart(dStr: string) {
  const d = new Date(dStr)
  d.setHours(0,0,0,0)
  return d
}
function toDateEnd(dStr: string) {
  const d = new Date(dStr)
  d.setHours(23,59,59,999)
  return d
}

const filteredActiveMeters = computed(() => {
  const start = toDateStart(rangeStart.value)
  const end = toDateEnd(rangeEnd.value)
  return meters.value
    .filter(m => selectedMeterIds.value.includes(m.id))
    .map(m => ({
      ...m,
      series: m.series.filter(p => {
        const t = new Date(p.timestamp)
        return t >= start && t <= end
      })
    }))
})

const totalConsumption = computed(() => {
  // simple sum for mock over filtered series
  const sum = filteredActiveMeters.value.reduce((sumAcc, m) => sumAcc + m.series.reduce((a,b)=>a+b.value,0),0)
  return sum.toFixed(2)
})

function exportImage(){
  // placeholder
  alert('Export image')
}
function exportCsv(){
  // placeholder
  alert('Export CSV')
}

function onRangeUpdate(payload: { start: string; end: string }){
  rangeStart.value = payload.start
  rangeEnd.value = payload.end
}
</script>
