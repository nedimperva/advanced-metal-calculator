# 🎯 SteelForge Pro - Architectural Refactoring & Feature Plan

## 📋 Current State Summary

**Strengths:**
- Well-structured context architecture with separate concerns
- Robust IndexedDB implementation with proper schemas
- Comprehensive material data with detailed specifications
- Clean project management interface with tabbed navigation

**Key Issues:**
- Calculator is tightly coupled to project management (project selector, auto-save)
- Materials tab shows calculations instead of actual materials
- No independent material database for reusable specifications
- Mixed responsibilities between calculation and material management

---

## 🏗️ Phase 1: Calculator Module Independence

### **1.1 Remove Project Dependencies**
- [ ] **Remove project selector dropdown** from calculator interface
- [ ] **Remove "Save to Project" button** - keep only generic "Save Calculation"
- [ ] **Remove project context imports** from calculator components
- [ ] **Remove activeProjectId state** and related project management logic

### **1.2 Pure Calculator Interface**
- [ ] **Simplified save flow**: Save calculations to history only
- [ ] **Enhanced export options**: JSON, CSV, PDF export capabilities
- [ ] **Calculation templates**: Save frequently used configurations
- [ ] **Calculation comparison**: Compare multiple calculations side-by-side

### **1.3 Calculator Data Flow**
```
Input → Calculate → Save to History → Export/Share
(No project integration)
```

---

## 🏗️ Phase 2: Centralized Materials Database

### **2.1 Material Catalog Structure**
- [ ] Create MaterialCatalog interface with comprehensive properties
- [ ] Implement material database schema in IndexedDB
- [ ] Create material CRUD operations
- [ ] Set up material categories and types

```typescript
interface MaterialCatalog {
  id: string
  name: string
  type: 'steel' | 'aluminum' | 'stainless' | 'composite'
  category: string // 'structural', 'plate', 'tube', etc.
  
  // Physical Properties
  density: number
  yieldStrength: number
  tensileStrength: number
  elasticModulus: number
  
  // Available Profiles
  compatibleProfiles: string[]
  availableGrades: MaterialGrade[]
  
  // Pricing & Availability
  basePrice: number
  currency: string
  supplier?: string
  availability: 'stock' | 'order' | 'special'
  
  // Metadata
  description?: string
  applications: string[]
  standards: string[]
  tags: string[]
}
```

### **2.2 Material Templates**
- [ ] Create MaterialTemplate interface
- [ ] Implement template CRUD operations
- [ ] Create template management UI
- [ ] Add template application workflow

```typescript
interface MaterialTemplate {
  id: string
  name: string
  materialId: string
  profile: string
  grade: string
  standardDimensions: Record<string, number>
  description?: string
  commonUses: string[]
}
```

### **2.3 Material Database Features**
- [ ] **Search & Filter**: By type, category, properties, availability
- [ ] **Material Comparison**: Side-by-side property comparison
- [ ] **Template Management**: Save/load common material configurations
- [ ] **Import/Export**: CSV import for bulk material data

---

## 🏗️ Phase 3: Enhanced Project Materials Management

### **3.1 Fix Materials Tab**
**Current Issue**: Shows calculations instead of actual materials

- [ ] Replace current materials tab implementation
- [ ] Create new ProjectMaterial interface
- [ ] Implement independent material management
- [ ] Create material addition workflows

**New Design**: Independent material management
```typescript
interface ProjectMaterial {
  id: string
  projectId: string
  
  // Material Specification (from catalog)
  materialCatalogId: string
  materialName: string
  profile: string
  grade: string
  dimensions: Record<string, number>
  
  // Project-Specific Data
  quantity: number
  unitWeight: number
  totalWeight: number
  unitCost?: number
  totalCost?: number
  
  // Status & Tracking
  status: 'required' | 'ordered' | 'delivered' | 'installed'
  supplier?: string
  orderDate?: Date
  deliveryDate?: Date
  location?: string
  notes?: string
  
  // Source Tracking
  source: 'manual' | 'calculation' | 'dispatch' | 'template'
  sourceId?: string // calculation ID, dispatch ID, etc.
}
```

### **3.2 Material Management Workflow**
- [ ] **Add from Catalog**: Browse/search material database
- [ ] **Import from Calculation**: Optional import from calculation history
- [ ] **Bulk Import**: CSV/Excel import for large material lists
- [ ] **Template Apply**: Apply saved material templates

---

## 🏗️ Phase 4: Dispatch Notes Integration

### **4.1 Dispatch Notes Structure** 
- [x] ~~Link dispatch notes to projects~~ (Already Implemented)
- [x] ~~Track incoming material deliveries~~ (Already Implemented)
- [x] ~~Bulk material input capabilities~~ (Already Implemented)
- [x] ~~Status tracking and inventory management~~ (Already Implemented)

### **4.2 Dispatch ↔ Materials Flow**
- [ ] Auto-update project materials from dispatch notes
- [ ] Sync material status between dispatch and project materials
- [ ] Implement material allocation tracking

```
Dispatch Note Created → Materials Added → Auto-update Project Materials
Project Materials ← Status Sync ← Material Arrival/Usage
```

### **4.3 Material Totals Calculation**
- [ ] **Required vs. Delivered**: Track material needs vs. arrivals
- [ ] **Cost Tracking**: Budgeted vs. actual costs
- [ ] **Inventory Status**: Available, allocated, used materials
- [ ] **Material Shortfalls**: Identify missing materials

---

## 🏗️ Phase 5: New Data Architecture

### **5.1 Module Separation**
- [ ] Refactor calculator to be completely independent
- [ ] Create MaterialCatalogProvider context
- [ ] Update ProjectProvider to remove calculation dependencies
- [ ] Ensure clean separation between all modules

```
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   CALCULATOR    │  │   MATERIALS DB   │  │  PROJECT MGMT   │
│                 │  │                  │  │                 │
│ • Pure Calcs    │  │ • Material Specs │  │ • Project Mats  │
│ • Save History  │  │ • Templates      │  │ • Dispatch Notes│
│ • Export/Share  │  │ • Search/Filter  │  │ • Status Track  │
└─────────────────┘  └──────────────────┘  └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                               │
                    ┌──────────────────┐
                    │   SHARED UTILS   │
                    │                  │
                    │ • Material Props │
                    │ • Calculations   │
                    │ • Unit Convert   │
                    └──────────────────┘
```

### **5.2 Context Architecture**
- [ ] **CalculationProvider**: Pure calculator logic
- [ ] **MaterialCatalogProvider**: Centralized material database
- [ ] **ProjectProvider**: Project management (no calc deps)
- [ ] **DispatchProvider**: Dispatch notes and tracking

---

## 🏗️ Phase 6: Implementation Priority

### **🔥 High Priority (Immediate)**
- [ ] **Remove calculator project dependencies**
- [ ] **Fix materials tab** to show actual materials
- [ ] **Create material catalog database**
- [ ] **Implement material templates**

### **🟡 Medium Priority (Next Sprint)**
- [ ] **Enhanced material search/filtering**
- [ ] **Bulk material import/export**
- [ ] **Material cost tracking integration**
- [ ] **Calculation → Material import workflow**

### **🟢 Low Priority (Future)**
- [ ] **Advanced material analytics**
- [ ] **Material vendor integration**
- [ ] **Material specifications validation**
- [ ] **Cross-project material analysis**

---

## 🎯 Success Criteria

### **Calculator Independence**
- [ ] No project context dependencies
- [ ] Pure calculation focus
- [ ] Enhanced export capabilities
- [ ] Calculation history management

### **Material Database**
- [ ] Centralized material catalog
- [ ] Template system
- [ ] Search and filtering
- [ ] Import/export capabilities

### **Project Materials**
- [ ] Independent material management
- [ ] Dispatch note integration
- [ ] Accurate material totals
- [ ] Status tracking workflow

### **Clean Architecture**
- [ ] Modular design
- [ ] Single responsibility contexts
- [ ] Clear data flow
- [ ] Maintainable codebase

---

## 📝 Progress Tracking

### **Completed Tasks**
- [x] ~~Dispatch Notes system implementation~~
- [x] ~~Bulk material input functionality~~
- [x] ~~Material tracking and status management~~
- [x] ~~Project dispatch management UI~~

### **In Progress**
- Currently working on: _[Update as needed]_

### **Next Up**
- Calculator independence refactoring
- Material catalog database creation
- Materials tab redesign

---

## 🚀 Getting Started

1. **Phase 1**: Start with calculator independence - remove project dependencies
2. **Phase 2**: Create material catalog database and basic CRUD operations
3. **Phase 3**: Redesign project materials tab with new data structure
4. **Phase 4**: Integrate dispatch notes with new material management
5. **Phase 5**: Finalize architecture and clean up any remaining coupling

---

*Last Updated: [Current Date]*
*Total Tasks: [Count checkboxes]*
*Completed: [Count checked boxes]*
*Progress: [Percentage]*