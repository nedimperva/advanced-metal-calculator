import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Calculator, FunctionSquare, Info, CheckCircle } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ProfileData, MaterialData, StructuralProperties } from '@/lib/types'
import { ProfileDiagram } from '@/components/profile-diagram'

interface CalculationStep {
  id: string
  title: string
  description: string
  formula: string
  variables: Record<string, { value: number | string, unit: string, description: string }>
  result: { value: number | string, unit: string }
  notes?: string[]
}

interface CalculationBreakdownProps {
  profileData: ProfileData
  materialData: MaterialData
  dimensions: Record<string, string>
  length: string
  structuralProperties: StructuralProperties
  weight: number
  weightUnit: string
  temperatureEffects?: {
    originalDensity: number
    adjustedDensity: number
    temperature: number
  }
}

// Helper function to determine profile type from name
function getProfileTypeFromName(name: string): string {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('hea') || lowerName.includes('heb') || lowerName.includes('hem') || 
      lowerName.includes('ipe') || lowerName.includes('ipn')) return 'ibeam'
  if (lowerName.includes('upn') || lowerName.includes('channel')) return 'channel'
  if (lowerName.includes('rhs') || lowerName.includes('rectangular')) return 'rhs'
  if (lowerName.includes('shs') || lowerName.includes('square')) return 'shs'
  if (lowerName.includes('chs') || lowerName.includes('circular')) return 'chs'
  if (lowerName.includes('equal angle')) return 'equal_angle'
  if (lowerName.includes('unequal angle')) return 'unequal_angle'
  if (lowerName.includes('round')) return 'round'
  if (lowerName.includes('flat')) return 'flat'
  return 'generic'
}

export function CalculationBreakdown({
  profileData,
  materialData,
  dimensions,
  length,
  structuralProperties,
  weight,
  weightUnit,
  temperatureEffects
}: CalculationBreakdownProps) {
  const [expandedSteps, setExpandedSteps] = React.useState<Set<string>>(new Set(['step1']))
  const [showAllSteps, setShowAllSteps] = React.useState(false)

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps)
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId)
    } else {
      newExpanded.add(stepId)
    }
    setExpandedSteps(newExpanded)
  }

  const toggleAllSteps = () => {
    if (showAllSteps) {
      setExpandedSteps(new Set())
      setShowAllSteps(false)
    } else {
      setExpandedSteps(new Set(calculationSteps.map(step => step.id)))
      setShowAllSteps(true)
    }
  }

  // Generate calculation steps based on the current calculation
  const calculationSteps: CalculationStep[] = [
    {
      id: 'step1',
      title: 'Cross-Sectional Area Calculation',
      description: 'Calculate the cross-sectional area of the profile based on its dimensions',
      formula: 'A = f(dimensions)',
      variables: {
        ...Object.fromEntries(
          Object.entries(dimensions).map(([key, value]) => [
            key,
            {
              value: parseFloat(value) || 0,
              unit: 'mm',
              description: `Profile ${key.charAt(0).toUpperCase() + key.slice(1)}`
            }
          ])
        )
      },
      result: {
        value: structuralProperties.area.toFixed(4),
        unit: 'cm²'
      },
      notes: [
        'Area calculation varies by profile type',
        'Standard formulas based on structural engineering principles'
      ]
    },
    {
      id: 'step2',
      title: 'Volume Calculation',
      description: 'Calculate the total volume by multiplying area by length',
      formula: 'V = A × L',
      variables: {
        area: {
          value: structuralProperties.area.toFixed(4),
          unit: 'cm²',
          description: 'Cross-sectional area'
        },
        length: {
          value: parseFloat(length) / 10, // Convert mm to cm
          unit: 'cm',
          description: 'Profile length'
        }
      },
      result: {
        value: (structuralProperties.area * parseFloat(length) / 10).toFixed(4),
        unit: 'cm³'
      }
    },
    {
      id: 'step3',
      title: 'Weight Calculation',
      description: 'Calculate weight using material density and volume',
      formula: temperatureEffects ? 'W = V × ρ_adjusted' : 'W = V × ρ',
      variables: {
        volume: {
          value: (structuralProperties.area * parseFloat(length) / 10).toFixed(4),
          unit: 'cm³',
          description: 'Total volume'
        },
        density: {
          value: temperatureEffects ? temperatureEffects.adjustedDensity.toFixed(3) : materialData.density.toFixed(3),
          unit: 'g/cm³',
          description: temperatureEffects ? 'Temperature-adjusted density' : 'Material density'
        }
      },
      result: {
        value: weight.toFixed(4),
        unit: weightUnit
      },
      notes: temperatureEffects ? [
        `Original density: ${temperatureEffects.originalDensity.toFixed(3)} g/cm³`,
        `Adjusted for temperature: ${temperatureEffects.temperature}°C`,
        `Density change: ${(((temperatureEffects.adjustedDensity - temperatureEffects.originalDensity) / temperatureEffects.originalDensity) * 100).toFixed(2)}%`
      ] : undefined
    },
    {
      id: 'step4',
      title: 'Moment of Inertia',
      description: 'Calculate second moment of area for bending analysis',
      formula: 'I = ∫y²dA (numerical integration)',
      variables: {
        Ix: {
          value: structuralProperties.momentOfInertiaX.toFixed(2),
          unit: 'cm⁴',
          description: 'Moment of inertia about X-axis'
        },
        Iy: {
          value: structuralProperties.momentOfInertiaY.toFixed(2),
          unit: 'cm⁴',
          description: 'Moment of inertia about Y-axis'
        }
      },
      result: {
        value: `Ix: ${structuralProperties.momentOfInertiaX.toFixed(2)}, Iy: ${structuralProperties.momentOfInertiaY.toFixed(2)}`,
        unit: 'cm⁴'
      },
      notes: [
        'Critical for beam deflection calculations',
        'Higher values indicate greater resistance to bending'
      ]
    },
    {
      id: 'step5',
      title: 'Section Modulus',
      description: 'Calculate section modulus for stress analysis',
      formula: 'S = I / c (where c is distance to extreme fiber)',
      variables: {
        Sx: {
          value: structuralProperties.sectionModulusX.toFixed(2),
          unit: 'cm³',
          description: 'Section modulus about X-axis'
        },
        Sy: {
          value: structuralProperties.sectionModulusY.toFixed(2),
          unit: 'cm³',
          description: 'Section modulus about Y-axis'
        }
      },
      result: {
        value: `Sx: ${structuralProperties.sectionModulusX.toFixed(2)}, Sy: ${structuralProperties.sectionModulusY.toFixed(2)}`,
        unit: 'cm³'
      },
      notes: [
        'Used in bending stress calculations: σ = M/S',
        'Larger values indicate better bending capacity'
      ]
    }
  ]

  return (
    <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Calculation Breakdown
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAllSteps}
            className="text-xs"
          >
            {showAllSteps ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FunctionSquare className="h-4 w-4" />
          <span>Step-by-step calculation details</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Profile and Material Summary with Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground">Profile</div>
            <div className="font-medium">{profileData.name}</div>
            <div className="text-xs text-green-600">Standard Engineering Profile</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Material</div>
            <div className="font-medium">{materialData.name}</div>
            <div className="text-xs text-blue-600">Yield: {materialData.yieldStrength} MPa</div>
          </div>
          <div className="lg:col-span-1">
            <ProfileDiagram 
              profileType={getProfileTypeFromName(profileData.name)}
              dimensions={dimensions}
              className="h-24"
            />
          </div>
        </div>

        {/* Calculation Steps */}
        <div className="space-y-2">
          {calculationSteps.map((step, index) => (
            <Collapsible
              key={step.id}
              open={expandedSteps.has(step.id)}
              onOpenChange={() => toggleStep(step.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="min-w-[2rem] justify-center">
                      {index + 1}
                    </Badge>
                    <div className="text-left">
                      <div className="font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {expandedSteps.has(step.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pb-3">
                <div className="space-y-3 mt-3 border-l-2 border-primary/20 pl-4">
                                      {/* Enhanced Formula Display */}
                    <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <div className="text-xs text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1 font-medium">
                        <FunctionSquare className="h-3 w-3" />
                        Engineering Formula
                      </div>
                      <code className="text-lg font-mono font-semibold text-blue-900 dark:text-blue-100 block mb-2">
                        {step.formula}
                      </code>
                      {step.id === 'step1' && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 bg-white/60 dark:bg-blue-950/20 p-2 rounded mt-2">
                          <strong>Cross-sectional area</strong> is fundamental in structural analysis - it determines:
                          <br />• Axial load capacity (compression/tension)
                          <br />• Material weight per unit length
                          <br />• Base value for other geometric properties
                        </div>
                      )}
                      {step.id === 'step4' && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 bg-white/60 dark:bg-blue-950/20 p-2 rounded mt-2">
                          <strong>Second moment of area</strong> measures how area is distributed relative to the neutral axis:
                          <br />• Higher I = greater bending stiffness
                          <br />• Used in beam deflection calculations: δ = (wL⁴)/(8EI)
                          <br />• Critical for buckling analysis
                        </div>
                      )}
                    </div>

                                      {/* Enhanced Variables Section */}
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                        <Calculator className="h-3 w-3" />
                        Variables & Parameters
                      </div>
                      <div className="grid gap-2">
                        {Object.entries(step.variables).map(([key, variable]) => (
                          <div key={key} className="flex justify-between items-center text-sm bg-gradient-to-r from-background/60 to-background/30 p-3 rounded-lg border border-border/30 hover:border-border/60 transition-colors">
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">
                                {key}
                              </code>
                              <span className="text-muted-foreground">{variable.description}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-foreground">{variable.value}</span>
                              <span className="text-muted-foreground ml-1 text-xs">{variable.unit}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                                      {/* Enhanced Result Display */}
                    <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-lg border border-green-200/50 dark:border-green-800/50">
                      <div className="text-xs text-green-700 dark:text-green-300 mb-2 flex items-center gap-1 font-medium">
                        <CheckCircle className="h-3 w-3" />
                        Calculated Result
                      </div>
                      <div className="font-bold text-lg text-green-900 dark:text-green-100">
                        {step.result.value} {step.result.unit}
                      </div>
                      {step.id === 'step1' && structuralProperties.area > 0 && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Weight per meter: ~{structuralProperties.weight.toFixed(2)} kg/m
                        </div>
                      )}
                      {step.id === 'step3' && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Density factor: {temperatureEffects ? 'Temperature-adjusted' : 'Standard conditions (20°C)'}
                        </div>
                      )}
                    </div>

                  {/* Notes */}
                  {step.notes && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {step.notes.map((note, noteIndex) => (
                            <li key={noteIndex} className="text-xs">{note}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 