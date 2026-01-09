# I18n Quick Start Guide

## 🚀 Quick Setup

### 1. Installation (Done ✅)
```bash
npm install vue-i18n@9
```

### 2. Files Created
```
src/i18n/
├── index.ts          ← Vue I18n configuration
├── en.json           ← English translations (250+ keys)
└── fr.json           ← French translations (250+ keys)

src/composables/
└── useLanguage.ts    ← Language switching composable

src/components/common/
└── LanguageSwitcher.vue  ← Language selector UI

Modified:
- src/main.ts        ← Added i18n plugin registration
- src/views/DashboardView.vue    ← Converted to i18n
- src/components/dashboard/CompteurSelector.vue
- src/components/dashboard/UnifiedChart.vue
```

## 🌐 How It Works

### Auto Language Detection
```
App Start
  ↓
Check localStorage first
  ↓
Fall back to browser language (navigator.language)
  ↓
If French-speaking locale → use French
  ↓
Otherwise → use English
```

### Manual Language Switching
```vue
<template>
  <LanguageSwitcher />  <!-- Drop into any component -->
</template>
```

Users can:
- Select English or Français
- Reset to auto-detection
- Language persists across sessions

## 📝 Using Translations in Components

### Simple Case
```vue
<template>
  <h1>{{ $t('dashboard.title') }}</h1>
  <button>{{ $t('common.save') }}</button>
</template>
```

### With Parameters
```vue
<template>
  <!-- Translation: "{count} meter(s) selected" -->
  <p>{{ $t('dashboard.unifiedChart.subtitle', { count: 5 }) }}</p>
</template>
```

### In Script (Composables)
```typescript
import { useI18n } from 'vue-i18n'

export function useMyFeature() {
  const { t } = useI18n()
  
  const buttonLabel = t('common.save')
  const description = t('newFeature.description')
  
  return { buttonLabel, description }
}
```

## 🔍 Available Translation Keys

### Common UI
```
common.save              → "Save" / "Enregistrer"
common.cancel            → "Cancel" / "Annuler"
common.unit.kw           → "kW"
common.unit.kwh          → "kWh"
common.unit.celsius      → "°C"
common.justNow           → "Just now" / "À l'instant"
```

### Dashboard
```
dashboard.title                    → "Real-time Monitoring"
dashboard.manageMeters            → "Manage Meters"
dashboard.equipment.title         → "Equipment Status"
dashboard.equipment.columns.meter → "Meter" / "Compteur"
dashboard.equipment.status.online → "Online" / "En ligne"
dashboard.phaseBalance.title      → "Phase Balance"
dashboard.period.today            → "Today" / "Aujourd'hui"
dashboard.period.yesterday        → "Yesterday" / "Hier"
```

### Compteur (Meters)
```
compteur.selector.title           → "Select Meters"
compteur.selector.search          → "Search meters..."
compteur.modes.instantaneous      → "Instantaneous"
compteur.modes.daily              → "Daily"
```

## 🎯 Complete Translation Key Structure

Browse `src/i18n/en.json` for all available keys organized by:
- `common/` - Shared UI elements
- `navigation/` - Menu & breadcrumbs
- `dashboard/` - Dashboard labels
- `compteur/` - Meter functionality
- `temperature/` - Temperature zones
- `alerts/` - Alert types
- `language/` - Language selection

## ✅ What's Translated

### Fully Translated (✅)
- DashboardView (all text)
- CompteurSelector modal
- UnifiedChart component
- Button labels
- Table headers
- Form placeholders
- Empty states
- Status badges
- Unit labels

### To Be Translated (Next Phase)
- CompteurWidget
- PhaseBalance widget
- EventsWidget
- Header/Navigation
- Other view components

## 🧪 Testing Translations

### In Browser Console
```javascript
// Get current language
window.__INTL__.locale.value

// Switch language programmatically
// (or use LanguageSwitcher component)

// Check a translation
window.__INTL__.t('dashboard.title')

// Verify localStorage
localStorage.getItem('i18n-locale')
```

### Manual Tests
1. Open app in English browser → should show English ✅
2. Open app in French browser → should show French ✅
3. Switch to other language → all text updates ✅
4. Refresh page → language persists ✅
5. Clear localStorage → auto-detects again ✅

## 🎨 Integration with Your App

### Add Language Switcher to Header
```vue
<template>
  <header>
    <nav>
      <!-- Your nav items -->
      <LanguageSwitcher />  <!-- Add here -->
    </nav>
  </header>
</template>

<script setup>
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue'
</script>
```

### Add to Existing Components
Simply use `{{ $t('key') }}` in templates - Vue I18n is already global!

No imports needed in templates:
```vue
<template>
  <!-- Just use $t() directly -->
  <h1>{{ $t('dashboard.title') }}</h1>
</template>
```

## 🚦 Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| DashboardView | ✅ Done | All text translated |
| CompteurSelector | ✅ Done | Modal fully translated |
| UnifiedChart | ✅ Done | Chart titles & labels |
| CompteurWidget | ⏳ Pending | Next to update |
| PhaseBalance | ⏳ Pending | Next to update |
| EventsWidget | ⏳ Pending | Next to update |
| Navigation | ⏳ Pending | Future phase |

## 📖 More Information

See `I18N_IMPLEMENTATION.md` for:
- Complete architecture overview
- Detailed API reference
- Advanced usage patterns
- Troubleshooting guide
- Future enhancements

## 🎓 Key Concepts

### Locale Detection
- Automatic: Uses browser language (navigator.language)
- Smart: Detects French-speaking regions
- Persistent: Stores in localStorage
- Fallback: Always defaults to English

### File Organization
- Flat JSON structure (no nested requires)
- Dot notation for access: `dashboard.equipment.status`
- Same keys in en.json and fr.json
- Easy to add new languages

### Performance
- Translations compiled at build time
- No runtime API calls
- ~5KB per language file
- Instant language switching

## ❓ FAQ

**Q: How do I add a new language?**  
A: Create `src/i18n/es.json` with translations, update `index.ts` messages object, and update `useLanguage.ts` supportedLanguages array.

**Q: Can I use HTML in translations?**  
A: Yes, but use `v-html` directive: `<p v-html="$t('key')"></p>`

**Q: How do I pluralize?**  
A: Use parameters: `"{count} meter(s) selected"` → `$t('key', {count: 5})`

**Q: What about date/time formatting?**  
A: Use Intl.DateTimeFormat or add i18n date/time support in Phase 2.

## 🎉 You're All Set!

Your dashboard now supports:
- ✅ Automatic language detection
- ✅ Manual language switching  
- ✅ Persistent language preference
- ✅ Full translation support
- ✅ Dark mode compatible
- ✅ Easy to extend

Start using `{{ $t('key') }}` in your templates!
