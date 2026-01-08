<template>
  <!-- Language selector dropdown -->
  <div class="relative">
    <button
      @click="showDropdown = !showDropdown"
      class="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      :title="$t('language.select')"
    >
      <!-- Flag icon based on current language -->
      <span class="text-sm font-semibold">{{ currentLanguageFlag }}</span>
    </button>

    <!-- Dropdown menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="showDropdown"
        @click.away="showDropdown = false"
        class="absolute right-0 z-50 mt-2 w-40 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <!-- Language options -->
        <div class="py-1">
          <button
            v-for="lang in supportedLanguages"
            :key="lang.code"
            @click="switchLanguage(lang.code)"
            :class="[
              'w-full text-left px-4 py-2 text-sm transition-colors',
              currentLocale === lang.code
                ? 'bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            ]"
          >
            <span class="flex items-center justify-between">
              <span>{{ lang.nativeName }}</span>
              <span v-if="currentLocale === lang.code" class="text-sm">✓</span>
            </span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const showDropdown = ref(false)
const { currentLocale, currentLanguageName, supportedLanguages, switchLanguage } = useLanguage()

// Map language codes to display text
const flagMap: Record<string, string> = {
  en: 'EN',
  fr: 'FR',
}

const currentLanguageFlag = computed(() => {
  return flagMap[currentLocale.value] || '🌐'
})
</script>

<style scoped>
button:focus-visible {
  outline: 2px solid #135bec;
  outline-offset: 2px;
}
</style>
