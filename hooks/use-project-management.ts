import { useState, useEffect, useCallback } from 'react'
import { Project, ProjectFormData, ProjectSummary, Calculation } from '@/lib/types'
import { ProjectStorage } from '@/lib/project-storage'
import { toast } from '@/hooks/use-toast'

export function useProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
    loadActiveProject()
  }, [])

  const loadProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const loadedProjects = ProjectStorage.loadProjects()
      
      // Update calculation counts for each project
      const projectsWithCounts = loadedProjects.map(project => {
        const calculations = ProjectStorage.getProjectCalculations(project.id)
        const totalWeight = calculations.reduce((sum, calc) => sum + (calc.weight || 0), 0)
        
        return {
          ...project,
          calculationCount: calculations.length,
          totalWeight
        }
      })
      
      setProjects(projectsWithCounts)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load projects'
      setError(errorMessage)
      console.error('Error loading projects:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadActiveProject = useCallback(() => {
    try {
      const active = ProjectStorage.getActiveProject()
      if (active) {
        // Update calculation count and total weight for active project
        const calculations = ProjectStorage.getProjectCalculations(active.id)
        const totalWeight = calculations.reduce((sum, calc) => sum + (calc.weight || 0), 0)
        
        const updatedActive = {
          ...active,
          calculationCount: calculations.length,
          totalWeight
        }
        setActiveProject(updatedActive)
      } else {
        setActiveProject(null)
      }
    } catch (error) {
      console.error('Error loading active project:', error)
    }
  }, [])

  const createProject = useCallback(async (formData: ProjectFormData): Promise<Project | null> => {
    setError(null)
    try {
      const newProject = ProjectStorage.createProject(formData)
      setProjects(prev => [newProject, ...prev])
      
      const settings = ProjectStorage.loadSettings()
      if (settings.autoSaveToProject) {
        setActiveProject(newProject)
      }
      
      toast({
        title: "Project created",
        description: `${newProject.name} has been created successfully.`,
      })
      
      return newProject
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create project'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }, [])

  const updateProject = useCallback(async (projectId: string, updates: Partial<ProjectFormData>): Promise<boolean> => {
    setError(null)
    try {
      const success = ProjectStorage.updateProject(projectId, updates)
      if (success) {
        await loadProjects()
        
        // Update active project if it was the one being updated
        if (activeProject?.id === projectId) {
          const updatedProject = ProjectStorage.getProject(projectId)
          setActiveProject(updatedProject)
        }
        
        toast({
          title: "Project updated",
          description: "Project has been updated successfully.",
        })
      }
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update project'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [activeProject, loadProjects])

  const deleteProject = useCallback(async (projectId: string, moveCalculationsTo?: string): Promise<boolean> => {
    setError(null)
    try {
      const projectToDelete = projects.find(p => p.id === projectId)
      const success = ProjectStorage.deleteProject(projectId, moveCalculationsTo)
      
      if (success) {
        setProjects(prev => prev.filter(p => p.id !== projectId))
        
        // Update active project if we deleted it
        if (activeProject?.id === projectId) {
          const newActiveProject = ProjectStorage.getActiveProject()
          setActiveProject(newActiveProject)
        }
        
        toast({
          title: "Project deleted",
          description: `${projectToDelete?.name || 'Project'} has been deleted.`,
        })
      }
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete project'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [projects, activeProject])

  const setActiveProjectById = useCallback(async (projectId: string | null): Promise<boolean> => {
    setError(null)
    try {
      const success = ProjectStorage.setActiveProject(projectId)
      if (success) {
        const newActiveProject = projectId ? ProjectStorage.getProject(projectId) : null
        setActiveProject(newActiveProject)
        
        if (newActiveProject) {
          toast({
            title: "Project activated",
            description: `Switched to ${newActiveProject.name}`,
          })
        } else {
          toast({
            title: "Project deactivated",
            description: "No active project selected",
          })
        }
      }
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set active project'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  const addCalculationToProject = useCallback((calculation: Calculation, projectId?: string): Calculation => {
    try {
      const enhancedCalculation = ProjectStorage.addCalculationToProject(calculation, projectId)
      
      loadProjects()
      if (activeProject) {
        const updatedActiveProject = ProjectStorage.getProject(activeProject.id)
        setActiveProject(updatedActiveProject)
      }
      
      return enhancedCalculation
    } catch (error) {
      console.error('Error adding calculation to project:', error)
      return calculation
    }
  }, [activeProject, loadProjects])

  const moveCalculationToProject = useCallback(async (calculationId: string, targetProjectId: string | null): Promise<boolean> => {
    setError(null)
    try {
      const success = ProjectStorage.moveCalculationToProject(calculationId, targetProjectId)
      if (success) {
        await loadProjects()
        
        // Update active project data
        if (activeProject) {
          const updatedActiveProject = ProjectStorage.getProject(activeProject.id)
          setActiveProject(updatedActiveProject)
        }
        
        const targetProject = targetProjectId ? ProjectStorage.getProject(targetProjectId) : null
        toast({
          title: "Calculation moved",
          description: targetProject 
            ? `Moved to ${targetProject.name}` 
            : "Removed from project",
        })
      }
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to move calculation'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [activeProject, loadProjects])

  const getProjectCalculations = useCallback((projectId: string): Calculation[] => {
    try {
      return ProjectStorage.getProjectCalculations(projectId)
    } catch (error) {
      console.error('Error getting project calculations:', error)
      return []
    }
  }, [])

  const getProjectSummary = useCallback((): ProjectSummary => {
    try {
      return ProjectStorage.calculateProjectSummary()
    } catch (error) {
      console.error('Error calculating project summary:', error)
      return {
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        archivedProjects: 0,
        totalCalculations: 0,
        totalWeight: 0,
        recentActivity: new Date(),
        topMaterials: [],
        topProfiles: []
      }
    }
  }, [])

  const exportProject = useCallback(async (projectId: string): Promise<boolean> => {
    setError(null)
    try {
      const exportData = ProjectStorage.exportProject(projectId)
      if (!exportData) {
        throw new Error('Project not found')
      }
      
      // Create CSV content
      const csvContent = [
        // Project header
        'PROJECT INFORMATION',
        `Name,${exportData.project.name}`,
        `Client,${exportData.project.client || 'N/A'}`,
        `Location,${exportData.project.location || 'N/A'}`,
        `Status,${exportData.project.status}`,
        `Created,${exportData.project.createdAt.toLocaleDateString()}`,
        `Total Weight,${exportData.summary.totalWeight.toFixed(2)} kg`,
        `Total Calculations,${exportData.summary.totalCalculations}`,
        '',
        
        // Calculations
        'CALCULATIONS',
        'ID,Profile,Standard Size,Material,Grade,Weight,Weight Unit,Date,Notes',
        ...exportData.calculations.map(calc => 
          `${calc.id},${calc.profileName},${calc.standardSize},${calc.materialName},${calc.grade},${calc.weight},${calc.weightUnit},${calc.timestamp.toLocaleDateString()},${calc.notes || ''}`
        ),
        '',
        
        // Material breakdown
        'MATERIAL BREAKDOWN',
        'Material,Total Weight (kg)',
        ...Object.entries(exportData.summary.materialBreakdown).map(([material, weight]) => 
          `${material},${weight.toFixed(2)}`
        ),
        '',
        
        // Profile breakdown
        'PROFILE BREAKDOWN',
        'Profile,Total Weight (kg)',
        ...Object.entries(exportData.summary.profileBreakdown).map(([profile, weight]) => 
          `${profile},${weight.toFixed(2)}`
        )
      ].join('\n')
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${exportData.project.name.replace(/[^a-z0-9]/gi, '_')}_export_${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
      
      toast({
        title: "Project exported",
        description: `${exportData.project.name} has been exported to CSV.`,
      })
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export project'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return false
    }
  }, [])

  const cleanupOrphanedData = useCallback(async (): Promise<boolean> => {
    try {
      const success = ProjectStorage.cleanupOrphanedData()
      if (success) {
        await loadProjects()
        toast({
          title: "Data cleaned",
          description: "Orphaned data has been cleaned up.",
        })
      }
      return success
    } catch (error) {
      console.error('Error cleaning up orphaned data:', error)
      return false
    }
  }, [loadProjects])

  return {
    projects,
    activeProject,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    setActiveProject: setActiveProjectById,
    addCalculationToProject,
    moveCalculationToProject,
    getProjectCalculations,
    getProjectSummary,
    exportProject,
    cleanupOrphanedData,
    refreshProjects: loadProjects,
    refreshActiveProject: loadActiveProject
  }
} 