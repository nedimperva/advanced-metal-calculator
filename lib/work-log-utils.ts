import { type DailyWorkLog, type WorkEntry, WorkType, type DailyProgressEntry, type TimeProgress } from './types'

// ============================================================================
// WORK TYPE LABELS AND CONSTANTS
// ============================================================================

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  [WorkType.PREPARATION]: 'Preparation',
  [WorkType.FABRICATION]: 'Fabrication',
  [WorkType.WELDING]: 'Welding',
  [WorkType.INSTALLATION]: 'Installation',
  [WorkType.FINISHING]: 'Finishing',
  [WorkType.INSPECTION]: 'Inspection',
  [WorkType.CLEANUP]: 'Cleanup',
  [WorkType.OTHER]: 'Other'
}

export const WORK_TYPE_COLORS: Record<WorkType, string> = {
  [WorkType.PREPARATION]: 'bg-purple-100 text-purple-800',
  [WorkType.FABRICATION]: 'bg-blue-100 text-blue-800',
  [WorkType.WELDING]: 'bg-orange-100 text-orange-800',
  [WorkType.INSTALLATION]: 'bg-green-100 text-green-800',
  [WorkType.FINISHING]: 'bg-yellow-100 text-yellow-800',
  [WorkType.INSPECTION]: 'bg-indigo-100 text-indigo-800',
  [WorkType.CLEANUP]: 'bg-gray-100 text-gray-800',
  [WorkType.OTHER]: 'bg-slate-100 text-slate-800'
}

// Default hourly rates by work type (can be customized by user)
export const DEFAULT_HOURLY_RATES: Record<WorkType, number> = {
  [WorkType.PREPARATION]: 25,
  [WorkType.FABRICATION]: 35,
  [WorkType.WELDING]: 45,
  [WorkType.INSTALLATION]: 40,
  [WorkType.FINISHING]: 30,
  [WorkType.INSPECTION]: 50,
  [WorkType.CLEANUP]: 20,
  [WorkType.OTHER]: 30
}

// ============================================================================
// WORK LOG ANALYTICS AND CALCULATIONS
// ============================================================================

export interface WorkLogSummary {
  totalManHours: number
  totalCost: number
  averageWorkersPerDay: number
  workingDays: number
  workByType: Record<WorkType, WorkTypeStats>
  dailyAverages: {
    hours: number
    workers: number
    cost: number
  }
  topWorkType: WorkType
  productivity: number // hours per day
}

export interface WorkTypeStats {
  hours: number
  cost: number
  percentage: number
  days: number
}

export function calculateWorkLogSummary(workLogs: DailyWorkLog[]): WorkLogSummary {
  if (workLogs.length === 0) {
    return {
      totalManHours: 0,
      totalCost: 0,
      averageWorkersPerDay: 0,
      workingDays: 0,
      workByType: {} as Record<WorkType, WorkTypeStats>,
      dailyAverages: { hours: 0, workers: 0, cost: 0 },
      topWorkType: WorkType.OTHER,
      productivity: 0
    }
  }

  let totalManHours = 0
  let totalCost = 0
  let totalWorkerDays = 0
  const workByType: Record<WorkType, { hours: number; cost: number; days: Set<string> }> = {}

  // Initialize work types
  Object.values(WorkType).forEach(type => {
    workByType[type] = { hours: 0, cost: 0, days: new Set() }
  })

  // Process each work log
  workLogs.forEach(log => {
    const dayTotal = calculateDayTotal(log)
    totalManHours += dayTotal.manHours
    totalCost += dayTotal.cost
    totalWorkerDays += dayTotal.maxWorkers

    // Aggregate by work type
    log.entries.forEach(entry => {
      const entryHours = entry.workerCount * entry.hoursWorked
      const entryCost = entryHours * (entry.hourlyRate || DEFAULT_HOURLY_RATES[entry.workType])
      
      workByType[entry.workType].hours += entryHours
      workByType[entry.workType].cost += entryCost
      workByType[entry.workType].days.add(log.date.toDateString())
    })
  })

  // Calculate work type percentages and stats
  const workByTypeStats: Record<WorkType, WorkTypeStats> = {}
  let topWorkType = WorkType.OTHER
  let maxHours = 0

  Object.entries(workByType).forEach(([type, stats]) => {
    const percentage = totalManHours > 0 ? (stats.hours / totalManHours) * 100 : 0
    workByTypeStats[type as WorkType] = {
      hours: stats.hours,
      cost: stats.cost,
      percentage,
      days: stats.days.size
    }

    if (stats.hours > maxHours) {
      maxHours = stats.hours
      topWorkType = type as WorkType
    }
  })

  const workingDays = workLogs.length
  const averageWorkersPerDay = workingDays > 0 ? totalWorkerDays / workingDays : 0
  const productivity = workingDays > 0 ? totalManHours / workingDays : 0

  return {
    totalManHours,
    totalCost,
    averageWorkersPerDay,
    workingDays,
    workByType: workByTypeStats,
    dailyAverages: {
      hours: productivity,
      workers: averageWorkersPerDay,
      cost: workingDays > 0 ? totalCost / workingDays : 0
    },
    topWorkType,
    productivity
  }
}

export interface DayTotal {
  manHours: number
  cost: number
  maxWorkers: number
  workTypes: Set<WorkType>
}

export function calculateDayTotal(workLog: DailyWorkLog): DayTotal {
  let manHours = 0
  let cost = 0
  let maxWorkers = 0
  const workTypes = new Set<WorkType>()

  workLog.entries.forEach(entry => {
    const entryHours = entry.workerCount * entry.hoursWorked
    const entryCost = entryHours * (entry.hourlyRate || DEFAULT_HOURLY_RATES[entry.workType])
    
    manHours += entryHours
    cost += entryCost
    maxWorkers = Math.max(maxWorkers, entry.workerCount)
    workTypes.add(entry.workType)
  })

  return { manHours, cost, maxWorkers, workTypes }
}

// ============================================================================
// VELOCITY AND TREND ANALYSIS
// ============================================================================

export interface VelocityAnalysis {
  currentVelocity: number // hours per day (last 7 days)
  averageVelocity: number // hours per day (all time)
  trend: 'increasing' | 'decreasing' | 'stable'
  trendPercentage: number
  estimatedCompletion?: Date
  recommendations: string[]
}

export function analyzeProjectVelocity(
  workLogs: DailyWorkLog[], 
  estimatedTotalHours?: number
): VelocityAnalysis {
  if (workLogs.length === 0) {
    return {
      currentVelocity: 0,
      averageVelocity: 0,
      trend: 'stable',
      trendPercentage: 0,
      recommendations: ['Start logging work hours to track progress']
    }
  }

  // Sort by date
  const sortedLogs = [...workLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Calculate overall average velocity
  const totalHours = sortedLogs.reduce((sum, log) => sum + calculateDayTotal(log).manHours, 0)
  const averageVelocity = totalHours / sortedLogs.length

  // Calculate recent velocity (last 7 days or available days)
  const recentLogs = sortedLogs.slice(-7)
  const recentHours = recentLogs.reduce((sum, log) => sum + calculateDayTotal(log).manHours, 0)
  const currentVelocity = recentHours / recentLogs.length

  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  let trendPercentage = 0

  if (sortedLogs.length >= 3) {
    const firstHalf = sortedLogs.slice(0, Math.floor(sortedLogs.length / 2))
    const secondHalf = sortedLogs.slice(Math.floor(sortedLogs.length / 2))
    
    const firstHalfAvg = firstHalf.reduce((sum, log) => sum + calculateDayTotal(log).manHours, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, log) => sum + calculateDayTotal(log).manHours, 0) / secondHalf.length
    
    trendPercentage = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0
    
    if (Math.abs(trendPercentage) > 10) {
      trend = trendPercentage > 0 ? 'increasing' : 'decreasing'
    }
  }

  // Estimate completion date
  let estimatedCompletion: Date | undefined
  if (estimatedTotalHours && currentVelocity > 0) {
    const remainingHours = estimatedTotalHours - totalHours
    if (remainingHours > 0) {
      const remainingDays = Math.ceil(remainingHours / currentVelocity)
      estimatedCompletion = new Date()
      estimatedCompletion.setDate(estimatedCompletion.getDate() + remainingDays)
    }
  }

  // Generate recommendations
  const recommendations = generateVelocityRecommendations(currentVelocity, averageVelocity, trend, workLogs)

  return {
    currentVelocity,
    averageVelocity,
    trend,
    trendPercentage,
    estimatedCompletion,
    recommendations
  }
}

function generateVelocityRecommendations(
  currentVelocity: number,
  averageVelocity: number,
  trend: 'increasing' | 'decreasing' | 'stable',
  workLogs: DailyWorkLog[]
): string[] {
  const recommendations: string[] = []

  if (currentVelocity < averageVelocity * 0.8) {
    recommendations.push('Current pace is below average. Consider increasing crew size or working hours.')
  }

  if (trend === 'decreasing') {
    recommendations.push('Work velocity is decreasing. Check for potential blockers or fatigue.')
  }

  if (trend === 'increasing') {
    recommendations.push('Great! Work velocity is increasing. Keep up the momentum.')
  }

  // Check for gaps in logging
  const daysBetween = calculateDaysBetween(workLogs)
  if (daysBetween > 2) {
    recommendations.push('Consider logging work daily for better progress tracking.')
  }

  // Check work distribution
  const summary = calculateWorkLogSummary(workLogs)
  if (summary.workByType[WorkType.WELDING]?.percentage > 50) {
    recommendations.push('High concentration of welding work. Ensure adequate safety measures.')
  }

  return recommendations
}

function calculateDaysBetween(workLogs: DailyWorkLog[]): number {
  if (workLogs.length < 2) return 0
  
  const dates = workLogs.map(log => new Date(log.date)).sort((a, b) => a.getTime() - b.getTime())
  let totalGaps = 0
  let gapCount = 0
  
  for (let i = 1; i < dates.length; i++) {
    const daysDiff = Math.floor((dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 1) {
      totalGaps += daysDiff - 1
      gapCount++
    }
  }
  
  return gapCount > 0 ? totalGaps / gapCount : 0
}

// ============================================================================
// WORK LOG VALIDATION AND HELPERS
// ============================================================================

export interface WorkLogValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateWorkLog(workLog: Partial<DailyWorkLog>): WorkLogValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required fields
  if (!workLog.projectId) {
    errors.push('Project ID is required')
  }

  if (!workLog.date) {
    errors.push('Date is required')
  }

  if (!workLog.entries || workLog.entries.length === 0) {
    errors.push('At least one work entry is required')
  }

  // Validate entries
  if (workLog.entries) {
    workLog.entries.forEach((entry, index) => {
      if (entry.workerCount <= 0) {
        errors.push(`Entry ${index + 1}: Worker count must be greater than 0`)
      }

      if (entry.hoursWorked <= 0) {
        errors.push(`Entry ${index + 1}: Hours worked must be greater than 0`)
      }

      if (entry.hoursWorked > 24) {
        warnings.push(`Entry ${index + 1}: Hours worked (${entry.hoursWorked}) seems unusually high`)
      }

      if (entry.workerCount > 20) {
        warnings.push(`Entry ${index + 1}: Worker count (${entry.workerCount}) seems unusually high`)
      }
    })
  }

  // Check for future dates
  if (workLog.date && new Date(workLog.date) > new Date()) {
    warnings.push('Work log date is in the future')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function validateWorkEntry(entry: Partial<WorkEntry>): WorkLogValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!entry.workerCount || entry.workerCount <= 0) {
    errors.push('Worker count must be greater than 0')
  }

  if (!entry.hoursWorked || entry.hoursWorked <= 0) {
    errors.push('Hours worked must be greater than 0')
  }

  if (!entry.workType) {
    errors.push('Work type is required')
  }

  if (entry.hoursWorked && entry.hoursWorked > 16) {
    warnings.push('Hours worked seems unusually high for a single entry')
  }

  if (entry.hourlyRate && entry.hourlyRate < 10) {
    warnings.push('Hourly rate seems unusually low')
  }

  if (entry.hourlyRate && entry.hourlyRate > 100) {
    warnings.push('Hourly rate seems unusually high')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================================================
// TIME PROGRESS CALCULATION
// ============================================================================

export function calculateTimeProgress(workLogs: DailyWorkLog[]): TimeProgress {
  if (workLogs.length === 0) {
    return {
      totalManHours: 0,
      workByType: {} as Record<WorkType, number>,
      dailyProgress: [],
      averageWorkersPerDay: 0,
      projectVelocity: 0
    }
  }

  const summary = calculateWorkLogSummary(workLogs)
  
  // Convert work by type stats to simple numbers
  const workByType: Record<WorkType, number> = {}
  Object.entries(summary.workByType).forEach(([type, stats]) => {
    workByType[type as WorkType] = stats.hours
  })

  // Create daily progress entries
  const dailyProgress: DailyProgressEntry[] = workLogs.map(log => {
    const dayTotal = calculateDayTotal(log)
    return {
      date: new Date(log.date),
      manHours: dayTotal.manHours,
      workerCount: dayTotal.maxWorkers,
      tasksCompleted: 0, // This would need to be calculated based on task completion
      notes: log.notes
    }
  })

  const velocityAnalysis = analyzeProjectVelocity(workLogs)

  return {
    totalManHours: summary.totalManHours,
    workByType,
    dailyProgress,
    averageWorkersPerDay: summary.averageWorkersPerDay,
    projectVelocity: velocityAnalysis.currentVelocity,
    estimatedCompletion: velocityAnalysis.estimatedCompletion
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function generateWorkEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function generateWorkLogId(): string {
  return `worklog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function formatWorkDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}min`
  } else if (hours === Math.floor(hours)) {
    return `${hours}h`
  } else {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}min`
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export function getWorkingDaysInRange(startDate: Date, endDate: Date): number {
  let workingDays = 0
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay()
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return workingDays
}

export function createDefaultWorkEntry(workType: WorkType = WorkType.INSTALLATION): Omit<WorkEntry, 'id'> {
  return {
    workerCount: 2,
    hoursWorked: 8,
    workType,
    hourlyRate: DEFAULT_HOURLY_RATES[workType],
    description: '',
    taskIds: []
  }
} 