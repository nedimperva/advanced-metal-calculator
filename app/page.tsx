"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calculator, Save, Share2, History, Download, ChevronRight, AlertTriangle, CheckCircle, Loader2, RefreshCw, AlertCircle, BarChart3, Layers, Cog } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"

import { cn } from "@/lib/utils"
import { animations, animationPresets, safeAnimation, createStaggeredAnimation } from "@/lib/animations"
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
import { SwipeTabs } from "@/components/swipe-tabs"

export default function MetalWeightCalculator() {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // State for undo/redo


  // State management with simple useState
  const [profileCategory, setProfileCategory] = useState("beams")
  const [profileType, setProfileType] = useState("hea")
  const [standardSize, setStandardSize] = useState("")
  const [material, setMaterial] = useState("steel")
  const [grade, setGrade] = useState("a36")
  const [dimensions, setDimensions] = useState<Record<string, string>>({})
  const [length, setLength] = useState("1000")
  const [lengthUnit, setLengthUnit] = useState("mm")
  const [weightUnit, setWeightUnit] = useState("kg")
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

  // History
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [activeTab, setActiveTab] = useState("calculator")

  // Comparison state
  const [comparisonCalculations, setComparisonCalculations] = useState<Set<string>>(new Set())

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

  // Load saved calculations on mount
  useEffect(() => {
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
        }
      } catch (error) {
        console.error("Error updating standard size:", error)
        setCalculationError("Failed to load standard size data")
      }
    }
  }, [standardSize, profileType, selectedProfile])

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

      const calculatedVolume = properties.area * (lengthValue * lengthFactor)
      setVolume(calculatedVolume)

      // Use adjusted density if temperature effects are enabled
      const effectiveDensity = properties.adjustedDensity || selectedMaterial.density
      const calculatedWeight = calculateWeight(
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
    validateInputs
  ])

  // Trigger calculation when key inputs change - fix circular dependency
  useEffect(() => {
    // Only trigger calculation if we have the necessary data
    if (selectedProfile && selectedMaterial && Object.keys(dimensions).length > 0) {
      performCalculation()
    }
  }, [selectedProfile, selectedMaterial, dimensions, length, lengthUnit, weightUnit, operatingTemperature, useTemperatureEffects, profileType])

  // Additional calculation trigger when performCalculation dependencies change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedProfile && selectedMaterial && length && Object.keys(dimensions).length > 0) {
        performCalculation()
      }
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [performCalculation])

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
      const newCalculation: Calculation = {
        id: Date.now().toString(),
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
        // Enhanced structural properties
        momentOfInertiaX: structuralProperties.momentOfInertiaX,
        momentOfInertiaY: structuralProperties.momentOfInertiaY,
        sectionModulusX: structuralProperties.sectionModulusX,
        sectionModulusY: structuralProperties.sectionModulusY,
        radiusOfGyrationX: structuralProperties.radiusOfGyrationX,
        radiusOfGyrationY: structuralProperties.radiusOfGyrationY,
        perimeter: structuralProperties.perimeter,
        timestamp: new Date(),
      }

      const updated = [newCalculation, ...calculations.slice(0, 19)] // Keep last 20
      setCalculations(updated)
      localStorage.setItem("metal-calculations", JSON.stringify(updated))

      toast({
        title: "Calculation saved",
        description: "Your calculation has been saved to history.",
      })
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

    // Extract length from dimensions
    const calcLength = calc.dimensions.length || "1000"
    setLength(calcLength)

    // Set other dimensions
    const { length: _, ...otherDimensions } = calc.dimensions
    setDimensions(otherDimensions)

    // Set standard size if available
    setStandardSize(calc.standardSize === "Custom" ? "" : calc.standardSize)
    setCustomInput(calc.standardSize === "Custom")

    // Switch to calculator tab
    setActiveTab("calculator")
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
        
        {/* Length input */}
        <div className="space-y-2">
          <Label htmlFor="length">Length</Label>
          <Input
            id="length"
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
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
            {sizes.map((size) => (
              <SelectItem key={size.designation} value={size.designation}>
                {size.designation}
              </SelectItem>
            ))}
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
            details="Analyzing profile geometry and material properties"
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
                  className={safeAnimation(animations.buttonPress)}
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

    // Show validation errors with smooth entrance
    if (!lastValidation.isValid) {
      return (
        <div className={safeAnimation(animations.slideInFromBottom)}>
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid Inputs</AlertTitle>
            <AlertDescription>
              Please correct the following errors:
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
      return (
        <div className={safeAnimation(animationPresets.result)}>
          <Card className={cn(
            "backdrop-blur-sm bg-card/90 border-primary/10 shadow-lg",
            safeAnimation(animations.cardHover)
          )}>
            <CardHeader className="pb-3">
              <CardTitle className={cn(
                "text-lg flex items-center gap-2",
                safeAnimation(animations.fadeIn)
              )}>
                <CheckCircle className="h-5 w-5 text-green-500 animate-pulse" />
                Calculation Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Result with pulse animation */}
              <div className={cn(
                "text-center bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl",
                safeAnimation(animations.scaleIn)
              )}>
                <div className="text-4xl font-bold text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {weight.toFixed(4)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name}
                </div>
              </div>

              {/* Basic Properties with staggered animation */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Cross-sectional Area", value: `${structuralProperties.area.toFixed(4)} cm²` },
                  { label: "Volume", value: `${volume.toFixed(4)} cm³` }
                ].map((item, index) => (
                  <div 
                    key={item.label}
                    className={cn(
                      "text-center p-3 bg-muted/50 rounded-lg border border-border/50",
                      safeAnimation(`${animations.slideInFromBottom} delay-${(index + 1) * 100}`)
                    )}
                  >
                    <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
                    <div className="font-semibold text-foreground mt-1">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Structural Properties with enhanced layout */}
              <div className={safeAnimation(`${animations.slideInFromBottom} delay-300`)}>
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

              {/* Temperature Effects with enhanced styling */}
              {useTemperatureEffects && structuralProperties.adjustedDensity && (
                <div className={safeAnimation(`${animations.slideInFromBottom} delay-400`)}>
                  <Separator className="my-4" />
                  <div className="p-4 bg-gradient-to-br from-blue-50/70 to-cyan-50/70 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <Layers className="h-4 w-4" />
                      Temperature Effects
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        { label: "Original Density", value: `${selectedMaterial?.density.toFixed(3)} g/cm³` },
                        { label: "Adjusted Density", value: `${structuralProperties.adjustedDensity.toFixed(3)} g/cm³` },
                        { label: "Temperature", value: `${operatingTemperature}°C` },
                        { label: "Density Change", value: `${((structuralProperties.adjustedDensity - (selectedMaterial?.density || 0)) / (selectedMaterial?.density || 1) * 100).toFixed(2)}%` }
                      ].map((item, index) => (
                        <div 
                          key={item.label}
                          className={cn(
                            "p-2 bg-white/60 dark:bg-blue-950/20 rounded-md",
                            safeAnimation(`${animations.fadeIn} delay-${(index + 8) * 50}`)
                          )}
                        >
                          <span className="text-muted-foreground block">{item.label}:</span>
                          <div className="font-medium text-blue-700 dark:text-blue-300">{item.value}</div>
                        </div>
                      ))}
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

              {/* Action Buttons with enhanced styling */}
              <div className={cn(
                "flex flex-col sm:flex-row gap-2 pt-2",
                safeAnimation(`${animations.slideInFromBottom} delay-600`)
              )}>
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
                  onClick={shareCalculation} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
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
        <Calculator className={cn(
          "h-16 w-16 mx-auto mb-4 opacity-40",
          safeAnimation(animations.pulse)
        )} />
        <p className="text-lg">Select a profile and material to begin calculation</p>
        <p className="text-sm mt-2 opacity-60">Choose from our extensive library of standard profiles</p>
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

      <div className={cn("relative z-10 mx-auto p-4", isDesktop ? "max-w-6xl" : "max-w-md")}>
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Professional Metal Calculator</h1>
          </div>
          <p className="text-sm text-muted-foreground">Calculate weights for structural profiles and materials</p>
        </div>

        <SwipeTabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
          tabs={[
            {
              value: "calculator",
              label: "Calculator",
              icon: <Calculator className="h-3 w-3" />,
              shortLabel: "Calc"
            },
            {
              value: "breakdown",
              label: "Breakdown", 
              icon: <Layers className="h-3 w-3" />,
              shortLabel: "Break"
            },
            {
              value: "comparison",
              label: "Compare",
              icon: <BarChart3 className="h-3 w-3" />,
              shortLabel: "Comp"
            },
            {
              value: "history", 
              label: "History",
              icon: <History className="h-3 w-3" />,
              shortLabel: "Hist"
            }
          ]}
        >
          <SwipeTabs.Content value="calculator" className={safeAnimation(animationPresets.tab)}>
            {isDesktop ? (
              // Desktop Layout - Side by side
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Selection */}
                <div className="col-span-5 space-y-6">
                  {/* Profile Selection */}
                  <div className={safeAnimation(`${animations.slideInFromLeft} delay-100`)}>
                    <Card className={cn(
                      "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                      safeAnimation(animations.cardHover)
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
                            className={safeAnimation(animations.buttonPress)}
                          >
                            {customInput ? "Editing Custom" : "Use Custom"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Material Selection */}
                  <div className={safeAnimation(`${animations.slideInFromLeft} delay-200`)}>
                    <Card className={cn(
                      "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                      safeAnimation(animations.cardHover)
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
                </div>

                {/* Right Column - Dimensions & Results */}
                <div className="col-span-7 space-y-6">
                  {/* Dimensions */}
                  <div className={safeAnimation(`${animations.slideInFromRight} delay-100`)}>
                    <Card className={cn(
                      "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                      safeAnimation(animations.cardHover)
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
                            <Select value={lengthUnit} onValueChange={setLengthUnit}>
                              <SelectTrigger className={safeAnimation(animations.inputFocus)}>
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
                            <Select value={weightUnit} onValueChange={setWeightUnit}>
                              <SelectTrigger className={safeAnimation(animations.inputFocus)}>
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
                              Enable Temperature Effects
                            </Label>
                          </div>
                          
                          {useTemperatureEffects && (
                            <div className={cn(
                              "space-y-2",
                              safeAnimation(animations.slideInFromBottom)
                            )}>
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
                  <div className={safeAnimation(`${animations.slideInFromRight} delay-200`)}>
                    {renderResults()}
                  </div>
                </div>
              </div>
            ) : (
              // Mobile Layout - Stacked with animations
              <div className="space-y-6">
                {/* Profile Selection */}
                <div className={safeAnimation(`${animations.slideInFromBottom} delay-100`)}>
                  <Card className={cn(
                    "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                    safeAnimation(animations.cardHover)
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

                {/* Material Selection */}
                <div className={safeAnimation(`${animations.slideInFromBottom} delay-200`)}>
                  <Card className={cn(
                    "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                    safeAnimation(animations.cardHover)
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

                {/* Dimensions */}
                <div className={safeAnimation(`${animations.slideInFromBottom} delay-300`)}>
                  <Card className={cn(
                    "backdrop-blur-sm bg-card/95 border-primary/10 shadow-lg",
                    safeAnimation(animations.cardHover)
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
                          <Select value={lengthUnit} onValueChange={setLengthUnit}>
                            <SelectTrigger className={safeAnimation(animations.inputFocus)}>
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
                          <Select value={weightUnit} onValueChange={setWeightUnit}>
                            <SelectTrigger className={safeAnimation(animations.inputFocus)}>
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
                            Enable Temperature Effects
                          </Label>
                        </div>
                        
                        {useTemperatureEffects && (
                          <div className={cn(
                            "space-y-2",
                            safeAnimation(animations.slideInFromBottom)
                          )}>
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
              <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
                <CardContent className="text-center py-8">
                  <Calculator className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">Complete a calculation to see the breakdown</p>
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
              <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
                <CardContent className="text-center py-8">
                  <Cog className="h-12 w-12 mx-auto mb-3 opacity-50" />
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

          <SwipeTabs.Content value="history" className="space-y-4">
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
                    {calculations.map((calc) => (
                      <div
                        key={calc.id}
                        className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => loadCalculation(calc)}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">
                                {calc.materialName} {calc.profileName}{" "}
                                {calc.standardSize !== "Custom" && `(${calc.standardSize})`}
                              </div>
                              <div className="text-lg font-bold text-primary">
                                {calc.weight.toFixed(4)}{" "}
                                {WEIGHT_UNITS[calc.weightUnit as keyof typeof WEIGHT_UNITS].name.toLowerCase()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Area: {calc.crossSectionalArea.toFixed(4)} cm²
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {calc.timestamp.toLocaleDateString()} {calc.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </SwipeTabs.Content>
        </SwipeTabs>


      </div>
    </div>
  )
}
