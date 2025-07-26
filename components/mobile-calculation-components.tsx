"use client"

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Archive,
  Search,
  Filter,
  Download,
  Play,
  Eye,
  FolderOpen,
  Trash2,
  BarChart3,
  ChevronDown,
  X,
  MoreHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Equal,
  Maximize2,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/project-context'
import type { Calculation } from '@/lib/types'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

// Mobile History Component
interface MobileCalculationHistoryProps {
  calculations: Calculation[]
  onLoadCalculation?: (calculation: Calculation) => void
  onMoveToProject?: (calculationId: string, projectId: string) => void
  onAddToComparison?: (calculationId: string) => void
  onDeleteCalculation?: (calculationId: string) => void
}

interface HistoryFilters {
  projectId?: string
  search?: string
  dateRange?: 'all' | 'today' | 'week' | 'month'
  materialType?: string
  profileType?: string
}

export function MobileCalculationHistory({ 
  calculations, 
  onLoadCalculation,
  onMoveToProject,
  onAddToComparison,
  onDeleteCalculation
}: MobileCalculationHistoryProps) {
  const { t } = useI18n()
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({
    projectId: 'all',
    search: '',
    dateRange: 'all',
    materialType: 'all',
    profileType: 'all'
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(15)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  
  const { projects } = useProjects()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setHistoryFilters(prev => ({ ...prev, search: searchInput }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Filter calculations
  const filteredCalculations = useMemo(() => {
    let filtered = [...calculations]

    if (historyFilters.projectId && historyFilters.projectId !== 'all') {
      if (historyFilters.projectId === 'none') {
        filtered = filtered.filter(calc => !calc.projectId)
      } else {
        filtered = filtered.filter(calc => calc.projectId === historyFilters.projectId)
      }
    }

    if (historyFilters.search) {
      const searchLower = historyFilters.search.toLowerCase()
      filtered = filtered.filter(calc => 
        calc.profileName?.toLowerCase().includes(searchLower) ||
        calc.profileType?.toLowerCase().includes(searchLower) ||
        calc.material?.toLowerCase().includes(searchLower) ||
        calc.materialName?.toLowerCase().includes(searchLower)
      )
    }

    if (historyFilters.dateRange && historyFilters.dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (historyFilters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
      }
      
      filtered = filtered.filter(calc => calc.timestamp >= cutoffDate)
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [calculations, historyFilters])

  const displayedCalculations = filteredCalculations.slice(0, displayedCount)
  const hasMore = displayedCount < filteredCalculations.length

  // Pull to refresh
  const [touchStart, setTouchStart] = useState<{ y: number; time: number } | null>(null)
  const [pullDistance, setPullDistance] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ y: e.touches[0].clientY, time: Date.now() })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || window.scrollY > 0) return
    const distance = e.touches[0].clientY - touchStart.y
    if (distance > 0 && distance < 120) {
      setPullDistance(distance)
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance > 80) {
      handlePullToRefresh()
    }
    setPullDistance(0)
    setTouchStart(null)
  }

  const handlePullToRefresh = async () => {
    setIsRefreshing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({ title: "History Refreshed", description: "Calculation history has been updated" })
    } finally {
      setIsRefreshing(false)
    }
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'No Project'
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  const hasActiveFilters = historyFilters.projectId !== 'all' || 
                          historyFilters.search || 
                          historyFilters.dateRange !== 'all'

  if (calculations.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardContent className="text-center py-12">
          <Archive className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No calculations in history</h3>
          <p className="text-muted-foreground">Start by creating some calculations</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-primary/10 flex items-center justify-center"
          style={{ height: `${Math.min(pullDistance, 80)}px` }}
        >
          <div className="text-primary text-sm font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
          </div>
        </div>
      )}

      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Archive className="h-5 w-5 text-primary" />
              History
              <Badge variant="secondary">{filteredCalculations.length}</Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => {}}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search calculations..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchInput('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">!</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[80vh]">
                <SheetHeader>
                  <SheetTitle>Filter Calculations</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <Select
                    value={historyFilters.projectId || 'all'}
                    onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, projectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('allProjects')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allProjects')}</SelectItem>
                      <SelectItem value="none">{t('noProject')}</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Calculations List */}
          <div 
            className="space-y-3"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {displayedCalculations.map((calculation) => (
              <MobileCalculationCard
                key={calculation.id}
                calculation={calculation}
                projectName={getProjectName(calculation.projectId)}
                onLoad={() => onLoadCalculation?.(calculation)}
                onAddToComparison={() => onAddToComparison?.(calculation.id)}
                onDelete={() => onDeleteCalculation?.(calculation.id)}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-4">
              <Button variant="outline" onClick={() => setDisplayedCount(prev => prev + 15)}>
                Load More ({filteredCalculations.length - displayedCount} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Mobile Calculation Card
interface MobileCalculationCardProps {
  calculation: Calculation
  projectName: string
  onLoad: () => void
  onAddToComparison: () => void
  onDelete: () => void
}

function MobileCalculationCard({ 
  calculation, 
  projectName, 
  onLoad, 
  onAddToComparison, 
  onDelete
}: MobileCalculationCardProps) {
  const { t } = useI18n()
  const [showActions, setShowActions] = useState(false)

  return (
    <Card className="border bg-background">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-5 truncate">
              {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {calculation.materialName} • {calculation.profileName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setShowActions(!showActions)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="text-xs text-muted-foreground">Weight</div>
            <div className="font-semibold text-sm">
              {calculation.totalWeight ? `${calculation.totalWeight.toFixed(2)} kg` : `${calculation.weight?.toFixed(2)} kg`}
            </div>
          </div>
          
          {calculation.quantity && calculation.quantity > 1 && (
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">{t('quantity')}</div>
              <div className="font-semibold text-sm">{calculation.quantity}</div>
            </div>
          )}
          
          {calculation.totalCost && calculation.totalCost > 0 && (
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="text-xs text-muted-foreground">Cost</div>
              <div className="font-semibold text-sm text-green-600">
                ${calculation.totalCost.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <Badge variant="outline" className="text-xs">{projectName}</Badge>
          <span className="text-muted-foreground">
            {calculation.timestamp.toLocaleDateString()}
          </span>
        </div>

        {showActions && (
          <div className="mt-3 pt-3 border-t flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={onLoad} className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              Load
            </Button>
            <Button size="sm" variant="outline" onClick={onAddToComparison} className="flex-1">
              <BarChart3 className="h-4 w-4 mr-1" />
              Compare
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => {
                if (window.confirm('Delete this calculation?')) {
                  onDelete()
                }
              }}
              className="w-full mt-2"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Mobile Comparison Component
interface MobileCalculationComparisonProps {
  calculations: Calculation[]
  selectedCalculations: Set<string>
  onRemoveFromComparison: (calculationId: string) => void
  onLoadCalculation?: (calculation: Calculation) => void
}

export function MobileCalculationComparison({ 
  calculations, 
  selectedCalculations,
  onRemoveFromComparison,
  onLoadCalculation
}: MobileCalculationComparisonProps) {
  const { t } = useI18n()
  const [activeCard, setActiveCard] = useState(0)

  const compareCalculations = calculations.filter(calc => 
    selectedCalculations.has(calc.id)
  )

  if (compareCalculations.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardContent className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">{t('noCalculationsSelected')}</h3>
          <p className="text-muted-foreground">
            {t('selectCalculationsFromHistory')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Comparison
          <Badge variant="secondary">{selectedCalculations.size}/5</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {compareCalculations.length > 1 && (
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveCard(Math.max(0, activeCard - 1))}
              disabled={activeCard === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-2">
              {compareCalculations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveCard(index)}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    index === activeCard ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveCard(Math.min(compareCalculations.length - 1, activeCard + 1))}
              disabled={activeCard === compareCalculations.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <MobileComparisonCard
          calculation={compareCalculations[activeCard]}
          onRemove={() => onRemoveFromComparison(compareCalculations[activeCard].id)}
          onLoad={() => onLoadCalculation?.(compareCalculations[activeCard])}
        />
      </CardContent>
    </Card>
  )
}

// Mobile Comparison Card
function MobileComparisonCard({ 
  calculation, 
  onRemove, 
  onLoad
}: {
  calculation: Calculation
  onRemove: () => void
  onLoad: () => void
}) {
  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">
              {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
            </h3>
            <p className="text-xs text-muted-foreground">
              {calculation.materialName} • {calculation.profileName}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">Weight</div>
            <div className="font-semibold">
              {calculation.weight?.toFixed(2)} kg
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground">Area</div>
            <div className="font-semibold">
              {calculation.crossSectionalArea?.toFixed(2)} cm²
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onLoad} className="flex-1">
            <Play className="h-4 w-4 mr-1" />
            Load
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 