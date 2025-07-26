import { 
  DispatchNote, 
  DispatchMaterial, 
  DispatchMaterialStatus,
  ProjectMaterial, 
  ProjectMaterialStatus, 
  ProjectMaterialSource 
} from './types'
import { 
  getProjectMaterials,
  createProjectMaterial,
  updateProjectMaterial,
  getProjectMaterialsBySource,
  getDispatchNotesByProject,
  getDispatchMaterialsByDispatch,
  getMaterialStockByMaterialId,
  updateMaterialStock,
  createMaterialStockTransaction,
  createMaterialStock
} from './database'

/**
 * Dispatch Materials Synchronization Service
 * Handles automatic synchronization between dispatch notes and project materials
 */

// Mapping between dispatch material status and project material status
const DISPATCH_TO_PROJECT_STATUS_MAP: Partial<Record<DispatchMaterialStatus, ProjectMaterialStatus>> = {
  [DispatchMaterialStatus.PENDING]: ProjectMaterialStatus.ORDERED,
  [DispatchMaterialStatus.ARRIVED]: ProjectMaterialStatus.DELIVERED,
  [DispatchMaterialStatus.ALLOCATED]: ProjectMaterialStatus.DELIVERED,
  [DispatchMaterialStatus.USED]: ProjectMaterialStatus.INSTALLED
}

// Reverse mapping for project to dispatch status sync
const PROJECT_TO_DISPATCH_STATUS_MAP: Partial<Record<ProjectMaterialStatus, DispatchMaterialStatus>> = {
  [ProjectMaterialStatus.REQUIRED]: DispatchMaterialStatus.PENDING,
  [ProjectMaterialStatus.ORDERED]: DispatchMaterialStatus.PENDING,
  [ProjectMaterialStatus.DELIVERED]: DispatchMaterialStatus.ARRIVED,
  [ProjectMaterialStatus.INSTALLED]: DispatchMaterialStatus.USED
}

interface SyncResult {
  materialsCreated: number
  materialsUpdated: number
  materialsSkipped: number
  errors: string[]
}

interface MaterialAllocation {
  dispatchMaterialId: string
  projectMaterialId: string
  allocatedQuantity: number
  remainingQuantity: number
  allocationDate: Date
  notes?: string
}

interface SyncTransaction {
  id: string
  projectMaterialId: string
  dispatchMaterialId: string
  changes: Partial<DispatchMaterial>
  previousState: DispatchMaterial
  timestamp: Date
  status: 'pending' | 'completed' | 'failed' | 'rolled_back'
}

interface SyncError extends Error {
  syncTransactionId?: string
  recoverable: boolean
  rollbackRequired: boolean
}

/**
 * Automatically sync dispatch materials to project materials when dispatch note is created/updated
 */
export async function syncDispatchToProjectMaterials(
  projectId: string, 
  dispatchNote: DispatchNote,
  options: {
    createIfNotExists?: boolean
    updateExisting?: boolean
    syncStatus?: boolean
  } = {}
): Promise<SyncResult> {
  const { 
    createIfNotExists = true, 
    updateExisting = true, 
    syncStatus = true 
  } = options

  const result: SyncResult = {
    materialsCreated: 0,
    materialsUpdated: 0,
    materialsSkipped: 0,
    errors: []
  }

  try {
    // Get existing project materials from this dispatch
    const existingMaterials = await getProjectMaterialsBySource(
      projectId, 
      ProjectMaterialSource.DISPATCH, 
      dispatchNote.id
    )

    // Create a map of existing materials by dispatch material ID
    const existingMaterialsMap = new Map<string, ProjectMaterial>()
    existingMaterials.forEach(material => {
      if (material.sourceId) {
        existingMaterialsMap.set(material.sourceId, material)
      }
    })

    // Process each dispatch material
    for (const dispatchMaterial of dispatchNote.materials) {
      try {
        const existingMaterial = existingMaterialsMap.get(dispatchMaterial.id)

        if (existingMaterial && updateExisting) {
          // Update existing project material
          const updates: Partial<ProjectMaterial> = {
            quantity: dispatchMaterial.quantity,
            unitWeight: dispatchMaterial.unitWeight,
            totalWeight: dispatchMaterial.totalWeight,
            unitCost: dispatchMaterial.unitCost,
            totalCost: dispatchMaterial.totalCost,
            lengthUnit: dispatchMaterial.lengthUnit,
            weightUnit: dispatchMaterial.weightUnit,
            location: dispatchMaterial.location,
            notes: combineNotes(existingMaterial.notes, dispatchMaterial.notes)
          }

          // Sync status if enabled
          if (syncStatus && dispatchMaterial.status in DISPATCH_TO_PROJECT_STATUS_MAP) {
            updates.status = DISPATCH_TO_PROJECT_STATUS_MAP[dispatchMaterial.status]
            
            // Update delivery date when status changes to delivered
            if (updates.status === ProjectMaterialStatus.DELIVERED && !existingMaterial.deliveryDate) {
              updates.deliveryDate = dispatchNote.actualDeliveryDate || new Date()
            }
          }

          await updateProjectMaterial(existingMaterial.id, updates)
          result.materialsUpdated++

        } else if (!existingMaterial && createIfNotExists) {
          // Create new project material from dispatch material
          const newMaterial: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
            projectId,
            materialCatalogId: undefined, // Could be enhanced to link to catalog
            materialName: `${dispatchMaterial.materialType} ${dispatchMaterial.grade}`,
            profile: dispatchMaterial.profile,
            grade: dispatchMaterial.grade,
            dimensions: convertDispatchDimensionsToProjectDimensions(dispatchMaterial.dimensions),
            quantity: dispatchMaterial.quantity,
            unitWeight: dispatchMaterial.unitWeight,
            totalWeight: dispatchMaterial.totalWeight,
            unitCost: dispatchMaterial.unitCost,
            totalCost: dispatchMaterial.totalCost,
            lengthUnit: dispatchMaterial.lengthUnit,
            weightUnit: dispatchMaterial.weightUnit,
            status: syncStatus && dispatchMaterial.status in DISPATCH_TO_PROJECT_STATUS_MAP 
              ? DISPATCH_TO_PROJECT_STATUS_MAP[dispatchMaterial.status] 
              : ProjectMaterialStatus.DELIVERED,
            supplier: dispatchNote.supplier.name,
            orderDate: dispatchNote.date,
            deliveryDate: dispatchNote.actualDeliveryDate,
            location: dispatchMaterial.location,
            notes: createDispatchNotes(dispatchNote, dispatchMaterial),
            trackingNumber: dispatchNote.trackingNumber,
            source: ProjectMaterialSource.DISPATCH,
            sourceId: dispatchMaterial.id
          }

          await createProjectMaterial(newMaterial)
          result.materialsCreated++

          // Update stock when material is delivered
          try {
            await updateStockFromDispatchDelivery(dispatchMaterial, dispatchNote)
          } catch (stockError) {
            console.warn(`Stock update failed for material ${dispatchMaterial.id}:`, stockError)
            // Don't fail the main sync if stock update fails
          }
        } else {
          result.materialsSkipped++
        }

      } catch (error) {
        const errorMsg = `Failed to sync material ${dispatchMaterial.id}: ${error}`
        result.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

  } catch (error) {
    const errorMsg = `Failed to sync dispatch ${dispatchNote.id}: ${error}`
    result.errors.push(errorMsg)
    console.error(errorMsg)
  }

  return result
}

/**
 * Update material stock when dispatch materials are delivered
 */
export async function updateStockFromDispatchDelivery(
  dispatchMaterial: DispatchMaterial,
  dispatchNote: DispatchNote
): Promise<void> {
  // Only process materials that have been delivered (arrived, inspected, allocated)
  if (!['arrived', 'inspected', 'allocated'].includes(dispatchMaterial.status)) {
    return
  }

  try {
    // Create a simple material identifier for stock lookup
    // In a real implementation, you'd want a more sophisticated material matching system
    const materialIdentifier = `${dispatchMaterial.materialType}-${dispatchMaterial.grade}-${dispatchMaterial.profile}`
    
    // Try to find existing stock for this material
    // Note: This requires implementing getMaterialStockByMaterialId or similar function
    // For now, we'll create stock entries for dispatch materials
    
    const stockEntry = {
      materialCatalogId: `dispatch-${dispatchMaterial.id}`, // Temporary ID until catalog integration
      material: {
        name: `${dispatchMaterial.materialType} ${dispatchMaterial.grade}`,
        type: dispatchMaterial.materialType,
        profile: dispatchMaterial.profile,
        grade: dispatchMaterial.grade,
        dimensions: dispatchMaterial.dimensions
      },
      currentStock: dispatchMaterial.quantity,
      availableStock: dispatchMaterial.quantity,
      reservedStock: 0,
      minimumStock: 0,
      maximumStock: dispatchMaterial.quantity * 2,
      unitCost: dispatchMaterial.unitCost || 0,
      totalValue: dispatchMaterial.totalCost || 0,
      location: dispatchMaterial.location || 'Warehouse',
      supplier: dispatchNote.supplier?.name || 'Unknown',
      notes: `Delivered via dispatch note ${dispatchNote.dispatchNumber}`
    }

    // Create stock entry
    const stockId = await createMaterialStock(stockEntry)

    // Create stock transaction
    await createMaterialStockTransaction({
      materialStockId: stockId,
      type: 'IN',
      quantity: dispatchMaterial.quantity,
      unitCost: dispatchMaterial.unitCost,
      totalCost: dispatchMaterial.totalCost,
      referenceId: dispatchNote.id,
      referenceType: 'PROJECT', // Using PROJECT as closest match to DISPATCH
      transactionDate: dispatchNote.actualDeliveryDate || new Date(),
      notes: `Material delivery from dispatch ${dispatchNote.dispatchNumber}`,
      createdBy: 'system'
    })

    console.log(`Stock updated for dispatch material ${dispatchMaterial.id}: +${dispatchMaterial.quantity} units`)

  } catch (error) {
    console.error(`Failed to update stock for dispatch material ${dispatchMaterial.id}:`, error)
    throw error
  }
}

/**
 * Sync project material status changes back to dispatch materials
 */
export async function syncProjectToDispatchMaterials(
  projectMaterial: ProjectMaterial,
  options: {
    validateBeforeSync?: boolean
    preserveQuantityDifferences?: boolean
    updateTimestamps?: boolean
  } = {}
): Promise<void> {
  if (projectMaterial.source !== ProjectMaterialSource.DISPATCH || !projectMaterial.sourceId) {
    return // Only sync materials that came from dispatch
  }

  const {
    validateBeforeSync = true,
    preserveQuantityDifferences = true,
    updateTimestamps = true
  } = options

  try {
    // Get the current dispatch material to compare
    const { getDispatchMaterialById } = await import('./database')
    const currentDispatchMaterial = await getDispatchMaterialById(projectMaterial.sourceId)
    
    if (!currentDispatchMaterial) {
      console.warn(`Dispatch material ${projectMaterial.sourceId} not found, cannot sync`)
      return
    }

    // Validate sync compatibility if requested
    if (validateBeforeSync) {
      const validationResult = validateSyncCompatibility(projectMaterial, currentDispatchMaterial)
      if (!validationResult.canSync) {
        console.warn(`Sync validation failed for ${projectMaterial.id}: ${validationResult.reason}`)
        return
      }
    }

    // Prepare dispatch material updates
    const dispatchUpdates: Partial<DispatchMaterial> = {}

    // Map project status to dispatch status
    if (projectMaterial.status in PROJECT_TO_DISPATCH_STATUS_MAP) {
      const newDispatchStatus = PROJECT_TO_DISPATCH_STATUS_MAP[projectMaterial.status]
      
      // Only update if status is progressing forward (no regression)
      if (shouldUpdateDispatchStatus(currentDispatchMaterial.status, newDispatchStatus)) {
        dispatchUpdates.status = newDispatchStatus
      }
    }

    // Sync quantity changes if not preserving differences
    if (!preserveQuantityDifferences) {
      // Update delivered quantity based on project material status
      if (projectMaterial.status === ProjectMaterialStatus.DELIVERED || 
          projectMaterial.status === ProjectMaterialStatus.INSTALLED) {
        dispatchUpdates.deliveredQuantity = projectMaterial.quantity
      }
    }

    // Sync location if it was updated in project
    if (projectMaterial.location && projectMaterial.location !== currentDispatchMaterial.location) {
      dispatchUpdates.location = projectMaterial.location
    }

    // Sync notes (combine with existing notes)
    if (projectMaterial.notes) {
      const syncNote = `Project sync: ${projectMaterial.notes}`
      dispatchUpdates.notes = currentDispatchMaterial.notes 
        ? `${currentDispatchMaterial.notes}\n\n${syncNote}`
        : syncNote
    }

    // Add timestamps if requested
    if (updateTimestamps) {
      const now = new Date()
      
      // Set inspection date when material is delivered
      if (dispatchUpdates.status === 'arrived' && !currentDispatchMaterial.inspectionDate) {
        dispatchUpdates.inspectionDate = now
      }
      
      // Add usage history when material is used
      if (dispatchUpdates.status === 'used') {
        const usageEntry = {
          date: now,
          quantityUsed: projectMaterial.quantity,
          notes: `Used in project ${projectMaterial.projectId} via sync from project material ${projectMaterial.id}`
        }
        
        dispatchUpdates.usageHistory = [
          ...(currentDispatchMaterial.usageHistory || []),
          usageEntry
        ]
      }
    }

    // Apply updates if there are any changes
    if (Object.keys(dispatchUpdates).length > 0) {
      const { updateDispatchMaterial } = await import('./database')
      await updateDispatchMaterial(projectMaterial.sourceId, dispatchUpdates)
      
      console.log(`Successfully synced project material ${projectMaterial.id} to dispatch material ${projectMaterial.sourceId}`)
      console.log(`Updates applied:`, Object.keys(dispatchUpdates).join(', '))
    } else {
      console.log(`No sync updates needed for project material ${projectMaterial.id}`)
    }
    
  } catch (error) {
    console.error(`Failed to sync project material ${projectMaterial.id} to dispatch:`, error)
    throw error // Re-throw to allow caller to handle sync failures
  }
}

/**
 * Get material allocation summary for a project
 */
export async function getProjectMaterialAllocationSummary(projectId: string): Promise<{
  totalRequired: number
  totalDelivered: number
  totalInstalled: number
  totalWeight: number
  totalCost: number
  materialShortfalls: Array<{
    materialName: string
    profile: string
    grade: string
    requiredQuantity: number
    deliveredQuantity: number
    shortfall: number
  }>
  costAnalysis: {
    budgetedCost: number
    actualCost: number
    variance: number
    variancePercentage: number
  }
}> {
  const projectMaterials = await getProjectMaterials(projectId)
  
  const summary = {
    totalRequired: 0,
    totalDelivered: 0,
    totalInstalled: 0,
    totalWeight: 0,
    totalCost: 0,
    materialShortfalls: [] as any[],
    costAnalysis: {
      budgetedCost: 0,
      actualCost: 0,
      variance: 0,
      variancePercentage: 0
    }
  }

  // Group materials by specification to identify shortfalls
  const materialGroups = new Map<string, {
    specification: { materialName: string; profile: string; grade: string }
    materials: ProjectMaterial[]
    totalRequired: number
    totalDelivered: number
  }>()

  projectMaterials.forEach(material => {
    const key = `${material.materialName}-${material.profile}-${material.grade}`
    
    if (!materialGroups.has(key)) {
      materialGroups.set(key, {
        specification: {
          materialName: material.materialName,
          profile: material.profile,
          grade: material.grade
        },
        materials: [],
        totalRequired: 0,
        totalDelivered: 0
      })
    }

    const group = materialGroups.get(key)!
    group.materials.push(material)
    
    // Count quantities based on status
    if (material.status === ProjectMaterialStatus.REQUIRED) {
      group.totalRequired += material.quantity
      summary.totalRequired += material.quantity
    } else if (material.status === ProjectMaterialStatus.DELIVERED) {
      group.totalDelivered += material.quantity
      summary.totalDelivered += material.quantity
    } else if (material.status === ProjectMaterialStatus.INSTALLED) {
      group.totalDelivered += material.quantity // Count as delivered too
      summary.totalDelivered += material.quantity
      summary.totalInstalled += material.quantity
    }

    // Accumulate weight and cost
    summary.totalWeight += material.totalWeight
    if (material.totalCost) {
      summary.totalCost += material.totalCost
    }
  })

  // Identify shortfalls
  materialGroups.forEach(group => {
    if (group.totalRequired > group.totalDelivered) {
      summary.materialShortfalls.push({
        materialName: group.specification.materialName,
        profile: group.specification.profile,
        grade: group.specification.grade,
        requiredQuantity: group.totalRequired,
        deliveredQuantity: group.totalDelivered,
        shortfall: group.totalRequired - group.totalDelivered
      })
    }
  })

  // Calculate cost analysis with real project budget data
  summary.costAnalysis.actualCost = summary.totalCost
  
  // Get real project budget from project data
  try {
    const { getProject } = await import('./database')
    const project = await getProject(projectId)
    
    if (project?.totalBudget) {
      // Use actual project budget
      summary.costAnalysis.budgetedCost = project.totalBudget
    } else {
      // Fallback to estimated budget based on materials
      summary.costAnalysis.budgetedCost = summary.totalCost * 1.2 // 20% buffer estimate
    }
  } catch (error) {
    console.warn('Could not fetch project budget, using estimated budget')
    summary.costAnalysis.budgetedCost = summary.totalCost * 1.2 // 20% buffer estimate
  }
  
  summary.costAnalysis.variance = summary.costAnalysis.actualCost - summary.costAnalysis.budgetedCost
  summary.costAnalysis.variancePercentage = summary.costAnalysis.budgetedCost > 0 
    ? (summary.costAnalysis.variance / summary.costAnalysis.budgetedCost) * 100 
    : 0

  return summary
}

/**
 * Auto-sync all dispatch notes for a project
 */
export async function syncAllDispatchNotesForProject(
  projectId: string,
  options: {
    createIfNotExists?: boolean
    updateExisting?: boolean
    syncStatus?: boolean
  } = {}
): Promise<SyncResult> {
  const aggregatedResult: SyncResult = {
    materialsCreated: 0,
    materialsUpdated: 0,
    materialsSkipped: 0,
    errors: []
  }

  try {
    const dispatchNotes = await getDispatchNotesByProject(projectId)
    
    for (const dispatchNote of dispatchNotes) {
      const result = await syncDispatchToProjectMaterials(projectId, dispatchNote, options)
      
      aggregatedResult.materialsCreated += result.materialsCreated
      aggregatedResult.materialsUpdated += result.materialsUpdated
      aggregatedResult.materialsSkipped += result.materialsSkipped
      aggregatedResult.errors.push(...result.errors)
    }

  } catch (error) {
    const errorMsg = `Failed to sync all dispatch notes for project ${projectId}: ${error}`
    aggregatedResult.errors.push(errorMsg)
    console.error(errorMsg)
  }

  return aggregatedResult
}

// Helper functions
function convertDispatchDimensionsToProjectDimensions(
  dispatchDimensions: Record<string, number | undefined>
): Record<string, number> {
  const converted: Record<string, number> = {}
  
  Object.entries(dispatchDimensions).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      converted[key] = value
    }
  })
  
  return converted
}

/**
 * Validate if project and dispatch materials can be synced
 */
function validateSyncCompatibility(
  projectMaterial: ProjectMaterial,
  dispatchMaterial: DispatchMaterial
): { canSync: boolean; reason?: string } {
  // Check if materials are fundamentally the same
  if (projectMaterial.profile !== dispatchMaterial.profile) {
    return {
      canSync: false,
      reason: `Profile mismatch: project has '${projectMaterial.profile}', dispatch has '${dispatchMaterial.profile}'`
    }
  }

  if (projectMaterial.grade !== dispatchMaterial.grade) {
    return {
      canSync: false,
      reason: `Grade mismatch: project has '${projectMaterial.grade}', dispatch has '${dispatchMaterial.grade}'`
    }
  }

  // Check for critical dimension mismatches
  const criticalDimensions = ['length', 'width', 'height', 'thickness', 'diameter']
  for (const dim of criticalDimensions) {
    const projectDim = projectMaterial.dimensions[dim]
    const dispatchDim = dispatchMaterial.dimensions[dim]
    
    if (projectDim !== undefined && dispatchDim !== undefined && 
        Math.abs(projectDim - dispatchDim) > 0.01) { // Allow 0.01 tolerance
      return {
        canSync: false,
        reason: `Dimension mismatch for ${dim}: project has ${projectDim}, dispatch has ${dispatchDim}`
      }
    }
  }

  return { canSync: true }
}

/**
 * Enhanced sync with transaction support and rollback capability
 */
export async function syncProjectToDispatchMaterialsWithTransaction(
  projectMaterial: ProjectMaterial,
  options: {
    validateBeforeSync?: boolean
    preserveQuantityDifferences?: boolean
    updateTimestamps?: boolean
    enableRollback?: boolean
  } = {}
): Promise<{ success: boolean; transactionId?: string; error?: SyncError }> {
  const transactionId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    // Get current dispatch material state for rollback
    const { getDispatchMaterialById } = await import('./database')
    const currentDispatchMaterial = await getDispatchMaterialById(projectMaterial.sourceId!)
    
    if (!currentDispatchMaterial) {
      const error: SyncError = new Error(`Dispatch material ${projectMaterial.sourceId} not found`) as SyncError
      error.recoverable = false
      error.rollbackRequired = false
      return { success: false, error }
    }

    // Create transaction record
    const transaction: SyncTransaction = {
      id: transactionId,
      projectMaterialId: projectMaterial.id,
      dispatchMaterialId: projectMaterial.sourceId!,
      changes: {},
      previousState: currentDispatchMaterial,
      timestamp: new Date(),
      status: 'pending'
    }

    // Perform the sync with enhanced error handling
    try {
      await syncProjectToDispatchMaterials(projectMaterial, options)
      transaction.status = 'completed'
      return { success: true, transactionId }
    } catch (syncError) {
      transaction.status = 'failed'
      
      const error: SyncError = new Error(`Sync failed: ${syncError}`) as SyncError
      error.syncTransactionId = transactionId
      error.recoverable = true
      error.rollbackRequired = options.enableRollback !== false
      
      // Attempt rollback if enabled
      if (error.rollbackRequired) {
        try {
          await rollbackSyncTransaction(transaction)
          error.rollbackRequired = false
        } catch (rollbackError) {
          console.error(`Rollback failed for transaction ${transactionId}:`, rollbackError)
          error.recoverable = false
        }
      }
      
      return { success: false, transactionId, error }
    }
    
  } catch (error) {
    const syncError: SyncError = new Error(`Transaction setup failed: ${error}`) as SyncError
    syncError.recoverable = false
    syncError.rollbackRequired = false
    return { success: false, error: syncError }
  }
}

/**
 * Rollback a failed sync transaction
 */
async function rollbackSyncTransaction(transaction: SyncTransaction): Promise<void> {
  try {
    const { updateDispatchMaterial } = await import('./database')
    
    // Restore previous state
    await updateDispatchMaterial(transaction.dispatchMaterialId, transaction.previousState)
    
    transaction.status = 'rolled_back'
    console.log(`Successfully rolled back sync transaction ${transaction.id}`)
    
  } catch (error) {
    console.error(`Failed to rollback sync transaction ${transaction.id}:`, error)
    throw error
  }
}

/**
 * Batch sync multiple project materials with enhanced error handling
 */
export async function batchSyncProjectToDispatchMaterials(
  projectMaterials: ProjectMaterial[],
  options: {
    validateBeforeSync?: boolean
    preserveQuantityDifferences?: boolean
    updateTimestamps?: boolean
    enableRollback?: boolean
    continueOnError?: boolean
  } = {}
): Promise<{
  successful: string[]
  failed: Array<{ materialId: string; error: SyncError; transactionId?: string }>
  totalProcessed: number
}> {
  const { continueOnError = true } = options
  const results = {
    successful: [] as string[],
    failed: [] as Array<{ materialId: string; error: SyncError; transactionId?: string }>,
    totalProcessed: 0
  }

  for (const material of projectMaterials) {
    try {
      results.totalProcessed++
      
      const syncResult = await syncProjectToDispatchMaterialsWithTransaction(material, options)
      
      if (syncResult.success) {
        results.successful.push(material.id)
      } else {
        results.failed.push({
          materialId: material.id,
          error: syncResult.error!,
          transactionId: syncResult.transactionId
        })
        
        // Stop processing if continueOnError is false
        if (!continueOnError) {
          break
        }
      }
      
    } catch (error) {
      const syncError: SyncError = new Error(`Batch sync failed for material ${material.id}: ${error}`) as SyncError
      syncError.recoverable = false
      syncError.rollbackRequired = false
      
      results.failed.push({
        materialId: material.id,
        error: syncError
      })
      
      if (!continueOnError) {
        break
      }
    }
  }

  return results
}

/**
 * Determine if dispatch status should be updated based on current and new status
 */
function shouldUpdateDispatchStatus(
  currentStatus: DispatchMaterialStatus,
  newStatus: DispatchMaterialStatus
): boolean {
  // Define status progression order
  const statusOrder: DispatchMaterialStatus[] = [
    DispatchMaterialStatus.PENDING, 
    DispatchMaterialStatus.ARRIVED, 
    DispatchMaterialStatus.ALLOCATED, 
    DispatchMaterialStatus.USED
  ]
  
  // Allow status to progress to damaged from any status
  if (newStatus === DispatchMaterialStatus.DAMAGED) {
    return true
  }
  
  // Don't regress from damaged unless to used
  if (currentStatus === DispatchMaterialStatus.DAMAGED && newStatus !== DispatchMaterialStatus.USED) {
    return false
  }
  
  const currentIndex = statusOrder.indexOf(currentStatus)
  const newIndex = statusOrder.indexOf(newStatus)
  
  // Allow progression forward, not backward
  return newIndex >= currentIndex
}

function combineNotes(existingNotes?: string, dispatchNotes?: string): string | undefined {
  if (!existingNotes && !dispatchNotes) return undefined
  if (!existingNotes) return dispatchNotes
  if (!dispatchNotes) return existingNotes
  
  return `${existingNotes}\n\nDispatch Update: ${dispatchNotes}`
}

function createDispatchNotes(dispatchNote: DispatchNote, dispatchMaterial: DispatchMaterial): string {
  const parts = [
    `From dispatch: ${dispatchNote.dispatchNumber}`,
    `Supplier: ${dispatchNote.supplier.name}`,
    `Delivered: ${dispatchNote.actualDeliveryDate?.toLocaleDateString() || 'Pending'}`
  ]
  
  if (dispatchMaterial.notes) {
    parts.push(`Material notes: ${dispatchMaterial.notes}`)
  }
  
  if (dispatchNote.trackingNumber) {
    parts.push(`Tracking: ${dispatchNote.trackingNumber}`)
  }
  
  return parts.join(' • ')
}

/**
 * Trigger automatic sync when dispatch note is updated
 */
export async function onDispatchNoteUpdated(dispatchNote: DispatchNote): Promise<void> {
  try {
    console.log(`Auto-syncing dispatch note ${dispatchNote.dispatchNumber} to project materials...`)
    
    const result = await syncDispatchToProjectMaterials(dispatchNote.projectId, dispatchNote, {
      createIfNotExists: true,
      updateExisting: true,
      syncStatus: true
    })
    
    console.log(`Dispatch sync completed: ${result.materialsCreated} created, ${result.materialsUpdated} updated`)
    
    if (result.errors.length > 0) {
      console.warn('Dispatch sync errors:', result.errors)
    }
    
  } catch (error) {
    console.error('Failed to auto-sync dispatch note:', error)
  }
}