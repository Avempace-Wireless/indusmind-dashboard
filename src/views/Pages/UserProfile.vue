<template>
  <admin-layout>
    <PageBreadcrumb :pageTitle="t('profile.title')" />

    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ t('profile.title') }}</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">{{ t('profile.subtitle') }}</p>
    </div>

    <!-- Profile Section -->
    <div class="mb-6">
      <profile-card />
    </div>

    <!-- Personal Information Section -->
    <div class="mb-6">
      <personal-info-card />
    </div>

    <!-- Security Section -->
    <div>
      <password-change-card />
    </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from '../../components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import { useI18n } from 'vue-i18n'
import ProfileCard from '../../components/profile/ProfileCard.vue'
import PersonalInfoCard from '../../components/profile/PersonalInfoCard.vue'
import PasswordChangeCard from '../../components/profile/PasswordChangeCard.vue'
import AddressCard from '../../components/profile/AddressCard.vue'

const { t } = useI18n()
</script>
