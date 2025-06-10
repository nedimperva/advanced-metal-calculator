import { CustomCategory, CustomProduct, ProductComponent, PricingInfo, PricingModel } from './types'
import { MATERIALS } from './metal-data'

// Default custom categories
export const DEFAULT_CUSTOM_CATEGORIES: CustomCategory[] = [
  {
    id: 'fabricated',
    name: 'Fabricated Parts',
    description: 'Custom fabricated metal components',
    icon: '🔧',
    color: 'bg-blue-500',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'assemblies',
    name: 'Assemblies',
    description: 'Multi-component assemblies',
    icon: '🏗️',
    color: 'bg-green-500',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'machined',
    name: 'Machined Parts',
    description: 'CNC machined components',
    icon: '⚙️',
    color: 'bg-purple-500',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'fasteners',
    name: 'Fasteners',
    description: 'Bolts, nuts, screws, and other fastening hardware',
    icon: '🔩',
    color: 'bg-orange-500',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'castings',
    name: 'Castings',
    description: 'Cast metal components',
    icon: '🔥',
    color: 'bg-red-500',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Sample custom products
export const SAMPLE_CUSTOM_PRODUCTS: CustomProduct[] = [
  {
    id: 'welded-bracket',
    name: 'Welded Steel Bracket',
    categoryId: 'fabricated',
    description: 'L-shaped bracket made from 2 plates welded together',
    components: [
      {
        id: 'plate1',
        materialCategory: 'steel',
        materialGrade: 'a36',
        percentage: 60,
        notes: 'Main plate'
      },
      {
        id: 'plate2',
        materialCategory: 'steel',
        materialGrade: 'a36',
        percentage: 40,
        notes: 'Side plate'
      }
    ],
    defaultDimensions: {
      'length': '200',
      'width': '150',
      'thickness': '10'
    },
    pricingOptions: [
      {
        model: 'per_unit',
        value: 25.50,
        currency: 'USD',
        description: 'Standard fabrication price'
      },
      {
        model: 'per_kg',
        value: 8.50,
        currency: 'USD',
        description: 'Material + fabrication cost per kg'
      }
    ],
    tags: ['bracket', 'welded', 'structural'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  },
  {
    id: 'composite-flange',
    name: 'Stainless-Carbon Steel Flange',
    categoryId: 'assemblies',
    description: 'Composite flange with stainless face and carbon steel body',
    components: [
      {
        id: 'face',
        materialCategory: 'stainless',
        materialGrade: 's316',
        percentage: 30,
        notes: 'Corrosion resistant face'
      },
      {
        id: 'body',
        materialCategory: 'steel',
        materialGrade: 'a36',
        percentage: 70,
        notes: 'Structural body'
      }
    ],
    defaultDimensions: {
      'outer_diameter': '300',
      'inner_diameter': '200',
      'thickness': '25'
    },
    standardSizes: [
      {
        designation: 'CF-150-6',
        dimensions: { outer_diameter: '270', inner_diameter: '152', thickness: '22' }
      },
      {
        designation: 'CF-150-8',
        dimensions: { outer_diameter: '330', inner_diameter: '200', thickness: '25' }
      },
      {
        designation: 'CF-150-10',
        dimensions: { outer_diameter: '380', inner_diameter: '254', thickness: '28' }
      }
    ],
    pricingOptions: [
      {
        model: 'per_unit',
        value: 185.00,
        currency: 'USD',
        description: 'Complete assembly price'
      }
    ],
    tags: ['flange', 'composite', 'pressure'],
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
]

// Utility functions
export function calculateCompositeProperties(components: ProductComponent[]): {
  density: number
  elasticModulus: number
  yieldStrength: number
} {
  let density = 0
  let elasticModulus = 0
  let yieldStrength = 0

  components.forEach(component => {
    const material = MATERIALS[component.materialCategory as keyof typeof MATERIALS]
      ?.grades[component.materialGrade as keyof any]
    
    if (material) {
      const fraction = component.percentage / 100
      density += material.density * fraction
      elasticModulus += material.elasticModulus * fraction
      yieldStrength += material.yieldStrength * fraction
    }
  })

  return { density, elasticModulus, yieldStrength }
}

export function calculatePricing(
  weight: number,
  quantity: number,
  pricingInfo: PricingInfo,
  area?: number
): number {
  switch (pricingInfo.model) {
    case 'per_unit':
      return pricingInfo.value * quantity
    case 'per_kg':
      return pricingInfo.value * weight * quantity
    case 'per_lb':
      return pricingInfo.value * (weight * 2.20462) * quantity // kg to lb
    case 'per_m2':
      return area ? pricingInfo.value * area * quantity : 0
    case 'per_ft2':
      return area ? pricingInfo.value * (area * 10.7639) * quantity : 0 // m² to ft²
    default:
      return 0
  }
}

export function getPricingModelDisplayName(model: PricingModel): string {
  const names: Record<PricingModel, string> = {
    'per_unit': 'Per Unit',
    'per_kg': 'Per Kilogram',
    'per_lb': 'Per Pound',
    'per_m2': 'Per Square Meter',
    'per_ft2': 'Per Square Foot'
  }
  return names[model]
}

export function validateProductComponents(components: ProductComponent[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (components.length === 0) {
    errors.push('At least one component is required')
  }
  
  const totalPercentage = components.reduce((sum, comp) => sum + comp.percentage, 0)
  if (Math.abs(totalPercentage - 100) > 0.01) {
    errors.push(`Component percentages must total 100% (currently ${totalPercentage.toFixed(1)}%)`)
  }
  
  components.forEach((comp, index) => {
    if (comp.percentage <= 0 || comp.percentage > 100) {
      errors.push(`Component ${index + 1} percentage must be between 0 and 100`)
    }
    
    if (!comp.materialCategory || !comp.materialGrade) {
      errors.push(`Component ${index + 1} must have material category and grade selected`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Local storage keys
export const STORAGE_KEYS = {
  CUSTOM_CATEGORIES: 'advanced-metal-calc-custom-categories',
  CUSTOM_PRODUCTS: 'advanced-metal-calc-custom-products'
}

// Storage functions
export function saveCustomCategories(categories: CustomCategory[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(categories))
}

export function loadCustomCategories(): CustomCategory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((cat: any) => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt)
      }))
    }
  } catch (error) {
    console.error('Error loading custom categories:', error)
  }
  return DEFAULT_CUSTOM_CATEGORIES
}

export function saveCustomProducts(products: CustomProduct[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_PRODUCTS, JSON.stringify(products))
}

export function loadCustomProducts(): CustomProduct[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRODUCTS)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.map((prod: any) => ({
        ...prod,
        createdAt: new Date(prod.createdAt),
        updatedAt: new Date(prod.updatedAt)
      }))
    }
  } catch (error) {
    console.error('Error loading custom products:', error)
  }
  return SAMPLE_CUSTOM_PRODUCTS
} 