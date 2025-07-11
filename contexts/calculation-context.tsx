"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { Calculation } from '@/lib/types'
import {
  initializeDatabase,
  saveCalculation as dbSaveCalculation,
  getAllCalculations,
  updateCalculation as dbUpdateCalculation,
  deleteCalculation as dbDeleteCalculation
} from '@/lib/database'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

// Calculation Context interfaces
interface CalculationContextState {
  // Database status
  isInitialized: boolean
  isLoading: boolean
  error: string | null

  // Calculations data
  calculations: Calculation[]
  recentCalculations: Calculation[]
  
  // Search and filtering
  searchTerm: string
  filterBy: {
    material?: string
    profileType?: string
    dateRange?: { start: Date; end: Date }
  }
}

interface CalculationContextActions {
  // Database operations
  initializeCalculations: () => Promise<void>
  refreshCalculations: () => Promise<void>
  
  // Calculation CRUD operations
  saveCalculation: (calculation: Omit<Calculation, 'id' | 'timestamp'>) => Promise<string>
  updateCalculation: (calculation: Calculation) => Promise<void>
  deleteCalculation: (calculationId: string) => Promise<void>
  duplicateCalculation: (calculationId: string) => Promise<string>
  
  // Search and filtering
  setSearchTerm: (term: string) => void
  setFilter: (filter: Partial<CalculationContextState['filterBy']>) => void
  clearFilters: () => void
  
  // Utility functions
  getFilteredCalculations: () => Calculation[]
  getCalculationById: (id: string) => Calculation | undefined
  getRecentCalculations: (limit?: number) => Calculation[]
  exportCalculations: (calculations: Calculation[]) => Promise<string>
}

type CalculationContextType = CalculationContextState & CalculationContextActions

const CalculationContext = createContext<CalculationContextType | undefined>(undefined)

// Initial state
const initialState: CalculationContextState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  calculations: [],
  recentCalculations: [],
  searchTerm: '',
  filterBy: {}
}

interface CalculationProviderProps {
  children: ReactNode
}

export function CalculationProvider({ children }: CalculationProviderProps) {
  const [state, setState] = useState<CalculationContextState>(initialState)
  const { t } = useI18n()

  // Helper function to update state
  const updateState = useCallback((updates: Partial<CalculationContextState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Initialize database and load calculations
  const initializeCalculations = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null })
      
      // Initialize IndexedDB
      await initializeDatabase()
      
      // Load calculations
      const calculations = await getAllCalculations()
      
      updateState({
        isInitialized: true,
        isLoading: false,
        calculations,
        recentCalculations: calculations
          .filter(calc => !calc.projectId) // Only show unassigned calculations as "recent"
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10)
      })
      
    } catch (error) {
      console.error('Failed to initialize calculations:', error)
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize calculations'
      })
      toast({
        title: t('initializationError'),
        description: t('calculationInitializationError'),
        variant: "destructive"
      })
    }
  }, [updateState, t])

  // Refresh calculations from database
  const refreshCalculations = useCallback(async () => {
    try {
      updateState({ isLoading: true })
      const calculations = await getAllCalculations()
      
      updateState({
        isLoading: false,
        calculations,
        recentCalculations: calculations
          .filter(calc => !calc.projectId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10)
      })
    } catch (error) {
      console.error('Failed to refresh calculations:', error)
      updateState({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh calculations'
      })
    }
  }, [updateState])

  // Save new calculation
  const saveCalculation = useCallback(async (calculation: Omit<Calculation, 'id' | 'timestamp'>) => {
    try {
      const calculationId = await dbSaveCalculation(calculation)
      await refreshCalculations()
      
      toast({
        title: t('calculationSavedSuccess'),
        description: t('calculationSavedSuccess')
      })
      
      return calculationId
    } catch (error) {
      console.error('Failed to save calculation:', error)
      toast({
        title: t('savingError'),
        description: error instanceof Error ? error.message : t('failedToSaveCalculation'),
        variant: "destructive"
      })
      throw error
    }
  }, [refreshCalculations, t])

  // Update existing calculation
  const updateCalculation = useCallback(async (calculation: Calculation) => {
    try {
      await dbUpdateCalculation(calculation)
      await refreshCalculations()
      
      toast({
        title: t('calculationUpdatedSuccess'),
        description: t('calculationUpdatedSuccess')
      })
    } catch (error) {
      console.error('Failed to update calculation:', error)
      toast({
        title: t('updateFailed'),
        description: error instanceof Error ? error.message : t('updateFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [refreshCalculations, t])

  // Delete calculation
  const deleteCalculation = useCallback(async (calculationId: string) => {
    try {
      await dbDeleteCalculation(calculationId)
      await refreshCalculations()
      
      toast({
        title: t('calculationDeletedSuccess'),
        description: t('calculationDeletedSuccess')
      })
    } catch (error) {
      console.error('Failed to delete calculation:', error)
      toast({
        title: t('deletionFailed'),
        description: error instanceof Error ? error.message : t('deletionFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [refreshCalculations, t])

  // Duplicate calculation
  const duplicateCalculation = useCallback(async (calculationId: string) => {
    try {
      const originalCalc = state.calculations.find(c => c.id === calculationId)
      if (!originalCalc) {
        throw new Error('Calculation not found')
      }

      const duplicatedCalc = {
        ...originalCalc,
        name: originalCalc.name ? `${originalCalc.name} (Copy)` : undefined,
        notes: originalCalc.notes ? `${originalCalc.notes} (Duplicated)` : 'Duplicated calculation',
        projectId: undefined // Remove project association
      }

      // Remove id and timestamp to create new calculation
      const { id, timestamp, ...calcData } = duplicatedCalc
      
      const newCalculationId = await saveCalculation(calcData)
      
      toast({
        title: t('calculationDuplicated'),
        description: t('calculationDuplicatedSuccess')
      })
      
      return newCalculationId
    } catch (error) {
      console.error('Failed to duplicate calculation:', error)
      toast({
        title: t('duplicationFailed'),
        description: error instanceof Error ? error.message : t('duplicationFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [state.calculations, saveCalculation, t])

  // Search and filtering
  const setSearchTerm = useCallback((term: string) => {
    updateState({ searchTerm: term })
  }, [updateState])

  const setFilter = useCallback((filter: Partial<CalculationContextState['filterBy']>) => {
    updateState({ 
      filterBy: { ...state.filterBy, ...filter }
    })
  }, [state.filterBy, updateState])

  const clearFilters = useCallback(() => {
    updateState({ 
      searchTerm: '',
      filterBy: {}
    })
  }, [updateState])

  // Utility functions
  const getFilteredCalculations = useCallback(() => {
    let filtered = [...state.calculations]
    
    // Apply search term
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase()
      filtered = filtered.filter(calc => 
        calc.name?.toLowerCase().includes(searchLower) ||
        calc.material.toLowerCase().includes(searchLower) ||
        calc.profileType.toLowerCase().includes(searchLower) ||
        calc.notes?.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply material filter
    if (state.filterBy.material) {
      filtered = filtered.filter(calc => calc.material === state.filterBy.material)
    }
    
    // Apply profile type filter
    if (state.filterBy.profileType) {
      filtered = filtered.filter(calc => calc.profileType === state.filterBy.profileType)
    }
    
    // Apply date range filter
    if (state.filterBy.dateRange) {
      const { start, end } = state.filterBy.dateRange
      filtered = filtered.filter(calc => {
        const calcDate = new Date(calc.timestamp)
        return calcDate >= start && calcDate <= end
      })
    }
    
    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [state.calculations, state.searchTerm, state.filterBy])

  const getCalculationById = useCallback((id: string) => {
    return state.calculations.find(calc => calc.id === id)
  }, [state.calculations])

  const getRecentCalculations = useCallback((limit: number = 10) => {
    return state.calculations
      .filter(calc => !calc.projectId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }, [state.calculations])

  // Export calculations as JSON
  const exportCalculations = useCallback(async (calculations: Calculation[]) => {
    const exportData = {
      calculations,
      exportedAt: new Date().toISOString(),
      exportedBy: 'SteelForge Pro Calculator',
      version: '1.0'
    }
    
    return JSON.stringify(exportData, null, 2)
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (!state.isInitialized && !state.isLoading) {
      initializeCalculations()
    }
  }, [state.isInitialized, state.isLoading, initializeCalculations])

  // Context value
  const contextValue: CalculationContextType = {
    // State
    ...state,
    
    // Actions
    initializeCalculations,
    refreshCalculations,
    saveCalculation,
    updateCalculation,
    deleteCalculation,
    duplicateCalculation,
    setSearchTerm,
    setFilter,
    clearFilters,
    getFilteredCalculations,
    getCalculationById,
    getRecentCalculations,
    exportCalculations
  }

  return (
    <CalculationContext.Provider value={contextValue}>
      {children}
    </CalculationContext.Provider>
  )
}

// Hook to use calculation context
export function useCalculations() {
  const context = useContext(CalculationContext)
  if (context === undefined) {
    throw new Error('useCalculations must be used within a CalculationProvider')
  }
  return context
}