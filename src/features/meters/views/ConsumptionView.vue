<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Consumption</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Consommation Énergétique</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ selectedMeter?.name || 'PM2200-TGBT-Indusmind' }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <!-- Loading Banner -->
        <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-cyan-900 rounded-xl p-4 shadow-md">
          <div class="flex items-center gap-4">
            <div class="flex-shrink-0">
              <div class="animate-spin rounded-full h-10 w-10 border-3 border-blue-200 dark:border-cyan-700 border-t-blue-600 dark:border-t-cyan-400"></div>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="material-symbols-outlined text-blue-600 dark:text-cyan-400 text-lg">cloud_download</span>
                <h3 class="text-base font-semibold text-blue-900 dark:text-cyan-100">Chargement des données de consommation</h3>
              </div>
              <p class="text-sm text-blue-700 dark:text-cyan-300">Récupération des KPIs énergétiques depuis l'API ThingsBoard...</p>
            </div>
            <div class="flex-shrink-0">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 300ms"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading Skeleton Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 8" :key="i" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
            <div class="flex items-center justify-between mb-3">
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
              <div class="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
            <div class="h-9 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-2"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-36"></div>
          </div>
        </div>
      </div>

      <!-- KPI Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <!-- Consommé cette heure -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Consommé cette heure</span>
            <span class="material-symbols-outlined text-blue-600">schedule</span>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ formatEnergy(consumptionData.thisHour) }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-2">{{ selectedMeter?.name || 'PM2200-TGBT-Indusmind' }}</div>
        </div>

        <!-- Consommé aujourd'hui -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Consommé aujourd'hui</span>
            <span class="material-symbols-outlined text-amber-600">today</span>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ formatEnergy(consumptionData.today) }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-2">{{ selectedMeter?.name || 'PM2200-TGBT-Indusmind' }}</div>
        </div>

        <!-- Consommé hier -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Consommé hier</span>
            <span class="material-symbols-outlined text-purple-600">event</span>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ formatEnergy(consumptionData.yesterday) }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-2">{{ selectedMeter?.name || 'PM2200-TGBT-Indusmind' }}</div>
        </div>

        <!-- Consommé avant hier -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Consommé avant hier</span>
            <span class="material-symbols-outlined text-indigo-600">history</span>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ formatEnergy(consumptionData.dayBeforeYesterday) }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-2">{{ selectedMeter?.name || 'PM2200-TGBT-Indusmind' }}</div>
        </div>

        <!-- Consommé ce mois-ci -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Consommé ce mois-ci</span>
            <span class="material-symbols-outlined text-emerald-600">calendar_month</span>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ formatEnergy(consumptionData.thisMonth) }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-2">{{ selectedMeter?.name || 'PM2200-TGBT-Indusmind' }}</div>
        </div>

        <!-- Realtime - Current month so far -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Realtime - Current month so far</span>
            <span class="material-symbols-outlined text-green-600">trending_up</span>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ formatEnergy(consumptionData.thisMonth) }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-2">Latest</div>
        </div>

        <!-- Consommé le mois dernier -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Consommé le mois dernier</span>
            <span class="material-symbols-outlined text-slate-600">event_note</span>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ formatEnergy(consumptionData.lastMonth) }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-2">{{ selectedMeter?.name || 'PM2200-TGBT-Indusmind' }}</div>
        </div>

        <!-- Realtime - Current year -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Realtime - Current year</span>
            <span class="material-symbols-outlined text-blue-600">show_chart</span>
          </div>
          <div class="text-3xl font-bold text-slate-900 dark:text-white">{{ formatEnergy(consumptionData.currentYear) }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 mt-2">Latest</div>
        </div>
      </div>

      <!-- Detailed Charts Placeholder -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">Historique de consommation</h2>
        <div class="h-64 flex items-center justify-center text-slate-400">
          <div class="text-center">
            <span class="material-symbols-outlined text-6xl mb-4">bar_chart</span>
            <p>Graphiques détaillés à venir</p>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useTelemetryDynamic } from '@/composables/useTelemetryDynamic'
import { useMetersStore } from '@/stores/useDeviceMetersStore'
import { TIME_INTERVALS } from '@/config/telemetryConfig'

const metersStore = useMetersStore()
const { fetchTelemetry } = useTelemetryDynamic()

const isLoading = ref(true)
const consumptionData = ref({
  thisHour: 0,
  today: 0,
  yesterday: 0,
  dayBeforeYesterday: 0,
  thisMonth: 0,
  lastMonth: 0,
  currentYear: 0,
})

// Get the first meter with a deviceUUID (PM2200-TGBT-Indusmind)
const selectedMeter = computed(() => {
  return metersStore.allMeters.length > 0 ? metersStore.allMeters[0] : null
})

const formatEnergy = (value: number): string => {
  if (value === 0) return '0 kWh'
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} MWh`
  }
  return `${value.toFixed(1)} kWh`
}

const fetchConsumptionData = async () => {
  if (!selectedMeter.value?.deviceUUID) {
    console.warn('[ConsumptionView] No meter with deviceUUID found')
    isLoading.value = false
    return
  }

  const deviceUUID = selectedMeter.value.deviceUUID
  const now = Date.now()

  try {
    console.log('[ConsumptionView] Fetching consumption data for:', deviceUUID)

    // 1. This hour - deltaHourEnergyConsumtion (latest cumulative value)
    console.log('[ConsumptionView] Fetching thisHour:', {
      apiKey: 'deltaHourEnergyConsumtion',
      parameters: { limit: 1, agg: 'NONE' },
      purpose: 'Energy consumed in current hour (direct delta from meter)'
    })
    const thisHourData = await fetchTelemetry(deviceUUID, {
      keys: ['deltaHourEnergyConsumtion'],
      startTs: now - 60 * 1000, // Last 1 minute (to ensure we get latest)
      endTs: now,
      interval: 60 * 1000,
      agg: 'NONE',
      limit: 1
    })
    consumptionData.value.thisHour = thisHourData[0]?.value || 0
    console.log('[ConsumptionView] thisHour response:', { value: consumptionData.value.thisHour, dataPoints: thisHourData.length, apiResponse: thisHourData })

    // 2. Today - deltaDayEnergyConsumtion (latest cumulative value)
    console.log('[ConsumptionView] Fetching today:', {
      apiKey: 'deltaDayEnergyConsumtion',
      parameters: { limit: 1, agg: 'NONE' },
      purpose: 'Energy consumed since midnight (direct delta from meter)'
    })
    const todayData = await fetchTelemetry(deviceUUID, {
      keys: ['deltaDayEnergyConsumtion'],
      startTs: now - 60 * 1000, // Last 1 minute (to ensure we get latest)
      endTs: now,
      interval: 60 * 1000,
      agg: 'NONE',
      limit: 1
    })
    consumptionData.value.today = todayData[0]?.value || 0
    console.log('[ConsumptionView] today response:', { value: consumptionData.value.today, dataPoints: todayData.length, apiResponse: todayData })

    // 3. Yesterday - Use lastDayEnergy baseline key
    const yesterdayStart = new Date()
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    yesterdayStart.setHours(0, 0, 0, 0)
    const yesterdayEnd = new Date(yesterdayStart)
    yesterdayEnd.setHours(23, 59, 59, 999)

    console.log('[ConsumptionView] Fetching yesterday:', {
      apiKey: 'lastDayEnergy',
      parameters: {
        startTs: yesterdayStart.getTime(),
        endTs: yesterdayEnd.getTime(),
        agg: 'AVG'
      },
      purpose: 'Energy baseline at start and end of yesterday'
    })
    const yesterdayData = await fetchTelemetry(deviceUUID, {
      keys: ['lastDayEnergy'],
      startTs: yesterdayStart.getTime(),
      endTs: yesterdayEnd.getTime(),
      interval: 24 * TIME_INTERVALS.ONE_HOUR,
      agg: 'AVG',
      limit: 2
    })
    if (yesterdayData.length >= 2) {
      consumptionData.value.yesterday = yesterdayData[yesterdayData.length - 1].value - yesterdayData[0].value
    }
    console.log('[ConsumptionView] yesterday response:', { value: consumptionData.value.yesterday, dataPoints: yesterdayData.length, apiResponse: yesterdayData })

    // 4. Day before yesterday - Use lastDayEnergy baseline key
    const dayBeforeStart = new Date()
    dayBeforeStart.setDate(dayBeforeStart.getDate() - 2)
    dayBeforeStart.setHours(0, 0, 0, 0)
    const dayBeforeEnd = new Date(dayBeforeStart)
    dayBeforeEnd.setHours(23, 59, 59, 999)

    console.log('[ConsumptionView] Fetching dayBeforeYesterday:', {
      apiKey: 'lastDayEnergy',
      parameters: {
        startTs: dayBeforeStart.getTime(),
        endTs: dayBeforeEnd.getTime(),
        agg: 'AVG'
      },
      purpose: 'Energy baseline at start and end of day before yesterday'
    })
    const dayBeforeData = await fetchTelemetry(deviceUUID, {
      keys: ['lastDayEnergy'],
      startTs: dayBeforeStart.getTime(),
      endTs: dayBeforeEnd.getTime(),
      interval: 24 * TIME_INTERVALS.ONE_HOUR,
      agg: 'AVG',
      limit: 2
    })
    if (dayBeforeData.length >= 2) {
      consumptionData.value.dayBeforeYesterday = dayBeforeData[dayBeforeData.length - 1].value - dayBeforeData[0].value
    }
    console.log('[ConsumptionView] dayBeforeYesterday response:', { value: consumptionData.value.dayBeforeYesterday, dataPoints: dayBeforeData.length, apiResponse: dayBeforeData })

    // 5. This month - Calculate from AccumulatedActiveEnergyDelivered (start of month to now)
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    console.log('[ConsumptionView] Fetching thisMonth:', {
      apiKey: 'AccumulatedActiveEnergyDelivered',
      parameters: {
        startTs: monthStart.getTime(),
        endTs: now,
        agg: 'AVG'
      },
      purpose: 'Energy consumed this month (calculation: now - monthStart)'
    })
    const thisMonthData = await fetchTelemetry(deviceUUID, {
      keys: ['AccumulatedActiveEnergyDelivered'],
      startTs: monthStart.getTime(),
      endTs: now,
      interval: 24 * TIME_INTERVALS.ONE_HOUR,
      agg: 'AVG',
      limit: 100
    })
    if (thisMonthData.length >= 2) {
      consumptionData.value.thisMonth = thisMonthData[thisMonthData.length - 1].value - thisMonthData[0].value
    }
    console.log('[ConsumptionView] thisMonth response:', { value: consumptionData.value.thisMonth, dataPoints: thisMonthData.length })

    // 6. Last month
    const lastMonthStart = new Date()
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
    lastMonthStart.setDate(1)
    lastMonthStart.setHours(0, 0, 0, 0)
    const lastMonthEnd = new Date(lastMonthStart)
    lastMonthEnd.setMonth(lastMonthEnd.getMonth() + 1)
    lastMonthEnd.setDate(0)
    lastMonthEnd.setHours(23, 59, 59, 999)

    console.log('[ConsumptionView] Fetching lastMonth:', {
      apiKey: 'AccumulatedActiveEnergyDelivered',
      parameters: {
        startTs: lastMonthStart.getTime(),
        endTs: lastMonthEnd.getTime(),
        agg: 'AVG'
      },
      purpose: 'Energy consumed last month'
    })
    const lastMonthData = await fetchTelemetry(deviceUUID, {
      keys: ['AccumulatedActiveEnergyDelivered'],
      startTs: lastMonthStart.getTime(),
      endTs: lastMonthEnd.getTime(),
      interval: 24 * TIME_INTERVALS.ONE_HOUR,
      agg: 'AVG',
      limit: 100
    })
    if (lastMonthData.length >= 2) {
      consumptionData.value.lastMonth = lastMonthData[lastMonthData.length - 1].value - lastMonthData[0].value
    }
    console.log('[ConsumptionView] lastMonth response:', { value: consumptionData.value.lastMonth, dataPoints: lastMonthData.length })

    // 7. Current year - AccumulatedActiveEnergyDelivered (latest value represents total accumulated)
    console.log('[ConsumptionView] Fetching currentYear:', {
      apiKey: 'AccumulatedActiveEnergyDelivered',
      parameters: { limit: 1, agg: 'NONE' },
      purpose: 'Total accumulated energy (represents current year total)'
    })
    const currentYearData = await fetchTelemetry(deviceUUID, {
      keys: ['AccumulatedActiveEnergyDelivered'],
      startTs: now - 60 * 1000,
      endTs: now,
      interval: 60 * 1000,
      agg: 'NONE',
      limit: 1
    })
    consumptionData.value.currentYear = currentYearData[0]?.value || 0
    console.log('[ConsumptionView] currentYear response:', { value: consumptionData.value.currentYear, dataPoints: currentYearData.length })

    console.log('[ConsumptionView] All consumption data fetched:', consumptionData.value)

  } catch (error) {
    console.error('[ConsumptionView] Failed to fetch consumption data:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // Ensure meters are loaded
  if (metersStore.allMeters.length === 0) {
    await metersStore.fetchMeters()
  }
  await fetchConsumptionData()
})
</script>
