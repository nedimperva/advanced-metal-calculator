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
import { isProfileCompatible, getMaterialCompatibilityInfo } from "@/lib/material-profile-compatibility"
import { useI18n } from "@/contexts/i18n-context"
import { getMaterialCategoryName, getMaterialGradeName } from "@/lib/i18n"

interface MaterialSelectorProps {
  material: string
  setMaterial: (material: string) => void
  grade: string
  setGrade: (grade: string) => void
  profileType?: string // Optional profile type for showing compatibility info
}

export default function MaterialSelector({ material, setMaterial, grade, setGrade, profileType }: MaterialSelectorProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { trackMaterial, getSuggestions } = useUserPreferences()
  const suggestions = getSuggestions()
  const { t, language } = useI18n()

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
      case 'excellent': return 'bg-accent'
      case 'good': return 'bg-accent/70'
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
              <div className="text-xs text-muted-foreground">{t('density')}</div>
              <div className="text-sm font-semibold">{selectedMaterialData.density} g/cm³</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">{t('yieldStrength')}</div>
              <div className="text-sm font-semibold">{selectedMaterialData.yieldStrength} MPa</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">{t('elasticModulus')}</div>
              <div className="text-sm font-semibold">{selectedMaterialData.elasticModulus} GPa</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">{t('meltingPoint')}</div>
              <div className="text-sm font-semibold">{selectedMaterialData.meltingPoint}°C</div>
            </div>
          </div>

          <Separator />
          
          {/* Mechanical Properties */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">{t('mechanicalProperties').toUpperCase()}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">{t('tensile')}:</span>
                <div className="font-medium">{selectedMaterialData.tensileStrength} MPa</div>
              </div>
              <div>
                <span className="text-muted-foreground">{t('poisson')}:</span>
                <div className="font-medium">{selectedMaterialData.poissonRatio}</div>
              </div>
              {selectedMaterialData.hardness && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">{t('hardness')}:</span>
                  <div className="font-medium">{selectedMaterialData.hardness}</div>
                </div>
              )}
            </div>
          </div>

          {/* Thermal Properties */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">{t('thermalProperties').toUpperCase()}</h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">{t('expansion')}:</span>
                <div className="font-medium">{selectedMaterialData.thermalExpansion} × 10⁻⁶/°C</div>
              </div>
              <div>
                <span className="text-muted-foreground">{t('conductivity')}:</span>
                <div className="font-medium">{selectedMaterialData.thermalConductivity} W/m·K</div>
              </div>
            </div>
          </div>

          {/* Applications */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">{t('typicalApplications').toUpperCase()}</h4>
            <div className="flex flex-wrap gap-1">
              {selectedMaterialData.applications.slice(0, 6).map((app, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {app}
                </Badge>
              ))}
              {selectedMaterialData.applications.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedMaterialData.applications.length - 6} {t('more')}
                </Badge>
              )}
            </div>
          </div>

          {/* Standards */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">{t('standards').toUpperCase()}</h4>
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
              <span className="text-muted-foreground">{t('cost')}: </span>
              <span className="font-medium">{getCostIndicator(selectedMaterialData.relativeCost)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{t('availability')}:</span>
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
          <div className="text-sm font-medium">{t('materialType')}</div>
          <Select value={material} onValueChange={handleMaterialChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MATERIALS).map(([key, materialType]) => (
                <SelectItem key={key} value={key}>
                  {getMaterialCategoryName(language, key)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Simplified Grade Selection for Mobile */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{t('grade')}</div>
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
                    {t('recent')}
                  </div>
                  {suggestions.getGrades(material).map((gradeKey) => {
                    const gradeData = MATERIALS[material as keyof typeof MATERIALS]?.grades[gradeKey as keyof (typeof MATERIALS)[keyof typeof MATERIALS]["grades"]] as MaterialGrade
                    if (!gradeData) return null
                    return (
                      <SelectItem key={`recent-${gradeKey}`} value={gradeKey}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${gradeData.color}`} />
                          <span>{getMaterialGradeName(language, material, gradeKey)}</span>
                          <Clock className="h-3 w-3 text-muted-foreground ml-auto" />
                        </div>
                      </SelectItem>
                    )
                  })}
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">{t('allOptions')}</div>
                </>
              )}
              {Object.entries(MATERIALS[material as keyof typeof MATERIALS]?.grades || {}).map(([key, gradeData]) => {
                // Skip if already shown in recent
                if (suggestions.getGrades(material).includes(key)) return null
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${gradeData.color}`} />
                      <span>{getMaterialGradeName(language, material, key)}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Simple Material Summary for Mobile */}
        {selectedMaterialData && (
          <Card className="bg-muted/30 border-accent">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedMaterialData.color}`} />
                    <span className="text-sm font-medium">{getMaterialGradeName(language, material, grade)}</span>
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

  // Desktop version - more compact
  return (
    <div className="space-y-3">
      {/* Material Type Selection - Compact Grid */}
      <div className="grid grid-cols-2 gap-1">
        {Object.entries(MATERIALS).map(([key, materialType]) => {
          return (
            <div
              key={key}
              className={`border rounded-md p-2 cursor-pointer transition-all duration-200 hover-lift ${
                material === key
                  ? "selected-item-strong"
                  : "hover:bg-muted border-border hover:border-accent hover:shadow-sm"
              }`}
              onClick={() => handleMaterialChange(key)}
            >
              <div className="text-xs font-medium text-center">{getMaterialCategoryName(language, key)}</div>
              <div className="text-xs text-muted-foreground text-center">
                {Object.keys(materialType.grades).length} {t('grades')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Material Grade Selection - Compact */}
      <div>
        <Select value={grade} onValueChange={handleGradeChange}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MATERIALS[material as keyof typeof MATERIALS]?.grades || {}).map(([key, gradeData]) => {
              return (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${gradeData.color}`} />
                    <span>{getMaterialGradeName(language, material, key)}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Compact Material Summary */}
      {selectedMaterialData && (
        <div className="bg-muted/30 border border-accent rounded-md p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${selectedMaterialData.color}`} />
              <div>
                <span className="text-xs font-medium">{getMaterialGradeName(language, material, grade)}</span>
                <div className="text-xs text-muted-foreground">
                  {selectedMaterialData.density} g/cm³ • {selectedMaterialData.yieldStrength} MPa
                </div>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Info className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <MaterialPropertiesModal />
            </Dialog>
          </div>
        </div>
      )}
    </div>
  )
}
