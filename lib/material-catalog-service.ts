import { 
  MaterialCatalog, 
  MaterialType, 
  MaterialCategory, 
  MaterialAvailability,
  MaterialTemplate 
} from './types'
import { MATERIALS } from './metal-data'
import { PROFILES } from './metal-data'
import { 
  createMaterialCatalog, 
  getAllMaterialCatalog,
  createMaterialTemplate,
  getAllMaterialTemplates 
} from './database'

/**
 * Material Catalog Service
 * Handles migration from existing metal-data to new centralized material catalog
 * and provides utility functions for material management
 */

// Map existing material types to new enum values
const MATERIAL_TYPE_MAPPING: Record<string, MaterialType> = {
  'steel': MaterialType.STEEL,
  'aluminum': MaterialType.ALUMINUM,
  'stainless': MaterialType.STAINLESS,
  'copper': MaterialType.COPPER,
  'titanium': MaterialType.TITANIUM
}

// Determine material category based on profile compatibility
function determineMaterialCategory(compatibleProfiles: string[]): MaterialCategory {
  if (compatibleProfiles.some(profile => profile.includes('beam') || profile.includes('hea') || profile.includes('heb'))) {
    return MaterialCategory.BEAM
  }
  if (compatibleProfiles.some(profile => profile.includes('channel') || profile.includes('upn'))) {
    return MaterialCategory.CHANNEL
  }
  if (compatibleProfiles.some(profile => profile.includes('angle'))) {
    return MaterialCategory.ANGLE
  }
  if (compatibleProfiles.some(profile => profile.includes('rhs') || profile.includes('shs'))) {
    return MaterialCategory.TUBE
  }
  if (compatibleProfiles.some(profile => profile.includes('chs'))) {
    return MaterialCategory.PIPE
  }
  if (compatibleProfiles.some(profile => profile.includes('plate') || profile.includes('sheet'))) {
    return MaterialCategory.PLATE
  }
  if (compatibleProfiles.some(profile => profile.includes('bar') || profile.includes('round') || profile.includes('flat'))) {
    return MaterialCategory.BAR
  }
  
  // Default to structural for most materials
  return MaterialCategory.STRUCTURAL
}

// Map availability strings to enum
function mapAvailability(availability: string): MaterialAvailability {
  switch (availability) {
    case 'excellent': return MaterialAvailability.STOCK
    case 'good': return MaterialAvailability.STOCK
    case 'fair': return MaterialAvailability.ORDER
    case 'limited': return MaterialAvailability.SPECIAL
    default: return MaterialAvailability.ORDER
  }
}

// Get compatible profile types for a material
function getCompatibleProfiles(materialType: string): string[] {
  const profiles: string[] = []
  
  // Get all profile types that are compatible with this material
  Object.entries(PROFILES).forEach(([categoryKey, category]) => {
    Object.keys(category.types).forEach(profileType => {
      // For now, include all profiles - in a real implementation,
      // you'd check actual compatibility from material-profile-compatibility
      profiles.push(profileType)
    })
  })
  
  return profiles
}

// Estimate base price based on relative cost
function estimateBasePrice(relativeCost: number, materialType: string): number {
  const basePrices: Record<string, number> = {
    'steel': 0.50,      // $/kg base price for steel
    'aluminum': 1.80,   // $/kg base price for aluminum
    'stainless': 3.50,  // $/kg base price for stainless
    'copper': 8.00,     // $/kg base price for copper
    'titanium': 30.00   // $/kg base price for titanium
  }
  
  const basePrice = basePrices[materialType] || 1.00
  return basePrice * relativeCost
}

/**
 * Migrate existing metal-data to new material catalog structure
 */
export async function migrateMaterialsToNewCatalog(): Promise<{ 
  materialsCreated: number, 
  templatesCreated: number,
  errors: string[] 
}> {
  const result = { materialsCreated: 0, templatesCreated: 0, errors: [] }
  
  try {
    // Check if materials already exist
    const existingMaterials = await getAllMaterialCatalog()
    if (existingMaterials.length > 0) {
      console.log('Material catalog already populated, skipping migration')
      return result
    }

    // Migrate materials from MATERIALS constant
    for (const [materialKey, materialData] of Object.entries(MATERIALS)) {
      const materialType = MATERIAL_TYPE_MAPPING[materialKey] || MaterialType.STEEL
      const compatibleProfiles = getCompatibleProfiles(materialKey)
      const category = determineMaterialCategory(compatibleProfiles)
      
      // Create a catalog entry for each grade
      for (const [gradeKey, gradeData] of Object.entries(materialData.grades)) {
        try {
          const catalogMaterial: Omit<MaterialCatalog, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
            name: gradeData.name,
            type: materialType,
            category,
            
            // Physical properties from existing data
            density: gradeData.density,
            yieldStrength: gradeData.yieldStrength,
            tensileStrength: gradeData.tensileStrength,
            elasticModulus: gradeData.elasticModulus,
            poissonRatio: gradeData.poissonRatio,
            hardness: gradeData.hardness,
            
            // Thermal properties
            thermalExpansion: gradeData.thermalExpansion,
            thermalConductivity: gradeData.thermalConductivity,
            specificHeat: gradeData.specificHeat,
            meltingPoint: gradeData.meltingPoint,
            
            // Compatibility and profiles
            compatibleProfiles,
            availableGrades: [gradeKey],
            
            // Pricing and availability
            basePrice: estimateBasePrice(gradeData.relativeCost, materialKey),
            currency: 'USD',
            supplier: 'Multiple Suppliers',
            availability: mapAvailability(gradeData.availability),
            
            // Standards and applications
            standards: gradeData.standards || [],
            applications: gradeData.applications || [],
            description: `${gradeData.name} - ${materialData.name}`,
            tags: [materialKey, gradeKey, category.toLowerCase()],
          }
          
          const materialId = await createMaterialCatalog(catalogMaterial)
          result.materialsCreated++
          
          // Create common templates for this material
          await createCommonTemplatesForMaterial(materialId, gradeKey, compatibleProfiles)
          result.templatesCreated += 3 // Assume 3 templates per material
          
        } catch (error) {
          const errorMsg = `Failed to migrate ${gradeData.name}: ${error}`
          result.errors.push(errorMsg)
          console.error(errorMsg)
        }
      }
    }
    
    console.log(`Material migration completed: ${result.materialsCreated} materials, ${result.templatesCreated} templates created`)
    
  } catch (error) {
    const errorMsg = `Material migration failed: ${error}`
    result.errors.push(errorMsg)
    console.error(errorMsg)
  }
  
  return result
}

/**
 * Create common templates for a material
 */
async function createCommonTemplatesForMaterial(
  materialCatalogId: string, 
  gradeKey: string, 
  compatibleProfiles: string[]
): Promise<void> {
  const commonTemplates = [
    {
      name: `${gradeKey.toUpperCase()} Structural Beam`,
      profile: compatibleProfiles.find(p => p.includes('hea')) || compatibleProfiles[0],
      grade: gradeKey,
      standardDimensions: { h: 200, b: 200, tw: 9, tf: 15, r: 18 },
      description: 'Standard structural beam configuration',
      commonUses: ['Building frames', 'Load-bearing structures', 'Industrial construction']
    },
    {
      name: `${gradeKey.toUpperCase()} Channel Section`,
      profile: compatibleProfiles.find(p => p.includes('upn')) || compatibleProfiles[0],
      grade: gradeKey,
      standardDimensions: { h: 160, b: 65, tw: 8.5, tf: 10.5, r: 9 },
      description: 'Standard channel section configuration',
      commonUses: ['Secondary framing', 'Purlins', 'Light structural work']
    },
    {
      name: `${gradeKey.toUpperCase()} Plate`,
      profile: compatibleProfiles.find(p => p.includes('plate')) || compatibleProfiles[0],
      grade: gradeKey,
      standardDimensions: { width: 1500, height: 3000, thickness: 10 },
      description: 'Standard plate configuration',
      commonUses: ['Base plates', 'Gusset plates', 'General fabrication']
    }
  ]
  
  for (const template of commonTemplates) {
    try {
      await createMaterialTemplate({
        materialCatalogId,
        name: template.name,
        profile: template.profile,
        grade: template.grade,
        standardDimensions: template.standardDimensions,
        description: template.description,
        commonUses: template.commonUses,
        estimatedCost: undefined,
        supplier: undefined,
        isPublic: true,
        createdBy: 'system',
        tags: [gradeKey, template.profile, 'standard']
      })
    } catch (error) {
      console.error(`Failed to create template ${template.name}:`, error)
    }
  }
}

/**
 * Initialize material catalog with default data
 */
export async function initializeMaterialCatalog(): Promise<void> {
  try {
    console.log('Initializing material catalog...')
    const result = await migrateMaterialsToNewCatalog()
    
    if (result.errors.length > 0) {
      console.warn('Material catalog initialization completed with errors:', result.errors)
    } else {
      console.log('Material catalog initialized successfully')
    }
  } catch (error) {
    console.error('Failed to initialize material catalog:', error)
    throw error
  }
}

/**
 * Get material statistics
 */
export async function getMaterialCatalogStatistics(): Promise<{
  totalMaterials: number
  materialsByType: Record<MaterialType, number>
  materialsByCategory: Record<MaterialCategory, number>
  materialsByAvailability: Record<MaterialAvailability, number>
  totalTemplates: number
}> {
  const materials = await getAllMaterialCatalog()
  const templates = await getAllMaterialTemplates()
  
  const stats = {
    totalMaterials: materials.length,
    materialsByType: {} as Record<MaterialType, number>,
    materialsByCategory: {} as Record<MaterialCategory, number>,
    materialsByAvailability: {} as Record<MaterialAvailability, number>,
    totalTemplates: templates.length
  }
  
  // Initialize counters
  Object.values(MaterialType).forEach(type => {
    stats.materialsByType[type] = 0
  })
  Object.values(MaterialCategory).forEach(category => {
    stats.materialsByCategory[category] = 0
  })
  Object.values(MaterialAvailability).forEach(availability => {
    stats.materialsByAvailability[availability] = 0
  })
  
  // Count materials by type, category, and availability
  materials.forEach(material => {
    stats.materialsByType[material.type]++
    stats.materialsByCategory[material.category]++
    stats.materialsByAvailability[material.availability]++
  })
  
  return stats
}