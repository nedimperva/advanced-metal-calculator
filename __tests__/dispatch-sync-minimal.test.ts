/**
 * Minimal test to verify bidirectional sync functionality
 */

// Mock the database module before importing anything else
jest.mock('../lib/database', () => ({
  getDispatchMaterialById: jest.fn(),
  updateDispatchMaterial: jest.fn(),
}))

import {
  syncProjectToDispatchMaterials,
  syncProjectToDispatchMaterialsWithTransaction,
} from '../lib/dispatch-materials-sync'
import {
  ProjectMaterial,
  DispatchMaterial,
  ProjectMaterialStatus,
  ProjectMaterialSource,
  DispatchMaterialStatus,
} from '../lib/types'

// Get the mocked functions
const { getDispatchMaterialById, updateDispatchMaterial } = jest.requireMock('../lib/database')

describe('Bidirectional Sync - Core Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('syncProjectToDispatchMaterials', () => {
    it('should sync project material status to dispatch material', async () => {
      // Arrange
      const projectMaterial: ProjectMaterial = {
        id: 'pm-1',
        projectId: 'project-1',
        materialName: 'Steel I-Beam',
        profile: 'I-beam',
        grade: 'S355',
        dimensions: { height: 200, width: 100 },
        quantity: 10,
        unitWeight: 25,
        totalWeight: 250,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.INSTALLED,
        source: ProjectMaterialSource.DISPATCH,
        sourceId: 'dm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const dispatchMaterial: DispatchMaterial = {
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
        usageHistory: [],
      }

      getDispatchMaterialById.mockResolvedValue(dispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      // Act
      await syncProjectToDispatchMaterials(projectMaterial)

      // Assert
      expect(getDispatchMaterialById).toHaveBeenCalledWith('dm-1')
      expect(updateDispatchMaterial).toHaveBeenCalledWith(
        'dm-1',
        expect.objectContaining({
          status: DispatchMaterialStatus.USED,
        })
      )
    })

    it('should not sync materials not from dispatch', async () => {
      // Arrange
      const projectMaterial: ProjectMaterial = {
        id: 'pm-1',
        projectId: 'project-1',
        materialName: 'Steel I-Beam',
        profile: 'I-beam',
        grade: 'S355',
        dimensions: { height: 200, width: 100 },
        quantity: 10,
        unitWeight: 25,
        totalWeight: 250,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.INSTALLED,
        source: ProjectMaterialSource.MANUAL, // Not from dispatch
        sourceId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Act
      await syncProjectToDispatchMaterials(projectMaterial)

      // Assert
      expect(getDispatchMaterialById).not.toHaveBeenCalled()
      expect(updateDispatchMaterial).not.toHaveBeenCalled()
    })

    it('should handle missing dispatch material gracefully', async () => {
      // Arrange
      const projectMaterial: ProjectMaterial = {
        id: 'pm-1',
        projectId: 'project-1',
        materialName: 'Steel I-Beam',
        profile: 'I-beam',
        grade: 'S355',
        dimensions: { height: 200, width: 100 },
        quantity: 10,
        unitWeight: 25,
        totalWeight: 250,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.INSTALLED,
        source: ProjectMaterialSource.DISPATCH,
        sourceId: 'dm-nonexistent',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      getDispatchMaterialById.mockResolvedValue(null)

      // Act & Assert
      await expect(syncProjectToDispatchMaterials(projectMaterial)).resolves.toBeUndefined()
      expect(updateDispatchMaterial).not.toHaveBeenCalled()
    })
  })

  describe('syncProjectToDispatchMaterialsWithTransaction', () => {
    it('should handle transaction successfully', async () => {
      // Arrange
      const projectMaterial: ProjectMaterial = {
        id: 'pm-1',
        projectId: 'project-1',
        materialName: 'Steel I-Beam',
        profile: 'I-beam',
        grade: 'S355',
        dimensions: { height: 200, width: 100 },
        quantity: 10,
        unitWeight: 25,
        totalWeight: 250,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.INSTALLED,
        source: ProjectMaterialSource.DISPATCH,
        sourceId: 'dm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const dispatchMaterial: DispatchMaterial = {
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
        usageHistory: [],
      }

      getDispatchMaterialById.mockResolvedValue(dispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      // Act
      const result = await syncProjectToDispatchMaterialsWithTransaction(projectMaterial)

      // Assert
      expect(result.success).toBe(true)
      expect(result.transactionId).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('should handle sync failure and rollback', async () => {
      // Arrange
      const projectMaterial: ProjectMaterial = {
        id: 'pm-1',
        projectId: 'project-1',
        materialName: 'Steel I-Beam',
        profile: 'I-beam',
        grade: 'S355',
        dimensions: { height: 200, width: 100 },
        quantity: 10,
        unitWeight: 25,
        totalWeight: 250,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.INSTALLED,
        source: ProjectMaterialSource.DISPATCH,
        sourceId: 'dm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const dispatchMaterial: DispatchMaterial = {
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
        usageHistory: [],
      }

      getDispatchMaterialById.mockResolvedValue(dispatchMaterial)
      updateDispatchMaterial
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce(undefined) // Rollback succeeds

      // Act
      const result = await syncProjectToDispatchMaterialsWithTransaction(projectMaterial, {
        enableRollback: true,
      })

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.rollbackRequired).toBe(false) // Rollback completed
      expect(updateDispatchMaterial).toHaveBeenCalledTimes(2) // Original + rollback
    })
  })

  describe('Status progression logic', () => {
    it('should allow forward status progression', async () => {
      // Arrange
      const projectMaterial: ProjectMaterial = {
        id: 'pm-1',
        projectId: 'project-1',
        materialName: 'Steel I-Beam',
        profile: 'I-beam',
        grade: 'S355',
        dimensions: { height: 200, width: 100 },
        quantity: 10,
        unitWeight: 25,
        totalWeight: 250,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.INSTALLED,
        source: ProjectMaterialSource.DISPATCH,
        sourceId: 'dm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const dispatchMaterial: DispatchMaterial = {
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
        status: DispatchMaterialStatus.ARRIVED, // Can progress to USED
        usageHistory: [],
      }

      getDispatchMaterialById.mockResolvedValue(dispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      // Act
      await syncProjectToDispatchMaterials(projectMaterial)

      // Assert
      expect(updateDispatchMaterial).toHaveBeenCalledWith(
        'dm-1',
        expect.objectContaining({
          status: DispatchMaterialStatus.USED,
        })
      )
    })

    it('should prevent backward status progression', async () => {
      // Arrange
      const projectMaterial: ProjectMaterial = {
        id: 'pm-1',
        projectId: 'project-1',
        materialName: 'Steel I-Beam',
        profile: 'I-beam',
        grade: 'S355',
        dimensions: { height: 200, width: 100 },
        quantity: 10,
        unitWeight: 25,
        totalWeight: 250,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.DELIVERED, // Would regress USED back to ARRIVED
        source: ProjectMaterialSource.DISPATCH,
        sourceId: 'dm-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const dispatchMaterial: DispatchMaterial = {
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
        status: DispatchMaterialStatus.USED, // Already at final status
        usageHistory: [],
      }

      getDispatchMaterialById.mockResolvedValue(dispatchMaterial)
      updateDispatchMaterial.mockResolvedValue(undefined)

      // Act
      await syncProjectToDispatchMaterials(projectMaterial)

      // Assert
      // Should not update status due to regression prevention
      const updateCall = updateDispatchMaterial.mock.calls[0]
      if (updateCall) {
        const updates = updateCall[1]
        expect(updates.status).toBeUndefined() // Status should not be updated
      }
    })
  })
})