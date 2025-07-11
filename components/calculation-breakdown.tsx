import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Calculator, FunctionSquare, Info, CheckCircle } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { ProfileData, MaterialData, StructuralProperties } from '@/lib/types'
import { CrossSectionViewer } from '@/components/profile-diagrams'

interface CalculationStep {
  id: string
  title: string
  description: string
  formula: string
  detailedFormula?: string
  stepByStep?: string[]
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
  materialName?: string
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
  if (lowerName.includes('plate') || lowerName.includes('sheet')) return 'plate'
  return 'generic'
}

// Helper function to get specific area formula based on profile type
function getAreaFormula(profileType: string): { formula: string, detailedFormula: string, stepByStep: string[] } {
  const type = getProfileTypeFromName(profileType)
  
  switch (type) {
    case 'ibeam':
      return {
        formula: 'A = 2×(b×tf) + (h-2×tf)×tw',
        detailedFormula: 'A = Area of both flanges + Area of web',
        stepByStep: [
          '1. Calculate top flange area: b × tf',
          '2. Calculate bottom flange area: b × tf', 
          '3. Calculate web area: (h - 2×tf) × tw',
          '4. Total area: 2×(flange area) + web area'
        ]
      }
    case 'rhs':
      return {
        formula: 'A = h×b - (h-2×t)×(b-2×t)',
        detailedFormula: 'A = Outer rectangle - Inner rectangle',
        stepByStep: [
          '1. Calculate outer rectangle area: h × b',
          '2. Calculate inner rectangle area: (h-2×t) × (b-2×t)',
          '3. Subtract inner from outer to get wall area'
        ]
      }
    case 'shs':
      return {
        formula: 'A = a² - (a-2×t)²',
        detailedFormula: 'A = Outer square - Inner square',
        stepByStep: [
          '1. Calculate outer square area: a²',
          '2. Calculate inner square area: (a-2×t)²',
          '3. Subtract inner from outer to get wall area'
        ]
      }
    case 'round':
      return {
        formula: 'A = π × (d/2)²',
        detailedFormula: 'A = π × r² where r = d/2',
        stepByStep: [
          '1. Calculate radius: r = d/2',
          '2. Calculate area: π × r²',
          '3. Result in mm², convert to cm²'
        ]
      }
    case 'chs':
      return {
        formula: 'A = π × (od²/4 - id²/4)',
        detailedFormula: 'A = π/4 × (od² - id²) where id = od - 2×wt',
        stepByStep: [
          '1. Calculate inner diameter: id = od - 2×wt',
          '2. Calculate outer area: π × (od/2)²',
          '3. Calculate inner area: π × (id/2)²',
          '4. Subtract inner from outer'
        ]
      }
    case 'equal_angle':
      return {
        formula: 'A = 2×a×t - t²',
        detailedFormula: 'A = Two legs minus overlap corner',
        stepByStep: [
          '1. Calculate first leg area: a × t',
          '2. Calculate second leg area: a × t',
          '3. Subtract corner overlap: t²',
          '4. Total: 2×(a×t) - t²'
        ]
      }
    case 'plate':
      return {
        formula: 'A = L × W',
        detailedFormula: 'A = Length × Width',
        stepByStep: [
          '1. Multiply length by width',
          '2. For plates, area equals the face area',
          '3. Result is the cross-sectional area'
        ]
      }
    default:
      return {
        formula: 'A = f(dimensions)',
        detailedFormula: 'Area calculated based on profile geometry',
        stepByStep: ['Complex geometric calculation based on profile shape']
      }
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
  materialName,
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

  // Get specific area calculation details
  const areaDetails = getAreaFormula(profileData.name)
  
  // Calculate intermediate values for step-by-step breakdown
  const lengthInCm = parseFloat(length) / 10 // Convert mm to cm
  const volume = structuralProperties.area * lengthInCm
  const density = temperatureEffects ? temperatureEffects.adjustedDensity : materialData.density
  
  // Generate calculation steps based on the current calculation
  const calculationSteps: CalculationStep[] = [
    {
      id: 'step1',
      title: 'Cross-Sectional Area Calculation',
      description: 'Calculate the cross-sectional area of the profile based on its dimensions',
      formula: areaDetails.formula,
      detailedFormula: areaDetails.detailedFormula,
      stepByStep: areaDetails.stepByStep,
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
        'All dimensions converted from mm to cm for consistency',
        'Standard formulas based on structural engineering principles'
      ]
    },
    {
      id: 'step2',
      title: 'Volume Calculation',
      description: 'Calculate the total volume by multiplying area by length',
      formula: 'V = A × L',
      detailedFormula: 'Volume = Cross-sectional Area × Length',
      stepByStep: [
        '1. Convert length from mm to cm for consistency',
        '2. Multiply area (cm²) by length (cm)',
        '3. Result in cm³'
      ],
      variables: {
        area: {
          value: structuralProperties.area.toFixed(4),
          unit: 'cm²',
          description: 'Cross-sectional area'
        },
        length: {
          value: lengthInCm.toFixed(1),
          unit: 'cm',
          description: 'Profile length'
        }
      },
      result: {
        value: volume.toFixed(4),
        unit: 'cm³'
      },
      notes: [
        'Volume represents the total amount of material',
        'Used directly in weight calculations'
      ]
    },
    {
      id: 'step3',
      title: 'Weight Calculation',
      description: 'Calculate weight using material density and volume',
      formula: temperatureEffects ? 'W = V × ρ_adjusted × Unit_Factor' : 'W = V × ρ × Unit_Factor',
      detailedFormula: temperatureEffects ? 
        'Weight = Volume × Temperature-adjusted Density × Conversion Factor' :
        'Weight = Volume × Material Density × Conversion Factor',
      stepByStep: temperatureEffects ? [
        '1. Apply temperature correction to density',
        `2. Adjusted density = ${density.toFixed(3)} g/cm³`,
        '3. Multiply volume × adjusted density',
        '4. Apply unit conversion factor',
        `5. Final weight in ${weightUnit}`
      ] : [
        '1. Use standard material density at 20°C',
        `2. Density = ${density.toFixed(3)} g/cm³`,
        '3. Multiply volume × density',
        '4. Apply unit conversion factor',
        `5. Final weight in ${weightUnit}`
      ],
      variables: {
        volume: {
          value: volume.toFixed(4),
          unit: 'cm³',
          description: 'Total volume'
        },
        density: {
          value: density.toFixed(3),
          unit: 'g/cm³',
          description: temperatureEffects ? 'Temperature-adjusted density' : 'Material density'
        },
        ...(temperatureEffects ? {
          temperature: {
            value: temperatureEffects.temperature,
            unit: '°C',
            description: 'Operating temperature'
          }
        } : {})
      },
      result: {
        value: weight.toFixed(4),
        unit: weightUnit
      },
      notes: temperatureEffects ? [
        `Original density: ${temperatureEffects.originalDensity.toFixed(3)} g/cm³`,
        `Adjusted for temperature: ${temperatureEffects.temperature}°C`,
        `Density change: ${(((temperatureEffects.adjustedDensity - temperatureEffects.originalDensity) / temperatureEffects.originalDensity) * 100).toFixed(2)}%`,
        'Temperature effects follow linear thermal expansion principles'
      ] : [
        'Standard conditions assumed (20°C)',
        'Density values from material standards',
        'Weight includes full cross-sectional material'
      ]
    },
    {
      id: 'step4',
      title: 'Second Moment of Area (Moment of Inertia)',
      description: 'Calculate second moment of area for bending analysis',
      formula: 'I = ∫y²dA',
      detailedFormula: 'Second moment of area about neutral axis',
      stepByStep: [
        '1. Divide cross-section into simple shapes',
        '2. Calculate centroid location',
        '3. Apply parallel axis theorem: I = Ic + Ad²',
        '4. Sum contributions from all parts',
        '5. Calculate for both X and Y axes'
      ],
      variables: {
        Ix: {
          value: structuralProperties.momentOfInertiaX.toFixed(2),
          unit: 'cm⁴',
          description: 'Moment of inertia about X-axis (horizontal)'
        },
        Iy: {
          value: structuralProperties.momentOfInertiaY.toFixed(2),
          unit: 'cm⁴',
          description: 'Moment of inertia about Y-axis (vertical)'
        }
      },
      result: {
        value: `Ix: ${structuralProperties.momentOfInertiaX.toFixed(2)}, Iy: ${structuralProperties.momentOfInertiaY.toFixed(2)}`,
        unit: 'cm⁴'
      },
      notes: [
        'Critical for beam deflection calculations: δ = (5wL⁴)/(384EI)',
        'Higher values indicate greater resistance to bending',
        'Used in buckling analysis and stress calculations',
        'X-axis typically corresponds to major bending axis'
      ]
    },
    {
      id: 'step5',
      title: 'Section Modulus',
      description: 'Calculate section modulus for stress analysis',
      formula: 'S = I / c',
      detailedFormula: 'Section Modulus = Moment of Inertia / Distance to extreme fiber',
      stepByStep: [
        '1. Determine distance to extreme fiber (c)',
        '2. For symmetric sections: c = height/2',
        '3. Calculate Sx = Ix / cx',
        '4. Calculate Sy = Iy / cy',
        '5. Used in bending stress: σ = M/S'
      ],
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
        'Larger values indicate better bending capacity',
        'Critical for allowable moment calculations',
        'Directly relates to maximum bending stress'
      ]
    },
    {
      id: 'step6',
      title: 'Radius of Gyration',
      description: 'Calculate radius of gyration for buckling analysis',
      formula: 'r = √(I/A)',
      detailedFormula: 'Radius of Gyration = √(Moment of Inertia / Area)',
      stepByStep: [
        '1. Take square root of (I/A)',
        '2. Calculate rx = √(Ix/A)',
        '3. Calculate ry = √(Iy/A)',
        '4. Represents distribution of area relative to axis',
        '5. Used in column buckling calculations'
      ],
      variables: {
        rx: {
          value: structuralProperties.radiusOfGyrationX.toFixed(2),
          unit: 'cm',
          description: 'Radius of gyration about X-axis'
        },
        ry: {
          value: structuralProperties.radiusOfGyrationY.toFixed(2),
          unit: 'cm',
          description: 'Radius of gyration about Y-axis'
        },
        area: {
          value: structuralProperties.area.toFixed(4),
          unit: 'cm²',
          description: 'Cross-sectional area'
        }
      },
      result: {
        value: `rx: ${structuralProperties.radiusOfGyrationX.toFixed(2)}, ry: ${structuralProperties.radiusOfGyrationY.toFixed(2)}`,
        unit: 'cm'
      },
      notes: [
        'Essential for column buckling analysis',
        'Slenderness ratio = L/r (where L is effective length)',
        'Smaller radius indicates higher buckling risk',
        'Minimum radius typically governs column design'
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
          <span>Detailed step-by-step engineering calculations with formulas</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enhanced Profile and Material Summary */}
        <div className="grid gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Profile</div>
              <div className="font-medium">{profileData.name}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Standard Engineering Profile</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Material</div>
              <div className="font-medium">{materialName || materialData.name}</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Yield: {materialData.yieldStrength} MPa | Density: {materialData.density} g/cm³
              </div>
            </div>
          </div>
          
          {/* Enhanced Cross-Section Diagram - Hidden by Default */}
          <CrossSectionViewer
            profileType={getProfileTypeFromName(profileData.name)}
            dimensions={dimensions}
            defaultVisible={false}
            size="large"
            className="mt-4"
          />
        </div>

        {/* Enhanced Calculation Steps */}
        <div className="space-y-3">
          {calculationSteps.map((step, index) => (
            <Collapsible
              key={step.id}
              open={expandedSteps.has(step.id)}
              onOpenChange={() => toggleStep(step.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto hover:bg-muted/50 border border-border/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="min-w-[2.5rem] justify-center font-semibold">
                      {index + 1}
                    </Badge>
                    <div className="text-left">
                      <div className="font-medium text-foreground">{step.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {step.description}
                      </div>
                      <div className="text-xs font-mono text-primary mt-1">
                        {step.formula}
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
              <CollapsibleContent className="px-4 pb-4">
                <div className="space-y-4 mt-4 border-l-2 border-primary/20 pl-4">
                  {/* Enhanced Formula Display */}
                  <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <div className="text-xs text-foreground mb-2 flex items-center gap-1 font-medium">
                      <FunctionSquare className="h-3 w-3" />
                      Engineering Formula
                    </div>
                    <code className="text-lg font-mono font-semibold text-foreground block mb-2">
                      {step.formula}
                    </code>
                    {step.detailedFormula && (
                      <div className="text-sm text-muted-foreground mt-2 bg-background/60 p-2 rounded border border-border/50">
                        <strong>Explanation:</strong> {step.detailedFormula}
                      </div>
                    )}
                  </div>

                  {/* Step-by-Step Calculation */}
                  {step.stepByStep && (
                    <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30 p-4 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                      <div className="text-xs text-foreground mb-3 flex items-center gap-1 font-medium">
                        <Calculator className="h-3 w-3" />
                        Step-by-Step Calculation
                      </div>
                      <div className="space-y-2">
                        {step.stepByStep.map((stepText, stepIndex) => (
                          <div key={stepIndex} className="text-sm text-foreground bg-background/60 p-2 rounded border border-border/30">
                            {stepText}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Variables Section */}
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                      <Calculator className="h-3 w-3" />
                      Input Variables & Parameters
                    </div>
                    <div className="grid gap-2">
                      {Object.entries(step.variables).map(([key, variable]) => (
                        <div key={key} className="flex justify-between items-center text-sm bg-gradient-to-r from-background/80 to-background/40 p-3 rounded-lg border border-border/40 hover:border-border/60 transition-colors">
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono bg-primary/15 text-primary px-2 py-1 rounded font-semibold border border-primary/20">
                              {key}
                            </code>
                            <span className="text-muted-foreground">{variable.description}</span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="font-semibold text-foreground">{variable.value}</span>
                            <span className="text-muted-foreground ml-1 text-xs">{variable.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Result Display */}
                  <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-lg border border-green-200/50 dark:border-green-800/50">
                    <div className="text-xs text-foreground mb-2 flex items-center gap-1 font-medium">
                      <CheckCircle className="h-3 w-3" />
                      Final Calculated Result
                    </div>
                    <div className="font-bold text-xl text-foreground font-mono">
                      {step.result.value} {step.result.unit}
                    </div>
                    {step.id === 'step1' && structuralProperties.area > 0 && (
                      <div className="text-xs text-muted-foreground mt-2 bg-background/60 p-2 rounded border border-border/30">
                        <strong>Engineering significance:</strong> Weight per meter ≈ {structuralProperties.weight.toFixed(2)} kg/m
                        <br />This area value is used for all subsequent structural calculations.
                      </div>
                    )}
                    {step.id === 'step3' && (
                      <div className="text-xs text-muted-foreground mt-2 bg-background/60 p-2 rounded border border-border/30">
                        <strong>Calculation basis:</strong> {temperatureEffects ? 'Temperature-adjusted density applied' : 'Standard conditions (20°C)'}
                        <br />Total material volume: {volume.toFixed(4)} cm³
                      </div>
                    )}
                  </div>

                  {/* Enhanced Notes */}
                  {step.notes && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <strong>Engineering Notes:</strong>
                          <ul className="list-disc list-inside space-y-1 mt-2">
                            {step.notes.map((note, noteIndex) => (
                              <li key={noteIndex} className="text-xs">{note}</li>
                            ))}
                          </ul>
                        </div>
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