import type { 
  Project, 
  ProjectMaterial, 
  Calculation, 
  ProjectTask, 
  DailyWorkLog, 
  WorkEntry,
  Worker,
  Machinery,
  ProjectAssignment,
  DailyTimesheet,
  DailyJournalTimesheet,
  JournalWorkerEntry,
  JournalMachineryEntry,
  DispatchNote,
  DispatchMaterial,
  MaterialCatalog,
  MaterialTemplate,
  MaterialStock,
  MaterialStockTransaction
} from './types'
import { ProjectStatus, MaterialStatus, ProjectMaterialStatus, ProjectMaterialSource, DispatchStatus, DispatchMaterialStatus } from './types'

// Database configuration
const DB_NAME = 'MetalCalculatorDB'
const DB_VERSION = 9 // Phase 6: Material stock management

// Store names
export const STORES = {
  PROJECTS: 'projects',
  CALCULATIONS: 'calculations',
  PROJECT_MATERIALS: 'projectMaterials',
  PROJECT_TASKS: 'projectTasks',
  PROJECT_MILESTONES: 'projectMilestones',
  DAILY_WORK_LOGS: 'dailyWorkLogs',
  WORK_ENTRIES: 'workEntries',
  // New workforce and machinery stores
  WORKERS: 'workers',
  MACHINERY: 'machinery',
  PROJECT_ASSIGNMENTS: 'projectAssignments',
  DAILY_TIMESHEETS: 'dailyTimesheets',
  // Dispatch and material tracking stores
  DISPATCH_NOTES: 'dispatchNotes',
  DISPATCH_MATERIALS: 'dispatchMaterials',
  // Material catalog stores (Phase 2)
  MATERIAL_CATALOG: 'materialCatalog',
  MATERIAL_TEMPLATES: 'materialTemplates',
  // Material stock management stores
  MATERIAL_STOCK: 'materialStock',
  MATERIAL_STOCK_TRANSACTIONS: 'materialStockTransactions',
  SETTINGS: 'settings'
} as const

// Database schema
export interface DatabaseSchema {
  projects: Project
  calculations: Calculation
  projectMaterials: ProjectMaterial
  projectTasks: ProjectTask

  dailyWorkLogs: DailyWorkLog
  workEntries: WorkEntry
  // New workforce and machinery schema
  workers: Worker
  machinery: Machinery
  projectAssignments: ProjectAssignment
  dailyTimesheets: DailyTimesheet
  // Dispatch and material tracking schema
  dispatchNotes: DispatchNote
  dispatchMaterials: DispatchMaterial
  // Material catalog schema (Phase 2)
  materialCatalog: MaterialCatalog
  materialTemplates: MaterialTemplate
  // Material stock management schema
  materialStock: MaterialStock
  materialStockTransactions: MaterialStockTransaction
  settings: { key: string; value: any }
}

// Database connection
let dbInstance: IDBDatabase | null = null

// ============================================================================
// PERFORMANCE OPTIMIZATION FUNCTIONS (PHASE 5)
// ============================================================================

/**
 * Batch query for project summary - optimized to fetch all related data in parallel
 */
export async function getProjectSummary(projectId: string): Promise<{
  project: Project | null
  materials: ProjectMaterial[]
  tasks: ProjectTask[]
  timesheets: DailyTimesheet[]
  dispatchNotes: DispatchNote[]
}> {
  try {
    const [project, materials, tasks, timesheets, dispatchNotes] = await Promise.all([
      getProject(projectId),
      getProjectMaterials(projectId),
      getProjectTasks(projectId),
      getProjectTimesheets(projectId),
      getDispatchNotesByProject(projectId)
    ])
    
    return { project, materials, tasks, timesheets, dispatchNotes }
  } catch (error) {
    console.error('Failed to get project summary:', error)
    throw error
  }
}

/**
 * Optimized material search with composite indexes
 */
export async function searchProjectMaterialsOptimized(
  projectId: string, 
  filters: {
    status?: ProjectMaterialStatus
    source?: ProjectMaterialSource
    materialName?: string
    grade?: string
  }
): Promise<ProjectMaterial[]> {
  const db = await getDatabase()
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROJECT_MATERIALS], 'readonly')
    const store = transaction.objectStore(STORES.PROJECT_MATERIALS)
    
    // Use composite index if both projectId and status are provided
    if (filters.status) {
      const index = store.index('projectId_status')
      const request = index.getAll([projectId, filters.status])
      
      request.onsuccess = () => {
        let results = request.result
        
        // Apply additional filters
        if (filters.source) {
          results = results.filter(m => m.source === filters.source)
        }
        if (filters.materialName) {
          results = results.filter(m => 
            m.materialName.toLowerCase().includes(filters.materialName!.toLowerCase())
          )
        }
        if (filters.grade) {
          results = results.filter(m => m.grade === filters.grade)
        }
        
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    } else {
      // Fall back to project index
      const index = store.index('projectId')
      const request = index.getAll(projectId)
      
      request.onsuccess = () => {
        let results = request.result
        
        // Apply filters
        if (filters.source) {
          results = results.filter(m => m.source === filters.source)
        }
        if (filters.materialName) {
          results = results.filter(m => 
            m.materialName.toLowerCase().includes(filters.materialName!.toLowerCase())
          )
        }
        if (filters.grade) {
          results = results.filter(m => m.grade === filters.grade)
        }
        
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    }
  })
}

// Force database upgrade (for development/debugging)
export async function forceDbUpgrade(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
  
  // Delete existing database to force fresh creation
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME)
    deleteRequest.onsuccess = () => {
      console.log('Database deleted successfully, will recreate with new schema')
      resolve()
    }
    deleteRequest.onerror = () => {
      console.warn('Failed to delete database, proceeding anyway')
      resolve() // Don't reject, just proceed
    }
    deleteRequest.onblocked = () => {
      console.warn('Database deletion blocked, proceeding anyway')
      resolve()
    }
  })
}

// Initialize database
export async function initializeDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error(`Database error: ${request.error?.message}`))
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create projects store
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        const projectStore = db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' })
        projectStore.createIndex('status', 'status', { unique: false })
        projectStore.createIndex('createdAt', 'createdAt', { unique: false })
        projectStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        projectStore.createIndex('client', 'client', { unique: false })
        projectStore.createIndex('deadline', 'deadline', { unique: false })
      }

      // Create calculations store
      if (!db.objectStoreNames.contains(STORES.CALCULATIONS)) {
        const calculationStore = db.createObjectStore(STORES.CALCULATIONS, { keyPath: 'id' })
        calculationStore.createIndex('projectId', 'projectId', { unique: false })
        calculationStore.createIndex('timestamp', 'timestamp', { unique: false })
        calculationStore.createIndex('material', 'material', { unique: false })
        calculationStore.createIndex('profileType', 'profileType', { unique: false })
      }

      // Create project materials store (Enhanced Phase 3)
      if (!db.objectStoreNames.contains(STORES.PROJECT_MATERIALS)) {
        const materialStore = db.createObjectStore(STORES.PROJECT_MATERIALS, { keyPath: 'id' })
        materialStore.createIndex('projectId', 'projectId', { unique: false })
        materialStore.createIndex('materialCatalogId', 'materialCatalogId', { unique: false })
        materialStore.createIndex('materialName', 'materialName', { unique: false })
        materialStore.createIndex('profile', 'profile', { unique: false })
        materialStore.createIndex('grade', 'grade', { unique: false })
        materialStore.createIndex('status', 'status', { unique: false })
        materialStore.createIndex('source', 'source', { unique: false })
        materialStore.createIndex('sourceId', 'sourceId', { unique: false })
        materialStore.createIndex('supplier', 'supplier', { unique: false })
        materialStore.createIndex('orderDate', 'orderDate', { unique: false })
        materialStore.createIndex('deliveryDate', 'deliveryDate', { unique: false })
        materialStore.createIndex('installationDate', 'installationDate', { unique: false })
        materialStore.createIndex('location', 'location', { unique: false })
        materialStore.createIndex('createdAt', 'createdAt', { unique: false })
        materialStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        // Performance optimization: Composite indexes for common queries
        materialStore.createIndex('projectId_status', ['projectId', 'status'], { unique: false })
        materialStore.createIndex('projectId_source', ['projectId', 'source'], { unique: false })
        materialStore.createIndex('materialName_grade', ['materialName', 'grade'], { unique: false })
      }

      // Create project tasks store
      if (!db.objectStoreNames.contains(STORES.PROJECT_TASKS)) {
        const taskStore = db.createObjectStore(STORES.PROJECT_TASKS, { keyPath: 'id' })
        taskStore.createIndex('projectId', 'projectId', { unique: false })
        taskStore.createIndex('status', 'status', { unique: false })
        taskStore.createIndex('type', 'type', { unique: false })
        taskStore.createIndex('priority', 'priority', { unique: false })
        taskStore.createIndex('assignedTo', 'assignedTo', { unique: false })
        taskStore.createIndex('milestoneId', 'milestoneId', { unique: false })
        taskStore.createIndex('scheduledStart', 'scheduledStart', { unique: false })
        taskStore.createIndex('scheduledEnd', 'scheduledEnd', { unique: false })
        taskStore.createIndex('createdAt', 'createdAt', { unique: false })
        taskStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        // Performance optimization: Composite indexes
        taskStore.createIndex('projectId_status', ['projectId', 'status'], { unique: false })
        taskStore.createIndex('projectId_priority', ['projectId', 'priority'], { unique: false })
      }

      // Create project milestones store
      if (!db.objectStoreNames.contains(STORES.PROJECT_MILESTONES)) {
        const milestoneStore = db.createObjectStore(STORES.PROJECT_MILESTONES, { keyPath: 'id' })
        milestoneStore.createIndex('projectId', 'projectId', { unique: false })
        milestoneStore.createIndex('status', 'status', { unique: false })
        milestoneStore.createIndex('type', 'type', { unique: false })
        milestoneStore.createIndex('targetDate', 'targetDate', { unique: false })
        milestoneStore.createIndex('completedDate', 'completedDate', { unique: false })
        milestoneStore.createIndex('createdAt', 'createdAt', { unique: false })
        milestoneStore.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      // Create daily work logs store
      if (!db.objectStoreNames.contains(STORES.DAILY_WORK_LOGS)) {
        const workLogStore = db.createObjectStore(STORES.DAILY_WORK_LOGS, { keyPath: 'id' })
        workLogStore.createIndex('projectId', 'projectId', { unique: false })
        workLogStore.createIndex('date', 'date', { unique: false })
        workLogStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Create work entries store
      if (!db.objectStoreNames.contains(STORES.WORK_ENTRIES)) {
        const workEntryStore = db.createObjectStore(STORES.WORK_ENTRIES, { keyPath: 'id' })
        workEntryStore.createIndex('workType', 'workType', { unique: false })
        workEntryStore.createIndex('workerCount', 'workerCount', { unique: false })
        workEntryStore.createIndex('hoursWorked', 'hoursWorked', { unique: false })
      }

      // Create workers store
      if (!db.objectStoreNames.contains(STORES.WORKERS)) {
        const workerStore = db.createObjectStore(STORES.WORKERS, { keyPath: 'id' })
        workerStore.createIndex('name', 'name', { unique: false })
        workerStore.createIndex('employeeId', 'employeeId', { unique: false })
        workerStore.createIndex('isActive', 'isActive', { unique: false })
        workerStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Create machinery store
      if (!db.objectStoreNames.contains(STORES.MACHINERY)) {
        const machineryStore = db.createObjectStore(STORES.MACHINERY, { keyPath: 'id' })
        machineryStore.createIndex('name', 'name', { unique: false })
        machineryStore.createIndex('type', 'type', { unique: false })
        machineryStore.createIndex('isActive', 'isActive', { unique: false })
        machineryStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Create project assignments store
      if (!db.objectStoreNames.contains(STORES.PROJECT_ASSIGNMENTS)) {
        const assignmentStore = db.createObjectStore(STORES.PROJECT_ASSIGNMENTS, { keyPath: 'id' })
        assignmentStore.createIndex('projectId', 'projectId', { unique: false })
        assignmentStore.createIndex('workerId', 'workerId', { unique: false })
        assignmentStore.createIndex('machineryId', 'machineryId', { unique: false })
        assignmentStore.createIndex('assignedDate', 'assignedDate', { unique: false })
        assignmentStore.createIndex('isActive', 'isActive', { unique: false })
      }

      // Create daily timesheets store
      if (!db.objectStoreNames.contains(STORES.DAILY_TIMESHEETS)) {
        const timesheetStore = db.createObjectStore(STORES.DAILY_TIMESHEETS, { keyPath: 'id' })
        timesheetStore.createIndex('projectId', 'projectId', { unique: false })
        timesheetStore.createIndex('date', 'date', { unique: false })
        timesheetStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Create dispatch notes store
      if (!db.objectStoreNames.contains(STORES.DISPATCH_NOTES)) {
        const dispatchStore = db.createObjectStore(STORES.DISPATCH_NOTES, { keyPath: 'id' })
        dispatchStore.createIndex('projectId', 'projectId', { unique: false })
        dispatchStore.createIndex('status', 'status', { unique: false })
        dispatchStore.createIndex('date', 'date', { unique: false })
        dispatchStore.createIndex('dispatchNumber', 'dispatchNumber', { unique: false })
        dispatchStore.createIndex('supplier', 'supplier.name', { unique: false })
        dispatchStore.createIndex('createdAt', 'createdAt', { unique: false })
        dispatchStore.createIndex('expectedDeliveryDate', 'expectedDeliveryDate', { unique: false })
        dispatchStore.createIndex('actualDeliveryDate', 'actualDeliveryDate', { unique: false })
      }

      // Create dispatch materials store
      if (!db.objectStoreNames.contains(STORES.DISPATCH_MATERIALS)) {
        const dispatchMaterialStore = db.createObjectStore(STORES.DISPATCH_MATERIALS, { keyPath: 'id' })
        dispatchMaterialStore.createIndex('dispatchNoteId', 'dispatchNoteId', { unique: false })
        dispatchMaterialStore.createIndex('materialType', 'materialType', { unique: false })
        dispatchMaterialStore.createIndex('profile', 'profile', { unique: false })
        dispatchMaterialStore.createIndex('grade', 'grade', { unique: false })
        dispatchMaterialStore.createIndex('status', 'status', { unique: false })
        dispatchMaterialStore.createIndex('location', 'location', { unique: false })
        // Performance optimization: Composite indexes
        dispatchMaterialStore.createIndex('materialType_grade', ['materialType', 'grade'], { unique: false })
        dispatchMaterialStore.createIndex('status_location', ['status', 'location'], { unique: false })
      }

      // Create material catalog store (Phase 2)
      if (!db.objectStoreNames.contains(STORES.MATERIAL_CATALOG)) {
        const materialCatalogStore = db.createObjectStore(STORES.MATERIAL_CATALOG, { keyPath: 'id' })
        materialCatalogStore.createIndex('name', 'name', { unique: false })
        materialCatalogStore.createIndex('type', 'type', { unique: false })
        materialCatalogStore.createIndex('category', 'category', { unique: false })
        materialCatalogStore.createIndex('availability', 'availability', { unique: false })
        materialCatalogStore.createIndex('supplier', 'supplier', { unique: false })
        materialCatalogStore.createIndex('basePrice', 'basePrice', { unique: false })
        materialCatalogStore.createIndex('createdAt', 'createdAt', { unique: false })
        materialCatalogStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        materialCatalogStore.createIndex('tags', 'tags', { unique: false, multiEntry: true })
        materialCatalogStore.createIndex('applications', 'applications', { unique: false, multiEntry: true })
        materialCatalogStore.createIndex('standards', 'standards', { unique: false, multiEntry: true })
        materialCatalogStore.createIndex('compatibleProfiles', 'compatibleProfiles', { unique: false, multiEntry: true })
      }

      // Create material templates store (Phase 2)
      if (!db.objectStoreNames.contains(STORES.MATERIAL_TEMPLATES)) {
        const materialTemplateStore = db.createObjectStore(STORES.MATERIAL_TEMPLATES, { keyPath: 'id' })
        materialTemplateStore.createIndex('name', 'name', { unique: false })
        materialTemplateStore.createIndex('materialCatalogId', 'materialCatalogId', { unique: false })
        materialTemplateStore.createIndex('profile', 'profile', { unique: false })
        materialTemplateStore.createIndex('grade', 'grade', { unique: false })
        materialTemplateStore.createIndex('isPublic', 'isPublic', { unique: false })
        materialTemplateStore.createIndex('createdAt', 'createdAt', { unique: false })
        materialTemplateStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        materialTemplateStore.createIndex('usageCount', 'usageCount', { unique: false })
        materialTemplateStore.createIndex('tags', 'tags', { unique: false, multiEntry: true })
        materialTemplateStore.createIndex('createdBy', 'createdBy', { unique: false })
      }

      // Create material stock store (Phase 6)
      if (!db.objectStoreNames.contains(STORES.MATERIAL_STOCK)) {
        const materialStockStore = db.createObjectStore(STORES.MATERIAL_STOCK, { keyPath: 'id' })
        materialStockStore.createIndex('materialCatalogId', 'materialCatalogId', { unique: false })
        materialStockStore.createIndex('location', 'location', { unique: false })
        materialStockStore.createIndex('supplier', 'supplier', { unique: false })
        materialStockStore.createIndex('currentStock', 'currentStock', { unique: false })
        materialStockStore.createIndex('availableStock', 'availableStock', { unique: false })
        materialStockStore.createIndex('reservedStock', 'reservedStock', { unique: false })
        materialStockStore.createIndex('createdAt', 'createdAt', { unique: false })
        materialStockStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        materialStockStore.createIndex('lastStockUpdate', 'lastStockUpdate', { unique: false })
        // Composite indexes for performance
        materialStockStore.createIndex('materialCatalogId_location', ['materialCatalogId', 'location'], { unique: false })
        materialStockStore.createIndex('supplier_location', ['supplier', 'location'], { unique: false })
      }

      // Create material stock transactions store (Phase 6)
      if (!db.objectStoreNames.contains(STORES.MATERIAL_STOCK_TRANSACTIONS)) {
        const materialStockTransactionStore = db.createObjectStore(STORES.MATERIAL_STOCK_TRANSACTIONS, { keyPath: 'id' })
        materialStockTransactionStore.createIndex('materialStockId', 'materialStockId', { unique: false })
        materialStockTransactionStore.createIndex('type', 'type', { unique: false })
        materialStockTransactionStore.createIndex('referenceId', 'referenceId', { unique: false })
        materialStockTransactionStore.createIndex('referenceType', 'referenceType', { unique: false })
        materialStockTransactionStore.createIndex('transactionDate', 'transactionDate', { unique: false })
        materialStockTransactionStore.createIndex('createdAt', 'createdAt', { unique: false })
        materialStockTransactionStore.createIndex('createdBy', 'createdBy', { unique: false })
        // Composite indexes for performance
        materialStockTransactionStore.createIndex('materialStockId_type', ['materialStockId', 'type'], { unique: false })
        materialStockTransactionStore.createIndex('referenceId_referenceType', ['referenceId', 'referenceType'], { unique: false })
      }

      // Create settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      }
    }
  })
}

// Check if all required stores exist
export async function checkDatabaseStores(): Promise<boolean> {
  try {
    const db = await getDatabase()
    const requiredStores = Object.values(STORES)
    
    for (const storeName of requiredStores) {
      if (!db.objectStoreNames.contains(storeName)) {
        console.warn(`Missing store: ${storeName}`)
        return false
      }
    }
    return true
  } catch (error) {
    console.error('Failed to check database stores:', error)
    return false
  }
}

// Generic database operations
async function getDatabase(): Promise<IDBDatabase> {
  if (!dbInstance) {
    await initializeDatabase()
  }
  return dbInstance!
}

// Generic CRUD operations
export async function createRecord<T extends keyof DatabaseSchema>(
  storeName: T,
  data: DatabaseSchema[T]
): Promise<void> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.add(data)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error(`Failed to create record: ${request.error?.message}`))
  })
}

export async function updateRecord<T extends keyof DatabaseSchema>(
  storeName: T,
  data: DatabaseSchema[T]
): Promise<void> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(data)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error(`Failed to update record: ${request.error?.message}`))
  })
}

export async function getRecord<T extends keyof DatabaseSchema>(
  storeName: T,
  id: string
): Promise<DatabaseSchema[T] | undefined> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get record: ${request.error?.message}`))
  })
}

export async function getAllRecords<T extends keyof DatabaseSchema>(
  storeName: T
): Promise<DatabaseSchema[T][]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get all records: ${request.error?.message}`))
  })
}

export async function deleteRecord<T extends keyof DatabaseSchema>(
  storeName: T,
  id: string
): Promise<void> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error(`Failed to delete record: ${request.error?.message}`))
  })
}

// Project-specific operations
export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `project_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const newProject: Project = {
    ...project,
    id,
    createdAt: now,
    updatedAt: now,
    materials: [],
    calculationIds: []
  }

  await createRecord(STORES.PROJECTS, newProject)
  return id
}

export async function updateProject(project: Project): Promise<void> {
  const updatedProject = {
    ...project,
    updatedAt: new Date()
  }
  await updateRecord(STORES.PROJECTS, updatedProject)
}

export async function getProject(id: string): Promise<Project | undefined> {
  return await getRecord(STORES.PROJECTS, id)
}

export async function getAllProjects(): Promise<Project[]> {
  return await getAllRecords(STORES.PROJECTS)
}

export async function deleteProject(id: string): Promise<void> {
  // Delete associated materials first
  const materials = await getProjectMaterials(id)
  for (const material of materials) {
    await deleteRecord(STORES.PROJECT_MATERIALS, material.id)
  }
  
  // Delete the project
  await deleteRecord(STORES.PROJECTS, id)
}

/**
 * Comprehensive cascade delete function for projects
 * Deletes all related records in the correct order to maintain referential integrity
 */
export async function deleteProjectCascade(projectId: string): Promise<void> {
  // Step 1: Validate project exists and get dependencies BEFORE starting transaction
  const project = await getProject(projectId)
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`)
  }

  // Step 2: Check for critical dependencies that might prevent deletion
  const dependencyErrors = await validateProjectDeletion(projectId)
  if (dependencyErrors.length > 0) {
    throw new Error(`Cannot delete project: ${dependencyErrors.join(', ')}`)
  }

  // Step 3: Get all related data BEFORE starting transaction
  const [dispatchNotes, timesheets, assignments, tasks, materials] = await Promise.all([
    getDispatchNotesByProject(projectId),
    getProjectTimesheets(projectId),
    getProjectAssignments(projectId),
    getProjectTasks(projectId),
    getProjectMaterials(projectId)
  ])

  // Step 4: Get dispatch materials for all dispatch notes
  const dispatchMaterials: DispatchMaterial[] = []
  for (const dispatchNote of dispatchNotes) {
    try {
      const materials = await getDispatchMaterials(dispatchNote.id)
      dispatchMaterials.push(...materials)
    } catch (error) {
      // Continue if dispatch materials not found
    }
  }

  // Step 5: Get material stock transactions
  const stockTransactions = await getMaterialStockTransactionsByProject(projectId)

  // Step 6: Get all tasks to update dependencies
  const allTasks = await getAllRecords(STORES.PROJECT_TASKS) as ProjectTask[]
  const deletedTaskIds = new Set(tasks.map(t => t.id))
  const tasksToUpdate = allTasks.filter(task => 
    task.projectId !== projectId && 
    task.dependencies && 
    task.dependencies.some(depId => deletedTaskIds.has(depId))
  ).map(task => ({
    ...task,
    dependencies: task.dependencies!.filter(depId => !deletedTaskIds.has(depId)),
    updatedAt: new Date()
  }))

  // Step 7: Start transaction and perform all deletes synchronously
  const db = await getDatabase()
  const transaction = db.transaction([
    STORES.PROJECTS,
    STORES.PROJECT_MATERIALS,
    STORES.PROJECT_TASKS,
    STORES.PROJECT_ASSIGNMENTS,
    STORES.DAILY_TIMESHEETS,
    STORES.WORK_ENTRIES,
    STORES.DISPATCH_NOTES,
    STORES.DISPATCH_MATERIALS,
    STORES.MATERIAL_STOCK_TRANSACTIONS
  ], 'readwrite')

  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error(`Transaction failed: ${transaction.error?.message}`))
    transaction.onabort = () => reject(new Error('Transaction was aborted'))

    try {
      // Delete in reverse dependency order

      // 7a. Delete material stock transactions
      const stockTransactionStore = transaction.objectStore(STORES.MATERIAL_STOCK_TRANSACTIONS)
      stockTransactions.forEach(trans => {
        stockTransactionStore.delete(trans.id)
      })

      // 7b. Delete dispatch materials
      const dispatchMaterialStore = transaction.objectStore(STORES.DISPATCH_MATERIALS)
      dispatchMaterials.forEach(material => {
        dispatchMaterialStore.delete(material.id)
      })

      // 7c. Delete dispatch notes
      const dispatchNoteStore = transaction.objectStore(STORES.DISPATCH_NOTES)
      dispatchNotes.forEach(dispatchNote => {
        dispatchNoteStore.delete(dispatchNote.id)
      })

      // 7d. Delete daily timesheets
      const timesheetStore = transaction.objectStore(STORES.DAILY_TIMESHEETS)
      timesheets.forEach(timesheet => {
        timesheetStore.delete(timesheet.id)
      })

      // 7e. Delete project assignments
      const assignmentStore = transaction.objectStore(STORES.PROJECT_ASSIGNMENTS)
      assignments.forEach(assignment => {
        assignmentStore.delete(assignment.id)
      })

      // 7f. Update task dependencies
      const taskStore = transaction.objectStore(STORES.PROJECT_TASKS)
      tasksToUpdate.forEach(task => {
        taskStore.put(task)
      })

      // 7g. Delete project tasks
      tasks.forEach(task => {
        taskStore.delete(task.id)
      })

      // 7h. Delete project materials
      const materialStore = transaction.objectStore(STORES.PROJECT_MATERIALS)
      materials.forEach(material => {
        materialStore.delete(material.id)
      })

      // 7i. Finally, delete the project itself
      const projectStore = transaction.objectStore(STORES.PROJECTS)
      projectStore.delete(projectId)

    } catch (error) {
      transaction.abort()
      reject(new Error(`Failed to delete project cascade: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

/**
 * Validates whether a project can be safely deleted
 * Returns array of error messages if deletion should be prevented
 */
async function validateProjectDeletion(projectId: string): Promise<string[]> {
  const errors: string[] = []

  try {
    // Check for active dispatch notes that might be critical
    const dispatchNotes = await getDispatchNotesByProject(projectId)
    const activeDispatches = dispatchNotes.filter(d => 
      d.status === 'pending' || d.status === 'shipped'
    )
    
    if (activeDispatches.length > 0) {
      errors.push(`${activeDispatches.length} active dispatch notes must be completed first`)
    }

    // Check for recent timesheets (within last 7 days) that might indicate active work
    const timesheets = await getProjectTimesheets(projectId)
    const recentTimesheets = timesheets.filter(t => {
      const daysDiff = (Date.now() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    })

    if (recentTimesheets.length > 0) {
      errors.push(`Project has recent activity (${recentTimesheets.length} timesheets in last 7 days)`)
    }

  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return errors
}


export async function getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROJECTS], 'readonly')
    const store = transaction.objectStore(STORES.PROJECTS)
    const index = store.index('status')
    const request = index.getAll(status)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get projects by status: ${request.error?.message}`))
  })
}

// Material-specific operations
// ============================================================================
// ENHANCED PROJECT MATERIAL OPERATIONS (PHASE 3)
// ============================================================================

export async function createProjectMaterial(material: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `pmat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const newMaterial: ProjectMaterial = {
    ...material,
    id,
    createdAt: now,
    updatedAt: now
  }

  await createRecord(STORES.PROJECT_MATERIALS, newMaterial)
  return id
}

export async function getProjectMaterials(projectId: string): Promise<ProjectMaterial[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROJECT_MATERIALS], 'readonly')
    const store = transaction.objectStore(STORES.PROJECT_MATERIALS)
    const index = store.index('projectId')
    const request = index.getAll(projectId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get project materials: ${request.error?.message}`))
  })
}

export async function getProjectMaterialById(id: string): Promise<ProjectMaterial | null> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROJECT_MATERIALS], 'readonly')
    const store = transaction.objectStore(STORES.PROJECT_MATERIALS)
    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result || null)
    }
    request.onerror = () => {
      reject(new Error(`Failed to get project material: ${request.error?.message}`))
    }
  })
}

export async function updateProjectMaterial(id: string, updates: Partial<Omit<ProjectMaterial, 'id' | 'createdAt'>>): Promise<void> {
  const existing = await getProjectMaterialById(id)
  if (!existing) {
    throw new Error('Project material not found')
  }

  const updated: ProjectMaterial = {
    ...existing,
    ...updates,
    updatedAt: new Date()
  }

  return await updateRecord(STORES.PROJECT_MATERIALS, updated)
}

export async function deleteProjectMaterial(id: string): Promise<void> {
  return await deleteRecord(STORES.PROJECT_MATERIALS, id)
}

export async function updateProjectMaterialStatus(
  materialId: string, 
  status: ProjectMaterialStatus, 
  notes?: string
): Promise<void> {
  const material = await getProjectMaterialById(materialId)
  if (!material) {
    throw new Error('Material not found')
  }

  const updates: Partial<ProjectMaterial> = {
    status,
    notes: notes || material.notes
  }

  // Update status-specific dates
  const now = new Date()
  switch (status) {
    case ProjectMaterialStatus.ORDERED:
      updates.orderDate = now
      break
    case ProjectMaterialStatus.DELIVERED:
      updates.deliveryDate = now
      break
    case ProjectMaterialStatus.INSTALLED:
      updates.installationDate = now
      break
  }

  await updateProjectMaterial(materialId, updates)
}

export async function searchProjectMaterials(projectId: string, filters: {
  status?: ProjectMaterialStatus[]
  source?: ProjectMaterialSource[]
  materialName?: string
  profile?: string
  grade?: string
  supplier?: string
}): Promise<ProjectMaterial[]> {
  const allMaterials = await getProjectMaterials(projectId)
  
  return allMaterials.filter(material => {
    // Status filter
    if (filters.status && filters.status.length > 0 && !filters.status.includes(material.status)) {
      return false
    }

    // Source filter
    if (filters.source && filters.source.length > 0 && !filters.source.includes(material.source)) {
      return false
    }

    // Material name filter
    if (filters.materialName && !material.materialName.toLowerCase().includes(filters.materialName.toLowerCase())) {
      return false
    }

    // Profile filter
    if (filters.profile && !material.profile.toLowerCase().includes(filters.profile.toLowerCase())) {
      return false
    }

    // Grade filter
    if (filters.grade && !material.grade.toLowerCase().includes(filters.grade.toLowerCase())) {
      return false
    }

    // Supplier filter
    if (filters.supplier && (!material.supplier || !material.supplier.toLowerCase().includes(filters.supplier.toLowerCase()))) {
      return false
    }

    return true
  })
}

export async function getProjectMaterialsBySource(projectId: string, source: ProjectMaterialSource, sourceId?: string): Promise<ProjectMaterial[]> {
  const allMaterials = await getProjectMaterials(projectId)
  return allMaterials.filter(material => {
    if (material.source !== source) return false
    if (sourceId && material.sourceId !== sourceId) return false
    return true
  })
}

export async function createProjectMaterialFromCalculation(
  projectId: string,
  calculationId: string,
  calculation: Calculation,
  options: {
    quantity?: number
    supplier?: string
    notes?: string
    unitCost?: number
  } = {}
): Promise<string> {
  const material: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'> = {
    projectId,
    materialCatalogId: undefined, // Not linked to catalog when from calculation
    materialName: calculation.materialName,
    profile: calculation.profileType,
    grade: calculation.grade,
    dimensions: Object.fromEntries(
      Object.entries(calculation.dimensions).map(([key, value]) => [key, parseFloat(value.toString())])
    ),
    quantity: options.quantity || calculation.quantity || 1,
    unitWeight: calculation.weight,
    totalWeight: calculation.totalWeight || (calculation.weight * (options.quantity || calculation.quantity || 1)),
    unitCost: options.unitCost || calculation.unitCost,
    totalCost: calculation.totalCost,
    lengthUnit: calculation.lengthUnit || 'm',
    weightUnit: calculation.weightUnit || 'kg',
    status: ProjectMaterialStatus.REQUIRED,
    supplier: options.supplier,
    notes: options.notes,
    source: ProjectMaterialSource.CALCULATION,
    sourceId: calculationId
  }

  return await createProjectMaterial(material)
}

export async function getProjectMaterialStatistics(projectId: string): Promise<{
  totalMaterials: number
  materialsByStatus: Record<ProjectMaterialStatus, number>
  materialsBySource: Record<ProjectMaterialSource, number>
  totalWeight: number
  totalCost: number
  averageUnitCost: number
}> {
  const materials = await getProjectMaterials(projectId)
  
  const stats = {
    totalMaterials: materials.length,
    materialsByStatus: {} as Record<ProjectMaterialStatus, number>,
    materialsBySource: {} as Record<ProjectMaterialSource, number>,
    totalWeight: 0,
    totalCost: 0,
    averageUnitCost: 0
  }
  
  // Initialize counters
  Object.values(ProjectMaterialStatus).forEach(status => {
    stats.materialsByStatus[status] = 0
  })
  Object.values(ProjectMaterialSource).forEach(source => {
    stats.materialsBySource[source] = 0
  })
  
  // Calculate statistics
  let totalCostableItems = 0
  let totalUnitCost = 0
  
  materials.forEach(material => {
    stats.materialsByStatus[material.status]++
    stats.materialsBySource[material.source]++
    stats.totalWeight += material.totalWeight
    
    if (material.totalCost) {
      stats.totalCost += material.totalCost
    }
    
    if (material.unitCost) {
      totalUnitCost += material.unitCost
      totalCostableItems++
    }
  })
  
  stats.averageUnitCost = totalCostableItems > 0 ? totalUnitCost / totalCostableItems : 0
  
  return stats
}

// Legacy support - keeping old function names for backward compatibility
export async function addMaterialToProject(material: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  return await createProjectMaterial(material)
}

export async function updateMaterialStatus(materialId: string, status: ProjectMaterialStatus, notes?: string): Promise<void> {
  return await updateProjectMaterialStatus(materialId, status, notes)
}

// Calculation-specific operations
export async function saveCalculation(calculation: Omit<Calculation, 'id' | 'timestamp'>): Promise<string> {
  const id = `calc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  
  const newCalculation: Calculation = {
    ...calculation,
    id,
    timestamp: new Date()
  }

  await createRecord(STORES.CALCULATIONS, newCalculation)
  return id
}

export async function saveCalculationToProject(calculation: Calculation, projectId: string): Promise<void> {
  // Check if calculation already exists
  const existingCalc = await getRecord(STORES.CALCULATIONS, calculation.id)
  
  if (existingCalc) {
    // Update existing calculation
    await updateRecord(STORES.CALCULATIONS, calculation)
  } else {
    // Create new calculation
    await createRecord(STORES.CALCULATIONS, calculation)
  }
  
  // Update project to include this calculation
  const project = await getProject(projectId)
  if (project) {
    if (!project.calculationIds.includes(calculation.id)) {
      project.calculationIds.push(calculation.id)
      await updateProject(project)
    }
  }
}

export async function getProjectCalculations(projectId: string): Promise<Calculation[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CALCULATIONS], 'readonly')
    const store = transaction.objectStore(STORES.CALCULATIONS)
    const index = store.index('projectId')
    const request = index.getAll(projectId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get project calculations: ${request.error?.message}`))
  })
}

export async function getAllCalculations(): Promise<Calculation[]> {
  return await getAllRecords(STORES.CALCULATIONS)
}

export async function updateCalculation(calculation: Calculation): Promise<void> {
  await updateRecord(STORES.CALCULATIONS, calculation)
}

export async function deleteCalculation(id: string): Promise<void> {
  await deleteRecord(STORES.CALCULATIONS, id)
}

// Settings operations
export async function saveSetting(key: string, value: any): Promise<void> {
  await updateRecord(STORES.SETTINGS, { key, value })
}

export async function getSetting(key: string): Promise<any> {
  const result = await getRecord(STORES.SETTINGS, key)
  return result?.value
}

// Offline sync capabilities
export async function syncOfflineChanges(): Promise<void> {
  // Placeholder for future offline sync implementation
  console.log('Offline sync not yet implemented')
}

// Database cleanup and maintenance
export async function cleanupDatabase(): Promise<void> {
  // Remove orphaned materials
  const allMaterials = await getAllRecords(STORES.PROJECT_MATERIALS)
  const allProjects = await getAllRecords(STORES.PROJECTS)
  const projectIds = new Set(allProjects.map(p => p.id))

  for (const material of allMaterials) {
    if (!projectIds.has(material.projectId)) {
      await deleteRecord(STORES.PROJECT_MATERIALS, material.id)
    }
  }

  // Remove orphaned calculations
  const allCalculations = await getAllRecords(STORES.CALCULATIONS)
  for (const calc of allCalculations) {
    if (calc.projectId && !projectIds.has(calc.projectId)) {
      // Either delete or move to general project
      await updateRecord(STORES.CALCULATIONS, { ...calc, projectId: undefined })
    }
  }
}

// Export/Import functionality
export async function exportDatabase(): Promise<string> {
  const data = {
    projects: await getAllRecords(STORES.PROJECTS),
    calculations: await getAllRecords(STORES.CALCULATIONS),
    projectMaterials: await getAllRecords(STORES.PROJECT_MATERIALS),
    settings: await getAllRecords(STORES.SETTINGS),
    exportDate: new Date().toISOString(),
    version: DB_VERSION
  }

  return JSON.stringify(data, null, 2)
}

export async function importDatabase(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData)
    
    // Clear existing data
    const db = await getDatabase()
    const transaction = db.transaction([STORES.PROJECTS, STORES.CALCULATIONS, STORES.PROJECT_MATERIALS], 'readwrite')
    
    await Promise.all([
      transaction.objectStore(STORES.PROJECTS).clear(),
      transaction.objectStore(STORES.CALCULATIONS).clear(),
      transaction.objectStore(STORES.PROJECT_MATERIALS).clear()
    ])

    // Import data
    if (data.projects) {
      for (const project of data.projects) {
        await createRecord(STORES.PROJECTS, project)
      }
    }

    if (data.calculations) {
      for (const calculation of data.calculations) {
        await createRecord(STORES.CALCULATIONS, calculation)
      }
    }

    if (data.projectMaterials) {
      for (const material of data.projectMaterials) {
        await createRecord(STORES.PROJECT_MATERIALS, material)
      }
    }

    console.log('Database imported successfully')
  } catch (error) {
    console.error('Import failed:', error)
    throw error
  }
}

// ============================================================================
// TASK MANAGEMENT OPERATIONS
// ============================================================================

export async function createTask(task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const newTask: ProjectTask = {
    ...task,
    id,
    createdAt: now,
    updatedAt: now,
    dependencies: task.dependencies || [],
    blockedBy: [],
    progress: task.progress || 0
  }

  await createRecord(STORES.PROJECT_TASKS, newTask)
  return id
}

export async function updateTask(task: ProjectTask): Promise<void> {
  const updatedTask = {
    ...task,
    updatedAt: new Date()
  }
  await updateRecord(STORES.PROJECT_TASKS, updatedTask)
}

export async function getTask(id: string): Promise<ProjectTask | undefined> {
  return await getRecord(STORES.PROJECT_TASKS, id)
}

export async function getProjectTasks(projectId: string): Promise<ProjectTask[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROJECT_TASKS], 'readonly')
    const store = transaction.objectStore(STORES.PROJECT_TASKS)
    const index = store.index('projectId')
    const request = index.getAll(projectId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get project tasks: ${request.error?.message}`))
  })
}

export async function getAllTasks(): Promise<ProjectTask[]> {
  return await getAllRecords(STORES.PROJECT_TASKS)
}

export async function deleteTask(id: string): Promise<void> {
  // Remove this task from other tasks' dependencies
  const allTasks = await getAllTasks()
  for (const task of allTasks) {
    if (task.dependencies.includes(id)) {
      task.dependencies = task.dependencies.filter(depId => depId !== id)
      await updateTask(task)
    }
    if (task.blockedBy?.includes(id)) {
      task.blockedBy = task.blockedBy.filter(depId => depId !== id)
      await updateTask(task)
    }
  }
  
  await deleteRecord(STORES.PROJECT_TASKS, id)
}

export async function getTasksByStatus(projectId: string, status: string): Promise<ProjectTask[]> {
  const tasks = await getProjectTasks(projectId)
  return tasks.filter(task => task.status === status)
}

// ============================================================================
// MILESTONE MANAGEMENT OPERATIONS
// ============================================================================

export async function createMilestone(milestone: Omit<ProjectMilestone, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const db = await getDatabase()
  
  // Check if milestones store exists, if not, database needs upgrade
  if (!db.objectStoreNames.contains(STORES.PROJECT_MILESTONES)) {
    console.warn('PROJECT_MILESTONES store not found, milestone creation failed. Database needs upgrade.')
    throw new Error('Milestones not supported in current database version. Please refresh the application to upgrade.')
  }
  
  const id = `milestone_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const newMilestone: ProjectMilestone = {
    ...milestone,
    id,
    createdAt: now,
    updatedAt: now,
    taskIds: milestone.taskIds || [],
    progress: milestone.progress || 0,
    autoComplete: milestone.autoComplete ?? true,
    requiredTaskCompletion: milestone.requiredTaskCompletion || 100
  }

  await createRecord(STORES.PROJECT_MILESTONES, newMilestone)
  return id
}

export async function updateMilestone(milestone: ProjectMilestone): Promise<void> {
  const updatedMilestone = {
    ...milestone,
    updatedAt: new Date()
  }
  await updateRecord(STORES.PROJECT_MILESTONES, updatedMilestone)
}

export async function getMilestone(id: string): Promise<ProjectMilestone | undefined> {
  return await getRecord(STORES.PROJECT_MILESTONES, id)
}

export async function getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
  const db = await getDatabase()
  
  // Check if milestones store exists
  if (!db.objectStoreNames.contains(STORES.PROJECT_MILESTONES)) {
    console.warn('PROJECT_MILESTONES store not found, returning empty array. Database may need upgrade.')
    return []
  }
  
  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction([STORES.PROJECT_MILESTONES], 'readonly')
      const store = transaction.objectStore(STORES.PROJECT_MILESTONES)
      const index = store.index('projectId')
      const request = index.getAll(projectId)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error(`Failed to get project milestones: ${request.error?.message}`))
    } catch (error) {
      console.warn('Error accessing PROJECT_MILESTONES store:', error)
      resolve([])
    }
  })
}

export async function getAllMilestones(): Promise<ProjectMilestone[]> {
  const db = await getDatabase()
  
  // Check if milestones store exists
  if (!db.objectStoreNames.contains(STORES.PROJECT_MILESTONES)) {
    console.warn('PROJECT_MILESTONES store not found, returning empty array. Database may need upgrade.')
    return []
  }
  
  return await getAllRecords(STORES.PROJECT_MILESTONES)
}

export async function deleteMilestone(id: string): Promise<void> {
  // Unlink tasks from this milestone
  const allTasks = await getAllTasks()
  for (const task of allTasks) {
    if (task.milestoneId === id) {
      task.milestoneId = undefined
      await updateTask(task)
    }
  }
  
  await deleteRecord(STORES.PROJECT_MILESTONES, id)
}

// ============================================================================
// WORK LOG OPERATIONS
// ============================================================================

export async function createWorkLog(workLog: Omit<DailyWorkLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `worklog_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const newWorkLog: DailyWorkLog = {
    ...workLog,
    id,
    createdAt: now,
    updatedAt: now,
    entries: workLog.entries || []
  }

  await createRecord(STORES.DAILY_WORK_LOGS, newWorkLog)
  return id
}

export async function updateWorkLog(workLog: DailyWorkLog): Promise<void> {
  const updatedWorkLog = {
    ...workLog,
    updatedAt: new Date()
  }
  await updateRecord(STORES.DAILY_WORK_LOGS, updatedWorkLog)
}

export async function getWorkLog(id: string): Promise<DailyWorkLog | undefined> {
  return await getRecord(STORES.DAILY_WORK_LOGS, id)
}

export async function getProjectWorkLogs(projectId: string): Promise<DailyWorkLog[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DAILY_WORK_LOGS], 'readonly')
    const store = transaction.objectStore(STORES.DAILY_WORK_LOGS)
    const index = store.index('projectId')
    const request = index.getAll(projectId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get project work logs: ${request.error?.message}`))
  })
}

export async function getWorkLogByDate(projectId: string, date: Date): Promise<DailyWorkLog | undefined> {
  const workLogs = await getProjectWorkLogs(projectId)
  const targetDate = date.toDateString()
  return workLogs.find(log => new Date(log.date).toDateString() === targetDate)
}

export async function deleteWorkLog(id: string): Promise<void> {
  await deleteRecord(STORES.DAILY_WORK_LOGS, id)
}

export async function getAllWorkLogs(): Promise<DailyWorkLog[]> {
  return await getAllRecords(STORES.DAILY_WORK_LOGS)
}

// Helper function to generate unique IDs for work entries
export function generateWorkEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// ============================================================================
// WORKFORCE MANAGEMENT OPERATIONS
// ============================================================================

export async function createWorker(worker: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `worker_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const newWorker: Worker = {
    ...worker,
    id,
    createdAt: now,
    updatedAt: now,
    skills: worker.skills || [],
    isActive: worker.isActive !== false // Default to true
  }

  await createRecord(STORES.WORKERS, newWorker)
  return id
}

export async function updateWorker(worker: Worker): Promise<void> {
  const updatedWorker = {
    ...worker,
    updatedAt: new Date()
  }
  await updateRecord(STORES.WORKERS, updatedWorker)
}

export async function getWorker(id: string): Promise<Worker | undefined> {
  return await getRecord(STORES.WORKERS, id)
}

export async function getAllWorkers(): Promise<Worker[]> {
  return await getAllRecords(STORES.WORKERS)
}

export async function getActiveWorkers(): Promise<Worker[]> {
  const workers = await getAllWorkers()
  return workers.filter(worker => worker.isActive)
}

export async function deleteWorker(id: string): Promise<void> {
  // Deactivate instead of deleting to preserve historical data
  const worker = await getWorker(id)
  if (worker) {
    await updateWorker({ ...worker, isActive: false })
  }
}

// ============================================================================
// MACHINERY MANAGEMENT OPERATIONS
// ============================================================================

export async function createMachinery(machinery: Omit<Machinery, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `machinery_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const newMachinery: Machinery = {
    ...machinery,
    id,
    createdAt: now,
    updatedAt: now,
    isActive: machinery.isActive !== false // Default to true
  }

  await createRecord(STORES.MACHINERY, newMachinery)
  return id
}

export async function updateMachinery(machinery: Machinery): Promise<void> {
  const updatedMachinery = {
    ...machinery,
    updatedAt: new Date()
  }
  await updateRecord(STORES.MACHINERY, updatedMachinery)
}

export async function getMachinery(id: string): Promise<Machinery | undefined> {
  return await getRecord(STORES.MACHINERY, id)
}

export async function getAllMachinery(): Promise<Machinery[]> {
  return await getAllRecords(STORES.MACHINERY)
}

export async function getActiveMachinery(): Promise<Machinery[]> {
  const machinery = await getAllMachinery()
  return machinery.filter(item => item.isActive)
}

export async function deleteMachinery(id: string): Promise<void> {
  // Deactivate instead of deleting to preserve historical data
  const machinery = await getMachinery(id)
  if (machinery) {
    await updateMachinery({ ...machinery, isActive: false })
  }
}

// ============================================================================
// PROJECT ASSIGNMENT OPERATIONS
// ============================================================================

export async function createProjectAssignment(assignment: Omit<ProjectAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `assignment_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const newAssignment: ProjectAssignment = {
    ...assignment,
    id,
    createdAt: now,
    updatedAt: now,
    isActive: assignment.isActive !== false // Default to true
  }

  await createRecord(STORES.PROJECT_ASSIGNMENTS, newAssignment)
  return id
}

export async function updateProjectAssignment(assignment: ProjectAssignment): Promise<void> {
  const updatedAssignment = {
    ...assignment,
    updatedAt: new Date()
  }
  await updateRecord(STORES.PROJECT_ASSIGNMENTS, updatedAssignment)
}

export async function getProjectAssignment(id: string): Promise<ProjectAssignment | undefined> {
  return await getRecord(STORES.PROJECT_ASSIGNMENTS, id)
}

export async function getProjectAssignments(projectId: string): Promise<ProjectAssignment[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PROJECT_ASSIGNMENTS], 'readonly')
    const store = transaction.objectStore(STORES.PROJECT_ASSIGNMENTS)
    const index = store.index('projectId')
    const request = index.getAll(projectId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get project assignments: ${request.error?.message}`))
  })
}

export async function getActiveProjectAssignments(projectId: string): Promise<ProjectAssignment[]> {
  const assignments = await getProjectAssignments(projectId)
  return assignments.filter(assignment => assignment.isActive)
}

export async function deleteProjectAssignment(id: string): Promise<void> {
  await deleteRecord(STORES.PROJECT_ASSIGNMENTS, id)
}

// ============================================================================
// DAILY TIMESHEET OPERATIONS
// ============================================================================

export async function createDailyTimesheet(timesheet: Omit<DailyTimesheet, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `timesheet_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  // Calculate totals
  const totalLaborHours = timesheet.workerEntries.reduce((total, entry) => total + entry.hoursWorked, 0)
  const totalMachineryHours = timesheet.machineryEntries.reduce((total, entry) => total + entry.hoursUsed, 0)
  
  // Calculate costs (we'll need to fetch worker and machinery rates)
  let totalLaborCost = 0
  let totalMachineryCost = 0
  
  for (const entry of timesheet.workerEntries) {
    const worker = await getWorker(entry.workerId)
    if (worker) {
      totalLaborCost += entry.hoursWorked * worker.hourlyRate
    }
  }
  
  for (const entry of timesheet.machineryEntries) {
    const machinery = await getMachinery(entry.machineryId)
    if (machinery) {
      totalMachineryCost += entry.hoursUsed * machinery.hourlyRate
    }
  }
  
  const newTimesheet: DailyTimesheet = {
    ...timesheet,
    id,
    createdAt: now,
    updatedAt: now,
    totalLaborHours,
    totalMachineryHours,
    totalLaborCost,
    totalMachineryCost,
    workerEntries: timesheet.workerEntries || [],
    machineryEntries: timesheet.machineryEntries || []
  }

  await createRecord(STORES.DAILY_TIMESHEETS, newTimesheet)
  return id
}

export async function updateDailyTimesheet(timesheet: DailyTimesheet): Promise<void> {
  // Recalculate totals
  const totalLaborHours = timesheet.workerEntries.reduce((total, entry) => total + entry.hoursWorked, 0)
  const totalMachineryHours = timesheet.machineryEntries.reduce((total, entry) => total + entry.hoursUsed, 0)
  
  let totalLaborCost = 0
  let totalMachineryCost = 0
  
  for (const entry of timesheet.workerEntries) {
    const worker = await getWorker(entry.workerId)
    if (worker) {
      totalLaborCost += entry.hoursWorked * worker.hourlyRate
    }
  }
  
  for (const entry of timesheet.machineryEntries) {
    const machinery = await getMachinery(entry.machineryId)
    if (machinery) {
      totalMachineryCost += entry.hoursUsed * machinery.hourlyRate
    }
  }
  
  const updatedTimesheet = {
    ...timesheet,
    updatedAt: new Date(),
    totalLaborHours,
    totalMachineryHours,
    totalLaborCost,
    totalMachineryCost
  }
  
  await updateRecord(STORES.DAILY_TIMESHEETS, updatedTimesheet)
}

export async function getDailyTimesheet(id: string): Promise<DailyTimesheet | undefined> {
  return await getRecord(STORES.DAILY_TIMESHEETS, id)
}

export async function getProjectTimesheets(projectId: string): Promise<DailyTimesheet[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DAILY_TIMESHEETS], 'readonly')
    const store = transaction.objectStore(STORES.DAILY_TIMESHEETS)
    const index = store.index('projectId')
    const request = index.getAll(projectId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get project timesheets: ${request.error?.message}`))
  })
}

export async function getTimesheetByDate(projectId: string, date: Date): Promise<DailyTimesheet | undefined> {
  const timesheets = await getProjectTimesheets(projectId)
  const targetDate = date.toDateString()
  return timesheets.find(timesheet => new Date(timesheet.date).toDateString() === targetDate)
}

export async function deleteDailyTimesheet(id: string): Promise<void> {
  await deleteRecord(STORES.DAILY_TIMESHEETS, id)
}

export async function getAllTimesheets(): Promise<DailyTimesheet[]> {
  return await getAllRecords(STORES.DAILY_TIMESHEETS)
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function generateWorkerId(): string {
  return `worker_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

export function generateMachineryId(): string {
  return `machinery_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

export function generateTimesheetId(): string {
  return `timesheet_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

export function generateWorkerEntryId(): string {
  return `worker_entry_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

export function generateMachineryEntryId(): string {
  return `machinery_entry_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// ============================================================================
// ADDITIONAL DAILY JOURNAL FUNCTIONS
// ============================================================================

// Daily Journal functions for multi-project time tracking

export async function saveDailyJournalTimesheet(timesheet: DailyJournalTimesheet): Promise<void> {
  const dateStr = timesheet.date.toISOString().split('T')[0]
  const id = `journal-${dateStr}`
  
  // Store in a separate store for journal entries
  const journalTimesheet = {
    ...timesheet,
    id,
    createdAt: timesheet.createdAt || new Date(),
    updatedAt: new Date()
  }
  
  // For now, store in the same DAILY_TIMESHEETS store but with a different ID pattern
  try {
    await createRecord(STORES.DAILY_TIMESHEETS, journalTimesheet as any)
  } catch (error) {
    // If exists, update it
    await updateRecord(STORES.DAILY_TIMESHEETS, journalTimesheet as any)
  }
}

export async function getDailyJournalTimesheetByDate(date: Date): Promise<DailyJournalTimesheet | null> {
  const dateStr = date.toISOString().split('T')[0]
  const id = `journal-${dateStr}`
  
  try {
    const timesheet = await getRecord(STORES.DAILY_TIMESHEETS, id)
    if (timesheet) {
      return {
        ...timesheet,
        date: new Date(timesheet.date),
        createdAt: new Date(timesheet.createdAt),
        updatedAt: new Date(timesheet.updatedAt)
      } as DailyJournalTimesheet
    }
  } catch (error) {
    console.warn('Journal timesheet not found for date:', dateStr)
  }
  
  return null
}

export async function duplicateDailyJournalTimesheet(sourceDate: Date, targetDate: Date): Promise<void> {
  const sourceTimesheet = await getDailyJournalTimesheetByDate(sourceDate)
  if (!sourceTimesheet) {
    throw new Error('Source journal timesheet not found')
  }
  
  const targetTimesheet: DailyJournalTimesheet = {
    id: `journal-${targetDate.toISOString().split('T')[0]}`,
    date: targetDate,
    workerEntries: sourceTimesheet.workerEntries || [],
    machineryEntries: sourceTimesheet.machineryEntries || [],
    totalLaborHours: sourceTimesheet.totalLaborHours,
    totalMachineryHours: sourceTimesheet.totalMachineryHours,
    totalLaborCost: sourceTimesheet.totalLaborCost,
    totalMachineryCost: sourceTimesheet.totalMachineryCost,
    totalCost: sourceTimesheet.totalCost,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  await saveDailyJournalTimesheet(targetTimesheet)
}

export function calculateJournalTimesheetTotals(timesheet: DailyJournalTimesheet): {
  totalLaborHours: number
  totalMachineryHours: number
  totalLaborCost: number
  totalMachineryCost: number
  totalCost: number
} {
  const totalLaborHours = (timesheet.workerEntries || [])
    .reduce((sum, entry) => sum + entry.totalHours, 0)
    
  const totalMachineryHours = (timesheet.machineryEntries || [])
    .reduce((sum, entry) => sum + entry.totalHours, 0)
    
  const totalLaborCost = (timesheet.workerEntries || [])
    .reduce((sum, entry) => sum + entry.totalCost, 0)
    
  const totalMachineryCost = (timesheet.machineryEntries || [])
    .reduce((sum, entry) => sum + entry.totalCost, 0)
    
  const totalCost = totalLaborCost + totalMachineryCost
  
  return {
    totalLaborHours,
    totalMachineryHours,
    totalLaborCost,
    totalMachineryCost,
    totalCost
  }
}

// ============================================================================
// DISPATCH NOTE OPERATIONS
// ============================================================================

export async function createDispatchNote(dispatchNote: Omit<DispatchNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `dispatch_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const newDispatchNote: DispatchNote = {
    ...dispatchNote,
    id,
    createdAt: now,
    updatedAt: now,
    materials: [],
    inspectionRequired: dispatchNote.inspectionRequired || false,
    inspectionCompleted: false
  }

  await createRecord(STORES.DISPATCH_NOTES, newDispatchNote)
  return id
}

export async function updateDispatchNote(dispatchNote: DispatchNote): Promise<void> {
  const updatedDispatchNote = {
    ...dispatchNote,
    updatedAt: new Date()
  }
  await updateRecord(STORES.DISPATCH_NOTES, updatedDispatchNote)
}

export async function getDispatchNote(id: string): Promise<DispatchNote | undefined> {
  return await getRecord(STORES.DISPATCH_NOTES, id)
}

export async function getAllDispatchNotes(): Promise<DispatchNote[]> {
  return await getAllRecords(STORES.DISPATCH_NOTES)
}

export async function getProjectDispatchNotes(projectId: string): Promise<DispatchNote[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DISPATCH_NOTES], 'readonly')
    const store = transaction.objectStore(STORES.DISPATCH_NOTES)
    const index = store.index('projectId')
    const request = index.getAll(projectId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get project dispatch notes: ${request.error?.message}`))
  })
}

export async function deleteDispatchNote(id: string): Promise<void> {
  // Delete associated materials first
  const materials = await getDispatchMaterials(id)
  for (const material of materials) {
    await deleteRecord(STORES.DISPATCH_MATERIALS, material.id)
  }
  
  // Delete the dispatch note
  await deleteRecord(STORES.DISPATCH_NOTES, id)
}

export async function getDispatchNotesByStatus(status: DispatchStatus): Promise<DispatchNote[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DISPATCH_NOTES], 'readonly')
    const store = transaction.objectStore(STORES.DISPATCH_NOTES)
    const index = store.index('status')
    const request = index.getAll(status)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get dispatch notes by status: ${request.error?.message}`))
  })
}

// ============================================================================
// DISPATCH MATERIAL OPERATIONS
// ============================================================================

export async function createDispatchMaterial(material: Omit<DispatchMaterial, 'id'>): Promise<string> {
  const id = `dispatch_material_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  
  const newMaterial: DispatchMaterial = {
    ...material,
    id,
    status: material.status || 'pending' as DispatchMaterialStatus,
    usageHistory: []
  }

  await createRecord(STORES.DISPATCH_MATERIALS, newMaterial)
  
  // Update the parent dispatch note to include this material
  const dispatchNote = await getDispatchNote(material.dispatchNoteId)
  if (dispatchNote) {
    const updatedNote = {
      ...dispatchNote,
      materials: [...dispatchNote.materials, newMaterial],
      updatedAt: new Date()
    }
    await updateRecord(STORES.DISPATCH_NOTES, updatedNote)
  }
  
  return id
}

// Removed duplicate function - using the one with id/updates parameters instead

export async function getDispatchMaterial(id: string): Promise<DispatchMaterial | undefined> {
  return await getRecord(STORES.DISPATCH_MATERIALS, id)
}

export async function getDispatchMaterials(dispatchNoteId: string): Promise<DispatchMaterial[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DISPATCH_MATERIALS], 'readonly')
    const store = transaction.objectStore(STORES.DISPATCH_MATERIALS)
    const index = store.index('dispatchNoteId')
    const request = index.getAll(dispatchNoteId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(`Failed to get dispatch materials: ${request.error?.message}`))
  })
}

export async function deleteDispatchMaterial(id: string): Promise<void> {
  const material = await getDispatchMaterial(id)
  if (material) {
    // Remove from dispatch note
    const dispatchNote = await getDispatchNote(material.dispatchNoteId)
    if (dispatchNote) {
      const updatedNote = {
        ...dispatchNote,
        materials: dispatchNote.materials.filter(m => m.id !== id),
        updatedAt: new Date()
      }
      await updateRecord(STORES.DISPATCH_NOTES, updatedNote)
    }
  }
  
  await deleteRecord(STORES.DISPATCH_MATERIALS, id)
}

export async function bulkCreateDispatchMaterials(
  dispatchNoteId: string, 
  materials: Omit<DispatchMaterial, 'id' | 'dispatchNoteId'>[]
): Promise<string[]> {
  const materialIds: string[] = []
  const newMaterials: DispatchMaterial[] = []
  
  for (const materialData of materials) {
    const id = `dispatch_material_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    materialIds.push(id)
    
    const newMaterial: DispatchMaterial = {
      ...materialData,
      id,
      dispatchNoteId,
      status: materialData.status || 'pending' as DispatchMaterialStatus,
      usageHistory: []
    }
    
    newMaterials.push(newMaterial)
    await createRecord(STORES.DISPATCH_MATERIALS, newMaterial)
  }
  
  // Update the parent dispatch note to include all materials
  const dispatchNote = await getDispatchNote(dispatchNoteId)
  if (dispatchNote) {
    const updatedNote = {
      ...dispatchNote,
      materials: [...dispatchNote.materials, ...newMaterials],
      updatedAt: new Date()
    }
    await updateRecord(STORES.DISPATCH_NOTES, updatedNote)
  }
  
  return materialIds
}

export async function updateDispatchMaterialStatus(
  materialId: string, 
  status: DispatchMaterialStatus, 
  notes?: string
): Promise<void> {
  const material = await getDispatchMaterial(materialId)
  if (!material) {
    throw new Error('Dispatch material not found')
  }

  const updatedMaterial: DispatchMaterial = {
    ...material,
    status,
    notes: notes || material.notes
  }

  // Add to usage history if status indicates usage
  if (status === 'used' || status === 'allocated') {
    const historyEntry = {
      date: new Date(),
      quantityUsed: status === 'used' ? material.quantity : 0,
      notes: notes || `Status changed to ${status}`
    }
    
    updatedMaterial.usageHistory = [
      ...(material.usageHistory || []),
      historyEntry
    ]
  }

  await updateDispatchMaterial(materialId, {
    status,
    notes: notes || material.notes,
    usageHistory: updatedMaterial.usageHistory
  })
}

// ============================================================================
// MATERIAL INVENTORY AND REPORTING
// ============================================================================

export async function getMaterialInventorySummary(projectId?: string): Promise<any[]> {
  const dispatchNotes = projectId 
    ? await getProjectDispatchNotes(projectId)
    : await getAllDispatchNotes()
  
  const inventoryMap = new Map<string, any>()
  
  for (const dispatch of dispatchNotes) {
    for (const material of dispatch.materials) {
      const key = `${material.materialType}-${material.profile}-${material.grade}`
      
      if (!inventoryMap.has(key)) {
        inventoryMap.set(key, {
          materialType: material.materialType,
          profile: material.profile,
          grade: material.grade,
          totalQuantity: 0,
          totalWeight: 0,
          availableQuantity: 0,
          allocatedQuantity: 0,
          usedQuantity: 0,
          locations: new Set<string>(),
          lastUpdated: new Date()
        })
      }
      
      const inventory = inventoryMap.get(key)
      inventory.totalQuantity += material.quantity
      inventory.totalWeight += material.totalWeight
      
      switch (material.status) {
        case 'arrived':
          inventory.availableQuantity += material.quantity
          break
        case 'allocated':
          inventory.allocatedQuantity += material.quantity
          break
        case 'used':
          inventory.usedQuantity += material.quantity
          break
      }
      
      if (material.location) {
        inventory.locations.add(material.location)
      }
    }
  }
  
  return Array.from(inventoryMap.values()).map(inv => ({
    ...inv,
    locations: Array.from(inv.locations)
  }))
}

export async function getDispatchSummaryStats(projectId?: string): Promise<any> {
  const dispatchNotes = projectId 
    ? await getProjectDispatchNotes(projectId)
    : await getAllDispatchNotes()
  
  const summary = {
    totalDispatches: dispatchNotes.length,
    pendingDispatches: 0,
    shippedDispatches: 0,
    arrivedDispatches: 0,
    totalValue: 0,
    totalMaterials: 0,
    materialsArrived: 0,
    materialsAllocated: 0,
    materialsUsed: 0
  }
  
  for (const dispatch of dispatchNotes) {
    switch (dispatch.status) {
      case 'pending':
        summary.pendingDispatches++
        break
      case 'shipped':
        summary.shippedDispatches++
        break
      case 'arrived':
        summary.arrivedDispatches++
        break
    }
    
    summary.totalValue += dispatch.totalValue || 0
    summary.totalMaterials += dispatch.materials.length
    
    for (const material of dispatch.materials) {
      switch (material.status) {
        case 'arrived':
          summary.materialsArrived++
          break
        case 'allocated':
          summary.materialsAllocated++
          break
        case 'used':
          summary.materialsUsed++
          break
      }
    }
  }
  
  return summary
}

// ============================================================================
// MATERIAL CATALOG CRUD OPERATIONS (PHASE 2)
// ============================================================================

// Material Catalog Operations
export async function createMaterialCatalog(material: Omit<MaterialCatalog, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<string> {
  const id = `mat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const materialWithId: MaterialCatalog = {
    ...material,
    id,
    createdAt: now,
    updatedAt: now,
    version: 1
  }

  await createRecord(STORES.MATERIAL_CATALOG, materialWithId)
  return id
}

export async function getAllMaterialCatalog(): Promise<MaterialCatalog[]> {
  return await getAllRecords(STORES.MATERIAL_CATALOG)
}

export async function getMaterialCatalogById(id: string): Promise<MaterialCatalog | null> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MATERIAL_CATALOG], 'readonly')
    const store = transaction.objectStore(STORES.MATERIAL_CATALOG)
    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result || null)
    }
    request.onerror = () => {
      reject(new Error(`Failed to get material: ${request.error?.message}`))
    }
  })
}

export async function updateMaterialCatalog(id: string, updates: Partial<Omit<MaterialCatalog, 'id' | 'createdAt' | 'version'>>): Promise<void> {
  const existing = await getMaterialCatalogById(id)
  if (!existing) {
    throw new Error('Material not found')
  }

  const updated: MaterialCatalog = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
    version: existing.version + 1
  }

  return await updateRecord(STORES.MATERIAL_CATALOG, updated)
}

export async function deleteMaterialCatalog(id: string): Promise<void> {
  return await deleteRecord(STORES.MATERIAL_CATALOG, id)
}

export async function searchMaterialCatalog(filters: {
  type?: string[]
  category?: string[]
  availability?: string[]
  priceRange?: { min: number; max: number }
  strengthRange?: { min: number; max: number }
  applications?: string[]
  tags?: string[]
  searchTerm?: string
}): Promise<MaterialCatalog[]> {
  const allMaterials = await getAllMaterialCatalog()
  
  return allMaterials.filter(material => {
    // Type filter
    if (filters.type && filters.type.length > 0 && !filters.type.includes(material.type)) {
      return false
    }

    // Category filter
    if (filters.category && filters.category.length > 0 && !filters.category.includes(material.category)) {
      return false
    }

    // Availability filter
    if (filters.availability && filters.availability.length > 0 && !filters.availability.includes(material.availability)) {
      return false
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange
      if (material.basePrice < min || material.basePrice > max) {
        return false
      }
    }

    // Strength range filter
    if (filters.strengthRange) {
      const { min, max } = filters.strengthRange
      if (material.yieldStrength < min || material.yieldStrength > max) {
        return false
      }
    }

    // Applications filter
    if (filters.applications && filters.applications.length > 0) {
      const hasMatchingApplication = filters.applications.some(app => 
        material.applications.some(matApp => matApp.toLowerCase().includes(app.toLowerCase()))
      )
      if (!hasMatchingApplication) {
        return false
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        material.tags.some(matTag => matTag.toLowerCase().includes(tag.toLowerCase()))
      )
      if (!hasMatchingTag) {
        return false
      }
    }

    // Text search
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      const searchFields = [
        material.name,
        material.description || '',
        ...material.applications,
        ...material.tags,
        ...material.standards
      ]
      
      const hasMatch = searchFields.some(field => 
        field.toLowerCase().includes(term)
      )
      if (!hasMatch) {
        return false
      }
    }

    return true
  })
}

// Material Template Operations
export async function createMaterialTemplate(template: Omit<MaterialTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<string> {
  const id = `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const templateWithId: MaterialTemplate = {
    ...template,
    id,
    createdAt: now,
    updatedAt: now,
    usageCount: 0
  }

  await createRecord(STORES.MATERIAL_TEMPLATES, templateWithId)
  return id
}

export async function getAllMaterialTemplates(): Promise<MaterialTemplate[]> {
  return await getAllRecords(STORES.MATERIAL_TEMPLATES)
}

export async function getMaterialTemplateById(id: string): Promise<MaterialTemplate | null> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.MATERIAL_TEMPLATES], 'readonly')
    const store = transaction.objectStore(STORES.MATERIAL_TEMPLATES)
    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result || null)
    }
    request.onerror = () => {
      reject(new Error(`Failed to get template: ${request.error?.message}`))
    }
  })
}

export async function updateMaterialTemplate(id: string, updates: Partial<Omit<MaterialTemplate, 'id' | 'createdAt'>>): Promise<void> {
  const existing = await getMaterialTemplateById(id)
  if (!existing) {
    throw new Error('Template not found')
  }

  const updated: MaterialTemplate = {
    ...existing,
    ...updates,
    updatedAt: new Date()
  }

  return await updateRecord(STORES.MATERIAL_TEMPLATES, updated)
}

export async function deleteMaterialTemplate(id: string): Promise<void> {
  return await deleteRecord(STORES.MATERIAL_TEMPLATES, id)
}

export async function incrementTemplateUsage(id: string): Promise<void> {
  const template = await getMaterialTemplateById(id)
  if (template) {
    await updateMaterialTemplate(id, { 
      usageCount: template.usageCount + 1 
    })
  }
}

export async function getTemplatesByMaterial(materialCatalogId: string): Promise<MaterialTemplate[]> {
  const allTemplates = await getAllMaterialTemplates()
  return allTemplates.filter(template => template.materialCatalogId === materialCatalogId)
}

export async function getPopularTemplates(limit: number = 10): Promise<MaterialTemplate[]> {
  const allTemplates = await getAllMaterialTemplates()
  return allTemplates
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit)
}

// ============================================================================
// DISPATCH NOTES INTEGRATION FUNCTIONS (PHASE 4)
// ============================================================================

export async function getDispatchNotesByProject(projectId: string): Promise<DispatchNote[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DISPATCH_NOTES], 'readonly')
    const store = transaction.objectStore(STORES.DISPATCH_NOTES)
    const index = store.index('projectId')
    const request = index.getAll(projectId)

    request.onsuccess = () => {
      const results = request.result.map((note: any) => ({
        ...note,
        date: new Date(note.date),
        expectedDeliveryDate: note.expectedDeliveryDate ? new Date(note.expectedDeliveryDate) : undefined,
        actualDeliveryDate: note.actualDeliveryDate ? new Date(note.actualDeliveryDate) : undefined,
        inspectionDate: note.inspectionDate ? new Date(note.inspectionDate) : undefined,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }))
      resolve(results)
    }
    request.onerror = () => {
      reject(new Error(`Failed to get dispatch notes for project: ${request.error?.message}`))
    }
  })
}

export async function getDispatchMaterialsByDispatch(dispatchNoteId: string): Promise<DispatchMaterial[]> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DISPATCH_MATERIALS], 'readonly')
    const store = transaction.objectStore(STORES.DISPATCH_MATERIALS)
    const index = store.index('dispatchNoteId')
    const request = index.getAll(dispatchNoteId)

    request.onsuccess = () => {
      const results = request.result.map((material: any) => ({
        ...material,
        inspectionDate: material.inspectionDate ? new Date(material.inspectionDate) : undefined,
        usageHistory: material.usageHistory?.map((entry: any) => ({
          ...entry,
          date: new Date(entry.date)
        })) || []
      }))
      resolve(results)
    }
    request.onerror = () => {
      reject(new Error(`Failed to get dispatch materials: ${request.error?.message}`))
    }
  })
}

export async function updateDispatchMaterial(id: string, updates: Partial<DispatchMaterial>): Promise<void> {
  const existing = await getRecord(STORES.DISPATCH_MATERIALS, id)
  if (!existing) {
    throw new Error('Dispatch material not found')
  }

  const updated = {
    ...existing,
    ...updates
  }

  return await updateRecord(STORES.DISPATCH_MATERIALS, updated)
}

export async function getDispatchMaterialById(id: string): Promise<DispatchMaterial | null> {
  const db = await getDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.DISPATCH_MATERIALS], 'readonly')
    const store = transaction.objectStore(STORES.DISPATCH_MATERIALS)
    const request = store.get(id)

    request.onsuccess = () => {
      const result = request.result
      if (result) {
        resolve({
          ...result,
          inspectionDate: result.inspectionDate ? new Date(result.inspectionDate) : undefined,
          usageHistory: result.usageHistory?.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date)
          })) || []
        })
      } else {
        resolve(null)
      }
    }
    request.onerror = () => {
      reject(new Error(`Failed to get dispatch material: ${request.error?.message}`))
    }
  })
}

// ============================================================================
// MATERIAL STOCK MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Create a new material stock entry
 */
export async function createMaterialStock(stock: Omit<MaterialStock, 'id' | 'createdAt' | 'updatedAt' | 'lastStockUpdate'>): Promise<string> {
  const id = `stock_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const newStock: MaterialStock = {
    ...stock,
    id,
    createdAt: now,
    updatedAt: now,
    lastStockUpdate: now
  }

  return new Promise(async (resolve, reject) => {
    const db = await getDatabase()
    const transaction = db.transaction([STORES.MATERIAL_STOCK], 'readwrite')
    const store = transaction.objectStore(STORES.MATERIAL_STOCK)
    
    const request = store.add(newStock)
    
    request.onsuccess = () => {
      resolve(id)
    }
    request.onerror = () => {
      reject(new Error(`Failed to create material stock: ${request.error?.message}`))
    }
  })
}

/**
 * Get all material stock entries
 */
export async function getAllMaterialStock(): Promise<MaterialStock[]> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase()
    const transaction = db.transaction([STORES.MATERIAL_STOCK], 'readonly')
    const store = transaction.objectStore(STORES.MATERIAL_STOCK)
    
    const request = store.getAll()
    
    request.onsuccess = () => {
      const results = request.result.map((stock: any) => ({
        ...stock,
        createdAt: new Date(stock.createdAt),
        updatedAt: new Date(stock.updatedAt),
        lastStockUpdate: new Date(stock.lastStockUpdate)
      }))
      resolve(results)
    }
    request.onerror = () => {
      reject(new Error(`Failed to get material stock: ${request.error?.message}`))
    }
  })
}

/**
 * Get material stock by material catalog ID
 */
export async function getMaterialStockByMaterialId(materialCatalogId: string): Promise<MaterialStock | null> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase()
    const transaction = db.transaction([STORES.MATERIAL_STOCK], 'readonly')
    const store = transaction.objectStore(STORES.MATERIAL_STOCK)
    
    const request = store.getAll()
    
    request.onsuccess = () => {
      const results = request.result
      const stock = results.find((s: any) => s.materialCatalogId === materialCatalogId)
      if (stock) {
        resolve({
          ...stock,
          createdAt: new Date(stock.createdAt),
          updatedAt: new Date(stock.updatedAt),
          lastStockUpdate: new Date(stock.lastStockUpdate)
        })
      } else {
        resolve(null)
      }
    }
    request.onerror = () => {
      reject(new Error(`Failed to get material stock: ${request.error?.message}`))
    }
  })
}

/**
 * Update material stock
 */
export async function updateMaterialStock(stock: MaterialStock): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const db = await getDatabase()
    const transaction = db.transaction([STORES.MATERIAL_STOCK], 'readwrite')
    const store = transaction.objectStore(STORES.MATERIAL_STOCK)
    
    const updatedStock = {
      ...stock,
      updatedAt: new Date()
    }
    
    const request = store.put(updatedStock)
    
    request.onsuccess = () => {
      resolve()
    }
    request.onerror = () => {
      reject(new Error(`Failed to update material stock: ${request.error?.message}`))
    }
  })
}

/**
 * Reserve material stock for a project
 */
export async function reserveMaterialStock(materialCatalogId: string, quantity: number, projectId: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const stock = await getMaterialStockByMaterialId(materialCatalogId)
      if (!stock) {
        reject(new Error('Material stock not found'))
        return
      }
      
      if (stock.availableStock < quantity) {
        reject(new Error('Insufficient stock available'))
        return
      }
      
      // Update stock quantities
      const updatedStock = {
        ...stock,
        reservedStock: stock.reservedStock + quantity,
        availableStock: stock.availableStock - quantity,
        lastStockUpdate: new Date()
      }
      
      await updateMaterialStock(updatedStock)
      
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

export async function unreserveMaterialStock(materialCatalogId: string, quantity: number, projectId: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const stock = await getMaterialStockByMaterialId(materialCatalogId)
      if (!stock) {
        reject(new Error('Material stock not found'))
        return
      }
      
      if (stock.reservedStock < quantity) {
        reject(new Error('Insufficient reserved stock'))
        return
      }
      
      // Update stock quantities - return reserved to available
      const updatedStock = {
        ...stock,
        reservedStock: stock.reservedStock - quantity,
        availableStock: stock.availableStock + quantity,
        lastStockUpdate: new Date()
      }
      
      await updateMaterialStock(updatedStock)
      
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Create a material stock transaction
 */
export async function createMaterialStockTransaction(transaction: Omit<MaterialStockTransaction, 'id' | 'createdAt'>): Promise<string> {
  const id = `trans_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  const now = new Date()
  
  const newTransaction: MaterialStockTransaction = {
    ...transaction,
    id,
    createdAt: now
  }

  return new Promise(async (resolve, reject) => {
    const db = await getDatabase()
    const dbTransaction = db.transaction([STORES.MATERIAL_STOCK_TRANSACTIONS], 'readwrite')
    const store = dbTransaction.objectStore(STORES.MATERIAL_STOCK_TRANSACTIONS)
    
    const request = store.add(newTransaction)
    
    request.onsuccess = () => {
      resolve(id)
    }
    request.onerror = () => {
      reject(new Error(`Failed to create material stock transaction: ${request.error?.message}`))
    }
  })
}

/**
 * Get material stock transactions by stock ID
 */
export async function getMaterialStockTransactions(materialStockId: string): Promise<MaterialStockTransaction[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await getDatabase()
      const transaction = db.transaction([STORES.MATERIAL_STOCK_TRANSACTIONS], 'readonly')
      const store = transaction.objectStore(STORES.MATERIAL_STOCK_TRANSACTIONS)
      
      // Use the materialStockId index for better performance
      const index = store.index('materialStockId')
      const request = index.getAll(materialStockId)
      
      request.onsuccess = () => {
        const results = request.result.map((trans: any) => ({
          ...trans,
          transactionDate: new Date(trans.transactionDate),
          createdAt: new Date(trans.createdAt)
        }))
        resolve(results)
      }
      
      request.onerror = () => {
        reject(new Error(`Failed to get material stock transactions: ${request.error?.message}`))
      }
    } catch (error) {
      reject(new Error(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

export async function getMaterialStockTransactionsByProject(projectId: string): Promise<MaterialStockTransaction[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await getDatabase()
      const transaction = db.transaction([STORES.MATERIAL_STOCK_TRANSACTIONS], 'readonly')
      const store = transaction.objectStore(STORES.MATERIAL_STOCK_TRANSACTIONS)
      
      const request = store.getAll()
      
      request.onsuccess = () => {
        const allTransactions = request.result as MaterialStockTransaction[]
        const projectTransactions = allTransactions.filter(t => 
          t.referenceId === projectId && t.referenceType === 'PROJECT'
        ).map(trans => ({
          ...trans,
          transactionDate: new Date(trans.transactionDate),
          createdAt: new Date(trans.createdAt)
        }))
        resolve(projectTransactions)
      }
      
      request.onerror = () => {
        reject(new Error(`Failed to get material stock transactions by project: ${request.error?.message}`))
      }
    } catch (error) {
      reject(new Error(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

// Database reset function
export async function resetDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Close the existing database connection
    if (db) {
      db.close()
    }
    
    // Delete the database
    const deleteRequest = indexedDB.deleteDatabase(DB_NAME)
    
    deleteRequest.onsuccess = () => {
      console.log('Database deleted successfully')
      // Reset the global db reference
      db = null
      resolve()
    }
    
    deleteRequest.onerror = () => {
      reject(new Error(`Failed to delete database: ${deleteRequest.error?.message}`))
    }
    
    deleteRequest.onblocked = () => {
      console.warn('Database deletion blocked. Close all tabs and try again.')
      reject(new Error('Database deletion blocked. Close all tabs and try again.'))
    }
  })
} 