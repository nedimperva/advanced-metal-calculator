import { 
  type Worker, 
  type Machinery, 
  type DailyTimesheet, 
  type DailyWorkerEntry, 
  type DailyMachineryEntry,
  WorkerSkill, 
  MachineryType 
} from './types'

// ============================================================================
// LABELS AND DISPLAY HELPERS
// ============================================================================

export const WORKER_SKILL_LABELS: Record<WorkerSkill, string> = {
  [WorkerSkill.GENERAL_LABOR]: 'General Labor',
  [WorkerSkill.WELDING]: 'Welding',
  [WorkerSkill.ELECTRICAL]: 'Electrical',
  [WorkerSkill.PLUMBING]: 'Plumbing',
  [WorkerSkill.CARPENTRY]: 'Carpentry',
  [WorkerSkill.MASONRY]: 'Masonry',
  [WorkerSkill.HEAVY_EQUIPMENT]: 'Heavy Equipment',
  [WorkerSkill.SUPERVISION]: 'Supervision',
  [WorkerSkill.SAFETY]: 'Safety',
  [WorkerSkill.CRANE_OPERATOR]: 'Crane Operator'
}

export const MACHINERY_TYPE_LABELS: Record<MachineryType, string> = {
  [MachineryType.EXCAVATOR]: 'Excavator',
  [MachineryType.CRANE]: 'Crane',
  [MachineryType.BULLDOZER]: 'Bulldozer',
  [MachineryType.FORKLIFT]: 'Forklift',
  [MachineryType.WELDING_MACHINE]: 'Welding Machine',
  [MachineryType.GENERATOR]: 'Generator',
  [MachineryType.COMPRESSOR]: 'Compressor',
  [MachineryType.CONCRETE_MIXER]: 'Concrete Mixer',
  [MachineryType.SCAFFOLD]: 'Scaffold',
  [MachineryType.TOOLS]: 'Tools',
  [MachineryType.VEHICLE]: 'Vehicle',
  [MachineryType.OTHER]: 'Other'
}

export const WORKER_SKILL_COLORS: Record<WorkerSkill, string> = {
  [WorkerSkill.GENERAL_LABOR]: 'bg-gray-100 text-gray-800',
  [WorkerSkill.WELDING]: 'bg-orange-100 text-orange-800',
  [WorkerSkill.ELECTRICAL]: 'bg-yellow-100 text-yellow-800',
  [WorkerSkill.PLUMBING]: 'bg-blue-100 text-blue-800',
  [WorkerSkill.CARPENTRY]: 'bg-amber-100 text-amber-800',
  [WorkerSkill.MASONRY]: 'bg-stone-100 text-stone-800',
  [WorkerSkill.HEAVY_EQUIPMENT]: 'bg-red-100 text-red-800',
  [WorkerSkill.SUPERVISION]: 'bg-purple-100 text-purple-800',
  [WorkerSkill.SAFETY]: 'bg-green-100 text-green-800',
  [WorkerSkill.CRANE_OPERATOR]: 'bg-indigo-100 text-indigo-800'
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateWorker(worker: Partial<Worker>): string[] {
  const errors: string[] = []
  
  if (!worker.name?.trim()) {
    errors.push('Worker name is required')
  }
  
  if (!worker.hourlyRate || worker.hourlyRate <= 0) {
    errors.push('Valid hourly rate is required')
  }
  
  if (!worker.skills || worker.skills.length === 0) {
    errors.push('At least one skill is required')
  }
  
  return errors
}

export function validateMachinery(machinery: Partial<Machinery>): string[] {
  const errors: string[] = []
  
  if (!machinery.name?.trim()) {
    errors.push('Machinery name is required')
  }
  
  if (!machinery.type) {
    errors.push('Machinery type is required')
  }
  
  if (!machinery.hourlyRate || machinery.hourlyRate <= 0) {
    errors.push('Valid hourly rate is required')
  }
  
  return errors
}

export function validateWorkerEntry(entry: Partial<DailyWorkerEntry>): string[] {
  const errors: string[] = []
  
  if (!entry.workerId) {
    errors.push('Worker is required')
  }
  
  if (!entry.hoursWorked || entry.hoursWorked <= 0 || entry.hoursWorked > 24) {
    errors.push('Hours worked must be between 0.1 and 24')
  }
  
  if (!entry.workDescription?.trim()) {
    errors.push('Work description is required')
  }
  
  return errors
}

export function validateMachineryEntry(entry: Partial<DailyMachineryEntry>): string[] {
  const errors: string[] = []
  
  if (!entry.machineryId) {
    errors.push('Machinery is required')
  }
  
  if (!entry.hoursUsed || entry.hoursUsed <= 0 || entry.hoursUsed > 24) {
    errors.push('Hours used must be between 0.1 and 24')
  }
  
  if (!entry.usageDescription?.trim()) {
    errors.push('Usage description is required')
  }
  
  return errors
}

export function validateTimesheet(timesheet: Partial<DailyTimesheet>): string[] {
  const errors: string[] = []
  
  if (!timesheet.projectId) {
    errors.push('Project ID is required')
  }
  
  if (!timesheet.date) {
    errors.push('Date is required')
  }
  
  if (!timesheet.workerEntries || timesheet.workerEntries.length === 0) {
    if (!timesheet.machineryEntries || timesheet.machineryEntries.length === 0) {
      errors.push('At least one worker or machinery entry is required')
    }
  }
  
  // Validate individual entries
  timesheet.workerEntries?.forEach((entry, index) => {
    const entryErrors = validateWorkerEntry(entry)
    entryErrors.forEach(error => errors.push(`Worker entry ${index + 1}: ${error}`))
  })
  
  timesheet.machineryEntries?.forEach((entry, index) => {
    const entryErrors = validateMachineryEntry(entry)
    entryErrors.forEach(error => errors.push(`Machinery entry ${index + 1}: ${error}`))
  })
  
  return errors
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

export function calculateWorkerEntryCost(entry: DailyWorkerEntry, workers: Worker[]): number {
  const worker = workers.find(w => w.id === entry.workerId)
  if (!worker) return 0
  
  return entry.hoursWorked * worker.hourlyRate
}

export function calculateMachineryEntryCost(entry: DailyMachineryEntry, machinery: Machinery[]): number {
  const machine = machinery.find(m => m.id === entry.machineryId)
  if (!machine) return 0
  
  return entry.hoursUsed * machine.hourlyRate
}

export function calculateTimesheetTotals(
  timesheet: DailyTimesheet, 
  workers: Worker[], 
  machinery: Machinery[]
): {
  totalLaborHours: number
  totalMachineryHours: number
  totalLaborCost: number
  totalMachineryCost: number
  totalCost: number
} {
  const totalLaborHours = timesheet.workerEntries.reduce((total, entry) => total + entry.hoursWorked, 0)
  const totalMachineryHours = timesheet.machineryEntries.reduce((total, entry) => total + entry.hoursUsed, 0)
  
  const totalLaborCost = timesheet.workerEntries.reduce((total, entry) => {
    return total + calculateWorkerEntryCost(entry, workers)
  }, 0)
  
  const totalMachineryCost = timesheet.machineryEntries.reduce((total, entry) => {
    return total + calculateMachineryEntryCost(entry, machinery)
  }, 0)
  
  const totalCost = totalLaborCost + totalMachineryCost
  
  return {
    totalLaborHours,
    totalMachineryHours,
    totalLaborCost,
    totalMachineryCost,
    totalCost
  }
}

// ============================================================================
// ANALYTICS AND REPORTING
// ============================================================================

export interface WorkforceAnalytics {
  totalWorkers: number
  totalMachinery: number
  totalTimesheets: number
  totalLaborHours: number
  totalMachineryCost: number
  totalLaborCost: number
  averageHoursPerDay: number
  mostActiveWorker?: {
    worker: Worker
    totalHours: number
  }
  mostUsedMachinery?: {
    machinery: Machinery
    totalHours: number
  }
  dailyAverages: {
    laborHours: number
    machineryCost: number
    workerCount: number
  }
}

export function calculateWorkforceAnalytics(
  timesheets: DailyTimesheet[],
  workers: Worker[],
  machinery: Machinery[]
): WorkforceAnalytics {
  const totalTimesheets = timesheets.length
  const totalLaborHours = timesheets.reduce((total, ts) => total + ts.totalLaborHours, 0)
  const totalMachineryCost = timesheets.reduce((total, ts) => total + ts.totalMachineryCost, 0)
  const totalLaborCost = timesheets.reduce((total, ts) => total + ts.totalLaborCost, 0)
  
  // Worker activity analysis
  const workerHours = new Map<string, number>()
  timesheets.forEach(timesheet => {
    timesheet.workerEntries.forEach(entry => {
      const current = workerHours.get(entry.workerId) || 0
      workerHours.set(entry.workerId, current + entry.hoursWorked)
    })
  })
  
  let mostActiveWorker
  let maxWorkerHours = 0
  workerHours.forEach((hours, workerId) => {
    if (hours > maxWorkerHours) {
      maxWorkerHours = hours
      const worker = workers.find(w => w.id === workerId)
      if (worker) {
        mostActiveWorker = { worker, totalHours: hours }
      }
    }
  })
  
  // Machinery usage analysis
  const machineryHours = new Map<string, number>()
  timesheets.forEach(timesheet => {
    timesheet.machineryEntries.forEach(entry => {
      const current = machineryHours.get(entry.machineryId) || 0
      machineryHours.set(entry.machineryId, current + entry.hoursUsed)
    })
  })
  
  let mostUsedMachinery
  let maxMachineryHours = 0
  machineryHours.forEach((hours, machineryId) => {
    if (hours > maxMachineryHours) {
      maxMachineryHours = hours
      const machine = machinery.find(m => m.id === machineryId)
      if (machine) {
        mostUsedMachinery = { machinery: machine, totalHours: hours }
      }
    }
  })
  
  return {
    totalWorkers: workers.length,
    totalMachinery: machinery.length,
    totalTimesheets,
    totalLaborHours,
    totalMachineryCost,
    totalLaborCost,
    averageHoursPerDay: totalTimesheets > 0 ? totalLaborHours / totalTimesheets : 0,
    mostActiveWorker,
    mostUsedMachinery,
    dailyAverages: {
      laborHours: totalTimesheets > 0 ? totalLaborHours / totalTimesheets : 0,
      machineryCost: totalTimesheets > 0 ? totalMachineryCost / totalTimesheets : 0,
      workerCount: totalTimesheets > 0 ? 
        timesheets.reduce((total, ts) => total + ts.workerEntries.length, 0) / totalTimesheets : 0
    }
  }
}

// ============================================================================
// TIMESHEET DUPLICATION HELPERS
// ============================================================================

export function createTimesheetTemplate(
  sourceTimesheet: DailyTimesheet,
  newDate: Date,
  projectId: string
): Omit<DailyTimesheet, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    projectId,
    date: newDate,
    workerEntries: sourceTimesheet.workerEntries.map(entry => ({
      ...entry,
      id: `worker_entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      hoursWorked: 0, // Reset to 0 for manual entry
      workDescription: entry.workDescription // Keep same description as template
    })),
    machineryEntries: sourceTimesheet.machineryEntries.map(entry => ({
      ...entry,
      id: `machinery_entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      hoursUsed: 0, // Reset to 0 for manual entry
      usageDescription: entry.usageDescription // Keep same description as template
    })),
    weatherConditions: '',
    notes: '',
    supervisorNotes: '',
    totalLaborHours: 0,
    totalMachineryHours: 0,
    totalLaborCost: 0,
    totalMachineryCost: 0
  }
}

// ============================================================================
// SEARCH AND FILTERING
// ============================================================================

export function filterWorkers(workers: Worker[], searchTerm: string, skillFilter?: WorkerSkill): Worker[] {
  return workers.filter(worker => {
    const matchesSearch = !searchTerm || 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSkill = !skillFilter || worker.skills.includes(skillFilter)
    
    return matchesSearch && matchesSkill && worker.isActive
  })
}

export function filterMachinery(machinery: Machinery[], searchTerm: string, typeFilter?: MachineryType): Machinery[] {
  return machinery.filter(machine => {
    const matchesSearch = !searchTerm || 
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.model?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !typeFilter || machine.type === typeFilter
    
    return matchesSearch && matchesType && machine.isActive
  })
}

export function sortWorkersByName(workers: Worker[]): Worker[] {
  return [...workers].sort((a, b) => a.name.localeCompare(b.name))
}

export function sortMachineryByName(machinery: Machinery[]): Machinery[] {
  return [...machinery].sort((a, b) => a.name.localeCompare(b.name))
}

export function sortTimesheetsByDate(timesheets: DailyTimesheet[], descending = true): DailyTimesheet[] {
  return [...timesheets].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return descending ? dateB - dateA : dateA - dateB
  })
} 