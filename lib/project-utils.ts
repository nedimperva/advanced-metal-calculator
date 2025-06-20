import type { Project, ProjectMaterial, Calculation, DailyJournalTimesheet, JournalWorkerEntry, JournalMachineryEntry, ProjectMilestone } from './types'
import { ProjectStatus, MaterialStatus } from './types'
import { getAllProjects, getProjectMaterials, getProjectCalculations, getDailyJournalTimesheetByDate } from './database'
import { startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

// Project status management functions
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