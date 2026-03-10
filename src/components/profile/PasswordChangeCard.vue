<template>
  <div class="rounded-2xl border border-gray-200  p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:p-7">
    <!-- Card Header -->
    <div class="mb-7">
      <div class="flex items-center justify-between">
        <div>
         <!--  <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">

            {{ t('profile.security') }}
          </h3> -->
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {{ t('profile.changePassword') }}
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {{ t('profile.changePasswordDesc') }}
          </p>
        </div>
      </div>
    </div>

    <form @submit.prevent="handlePasswordChange" class="space-y-6 mt-7">

        <!-- Current Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('profile.currentPassword') }}
          </label>
          <div class="relative">
            <input
              v-model="form.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              :placeholder="t('profile.enterCurrentPassword')"
              class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 pr-10"
              :class="{ 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20': errors.currentPassword }"
            />
            <button
              type="button"
              @click="showCurrentPassword = !showCurrentPassword"
              tabindex="-1"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-400 transition-colors p-1 -mr-1"
            >
              <svg v-if="!showCurrentPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5C7 5 2.73 8.11 1 12.46c1.73 4.35 6 7.54 11 7.54s9.27-3.19 11-7.54C21.27 8.11 17 5 12 5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.83 9L15.64 12.81c.04-.25.08-.5.08-.81 0-1.66-1.34-3-3-3-.29 0-.54.04-.81.08M7.4 6.86c.89-.86 2.11-1.5 3.6-1.5 2.76 0 5 2.24 5 5 0 1.49-.64 2.71-1.5 3.6l-2.1-2.1c.05-.2.1-.41.1-.6 0-1.66-1.34-3-3-3-.2 0-.4.05-.6.1L7.4 6.86M2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 2.05 0 4.03-.4 5.84-1.12l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05-.3-.08-.63-.08-.95 0-1.66 1.34-3 3-3 .32 0 .65.03.95.08l1.55-1.55c-.67-.33-1.41-.53-2.2-.53-2.76 0-5 2.24-5 5 0 .79.2 1.53.53 2.2zm7.98-6c-2.16 0-4.29.75-5.98 2.12l2.91 2.91c1.04-.68 2.3-1.08 3.65-1.08 3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5c-1.35 0-2.61-.4-3.65-1.08l-2.91 2.91c1.69 1.37 3.82 2.12 5.98 2.12 5.33 0 9.7-3.87 9.7-9 0-5.12-4.37-9-9.7-9z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <p v-if="errors.currentPassword" class="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {{ errors.currentPassword }}
          </p>
        </div>

        <!-- New Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('profile.newPassword') }}
          </label>
          <div class="relative">
            <input
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              :placeholder="t('profile.enterNewPassword')"
              class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 pr-10"
              :class="{ 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20': errors.newPassword }"
            />
            <button
              type="button"
              @click="showNewPassword = !showNewPassword"
              tabindex="-1"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-400 transition-colors p-1 -mr-1"
            >
              <svg v-if="!showNewPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5C7 5 2.73 8.11 1 12.46c1.73 4.35 6 7.54 11 7.54s9.27-3.19 11-7.54C21.27 8.11 17 5 12 5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.83 9L15.64 12.81c.04-.25.08-.5.08-.81 0-1.66-1.34-3-3-3-.29 0-.54.04-.81.08M7.4 6.86c.89-.86 2.11-1.5 3.6-1.5 2.76 0 5 2.24 5 5 0 1.49-.64 2.71-1.5 3.6l-2.1-2.1c.05-.2.1-.41.1-.6 0-1.66-1.34-3-3-3-.2 0-.4.05-.6.1L7.4 6.86M2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 2.05 0 4.03-.4 5.84-1.12l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05-.3-.08-.63-.08-.95 0-1.66 1.34-3 3-3 .32 0 .65.03.95.08l1.55-1.55c-.67-.33-1.41-.53-2.2-.53-2.76 0-5 2.24-5 5 0 .79.2 1.53.53 2.2zm7.98-6c-2.16 0-4.29.75-5.98 2.12l2.91 2.91c1.04-.68 2.3-1.08 3.65-1.08 3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5c-1.35 0-2.61-.4-3.65-1.08l-2.91 2.91c1.69 1.37 3.82 2.12 5.98 2.12 5.33 0 9.7-3.87 9.7-9 0-5.12-4.37-9-9.7-9z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <p v-if="errors.newPassword" class="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {{ errors.newPassword }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('profile.confirmPassword') }}
          </label>
          <div class="relative">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :placeholder="t('profile.confirmNewPassword')"
              class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 pr-10"
              :class="{ 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20': errors.confirmPassword }"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              tabindex="-1"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-400 transition-colors p-1 -mr-1"
            >
              <svg v-if="!showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5C7 5 2.73 8.11 1 12.46c1.73 4.35 6 7.54 11 7.54s9.27-3.19 11-7.54C21.27 8.11 17 5 12 5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.83 9L15.64 12.81c.04-.25.08-.5.08-.81 0-1.66-1.34-3-3-3-.29 0-.54.04-.81.08M7.4 6.86c.89-.86 2.11-1.5 3.6-1.5 2.76 0 5 2.24 5 5 0 1.49-.64 2.71-1.5 3.6l-2.1-2.1c.05-.2.1-.41.1-.6 0-1.66-1.34-3-3-3-.2 0-.4.05-.6.1L7.4 6.86M2 4.27l2.28 2.28.46.46A11.804 11.804 0 001 12c1.73 4.39 6 7.5 11 7.5 2.05 0 4.03-.4 5.84-1.12l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05-.3-.08-.63-.08-.95 0-1.66 1.34-3 3-3 .32 0 .65.03.95.08l1.55-1.55c-.67-.33-1.41-.53-2.2-.53-2.76 0-5 2.24-5 5 0 .79.2 1.53.53 2.2zm7.98-6c-2.16 0-4.29.75-5.98 2.12l2.91 2.91c1.04-.68 2.3-1.08 3.65-1.08 3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5c-1.35 0-2.61-.4-3.65-1.08l-2.91 2.91c1.69 1.37 3.82 2.12 5.98 2.12 5.33 0 9.7-3.87 9.7-9 0-5.12-4.37-9-9.7-9z" fill="currentColor"/>
              </svg>
            </button>
          </div>
          <p v-if="errors.confirmPassword" class="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {{ errors.confirmPassword }}
          </p>
        </div>

        <!-- Success Message -->
        <transition name="fade">
          <div v-if="successMessage" class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-green-800 dark:text-green-400">{{ successMessage }}</p>
            </div>
          </div>
        </transition>

        <!-- Error Message -->
        <transition name="fade">
          <div v-if="errorMessage" class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <div>
              <p class="text-sm font-medium text-red-800 dark:text-red-400">{{ errorMessage }}</p>
            </div>
          </div>
        </transition>

        <!-- Action Buttons -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            @click="resetForm"
            class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg v-if="isLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? t('common.saving') : t('common.save') }}</span>
          </button>
        </div>

      </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

function normalizeMessage(message) {
  return (message || '').toLowerCase()
}

function getPasswordErrorKey(status, message) {
  const msg = normalizeMessage(message)

  if (msg.includes('current') && (msg.includes('incorrect') || msg.includes('invalid'))) {
    return 'profile.currentPasswordInvalid'
  }
  if ((msg.includes('same') || msg.includes('different')) && msg.includes('current')) {
    return 'profile.newPasswordSameAsCurrent'
  }
  if (msg.includes('weak') || msg.includes('strength')) {
    return 'profile.passwordWeak'
  }
  if (msg.includes('min') || msg.includes('length')) {
    return 'profile.passwordMinLength'
  }

  if (status === 401 || status === 403) return 'profile.passwordChangeUnauthorized'
  if (status === 404) return 'profile.passwordChangeNotAvailable'
  if (status === 429) return 'profile.passwordChangeTooManyRequests'
  if (status >= 500) return 'profile.passwordChangeServerError'

  if (status === 400 || status === 422) return 'profile.passwordChangeInvalidRequest'
  return 'profile.passwordChangeFailed'
}

function applyFieldError(errorKey) {
  if (errorKey === 'profile.currentPasswordInvalid') {
    errors.value.currentPassword = t(errorKey)
  } else if (errorKey === 'profile.newPasswordSameAsCurrent') {
    errors.value.newPassword = t(errorKey)
  } else if (errorKey === 'profile.passwordWeak') {
    errors.value.newPassword = t(errorKey)
  } else if (errorKey === 'profile.passwordMinLength') {
    errors.value.newPassword = t(errorKey)
  }
}

function validateForm() {
  errors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  if (!form.value.currentPassword) {
    errors.value.currentPassword = t('profile.currentPasswordRequired')
  }

  if (!form.value.newPassword) {
    errors.value.newPassword = t('profile.newPasswordRequired')
  } else if (form.value.newPassword.length < 8) {
    errors.value.newPassword = t('profile.passwordMinLength')
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = t('profile.confirmPasswordRequired')
  } else if (form.value.newPassword !== form.value.confirmPassword) {
    errors.value.confirmPassword = t('profile.passwordsMustMatch')
  }

  return !Object.values(errors.value).some(error => error)
}

async function handlePasswordChange() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword
      })
    })

    if (!response.ok) {
      let data = null
      try {
        data = await response.json()
      } catch (parseError) {
        data = null
      }
      const errorKey = getPasswordErrorKey(response.status, data?.message)
      applyFieldError(errorKey)
      throw new Error(errorKey)
    }

    successMessage.value = t('profile.passwordChangeSuccess')

    // Reset form after 2 seconds
    setTimeout(() => {
      resetForm()
    }, 2000)
  } catch (error) {
    if (error instanceof TypeError) {
      errorMessage.value = t('profile.passwordChangeNetworkError')
    } else {
      const errorKey = error instanceof Error && error.message.startsWith('profile.')
        ? error.message
        : 'profile.passwordChangeError'
      errorMessage.value = t(errorKey)
    }
    console.error('Password change error:', error)
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  form.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  successMessage.value = ''
  errorMessage.value = ''
  errors.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
