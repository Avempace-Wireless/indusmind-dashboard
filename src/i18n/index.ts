import { createI18n } from 'vue-i18n'
import enMessages from './en.json'
import frMessages from './fr.json'

/**
 * Detect user's preferred language based on:
 * 1. localStorage preference
 * 2. Browser navigator.language
 * 3. Fallback to English
 */
function detectLocale(): string {
  // Check localStorage first
  const stored = localStorage.getItem('i18n-locale')
  if (stored) return stored

  // Get browser language
  const browserLang = navigator.language || navigator.languages?.[0] || 'en'

  // Map to supported language codes
  if (browserLang.startsWith('fr')) {
    return 'fr'
  }

  return 'en'
}

/**
 * Determine if a language is French-speaking
 */
function isFrenchLocale(locale: string): boolean {
  const frenchLocales = ['fr', 'fr-FR', 'fr-CA', 'fr-BE', 'fr-CH', 'fr-LU', 'fr-MC', 'fr-SN']
  return frenchLocales.some(l => locale.toLowerCase().startsWith(l.split('-')[0]))
}

const locale = detectLocale()

const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages: {
    en: enMessages,
    fr: frMessages
  },
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false
})

export default i18n
export { isFrenchLocale, detectLocale }
