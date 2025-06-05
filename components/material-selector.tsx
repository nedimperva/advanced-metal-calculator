"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Info, Clock, Star } from "lucide-react"
import { MATERIALS } from "@/lib/metal-data"
import type { MaterialGrade } from "@/lib/metal-data"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useUserPreferences } from "@/hooks/use-user-preferences"

interface MaterialSelectorProps {
  material: string
  setMaterial: (material: string) => void
  grade: string
  setGrade: (grade: string) => void
}

export default function MaterialSelector({ material, setMaterial, grade, setGrade }: MaterialSelectorProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { trackMaterial, getSuggestions } = useUserPreferences()
  const suggestions = getSuggestions()

  const handleMaterialChange = (newMaterial: string) => {
    setMaterial(newMaterial)
    // Select first grade in the new material, or most recent if available
    const materialData = MATERIALS[newMaterial as keyof typeof MATERIALS]
    if (materialData && materialData.grades) {
      const recentGrades = suggestions.getGrades(newMaterial)
      const firstGrade = recentGrades.length > 0 ? recentGrades[0] : Object.keys(materialData.grades)[0]
      setGrade(firstGrade)
    }
  }

  const handleGradeChange = (newGrade: string) => {
    setGrade(newGrade)
    // Track the selection
    trackMaterial(material, newGrade)
  }

  // Get current selected material data
  const selectedMaterialData = MATERIALS[material as keyof typeof MATERIALS]?.grades[
    grade as keyof (typeof MATERIALS)[keyof typeof MATERIALS]["grades"]
  ] as MaterialGrade | undefined

  // Cost indicators
  const getCostIndicator = (cost: number) => {
    const indicators = ['$', '$$', '$$$', '$$$$', '$$$$$']
    return indicators[cost - 1] || '$'
  }

  // Availability color coding
  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'fair': return 'bg-yellow-500'
      case 'limited': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const MaterialPropertiesModal = () => {
    if (!selectedMaterialData) return null

    return (
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${selectedMaterialData.color}`} />
            {selectedMaterialData.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Key Properties Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">Density</div>
              <div className="text-sm font-semibold">{selectedMaterialData.density} g/cm³</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">Yield Strength</div>
              <div className="text-sm font-semibold">{selectedMaterialData.yieldStrength} MPa</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">Elastic Modulus</div>
              <div className="text-sm font-semibold">{selectedMaterialData.elasticModulus} GPa</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">Melting Point</div>
              <div className="text-sm font-semibold">{selectedMaterialData.meltingPoint}°C</div>
            </div>
          </div>

          <Separator />
          
          {/* Mechanical Properties */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">MECHANICAL PROPERTIES</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Tensile:</span>
                <div className="font-medium">{selectedMaterialData.tensileStrength} MPa</div>
              </div>
              <div>
                <span className="text-muted-foreground">Poisson:</span>
                <div className="font-medium">{selectedMaterialData.poissonRatio}</div>
              </div>
              {selectedMaterialData.hardness && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Hardness:</span>
                  <div className="font-medium">{selectedMaterialData.hardness}</div>
                </div>
              )}
            </div>
          </div>

          {/* Thermal Properties */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">THERMAL PROPERTIES</h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Expansion:</span>
                <div className="font-medium">{selectedMaterialData.thermalExpansion} × 10⁻⁶/°C</div>
              </div>
              <div>
                <span className="text-muted-foreground">Conductivity:</span>
                <div className="font-medium">{selectedMaterialData.thermalConductivity} W/m·K</div>
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">TYPICAL APPLICATIONS</h4>
            <div className="flex flex-wrap gap-1">
              {selectedMaterialData.applications.slice(0, 6).map((app, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {app}
                </Badge>
              ))}
              {selectedMaterialData.applications.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedMaterialData.applications.length - 6} more
                </Badge>
              )}
            </div>
          </div>

          {/* Standards */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">STANDARDS</h4>
            <div className="flex flex-wrap gap-1">
              {selectedMaterialData.standards.map((standard, index) => (
                <Badge key={index} variant="outline" className="text-xs font-mono">
                  {standard}
                </Badge>
              ))}
            </div>
          </div>

          {/* Cost and Availability */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-xs">
              <span className="text-muted-foreground">Cost: </span>
              <span className="font-medium">{getCostIndicator(selectedMaterialData.relativeCost)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Availability:</span>
              <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(selectedMaterialData.availability)}`} />
              <span className="font-medium capitalize">{selectedMaterialData.availability}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Simplified Material Type Selection for Mobile */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Material Type</div>
          <Select value={material} onValueChange={handleMaterialChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MATERIALS).map(([key, materialType]) => (
                <SelectItem key={key} value={key}>
                  {materialType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Simplified Grade Selection for Mobile */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Grade</div>
            {selectedMaterialData && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Info className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <MaterialPropertiesModal />
              </Dialog>
            )}
          </div>
          <Select value={grade} onValueChange={handleGradeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* Recent grades first if available */}
              {suggestions.getGrades(material).length > 0 && (
                <>
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Recent
                  </div>
                  {suggestions.getGrades(material).map((gradeKey) => {
                    const gradeData = MATERIALS[material as keyof typeof MATERIALS]?.grades[gradeKey as keyof (typeof MATERIALS)[keyof typeof MATERIALS]["grades"]] as MaterialGrade
                    if (!gradeData) return null
                    return (
                      <SelectItem key={`recent-${gradeKey}`} value={gradeKey}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${gradeData.color}`} />
                          <span>{gradeData.name}</span>
                          <Clock className="h-3 w-3 text-muted-foreground ml-auto" />
                        </div>
                      </SelectItem>
                    )
                  })}
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">All Options</div>
                </>
              )}
              {Object.entries(MATERIALS[material as keyof typeof MATERIALS]?.grades || {}).map(([key, gradeData]) => {
                // Skip if already shown in recent
                if (suggestions.getGrades(material).includes(key)) return null
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${gradeData.color}`} />
                      <span>{gradeData.name}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Simple Material Summary for Mobile */}
        {selectedMaterialData && (
          <Card className="bg-muted/30 border-primary/10">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedMaterialData.color}`} />
                    <span className="text-sm font-medium">{selectedMaterialData.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedMaterialData.density} g/cm³ • {selectedMaterialData.yieldStrength} MPa
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium">{getCostIndicator(selectedMaterialData.relativeCost)}</div>
                  <div className={`w-2 h-2 rounded-full ml-auto mt-1 ${getAvailabilityColor(selectedMaterialData.availability)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Desktop version remains the same
  return (
    <div className="space-y-4">
      {/* Recent Materials First */}
      {suggestions.materials.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Recent Materials
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {suggestions.materials.map((key) => {
              const materialType = MATERIALS[key as keyof typeof MATERIALS]
              if (!materialType) return null
              return (
                <div
                  key={`recent-${key}`}
                  className={`border rounded-lg p-2 cursor-pointer transition-all duration-200 hover-lift ${
                    material === key
                      ? "selected-item-strong"
                      : "hover:bg-muted border-border hover:border-primary/20 hover:shadow-sm recent-item"
                  }`}
                  onClick={() => handleMaterialChange(key)}
                >
                  <div className="text-sm font-medium text-center">{materialType.name}</div>
                  <div className="text-xs text-center mt-1 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Recent</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Material Type Selection - Enhanced Grid */}
      <div className="space-y-2">
        {suggestions.materials.length > 0 && (
          <div className="text-xs font-medium text-muted-foreground">All Materials</div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(MATERIALS).map(([key, materialType]) => {
            // Skip if already shown in recent
            if (suggestions.materials.includes(key)) return null
            return (
              <div
                key={key}
                className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 hover-lift ${
                  material === key
                    ? "selected-item-strong"
                    : "hover:bg-muted border-border hover:border-primary/20 hover:shadow-sm"
                }`}
                onClick={() => handleMaterialChange(key)}
              >
                <div className="text-sm font-medium text-center">{materialType.name}</div>
                <div className="text-xs text-muted-foreground text-center mt-1">
                  {Object.keys(materialType.grades).length} grades
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Material Grade Selection - Enhanced Dropdown */}
      <div>
        <Select value={grade} onValueChange={handleGradeChange}>
          <SelectTrigger className="h-auto py-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-w-md">
            {/* Recent grades first if available */}
            {suggestions.getGrades(material).length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Recent
                </div>
                {suggestions.getGrades(material).map((gradeKey) => {
                  const gradeData = MATERIALS[material as keyof typeof MATERIALS]?.grades[gradeKey as keyof (typeof MATERIALS)[keyof typeof MATERIALS]["grades"]] as MaterialGrade
                  if (!gradeData) return null
                  return (
                    <SelectItem key={`recent-${gradeKey}`} value={gradeKey} className="py-3">
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${gradeData.color}`} />
                          <span className="font-medium">{gradeData.name}</span>
                          <Clock className="h-3 w-3 text-muted-foreground ml-auto" />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{gradeData.density} g/cm³</span>
                          <span>{gradeData.yieldStrength} MPa</span>
                          <span className="font-medium">{getCostIndicator(gradeData.relativeCost)}</span>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">All Options</div>
              </>
            )}
            {Object.entries(MATERIALS[material as keyof typeof MATERIALS]?.grades || {}).map(([key, gradeData]) => {
              // Skip if already shown in recent
              if (suggestions.getGrades(material).includes(key)) return null
              return (
                <SelectItem key={key} value={key} className="py-3">
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${gradeData.color}`} />
                      <span className="font-medium">{gradeData.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{gradeData.density} g/cm³</span>
                      <span>{gradeData.yieldStrength} MPa</span>
                      <span className="font-medium">{getCostIndicator(gradeData.relativeCost)}</span>
                    </div>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Simple Material Summary for Desktop (same as mobile) */}
      {selectedMaterialData && (
        <Card className="bg-muted/30 border-primary/10">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${selectedMaterialData.color}`} />
                  <span className="text-sm font-medium">{selectedMaterialData.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedMaterialData.density} g/cm³ • {selectedMaterialData.yieldStrength} MPa
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <MaterialPropertiesModal />
                </Dialog>
                <div className="text-right">
                  <div className="text-xs font-medium">{getCostIndicator(selectedMaterialData.relativeCost)}</div>
                  <div className={`w-2 h-2 rounded-full ml-auto mt-1 ${getAvailabilityColor(selectedMaterialData.availability)}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
