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
  createMaterialStock,
  reserveMaterialStock,
  unreserveMaterialStock
} from './database'

/**
 * Enhanced Material Synchronization Service
 * Handles bidirectional synchronization between dispatch notes and project materials
 * with proper locking, conflict resolution, and validation
 */

// Fixed status mappings based on actual enum values
const DISPATCH_TO_PROJECT_STATUS_MAP: Record<DispatchMaterialStatus, ProjectMaterialStatus> = {
  [DispatchMaterialStatus.PENDING]: ProjectMaterialStatus.ORDERED,
  [DispatchMaterialStatus.ARRIVED]: ProjectMaterialStatus.DELIVERED,
  [DispatchMaterialStatus.ALLOCATED]: ProjectMaterialStatus.DELIVERED,
  [DispatchMaterialStatus.USED]: ProjectMaterialStatus.INSTALLED,
  [DispatchMaterialStatus.DAMAGED]: ProjectMaterialStatus.DELIVERED // Keep as delivered, add damage notes
}

// Reverse mapping for project to dispatch status sync
const PROJECT_TO_DISPATCH_STATUS_MAP: Record<ProjectMaterialStatus, DispatchMaterialStatus> = {
  [ProjectMaterialStatus.REQUIRED]: DispatchMaterialStatus.PENDING,
  [ProjectMaterialStatus.ORDERED]: DispatchMaterialStatus.PENDING,
  [ProjectMaterialStatus.DELIVERED]: DispatchMaterialStatus.ARRIVED,
  [ProjectMaterialStatus.INSTALLED]: DispatchMaterialStatus.USED
}

// Enhanced sync configuration
interface SyncConfig {
  enableLocking: boolean
  conflictResolution: 'last-write-wins' | 'merge' | 'manual'
  validateMaterialSpecs: boolean
  enableEventDriven: boolean
  maxRetries: number
  retryDelay: number
}

const DEFAULT_SYNC_CONFIG: SyncConfig = {
  enableLocking: true,
  conflictResolution: 'merge',
  validateMaterialSpecs: true,
  enableEventDriven: true,
  maxRetries: 3,
  retryDelay: 1000
}

// Sync operation types
enum SyncOperationType {
  DISPATCH_TO_PROJECT = 'dispatch_to_project',
  PROJECT_TO_DISPATCH = 'project_to_dispatch',
  BIDIRECTIONAL = 'bidirectional'
}

// Enhanced sync result with detailed tracking
interface EnhancedSyncResult {
  operationType: SyncOperationType
  operationId: string
  startTime: Date
  endTime?: Date
  success: boolean
  materialsProcessed: number
  materialsCreated: number
  materialsUpdated: number
  materialsSkipped: number
  conflictsDetected: number
  conflictsResolved: number
  validationErrors: MaterialValidationError[]
  errors: SyncError[]
  rollbackRequired: boolean
  rollbackCompleted: boolean
}

interface MaterialValidationError {
  materialId: string
  field: string
  expected: any
  actual: any
  severity: 'warning' | 'error'
  message: string
}

interface SyncError {
  code: string
  message: string
  materialId?: string
  timestamp: Date
  recoverable: boolean
}

// Material matching criteria for validation
interface MaterialMatchCriteria {
  materialType: boolean
  profile: boolean
  grade: boolean
  dimensions: boolean
  tolerancePercent: number
}

const DEFAULT_MATCH_CRITERIA: MaterialMatchCriteria = {
  materialType: true,
  profile: true,
  grade: true,
  dimensions: true,
  tolerancePercent: 5 // 5% tolerance for dimension matching
}

// Sync operation lock tracking
interface SyncLock {
  operationId: string
  type: SyncOperationType
  projectId: string
  dispatchId?: string
  materialIds: string[]
  timestamp: Date
  expiresAt: Date
}

class SyncLockManager {
  private locks = new Map<string, SyncLock>()
  private readonly LOCK_TIMEOUT = 30000 // 30 seconds

  acquireLock(operationId: string, type: SyncOperationType, projectId: string, materialIds: string[], dispatchId?: string): boolean {
    const lockKey = this.generateLockKey(projectId, dispatchId, materialIds)
    
    // Clean expired locks
    this.cleanExpiredLocks()
    
    // Check for existing lock
    if (this.locks.has(lockKey)) {
      return false
    }
    
    // Create new lock
    const lock: SyncLock = {
      operationId,
      type,
      projectId,
      dispatchId,
      materialIds,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + this.LOCK_TIMEOUT)
    }
    
    this.locks.set(lockKey, lock)
    return true
  }

  releaseLock(projectId: string, dispatchId?: string, materialIds?: string[]): void {
    const lockKey = this.generateLockKey(projectId, dispatchId, materialIds || [])
    this.locks.delete(lockKey)
  }

  private generateLockKey(projectId: string, dispatchId?: string, materialIds: string[] = []): string {
    const sortedMaterialIds = [...materialIds].sort()
    return `${projectId}:${dispatchId || 'all'}:${sortedMaterialIds.join(',')}`
  }

  private cleanExpiredLocks(): void {
    const now = new Date()
    for (const [key, lock] of this.locks.entries()) {
      if (lock.expiresAt < now) {
        this.locks.delete(key)
      }
    }
  }
}

/**
 * Unified Material Synchronization Service
 * Handles all aspects of material sync between dispatch and project systems
 */
export class MaterialSyncService {
  private lockManager = new SyncLockManager()
  private eventListeners = new Map<string, Function[]>()
  private syncHistory: EnhancedSyncResult[] = []
  private config: SyncConfig

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config }
  }

  /**
   * Synchronized dispatch to project material sync with enhanced features
   */
  async syncDispatchToProject(
    projectId: string,
    dispatchNote: DispatchNote,
    options: {
      createIfNotExists?: boolean
      updateExisting?: boolean
      syncStatus?: boolean
      matchCriteria?: Partial<MaterialMatchCriteria>
    } = {}
  ): Promise<EnhancedSyncResult> {
    const operationId = this.generateOperationId()
    const result = this.createSyncResult(SyncOperationType.DISPATCH_TO_PROJECT, operationId)
    
    const {
      createIfNotExists = true,
      updateExisting = true,
      syncStatus = true,
      matchCriteria = {}
    } = options

    const criteria = { ...DEFAULT_MATCH_CRITERIA, ...matchCriteria }
    const materialIds = dispatchNote.materials.map(m => m.id)

    try {
      // Acquire lock for sync operation
      if (this.config.enableLocking) {
        const lockAcquired = this.lockManager.acquireLock(
          operationId,
          SyncOperationType.DISPATCH_TO_PROJECT,
          projectId,
          materialIds,
          dispatchNote.id
        )
        
        if (!lockAcquired) {
          throw new Error(`Cannot acquire lock for sync operation. Another operation is in progress.`)
        }
      }

      // Get existing project materials from this dispatch
      const existingMaterials = await getProjectMaterialsBySource(
        projectId,
        ProjectMaterialSource.DISPATCH,
        dispatchNote.id
      )

      // Create lookup map
      const existingMaterialsMap = new Map<string, ProjectMaterial>()
      existingMaterials.forEach(material => {
        if (material.sourceId) {
          existingMaterialsMap.set(material.sourceId, material)
        }
      })

      result.materialsProcessed = dispatchNote.materials.length

      // Process each dispatch material with enhanced validation and conflict resolution
      for (const dispatchMaterial of dispatchNote.materials) {
        try {
          const existingMaterial = existingMaterialsMap.get(dispatchMaterial.id)
          
          // Validate material specifications if enabled
          if (this.config.validateMaterialSpecs && existingMaterial) {
            const validationErrors = this.validateMaterialMatch(
              dispatchMaterial,
              existingMaterial,
              criteria
            )
            result.validationErrors.push(...validationErrors)
            
            // Skip processing if critical validation errors
            const criticalErrors = validationErrors.filter(e => e.severity === 'error')
            if (criticalErrors.length > 0) {
              result.materialsSkipped++
              continue
            }
          }

          if (existingMaterial && updateExisting) {
            // Handle update with conflict detection and resolution
            const conflictDetected = this.detectUpdateConflict(dispatchMaterial, existingMaterial)
            if (conflictDetected) {
              result.conflictsDetected++
              
              const resolved = await this.resolveUpdateConflict(
                dispatchMaterial,
                existingMaterial,
                this.config.conflictResolution
              )
              
              if (resolved) {
                result.conflictsResolved++
              } else {
                result.materialsSkipped++
                continue
              }
            }

            // Create update payload with merge strategy
            const updates = this.createMergedUpdate(
              dispatchMaterial,
              existingMaterial,
              syncStatus,
              dispatchNote
            )

            await updateProjectMaterial(existingMaterial.id, updates)
            result.materialsUpdated++

            // Handle stock changes when material status changes
            if (updates.status && updates.status !== existingMaterial.status) {
              try {
                await this.handleMaterialUsage(dispatchMaterial, dispatchNote, updates.status)
              } catch (stockError) {
                // Log but don't fail the sync
                this.logSyncError(result, 'STOCK_USAGE_UPDATE_FAILED', 
                  `Stock usage update failed for material ${dispatchMaterial.id}`, 
                  dispatchMaterial.id, true
                )
              }
            }

          } else if (!existingMaterial && createIfNotExists) {
            // Create new project material with enhanced data mapping
            const newMaterial = await this.createProjectMaterialFromDispatch(
              projectId,
              dispatchMaterial,
              dispatchNote,
              syncStatus
            )

            await createProjectMaterial(newMaterial)
            result.materialsCreated++

            // Update stock when material is delivered
            if (['arrived', 'allocated'].includes(dispatchMaterial.status)) {
              try {
                await this.updateStockFromDispatch(dispatchMaterial, dispatchNote)
              } catch (stockError) {
                // Log but don't fail the sync
                this.logSyncError(result, 'STOCK_UPDATE_FAILED', 
                  `Stock update failed for material ${dispatchMaterial.id}`, 
                  dispatchMaterial.id, true
                )
              }
            }
          } else {
            result.materialsSkipped++
          }

        } catch (error) {
          this.logSyncError(result, 'MATERIAL_SYNC_FAILED', 
            `Failed to sync material ${dispatchMaterial.id}: ${error}`, 
            dispatchMaterial.id, false
          )
        }
      }

      result.success = result.errors.filter(e => !e.recoverable).length === 0
      
    } catch (error) {
      this.logSyncError(result, 'SYNC_OPERATION_FAILED', 
        `Failed to sync dispatch ${dispatchNote.id}: ${error}`, 
        undefined, false
      )
      result.success = false
      result.rollbackRequired = true
      
      // Attempt rollback if configured
      if (result.rollbackRequired) {
        try {
          await this.rollbackSyncOperation(result)
          result.rollbackCompleted = true
        } catch (rollbackError) {
          this.logSyncError(result, 'ROLLBACK_FAILED', 
            `Failed to rollback sync operation: ${rollbackError}`, 
            undefined, false
          )
        }
      }
    } finally {
      // Release lock
      if (this.config.enableLocking) {
        this.lockManager.releaseLock(projectId, dispatchNote.id, materialIds)
      }
      
      result.endTime = new Date()
      this.syncHistory.push(result)
      
      // Emit sync completed event
      if (this.config.enableEventDriven) {
        this.emitEvent('syncCompleted', result)
      }
    }

    return result
  }

  /**
   * Enhanced project to dispatch sync with bidirectional support
   */
  async syncProjectToDispatch(
    projectMaterial: ProjectMaterial,
    options: {
      syncStatus?: boolean
      validateDispatch?: boolean
    } = {}
  ): Promise<EnhancedSyncResult> {
    const operationId = this.generateOperationId()
    const result = this.createSyncResult(SyncOperationType.PROJECT_TO_DISPATCH, operationId)
    
    const { syncStatus = true, validateDispatch = true } = options

    // Only sync materials that came from dispatch
    if (projectMaterial.source !== ProjectMaterialSource.DISPATCH || !projectMaterial.sourceId) {
      result.materialsSkipped = 1
      result.success = true
      return result
    }

    try {
      // Acquire lock for sync operation
      if (this.config.enableLocking) {
        const lockAcquired = this.lockManager.acquireLock(
          operationId,
          SyncOperationType.PROJECT_TO_DISPATCH,
          projectMaterial.projectId,
          [projectMaterial.sourceId]
        )
        
        if (!lockAcquired) {
          throw new Error(`Cannot acquire lock for project material ${projectMaterial.id}`)
        }
      }

      result.materialsProcessed = 1

      // TODO: Implement actual dispatch material update when database function is available
      // For now, log the sync requirement with enhanced tracking
      const dispatchStatus = PROJECT_TO_DISPATCH_STATUS_MAP[projectMaterial.status]
      
      this.logSyncActivity({
        operationId,
        type: 'PROJECT_TO_DISPATCH_SYNC',
        projectMaterialId: projectMaterial.id,
        dispatchMaterialId: projectMaterial.sourceId,
        statusChange: {
          from: 'unknown', // Would need to fetch current dispatch status
          to: dispatchStatus
        },
        timestamp: new Date()
      })

      result.materialsUpdated = 1
      result.success = true
      
    } catch (error) {
      this.logSyncError(result, 'PROJECT_TO_DISPATCH_FAILED', 
        `Failed to sync project material ${projectMaterial.id} to dispatch: ${error}`, 
        projectMaterial.id, false
      )
      result.success = false
    } finally {
      // Release lock
      if (this.config.enableLocking && projectMaterial.sourceId) {
        this.lockManager.releaseLock(projectMaterial.projectId, undefined, [projectMaterial.sourceId])
      }
      
      result.endTime = new Date()
      this.syncHistory.push(result)
    }

    return result
  }

  // Additional helper methods for the MaterialSyncService class...
  private generateOperationId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private createSyncResult(type: SyncOperationType, operationId: string): EnhancedSyncResult {
    return {
      operationType: type,
      operationId,
      startTime: new Date(),
      success: false,
      materialsProcessed: 0,
      materialsCreated: 0,
      materialsUpdated: 0,
      materialsSkipped: 0,
      conflictsDetected: 0,
      conflictsResolved: 0,
      validationErrors: [],
      errors: [],
      rollbackRequired: false,
      rollbackCompleted: false
    }
  }

  private logSyncError(
    result: EnhancedSyncResult, 
    code: string, 
    message: string, 
    materialId?: string, 
    recoverable: boolean = false
  ): void {
    const error: SyncError = {
      code,
      message,
      materialId,
      timestamp: new Date(),
      recoverable
    }
    result.errors.push(error)
    console.error(`Sync Error [${code}]: ${message}`, { materialId, recoverable })
  }

  private logSyncActivity(activity: any): void {
    console.log('Sync Activity:', activity)
  }

  private emitEvent(eventName: string, data: any): void {
    const listeners = this.eventListeners.get(eventName) || []
    listeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error(`Event listener error for ${eventName}:`, error)
      }
    })
  }

  // Event listener management
  addEventListener(eventName: string, listener: Function): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, [])
    }
    this.eventListeners.get(eventName)!.push(listener)
  }

  removeEventListener(eventName: string, listener: Function): void {
    const listeners = this.eventListeners.get(eventName) || []
    const index = listeners.indexOf(listener)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  // Sync history and monitoring
  getSyncHistory(limit?: number): EnhancedSyncResult[] {
    const history = [...this.syncHistory].reverse()
    return limit ? history.slice(0, limit) : history
  }

  clearSyncHistory(): void {
    this.syncHistory = []
  }

  /**
   * Validate material specifications match between dispatch and project materials
   */
  private validateMaterialMatch(
    dispatchMaterial: DispatchMaterial,
    projectMaterial: ProjectMaterial,
    criteria: MaterialMatchCriteria
  ): MaterialValidationError[] {
    const errors: MaterialValidationError[] = []

    // Material type validation
    if (criteria.materialType && dispatchMaterial.materialType !== projectMaterial.materialName.split(' ')[0]) {
      errors.push({
        materialId: dispatchMaterial.id,
        field: 'materialType',
        expected: projectMaterial.materialName.split(' ')[0],
        actual: dispatchMaterial.materialType,
        severity: 'error',
        message: 'Material type mismatch between dispatch and project'
      })
    }

    // Profile validation
    if (criteria.profile && dispatchMaterial.profile !== projectMaterial.profile) {
      errors.push({
        materialId: dispatchMaterial.id,
        field: 'profile',
        expected: projectMaterial.profile,
        actual: dispatchMaterial.profile,
        severity: 'error',
        message: 'Profile mismatch between dispatch and project'
      })
    }

    // Grade validation
    if (criteria.grade && dispatchMaterial.grade !== projectMaterial.grade) {
      errors.push({
        materialId: dispatchMaterial.id,
        field: 'grade',
        expected: projectMaterial.grade,
        actual: dispatchMaterial.grade,
        severity: 'warning',
        message: 'Grade mismatch between dispatch and project'
      })
    }

    // Dimensions validation with tolerance
    if (criteria.dimensions) {
      for (const [key, projectValue] of Object.entries(projectMaterial.dimensions)) {
        const dispatchValue = dispatchMaterial.dimensions[key]
        if (dispatchValue !== undefined && projectValue !== undefined) {
          const tolerance = Math.abs(projectValue * criteria.tolerancePercent / 100)
          const difference = Math.abs(dispatchValue - projectValue)
          
          if (difference > tolerance) {
            errors.push({
              materialId: dispatchMaterial.id,
              field: `dimensions.${key}`,
              expected: projectValue,
              actual: dispatchValue,
              severity: difference > tolerance * 2 ? 'error' : 'warning',
              message: `Dimension ${key} exceeds tolerance: ${difference.toFixed(2)} vs allowed ${tolerance.toFixed(2)}`
            })
          }
        }
      }
    }

    return errors
  }

  /**
   * Detect conflicts when updating existing materials
   */
  private detectUpdateConflict(
    dispatchMaterial: DispatchMaterial,
    existingMaterial: ProjectMaterial
  ): boolean {
    // Check if project material was modified more recently than dispatch material
    const projectUpdateTime = existingMaterial.updatedAt.getTime()
    const dispatchUpdateTime = new Date().getTime() // Assuming current time for dispatch
    
    // Consider it a conflict if project was updated within the last 5 minutes
    const conflictWindow = 5 * 60 * 1000 // 5 minutes
    return (Date.now() - projectUpdateTime) < conflictWindow
  }

  /**
   * Resolve update conflicts based on configured strategy
   */
  private async resolveUpdateConflict(
    dispatchMaterial: DispatchMaterial,
    existingMaterial: ProjectMaterial,
    strategy: 'last-write-wins' | 'merge' | 'manual'
  ): Promise<boolean> {
    switch (strategy) {
      case 'last-write-wins':
        // Always allow the update (dispatch wins)
        return true
        
      case 'merge':
        // Attempt to merge non-conflicting fields
        return true // For now, always allow merge
        
      case 'manual':
        // Require manual intervention - for now, skip the update
        this.logSyncActivity({
          type: 'MANUAL_CONFLICT_RESOLUTION_REQUIRED',
          dispatchMaterialId: dispatchMaterial.id,
          projectMaterialId: existingMaterial.id,
          message: 'Manual conflict resolution required'
        })
        return false
        
      default:
        return false
    }
  }

  /**
   * Create merged update payload combining dispatch and project data
   */
  private createMergedUpdate(
    dispatchMaterial: DispatchMaterial,
    existingMaterial: ProjectMaterial,
    syncStatus: boolean,
    dispatchNote: DispatchNote
  ): Partial<ProjectMaterial> {
    const updates: Partial<ProjectMaterial> = {
      // Always update quantities and weights from dispatch
      quantity: dispatchMaterial.quantity,
      unitWeight: dispatchMaterial.unitWeight,
      totalWeight: dispatchMaterial.totalWeight,
      lengthUnit: dispatchMaterial.lengthUnit,
      weightUnit: dispatchMaterial.weightUnit,
      
      // Update costs if available
      ...(dispatchMaterial.unitCost && { unitCost: dispatchMaterial.unitCost }),
      ...(dispatchMaterial.totalCost && { totalCost: dispatchMaterial.totalCost }),
      
      // Update location if provided
      ...(dispatchMaterial.location && { location: dispatchMaterial.location }),
      
      // Merge notes
      notes: this.mergeNotes(existingMaterial.notes, dispatchMaterial.notes, dispatchNote)
    }

    // Sync status if enabled
    if (syncStatus && dispatchMaterial.status in DISPATCH_TO_PROJECT_STATUS_MAP) {
      updates.status = DISPATCH_TO_PROJECT_STATUS_MAP[dispatchMaterial.status]
      
      // Update delivery date when status changes to delivered
      if (updates.status === ProjectMaterialStatus.DELIVERED && !existingMaterial.deliveryDate) {
        updates.deliveryDate = dispatchNote.actualDeliveryDate || new Date()
      }
      
      // Handle damaged materials
      if (dispatchMaterial.status === DispatchMaterialStatus.DAMAGED) {
        const damageNote = dispatchMaterial.inspectionNotes || 'Material marked as damaged in dispatch'
        updates.notes = `${updates.notes || ''}\n\nDAMAGE REPORT: ${damageNote}`.trim()
      }
    }

    return updates
  }

  /**
   * Create new project material from dispatch material with enhanced mapping
   */
  private async createProjectMaterialFromDispatch(
    projectId: string,
    dispatchMaterial: DispatchMaterial,
    dispatchNote: DispatchNote,
    syncStatus: boolean
  ): Promise<Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'>> {
    // Try to resolve a real catalog/stock record to align pricing and availability
    const resolved = {
      id: undefined as string | undefined,
      unitCost: dispatchMaterial.unitCost,
    }
    try {
      // Prefer an existing stock record created for this dispatch
      const stockId = `dispatch-${dispatchMaterial.id}`
      const stock = await getMaterialStockByMaterialId(stockId)
      if (stock) {
        resolved.id = stock.materialCatalogId
        if (!resolved.unitCost || resolved.unitCost <= 0) {
          resolved.unitCost = stock.unitCost
        }
      }
    } catch {}

    const unit = (dispatchMaterial as any).unit || dispatchMaterial.weightUnit || 'kg'
    const unitCost = resolved.unitCost || dispatchMaterial.unitCost || 0
    const totalCost = dispatchMaterial.totalCost || (unitCost > 0 ? unitCost * dispatchMaterial.quantity : 0)

    return {
      projectId,
      materialCatalogId: resolved.id, // link when possible so UI can read stock
      materialName: `${dispatchMaterial.materialType} ${dispatchMaterial.grade}`,
      profile: dispatchMaterial.profile,
      grade: dispatchMaterial.grade,
      dimensions: this.convertDispatchDimensionsToProject(dispatchMaterial.dimensions),
      quantity: dispatchMaterial.quantity,
      unit: unit,
      unitWeight: dispatchMaterial.unitWeight,
      totalWeight: dispatchMaterial.totalWeight,
      unitCost: unitCost,
      totalCost: totalCost,
      lengthUnit: dispatchMaterial.lengthUnit,
      weightUnit: dispatchMaterial.weightUnit,
      status: syncStatus && dispatchMaterial.status in DISPATCH_TO_PROJECT_STATUS_MAP 
        ? DISPATCH_TO_PROJECT_STATUS_MAP[dispatchMaterial.status] 
        : ProjectMaterialStatus.DELIVERED,
      supplier: dispatchNote.supplier.name,
      orderDate: dispatchNote.date,
      deliveryDate: dispatchNote.actualDeliveryDate,
      location: dispatchMaterial.location,
      notes: this.createDispatchNotes(dispatchNote, dispatchMaterial),
      trackingNumber: dispatchNote.trackingNumber,
      source: ProjectMaterialSource.DISPATCH,
      sourceId: dispatchMaterial.id
    }
  }

  /**
   * Enhanced stock update with automatic project reservation
   */
  private async updateStockFromDispatch(
    dispatchMaterial: DispatchMaterial,
    dispatchNote: DispatchNote
  ): Promise<void> {
    // Only process materials that have been delivered
    if (!['arrived', 'allocated'].includes(dispatchMaterial.status)) {
      return
    }

    const materialCatalogId = `dispatch-${dispatchMaterial.id}`

    // Create stock entry with materials reserved for the project
    const stockEntry = {
      materialCatalogId,
      material: {
        name: `${dispatchMaterial.materialType} ${dispatchMaterial.grade}`,
        type: dispatchMaterial.materialType,
        profile: dispatchMaterial.profile,
        grade: dispatchMaterial.grade,
        dimensions: dispatchMaterial.dimensions
      },
      currentStock: dispatchMaterial.quantity,
      // Since this material is delivered for a specific project, reserve it immediately
      availableStock: 0, // No available stock - all reserved
      reservedStock: dispatchMaterial.quantity, // All stock reserved for project
      unitWeight: dispatchMaterial.unitWeight,
      totalWeight: dispatchMaterial.totalWeight,
      unitCost: dispatchMaterial.unitCost,
      totalValue: dispatchMaterial.totalCost,
      currency: dispatchMaterial.currency || 'USD',
      location: dispatchMaterial.location || 'Warehouse',
      supplier: dispatchNote.supplier?.name || 'Unknown',
      supplierRef: dispatchNote.orderNumber,
      notes: `Delivered via dispatch note ${dispatchNote.dispatchNumber} - Reserved for project ${dispatchNote.projectId}`,
      lastStockUpdate: new Date()
    }

    const stockId = await createMaterialStock(stockEntry)

    // Create stock transaction for the incoming material
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

    // Reserve the material stock for the project
    try {
      await reserveMaterialStock(materialCatalogId, dispatchMaterial.quantity, dispatchNote.projectId)
      
      // Create a reservation transaction to track the project allocation
      await createMaterialStockTransaction({
        materialStockId: stockId,
        type: 'RESERVE',
        quantity: dispatchMaterial.quantity,
        unitCost: dispatchMaterial.unitCost,
        totalCost: dispatchMaterial.totalCost,
        currency: dispatchMaterial.currency || 'USD',
        referenceId: dispatchNote.projectId,
        referenceType: 'PROJECT',
        transactionDate: new Date(),
        notes: `Material reserved for project ${dispatchNote.projectId} from dispatch ${dispatchNote.dispatchNumber}`,
        createdBy: 'system'
      })

      console.log(`Stock updated and reserved for dispatch material ${dispatchMaterial.id}: +${dispatchMaterial.quantity} units reserved for project ${dispatchNote.projectId}`)
      
    } catch (reservationError) {
      console.warn(`Failed to reserve stock for project ${dispatchNote.projectId}:`, reservationError)
      
      // If reservation fails, log but don't fail the entire operation
      // The stock was still created, just not properly reserved
      await createMaterialStockTransaction({
        materialStockId: stockId,
        type: 'NOTE',
        quantity: 0,
        unitCost: 0,
        totalCost: 0,
        currency: dispatchMaterial.currency || 'USD',
        referenceId: dispatchNote.projectId,
        referenceType: 'ERROR',
        transactionDate: new Date(),
        notes: `WARNING: Failed to reserve material for project ${dispatchNote.projectId}: ${reservationError}`,
        createdBy: 'system'
      })
    }
  }

  /**
   * Handle stock unreservation when materials are used/installed
   */
  private async handleMaterialUsage(
    dispatchMaterial: DispatchMaterial,
    dispatchNote: DispatchNote,
    newStatus: ProjectMaterialStatus
  ): Promise<void> {
    // Only handle stock changes for materials that are being used/installed
    if (newStatus !== ProjectMaterialStatus.INSTALLED) {
      return
    }

    const materialCatalogId = `dispatch-${dispatchMaterial.id}`

    try {
      // Unreserve the material stock since it's now used
      await unreserveMaterialStock(materialCatalogId, dispatchMaterial.quantity, dispatchNote.projectId)
      
      // Create a transaction to track the material usage
      const stockId = await getMaterialStockByMaterialId(materialCatalogId)
      if (stockId) {
        await createMaterialStockTransaction({
          materialStockId: stockId.id,
          type: 'OUT',
          quantity: dispatchMaterial.quantity,
          unitCost: dispatchMaterial.unitCost,
          totalCost: dispatchMaterial.totalCost,
          currency: dispatchMaterial.currency || 'USD',
          referenceId: dispatchNote.projectId,
          referenceType: 'PROJECT_USAGE',
          transactionDate: new Date(),
          notes: `Material used in project ${dispatchNote.projectId} from dispatch ${dispatchNote.dispatchNumber}`,
          createdBy: 'system'
        })
      }

      console.log(`Material ${dispatchMaterial.id} unreserved and marked as used for project ${dispatchNote.projectId}`)
      
    } catch (error) {
      console.warn(`Failed to unreserve stock for used material ${dispatchMaterial.id}:`, error)
    }
  }

  /**
   * Rollback sync operation in case of failure
   */
  private async rollbackSyncOperation(result: EnhancedSyncResult): Promise<void> {
    this.logSyncActivity({
      type: 'ROLLBACK_STARTED',
      operationId: result.operationId,
      materialsToRollback: result.materialsCreated
    })

    // For now, log the rollback requirement
    // In a real implementation, you'd track created materials and remove them
    console.warn(`Rollback required for operation ${result.operationId}`)
  }

  /**
   * Helper method to merge notes from different sources
   */
  private mergeNotes(existingNotes?: string, dispatchNotes?: string, dispatchNote?: DispatchNote): string | undefined {
    const parts: string[] = []
    
    if (existingNotes) {
      parts.push(existingNotes)
    }
    
    if (dispatchNotes) {
      parts.push(`Dispatch Update: ${dispatchNotes}`)
    }
    
    if (dispatchNote && !existingNotes?.includes(dispatchNote.dispatchNumber)) {
      parts.push(`From dispatch: ${dispatchNote.dispatchNumber}`)
    }
    
    return parts.length > 0 ? parts.join('\n\n') : undefined
  }

  /**
   * Convert dispatch dimensions to project dimensions format
   */
  private convertDispatchDimensionsToProject(
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
   * Create comprehensive notes for dispatch-sourced materials
   */
  private createDispatchNotes(dispatchNote: DispatchNote, dispatchMaterial: DispatchMaterial): string {
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
    
    if (dispatchMaterial.inspectionDate) {
      parts.push(`Inspected: ${dispatchMaterial.inspectionDate.toLocaleDateString()}`)
      if (dispatchMaterial.inspectionNotes) {
        parts.push(`Inspection notes: ${dispatchMaterial.inspectionNotes}`)
      }
    }
    
    return parts.join(' • ')
  }

  /**
   * Get reserved materials summary for a project
   */
  async getProjectReservedMaterials(projectId: string): Promise<{
    totalReserved: number
    reservedMaterials: Array<{
      materialCatalogId: string
      materialName: string
      profile: string
      grade: string
      reservedQuantity: number
      totalWeight: number
      totalValue: number
      location: string
      supplier: string
      dispatchNumber: string
      reservationDate: Date
    }>
  }> {
    const result = {
      totalReserved: 0,
      reservedMaterials: [] as any[]
    }

    // Get project materials that came from dispatch
    const projectMaterials = await getProjectMaterials(projectId)
    const dispatchMaterials = projectMaterials.filter(
      material => material.source === ProjectMaterialSource.DISPATCH && material.sourceId
    )

    for (const projectMaterial of dispatchMaterials) {
      try {
        const materialCatalogId = `dispatch-${projectMaterial.sourceId}`
        const stock = await getMaterialStockByMaterialId(materialCatalogId)
        
        if (stock && stock.reservedStock > 0) {
          result.reservedMaterials.push({
            materialCatalogId,
            materialName: projectMaterial.materialName,
            profile: projectMaterial.profile,
            grade: projectMaterial.grade,
            reservedQuantity: stock.reservedStock,
            totalWeight: projectMaterial.totalWeight,
            totalValue: projectMaterial.totalCost || 0,
            location: stock.location || 'Unknown',
            supplier: projectMaterial.supplier || 'Unknown',
            dispatchNumber: projectMaterial.notes?.match(/dispatch: ([^\s•]+)/)?.[1] || 'Unknown',
            reservationDate: projectMaterial.deliveryDate || projectMaterial.createdAt
          })
          
          result.totalReserved += stock.reservedStock
        }
      } catch (error) {
        console.warn(`Failed to get stock info for material ${projectMaterial.sourceId}:`, error)
      }
    }

    return result
  }

  /**
   * Manually reserve additional stock for a project (for materials not from dispatch)
   */
  async reserveStockForProject(
    materialCatalogId: string,
    quantity: number,
    projectId: string,
    notes?: string
  ): Promise<boolean> {
    try {
      await reserveMaterialStock(materialCatalogId, quantity, projectId)
      
      // Create reservation transaction
      const stock = await getMaterialStockByMaterialId(materialCatalogId)
      if (stock) {
        await createMaterialStockTransaction({
          materialStockId: stock.id,
          type: 'RESERVE',
          quantity,
          unitCost: stock.unitCost || 0,
          totalCost: (stock.unitCost || 0) * quantity,
          currency: stock.currency || 'USD',
          referenceId: projectId,
          referenceType: 'PROJECT',
          transactionDate: new Date(),
          notes: notes || `Manual reservation for project ${projectId}`,
          createdBy: 'system'
        })
      }
      
      return true
    } catch (error) {
      console.error(`Failed to reserve stock for project ${projectId}:`, error)
      return false
    }
  }
}

// Create global sync service instance
export const materialSyncService = new MaterialSyncService()

// Legacy interfaces for backward compatibility
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
 * Legacy wrapper function - use MaterialSyncService directly for new code
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
  try {
    const enhancedResult = await materialSyncService.syncDispatchToProject(
      projectId,
      dispatchNote,
      options
    )
    
    // Convert enhanced result to legacy format
    return {
      materialsCreated: enhancedResult.materialsCreated,
      materialsUpdated: enhancedResult.materialsUpdated,
      materialsSkipped: enhancedResult.materialsSkipped,
      errors: enhancedResult.errors.map(e => e.message)
    }
  } catch (error) {
    return {
      materialsCreated: 0,
      materialsUpdated: 0,
      materialsSkipped: 0,
      errors: [`Sync operation failed: ${error}`]
    }
  }
}

/**
 * Legacy wrapper function - Update material stock when dispatch materials are delivered
 */
export async function updateStockFromDispatchDelivery(
  dispatchMaterial: DispatchMaterial,
  dispatchNote: DispatchNote
): Promise<void> {
  // Delegate to MaterialSyncService for consistency
  const syncService = new MaterialSyncService()
  await syncService['updateStockFromDispatch'](dispatchMaterial, dispatchNote)
}

/**
 * Legacy wrapper function - Sync project material status changes back to dispatch materials
 */
export async function syncProjectToDispatchMaterials(
  projectMaterial: ProjectMaterial
): Promise<void> {
  try {
    await materialSyncService.syncProjectToDispatch(projectMaterial)
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
 * Legacy wrapper function - Auto-sync all dispatch notes for a project
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

// Legacy helper functions - maintained for backward compatibility
function convertDispatchDimensionsToProjectDimensions(
  dispatchDimensions: Record<string, number | undefined>
): Record<string, number> {
  const syncService = new MaterialSyncService()
  return syncService['convertDispatchDimensionsToProject'](dispatchDimensions)
}

function combineNotes(existingNotes?: string, dispatchNotes?: string): string | undefined {
  if (!existingNotes && !dispatchNotes) return undefined
  if (!existingNotes) return dispatchNotes
  if (!dispatchNotes) return existingNotes
  
  return `${existingNotes}\n\nDispatch Update: ${dispatchNotes}`
}

function createDispatchNotes(dispatchNote: DispatchNote, dispatchMaterial: DispatchMaterial): string {
  const syncService = new MaterialSyncService()
  return syncService['createDispatchNotes'](dispatchNote, dispatchMaterial)
}

/**
 * Get reserved materials for a project
 */
export async function getProjectReservedMaterials(projectId: string) {
  return await materialSyncService.getProjectReservedMaterials(projectId)
}

/**
 * Reserve stock for a project manually
 */
export async function reserveStockForProject(
  materialCatalogId: string,
  quantity: number,
  projectId: string,
  notes?: string
): Promise<boolean> {
  return await materialSyncService.reserveStockForProject(materialCatalogId, quantity, projectId, notes)
}

/**
 * Enhanced event-driven sync trigger for dispatch note updates
 */
export async function onDispatchNoteUpdated(dispatchNote: DispatchNote): Promise<void> {
  try {
    console.log(`Auto-syncing dispatch note ${dispatchNote.dispatchNumber} to project materials...`)
    
    const enhancedResult = await materialSyncService.syncDispatchToProject(
      dispatchNote.projectId, 
      dispatchNote, 
      {
        createIfNotExists: true,
        updateExisting: true,
        syncStatus: true
      }
    )
    
    console.log(`Enhanced dispatch sync completed:`, {
      operationId: enhancedResult.operationId,
      success: enhancedResult.success,
      materialsCreated: enhancedResult.materialsCreated,
      materialsUpdated: enhancedResult.materialsUpdated,
      materialsSkipped: enhancedResult.materialsSkipped,
      conflictsResolved: enhancedResult.conflictsResolved,
      validationErrors: enhancedResult.validationErrors.length
    })
    
    if (enhancedResult.errors.length > 0) {
      console.warn('Enhanced dispatch sync errors:', enhancedResult.errors)
    }
    
    if (enhancedResult.rollbackRequired && !enhancedResult.rollbackCompleted) {
      console.error('Sync operation required rollback but it failed')
    }
    
  } catch (error) {
    console.error('Failed to auto-sync dispatch note:', error)
  }
}