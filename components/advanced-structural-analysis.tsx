"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  Zap, 
  TrendingDown, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Ruler
} from 'lucide-react'
import {
  StructuralProperties,
  performComprehensiveAnalysis,
  BucklingAnalysis,
  LoadCapacity,
  StressAnalysis,
  DeflectionAnalysis
} from '@/lib/calculations'
import type { MaterialGrade } from '@/lib/metal-data'

interface AdvancedStructuralAnalysisProps {
  structuralProperties: StructuralProperties
  memberLength: number
  selectedMaterial?: MaterialGrade | null
  profileName?: string
  materialName?: string
}

export function AdvancedStructuralAnalysis({ 
  structuralProperties, 
  memberLength,
  selectedMaterial,
  profileName,
  materialName
}: AdvancedStructuralAnalysisProps) {
  // Analysis parameters state - auto-populate from selected material
  const [yieldStrength, setYieldStrength] = useState<number>(selectedMaterial?.yieldStrength || 250)
  const [ultimateStrength, setUltimateStrength] = useState<number>(selectedMaterial?.tensileStrength || 400)
  const [elasticModulus, setElasticModulus] = useState<number>((selectedMaterial?.elasticModulus || 200) * 1000) // Convert GPa to MPa
  const [endConditions, setEndConditions] = useState<'pinned' | 'fixed' | 'fixed-pinned' | 'cantilever'>('pinned')
  
  // Update material properties when selected material changes
  React.useEffect(() => {
    if (selectedMaterial) {
      setYieldStrength(selectedMaterial.yieldStrength || 250)
      setUltimateStrength(selectedMaterial.tensileStrength || 400)
      setElasticModulus((selectedMaterial.elasticModulus || 200) * 1000) // Convert GPa to MPa
    }
  }, [selectedMaterial])
  
  // Loading conditions state
  const [axialForce, setAxialForce] = useState<number>(0)
  const [momentX, setMomentX] = useState<number>(0)
  const [momentY, setMomentY] = useState<number>(0)
  const [shearForce, setShearForce] = useState<number>(0)
  const [uniformLoad, setUniformLoad] = useState<number>(0)
  const [pointLoad, setPointLoad] = useState<number>(0)

  // Perform comprehensive analysis
  const analysis = useMemo(() => {
    return performComprehensiveAnalysis(structuralProperties, {
      length: memberLength,
      yieldStrength,
      ultimateStrength,
      elasticModulus,
      endConditions,
      axialForce,
      momentX,
      momentY,
      shearForce,
      uniformLoad,
      pointLoad
    })
  }, [
    structuralProperties, memberLength, yieldStrength, ultimateStrength, 
    elasticModulus, endConditions, axialForce, momentX, momentY, 
    shearForce, uniformLoad, pointLoad
  ])

  const formatNumber = (value: number, decimals: number = 2) => {
    if (value === 0) return '0'
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(decimals)}k`
    return value.toFixed(decimals)
  }

  const BucklingAnalysisCard = ({ buckling }: { buckling: BucklingAnalysis }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Buckling Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Slenderness Ratio (λ)</Label>
            <div className="text-lg font-semibold">{buckling.slendernessRatio.toFixed(1)}</div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Buckling Mode</Label>
            <Badge variant={buckling.bucklingMode === 'elastic' ? 'destructive' : 
                           buckling.bucklingMode === 'inelastic' ? 'default' : 'secondary'}>
              {buckling.bucklingMode}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Euler Critical Load</Label>
            <div className="text-lg font-semibold">{formatNumber(buckling.eulerCriticalLoad)} N</div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Allowable Load</Label>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">{formatNumber(buckling.allowableLoad)} N</div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Safety Factor</Label>
          <div className="text-lg font-semibold">{buckling.safetyFactor.toFixed(1)}</div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {buckling.comments.map((comment, index) => (
                <li key={index} className="text-sm">{comment}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )

  const LoadCapacityCard = ({ capacity }: { capacity: LoadCapacity }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Load Capacity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tensile Capacity</Label>
            <div className="text-lg font-semibold">{formatNumber(capacity.tensileCapacity)} N</div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Compressive Capacity</Label>
            <div className="text-lg font-semibold">{formatNumber(capacity.compressiveCapacity)} N</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Flexural Capacity</Label>
            <div className="text-lg font-semibold">{formatNumber(capacity.flexuralCapacity / 1000)} kN⋅m</div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Shear Capacity</Label>
            <div className="text-lg font-semibold">{formatNumber(capacity.shearCapacity)} N</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Design Capacity (Conservative)</Label>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(capacity.designCapacity)} N</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Yield Strength: {capacity.yieldStrength} MPa</div>
          <div>Ultimate Strength: {capacity.ultimateStrength} MPa</div>
        </div>
      </CardContent>
    </Card>
  )

  const StressAnalysisCard = ({ stress }: { stress: StressAnalysis }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Stress Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Axial Stress</Label>
            <div className="text-lg font-semibold">{stress.axialStress.toFixed(2)} MPa</div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Shear Stress</Label>
            <div className="text-lg font-semibold">{stress.shearStress.toFixed(2)} MPa</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bending Stress X</Label>
            <div className="text-lg font-semibold">{stress.bendingStressX.toFixed(2)} MPa</div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Bending Stress Y</Label>
            <div className="text-lg font-semibold">{stress.bendingStressY.toFixed(2)} MPa</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Von Mises Stress</Label>
          <div className="text-xl font-bold">{stress.vonMisesStress.toFixed(2)} MPa</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Safety Factor</Label>
            <div className={`text-lg font-semibold ${stress.safetyFactor >= 1.5 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {stress.safetyFactor.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stress.isWithinLimits ? (
              <>
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <Badge variant="default" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Safe</Badge>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <Badge variant="destructive">Unsafe</Badge>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const DeflectionAnalysisCard = ({ deflection }: { deflection: DeflectionAnalysis }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Deflection Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Max Deflection</Label>
            <div className="text-lg font-semibold">{deflection.maxDeflection.toFixed(2)} mm</div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Allowable Deflection</Label>
            <div className="text-lg font-semibold">{deflection.allowableDeflection.toFixed(2)} mm</div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Deflection Ratio (L/δ)</Label>
          <div className="text-xl font-bold">{formatNumber(deflection.deflectionRatio, 0)}</div>
        </div>

        <div className="flex items-center gap-2">
          {deflection.isAcceptable ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <Badge variant="default" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Acceptable</Badge>
            </>
                      ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <Badge variant="destructive">Excessive Deflection</Badge>
              </>
            )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Advanced Structural Analysis
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="font-normal">
              Profile: {profileName || 'Not Selected'}
            </Badge>
            <Badge variant="outline" className="font-normal">
              Material: {materialName || 'Not Selected'}
            </Badge>
            <Badge variant="outline" className="font-normal">
              Length: {memberLength.toFixed(0)} cm
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="parameters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="loading">Loading</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            <TabsContent value="parameters" className="space-y-4">
              {/* Current Structural Properties Summary */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Current Properties:</strong> Area: {structuralProperties.area.toFixed(1)} cm² | 
                  Ix: {structuralProperties.momentOfInertiaX.toFixed(0)} cm⁴ | 
                  Sx: {structuralProperties.sectionModulusX.toFixed(0)} cm³ | 
                  rx: {structuralProperties.radiusOfGyrationX.toFixed(1)} cm
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yieldStrength">Yield Strength (MPa)</Label>
                  <Input
                    id="yieldStrength"
                    type="number"
                    value={yieldStrength}
                    onChange={(e) => setYieldStrength(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ultimateStrength">Ultimate Strength (MPa)</Label>
                  <Input
                    id="ultimateStrength"
                    type="number"
                    value={ultimateStrength}
                    onChange={(e) => setUltimateStrength(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elasticModulus">Elastic Modulus (MPa)</Label>
                  <Input
                    id="elasticModulus"
                    type="number"
                    value={elasticModulus}
                    onChange={(e) => setElasticModulus(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endConditions">End Conditions</Label>
                  <Select value={endConditions} onValueChange={(value: any) => setEndConditions(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pinned">Pinned-Pinned</SelectItem>
                      <SelectItem value="fixed">Fixed-Fixed</SelectItem>
                      <SelectItem value="fixed-pinned">Fixed-Pinned</SelectItem>
                      <SelectItem value="cantilever">Cantilever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="loading" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="axialForce">Axial Force (N)</Label>
                  <Input
                    id="axialForce"
                    type="number"
                    value={axialForce}
                    onChange={(e) => setAxialForce(Number(e.target.value))}
                    placeholder="Tension positive"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="momentX">Moment X (N⋅m)</Label>
                  <Input
                    id="momentX"
                    type="number"
                    value={momentX}
                    onChange={(e) => setMomentX(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="momentY">Moment Y (N⋅m)</Label>
                  <Input
                    id="momentY"
                    type="number"
                    value={momentY}
                    onChange={(e) => setMomentY(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shearForce">Shear Force (N)</Label>
                  <Input
                    id="shearForce"
                    type="number"
                    value={shearForce}
                    onChange={(e) => setShearForce(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uniformLoad">Uniform Load (N/cm)</Label>
                  <Input
                    id="uniformLoad"
                    type="number"
                    value={uniformLoad}
                    onChange={(e) => setUniformLoad(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointLoad">Point Load (N)</Label>
                  <Input
                    id="pointLoad"
                    type="number"
                    value={pointLoad}
                    onChange={(e) => setPointLoad(Number(e.target.value))}
                    placeholder="At center"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BucklingAnalysisCard buckling={analysis.bucklingAnalysis} />
                <LoadCapacityCard capacity={analysis.loadCapacity} />
                <StressAnalysisCard stress={analysis.stressAnalysis} />
                <DeflectionAnalysisCard deflection={analysis.deflectionAnalysis} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 