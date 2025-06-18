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
