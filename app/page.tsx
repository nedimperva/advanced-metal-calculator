"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, Save, Share2, History, Download, ChevronRight } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import ProfileSelector from "@/components/profile-selector"
import MaterialSelector from "@/components/material-selector"
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

export default function MetalWeightCalculator() {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Profile selection state
  const [profileCategory, setProfileCategory] = useState("beams")
  const [profileType, setProfileType] = useState("hea")
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null)
  const [standardSize, setStandardSize] = useState("")

  // Material selection state
  const [material, setMaterial] = useState("steel")
  const [grade, setGrade] = useState("a36")
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialGrade | null>(null)

  // Units and Temperature
  const [lengthUnit, setLengthUnit] = useState("mm")
  const [weightUnit, setWeightUnit] = useState("kg")
  const [operatingTemperature, setOperatingTemperature] = useState<string>("20")
  const [useTemperatureEffects, setUseTemperatureEffects] = useState(false)

  // Dimensions
  const [dimensions, setDimensions] = useState<Record<string, string>>({})
  const [customInput, setCustomInput] = useState(false)

  // Enhanced Results - using StructuralProperties
  const [structuralProperties, setStructuralProperties] = useState<StructuralProperties | null>(null)
  const [weight, setWeight] = useState(0)
  const [crossSectionalArea, setCrossSectionalArea] = useState(0)
  const [volume, setVolume] = useState(0)
  const [length, setLength] = useState("1000")

  // History
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [activeTab, setActiveTab] = useState("calculator")

  // Load saved calculations on mount
  useEffect(() => {
    const saved = localStorage.getItem("metal-calculations")
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((calc: any) => ({
          ...calc,
          timestamp: new Date(calc.timestamp),
        }))
        setCalculations(parsed)
      } catch (error) {
        console.error("Error loading saved calculations:", error)
      }
    }
  }, [])

  // Update selected profile and material when type/grade changes
  useEffect(() => {
    const profile =
      PROFILES[profileCategory as keyof typeof PROFILES]?.types[
        profileType as keyof (typeof PROFILES)[keyof typeof PROFILES]["types"]
      ]
    setSelectedProfile(profile || null)

    // Reset standard size when profile changes
    setStandardSize("")

    // Reset custom dimensions when profile changes
    if (!customInput) {
      setDimensions({})
    }
  }, [profileCategory, profileType, customInput])

  useEffect(() => {
    const materialData =
      MATERIALS[material as keyof typeof MATERIALS]?.grades[
        grade as keyof (typeof MATERIALS)[keyof typeof MATERIALS]["grades"]
      ] as MaterialGrade | undefined
    setSelectedMaterial(materialData || null)
  }, [material, grade])

  // Update dimensions when standard size changes
  useEffect(() => {
    if (standardSize && selectedProfile) {
      const sizes = STANDARD_SIZES[profileType as keyof typeof STANDARD_SIZES]
      const selectedSizeData = sizes?.find((size) => size.designation === standardSize)

      if (selectedSizeData) {
        setDimensions(selectedSizeData.dimensions)
        setCustomInput(false)
      }
    }
  }, [standardSize, profileType, selectedProfile])

  // Enhanced calculation using structural properties with temperature effects
  useEffect(() => {
    if (selectedProfile && selectedMaterial) {
      const lengthValue = Number.parseFloat(length) || 0
      const lengthFactor = LENGTH_UNITS[lengthUnit as keyof typeof LENGTH_UNITS].factor
      const tempValue = Number.parseFloat(operatingTemperature) || 20

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

      setWeight(calculatedWeight)
    } else {
      setStructuralProperties(null)
      setCrossSectionalArea(0)
      setVolume(0)
      setWeight(0)
    }
  }, [dimensions, length, lengthUnit, weightUnit, selectedProfile, selectedMaterial, profileType, operatingTemperature, useTemperatureEffects])

  const updateDimension = (key: string, value: string) => {
    setDimensions((prev) => ({ ...prev, [key]: value }))
    // If user is editing dimensions, switch to custom input mode
    if (!customInput) {
      setCustomInput(true)
      setStandardSize("")
    }
  }

  const saveCalculation = () => {
    if (weight <= 0 || !selectedProfile || !selectedMaterial || !structuralProperties) {
      toast({
        title: "Cannot save calculation",
        description: "Please select a valid profile and material first.",
        variant: "destructive",
      })
      return
    }

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
        densityChange: `${((structuralProperties.adjustedDensity - selectedMaterial.density) / selectedMaterial.density * 100).toFixed(2)}%`,
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
        h: "Overall height of the profile",
        b: "Overall width of the flange",
        tw: "Thickness of the vertical web",
        tf: "Thickness of the horizontal flange",
        t: "Material thickness",
        r: "Corner radius (fillet)",
        od: "Outside diameter",
        wt: "Wall thickness for pipes",
        a: "Equal dimension for square profiles",
        diameter: "Full diameter of round section",
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

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedProfile.dimensions.map((dimensionKey) => {
            const value = dimensions[dimensionKey] || ""
            const isValid = value && !isNaN(Number.parseFloat(value)) && Number.parseFloat(value) > 0
            
            return (
              <div key={dimensionKey} className="space-y-2">
                <Label htmlFor={dimensionKey} className="flex items-center gap-2">
                  <span className="font-medium">{dimensionLabels[dimensionKey] || dimensionKey}</span>
                  {!isValid && value && (
                    <span className="text-xs text-destructive">Invalid</span>
                  )}
                </Label>
                <Input
                  id={dimensionKey}
                  type="number"
                  value={value}
                  onChange={(e) => updateDimension(dimensionKey, e.target.value)}
                  className={cn(
                    "transition-colors",
                    !isValid && value && "border-destructive focus:ring-destructive",
                    isValid && "border-green-500/50"
                  )}
                  step="0.1"
                  min="0"
                  placeholder="Enter value"
                />
                {getInputDescription(dimensionKey) && (
                  <p className="text-xs text-muted-foreground">
                    {getInputDescription(dimensionKey)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Dimension validation summary */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Required dimensions:</span>
              <span>{selectedProfile.dimensions.join(", ")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Unit:</span>
              <span>{LENGTH_UNITS[lengthUnit as keyof typeof LENGTH_UNITS].name}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStandardSizes = () => {
    const sizes = STANDARD_SIZES[profileType as keyof typeof STANDARD_SIZES]

    if (!sizes || sizes.length === 0) {
      return (
        <div className="text-sm text-muted-foreground italic">No standard sizes available for this profile type.</div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="standard-size">Standard Size</Label>
        <Select value={standardSize} onValueChange={setStandardSize}>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            {isDesktop ? (
              // Desktop Layout - Side by side
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Selection */}
                <div className="col-span-5 space-y-6">
                  {/* Profile Selection */}
                  <Card className="backdrop-blur-sm bg-card/90 border-primary/10 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Profile Selection</CardTitle>
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
                        >
                          {customInput ? "Editing Custom" : "Use Custom"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Material Selection */}
                  <Card className="backdrop-blur-sm bg-card/90 border-primary/10 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Material Selection</CardTitle>
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

                {/* Right Column - Dimensions & Results */}
                <div className="col-span-7 space-y-6">
                  {/* Dimensions */}
                  <Card className="backdrop-blur-sm bg-card/90 border-primary/10 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Dimensions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Unit Selection */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="length-unit">Length Unit</Label>
                          <Select value={lengthUnit} onValueChange={setLengthUnit}>
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
                          <Select value={weightUnit} onValueChange={setWeightUnit}>
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

                      {/* Length Input */}
                      <div>
                        <Label htmlFor="length">Length</Label>
                        <Input
                          id="length"
                          type="number"
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                          className="mt-1"
                          step="0.1"
                        />
                      </div>

                      {/* Temperature Controls */}
                      <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="temperature-effects"
                            checked={useTemperatureEffects}
                            onChange={(e) => setUseTemperatureEffects(e.target.checked)}
                            className="rounded"
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
                              className="mt-1"
                              step="1"
                              placeholder="20"
                            />
                            <p className="text-xs text-muted-foreground">
                              Reference temperature: 20°C. Temperature affects material density.
                            </p>
                          </div>
                        )}
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
                    </CardContent>
                  </Card>

                  {/* Results */}
                  <Card className="backdrop-blur-sm bg-card/90 border-primary/10 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Enhanced Results Display */}
                      <div className="text-center space-y-2 py-4">
                        <div className="text-4xl font-bold text-primary animate-in fade-in-50 duration-500">
                          {weight > 0 ? weight.toFixed(4) : "0.0000"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name}
                        </div>
                        
                        {/* Primary Properties Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Cross-sectional Area</div>
                            <div className="text-lg font-semibold">{crossSectionalArea.toFixed(4)} cm²</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Volume</div>
                            <div className="text-lg font-semibold">{volume.toFixed(4)} cm³</div>
                          </div>
                        </div>

                        {/* Enhanced Structural Properties */}
                        {structuralProperties && (
                          <div className="mt-6 space-y-4">
                            <Separator />
                            <div className="text-left">
                              <h4 className="text-sm font-medium mb-3 text-center">Structural Properties</h4>
                              
                              {/* Moment of Inertia */}
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="text-center p-2 bg-muted/50 rounded">
                                  <div className="text-xs text-muted-foreground">Ix (Strong Axis)</div>
                                  <div className="text-sm font-semibold">{structuralProperties.momentOfInertiaX.toFixed(1)} cm⁴</div>
                                </div>
                                <div className="text-center p-2 bg-muted/50 rounded">
                                  <div className="text-xs text-muted-foreground">Iy (Weak Axis)</div>
                                  <div className="text-sm font-semibold">{structuralProperties.momentOfInertiaY.toFixed(1)} cm⁴</div>
                                </div>
                              </div>

                              {/* Section Modulus */}
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="text-center p-2 bg-muted/50 rounded">
                                  <div className="text-xs text-muted-foreground">Sx (Strong Axis)</div>
                                  <div className="text-sm font-semibold">{structuralProperties.sectionModulusX.toFixed(1)} cm³</div>
                                </div>
                                <div className="text-center p-2 bg-muted/50 rounded">
                                  <div className="text-xs text-muted-foreground">Sy (Weak Axis)</div>
                                  <div className="text-sm font-semibold">{structuralProperties.sectionModulusY.toFixed(1)} cm³</div>
                                </div>
                              </div>

                              {/* Radius of Gyration */}
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="text-center p-2 bg-muted/50 rounded">
                                  <div className="text-xs text-muted-foreground">rx (Strong Axis)</div>
                                  <div className="text-sm font-semibold">{structuralProperties.radiusOfGyrationX.toFixed(2)} cm</div>
                                </div>
                                <div className="text-center p-2 bg-muted/50 rounded">
                                  <div className="text-xs text-muted-foreground">ry (Weak Axis)</div>
                                  <div className="text-sm font-semibold">{structuralProperties.radiusOfGyrationY.toFixed(2)} cm</div>
                                </div>
                              </div>

                              {/* Additional Properties */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-2 bg-muted/50 rounded">
                                  <div className="text-xs text-muted-foreground">Perimeter</div>
                                  <div className="text-sm font-semibold">{structuralProperties.perimeter.toFixed(2)} cm</div>
                                </div>
                                <div className="text-center p-2 bg-muted/50 rounded">
                                  <div className="text-xs text-muted-foreground">Weight/Length</div>
                                  <div className="text-sm font-semibold">{structuralProperties.weight.toFixed(3)} kg/m</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Material Info */}
                      {selectedMaterial && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full ${selectedMaterial.color}`}></div>
                              <span className="text-sm font-medium">{selectedMaterial.name}</span>
                            </div>
                            <Badge variant="secondary">{selectedMaterial.density} g/cm³</Badge>
                          </div>
                          
                          {/* Temperature Effects Display */}
                          {useTemperatureEffects && structuralProperties?.adjustedDensity && (
                            <div className="text-xs text-muted-foreground space-y-1">
                              <div className="flex justify-between">
                                <span>Operating Temperature:</span>
                                <span className="font-medium">{operatingTemperature}°C</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Adjusted Density:</span>
                                <span className="font-medium">{structuralProperties.adjustedDensity.toFixed(4)} g/cm³</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Density Change:</span>
                                <span className={`font-medium ${
                                  structuralProperties.adjustedDensity > selectedMaterial.density 
                                    ? 'text-red-500' 
                                    : 'text-blue-500'
                                }`}>
                                  {((structuralProperties.adjustedDensity - selectedMaterial.density) / selectedMaterial.density * 100).toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-3 pt-4">
                        <Button onClick={saveCalculation} variant="outline" className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save
                        </Button>
                        <Button onClick={shareCalculation} variant="outline" className="flex items-center gap-2">
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                        <Button onClick={exportCalculation} variant="outline" className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              // Mobile Layout - Stacked
              <div className="space-y-6">
                {/* Profile Selection */}
                <Card className="backdrop-blur-sm bg-card/90 border-primary/10 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Profile Selection</CardTitle>
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

                {/* Material Selection */}
                <Card className="backdrop-blur-sm bg-card/90 border-primary/10 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Material Selection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MaterialSelector material={material} setMaterial={setMaterial} grade={grade} setGrade={setGrade} />
                  </CardContent>
                </Card>

                {/* Dimensions */}
                <Card className="backdrop-blur-sm bg-card/90 border-primary/10 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Dimensions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Unit Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="length-unit">Length Unit</Label>
                        <Select value={lengthUnit} onValueChange={setLengthUnit}>
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
                        <Select value={weightUnit} onValueChange={setWeightUnit}>
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

                    {/* Length Input */}
                    <div>
                      <Label htmlFor="length">Length</Label>
                      <Input
                        id="length"
                        type="number"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="mt-1"
                        step="0.1"
                      />
                    </div>

                    {/* Temperature Controls */}
                    <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="temperature-effects"
                          checked={useTemperatureEffects}
                          onChange={(e) => setUseTemperatureEffects(e.target.checked)}
                          className="rounded"
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
                            className="mt-1"
                            step="1"
                            placeholder="20"
                          />
                          <p className="text-xs text-muted-foreground">
                            Reference temperature: 20°C. Temperature affects material density.
                          </p>
                        </div>
                      )}
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
                  </CardContent>
                </Card>

                {/* Results */}
                <Card className="backdrop-blur-sm bg-card/90 border-primary/10 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Enhanced Results Display */}
                    <div className="text-center space-y-2 py-4">
                      <div className="text-4xl font-bold text-primary animate-in fade-in-50 duration-500">
                        {weight > 0 ? weight.toFixed(4) : "0.0000"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {WEIGHT_UNITS[weightUnit as keyof typeof WEIGHT_UNITS].name}
                      </div>
                      
                      {/* Primary Properties Grid */}
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Cross-sectional Area</div>
                          <div className="text-lg font-semibold">{crossSectionalArea.toFixed(4)} cm²</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Volume</div>
                          <div className="text-lg font-semibold">{volume.toFixed(4)} cm³</div>
                        </div>
                      </div>

                      {/* Enhanced Structural Properties */}
                      {structuralProperties && (
                        <div className="mt-6 space-y-4">
                          <Separator />
                          <div className="text-left">
                            <h4 className="text-sm font-medium mb-3 text-center">Structural Properties</h4>
                            
                            {/* Moment of Inertia */}
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="text-center p-2 bg-muted/50 rounded">
                                <div className="text-xs text-muted-foreground">Ix (Strong Axis)</div>
                                <div className="text-sm font-semibold">{structuralProperties.momentOfInertiaX.toFixed(1)} cm⁴</div>
                              </div>
                              <div className="text-center p-2 bg-muted/50 rounded">
                                <div className="text-xs text-muted-foreground">Iy (Weak Axis)</div>
                                <div className="text-sm font-semibold">{structuralProperties.momentOfInertiaY.toFixed(1)} cm⁴</div>
                              </div>
                            </div>

                            {/* Section Modulus */}
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="text-center p-2 bg-muted/50 rounded">
                                <div className="text-xs text-muted-foreground">Sx (Strong Axis)</div>
                                <div className="text-sm font-semibold">{structuralProperties.sectionModulusX.toFixed(1)} cm³</div>
                              </div>
                              <div className="text-center p-2 bg-muted/50 rounded">
                                <div className="text-xs text-muted-foreground">Sy (Weak Axis)</div>
                                <div className="text-sm font-semibold">{structuralProperties.sectionModulusY.toFixed(1)} cm³</div>
                              </div>
                            </div>

                            {/* Radius of Gyration */}
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="text-center p-2 bg-muted/50 rounded">
                                <div className="text-xs text-muted-foreground">rx (Strong Axis)</div>
                                <div className="text-sm font-semibold">{structuralProperties.radiusOfGyrationX.toFixed(2)} cm</div>
                              </div>
                              <div className="text-center p-2 bg-muted/50 rounded">
                                <div className="text-xs text-muted-foreground">ry (Weak Axis)</div>
                                <div className="text-sm font-semibold">{structuralProperties.radiusOfGyrationY.toFixed(2)} cm</div>
                              </div>
                            </div>

                            {/* Additional Properties */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-2 bg-muted/50 rounded">
                                <div className="text-xs text-muted-foreground">Perimeter</div>
                                <div className="text-sm font-semibold">{structuralProperties.perimeter.toFixed(2)} cm</div>
                              </div>
                              <div className="text-center p-2 bg-muted/50 rounded">
                                <div className="text-xs text-muted-foreground">Weight/Length</div>
                                <div className="text-sm font-semibold">{structuralProperties.weight.toFixed(3)} kg/m</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Material Info */}
                    {selectedMaterial && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${selectedMaterial.color}`}></div>
                            <span className="text-sm font-medium">{selectedMaterial.name}</span>
                          </div>
                          <Badge variant="secondary">{selectedMaterial.density} g/cm³</Badge>
                        </div>
                        
                        {/* Temperature Effects Display */}
                        {useTemperatureEffects && structuralProperties?.adjustedDensity && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>Operating Temperature:</span>
                              <span className="font-medium">{operatingTemperature}°C</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Adjusted Density:</span>
                              <span className="font-medium">{structuralProperties.adjustedDensity.toFixed(4)} g/cm³</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Density Change:</span>
                              <span className={`font-medium ${
                                structuralProperties.adjustedDensity > selectedMaterial.density 
                                  ? 'text-red-500' 
                                  : 'text-blue-500'
                              }`}>
                                {((structuralProperties.adjustedDensity - selectedMaterial.density) / selectedMaterial.density * 100).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3 pt-4">
                      <Button onClick={saveCalculation} variant="outline" className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                      <Button onClick={shareCalculation} variant="outline" className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                      <Button onClick={exportCalculation} variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
