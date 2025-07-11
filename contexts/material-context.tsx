"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { 
  DispatchNote, 
  DispatchMaterial, 
  DispatchStatus, 
  DispatchMaterialStatus,
  DispatchSummary,
  MaterialInventory 
} from '@/lib/types'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

// Material Context interfaces
interface MaterialContextState {
  // Database status
  isInitialized: boolean
  isLoading: boolean
  error: string | null

  // Dispatch notes data
  dispatchNotes: DispatchNote[]
  currentDispatchNote: DispatchNote | null
  
  // Material inventory
  materialInventory: MaterialInventory[]
  
  // Search and filtering
  searchTerm: string
  statusFilter: DispatchStatus | 'all'
  dateFilter: {
    start?: Date
    end?: Date
  }
}

interface MaterialContextActions {
  // Database operations
  initializeMaterials: () => Promise<void>
  refreshMaterials: () => Promise<void>
  
  // Dispatch note CRUD operations
  createDispatchNote: (dispatchNote: Omit<DispatchNote, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateDispatchNote: (dispatchNote: DispatchNote) => Promise<void>
  deleteDispatchNote: (dispatchNoteId: string) => Promise<void>
  setCurrentDispatchNote: (dispatchNote: DispatchNote | null) => void
  
  // Material operations within dispatch notes
  addMaterialToDispatch: (dispatchNoteId: string, material: Omit<DispatchMaterial, 'id' | 'dispatchNoteId'>) => Promise<string>
  updateDispatchMaterial: (material: DispatchMaterial) => Promise<void>
  removeMaterialFromDispatch: (materialId: string) => Promise<void>
  bulkAddMaterials: (dispatchNoteId: string, materials: Omit<DispatchMaterial, 'id' | 'dispatchNoteId'>[]) => Promise<string[]>
  
  // Status management
  updateDispatchStatus: (dispatchNoteId: string, status: DispatchStatus) => Promise<void>
  updateMaterialStatus: (materialId: string, status: DispatchMaterialStatus) => Promise<void>
  markDispatchArrived: (dispatchNoteId: string, arrivalDate?: Date) => Promise<void>
  
  // Search and filtering
  setSearchTerm: (term: string) => void
  setStatusFilter: (status: DispatchStatus | 'all') => void
  setDateFilter: (filter: MaterialContextState['dateFilter']) => void
  clearFilters: () => void
  
  // Analytics and reporting
  getDispatchSummary: (projectId?: string) => DispatchSummary
  getMaterialInventory: (projectId?: string) => MaterialInventory[]
  getProjectDispatches: (projectId: string) => DispatchNote[]
  getFilteredDispatches: () => DispatchNote[]
  
  // Import/Export
  importMaterialsFromCSV: (csvData: string, dispatchNoteId: string) => Promise<void>
  exportDispatchesToCSV: (dispatchNotes: DispatchNote[]) => Promise<string>
}

type MaterialContextType = MaterialContextState & MaterialContextActions

const MaterialContext = createContext<MaterialContextType | undefined>(undefined)

// Initial state
const initialState: MaterialContextState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  dispatchNotes: [],
  currentDispatchNote: null,
  materialInventory: [],
  searchTerm: '',
  statusFilter: 'all',
  dateFilter: {}
}

interface MaterialProviderProps {
  children: ReactNode
}

export function MaterialProvider({ children }: MaterialProviderProps) {
  const [state, setState] = useState<MaterialContextState>(initialState)
  const { t } = useI18n()

  // Helper function to update state
  const updateState = useCallback((updates: Partial<MaterialContextState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Initialize materials (placeholder - will implement with database)
  const initializeMaterials = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null })
      
      // TODO: Initialize IndexedDB stores for dispatch notes
      // For now, load from localStorage or start with empty state
      const storedDispatches = localStorage.getItem('steelforge-dispatch-notes')
      const dispatchNotes = storedDispatches ? JSON.parse(storedDispatches) : []
      
      updateState({
        isInitialized: true,
        isLoading: false,
        dispatchNotes: dispatchNotes.map((note: any) => ({
          ...note,
          date: new Date(note.date),
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          expectedDeliveryDate: note.expectedDeliveryDate ? new Date(note.expectedDeliveryDate) : undefined,
          actualDeliveryDate: note.actualDeliveryDate ? new Date(note.actualDeliveryDate) : undefined
        }))
      })
      
    } catch (error) {
      console.error('Failed to initialize materials:', error)
      updateState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize materials'
      })
    }
  }, [updateState])

  // Refresh materials from storage
  const refreshMaterials = useCallback(async () => {
    try {
      updateState({ isLoading: true })
      
      const storedDispatches = localStorage.getItem('steelforge-dispatch-notes')
      const dispatchNotes = storedDispatches ? JSON.parse(storedDispatches) : []
      
      updateState({
        isLoading: false,
        dispatchNotes: dispatchNotes.map((note: any) => ({
          ...note,
          date: new Date(note.date),
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          expectedDeliveryDate: note.expectedDeliveryDate ? new Date(note.expectedDeliveryDate) : undefined,
          actualDeliveryDate: note.actualDeliveryDate ? new Date(note.actualDeliveryDate) : undefined
        }))
      })
    } catch (error) {
      console.error('Failed to refresh materials:', error)
      updateState({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh materials'
      })
    }
  }, [updateState])

  // Save to localStorage (temporary until database implementation)
  const saveToStorage = useCallback((dispatchNotes: DispatchNote[]) => {
    try {
      localStorage.setItem('steelforge-dispatch-notes', JSON.stringify(dispatchNotes))
    } catch (error) {
      console.error('Failed to save to storage:', error)
    }
  }, [])

  // Create new dispatch note
  const createDispatchNote = useCallback(async (dispatchNoteData: Omit<DispatchNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = `dispatch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date()
      
      const newDispatchNote: DispatchNote = {
        ...dispatchNoteData,
        id,
        createdAt: now,
        updatedAt: now,
        materials: [],
        inspectionRequired: dispatchNoteData.inspectionRequired || false,
        inspectionCompleted: false
      }

      const updatedDispatches = [...state.dispatchNotes, newDispatchNote]
      saveToStorage(updatedDispatches)
      updateState({ dispatchNotes: updatedDispatches })
      
      toast({
        title: t('dispatchNoteCreated'),
        description: `${t('dispatchNoteCreated')} ${dispatchNoteData.dispatchNumber}`
      })
      
      return id
    } catch (error) {
      console.error('Failed to create dispatch note:', error)
      toast({
        title: t('creationFailed'),
        description: error instanceof Error ? error.message : t('creationFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [state.dispatchNotes, saveToStorage, updateState, t])

  // Update dispatch note
  const updateDispatchNote = useCallback(async (dispatchNote: DispatchNote) => {
    try {
      const updatedNote = {
        ...dispatchNote,
        updatedAt: new Date()
      }

      const updatedDispatches = state.dispatchNotes.map(note =>
        note.id === dispatchNote.id ? updatedNote : note
      )
      
      saveToStorage(updatedDispatches)
      updateState({ dispatchNotes: updatedDispatches })
      
      if (state.currentDispatchNote?.id === dispatchNote.id) {
        updateState({ currentDispatchNote: updatedNote })
      }
      
      toast({
        title: t('dispatchNoteUpdated'),
        description: `${t('dispatchNoteUpdated')} ${dispatchNote.dispatchNumber}`
      })
    } catch (error) {
      console.error('Failed to update dispatch note:', error)
      toast({
        title: t('updateFailed'),
        description: error instanceof Error ? error.message : t('updateFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [state.dispatchNotes, state.currentDispatchNote, saveToStorage, updateState, t])

  // Delete dispatch note
  const deleteDispatchNote = useCallback(async (dispatchNoteId: string) => {
    try {
      const updatedDispatches = state.dispatchNotes.filter(note => note.id !== dispatchNoteId)
      saveToStorage(updatedDispatches)
      updateState({ dispatchNotes: updatedDispatches })
      
      if (state.currentDispatchNote?.id === dispatchNoteId) {
        updateState({ currentDispatchNote: null })
      }
      
      toast({
        title: t('dispatchNoteDeleted'),
        description: t('dispatchNoteDeleted')
      })
    } catch (error) {
      console.error('Failed to delete dispatch note:', error)
      toast({
        title: t('deletionFailed'),
        description: error instanceof Error ? error.message : t('deletionFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [state.dispatchNotes, state.currentDispatchNote, saveToStorage, updateState, t])

  // Set current dispatch note
  const setCurrentDispatchNote = useCallback((dispatchNote: DispatchNote | null) => {
    updateState({ currentDispatchNote: dispatchNote })
  }, [updateState])

  // Add material to dispatch
  const addMaterialToDispatch = useCallback(async (dispatchNoteId: string, materialData: Omit<DispatchMaterial, 'id' | 'dispatchNoteId'>) => {
    try {
      const materialId = `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const newMaterial: DispatchMaterial = {
        ...materialData,
        id: materialId,
        dispatchNoteId,
        status: materialData.status || 'pending' as DispatchMaterialStatus
      }

      const updatedDispatches = state.dispatchNotes.map(note => {
        if (note.id === dispatchNoteId) {
          return {
            ...note,
            materials: [...note.materials, newMaterial],
            updatedAt: new Date()
          }
        }
        return note
      })
      
      saveToStorage(updatedDispatches)
      updateState({ dispatchNotes: updatedDispatches })
      
      return materialId
    } catch (error) {
      console.error('Failed to add material to dispatch:', error)
      throw error
    }
  }, [state.dispatchNotes, saveToStorage, updateState])

  // Bulk add materials
  const bulkAddMaterials = useCallback(async (dispatchNoteId: string, materialsData: Omit<DispatchMaterial, 'id' | 'dispatchNoteId'>[]) => {
    try {
      const materialIds: string[] = []
      const newMaterials: DispatchMaterial[] = materialsData.map(materialData => {
        const materialId = `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        materialIds.push(materialId)
        
        return {
          ...materialData,
          id: materialId,
          dispatchNoteId,
          status: materialData.status || 'pending' as DispatchMaterialStatus
        }
      })

      const updatedDispatches = state.dispatchNotes.map(note => {
        if (note.id === dispatchNoteId) {
          return {
            ...note,
            materials: [...note.materials, ...newMaterials],
            updatedAt: new Date()
          }
        }
        return note
      })
      
      saveToStorage(updatedDispatches)
      updateState({ dispatchNotes: updatedDispatches })
      
      toast({
        title: t('materialsAdded'),
        description: `${materialsData.length} ${t('materialsAddedToDispatch')}`
      })
      
      return materialIds
    } catch (error) {
      console.error('Failed to bulk add materials:', error)
      toast({
        title: t('bulkAddFailed'),
        description: error instanceof Error ? error.message : t('bulkAddFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [state.dispatchNotes, saveToStorage, updateState, t])

  // Update dispatch status
  const updateDispatchStatus = useCallback(async (dispatchNoteId: string, status: DispatchStatus) => {
    try {
      const updatedDispatches = state.dispatchNotes.map(note => {
        if (note.id === dispatchNoteId) {
          const updates: Partial<DispatchNote> = {
            status,
            updatedAt: new Date()
          }
          
          // Auto-set arrival date when status changes to 'arrived'
          if (status === 'arrived' && !note.actualDeliveryDate) {
            updates.actualDeliveryDate = new Date()
          }
          
          return { ...note, ...updates }
        }
        return note
      })
      
      saveToStorage(updatedDispatches)
      updateState({ dispatchNotes: updatedDispatches })
      
      toast({
        title: t('statusUpdated'),
        description: `${t('dispatchStatusUpdatedTo')} ${status}`
      })
    } catch (error) {
      console.error('Failed to update dispatch status:', error)
      throw error
    }
  }, [state.dispatchNotes, saveToStorage, updateState, t])

  // Mark dispatch as arrived
  const markDispatchArrived = useCallback(async (dispatchNoteId: string, arrivalDate?: Date) => {
    try {
      await updateDispatchStatus(dispatchNoteId, 'arrived')
      
      // Also update all materials in this dispatch to 'arrived' status
      const dispatch = state.dispatchNotes.find(note => note.id === dispatchNoteId)
      if (dispatch) {
        const updatedDispatches = state.dispatchNotes.map(note => {
          if (note.id === dispatchNoteId) {
            return {
              ...note,
              actualDeliveryDate: arrivalDate || new Date(),
              materials: note.materials.map(material => ({
                ...material,
                status: 'arrived' as DispatchMaterialStatus
              }))
            }
          }
          return note
        })
        
        saveToStorage(updatedDispatches)
        updateState({ dispatchNotes: updatedDispatches })
      }
    } catch (error) {
      console.error('Failed to mark dispatch as arrived:', error)
      throw error
    }
  }, [state.dispatchNotes, updateDispatchStatus, saveToStorage, updateState])

  // Get filtered dispatches
  const getFilteredDispatches = useCallback(() => {
    let filtered = [...state.dispatchNotes]
    
    // Apply search term
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase()
      filtered = filtered.filter(dispatch =>
        dispatch.dispatchNumber.toLowerCase().includes(searchLower) ||
        dispatch.supplier.name.toLowerCase().includes(searchLower) ||
        dispatch.notes?.toLowerCase().includes(searchLower) ||
        dispatch.trackingNumber?.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply status filter
    if (state.statusFilter !== 'all') {
      filtered = filtered.filter(dispatch => dispatch.status === state.statusFilter)
    }
    
    // Apply date filter
    if (state.dateFilter.start || state.dateFilter.end) {
      filtered = filtered.filter(dispatch => {
        const dispatchDate = new Date(dispatch.date)
        if (state.dateFilter.start && dispatchDate < state.dateFilter.start) return false
        if (state.dateFilter.end && dispatchDate > state.dateFilter.end) return false
        return true
      })
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [state.dispatchNotes, state.searchTerm, state.statusFilter, state.dateFilter])

  // Get project dispatches
  const getProjectDispatches = useCallback((projectId: string) => {
    return state.dispatchNotes.filter(dispatch => dispatch.projectId === projectId)
  }, [state.dispatchNotes])

  // Get dispatch summary
  const getDispatchSummary = useCallback((projectId?: string): DispatchSummary => {
    const dispatches = projectId 
      ? getProjectDispatches(projectId)
      : state.dispatchNotes
    
    const summary: DispatchSummary = {
      totalDispatches: dispatches.length,
      pendingDispatches: dispatches.filter(d => d.status === 'pending').length,
      arrivedDispatches: dispatches.filter(d => d.status === 'arrived').length,
      totalValue: dispatches.reduce((sum, d) => sum + (d.totalValue || 0), 0),
      totalMaterials: dispatches.reduce((sum, d) => sum + d.materials.length, 0),
      materialsArrived: dispatches.reduce((sum, d) => 
        sum + d.materials.filter(m => m.status === 'arrived').length, 0),
      materialsAllocated: dispatches.reduce((sum, d) => 
        sum + d.materials.filter(m => m.status === 'allocated').length, 0),
      materialsUsed: dispatches.reduce((sum, d) => 
        sum + d.materials.filter(m => m.status === 'used').length, 0)
    }
    
    return summary
  }, [state.dispatchNotes, getProjectDispatches])

  // Search and filtering
  const setSearchTerm = useCallback((term: string) => {
    updateState({ searchTerm: term })
  }, [updateState])

  const setStatusFilter = useCallback((status: DispatchStatus | 'all') => {
    updateState({ statusFilter: status })
  }, [updateState])

  const setDateFilter = useCallback((filter: MaterialContextState['dateFilter']) => {
    updateState({ dateFilter: filter })
  }, [updateState])

  const clearFilters = useCallback(() => {
    updateState({
      searchTerm: '',
      statusFilter: 'all',
      dateFilter: {}
    })
  }, [updateState])

  // Placeholder implementations for other methods
  const updateDispatchMaterial = useCallback(async (material: DispatchMaterial) => {
    // TODO: Implement
    console.log('updateDispatchMaterial not yet implemented')
  }, [])

  const removeMaterialFromDispatch = useCallback(async (materialId: string) => {
    // TODO: Implement
    console.log('removeMaterialFromDispatch not yet implemented')
  }, [])

  const updateMaterialStatus = useCallback(async (materialId: string, status: DispatchMaterialStatus) => {
    // TODO: Implement
    console.log('updateMaterialStatus not yet implemented')
  }, [])

  const getMaterialInventory = useCallback((projectId?: string): MaterialInventory[] => {
    // TODO: Implement proper inventory calculation
    return []
  }, [])

  const importMaterialsFromCSV = useCallback(async (csvData: string, dispatchNoteId: string) => {
    // TODO: Implement CSV import
    console.log('importMaterialsFromCSV not yet implemented')
  }, [])

  const exportDispatchesToCSV = useCallback(async (dispatchNotes: DispatchNote[]) => {
    // TODO: Implement CSV export
    return 'CSV export not yet implemented'
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (!state.isInitialized && !state.isLoading) {
      initializeMaterials()
    }
  }, [state.isInitialized, state.isLoading, initializeMaterials])

  // Context value
  const contextValue: MaterialContextType = {
    // State
    ...state,
    
    // Actions
    initializeMaterials,
    refreshMaterials,
    createDispatchNote,
    updateDispatchNote,
    deleteDispatchNote,
    setCurrentDispatchNote,
    addMaterialToDispatch,
    updateDispatchMaterial,
    removeMaterialFromDispatch,
    bulkAddMaterials,
    updateDispatchStatus,
    updateMaterialStatus,
    markDispatchArrived,
    setSearchTerm,
    setStatusFilter,
    setDateFilter,
    clearFilters,
    getDispatchSummary,
    getMaterialInventory,
    getProjectDispatches,
    getFilteredDispatches,
    importMaterialsFromCSV,
    exportDispatchesToCSV
  }

  return (
    <MaterialContext.Provider value={contextValue}>
      {children}
    </MaterialContext.Provider>
  )
}

// Hook to use material context
export function useMaterials() {
  const context = useContext(MaterialContext)
  if (context === undefined) {
    throw new Error('useMaterials must be used within a MaterialProvider')
  }
  return context
}