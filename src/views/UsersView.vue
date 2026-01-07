<template>
  <AdminLayout>
    <div class="w-full flex flex-col gap-6">
      <nav class="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <router-link to="/dashboard" class="hover:text-gray-900 dark:hover:text-white transition-colors">Dashboard</router-link>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">Users</span>
      </nav>

      <div class="flex flex-col gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage user accounts and permissions</p>
          </div>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <span class="material-symbols-outlined">person_add</span>
            Add User
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Login</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span class="text-blue-600 font-semibold">JD</span>
                </div>
                <div>
                  <div class="font-medium text-slate-900 dark:text-white">John Doe</div>
                  <div class="text-sm text-slate-600 dark:text-slate-400">john.doe@indusmind.tn</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded">Admin</span>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded">Active</span>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">2 hours ago</td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
                  <span class="material-symbols-outlined text-slate-600 text-lg">edit</span>
                </button>
                <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
                  <span class="material-symbols-outlined text-slate-600 text-lg">delete</span>
                </button>
              </div>
            </td>
          </tr>

          <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span class="text-green-600 font-semibold">AS</span>
                </div>
                <div>
                  <div class="font-medium text-slate-900 dark:text-white">Alice Smith</div>
                  <div class="text-sm text-slate-600 dark:text-slate-400">alice.smith@indusmind.tn</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded">Manager</span>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded">Active</span>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">1 day ago</td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
                  <span class="material-symbols-outlined text-slate-600 text-lg">edit</span>
                </button>
                <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
                  <span class="material-symbols-outlined text-slate-600 text-lg">delete</span>
                </button>
              </div>
            </td>
          </tr>

          <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <span class="text-amber-600 font-semibold">BJ</span>
                </div>
                <div>
                  <div class="font-medium text-slate-900 dark:text-white">Bob Johnson</div>
                  <div class="text-sm text-slate-600 dark:text-slate-400">bob.johnson@indusmind.tn</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400 rounded">Viewer</span>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 text-xs font-semibold bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded">Active</span>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">3 days ago</td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
                  <span class="material-symbols-outlined text-slate-600 text-lg">edit</span>
                </button>
                <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded">
                  <span class="material-symbols-outlined text-slate-600 text-lg">delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '@/components/layout/AdminLayout.vue'
</script>
