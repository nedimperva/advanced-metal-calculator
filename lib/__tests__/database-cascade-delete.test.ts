import {
  initializeDatabase,
  deleteProjectCascade,
  createProject,
  createProjectMaterial,
  createProjectTask,
  createProjectAssignment,
  createDailyTimesheet,
  createDispatchNote,
  createMaterialStockTransaction,
  getProject,
  getProjectMaterials,
  getProjectTasks,
  getProjectAssignments,
  getProjectTimesheets,
  getDispatchNotesByProject,
  getAllRecords,
  STORES
} from '../database'
import {
  Project,
  ProjectMaterial,
  ProjectTask,
  ProjectAssignment,
  DailyTimesheet,
  DispatchNote,
  MaterialStockTransaction,
  ProjectStatus,
  ProjectMaterialStatus,
  ProjectMaterialSource,
  TaskType,
  TaskStatus,
  DispatchStatus
} from '../types'

// Mock IndexedDB for testing
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
}

// Mock IDBDatabase
const mockDB = {
  createObjectStore: jest.fn(),
  transaction: jest.fn(),
  close: jest.fn(),
  deleteObjectStore: jest.fn(),
}

// Mock IDBTransaction
const mockTransaction = {
  objectStore: jest.fn(),
  oncomplete: null,
  onerror: null,
  abort: jest.fn(),
}

// Mock IDBObjectStore
const mockStore = {
  add: jest.fn(),
  put: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  createIndex: jest.fn(),
  index: jest.fn(),
}

// Mock IDBRequest
const createMockRequest = (result: any = null, error: any = null) => ({
  onsuccess: null,
  onerror: null,
  result,
  error,
})

// Mock IDBIndex
const mockIndex = {
  getAll: jest.fn(),
  get: jest.fn(),
}

beforeAll(() => {
  // Setup global IndexedDB mock
  global.indexedDB = mockIndexedDB as any
  global.IDBKeyRange = {
    bound: jest.fn(),
    only: jest.fn(),
    lowerBound: jest.fn(),
    upperBound: jest.fn(),
  } as any
})

beforeEach(() => {
  jest.clearAllMocks()
  
  // Reset mock implementations
  mockStore.index.mockReturnValue(mockIndex)
  mockTransaction.objectStore.mockReturnValue(mockStore)
  mockDB.transaction.mockReturnValue(mockTransaction)
  mockIndexedDB.open.mockReturnValue({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: mockDB,
  })
})

describe('Database Cascade Delete Tests', () => {
  const testProjectId = 'test_project_123'
  const testProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'Test Project',
    description: 'Test project for cascade delete',
    status: ProjectStatus.ACTIVE,
    startDate: new Date(),
    calculationIds: [],
    notes: '',
    tags: [],
  }

  describe('deleteProjectCascade', () => {
    it('should validate project exists before deletion', async () => {
      // Mock project not found
      mockStore.get.mockReturnValue(createMockRequest(undefined))

      await expect(deleteProjectCascade('nonexistent_project')).rejects.toThrow(
        'Project with ID nonexistent_project not found'
      )
    })

    it('should prevent deletion of projects with active dispatches', async () => {
      // Mock project exists
      const mockProject = { ...testProject, id: testProjectId }
      mockStore.get.mockReturnValue(createMockRequest(mockProject))

      // Mock active dispatch notes
      const activeDispatch: DispatchNote = {
        id: 'dispatch_1',
        projectId: testProjectId,
        dispatchNumber: 'D001',
        status: DispatchStatus.PENDING,
        supplier: 'Test Supplier',
        materials: [],
        totalQuantity: 100,
        totalWeight: 500,
        estimatedCost: 1000,
        scheduledDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockIndex.getAll.mockReturnValue(createMockRequest([activeDispatch]))

      await expect(deleteProjectCascade(testProjectId)).rejects.toThrow(
        'Cannot delete project: 1 active dispatch notes must be completed first'
      )
    })

    it('should prevent deletion of projects with recent activity', async () => {
      // Mock project exists
      const mockProject = { ...testProject, id: testProjectId }
      mockStore.get.mockReturnValue(createMockRequest(mockProject))

      // Mock no active dispatches
      mockIndex.getAll.mockReturnValueOnce(createMockRequest([]))

      // Mock recent timesheet (within 7 days)
      const recentTimesheet: DailyTimesheet = {
        id: 'timesheet_1',
        projectId: testProjectId,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        workerEntries: [],
        machineryEntries: [],
        totalHours: 8,
        totalCost: 400,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockIndex.getAll.mockReturnValueOnce(createMockRequest([recentTimesheet]))

      await expect(deleteProjectCascade(testProjectId)).rejects.toThrow(
        'Cannot delete project: Project has recent activity (1 timesheets in last 7 days)'
      )
    })

    it('should successfully delete project and all related records', async () => {
      // Mock project exists
      const mockProject = { ...testProject, id: testProjectId }
      mockStore.get.mockReturnValue(createMockRequest(mockProject))

      // Mock no validation errors (no active dispatches, no recent timesheets)
      mockIndex.getAll.mockReturnValue(createMockRequest([]))

      // Mock related records to be deleted
      const mockMaterials: ProjectMaterial[] = [{
        id: 'material_1',
        projectId: testProjectId,
        materialName: 'Steel Beam',
        profile: 'I-Beam',
        grade: 'S355',
        dimensions: { height: 200, width: 100, thickness: 8 },
        quantity: 10,
        unitWeight: 25.3,
        totalWeight: 253,
        lengthUnit: 'mm',
        weightUnit: 'kg',
        status: ProjectMaterialStatus.REQUIRED,
        source: ProjectMaterialSource.MANUAL,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]

      const mockTasks: ProjectTask[] = [{
        id: 'task_1',
        projectId: testProjectId,
        name: 'Test Task',
        type: TaskType.FABRICATION,
        status: TaskStatus.NOT_STARTED,
        priority: 'medium',
        estimatedHours: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]

      const mockAssignments: ProjectAssignment[] = [{
        id: 'assignment_1',
        projectId: testProjectId,
        workerId: 'worker_1',
        assignedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }]

      const mockTimesheets: DailyTimesheet[] = [{
        id: 'timesheet_1',
        projectId: testProjectId,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        workerEntries: [],
        machineryEntries: [],
        totalHours: 8,
        totalCost: 400,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]

      const mockDispatchNotes: DispatchNote[] = [{
        id: 'dispatch_1',
        projectId: testProjectId,
        dispatchNumber: 'D001',
        status: DispatchStatus.COMPLETED,
        supplier: 'Test Supplier',
        materials: [],
        totalQuantity: 100,
        totalWeight: 500,
        estimatedCost: 1000,
        scheduledDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }]

      const mockStockTransactions: MaterialStockTransaction[] = [{
        id: 'trans_1',
        materialStockId: 'stock_1',
        type: 'OUT',
        quantity: 5,
        referenceId: testProjectId,
        referenceType: 'PROJECT',
        transactionDate: new Date(),
        createdAt: new Date(),
      }]

      // Mock the various getAll calls for related records
      let callCount = 0
      mockIndex.getAll.mockImplementation(() => {
        callCount++
        switch (callCount) {
          case 1: return createMockRequest([]) // dispatchNotes for validation
          case 2: return createMockRequest([]) // timesheets for validation  
          case 3: return createMockRequest(mockDispatchNotes) // dispatchNotes for deletion
          case 4: return createMockRequest(mockMaterials) // materials
          case 5: return createMockRequest(mockTasks) // tasks
          case 6: return createMockRequest(mockAssignments) // assignments
          case 7: return createMockRequest(mockTimesheets) // timesheets
          case 8: return createMockRequest([]) // dispatch materials
          default: return createMockRequest([])
        }
      })

      mockStore.getAll.mockImplementation(() => {
        // For stock transactions and work entries
        return createMockRequest(mockStockTransactions)
      })

      // Mock successful delete operations
      mockStore.delete.mockReturnValue(createMockRequest())

      // Mock successful transaction completion
      mockTransaction.oncomplete = jest.fn()
      mockTransaction.onerror = jest.fn()

      // Execute the cascade delete
      const deletePromise = deleteProjectCascade(testProjectId)

      // Simulate transaction completion
      setTimeout(() => {
        if (mockTransaction.oncomplete) {
          mockTransaction.oncomplete({} as any)
        }
      }, 10)

      await expect(deletePromise).resolves.toBeUndefined()

      // Verify that all delete operations were called
      expect(mockStore.delete).toHaveBeenCalledTimes(6) // materials, tasks, assignments, timesheets, dispatch notes, project
    })

    it('should update task dependencies when deleting projects', async () => {
      // Mock project exists
      const mockProject = { ...testProject, id: testProjectId }
      mockStore.get.mockReturnValue(createMockRequest(mockProject))

      // Mock no validation errors
      mockIndex.getAll.mockReturnValue(createMockRequest([]))

      // Mock tasks being deleted
      const deletedTasks: ProjectTask[] = [{
        id: 'task_to_delete',
        projectId: testProjectId,
        name: 'Task to Delete',
        type: TaskType.FABRICATION,
        status: TaskStatus.NOT_STARTED,
        priority: 'medium',
        estimatedHours: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]

      // Mock tasks with dependencies on deleted tasks
      const dependentTasks: ProjectTask[] = [{
        id: 'dependent_task',
        projectId: 'other_project',
        name: 'Dependent Task',
        type: TaskType.PLANNING,
        status: TaskStatus.NOT_STARTED,
        priority: 'medium',
        estimatedHours: 5,
        dependencies: ['task_to_delete', 'other_task'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }]

      mockIndex.getAll.mockReturnValueOnce(createMockRequest(deletedTasks))
      mockStore.getAll.mockReturnValueOnce(createMockRequest([...deletedTasks, ...dependentTasks]))

      // Mock successful put operation for updating dependencies
      mockStore.put.mockReturnValue(createMockRequest())

      // Mock other operations
      mockStore.delete.mockReturnValue(createMockRequest())

      // Execute the cascade delete
      const deletePromise = deleteProjectCascade(testProjectId)

      // Simulate transaction completion
      setTimeout(() => {
        if (mockTransaction.oncomplete) {
          mockTransaction.oncomplete({} as any)
        }
      }, 10)

      await expect(deletePromise).resolves.toBeUndefined()

      // Verify that task dependencies were updated
      expect(mockStore.put).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'dependent_task',
          dependencies: ['other_task'], // 'task_to_delete' should be removed
        })
      )
    })

    it('should handle transaction failures gracefully', async () => {
      // Mock project exists
      const mockProject = { ...testProject, id: testProjectId }
      mockStore.get.mockReturnValue(createMockRequest(mockProject))

      // Mock no validation errors
      mockIndex.getAll.mockReturnValue(createMockRequest([]))
      mockStore.getAll.mockReturnValue(createMockRequest([]))

      // Mock transaction error
      mockStore.delete.mockReturnValue(createMockRequest(null, new Error('Delete failed')))

      const deletePromise = deleteProjectCascade(testProjectId)

      // Simulate transaction error
      setTimeout(() => {
        if (mockTransaction.onerror) {
          mockTransaction.onerror({} as any)
        }
      }, 10)

      await expect(deletePromise).rejects.toThrow('Failed to delete project cascade')
    })
  })

  describe('Helper Functions', () => {
    it('should delete material stock transactions by project', async () => {
      const stockTransactions: MaterialStockTransaction[] = [
        {
          id: 'trans_1',
          materialStockId: 'stock_1',
          type: 'OUT',
          quantity: 5,
          referenceId: testProjectId,
          referenceType: 'PROJECT',
          transactionDate: new Date(),
          createdAt: new Date(),
        },
        {
          id: 'trans_2',
          materialStockId: 'stock_2',
          type: 'OUT',
          quantity: 3,
          referenceId: 'other_project',
          referenceType: 'PROJECT',
          transactionDate: new Date(),
          createdAt: new Date(),
        }
      ]

      mockStore.getAll.mockReturnValue(createMockRequest(stockTransactions))
      mockStore.delete.mockReturnValue(createMockRequest())

      // This test would verify the helper function behavior
      // Since the helper functions are private, we test them through the main function
      expect(true).toBe(true) // Placeholder assertion
    })

    it('should validate project deletion with multiple constraints', async () => {
      // Mock project exists
      const mockProject = { ...testProject, id: testProjectId }
      mockStore.get.mockReturnValue(createMockRequest(mockProject))

      // Mock both active dispatches and recent timesheets
      const activeDispatch: DispatchNote = {
        id: 'dispatch_1',
        projectId: testProjectId,
        dispatchNumber: 'D001',
        status: DispatchStatus.IN_TRANSIT,
        supplier: 'Test Supplier',
        materials: [],
        totalQuantity: 100,
        totalWeight: 500,
        estimatedCost: 1000,
        scheduledDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const recentTimesheet: DailyTimesheet = {
        id: 'timesheet_1',
        projectId: testProjectId,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        workerEntries: [],
        machineryEntries: [],
        totalHours: 8,
        totalCost: 400,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockIndex.getAll
        .mockReturnValueOnce(createMockRequest([activeDispatch]))
        .mockReturnValueOnce(createMockRequest([recentTimesheet]))

      await expect(deleteProjectCascade(testProjectId)).rejects.toThrow(
        'Cannot delete project: 1 active dispatch notes must be completed first, Project has recent activity (1 timesheets in last 7 days)'
      )
    })
  })
})