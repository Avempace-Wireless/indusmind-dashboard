import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Composable for managing language detection, switching, and persistence
 */
export function useLanguage() {
  const { locale, setLocaleMessage } = useI18n()

  /**
   * Current locale/language
   */
  const currentLocale = computed(() => locale.value)

  /**
   * Get human-readable language name
   */
  const currentLanguageName = computed(() => {
    return locale.value === 'fr' ? 'Français' : 'English'
  })

  /**
   * Check if current language is French
   */
  const isFrench = computed(() => locale.value === 'fr')

  /**
   * List of supported languages
   */
  const supportedLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'fr', name: 'Français', nativeName: 'Français' }
  ]

  /**
   * Switch to a different language
   * @param languageCode 'en' or 'fr'
   */
  function switchLanguage(languageCode: string) {
    if (['en', 'fr'].includes(languageCode)) {
      locale.value = languageCode
      // Persist to localStorage
      localStorage.setItem('i18n-locale', languageCode)
      // Update HTML lang attribute for accessibility
      document.documentElement.lang = languageCode
    }
  }

  /**
   * Detect and set language based on browser locale
   */
  function autoDetectLanguage() {
    const browserLang = navigator.language || navigator.languages?.[0] || 'en'
    const langCode = browserLang.startsWith('fr') ? 'fr' : 'en'
    switchLanguage(langCode)
  }

  /**
   * Reset to browser's default language
   */
  function resetToAuto() {
    localStorage.removeItem('i18n-locale')
    autoDetectLanguage()
  }

  return {
    currentLocale,
    currentLanguageName,
    isFrench,
    supportedLanguages,
    switchLanguage,
    autoDetectLanguage,
    resetToAuto
  }
}
