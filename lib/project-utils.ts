import type { Project, ProjectMaterial, Calculation, DailyJournalTimesheet, JournalWorkerEntry, JournalMachineryEntry, ProjectMilestone, ProjectTask } from './types'
import { ProjectStatus, MaterialStatus, TaskStatus } from './types'
import { getAllProjects, getProjectMaterials, getProjectCalculations, getDailyJournalTimesheetByDate, getProjectTasks } from './database'
import { calculateTaskProgress, type TaskProgressSummary } from './task-utils'
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

// Legacy hardcoded labels - keep for compatibility but use localized functions instead
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: 'Planning',
  [ProjectStatus.ACTIVE]: 'Active',
  [ProjectStatus.ON_HOLD]: 'On Hold',
  [ProjectStatus.COMPLETED]: 'Completed',
  [ProjectStatus.CANCELLED]: 'Cancelled'
}

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: 'blue',
  [ProjectStatus.ACTIVE]: 'green',
  [ProjectStatus.ON_HOLD]: 'yellow',
  [ProjectStatus.COMPLETED]: 'gray',
  [ProjectStatus.CANCELLED]: 'red'
}

export const MATERIAL_STATUS_LABELS: Record<MaterialStatus, string> = {
  [MaterialStatus.PENDING]: 'Pending',
  [MaterialStatus.ORDERED]: 'Ordered',
  [MaterialStatus.SHIPPED]: 'Shipped',
  [MaterialStatus.ARRIVED]: 'Arrived',
  [MaterialStatus.INSTALLED]: 'Installed',
  [MaterialStatus.CANCELLED]: 'Cancelled'
}

export const MATERIAL_STATUS_COLORS: Record<MaterialStatus, string> = {
  [MaterialStatus.PENDING]: 'gray',
  [MaterialStatus.ORDERED]: 'blue',
  [MaterialStatus.SHIPPED]: 'yellow',
  [MaterialStatus.ARRIVED]: 'green',
  [MaterialStatus.INSTALLED]: 'emerald',
  [MaterialStatus.CANCELLED]: 'red'
}

// Localized status label functions
export function getProjectStatusLabel(status: ProjectStatus, t: (key: string) => string): string {
  const statusMap: Record<ProjectStatus, string> = {
    [ProjectStatus.PLANNING]: t('planning'),
    [ProjectStatus.ACTIVE]: t('active'),
    [ProjectStatus.ON_HOLD]: t('onHold'),
    [ProjectStatus.COMPLETED]: t('completed'),
    [ProjectStatus.CANCELLED]: t('cancelled')
  }
  return statusMap[status] || status
}

export function getMaterialStatusLabel(status: MaterialStatus, t: (key: string) => string): string {
  const statusMap: Record<MaterialStatus, string> = {
    [MaterialStatus.PENDING]: t('pending'),
    [MaterialStatus.ORDERED]: t('ordered'),
    [MaterialStatus.SHIPPED]: t('shipped'),
    [MaterialStatus.ARRIVED]: t('arrived'),
    [MaterialStatus.INSTALLED]: t('installed'),
    [MaterialStatus.CANCELLED]: t('cancelled')
  }
  return statusMap[status] || status
}

// Status workflow validation
export function getNextValidStatuses(currentStatus: ProjectStatus): ProjectStatus[] {
  switch (currentStatus) {
    case ProjectStatus.PLANNING:
      return [ProjectStatus.ACTIVE, ProjectStatus.CANCELLED]
    case ProjectStatus.ACTIVE:
      return [ProjectStatus.ON_HOLD, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED]
    case ProjectStatus.ON_HOLD:
      return [ProjectStatus.ACTIVE, ProjectStatus.CANCELLED]
    case ProjectStatus.COMPLETED:
      return [ProjectStatus.ACTIVE] // Allow reopening
    case ProjectStatus.CANCELLED:
      return [ProjectStatus.PLANNING, ProjectStatus.ACTIVE] // Allow reactivation
    default:
      return []
  }
}

export function getNextValidMaterialStatuses(currentStatus: MaterialStatus): MaterialStatus[] {
  switch (currentStatus) {
    case MaterialStatus.PENDING:
      return [MaterialStatus.ORDERED, MaterialStatus.CANCELLED]
    case MaterialStatus.ORDERED:
      return [MaterialStatus.SHIPPED, MaterialStatus.CANCELLED]
    case MaterialStatus.SHIPPED:
      return [MaterialStatus.ARRIVED, MaterialStatus.CANCELLED]
    case MaterialStatus.ARRIVED:
      return [MaterialStatus.INSTALLED, MaterialStatus.CANCELLED]
    case MaterialStatus.INSTALLED:
      return [] // Final state
    case MaterialStatus.CANCELLED:
      return [MaterialStatus.PENDING] // Allow restart
    default:
      return []
  }
}

// Cost calculation aggregations
export interface ProjectCostSummary {
  totalBudget: number
  totalActualCost: number
  totalMaterialCost: number
  totalLaborCost: number
  totalMachineryCost: number
  totalWorkforceCost: number
  remainingBudget: number
  budgetUtilization: number // percentage
  averageCostPerMaterial: number
  costByStatus: Record<MaterialStatus, number>
  workforceBreakdown: {
    totalLaborHours: number
    totalMachineryHours: number
    uniqueWorkers: number
    uniqueMachinery: number
    averageDailyCost: number
    daysWorked: number
  }
}

// Enhanced task-based budget tracking
export interface TaskBasedBudgetSummary {
  totalBudget: number
  totalActualCost: number
  estimatedTotalCost: number
  remainingBudget: number
  budgetUtilization: number // percentage
  projectedOverrun: number
  
  // Cost breakdown
  materialCosts: number
  laborCosts: number
  machineryCosts: number
  taskRelatedCosts: number
  
  // Task-based cost analysis
  costByTaskType: Record<string, {
    budgetAllocated: number
    actualCost: number
    estimatedCost: number
    variance: number
    utilizationPercentage: number
  }>
  
  // Budget alerts and warnings
  budgetAlerts: Array<{
    type: 'warning' | 'critical' | 'info'
    message: string
    taskId?: string
    category: 'budget' | 'timeline' | 'resource'
  }>
  
  // Cost trends and forecasting
  costTrend: Array<{
    date: Date
    actualCost: number
    budgetUsed: number
    projectedCost: number
  }>
  
  workforceBreakdown: {
    totalLaborHours: number
    totalMachineryHours: number
    totalLaborCost: number
    totalMachineryCost: number
    averageHourlyRates: {
      labor: number
      machinery: number
    }
    costByTask: Record<string, number>
  }
}

export async function calculateProjectCosts(project: Project): Promise<ProjectCostSummary> {
  const materials = await getProjectMaterials(project.id)
  
  const totalMaterialCost = materials.reduce((sum, material) => sum + (material.cost || 0), 0)
  
  // Get workforce costs from Daily Journal
  const workforceData = await calculateProjectWorkforceCosts(project.id)
  
  const totalWorkforceCost = workforceData.totalLaborCost + workforceData.totalMachineryCost
  const totalActualCost = totalMaterialCost + totalWorkforceCost
  const totalBudget = project.totalBudget || 0
  const remainingBudget = totalBudget - totalActualCost
  const budgetUtilization = totalBudget > 0 ? (totalActualCost / totalBudget) * 100 : 0
  const averageCostPerMaterial = materials.length > 0 ? totalMaterialCost / materials.length : 0

  const costByStatus: Record<MaterialStatus, number> = {
    [MaterialStatus.PENDING]: 0,
    [MaterialStatus.ORDERED]: 0,
    [MaterialStatus.SHIPPED]: 0,
    [MaterialStatus.ARRIVED]: 0,
    [MaterialStatus.INSTALLED]: 0,
    [MaterialStatus.CANCELLED]: 0
  }

  materials.forEach(material => {
    costByStatus[material.status] += material.cost || 0
  })

  return {
    totalBudget,
    totalActualCost,
    totalMaterialCost,
    totalLaborCost: workforceData.totalLaborCost,
    totalMachineryCost: workforceData.totalMachineryCost,
    totalWorkforceCost,
    remainingBudget,
    budgetUtilization,
    averageCostPerMaterial,
    costByStatus,
    workforceBreakdown: {
      totalLaborHours: workforceData.totalLaborHours,
      totalMachineryHours: workforceData.totalMachineryHours,
      uniqueWorkers: workforceData.uniqueWorkers,
      uniqueMachinery: workforceData.uniqueMachinery,
      averageDailyCost: workforceData.averageDailyCost,
      daysWorked: workforceData.daysWorked
    }
  }
}

// New function to calculate workforce costs for a project
export async function calculateProjectWorkforceCosts(projectId: string, monthsBack: number = 12) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - monthsBack)
  
  const daysToCheck = eachDayOfInterval({ start: startDate, end: endDate })
  
  let totalLaborHours = 0
  let totalMachineryHours = 0
  let totalLaborCost = 0
  let totalMachineryCost = 0
  const uniqueWorkers = new Set<string>()
  const uniqueMachinery = new Set<string>()
  const workDays: Date[] = []
  
  for (const day of daysToCheck) {
    try {
      const timesheet = await getDailyJournalTimesheetByDate(day)
      if (timesheet) {
        // Filter entries for this project
        const projectWorkers = timesheet.workerEntries.filter(entry =>
          entry.projectHours.some(ph => ph.projectId === projectId)
        )
        
        const projectMachinery = timesheet.machineryEntries.filter(entry =>
          entry.projectHours.some(ph => ph.projectId === projectId)
        )
        
        if (projectWorkers.length > 0 || projectMachinery.length > 0) {
          workDays.push(day)
          
          // Calculate project-specific hours and costs
          projectWorkers.forEach(worker => {
            const projectHours = worker.projectHours
              .filter(ph => ph.projectId === projectId)
              .reduce((sum, ph) => sum + ph.hours, 0)
            const projectCost = worker.projectHours
              .filter(ph => ph.projectId === projectId)
              .reduce((sum, ph) => sum + ph.cost, 0)
            
            totalLaborHours += projectHours
            totalLaborCost += projectCost
            uniqueWorkers.add(worker.workerId)
          })
          
          projectMachinery.forEach(machine => {
            const projectHours = machine.projectHours
              .filter(ph => ph.projectId === projectId)
              .reduce((sum, ph) => sum + ph.hours, 0)
            const projectCost = machine.projectHours
              .filter(ph => ph.projectId === projectId)
              .reduce((sum, ph) => sum + ph.cost, 0)
            
            totalMachineryHours += projectHours
            totalMachineryCost += projectCost
            uniqueMachinery.add(machine.machineryId)
          })
        }
      }
    } catch (error) {
      // Skip days with errors
      continue
    }
  }
  
  const daysWorked = workDays.length
  const totalWorkforceCost = totalLaborCost + totalMachineryCost
  const averageDailyCost = daysWorked > 0 ? totalWorkforceCost / daysWorked : 0
  
  return {
    totalLaborHours,
    totalMachineryHours,
    totalLaborCost,
    totalMachineryCost,
    totalWorkforceCost,
    uniqueWorkers: uniqueWorkers.size,
    uniqueMachinery: uniqueMachinery.size,
    daysWorked,
    averageDailyCost
  }
}

// Enhanced task-based budget calculation
export async function calculateTaskBasedBudget(project: Project): Promise<TaskBasedBudgetSummary> {
  const [tasks, materials, workforceData] = await Promise.all([
    getProjectTasks(project.id),
    getProjectMaterials(project.id),
    calculateProjectWorkforceCosts(project.id)
  ])
  
  const totalBudget = project.totalBudget || 0
  
  // Calculate actual costs
  const materialCosts = materials.reduce((sum, material) => sum + (material.totalCost || 0), 0)
  const laborCosts = workforceData.totalLaborCost
  const machineryCosts = workforceData.totalMachineryCost
  
  // Calculate task-related costs (simplified - could be enhanced with task-specific budgets)
  const taskRelatedCosts = 0 // Placeholder for future task-specific cost tracking
  
  const totalActualCost = materialCosts + laborCosts + machineryCosts + taskRelatedCosts
  
  // Estimate total cost based on task progress
  const taskProgress = calculateTaskProgress(tasks)
  const estimatedTotalCost = taskProgress.completionPercentage > 0 
    ? (totalActualCost / taskProgress.completionPercentage) * 100
    : totalActualCost
  
  const remainingBudget = totalBudget - totalActualCost
  const budgetUtilization = totalBudget > 0 ? (totalActualCost / totalBudget) * 100 : 0
  const projectedOverrun = Math.max(0, estimatedTotalCost - totalBudget)
  
  // Cost analysis by task type
  const costByTaskType: Record<string, {
    budgetAllocated: number
    actualCost: number
    estimatedCost: number
    variance: number
    utilizationPercentage: number
  }> = {}
  
  // Simple allocation: distribute budget evenly across task types for now
  const taskTypes = [...new Set(tasks.map(t => t.type))]
  const budgetPerTaskType = totalBudget / Math.max(taskTypes.length, 1)
  
  taskTypes.forEach(taskType => {
    const typeTasks = tasks.filter(t => t.type === taskType)
    const completedTasks = typeTasks.filter(t => t.status === TaskStatus.COMPLETED).length
    const totalTypeTasks = typeTasks.length
    
    // Rough cost allocation based on completion
    const actualCost = totalTypeTasks > 0 ? (totalActualCost * completedTasks) / totalTypeTasks : 0
    const progressPercentage = totalTypeTasks > 0 ? (completedTasks / totalTypeTasks) * 100 : 0
    const estimatedCost = progressPercentage > 0 ? (actualCost / progressPercentage) * 100 : actualCost
    
    costByTaskType[taskType] = {
      budgetAllocated: budgetPerTaskType,
      actualCost,
      estimatedCost,
      variance: budgetPerTaskType - estimatedCost,
      utilizationPercentage: budgetPerTaskType > 0 ? (actualCost / budgetPerTaskType) * 100 : 0
    }
  })
  
  // Generate budget alerts
  const budgetAlerts: Array<{
    type: 'warning' | 'critical' | 'info'
    message: string
    taskId?: string
    category: 'budget' | 'timeline' | 'resource'
  }> = []
  
  if (budgetUtilization > 90) {
    budgetAlerts.push({
      type: 'critical',
      message: `Project has used ${budgetUtilization.toFixed(1)}% of budget`,
      category: 'budget'
    })
  } else if (budgetUtilization > 75) {
    budgetAlerts.push({
      type: 'warning',
      message: `Project approaching budget limit (${budgetUtilization.toFixed(1)}% used)`,
      category: 'budget'
    })
  }
  
  if (projectedOverrun > 0) {
    budgetAlerts.push({
      type: 'warning',
      message: `Projected cost overrun of $${projectedOverrun.toFixed(2)}`,
      category: 'budget'
    })
  }
  
  // Find overdue tasks that might impact budget
  const overdueTasks = tasks.filter(task => 
    task.scheduledEnd && 
    new Date(task.scheduledEnd) < new Date() && 
    task.status !== TaskStatus.COMPLETED &&
    task.status !== TaskStatus.CANCELLED
  )
  
  if (overdueTasks.length > 0) {
    budgetAlerts.push({
      type: 'warning',
      message: `${overdueTasks.length} overdue tasks may impact budget`,
      category: 'timeline'
    })
  }
  
  // Simple cost trend (last 30 days)
  const costTrend: Array<{
    date: Date
    actualCost: number
    budgetUsed: number
    projectedCost: number
  }> = []
  
  // For now, just add current snapshot - could be enhanced with historical data
  costTrend.push({
    date: new Date(),
    actualCost: totalActualCost,
    budgetUsed: budgetUtilization,
    projectedCost: estimatedTotalCost
  })
  
  // Calculate cost by task (simplified)
  const costByTask: Record<string, number> = {}
  tasks.forEach(task => {
    if (task.status === TaskStatus.COMPLETED) {
      // Simple allocation based on task completion
      costByTask[task.id] = totalActualCost / Math.max(taskProgress.completedTasks, 1)
    }
  })
  
  return {
    totalBudget,
    totalActualCost,
    estimatedTotalCost,
    remainingBudget,
    budgetUtilization,
    projectedOverrun,
    materialCosts,
    laborCosts,
    machineryCosts,
    taskRelatedCosts,
    costByTaskType,
    budgetAlerts,
    costTrend,
    workforceBreakdown: {
      totalLaborHours: workforceData.totalLaborHours,
      totalMachineryHours: workforceData.totalMachineryHours,
      totalLaborCost: workforceData.totalLaborCost,
      totalMachineryCost: workforceData.totalMachineryCost,
      averageHourlyRates: {
        labor: workforceData.totalLaborHours > 0 ? workforceData.totalLaborCost / workforceData.totalLaborHours : 0,
        machinery: workforceData.totalMachineryHours > 0 ? workforceData.totalMachineryCost / workforceData.totalMachineryHours : 0
      },
      costByTask
    }
  }
}

// Progress tracking utilities
export interface ProjectProgress {
  totalMaterials: number
  materialsByStatus: Record<MaterialStatus, number>
  completionPercentage: number
  materialsInstalled: number
  materialsInProgress: number
  materialsPending: number
  estimatedDaysRemaining?: number
  isOnSchedule: boolean
  milestones: ProjectMilestone[]
}

// Task-based progress tracking
export interface TaskBasedProjectProgress {
  taskProgress: TaskProgressSummary
  completionPercentage: number
  weightedProgress: number
  estimatedDaysRemaining?: number
  isOnSchedule: boolean
  criticalTasks: ProjectTask[]
  upcomingDeadlines: Array<{
    task: ProjectTask
    daysUntilDeadline: number
  }>
  progressByTaskType: Record<string, {
    completed: number
    total: number
    percentage: number
  }>
}

// ProjectMilestone is now defined in types.ts with enhanced functionality

export async function calculateProjectProgress(project: Project): Promise<ProjectProgress> {
  const materials = await getProjectMaterials(project.id)
  
  const materialsByStatus: Record<MaterialStatus, number> = {
    [MaterialStatus.PENDING]: 0,
    [MaterialStatus.ORDERED]: 0,
    [MaterialStatus.SHIPPED]: 0,
    [MaterialStatus.ARRIVED]: 0,
    [MaterialStatus.INSTALLED]: 0,
    [MaterialStatus.CANCELLED]: 0
  }

  materials.forEach(material => {
    materialsByStatus[material.status]++
  })

  const totalMaterials = materials.length
  const materialsInstalled = materialsByStatus[MaterialStatus.INSTALLED]
  const materialsInProgress = materialsByStatus[MaterialStatus.ORDERED] + 
                              materialsByStatus[MaterialStatus.SHIPPED] + 
                              materialsByStatus[MaterialStatus.ARRIVED]
  const materialsPending = materialsByStatus[MaterialStatus.PENDING]
  
  const completionPercentage = totalMaterials > 0 ? (materialsInstalled / totalMaterials) * 100 : 0

  // Simple timeline calculation
  let estimatedDaysRemaining: number | undefined
  let isOnSchedule = true

  if (project.deadline) {
    const now = new Date()
    const deadline = new Date(project.deadline)
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // Rough estimation based on current progress
    if (completionPercentage > 0) {
      const totalEstimatedDays = (100 / completionPercentage) * 
        Math.ceil((now.getTime() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      estimatedDaysRemaining = Math.max(0, totalEstimatedDays - 
        Math.ceil((now.getTime() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24)))
      isOnSchedule = estimatedDaysRemaining <= daysUntilDeadline
    }
  }

  // Generate automatic milestones
  const milestones: ProjectMilestone[] = [
    {
      id: 'planning',
      name: 'Planning Complete',
      status: project.status !== ProjectStatus.PLANNING ? 'completed' : 'in-progress',
      percentage: 10
    },
    {
      id: 'materials-ordered',
      name: 'All Materials Ordered',
      status: materialsPending === 0 ? 'completed' : 
              materialsByStatus[MaterialStatus.ORDERED] > 0 ? 'in-progress' : 'pending',
      percentage: 30
    },
    {
      id: 'materials-arrived',
      name: 'All Materials Arrived',
      status: materialsByStatus[MaterialStatus.PENDING] === 0 && 
              materialsByStatus[MaterialStatus.ORDERED] === 0 && 
              materialsByStatus[MaterialStatus.SHIPPED] === 0 ? 'completed' : 
              materialsByStatus[MaterialStatus.ARRIVED] > 0 ? 'in-progress' : 'pending',
      percentage: 60
    },
    {
      id: 'installation-complete',
      name: 'Installation Complete',
      status: completionPercentage === 100 ? 'completed' : 
              materialsInstalled > 0 ? 'in-progress' : 'pending',
      percentage: 100
    }
  ]

  return {
    totalMaterials,
    materialsByStatus,
    completionPercentage,
    materialsInstalled,
    materialsInProgress,
    materialsPending,
    estimatedDaysRemaining,
    isOnSchedule,
    milestones
  }
}

// New task-based progress calculation
export async function calculateTaskBasedProjectProgress(project: Project): Promise<TaskBasedProjectProgress> {
  const tasks = await getProjectTasks(project.id)
  const taskProgress = calculateTaskProgress(tasks)
  
  // Use the weighted progress as the main completion percentage
  const completionPercentage = taskProgress.weightedProgress
  
  // Calculate timeline estimation
  let estimatedDaysRemaining: number | undefined
  let isOnSchedule = true
  
  if (project.deadline && tasks.length > 0) {
    const now = new Date()
    const deadline = new Date(project.deadline)
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    // Enhanced estimation based on task progress and velocity
    if (completionPercentage > 0) {
      const projectStartDate = new Date(project.createdAt)
      const daysSinceStart = Math.ceil((now.getTime() - projectStartDate.getTime()) / (1000 * 60 * 60 * 24))
      const velocity = completionPercentage / Math.max(daysSinceStart, 1) // progress per day
      
      if (velocity > 0) {
        const remainingProgress = 100 - completionPercentage
        estimatedDaysRemaining = Math.ceil(remainingProgress / velocity)
        isOnSchedule = estimatedDaysRemaining <= daysUntilDeadline
      }
    } else if (daysUntilDeadline > 0) {
      // No progress yet, assume linear distribution
      estimatedDaysRemaining = daysUntilDeadline
      isOnSchedule = true // Optimistic assumption
    }
  }
  
  // Identify critical tasks (high priority, not completed, has dependencies or blocks others)
  const criticalTasks = tasks.filter(task => 
    task.status !== TaskStatus.COMPLETED && 
    task.status !== TaskStatus.CANCELLED &&
    (task.priority === 'critical' || task.priority === 'high' || 
     task.dependencies.length > 0 || 
     tasks.some(t => t.dependencies.includes(task.id)))
  )
  
  // Find upcoming task deadlines
  const upcomingDeadlines = tasks
    .filter(task => 
      task.scheduledEnd && 
      task.status !== TaskStatus.COMPLETED && 
      task.status !== TaskStatus.CANCELLED
    )
    .map(task => {
      const daysUntilDeadline = Math.ceil(
        (new Date(task.scheduledEnd!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      return { task, daysUntilDeadline }
    })
    .filter(item => item.daysUntilDeadline >= 0 && item.daysUntilDeadline <= 14) // Next 2 weeks
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)
  
  // Calculate progress by task type
  const progressByTaskType: Record<string, { completed: number; total: number; percentage: number }> = {}
  
  tasks.forEach(task => {
    const type = task.type
    if (!progressByTaskType[type]) {
      progressByTaskType[type] = { completed: 0, total: 0, percentage: 0 }
    }
    
    progressByTaskType[type].total++
    if (task.status === TaskStatus.COMPLETED) {
      progressByTaskType[type].completed++
    }
  })
  
  // Calculate percentages
  Object.keys(progressByTaskType).forEach(type => {
    const data = progressByTaskType[type]
    data.percentage = data.total > 0 ? (data.completed / data.total) * 100 : 0
  })
  
  return {
    taskProgress,
    completionPercentage,
    weightedProgress: taskProgress.weightedProgress,
    estimatedDaysRemaining,
    isOnSchedule,
    criticalTasks,
    upcomingDeadlines,
    progressByTaskType
  }
}

// Project filtering and sorting
export interface ProjectFilters {
  status?: ProjectStatus[]
  client?: string
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  budgetRange?: {
    min: number
    max: number
  }
  hasDeadline?: boolean
  isOverdue?: boolean
}

export function filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
  return projects.filter(project => {
    // Status filter
    if (filters.status && filters.status.length > 0 && !filters.status.includes(project.status)) {
      return false
    }

    // Client filter
    if (filters.client && (!project.client || !project.client.toLowerCase().includes(filters.client.toLowerCase()))) {
      return false
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        project.tags.some(projectTag => projectTag.toLowerCase().includes(tag.toLowerCase()))
      )
      if (!hasMatchingTag) return false
    }

    // Date range filter
    if (filters.dateRange) {
      const projectDate = new Date(project.createdAt)
      if (projectDate < filters.dateRange.start || projectDate > filters.dateRange.end) {
        return false
      }
    }

    // Budget range filter
    if (filters.budgetRange && project.totalBudget) {
      if (project.totalBudget < filters.budgetRange.min || project.totalBudget > filters.budgetRange.max) {
        return false
      }
    }

    // Has deadline filter
    if (filters.hasDeadline !== undefined) {
      const hasDeadline = !!project.deadline
      if (hasDeadline !== filters.hasDeadline) return false
    }

    // Overdue filter
    if (filters.isOverdue && project.deadline) {
      const isOverdue = new Date() > new Date(project.deadline)
      if (!isOverdue) return false
    }

    return true
  })
}

export type ProjectSortField = 'name' | 'createdAt' | 'updatedAt' | 'deadline' | 'status' | 'budget'
export type SortDirection = 'asc' | 'desc'

export function sortProjects(projects: Project[], field: ProjectSortField, direction: SortDirection = 'desc'): Project[] {
  return [...projects].sort((a, b) => {
    let comparison = 0

    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        break
      case 'deadline':
        const deadlineA = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER
        const deadlineB = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER
        comparison = deadlineA - deadlineB
        break
      case 'status':
        comparison = a.status.localeCompare(b.status)
        break
      case 'budget':
        const budgetA = a.totalBudget || 0
        const budgetB = b.totalBudget || 0
        comparison = budgetA - budgetB
        break
    }

    return direction === 'asc' ? comparison : -comparison
  })
}

// Project statistics calculations
export interface ProjectStatistics {
  totalProjects: number
  projectsByStatus: Record<ProjectStatus, number>
  averageProjectDuration: number // in days
  averageBudget: number
  totalBudget: number
  totalMaterialCosts: number
  totalWorkforceCosts: number
  totalProjectCosts: number
  completionRate: number // percentage
  overdueProjects: number
  projectsWithDeadlines: number
  mostCommonTags: Array<{ tag: string; count: number }>
  recentActivity: Array<{
    projectId: string
    projectName: string
    action: string
    date: Date
  }>
  workforceStats: {
    totalLaborHours: number
    totalMachineryHours: number
    averageProjectLaborCost: number
    averageProjectMachineryCost: number
    projectsWithWorkforce: number
  }
}

export async function calculateProjectStatistics(): Promise<ProjectStatistics> {
  const projects = await getAllProjects()
  
  const projectsByStatus: Record<ProjectStatus, number> = {
    [ProjectStatus.PLANNING]: 0,
    [ProjectStatus.ACTIVE]: 0,
    [ProjectStatus.ON_HOLD]: 0,
    [ProjectStatus.COMPLETED]: 0,
    [ProjectStatus.CANCELLED]: 0
  }

  let totalBudget = 0
  let totalMaterialCosts = 0
  let totalWorkforceCosts = 0
  let totalDuration = 0
  let completedProjects = 0
  let overdueProjects = 0
  let projectsWithDeadlines = 0
  let totalLaborHours = 0
  let totalMachineryHours = 0
  let projectsWithWorkforce = 0
  const tagCounts: Record<string, number> = {}

  const now = new Date()

  // Calculate costs for all projects
  const allProjectCosts = await Promise.all(
    projects.map(async (project) => {
      try {
        return await calculateProjectCosts(project)
      } catch (error) {
        console.error(`Failed to calculate costs for project ${project.id}:`, error)
        return null
      }
    })
  )

  projects.forEach((project, index) => {
    projectsByStatus[project.status]++
    
    if (project.totalBudget) {
      totalBudget += project.totalBudget
    }

    const costs = allProjectCosts[index]
    if (costs) {
      totalMaterialCosts += costs.totalMaterialCost
      totalWorkforceCosts += costs.totalWorkforceCost
      totalLaborHours += costs.workforceBreakdown.totalLaborHours
      totalMachineryHours += costs.workforceBreakdown.totalMachineryHours
      
      if (costs.workforceBreakdown.daysWorked > 0) {
        projectsWithWorkforce++
      }
    }

    if (project.status === ProjectStatus.COMPLETED) {
      completedProjects++
      const duration = Math.ceil((project.updatedAt.getTime() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      totalDuration += duration
    }

    if (project.deadline) {
      projectsWithDeadlines++
      if (now > new Date(project.deadline) && 
          project.status !== ProjectStatus.COMPLETED && 
          project.status !== ProjectStatus.CANCELLED) {
        overdueProjects++
      }
    }

    project.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  const averageProjectDuration = completedProjects > 0 ? totalDuration / completedProjects : 0
  const averageBudget = projects.length > 0 ? totalBudget / projects.length : 0
  const completionRate = projects.length > 0 ? (completedProjects / projects.length) * 100 : 0
  const totalProjectCosts = totalMaterialCosts + totalWorkforceCosts

  const mostCommonTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Recent activity (simplified - based on updated dates)
  const recentActivity = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)
    .map(project => ({
      projectId: project.id,
      projectName: project.name,
      action: 'Updated',
      date: project.updatedAt
    }))

  return {
    totalProjects: projects.length,
    projectsByStatus,
    averageProjectDuration,
    averageBudget,
    totalBudget,
    totalMaterialCosts,
    totalWorkforceCosts,
    totalProjectCosts,
    completionRate,
    overdueProjects,
    projectsWithDeadlines,
    mostCommonTags,
    recentActivity,
    workforceStats: {
      totalLaborHours,
      totalMachineryHours,
      averageProjectLaborCost: projectsWithWorkforce > 0 ? totalWorkforceCosts / projectsWithWorkforce : 0,
      averageProjectMachineryCost: projectsWithWorkforce > 0 ? (totalWorkforceCosts * 0.4) / projectsWithWorkforce : 0, // Rough estimate
      projectsWithWorkforce
    }
  }
}

// Export/Import project data functions
export interface ProjectExportData {
  project: Project
  materials: ProjectMaterial[]
  calculations: Calculation[]
}

export async function exportProjectData(projectId: string): Promise<ProjectExportData> {
  const [project, materials, calculations] = await Promise.all([
    import('./database').then(db => db.getProject(projectId)),
    getProjectMaterials(projectId),
    getProjectCalculations(projectId)
  ])

  if (!project) {
    throw new Error('Project not found')
  }

  return {
    project,
    materials,
    calculations
  }
}

export function generateProjectReport(project: Project, progress: ProjectProgress, costs: ProjectCostSummary): string {
  const reportDate = new Date().toLocaleDateString()
  
  return `
# Project Report: ${project.name}
Generated on: ${reportDate}

## Project Overview
- **Status**: ${PROJECT_STATUS_LABELS[project.status]}
- **Client**: ${project.client || 'N/A'}
- **Location**: ${project.location || 'N/A'}
- **Created**: ${project.createdAt.toLocaleDateString()}
- **Deadline**: ${project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}

## Progress Summary
- **Completion**: ${progress.completionPercentage.toFixed(1)}%
- **Total Materials**: ${progress.totalMaterials}
- **Installed**: ${progress.materialsInstalled}
- **In Progress**: ${progress.materialsInProgress}
- **Pending**: ${progress.materialsPending}

## Budget Summary
- **Total Budget**: $${costs.totalBudget.toFixed(2)}
- **Actual Cost**: $${costs.totalActualCost.toFixed(2)}
- **Remaining**: $${costs.remainingBudget.toFixed(2)}
- **Utilization**: ${costs.budgetUtilization.toFixed(1)}%

## Material Status Breakdown
${Object.entries(progress.materialsByStatus)
  .filter(([_, count]) => count > 0)
  .map(([status, count]) => `- ${MATERIAL_STATUS_LABELS[status as MaterialStatus]}: ${count}`)
  .join('\n')}

## Notes
${project.notes || 'No notes available'}

---
*Report generated by Metal Calculator Pro*
  `.trim()
}

// Search and text utilities
export function searchProjects(projects: Project[], searchTerm: string): Project[] {
  if (!searchTerm.trim()) return projects

  const term = searchTerm.toLowerCase()
  
  return projects.filter(project => 
    project.name.toLowerCase().includes(term) ||
    project.description.toLowerCase().includes(term) ||
    project.client?.toLowerCase().includes(term) ||
    project.location?.toLowerCase().includes(term) ||
    project.notes.toLowerCase().includes(term) ||
    project.tags.some(tag => tag.toLowerCase().includes(term))
  )
}

export function generateProjectId(): string {
  return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateMaterialId(): string {
  return `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Validation utilities
export function validateProject(project: Partial<Project>): string[] {
  const errors: string[] = []

  if (!project.name?.trim()) {
    errors.push('Project name is required')
  }

  if (project.name && project.name.length > 100) {
    errors.push('Project name must be less than 100 characters')
  }

  if (project.totalBudget && project.totalBudget < 0) {
    errors.push('Budget cannot be negative')
  }

  if (project.deadline && new Date(project.deadline) <= new Date()) {
    errors.push('Deadline must be in the future')
  }

  return errors
}

export function validateMaterial(material: Partial<ProjectMaterial>): string[] {
  const errors: string[] = []

  if (!material.calculationId) {
    errors.push('Calculation ID is required')
  }

  if (!material.projectId) {
    errors.push('Project ID is required')
  }

  if (material.quantity !== undefined && material.quantity <= 0) {
    errors.push('Quantity must be greater than 0')
  }

  if (material.cost !== undefined && material.cost < 0) {
    errors.push('Cost cannot be negative')
  }

  return errors
} 