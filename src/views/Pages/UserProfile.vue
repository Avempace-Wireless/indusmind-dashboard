<template>
  <admin-layout>
    <PageBreadcrumb :pageTitle="t('profile.title')" />

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
