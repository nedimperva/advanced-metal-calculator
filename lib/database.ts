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
  DailyTimesheet
} from './types'
import { ProjectStatus, MaterialStatus } from './types'

// Database configuration
const DB_NAME = 'MetalCalculatorDB'
const DB_VERSION = 3

// Store names
export const STORES = {
  PROJECTS: 'projects',
  CALCULATIONS: 'calculations',
  PROJECT_MATERIALS: 'projectMaterials',
  PROJECT_TASKS: 'projectTasks',
  DAILY_WORK_LOGS: 'dailyWorkLogs',
  WORK_ENTRIES: 'workEntries',
  // New workforce and machinery stores
  WORKERS: 'workers',
  MACHINERY: 'machinery',
  PROJECT_ASSIGNMENTS: 'projectAssignments',
  DAILY_TIMESHEETS: 'dailyTimesheets',
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
  settings: { key: string; value: any }
}

// Database connection
let dbInstance: IDBDatabase | null = null

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

      // Create project materials store
      if (!db.objectStoreNames.contains(STORES.PROJECT_MATERIALS)) {
        const materialStore = db.createObjectStore(STORES.PROJECT_MATERIALS, { keyPath: 'id' })
        materialStore.createIndex('projectId', 'projectId', { unique: false })
        materialStore.createIndex('calculationId', 'calculationId', { unique: false })
        materialStore.createIndex('status', 'status', { unique: false })
        materialStore.createIndex('orderDate', 'orderDate', { unique: false })
        materialStore.createIndex('arrivalDate', 'arrivalDate', { unique: false })
      }

      // Create project tasks store
      if (!db.objectStoreNames.contains(STORES.PROJECT_TASKS)) {
        const taskStore = db.createObjectStore(STORES.PROJECT_TASKS, { keyPath: 'id' })
        taskStore.createIndex('projectId', 'projectId', { unique: false })
        taskStore.createIndex('status', 'status', { unique: false })
        taskStore.createIndex('type', 'type', { unique: false })
        taskStore.createIndex('priority', 'priority', { unique: false })
        taskStore.createIndex('assignedTo', 'assignedTo', { unique: false })
        taskStore.createIndex('scheduledStart', 'scheduledStart', { unique: false })
        taskStore.createIndex('scheduledEnd', 'scheduledEnd', { unique: false })
        taskStore.createIndex('createdAt', 'createdAt', { unique: false })
        taskStore.createIndex('updatedAt', 'updatedAt', { unique: false })
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
  const id = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
export async function addMaterialToProject(material: Omit<ProjectMaterial, 'id'>): Promise<string> {
  const id = `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const newMaterial: ProjectMaterial = {
    ...material,
    id
  }

  await createRecord(STORES.PROJECT_MATERIALS, newMaterial)
  return id
}

export async function updateMaterialStatus(materialId: string, status: MaterialStatus, notes?: string): Promise<void> {
  const material = await getRecord(STORES.PROJECT_MATERIALS, materialId)
  if (!material) {
    throw new Error('Material not found')
  }

  const updatedMaterial: ProjectMaterial = {
    ...material,
    status,
    notes: notes || material.notes
  }

  // Update status-specific dates
  const now = new Date()
  switch (status) {
    case MaterialStatus.ORDERED:
      updatedMaterial.orderDate = now
      break
    case MaterialStatus.ARRIVED:
      updatedMaterial.arrivalDate = now
      break
    case MaterialStatus.INSTALLED:
      updatedMaterial.installationDate = now
      break
  }

  await updateRecord(STORES.PROJECT_MATERIALS, updatedMaterial)
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

// Calculation-specific operations
export async function saveCalculation(calculation: Omit<Calculation, 'id' | 'timestamp'>): Promise<string> {
  const id = `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
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
  const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
// WORK LOG OPERATIONS
// ============================================================================

export async function createWorkLog(workLog: Omit<DailyWorkLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `worklog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// WORKFORCE MANAGEMENT OPERATIONS
// ============================================================================

export async function createWorker(worker: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  const id = `machinery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  const id = `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  const id = `timesheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  return `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateMachineryId(): string {
  return `machinery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateTimesheetId(): string {
  return `timesheet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateWorkerEntryId(): string {
  return `worker_entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateMachineryEntryId(): string {
  return `machinery_entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// ADDITIONAL DAILY JOURNAL FUNCTIONS
// ============================================================================

// Daily Journal functions for multi-project time tracking
import { DailyJournalTimesheet, JournalWorkerEntry, JournalMachineryEntry } from '@/lib/types'

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