<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Locations</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Sites & Locations</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage facility locations and sites</p>
          </div>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <span class="material-symbols-outlined">add</span>
            Add Location
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Location Card 1 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-blue-600">factory</span>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900 dark:text-white">Main Plant</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">Tunis, Tunisia</p>
            </div>
          </div>
          <span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded">ACTIVE</span>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Equipment:</span>
            <span class="font-semibold text-slate-900 dark:text-white">12 meters</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Consumption:</span>
            <span class="font-semibold text-slate-900 dark:text-white">8,500 kWh</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Area:</span>
            <span class="font-semibold text-slate-900 dark:text-white">5,200 m²</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
          <button class="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            View Details
          </button>
          <button class="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            <span class="material-symbols-outlined text-slate-600">edit</span>
          </button>
        </div>
      </div>

      <!-- Location Card 2 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-green-600">warehouse</span>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900 dark:text-white">Warehouse A</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">Sfax, Tunisia</p>
            </div>
          </div>
          <span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded">ACTIVE</span>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Equipment:</span>
            <span class="font-semibold text-slate-900 dark:text-white">5 meters</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Consumption:</span>
            <span class="font-semibold text-slate-900 dark:text-white">2,800 kWh</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Area:</span>
            <span class="font-semibold text-slate-900 dark:text-white">3,500 m²</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
          <button class="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            View Details
          </button>
          <button class="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            <span class="material-symbols-outlined text-slate-600">edit</span>
          </button>
        </div>
      </div>

      <!-- Location Card 3 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-purple-600">business</span>
            </div>
            <div>
              <h3 class="font-semibold text-slate-900 dark:text-white">Office HQ</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">Tunis, Tunisia</p>
            </div>
          </div>
          <span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded">ACTIVE</span>
        </div>

        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Equipment:</span>
            <span class="font-semibold text-slate-900 dark:text-white">3 meters</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Consumption:</span>
            <span class="font-semibold text-slate-900 dark:text-white">1,150 kWh</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-600 dark:text-slate-400">Area:</span>
            <span class="font-semibold text-slate-900 dark:text-white">800 m²</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
          <button class="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            View Details
          </button>
          <button class="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            <span class="material-symbols-outlined text-slate-600">edit</span>
          </button>
        </div>
      </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>
