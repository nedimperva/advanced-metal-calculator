export interface ProfileData {
  name: string
  dimensions: string[]
}

// Re-export MaterialGrade interface from metal-data
export type { MaterialGrade } from './metal-data'

// Re-export pricing types
export type { PricingModel } from './pricing-models'

// Import PricingModel for use in interfaces
import type { PricingModel } from './pricing-models'

// Project Management Enums
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MaterialStatus {
  PENDING = 'pending',
  ORDERED = 'ordered',
  SHIPPED = 'shipped',
  ARRIVED = 'arrived',
  INSTALLED = 'installed',
  CANCELLED = 'cancelled'
}

// New enhanced material status for project materials (Phase 3)
export enum ProjectMaterialStatus {
  REQUIRED = 'required',
  ORDERED = 'ordered',
  DELIVERED = 'delivered',
  INSTALLED = 'installed'
}

export enum ProjectMaterialSource {
  MANUAL = 'manual',
  CALCULATION = 'calculation',
  DISPATCH = 'dispatch',
  TEMPLATE = 'template'
}

// Project Management Interfaces
export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
  materials: ProjectMaterial[]
  calculationIds: string[]
  totalBudget?: number
  currency: string
  notes: string
  tags: string[]
  client?: string
  location?: string
  deadline?: Date
}

// Enhanced ProjectMaterial interface (Phase 3)
export interface ProjectMaterial {
  id: string
  projectId: string
  
  // Material Specification (from catalog or direct input)
  materialCatalogId?: string // Reference to MaterialCatalog if from catalog
  materialName: string
  profile: string
  grade: string
  dimensions: Record<string, number>
  
  // Project-Specific Data
  quantity: number
  unit?: string // The unit for quantity (kg, pieces, m, etc.)
  unitWeight: number
  totalWeight: number
  unitCost?: number
  totalCost?: number
  
  // Units
  lengthUnit: string
  weightUnit: string
  
  // Status & Tracking
  status: ProjectMaterialStatus
  supplier?: string
  orderDate?: Date
  deliveryDate?: Date
  installationDate?: Date
  location?: string
  notes?: string
  trackingNumber?: string
  
  // Source Tracking
  source: ProjectMaterialSource
  sourceId?: string // calculation ID, dispatch ID, template ID, etc.
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

// Updated MaterialData interface for enhanced properties
export interface MaterialData {
  name: string
  density: number // g/cm³
  color: string
  // Mechanical Properties
  yieldStrength: number // MPa
  tensileStrength: number // MPa
  elasticModulus: number // GPa
  poissonRatio: number
  hardness?: string
  
  // Thermal Properties
  thermalExpansion: number // per °C × 10⁻⁶
  thermalConductivity: number // W/m·K
  specificHeat: number // J/kg·K
  meltingPoint: number // °C
  
  // Cost and Availability
  relativeCost: number // 1-5 scale
  availability: 'excellent' | 'good' | 'fair' | 'limited'
  
  // Standards and Applications
  standards: string[]
  applications: string[]
  
  // Temperature Effects
  temperatureCoefficient?: number
}

// ============================================================================
// CENTRALIZED MATERIALS DATABASE TYPES (PHASE 2)
// ============================================================================

export enum MaterialType {
  STEEL = 'steel',
  ALUMINUM = 'aluminum',
  STAINLESS = 'stainless',
  COMPOSITE = 'composite',
  COPPER = 'copper',
  TITANIUM = 'titanium'
}

export enum MaterialCategory {
  STRUCTURAL = 'structural',
  PLATE = 'plate',
  TUBE = 'tube',
  BAR = 'bar',
  SHEET = 'sheet',
  PIPE = 'pipe',
  ANGLE = 'angle',
  CHANNEL = 'channel',
  BEAM = 'beam'
}

export enum MaterialAvailability {
  STOCK = 'stock',
  ORDER = 'order', 
  SPECIAL = 'special',
  DISCONTINUED = 'discontinued'
}

export interface MaterialCatalog {
  id: string
  name: string
  type: MaterialType
  category: MaterialCategory
  
  // Physical Properties
  density: number // g/cm³
  yieldStrength: number // MPa
  tensileStrength: number // MPa
  elasticModulus: number // GPa
  poissonRatio: number
  hardness?: string
  
  // Thermal Properties
  thermalExpansion: number // per °C × 10⁻⁶
  thermalConductivity: number // W/m·K
  specificHeat: number // J/kg·K
  meltingPoint: number // °C
  
  // Available Profiles and Compatibility
  compatibleProfiles: string[]
  availableGrades: string[]
  
  // Pricing & Availability
  basePrice: number
  currency: string
  supplier?: string
  availability: MaterialAvailability
  
  // Standards and Applications
  standards: string[]
  applications: string[]
  description?: string
  tags: string[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  version: number
}

export interface MaterialTemplate {
  id: string
  name: string
  materialCatalogId: string
  profile: string
  grade: string
  standardDimensions: Record<string, number>
  description?: string
  commonUses: string[]
  estimatedCost?: number
  supplier?: string
  
  // Template metadata
  createdAt: Date
  updatedAt: Date
  usageCount: number
  isPublic: boolean
  createdBy?: string
  tags: string[]
}

export interface MaterialSearchFilters {
  type?: MaterialType[]
  category?: MaterialCategory[]
  availability?: MaterialAvailability[]
  priceRange?: { min: number; max: number }
  strengthRange?: { min: number; max: number }
  profiles?: string[]
  applications?: string[]
  suppliers?: string[]
  tags?: string[]
}

export interface MaterialComparisonItem {
  materialId: string
  material: MaterialCatalog
  template?: MaterialTemplate
  notes?: string
}

// Re-export StructuralProperties from calculations
export type { StructuralProperties } from './calculations'

export interface Calculation {
  id: string
  name?: string // Formatted name using naming convention
  profileCategory: string
  profileType: string
  profileName: string
  standardSize: string
  material: string
  grade: string
  materialName: string
  dimensions: Record<string, string>
  weight: number
  weightUnit: string
  lengthUnit?: string
  crossSectionalArea: number
  // Enhanced structural properties (optional for backward compatibility)
  momentOfInertiaX?: number
  momentOfInertiaY?: number
  sectionModulusX?: number
  sectionModulusY?: number
  radiusOfGyrationX?: number
  radiusOfGyrationY?: number
  perimeter?: number
  // Pricing information (optional for backward compatibility)
  quantity?: number
  priceValue?: number
  pricingModel?: PricingModel
  currency?: string
  totalCost?: number
  unitCost?: number
  totalWeight?: number
  timestamp: Date
  // Project Management Integration
  projectId?: string
  notes?: string // Additional notes or context
}

// ============================================================================
// TASK SYSTEM TYPES
// ============================================================================

export enum TaskType {
  PLANNING = 'planning',
  PROCUREMENT = 'procurement', 
  FABRICATION = 'fabrication',
  WELDING = 'welding',
  INSTALLATION = 'installation',
  INSPECTION = 'inspection',
  FINISHING = 'finishing',
  CLEANUP = 'cleanup',
  OTHER = 'other'
}

export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ProjectTask {
  id: string
  projectId: string
  name: string
  description?: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority

  
  // Progress tracking (simplified)
  progress: number // 0-100
  
  // Dependencies
  dependencies: string[] // task IDs that must complete first
  blockedBy?: string[] // what this task is blocking
  
  // Assignment (simple, no teams)
  assignedTo?: string
  
  // Dates
  scheduledStart?: Date
  scheduledEnd?: Date
  actualStart?: Date
  actualEnd?: Date
  
  // Related data
  materialIds?: string[] // linked materials
  calculationIds?: string[] // linked calculations
  
  // Documentation
  notes?: string
  attachments?: string[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// Milestone system for project management


// ============================================================================
// WORKFORCE & MACHINERY MANAGEMENT
// ============================================================================

export enum WorkerSkill {
  GENERAL_LABOR = 'general_labor',
  WELDING = 'welding',
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  CARPENTRY = 'carpentry',
  MASONRY = 'masonry',
  HEAVY_EQUIPMENT = 'heavy_equipment',
  SUPERVISION = 'supervision',
  SAFETY = 'safety',
  CRANE_OPERATOR = 'crane_operator'
}

export enum MachineryType {
  EXCAVATOR = 'excavator',
  CRANE = 'crane',
  BULLDOZER = 'bulldozer',
  FORKLIFT = 'forklift',
  WELDING_MACHINE = 'welding_machine',
  GENERATOR = 'generator',
  COMPRESSOR = 'compressor',
  CONCRETE_MIXER = 'concrete_mixer',
  SCAFFOLD = 'scaffold',
  TOOLS = 'tools',
  VEHICLE = 'vehicle',
  OTHER = 'other'
}

export interface Worker {
  id: string
  name: string
  employeeId?: string
  skills: WorkerSkill[]
  hourlyRate: number
  contactInfo: {
    phone?: string
    email?: string
    address?: string
  }
  isActive: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Machinery {
  id: string
  name: string
  type: MachineryType
  model?: string
  serialNumber?: string
  hourlyRate: number
  maintenanceSchedule?: {
    lastMaintenance?: Date
    nextMaintenance?: Date
    maintenanceNotes?: string
  }
  isActive: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProjectAssignment {
  id: string
  projectId: string
  workerId?: string // Either worker OR machinery
  machineryId?: string
  assignedDate: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// DAILY TIME TRACKING & JOURNAL SYSTEM
// ============================================================================

export interface DailyWorkerEntry {
  id: string
  workerId: string
  hoursWorked: number
  workDescription: string
  taskIds?: string[] // Optional link to specific tasks
}

export interface DailyMachineryEntry {
  id: string
  machineryId: string
  hoursUsed: number
  operatorId?: string // Worker who operated the machinery
  usageDescription: string
}

export interface DailyTimesheet {
  id: string
  projectId: string
  date: Date
  workerEntries: DailyWorkerEntry[]
  machineryEntries: DailyMachineryEntry[]
  weatherConditions?: string
  notes?: string
  supervisorNotes?: string
  totalLaborHours: number
  totalMachineryHours: number
  totalLaborCost: number
  totalMachineryCost: number
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// ENHANCED DAILY JOURNAL SYSTEM (FOR MULTI-PROJECT TIME TRACKING)
// ============================================================================

export interface ProjectHours {
  projectId: string
  hours: number
  cost: number
}

export interface JournalWorkerEntry {
  workerId: string
  workerName: string
  hourlyRate: number
  totalHours: number
  totalCost: number
  projectHours: ProjectHours[]
}

export interface JournalMachineryEntry {
  machineryId: string
  machineryName: string
  hourlyRate: number
  totalHours: number
  totalCost: number
  projectHours: ProjectHours[]
}

export interface DailyJournalTimesheet {
  id: string
  date: Date
  workerEntries: JournalWorkerEntry[]
  machineryEntries: JournalMachineryEntry[]
  totalLaborHours?: number
  totalMachineryHours?: number
  totalLaborCost?: number
  totalMachineryCost?: number
  totalCost?: number
  createdAt: Date
  updatedAt: Date
}

// Legacy types for backward compatibility
export enum WorkType {
  PREPARATION = 'preparation',
  FABRICATION = 'fabrication', 
  WELDING = 'welding',
  INSTALLATION = 'installation',
  FINISHING = 'finishing',
  INSPECTION = 'inspection',
  CLEANUP = 'cleanup',
  OTHER = 'other'
}

export interface WorkEntry {
  id: string
  workerCount: number
  hoursWorked: number
  hourlyRate?: number
  workType: WorkType
  description?: string
  taskIds?: string[] // link to tasks if available
}

export interface DailyWorkLog {
  id: string
  projectId: string
  date: Date
  entries: WorkEntry[]
  notes?: string
  weather?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// DISPATCH NOTES & MATERIAL TRACKING TYPES
// ============================================================================

export enum DispatchStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  ARRIVED = 'arrived',
  PROCESSED = 'processed',
  CANCELLED = 'cancelled'
}

export enum DispatchMaterialStatus {
  PENDING = 'pending',
  ARRIVED = 'arrived',
  ALLOCATED = 'allocated',
  USED = 'used',
  DAMAGED = 'damaged'
}

export interface DispatchSupplier {
  name: string
  contact: string
  phone?: string
  email?: string
  address?: string
}

export interface DispatchMaterial {
  id: string
  dispatchNoteId: string
  // Material specifications
  materialType: string // Steel, Aluminum, etc.
  profile: string // I-beam, Channel, etc.
  grade: string
  dimensions: {
    length?: number
    width?: number
    height?: number
    thickness?: number
    diameter?: number
    [key: string]: number | undefined
  }
  // Quantity and measurements
  quantity: number
  orderedQuantity: number
  deliveredQuantity: number
  unitWeight: number
  totalWeight: number
  lengthUnit: string
  weightUnit: string
  unit: string
  // Cost information
  unitCost?: number
  totalCost?: number
  currency?: string
  // Status and tracking
  status: DispatchMaterialStatus
  location?: string // Storage location
  notes?: string
  // Quality control
  inspectionDate?: Date
  inspectionNotes?: string
  // Allocation tracking
  allocatedToTasks?: string[] // Task IDs this material is allocated to
  usageHistory?: {
    date: Date
    taskId?: string
    quantityUsed: number
    notes?: string
  }[]
}

export interface DispatchNote {
  id: string
  projectId: string
  // Dispatch identification
  dispatchNumber: string
  internalReference?: string
  // Dates
  date: Date
  expectedDeliveryDate?: Date
  actualDeliveryDate?: Date
  // Supplier information
  supplier: DispatchSupplier
  // Shipping information
  status: DispatchStatus
  trackingNumber?: string
  shippingMethod?: string
  // Financial information
  totalValue?: number
  currency?: string
  invoiceNumber?: string
  // Materials
  materials: DispatchMaterial[]
  // Documentation
  notes?: string
  attachments?: string[] // File paths or URLs
  // Quality and inspection
  inspectionRequired: boolean
  inspectionCompleted: boolean
  inspectionDate?: Date
  inspectionNotes?: string
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
}

// Summary interfaces for reporting
export interface DispatchSummary {
  totalDispatches: number
  pendingDispatches: number
  arrivedDispatches: number
  totalValue: number
  totalMaterials: number
  materialsArrived: number
  materialsAllocated: number
  materialsUsed: number
}

export interface MaterialInventory {
  materialType: string
  profile: string
  grade: string
  totalQuantity: number
  availableQuantity: number
  allocatedQuantity: number
  usedQuantity: number
  totalWeight: number
  averageUnitCost?: number
  locations: string[]
  lastUpdated: Date
}

// ============================================================================
// ENHANCED PROGRESS TRACKING TYPES
// ============================================================================

export interface DailyProgressEntry {
  date: Date
  manHours: number
  workerCount: number
  tasksCompleted: number
  notes?: string
}

export interface TaskProgress {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  blockedTasks: number
  completionPercentage: number
  weightedProgress: number // considering task priorities
}

export interface TimeProgress {
  totalManHours: number
  workByType: Record<WorkType, number>
  dailyProgress: DailyProgressEntry[]
  averageWorkersPerDay: number
  projectVelocity: number // hours per day trend
  estimatedCompletion?: Date
}

export interface EnhancedProjectProgress {
  // Task-based progress
  taskProgress: TaskProgress
  
  // Time-based progress
  timeProgress: TimeProgress
  
  // Combined metrics
  overallProgress: number
  criticalPathProgress: number
  isOnSchedule: boolean
  estimatedDaysRemaining?: number
}

// Material Stock Management
export interface MaterialStock {
  id: string
  materialCatalogId: string
  material?: MaterialCatalog
  
  // Stock quantities
  currentStock: number
  reservedStock: number
  availableStock: number
  minimumStock: number
  maximumStock: number
  
  // Pricing
  unitCost: number
  totalValue: number
  
  // Location and supplier
  location: string
  supplier: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  lastStockUpdate: Date
  
  // Additional info
  notes?: string
}

// Material Stock Transaction
export interface MaterialStockTransaction {
  id: string
  materialStockId: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RESERVED' | 'UNRESERVED'
  quantity: number
  unitCost?: number
  totalCost?: number
  
  // Reference information
  referenceId?: string // Project ID, Purchase Order ID, etc.
  referenceType?: 'PROJECT' | 'PURCHASE_ORDER' | 'ADJUSTMENT' | 'INITIAL_STOCK'
  
  // Timestamps
  transactionDate: Date
  createdAt: Date
  
  // User and notes
  createdBy?: string
  notes?: string
}

// ============================================================================
// SYNC OPERATION TYPES
// ============================================================================

// Sync operation status
export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}

// Sync operation type
export enum SyncOperationType {
  DISPATCH_TO_PROJECT = 'dispatch_to_project',
  PROJECT_TO_DISPATCH = 'project_to_dispatch',
  BIDIRECTIONAL = 'bidirectional'
}

// Sync conflict resolution strategy
export enum SyncConflictResolution {
  PRESERVE_SOURCE = 'preserve_source',
  PRESERVE_TARGET = 'preserve_target',
  MERGE = 'merge',
  MANUAL = 'manual'
}

// Enhanced sync options
export interface SyncOptions {
  validateBeforeSync?: boolean
  preserveQuantityDifferences?: boolean
  updateTimestamps?: boolean
  enableRollback?: boolean
  conflictResolution?: SyncConflictResolution
  continueOnError?: boolean
  batchSize?: number
}

// Sync validation result
export interface SyncValidationResult {
  canSync: boolean
  warnings: string[]
  errors: string[]
  conflicts: Array<{
    field: string
    sourceValue: any
    targetValue: any
    resolution: SyncConflictResolution
  }>
}

// Enhanced sync result with detailed information
export interface DetailedSyncResult {
  operationType: SyncOperationType
  status: SyncStatus
  transactionId?: string
  startTime: Date
  endTime?: Date
  duration?: number
  
  // Counts
  totalItems: number
  processedItems: number
  successfulItems: number
  failedItems: number
  skippedItems: number
  
  // Details
  successful: Array<{
    id: string
    type: 'project_material' | 'dispatch_material'
    changes: string[]
  }>
  
  failed: Array<{
    id: string
    type: 'project_material' | 'dispatch_material'
    error: string
    recoverable: boolean
    rollbackRequired: boolean
  }>
  
  skipped: Array<{
    id: string
    type: 'project_material' | 'dispatch_material'
    reason: string
  }>
  
  warnings: string[]
  conflicts: Array<{
    id: string
    field: string
    resolution: SyncConflictResolution
    details: string
  }>
}

// Sync audit log entry
export interface SyncAuditLog {
  id: string
  operationType: SyncOperationType
  status: SyncStatus
  projectId?: string
  dispatchNoteId?: string
  materialIds: string[]
  
  // Execution details
  startTime: Date
  endTime?: Date
  duration?: number
  executedBy?: string
  
  // Results
  result: DetailedSyncResult
  
  // Recovery information
  rollbackData?: any
  canRollback: boolean
  
  // Metadata
  version: string
  metadata?: Record<string, any>
  createdAt: Date
}

// Real-time sync event for UI updates
export interface SyncEvent {
  type: 'sync_started' | 'sync_progress' | 'sync_completed' | 'sync_failed' | 'sync_rolled_back'
  transactionId: string
  timestamp: Date
  data: {
    progress?: number
    currentItem?: string
    totalItems?: number
    processedItems?: number
    message?: string
    error?: string
  }
}
