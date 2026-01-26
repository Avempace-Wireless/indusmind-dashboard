<template>
  <AdminLayout>
    <!-- Header Section -->
    <div class="mb-8">
      <!-- Title & Description -->
      <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {{ $t('current.pageTitle') }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t('current.multiMeterOverview') }}
          </p>
        </div>
        <button
          @click="showCompteurSelector = true"
          class="flex w-full sm:w-auto items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-white px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-100 transition-colors whitespace-nowrap shadow-sm self-start"
        >
          <span class="material-symbols-outlined text-base">tune</span>
          {{ $t('dashboard.manageMeters') }}
        </button>
      </div>

      <!-- CompteurSelector Modal -->
      <CompteurSelector
        :is-open="showCompteurSelector"
        :all-compteurs="allCompteurs"
        :selected-ids="selectedMeterIdsArray"
        @apply="handleCompteurSelection"
        @close="showCompteurSelector = false"
      />

      <!-- Controls Section - Compact Meter Selection -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-4 border-2 border-slate-300 dark:border-slate-600 mb-4">
        <div v-if="validSelectedMeterIds.length > 0 && currentMeterId" class="space-y-3">
          <!-- Header: Title -->
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              {{ $t('compteur.selector.title') }}
            </h3>
          </div>

          <!-- All Meters Pills - Grid Layout (Same as PuissanceView) -->
          <div v-if="validSelectedMeterIds.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <button
              v-for="(meterId, index) in validSelectedMeterIds"
              :key="meterId"
              @click="selectMeter(index)"
              :class="[
                'px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border-2 flex items-center justify-center gap-1 relative overflow-hidden group',
                currentMeterIndex === index
                  ? 'text-white shadow-lg scale-105 border-transparent'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
              ]"
              :style="currentMeterIndex === index ? { backgroundColor: metersStore.getMeterColor(meterId) } : {}"
            >
              <!-- Background gradient for non-selected -->
              <div
                v-if="currentMeterIndex !== index"
                class="absolute inset-0 opacity-0 group-hover:opacity-5 transition"
                :style="{ backgroundColor: metersStore.getMeterColor(meterId) }"
              />

              <!-- Content -->
              <span v-if="currentMeterIndex === index" class="material-symbols-outlined text-sm flex-shrink-0">check_circle</span>
              <span class="truncate relative z-10">{{ getMeterName(meterId) }}</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
          <span class="material-symbols-outlined text-3xl mb-2 block opacity-50">inbox</span>
          <p class="text-sm">{{ $t('dashboard.noMetersSelected.description') }}</p>
        </div>
      </div>
    </div>

    <!-- Loading Banner -->
    <div v-if="isLoading && validSelectedMeterIds.length > 0" class="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-cyan-900 rounded-xl p-4 shadow-md animate-fadeIn">
      <div class="flex items-center gap-4">
        <div class="flex-shrink-0">
          <div class="animate-spin rounded-full h-8 w-8 border-3 border-blue-200 dark:border-cyan-700 border-t-blue-600 dark:border-t-cyan-400"></div>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-blue-600 dark:text-cyan-400 text-lg">cloud_download</span>
            <h3 class="text-sm font-semibold text-blue-900 dark:text-cyan-100">{{ $t('current.loading') }}</h3>
          </div>
          <p class="text-xs text-blue-700 dark:text-cyan-300">{{ $t('current.loadingDescription') }}</p>
        </div>
        <div class="flex-shrink-0">
          <div class="flex items-center gap-1">
            <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 0ms"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 150ms"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 animate-pulse" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs/Display Mode Switcher & Period Selector -->
    <div
      v-if="currentMeterId && !isLoading"
      class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 px-1"
    >
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{{ $t('current.displayMode') }}</span>
      </h2>
      <div class="flex flex-wrap gap-2 w-full sm:w-auto">
        <button
          @click="viewMode = 'overview'"
          :class="[
            'px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-300 border text-xs sm:text-sm font-medium whitespace-nowrap',
            viewMode === 'overview'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50 border-transparent'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600'
          ]"
        >
          <span class="material-symbols-outlined text-sm">dashboard</span>
          <span>{{ $t('current.tabs.overview') }}</span>
        </button>
        <button
          @click="viewMode = 'charts'"
          :class="[
            'px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-300 border text-xs sm:text-sm font-medium whitespace-nowrap',
            viewMode === 'charts'
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/50 border-transparent'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600'
          ]"
        >
          <span class="material-symbols-outlined text-sm">bar_chart</span>
          <span>{{ $t('current.tabs.charts') }}</span>
        </button>
        <button
          @click="viewMode = 'tables'"
          :class="[
            'px-4 py-2 rounded-lg inline-flex items-center justify-center gap-2 transition-all duration-300 border text-xs sm:text-sm font-medium whitespace-nowrap',
            viewMode === 'tables'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/50 border-transparent'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border-gray-300 dark:border-slate-600'
          ]"
        >
          <span class="material-symbols-outlined text-sm">table_chart</span>
          <span>{{ $t('current.tabs.tables') }}</span>
        </button>
      </div>
    </div>

    <!-- Period Selector for Charts/Tables Tab -->
    <div v-if="(viewMode === 'charts' || viewMode === 'tables') && !isLoading" class="mb-6 flex flex-wrap gap-2 px-1">
      <button
        v-for="period in periods"
        :key="period.value"
        @click="selectedPeriod = period.value; reloadCharts()"
        :class="[
          'px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border',
          selectedPeriod === period.value
            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent shadow-md'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
        ]"
      >
        {{ period.label }}
      </button>
    </div>

    <!-- Overview Tab: All Selected Meters KPI Cards & Comparative Chart -->
    <div v-if="!isLoading && viewMode === 'overview' && validSelectedMeterIds.length > 0" class="space-y-6 animate-fadeIn">
      <!-- Layout: KPI Cards on left (1 col), Chart on right (2 cols) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: KPI Cards -->
        <div v-if="validSelectedMeterIds.length > 0" class="lg:col-span-1">
          <div class="flex items-center gap-3 mb-4">
            <div class="h-1 w-8 rounded-full" :style="{ backgroundColor: currentMeterId ? metersStore.getMeterColor(currentMeterId as string) : '#ccc' }"></div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ $t('current.metrics') }}</h2>
          </div>

          <!-- KPI Cards Loading State -->
          <div v-if="isLoading" class="space-y-3">
            <div v-for="i in 4" :key="i" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
              <div class="flex items-center justify-between mb-3">
                <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                <div class="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
              <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
            </div>
          </div>

          <!-- KPI Cards Grid -->
          <div v-else-if="currentMeterId && (currentKPIs || metersCurrentData.length > 0)" class="space-y-3">
            <!-- Instantaneous Current -->
            <CurrentKPICard
              :title="$t('current.instantaneous')"
              :value="isApiMode && currentKPIs ? currentKPIs.instantaneousCurrent : metersCurrentData[currentMeterIndex]?.current ?? null"
              :unit="$t('common.unit.ampere')"
              :meter-name="getMeterName(currentMeterId)"
              :meter-color="metersStore.getMeterColor(currentMeterId)"
            />

            <!-- Last Hour Average -->
            <CurrentKPICard
              :title="$t('current.lastHourAvg')"
              :value="isApiMode && currentKPIs ? currentKPIs.lastHourAverage : getLastHourAvg(currentMeterIndex)"
              :unit="$t('common.unit.ampere')"
              :meter-name="getMeterName(currentMeterId)"
              :meter-color="metersStore.getMeterColor(currentMeterId)"
            />

            <!-- Today Average -->
            <CurrentKPICard
              :title="$t('current.todayAvg')"
              :value="isApiMode && currentKPIs ? currentKPIs.todayAverage : getTodayAvg(currentMeterIndex)"
              :unit="$t('common.unit.ampere')"
              :meter-name="getMeterName(currentMeterId)"
              :meter-color="metersStore.getMeterColor(currentMeterId)"
            />
          </div>
        </div>


        <!-- Right Column: Comparative Chart (2 cols) -->
        <div v-if="validSelectedMeterIds.length > 0" class="lg:col-span-2">
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-500">show_chart</span>
                {{ $t('current.comparativeChart') }}
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ $t('current.comparativeDescription') }}</p>
            </div>

            <!-- Chart Container -->
            <div class="p-6">
              <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div class="h-96 relative">
                  <canvas ref="overviewChartCanvas" id="overviewChart"></canvas>
                </div>
              </div>

              <!-- Legend -->
              <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <div v-for="meterId in validSelectedMeterIds" :key="meterId + '-legend'" class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: metersStore.getMeterColor(meterId) }"></div>
                  <span class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ getMeterName(meterId) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Tab: Multiple Timeframe Charts -->
    <div v-if="currentMeterId && viewMode === 'charts' && !isLoading" class="space-y-8 animate-fadeIn">
      <!-- Period Selector -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
        <button v-for="period in periods" :key="period.value" @click="selectedPeriod = period.value" :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border flex items-center gap-2',
          selectedPeriod === period.value
            ? 'bg-indigo-500 text-white shadow-lg border-indigo-500'
            : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800'
        ]">
          <span class="material-symbols-outlined text-sm">schedule</span>
          {{ period.label }}
        </button>
      </div>

      <!-- Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 24-Hour Chart -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-indigo-500">trending_up</span>
              {{ $t('current.chart24h') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('current.chart24hDescription') }}</p>
          </div>
          <div class="p-6">
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <div class="h-80 relative">
                <canvas ref="chart24hCanvas" id="chart24h"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Daily Average Chart -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-indigo-500">calendar_month</span>
              {{ $t('current.chartDaily') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('current.chartDailyDescription') }}</p>
          </div>
          <div class="p-6">
            <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <div class="h-80 relative">
                <canvas ref="chartDailyCanvas" id="chartDaily"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tables Tab: Detailed Data -->
    <div v-if="currentMeterId && viewMode === 'tables' && !isLoading" class="space-y-8 animate-fadeIn">
      <!-- Phase Details Table -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-indigo-500">table_chart</span>
            {{ $t('current.tableTitle') }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('current.tableDescription') }}</p>
        </div>
        <div class="p-6">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <th class="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wide">{{ $t('current.meter') }}</th>
                  <th class="text-right py-4 px-4 font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wide">{{ $t('current.current') }}</th>
                  <th class="text-right py-4 px-4 font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wide">{{ $t('current.voltage') }}</th>
                  <th class="text-right py-4 px-4 font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wide">{{ $t('current.power') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td class="py-4 px-4 font-semibold text-gray-900 dark:text-white">{{ getMeterName(currentMeterId!) }}</td>
                  <td class="text-right py-4 px-4 font-bold text-blue-600 dark:text-blue-400"><span class="inline-block bg-blue-50 dark:bg-blue-900 px-3 py-1 rounded-lg" style="opacity: 0.3;">{{ currentData?.current?.toFixed(2) }} A</span></td>
                  <td class="text-right py-4 px-4 font-bold text-green-600 dark:text-green-400"><span class="inline-block bg-green-50 dark:bg-green-900 px-3 py-1 rounded-lg" style="opacity: 0.3;">{{ currentData?.voltage?.toFixed(0) }} V</span></td>
                  <td class="text-right py-4 px-4 font-bold text-orange-600 dark:text-orange-400"><span class="inline-block bg-orange-50 dark:bg-orange-900 px-3 py-1 rounded-lg" style="opacity: 0.3;">{{ currentData?.power?.toFixed(2) }} kW</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Historical Data Table -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                <span class="material-symbols-outlined text-indigo-500">history</span>
                {{ $t('current.historicalTitle') }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('current.historicalDescription') }}</p>
            </div>
            <!-- Statistics Summary -->
            <div v-if="isApiMode && currentKPIData" class="grid grid-cols-2 gap-3">
              <div class="text-center">
                <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Min</p>
                <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ getTableStats.min.toFixed(2) }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Max</p>
                <p class="text-lg font-bold text-red-600 dark:text-red-400">{{ getTableStats.max.toFixed(2) }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Avg</p>
                <p class="text-lg font-bold text-green-600 dark:text-green-400">{{ getTableStats.avg.toFixed(2) }}</p>
              </div>
              <div class="text-center">
                <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Points</p>
                <p class="text-lg font-bold text-purple-600 dark:text-purple-400">{{ getTableStats.total }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <th class="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wide">{{ $t('current.timestamp') }}</th>
                  <th class="text-right py-4 px-4 font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wide">{{ $t('current.current') }} (A)</th>
                  <th class="text-right py-4 px-4 font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wide">{{ $t('current.voltage') }} (V)</th>
                  <th class="text-right py-4 px-4 font-semibold text-gray-900 dark:text-white uppercase text-xs tracking-wide">{{ $t('current.power') }} (kW)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in getTableData.slice(0, 10)" :key="index" class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td class="py-4 px-4 font-medium text-gray-900 dark:text-white">{{ item.timestamp }}</td>
                  <td class="text-right py-4 px-4 font-bold text-blue-600 dark:text-blue-400"><span class="inline-block bg-blue-50 dark:bg-blue-900 px-3 py-1 rounded-lg">{{ (typeof item.current === 'number' ? item.current : parseFloat(item.current as any)).toFixed(2) }}</span></td>
                  <td class="text-right py-4 px-4 font-bold text-green-600 dark:text-green-400"><span class="inline-block bg-green-50 dark:bg-green-900 px-3 py-1 rounded-lg">{{ item.voltage }}</span></td>
                  <td class="text-right py-4 px-4 font-bold text-orange-600 dark:text-orange-400"><span class="inline-block bg-orange-50 dark:bg-orange-900 px-3 py-1 rounded-lg">{{ typeof item.power === 'string' ? item.power : item.power.toFixed(2) }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!currentMeterId && !isLoading" class="text-center py-16 px-4">
      <span class="material-symbols-outlined text-6xl mb-4 block opacity-30 text-gray-400">sensors</span>
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('current.noData.title') }}</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">{{ $t('current.noData.description') }}</p>
      <button
        @click="showCompteurSelector = true"
        class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 font-medium hover:shadow-lg transition-shadow"
      >
        <span class="material-symbols-outlined">add</span>
        {{ $t('dashboard.manageMeters') }}
      </button>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMetersStore } from '@/stores/useMetersStore'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import CompteurSelector from '@/components/dashboard/CompteurSelector.vue'
import CurrentKPICard from '@/components/current/CurrentKPICard.vue'
import { useCurrent, type CurrentData, type CurrentChartData, type CurrentKPIData } from '@/composables/current/useCurrent'
import { useCompteurSelection } from '@/composables/useCompteurSelection'
import { useApiData } from '@/config/dataMode'
import Chart from 'chart.js/auto'

const { t } = useI18n()
const metersStore = useMetersStore()
const isApiMode = useApiData()

// Use the same composable as other views for consistency
const {
  initialize: initializeCompteurSelection,
} = useCompteurSelection()

// Chart instances
let overviewChart: Chart | null = null
let chart24h: Chart | null = null
let chartDaily: Chart | null = null

// Refs
const showCompteurSelector = ref(false)
const viewMode = ref<'overview' | 'charts' | 'tables'>('overview')
const selectedPeriod = ref<'hour' | 'day' | 'week' | 'month'>('day')
const currentMeterIndex = ref(0)
const isLoading = ref(false)

const { getCurrentData, getChartData, fetchCurrentKPIs } = useCurrent()

// Store API KPI data per device UUID
const currentKPIDataMap = ref<Map<string, CurrentKPIData>>(new Map())

const periods = computed(() => [
  { value: 'hour' as const, label: t('current.periods.hour') },
  { value: 'day' as const, label: t('current.periods.day') },
  { value: 'week' as const, label: t('current.periods.week') },
  { value: 'month' as const, label: t('current.periods.month') },
])

const selectedMeterIdsArray = computed(() => Array.from(metersStore.selectedMeterIds))
const validSelectedMeterIds = computed(() =>
  selectedMeterIdsArray.value.filter(id => metersStore.getMeterById(id))
)

const currentMeterId = computed(() => validSelectedMeterIds.value[currentMeterIndex.value] || null)
const currentDeviceUUID = computed(() => {
  if (!currentMeterId.value) return null
  const meter = metersStore.getMeterById(currentMeterId.value)
  return meter?.deviceUUID || currentMeterId.value
})

// Current meter's KPI data from API (when in API mode)
const currentKPIData = computed(() => {
  if (!isApiMode || !currentDeviceUUID.value) return null
  return currentKPIDataMap.value.get(currentDeviceUUID.value) || null
})

// Computed property to get KPI values - from API if available, else fallback to mock
const currentKPIs = computed(() => {
  if (isApiMode && currentKPIData.value) {
    return {
      instantaneousCurrent: currentKPIData.value.instantaneousCurrent ?? 0,
      lastHourMin: currentKPIData.value.lastHourMin ?? 0,
      lastHourAverage: currentKPIData.value.lastHourAverage ?? 0,
      lastHourMax: currentKPIData.value.lastHourMax ?? 0,
      todayAverage: currentKPIData.value.todayAverage ?? 0,
    }
  }
  return null
})

const currentData = ref<CurrentData | null>(null)
const metersCurrentData = ref<CurrentData[]>([])
const historicalData = ref<any[]>([])

// Computed property for allCompteurs (for template compatibility)
const allCompteurs = computed(() =>
  metersStore.allMeters.map(meter => ({
    id: meter.id,
    name: meter.name,
    category: meter.type || 'PM2200',
    subtitle: meter.subtitle || '',
    color: meter.color || 'blue',
    instantaneous: 0,
    today: 0,
    yesterday: 0,
    linkedEquipment: meter.linkedEquipment || [],
    translationKey: meter.translationKey
  } as any))
)

const getMeterName = (meterId: string) => {
  const meter = metersStore.getMeterById(meterId)
  return meter?.name || meterId
}

const getMeterBackgroundColor = (meterId: string) => {
  const color = metersStore.getMeterColor(meterId)
  return color + '15'
}

// Helper functions to calculate last hour statistics (for mock data)
const getLastHourMin = (meterIndex: number): number | null => {
  if (isApiMode && currentKPIData.value) return currentKPIData.value.lastHourMin
  if (!historicalData.value || historicalData.value.length === 0) return null
  const values = historicalData.value.map(item => item.current)
  return Math.min(...values)
}

const getLastHourMax = (meterIndex: number): number | null => {
  if (isApiMode && currentKPIData.value) return currentKPIData.value.lastHourMax
  if (!historicalData.value || historicalData.value.length === 0) return null
  const values = historicalData.value.map(item => item.current)
  return Math.max(...values)
}

const getLastHourAvg = (meterIndex: number): number | null => {
  if (isApiMode && currentKPIData.value) return currentKPIData.value.lastHourAverage
  if (!historicalData.value || historicalData.value.length === 0) return null
  const values = historicalData.value.map(item => item.current)
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

const getTodayAvg = (meterIndex: number): number | null => {
  if (isApiMode && currentKPIData.value) return currentKPIData.value.todayAverage
  if (!historicalData.value || historicalData.value.length === 0) return null
  // Calculate average for today's data
  const values = historicalData.value.map(item => item.current)
  const sum = values.reduce((acc, val) => acc + val, 0)
  return sum / values.length
}

const getYesterdayAvg = (meterIndex: number): number | null => {
  if (!historicalData.value || historicalData.value.length === 0) return null
  // Simulate yesterday's average (slightly lower than today for demo)
  const todayAvg = getTodayAvg(meterIndex)
  if (!todayAvg) return null
  return todayAvg * 0.92 // Yesterday was 92% of today's average
}

// Get table data for the current period
const getTableData = computed(() => {
  if (!isApiMode || !currentKPIData.value) {
    return historicalData.value
  }

  // Map API data to table format based on selected period
  let dataPoints: Array<{ ts: number; value: number }> = []

  switch (selectedPeriod.value) {
    case 'hour':
      dataPoints = currentKPIData.value.widgetData
      break
    case 'day':
      dataPoints = currentKPIData.value.hourlyData
      break
    case 'week':
      dataPoints = currentKPIData.value.dailyWeekData
      break
    case 'month':
      dataPoints = currentKPIData.value.dailyMonthData
      break
    default:
      dataPoints = currentKPIData.value.hourlyData
  }

  return dataPoints.map(p => ({
    timestamp: new Date(p.ts).toLocaleString(),
    current: p.value,
    voltage: 230,
    power: (p.value * 230 / 1000).toFixed(2)
  }))
})

// Get statistics for the selected period
const getTableStats = computed(() => {
  const data = getTableData.value
  if (!data || data.length === 0) {
    return { min: 0, max: 0, avg: 0, total: 0 }
  }

  const values = data.map(d => d.current)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const total = values.length

  return { min, max, avg, total }
})

const selectMeter = (index: number) => {
  currentMeterIndex.value = index
}

const handleCompteurSelection = (selectedIds: string[]) => {
  metersStore.setSelectedMeters(selectedIds)
  currentMeterIndex.value = 0
}

// Load current data
const loadCurrentData = async () => {
  if (validSelectedMeterIds.value.length === 0) return

  isLoading.value = true
  try {
    if (isApiMode) {
      // Fetch KPI data from API for all selected meters
      console.log('[CurrentView] Loading API data for meters:', validSelectedMeterIds.value)

      const deviceUUIDs = validSelectedMeterIds.value
        .map(meterId => {
          const meter = metersStore.getMeterById(meterId)
          return meter?.deviceUUID || meterId
        })
        .filter(Boolean)

      // Fetch KPI data for all selected meters in parallel
      const kpiResults = await Promise.all(
        deviceUUIDs.map(deviceUUID => fetchCurrentKPIs(deviceUUID, { useCache: false }))
      )

      // Store KPI data in map
      deviceUUIDs.forEach((deviceUUID, index) => {
        if (kpiResults[index]) {
          currentKPIDataMap.value.set(deviceUUID, kpiResults[index]!)
          console.log('[CurrentView] KPI data loaded for device:', deviceUUID, kpiResults[index])
        }
      })
    } else {
      // Generate mock data
      metersCurrentData.value = (await Promise.all(
        validSelectedMeterIds.value.map(meterId => getCurrentData(meterId))
      )).filter(Boolean) as CurrentData[]

      // Generate historical data
      historicalData.value = Array.from({ length: 24 }).map((_, i) => {
        const current = 20 + Math.random() * 30
        const voltage = 230
        return {
          timestamp: `${String(i).padStart(2, '0')}:00`,
          current,
          voltage,
          power: (current * voltage / 1000).toFixed(2)
        }
      })
    }
  } catch (err) {
    console.error('[CurrentView] Error loading current data:', err)
  } finally {
    isLoading.value = false
  }

  // Initialize charts after loading finishes and DOM is ready
  await nextTick()
  initCharts()
}

const reloadCharts = async () => {
  // Reload data and reinitialize charts for new period
  await loadCurrentData()
}

const initCharts = async () => {
  if (validSelectedMeterIds.value.length === 0) return

  // Wait for canvas elements to be mounted
  await nextTick()

  try {
    // Overview Chart - Comparative view with all selected meters
    const overviewCanvas = document.getElementById('overviewChart') as HTMLCanvasElement
    if (overviewCanvas) {
      const ctx = overviewCanvas.getContext('2d')
      if (ctx) {
        if (overviewChart) overviewChart.destroy()

        let chartDataArray: CurrentChartData[] = []

        if (isApiMode) {
          // Use API data for overview
          const deviceUUIDs = validSelectedMeterIds.value
            .map(meterId => {
              const meter = metersStore.getMeterById(meterId)
              return meter?.deviceUUID || meterId
            })
            .filter(Boolean)

          chartDataArray = (await Promise.all(
            deviceUUIDs.map(deviceUUID => getChartData(deviceUUID, 'day'))
          )).filter(Boolean) as CurrentChartData[]
        } else {
          // Use mock data
          chartDataArray = (await Promise.all(
            validSelectedMeterIds.value.map(meterId => getChartData(meterId, 'day'))
          )).filter(Boolean) as CurrentChartData[]
        }

        // Build datasets for all meters
        const datasets = validSelectedMeterIds.value.map((meterId, index) => {
          const chartData = chartDataArray[index]
          if (!chartData) return null

          return {
            label: getMeterName(meterId),
            data: chartData.datasets[0].data,
            borderColor: metersStore.getMeterColor(meterId),
            backgroundColor: `${metersStore.getMeterColor(meterId)}20`,
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            spanGaps: false,
            pointRadius: 0,
            pointHoverRadius: 0
          }
        }).filter(Boolean)

        if (datasets.length > 0 && chartDataArray[0]) {
          overviewChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: chartDataArray[0].labels,
              datasets: datasets as any
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  enabled: true
                },
                legend: {
                  position: 'top' as const,
                  labels: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151',
                    padding: 15,
                    font: { size: 12, weight: 500 as any }
                  }
                },
                filler: {
                  propagate: true
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  },
                  grid: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1e293b' : '#e5e7eb'
                  }
                },
                x: {
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  },
                  grid: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1e293b' : '#e5e7eb'
                  }
                }
              }
            }
          })
        }
      }
    }

    // 24H Chart - Single meter view
    if (!currentMeterId.value) return

    let currentPeriod: 'hour' | 'day' | 'week' | 'month' = 'day'
    let chart24hData: CurrentChartData | null = null

    if (isApiMode && currentDeviceUUID.value) {
      chart24hData = await getChartData(currentDeviceUUID.value, currentPeriod)
    } else if (!isApiMode && currentMeterId.value) {
      chart24hData = await getChartData(currentMeterId.value, currentPeriod)
    }

    if (chart24hData) {
      const chart24hCanvas = document.getElementById('chart24h') as HTMLCanvasElement
      if (chart24hCanvas) {
        const ctx = chart24hCanvas.getContext('2d')
        if (ctx) {
          if (chart24h) chart24h.destroy()

          chart24h = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: chart24hData.labels,
              datasets: [
                {
                  label: t('current.current'),
                  data: chart24hData.datasets[0].data,
                  backgroundColor: metersStore.getMeterColor(currentMeterId.value),
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  borderWidth: 1
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  enabled: true
                },
                legend: {
                  labels: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151'
                  }
                }
              },
              scales: {
                x: {
                  stacked: false,
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                },
                y: {
                  stacked: false,
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                }
              }
            }
          })
        }
      }
    }

    // Daily/Period Chart
    let dailyPeriodData: CurrentChartData | null = null
    if (isApiMode && currentDeviceUUID.value) {
      dailyPeriodData = await getChartData(currentDeviceUUID.value, selectedPeriod.value)
    } else if (!isApiMode && currentMeterId.value) {
      dailyPeriodData = await getChartData(currentMeterId.value, selectedPeriod.value)
    }

    if (dailyPeriodData) {
      const chartDailyCanvas = document.getElementById('chartDaily') as HTMLCanvasElement
      if (chartDailyCanvas) {
        const ctx = chartDailyCanvas.getContext('2d')
        if (ctx) {
          if (chartDaily) chartDaily.destroy()

          chartDaily = new Chart(ctx, {
            type: 'line',
            data: {
              labels: dailyPeriodData.labels,
              datasets: [
                {
                  label: t('current.average'),
                  data: dailyPeriodData.datasets[0].data,
                  borderColor: metersStore.getMeterColor(currentMeterId.value),
                  backgroundColor: `${metersStore.getMeterColor(currentMeterId.value)}20`,
                  borderWidth: 3,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: metersStore.getMeterColor(currentMeterId.value),
                  pointBorderColor: '#fff',
                  pointBorderWidth: 0,
                  pointRadius: 4,
                  pointHoverRadius: 6
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  enabled: true
                },
                legend: {
                  labels: {
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e5e7eb' : '#374151'
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                },
                x: {
                  ticks: {
                    display: true,
                    color: window.matchMedia('(prefers-color-scheme: dark)').matches ? '#94a3b8' : '#64748b',
                    font: { size: 11 }
                  }
                }
              }
            }
          })
        }
      }
    }
  } catch (err) {
    console.error('[CurrentView] Error initializing charts:', err)
  }
}

watch(currentMeterId, () => {
  loadCurrentData()
})

// Watch for store meter changes (handles async loading)
watch(() => metersStore.allMeters.length, async () => {
  if (validSelectedMeterIds.value.length === 0 && metersStore.allMeters.length > 0) {
    const firstMeterId = metersStore.allMeters[0].id
    metersStore.setSelectedMeters([firstMeterId])
    await nextTick()
    await loadCurrentData()
  }
})

// Watch for tab changes to initialize charts when needed
watch(viewMode, async () => {
  if (!currentMeterId.value) return

  await nextTick()

  if (viewMode.value === 'overview') {
    // Re-initialize overview chart whenever switching to this tab
    const overviewCanvas = document.getElementById('overviewChart') as HTMLCanvasElement
    if (overviewCanvas) {
      initCharts()
    }
  } else if (viewMode.value === 'charts') {
    // Re-initialize charts tab charts whenever switching to this tab
    const chart24hCanvas = document.getElementById('chart24h') as HTMLCanvasElement
    const chartDailyCanvas = document.getElementById('chartDaily') as HTMLCanvasElement
    if (chart24hCanvas || chartDailyCanvas) {
      initCharts()
    }
  }
})

onMounted(async () => {
  // Initialize compteur selection (same as PuissanceView)
  await initializeCompteurSelection()

  // Wait for store to be ready
  await nextTick()

  // Restore selected meters from localStorage
  metersStore.restoreSelection()

  await nextTick()

  // Check if we have selected meters
  let metersToUse = validSelectedMeterIds.value

  // If no meters are selected, auto-select the first available meter
  if (metersToUse.length === 0 && metersStore.allMeters.length > 0) {
    const firstMeterId = metersStore.allMeters[0].id
    metersStore.setSelectedMeters([firstMeterId])
    await nextTick()
    metersToUse = validSelectedMeterIds.value
  }

  // Load data if we have a meter
  if (metersToUse.length > 0) {
    currentMeterIndex.value = 0
    await loadCurrentData()
  }
})

const formatTime = (timestamp?: number): string => {
  if (!timestamp) return '--:--'
  const date = new Date(timestamp)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

onUnmounted(() => {
  overviewChart?.destroy()
  chart24h?.destroy()
  chartDaily?.destroy()
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}
</style>

