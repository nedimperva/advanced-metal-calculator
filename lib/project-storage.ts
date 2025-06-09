import { 
  Project, 
  ProjectSummary, 
  ProjectSettings, 
  Calculation,
  ProjectCalculation,
  ProjectFormData,
  ProjectExportData 
} from './types'

// Storage keys
const STORAGE_KEYS = {
  PROJECTS: 'metal-calculator-projects',
  CALCULATIONS: 'metal-calculations', // Reuse existing key
  PROJECT_SETTINGS: 'metal-calculator-project-settings',
  ACTIVE_PROJECT: 'metal-calculator-active-project'
} as const

// Default project colors for visual identification
const PROJECT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
  '#ec4899', '#6366f1', '#14b8a6', '#eab308'
]

// Utility functions for safe localStorage operations
const safeGetItem = (key: string): string | null => {
  try {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return null
  }
}

const safeSetItem = (key: string, value: string): boolean => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
      return true
    }
    return false
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
    return false
  }
}

const safeRemoveItem = (key: string): boolean => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
      return true
    }
    return false
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error)
    return false
  }
}

// Project Management Functions
export class ProjectStorage {
  // Get default project settings
  static getDefaultSettings(): ProjectSettings {
    return {
      activeProjectId: null,
      defaultProject: null,
      autoSaveToProject: true,
      showProjectInResults: true,
      projectViewMode: 'grid',
      defaultProjectStatus: 'active'
    }
  }

  // Load project settings
  static loadSettings(): ProjectSettings {
    const saved = safeGetItem(STORAGE_KEYS.PROJECT_SETTINGS)
    if (saved) {
      try {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) }
      } catch (error) {
        console.error('Error parsing project settings:', error)
      }
    }
    return this.getDefaultSettings()
  }

  // Save project settings
  static saveSettings(settings: Partial<ProjectSettings>): boolean {
    const current = this.loadSettings()
    const updated = { ...current, ...settings }
    return safeSetItem(STORAGE_KEYS.PROJECT_SETTINGS, JSON.stringify(updated))
  }

  // Get active project ID
  static getActiveProjectId(): string | null {
    return this.loadSettings().activeProjectId
  }

  // Set active project
  static setActiveProject(projectId: string | null): boolean {
    return this.saveSettings({ activeProjectId: projectId })
  }

  // Load all projects
  static loadProjects(): Project[] {
    const saved = safeGetItem(STORAGE_KEYS.PROJECTS)
    if (saved) {
      try {
        return JSON.parse(saved).map((project: any) => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt)
        }))
      } catch (error) {
        console.error('Error parsing projects:', error)
      }
    }
    return []
  }

  // Save projects array
  static saveProjects(projects: Project[]): boolean {
    return safeSetItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
  }

  // Create new project
  static createProject(formData: ProjectFormData): Project {
    const projects = this.loadProjects()
    const now = new Date()
    
    // Generate unique ID
    const id = `proj_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Assign color if not provided
    const color = formData.color || PROJECT_COLORS[projects.length % PROJECT_COLORS.length]
    
    const newProject: Project = {
      id,
      name: formData.name,
      description: formData.description,
      client: formData.client,
      location: formData.location,
      createdAt: now,
      updatedAt: now,
      calculationIds: [],
      status: formData.status,
      tags: formData.tags || [],
      defaultLengthUnit: formData.defaultLengthUnit,
      defaultWeightUnit: formData.defaultWeightUnit,
      color,
      calculationCount: 0,
      totalWeight: 0,
      totalCost: 0
    }

    const updatedProjects = [newProject, ...projects]
    this.saveProjects(updatedProjects)
    
    // Set as active if it's the first project or auto-save is enabled
    const settings = this.loadSettings()
    if (projects.length === 0 || settings.autoSaveToProject) {
      this.setActiveProject(id)
    }

    return newProject
  }

  // Update existing project
  static updateProject(projectId: string, updates: Partial<ProjectFormData>): boolean {
    const projects = this.loadProjects()
    const projectIndex = projects.findIndex(p => p.id === projectId)
    
    if (projectIndex === -1) return false
    
    const existingProject = projects[projectIndex]
    const updatedProject: Project = {
      ...existingProject,
      ...updates,
      updatedAt: new Date()
    }
    
    projects[projectIndex] = updatedProject
    return this.saveProjects(projects)
  }

  // Delete project and handle calculations
  static deleteProject(projectId: string, moveCalculationsTo?: string): boolean {
    const projects = this.loadProjects()
    const calculations = this.loadCalculations()
    
    // Filter out the project
    const updatedProjects = projects.filter(p => p.id !== projectId)
    
    // Handle calculations associated with this project
    const updatedCalculations = calculations.map(calc => {
      if (calc.projectId === projectId) {
        if (moveCalculationsTo) {
          // Move to another project
          const targetProject = projects.find(p => p.id === moveCalculationsTo)
          return {
            ...calc,
            projectId: moveCalculationsTo,
            projectName: targetProject?.name || 'Unknown Project'
          }
        } else {
          // Remove project association
          const { projectId, projectName, ...calcWithoutProject } = calc
          return calcWithoutProject
        }
      }
      return calc
    })
    
    // Update active project if we're deleting it
    const settings = this.loadSettings()
    if (settings.activeProjectId === projectId) {
      const newActiveId = updatedProjects.length > 0 ? updatedProjects[0].id : null
      this.setActiveProject(newActiveId)
    }
    
    // Save both projects and calculations
    const projectsSaved = this.saveProjects(updatedProjects)
    const calculationsSaved = this.saveCalculations(updatedCalculations)
    
    return projectsSaved && calculationsSaved
  }

  // Get project by ID
  static getProject(projectId: string): Project | null {
    const projects = this.loadProjects()
    return projects.find(p => p.id === projectId) || null
  }

  // Get active project
  static getActiveProject(): Project | null {
    const activeId = this.getActiveProjectId()
    return activeId ? this.getProject(activeId) : null
  }

  // Load calculations (reuse existing storage)
  static loadCalculations(): Calculation[] {
    const saved = safeGetItem(STORAGE_KEYS.CALCULATIONS)
    if (saved) {
      try {
        return JSON.parse(saved).map((calc: any) => ({
          ...calc,
          timestamp: new Date(calc.timestamp)
        }))
      } catch (error) {
        console.error('Error parsing calculations:', error)
      }
    }
    return []
  }

  // Save calculations
  static saveCalculations(calculations: Calculation[]): boolean {
    return safeSetItem(STORAGE_KEYS.CALCULATIONS, JSON.stringify(calculations))
  }

  // Add calculation to project
  static addCalculationToProject(calculation: Calculation, projectId?: string): Calculation {
    const targetProjectId = projectId || this.getActiveProjectId()
    
    if (!targetProjectId) {
      return calculation // Return as-is if no project context
    }
    
    const project = this.getProject(targetProjectId)
    if (!project) {
      return calculation // Return as-is if project not found
    }
    
    // Generate project-specific calculation number
    const projectCalculations = this.getProjectCalculations(targetProjectId)
    const calculationNumber = `${project.name.substring(0, 3).toUpperCase()}-${String(projectCalculations.length + 1).padStart(3, '0')}`
    
    // Enhanced calculation with project data
    const enhancedCalculation: Calculation = {
      ...calculation,
      projectId: targetProjectId,
      projectName: project.name,
      calculationNumber,
      tags: calculation.tags || []
    }
    
    // Update project's calculation IDs
    const updatedProject = {
      ...project,
      calculationIds: [...project.calculationIds, calculation.id],
      updatedAt: new Date()
    }
    
    // Update project in storage
    this.updateProject(targetProjectId, updatedProject)
    
    return enhancedCalculation
  }

  // Get calculations for a specific project
  static getProjectCalculations(projectId: string): Calculation[] {
    const calculations = this.loadCalculations()
    return calculations.filter(calc => calc.projectId === projectId)
  }

  // Move calculation between projects
  static moveCalculationToProject(calculationId: string, targetProjectId: string | null): boolean {
    const calculations = this.loadCalculations()
    const calculationIndex = calculations.findIndex(c => c.id === calculationId)
    
    if (calculationIndex === -1) return false
    
    const calculation = calculations[calculationIndex]
    const oldProjectId = calculation.projectId
    
    // Update calculation
    if (targetProjectId) {
      const targetProject = this.getProject(targetProjectId)
      if (!targetProject) return false
      
      calculations[calculationIndex] = {
        ...calculation,
        projectId: targetProjectId,
        projectName: targetProject.name
      }
      
      // Add to target project
      if (!targetProject.calculationIds.includes(calculationId)) {
        targetProject.calculationIds.push(calculationId)
        this.updateProject(targetProjectId, targetProject)
      }
    } else {
      // Remove project association
      const { projectId, projectName, ...calcWithoutProject } = calculation
      calculations[calculationIndex] = calcWithoutProject as Calculation
    }
    
    // Remove from old project
    if (oldProjectId) {
      const oldProject = this.getProject(oldProjectId)
      if (oldProject) {
        const updatedOldProject = {
          ...oldProject,
          calculationIds: oldProject.calculationIds.filter(id => id !== calculationId)
        }
        this.updateProject(oldProjectId, updatedOldProject)
      }
    }
    
    return this.saveCalculations(calculations)
  }

  // Calculate project summary statistics
  static calculateProjectSummary(): ProjectSummary {
    const projects = this.loadProjects()
    const calculations = this.loadCalculations()
    
    const materialCount: Record<string, number> = {}
    const profileCount: Record<string, number> = {}
    let totalWeight = 0
    let recentActivity = new Date(0)
    
    calculations.forEach(calc => {
      // Count materials and profiles
      const materialKey = `${calc.material}-${calc.grade}`
      materialCount[materialKey] = (materialCount[materialKey] || 0) + 1
      
      const profileKey = `${calc.profileCategory}-${calc.profileType}`
      profileCount[profileKey] = (profileCount[profileKey] || 0) + 1
      
      // Sum weights (assuming all in same unit for now)
      totalWeight += calc.weight || 0
      
      // Track recent activity
      if (calc.timestamp > recentActivity) {
        recentActivity = calc.timestamp
      }
    })
    
    // Convert to sorted arrays
    const topMaterials = Object.entries(materialCount)
      .map(([material, count]) => ({ material, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    const topProfiles = Object.entries(profileCount)
      .map(([profile, count]) => ({ profile, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      archivedProjects: projects.filter(p => p.status === 'archived').length,
      totalCalculations: calculations.length,
      totalWeight,
      recentActivity,
      topMaterials,
      topProfiles
    }
  }

  // Export project data
  static exportProject(projectId: string): ProjectExportData | null {
    const project = this.getProject(projectId)
    if (!project) return null
    
    const calculations = this.getProjectCalculations(projectId)
    
    // Calculate material and profile breakdowns
    const materialBreakdown: Record<string, number> = {}
    const profileBreakdown: Record<string, number> = {}
    let totalWeight = 0
    
    calculations.forEach(calc => {
      const materialKey = `${calc.materialName} (${calc.grade})`
      materialBreakdown[materialKey] = (materialBreakdown[materialKey] || 0) + (calc.weight || 0)
      
      const profileKey = `${calc.profileName} ${calc.standardSize !== 'Custom' ? calc.standardSize : 'Custom'}`
      profileBreakdown[profileKey] = (profileBreakdown[profileKey] || 0) + (calc.weight || 0)
      
      totalWeight += calc.weight || 0
    })
    
    return {
      project,
      calculations,
      summary: {
        totalWeight,
        totalCalculations: calculations.length,
        materialBreakdown,
        profileBreakdown,
        exportDate: new Date()
      }
    }
  }

  // Update project summary data (recalculate totals)
  static updateProjectSummary(projectId: string): boolean {
    const project = this.getProject(projectId)
    if (!project) return false
    
    const calculations = this.getProjectCalculations(projectId)
    
    const totalWeight = calculations.reduce((sum, calc) => sum + (calc.weight || 0), 0)
    const calculationCount = calculations.length
    
    return this.updateProject(projectId, {
      ...project,
      totalWeight,
      calculationCount
    })
  }

  // Clean up orphaned data
  static cleanupOrphanedData(): boolean {
    const projects = this.loadProjects()
    const calculations = this.loadCalculations()
    
    // Remove calculation IDs from projects that no longer exist
    const calculationIds = new Set(calculations.map(c => c.id))
    let projectsUpdated = false
    
    const cleanedProjects = projects.map(project => {
      const validCalculationIds = project.calculationIds.filter(id => calculationIds.has(id))
      if (validCalculationIds.length !== project.calculationIds.length) {
        projectsUpdated = true
        return { ...project, calculationIds: validCalculationIds }
      }
      return project
    })
    
    // Remove project references from calculations for non-existent projects
    const projectIds = new Set(projects.map(p => p.id))
    const cleanedCalculations = calculations.map(calc => {
      if (calc.projectId && !projectIds.has(calc.projectId)) {
        const { projectId, projectName, ...cleanedCalc } = calc
        return cleanedCalc as Calculation
      }
      return calc
    })
    
    if (projectsUpdated) {
      this.saveProjects(cleanedProjects)
    }
    
    return this.saveCalculations(cleanedCalculations)
  }
} 