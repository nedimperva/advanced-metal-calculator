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

export interface ProjectMaterial {
  id: string
  calculationId: string
  projectId: string
  quantity: number
  status: MaterialStatus
  orderDate?: Date
  arrivalDate?: Date
  installationDate?: Date
  supplier?: string
  cost?: number
  notes: string
  trackingNumber?: string
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
