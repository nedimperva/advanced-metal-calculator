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
const DISPATCH_TO_PROJECT_STATUS_MAP: Record<DispatchMaterialStatus, ProjectMaterialStatus> = {
  'pending': ProjectMaterialStatus.ORDERED,
  'shipped': ProjectMaterialStatus.ORDERED,
  'arrived': ProjectMaterialStatus.DELIVERED,
  'inspected': ProjectMaterialStatus.DELIVERED,
  'allocated': ProjectMaterialStatus.DELIVERED,
  'used': ProjectMaterialStatus.INSTALLED
}

// Reverse mapping for project to dispatch status sync
const PROJECT_TO_DISPATCH_STATUS_MAP: Record<ProjectMaterialStatus, DispatchMaterialStatus> = {
  [ProjectMaterialStatus.REQUIRED]: 'pending',
  [ProjectMaterialStatus.ORDERED]: 'shipped',
  [ProjectMaterialStatus.DELIVERED]: 'arrived',
  [ProjectMaterialStatus.INSTALLED]: 'used'
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
      unitWeight: dispatchMaterial.unitWeight,
      totalWeight: dispatchMaterial.totalWeight,
      unitCost: dispatchMaterial.unitCost,
      totalValue: dispatchMaterial.totalCost,
      currency: dispatchMaterial.currency || 'USD',
      location: dispatchMaterial.location || 'Warehouse',
      supplier: dispatchNote.supplier?.name || 'Unknown',
      supplierRef: dispatchNote.orderNumber,
      notes: `Delivered via dispatch note ${dispatchNote.dispatchNumber}`,
      lastStockUpdate: new Date()
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
      currency: dispatchMaterial.currency || 'USD',
      referenceId: dispatchNote.id,
      referenceType: 'DISPATCH',
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
  projectMaterial: ProjectMaterial
): Promise<void> {
  if (projectMaterial.source !== ProjectMaterialSource.DISPATCH || !projectMaterial.sourceId) {
    return // Only sync materials that came from dispatch
  }

  try {
    // This would require implementing updateDispatchMaterial function in database.ts
    // For now, we'll just log the sync requirement
    console.log(`Sync required: Project material ${projectMaterial.id} status changed to ${projectMaterial.status}`)
    
    // TODO: Implement bidirectional sync
    // const dispatchStatus = PROJECT_TO_DISPATCH_STATUS_MAP[projectMaterial.status]
    // await updateDispatchMaterial(projectMaterial.sourceId, { status: dispatchStatus })
    
  } catch (error) {
    console.error(`Failed to sync project material ${projectMaterial.id} to dispatch:`, error)
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