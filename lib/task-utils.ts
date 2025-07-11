import { type ProjectTask, TaskStatus, TaskType, TaskPriority } from './types'

// ============================================================================
// TASK STATUS & WORKFLOW MANAGEMENT
// ============================================================================

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: 'Not Started',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.BLOCKED]: 'Blocked',
  [TaskStatus.ON_HOLD]: 'On Hold',
  [TaskStatus.COMPLETED]: 'Completed',
  [TaskStatus.CANCELLED]: 'Cancelled'
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: 'bg-gray-100 text-gray-800',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [TaskStatus.BLOCKED]: 'bg-red-100 text-red-800',
  [TaskStatus.ON_HOLD]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
  [TaskStatus.CANCELLED]: 'bg-gray-100 text-gray-600'
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.PLANNING]: 'Planning',
  [TaskType.PROCUREMENT]: 'Procurement',
  [TaskType.FABRICATION]: 'Fabrication',
  [TaskType.WELDING]: 'Welding',
  [TaskType.INSTALLATION]: 'Installation',
  [TaskType.INSPECTION]: 'Inspection',
  [TaskType.FINISHING]: 'Finishing',
  [TaskType.CLEANUP]: 'Cleanup',
  [TaskType.OTHER]: 'Other'
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High',
  [TaskPriority.CRITICAL]: 'Critical'
}

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-gray-100 text-gray-600',
  [TaskPriority.MEDIUM]: 'bg-blue-100 text-blue-700',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-700',
  [TaskPriority.CRITICAL]: 'bg-red-100 text-red-700'
}

// Valid status transitions
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.NOT_STARTED]: [TaskStatus.IN_PROGRESS, TaskStatus.ON_HOLD, TaskStatus.CANCELLED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.BLOCKED, TaskStatus.ON_HOLD, TaskStatus.CANCELLED],
  [TaskStatus.BLOCKED]: [TaskStatus.IN_PROGRESS, TaskStatus.ON_HOLD, TaskStatus.CANCELLED],
  [TaskStatus.ON_HOLD]: [TaskStatus.NOT_STARTED, TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.COMPLETED]: [], // Cannot transition from completed
  [TaskStatus.CANCELLED]: [TaskStatus.NOT_STARTED] // Can restart cancelled tasks
}

export function getValidStatusTransitions(currentStatus: TaskStatus): TaskStatus[] {
  return TASK_STATUS_TRANSITIONS[currentStatus] || []
}

export function canTransitionToStatus(fromStatus: TaskStatus, toStatus: TaskStatus): boolean {
  return getValidStatusTransitions(fromStatus).includes(toStatus)
}

// ============================================================================
// TASK DEPENDENCY MANAGEMENT
// ============================================================================

export interface DependencyValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateDependencies(
  taskId: string, 
  newDependencies: string[], 
  allTasks: ProjectTask[]
): DependencyValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for self-dependency
  if (newDependencies.includes(taskId)) {
    errors.push('A task cannot depend on itself')
  }

  // Check if dependency tasks exist
  const taskIds = new Set(allTasks.map(t => t.id))
  for (const depId of newDependencies) {
    if (!taskIds.has(depId)) {
      errors.push(`Dependency task with ID ${depId} does not exist`)
    }
  }

  // Check for circular dependencies
  const circularDep = detectCircularDependency(taskId, newDependencies, allTasks)
  if (circularDep) {
    errors.push(`Circular dependency detected: ${circularDep.join(' → ')}`)
  }

  // Check for excessive dependency chains
  const maxDepth = calculateMaxDependencyDepth(taskId, newDependencies, allTasks)
  if (maxDepth > 5) {
    warnings.push(`Dependency chain is quite deep (${maxDepth} levels). Consider simplifying.`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

function detectCircularDependency(
  startTaskId: string, 
  dependencies: string[], 
  allTasks: ProjectTask[],
  visited: Set<string> = new Set(),
  path: string[] = []
): string[] | null {
  if (visited.has(startTaskId)) {
    // Found a cycle
    const cycleStart = path.indexOf(startTaskId)
    return path.slice(cycleStart).concat(startTaskId)
  }

  visited.add(startTaskId)
  path.push(startTaskId)

  const task = allTasks.find(t => t.id === startTaskId)
  const taskDeps = task ? task.dependencies : dependencies

  for (const depId of taskDeps) {
    const cycle = detectCircularDependency(depId, [], allTasks, new Set(visited), [...path])
    if (cycle) {
      return cycle
    }
  }

  return null
}

function calculateMaxDependencyDepth(
  taskId: string, 
  dependencies: string[], 
  allTasks: ProjectTask[],
  currentDepth: number = 0
): number {
  if (currentDepth > 10) { // Prevent infinite loops
    return currentDepth
  }

  const task = allTasks.find(t => t.id === taskId)
  const taskDeps = task ? task.dependencies : dependencies

  if (taskDeps.length === 0) {
    return currentDepth
  }

  let maxDepth = currentDepth
  for (const depId of taskDeps) {
    const depth = calculateMaxDependencyDepth(depId, [], allTasks, currentDepth + 1)
    maxDepth = Math.max(maxDepth, depth)
  }

  return maxDepth
}

// ============================================================================
// TASK PROGRESS CALCULATION
// ============================================================================

export interface TaskProgressSummary {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  blockedTasks: number
  notStartedTasks: number
  onHoldTasks: number
  cancelledTasks: number
  completionPercentage: number
  weightedProgress: number
}

export function calculateTaskProgress(tasks: ProjectTask[]): TaskProgressSummary {
  const totalTasks = tasks.length
  
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {} as Record<TaskStatus, number>)

  const completedTasks = statusCounts[TaskStatus.COMPLETED] || 0
  const inProgressTasks = statusCounts[TaskStatus.IN_PROGRESS] || 0
  const blockedTasks = statusCounts[TaskStatus.BLOCKED] || 0
  const notStartedTasks = statusCounts[TaskStatus.NOT_STARTED] || 0
  const onHoldTasks = statusCounts[TaskStatus.ON_HOLD] || 0
  const cancelledTasks = statusCounts[TaskStatus.CANCELLED] || 0

  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Calculate weighted progress considering task priorities and individual progress
  const weightedProgress = calculateWeightedProgress(tasks)

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    blockedTasks,
    notStartedTasks,
    onHoldTasks,
    cancelledTasks,
    completionPercentage,
    weightedProgress
  }
}

function calculateWeightedProgress(tasks: ProjectTask[]): number {
  if (tasks.length === 0) return 0

  const weights: Record<TaskPriority, number> = {
    [TaskPriority.LOW]: 1,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.HIGH]: 3,
    [TaskPriority.CRITICAL]: 4
  }

  let totalWeightedProgress = 0
  let totalWeight = 0

  for (const task of tasks) {
    const weight = weights[task.priority]
    const taskProgress = task.status === TaskStatus.COMPLETED ? 100 : task.progress
    
    totalWeightedProgress += taskProgress * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? totalWeightedProgress / totalWeight : 0
}

// ============================================================================
// CRITICAL PATH IDENTIFICATION
// ============================================================================

export interface CriticalPathResult {
  criticalTasks: ProjectTask[]
  criticalPath: string[]
  estimatedDuration: number
  bottlenecks: ProjectTask[]
}

export function identifyCriticalPath(tasks: ProjectTask[]): CriticalPathResult {
  // Simple critical path calculation based on dependencies and estimated hours
  const taskMap = new Map(tasks.map(t => [t.id, t]))
  const criticalTasks: ProjectTask[] = []
  const criticalPath: string[] = []
  let estimatedDuration = 0
  
  // Find tasks with no dependencies (start points)
  const startTasks = tasks.filter(t => t.dependencies.length === 0)
  
  // Find longest path through dependencies
  for (const startTask of startTasks) {
    const path = findLongestPath(startTask, taskMap, [])
    if (path.duration > estimatedDuration) {
      estimatedDuration = path.duration
      criticalPath.splice(0, criticalPath.length, ...path.taskIds)
      criticalTasks.splice(0, criticalTasks.length, ...path.tasks)
    }
  }

  // Identify bottlenecks (tasks that block many others)
  const bottlenecks = tasks.filter(task => {
    const blockedCount = tasks.filter(t => t.dependencies.includes(task.id)).length
    return blockedCount >= 2 && task.status !== TaskStatus.COMPLETED
  })

  return {
    criticalTasks,
    criticalPath,
    estimatedDuration,
    bottlenecks
  }
}

interface PathResult {
  taskIds: string[]
  tasks: ProjectTask[]
  duration: number
}

function findLongestPath(
  task: ProjectTask, 
  taskMap: Map<string, ProjectTask>, 
  visited: string[]
): PathResult {
  if (visited.includes(task.id)) {
    return { taskIds: [], tasks: [], duration: 0 } // Avoid cycles
  }

  const newVisited = [...visited, task.id]
  
  // Find dependent tasks (tasks that depend on this one)
  const dependentTasks = Array.from(taskMap.values()).filter(t => 
    t.dependencies.includes(task.id)
  )

  if (dependentTasks.length === 0) {
    // This is an end task
    return {
      taskIds: [task.id],
      tasks: [task],
      duration: task.estimatedHours
    }
  }

  // Find the longest path through dependents
  let longestPath: PathResult = { taskIds: [task.id], tasks: [task], duration: task.estimatedHours }
  
  for (const depTask of dependentTasks) {
    const path = findLongestPath(depTask, taskMap, newVisited)
    const totalDuration = task.estimatedHours + path.duration
    
    if (totalDuration > longestPath.duration) {
      longestPath = {
        taskIds: [task.id, ...path.taskIds],
        tasks: [task, ...path.tasks],
        duration: totalDuration
      }
    }
  }

  return longestPath
}

// ============================================================================
// TASK FILTERING AND SORTING
// ============================================================================

export interface TaskFilters {
  status?: TaskStatus[]
  type?: TaskType[]
  priority?: TaskPriority[]
  assignedTo?: string
  hasDeadline?: boolean
  isOverdue?: boolean
  isBlocked?: boolean
}

export function filterTasks(tasks: ProjectTask[], filters: TaskFilters): ProjectTask[] {
  return tasks.filter(task => {
    // Status filter
    if (filters.status && filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false
    }

    // Type filter
    if (filters.type && filters.type.length > 0 && !filters.type.includes(task.type)) {
      return false
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false
    }

    // Assigned to filter
    if (filters.assignedTo && task.assignedTo !== filters.assignedTo) {
      return false
    }

    // Has deadline filter
    if (filters.hasDeadline !== undefined) {
      const hasDeadline = !!task.scheduledEnd
      if (hasDeadline !== filters.hasDeadline) return false
    }

    // Overdue filter
    if (filters.isOverdue && task.scheduledEnd) {
      const isOverdue = new Date() > new Date(task.scheduledEnd) && task.status !== TaskStatus.COMPLETED
      if (!isOverdue) return false
    }

    // Blocked filter
    if (filters.isBlocked) {
      const isBlocked = task.status === TaskStatus.BLOCKED
      if (!isBlocked) return false
    }

    return true
  })
}

export type TaskSortField = 'name' | 'priority' | 'status' | 'type' | 'scheduledStart' | 'scheduledEnd' | 'progress' | 'estimatedHours'
export type SortDirection = 'asc' | 'desc'

export function sortTasks(tasks: ProjectTask[], field: TaskSortField, direction: SortDirection = 'asc'): ProjectTask[] {
  return [...tasks].sort((a, b) => {
    let comparison = 0

    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'priority':
        const priorityOrder = { [TaskPriority.LOW]: 1, [TaskPriority.MEDIUM]: 2, [TaskPriority.HIGH]: 3, [TaskPriority.CRITICAL]: 4 }
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'type':
        comparison = a.type.localeCompare(b.type)
        break
      case 'scheduledStart':
        const startA = a.scheduledStart ? new Date(a.scheduledStart).getTime() : Number.MAX_SAFE_INTEGER
        const startB = b.scheduledStart ? new Date(b.scheduledStart).getTime() : Number.MAX_SAFE_INTEGER
        comparison = startA - startB
        break
      case 'scheduledEnd':
        const endA = a.scheduledEnd ? new Date(a.scheduledEnd).getTime() : Number.MAX_SAFE_INTEGER
        const endB = b.scheduledEnd ? new Date(b.scheduledEnd).getTime() : Number.MAX_SAFE_INTEGER
        comparison = endA - endB
        break
      case 'progress':
        comparison = a.progress - b.progress
        break
      case 'estimatedHours':
        comparison = a.estimatedHours - b.estimatedHours
        break
    }

    return direction === 'desc' ? -comparison : comparison
  })
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function estimateTaskDuration(type: TaskType, complexity: 'simple' | 'medium' | 'complex'): number {
  const baseHours: Record<TaskType, number> = {
    [TaskType.PLANNING]: 4,
    [TaskType.PROCUREMENT]: 2,
    [TaskType.FABRICATION]: 8,
    [TaskType.WELDING]: 6,
    [TaskType.INSTALLATION]: 12,
    [TaskType.INSPECTION]: 2,
    [TaskType.FINISHING]: 4,
    [TaskType.CLEANUP]: 2,
    [TaskType.OTHER]: 4
  }

  const multipliers = {
    simple: 0.7,
    medium: 1.0,
    complex: 1.5
  }

  return Math.round(baseHours[type] * multipliers[complexity])
}

export function calculateTaskCompletionDate(task: ProjectTask, workingHoursPerDay: number = 8): Date | null {
  if (!task.scheduledStart) return null

  const remainingHours = task.estimatedHours * (1 - task.progress / 100)
  const remainingDays = Math.ceil(remainingHours / workingHoursPerDay)
  
  const completionDate = new Date(task.scheduledStart)
  completionDate.setDate(completionDate.getDate() + remainingDays)
  
  return completionDate
} 