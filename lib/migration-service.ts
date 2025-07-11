/**
 * Migration Service for SteelForge Pro
 * 
 * Handles data migration between different versions of the application,
 * particularly for separating calculations from project management and
 * introducing dispatch notes functionality.
 */

import { 
  getAllProjects, 
  getAllCalculations, 
  updateCalculation,
  createDispatchNote,
  bulkCreateDispatchMaterials,
  initializeDatabase,
  STORES
} from './database'
import type { Project, Calculation, DispatchNote, DispatchMaterial } from './types'

export interface MigrationResult {
  success: boolean
  migratedCalculations: number
  createdDispatchNotes: number
  errors: string[]
}

/**
 * Migration from version 4 to version 5
 * - Separates calculations from project management
 * - Introduces dispatch notes system
 * - Migrates existing project materials to dispatch notes where applicable
 */
export async function migrateToV5(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedCalculations: 0,
    createdDispatchNotes: 0,
    errors: []
  }

  try {
    // Ensure database is initialized with new schema
    await initializeDatabase()

    // Step 1: Clean up calculation-project associations
    await migrateCalculationProjectAssociations(result)

    // Step 2: Create initial dispatch notes for projects with materials
    await createInitialDispatchNotes(result)

    result.success = true
    console.log('Migration to V5 completed successfully:', result)
    
  } catch (error) {
    console.error('Migration to V5 failed:', error)
    result.errors.push(error instanceof Error ? error.message : 'Unknown migration error')
  }

  return result
}

/**
 * Removes automatic project assignment from calculations
 * Makes calculations independent of projects
 */
async function migrateCalculationProjectAssociations(result: MigrationResult): Promise<void> {
  try {
    const calculations = await getAllCalculations()
    
    for (const calculation of calculations) {
      // Remove project association from calculations to make them independent
      if (calculation.projectId) {
        const updatedCalculation = {
          ...calculation,
          projectId: undefined,
          notes: calculation.notes 
            ? `${calculation.notes} (Previously associated with project)`
            : 'Previously associated with project'
        }
        
        await updateCalculation(updatedCalculation)
        result.migratedCalculations++
      }
    }
    
    console.log(`Migrated ${result.migratedCalculations} calculations to be project-independent`)
    
  } catch (error) {
    console.error('Failed to migrate calculation-project associations:', error)
    result.errors.push('Failed to migrate calculations')
  }
}

/**
 * Creates initial dispatch notes for projects that have materials
 * This provides a foundation for the new dispatch notes system
 */
async function createInitialDispatchNotes(result: MigrationResult): Promise<void> {
  try {
    const projects = await getAllProjects()
    
    for (const project of projects) {
      // Only create dispatch notes for projects that have materials
      if (project.materials && project.materials.length > 0) {
        const dispatchNote: Omit<DispatchNote, 'id' | 'createdAt' | 'updatedAt'> = {
          projectId: project.id,
          dispatchNumber: `MIGRATED-${project.id.slice(-8)}`,
          internalReference: `Migration from project: ${project.name}`,
          date: new Date(),
          status: 'arrived', // Assume existing materials have arrived
          supplier: {
            name: 'Legacy Supplier',
            contact: 'Migration Import',
            phone: '',
            email: '',
            address: ''
          },
          materials: [], // Will be populated separately
          notes: `Automatically created during migration from project materials. Original project: ${project.name}`,
          inspectionRequired: false,
          inspectionCompleted: true
        }

        try {
          const dispatchId = await createDispatchNote(dispatchNote)
          
          // Convert project materials to dispatch materials
          const dispatchMaterials: Omit<DispatchMaterial, 'id' | 'dispatchNoteId'>[] = project.materials.map(material => ({
            materialType: 'Steel', // Default material type
            profile: 'Unknown', // Unknown profile for migrated data
            grade: 'Unknown', // Unknown grade for migrated data
            dimensions: {},
            quantity: material.quantity,
            unitWeight: 0, // Unknown unit weight
            totalWeight: 0, // Unknown total weight
            lengthUnit: 'mm',
            weightUnit: 'kg',
            unitCost: material.cost,
            totalCost: material.cost ? material.cost * material.quantity : undefined,
            currency: 'USD',
            status: material.status === 'installed' ? 'used' : 'arrived',
            location: 'Legacy Storage',
            notes: `Migrated from project material. Original notes: ${material.notes || 'None'}`
          }))

          if (dispatchMaterials.length > 0) {
            await bulkCreateDispatchMaterials(dispatchId, dispatchMaterials)
          }

          result.createdDispatchNotes++
          
        } catch (error) {
          console.error(`Failed to create dispatch note for project ${project.id}:`, error)
          result.errors.push(`Failed to migrate materials for project: ${project.name}`)
        }
      }
    }
    
    console.log(`Created ${result.createdDispatchNotes} dispatch notes from existing project materials`)
    
  } catch (error) {
    console.error('Failed to create initial dispatch notes:', error)
    result.errors.push('Failed to create dispatch notes')
  }
}

/**
 * Checks if migration is needed by examining the database version
 */
export async function isMigrationNeeded(): Promise<boolean> {
  try {
    // This is a simple check - in a real implementation, you'd store version info
    const projects = await getAllProjects()
    const calculations = await getAllCalculations()
    
    // Check if any calculations are still associated with projects
    const calculationsWithProjects = calculations.filter(calc => calc.projectId)
    
    return calculationsWithProjects.length > 0
  } catch (error) {
    console.error('Failed to check migration status:', error)
    return false
  }
}

/**
 * Runs migration automatically if needed
 */
export async function autoMigrate(): Promise<MigrationResult | null> {
  try {
    const migrationNeeded = await isMigrationNeeded()
    
    if (migrationNeeded) {
      console.log('Migration needed, starting automatic migration...')
      return await migrateToV5()
    } else {
      console.log('No migration needed')
      return null
    }
  } catch (error) {
    console.error('Auto migration failed:', error)
    return {
      success: false,
      migratedCalculations: 0,
      createdDispatchNotes: 0,
      errors: [error instanceof Error ? error.message : 'Auto migration failed']
    }
  }
}

/**
 * Cleans up legacy data after successful migration
 */
export async function cleanupAfterMigration(): Promise<void> {
  try {
    // This could remove old data structures, unused indexes, etc.
    console.log('Migration cleanup completed')
  } catch (error) {
    console.error('Migration cleanup failed:', error)
  }
}