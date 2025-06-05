"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MATERIALS } from "@/lib/metal-data"
import type { MaterialGrade } from "@/lib/metal-data"

interface MaterialSelectorProps {
  material: string
  setMaterial: (material: string) => void
  grade: string
  setGrade: (grade: string) => void
}

export default function MaterialSelector({ material, setMaterial, grade, setGrade }: MaterialSelectorProps) {
  const handleMaterialChange = (newMaterial: string) => {
    setMaterial(newMaterial)
    // Select first grade in the new material
    const materialData = MATERIALS[newMaterial as keyof typeof MATERIALS]
    if (materialData && materialData.grades) {
      const firstGrade = Object.keys(materialData.grades)[0]
      setGrade(firstGrade)
    }
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

  return (
    <div className="space-y-4">
      {/* Material Type Selection - Enhanced Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {Object.entries(MATERIALS).map(([key, materialType]) => (
            <div
              key={key}
              className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                material === key
                  ? "bg-primary/10 border-primary/30 text-primary-foreground shadow-sm ring-2 ring-primary/20"
                  : "hover:bg-muted border-border hover:border-primary/20 hover:shadow-sm"
              }`}
              onClick={() => handleMaterialChange(key)}
            >
              <div className="text-sm font-medium text-center">{materialType.name}</div>
              <div className="text-xs text-muted-foreground text-center mt-1">
                {Object.keys(materialType.grades).length} grades
              </div>
            </div>
        ))}
      </div>

      {/* Material Grade Selection - Enhanced Dropdown */}
      <div>
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger className="h-auto py-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-w-md">
            {Object.entries(MATERIALS[material as keyof typeof MATERIALS]?.grades || {}).map(([key, gradeData]) => (
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
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Enhanced Material Properties Display */}
      {selectedMaterialData && (
        <Card className="bg-muted/30 border-primary/10">
          <CardContent className="p-4 space-y-4">
            {/* Material Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${selectedMaterialData.color}`} />
                <h3 className="font-semibold">{selectedMaterialData.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getCostIndicator(selectedMaterialData.relativeCost)}
                </Badge>
                <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(selectedMaterialData.availability)}`} />
              </div>
            </div>

            {/* Key Properties Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-background/50 rounded">
                <div className="text-xs text-muted-foreground">Density</div>
                <div className="text-sm font-semibold">{selectedMaterialData.density} g/cm³</div>
              </div>
              <div className="text-center p-2 bg-background/50 rounded">
                <div className="text-xs text-muted-foreground">Yield Strength</div>
                <div className="text-sm font-semibold">{selectedMaterialData.yieldStrength} MPa</div>
              </div>
              <div className="text-center p-2 bg-background/50 rounded">
                <div className="text-xs text-muted-foreground">Elastic Modulus</div>
                <div className="text-sm font-semibold">{selectedMaterialData.elasticModulus} GPa</div>
              </div>
              <div className="text-center p-2 bg-background/50 rounded">
                <div className="text-xs text-muted-foreground">Melting Point</div>
                <div className="text-sm font-semibold">{selectedMaterialData.meltingPoint}°C</div>
              </div>
            </div>

            {/* Detailed Properties - Collapsible */}
            <Separator />
            
            {/* Mechanical Properties */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">MECHANICAL PROPERTIES</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Tensile:</span>
                  <div className="font-medium">{selectedMaterialData.tensileStrength} MPa</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Poisson:</span>
                  <div className="font-medium">{selectedMaterialData.poissonRatio}</div>
                </div>
                {selectedMaterialData.hardness && (
                  <div>
                    <span className="text-muted-foreground">Hardness:</span>
                    <div className="font-medium">{selectedMaterialData.hardness}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Thermal Properties */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">THERMAL PROPERTIES</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
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
                {selectedMaterialData.applications.slice(0, 3).map((app, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {app}
                  </Badge>
                ))}
                {selectedMaterialData.applications.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedMaterialData.applications.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Standards */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">STANDARDS</h4>
              <div className="flex flex-wrap gap-1">
                {selectedMaterialData.standards.slice(0, 2).map((standard, index) => (
                  <Badge key={index} variant="outline" className="text-xs font-mono">
                    {standard}
                  </Badge>
                ))}
                {selectedMaterialData.standards.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedMaterialData.standards.length - 2}
                  </Badge>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Availability:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(selectedMaterialData.availability)}`} />
                <span className="font-medium capitalize">{selectedMaterialData.availability}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
