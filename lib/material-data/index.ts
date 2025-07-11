// Enhanced material database with comprehensive properties
export type { MaterialGrade, MaterialCategory } from './types'

// Import all material categories
import { STEEL_MATERIALS } from './steel'
import { STAINLESS_MATERIALS } from './stainless'
import { ALUMINUM_MATERIALS } from './aluminum'
import { COPPER_MATERIALS } from './copper'
import { TITANIUM_MATERIALS } from './titanium'
import { SPECIALTY_MATERIALS } from './specialty'

// Export individual material categories
export {
  STEEL_MATERIALS,
  STAINLESS_MATERIALS,
  ALUMINUM_MATERIALS,
  COPPER_MATERIALS,
  TITANIUM_MATERIALS,
  SPECIALTY_MATERIALS
}

// Combine all materials into the main MATERIALS object for backward compatibility
export const MATERIALS = {
  steel: STEEL_MATERIALS,
  stainless: STAINLESS_MATERIALS,
  aluminum: ALUMINUM_MATERIALS,
  copper: COPPER_MATERIALS,
  titanium: TITANIUM_MATERIALS,
  specialty: SPECIALTY_MATERIALS,
}

// Re-export the rest of the original metal-data for compatibility
// This will be imported from the original file temporarily
export * from '../metal-data-profiles'