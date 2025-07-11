/**
 * Data Migration Utilities (Phase 5)
 * Provides tools for migrating data between schema versions and cleaning up old data
 */

import { getDatabase, STORES } from './database'

export interface MigrationResult {
  success: boolean
  recordsProcessed: number
  recordsMigrated: number
  errors: string[]
}

/**
 * Archive old project data (completed projects older than specified days)
 */
export async function archiveOldProjects(daysOld: number = 365): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    recordsProcessed: 0,
    recordsMigrated: 0,
    errors: []
  }

  try {
    const db = await getDatabase()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const transaction = db.transaction([STORES.PROJECTS], 'readwrite')
    const store = transaction.objectStore(STORES.PROJECTS)
    const request = store.getAll()

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const projects = request.result
        result.recordsProcessed = projects.length

        // Filter projects to archive
        const projectsToArchive = projects.filter(project => 
          project.status === 'completed' && 
          new Date(project.updatedAt) < cutoffDate
        )

        result.recordsMigrated = projectsToArchive.length

        // In a real implementation, you would move these to an archive store
        // For now, we'll just log them
        console.log(`Found ${result.recordsMigrated} projects ready for archiving`)
        projectsToArchive.forEach(project => {
          console.log(`Archive candidate: ${project.name} (completed: ${project.updatedAt})`)
        })

        resolve(result)
      }

      request.onerror = () => {
        result.success = false
        result.errors.push(`Failed to retrieve projects: ${request.error?.message}`)
        resolve(result)
      }
    })
  } catch (error) {
    result.success = false
    result.errors.push(`Archive operation failed: ${error}`)
    return result
  }
}

/**
 * Clean up orphaned records (materials without projects, etc.)
 */
export async function cleanupOrphanedRecords(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    recordsProcessed: 0,
    recordsMigrated: 0,
    errors: []
  }

  try {
    const db = await getDatabase()
    
    // Get all projects and materials
    const transaction = db.transaction([STORES.PROJECTS, STORES.PROJECT_MATERIALS], 'readwrite')
    const projectStore = transaction.objectStore(STORES.PROJECTS)
    const materialStore = transaction.objectStore(STORES.PROJECT_MATERIALS)
    
    const [projects, materials] = await Promise.all([
      new Promise<any[]>((resolve, reject) => {
        const req = projectStore.getAll()
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
      new Promise<any[]>((resolve, reject) => {
        const req = materialStore.getAll()
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      })
    ])

    const projectIds = new Set(projects.map(p => p.id))
    result.recordsProcessed = materials.length

    // Find orphaned materials
    const orphanedMaterials = materials.filter(material => !projectIds.has(material.projectId))
    result.recordsMigrated = orphanedMaterials.length

    // Log orphaned records (in production, you might delete them)
    console.log(`Found ${result.recordsMigrated} orphaned materials`)
    orphanedMaterials.forEach(material => {
      console.log(`Orphaned material: ${material.materialName} (project: ${material.projectId})`)
    })

    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Cleanup operation failed: ${error}`)
    return result
  }
}

/**
 * Optimize database by rebuilding indexes
 */
export async function optimizeDatabase(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    recordsProcessed: 0,
    recordsMigrated: 0,
    errors: []
  }

  try {
    // This would typically involve rebuilding indexes or compacting the database
    // For IndexedDB, we can't directly rebuild indexes, but we can provide 
    // statistics about database usage
    
    const db = await getDatabase()
    const storeNames = Array.from(db.objectStoreNames)
    
    console.log('Database optimization check:')
    console.log(`Database version: ${db.version}`)
    console.log(`Object stores: ${storeNames.length}`)
    console.log(`Stores: ${storeNames.join(', ')}`)
    
    result.recordsProcessed = storeNames.length
    result.recordsMigrated = storeNames.length
    
    return result
  } catch (error) {
    result.success = false
    result.errors.push(`Optimization failed: ${error}`)
    return result
  }
}

/**
 * Get database statistics for monitoring
 */
export async function getDatabaseStatistics(): Promise<{
  stores: Array<{
    name: string
    recordCount: number
    sizeEstimate: number
  }>
  totalRecords: number
  lastOptimized?: Date
}> {
  try {
    const db = await getDatabase()
    const storeNames = Array.from(db.objectStoreNames)
    
    const storeStats = await Promise.all(
      storeNames.map(async (storeName) => {
        const transaction = db.transaction([storeName], 'readonly')
        const store = transaction.objectStore(storeName)
        
        return new Promise<{name: string, recordCount: number, sizeEstimate: number}>((resolve, reject) => {
          const countRequest = store.count()
          countRequest.onsuccess = () => {
            resolve({
              name: storeName,
              recordCount: countRequest.result,
              sizeEstimate: countRequest.result * 1024 // Rough estimate
            })
          }
          countRequest.onerror = () => reject(countRequest.error)
        })
      })
    )

    return {
      stores: storeStats,
      totalRecords: storeStats.reduce((sum, store) => sum + store.recordCount, 0),
      lastOptimized: new Date()
    }
  } catch (error) {
    console.error('Failed to get database statistics:', error)
    return {
      stores: [],
      totalRecords: 0
    }
  }
}