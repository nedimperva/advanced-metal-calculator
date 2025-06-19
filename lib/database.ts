import type { Project, ProjectMaterial, Calculation } from './types'
import { ProjectStatus, MaterialStatus } from './types'

// Database configuration
const DB_NAME = 'MetalCalculatorDB'
const DB_VERSION = 1

// Store names
export const STORES = {
  PROJECTS: 'projects',
  CALCULATIONS: 'calculations',
  PROJECT_MATERIALS: 'projectMaterials',
  SETTINGS: 'settings'
} as const

// Database schema
export interface DatabaseSchema {
  projects: Project
  calculations: Calculation
  projectMaterials: ProjectMaterial
  settings: { key: string; value: any }
}

// Database connection
let dbInstance: IDBDatabase | null = null

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

      // Create settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      }
    }
  })
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