// Enhanced material database with comprehensive properties
export interface MaterialGrade {
  name: string
  density: number // g/cm³
  color: string
  // Mechanical Properties
  yieldStrength: number // MPa
  tensileStrength: number // MPa
  elasticModulus: number // GPa
  poissonRatio: number
  hardness?: string // HB, HRC, etc.
  
  // Thermal Properties
  thermalExpansion: number // per °C × 10⁻⁶
  thermalConductivity: number // W/m·K
  specificHeat: number // J/kg·K
  meltingPoint: number // °C
  
  // Cost and Availability
  relativeCost: number // 1-5 scale (1=cheapest, 5=most expensive)
  availability: 'excellent' | 'good' | 'fair' | 'limited'
  
  // Standards and Certifications
  standards: string[]
  applications: string[]
  
  // Temperature Effects (density changes with temperature)
  temperatureCoefficient?: number // density change per °C
}

export interface MaterialCategory {
  name: string
  grades: Record<string, MaterialGrade>
}