import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Calculator, FunctionSquare, Info } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ProfileData, MaterialData, StructuralProperties } from '@/lib/types'

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
        {/* Profile and Material Summary */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground">Profile</div>
            <div className="font-medium">{profileData.name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Material</div>
            <div className="font-medium">{materialData.name}</div>
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
                  {/* Formula */}
                  <div className="bg-background/50 p-3 rounded border">
                    <div className="text-xs text-muted-foreground mb-1">Formula</div>
                    <code className="text-sm font-mono">{step.formula}</code>
                  </div>

                  {/* Variables */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Variables</div>
                    <div className="grid gap-2">
                      {Object.entries(step.variables).map(([key, variable]) => (
                        <div key={key} className="flex justify-between items-center text-sm bg-background/30 p-2 rounded">
                          <span className="text-muted-foreground">{variable.description}:</span>
                          <span className="font-medium">{variable.value} {variable.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Result */}
                  <div className="bg-primary/5 p-3 rounded">
                    <div className="text-xs text-muted-foreground mb-1">Result</div>
                    <div className="font-medium text-primary">
                      {step.result.value} {step.result.unit}
                    </div>
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