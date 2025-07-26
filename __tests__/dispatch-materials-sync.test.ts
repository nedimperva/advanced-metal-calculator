/**
 * Comprehensive tests for bidirectional dispatch-project material sync
 */

import {
  syncDispatchToProjectMaterials,
  syncProjectToDispatchMaterials,
  syncProjectToDispatchMaterialsWithTransaction,
  batchSyncProjectToDispatchMaterials,
  getProjectMaterialAllocationSummary,
  onDispatchNoteUpdated
} from '../lib/dispatch-materials-sync'
import {
  ProjectMaterial,
  DispatchNote,
  DispatchMaterial,
  ProjectMaterialStatus,
  ProjectMaterialSource,
  DispatchMaterialStatus,
  DispatchStatus
} from '../lib/types'

// Mock the database functions
jest.mock('../lib/database', () => ({
  getProjectMaterials: jest.fn(),
  createProjectMaterial: jest.fn(),
  updateProjectMaterial: jest.fn(),
  getProjectMaterialsBySource: jest.fn(),
  getDispatchNotesByProject: jest.fn(),
  getDispatchMaterialsByDispatch: jest.fn(),
  updateDispatchMaterial: jest.fn(),
  getDispatchMaterialById: jest.fn(),
  createMaterialStock: jest.fn(),
  createMaterialStockTransaction: jest.fn(),
  getProject: jest.fn()
}))

describe('Dispatch Materials Sync', () => {
  let mockProjectMaterial: ProjectMaterial
  let mockDispatchNote: DispatchNote
  let mockDispatchMaterial: DispatchMaterial

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mock project material
    mockProjectMaterial = {
      id: 'pm-1',
      projectId: 'project-1',
      materialCatalogId: undefined,
      materialName: 'Steel I-Beam',
      profile: 'I-beam',
      grade: 'S355',
      dimensions: { height: 200, width: 100, thickness: 10 },
      quantity: 10,
      unitWeight: 25.5,
      totalWeight: 255,
      unitCost: 150,
      totalCost: 1500,
      lengthUnit: 'mm',
      weightUnit: 'kg',
      status: ProjectMaterialStatus.DELIVERED,
      supplier: 'Steel Corp',
      orderDate: new Date('2024-01-15'),
      deliveryDate: new Date('2024-01-25'),
      location: 'Warehouse A',
      notes: 'Good quality material',
      trackingNumber: 'TRACK123',
      source: ProjectMaterialSource.DISPATCH,
      sourceId: 'dm-1',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-25')
    }

    // Create mock dispatch material
    mockDispatchMaterial = {
      id: 'dm-1',
      dispatchNoteId: 'dn-1',
      materialType: 'Steel',
      profile: 'I-beam',
      grade: 'S355',
      dimensions: { height: 200, width: 100, thickness: 10 },
      quantity: 10,
      orderedQuantity: 10,
      deliveredQuantity: 10,
      unitWeight: 25.5,
      totalWeight: 255,
      lengthUnit: 'mm',
      weightUnit: 'kg',
      unit: 'pieces',
      unitCost: 150,
      totalCost: 1500,
      currency: 'USD',
      status: DispatchMaterialStatus.ARRIVED,
      location: 'Warehouse A',
      notes: 'Delivered in good condition',
      inspectionDate: new Date('2024-01-25'),
      usageHistory: []
    }

    // Create mock dispatch note
    mockDispatchNote = {
      id: 'dn-1',
      dispatchNumber: 'DN-2024-001',
      projectId: 'project-1',
      supplier: {
        name: 'Steel Corp',
        contact: 'contact@steelcorp.com',
        address: '123 Steel St'
      },
      materials: [mockDispatchMaterial],
      status: DispatchStatus.DELIVERED,
      date: new Date('2024-01-20'),
      expectedDeliveryDate: new Date('2024-01-25'),
      actualDeliveryDate: new Date('2024-01-25'),
      orderNumber: 'ORD-001',
      trackingNumber: 'TRACK123',
      notes: 'Regular delivery',
      totalValue: 1500,
      currency: 'USD',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-25')
    }
  })

  describe('syncDispatchToProjectMaterials', () => {
    it('should create new project materials from dispatch materials', async () => {
      const { getProjectMaterialsBySource, createProjectMaterial } = require('../lib/database')
      
      getProjectMaterialsBySource.mockResolvedValue([])
      createProjectMaterial.mockResolvedValue('pm-new')

      const result = await syncDispatchToProjectMaterials('project-1', mockDispatchNote)

      expect(result.materialsCreated).toBe(1)
      expect(result.materialsUpdated).toBe(0)
      expect(result.materialsSkipped).toBe(0)
      expect(result.errors).toHaveLength(0)
      expect(createProjectMaterial).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'project-1',
          materialName: 'Steel S355',
          profile: 'I-beam',
          source: ProjectMaterialSource.DISPATCH,
          sourceId: 'dm-1'
        })
      )
    })

    it('should update existing project materials', async () => {
      const { getProjectMaterialsBySource, updateProjectMaterial } = require('../lib/database')
      
      getProjectMaterialsBySource.mockResolvedValue([mockProjectMaterial])
      updateProjectMaterial.mockResolvedValue(undefined)

      const result = await syncDispatchToProjectMaterials('project-1', mockDispatchNote, {
        updateExisting: true,
        syncStatus: true
      })

      expect(result.materialsCreated).toBe(0)
      expect(result.materialsUpdated).toBe(1)
      expect(result.materialsSkipped).toBe(0)
      expect(updateProjectMaterial).toHaveBeenCalledWith(
        'pm-1',
        expect.objectContaining({
          status: ProjectMaterialStatus.DELIVERED
        })
      )
    })

    it('should handle sync errors gracefully', async () => {
      const { getProjectMaterialsBySource } = require('../lib/database')
      
      getProjectMaterialsBySource.mockRejectedValue(new Error('Database error'))

      const result = await syncDispatchToProjectMaterials('project-1', mockDispatchNote)

      expect(result.materialsCreated).toBe(0)
      expect(result.materialsUpdated).toBe(0)
      expect(result.materialsSkipped).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Database error')
    })
  })

  describe('syncProjectToDispatchMaterials', () => {
    it('should sync project material status to dispatch material', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      getDispatchMaterialById.mockResolvedValue(mockDispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      // Update project material to installed status
      const updatedProjectMaterial = {
        ...mockProjectMaterial,
        status: ProjectMaterialStatus.INSTALLED
      }

      await syncProjectToDispatchMaterials(updatedProjectMaterial)

      expect(getDispatchMaterialById).toHaveBeenCalledWith('dm-1')
      expect(updateDispatchMaterial).toHaveBeenCalledWith('dm-1', 
        expect.objectContaining({
          status: DispatchMaterialStatus.USED
        })
      )
    })

    it('should not sync materials not from dispatch', async () => {
      const nonDispatchMaterial = {
        ...mockProjectMaterial,
        source: ProjectMaterialSource.MANUAL,
        sourceId: undefined
      }

      await syncProjectToDispatchMaterials(nonDispatchMaterial)

      const { getDispatchMaterialById } = require('../lib/database')
      expect(getDispatchMaterialById).not.toHaveBeenCalled()
    })

    it('should validate sync compatibility', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      // Create incompatible dispatch material (different profile)
      const incompatibleDispatchMaterial = {
        ...mockDispatchMaterial,
        profile: 'Channel'
      }
      
      getDispatchMaterialById.mockResolvedValue(incompatibleDispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      // Should not throw but should skip sync due to validation failure
      await syncProjectToDispatchMaterials(mockProjectMaterial, {
        validateBeforeSync: true
      })

      expect(updateDispatchMaterial).not.toHaveBeenCalled()
    })

    it('should combine notes when syncing', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      getDispatchMaterialById.mockResolvedValue(mockDispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      const projectMaterialWithNotes = {
        ...mockProjectMaterial,
        notes: 'Project specific notes'
      }

      await syncProjectToDispatchMaterials(projectMaterialWithNotes)

      expect(updateDispatchMaterial).toHaveBeenCalledWith('dm-1',
        expect.objectContaining({
          notes: expect.stringContaining('Project sync: Project specific notes')
        })
      )
    })

    it('should update usage history when material is used', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      getDispatchMaterialById.mockResolvedValue(mockDispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      const usedProjectMaterial = {
        ...mockProjectMaterial,
        status: ProjectMaterialStatus.INSTALLED
      }

      await syncProjectToDispatchMaterials(usedProjectMaterial, {
        updateTimestamps: true
      })

      expect(updateDispatchMaterial).toHaveBeenCalledWith('dm-1',
        expect.objectContaining({
          usageHistory: expect.arrayContaining([
            expect.objectContaining({
              projectId: 'project-1',
              quantity: 10,
              notes: expect.stringContaining('Used in project')
            })
          ])
        })
      )
    })
  })

  describe('syncProjectToDispatchMaterialsWithTransaction', () => {
    it('should complete transaction successfully', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      getDispatchMaterialById.mockResolvedValue(mockDispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      const result = await syncProjectToDispatchMaterialsWithTransaction(mockProjectMaterial)

      expect(result.success).toBe(true)
      expect(result.transactionId).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('should handle sync failure with rollback', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      getDispatchMaterialById.mockResolvedValue(mockDispatchMaterial)
      updateDispatchMaterial
        .mockRejectedValueOnce(new Error('Sync failed'))
        .mockResolvedValueOnce(undefined) // Rollback succeeds

      const result = await syncProjectToDispatchMaterialsWithTransaction(mockProjectMaterial, {
        enableRollback: true
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.rollbackRequired).toBe(false) // Rollback completed
      expect(updateDispatchMaterial).toHaveBeenCalledTimes(2) // Original + rollback
    })

    it('should handle rollback failure', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      getDispatchMaterialById.mockResolvedValue(mockDispatchMaterial)
      updateDispatchMaterial.mockRejectedValue(new Error('Database error'))

      const result = await syncProjectToDispatchMaterialsWithTransaction(mockProjectMaterial, {
        enableRollback: true
      })

      expect(result.success).toBe(false)
      expect(result.error?.recoverable).toBe(false)
    })
  })

  describe('batchSyncProjectToDispatchMaterials', () => {
    it('should sync multiple materials successfully', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      const materials = [
        mockProjectMaterial,
        { ...mockProjectMaterial, id: 'pm-2', sourceId: 'dm-2' }
      ]

      getDispatchMaterialById.mockResolvedValue(mockDispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      const result = await batchSyncProjectToDispatchMaterials(materials)

      expect(result.totalProcessed).toBe(2)
      expect(result.successful).toHaveLength(2)
      expect(result.failed).toHaveLength(0)
    })

    it('should continue on error when specified', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      const materials = [
        mockProjectMaterial,
        { ...mockProjectMaterial, id: 'pm-2', sourceId: 'dm-2' }
      ]

      getDispatchMaterialById.mockResolvedValue(mockDispatchMaterial)
      updateDispatchMaterial
        .mockRejectedValueOnce(new Error('First sync failed'))
        .mockResolvedValueOnce(undefined)

      const result = await batchSyncProjectToDispatchMaterials(materials, {
        continueOnError: true,
        enableRollback: false
      })

      expect(result.totalProcessed).toBe(2)
      expect(result.successful).toHaveLength(1)
      expect(result.failed).toHaveLength(1)
    })

    it('should stop on error when specified', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      const materials = [
        mockProjectMaterial,
        { ...mockProjectMaterial, id: 'pm-2', sourceId: 'dm-2' }
      ]

      getDispatchMaterialById.mockResolvedValue(mockDispatchMaterial)
      updateDispatchMaterial.mockRejectedValue(new Error('Sync failed'))

      const result = await batchSyncProjectToDispatchMaterials(materials, {
        continueOnError: false,
        enableRollback: false
      })

      expect(result.totalProcessed).toBe(1)
      expect(result.successful).toHaveLength(0)
      expect(result.failed).toHaveLength(1)
    })
  })

  describe('Status mapping validation', () => {
    it('should prevent status regression', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      // Dispatch material is already in USED status
      const usedDispatchMaterial = {
        ...mockDispatchMaterial,
        status: DispatchMaterialStatus.USED
      }
      
      getDispatchMaterialById.mockResolvedValue(usedDispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      // Try to sync project material with DELIVERED status (regression)
      const deliveredProjectMaterial = {
        ...mockProjectMaterial,
        status: ProjectMaterialStatus.DELIVERED
      }

      await syncProjectToDispatchMaterials(deliveredProjectMaterial)

      // Should not update status due to regression prevention
      expect(updateDispatchMaterial).not.toHaveBeenCalledWith('dm-1',
        expect.objectContaining({
          status: DispatchMaterialStatus.ARRIVED
        })
      )
    })

    it('should allow status progression', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      // Dispatch material is in ARRIVED status
      const arrivedDispatchMaterial = {
        ...mockDispatchMaterial,
        status: DispatchMaterialStatus.ARRIVED
      }
      
      getDispatchMaterialById.mockResolvedValue(arrivedDispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      // Project material progresses to INSTALLED
      const installedProjectMaterial = {
        ...mockProjectMaterial,
        status: ProjectMaterialStatus.INSTALLED
      }

      await syncProjectToDispatchMaterials(installedProjectMaterial)

      expect(updateDispatchMaterial).toHaveBeenCalledWith('dm-1',
        expect.objectContaining({
          status: DispatchMaterialStatus.USED
        })
      )
    })
  })

  describe('Integration scenarios', () => {
    it('should handle network failure scenarios gracefully', async () => {
      const { getDispatchMaterialById } = require('../lib/database')
      
      // Simulate network timeout
      getDispatchMaterialById.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      )

      const result = await syncProjectToDispatchMaterialsWithTransaction(mockProjectMaterial, {
        enableRollback: true
      })

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('Network timeout')
    })

    it('should handle concurrent sync operations', async () => {
      const { getDispatchMaterialById, updateDispatchMaterial } = require('../lib/database')
      
      getDispatchMaterialById.mockResolvedValue(mockDispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      // Simulate concurrent syncs
      const syncPromises = Array.from({ length: 5 }, () =>
        syncProjectToDispatchMaterialsWithTransaction(mockProjectMaterial)
      )

      const results = await Promise.all(syncPromises)

      // All should succeed (basic concurrency test)
      expect(results.every(r => r.success)).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle missing dispatch material gracefully', async () => {
      const { getDispatchMaterialById } = require('../lib/database')
      
      getDispatchMaterialById.mockResolvedValue(null)

      const result = await syncProjectToDispatchMaterialsWithTransaction(mockProjectMaterial)

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('not found')
      expect(result.error?.recoverable).toBe(false)
    })

    it('should handle materials with no source ID', async () => {
      const materialWithoutSource = {
        ...mockProjectMaterial,
        sourceId: undefined
      }

      // Should return early without error
      await expect(syncProjectToDispatchMaterials(materialWithoutSource)).resolves.toBeUndefined()
    })

    it('should handle empty batch sync', async () => {
      const result = await batchSyncProjectToDispatchMaterials([])

      expect(result.totalProcessed).toBe(0)
      expect(result.successful).toHaveLength(0)
      expect(result.failed).toHaveLength(0)
    })
  })
})

// Test utilities for creating mock data
export const createMockProjectMaterial = (overrides: Partial<ProjectMaterial> = {}): ProjectMaterial => ({
  id: 'pm-test',
  projectId: 'project-test',
  materialCatalogId: undefined,
  materialName: 'Test Material',
  profile: 'I-beam',
  grade: 'S355',
  dimensions: { height: 200, width: 100 },
  quantity: 1,
  unitWeight: 25,
  totalWeight: 25,
  lengthUnit: 'mm',
  weightUnit: 'kg',
  status: ProjectMaterialStatus.REQUIRED,
  source: ProjectMaterialSource.DISPATCH,
  sourceId: 'dm-test',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

export const createMockDispatchMaterial = (overrides: Partial<DispatchMaterial> = {}): DispatchMaterial => ({
  id: 'dm-test',
  dispatchNoteId: 'dn-test',
  materialType: 'Steel',
  profile: 'I-beam',
  grade: 'S355',
  dimensions: { height: 200, width: 100 },
  quantity: 1,
  orderedQuantity: 1,
  deliveredQuantity: 1,
  unitWeight: 25,
  totalWeight: 25,
  lengthUnit: 'mm',
  weightUnit: 'kg',
  unit: 'pieces',
  status: DispatchMaterialStatus.PENDING,
  usageHistory: [],
  ...overrides
})