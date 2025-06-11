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
  // Pricing information (optional for backward compatibility)
  quantity?: number
  priceValue?: number
  pricingModel?: PricingModel
  currency?: string
  totalCost?: number
  unitCost?: number
  timestamp: Date
}
