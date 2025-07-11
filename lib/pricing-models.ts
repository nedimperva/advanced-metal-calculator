// Pricing Models Configuration

export type PricingModel = 'per_kg' | 'per_unit' | 'per_meter'

export interface PricingModelInfo {
  key: PricingModel
  name: string
  description: string
  icon: string
  unit: string
  tooltip: string
}

/**
 * Available pricing models for metal calculations
 */
export const PRICING_MODELS: Record<PricingModel, PricingModelInfo> = {
  per_kg: {
    key: 'per_kg',
    name: 'Per Kg',
    description: 'Price based on weight',
    icon: '⚖️',
    unit: '/kg',
    tooltip: 'Common for bulk materials and commodity metals'
  },
  per_unit: {
    key: 'per_unit',
    name: 'Per Unit',
    description: 'Price per piece/item',
    icon: '📦',
    unit: '/piece',
    tooltip: 'Standard for finished products and fabricated parts'
  },
  per_meter: {
    key: 'per_meter',
    name: 'Per Meter',
    description: 'Price based on length',
    icon: '📏',
    unit: '/m',
    tooltip: 'Common for bars, tubes, and linear materials'
  }
}

/**
 * Calculate total cost based on pricing model
 */
export function calculateTotalCost(
  pricingModel: PricingModel,
  priceValue: number,
  weight: number, // in current weight unit
  length: number, // in current length unit
  quantity: number,
  weightUnit: string,
  lengthUnit: string
): number {
  if (!priceValue || priceValue <= 0) return 0

  // Convert to standard units for calculation
  const weightInKg = convertWeightToKg(weight, weightUnit)
  const lengthInMeters = convertLengthToMeters(length, lengthUnit)

  switch (pricingModel) {
    case 'per_kg':
      return priceValue * weightInKg * quantity
    
    case 'per_unit':
      return priceValue * quantity
    
    case 'per_meter':
      return priceValue * lengthInMeters * quantity
    
    default:
      return 0
  }
}

/**
 * Calculate unit cost based on pricing model
 */
export function calculateUnitCost(
  pricingModel: PricingModel,
  priceValue: number,
  weight: number, // in current weight unit
  length: number, // in current length unit
  weightUnit: string,
  lengthUnit: string
): number {
  if (!priceValue || priceValue <= 0) return 0

  // Convert to standard units for calculation
  const weightInKg = convertWeightToKg(weight, weightUnit)
  const lengthInMeters = convertLengthToMeters(length, lengthUnit)

  switch (pricingModel) {
    case 'per_kg':
      return priceValue * weightInKg
    
    case 'per_unit':
      return priceValue
    
    case 'per_meter':
      return priceValue * lengthInMeters
    
    default:
      return 0
  }
}

/**
 * Get the display unit for a pricing model
 */
export function getPricingDisplayUnit(pricingModel: PricingModel, currency: string): string {
  const model = PRICING_MODELS[pricingModel]
  return `${currency} ${model.unit}`
}

/**
 * Get pricing model recommendations based on profile type
 */
export function getRecommendedPricingModel(profileCategory: string, profileType: string): PricingModel {
  // Structural items typically sold per unit
  if (profileCategory === 'beams' || profileCategory === 'channels') {
    return 'per_kg'
  }
  
  // Long materials often sold per meter
  if (profileCategory === 'tubes' || profileCategory === 'bars') {
    return 'per_meter'
  }
  
  // Sheets and plates typically sold per kg
  if (profileCategory === 'sheets') {
    return 'per_kg'
  }
  
  // Default to per kg
  return 'per_kg'
}

// Weight conversion helpers
function convertWeightToKg(weight: number, unit: string): number {
  switch (unit) {
    case 'kg': return weight
    case 'g': return weight / 1000
    case 'lb': return weight * 0.453592
    case 'oz': return weight * 0.0283495
    case 't': return weight * 1000
    default: return weight // assume kg
  }
}

// Length conversion helpers  
function convertLengthToMeters(length: number, unit: string): number {
  switch (unit) {
    case 'm': return length
    case 'mm': return length / 1000
    case 'cm': return length / 100
    case 'in': return length * 0.0254
    case 'ft': return length * 0.3048
    default: return length // assume meters
  }
} 