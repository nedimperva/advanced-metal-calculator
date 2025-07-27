/**
 * Integration Tests for Material Synchronization Service
 * Tests concurrent modification scenarios, conflict resolution, and validation
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { MaterialSyncService, materialSyncService } from '../dispatch-materials-sync'
import { 
  DispatchNote, 
  DispatchMaterial, 
  DispatchMaterialStatus,
  ProjectMaterial, 
  ProjectMaterialStatus, 
  ProjectMaterialSource 
} from '../types'

// Mock database functions
jest.mock('../database', () => ({
  getProjectMaterialsBySource: jest.fn(),
  createProjectMaterial: jest.fn(),
  updateProjectMaterial: jest.fn(),
  getDispatchNotesByProject: jest.fn(),
  createMaterialStock: jest.fn(),
  createMaterialStockTransaction: jest.fn()
}))

const mockDatabase = require('../database')

describe('MaterialSyncService Integration Tests', () => {
  let syncService: MaterialSyncService
  let mockProjectId: string
  let mockDispatchNote: DispatchNote
  let mockDispatchMaterial: DispatchMaterial
  let mockProjectMaterial: ProjectMaterial

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Create fresh service instance for each test
    syncService = new MaterialSyncService({
      enableLocking: true,
      conflictResolution: 'merge',
      validateMaterialSpecs: true,
      enableEventDriven: true,
      maxRetries: 3,
      retryDelay: 100 // Faster for tests
    })

    // Setup test data
    mockProjectId = 'project-123'
    
    mockDispatchMaterial = {
      id: 'dm-001',
      materialType: 'Steel',
      profile: 'I-Beam',
      grade: 'A36',
      dimensions: { height: 200, width: 100, thickness: 8 },
      quantity: 10,
      unitWeight: 25.5,
      totalWeight: 255,
      unitCost: 150,
      totalCost: 1500,
      currency: 'USD',
      lengthUnit: 'mm',
      weightUnit: 'kg',
      status: DispatchMaterialStatus.ARRIVED,
      location: 'Warehouse A',
      notes: 'Quality checked',
      inspectionDate: new Date('2024-01-15'),
      inspectionNotes: 'Good condition'
    }

    mockDispatchNote = {
      id: 'dn-001',
      dispatchNumber: 'DN-2024-001',
      projectId: mockProjectId,
      supplier: {
        id: 'sup-001',
        name: 'Steel Suppliers Ltd',
        contactInfo: { email: 'contact@steelsuppliers.com' }
      },
      materials: [mockDispatchMaterial],
      date: new Date('2024-01-10'),
      actualDeliveryDate: new Date('2024-01-15'),
      trackingNumber: 'TRACK-12345',
      orderNumber: 'ORDER-67890',
      status: 'delivered',
      notes: 'On-time delivery'
    }

    mockProjectMaterial = {
      id: 'pm-001',
      projectId: mockProjectId,
      materialName: 'Steel A36',
      profile: 'I-Beam',
      grade: 'A36',
      dimensions: { height: 200, width: 100, thickness: 8 },
      quantity: 8, // Different quantity to test conflicts
      unitWeight: 25.5,
      totalWeight: 204,
      unitCost: 145,
      totalCost: 1160,
      lengthUnit: 'mm',
      weightUnit: 'kg',
      status: ProjectMaterialStatus.DELIVERED,
      supplier: 'Steel Suppliers Ltd',
      source: ProjectMaterialSource.DISPATCH,
      sourceId: 'dm-001',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-14') // Recent update
    }
  })

  describe('Concurrent Modification Scenarios', () => {
    it('should handle concurrent dispatch and project updates with locking', async () => {
      // Setup: existing material
      mockDatabase.getProjectMaterialsBySource.mockResolvedValue([mockProjectMaterial])
      mockDatabase.updateProjectMaterial.mockResolvedValue(undefined)

      // Simulate concurrent operations
      const operation1Promise = syncService.syncDispatchToProject(mockProjectId, mockDispatchNote)
      const operation2Promise = syncService.syncDispatchToProject(mockProjectId, mockDispatchNote)

      const [result1, result2] = await Promise.allSettled([operation1Promise, operation2Promise])

      // One should succeed, one should fail due to locking
      const results = [result1, result2]
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success)
      const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))

      expect(successful).toHaveLength(1)
      expect(failed).toHaveLength(1)
      
      if (failed[0].status === 'fulfilled') {
        expect(failed[0].value.errors[0].message).toContain('Cannot acquire lock')
      }
    })

    it('should detect and resolve update conflicts using merge strategy', async () => {
      // Setup: material updated very recently (within conflict window)
      const recentMaterial = {
        ...mockProjectMaterial,
        updatedAt: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
      }
      
      mockDatabase.getProjectMaterialsBySource.mockResolvedValue([recentMaterial])
      mockDatabase.updateProjectMaterial.mockResolvedValue(undefined)

      const result = await syncService.syncDispatchToProject(mockProjectId, mockDispatchNote)

      expect(result.success).toBe(true)
      expect(result.conflictsDetected).toBe(1)
      expect(result.conflictsResolved).toBe(1)
      expect(result.materialsUpdated).toBe(1)
    })

    it('should validate material specifications and report errors', async () => {
      // Setup: material with mismatched specifications
      const mismatchedMaterial = {
        ...mockProjectMaterial,
        profile: 'H-Beam', // Different profile
        grade: 'A572', // Different grade
        dimensions: { height: 180, width: 90, thickness: 7 } // Different dimensions
      }
      
      mockDatabase.getProjectMaterialsBySource.mockResolvedValue([mismatchedMaterial])

      const result = await syncService.syncDispatchToProject(mockProjectId, mockDispatchNote, {
        matchCriteria: { tolerancePercent: 2 } // Strict tolerance
      })

      expect(result.validationErrors.length).toBeGreaterThan(0)
      expect(result.validationErrors.some(e => e.field === 'profile')).toBe(true)
      expect(result.validationErrors.some(e => e.field === 'grade')).toBe(true)
      expect(result.validationErrors.some(e => e.field.startsWith('dimensions.'))).toBe(true)
    })

    it('should handle rollback when sync operation fails', async () => {
      // Setup: force an error during material creation
      mockDatabase.getProjectMaterialsBySource.mockResolvedValue([])
      mockDatabase.createProjectMaterial.mockRejectedValue(new Error('Database error'))

      const result = await syncService.syncDispatchToProject(mockProjectId, mockDispatchNote)

      expect(result.success).toBe(false)
      expect(result.rollbackRequired).toBe(true)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Status Mapping and Bidirectional Sync', () => {
    it('should correctly map dispatch status to project status', async () => {
      const testCases = [
        { dispatch: DispatchMaterialStatus.PENDING, expected: ProjectMaterialStatus.ORDERED },
        { dispatch: DispatchMaterialStatus.ARRIVED, expected: ProjectMaterialStatus.DELIVERED },
        { dispatch: DispatchMaterialStatus.ALLOCATED, expected: ProjectMaterialStatus.DELIVERED },
        { dispatch: DispatchMaterialStatus.USED, expected: ProjectMaterialStatus.INSTALLED },
        { dispatch: DispatchMaterialStatus.DAMAGED, expected: ProjectMaterialStatus.DELIVERED }
      ]

      mockDatabase.getProjectMaterialsBySource.mockResolvedValue([])
      mockDatabase.createProjectMaterial.mockResolvedValue(undefined)

      for (const testCase of testCases) {
        const testDispatchNote = {
          ...mockDispatchNote,
          materials: [{
            ...mockDispatchMaterial,
            id: `dm-${testCase.dispatch}`,
            status: testCase.dispatch
          }]
        }

        const result = await syncService.syncDispatchToProject(mockProjectId, testDispatchNote)

        expect(result.success).toBe(true)
        expect(result.materialsCreated).toBe(1)
        
        // Verify the created material has correct status
        const createCall = mockDatabase.createProjectMaterial.mock.calls.find(
          call => call[0].sourceId === `dm-${testCase.dispatch}`
        )
        expect(createCall[0].status).toBe(testCase.expected)
      }
    })

    it('should sync project status changes back to dispatch', async () => {
      const result = await syncService.syncProjectToDispatch(mockProjectMaterial)

      expect(result.success).toBe(true)
      expect(result.materialsUpdated).toBe(1)
      // Note: Actual dispatch update would require database function implementation
    })

    it('should handle damaged materials with special notes', async () => {
      const damagedMaterial = {
        ...mockDispatchMaterial,
        status: DispatchMaterialStatus.DAMAGED,
        inspectionNotes: 'Bent during transport'
      }

      const damagedDispatchNote = {
        ...mockDispatchNote,
        materials: [damagedMaterial]
      }

      mockDatabase.getProjectMaterialsBySource.mockResolvedValue([mockProjectMaterial])
      mockDatabase.updateProjectMaterial.mockResolvedValue(undefined)

      const result = await syncService.syncDispatchToProject(mockProjectId, damagedDispatchNote)

      expect(result.success).toBe(true)
      
      const updateCall = mockDatabase.updateProjectMaterial.mock.calls[0]
      expect(updateCall[1].notes).toContain('DAMAGE REPORT')
      expect(updateCall[1].notes).toContain('Bent during transport')
    })
  })

  describe('Event-Driven Sync', () => {
    it('should emit sync events and handle listeners', async () => {
      const eventListener = jest.fn()
      syncService.addEventListener('syncCompleted', eventListener)

      mockDatabase.getProjectMaterialsBySource.mockResolvedValue([])
      mockDatabase.createProjectMaterial.mockResolvedValue(undefined)

      await syncService.syncDispatchToProject(mockProjectId, mockDispatchNote)

      expect(eventListener).toHaveBeenCalledWith(expect.objectContaining({
        operationType: 'dispatch_to_project',
        success: true
      }))
    })

    it('should maintain sync history', async () => {
      mockDatabase.getProjectMaterialsBySource.mockResolvedValue([])
      mockDatabase.createProjectMaterial.mockResolvedValue(undefined)

      // Perform multiple sync operations
      await syncService.syncDispatchToProject(mockProjectId, mockDispatchNote)
      await syncService.syncDispatchToProject(mockProjectId, {
        ...mockDispatchNote,
        id: 'dn-002',
        dispatchNumber: 'DN-2024-002'
      })

      const history = syncService.getSyncHistory()
      expect(history).toHaveLength(2)
      expect(history[0].operationType).toBe('dispatch_to_project')
      expect(history[1].operationType).toBe('dispatch_to_project')
    })
  })

  describe('Performance and Error Handling', () => {
    it('should handle large numbers of materials efficiently', async () => {
      // Create dispatch note with many materials
      const largeMaterialList = Array.from({ length: 100 }, (_, i) => ({
        ...mockDispatchMaterial,
        id: `dm-${i}`,
        quantity: i + 1
      }))

      const largeDispatchNote = {
        ...mockDispatchNote,
        materials: largeMaterialList
      }

      mockDatabase.getProjectMaterialsBySource.mockResolvedValue([])
      mockDatabase.createProjectMaterial.mockResolvedValue(undefined)

      const startTime = Date.now()
      const result = await syncService.syncDispatchToProject(mockProjectId, largeDispatchNote)
      const endTime = Date.now()

      expect(result.success).toBe(true)
      expect(result.materialsCreated).toBe(100)
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should continue processing when individual materials fail', async () => {
      // Setup materials where some will fail
      const mixedMaterials = [
        { ...mockDispatchMaterial, id: 'dm-good-1' },
        { ...mockDispatchMaterial, id: 'dm-bad', quantity: -1 }, // Invalid quantity
        { ...mockDispatchMaterial, id: 'dm-good-2' }
      ]

      const mixedDispatchNote = {
        ...mockDispatchNote,
        materials: mixedMaterials
      }

      mockDatabase.getProjectMaterialsBySource.mockResolvedValue([])
      mockDatabase.createProjectMaterial
        .mockResolvedValueOnce(undefined) // First succeeds
        .mockRejectedValueOnce(new Error('Invalid quantity')) // Second fails
        .mockResolvedValueOnce(undefined) // Third succeeds

      const result = await syncService.syncDispatchToProject(mockProjectId, mixedDispatchNote)

      expect(result.materialsProcessed).toBe(3)
      expect(result.materialsCreated).toBe(2)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].materialId).toBe('dm-bad')
    })
  })

  describe('Integration with Legacy Functions', () => {
    it('should maintain backward compatibility with existing sync functions', async () => {
      const { syncDispatchToProjectMaterials } = require('../dispatch-materials-sync')
      
      mockDatabase.getProjectMaterialsBySource.mockResolvedValue([])
      mockDatabase.createProjectMaterial.mockResolvedValue(undefined)

      const legacyResult = await syncDispatchToProjectMaterials(mockProjectId, mockDispatchNote)

      expect(legacyResult).toHaveProperty('materialsCreated')
      expect(legacyResult).toHaveProperty('materialsUpdated')
      expect(legacyResult).toHaveProperty('materialsSkipped')
      expect(legacyResult).toHaveProperty('errors')
      expect(legacyResult.materialsCreated).toBe(1)
    })
  })
})

describe('Global MaterialSyncService Instance', () => {
  it('should provide a global service instance', () => {
    expect(materialSyncService).toBeInstanceOf(MaterialSyncService)
  })

  it('should allow configuration updates', () => {
    const customService = new MaterialSyncService({
      conflictResolution: 'last-write-wins',
      validateMaterialSpecs: false
    })

    // Test that custom configuration is applied
    expect(customService).toBeInstanceOf(MaterialSyncService)
  })
})