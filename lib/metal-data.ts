// Enhanced material database - now using modular structure
// This file maintains backward compatibility while using the new material-data modules

// Re-export types and materials from the new modular structure
export type { MaterialGrade } from './material-data/types'
export { MATERIALS } from './material-data'

// Re-export profiles and standard sizes
export { PROFILES, STANDARD_SIZES } from './metal-data-profiles'