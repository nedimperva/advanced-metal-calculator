export interface ProfileData {
  name: string
  dimensions: string[]
}

// Re-export MaterialGrade interface from metal-data
export type { MaterialGrade } from './metal-data'

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

// PROJECT TRACKING INTERFACES
export interface Project {
  id: string
  name: string
  description?: string
  client?: string
  location?: string
  createdAt: Date
  updatedAt: Date
  calculationIds: string[]
  status: 'active' | 'completed' | 'archived' | 'on-hold'
  tags: string[]
  // Summary data (calculated on-demand)
  totalWeight?: number
  totalCost?: number
  calculationCount?: number
  // Project settings
  defaultLengthUnit?: string
  defaultWeightUnit?: string
  color?: string // For visual identification
}

export interface ProjectSummary {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  archivedProjects: number
  totalCalculations: number
  totalWeight: number
  recentActivity: Date
  // Top materials/profiles used across projects
  topMaterials: Array<{ material: string; count: number }>
  topProfiles: Array<{ profile: string; count: number }>
}

export interface ProjectSettings {
  activeProjectId: string | null
  defaultProject: string | null
  autoSaveToProject: boolean
  showProjectInResults: boolean
  projectViewMode: 'grid' | 'list'
  defaultProjectStatus: Project['status']
}

// Enhanced Calculation interface with project support
export interface Calculation {
  id: string
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
  crossSectionalArea: number
  // Enhanced structural properties (optional for backward compatibility)
  momentOfInertiaX?: number
  momentOfInertiaY?: number
  sectionModulusX?: number
  sectionModulusY?: number
  radiusOfGyrationX?: number
  radiusOfGyrationY?: number
  perimeter?: number
  timestamp: Date
  // PROJECT TRACKING FIELDS
  projectId?: string
  projectName?: string
  notes?: string
  tags?: string[]
  calculationNumber?: string // Project-specific numbering like "PROJ-001"
  isArchived?: boolean
  quantity?: number
  pricePerUnit?: number
  currency?: string
}

// Type alias for enhanced calculation with guaranteed project fields
export interface ProjectCalculation extends Calculation {
  projectId: string
  projectName: string
}

// Project creation/update payload
export interface ProjectFormData {
  name: string
  description?: string
  client?: string
  location?: string
  status: Project['status']
  tags: string[]
  defaultLengthUnit?: string
  defaultWeightUnit?: string
  color?: string
}

// Project export data structure
export interface ProjectExportData {
  project: Project
  calculations: Calculation[]
  summary: {
    totalWeight: number
    totalCalculations: number
    materialBreakdown: Record<string, number>
    profileBreakdown: Record<string, number>
    exportDate: Date
  }
}
