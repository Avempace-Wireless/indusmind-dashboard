<template>
  <AdminLayout>
    <!-- Header Section -->
    <div class="mb-8">
      <!-- Title & Description -->
      <div class="mb-6">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('puissance.pageTitle') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Real-time power monitoring and analysis for selected equipment meters
        </p>
      </div>

      <!-- Controls Card -->
      <div class="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <!-- Meter Tabs -->
          <div class="flex-1">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              {{ $t('compteur.selector.title') }}
            </p>
            <div class="flex gap-2 overflow-x-auto pb-2">
              <button
                v-for="meter in meters"
                :key="meter.id"
                @click="selectedMeter = meter.id"
                :class="[
                  'px-5 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 text-sm border-2',
                  selectedMeter === meter.id
                    ? 'text-white shadow-lg border-transparent'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600'
                ]"
                :style="{
                  backgroundColor: selectedMeter === meter.id ? meter.color : undefined,
                }"
              >
                <span class="material-symbols-outlined text-lg">{{ meter.icon }}</span>
                {{ meter.name }}
              </button>
            </div>
          </div>

          <!-- View Toggle -->
          <div>
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              {{ $t('puissance.displayMode') }}
            </p>
            <div class="flex gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
              <button
                @click="viewMode = 'overview'"
                :class="[
                  'px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-2',
                  viewMode === 'overview'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                ]"
              >
                <span class="material-symbols-outlined text-lg">dashboard</span>
                {{ $t('puissance.views.overview') }}
              </button>
              <button
                @click="viewMode = 'charts'"
                :class="[
                  'px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-2',
                  viewMode === 'charts'
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                ]"
              >
                <span class="material-symbols-outlined text-lg">bar_chart</span>
                {{ $t('puissance.views.charts') }}
              </button>
              <button
                @click="viewMode = 'tables'"
                :class="[
                  'px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 flex items-center gap-2',
                  viewMode === 'tables'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                ]"
              >
                <span class="material-symbols-outlined text-lg">table_chart</span>
                {{ $t('puissance.views.tables') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Overview View: 2-Column Layout (Widgets Left, Charts Right) -->
    <div v-if="viewMode === 'overview'" class="space-y-8 animate-fadeIn">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: KPI Cards (1 col) -->
        <div class="lg:col-span-1 space-y-4">
            <div class="flex items-center gap-3 mb-4">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.metrics') }}</h2>
          </div>

          <!-- KPI Cards in Column -->
          <div class="space-y-3">
            <KPICard
              v-for="(kpiKey, idx) in kpiKeys"
              :key="idx"
              :title="$t(`puissance.kpi.${kpiKey}`)"
              :value="(currentMeterData.kpiValues as Record<string, number>)[kpiKey]"
              :unit="$t('common.unit.kw')"
              :meter-name="currentMeterData.name"
              :meter-color="currentMeterData.color"
            />
          </div>
        </div>

        <!-- Right Column: Charts (2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Monthly Chart -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                  <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
                  <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.overview.yearly') }}</h2>
                </div>
              <button
                @click="showChartModal('monthly')"
                class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
              >
                <span class="material-symbols-outlined inline text-lg align-text-bottom mr-1">zoom_in</span>
                {{ $t('common.viewDetails') }}
              </button>
            </div>
            <BarChart
              :title="$t('puissance.charts.monthlyPower')"
              :subtitle="$t('puissance.charts.monthlyAverage')"
              :labels="currentMeterData.monthlyData.labels"
              :data="currentMeterData.monthlyData.values"
              :bar-color="currentMeterData.color"
            />
          </div>

          <!-- Daily and Hourly Charts -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.daily') }}</h3>
                </div>
                <button
                  @click="showChartModal('daily')"
                  class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
                >
                  <span class="material-symbols-outlined text-lg">zoom_in</span>
                </button>
              </div>
              <BarChart
                :title="$t('puissance.charts.dailyPower')"
                :subtitle="$t('puissance.charts.monthlyAverage')"
                :labels="currentMeterData.dailyData.labels"
                :data="currentMeterData.dailyData.values"
                :bar-color="currentMeterData.color"
              />
            </div>

            <div>
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.hourly') }}</h3>
                </div>
                <button
                  @click="showChartModal('hourly')"
                  class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
                >
                  <span class="material-symbols-outlined text-lg">zoom_in</span>
                </button>
              </div>
              <BarChart
                :title="$t('puissance.charts.hourlyPower')"
                :subtitle="$t('puissance.charts.monthlyAverage')"
                :labels="currentMeterData.hourlyData.labels"
                :data="currentMeterData.hourlyData.values"
                :bar-color="currentMeterData.color"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts View: Full Width Charts -->
    <div v-else-if="viewMode === 'charts'" class="space-y-8 animate-fadeIn">
      <!-- Monthly Chart -->
      <div>
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.yearlyOverview') }}</h2>
          </div>
          <button
            @click="showChartModal('monthly')"
            class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
          >
            <span class="material-symbols-outlined inline text-lg align-text-bottom mr-1">zoom_in</span>
            {{ $t('common.viewDetails') }}
          </button>
        </div>
        <BarChart
          :title="$t('puissance.charts.monthlyPower')"
          :subtitle="$t('puissance.charts.monthlyAverage')"
          :labels="currentMeterData.monthlyData.labels"
          :data="currentMeterData.monthlyData.values"
          :bar-color="currentMeterData.color"
        />
      </div>

      <!-- Daily and Hourly Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
              <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.daily') }}</h2>
            </div>
            <button
              @click="showChartModal('daily')"
              class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <BarChart
            :title="$t('puissance.charts.dailyPower')"
            :subtitle="$t('puissance.charts.monthlyAverage')"
            :labels="currentMeterData.dailyData.labels"
            :data="currentMeterData.dailyData.values"
            :bar-color="currentMeterData.color"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
              <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.hourly') }}</h2>
            </div>
            <button
              @click="showChartModal('hourly')"
              class="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition border border-blue-200 dark:border-blue-800"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <BarChart
            :title="$t('puissance.charts.hourlyPower')"
            :subtitle="$t('puissance.charts.monthlyAverage')"
            :labels="currentMeterData.hourlyData.labels"
            :data="currentMeterData.hourlyData.values"
            :bar-color="currentMeterData.color"
          />
        </div>
      </div>
    </div>

    <!-- Tables View: Full Width Tables -->
    <div v-else-if="viewMode === 'tables'" class="space-y-8 animate-fadeIn">
      <!-- Hourly Table -->
      <div>
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.hourlyData') }}</h2>
          </div>
          <button
            @click="showTableModal('hourly')"
            class="px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition border border-purple-200 dark:border-purple-800"
          >
            <span class="material-symbols-outlined inline text-lg align-text-bottom mr-1">zoom_in</span>
            {{ $t('common.viewDetails') }}
          </button>
        </div>
        <DataTable
          :title="$t('puissance.tables.hourlyPower', { meter: currentMeterData.name })"
          :realtime-label="$t('puissance.tables.realtimeLastDay')"
          :columns="[
            { key: 'timestamp', label: $t('puissance.tables.columns.timestamp'), format: 'default' },
            { key: 'power', label: $t('puissance.tables.columns.power'), format: 'number' },
          ]"
          :data="currentMeterData.hourlyTableData"
          :items-per-page="15"
        />
      </div>

      <!-- Daily Tables -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.dailyTotal') }}</h2>
          </div>
            <button
              @click="showTableModal('daily')"
              class="px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition border border-purple-200 dark:border-purple-800"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <DataTable
            :title="$t('puissance.tables.dailyTotal')"
            :realtime-label="$t('puissance.tables.realtimeMonth')"
            :columns="[
              { key: 'timestamp', label: $t('puissance.tables.columns.timestamp'), format: 'default' },
              { key: 'power', label: $t('puissance.tables.columns.dailyPower'), format: 'number' },
            ]"
            :data="currentMeterData.dailyTableData"
            :items-per-page="15"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterData.color }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('puissance.labels.dailyAverage') }}</h2>
          </div>
            <button
              @click="showTableModal('monthly')"
              class="px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition border border-purple-200 dark:border-purple-800"
            >
              <span class="material-symbols-outlined text-lg">zoom_in</span>
            </button>
          </div>
          <DataTable
            :title="$t('puissance.tables.dailyAverage')"
            :realtime-label="$t('puissance.tables.realtimeMonth')"
            :columns="[
              { key: 'timestamp', label: $t('puissance.tables.columns.timestamp'), format: 'default' },
              { key: 'power', label: $t('puissance.tables.columns.averagePower'), format: 'number' },
            ]"
            :data="currentMeterData.dailyAverageData"
            :items-per-page="15"
          />
        </div>
      </div>
    </div>

    <!-- Chart Detail Modal -->
    <ChartDetailModal
      :is-open="chartModalOpen"
      :chart-title="chartModalData.title"
      :chart-subtitle="chartModalData.subtitle"
      :meter-name="currentMeterData.name"
      :meter-color="currentMeterData.color"
      :data="chartModalData.data"
      :labels="chartModalData.labels"
      :hourly-data="chartModalData.hourlyData"
      :daily-data="chartModalData.dailyData"
      :weekly-data="chartModalData.weeklyData"
      :monthly-data="chartModalData.monthlyData"
      :yearly-data="chartModalData.yearlyData"
      @close="chartModalOpen = false"
    />

    <!-- Table Detail Modal -->
    <TableDetailModal
      :is-open="tableModalOpen"
      :table-title="tableModalData.title"
      :meter-name="currentMeterData.name"
      :columns="tableModalData.columns"
      :hourly-data="currentMeterData.hourlyTableData"
      :daily-data="currentMeterData.dailyTableData"
      :monthly-data="currentMeterData.dailyAverageData"
      @close="tableModalOpen = false"
    />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import KPICard from '@/components/puissance/KPICard.vue'
import BarChart from '@/components/puissance/BarChart.vue'
import DataTable from '@/components/puissance/DataTable.vue'
import ChartDetailModal from '@/components/puissance/ChartDetailModal.vue'
import TableDetailModal from '@/components/puissance/TableDetailModal.vue'
import { allMeters } from '@/data/puissanceData'

const { t } = useI18n()

// Selected meter
const selectedMeter = ref('tgbt')

// View mode toggle
const viewMode = ref<'overview' | 'charts' | 'tables'>('overview')

// Modal states
const chartModalOpen = ref(false)
const tableModalOpen = ref(false)

const chartModalData = ref({
  title: '',
  subtitle: '',
  data: [] as number[],
  labels: [] as string[],
  hourlyData: { labels: [] as string[], values: [] as number[] },
  dailyData: { labels: [] as string[], values: [] as number[] },
  weeklyData: { labels: [] as string[], values: [] as number[] },
  monthlyData: { labels: [] as string[], values: [] as number[] },
  yearlyData: { labels: [] as string[], values: [] as number[] },
})

const tableModalData = ref({
  title: '',
  columns: [] as any[],
})

// All available meters
const meters = computed(() => [
  { id: 'tgbt', name: t('puissance.meters.tgbt'), color: '#ef4444', icon: 'bolt' },
  { id: 'compressor', name: t('puissance.meters.compressor'), color: '#22c55e', icon: 'bolt' },
  { id: 'cooling', name: t('puissance.meters.cooling'), color: '#3b82f6', icon: 'bolt' },
  { id: 'lighting', name: t('puissance.meters.lighting'), color: '#eab308', icon: 'bolt' },
])

// Current meter data
const currentMeterData = computed(() => allMeters[selectedMeter.value])

// KPI keys in order
const kpiKeys = [
  'avgPowerLastMonth',
  'avgPowerThisMonth',
  'avgPowerYesterday',
  'avgPowerToday',
  'avgPowerBeforeYesterday',
  'instantaneousPower',
]

const showChartModal = (chartType: 'monthly' | 'daily' | 'hourly') => {
  let title = ''
  let subtitle = ''
  let data: number[] = []
  let labels: string[] = []

  switch (chartType) {
    case 'monthly':
      title = t('puissance.charts.monthlyPower')
      subtitle = t('puissance.charts.monthlyAverage')
      data = currentMeterData.value.monthlyData.values
      labels = currentMeterData.value.monthlyData.labels
      break
    case 'daily':
      title = t('puissance.charts.dailyPower')
      subtitle = t('puissance.charts.dailyAverage')
      data = currentMeterData.value.dailyData.values
      labels = currentMeterData.value.dailyData.labels
      break
    case 'hourly':
      title = t('puissance.charts.hourlyPower')
      subtitle = t('puissance.charts.hourlyAverage')
      data = currentMeterData.value.hourlyData.values
      labels = currentMeterData.value.hourlyData.labels
      break
  }

  chartModalData.value = {
    title,
    subtitle,
    data,
    labels,
    hourlyData: currentMeterData.value.hourlyData,
    dailyData: currentMeterData.value.dailyData,
    weeklyData: currentMeterData.value.dailyData,
    monthlyData: currentMeterData.value.monthlyData,
    yearlyData: currentMeterData.value.monthlyData,
  }
  chartModalOpen.value = true
}

const showTableModal = (tableType: 'hourly' | 'daily' | 'monthly') => {
  let title = ''
  const columns = [
    { key: 'timestamp', label: t('puissance.tables.columns.timestamp'), format: 'default' as const },
    { key: 'power', label: t('puissance.tables.columns.power'), format: 'number' as const },
  ]

  switch (tableType) {
    case 'hourly':
      title = t('puissance.tables.hourlyPower', { meter: currentMeterData.value.name })
      break
    case 'daily':
      title = t('puissance.tables.dailyTotal')
      break
    case 'monthly':
      title = t('puissance.tables.dailyAverage')
      break
  }

  tableModalData.value = { title, columns }
  tableModalOpen.value = true
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

::-webkit-scrollbar {
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

:is(.dark ::-webkit-scrollbar-thumb) {
  background: #475569;
}
</style>
