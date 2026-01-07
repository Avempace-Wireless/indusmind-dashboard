<template>
  <router-link to="/" class="xl:hidden">
    <div class="flex items-center gap-2">
      <img class="h-8 w-8 object-contain" src="/images/logo/Indusmind_logo.png" alt="IndusMind Energy" />
      <div class="flex items-baseline gap-1">
        <span class="text-[18px] font-extrabold tracking-tight text-gray-900 dark:text-white">IndusMind</span>
        <span class="text-[12px] font-semibold uppercase text-primary-600 dark:text-primary-400">Energy</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
