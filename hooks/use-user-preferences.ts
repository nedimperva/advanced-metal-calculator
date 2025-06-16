import { useState, useEffect, useCallback } from 'react'

export interface UserPreferences {
  // Recent selections
  recentMaterials: string[]
  recentGrades: Record<string, string[]> // material -> grades[]
  recentProfileCategories: string[]
  recentProfileTypes: Record<string, string[]> // category -> types[]
  recentStandardSizes: Record<string, string[]> // profileType -> sizes[]
  recentDimensions: Record<string, Record<string, string[]>> // profileType -> dimension -> values[]
  
  // Frequently used
  favoriteCombo: Array<{
    material: string
    grade: string
    profileCategory: string
    profileType: string
    count: number
    lastUsed: number
  }>
  
  // Settings
  defaultLengthUnit: string
  defaultWeightUnit: string
  defaultLength: string
  defaultCurrency: string
  defaultPricingModel: string
  
  // Usage stats
  totalCalculations: number
  lastUpdated: number
}

const STORAGE_KEY = 'metal-calculator-preferences'
const MAX_RECENT_ITEMS = 5
const MAX_DIMENSION_VALUES = 8

function getDefaultPreferences(): UserPreferences {
  return {
    recentMaterials: [],
    recentGrades: {},
    recentProfileCategories: [],
    recentProfileTypes: {},
    recentStandardSizes: {},
    recentDimensions: {},
    favoriteCombo: [],
    defaultLengthUnit: 'mm',
    defaultWeightUnit: 'kg',
    defaultLength: '1000',
    defaultCurrency: 'USD',
    defaultPricingModel: 'per_kg',
    totalCalculations: 0,
    lastUpdated: Date.now()
  }
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(getDefaultPreferences())
  const [isLoading, setIsLoading] = useState(true)

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setPreferences({ ...getDefaultPreferences(), ...parsed })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: UserPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences))
      setPreferences(newPreferences)
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }, [])

  // Track material selection
  const trackMaterial = useCallback((material: string, grade: string) => {
    setPreferences(prev => {
      const newRecentMaterials = [material, ...prev.recentMaterials.filter(m => m !== material)]
        .slice(0, MAX_RECENT_ITEMS)
      
      const newRecentGrades = { ...prev.recentGrades }
      const materialGrades = [grade, ...(prev.recentGrades[material] || []).filter(g => g !== grade)]
        .slice(0, MAX_RECENT_ITEMS)
      newRecentGrades[material] = materialGrades

      const updated = {
        ...prev,
        recentMaterials: newRecentMaterials,
        recentGrades: newRecentGrades,
        lastUpdated: Date.now()
      }
      
      savePreferences(updated)
      return updated
    })
  }, [savePreferences])

  // Track profile selection
  const trackProfile = useCallback((category: string, type: string) => {
    setPreferences(prev => {
      const newRecentCategories = [category, ...prev.recentProfileCategories.filter(c => c !== category)]
        .slice(0, MAX_RECENT_ITEMS)
      
      const newRecentTypes = { ...prev.recentProfileTypes }
      const categoryTypes = [type, ...(prev.recentProfileTypes[category] || []).filter(t => t !== type)]
        .slice(0, MAX_RECENT_ITEMS)
      newRecentTypes[category] = categoryTypes

      const updated = {
        ...prev,
        recentProfileCategories: newRecentCategories,
        recentProfileTypes: newRecentTypes,
        lastUpdated: Date.now()
      }
      
      savePreferences(updated)
      return updated
    })
  }, [savePreferences])

  // Track standard size selection
  const trackStandardSize = useCallback((profileType: string, size: string) => {
    if (size === 'custom') return // Don't track custom selections

    setPreferences(prev => {
      const newRecentSizes = { ...prev.recentStandardSizes }
      const profileSizes = [size, ...(prev.recentStandardSizes[profileType] || []).filter(s => s !== size)]
        .slice(0, MAX_RECENT_ITEMS)
      newRecentSizes[profileType] = profileSizes

      const updated = {
        ...prev,
        recentStandardSizes: newRecentSizes,
        lastUpdated: Date.now()
      }
      
      savePreferences(updated)
      return updated
    })
  }, [savePreferences])

  // Track dimension values
  const trackDimension = useCallback((profileType: string, dimensionKey: string, value: string) => {
    if (!value || value === '0') return // Don't track empty/zero values

    setPreferences(prev => {
      const newRecentDimensions = { ...prev.recentDimensions }
      if (!newRecentDimensions[profileType]) {
        newRecentDimensions[profileType] = {}
      }
      
      const dimensionValues = [value, ...(newRecentDimensions[profileType][dimensionKey] || []).filter(v => v !== value)]
        .slice(0, MAX_DIMENSION_VALUES)
      newRecentDimensions[profileType][dimensionKey] = dimensionValues

      const updated = {
        ...prev,
        recentDimensions: newRecentDimensions,
        lastUpdated: Date.now()
      }
      
      savePreferences(updated)
      return updated
    })
  }, [savePreferences])

  // Track successful calculation (combo tracking)
  const trackCalculation = useCallback((material: string, grade: string, profileCategory: string, profileType: string) => {
    setPreferences(prev => {
      const comboKey = `${material}-${grade}-${profileCategory}-${profileType}`
      const existingCombo = prev.favoriteCombo.find(c => 
        c.material === material && c.grade === grade && 
        c.profileCategory === profileCategory && c.profileType === profileType
      )

      let newFavoriteCombo
      if (existingCombo) {
        newFavoriteCombo = prev.favoriteCombo.map(c => 
          c === existingCombo 
            ? { ...c, count: c.count + 1, lastUsed: Date.now() }
            : c
        )
      } else {
        newFavoriteCombo = [
          ...prev.favoriteCombo,
          { material, grade, profileCategory, profileType, count: 1, lastUsed: Date.now() }
        ]
      }

      // Keep only top 10 combos, sorted by count then by lastUsed
      newFavoriteCombo = newFavoriteCombo
        .sort((a, b) => b.count - a.count || b.lastUsed - a.lastUsed)
        .slice(0, 10)

      const updated = {
        ...prev,
        favoriteCombo: newFavoriteCombo,
        totalCalculations: prev.totalCalculations + 1,
        lastUpdated: Date.now()
      }
      
      savePreferences(updated)
      return updated
    })
  }, [savePreferences])

  // Update default settings
  const updateDefaults = useCallback((updates: Partial<Pick<UserPreferences, 'defaultLengthUnit' | 'defaultWeightUnit' | 'defaultLength' | 'defaultCurrency' | 'defaultPricingModel'>>) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        ...updates,
        lastUpdated: Date.now()
      }
      
      savePreferences(updated)
      return updated
    })
  }, [savePreferences])

  // Get suggestions
  const getSuggestions = useCallback(() => {
    return {
      // Material suggestions (most recent first)
      materials: preferences.recentMaterials,
      
      // Grade suggestions for a specific material
      getGrades: (material: string) => preferences.recentGrades[material] || [],
      
      // Profile category suggestions
      profileCategories: preferences.recentProfileCategories,
      
      // Profile type suggestions for a category
      getProfileTypes: (category: string) => preferences.recentProfileTypes[category] || [],
      
      // Get all recent profile types (mixed from all categories) - for category selection
      getAllRecentProfileTypes: () => {
        const allRecent: Array<{type: string, category: string}> = []
        Object.entries(preferences.recentProfileTypes).forEach(([cat, types]) => {
          types.forEach(type => {
            if (!allRecent.some(item => item.type === type && item.category === cat)) {
              allRecent.push({type, category: cat})
            }
          })
        })
        return allRecent.slice(0, 8) // Limit to 8 most recent across all categories
      },
      
      // Standard size suggestions for a profile type
      getStandardSizes: (profileType: string) => preferences.recentStandardSizes[profileType] || [],
      
      // Dimension value suggestions
      getDimensionValues: (profileType: string, dimensionKey: string) => 
        preferences.recentDimensions[profileType]?.[dimensionKey] || [],
      
      // Top material-profile combinations
      topCombos: preferences.favoriteCombo.slice(0, 5),
      
      // Default values
      defaults: {
        lengthUnit: preferences.defaultLengthUnit,
        weightUnit: preferences.defaultWeightUnit,
        length: preferences.defaultLength,
        defaultCurrency: preferences.defaultCurrency,
        defaultPricingModel: preferences.defaultPricingModel
      }
    }
  }, [preferences])

  // Clear all preferences
  const clearPreferences = useCallback(() => {
    const defaults = getDefaultPreferences()
    savePreferences(defaults)
  }, [savePreferences])

  return {
    preferences,
    isLoading,
    trackMaterial,
    trackProfile,
    trackStandardSize,
    trackDimension,
    trackCalculation,
    updateDefaults,
    getSuggestions,
    clearPreferences
  }
}
