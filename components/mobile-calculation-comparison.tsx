"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { 
  BarChart3,
  Play,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Equal,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Calculation } from '@/lib/types'

interface MobileCalculationComparisonProps {
  calculations: Calculation[]
  selectedCalculations: Set<string>
  onRemoveFromComparison: (calculationId: string) => void
  onLoadCalculation?: (calculation: Calculation) => void
}

interface ComparisonMetric {
  key: string
  label: string
  getValue: (calc: Calculation) => number | string
  format: (value: number | string) => string
  unit: string
  important?: boolean
}

const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    key: 'weight',
    label: 'Weight per unit',
    getValue: (calc) => calc.weight || 0,
    format: (value) => `${Number(value).toFixed(2)}`,
    unit: 'kg',
    important: true
  },
  {
    key: 'totalWeight',
    label: 'Total Weight',
    getValue: (calc) => calc.totalWeight || calc.weight || 0,
    format: (value) => `${Number(value).toFixed(2)}`,
    unit: 'kg',
    important: true
  },
  {
    key: 'crossSectionalArea',
    label: 'Area',
    getValue: (calc) => calc.crossSectionalArea || 0,
    format: (value) => `${Number(value).toFixed(2)}`,
    unit: 'cm²'
  },
  {
    key: 'totalCost',
    label: 'Total Cost',
    getValue: (calc) => calc.totalCost || 0,
    format: (value) => `$${Number(value).toFixed(2)}`,
    unit: '',
    important: true
  },
  {
    key: 'unitCost',
    label: 'Unit Cost',
    getValue: (calc) => calc.unitCost || 0,
    format: (value) => `$${Number(value).toFixed(2)}`,
    unit: ''
  },
  {
    key: 'costPerKg',
    label: 'Cost per kg',
    getValue: (calc) => {
      const totalCost = calc.totalCost || 0
      const totalWeight = calc.totalWeight || calc.weight || 0
      return totalWeight > 0 ? totalCost / totalWeight : 0
    },
    format: (value) => `$${Number(value).toFixed(2)}`,
    unit: '/kg'
  }
]

export function MobileCalculationComparison({ 
  calculations, 
  selectedCalculations,
  onRemoveFromComparison,
  onLoadCalculation
}: MobileCalculationComparisonProps) {
  const [sortBy, setSortBy] = useState<string>('weight')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [activeCard, setActiveCard] = useState(0)
  const [viewMode, setViewMode] = useState<'carousel' | 'side-by-side'>('carousel')
  const [showAllMetrics, setShowAllMetrics] = useState(false)

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

  const getDiffColor = (value: number, baseline: number) => {
    const diff = ((value - baseline) / baseline) * 100
    if (Math.abs(diff) < 1) return 'text-muted-foreground'
    if (diff > 0) return 'text-green-600'
    return 'text-red-600'
  }

  const nextCard = () => {
    setActiveCard((prev) => (prev + 1) % sortedCalculations.length)
  }

  const prevCard = () => {
    setActiveCard((prev) => (prev - 1 + sortedCalculations.length) % sortedCalculations.length)
  }

  if (compareCalculations.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardContent className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No calculations selected</h3>
          <p className="text-muted-foreground">
            Select calculations from the History tab to compare them here
          </p>
        </CardContent>
      </Card>
    )
  }

  if (compareCalculations.length === 1) {
    const calculation = sortedCalculations[0]
    return (
      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Calculation Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MobileCalculationDetailCard 
            calculation={calculation}
            onRemove={() => onRemoveFromComparison(calculation.id)}
            onLoad={() => onLoadCalculation?.(calculation)}
            showAllMetrics={showAllMetrics}
            onToggleMetrics={() => setShowAllMetrics(!showAllMetrics)}
          />
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
            Comparison
            <Badge variant="secondary">{selectedCalculations.size}/5</Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <SheetTitle>Comparison Options</SheetTitle>
                  <SheetDescription>
                    Customize how calculations are compared
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort by</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPARISON_METRICS.map(metric => (
                          <SelectItem key={metric.key} value={metric.key}>
                            {metric.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort order</label>
                    <div className="flex gap-2">
                      <Button
                        variant={sortOrder === 'asc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortOrder('asc')}
                        className="flex-1"
                      >
                        Ascending
                      </Button>
                      <Button
                        variant={sortOrder === 'desc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortOrder('desc')}
                        className="flex-1"
                      >
                        Descending
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">View mode</label>
                    <div className="flex gap-2">
                      <Button
                        variant={viewMode === 'carousel' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('carousel')}
                        className="flex-1"
                      >
                        Carousel
                      </Button>
                      <Button
                        variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('side-by-side')}
                        className="flex-1"
                        disabled={sortedCalculations.length > 2}
                      >
                        Side-by-Side
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {viewMode === 'carousel' ? (
          <div className="space-y-4">
            {/* Navigation */}
            {sortedCalculations.length > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevCard}
                  disabled={activeCard === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  {sortedCalculations.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveCard(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === activeCard ? "bg-primary" : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextCard}
                  disabled={activeCard === sortedCalculations.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Active Card */}
            <MobileComparisonCard
              calculation={sortedCalculations[activeCard]}
              baseline={sortedCalculations[0]}
              isBaseline={activeCard === 0}
              onRemove={() => onRemoveFromComparison(sortedCalculations[activeCard].id)}
              onLoad={() => onLoadCalculation?.(sortedCalculations[activeCard])}
              showAllMetrics={showAllMetrics}
              onToggleMetrics={() => setShowAllMetrics(!showAllMetrics)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Side-by-side view (max 2 calculations) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedCalculations.slice(0, 2).map((calculation, index) => (
                <MobileComparisonCard
                  key={calculation.id}
                  calculation={calculation}
                  baseline={sortedCalculations[0]}
                  isBaseline={index === 0}
                  onRemove={() => onRemoveFromComparison(calculation.id)}
                  onLoad={() => onLoadCalculation?.(calculation)}
                  showAllMetrics={showAllMetrics}
                  onToggleMetrics={() => setShowAllMetrics(!showAllMetrics)}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {sortedCalculations.length > 2 && viewMode === 'carousel' && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Comparing {sortedCalculations.length} calculations • 
              Swipe or use arrows to navigate
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Mobile Comparison Card Component
interface MobileComparisonCardProps {
  calculation: Calculation
  baseline: Calculation
  isBaseline: boolean
  onRemove: () => void
  onLoad: () => void
  showAllMetrics: boolean
  onToggleMetrics: () => void
  compact?: boolean
}

function MobileComparisonCard({ 
  calculation, 
  baseline, 
  isBaseline, 
  onRemove, 
  onLoad,
  showAllMetrics,
  onToggleMetrics,
  compact = false
}: MobileComparisonCardProps) {
  const metricsToShow = showAllMetrics ? COMPARISON_METRICS : COMPARISON_METRICS.filter(m => m.important)

  return (
    <Card className={cn("border-2", isBaseline && "border-primary/50 bg-primary/5")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isBaseline && (
                <Badge variant="default" className="text-xs">Baseline</Badge>
              )}
              <h3 className="font-medium text-sm truncate">
                {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {calculation.materialName} • {calculation.profileName}
              {calculation.quantity && calculation.quantity > 1 && ` • Qty: ${calculation.quantity}`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Key Metrics */}
        <div className={cn(
          "grid gap-2",
          compact ? "grid-cols-2" : "grid-cols-3"
        )}>
          {metricsToShow.map((metric) => {
            const value = metric.getValue(calculation)
            const baselineValue = metric.getValue(baseline)
            const numValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0
            const baselineNum = typeof baselineValue === 'number' ? baselineValue : parseFloat(baselineValue.toString()) || 0
            
            return (
              <div key={metric.key} className="text-center p-2 bg-muted/50 rounded">
                <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
                <div className="font-semibold text-sm">
                  {metric.format(value)}
                  {metric.unit && <span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>}
                </div>
                {!isBaseline && baselineNum > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {/* {getComparisonIcon(numValue, baselineNum)} */}
                    <span className={cn("text-xs", getDiffColor(numValue, baselineNum))}>
                      {getPercentageDiff(numValue, baselineNum)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onLoad} className="flex-1">
            <Play className="h-4 w-4 mr-1" />
            Load
          </Button>
          {!compact && (
            <Button size="sm" variant="outline" onClick={onToggleMetrics} className="flex-1">
              <Maximize2 className="h-4 w-4 mr-1" />
              {showAllMetrics ? 'Less' : 'More'}
            </Button>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {calculation.timestamp.toLocaleDateString()} at {calculation.timestamp.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}

// Mobile Detail Card for single calculation
function MobileCalculationDetailCard({ 
  calculation, 
  onRemove, 
  onLoad,
  showAllMetrics,
  onToggleMetrics
}: {
  calculation: Calculation
  onRemove: () => void
  onLoad: () => void
  showAllMetrics: boolean
  onToggleMetrics: () => void
}) {
  const metricsToShow = showAllMetrics ? COMPARISON_METRICS : COMPARISON_METRICS.filter(m => m.important)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">
            {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {calculation.materialName} • {calculation.profileName}
            {calculation.quantity && calculation.quantity > 1 && ` • Qty: ${calculation.quantity}`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {metricsToShow.map((metric) => {
          const value = metric.getValue(calculation)
          
          return (
            <div key={metric.key} className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
              <div className="font-semibold">
                {metric.format(value)}
                {metric.unit && <span className="text-xs text-muted-foreground ml-1">{metric.unit}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onLoad} className="flex-1">
          <Play className="h-4 w-4 mr-2" />
          Load Calculation
        </Button>
        <Button variant="outline" onClick={onToggleMetrics}>
          <Maximize2 className="h-4 w-4 mr-2" />
          {showAllMetrics ? 'Show Less' : 'Show More'}
        </Button>
      </div>

      {/* Timestamp */}
      <div className="text-sm text-muted-foreground text-center pt-3 border-t">
        Created: {calculation.timestamp.toLocaleDateString()} at {calculation.timestamp.toLocaleTimeString()}
      </div>
    </div>
  )
} 