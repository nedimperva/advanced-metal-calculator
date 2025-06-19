"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Project, ProjectMaterial, Calculation } from '@/lib/types'
import { ProjectStatus, MaterialStatus } from '@/lib/types'
import {
  initializeDatabase,
  createProject as dbCreateProject,
  updateProject as dbUpdateProject,
  deleteProject as dbDeleteProject,
  getProject as dbGetProject,
  getAllProjects as dbGetAllProjects,
  getProjectsByStatus,
  addMaterialToProject as dbAddMaterialToProject,
  updateMaterialStatus as dbUpdateMaterialStatus,
  getProjectMaterials,
  getProjectCalculations,
  saveCalculation as dbSaveCalculation,
  getAllCalculations,
  updateCalculation as dbUpdateCalculation,
  deleteCalculation as dbDeleteCalculation
} from '@/lib/database'
import {
  filterProjects,
  sortProjects,
  searchProjects,
  calculateProjectProgress,
  calculateProjectCosts,
  calculateProjectStatistics,
  validateProject,
  validateMaterial,
  type ProjectFilters,
  type ProjectSortField,
  type SortDirection,
  type ProjectProgress,
  type ProjectCostSummary,
  type ProjectStatistics
} from '@/lib/project-utils'
import { toast } from '@/hooks/use-toast'

// Context interfaces
interface ProjectContextState {
  // Database status
  isInitialized: boolean
  isLoading: boolean
  error: string | null

  // Projects data
  projects: Project[]
  currentProject: Project | null
  
  // Filters and search
  filters: ProjectFilters
  searchTerm: string
  sortField: ProjectSortField
  sortDirection: SortDirection
  
  // Statistics
  statistics: ProjectStatistics | null
  
  // Materials and calculations
  projectMaterials: Record<string, ProjectMaterial[]>
  projectCalculations: Record<string, Calculation[]>
  allCalculations: Calculation[]
}

interface ProjectContextActions {
  // Database operations
  initializeProjects: () => Promise<void>
  refreshProjects: () => Promise<void>
  
  // Project CRUD operations
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'materials' | 'calculationIds'>) => Promise<string>
  updateProject: (project: Project) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void
  
  // Project selection and navigation
  selectProject: (projectId: string) => Promise<void>
  
  // Material management
  addMaterialToProject: (material: Omit<ProjectMaterial, 'id'>) => Promise<string>
  updateMaterialStatus: (materialId: string, status: MaterialStatus, notes?: string) => Promise<void>
  getProjectMaterials: (projectId: string) => Promise<ProjectMaterial[]>
  
  // Calculation management
  saveCalculation: (calculation: Omit<Calculation, 'id' | 'timestamp'>) => Promise<string>
  updateCalculation: (calculation: Calculation) => Promise<void>
  deleteCalculation: (calculationId: string) => Promise<void>
  getProjectCalculations: (projectId: string) => Promise<Calculation[]>
  moveCalculationToProject: (calculationId: string, projectId: string) => Promise<void>
  
  // Filtering and search
  setFilters: (filters: Partial<ProjectFilters>) => void
  setSearchTerm: (term: string) => void
  setSorting: (field: ProjectSortField, direction?: SortDirection) => void
  clearFilters: () => void
  
  // Analytics and reporting
  getProjectProgress: (projectId: string) => Promise<ProjectProgress>
  getProjectCosts: (projectId: string) => Promise<ProjectCostSummary>
  refreshStatistics: () => Promise<void>
  
  // Utility functions
  getFilteredProjects: () => Project[]
  validateProjectData: (project: Partial<Project>) => string[]
  validateMaterialData: (material: Partial<ProjectMaterial>) => string[]
}

type ProjectContextType = ProjectContextState & ProjectContextActions

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

// Initial state
const initialState: ProjectContextState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  projects: [],
  currentProject: null,
  filters: {},
  searchTerm: '',
  sortField: 'updatedAt',
  sortDirection: 'desc',
  statistics: null,
  projectMaterials: {},
  projectCalculations: {},
  allCalculations: []
}

interface ProjectProviderProps {
  children: ReactNode
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [state, setState] = useState<ProjectContextState>(initialState)

  // Helper function to update state
  const updateState = useCallback((updates: Partial<ProjectContextState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Initialize database and load projects
  const initializeProjects = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null })
      
      // Initialize IndexedDB
      await initializeDatabase()
      
      // Load initial data
      const [projects, calculations, statistics] = await Promise.all([
        dbGetAllProjects(),
        getAllCalculations(),
        calculateProjectStatistics()
      ])
      
      updateState({
        isInitialized: true,
        isLoading: false,
        projects,
        allCalculations: calculations,
        statistics
      })
      
    } catch (error) {
      console.error('Failed to initialize projects:', error)
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize projects'
      })
      toast({
        title: "Initialization Error",
        description: "Failed to initialize project system. Please refresh the page.",
        variant: "destructive"
      })
    }
  }, [updateState])

  // Refresh projects from database
  const refreshProjects = useCallback(async () => {
    try {
      updateState({ isLoading: true })
      const [projects, calculations, statistics] = await Promise.all([
        dbGetAllProjects(),
        getAllCalculations(),
        calculateProjectStatistics()
      ])
      updateState({
        isLoading: false,
        projects,
        allCalculations: calculations,
        statistics
      })
    } catch (error) {
      console.error('Failed to refresh projects:', error)
      updateState({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh projects'
      })
    }
  }, [updateState])

  // Create new project
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'materials' | 'calculationIds'>) => {
    try {
      const validation = validateProject(projectData)
      if (validation.length > 0) {
        throw new Error(validation.join(', '))
      }

      const projectId = await dbCreateProject(projectData)
      await refreshProjects()
      
      toast({
        title: "Project Created",
        description: `Successfully created project "${projectData.name}"`
      })
      
      return projectId
    } catch (error) {
      console.error('Failed to create project:', error)
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive"
      })
      throw error
    }
  }, [refreshProjects])

  // Update existing project
  const updateProject = useCallback(async (project: Project) => {
    try {
      const validation = validateProject(project)
      if (validation.length > 0) {
        throw new Error(validation.join(', '))
      }

      await dbUpdateProject(project)
      await refreshProjects()
      
      // Update current project if it's the one being updated
      if (state.currentProject?.id === project.id) {
        updateState({ currentProject: project })
      }
      
      toast({
        title: "Project Updated",
        description: `Successfully updated project "${project.name}"`
      })
    } catch (error) {
      console.error('Failed to update project:', error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update project",
        variant: "destructive"
      })
      throw error
    }
  }, [state.currentProject, refreshProjects, updateState])

  // Delete project
  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const project = state.projects.find(p => p.id === projectId)
      await dbDeleteProject(projectId)
      await refreshProjects()
      
      // Clear current project if it was deleted
      if (state.currentProject?.id === projectId) {
        updateState({ currentProject: null })
      }
      
      toast({
        title: "Project Deleted",
        description: project ? `Successfully deleted project "${project.name}"` : "Project deleted"
      })
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete project",
        variant: "destructive"
      })
      throw error
    }
  }, [state.projects, state.currentProject, refreshProjects, updateState])

  // Set current project
  const setCurrentProject = useCallback((project: Project | null) => {
    updateState({ currentProject: project })
  }, [updateState])

  // Select project by ID
  const selectProject = useCallback(async (projectId: string) => {
    try {
      const project = await dbGetProject(projectId)
      if (!project) {
        throw new Error('Project not found')
      }
      updateState({ currentProject: project })
    } catch (error) {
      console.error('Failed to select project:', error)
      toast({
        title: "Selection Failed",
        description: "Failed to load project details",
        variant: "destructive"
      })
      throw error
    }
  }, [updateState])

  // Material management
  const addMaterialToProject = useCallback(async (material: Omit<ProjectMaterial, 'id'>) => {
    try {
      const validation = validateMaterial(material)
      if (validation.length > 0) {
        throw new Error(validation.join(', '))
      }

      const materialId = await dbAddMaterialToProject(material)
      
      // Refresh project materials cache
      const materials = await getProjectMaterials(material.projectId)
      updateState({
        projectMaterials: {
          ...state.projectMaterials,
          [material.projectId]: materials
        }
      })
      
      toast({
        title: "Material Added",
        description: "Successfully added material to project"
      })
      
      return materialId
    } catch (error) {
      console.error('Failed to add material:', error)
      toast({
        title: "Addition Failed",
        description: error instanceof Error ? error.message : "Failed to add material",
        variant: "destructive"
      })
      throw error
    }
  }, [state.projectMaterials, updateState])

  const updateMaterialStatus = useCallback(async (materialId: string, status: MaterialStatus, notes?: string) => {
    try {
      await dbUpdateMaterialStatus(materialId, status, notes)
      
      // Find which project this material belongs to and refresh its materials
      const projectId = Object.keys(state.projectMaterials).find(pid =>
        state.projectMaterials[pid].some(m => m.id === materialId)
      )
      
      if (projectId) {
        const materials = await getProjectMaterials(projectId)
        updateState({
          projectMaterials: {
            ...state.projectMaterials,
            [projectId]: materials
          }
        })
      }
      
      toast({
        title: "Status Updated",
        description: `Material status updated to ${status}`
      })
    } catch (error) {
      console.error('Failed to update material status:', error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update material status",
        variant: "destructive"
      })
      throw error
    }
  }, [state.projectMaterials, updateState])

  // Calculation management
  const saveCalculation = useCallback(async (calculation: Omit<Calculation, 'id' | 'timestamp'>) => {
    try {
      const calculationId = await dbSaveCalculation(calculation)
      await refreshProjects() // This will also refresh allCalculations
      
      toast({
        title: "Calculation Saved",
        description: "Successfully saved calculation"
      })
      
      return calculationId
    } catch (error) {
      console.error('Failed to save calculation:', error)
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save calculation",
        variant: "destructive"
      })
      throw error
    }
  }, [refreshProjects])

  const updateCalculation = useCallback(async (calculation: Calculation) => {
    try {
      await dbUpdateCalculation(calculation)
      await refreshProjects()
      
      toast({
        title: "Calculation Updated",
        description: "Successfully updated calculation"
      })
    } catch (error) {
      console.error('Failed to update calculation:', error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update calculation",
        variant: "destructive"
      })
      throw error
    }
  }, [refreshProjects])

  const deleteCalculation = useCallback(async (calculationId: string) => {
    try {
      await dbDeleteCalculation(calculationId)
      await refreshProjects()
      
      toast({
        title: "Calculation Deleted",
        description: "Successfully deleted calculation"
      })
    } catch (error) {
      console.error('Failed to delete calculation:', error)
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete calculation",
        variant: "destructive"
      })
      throw error
    }
  }, [refreshProjects])

  const moveCalculationToProject = useCallback(async (calculationId: string, projectId: string) => {
    try {
      const calculation = state.allCalculations.find(c => c.id === calculationId)
      if (!calculation) {
        throw new Error('Calculation not found')
      }

      const updatedCalculation = { ...calculation, projectId }
      await dbUpdateCalculation(updatedCalculation)
      await refreshProjects()
      
      toast({
        title: "Calculation Moved",
        description: "Successfully moved calculation to project"
      })
    } catch (error) {
      console.error('Failed to move calculation:', error)
      toast({
        title: "Move Failed",
        description: error instanceof Error ? error.message : "Failed to move calculation",
        variant: "destructive"
      })
      throw error
    }
  }, [state.allCalculations, refreshProjects])

  // Filtering and search
  const setFilters = useCallback((filters: Partial<ProjectFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }))
  }, [])

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }))
  }, [])

  const setSorting = useCallback((field: ProjectSortField, direction?: SortDirection) => {
    setState(prev => ({
      ...prev,
      sortField: field,
      sortDirection: direction || (prev.sortField === field && prev.sortDirection === 'desc' ? 'asc' : 'desc')
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      searchTerm: ''
    }))
  }, [])

  // Analytics
  const getProjectProgress = useCallback(async (projectId: string) => {
    const project = state.projects.find(p => p.id === projectId)
    if (!project) {
      throw new Error('Project not found')
    }
    return await calculateProjectProgress(project)
  }, [state.projects])

  const getProjectCosts = useCallback(async (projectId: string) => {
    const project = state.projects.find(p => p.id === projectId)
    if (!project) {
      throw new Error('Project not found')
    }
    return await calculateProjectCosts(project)
  }, [state.projects])

  const refreshStatistics = useCallback(async () => {
    try {
      const statistics = await calculateProjectStatistics()
      updateState({ statistics })
    } catch (error) {
      console.error('Failed to refresh statistics:', error)
    }
  }, [updateState])

  // Utility functions
  const getFilteredProjects = useCallback(() => {
    let filtered = filterProjects(state.projects, state.filters)
    
    if (state.searchTerm) {
      filtered = searchProjects(filtered, state.searchTerm)
    }
    
    return sortProjects(filtered, state.sortField, state.sortDirection)
  }, [state.projects, state.filters, state.searchTerm, state.sortField, state.sortDirection])

  const validateProjectData = useCallback((project: Partial<Project>) => {
    return validateProject(project)
  }, [])

  const validateMaterialData = useCallback((material: Partial<ProjectMaterial>) => {
    return validateMaterial(material)
  }, [])

  // Database wrapper functions
  const getProjectMaterialsWrapper = useCallback(async (projectId: string) => {
    if (state.projectMaterials[projectId]) {
      return state.projectMaterials[projectId]
    }
    
    const materials = await getProjectMaterials(projectId)
    updateState({
      projectMaterials: {
        ...state.projectMaterials,
        [projectId]: materials
      }
    })
    return materials
  }, [state.projectMaterials, updateState])

  const getProjectCalculationsWrapper = useCallback(async (projectId: string) => {
    if (state.projectCalculations[projectId]) {
      return state.projectCalculations[projectId]
    }
    
    const calculations = await getProjectCalculations(projectId)
    updateState({
      projectCalculations: {
        ...state.projectCalculations,
        [projectId]: calculations
      }
    })
    return calculations
  }, [state.projectCalculations, updateState])

  // Initialize on mount
  useEffect(() => {
    if (!state.isInitialized && !state.isLoading) {
      initializeProjects()
    }
  }, [state.isInitialized, state.isLoading, initializeProjects])

  // Context value
  const contextValue: ProjectContextType = {
    // State
    ...state,
    
    // Actions
    initializeProjects,
    refreshProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    selectProject,
    addMaterialToProject,
    updateMaterialStatus,
    getProjectMaterials: getProjectMaterialsWrapper,
    saveCalculation,
    updateCalculation,
    deleteCalculation,
    getProjectCalculations: getProjectCalculationsWrapper,
    moveCalculationToProject,
    setFilters,
    setSearchTerm,
    setSorting,
    clearFilters,
    getProjectProgress,
    getProjectCosts,
    refreshStatistics,
    getFilteredProjects,
    validateProjectData,
    validateMaterialData
  }

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  )
}

// Hook to use project context
export function useProjects() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
} 