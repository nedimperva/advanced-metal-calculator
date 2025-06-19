"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, UnitInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calculator, Save, Share2, History, Download, ChevronRight, AlertTriangle, CheckCircle, Loader2, RefreshCw, AlertCircle, BarChart3, Layers, Cog, Clock, FolderOpen, Plus, Archive } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useRouter, useSearchParams } from "next/navigation"
import ProjectCreationModal from "@/components/project-creation-modal"

import { cn, formatCalculationName, getShortMaterialTag } from "@/lib/utils"
import { animations, animationPresets, safeAnimation, createStaggeredAnimation } from "@/lib/animations"
import ProfileSelector from "@/components/profile-selector"
import MaterialSelector from "@/components/material-selector"
import { ErrorBoundary } from "@/components/error-boundary"
import { CalculationBreakdown } from "@/components/calculation-breakdown"

import { AdvancedStructuralAnalysis } from "@/components/advanced-structural-analysis"
import { 
  LoadingSpinner, 
  CalculationLoading, 
  MaterialSelectorSkeleton, 
  ResultsSkeleton, 
  DimensionInputsSkeleton 
} from "@/components/loading-states"
import { 
  EnhancedInputGroup, 
  ValidationSummary,
  DimensionPresets
} from "@/components/enhanced-input"
import { 
  validateCalculationInputs, 
  validateTemperature, 
  createError, 
  ErrorType,
  type ValidationResult 
} from "@/lib/validation"
import { MATERIALS, PROFILES, STANDARD_SIZES } from "@/lib/metal-data"
import { LENGTH_UNITS, WEIGHT_UNITS } from "@/lib/unit-conversions"
import { 
  calculateWeight, 
  calculateCrossSectionalArea, 
  calculateStructuralProperties,
  calculateStructuralPropertiesWithTemperature 
} from "@/lib/calculations"
import type { Calculation, ProfileData, MaterialData, StructuralProperties, Project } from "@/lib/types"
import type { MaterialGrade } from "@/lib/metal-data"
import BackgroundElements from "@/components/background-elements"
import { SettingsButton } from "@/components/settings-button"
import { useI18n } from "@/contexts/i18n-context"
import { MobileEnhancedInput, useDimensionSuggestions } from "@/components/mobile-enhanced-input"
import { MobileResults } from "@/components/mobile-results"
import { SwipeTabs } from "@/components/swipe-tabs"
import { CrossSectionViewer } from "@/components/profile-diagrams"
import { useUserPreferences } from "@/hooks/use-user-preferences"
import { 
  isProfileCompatible, 
  getCompatibleProfileCategories, 
  getCompatibleProfileTypesInCategory 
} from "@/lib/material-profile-compatibility"
import { useProjects } from "@/contexts/project-context"
import { saveCalculationToProject } from "@/lib/database"
import PricingModelSelector from "@/components/pricing-model-selector"
import ProjectDashboard from "@/components/project-dashboard"
import MobileProjectDashboard from "@/components/mobile-project-dashboard"
import { UnifiedProjectDetails } from "@/components/unified-project-details"
import { 
  type PricingModel,
  PRICING_MODELS,
  calculateTotalCost, 
  calculateUnitCost,
  getRecommendedPricingModel 
} from "@/lib/pricing-models"
import { getProfileTypeName } from "@/lib/i18n"
import { CalculationHistory, CalculationComparison } from "@/components/calculation-comparison"

// Projects Tab Content Component
function ProjectsTabContent({ initialSelectedProject }: { initialSelectedProject?: Project }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(initialSelectedProject ?? undefined)
  const [showProjectDetails, setShowProjectDetails] = useState(!!initialSelectedProject)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const { setCurrentProject } = useProjects()

  // Listen for mobile create project events
  useEffect(() => {
    const handleShowCreateDialog = () => {
      setShowCreateDialog(true)
    }

    window.addEventListener('showCreateProjectDialog', handleShowCreateDialog)
    return () => {
      window.removeEventListener('showCreateProjectDialog', handleShowCreateDialog)
    }
  }, [])

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    setShowProjectDetails(true)
    setCurrentProject(project)
    // Clear any pending edit modal state when navigating to project details
    setShowCreateDialog(false)
    setEditingProject(null)
  }

  const handleBackToProjects = () => {
    setShowProjectDetails(false)
    setSelectedProject(undefined)
    setCurrentProject(null)
  }

  const handleEditProject = (project: Project) => {
    // If we're currently viewing project details, stay in project details
    // and let the unified project details handle the edit
    if (showProjectDetails && selectedProject?.id === project.id) {
      return
    }
    
    // Otherwise, close project details and show edit modal
    setShowProjectDetails(false)
    setSelectedProject(undefined)
    setEditingProject(project)
    setShowCreateDialog(true)
  }

  const handleCreateProject = () => {
    setEditingProject(null) // Clear any editing project
    setShowCreateDialog(true)
  }

  const handleProjectCreated = (projectId: string) => {
    // Optionally handle project selection after creation
    console.log('Project created:', projectId)
  }



  if (showProjectDetails && selectedProject) {
    return (
      <UnifiedProjectDetails
        project={selectedProject}
        onBack={handleBackToProjects}
        onEdit={() => {
          // When editing from project details, open edit modal while staying in project details
          if (selectedProject) {
            setEditingProject(selectedProject || null)
            setShowCreateDialog(true)
          }
        }}

      />
    )
  }

  return (
    <div className="space-y-6 relative">
      {isDesktop ? (
        <ProjectDashboard 
          showHeader={true} 
          onProjectSelect={handleProjectSelect}
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
        />
      ) : (
        <MobileProjectDashboard 
          onProjectSelect={handleProjectSelect}
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
        />
      )}



      {/* Create/Edit Project Modal */}
      <ProjectCreationModal
        open={showCreateDialog}
        onOpenChange={(open: boolean) => {
          setShowCreateDialog(open)
          if (!open) {
            setEditingProject(null) // Clear editing project when modal closes
          }
        }}
        onProjectCreated={handleProjectCreated}
        editProject={editingProject}
      />
    </div>
  )
}

// Helper function to map profile types for cross-section viewer
function getProfileTypeForViewer(profileType: string, dimensions: Record<string, string> = {}): string {
  const lowerType = profileType.toLowerCase()
  
  // I-beams and channels
  if (lowerType.includes('hea') || lowerType.includes('heb') || lowerType.includes('hem') || 
      lowerType.includes('ipe') || lowerType.includes('ipn')) return 'ibeam'
  if (lowerType.includes('hec')) return 'hec'
  if (lowerType.includes('wbeam') || lowerType === 'w') return 'wbeam'
  if (lowerType.includes('upn') || lowerType.includes('channel') || lowerType.includes('uchannel') || lowerType === 'c') return 'channel'
  
  // Determine if it's solid or hollow based on dimensions
  const hasThickness = dimensions.t || dimensions.wt || dimensions.thickness
  
  // Rectangular profiles
  if (lowerType.includes('rhs') || lowerType.includes('rectangular')) {
    // If no thickness dimension, it's a solid rectangular bar
    if (!hasThickness) return 'rectangular'
    // If has thickness, it's a hollow rectangular section
    return 'rhs'
  }
  
  // Square profiles  
  if (lowerType.includes('shs') || lowerType.includes('square')) {
    // If no thickness dimension, it's a solid square bar
    if (!hasThickness) return 'square'
    // If has thickness, it's a hollow square section
    return 'shs'
  }
  
  // Specific bar types
  if (lowerType.includes('squarebar') || lowerType.includes('square_bar')) return 'square'
  if (lowerType.includes('rectangularbar') || lowerType.includes('rectangular_bar')) return 'rectangular'
  
  // Other profiles
  if (lowerType.includes('chs') || lowerType.includes('circular')) return 'chs'
  if (lowerType.includes('unequal') && lowerType.includes('angle')) return 'unequal_angle'
  if (lowerType.includes('equal') && lowerType.includes('angle')) return 'equal_angle'
  if (lowerType.includes('round') || lowerType.includes('bar')) return 'round'
  if (lowerType.includes('flat')) return 'flat'
  if (lowerType.includes('hex')) return 'hexagonal'
  if (lowerType.includes('plate') || lowerType.includes('sheet')) return 'plate'
  
  return profileType
}

export default function MetalWeightCalculator() {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [layoutReady, setLayoutReady] = useState(false)
  const { trackStandardSize, trackDimension, trackCalculation, getSuggestions, updateDefaults } = useUserPreferences()
  const suggestions = getSuggestions()
  const { t, language } = useI18n()



  // Allow layout to stabilize after mount
  useEffect(() => {
    const timer = setTimeout(() => setLayoutReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // State for undo/redo


  // State management with simple useState
  const [profileCategory, setProfileCategory] = useState("beams")
  const [profileType, setProfileType] = useState("hea")
  const [standardSize, setStandardSize] = useState("")
  const [material, setMaterial] = useState("steel")
  const [grade, setGrade] = useState("a36")
  const [dimensions, setDimensions] = useState<Record<string, string>>({})
  const [length, setLength] = useState(suggestions.defaults.length)
  const [lengthInput, setLengthInput] = useState(suggestions.defaults.length) // Separate input state
  const [lengthUnit, setLengthUnit] = useState(suggestions.defaults.lengthUnit)
  const [weightUnit, setWeightUnit] = useState(suggestions.defaults.weightUnit)

  // Project context for calculator
  const { currentProject, selectProject, projects, refreshProjects, setCurrentProject } = useProjects()
  const [activeProjectId, setActiveProjectId] = useState<string>('')

  // Use refs to store timeout IDs for debouncing
  const lengthUpdateTimeoutRef = useRef<any>(null)
  const lengthCalculationTimeoutRef = useRef<any>(null)

  // Initialize pricing and units from settings
  useEffect(() => {
    setCurrency(suggestions.defaults.defaultCurrency)
    setPricingModel(suggestions.defaults.defaultPricingModel as PricingModel)
  }, [suggestions.defaults.defaultCurrency, suggestions.defaults.defaultPricingModel])

  // Update units when settings change
  useEffect(() => {
    setLengthUnit(suggestions.defaults.lengthUnit)
    setWeightUnit(suggestions.defaults.weightUnit)
  }, [suggestions.defaults.lengthUnit, suggestions.defaults.weightUnit])

  // Track unit changes and recalculate when units change
  const handleLengthUnitChange = useCallback((newUnit: string) => {
    setLengthUnit(newUnit)
    updateDefaults({ defaultLengthUnit: newUnit })
  }, [updateDefaults])

  const handleWeightUnitChange = useCallback((newUnit: string) => {
    setWeightUnit(newUnit)
    updateDefaults({ defaultWeightUnit: newUnit })
  }, [updateDefaults])



  // Handle length input changes with aggressive debouncing
  const handleLengthChange = useCallback((newLength: string) => {
    // Update input state immediately for smooth typing
    setLengthInput(newLength)
    
    // Clear previous timeouts
    if (lengthCalculationTimeoutRef.current) {
      clearTimeout(lengthCalculationTimeoutRef.current)
    }
    if (lengthUpdateTimeoutRef.current) {
      clearTimeout(lengthUpdateTimeoutRef.current)
    }
    
    // Update calculation state after user stops typing (longer delay)
    lengthCalculationTimeoutRef.current = setTimeout(() => {
      setLength(newLength)
    }, 800) as any // 800ms delay for calculation
    
    // Update defaults after even longer delay
    lengthUpdateTimeoutRef.current = setTimeout(() => {
      if (newLength && newLength !== '0' && !isNaN(parseFloat(newLength))) {
        updateDefaults({ defaultLength: newLength })
      }
    }, 1200) as any // 1200ms delay for defaults
  }, [updateDefaults])
  const [operatingTemperature, setOperatingTemperature] = useState("20")
  const [useTemperatureEffects, setUseTemperatureEffects] = useState(false)



  // Profile selection state
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialGrade | null>(null)
  const [customInput, setCustomInput] = useState(false)

  // Enhanced Results - using StructuralProperties
  const [structuralProperties, setStructuralProperties] = useState<StructuralProperties | null>(null)
  const [weight, setWeight] = useState(0)
  const [crossSectionalArea, setCrossSectionalArea] = useState(0)
  const [volume, setVolume] = useState(0)

  // Quantity and pricing
  const [quantity, setQuantity] = useState("1")
  const [pricePerUnit, setPricePerUnit] = useState("")
  const [currency, setCurrency] = useState(suggestions.defaults.defaultCurrency)
  const [pricingModel, setPricingModel] = useState<PricingModel>(suggestions.defaults.defaultPricingModel as PricingModel)

  // History
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [activeTab, setActiveTab] = useState("calculator")
  
  // State for initially selected project when navigating from calculator
  const [initialSelectedProject, setInitialSelectedProject] = useState<Project | undefined>(undefined)
  
  // Reset initial selected project when navigating away from projects tab
  useEffect(() => {
    if (activeTab !== 'projects') {
      setInitialSelectedProject(undefined)
      setCurrentProject(null)
    }
  }, [activeTab, setCurrentProject])

  // Comparison state
  const [comparisonCalculations, setComparisonCalculations] = useState<Set<string>>(new Set())
  const [historyCompareView, setHistoryCompareView] = useState<'history' | 'compare'>('history')

  // Error handling and validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [calculationError, setCalculationError] = useState<string | null>(null)
  const [lastValidation, setLastValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  })

  // Notes state for saving calculations
  const [showNotesInput, setShowNotesInput] = useState(false)
  const [calculationNotes, setCalculationNotes] = useState("")

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingCalculationId, setEditingCalculationId] = useState<string | null>(null)

  // Load saved calculations from IndexedDB only
  useEffect(() => {
    const loadSavedCalculations = async () => {
      try {
        const { getAllCalculations } = await import('../lib/database')
        const dbCalculations = await getAllCalculations()
        dbCalculations.sort((a: Calculation, b: Calculation) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setCalculations(dbCalculations)
        // Check for edit parameter in URL
        const urlParams = new URLSearchParams(window.location.search)
        const editId = urlParams.get('edit')
        const projectId = urlParams.get('project')
        if (editId) {
          setIsEditMode(true)
          setEditingCalculationId(editId)
            if (projectId) {
            setInitialSelectedProject(projects.find((p: Project) => p.id === projectId))
          }
        }
      } catch (error) {
        console.error('Failed to load calculations:', error)
      }
    }
    loadSavedCalculations()
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (lengthCalculationTimeoutRef.current) {
        clearTimeout(lengthCalculationTimeoutRef.current as number)
      }
      if (lengthUpdateTimeoutRef.current) {
        clearTimeout(lengthUpdateTimeoutRef.current as number)
      }
    }
  }, [])

  // Material-Profile Compatibility Validation
  useEffect(() => {
    // Check if current profile is compatible with selected material
    if (!isProfileCompatible(material, profileType)) {
      const compatibleCategories = getCompatibleProfileCategories(material)
      
      if (compatibleCategories.length > 0) {
        // Find the first compatible category
        const firstCompatibleCategory = compatibleCategories[0]
        const compatibleTypes = getCompatibleProfileTypesInCategory(material, firstCompatibleCategory)
        
        if (compatibleTypes.length > 0) {
          // Auto-correct to a compatible profile
          const firstCompatibleType = compatibleTypes[0]
          
          toast({
                      title: t('profileAutoCorrect'),
          description: `${profileType} is not available for ${material}. Switched to ${firstCompatibleType}.`,
            variant: "default",
          })
          
          setProfileCategory(firstCompatibleCategory)
          setProfileType(firstCompatibleType)
          setStandardSize("") // Reset standard size when changing profile
        }
      } else {
        // No compatible profiles at all - this shouldn't happen with our data
        toast({
                  title: t('compatibilityIssue'),
        description: `No compatible profiles found for ${material}. Please select a different material.`,
          variant: "destructive",
        })
      }
    }
  }, [material, profileType])

  // Auto-set recommended pricing model when profile changes
  useEffect(() => {
    const recommended = getRecommendedPricingModel(profileCategory, profileType)
    setPricingModel(recommended)
  }, [profileCategory, profileType])

  // Update selected profile and material when type/grade changes
  useEffect(() => {
    try {
      const profile =
        PROFILES[profileCategory as keyof typeof PROFILES]?.types[
          profileType as keyof (typeof PROFILES)[keyof typeof PROFILES]["types"]
        ]
      setSelectedProfile(profile || null)

      // Reset standard size when profile changes
      setStandardSize("")

      // Reset custom dimensions when profile changes (but not if we have a standard size selected)
      if (!customInput && !standardSize) {
        setDimensions({})
      }

      // Clear calculation error when profile changes
      setCalculationError(null)
    } catch (error) {
      console.error("Error updating profile:", error)
      setCalculationError("Failed to load profile data")
    }
  }, [profileCategory, profileType, customInput])

  useEffect(() => {
    try {
      setIsLoadingMaterials(true)
      const materialData =
        MATERIALS[material as keyof typeof MATERIALS]?.grades[
          grade as keyof (typeof MATERIALS)[keyof typeof MATERIALS]["grades"]
        ] as MaterialGrade | undefined
      setSelectedMaterial(materialData || null)
      setCalculationError(null)
    } catch (error) {
      console.error("Error updating material:", error)
      setCalculationError("Failed to load material data")
    } finally {
      setIsLoadingMaterials(false)
    }
  }, [material, grade])

  // Update dimensions when standard size changes
  useEffect(() => {
    if (standardSize && selectedProfile) {
      try {
        const sizes = STANDARD_SIZES[profileType as keyof typeof STANDARD_SIZES]
        const selectedSizeData = sizes?.find((size) => size.designation === standardSize)

        if (selectedSizeData) {
          setDimensions(selectedSizeData.dimensions)
          setCustomInput(false)
          setCalculationError(null)
          // Track the standard size selection
          trackStandardSize(profileType, standardSize)
        }
      } catch (error) {
        console.error("Error updating standard size:", error)
        setCalculationError("Failed to load standard size data")
      }
    }
  }, [standardSize, profileType, selectedProfile, trackStandardSize])

  // Validate inputs
  const validateInputs = useCallback(() => {
    if (!selectedProfile || !selectedMaterial) {
      return { isValid: false, errors: [t('selectProfileMaterial')], warnings: [] }
    }

    const validation = validateCalculationInputs(
      profileType,
      dimensions,
      length,
      selectedMaterial,
      operatingTemperature
    )

    setLastValidation(validation)
    setValidationErrors(validation.errors)
    setValidationWarnings(validation.warnings)

    return validation
  }, [profileType, dimensions, length, selectedMaterial, operatingTemperature, selectedProfile])

  // Enhanced calculation with error handling
  const performCalculation = useCallback(async () => {
    if (!selectedProfile || !selectedMaterial) return

    setIsCalculating(true)
    setCalculationError(null)

    try {
      // Validate inputs first
      const validation = validateInputs()
      if (!validation.isValid) {
        setIsCalculating(false)
        return
      }

      const lengthValue = Number.parseFloat(length) || 0
      const lengthFactor = LENGTH_UNITS[lengthUnit as keyof typeof LENGTH_UNITS].factor
      const tempValue = Number.parseFloat(operatingTemperature) || 20

      // Simulate calculation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 150))

      // Calculate enhanced structural properties with optional temperature effects
      const properties = useTemperatureEffects 
        ? calculateStructuralPropertiesWithTemperature(
            profileType,
            dimensions,
            selectedMaterial.density,
            lengthFactor,
            tempValue,
            selectedMaterial.temperatureCoefficient
          )
        : calculateStructuralProperties(
            profileType,
            dimensions,
            selectedMaterial.density,
            lengthFactor
          )
      
      if (!properties || properties.area <= 0) {
        throw new Error("Invalid calculation result - check input dimensions")
      }

      setStructuralProperties(properties)
      setCrossSectionalArea(properties.area)

      // For plates, calculate full volume differently
      const calculatedVolume = profileCategory === "plates" 
        ? (parseFloat(dimensions.length || "0") * lengthFactor) * 
          (parseFloat(dimensions.width || "0") * lengthFactor) * 
          (parseFloat(dimensions.thickness || "0") * lengthFactor)
        : properties.area * (lengthValue * lengthFactor)
      setVolume(calculatedVolume)

      // Use adjusted density if temperature effects are enabled
      const effectiveDensity = properties.adjustedDensity || selectedMaterial.density
      
      // For plates, calculate weight using the full volume
      const calculatedWeight = profileCategory === "plates"
        ? calculatedVolume * effectiveDensity * WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].factor
        : calculateWeight(
            profileType,
            dimensions,
            lengthValue,
            effectiveDensity,
            lengthFactor,
            WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].factor,
          )

      if (calculatedWeight <= 0) {
        throw new Error("Invalid weight calculation - check input values")
      }

      setWeight(calculatedWeight)

      // Track successful calculation and dimension usage
      trackCalculation(material, grade, profileCategory, profileType)
      Object.entries(dimensions).forEach(([key, value]) => {
        if (value && value !== '0') {
          trackDimension(profileType, key, value)
        }
      })

    } catch (error) {
      console.error("Calculation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown calculation error"
      setCalculationError(errorMessage)
      setStructuralProperties(null)
      setCrossSectionalArea(0)
      setVolume(0)
      setWeight(0)

      toast({
        title: t('calculationError'),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }, [
    selectedProfile, 
    selectedMaterial, 
    dimensions, 
    length, 
    lengthUnit, 
    weightUnit, 
    profileType, 
    operatingTemperature, 
    useTemperatureEffects, 
    validateInputs,
    trackCalculation,
    trackDimension,
    material,
    grade,
    profileCategory
  ])

  // Debounced calculation trigger to prevent input focus loss
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only trigger calculation if we have the necessary data
      if (selectedProfile && selectedMaterial && Object.keys(dimensions).length > 0 && length) {
        performCalculation()
      }
    }, 200) // Short delay since length changes are already debounced
    
    return () => clearTimeout(timeoutId)
  }, [selectedProfile, selectedMaterial, dimensions, length, lengthUnit, weightUnit, operatingTemperature, useTemperatureEffects, profileType])

  // Use ref for dimension update debouncing
  const dimensionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const updateDimension = useCallback((key: string, value: string) => {
    const newDimensions = { ...dimensions, [key]: value }
    
    // Update state immediately for better UX
    setDimensions(newDimensions)
    
    // If user is editing dimensions, switch to custom input mode
    if (!customInput) {
      setCustomInput(true)
      setStandardSize("")
    }
    setCalculationError(null)
  }, [dimensions, customInput])

  // Handle copying dimensions from preset
  const handleCopyFromPreset = useCallback((presetDimensions: Record<string, number>) => {
    const stringDimensions: Record<string, string> = {}
    Object.entries(presetDimensions).forEach(([key, value]) => {
      stringDimensions[key] = value.toString()
    })
    
    setDimensions(stringDimensions)
    setStandardSize("")
    setCustomInput(true)
    setCalculationError(null)
  }, [])

  const saveCalculation = async () => {
    if (weight <= 0 || !selectedProfile || !selectedMaterial || !structuralProperties) {
      toast({
        title: t('cannotSave'),
        description: "Please ensure all inputs are valid and calculation is complete.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const unitCost = pricePerUnit ? calculateUnitCost(
        pricingModel,
        parseFloat(pricePerUnit),
        weight,
        parseFloat(length),
        weightUnit,
        lengthUnit
      ) : 0

      const totalCost = pricePerUnit ? calculateTotalCost(
        pricingModel,
        parseFloat(pricePerUnit),
        weight,
        parseFloat(length),
        parseFloat(quantity),
        weightUnit,
        lengthUnit
      ) : 0

      const totalWeight = weight * parseFloat(quantity)

      // Create calculation object for naming
      const tempCalc = {
        id: isEditMode ? editingCalculationId! : Date.now().toString(),
        profileCategory,
        profileType,
        standardSize: standardSize || "Custom",
        dimensions: { ...dimensions, length },
        materialName: selectedMaterial.name,
        profileName: getProfileTypeName(language, profileType),
        material,
        grade,
        weight,
        weightUnit,
        crossSectionalArea: structuralProperties.area,
        timestamp: new Date()
      } as Calculation

      // Use established naming convention
      const { mainName, materialTag } = formatCalculationName(tempCalc)

      let updatedCalculation: Calculation

      if (isEditMode && editingCalculationId) {
        // Update existing calculation
        const existingCalc = calculations.find(calc => calc.id === editingCalculationId)
        updatedCalculation = {
          ...existingCalc!,
          name: mainName,
          profileCategory,
          profileType,
          profileName: getProfileTypeName(language, profileType),
          standardSize: standardSize || "Custom",
          material,
          grade,
          materialName: selectedMaterial.name,
          dimensions: { ...dimensions, length },
          weight,
          weightUnit,
          lengthUnit,
          crossSectionalArea: structuralProperties.area,
          // Enhanced structural properties
          momentOfInertiaX: structuralProperties.momentOfInertiaX,
          momentOfInertiaY: structuralProperties.momentOfInertiaY,
          sectionModulusX: structuralProperties.sectionModulusX,
          sectionModulusY: structuralProperties.sectionModulusY,
          radiusOfGyrationX: structuralProperties.radiusOfGyrationX,
          radiusOfGyrationY: structuralProperties.radiusOfGyrationY,
          perimeter: structuralProperties.perimeter,
          // Pricing information
          quantity: parseFloat(quantity),
          priceValue: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
          pricingModel,
          currency,
          totalCost,
          unitCost,
          totalWeight,
          // Project assignment - automatically assign to active project
          projectId: activeProjectId || undefined,
          notes: calculationNotes.trim() || `${materialTag} • ${parseFloat(quantity)} pieces`,
          // Keep original timestamp
          timestamp: existingCalc?.timestamp || new Date(),
        }

        // Persist update to IndexedDB
        const { updateCalculation } = await import('../lib/database')
        await updateCalculation(updatedCalculation)
      } else {
        // Create new calculation
        updatedCalculation = {
          id: Date.now().toString(),
          name: mainName,
          profileCategory,
          profileType,
          profileName: getProfileTypeName(language, profileType),
          standardSize: standardSize || "Custom",
          material,
          grade,
          materialName: selectedMaterial.name,
          dimensions: { ...dimensions, length },
          weight,
          weightUnit,
          lengthUnit,
          crossSectionalArea: structuralProperties.area,
          // Enhanced structural properties
          momentOfInertiaX: structuralProperties.momentOfInertiaX,
          momentOfInertiaY: structuralProperties.momentOfInertiaY,
          sectionModulusX: structuralProperties.sectionModulusX,
          sectionModulusY: structuralProperties.sectionModulusY,
          radiusOfGyrationX: structuralProperties.radiusOfGyrationX,
          radiusOfGyrationY: structuralProperties.radiusOfGyrationY,
          perimeter: structuralProperties.perimeter,
          // Pricing information
          quantity: parseFloat(quantity),
          priceValue: pricePerUnit ? parseFloat(pricePerUnit) : undefined,
          pricingModel,
          currency,
          totalCost,
          unitCost,
          totalWeight,
          // Project assignment - automatically assign to active project
          projectId: activeProjectId || undefined,
          notes: calculationNotes.trim() || `${materialTag} • ${parseFloat(quantity)} pieces`,
          timestamp: new Date(),
        }

        // Persist new calculation to IndexedDB
        const { saveCalculation } = await import('../lib/database')
        await saveCalculation(updatedCalculation)
      }

      // Refresh calculations from IndexedDB
      const { getAllCalculations } = await import('../lib/database')
      const dbCalculations = await getAllCalculations()
      dbCalculations.sort((a: Calculation, b: Calculation) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setCalculations(dbCalculations)

      // Save to IndexedDB for project management
      if (activeProjectId) {
        const { saveCalculationToProject } = await import('../lib/database')
        await saveCalculationToProject(updatedCalculation, activeProjectId)
      }

      // Always refresh project context so allCalculations updates for modals
      if (typeof refreshProjects === 'function') await refreshProjects()

      const projectName = activeProjectId ? projects.find((p: Project) => p.id === activeProjectId)?.name : 'General History'
      
      // Clear edit mode and notes after saving
      if (isEditMode) {
        setIsEditMode(false)
        setEditingCalculationId(null)
      }
      setCalculationNotes("")
      setShowNotesInput(false)

      toast({
        title: isEditMode ? "Calculation Updated" : t('calculationSaved'),
        description: isEditMode 
          ? `Updated "${mainName}" in ${projectName}`
          : `Saved "${mainName}" to ${projectName}`,
      })
    } catch (error) {
      console.error("Error saving calculation:", error)
      toast({
        title: t('savingError'),
        description: "Failed to save calculation.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const exportCalculation = () => {
    if (weight <= 0 || !selectedProfile || !selectedMaterial || !structuralProperties) {
      toast({
              title: t('cannotExport'),
      description: "Please select a valid profile and material first.",
        variant: "destructive",
      })
      return
    }

    // Create a temporary calculation object for formatting
    const tempCalc: Calculation = {
      id: 'temp',
      profileCategory,
      profileType,
      profileName: getProfileTypeName(language, profileType),
      standardSize: standardSize || "Custom",
      material,
      grade,
      materialName: selectedMaterial.name,
      dimensions: { ...dimensions, length },
      weight,
      weightUnit,
      lengthUnit,
      crossSectionalArea: structuralProperties.area,
      timestamp: new Date()
    }
    
    const { mainName, materialTag } = formatCalculationName(tempCalc)

    const exportData = {
      // Basic Information - Using new naming convention
      profileSpecification: mainName,
      material: materialTag,
      standardSize: standardSize || "Custom",
      density: `${selectedMaterial.density} g/cm³`,
      
      // Dimensions
      dimensions: Object.entries(dimensions)
        .map(
          ([key, value]) =>
            `${key}: ${value} ${LENGTH_UNITS[lengthUnit as keyof typeof LENGTH_UNITS].name.toLowerCase()}`,
        )
        .join(", "),
      length: `${length} ${LENGTH_UNITS[lengthUnit as keyof typeof LENGTH_UNITS].name.toLowerCase()}`,
      
      // Basic Results
      crossSectionalArea: `${structuralProperties.area.toFixed(4)} cm²`,
      volume: `${volume.toFixed(4)} cm³`,
      weight: `${weight.toFixed(4)} ${WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name.toLowerCase()}`,
      
      // Enhanced Structural Properties
      momentOfInertiaX: `${structuralProperties.momentOfInertiaX.toFixed(2)} cm⁴`,
      momentOfInertiaY: `${structuralProperties.momentOfInertiaY.toFixed(2)} cm⁴`,
      sectionModulusX: `${structuralProperties.sectionModulusX.toFixed(2)} cm³`,
      sectionModulusY: `${structuralProperties.sectionModulusY.toFixed(2)} cm³`,
      radiusOfGyrationX: `${structuralProperties.radiusOfGyrationX.toFixed(2)} cm`,
      radiusOfGyrationY: `${structuralProperties.radiusOfGyrationY.toFixed(2)} cm`,
      perimeter: `${structuralProperties.perimeter.toFixed(2)} cm`,
      weightPerLength: `${structuralProperties.weight.toFixed(3)} kg/m`,
      
      // Enhanced Material Properties
      yieldStrength: `${selectedMaterial.yieldStrength} MPa`,
      tensileStrength: `${selectedMaterial.tensileStrength} MPa`,
      elasticModulus: `${selectedMaterial.elasticModulus} GPa`,
      poissonRatio: selectedMaterial.poissonRatio,
      hardness: selectedMaterial.hardness || "N/A",
      
      // Thermal Properties
      meltingPoint: `${selectedMaterial.meltingPoint}°C`,
      thermalExpansion: `${selectedMaterial.thermalExpansion} × 10⁻⁶/°C`,
      thermalConductivity: `${selectedMaterial.thermalConductivity} W/m·K`,
      specificHeat: `${selectedMaterial.specificHeat} J/kg·K`,
      
      // Cost and Availability
      relativeCost: `${selectedMaterial.relativeCost}/5`,
      availability: selectedMaterial.availability,
      
      // Standards and Applications
      standards: selectedMaterial.standards.join("; "),
      applications: selectedMaterial.applications.join("; "),
      
      // Temperature Effects (if enabled)
      ...(useTemperatureEffects && structuralProperties.adjustedDensity ? {
        operatingTemperature: `${operatingTemperature}°C`,
        adjustedDensity: `${structuralProperties.adjustedDensity.toFixed(4)} g/cm³`,
        densityChange: `${((structuralProperties.adjustedDensity - (selectedMaterial?.density || 0)) / (selectedMaterial?.density || 1) * 100).toFixed(2)}%`,
        temperatureCoefficient: `${selectedMaterial.temperatureCoefficient || 0} /°C`,
      } : {}),
      
      timestamp: new Date().toLocaleString(),
    }

    const csvContent = Object.entries(exportData)
      .map(([key, value]) => `${key},${value}`)
      .join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `metal-calculation-enhanced-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
          title: t('enhancedCalculationExported'),
    description: "Comprehensive CSV with material properties and temperature effects downloaded.",
    })
  }

  const shareCalculation = async () => {
    if (weight <= 0 || !selectedProfile || !selectedMaterial || !structuralProperties) {
      toast({
              title: t('cannotShare'),
      description: "Please select a valid profile and material first.",
        variant: "destructive",
      })
      return
    }

    // Create a temporary calculation object for formatting
    const tempCalc: Calculation = {
      id: 'temp',
      profileCategory,
      profileType,
      profileName: getProfileTypeName(language, profileType),
      standardSize: standardSize || "Custom",
      material,
      grade,
      materialName: selectedMaterial.name,
      dimensions: { ...dimensions, length },
      weight,
      weightUnit,
      lengthUnit,
      crossSectionalArea: structuralProperties.area,
      timestamp: new Date()
    }
    
    const { mainName, materialTag } = formatCalculationName(tempCalc)
    const shortMaterialTag = getShortMaterialTag(materialTag)

    const shareData = {
      title: "Metal Weight Calculator Result",
      text: `${mainName} (${shortMaterialTag}) weighs ${weight.toFixed(4)} ${WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name.toLowerCase()}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast({
                  title: t('sharedSuccessfully'),
        description: "Calculation shared successfully.",
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(shareData.text)
      toast({
              title: t('copiedToClipboard'),
      description: "Calculation details copied to clipboard.",
      })
    }
  }

  // Function to delete a calculation
  const deleteCalculation = async (calculationId: string) => {
    try {
      // Remove from state
      const updatedCalculations = calculations.filter(calc => calc.id !== calculationId)
      setCalculations(updatedCalculations)
      
      // Remove from IndexedDB if it exists there
      try {
        const { deleteCalculation: dbDeleteCalculation } = await import('../lib/database')
        await dbDeleteCalculation(calculationId)
      } catch (dbError) {
        console.warn("Failed to delete from IndexedDB:", dbError)
      }
      
      // If we're currently editing this calculation, exit edit mode
      if (editingCalculationId === calculationId) {
        cancelEditMode()
      }
      
      toast({
        title: "Calculation Deleted",
        description: "The calculation has been removed from history.",
      })
    } catch (error) {
      console.error("Error deleting calculation:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete calculation. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Function to cancel edit mode
  const cancelEditMode = () => {
    setIsEditMode(false)
    setEditingCalculationId(null)
    setCalculationNotes("")
    setShowNotesInput(false)
    toast({
      title: "Edit Cancelled",
      description: "Returned to normal mode.",
    })
  }

  const loadCalculation = (calc: Calculation, editMode: boolean = false) => {
    setProfileCategory(calc.profileCategory)
    setProfileType(calc.profileType)
    setMaterial(calc.material)
    setGrade(calc.grade)
    setWeightUnit(calc.weightUnit)
    
    // Load length unit if available (backward compatibility)
    if (calc.lengthUnit) {
      setLengthUnit(calc.lengthUnit)
    }

    // Extract length from dimensions
    const calcLength = calc.dimensions.length || "1000"
    setLength(calcLength)
    setLengthInput(calcLength) // Sync input state

    // Set other dimensions
    const { length: _, ...otherDimensions } = calc.dimensions
    setDimensions(otherDimensions)

    // Set standard size if available
    setStandardSize(calc.standardSize === "Custom" ? "" : calc.standardSize)
    setCustomInput(calc.standardSize === "Custom")

    // Load pricing information if available (backward compatibility)
    if (calc.quantity !== undefined) {
      setQuantity(calc.quantity.toString())
    }
    if (calc.priceValue !== undefined) {
      setPricePerUnit(calc.priceValue.toString())
    }
    if (calc.pricingModel) {
      setPricingModel(calc.pricingModel)
    }
    if (calc.currency) {
      setCurrency(calc.currency)
    }

    // Load notes if available
    if (calc.notes) {
      setCalculationNotes(calc.notes)
      setShowNotesInput(true)
    }

    // Set edit mode
    if (editMode) {
      setIsEditMode(true)
      setEditingCalculationId(calc.id)
      toast({
        title: "Edit Mode",
        description: `Editing: ${calc.name || 'Calculation'}. Click Update to save changes.`,
      })
    } else {
      setIsEditMode(false)
      setEditingCalculationId(null)
    }

    // Switch to calculator tab
    setActiveTab("calculator")
  }

  const renderDimensionInputs = () => {
    if (!selectedProfile) return null

    const dimensionLabels: Record<string, string> = {
      // Common dimensions
      h: `${t('height')} (h)`,
      b: `${t('width')} (b)`, 
      a: `${t('sideLength')} (a)`,
      length: t('length'),
      width: t('width'),
      height: t('height'),
      side: t('sideLength'),
      thickness: t('thickness'),
      distance: t('acrossFlats'),
      
      // Steel profile specific
      tw: `${t('webThickness')} (tw)`,
      tf: `${t('flangeThickness')} (tf)`,
      t: `${t('thickness')} (t)`,
      r: `${t('rootRadius')} (r)`,
      
      // Hollow sections
      od: `${t('outerDiameter')} (OD)`,
      id: `${t('innerDiameter')} (ID)`,
      wt: `${t('wallThickness')} (wt)`,
      
      // Pipes and tubes
      diameter: t('diameter'),
      d: `${t('diameter')} (d)`,
    }

    const getInputDescription = (key: string): string => {
      const descriptions: Record<string, string> = {
        h: t('heightDesc'),
        b: t('widthDesc'),
        tw: t('webThicknessDesc'),
        tf: t('flangeThicknessDesc'),
        t: t('thicknessDesc'),
        r: t('rootRadiusDesc'),
        od: t('outerDiameterDesc'),
        wt: t('wallThicknessDesc'),
        a: t('sideLengthDesc'),
        diameter: t('diameterDesc'),
        distance: t('acrossFlatsDesc'),
      }
      return descriptions[key] || ""
    }

    if (!selectedProfile.dimensions || selectedProfile.dimensions.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('noDimensionsRequired')}</p>
        </div>
      )
    }

    // Use mobile-enhanced inputs on mobile devices
    const InputComponent = isDesktop ? Input : Input

    return (
      <EnhancedInputGroup
        title={t('profileDimensions')}
        description={`${t('enterDimensionsFor')} ${getProfileTypeName(language, profileType)}`}
        isLoading={isCalculating}
        hasErrors={validationErrors.length > 0}
      >
        {/* Dimension Presets */}
        <DimensionPresets
          profileType={profileType}
          onApplyPreset={handleCopyFromPreset}
          className="mb-4"
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedProfile.dimensions.map((dimensionKey) => {
            const value = dimensions[dimensionKey] || ""
            
            return (
              <div key={dimensionKey} className="space-y-2">
                <Label htmlFor={dimensionKey}>
                  {dimensionLabels[dimensionKey] || dimensionKey}
                </Label>
                <UnitInput
                  id={dimensionKey}
                  unit={lengthUnit}
                  value={value}
                  onChange={(e) => updateDimension(dimensionKey, e.target.value)}
                  placeholder={t('enterValue')}
                  disabled={isCalculating}
                  min={0.001}
                  max={100000}
                  step={0.1}
                />
                <div className="text-xs text-muted-foreground">
                  {getInputDescription(dimensionKey)}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Length input - Only show for non-plate profiles */}
        {profileCategory !== "plates" && (
          <div className="space-y-2">
            <Label htmlFor="length">{t('length')}</Label>
            <UnitInput
              id="length"
              unit={lengthUnit}
              value={lengthInput}
              onChange={(e) => handleLengthChange(e.target.value)}
              placeholder={t('enterLength')}
              disabled={isCalculating}
              min={0.1}
              max={1000000}
              step={1}
            />
            <div className="text-xs text-muted-foreground">
              {t('totalLengthDescription')}
            </div>
          </div>
        )}

        {/* Temperature input (if enabled) */}
        {useTemperatureEffects && (
          <div className="space-y-2">
            <Label htmlFor="operating-temperature">{t('operatingTemperature')}</Label>
            <UnitInput
              id="operating-temperature"
              unit="°C"
              value={operatingTemperature}
              onChange={(e) => setOperatingTemperature(e.target.value)}
              placeholder="20"
              disabled={isCalculating}
              min={-273.15}
              max={5000}
              step={1}
            />
            <div className="text-xs text-muted-foreground">
              {t('referenceTemperature')}
            </div>
          </div>
        )}

        {/* Validation Summary */}
        <ValidationSummary
          errors={validationErrors}
          warnings={validationWarnings}
          isVisible={validationErrors.length > 0 || validationWarnings.length > 0}
        />
      </EnhancedInputGroup>
    )
  }

  const renderStandardSizes = () => {
    const sizes = STANDARD_SIZES[profileType as keyof typeof STANDARD_SIZES]
    const recentSizes = suggestions.getStandardSizes(profileType)

    if (!sizes || sizes.length === 0) {
      return (
        <div className="text-sm text-muted-foreground italic">
          {t('noStandardSizes')}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="standard-size">{t('standardSize')}</Label>
        <Select value={standardSize} onValueChange={setStandardSize} disabled={isCalculating}>
          <SelectTrigger>
            <SelectValue placeholder={t('selectStandardSize')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">{t('customDimensions')}</SelectItem>
            
            {/* Recent sizes first if available */}
            {recentSizes.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t('recent')}
                </div>
                {recentSizes.map((designation) => {
                  const size = sizes.find(s => s.designation === designation)
                  if (!size) return null
                  return (
                    <SelectItem key={`recent-${designation}`} value={designation}>
                      <div className="flex items-center gap-2">
                        <span>{designation}</span>
                        <Clock className="h-3 w-3 text-muted-foreground ml-auto" />
                      </div>
                    </SelectItem>
                  )
                })}
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">{t('allSizes')}</div>
              </>
            )}
            
            {sizes.map((size) => {
              // Skip if already shown in recent
              if (recentSizes.includes(size.designation)) return null
              return (
                <SelectItem key={size.designation} value={size.designation}>
                  {size.designation}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    )
  }

  const renderResults = () => {
    // Show loading state with animation
    if (isCalculating) {
      return (
        <div className={safeAnimation(animations.fadeIn)}>
          <CalculationLoading 
            stage="Computing structural properties..." 
            progress={undefined}
            details={t('computingProperties')}
          />
        </div>
      )
    }

    // Show error state with shake animation
    if (calculationError) {
      return (
        <div className={safeAnimation(animations.slideInFromBottom)}>
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('calculationError')}</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p>{calculationError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setCalculationError(null)
                    performCalculation()
                  }}
                  className={safeAnimation(animations.buttonPress)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t('retryCalculation')}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    // Show validation errors with smooth entrance
    if (!lastValidation.isValid) {
      return (
        <div className={safeAnimation(animations.slideInFromBottom)}>
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('invalidInputs')}</AlertTitle>
            <AlertDescription>
              {t('pleaseCorrectErrors')}
              <ul className="list-disc list-inside mt-2 space-y-1">
                {validationErrors.map((error, index) => {
                  const staggered = createStaggeredAnimation(validationErrors.length, 100)
                  return (
                    <li 
                      key={index} 
                      className={`text-sm ${safeAnimation(staggered[index]?.className || '')}`}
                      style={staggered[index]?.style}
                    >
                      {error}
                    </li>
                  )
                })}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    // Show successful results with enhanced animations
    if (weight > 0 && structuralProperties) {
      // Use mobile-optimized results on small screens
      if (!isDesktop) {
        return (
          <MobileResults
            weight={weight}
            weightUnit={weightUnit}
            structuralProperties={structuralProperties}
            volume={volume}
            className={safeAnimation(animationPresets.result)}
            onSave={saveCalculation}
            onShare={shareCalculation}
            onAdvancedAnalysis={() => setActiveTab("advanced")}
            // Pricing props
            quantity={quantity}
            setQuantity={setQuantity}
            pricePerUnit={pricePerUnit}
            setPricePerUnit={setPricePerUnit}
            currency={currency}
            pricingModel={pricingModel}
            setPricingModel={setPricingModel}
            profileCategory={profileCategory}
            profileType={profileType}
            length={length}
            lengthUnit={lengthUnit}
            projectName={currentProject?.name}
          />
        )
      }

      return (
        <div className={safeAnimation(animationPresets.result)}>
          <Card className={cn(
            "backdrop-blur-sm bg-card/90 border-accent/20 shadow-lg",
            safeAnimation(animations.cardHover)
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 hover:text-primary transition-colors duration-150">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                {t('calculationResults')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Pricing Display */}
              <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg mb-3">
                <span>Defaults: {currency} • {PRICING_MODELS[pricingModel].name}</span>
                <span className="text-foreground">{t('changeInSettings')}</span>
              </div>

              {/* Quantity and Price Inputs */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <Label htmlFor="quantity" className="text-xs">{t('quantity')}</Label>
                  <UnitInput
                    id="quantity"
                    unit="pcs"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1"
                    min={0.001}
                    step={1}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-xs">
                    {t('price')} {PRICING_MODELS[pricingModel].name}
                  </Label>
                  <UnitInput
                    id="price"
                    unit={`${currency}/${PRICING_MODELS[pricingModel].unit}`}
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    placeholder="0.00"
                    min={0}
                    step={0.01}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Single Unit Results */}
              <div className={cn(
                "bg-accent/10 border border-accent/20 p-4 rounded-lg",
                safeAnimation(animations.scaleIn)
              )}>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Calculator className="h-3 w-3" />
                  {t('singleUnit')}
                  {pricingModel !== 'per_unit' && !(pricingModel === 'per_kg' && weightUnit === 'kg') && (
                    <span className="text-xs">
                      ({pricingModel === 'per_kg' ? 
                        `${((weight * (WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS]?.factor || 1)) / 1000).toFixed(3)} kg` : 
                        pricingModel === 'per_meter' ? 
                        `${(parseFloat(length) * (LENGTH_UNITS[lengthUnit as keyof typeof LENGTH_UNITS]?.factor || 1) / 100).toFixed(2)} m` : 
                        '1 piece'})
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {weight.toFixed(4)}
                    </div>
                    <div className="text-muted-foreground">
                      {WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name}
                    </div>
                  </div>
                  {pricePerUnit && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">
                        {currency} {calculateUnitCost(
                          pricingModel,
                          parseFloat(pricePerUnit),
                          weight,
                          parseFloat(length),
                          weightUnit,
                          lengthUnit
                        ).toFixed(2)}
                      </div>
                      <div className="text-muted-foreground">{t('unitCost')}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Results (if quantity > 1) */}
              {parseFloat(quantity) !== 1 && parseFloat(quantity) > 0 && (
                <div className={cn(
                  "bg-accent/20 border border-accent/30 p-4 rounded-lg",
                  safeAnimation(animations.slideInFromBottom)
                )}>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Calculator className="h-3 w-3" />
                    Total ({quantity} {parseFloat(quantity) === 1 ? t('piece') : t('pieces')}
                    {pricingModel !== 'per_unit' && !(pricingModel === 'per_kg' && weightUnit === 'kg') && (
                      <span>
                        = {(() => {
                          const qtyNum = parseFloat(quantity)
                          if (pricingModel === 'per_kg') {
                            const weightInKg = (weight * (WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS]?.factor || 1)) / 1000
                            const totalKg = qtyNum * weightInKg
                            return `${totalKg.toFixed(3)} kg`
                          }
                          if (pricingModel === 'per_meter') {
                            // Convert length to cm first, then to meters
                            const lengthInCm = parseFloat(length) * (LENGTH_UNITS[lengthUnit as keyof typeof LENGTH_UNITS]?.factor || 1)
                            const lengthInMeters = lengthInCm / 100 // Convert cm to meters
                            return `${(qtyNum * lengthInMeters).toFixed(2)} m`
                          }
                          return ''
                        })()}
                      </span>
                    )})
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-xl font-bold text-foreground">
                        {(weight * parseFloat(quantity)).toFixed(4)}
                      </div>
                      <div className="text-muted-foreground">
                        {WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name}
                      </div>
                    </div>
                    {pricePerUnit && (
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground">
                          {currency} {calculateTotalCost(
                            pricingModel,
                            parseFloat(pricePerUnit),
                            weight,
                            parseFloat(length),
                            parseFloat(quantity),
                            weightUnit,
                            lengthUnit
                          ).toFixed(2)}
                        </div>
                        <div className="text-muted-foreground">{t('totalCost')}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Basic Properties with staggered animation */}
              <Separator className="my-3" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t('crossSectionalArea'), value: `${structuralProperties.area.toFixed(4)} cm²` },
                  { label: t('volume'), value: `${volume.toFixed(4)} cm³` }
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className={cn(
                      "text-center p-2 bg-muted/50 rounded-md border border-border/50",
                      safeAnimation(`${animations.slideInFromBottom} delay-${(index + 1) * 100}`)
                    )}
                  >
                    <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
                    <div className="text-xs font-semibold text-foreground mt-1">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Structural Properties with enhanced layout */}
              <div className={safeAnimation(`${animations.slideInFromBottom} delay-300`)}>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-semibold mb-4 text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    {t('structuralProperties')}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      {
                        title: t('momentOfInertia'),
                        values: [
                          `Ix: ${structuralProperties.momentOfInertiaX.toFixed(2)} cm⁴`,
                          `Iy: ${structuralProperties.momentOfInertiaY.toFixed(2)} cm⁴`
                        ]
                      },
                      {
                        title: t('sectionModulus'), 
                        values: [
                          `Sx: ${structuralProperties.sectionModulusX.toFixed(2)} cm³`,
                          `Sy: ${structuralProperties.sectionModulusY.toFixed(2)} cm³`
                        ]
                      },
                      {
                        title: t('radiusOfGyration'),
                        values: [
                          `rx: ${structuralProperties.radiusOfGyrationX.toFixed(2)} cm`,
                          `ry: ${structuralProperties.radiusOfGyrationY.toFixed(2)} cm`
                        ]
                      },
                      {
                        title: t('physicalProperties'),
                        values: [
                          `${t('perimeter')}: ${structuralProperties.perimeter.toFixed(2)} cm`,
                          `${t('weightPerLength')}: ${structuralProperties.weight.toFixed(2)} kg/m`
                        ]
                      }
                    ].map((section, index) => (
                      <div 
                        key={section.title}
                        className={cn(
                          "p-3 bg-background/60 rounded-lg border border-border/30",
                          safeAnimation(`${animations.slideInFromLeft} delay-${(index + 4) * 100}`)
                        )}
                      >
                        <div className="text-muted-foreground font-medium mb-2">{section.title}</div>
                        {section.values.map((value, valueIndex) => (
                          <div key={valueIndex} className="text-foreground">{value}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Temperature Effects - Compact */}
              {useTemperatureEffects && structuralProperties.adjustedDensity && (
                <div className={safeAnimation(`${animations.slideInFromBottom} delay-400`)}>
                  <Separator className="my-4" />
                  <div className="p-3 bg-gradient-to-br from-accent/20 to-accent/10 rounded-lg border border-accent/30">
                    <h4 className="font-semibold text-xs mb-2 flex items-center gap-2 text-foreground">
                      <Layers className="h-3 w-3" />
                      {t('temperatureEffects')}
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                                              <div className="p-2 bg-background/60 rounded-md border border-border/50">
                          <span className="text-muted-foreground block">{t('adjustedDensity')}</span>
                          <div className="font-medium text-foreground">{structuralProperties.adjustedDensity.toFixed(3)} g/cm³</div>
                        </div>
                        <div className="p-2 bg-background/60 rounded-md border border-border/50">
                          <span className="text-muted-foreground block">{t('densityChange')}</span>
                          <div className="font-medium text-foreground">{((structuralProperties.adjustedDensity - (selectedMaterial?.density || 0)) / (selectedMaterial?.density || 1) * 100).toFixed(2)}%</div>
                        </div>
                        <div className="p-2 bg-background/60 rounded-md border border-border/50">
                          <span className="text-muted-foreground block">{t('originalDensity')}</span>
                          <div className="font-medium text-foreground">{selectedMaterial?.density.toFixed(3)} g/cm³</div>
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Warnings */}
              {validationWarnings.length > 0 && (
                <div className={safeAnimation(`${animations.slideInFromBottom} delay-500`)}>
                  <Separator className="my-4" />
                  <ValidationSummary
                    errors={[]}
                    warnings={validationWarnings}
                  />
                </div>
              )}

              {/* Notes Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notes-toggle" className="text-sm font-medium">
                    Add notes (optional)
                  </Label>
                  <Switch
                    id="notes-toggle"
                    checked={showNotesInput}
                    onCheckedChange={setShowNotesInput}
                  />
                </div>
                
                {showNotesInput && (
                  <div className={cn(
                    "space-y-2",
                    safeAnimation(animations.slideInFromBottom)
                  )}>
                    <Input
                      placeholder="Add notes about this calculation..."
                      value={calculationNotes}
                      onChange={(e) => setCalculationNotes(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons with enhanced styling */}
              <div className={cn(
                "flex flex-col sm:flex-row gap-2 pt-2",
                safeAnimation(`${animations.slideInFromBottom} delay-600`)
              )}>
                <Button 
                  onClick={saveCalculation}
                  className="flex-1" 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditMode ? "Update" : t('save')}
                  {activeProjectId && (
                    <span className="ml-1 text-xs opacity-80">
                      to {projects.find(p => p.id === activeProjectId)?.name}
                    </span>
                  )}
                </Button>
                {isEditMode && (
                  <Button 
                    onClick={cancelEditMode}
                    variant="outline"
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Cancel Edit
                  </Button>
                )}
                <Button 
                  onClick={() => setActiveTab("advanced")} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Cog className="mr-2 h-4 w-4" />
                  {t('advancedAnalysis')}
                </Button>
                <Button 
                  onClick={() => setActiveTab("breakdown")} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Layers className="mr-2 h-4 w-4" />
                  {t('breakdown')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Default state - waiting for valid inputs with gentle animation
    return (
      <div className={cn(
        "text-center py-12 text-muted-foreground",
        safeAnimation(animations.fadeIn)
      )}>
        <Calculator className="h-16 w-16 mx-auto mb-4 opacity-40" />
        <p className="text-lg">{t('selectToBegin')}</p>
        <p className="text-sm mt-2 opacity-60">Choose from our extensive library of standard profiles</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-background overflow-hidden">
      {/* Background Elements */}
      <BackgroundElements />

      {/* Settings Button */}
      <div className="absolute top-4 right-4 z-50">
        <SettingsButton />
      </div>

      <div className={cn("relative z-10", isDesktop && layoutReady ? "px-4" : "max-w-md mx-auto p-4")}>
        {/* Header */}
        <div className="text-center space-y-1 mb-4">
          <div className="flex items-center justify-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground hover:text-primary transition-colors duration-150">{t('appTitle')}</h1>
          </div>
          <p className="text-xs text-muted-foreground">{t('appSubtitle')}</p>
          
          {/* Project Context Indicator */}
          {activeTab === 'calculator' && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Select value={activeProjectId || "none"} onValueChange={(value) => {
                if (value === "none") {
                  setActiveProjectId("")
                  setCurrentProject(null)
                } else {
                  setActiveProjectId(value)
                  selectProject(value)
                }
              }}>
                <SelectTrigger className="w-64 h-8 text-xs">
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-3 w-3" />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeProjectId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Find the project and navigate directly to it
                    const project = projects.find(p => p.id === activeProjectId)
                    if (project) {
                      // Switch to projects tab and set the project as selected
                      setActiveTab('projects')
                      // Set the initial selected project
                      setInitialSelectedProject(project)
                    }
                  }}
                  className="h-8 text-xs"
                >
                  View Project
                </Button>
              )}
            </div>
          )}
        </div>

        <SwipeTabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
          stickyTabs={true}
          tabs={[
            {
              value: "calculator",
              label: t('calculator'),
              icon: <Calculator className="h-3 w-3" />,
              shortLabel: t('calculator').slice(0, 4)
            },
            {
              value: "comparison",
              label: "History & Compare",
              icon: <BarChart3 className="h-3 w-3" />,
              shortLabel: "Hist"
            },
            {
              value: "projects", 
              label: "Projects",
              icon: <FolderOpen className="h-3 w-3" />,
              shortLabel: "Proj"
            }
          ]}
        >
          <SwipeTabs.Content value="calculator" className={safeAnimation(animationPresets.tab)}>
            {isDesktop && layoutReady ? (
              // Desktop Layout - Three columns with independent scrolling
              <div className="grid grid-cols-12 gap-2 h-[calc(100vh-120px)]">
                {/* Left Column - Material & Profile Selection */}
                <div className="col-span-4 overflow-y-auto pr-2 scrollbar-column">
                  <div className="space-y-3">
                    {/* Material Selection */}
                    <div className={safeAnimation(`${animations.slideInFromLeft} delay-100`)}>
                      <Card className={cn(
                        "backdrop-blur-sm bg-card/95 border-accent/20 shadow-lg",
                        safeAnimation(animations.cardHover)
                      )}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2 hover:text-primary transition-colors duration-150">
                            <Layers className="h-5 w-5 text-primary" />
{t('materialSelection')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <MaterialSelector
                            material={material}
                            setMaterial={setMaterial}
                            grade={grade}
                            setGrade={setGrade}
                            profileType={profileType}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Profile Selection */}
                    <div className={safeAnimation(`${animations.slideInFromLeft} delay-200`)}>
                      <Card className={cn(
                        "backdrop-blur-sm bg-card/95 border-accent/20 shadow-lg",
                        safeAnimation(animations.cardHover)
                      )}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2 hover:text-primary transition-colors duration-150">
                            <Calculator className="h-5 w-5 text-primary" />
{t('profileSelection')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ProfileSelector
                            profileCategory={profileCategory}
                            setProfileCategory={setProfileCategory}
                            profileType={profileType}
                            setProfileType={setProfileType}
                            material={material}
                          />

                          {/* Standard Sizes */}
                          {renderStandardSizes()}

                          {/* Toggle for custom dimensions */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{t('customDimensions')}</span>
                            <Button
                              variant={customInput ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setCustomInput(true)
                                setStandardSize("")
                              }}
                              className={safeAnimation(animations.buttonPress)}
                            >
                              {customInput ? t('editingCustom') : t('useCustom')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Dimensions */}
                <div className="col-span-4 overflow-y-auto pr-2 scrollbar-column">
                  <div className="space-y-3">
                    <div className={safeAnimation(`${animations.slideInFromBottom} delay-100`)}>
                                          <Card className={cn(
                      "backdrop-blur-sm bg-card/95 border-accent/20 shadow-lg",
                      safeAnimation(animations.cardHover)
                    )}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2 hover:text-primary transition-colors duration-150">
                          <BarChart3 className="h-5 w-5 text-primary" />
{t('dimensions')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Current Units Display */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                            <span>Units: {LENGTH_UNITS[lengthUnit as keyof typeof LENGTH_UNITS].name} • {WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name}</span>
                            <span className="text-foreground">{t('changeInSettings')}</span>
                          </div>

                          {/* Profile Dimensions */}
                          <Separator className="my-4" />
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium hover:text-primary transition-colors duration-150">{t('profileDimensions')}</h3>
                              {selectedProfile && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="font-normal">
                                    {(() => {
                                      // Generate profile spec for display with actual dimensions
                                      let profileSpec = ""
                                      switch (profileType) {
                                        case 'hea':
                                          if (standardSize) {
                                            profileSpec = standardSize
                                          } else {
                                            // Find the closest standard size based on height
                                            const sizes = STANDARD_SIZES.hea
                                            const height = parseFloat(dimensions.h || '0')
                                            const closestSize = sizes.reduce((prev, curr) => {
                                              const prevHeight = parseFloat(prev.dimensions.h)
                                              const currHeight = parseFloat(curr.dimensions.h)
                                              return Math.abs(currHeight - height) < Math.abs(prevHeight - height) ? curr : prev
                                            })
                                            profileSpec = closestSize.designation
                                          }
                                          break
                                        case 'heb':
                                          profileSpec = standardSize ? `HEB ${standardSize.replace('HEB ', '')}` : `HEB ${dimensions.h || '?'}x${dimensions.b || '?'}`
                                          break
                                        case 'hem':
                                          profileSpec = standardSize ? `HEM ${standardSize.replace('HEM ', '')}` : `HEM ${dimensions.h || '?'}x${dimensions.b || '?'}`
                                          break
                                        case 'ipe':
                                          profileSpec = standardSize ? `IPE ${standardSize.replace('IPE ', '')}` : `IPE ${dimensions.h || '?'}x${dimensions.b || '?'}`
                                          break
                                        case 'ipn':
                                          profileSpec = standardSize ? `IPN ${standardSize.replace('IPN ', '')}` : `IPN ${dimensions.h || '?'}x${dimensions.b || '?'}`
                                          break
                                        case 'upn':
                                          profileSpec = standardSize ? `UPN ${standardSize.replace('UPN ', '')}` : `UPN ${dimensions.h || '?'}x${dimensions.b || '?'}`
                                          break
                                        case 'rhs': 
                                          if (standardSize) {
                                            profileSpec = `RHS ${standardSize.replace('RHS ', '')}`
                                          } else {
                                            const h = dimensions.h || '?'
                                            const b = dimensions.b || '?'
                                            const t = dimensions.t || '?'
                                            profileSpec = `RHS ${h}x${b}x${t}`
                                          }
                                          break
                                        case 'shs':
                                          if (standardSize) {
                                            profileSpec = `SHS ${standardSize.replace('SHS ', '')}`
                                          } else {
                                            const a = dimensions.a || '?'
                                            const t = dimensions.t || '?'
                                            profileSpec = `SHS ${a}x${t}`
                                          }
                                          break
                                        case 'chs':
                                          if (standardSize) {
                                            profileSpec = `CHS ${standardSize.replace('CHS ', '')}`
                                          } else {
                                            const od = dimensions.od || '?'
                                            const wt = dimensions.wt || '?'
                                            profileSpec = `CHS ${od}x${wt}`
                                          }
                                          break
                                        case 'plate':
                                        case 'sheetMetal':
                                        case 'checkeredPlate':
                                        case 'perforatedPlate':
                                          if (standardSize) {
                                            profileSpec = standardSize
                                          } else {
                                            const plateLength = dimensions.length || '?'
                                            const plateWidth = dimensions.width || '?'
                                            const plateThickness = dimensions.thickness || '?'
                                            const plateType = profileType === 'plate' ? 'PLATE' : 
                                                             profileType === 'sheetMetal' ? 'SHEET' :
                                                             profileType === 'checkeredPlate' ? 'CHECKER' : 'PERF'
                                            profileSpec = `${plateType} ${plateLength}x${plateWidth}x${plateThickness}`
                                          }
                                          break
                                        case 'equalAngle':
                                          if (standardSize) {
                                            profileSpec = standardSize
                                          } else {
                                            const a = dimensions.a || '?'
                                            const t = dimensions.t || '?'
                                            profileSpec = `L${a}x${a}x${t}`
                                          }
                                          break
                                        case 'unequalAngle':
                                          if (standardSize) {
                                            profileSpec = standardSize
                                          } else {
                                            const a = dimensions.a || '?'
                                            const b = dimensions.b || '?'
                                            const t = dimensions.t || '?'
                                            profileSpec = `L${a}x${b}x${t}`
                                          }
                                          break
                                        case 'pipe':
                                          if (standardSize) {
                                            profileSpec = standardSize
                                          } else {
                                            const diameter = dimensions.diameter || dimensions.od || '?'
                                            const wallThickness = dimensions.wt || dimensions.t || '?'
                                            profileSpec = `PIPE ${diameter}x${wallThickness}`
                                          }
                                          break
                                        case 'roundBar':
                                          if (standardSize) {
                                            profileSpec = standardSize
                                          } else {
                                            const roundDiameter = dimensions.diameter || dimensions.d || '?'
                                            profileSpec = `Ø${roundDiameter}`
                                          }
                                          break
                                        case 'squareBar':
                                          if (standardSize) {
                                            profileSpec = standardSize
                                          } else {
                                            const squareSide = dimensions.a || dimensions.side || '?'
                                            profileSpec = `SQ${squareSide}`
                                          }
                                          break
                                        case 'hexBar':
                                          if (standardSize) {
                                            profileSpec = standardSize
                                          } else {
                                            const hexDistance = dimensions.distance || dimensions.d || '?'
                                            profileSpec = `HEX${hexDistance}`
                                          }
                                          break
                                        case 'flatBar':
                                          if (standardSize) {
                                            profileSpec = standardSize
                                          } else {
                                            const width = dimensions.b || dimensions.width || '?'
                                            const thickness = dimensions.t || dimensions.thickness || '?'
                                            profileSpec = `FLAT ${width}x${thickness}`
                                          }
                                          break
                                        default: 
                                          profileSpec = standardSize || selectedProfile.name
                                      }
                                      return profileSpec
                                    })()}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs font-normal">
                                    {selectedMaterial?.name || ''}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            {renderDimensionInputs()}
                          </div>

                          {/* Temperature Controls */}
                          <Separator className="my-4" />
                          <div className={cn(
                            "p-3 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg border border-border/50",
                            safeAnimation(animations.slideInFromBottom)
                          )}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="temperature-effects"
                                  checked={useTemperatureEffects}
                                  onCheckedChange={setUseTemperatureEffects}
                                />
                                <Label htmlFor="temperature-effects" className="text-sm font-medium">
                                  {t('temperatureEffects')}
                                </Label>
                              </div>
                              {useTemperatureEffects && (
                                <div className="flex items-center gap-2">
                                  <Input
                                    id="operating-temperature"
                                    type="number"
                                    value={operatingTemperature}
                                    onChange={(e) => setOperatingTemperature(e.target.value)}
                                    placeholder="20"
                                    disabled={isCalculating}
                                    min={-273.15}
                                    max={5000}
                                    step={1}
                                    className="w-20 h-8 text-xs"
                                  />
                                  <span className="text-xs text-muted-foreground">°C</span>
                                </div>
                              )}
                            </div>
                            {useTemperatureEffects && (
                              <div className="text-xs text-muted-foreground">
                                Reference: 20°C. Affects material density in calculations.
                              </div>
                            )}
                          </div>

                          {/* Cross-Section Viewer - Hidden by Default */}
                          {selectedProfile && (
                            <>
                              <Separator className="my-4" />
                                                        <CrossSectionViewer
                            profileType={getProfileTypeForViewer(profileType, dimensions)}
                            dimensions={dimensions}
                            defaultVisible={false}
                            size="medium"
                            className="mt-4"
                          />
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Right Column - Results */}
                <div className="col-span-4 overflow-y-auto pr-2 scrollbar-column">
                  <div className="space-y-3">
                    <div className={safeAnimation(`${animations.slideInFromRight} delay-200`)}>
                      {renderResults()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Mobile Layout - Stacked with animations
              <div className="space-y-6">
                {/* Material Selection - Now First */}
                <div className={safeAnimation(`${animations.slideInFromBottom} delay-100`)}>
                  <Card className={cn(
                    "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                    safeAnimation(animations.cardHover)
                  )}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 hover:text-primary transition-colors duration-150">
                        <Layers className="h-5 w-5 text-primary" />
                        {t('materialSelection')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MaterialSelector
                        material={material}
                        setMaterial={setMaterial}
                        grade={grade}
                        setGrade={setGrade}
                        profileType={profileType}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Selection - Now Second */}
                <div className={safeAnimation(`${animations.slideInFromBottom} delay-200`)}>
                  <Card className={cn(
                    "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                    safeAnimation(animations.cardHover)
                  )}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 hover:text-primary transition-colors duration-150">
                        <Calculator className="h-5 w-5 text-primary" />
                                                    {t('profileSelection')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ProfileSelector
                        profileCategory={profileCategory}
                        setProfileCategory={setProfileCategory}
                        profileType={profileType}
                        setProfileType={setProfileType}
                        material={material}
                      />

                      {/* Standard Sizes */}
                      {renderStandardSizes()}
                    </CardContent>
                  </Card>
                </div>

                {/* Dimensions */}
                <div className={safeAnimation(`${animations.slideInFromBottom} delay-300`)}>
                  <Card className={cn(
                    "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                    safeAnimation(animations.cardHover)
                  )}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 hover:text-primary transition-colors duration-150">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        {t('dimensions')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Current Units Display */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                        <span>Units: {LENGTH_UNITS[lengthUnit as keyof typeof LENGTH_UNITS].name} • {WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name}</span>
                        <span className="text-foreground">{t('changeInSettings')}</span>
                      </div>

                      {/* Toggle for custom dimensions */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{t('customDimensions')}</span>
                        <Button
                          variant={customInput ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCustomInput(true)
                            setStandardSize("")
                          }}
                        >
                          {customInput ? t('editingCustom') : t('useCustom')}
                        </Button>
                      </div>

                      {/* Profile Dimensions */}
                      <Separator className="my-4" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium hover:text-primary transition-colors duration-150">{t('profileDimensions')}</h3>
                          {selectedProfile && (
                            <Badge variant="outline" className="font-normal">
                              {getProfileTypeName(language, profileType)} {standardSize && `(${standardSize})`}
                            </Badge>
                          )}
                        </div>
                        {renderDimensionInputs()}
                      </div>

                      {/* Temperature Controls */}
                      <Separator className="my-4" />
                      <div className={cn(
                        "space-y-3 p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/50",
                        safeAnimation(animations.slideInFromBottom)
                      )}>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="temperature-effects"
                            checked={useTemperatureEffects}
                            onCheckedChange={setUseTemperatureEffects}
                          />
                          <Label htmlFor="temperature-effects" className="text-sm font-medium">
                            {t('enableTemperatureEffects')}
                          </Label>
                        </div>
                        
                        {useTemperatureEffects && (
                          <div className={cn(
                            "space-y-2",
                            safeAnimation(animations.slideInFromBottom)
                          )}>
                            <Label htmlFor="operating-temperature">{t('operatingTemperature')}</Label>
                            <UnitInput
                              id="operating-temperature"
                              unit="°C"
                              value={operatingTemperature}
                              onChange={(e) => setOperatingTemperature(e.target.value)}
                              placeholder="20"
                              disabled={isCalculating}
                              min={-273.15}
                              max={5000}
                              step={1}
                            />
                            <div className="text-xs text-muted-foreground">
                              {t('referenceTemperature')}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cross-Section Viewer - Hidden by Default */}
                      {selectedProfile && (
                        <>
                          <Separator className="my-4" />
                          <CrossSectionViewer
                            profileType={getProfileTypeForViewer(profileType, dimensions)}
                            dimensions={dimensions}
                            defaultVisible={false}
                            size="large"
                            className="mt-4"
                          />
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Results */}
                {renderResults()}
              </div>
            )}
          </SwipeTabs.Content>

          {/* New: Calculation Breakdown Tab */}
          <SwipeTabs.Content value="breakdown" className="space-y-4">
            {weight > 0 && structuralProperties && selectedProfile && selectedMaterial ? (
              <CalculationBreakdown
                profileData={selectedProfile}
                materialData={selectedMaterial}
                dimensions={dimensions}
                length={length}
                structuralProperties={structuralProperties}
                weight={weight}
                weightUnit={weightUnit}
                temperatureEffects={useTemperatureEffects && structuralProperties.adjustedDensity ? {
                  originalDensity: selectedMaterial.density,
                  adjustedDensity: structuralProperties.adjustedDensity,
                  temperature: parseFloat(operatingTemperature)
                } : undefined}
              />
            ) : (
              <Card className="backdrop-blur-sm bg-card/90 border-accent/20">
                <CardContent className="text-center py-8">
                  <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">{t('completeToSee')}</p>
                </CardContent>
              </Card>
            )}
          </SwipeTabs.Content>

          {/* New: Advanced Structural Analysis Tab */}
          <SwipeTabs.Content value="advanced" className="space-y-4">
            {weight > 0 && structuralProperties && selectedMaterial ? (
              <AdvancedStructuralAnalysis
                structuralProperties={structuralProperties}
                memberLength={parseFloat(length) * LENGTH_UNITS[lengthUnit as keyof typeof LENGTH_UNITS].factor} // Convert to cm
                selectedMaterial={selectedMaterial}
                profileName={selectedProfile?.name || `${profileType.toUpperCase()}${standardSize ? ` ${standardSize}` : ''}`}
              />
            ) : (
              <Card className="backdrop-blur-sm bg-card/90 border-accent/20">
                <CardContent className="text-center py-8">
                  <Cog className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">{t('completeToSee')}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Buckling analysis, load capacity, stress analysis, and deflection calculations
                  </p>
                </CardContent>
              </Card>
            )}
          </SwipeTabs.Content>

          {/* History & Compare Tab - Mobile optimized versions */}
          <SwipeTabs.Content value="comparison" className="space-y-4">
            <div className="space-y-4">
              {/* Sub-tabs for History and Compare - Simplified for mobile */}
              <div className={cn(
                "flex bg-muted rounded-lg p-1 sticky top-0 z-10 backdrop-blur-sm bg-muted/95 border border-border/50",
                !isDesktop && "mx-2"
              )}>
                <Button
                  variant={historyCompareView === 'history' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setHistoryCompareView('history')}
                  className="flex-1"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  {isDesktop ? 'History' : 'History'}
                </Button>
                <Button
                  variant={historyCompareView === 'compare' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setHistoryCompareView('compare')}
                  className="flex-1"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {isDesktop ? `Compare (${comparisonCalculations.size})` : `Compare (${comparisonCalculations.size})`}
                </Button>
              </div>

              {/* Content based on selected view - Mobile optimized */}
              <div className={cn(!isDesktop && "px-2")}>
                {historyCompareView === 'history' ? (
                  <CalculationHistory
                    calculations={calculations}
                    onLoadCalculation={loadCalculation}
                    onDeleteCalculation={deleteCalculation}
                    onMoveToProject={async (calculationId, projectId) => {
                      // Update calculation with project ID
                      const updatedCalculations = calculations.map(calc => 
                        calc.id === calculationId ? { ...calc, projectId } : calc
                      )
                      setCalculations(updatedCalculations)
                      
                      // Show success message
                      toast({
                        title: "Calculation Updated",
                        description: "Calculation has been assigned to the project.",
                      })
                    }}
                    onAddToComparison={(id) => {
                      if (comparisonCalculations.size < 5) {
                        setComparisonCalculations(prev => new Set([...prev, id]))
                        toast({
                          title: "Added to Comparison",
                          description: "Calculation added to comparison list.",
                        })
                      } else {
                        toast({
                          title: "Comparison Limit",
                          description: "You can compare up to 5 calculations at once.",
                          variant: "destructive"
                        })
                      }
                    }}
                  />
                ) : (
                  <CalculationComparison
                    calculations={calculations}
                    selectedCalculations={comparisonCalculations}
                    onRemoveFromComparison={(id: string) => {
                      setComparisonCalculations(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(id)
                        return newSet
                      })
                    }}
                    onLoadCalculation={loadCalculation}
                  />
                )}
              </div>
            </div>
          </SwipeTabs.Content>

          <SwipeTabs.Content value="projects" className="">
            <div className={cn(
              "overflow-y-auto space-y-4",
              isDesktop ? "h-[calc(100vh-120px)] p-4" : "h-[calc(100vh-140px)] p-2"
            )}>
              <ProjectsTabContent initialSelectedProject={initialSelectedProject} />
            </div>
          </SwipeTabs.Content>
        </SwipeTabs>


      </div>
    </div>
  )
}
