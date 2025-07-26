/**
 * Integration tests for bidirectional dispatch-project material sync
 * Tests real-world scenarios with mock database implementations
 */

import {
  syncDispatchToProjectMaterials,
  syncProjectToDispatchMaterials,
  syncAllDispatchNotesForProject,
  onDispatchNoteUpdated,
  getProjectMaterialAllocationSummary
} from '../lib/dispatch-materials-sync'
import {
  ProjectMaterial,
  DispatchNote,
  DispatchMaterial,
  Project,
  ProjectMaterialStatus,
  ProjectMaterialSource,
  DispatchMaterialStatus,
  DispatchStatus
} from '../lib/types'

// In-memory database for integration testing
class MockDatabase {
  projects: Map<string, Project> = new Map()
  projectMaterials: Map<string, ProjectMaterial> = new Map()
  dispatchNotes: Map<string, DispatchNote> = new Map()
  dispatchMaterials: Map<string, DispatchMaterial> = new Map()

  // Project materials
  async getProjectMaterials(projectId: string): Promise<ProjectMaterial[]> {
    return Array.from(this.projectMaterials.values())
      .filter(m => m.projectId === projectId)
  }

  async createProjectMaterial(material: Omit<ProjectMaterial, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `pm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newMaterial: ProjectMaterial = {
      ...material,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.projectMaterials.set(id, newMaterial)
    return id
  }

  async updateProjectMaterial(id: string, updates: Partial<ProjectMaterial>): Promise<void> {
    const existing = this.projectMaterials.get(id)
    if (!existing) throw new Error('Project material not found')
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    }
    this.projectMaterials.set(id, updated)
  }

  async getProjectMaterialsBySource(
    projectId: string, 
    source: ProjectMaterialSource, 
    sourceId?: string
  ): Promise<ProjectMaterial[]> {
    return Array.from(this.projectMaterials.values())
      .filter(m => 
        m.projectId === projectId && 
        m.source === source && 
        (!sourceId || m.sourceId === sourceId)
      )
  }

  // Dispatch materials
  async getDispatchMaterialById(id: string): Promise<DispatchMaterial | null> {
    return this.dispatchMaterials.get(id) || null
  }

  async updateDispatchMaterial(id: string, updates: Partial<DispatchMaterial>): Promise<void> {
    const existing = this.dispatchMaterials.get(id)
    if (!existing) throw new Error('Dispatch material not found')
    
    const updated = { ...existing, ...updates }
    this.dispatchMaterials.set(id, updated)
  }

  async getDispatchNotesByProject(projectId: string): Promise<DispatchNote[]> {
    return Array.from(this.dispatchNotes.values())
      .filter(dn => dn.projectId === projectId)
  }

  async getProject(id: string): Promise<Project | null> {
    return this.projects.get(id) || null
  }

  // Stock management (simplified)
  async createMaterialStock(): Promise<string> {
    return `stock-${Date.now()}`
  }

  async createMaterialStockTransaction(): Promise<string> {
    return `trans-${Date.now()}`
  }

  // Utility methods for testing
  seedProject(project: Project): void {
    this.projects.set(project.id, project)
  }

  seedDispatchNote(dispatchNote: DispatchNote): void {
    this.dispatchNotes.set(dispatchNote.id, dispatchNote)
    // Also seed the dispatch materials
    dispatchNote.materials.forEach(material => {
      this.dispatchMaterials.set(material.id, material)
    })
  }

  seedProjectMaterial(material: ProjectMaterial): void {
    this.projectMaterials.set(material.id, material)
  }

  clear(): void {
    this.projects.clear()
    this.projectMaterials.clear()
    this.dispatchNotes.clear()
    this.dispatchMaterials.clear()
  }
}

// Mock the database module
const mockDb = new MockDatabase()

jest.mock('../lib/database', () => ({
  getProjectMaterials: (projectId: string) => mockDb.getProjectMaterials(projectId),
  createProjectMaterial: (material: any) => mockDb.createProjectMaterial(material),
  updateProjectMaterial: (id: string, updates: any) => mockDb.updateProjectMaterial(id, updates),
  getProjectMaterialsBySource: (projectId: string, source: any, sourceId?: string) => 
    mockDb.getProjectMaterialsBySource(projectId, source, sourceId),
  getDispatchMaterialById: (id: string) => mockDb.getDispatchMaterialById(id),
  updateDispatchMaterial: (id: string, updates: any) => mockDb.updateDispatchMaterial(id, updates),
  getDispatchNotesByProject: (projectId: string) => mockDb.getDispatchNotesByProject(projectId),
  getProject: (id: string) => mockDb.getProject(id),
  createMaterialStock: () => mockDb.createMaterialStock(),
  createMaterialStockTransaction: () => mockDb.createMaterialStockTransaction()
}))

describe('Dispatch Materials Sync - Integration Tests', () => {
  beforeEach(() => {
    mockDb.clear()
  })

  describe('Complete Material Lifecycle Integration', () => {
    it('should handle complete material lifecycle from dispatch to installation', async () => {
      // Step 1: Set up project
      const project: Project = {
        id: 'project-1',
        name: 'Steel Building Project',
        description: 'Large steel structure',
        status: 'active' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        materials: [],
        calculationIds: [],
        totalBudget: 100000,
        currency: 'USD',
        notes: '',
        tags: []
      }
      mockDb.seedProject(project)

      // Step 2: Create dispatch note with materials
      const dispatchMaterial: DispatchMaterial = {
        id: 'dm-1',
        dispatchNoteId: 'dn-1',
        materialType: 'Steel',
        profile: 'I-beam',
        grade: 'S355',
        dimensions: { height: 300, width: 150, thickness: 12 },
        quantity: 20,
        orderedQuantity: 20,
        deliveredQuantity: 20,
        unitWeight: 45.2,
        totalWeight: 904,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        unit: 'pieces',
        unitCost: 200,
        totalCost: 4000,
        currency: 'USD',
        status: DispatchMaterialStatus.PENDING,
        location: 'Loading dock',
        notes: 'Premium grade steel',
        usageHistory: []
      }

      const dispatchNote: DispatchNote = {
        id: 'dn-1',
        dispatchNumber: 'DN-2024-100',
        projectId: 'project-1',
        supplier: {
          name: 'Premium Steel Ltd',
          contact: 'orders@premiumsteel.com',
          address: '456 Industrial Ave'
        },
        materials: [dispatchMaterial],
        status: DispatchStatus.PENDING,
        date: new Date('2024-02-01'),
        expectedDeliveryDate: new Date('2024-02-10'),
        trackingNumber: 'PS-TRACK-001',
        notes: 'Urgent delivery required',
        totalValue: 4000,
        currency: 'USD',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        inspectionRequired: false,
        inspectionCompleted: false
      }
      mockDb.seedDispatchNote(dispatchNote)

      // Step 3: Sync dispatch to project materials (initial creation)
      let syncResult = await syncDispatchToProjectMaterials('project-1', dispatchNote)
      
      expect(syncResult.materialsCreated).toBe(1)
      expect(syncResult.errors).toHaveLength(0)

      // Verify project material was created correctly
      const projectMaterials = await mockDb.getProjectMaterials('project-1')
      expect(projectMaterials).toHaveLength(1)
      
      const projectMaterial = projectMaterials[0]
      expect(projectMaterial.source).toBe(ProjectMaterialSource.DISPATCH)
      expect(projectMaterial.sourceId).toBe('dm-1')
      expect(projectMaterial.status).toBe(ProjectMaterialStatus.ORDERED)

      // Step 4: Update dispatch status to arrived
      await mockDb.updateDispatchMaterial('dm-1', {
        status: DispatchMaterialStatus.ARRIVED,
        location: 'Warehouse A'
      })

      // Re-sync to update project material
      const updatedDispatchNote = { ...dispatchNote }
      updatedDispatchNote.materials[0].status = DispatchMaterialStatus.ARRIVED
      updatedDispatchNote.materials[0].location = 'Warehouse A'
      
      syncResult = await syncDispatchToProjectMaterials('project-1', updatedDispatchNote)
      expect(syncResult.materialsUpdated).toBe(1)

      // Verify project material status updated
      const updatedProjectMaterials = await mockDb.getProjectMaterials('project-1')
      expect(updatedProjectMaterials[0].status).toBe(ProjectMaterialStatus.DELIVERED)
      expect(updatedProjectMaterials[0].location).toBe('Warehouse A')

      // Step 5: Project team installs material
      await mockDb.updateProjectMaterial(projectMaterial.id, {
        status: ProjectMaterialStatus.INSTALLED,
        installationDate: new Date('2024-02-15'),
        notes: 'Installed in main structure'
      })

      // Step 6: Sync back to dispatch material
      const installedProjectMaterial = await mockDb.getProjectMaterials('project-1')
      await syncProjectToDispatchMaterials(installedProjectMaterial[0], {
        updateTimestamps: true
      })

      // Verify dispatch material was updated
      const finalDispatchMaterial = await mockDb.getDispatchMaterialById('dm-1')
      expect(finalDispatchMaterial?.status).toBe(DispatchMaterialStatus.USED)
      expect(finalDispatchMaterial?.usageHistory).toHaveLength(1)
      expect(finalDispatchMaterial?.usageHistory?.[0].notes).toContain('Used in project')
    })

    it('should handle multiple materials in single dispatch note', async () => {
      // Create dispatch note with multiple materials
      const materials: DispatchMaterial[] = [
        {
          id: 'dm-1',
          dispatchNoteId: 'dn-1',
          materialType: 'Steel',
          profile: 'I-beam',
          grade: 'S355',
          dimensions: { height: 200, width: 100 },
          quantity: 10,
          orderedQuantity: 10,
          deliveredQuantity: 10,
          unitWeight: 25,
          totalWeight: 250,
          lengthUnit: 'mm',
          weightUnit: 'kg',
          unit: 'pieces',
          status: DispatchMaterialStatus.ARRIVED,
          usageHistory: []
        },
        {
          id: 'dm-2',
          dispatchNoteId: 'dn-1',
          materialType: 'Steel',
          profile: 'Channel',
          grade: 'S275',
          dimensions: { height: 150, width: 75 },
          quantity: 15,
          orderedQuantity: 15,
          deliveredQuantity: 15,
          unitWeight: 18,
          totalWeight: 270,
          lengthUnit: 'mm',
          weightUnit: 'kg',
          unit: 'pieces',
          status: DispatchMaterialStatus.ARRIVED,
          usageHistory: []
        }
      ]

      const dispatchNote: DispatchNote = {
        id: 'dn-1',
        dispatchNumber: 'DN-2024-200',
        projectId: 'project-1',
        supplier: {
          name: 'Multi Steel Corp',
          contact: 'sales@multisteel.com'
        },
        materials,
        status: DispatchStatus.PROCESSED,
        date: new Date(),
        expectedDeliveryDate: new Date(),
        actualDeliveryDate: new Date(),
        totalValue: 5000,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      mockDb.seedDispatchNote(dispatchNote)

      // Sync all materials
      const result = await syncDispatchToProjectMaterials('project-1', dispatchNote)

      expect(result.materialsCreated).toBe(2)
      expect(result.errors).toHaveLength(0)

      // Verify both materials were created
      const projectMaterials = await mockDb.getProjectMaterials('project-1')
      expect(projectMaterials).toHaveLength(2)
      
      // Check specific material details
      const iBeamMaterial = projectMaterials.find(m => m.profile === 'I-beam')
      const channelMaterial = projectMaterials.find(m => m.profile === 'Channel')
      
      expect(iBeamMaterial).toBeDefined()
      expect(channelMaterial).toBeDefined()
      expect(iBeamMaterial?.quantity).toBe(10)
      expect(channelMaterial?.quantity).toBe(15)
    })
  })

  describe('Conflict Resolution', () => {
    it('should handle quantity mismatches gracefully', async () => {
      // Set up initial materials
      const dispatchMaterial: DispatchMaterial = {
        id: 'dm-1',
        dispatchNoteId: 'dn-1',
        materialType: 'Steel',
        profile: 'I-beam',
        grade: 'S355',
        dimensions: { height: 200, width: 100 },
        quantity: 10,
        orderedQuantity: 10,
        deliveredQuantity: 8, // Partial delivery
        unitWeight: 25,
        totalWeight: 200, // Adjusted for actual delivered
        lengthUnit: 'mm',
        weightUnit: 'kg',
        unit: 'pieces',
        status: DispatchMaterialStatus.ARRIVED,
        usageHistory: []
      }

      const projectMaterial: ProjectMaterial = {
        id: 'pm-1',
        projectId: 'project-1',
        materialName: 'Steel I-Beam',
        profile: 'I-beam',
        grade: 'S355',
        dimensions: { height: 200, width: 100 },
        quantity: 10, // Project expects full quantity
        unitWeight: 25,
        totalWeight: 250, // Based on expected quantity
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.ORDERED,
        source: ProjectMaterialSource.DISPATCH,
        sourceId: 'dm-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDb.seedDispatchNote({
        id: 'dn-1',
        dispatchNumber: 'DN-2024-300',
        projectId: 'project-1',
        supplier: { name: 'Test Supplier', contact: 'test@supplier.com' },
        materials: [dispatchMaterial],
        status: DispatchStatus.PROCESSED,
        date: new Date(),
        expectedDeliveryDate: new Date(),
        actualDeliveryDate: new Date(),
        totalValue: 2000,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      mockDb.seedProjectMaterial(projectMaterial)

      // Sync with preserveQuantityDifferences enabled
      await syncProjectToDispatchMaterials(projectMaterial, {
        preserveQuantityDifferences: true
      })

      // Verify dispatch material quantity wasn't overwritten
      const updatedDispatchMaterial = await mockDb.getDispatchMaterialById('dm-1')
      expect(updatedDispatchMaterial?.deliveredQuantity).toBe(8)

      // Sync with preserveQuantityDifferences disabled
      await syncProjectToDispatchMaterials(projectMaterial, {
        preserveQuantityDifferences: false
      })

      // Now quantity should be updated
      const finalDispatchMaterial = await mockDb.getDispatchMaterialById('dm-1')
      expect(finalDispatchMaterial?.deliveredQuantity).toBe(10)
    })

    it('should handle incompatible material specifications', async () => {
      const dispatchMaterial: DispatchMaterial = {
        id: 'dm-1',
        dispatchNoteId: 'dn-1',
        materialType: 'Steel',
        profile: 'Channel', // Different profile
        grade: 'S355',
        dimensions: { height: 200, width: 100 },
        quantity: 10,
        orderedQuantity: 10,
        deliveredQuantity: 10,
        unitWeight: 25,
        totalWeight: 250,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        unit: 'pieces',
        status: DispatchMaterialStatus.ARRIVED,
        usageHistory: []
      }

      const projectMaterial: ProjectMaterial = {
        id: 'pm-1',
        projectId: 'project-1',
        materialName: 'Steel I-Beam',
        profile: 'I-beam', // Different profile
        grade: 'S355',
        dimensions: { height: 200, width: 100 },
        quantity: 10,
        unitWeight: 25,
        totalWeight: 250,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.DELIVERED,
        source: ProjectMaterialSource.DISPATCH,
        sourceId: 'dm-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDb.seedDispatchNote({
        id: 'dn-1',
        dispatchNumber: 'DN-2024-400',
        projectId: 'project-1',
        supplier: { name: 'Test Supplier', contact: 'test@supplier.com' },
        materials: [dispatchMaterial],
        status: DispatchStatus.PROCESSED,
        date: new Date(),
        totalValue: 2000,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Sync should detect incompatibility and skip
      await syncProjectToDispatchMaterials(projectMaterial, {
        validateBeforeSync: true
      })

      // Verify dispatch material wasn't updated due to validation failure
      const unchangedDispatchMaterial = await mockDb.getDispatchMaterialById('dm-1')
      expect(unchangedDispatchMaterial?.status).toBe(DispatchMaterialStatus.ARRIVED)
    })
  })

  describe('Project Material Allocation Summary', () => {
    it('should calculate accurate allocation summary', async () => {
      // Set up project with budget
      const project: Project = {
        id: 'project-1',
        name: 'Test Project',
        description: 'Test',
        status: 'active' as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        materials: [],
        calculationIds: [],
        totalBudget: 10000,
        currency: 'USD',
        notes: '',
        tags: []
      }
      mockDb.seedProject(project)

      // Create various project materials in different states
      const materials: ProjectMaterial[] = [
        {
          id: 'pm-1',
          projectId: 'project-1',
          materialName: 'Steel I-Beam',
          profile: 'I-beam',
          grade: 'S355',
          dimensions: {},
          quantity: 10,
          unitWeight: 25,
          totalWeight: 250,
          unitCost: 100,
          totalCost: 1000,
          lengthUnit: 'mm',
          weightUnit: 'kg',
          status: ProjectMaterialStatus.REQUIRED,
          source: ProjectMaterialSource.MANUAL,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'pm-2',
          projectId: 'project-1',
          materialName: 'Steel Channel',
          profile: 'Channel',
          grade: 'S275',
          dimensions: {},
          quantity: 15,
          unitWeight: 18,
          totalWeight: 270,
          unitCost: 80,
          totalCost: 1200,
          lengthUnit: 'mm',
          weightUnit: 'kg',
          status: ProjectMaterialStatus.DELIVERED,
          source: ProjectMaterialSource.DISPATCH,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'pm-3',
          projectId: 'project-1',
          materialName: 'Steel Angle',
          profile: 'Angle',
          grade: 'S235',
          dimensions: {},
          quantity: 20,
          unitWeight: 12,
          totalWeight: 240,
          unitCost: 60,
          totalCost: 1200,
          lengthUnit: 'mm',
          weightUnit: 'kg',
          status: ProjectMaterialStatus.INSTALLED,
          source: ProjectMaterialSource.DISPATCH,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      materials.forEach(material => mockDb.seedProjectMaterial(material))

      // Generate allocation summary
      const summary = await getProjectMaterialAllocationSummary('project-1')

      expect(summary.totalRequired).toBe(10) // Only REQUIRED materials
      expect(summary.totalDelivered).toBe(35) // DELIVERED + INSTALLED
      expect(summary.totalInstalled).toBe(20) // Only INSTALLED materials
      expect(summary.totalWeight).toBe(760) // Sum of all weights
      expect(summary.totalCost).toBe(3400) // Sum of all costs

      // Check cost analysis
      expect(summary.costAnalysis.budgetedCost).toBe(10000)
      expect(summary.costAnalysis.actualCost).toBe(3400)
      expect(summary.costAnalysis.variance).toBe(-6600) // Under budget
      expect(summary.costAnalysis.variancePercentage).toBe(-66) // 66% under budget

      // Check material shortfalls
      expect(summary.materialShortfalls).toHaveLength(1)
      expect(summary.materialShortfalls[0].materialName).toBe('Steel I-Beam')
      expect(summary.materialShortfalls[0].shortfall).toBe(10)
    })
  })

  describe('Auto-sync Triggers', () => {
    it('should auto-sync when dispatch note is updated', async () => {
      const dispatchNote: DispatchNote = {
        id: 'dn-1',
        dispatchNumber: 'DN-2024-500',
        projectId: 'project-1',
        supplier: { name: 'Auto Sync Supplier', contact: 'auto@sync.com' },
        materials: [{
          id: 'dm-1',
          dispatchNoteId: 'dn-1',
          materialType: 'Steel',
          profile: 'I-beam',
          grade: 'S355',
          dimensions: { height: 200, width: 100 },
          quantity: 5,
          orderedQuantity: 5,
          deliveredQuantity: 5,
          unitWeight: 25,
          totalWeight: 125,
          lengthUnit: 'mm',
          weightUnit: 'kg',
          unit: 'pieces',
          status: DispatchMaterialStatus.ARRIVED,
          usageHistory: []
        }],
        status: DispatchStatus.PROCESSED,
        date: new Date(),
        expectedDeliveryDate: new Date(),
        actualDeliveryDate: new Date(),
        totalValue: 1000,
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockDb.seedDispatchNote(dispatchNote)

      // Trigger auto-sync
      await onDispatchNoteUpdated(dispatchNote)

      // Verify project material was created
      const projectMaterials = await mockDb.getProjectMaterials('project-1')
      expect(projectMaterials).toHaveLength(1)
      expect(projectMaterials[0].source).toBe(ProjectMaterialSource.DISPATCH)
      expect(projectMaterials[0].status).toBe(ProjectMaterialStatus.DELIVERED)
    })
  })

  describe('Bulk Operations', () => {
    it('should sync all dispatch notes for a project', async () => {
      // Create multiple dispatch notes
      const dispatchNotes: DispatchNote[] = [
        {
          id: 'dn-1',
          dispatchNumber: 'DN-2024-600',
          projectId: 'project-1',
          supplier: { name: 'Supplier 1', contact: 'sup1@test.com' },
          materials: [{
            id: 'dm-1',
            dispatchNoteId: 'dn-1',
            materialType: 'Steel',
            profile: 'I-beam',
            grade: 'S355',
            dimensions: {},
            quantity: 10,
            orderedQuantity: 10,
            deliveredQuantity: 10,
            unitWeight: 25,
            totalWeight: 250,
            lengthUnit: 'mm',
            weightUnit: 'kg',
            unit: 'pieces',
            status: DispatchMaterialStatus.ARRIVED,
            usageHistory: []
          }],
          status: DispatchStatus.PROCESSED,
          date: new Date(),
          totalValue: 2000,
          currency: 'USD',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'dn-2',
          dispatchNumber: 'DN-2024-601',
          projectId: 'project-1',
          supplier: { name: 'Supplier 2', contact: 'sup2@test.com' },
          materials: [{
            id: 'dm-2',
            dispatchNoteId: 'dn-2',
            materialType: 'Steel',
            profile: 'Channel',
            grade: 'S275',
            dimensions: {},
            quantity: 15,
            orderedQuantity: 15,
            deliveredQuantity: 15,
            unitWeight: 18,
            totalWeight: 270,
            lengthUnit: 'mm',
            weightUnit: 'kg',
            unit: 'pieces',
            status: DispatchMaterialStatus.ARRIVED,
            usageHistory: []
          }],
          status: DispatchStatus.PROCESSED,
          date: new Date(),
          totalValue: 1500,
          currency: 'USD',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      dispatchNotes.forEach(dn => mockDb.seedDispatchNote(dn))

      // Sync all dispatch notes
      const result = await syncAllDispatchNotesForProject('project-1')

      expect(result.materialsCreated).toBe(2)
      expect(result.materialsUpdated).toBe(0)
      expect(result.errors).toHaveLength(0)

      // Verify all materials were created
      const projectMaterials = await mockDb.getProjectMaterials('project-1')
      expect(projectMaterials).toHaveLength(2)
    })
  })
})