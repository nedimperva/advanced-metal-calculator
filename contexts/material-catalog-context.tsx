"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  MaterialCatalog, 
  MaterialTemplate, 
  MaterialSearchFilters,
  MaterialType,
  MaterialCategory,
  MaterialAvailability
} from '@/lib/types'
import { 
  getAllMaterialCatalog,
  searchMaterialCatalog,
  createMaterialCatalog,
  updateMaterialCatalog,
  deleteMaterialCatalog,
  getAllMaterialTemplates,
  createMaterialTemplate,
  updateMaterialTemplate,
  deleteMaterialTemplate,
  incrementTemplateUsage
} from '@/lib/database'
import { 
  initializeMaterialCatalog,
  getMaterialCatalogStatistics
} from '@/lib/material-catalog-service'

interface MaterialCatalogContextType {
  // Material Catalog State
  materials: MaterialCatalog[]
  templates: MaterialTemplate[]
  isLoading: boolean
  error: string | null
  
  // Search and Filtering
  searchFilters: MaterialSearchFilters
  filteredMaterials: MaterialCatalog[]
  
  // Statistics
  statistics: {
    totalMaterials: number
    materialsByType: Record<MaterialType, number>
    materialsByCategory: Record<MaterialCategory, number>
    materialsByAvailability: Record<MaterialAvailability, number>
    totalTemplates: number
  } | null
  
  // Actions
  loadMaterials: () => Promise<void>
  loadTemplates: () => Promise<void>
  searchMaterials: (filters: MaterialSearchFilters) => Promise<void>
  createMaterial: (material: Omit<MaterialCatalog, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<string>
  updateMaterial: (id: string, updates: Partial<MaterialCatalog>) => Promise<void>
  deleteMaterial: (id: string) => Promise<void>
  createTemplate: (template: Omit<MaterialTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => Promise<string>
  updateTemplate: (id: string, updates: Partial<MaterialTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  useTemplate: (id: string) => Promise<void>
  initializeCatalog: () => Promise<void>
  refreshStatistics: () => Promise<void>
  clearError: () => void
  setSearchFilters: (filters: MaterialSearchFilters) => void
}

const MaterialCatalogContext = createContext<MaterialCatalogContextType | undefined>(undefined)

interface MaterialCatalogProviderProps {
  children: ReactNode
}

export function MaterialCatalogProvider({ children }: MaterialCatalogProviderProps) {
  const [materials, setMaterials] = useState<MaterialCatalog[]>([])
  const [templates, setTemplates] = useState<MaterialTemplate[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialCatalog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchFilters, setSearchFilters] = useState<MaterialSearchFilters>({})
  const [statistics, setStatistics] = useState<MaterialCatalogContextType['statistics']>(null)

  // Load materials from database
  const loadMaterials = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const allMaterials = await getAllMaterialCatalog()
      setMaterials(allMaterials)
      setFilteredMaterials(allMaterials)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load materials')
    } finally {
      setIsLoading(false)
    }
  }

  // Load templates from database
  const loadTemplates = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const allTemplates = await getAllMaterialTemplates()
      setTemplates(allTemplates)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }

  // Search materials with filters
  const searchMaterials = async (filters: MaterialSearchFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const searchResults = await searchMaterialCatalog(filters)
      setFilteredMaterials(searchResults)
      setSearchFilters(filters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search materials')
    } finally {
      setIsLoading(false)
    }
  }

  // Create new material
  const createMaterial = async (material: Omit<MaterialCatalog, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    setError(null)
    try {
      const id = await createMaterialCatalog(material)
      await loadMaterials() // Refresh list
      return id
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create material'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  // Update existing material
  const updateMaterial = async (id: string, updates: Partial<MaterialCatalog>) => {
    setError(null)
    try {
      await updateMaterialCatalog(id, updates)
      await loadMaterials() // Refresh list
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update material'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  // Delete material
  const deleteMaterial = async (id: string) => {
    setError(null)
    try {
      await deleteMaterialCatalog(id)
      await loadMaterials() // Refresh list
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete material'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  // Create new template
  const createTemplate = async (template: Omit<MaterialTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    setError(null)
    try {
      const id = await createMaterialTemplate(template)
      await loadTemplates() // Refresh list
      return id
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create template'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  // Update existing template
  const updateTemplate = async (id: string, updates: Partial<MaterialTemplate>) => {
    setError(null)
    try {
      await updateMaterialTemplate(id, updates)
      await loadTemplates() // Refresh list
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update template'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  // Delete template
  const deleteTemplate = async (id: string) => {
    setError(null)
    try {
      await deleteMaterialTemplate(id)
      await loadTemplates() // Refresh list
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete template'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  // Use template (increment usage count)
  const useTemplate = async (id: string) => {
    setError(null)
    try {
      await incrementTemplateUsage(id)
      await loadTemplates() // Refresh list to show updated usage count
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to use template'
      setError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  // Initialize material catalog with default data
  const initializeCatalog = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await initializeMaterialCatalog()
      await loadMaterials()
      await loadTemplates()
      await refreshStatistics()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize material catalog')
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh statistics
  const refreshStatistics = async () => {
    try {
      const stats = await getMaterialCatalogStatistics()
      setStatistics(stats)
    } catch (err) {
      console.error('Failed to load statistics:', err)
    }
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  // Load initial data on mount
  useEffect(() => {
    const initializeData = async () => {
      await loadMaterials()
      await loadTemplates()
      await refreshStatistics()
    }
    
    initializeData()
  }, [])

  const contextValue: MaterialCatalogContextType = {
    materials,
    templates,
    filteredMaterials,
    isLoading,
    error,
    searchFilters,
    statistics,
    loadMaterials,
    loadTemplates,
    searchMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    initializeCatalog,
    refreshStatistics,
    clearError,
    setSearchFilters
  }

  return (
    <MaterialCatalogContext.Provider value={contextValue}>
      {children}
    </MaterialCatalogContext.Provider>
  )
}

export function useMaterialCatalog() {
  const context = useContext(MaterialCatalogContext)
  if (context === undefined) {
    throw new Error('useMaterialCatalog must be used within a MaterialCatalogProvider')
  }
  return context
}