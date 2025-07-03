# I18n Immediate Action Plan - Critical Steps

## 🎯 Current Status
- **25% Complete** - Major work still required
- **100+ hardcoded toast notifications** across 20+ components
- Context files (Project & Task) ✅ DONE
- Theme Toggle ✅ DONE
- Most UI components 🔄 PENDING

## 🚨 IMMEDIATE PRIORITY

### Phase 1: Critical Toast Notifications (HIGH PRIORITY)
Must update these components FIRST as they affect user experience:

1. **Project Dashboard** (`components/project-dashboard.tsx`)
2. **Project Details** (`components/project-details.tsx`) 
3. **Mobile Calculation History** (`components/mobile-calculation-history.tsx`)
4. **Project Card** (`components/project-card.tsx`)
5. **Save Calculation Dialog** (`components/save-calculation-dialog.tsx`)

### Phase 2: Workforce & Forms
6. **Global Machinery** (`components/global-machinery.tsx`)
7. **Global Workers** (`components/global-workers.tsx`)
8. **Worker Form** (`components/workforce/worker-form.tsx`)
9. **Machinery Form** (`components/workforce/machinery-form.tsx`)

### Phase 3: Project Management
10. **Project Creation Modal** (`components/project-creation-modal.tsx`)
11. **Project Timeline** (`components/project-timeline.tsx`)
12. **Project Materials** (`components/project-materials.tsx`)

## 🔧 Required i18n Keys to Add

Add these missing keys to both English and Bosnian translations in `lib/i18n.ts`:

```typescript
// Toast notification keys
historyRefreshed: "History Refreshed",
refreshFailed: "Refresh Failed", 
exportSuccessful: "Export Successful",
machineryStatusChanged: "Machinery Status Changed",
workerStatusChanged: "Worker Status Changed",
notesSavedSuccess: "Notes Saved Successfully",
linkCopiedSuccess: "Link Copied to Clipboard",
shareFailed: "Share Failed",
exportCompleteSuccess: "Export Complete",
exportFailed: "Export Failed",
eventAddedSuccess: "Event Added Successfully",
addFailed: "Add Failed",
invalidCalculation: "Invalid Calculation",
projectNameRequired: "Project Name Required",
templateSavedSuccess: "Template Saved",
bulkEntrySavedSuccess: "Bulk Entry Saved",
duplicateFailed: "Duplicate Failed",
timesheetDuplicatedSuccess: "Timesheet Duplicated",
entrySavedSuccess: "Entry Saved",

// And corresponding Bosnian translations:
historyRefreshed: "Historija Osvježena",
refreshFailed: "Osvježavanje Neuspješno",
exportSuccessful: "Export Uspješan",
// ... etc
```

## 📋 Step-by-Step Process

For EACH component in the priority list:

### Step 1: Add useI18n Import
```typescript
import { useI18n } from '@/contexts/i18n-context'
```

### Step 2: Add Hook to Component
```typescript
export function ComponentName() {
  const { t } = useI18n()
  // ... rest of component
}
```

### Step 3: Replace ALL Toast Notifications
```typescript
// BEFORE:
toast({
  title: "Project Deleted",
  description: "Successfully deleted project",
})

// AFTER:
toast({
  title: t('projectDeletedSuccess'),
  description: t('projectDeletedSuccess'),
})
```

### Step 4: Replace Hardcoded UI Text
```typescript
// BEFORE:
<h1>Projects</h1>
<button>Delete Project</button>

// AFTER:
<h1>{t('projects')}</h1>
<button>{t('deleteProject')}</button>
```

## ⚡ Quick Template

Use this template for each component:

```typescript
"use client"

import { useI18n } from '@/contexts/i18n-context'
// ... other imports

export function ComponentName() {
  const { t } = useI18n()
  
  // Replace every instance of:
  // - toast({ title: "English Text" }) → toast({ title: t('key') })
  // - "English Text" → {t('key')}
  // - placeholder="English" → placeholder={t('key')}
  // - confirm("English?") → confirm(t('key'))
}
```

## 🎯 Success Criteria

✅ **Phase 1 Complete**: No hardcoded English in toast notifications
✅ **Phase 2 Complete**: All workforce components localized  
✅ **Phase 3 Complete**: All project management components localized
✅ **Final**: Run app and verify 100% Bosnian interface

## 📊 Tracking Progress

After each component update:
1. Test the component functionality
2. Verify all text appears in Bosnian
3. Check console for any missing translation key errors
4. Mark component as ✅ COMPLETE in tracking

**Goal**: Complete all 20+ components and achieve 100% Bosnian localization with no remaining hardcoded English strings in the UI.