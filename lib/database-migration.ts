import { openDB, IDBPDatabase } from 'idb'
import type { Calculation, Project, ProjectMaterial } from './types'
import { toast } from '@/hooks/use-toast'

interface MigrationProgress {
  stage: string
  progress: number
  total: number
  message: string
}

interface MigrationResult {
  success: boolean
  migratedCalculations: number
  createdDefaultProject: boolean
  errors: string[]
  warnings: string[]
}

const DB_NAME = 'MetalCalculatorDB'
const DB_VERSION = 1

// Default project for orphaned calculations
const DEFAULT_PROJECT: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'General Calculations',
  description: 'Calculations that were migrated from the old system',
  client: '',
  location: '',
  status: 'active',
  deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  budget: 0,
  spent: 0,
  materials: [],
  timeline: [],
  notes: [],
  tags: ['migrated', 'general'],
  attachments: []
}

export class DatabaseMigration {
  private db: IDBPDatabase | null = null
  private onProgress?: (progress: MigrationProgress) => void

  constructor(onProgress?: (progress: MigrationProgress) => void) {
    this.onProgress = onProgress
  }

  private reportProgress(stage: string, progress: number, total: number, message: string) {
    if (this.onProgress) {
      this.onProgress({ stage, progress, total, message })
    }
  }

  private async initDatabase(): Promise<IDBPDatabase> {
    if (this.db) return this.db

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
          projectStore.createIndex('status', 'status')
          projectStore.createIndex('createdAt', 'createdAt')
          projectStore.createIndex('updatedAt', 'updatedAt')
        }

        // Calculations store
        if (!db.objectStoreNames.contains('calculations')) {
          const calcStore = db.createObjectStore('calculations', { keyPath: 'id' })
          calcStore.createIndex('projectId', 'projectId')
          calcStore.createIndex('timestamp', 'timestamp')
          calcStore.createIndex('material', 'material')
          calcStore.createIndex('profileType', 'profileType')
        }

        // Project materials store (for detailed material tracking)
        if (!db.objectStoreNames.contains('projectMaterials')) {
          const materialStore = db.createObjectStore('projectMaterials', { keyPath: 'id' })
          materialStore.createIndex('projectId', 'projectId')
          materialStore.createIndex('status', 'status')
          materialStore.createIndex('calculationId', 'calculationId')
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
      },
    })

    return this.db
  }

  private async loadExistingCalculations(): Promise<Calculation[]> {
    try {
      const saved = localStorage.getItem('metal-calculations')
      if (!saved) return []

      const parsed = JSON.parse(saved)
      return parsed.map((calc: any) => ({
        ...calc,
        timestamp: new Date(calc.timestamp),
      }))
    } catch (error) {
      console.error('Error loading existing calculations:', error)
      return []
    }
  }

  private async createDefaultProject(db: IDBPDatabase): Promise<Project> {
    const now = new Date()
    const project: Project = {
      ...DEFAULT_PROJECT,
      id: `default-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }

    await db.add('projects', project)
    return project
  }

  private async migrateCalculations(
    db: IDBPDatabase,
    calculations: Calculation[],
    defaultProjectId: string
  ): Promise<{ migrated: number; errors: string[] }> {
    const errors: string[] = []
    let migrated = 0

    for (let i = 0; i < calculations.length; i++) {
      try {
        this.reportProgress(
          'Migrating Calculations',
          i + 1,
          calculations.length,
          `Migrating calculation ${i + 1} of ${calculations.length}`
        )

        const calc = calculations[i]
        
        // Assign to default project if no project ID
        if (!calc.projectId) {
          calc.projectId = defaultProjectId
        }

        // Ensure required fields
        if (!calc.id) {
          calc.id = `migrated-${Date.now()}-${i}`
        }

        if (!calc.timestamp) {
          calc.timestamp = new Date()
        }

        // Validate calculation data
        if (!calc.weight || calc.weight <= 0) {
          errors.push(`Invalid weight for calculation ${calc.id}`)
          continue
        }

        if (!calc.profileType || !calc.material) {
          errors.push(`Missing profile type or material for calculation ${calc.id}`)
          continue
        }

        // Add to IndexedDB
        await db.add('calculations', calc)
        migrated++

        // Create corresponding project material entry
        const projectMaterial: ProjectMaterial = {
          id: `material-${calc.id}`,
          projectId: calc.projectId,
          calculationId: calc.id,
          name: calc.name || `${calc.profileType.toUpperCase()} Calculation`,
          material: calc.material,
          profileType: calc.profileType,
          quantity: calc.quantity || 1,
          weight: calc.weight,
          status: 'completed',
          unitCost: calc.unitCost || 0,
          totalCost: calc.totalCost || 0,
          supplier: '',
          orderDate: calc.timestamp,
          expectedDelivery: calc.timestamp,
          notes: calc.notes || '',
          attachments: []
        }

        await db.add('projectMaterials', projectMaterial)

      } catch (error) {
        console.error(`Error migrating calculation ${i}:`, error)
        errors.push(`Failed to migrate calculation ${i}: ${error}`)
      }
    }

    return { migrated, errors }
  }

  private async verifyMigration(db: IDBPDatabase): Promise<{ isValid: boolean; issues: string[] }> {
    const issues: string[] = []

    try {
      // Check if calculations were migrated
      const calcCount = await db.count('calculations')
      if (calcCount === 0) {
        issues.push('No calculations found after migration')
      }

      // Check if default project exists
      const projectCount = await db.count('projects')
      if (projectCount === 0) {
        issues.push('No projects found after migration')
      }

      // Check data integrity
      const calculations = await db.getAll('calculations')
      for (const calc of calculations) {
        if (!calc.projectId) {
          issues.push(`Calculation ${calc.id} has no project ID`)
        }
        if (!calc.weight || calc.weight <= 0) {
          issues.push(`Calculation ${calc.id} has invalid weight`)
        }
      }

      return { isValid: issues.length === 0, issues }
    } catch (error) {
      console.error('Error verifying migration:', error)
      return { isValid: false, issues: [`Verification failed: ${error}`] }
    }
  }

  private async createBackup(): Promise<string> {
    try {
      const saved = localStorage.getItem('metal-calculations')
      if (!saved) return ''

      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: JSON.parse(saved)
      }

      const backupData = JSON.stringify(backup, null, 2)
      localStorage.setItem('metal-calculations-backup', backupData)
      
      return backupData
    } catch (error) {
      console.error('Error creating backup:', error)
      throw new Error('Failed to create backup')
    }
  }

  async performMigration(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedCalculations: 0,
      createdDefaultProject: false,
      errors: [],
      warnings: []
    }

    try {
      this.reportProgress('Starting Migration', 0, 100, 'Initializing migration process...')

      // Step 1: Create backup
      this.reportProgress('Creating Backup', 10, 100, 'Creating backup of existing data...')
      await this.createBackup()

      // Step 2: Initialize database
      this.reportProgress('Initializing Database', 20, 100, 'Setting up IndexedDB...')
      const db = await this.initDatabase()

      // Step 3: Load existing calculations
      this.reportProgress('Loading Data', 30, 100, 'Loading existing calculations...')
      const existingCalculations = await this.loadExistingCalculations()

      if (existingCalculations.length === 0) {
        result.warnings.push('No existing calculations found to migrate')
        result.success = true
        return result
      }

      // Step 4: Create default project
      this.reportProgress('Creating Default Project', 40, 100, 'Creating default project for orphaned calculations...')
      const defaultProject = await this.createDefaultProject(db)
      result.createdDefaultProject = true

      // Step 5: Migrate calculations
      this.reportProgress('Migrating Calculations', 50, 100, 'Migrating calculations to IndexedDB...')
      const migrationResult = await this.migrateCalculations(db, existingCalculations, defaultProject.id)
      result.migratedCalculations = migrationResult.migrated
      result.errors.push(...migrationResult.errors)

      // Step 6: Verify migration
      this.reportProgress('Verifying Migration', 90, 100, 'Verifying data integrity...')
      const verification = await this.verifyMigration(db)
      if (!verification.isValid) {
        result.errors.push(...verification.issues)
        throw new Error('Migration verification failed')
      }

      // Step 7: Clean up localStorage (optional - keep backup)
      this.reportProgress('Completing Migration', 100, 100, 'Migration completed successfully!')
      
      result.success = true
      return result

    } catch (error) {
      console.error('Migration failed:', error)
      result.errors.push(`Migration failed: ${error}`)
      return result
    }
  }

  async rollbackMigration(): Promise<boolean> {
    try {
      // Restore from backup
      const backup = localStorage.getItem('metal-calculations-backup')
      if (!backup) {
        throw new Error('No backup found')
      }

      const backupData = JSON.parse(backup)
      localStorage.setItem('metal-calculations', JSON.stringify(backupData.data))

      // Clear IndexedDB
      if (this.db) {
        this.db.close()
      }
      
      // Delete IndexedDB
      const deleteReq = indexedDB.deleteDatabase(DB_NAME)
      await new Promise((resolve, reject) => {
        deleteReq.onsuccess = () => resolve(true)
        deleteReq.onerror = () => reject(deleteReq.error)
      })

      return true
    } catch (error) {
      console.error('Rollback failed:', error)
      return false
    }
  }

  async checkMigrationNeeded(): Promise<boolean> {
    try {
      // Check if IndexedDB already has data
      const db = await this.initDatabase()
      const calcCount = await db.count('calculations')
      
      if (calcCount > 0) {
        return false // Already migrated
      }

      // Check if localStorage has data to migrate
      const saved = localStorage.getItem('metal-calculations')
      return saved !== null && saved !== '[]'
    } catch (error) {
      console.error('Error checking migration status:', error)
      return false
    }
  }
}

// Utility function to run migration with progress UI
export async function runMigrationWithProgress(): Promise<MigrationResult> {
  return new Promise((resolve) => {
    const migration = new DatabaseMigration((progress) => {
      // Update progress in UI
      toast({
        title: progress.stage,
        description: `${progress.message} (${progress.progress}/${progress.total})`,
        duration: 1000,
      })
    })

    migration.performMigration().then(resolve)
  })
}

// Check if migration is needed on app startup
export async function checkAndPromptMigration(): Promise<boolean> {
  const migration = new DatabaseMigration()
  const needsMigration = await migration.checkMigrationNeeded()
  
  if (needsMigration) {
    const userConfirmed = window.confirm(
      'We need to upgrade your data storage system. This will migrate your existing calculations to a new database format. Would you like to proceed?'
    )
    
    if (userConfirmed) {
      const result = await runMigrationWithProgress()
      
      if (result.success) {
        toast({
          title: 'Migration Successful',
          description: `Migrated ${result.migratedCalculations} calculations successfully.`,
        })
        return true
      } else {
        toast({
          title: 'Migration Failed',
          description: 'Some calculations could not be migrated. Check console for details.',
          variant: 'destructive',
        })
        return false
      }
    }
  }
  
  return false
} 