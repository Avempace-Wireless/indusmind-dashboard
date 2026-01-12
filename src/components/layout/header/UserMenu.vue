<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      @click.prevent="toggleDropdown"
    >
      <div class="flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-emerald-500/30 bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs">
        IM
      </div>

      <div class="hidden sm:flex flex-col items-start">
        <span class="block font-semibold text-sm text-gray-900 dark:text-white leading-none">{{ t('user.manager') }}</span>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('user.profile') }}</span>
      </div>

      <ChevronDownIcon :class="['w-4 h-4', { 'rotate-180': dropdownOpen }]" class="transition-transform" />
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="dropdownOpen"
        class="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl"
      >
        <!-- User Info Section -->
        <div class="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center h-12 w-12 rounded-full ring-2 ring-emerald-500/30 bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm flex-shrink-0">
              IM
            </div>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ t('user.managerAccount') }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('user.managerEmail') }}</p>
            </div>
          </div>
        </div>

        <!-- Menu Items -->
        <ul class="flex flex-col py-2">
          <li v-for="item in menuItems" :key="item.id">
            <router-link
              :to="item.href"
              @click="closeDropdown"
              class="flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span class="text-sm font-medium">{{ t(item.translationKey) }}</span>
            </router-link>
          </li>
        </ul>

        <!-- Divider -->
        <div class="border-t border-gray-200 dark:border-gray-700"></div>

        <!-- Logout -->
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
        >
          <LogoutIcon class="w-5 h-5" />
          <span>{{ t('user.signOut') }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/useAuthStore'
import { UserCircleIcon, ChevronDownIcon, LogoutIcon, SettingsIcon, SupportIcon } from '@/icons'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLDivElement | null>(null)

const menuItems = [
  {
    id: 'profile',
    href: '/profile',
    icon: UserCircleIcon,
    translationKey: 'user.profile'
  },
  {
    id: 'settings',
    href: '/account-settings',
    icon: SettingsIcon,
    translationKey: 'user.settings'
  },
  {
    id: 'support',
    href: '/support',
    icon: SupportIcon,
    translationKey: 'user.support'
  },
]

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const handleLogout = async () => {
  closeDropdown()
  try {
    authStore.logout()
    await router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
