import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  BarChart3, 
  X, 
  Plus, 
  ArrowUpDown, 
  Scale, 
  TrendingUp, 
  TrendingDown,
  Equal
} from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import type { Calculation } from '@/lib/types'

interface CalculationComparisonProps {
  calculations: Calculation[]
  onAddToComparison: (calculationId: string) => void
  onRemoveFromComparison: (calculationId: string) => void
}

interface ComparisonMetric {
  key: string
  label: string
  getValue: (calc: Calculation) => number | string
  format: (value: number | string) => string
  unit: string
}

const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    key: 'weight',
    label: 'Weight',
    getValue: (calc) => calc.weight,
    format: (value) => typeof value === 'number' ? value.toFixed(4) : value.toString(),
    unit: 'kg'
  },
  {
    key: 'crossSectionalArea',
    label: 'Cross-Sectional Area',
    getValue: (calc) => calc.crossSectionalArea,
    format: (value) => typeof value === 'number' ? value.toFixed(4) : value.toString(),
    unit: 'cm²'
  },
  {
    key: 'momentOfInertiaX',
    label: 'Moment of Inertia X',
    getValue: (calc) => calc.momentOfInertiaX || 0,
    format: (value) => typeof value === 'number' ? value.toFixed(2) : value.toString(),
    unit: 'cm⁴'
  },
  {
    key: 'momentOfInertiaY',
    label: 'Moment of Inertia Y',
    getValue: (calc) => calc.momentOfInertiaY || 0,
    format: (value) => typeof value === 'number' ? value.toFixed(2) : value.toString(),
    unit: 'cm⁴'
  },
  {
    key: 'sectionModulusX',
    label: 'Section Modulus X',
    getValue: (calc) => calc.sectionModulusX || 0,
    format: (value) => typeof value === 'number' ? value.toFixed(2) : value.toString(),
    unit: 'cm³'
  },
  {
    key: 'sectionModulusY',
    label: 'Section Modulus Y',
    getValue: (calc) => calc.sectionModulusY || 0,
    format: (value) => typeof value === 'number' ? value.toFixed(2) : value.toString(),
    unit: 'cm³'
  }
]

export function CalculationComparison({ 
  calculations, 
  onAddToComparison, 
  onRemoveFromComparison 
}: CalculationComparisonProps) {
  const [selectedCalculations, setSelectedCalculations] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<string>('weight')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const toggleCalculation = (calcId: string) => {
    const newSelected = new Set(selectedCalculations)
    if (newSelected.has(calcId)) {
      newSelected.delete(calcId)
      onRemoveFromComparison(calcId)
    } else {
      if (newSelected.size < 5) { // Limit to 5 comparisons
        newSelected.add(calcId)
        onAddToComparison(calcId)
      }
    }
    setSelectedCalculations(newSelected)
  }

  const compareCalculations = calculations.filter(calc => 
    selectedCalculations.has(calc.id)
  )

  const sortedCalculations = [...compareCalculations].sort((a, b) => {
    const metric = COMPARISON_METRICS.find(m => m.key === sortBy)
    if (!metric) return 0

    const aValue = metric.getValue(a)
    const bValue = metric.getValue(b)
    
    const aNum = typeof aValue === 'number' ? aValue : parseFloat(aValue.toString()) || 0
    const bNum = typeof bValue === 'number' ? bValue : parseFloat(bValue.toString()) || 0

    return sortOrder === 'asc' ? aNum - bNum : bNum - aNum
  })

  const getComparisonIcon = (value: number, baseline: number) => {
    const diff = ((value - baseline) / baseline) * 100
    if (Math.abs(diff) < 1) return <Equal className="h-3 w-3 text-muted-foreground" />
    if (diff > 0) return <TrendingUp className="h-3 w-3 text-green-500" />
    return <TrendingDown className="h-3 w-3 text-red-500" />
  }

  const getPercentageDiff = (value: number, baseline: number) => {
    const diff = ((value - baseline) / baseline) * 100
    const sign = diff > 0 ? '+' : ''
    return `${sign}${diff.toFixed(1)}%`
  }

  const clearComparison = () => {
    setSelectedCalculations(new Set())
    selectedCalculations.forEach(id => onRemoveFromComparison(id))
  }

  if (calculations.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No calculations to compare</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Calculation Comparison
            {selectedCalculations.size > 0 && (
              <Badge variant="secondary">{selectedCalculations.size}/5</Badge>
            )}
          </CardTitle>
          {selectedCalculations.size > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearComparison}
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calculation Selection */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Select calculations to compare (max 5):</div>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {calculations.slice(0, 10).map((calc) => ( // Show last 10 calculations
              <div
                key={calc.id}
                className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                  selectedCalculations.has(calc.id)
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-background/50 hover:bg-muted/50'
                }`}
                onClick={() => toggleCalculation(calc.id)}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {calc.profileName} - {calc.materialName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {calc.weight.toFixed(2)} {calc.weightUnit} • {new Date(calc.timestamp).toLocaleDateString()}
                  </div>
                </div>
                {selectedCalculations.has(calc.id) ? (
                  <X className="h-4 w-4 text-destructive" />
                ) : (
                  <Plus className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        {compareCalculations.length > 0 && (
          <>
            <Separator />
            
            {/* Sort Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPARISON_METRICS.map((metric) => (
                      <SelectItem key={metric.key} value={metric.key}>
                        {metric.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>

            {/* Comparison Table */}
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Calculation</TableHead>
                    {COMPARISON_METRICS.map((metric) => (
                      <TableHead key={metric.key} className="text-center min-w-[120px]">
                        {metric.label}
                        <div className="text-xs text-muted-foreground">({metric.unit})</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCalculations.map((calc, index) => {
                    const isBaseline = index === 0
                    const baselineCalc = sortedCalculations[0]
                    
                    return (
                      <TableRow key={calc.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              {calc.profileName}
                              {isBaseline && (
                                <Badge variant="outline" className="text-xs">
                                  <Scale className="h-3 w-3 mr-1" />
                                  Baseline
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {calc.materialName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(calc.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        {COMPARISON_METRICS.map((metric) => {
                          const value = metric.getValue(calc)
                          const numValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0
                          const baselineValue = metric.getValue(baselineCalc)
                          const baselineNum = typeof baselineValue === 'number' ? baselineValue : parseFloat(baselineValue.toString()) || 0
                          
                          return (
                            <TableCell key={metric.key} className="text-center">
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {metric.format(value)}
                                </div>
                                {!isBaseline && baselineNum !== 0 && (
                                  <div className="flex items-center justify-center gap-1 text-xs">
                                    {getComparisonIcon(numValue, baselineNum)}
                                    <span className={
                                      numValue > baselineNum ? 'text-green-600' :
                                      numValue < baselineNum ? 'text-red-600' :
                                      'text-muted-foreground'
                                    }>
                                      {getPercentageDiff(numValue, baselineNum)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Summary Statistics */}
            {compareCalculations.length > 1 && (
              <>
                <Separator />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {COMPARISON_METRICS.slice(0, 4).map((metric) => {
                    const values = compareCalculations
                      .map(calc => metric.getValue(calc))
                      .map(val => typeof val === 'number' ? val : parseFloat(val.toString()) || 0)
                    
                    const min = Math.min(...values)
                    const max = Math.max(...values)
                    const avg = values.reduce((a, b) => a + b, 0) / values.length
                    const range = max - min

                    return (
                      <div key={metric.key} className="p-3 bg-muted/30 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
                        <div className="space-y-1 text-xs">
                          <div>Min: {metric.format(min)} {metric.unit}</div>
                          <div>Max: {metric.format(max)} {metric.unit}</div>
                          <div>Avg: {metric.format(avg)} {metric.unit}</div>
                          <div>Range: {metric.format(range)} {metric.unit}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 