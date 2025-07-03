"use client"

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { type ProjectTask, TaskStatus, TaskType, TaskPriority } from '@/lib/types'
import { 
  createTask, 
  updateTask, 
  deleteTask, 
  getProjectTasks, 
  getAllTasks,
  getTasksByStatus 
} from '@/lib/database'
import { 
  calculateTaskProgress, 
  validateDependencies, 
  filterTasks, 
  sortTasks,
  generateTaskId,
  type TaskProgressSummary,
  type TaskFilters,
  type TaskSortField,
  type SortDirection 
} from '@/lib/task-utils'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

// ============================================================================
// CONTEXT STATE TYPES
// ============================================================================

interface TaskState {
  tasks: ProjectTask[]
  loading: boolean
  error: string | null
  selectedProjectId: string | null
  filters: TaskFilters
  sortField: TaskSortField
  sortDirection: SortDirection
  searchTerm: string
}

interface TaskContextValue extends TaskState {
  // Task CRUD operations
  createNewTask: (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateExistingTask: (task: ProjectTask) => Promise<void>
  deleteExistingTask: (taskId: string) => Promise<void>
  
  // Task queries
  getProjectTaskList: (projectId: string) => Promise<void>
  refreshTasks: () => Promise<void>
  
  // Task status management
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>
  updateTaskProgress: (taskId: string, progress: number) => Promise<void>
  
  // Dependency management
  addTaskDependency: (taskId: string, dependencyId: string) => Promise<void>
  removeTaskDependency: (taskId: string, dependencyId: string) => Promise<void>
  
  // Filtering and search
  setFilters: (filters: Partial<TaskFilters>) => void
  setSorting: (field: TaskSortField, direction?: SortDirection) => void
  setSearchTerm: (term: string) => void
  clearFilters: () => void
  
  // Computed values
  filteredTasks: ProjectTask[]
  taskProgress: TaskProgressSummary
  canDeleteTask: (taskId: string) => boolean
}

// ============================================================================
// REDUCER
// ============================================================================

type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TASKS'; payload: ProjectTask[] }
  | { type: 'ADD_TASK'; payload: ProjectTask }
  | { type: 'UPDATE_TASK'; payload: ProjectTask }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_PROJECT_ID'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<TaskFilters> }
  | { type: 'SET_SORTING'; payload: { field: TaskSortField; direction: SortDirection } }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'CLEAR_FILTERS' }

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false, error: null }
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        )
      }
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      }
    
    case 'SET_PROJECT_ID':
      return { ...state, selectedProjectId: action.payload }
    
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    
    case 'SET_SORTING':
      return { 
        ...state, 
        sortField: action.payload.field, 
        sortDirection: action.payload.direction 
      }
    
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload }
    
    case 'CLEAR_FILTERS':
      return { 
        ...state, 
        filters: {}, 
        searchTerm: '',
        sortField: 'name',
        sortDirection: 'asc'
      }
    
    default:
      return state
  }
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const TaskContext = createContext<TaskContextValue | undefined>(undefined)

export function useTask() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider')
  }
  return context
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface TaskProviderProps {
  children: React.ReactNode
  initialProjectId?: string
}

export function TaskProvider({ children, initialProjectId }: TaskProviderProps) {
  const { t } = useI18n()
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    loading: false,
    error: null,
    selectedProjectId: initialProjectId || null,
    filters: {},
    sortField: 'name',
    sortDirection: 'asc',
    searchTerm: ''
  })

  // ============================================================================
  // TASK CRUD OPERATIONS
  // ============================================================================

  const createNewTask = useCallback(async (taskData: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Validate dependencies if any
      if (taskData.dependencies && taskData.dependencies.length > 0) {
        const validation = validateDependencies(generateTaskId(), taskData.dependencies, state.tasks)
        if (!validation.isValid) {
          throw new Error(`Invalid dependencies: ${validation.errors.join(', ')}`)
        }
      }

      const taskId = await createTask(taskData)
      
      // Create the full task object for local state
      const newTask: ProjectTask = {
        ...taskData,
        id: taskId,
        createdAt: new Date(),
        updatedAt: new Date(),
        dependencies: taskData.dependencies || [],
        blockedBy: [],
        progress: taskData.progress || 0
      }
      
      dispatch({ type: 'ADD_TASK', payload: newTask })
      
      toast({
        title: t('taskCreatedSuccess'),
        description: `${t('taskCreatedSuccess')} "${taskData.name}"`,
      })
      
      return taskId
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      toast({
        title: t('creationFailed'),
        description: errorMessage,
        variant: "destructive"
      })
      
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.tasks])

  const updateExistingTask = useCallback(async (task: ProjectTask): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // Validate dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        const validation = validateDependencies(task.id, task.dependencies, state.tasks)
        if (!validation.isValid) {
          throw new Error(`Invalid dependencies: ${validation.errors.join(', ')}`)
        }
      }

      await updateTask(task)
      dispatch({ type: 'UPDATE_TASK', payload: task })
      
      toast({
        title: t('taskUpdatedSuccess'),
        description: `${t('taskUpdatedSuccess')} "${task.name}"`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      toast({
        title: t('updateFailed'),
        description: errorMessage,
        variant: "destructive"
      })
      
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.tasks])

  const deleteExistingTask = useCallback(async (taskId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const task = state.tasks.find(t => t.id === taskId)
      await deleteTask(taskId)
      dispatch({ type: 'DELETE_TASK', payload: taskId })
      
      toast({
        title: t('taskDeletedSuccess'),
        description: `${t('taskDeletedSuccess')} "${task?.name || 'Unknown'}"`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      toast({
        title: t('deletionFailed'),
        description: errorMessage,
        variant: "destructive"
      })
      
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.tasks])

  // ============================================================================
  // TASK QUERIES
  // ============================================================================

  const getProjectTaskList = useCallback(async (projectId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_PROJECT_ID', payload: projectId })
      
      const tasks = await getProjectTasks(projectId)
      dispatch({ type: 'SET_TASKS', payload: tasks })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      toast({
        title: t('loadFailed'),
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const refreshTasks = useCallback(async (): Promise<void> => {
    if (state.selectedProjectId) {
      await getProjectTaskList(state.selectedProjectId)
    } else {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        const allTasks = await getAllTasks()
        dispatch({ type: 'SET_TASKS', payload: allTasks })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to refresh tasks'
        dispatch({ type: 'SET_ERROR', payload: errorMessage })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
  }, [state.selectedProjectId, getProjectTaskList])

  // ============================================================================
  // TASK STATUS MANAGEMENT
  // ============================================================================

  const updateTaskStatus = useCallback(async (taskId: string, status: TaskStatus): Promise<void> => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    const updatedTask = {
      ...task,
      status,
      // Auto-update progress based on status
      progress: status === TaskStatus.COMPLETED ? 100 : 
               status === TaskStatus.NOT_STARTED ? 0 : 
               task.progress,
      // Update timing fields
      actualStart: status === TaskStatus.IN_PROGRESS && !task.actualStart ? new Date() : task.actualStart,
      actualEnd: status === TaskStatus.COMPLETED ? new Date() : undefined
    }

    await updateExistingTask(updatedTask)
  }, [state.tasks, updateExistingTask])

  const updateTaskProgress = useCallback(async (taskId: string, progress: number): Promise<void> => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    const updatedTask = {
      ...task,
      progress: Math.max(0, Math.min(100, progress)),
      // Auto-update status based on progress
      status: progress === 100 ? TaskStatus.COMPLETED :
              progress > 0 ? TaskStatus.IN_PROGRESS :
              TaskStatus.NOT_STARTED
    }

    await updateExistingTask(updatedTask)
  }, [state.tasks, updateExistingTask])

  // ============================================================================
  // DEPENDENCY MANAGEMENT
  // ============================================================================

  const addTaskDependency = useCallback(async (taskId: string, dependencyId: string): Promise<void> => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    const newDependencies = [...(task.dependencies || []), dependencyId]
    const validation = validateDependencies(taskId, newDependencies, state.tasks)
    
    if (!validation.isValid) {
      throw new Error(`Cannot add dependency: ${validation.errors.join(', ')}`)
    }

    const updatedTask = {
      ...task,
      dependencies: newDependencies
    }

    await updateExistingTask(updatedTask)
  }, [state.tasks, updateExistingTask])

  const removeTaskDependency = useCallback(async (taskId: string, dependencyId: string): Promise<void> => {
    const task = state.tasks.find(t => t.id === taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    const updatedTask = {
      ...task,
      dependencies: task.dependencies.filter(id => id !== dependencyId)
    }

    await updateExistingTask(updatedTask)
  }, [state.tasks, updateExistingTask])

  // ============================================================================
  // FILTERING AND SEARCH
  // ============================================================================

  const setFilters = useCallback((filters: Partial<TaskFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }, [])

  const setSorting = useCallback((field: TaskSortField, direction?: SortDirection) => {
    const newDirection = direction || (
      state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc'
    )
    dispatch({ type: 'SET_SORTING', payload: { field, direction: newDirection } })
  }, [state.sortField, state.sortDirection])

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term })
  }, [])

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' })
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Filter and sort tasks
  const filteredTasks = React.useMemo(() => {
    let result = state.tasks

    // Apply search term
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase()
      result = result.filter(task => 
        task.name.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.notes?.toLowerCase().includes(searchLower)
      )
    }

    // Apply filters
    result = filterTasks(result, state.filters)

    // Apply sorting
    result = sortTasks(result, state.sortField, state.sortDirection)

    return result
  }, [state.tasks, state.searchTerm, state.filters, state.sortField, state.sortDirection])

  // Calculate task progress
  const taskProgress = React.useMemo(() => {
    return calculateTaskProgress(filteredTasks)
  }, [filteredTasks])

  // Check if task can be deleted
  const canDeleteTask = useCallback((taskId: string): boolean => {
    // A task can be deleted if no other tasks depend on it
    return !state.tasks.some(task => task.dependencies.includes(taskId))
  }, [state.tasks])

  // ============================================================================
  // INITIAL LOAD
  // ============================================================================

  useEffect(() => {
    if (initialProjectId) {
      getProjectTaskList(initialProjectId)
    }
  }, [initialProjectId, getProjectTaskList])

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: TaskContextValue = {
    ...state,
    createNewTask,
    updateExistingTask,
    deleteExistingTask,
    getProjectTaskList,
    refreshTasks,
    updateTaskStatus,
    updateTaskProgress,
    addTaskDependency,
    removeTaskDependency,
    setFilters,
    setSorting,
    setSearchTerm,
    clearFilters,
    filteredTasks,
    taskProgress,
    canDeleteTask
  }

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  )
} 