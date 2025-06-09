"use client"

import React, { Suspense, useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calculator, Save, Share2, History, Download, ChevronRight, AlertTriangle, CheckCircle, Loader2, RefreshCw, AlertCircle, BarChart3, Layers, Cog, Clock, FolderOpen, FolderKanban, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { hoverStates } from "@/lib/animations"
import ProfileSelector from "@/components/profile-selector"
import MaterialSelector from "@/components/material-selector"
import { ErrorBoundary } from "@/components/error-boundary"
import { CalculationBreakdown } from "@/components/calculation-breakdown"
import { CalculationComparison } from "@/components/calculation-comparison"
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
import type { Calculation, ProfileData, MaterialData, StructuralProperties } from "@/lib/types"
import type { MaterialGrade } from "@/lib/metal-data"
import BackgroundElements from "@/components/background-elements"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileEnhancedInput, useDimensionSuggestions } from "@/components/mobile-enhanced-input"
import { MobileResults } from "@/components/mobile-results"
import { SwipeTabs } from "@/components/swipe-tabs"
import { useUserPreferences } from "@/hooks/use-user-preferences"
import { ProjectSelector } from "@/components/project-selector"
import { useProjectManagement } from "@/hooks/use-project-management"
import { CreateProjectModal } from "@/components/create-project-modal"
import { ProjectDashboard } from "@/components/project-dashboard"
import { CalculationListItem } from "@/components/calculation-list-item"

function TabButton({ value, children }: { value: string, children: React.ReactNode }) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "flex-1 text-xs sm:text-sm rounded-md",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg",
        "data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground",
        "hover:bg-muted transition-colors duration-200 ease-in-out"
      )}
    >
      {children}
    </TabsTrigger>
  )
}

export default function MetalWeightCalculator() {
  return (
    <Suspense fallback={null}>
      <MetalWeightCalculatorInner />
    </Suspense>
  )
}

function MetalWeightCalculatorInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Add hydration state
  const [isHydrated, setIsHydrated] = useState(false)
  
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { trackStandardSize, trackDimension, trackCalculation, getSuggestions, updateDefaults } = useUserPreferences()
  const suggestions = getSuggestions()

  // Project management
  const { 
    projects, 
    activeProject, 
    isLoading: isProjectLoading,
    createProject,
    updateProject,
    deleteProject, 
    setActiveProject,
    addCalculationToProject,
    getProjectCalculations,
    exportProject,
    refreshProjects,
    refreshActiveProject,
    updateCalculationInProject,
    deleteCalculation,
  } = useProjectManagement()

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

  // Use refs to store timeout IDs for debouncing
  const lengthUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lengthCalculationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track unit changes
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
    }, 800) // 800ms delay for calculation
    
    // Update defaults after even longer delay
    lengthUpdateTimeoutRef.current = setTimeout(() => {
      if (newLength && newLength !== '0' && !isNaN(parseFloat(newLength))) {
        updateDefaults({ defaultLength: newLength })
      }
    }, 1200) // 1200ms delay for defaults
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
  const [currency, setCurrency] = useState("USD")

  // History
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [activeTab, setActiveTab] = useState("calculator")

  // Comparison state
  const [comparisonCalculations, setComparisonCalculations] = useState<Set<string>>(new Set())

  // Project management state
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showManageProjects, setShowManageProjects] = useState(false)
  const [calculationToEdit, setCalculationToEdit] = useState<Calculation | null>(null)

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

  useEffect(() => {
    const calculationIdToLoad = searchParams.get('loadCalculationId')
    if (calculationIdToLoad && calculations.length > 0) {
      const calcToLoad = calculations.find(c => c.id === calculationIdToLoad)
      if (calcToLoad) {
        loadCalculation(calcToLoad)
        // Clean the URL
        router.replace('/', { scroll: false })
      }
    }
  }, [searchParams, calculations, router])

  // Add hydration effect
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Load saved calculations on mount (only after hydration)
  useEffect(() => {
    if (!isHydrated) return
    
    const loadSavedCalculations = async () => {
      try {
        const saved = localStorage.getItem("metal-calculations")
        if (saved) {
          const parsed = JSON.parse(saved).map((calc: any) => ({
            ...calc,
            timestamp: new Date(calc.timestamp),
          }))
          setCalculations(parsed)
        }
      } catch (error) {
        console.error("Error loading saved calculations:", error)
        toast({
          title: "Loading Error",
          description: "Failed to load saved calculations.",
          variant: "destructive",
        })
      }
    }

    loadSavedCalculations()
  }, [isHydrated])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (lengthCalculationTimeoutRef.current) {
        clearTimeout(lengthCalculationTimeoutRef.current)
      }
      if (lengthUpdateTimeoutRef.current) {
        clearTimeout(lengthUpdateTimeoutRef.current)
      }
    }
  }, [])

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
      return { isValid: false, errors: ["Please select a profile and material"], warnings: [] }
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
        title: "Calculation Error",
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
        title: "Cannot save calculation",
        description: "Please ensure all inputs are valid and calculation is complete.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Always create the calculation object based on the current form state
      const currentCalculationState: Omit<Calculation, 'id' | 'timestamp' | 'projectId' | 'projectName' | 'notes' | 'tags' | 'isArchived' | 'calculationNumber'> = {
        profileCategory,
        profileType,
        profileName: selectedProfile.name,
        standardSize: standardSize || "Custom",
        material,
        grade,
        materialName: selectedMaterial.name,
        dimensions: { ...dimensions, length },
        weight,
        weightUnit,
        crossSectionalArea: structuralProperties.area,
        momentOfInertiaX: structuralProperties.momentOfInertiaX,
        momentOfInertiaY: structuralProperties.momentOfInertiaY,
        sectionModulusX: structuralProperties.sectionModulusX,
        sectionModulusY: structuralProperties.sectionModulusY,
        radiusOfGyrationX: structuralProperties.radiusOfGyrationX,
        radiusOfGyrationY: structuralProperties.radiusOfGyrationY,
        perimeter: structuralProperties.perimeter,
        quantity: parseFloat(quantity) || 1,
        pricePerUnit: parseFloat(pricePerUnit) || undefined,
        currency,
      };

      if (calculationToEdit) {
        // This is an update. Preserve original metadata.
        const updatedCalculationData: Calculation = {
          ...calculationToEdit, // Start with the original calculation data
          ...currentCalculationState, // Overwrite with new values from the form
          timestamp: new Date(), // Always update the timestamp
        };
        
        await updateCalculationInProject(calculationToEdit.id, updatedCalculationData);
        setCalculationToEdit(null); // Exit editing mode
        toast({
          title: "Calculation Updated",
          description: "Your changes have been saved to the project.",
        });
      } else {
        // This is a new calculation
        const newCalculation: Calculation = {
          ...currentCalculationState,
          id: Date.now().toString(),
          timestamp: new Date(),
        };
        const savedCalc = await addCalculationToProject(newCalculation, activeProject?.id);
        setCalculations(prev => [savedCalc, ...prev]);
        toast({
          title: "Calculation Saved",
          description: "Your calculation has been added to the project.",
        });
      }
    } catch (error) {
      console.error("Error saving calculation:", error)
      toast({
        title: "Saving Error",
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
        title: "Cannot export calculation",
        description: "Please select a valid profile and material first.",
        variant: "destructive",
      })
      return
    }

    const exportData = {
      // Basic Information
      profile: `${PROFILES[profileCategory as keyof typeof PROFILES].name} - ${selectedProfile.name}`,
      standardSize: standardSize || "Custom",
      material: selectedMaterial.name,
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
      title: "Enhanced calculation exported",
      description: "Comprehensive CSV with material properties and temperature effects downloaded.",
    })
  }

  const shareCalculation = async () => {
    if (weight <= 0 || !selectedProfile || !selectedMaterial) {
      toast({
        title: "Cannot share calculation",
        description: "Please select a valid profile and material first.",
        variant: "destructive",
      })
      return
    }

    const shareData = {
      title: "Metal Weight Calculator Result",
      text: `${selectedMaterial.name} ${selectedProfile.name} ${standardSize ? `(${standardSize})` : ""} weighs ${weight.toFixed(4)} ${WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name.toLowerCase()}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast({
          title: "Shared successfully",
          description: "Calculation shared successfully.",
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(shareData.text)
      toast({
        title: "Copied to clipboard",
        description: "Calculation details copied to clipboard.",
      })
    }
  }

  const loadCalculation = (calc: Calculation) => {
    setProfileCategory(calc.profileCategory)
    setProfileType(calc.profileType)
    setMaterial(calc.material)
    setGrade(calc.grade)
    setWeightUnit(calc.weightUnit)

    const calcLength = calc.dimensions.length || "1000"
    setLength(calcLength)
    setLengthInput(calcLength)

    const { length: _, ...otherDimensions } = calc.dimensions
    setDimensions(otherDimensions)

    setStandardSize(calc.standardSize === "Custom" ? "" : calc.standardSize)
    setCustomInput(calc.standardSize === "Custom")

    setQuantity(calc.quantity?.toString() || "1")
    setPricePerUnit(calc.pricePerUnit?.toString() || "")
    setCurrency(calc.currency || "USD")

    setWeight(calc.weight)
    setCrossSectionalArea(calc.crossSectionalArea)
    setStructuralProperties({
      area: calc.crossSectionalArea,
      momentOfInertiaX: calc.momentOfInertiaX || 0,
      momentOfInertiaY: calc.momentOfInertiaY || 0,
      sectionModulusX: calc.sectionModulusX || 0,
      sectionModulusY: calc.sectionModulusY || 0,
      radiusOfGyrationX: calc.radiusOfGyrationX || 0,
      radiusOfGyrationY: calc.radiusOfGyrationY || 0,
      perimeter: calc.perimeter || 0,
      weight: (calc as any).weightPerMeter || 0,
      adjustedDensity: (calc as any).adjustedDensity,
      centroidX: (calc as any).centroidX || 0,
      centroidY: (calc as any).centroidY || 0,
    })
    
    setValidationErrors([])
    setValidationWarnings([])
    setCalculationError(null)

    setActiveTab("calculator")
    setCalculationToEdit(calc)
  }

  const cloneCalculation = (calcToClone: Calculation) => {
    // This function loads a calculation's data into the form without setting it up for an update.
    // It's for creating a new calculation based on an old one.
    setProfileCategory(calcToClone.profileCategory)
    setProfileType(calcToClone.profileType)
    setMaterial(calcToClone.material)
    setGrade(calcToClone.grade)
    setWeightUnit(calcToClone.weightUnit)

    const calcLength = calcToClone.dimensions.length || "1000"
    setLength(calcLength)
    setLengthInput(calcLength)

    const { length: _, ...otherDimensions } = calcToClone.dimensions
    setDimensions(otherDimensions)

    setStandardSize(calcToClone.standardSize === "Custom" ? "" : calcToClone.standardSize)
    setCustomInput(calcToClone.standardSize === "Custom")

    setQuantity(calcToClone.quantity?.toString() || "1")
    setPricePerUnit(calcToClone.pricePerUnit?.toString() || "")
    setCurrency(calcToClone.currency || "USD")

    // Reset weight and properties to trigger recalculation
    setWeight(0)
    setStructuralProperties(null)
    setCrossSectionalArea(0)
    setVolume(0)
    
    setValidationErrors([])
    setValidationWarnings([])
    setCalculationError(null)

    // Ensure we are not in "edit" mode from a previous action
    setCalculationToEdit(null);

    // Switch to the calculator tab so the user can see the cloned data
    setActiveTab("calculator")

    toast({
      title: "Calculation Cloned",
      description: "Data loaded into the form. Modify and save as a new calculation.",
    })
  }

  const renderDimensionInputs = () => {
    if (!selectedProfile) return null

    const dimensionLabels: Record<string, string> = {
      // Common dimensions
      h: "Height (h)",
      b: "Width (b)", 
      a: "Side length (a)",
      length: "Length",
      width: "Width",
      height: "Height",
      side: "Side length",
      thickness: "Thickness",
      distance: "Across flats",
      
      // Steel profile specific
      tw: "Web thickness (tw)",
      tf: "Flange thickness (tf)",
      t: "Thickness (t)",
      r: "Root radius (r)",
      
      // Hollow sections
      od: "Outer diameter (OD)",
      id: "Inner diameter (ID)",
      wt: "Wall thickness (wt)",
      
      // Pipes and tubes
      diameter: "Diameter",
      d: "Diameter (d)",
    }

    const getInputDescription = (key: string): string => {
      const descriptions: Record<string, string> = {
        h: "Overall height of the profile - critical for moment calculations",
        b: "Overall width of the flange - affects lateral stability",
        tw: "Thickness of the vertical web - resists shear forces",
        tf: "Thickness of the horizontal flange - resists bending",
        t: "Material thickness - affects all structural properties",
        r: "Corner radius (fillet) - stress concentration factor",
        od: "Outside diameter - determines overall size",
        wt: "Wall thickness for pipes - affects strength and weight",
        a: "Equal dimension for square profiles",
        diameter: "Full diameter of round section",
        distance: "Distance across flats for hexagonal profiles",
      }
      return descriptions[key] || ""
    }

    if (!selectedProfile.dimensions || selectedProfile.dimensions.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No dimensions required for this profile type</p>
        </div>
      )
    }

    // Use mobile-enhanced inputs on mobile devices
    const InputComponent = isDesktop ? Input : Input

    return (
      <EnhancedInputGroup
        title="Profile Dimensions"
        description={`Enter dimensions for ${selectedProfile.name}`}
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
                <Input
                  id={dimensionKey}
                  type="number"
                  value={value}
                  onChange={(e) => updateDimension(dimensionKey, e.target.value)}
                  placeholder="Enter value"
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
            <Label htmlFor="length">Length</Label>
            <Input
              id="length"
              type="number"
              value={lengthInput}
              onChange={(e) => handleLengthChange(e.target.value)}
              placeholder="Enter length"
              disabled={isCalculating}
              min={0.1}
              max={1000000}
              step={1}
            />
            <div className="text-xs text-muted-foreground">
              Total length of the profile for weight calculation
            </div>
          </div>
        )}

        {/* Temperature input (if enabled) */}
        {useTemperatureEffects && (
          <div className="space-y-2">
            <Label htmlFor="operating-temperature">Operating Temperature (°C)</Label>
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
            />
            <div className="text-xs text-muted-foreground">
              Reference temperature: 20°C. Temperature affects material density.
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
          No standard sizes available for this profile type.
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="standard-size">Standard Size</Label>
        <Select value={standardSize} onValueChange={setStandardSize} disabled={isCalculating}>
          <SelectTrigger>
            <SelectValue placeholder="Select a standard size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom Dimensions</SelectItem>
            
            {/* Recent sizes first if available */}
            {recentSizes.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent
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
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">All Sizes</div>
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
    // Show loading state
    if (isCalculating) {
      return (
        <div>
          <CalculationLoading 
            stage="Computing structural properties..." 
            progress={undefined}
            details="Analyzing profile geometry and material properties"
          />
        </div>
      )
    }

    // Show error state
    if (calculationError) {
      return (
        <div>
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Calculation Error</AlertTitle>
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
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry Calculation
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    // Show validation errors
    if (!lastValidation.isValid) {
      return (
        <div>
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid Inputs</AlertTitle>
            <AlertDescription>
              Please correct the following errors:
              <ul className="list-disc list-inside mt-2 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
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
            onSave={saveCalculation}
            onBreakdown={() => setActiveTab("breakdown")}
            onAdvancedAnalysis={() => setActiveTab("advanced")}
          />
        )
      }

      return (
        <div>
          <Card className={cn(
            "backdrop-blur-sm bg-card/90 border-primary/10 shadow-lg",
            hoverStates.card
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Calculation Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quantity and Price Inputs */}
              <div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <Label htmlFor="quantity" className="text-xs">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="1"
                      min="0.001"
                      step="1"
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price" className="text-xs">Price per Unit ({currency})</Label>
                    <Input
                      id="price"
                      type="number"
                      value={pricePerUnit}
                      onChange={(e) => setPricePerUnit(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Single Unit Results */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Single Unit</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {weight.toFixed(4)}
                    </div>
                    <div className="text-muted-foreground">
                      {WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name}
                    </div>
                  </div>
                  {pricePerUnit && (
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {currency} {parseFloat(pricePerUnit).toFixed(2)}
                      </div>
                      <div className="text-muted-foreground">Price</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Results (if quantity > 1) */}
              {parseFloat(quantity) !== 1 && parseFloat(quantity) > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-lg border border-green-200/50 dark:border-green-800/50">
                  <h4 className="text-xs font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-1">
                    <Calculator className="h-3 w-3" />
                    Total ({quantity} units)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-700 dark:text-green-300">
                        {(weight * parseFloat(quantity)).toFixed(4)}
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        {WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name}
                      </div>
                    </div>
                    {pricePerUnit && (
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-700 dark:text-green-300">
                          {currency} {(parseFloat(pricePerUnit) * parseFloat(quantity)).toFixed(2)}
                        </div>
                        <div className="text-green-600 dark:text-green-400">Total Cost</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Basic Properties with staggered animation */}
              <Separator className="my-3" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Cross-sectional Area", value: `${structuralProperties.area.toFixed(4)} cm²` },
                  { label: "Volume", value: `${volume.toFixed(4)} cm³` }
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className="text-center p-2 bg-muted/50 rounded-md border border-border/50"
                  >
                    <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
                    <div className="text-xs font-semibold text-foreground mt-1">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Structural Properties with enhanced layout */}
              <div>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-semibold mb-4 text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Structural Properties
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      {
                        title: "Moment of Inertia",
                        values: [
                          `Ix: ${structuralProperties.momentOfInertiaX.toFixed(2)} cm⁴`,
                          `Iy: ${structuralProperties.momentOfInertiaY.toFixed(2)} cm⁴`
                        ]
                      },
                      {
                        title: "Section Modulus", 
                        values: [
                          `Sx: ${structuralProperties.sectionModulusX.toFixed(2)} cm³`,
                          `Sy: ${structuralProperties.sectionModulusY.toFixed(2)} cm³`
                        ]
                      },
                      {
                        title: "Radius of Gyration",
                        values: [
                          `rx: ${structuralProperties.radiusOfGyrationX.toFixed(2)} cm`,
                          `ry: ${structuralProperties.radiusOfGyrationY.toFixed(2)} cm`
                        ]
                      },
                      {
                        title: "Physical Properties",
                        values: [
                          `Perimeter: ${structuralProperties.perimeter.toFixed(2)} cm`,
                          `Weight/m: ${structuralProperties.weight.toFixed(2)} kg/m`
                        ]
                      }
                    ].map((section, index) => (
                      <div 
                        key={section.title}
                        className="p-3 bg-background/60 rounded-lg border border-border/30"
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
                <div>
                  <Separator className="my-4" />
                  <div className="p-3 bg-gradient-to-br from-blue-50/70 to-cyan-50/70 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <h4 className="font-semibold text-xs mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Layers className="h-3 w-3" />
                      Temperature Effects
                    </h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-white/60 dark:bg-blue-950/20 rounded-md">
                        <span className="text-muted-foreground block">Adjusted Density</span>
                        <div className="font-medium text-blue-700 dark:text-blue-300">{structuralProperties.adjustedDensity.toFixed(3)} g/cm³</div>
                      </div>
                      <div className="p-2 bg-white/60 dark:bg-blue-950/20 rounded-md">
                        <span className="text-muted-foreground block">Density Change</span>
                        <div className="font-medium text-blue-700 dark:text-blue-300">{((structuralProperties.adjustedDensity - (selectedMaterial?.density || 0)) / (selectedMaterial?.density || 1) * 100).toFixed(2)}%</div>
                      </div>
                      <div className="p-2 bg-white/60 dark:bg-blue-950/20 rounded-md">
                        <span className="text-muted-foreground block">Original</span>
                        <div className="font-medium text-blue-700 dark:text-blue-300">{selectedMaterial?.density.toFixed(3)} g/cm³</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Warnings */}
              {validationWarnings.length > 0 && (
                <div>
                  <Separator className="my-4" />
                  <ValidationSummary
                    errors={[]}
                    warnings={validationWarnings}
                  />
                </div>
              )}

              {/* Action Buttons with enhanced styling */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  onClick={saveCalculation} 
                  className="flex-1" 
                  disabled={isSaving}
                  loading={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button 
                  onClick={() => setActiveTab("advanced")} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Cog className="mr-2 h-4 w-4" />
                  Advanced Analysis
                </Button>
                <Button 
                  onClick={() => setActiveTab("breakdown")} 
                  variant="outline" 
                  className="flex-1"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Breakdown
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Default state - waiting for valid inputs
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calculator className="h-16 w-16 mx-auto mb-4 opacity-40" />
        <p className="text-lg">Select a profile and material to begin calculation</p>
        <p className="text-sm mt-2 opacity-60">Choose from our extensive library of standard profiles</p>
      </div>
    )
  }

  const calculationHistory = calculations

  // Show loading state during hydration to prevent hydration mismatches
  if (!isHydrated) {
    return (
      <div className="min-h-screen relative bg-background overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-4">
                          <Loader2 className="h-8 w-8 mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading Metal Calculator...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-background overflow-hidden">
      {/* Background Elements */}
      <BackgroundElements />

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className={cn("relative z-10", isDesktop ? "px-4" : "max-w-md mx-auto p-4")}>
        {/* Header */}
        <div className="space-y-3 mb-4">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Professional Metal Calculator</h1>
            </div>
            <p className="text-xs text-muted-foreground">Calculate weights for structural profiles and materials</p>
          </div>
          
          {/* Project Selector */}
          <div className="flex justify-center mb-4 md:mb-6">
            <ProjectSelector
              activeProject={activeProject}
              projects={projects}
              onProjectChange={setActiveProject}
              onCreateProject={() => setShowCreateProject(true)}
              onManageProjects={() => router.push('/projects')}
              isLoading={isProjectLoading}
              className="max-w-sm"
            />
          </div>
        </div>

        {isDesktop ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/80 p-1 rounded-lg">
              <TabButton value="calculator">
                <Calculator className="h-4 w-4 mr-2" />
                Calculator
              </TabButton>
              <TabButton value="calculations">
                <History className="h-4 w-4 mr-2" />
                Calculations
              </TabButton>
              <TabButton value="dashboard">
                <FolderKanban className="h-4 w-4 mr-2" />
                Dashboard
              </TabButton>
            </TabsList>
  
            <TabsContent value="calculator" className="mt-4">
               <div className="grid grid-cols-12 gap-4 h-[calc(100vh-220px)]">
                {/* Left Column - Material & Profile Selection */}
                <div className="col-span-3 overflow-y-auto pr-2 scrollbar-column">
                  <div className="space-y-4">
                    {/* Material Selection */}
                    <div>
                      <Card className={cn(
                        "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                        hoverStates.card
                      )}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />
                            Material Selection
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <MaterialSelector
                            material={material}
                            setMaterial={setMaterial}
                            grade={grade}
                            setGrade={setGrade}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Profile Selection */}
                    <div>
                      <Card className={cn(
                        "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                        hoverStates.card
                      )}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-primary" />
                            Profile Selection
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ProfileSelector
                            profileCategory={profileCategory}
                            setProfileCategory={setProfileCategory}
                            profileType={profileType}
                            setProfileType={setProfileType}
                          />

                          {/* Standard Sizes */}
                          {renderStandardSizes()}

                          {/* Toggle for custom dimensions */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Custom Dimensions</span>
                            <Button
                              variant={customInput ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                setCustomInput(true)
                                setStandardSize("")
                              }}
                              className={hoverStates.buttonSecondary}
                            >
                              {customInput ? "Editing Custom" : "Use Custom"}
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
                    <div>
                      <Card className={cn(
                        "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                        hoverStates.card
                      )}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Dimensions
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Unit Selection */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="length-unit">Length Unit</Label>
                              <Select value={lengthUnit} onValueChange={handleLengthUnitChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(LENGTH_UNITS).map(([key, unit]) => (
                                    <SelectItem key={key} value={key}>
                                      {unit.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="weight-unit">Weight Unit</Label>
                              <Select value={weightUnit} onValueChange={handleWeightUnitChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(WEIGHT_UNITS).map(([key, unit]) => (
                                    <SelectItem key={key} value={key}>
                                      {unit.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Profile Dimensions */}
                          <Separator className="my-4" />
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium">Profile Dimensions</h3>
                              {selectedProfile && (
                                <Badge variant="outline" className="font-normal">
                                  {selectedProfile.name} {standardSize && `(${standardSize})`}
                                </Badge>
                              )}
                            </div>
                            {renderDimensionInputs()}
                          </div>

                          {/* Temperature Controls */}
                          <Separator className="my-4" />
                          <div className="p-3 bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id="temperature-effects"
                                  checked={useTemperatureEffects}
                                  onCheckedChange={setUseTemperatureEffects}
                                />
                                <Label htmlFor="temperature-effects" className="text-sm font-medium">
                                  Temperature Effects
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
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Right Column - Results */}
                <div className="col-span-4 overflow-y-auto pr-2 scrollbar-column">
                  <div className="space-y-3">
                    <div>
                      {renderResults()}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
  
            <TabsContent value="calculations" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Calculation History</CardTitle>
                  <CardDescription>
                    Here is a list of all your past calculations. Click on one to load it.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-4 p-4 max-h-[60vh] overflow-y-auto">
                    {calculationHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((calc) => (
                      <CalculationListItem
                        key={calc.id}
                        calculation={calc}
                        onClick={loadCalculation}
                        onClone={cloneCalculation}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
  
            <TabsContent value="dashboard" className="mt-4">
              <ProjectDashboard
                projects={projects}
                activeProject={activeProject}
                calculations={calculationHistory}
                onCreateProject={() => setShowCreateProject(true)}
                onManageProjects={() => router.push('/projects')}
                onSetActiveProject={setActiveProject}
                getProjectCalculations={getProjectCalculations}
                onLoadCalculation={loadCalculation}
                onUpdateCalculation={updateCalculationInProject}
                onDeleteCalculation={deleteCalculation}
                isLoading={isProjectLoading}
              />
            </TabsContent>
          </Tabs>
        ) : (
        <SwipeTabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
          tabs={[
            {
              value: "calculator",
              label: "Calculator",
              icon: <Calculator className="h-4 w-4" />,
            },
            {
              value: "calculations",
              label: "Calculations",
              icon: <History className="h-4 w-4" />,
            },
            {
              value: "dashboard",
              label: "Dashboard",
              icon: <FolderKanban className="h-4 w-4" />,
            },
            {
              value: "comparison",
              label: "Compare",
              icon: <BarChart3 className="h-4 w-4" />,
            }
          ]}
        >
          <SwipeTabs.Content value="calculator">
            <div className="space-y-6 pt-4">
                {/* Material Selection - Now First */}
                <div>
                  <Card className={cn(
                    "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                    hoverStates.card
                  )}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Layers className="h-5 w-5 text-primary" />
                        Material Selection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MaterialSelector
                        material={material}
                        setMaterial={setMaterial}
                        grade={grade}
                        setGrade={setGrade}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Selection - Now Second */}
                <div>
                  <Card className={cn(
                    "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                    hoverStates.card
                  )}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        Profile Selection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ProfileSelector
                        profileCategory={profileCategory}
                        setProfileCategory={setProfileCategory}
                        profileType={profileType}
                        setProfileType={setProfileType}
                      />

                      {/* Standard Sizes */}
                      {renderStandardSizes()}
                    </CardContent>
                  </Card>
                </div>

                {/* Dimensions */}
                <div>
                  <Card className={cn(
                    "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                    hoverStates.card
                  )}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Dimensions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Unit Selection */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="length-unit">Length Unit</Label>
                          <Select value={lengthUnit} onValueChange={handleLengthUnitChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(LENGTH_UNITS).map(([key, unit]) => (
                                <SelectItem key={key} value={key}>
                                  {unit.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="weight-unit">Weight Unit</Label>
                          <Select value={weightUnit} onValueChange={handleWeightUnitChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(WEIGHT_UNITS).map(([key, unit]) => (
                                <SelectItem key={key} value={key}>
                                  {unit.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Toggle for custom dimensions */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Custom Dimensions</span>
                        <Button
                          variant={customInput ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setCustomInput(true)
                            setStandardSize("")
                          }}
                        >
                          {customInput ? "Editing Custom" : "Use Custom"}
                        </Button>
                      </div>

                      {/* Profile Dimensions */}
                      <Separator className="my-4" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Profile Dimensions</h3>
                          {selectedProfile && (
                            <Badge variant="outline" className="font-normal">
                              {selectedProfile.name} {standardSize && `(${standardSize})`}
                            </Badge>
                          )}
                        </div>
                        {renderDimensionInputs()}
                      </div>

                      {/* Temperature Controls */}
                      <Separator className="my-4" />
                      <div className="space-y-3 p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/50">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="temperature-effects"
                            checked={useTemperatureEffects}
                            onCheckedChange={setUseTemperatureEffects}
                          />
                          <Label htmlFor="temperature-effects" className="text-sm font-medium">
                            Enable Temperature Effects
                          </Label>
                        </div>
                        
                        {useTemperatureEffects && (
                          <div className="space-y-2">
                            <Label htmlFor="operating-temperature">Operating Temperature (°C)</Label>
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
                            />
                            <div className="text-xs text-muted-foreground">
                              Reference temperature: 20°C. Temperature affects material density.
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Results */}
                {renderResults()}
              </div>
          </SwipeTabs.Content>

          {/* Projects Tab */}
          <SwipeTabs.Content value="dashboard" className="space-y-4 pt-4">
             <ProjectDashboard
                projects={projects}
                activeProject={activeProject}
                calculations={calculations}
                onCreateProject={() => setShowCreateProject(true)}
                onManageProjects={() => router.push('/projects')}
                onSetActiveProject={setActiveProject}
                getProjectCalculations={getProjectCalculations}
                onUpdateCalculation={updateCalculationInProject}
                onDeleteCalculation={deleteCalculation}
                onLoadCalculation={loadCalculation}
                isLoading={isProjectLoading}
              />
          </SwipeTabs.Content>

          <SwipeTabs.Content value="calculations" className="space-y-4 pt-4">
            <Card className="backdrop-blur-sm bg-card/90 border-primary/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Calculation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {calculations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No saved calculations yet</p>
                ) : (
                  <div className="space-y-3">
                    {calculations.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map((calc) => (
                      <CalculationListItem
                        key={calc.id}
                        calculation={calc}
                        onClick={loadCalculation}
                        onClone={cloneCalculation}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
              <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
                <CardContent className="text-center py-8">
                  <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Complete a calculation to access advanced structural analysis</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Buckling analysis, load capacity, stress analysis, and deflection calculations
                  </p>
                </CardContent>
              </Card>
            )}
          </SwipeTabs.Content>

          {/* New: Calculation Comparison Tab */}
          <SwipeTabs.Content value="comparison" className="space-y-4">
            <CalculationComparison
              calculations={calculations}
              onAddToComparison={(id) => {
                setComparisonCalculations(prev => new Set([...prev, id]))
              }}
              onRemoveFromComparison={(id) => {
                setComparisonCalculations(prev => {
                  const newSet = new Set(prev)
                  newSet.delete(id)
                  return newSet
                })
              }}
            />
          </SwipeTabs.Content>
        </SwipeTabs>
        )}

        {/* Project Management Modals */}
        <CreateProjectModal
          open={showCreateProject}
          onOpenChange={setShowCreateProject}
          onCreateProject={async (data) => {
            await createProject(data)
          }}
          isLoading={isProjectLoading}
        />
      </div>
    </div>
  )
}
