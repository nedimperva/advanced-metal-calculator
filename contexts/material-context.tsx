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

  // Update existing dispatch material
  const updateDispatchMaterial = useCallback(async (material: DispatchMaterial) => {
    try {
      const updatedDispatches = state.dispatchNotes.map(note => {
        if (note.id === material.dispatchNoteId) {
          return {
            ...note,
            materials: note.materials.map(m => 
              m.id === material.id ? material : m
            ),
            updatedAt: new Date()
          }
        }
        return note
      })
      
      saveToStorage(updatedDispatches)
      updateState({ dispatchNotes: updatedDispatches })
      
      // Update current dispatch note if it's the one being modified
      if (state.currentDispatchNote?.id === material.dispatchNoteId) {
        const updatedCurrentNote = updatedDispatches.find(note => note.id === material.dispatchNoteId)
        if (updatedCurrentNote) {
          updateState({ currentDispatchNote: updatedCurrentNote })
        }
      }
      
      toast({
        title: t('materialUpdated'),
        description: `${t('materialUpdated')} ${material.materialType} ${material.profile}`
      })
    } catch (error) {
      console.error('Failed to update dispatch material:', error)
      toast({
        title: t('updateFailed'),
        description: error instanceof Error ? error.message : t('updateFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [state.dispatchNotes, state.currentDispatchNote, saveToStorage, updateState, t])

  // Remove material from dispatch
  const removeMaterialFromDispatch = useCallback(async (materialId: string) => {
    try {
      // Find the material and its dispatch note
      let materialToRemove: DispatchMaterial | null = null
      let dispatchNoteId: string | null = null
      
      for (const note of state.dispatchNotes) {
        const material = note.materials.find(m => m.id === materialId)
        if (material) {
          materialToRemove = material
          dispatchNoteId = note.id
          break
        }
      }
      
      if (!materialToRemove || !dispatchNoteId) {
        throw new Error('Material not found')
      }
      
      const updatedDispatches = state.dispatchNotes.map(note => {
        if (note.id === dispatchNoteId) {
          return {
            ...note,
            materials: note.materials.filter(m => m.id !== materialId),
            updatedAt: new Date()
          }
        }
        return note
      })
      
      saveToStorage(updatedDispatches)
      updateState({ dispatchNotes: updatedDispatches })
      
      // Update current dispatch note if it's the one being modified
      if (state.currentDispatchNote?.id === dispatchNoteId) {
        const updatedCurrentNote = updatedDispatches.find(note => note.id === dispatchNoteId)
        if (updatedCurrentNote) {
          updateState({ currentDispatchNote: updatedCurrentNote })
        }
      }
      
      toast({
        title: t('materialRemoved'),
        description: `${t('materialRemoved')} ${materialToRemove.materialType} ${materialToRemove.profile}`
      })
    } catch (error) {
      console.error('Failed to remove material from dispatch:', error)
      toast({
        title: t('removalFailed'),
        description: error instanceof Error ? error.message : t('removalFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [state.dispatchNotes, state.currentDispatchNote, saveToStorage, updateState, t])

  // Update material status
  const updateMaterialStatus = useCallback(async (materialId: string, status: DispatchMaterialStatus) => {
    try {
      // Find the material and its dispatch note
      let materialFound = false
      let dispatchNoteId: string | null = null
      
      const updatedDispatches = state.dispatchNotes.map(note => {
        const materialIndex = note.materials.findIndex(m => m.id === materialId)
        if (materialIndex !== -1) {
          materialFound = true
          dispatchNoteId = note.id
          const updatedMaterials = [...note.materials]
          updatedMaterials[materialIndex] = {
            ...updatedMaterials[materialIndex],
            status
          }
          
          return {
            ...note,
            materials: updatedMaterials,
            updatedAt: new Date()
          }
        }
        return note
      })
      
      if (!materialFound) {
        throw new Error('Material not found')
      }
      
      saveToStorage(updatedDispatches)
      updateState({ dispatchNotes: updatedDispatches })
      
      // Update current dispatch note if it's the one being modified
      if (state.currentDispatchNote?.id === dispatchNoteId) {
        const updatedCurrentNote = updatedDispatches.find(note => note.id === dispatchNoteId)
        if (updatedCurrentNote) {
          updateState({ currentDispatchNote: updatedCurrentNote })
        }
      }
      
      toast({
        title: t('materialStatusUpdated'),
        description: `${t('materialStatusUpdatedTo')} ${status}`
      })
    } catch (error) {
      console.error('Failed to update material status:', error)
      toast({
        title: t('updateFailed'),
        description: error instanceof Error ? error.message : t('updateFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [state.dispatchNotes, state.currentDispatchNote, saveToStorage, updateState, t])

  // Calculate material inventory from all dispatch notes
  const getMaterialInventory = useCallback((projectId?: string): MaterialInventory[] => {
    try {
      const dispatches = projectId 
        ? state.dispatchNotes.filter(dispatch => dispatch.projectId === projectId)
        : state.dispatchNotes

      // Group materials by type, profile, and grade
      const inventoryMap = new Map<string, MaterialInventory>()

      dispatches.forEach(dispatch => {
        dispatch.materials.forEach(material => {
          const key = `${material.materialType}-${material.profile}-${material.grade}`
          
          if (!inventoryMap.has(key)) {
            inventoryMap.set(key, {
              materialType: material.materialType,
              profile: material.profile,
              grade: material.grade,
              totalQuantity: 0,
              availableQuantity: 0,
              allocatedQuantity: 0,
              usedQuantity: 0,
              totalWeight: 0,
              averageUnitCost: 0,
              locations: [],
              lastUpdated: new Date()
            })
          }

          const inventory = inventoryMap.get(key)!
          inventory.totalQuantity += material.quantity
          inventory.totalWeight += material.totalWeight

          // Update quantities based on status
          switch (material.status) {
            case 'arrived':
              inventory.availableQuantity += material.quantity
              break
            case 'allocated':
              inventory.allocatedQuantity += material.quantity
              break
            case 'used':
              inventory.usedQuantity += material.quantity
              break
          }

          // Update average cost if unit cost is available
          if (material.unitCost) {
            const currentTotal = inventory.averageUnitCost! * (inventory.totalQuantity - material.quantity)
            const newTotal = currentTotal + (material.unitCost * material.quantity)
            inventory.averageUnitCost = newTotal / inventory.totalQuantity
          }

          // Add location if specified and not already included
          if (material.location && !inventory.locations.includes(material.location)) {
            inventory.locations.push(material.location)
          }

          // Update last updated date
          if (dispatch.updatedAt > inventory.lastUpdated) {
            inventory.lastUpdated = dispatch.updatedAt
          }
        })
      })

      return Array.from(inventoryMap.values()).sort((a, b) => 
        a.materialType.localeCompare(b.materialType) || 
        a.profile.localeCompare(b.profile) ||
        a.grade.localeCompare(b.grade)
      )
    } catch (error) {
      console.error('Failed to calculate material inventory:', error)
      return []
    }
  }, [state.dispatchNotes])

  // Import materials from CSV data
  const importMaterialsFromCSV = useCallback(async (csvData: string, dispatchNoteId: string) => {
    try {
      // Verify dispatch note exists
      const dispatch = state.dispatchNotes.find(note => note.id === dispatchNoteId)
      if (!dispatch) {
        throw new Error('Dispatch note not found')
      }

      // Parse CSV data
      const lines = csvData.trim().split('\n')
      if (lines.length < 2) {
        throw new Error('CSV must contain at least a header row and one data row')
      }

      // Parse header row
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      // Expected headers (flexible matching)
      const requiredFields = ['materialtype', 'profile', 'grade', 'quantity']
      const optionalFields = ['length', 'width', 'height', 'thickness', 'diameter', 'unitcost', 'location', 'notes']
      
      // Validate required headers exist
      const missingFields = requiredFields.filter(field => 
        !headers.some(header => header.includes(field.replace(/([A-Z])/g, ' $1').toLowerCase()))
      )
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
      }

      // Map headers to field names
      const fieldMap: Record<string, number> = {}
      headers.forEach((header, index) => {
        if (header.includes('material') && header.includes('type')) fieldMap.materialType = index
        else if (header.includes('profile')) fieldMap.profile = index
        else if (header.includes('grade')) fieldMap.grade = index
        else if (header.includes('quantity')) fieldMap.quantity = index
        else if (header.includes('length')) fieldMap.length = index
        else if (header.includes('width')) fieldMap.width = index
        else if (header.includes('height')) fieldMap.height = index
        else if (header.includes('thickness')) fieldMap.thickness = index
        else if (header.includes('diameter')) fieldMap.diameter = index
        else if (header.includes('unit') && header.includes('cost')) fieldMap.unitCost = index
        else if (header.includes('location')) fieldMap.location = index
        else if (header.includes('notes')) fieldMap.notes = index
      })

      // Parse data rows
      const materialsToImport: Omit<DispatchMaterial, 'id' | 'dispatchNoteId'>[] = []
      const errors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim())
          
          if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: Column count mismatch`)
            continue
          }

          // Parse dimensions
          const dimensions: Record<string, number> = {}
          if (fieldMap.length !== undefined) dimensions.length = parseFloat(values[fieldMap.length]) || 0
          if (fieldMap.width !== undefined) dimensions.width = parseFloat(values[fieldMap.width]) || 0
          if (fieldMap.height !== undefined) dimensions.height = parseFloat(values[fieldMap.height]) || 0
          if (fieldMap.thickness !== undefined) dimensions.thickness = parseFloat(values[fieldMap.thickness]) || 0
          if (fieldMap.diameter !== undefined) dimensions.diameter = parseFloat(values[fieldMap.diameter]) || 0

          const quantity = parseFloat(values[fieldMap.quantity])
          if (isNaN(quantity) || quantity <= 0) {
            errors.push(`Row ${i + 1}: Invalid quantity`)
            continue
          }

          const material: Omit<DispatchMaterial, 'id' | 'dispatchNoteId'> = {
            materialType: values[fieldMap.materialType] || '',
            profile: values[fieldMap.profile] || '',
            grade: values[fieldMap.grade] || '',
            dimensions,
            quantity,
            unit: 'pieces', // Default unit
            unitWeight: 0, // Will need to be calculated separately
            totalWeight: 0, // Will need to be calculated separately
            unitCost: fieldMap.unitCost !== undefined ? parseFloat(values[fieldMap.unitCost]) || undefined : undefined,
            totalCost: undefined, // Will be calculated if unitCost is provided
            lengthUnit: 'mm',
            weightUnit: 'kg',
            status: 'pending' as DispatchMaterialStatus,
            location: fieldMap.location !== undefined ? values[fieldMap.location] || undefined : undefined,
            notes: fieldMap.notes !== undefined ? values[fieldMap.notes] || undefined : undefined
          }

          // Calculate total cost if unit cost is available
          if (material.unitCost) {
            material.totalCost = material.unitCost * material.quantity
          }

          // Validate required fields
          if (!material.materialType || !material.profile || !material.grade) {
            errors.push(`Row ${i + 1}: Missing required material information`)
            continue
          }

          materialsToImport.push(material)
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`)
        }
      }

      if (errors.length > 0) {
        console.warn('CSV import errors:', errors)
        toast({
          title: t('csvImportWarnings'),
          description: `${errors.length} rows had errors and were skipped`,
          variant: "destructive"
        })
      }

      if (materialsToImport.length === 0) {
        throw new Error('No valid materials found in CSV')
      }

      // Import materials using existing bulk add function
      await bulkAddMaterials(dispatchNoteId, materialsToImport)
      
      toast({
        title: t('csvImportSuccess'),
        description: `${materialsToImport.length} ${t('materialsImported')}`
      })

    } catch (error) {
      console.error('Failed to import materials from CSV:', error)
      toast({
        title: t('csvImportFailed'),
        description: error instanceof Error ? error.message : t('csvImportFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [state.dispatchNotes, bulkAddMaterials, t])

  // Export dispatch notes to CSV format
  const exportDispatchesToCSV = useCallback(async (dispatchNotes: DispatchNote[]): Promise<string> => {
    try {
      if (dispatchNotes.length === 0) {
        throw new Error('No dispatch notes to export')
      }

      // Define CSV headers
      const headers = [
        'Dispatch Number',
        'Project Id',
        'Date',
        'Expected Delivery',
        'Actual Delivery',
        'Status',
        'Supplier Name',
        'Supplier Contact',
        'Tracking Number',
        'Total Value',
        'Currency',
        'Material Type',
        'Profile',
        'Grade',
        'Quantity',
        'Unit',
        'Unit Weight',
        'Total Weight',
        'Unit Cost',
        'Total Cost',
        'Length Unit',
        'Weight Unit',
        'Material Status',
        'Location',
        'Length',
        'Width',
        'Height',
        'Thickness',
        'Diameter',
        'Material Notes'
      ]

      // Build CSV rows
      const rows: string[] = [headers.join(',')]

      dispatchNotes.forEach(dispatch => {
        if (dispatch.materials.length === 0) {
          // Export dispatch with no materials
          const row = [
            `"${dispatch.dispatchNumber}"`,
            `"${dispatch.projectId}"`,
            `"${dispatch.date.toISOString().split('T')[0]}"`,
            dispatch.expectedDeliveryDate ? `"${dispatch.expectedDeliveryDate.toISOString().split('T')[0]}"` : '""',
            dispatch.actualDeliveryDate ? `"${dispatch.actualDeliveryDate.toISOString().split('T')[0]}"` : '""',
            `"${dispatch.status}"`,
            `"${dispatch.supplier.name}"`,
            `"${dispatch.supplier.contact}"`,
            dispatch.trackingNumber ? `"${dispatch.trackingNumber}"` : '""',
            dispatch.totalValue ? dispatch.totalValue.toString() : '""',
            dispatch.currency ? `"${dispatch.currency}"` : '""',
            '""', // Material Type
            '""', // Profile
            '""', // Grade
            '""', // Quantity
            '""', // Unit
            '""', // Unit Weight
            '""', // Total Weight
            '""', // Unit Cost
            '""', // Total Cost
            '""', // Length Unit
            '""', // Weight Unit
            '""', // Material Status
            '""', // Location
            '""', // Length
            '""', // Width
            '""', // Height
            '""', // Thickness
            '""', // Diameter
            '""'  // Material Notes
          ]
          rows.push(row.join(','))
        } else {
          // Export each material as a separate row
          dispatch.materials.forEach(material => {
            const row = [
              `"${dispatch.dispatchNumber}"`,
              `"${dispatch.projectId}"`,
              `"${dispatch.date.toISOString().split('T')[0]}"`,
              dispatch.expectedDeliveryDate ? `"${dispatch.expectedDeliveryDate.toISOString().split('T')[0]}"` : '""',
              dispatch.actualDeliveryDate ? `"${dispatch.actualDeliveryDate.toISOString().split('T')[0]}"` : '""',
              `"${dispatch.status}"`,
              `"${dispatch.supplier.name}"`,
              `"${dispatch.supplier.contact}"`,
              dispatch.trackingNumber ? `"${dispatch.trackingNumber}"` : '""',
              dispatch.totalValue ? dispatch.totalValue.toString() : '""',
              dispatch.currency ? `"${dispatch.currency}"` : '""',
              `"${material.materialType}"`,
              `"${material.profile}"`,
              `"${material.grade}"`,
              material.quantity.toString(),
              material.unit ? `"${material.unit}"` : '""',
              material.unitWeight.toString(),
              material.totalWeight.toString(),
              material.unitCost ? material.unitCost.toString() : '""',
              material.totalCost ? material.totalCost.toString() : '""',
              `"${material.lengthUnit}"`,
              `"${material.weightUnit}"`,
              `"${material.status}"`,
              material.location ? `"${material.location}"` : '""',
              material.dimensions.length ? material.dimensions.length.toString() : '""',
              material.dimensions.width ? material.dimensions.width.toString() : '""',
              material.dimensions.height ? material.dimensions.height.toString() : '""',
              material.dimensions.thickness ? material.dimensions.thickness.toString() : '""',
              material.dimensions.diameter ? material.dimensions.diameter.toString() : '""',
              material.notes ? `"${material.notes.replace(/"/g, '""')}"` : '""'
            ]
            rows.push(row.join(','))
          })
        }
      })

      const csvContent = rows.join('\n')
      
      toast({
        title: t('csvExportSuccess'),
        description: `${dispatchNotes.length} ${t('dispatchNotesExported')}`
      })

      return csvContent
    } catch (error) {
      console.error('Failed to export dispatches to CSV:', error)
      toast({
        title: t('csvExportFailed'),
        description: error instanceof Error ? error.message : t('csvExportFailed'),
        variant: "destructive"
      })
      throw error
    }
  }, [t])

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