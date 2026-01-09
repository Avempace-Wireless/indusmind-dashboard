# Dashboard Phase 1 Quick Test Checklist

**Run this checklist before proceeding to Phase 2**

---

## ✅ Quick Sanity Checks (5 minutes)

### 1. **Load & Default State**
- [ ] Dashboard loads without errors
- [ ] 4 default compteurs displayed in grid
- [ ] Each widget shows name and value
- [ ] Selection status shows "4 of X compteurs"

### 2. **Mode Switching (Per-Widget)**
- [ ] Click "Aujourd'hui" on widget 1 → shows kWh value
- [ ] Click "Hier" on widget 2 → shows kWh value
- [ ] Widget 3 still shows kW value
- [ ] Chart updates when switching modes

### 3. **Modal Interaction**
- [ ] Click "Sélectionner des compteurs" → modal opens
- [ ] Uncheck compteur → count updates in status
- [ ] Click "Annuler" → modal closes, selection unchanged
- [ ] Reopen → checkboxes reflect original state

### 4. **Add New Compteur**
- [ ] Open modal
- [ ] Uncheck compteur #1, check compteur #5
- [ ] Click "Appliquer" → modal closes
- [ ] Grid updates to new selection
- [ ] Status shows "4 of X"

### 5. **Empty State**
- [ ] Open modal
- [ ] Uncheck all compteurs
- [ ] Click "Appliquer"
- [ ] Grid shows empty state with message
- [ ] "Ajouter des compteurs" button visible

### 6. **Data Persistence**
- [ ] Set custom selection (e.g., compteurs 2,5,7,9)
- [ ] Set mixed modes (jour, hier, instantanée)
- [ ] Refresh page
- [ ] Same selection & modes displayed
- [ ] No loading spinner (uses localStorage)

### 7. **Dark Mode**
- [ ] Toggle dark mode
- [ ] All text readable
- [ ] Borders visible
- [ ] Modal styled correctly
- [ ] No contrast issues

### 8. **Equipment Table**
- [ ] Select specific compteurs
- [ ] Table shows only equipment linked to selected
- [ ] Equipment count < full list

---

## 🐛 Issues Found

| Issue | Component | Severity | Status |
|-------|-----------|----------|--------|
| (Add as found) | | | |

---

## 📊 Test Results

| Test | Result | Notes |
|------|--------|-------|
| Load & Default | PASS / FAIL | |
| Mode Switching | PASS / FAIL | |
| Modal Interaction | PASS / FAIL | |
| Add New Compteur | PASS / FAIL | |
| Empty State | PASS / FAIL | |
| Data Persistence | PASS / FAIL | |
| Dark Mode | PASS / FAIL | |
| Equipment Table | PASS / FAIL | |

**Overall Status:** ✅ PASS / ❌ FAIL

---

## 💡 Console Check

Run in DevTools Console:
```javascript
// Check if composable exports are available
const { useCompteurSelection } = await import('/src/composables/useCompteurSelection.ts')
console.log('useCompteurSelection available')

// Check localStorage
console.log('Saved selection:', localStorage.getItem('dashboard_selected_compteurs'))
```

---

## 🎯 Decision

After testing:
- [ ] **✅ PASS** → Proceed to Phase 2 (Equipment filtering, chart aggregation)
- [ ] **🔴 FAIL** → Document issues in "Issues Found" table above, fix, and retest

---

**Tester:** [Name]  
**Date:** [Date]  
**Time Spent:** [Duration]
