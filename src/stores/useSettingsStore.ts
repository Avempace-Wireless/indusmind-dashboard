import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SettingsState {
  theme: 'light' | 'dark'
  language: string
  sidebarCollapsed: boolean
  notificationPreferences: {
    email: boolean
    sms: boolean
    push: boolean
  }
  tariffInfo: {
    peakRate: number
    offPeakRate: number
    peakHours: string
    currency: string
  }
}

const defaultSettings: SettingsState = {
  theme: 'dark',
  language: 'en',
  sidebarCollapsed: false,
  notificationPreferences: {
    email: true,
    sms: true,
    push: true,
  },
  tariffInfo: {
    peakRate: 0.25,
    offPeakRate: 0.15,
    peakHours: '09:00-21:00',
    currency: 'TND',
  },
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<SettingsState>(defaultSettings)

  const setTheme = (theme: 'light' | 'dark') => {
    settings.value.theme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }

  const setLanguage = (lang: string) => {
    settings.value.language = lang
  }

  const toggleSidebar = () => {
    settings.value.sidebarCollapsed = !settings.value.sidebarCollapsed
  }

  const updateNotificationPreferences = (prefs: Partial<SettingsState['notificationPreferences']>) => {
    settings.value.notificationPreferences = {
      ...settings.value.notificationPreferences,
      ...prefs,
    }
  }

  const updateTariffInfo = (tariff: Partial<SettingsState['tariffInfo']>) => {
    settings.value.tariffInfo = {
      ...settings.value.tariffInfo,
      ...tariff,
    }
  }

  return {
    settings,
    setTheme,
    setLanguage,
    toggleSidebar,
    updateNotificationPreferences,
    updateTariffInfo,
  }
})
