# Documentation Organization Guide

**Purpose:** Organize all markdown files in the root directory into logical folders by implementation phase and content type.

---

## Current State: 33 Markdown Files

### Files by Category

#### 🎯 Main Documentation (Keep in Root)
```
├── README.md                           # Project overview
├── UX-WORK-PHASES-DOCUMENTATION.md    # Main UX documentation (MASTER INDEX)
└── QUICK-START-GUIDE.md               # Quick reference for new developers
```

---

## Proposed Folder Structure

```
a:\indusmind-dashboard\_bmad\docs\
├── 00-FOUNDATION/                 # Phase 0: Bootstrap & Infrastructure
│   ├── README.md                  # Phase overview
│   ├── ARCHITECTURE.md
│   ├── API-ENDPOINTS-SPECIFICATION.md
│   ├── SPRINT-0-BOOTSTRAP.md
│   └── SPRINT-0-CHECKLIST.md
│
├── 01-CORE-VIEWS/                 # Phase 1: Core View Implementation
│   ├── README.md
│   ├── IMPLEMENTATION-PHASE-1.md
│   ├── IMPLEMENTATION-COMPLETE.md
│   ├── BOOTSTRAP-SUMMARY.md
│   ├── IMPLEMENTATION-VIEWS.md
│   └── ROUTING-URLS-REFERENCE.md
│
├── 02-INTERNATIONALIZATION/       # Phase 2: i18n
│   ├── README.md
│   ├── I18N_IMPLEMENTATION.md
│   ├── I18N_IMPLEMENTATION_SUMMARY.md
│   ├── I18N_QUICK_START.md
│   ├── I18N_CHECKLIST.md
│   └── I18N_FILES_AND_NEXT_STEPS.md
│
├── 03-PUISSANCE-VIEW/             # Phase 3: Power Analysis
│   ├── README.md
│   ├── PUISSANCE_IMPLEMENTATION.md
│   ├── PUISSANCE_IMPLEMENTATION_FINAL.md
│   ├── PUISSANCE_UI_ENHANCEMENTS.md
│   ├── PUISSANCE_UI_ENHANCEMENT_SUMMARY.md
│   ├── PUISSANCE_ADVANCED_LAYOUT.md
│   ├── PUISSANCE_ARCHITECTURE_DIAGRAM.md
│   └── PUISSANCE_QUICK_REFERENCE.md
│
├── 04-ENERGY-HISTORY/             # Phase 4: Historical Analytics
│   ├── README.md
│   ├── ENERGY-HISTORY-START-HERE.md
│   ├── ENERGY-HISTORY-IMPLEMENTATION-PROMPT.md
│   ├── ENERGY-HISTORY-IMPLEMENTATION-DONE.md
│   ├── ENERGY-HISTORY-IMPLEMENTATION-COMPLETE.md
│   ├── ENERGY-HISTORY-PERFECT-SUMMARY.md
│   ├── ENERGY-HISTORY-PERFECT-INDEX.md
│   ├── ENERGY-HISTORY-QUICK-REFERENCE.md
│   ├── ENERGY-HISTORY-QUICK-VISUAL-GUIDE.md
│   ├── ENERGY-HISTORY-CHECKLIST.md
│   └── ENERGY-HISTORY-DELIVERABLES.md
│
├── 05-DESIGN-SYSTEM/              # Phase 5: Dashboard Redesign & Layout
│   ├── README.md
│   ├── DASHBOARD-REDESIGN-SUMMARY.md
│   ├── DASHBOARD-LAYOUT-REFERENCE.md
│   ├── ENERGY-DASHBOARD-UX-IMPROVEMENTS.md
│   ├── ENERGY-DASHBOARD-LAYOUT-GUIDE.md
│   ├── ENERGY-DASHBOARD-CSS-GUIDE.md
│   ├── ENERGY-DASHBOARD-IMPLEMENTATION-COMPLETE.md
│   └── ENERGY-DASHBOARD-QUICK-REFERENCE.md
│
├── 06-COMPARISON-VIEW/            # Phase 6: Comparison Enhancement
│   └── README.md
│
├── 07-REFERENCE/                  # Reference & Cross-cutting docs
│   ├── DOCUMENTATION_INDEX.md
│   ├── IMPLEMENTATION-SUMMARY.md
│   ├── EXTRACTION_SUMMARY.md
│   ├── FILES-MANIFEST.md
│   └── DARK-MODE-TESTING-GUIDE.md
│
├── 08-STITCH-FRAMEWORK/           # Stitch Component Patterns & Guides
│   ├── STITCH-IMPLEMENTATION-GUIDE.md
│   ├── STITCH_IMPLEMENTATION_GUIDE_UPDATED.md
│   └── STITCH_QUICK_REFERENCE.md
│
├── 09-COMPLETION/                 # Project Completion Documents
│   ├── COMPLETION-SUMMARY.md
│   ├── COMPLETION_REPORT.md
│   └── COMPETITOR-ANALYSIS.md
│
└── README.md                       # Docs index/overview
```

---

## Detailed Organization by Phase

### 📁 Phase 0: FOUNDATION (Infrastructure & Setup)

**Files to Move:**
- `ARCHITECTURE.md`
- `API-ENDPOINTS-SPECIFICATION.md`

**Purpose:** Project foundation, architecture decisions, API specifications

**Entry Point:** `docs/00-FOUNDATION/README.md`

---

### 📁 Phase 1: CORE-VIEWS (Initial Views & Routing)

**Files to Move:**
- `IMPLEMENTATION-PHASE-1.md`
- `IMPLEMENTATION-COMPLETE.md`
- `BOOTSTRAP-SUMMARY.md`

**Purpose:** First views, routing setup, core component structure

**Entry Point:** `docs/01-CORE-VIEWS/README.md`

---

### 📁 Phase 2: INTERNATIONALIZATION (i18n)

**Files to Move:**
- `I18N_IMPLEMENTATION.md`
- `I18N_IMPLEMENTATION_SUMMARY.md`
- `I18N_QUICK_START.md`
- `I18N_CHECKLIST.md`
- `I18N_FILES_AND_NEXT_STEPS.md`

**Purpose:** Multi-language support (EN/FR), locale-aware formatting

**Entry Point:** `docs/02-INTERNATIONALIZATION/README.md`

---

### 📁 Phase 3: PUISSANCE-VIEW (Power Analysis)

**Files to Move:**
- `PUISSANCE_IMPLEMENTATION.md`
- `PUISSANCE_IMPLEMENTATION_FINAL.md`
- `PUISSANCE_UI_ENHANCEMENTS.md`
- `PUISSANCE_UI_ENHANCEMENT_SUMMARY.md`
- `PUISSANCE_ADVANCED_LAYOUT.md`
- `PUISSANCE_ARCHITECTURE_DIAGRAM.md`
- `PUISSANCE_QUICK_REFERENCE.md`

**Purpose:** Power consumption view, advanced filtering, real-time monitoring

**Entry Point:** `docs/03-PUISSANCE-VIEW/README.md`

---

### 📁 Phase 4: ENERGY-HISTORY (Historical Analytics)

**Files to Move:**
- `ENERGY-HISTORY-START-HERE.md`
- `ENERGY-HISTORY-IMPLEMENTATION-PROMPT.md`
- `ENERGY-HISTORY-IMPLEMENTATION-DONE.md`
- `ENERGY-HISTORY-IMPLEMENTATION-COMPLETE.md`
- `ENERGY-HISTORY-PERFECT-SUMMARY.md`
- `ENERGY-HISTORY-PERFECT-INDEX.md`
- `ENERGY-HISTORY-QUICK-REFERENCE.md`
- `ENERGY-HISTORY-QUICK-VISUAL-GUIDE.md`
- `ENERGY-HISTORY-CHECKLIST.md`
- `ENERGY-HISTORY-DELIVERABLES.md`

**Purpose:** Historical data dashboard, calendar, date selection, aggregation

**Entry Point:** `docs/04-ENERGY-HISTORY/ENERGY-HISTORY-START-HERE.md`

---

### 📁 Phase 5: DESIGN-SYSTEM (UI/UX Refinement)

**Files to Move:**
- `DASHBOARD-REDESIGN-SUMMARY.md`
- `DASHBOARD-LAYOUT-REFERENCE.md`
- `ENERGY-DASHBOARD-UX-IMPROVEMENTS.md`
- `ENERGY-DASHBOARD-LAYOUT-GUIDE.md`
- `ENERGY-DASHBOARD-CSS-GUIDE.md`
- `ENERGY-DASHBOARD-IMPLEMENTATION-COMPLETE.md`
- `ENERGY-DASHBOARD-QUICK-REFERENCE.md`

**Purpose:** Design system, CSS, responsive layouts, dark mode

**Entry Point:** `docs/05-DESIGN-SYSTEM/README.md`

---

### 📁 Phase 6: COMPARISON-VIEW (Latest Improvements)

**Files to Move:** (None specific, but will be created)

**Purpose:** Multi-meter comparison, aggregation, pagination, chart improvements

**Entry Point:** `docs/06-COMPARISON-VIEW/README.md`

---

## Files Staying in Root

### Master Documentation
1. **README.md** - Project overview and getting started
2. **UX-WORK-PHASES-DOCUMENTATION.md** - Master index of all UX work by phase
3. **QUICK-START-GUIDE.md** - Fast reference for developers

### Project Config Files
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tailwind.config.js`
- `postcss.config.js`
- `eslint.config.ts`

---

## Navigation Structure

### Master Index (Root)
```markdown
# indusmind-dashboard

## 📖 Documentation

### Quick Access
- [Quick Start Guide](QUICK-START-GUIDE.md)
- [UX Work Phases](UX-WORK-PHASES-DOCUMENTATION.md) ← MASTER INDEX
- [Organization Guide](DOCUMENTATION-ORGANIZATION-GUIDE.md)

### Implementation Phases (in _bmad/docs/)
1. [Foundation](_bmad/docs/00-FOUNDATION/README.md)
2. [Core Views](_bmad/docs/01-CORE-VIEWS/README.md)
3. [Internationalization](_bmad/docs/02-INTERNATIONALIZATION/README.md)
4. [Puissance View](_bmad/docs/03-PUISSANCE-VIEW/README.md)
5. [Energy History](_bmad/docs/04-ENERGY-HISTORY/README.md)
6. [Design System](_bmad/docs/05-DESIGN-SYSTEM/README.md)
7. [Comparison View](_bmad/docs/06-COMPARISON-VIEW/README.md)

### Reference & Cross-cutting
- [All Documentation](_bmad/docs/07-REFERENCE/DOCUMENTATION_INDEX.md)
- [Implementation Summary](_bmad/docs/07-REFERENCE/IMPLEMENTATION-SUMMARY.md)

### Framework
- [Stitch Framework](_bmad/docs/08-STITCH-FRAMEWORK/)

### Project Status
- [Completion Status](_bmad/docs/09-COMPLETION/)
```

---

## Implementation Steps

### Step 1: Create Folder Structure
```powershell
# Navigate to _bmad directory
cd _bmad

# Remove old bmm/docs structure if exists
Remove-Item bmm\docs -Recurse -Force -ErrorAction SilentlyContinue

# Create docs folder and phase subdirectories
mkdir docs\00-FOUNDATION
mkdir docs\01-CORE-VIEWS
mkdir docs\02-INTERNATIONALIZATION
mkdir docs\03-PUISSANCE-VIEW
mkdir docs\04-ENERGY-HISTORY
mkdir docs\05-DESIGN-SYSTEM
mkdir docs\06-COMPARISON-VIEW
mkdir docs\07-REFERENCE
mkdir docs\08-STITCH-FRAMEWORK
mkdir docs\09-COMPLETION
```

### Step 2: Create Phase README Files
Each phase folder gets a `README.md` with:
- Phase overview
- Files included in this phase
- Key deliverables
- Quick navigation to detailed docs

### Step 3: Move Files
Use PowerShell to move files from root and reorganize:
```powershell
# Navigate to project root
cd A:\indusmind-dashboard

# Phase 0: Foundation (both from root and existing _bmad/docs)
Move-Item ARCHITECTURE.md _bmad\docs\00-FOUNDATION\ -Force -ErrorAction SilentlyContinue
Move-Item API-ENDPOINTS-SPECIFICATION.md _bmad\docs\00-FOUNDATION\ -Force -ErrorAction SilentlyContinue
Move-Item _bmad\docs\SPRINT-0-BOOTSTRAP.md _bmad\docs\00-FOUNDATION\ -Force -ErrorAction SilentlyContinue
Move-Item _bmad\docs\SPRINT-0-CHECKLIST.md _bmad\docs\00-FOUNDATION\ -Force -ErrorAction SilentlyContinue

# Phase 1: Core Views
Move-Item IMPLEMENTATION-PHASE-1.md _bmad\docs\01-CORE-VIEWS\ -Force -ErrorAction SilentlyContinue
Move-Item IMPLEMENTATION-COMPLETE.md _bmad\docs\01-CORE-VIEWS\ -Force -ErrorAction SilentlyContinue
Move-Item BOOTSTRAP-SUMMARY.md _bmad\docs\01-CORE-VIEWS\ -Force -ErrorAction SilentlyContinue
Move-Item _bmad\docs\IMPLEMENTATION-VIEWS.md _bmad\docs\01-CORE-VIEWS\ -Force -ErrorAction SilentlyContinue
Move-Item _bmad\docs\ROUTING-URLS-REFERENCE.md _bmad\docs\01-CORE-VIEWS\ -Force -ErrorAction SilentlyContinue

# Phase 2: Internationalization
Move-Item I18N_IMPLEMENTATION.md _bmad\docs\02-INTERNATIONALIZATION\ -Force -ErrorAction SilentlyContinue
Move-Item I18N_IMPLEMENTATION_SUMMARY.md _bmad\docs\02-INTERNATIONALIZATION\ -Force -ErrorAction SilentlyContinue
Move-Item I18N_QUICK_START.md _bmad\docs\02-INTERNATIONALIZATION\ -Force -ErrorAction SilentlyContinue
Move-Item I18N_CHECKLIST.md _bmad\docs\02-INTERNATIONALIZATION\ -Force -ErrorAction SilentlyContinue
Move-Item I18N_FILES_AND_NEXT_STEPS.md _bmad\docs\02-INTERNATIONALIZATION\ -Force -ErrorAction SilentlyContinue

# Phase 3: Puissance View
Move-Item PUISSANCE_IMPLEMENTATION.md _bmad\docs\03-PUISSANCE-VIEW\ -Force -ErrorAction SilentlyContinue
Move-Item PUISSANCE_IMPLEMENTATION_FINAL.md _bmad\docs\03-PUISSANCE-VIEW\ -Force -ErrorAction SilentlyContinue
Move-Item PUISSANCE_UI_ENHANCEMENTS.md _bmad\docs\03-PUISSANCE-VIEW\ -Force -ErrorAction SilentlyContinue
Move-Item PUISSANCE_UI_ENHANCEMENT_SUMMARY.md _bmad\docs\03-PUISSANCE-VIEW\ -Force -ErrorAction SilentlyContinue
Move-Item PUISSANCE_ADVANCED_LAYOUT.md _bmad\docs\03-PUISSANCE-VIEW\ -Force -ErrorAction SilentlyContinue
Move-Item PUISSANCE_ARCHITECTURE_DIAGRAM.md _bmad\docs\03-PUISSANCE-VIEW\ -Force -ErrorAction SilentlyContinue
Move-Item PUISSANCE_QUICK_REFERENCE.md _bmad\docs\03-PUISSANCE-VIEW\ -Force -ErrorAction SilentlyContinue

# Phase 4: Energy History
Move-Item ENERGY-HISTORY-START-HERE.md _bmad\docs\04-ENERGY-HISTORY\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-HISTORY-IMPLEMENTATION-PROMPT.md _bmad\docs\04-ENERGY-HISTORY\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-HISTORY-IMPLEMENTATION-DONE.md _bmad\docs\04-ENERGY-HISTORY\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-HISTORY-IMPLEMENTATION-COMPLETE.md _bmad\docs\04-ENERGY-HISTORY\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-HISTORY-PERFECT-SUMMARY.md _bmad\docs\04-ENERGY-HISTORY\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-HISTORY-PERFECT-INDEX.md _bmad\docs\04-ENERGY-HISTORY\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-HISTORY-QUICK-REFERENCE.md _bmad\docs\04-ENERGY-HISTORY\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-HISTORY-QUICK-VISUAL-GUIDE.md _bmad\docs\04-ENERGY-HISTORY\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-HISTORY-CHECKLIST.md _bmad\docs\04-ENERGY-HISTORY\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-HISTORY-DELIVERABLES.md _bmad\docs\04-ENERGY-HISTORY\ -Force -ErrorAction SilentlyContinue

# Phase 5: Design System
Move-Item DASHBOARD-REDESIGN-SUMMARY.md _bmad\docs\05-DESIGN-SYSTEM\ -Force -ErrorAction SilentlyContinue
Move-Item DASHBOARD-LAYOUT-REFERENCE.md _bmad\docs\05-DESIGN-SYSTEM\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-DASHBOARD-UX-IMPROVEMENTS.md _bmad\docs\05-DESIGN-SYSTEM\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-DASHBOARD-LAYOUT-GUIDE.md _bmad\docs\05-DESIGN-SYSTEM\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-DASHBOARD-CSS-GUIDE.md _bmad\docs\05-DESIGN-SYSTEM\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-DASHBOARD-IMPLEMENTATION-COMPLETE.md _bmad\docs\05-DESIGN-SYSTEM\ -Force -ErrorAction SilentlyContinue
Move-Item ENERGY-DASHBOARD-QUICK-REFERENCE.md _bmad\docs\05-DESIGN-SYSTEM\ -Force -ErrorAction SilentlyContinue

# Phase 7: Reference docs
Move-Item _bmad\docs\DOCUMENTATION_INDEX.md _bmad\docs\07-REFERENCE\ -Force -ErrorAction SilentlyContinue
Move-Item _bmad\docs\EXTRACTION_SUMMARY.md _bmad\docs\07-REFERENCE\ -Force -ErrorAction SilentlyContinue
Move-Item _bmad\docs\FILES-MANIFEST.md _bmad\docs\07-REFERENCE\ -Force -ErrorAction SilentlyContinue
Move-Item _bmad\docs\DARK-MODE-TESTING-GUIDE.md _bmad\docs\07-REFERENCE\ -Force -ErrorAction SilentlyContinue
Move-Item IMPLEMENTATION-SUMMARY.md _bmad\docs\07-REFERENCE\ -Force -ErrorAction SilentlyContinue

# Phase 8: Stitch Framework
Move-Item STITCH-IMPLEMENTATION-GUIDE.md _bmad\docs\08-STITCH-FRAMEWORK\ -Force -ErrorAction SilentlyContinue
Move-Item STITCH_IMPLEMENTATION_GUIDE_UPDATED.md _bmad\docs\08-STITCH-FRAMEWORK\ -Force -ErrorAction SilentlyContinue
Move-Item STITCH_QUICK_REFERENCE.md _bmad\docs\08-STITCH-FRAMEWORK\ -Force -ErrorAction SilentlyContinue

# Phase 9: Completion
Move-Item COMPLETION-SUMMARY.md _bmad\docs\09-COMPLETION\ -Force -ErrorAction SilentlyContinue
Move-Item COMPLETION_REPORT.md _bmad\docs\09-COMPLETION\ -Force -ErrorAction SilentlyContinue
Move-Item _bmad\docs\COMPETITOR-ANALYSIS.md _bmad\docs\09-COMPLETION\ -Force -ErrorAction SilentlyContinue
```

### Step 4: Update Cross-References

---

## Folder Naming Convention

**Format:** `NN-PHASE-NAME`

Where:
- `NN` = Phase number (00, 01, 02, etc.)
- `PHASE-NAME` = Descriptive phase name in UPPERCASE with HYPHENS

**Benefits:**
- Sorts naturally by phase
- Easy to scan and find
- Matches documentation structure
- Works with file explorers

---

## File Naming Convention

**Keep existing names** but organize by phase:
- ✅ `PHASE_FILE-DESCRIPTIVE-NAME.md`
- ✅ Clear prefixes for grouping (e.g., `I18N_`, `PUISSANCE_`, `ENERGY-`)
- ✅ Semantic naming (what + purpose)

---

## Documentation Flow

### For New Developers
1. Start with `README.md` in root
2. Read `QUICK-START-GUIDE.md`
3. Browse `UX-WORK-PHASES-DOCUMENTATION.md` for overview
4. Dive into specific phase folder in `_bmad/bmm/docs/`

### For Phase-Specific Work
1. Go to phase folder (e.g., `_bmad/docs/03-PUISSANCE-VIEW/`)
2. Read `README.md` for phase overview
3. Reference detailed documentation as needed
4. Check `QUICK-REFERENCE.md` for quick snippets

### For Design/UX Work
1. Start with `UX-WORK-PHASES-DOCUMENTATION.md`
2. Go to `_bmad/docs/05-DESIGN-SYSTEM/` for CSS and layout
3. Reference specific view implementations in their phase folders

---

## Benefits of This Organization

| Benefit | Impact |
|---------|--------|
| **Logical grouping** | Related docs together, easier to find |
| **Clear progression** | Shows development timeline and flow |
| **Scalability** | Easy to add more phases in future |
| **Navigation** | Clear entry points for each phase |
| **Maintenance** | Easier to update phase-specific docs |
| **Onboarding** | New developers understand project evolution |
| **Reference** | Quick access to phase-specific info |

---

## Migration Checklist

- [ ] Create folder structure (`docs/00-*` through `docs/06-*`)
- [ ] Create `README.md` for each phase folder
- [ ] Move files to appropriate phase folders
- [ ] Update cross-references in all files
- [ ] Update root `README.md` with navigation
- [ ] Create index in each phase folder
- [ ] Test all links work correctly
- [ ] Commit changes to git with message: `docs: organize markdown files by implementation phases`
- [ ] Update team on new documentation structure

---

## Example Phase README (Template)

```markdown
# Phase X: [Phase Name]

**Timeline:** [When implemented]  
**Status:** ✅ Complete  
**Key Focus:** [Main objective]

## 📋 Files in This Phase

- File 1: Description
- File 2: Description
- File 3: Description

## 🎯 Quick Navigation

- [Start Here](file-name.md) - Best entry point
- [Quick Reference](file-name-quick-reference.md) - Code snippets
- [Implementation Guide](file-name-implementation.md) - Detailed steps

## 📊 Summary

[Brief overview of phase accomplishments]

---

For more context, see the [UX Work Phases Documentation](../../UX-WORK-PHASES-DOCUMENTATION.md)
```

---

## Notes

- This organization mirrors the implementation timeline documented in `UX-WORK-PHASES-DOCUMENTATION.md`
- Each phase is self-contained but references the master documentation
- Future phases can be added following the same pattern
- The root directory stays clean with only essential files

