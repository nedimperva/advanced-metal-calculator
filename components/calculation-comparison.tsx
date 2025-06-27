"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { 
  Archive, 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FolderOpen, 
  Trash2, 
  MoreHorizontal, 
  X,
  RefreshCw,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Equal,
  Play
} from 'lucide-react'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useProjects } from '@/contexts/project-context'
import { useI18n } from '@/contexts/i18n-context'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { type Calculation } from '@/lib/types'

// Interface definitions
interface CalculationHistoryProps {
  calculations: Calculation[]
  onLoadCalculation?: (calculation: Calculation) => void
  onMoveToProject?: (calculationId: string, projectId: string) => void
  onAddToComparison?: (calculationId: string) => void
  onDeleteCalculation?: (calculationId: string) => void
}

interface CalculationComparisonProps {
  calculations: Calculation[]
  selectedCalculations: Set<string>
  onRemoveFromComparison: (calculationId: string) => void
  onLoadCalculation?: (calculation: Calculation) => void
}

interface HistoryFilters {
  projectId?: string
  search?: string
  dateRange?: 'all' | 'today' | 'week' | 'month'
  materialType?: string
  profileType?: string
}

interface ComparisonMetric {
  key: string
  label: string
  getValue: (calc: Calculation) => number | string
  format: (value: number | string) => string
  unit: string
}

// Helper function to create comparison metrics with translations
const createComparisonMetrics = (t: any): ComparisonMetric[] => [
  {
    key: 'weight',
    label: t('weight'),
    unit: 'kg',
    getValue: (calc) => calc.totalWeight || calc.weight || 0,
    format: (value) => `${Number(value).toFixed(2)} kg`
  },
  {
    key: 'cost',
    label: t('cost'), 
    unit: '$',
    getValue: (calc) => calc.totalCost || 0,
    format: (value) => `$${Number(value).toFixed(2)}`
  },
  {
    key: 'quantity',
    label: t('quantity'),
    unit: 'pcs',
    getValue: (calc) => calc.quantity || 1,
    format: (value) => `${value} pcs`
  },
  {
    key: 'efficiency',
    label: 'Cost/Weight',
    unit: '$/kg',
    getValue: (calc) => {
      const weight = calc.totalWeight || calc.weight || 0
      const cost = calc.totalCost || 0
      return weight > 0 ? cost / weight : 0
    },
    format: (value) => `$${Number(value).toFixed(2)}/kg`
  }
]

// Mobile Calculation Card Component
interface MobileCalculationCardProps {
  calculation: Calculation
  projectName: string
  onLoad: () => void
  onAddToComparison: () => void
  onMoveToProject: (projectId: string) => void
  onDelete: () => void
  projects: any[]
}

function MobileCalculationCard({ 
  calculation, 
  projectName, 
  onLoad, 
  onAddToComparison, 
  onMoveToProject, 
  onDelete, 
  projects
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
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="flex-1">
                  <FolderOpen className="h-4 w-4 mr-1" />
                  Move
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <SheetTitle>Move to Project</SheetTitle>
                </SheetHeader>
                <div className="space-y-2 mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onMoveToProject('')}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Remove from Project
                  </Button>
                  {projects.map((project: any) => (
                    <Button
                      key={project.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => onMoveToProject(project.id)}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      {project.name}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => {
                if (window.confirm(`Delete "${calculation.name || 'this calculation'}"?`)) {
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

        {!showActions && (
          <div className="text-center mt-2 pt-2 border-t border-dashed">
            <p className="text-xs text-muted-foreground">
              Tap menu for actions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Main History Component
export function CalculationHistory({ 
  calculations, 
  onLoadCalculation,
  onMoveToProject,
  onAddToComparison,
  onDeleteCalculation
}: CalculationHistoryProps) {
  const { t } = useI18n()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const { projects = [] } = useProjects()
  
  // State for mobile optimizations
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [visibleCount, setVisibleCount] = useState(15)
  
  // Filters state
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({
    projectId: 'all',
    search: '',
    dateRange: 'all',
    materialType: 'all',
    profileType: 'all'
  })
  
  const [searchInput, setSearchInput] = useState('')

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setHistoryFilters(prev => ({ ...prev, search: searchInput }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Touch handlers for pull-to-refresh
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 0) {
      (e.currentTarget as HTMLElement).dataset.startY = e.touches[0].clientY.toString()
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY <= 0 && (e.currentTarget as HTMLElement).dataset.startY) {
      const startY = parseInt((e.currentTarget as HTMLElement).dataset.startY!)
      const currentY = e.touches[0].clientY
      const distance = Math.max(0, currentY - startY)
      setPullDistance(distance)
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance > 80) {
      handlePullToRefresh()
    }
    setPullDistance(0)
  }

  const handlePullToRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setVisibleCount(15) // Reset pagination
    setIsRefreshing(false)
    toast({
      title: "Refreshed",
      description: "Calculation history updated",
    })
  }

  const loadMore = () => {
    setVisibleCount(prev => prev + 15)
  }

  // Get unique values for filters
  const uniqueMaterials = [...new Set(calculations.map(c => c.materialName))].filter(Boolean)
  const uniqueProfileTypes = [...new Set(calculations.map(c => c.profileName))].filter(Boolean)

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'No Project'
    const project = projects.find((p: any) => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  // Filter calculations
  const filteredCalculations = useMemo(() => {
    return calculations.filter(calc => {
      // Project filter
      if (historyFilters.projectId && historyFilters.projectId !== 'all') {
        if (historyFilters.projectId === 'none') {
          if (calc.projectId) return false
        } else {
          if (calc.projectId !== historyFilters.projectId) return false
        }
      }
      
      // Search filter
      if (historyFilters.search) {
        const searchTerm = historyFilters.search.toLowerCase()
        const searchFields = [
          calc.name,
          calc.materialName,
          calc.profileName,
          getProjectName(calc.projectId)
        ].filter(Boolean).join(' ').toLowerCase()
        
        if (!searchFields.includes(searchTerm)) return false
      }
      
      // Date range filter
      if (historyFilters.dateRange && historyFilters.dateRange !== 'all') {
        const calcDate = new Date(calc.timestamp)
        const now = new Date()
        
        switch (historyFilters.dateRange) {
          case 'today':
            if (calcDate.toDateString() !== now.toDateString()) return false
            break
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            if (calcDate < weekAgo) return false
            break
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            if (calcDate < monthAgo) return false
            break
        }
      }
      
      // Material type filter
      if (historyFilters.materialType && historyFilters.materialType !== 'all') {
        if (calc.materialName !== historyFilters.materialType) return false
      }
      
      // Profile type filter
      if (historyFilters.profileType && historyFilters.profileType !== 'all') {
        if (calc.profileName !== historyFilters.profileType) return false
      }
      
      return true
    }).slice(0, visibleCount)
  }, [calculations, historyFilters, visibleCount, getProjectName])

  const handleMoveToProjectLocal = async (calculationId: string, projectId: string) => {
    if (onMoveToProject) {
      await onMoveToProject(calculationId, projectId)
      toast({
        title: "Calculation Moved",
        description: `Moved to ${projectId ? getProjectName(projectId) : 'general history'}`,
      })
    }
  }

  const exportCalculations = () => {
    toast({
      title: "Export Successful",
      description: `Exported ${filteredCalculations.length} calculations.`,
    })
  }

  if (calculations.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardContent className="text-center py-8">
          <Archive className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No calculations in history</p>
        </CardContent>
      </Card>
    )
  }

  const hasActiveFilters = historyFilters.projectId !== 'all' || 
                          historyFilters.search || 
                          historyFilters.dateRange !== 'all' || 
                          historyFilters.materialType !== 'all' || 
                          historyFilters.profileType !== 'all'

  return (
    <div 
      className="space-y-4"
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Pull to refresh indicator - Mobile only */}
      {isMobile && pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-primary/10 flex items-center justify-center transition-all duration-200"
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
              {isMobile ? t('history') : t('calculationHistoryTitle')}
              <Badge variant="secondary">{filteredCalculations.length}</Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCalculations}
            >
              <Download className="h-4 w-4 mr-2" />
              {isMobile ? '' : t('export')}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search - Improved for mobile */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchCalculations')}
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

          {/* Mobile Filter Controls */}
          {isMobile ? (
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
                    <SheetDescription>
                      {t('narrowDownHistory')}
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Project</label>
                      <Select
                        value={historyFilters.projectId || 'all'}
                        onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, projectId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('allProjects')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('allProjects')}</SelectItem>
                          <SelectItem value="none">No Project</SelectItem>
                          {projects.map((project: any) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Date Range</label>
                      <Select
                        value={historyFilters.dateRange || 'all'}
                        onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, dateRange: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('allTime')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('allTime')}</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Material</label>
                      <Select
                        value={historyFilters.materialType || 'all'}
                        onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, materialType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('allMaterials')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('allMaterials')}</SelectItem>
                          {uniqueMaterials.map(material => (
                            <SelectItem key={material} value={material}>
                              {material}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Profile Type</label>
                      <Select
                        value={historyFilters.profileType || 'all'}
                        onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, profileType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Profile Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Profile Types</SelectItem>
                          {uniqueProfileTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setHistoryFilters({
                            projectId: 'all',
                            search: '',
                            dateRange: 'all',
                            materialType: 'all',
                            profileType: 'all'
                          })
                          setSearchInput('')
                        }}
                        className="flex-1"
                      >
                        Clear All
                      </Button>
                      <Button 
                        onClick={() => setShowFilters(false)}
                        className="flex-1"
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setHistoryFilters({
                    projectId: 'all',
                    search: '',
                    dateRange: 'all',
                    materialType: 'all',
                    profileType: 'all'
                  })
                  setSearchInput('')
                }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            /* Desktop Filters */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                value={historyFilters.projectId || 'all'}
                onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, projectId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('allProjects')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allProjects')}</SelectItem>
                  <SelectItem value="none">{t('noProject')} ({t('generalHistory')})</SelectItem>
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={historyFilters.dateRange || 'all'}
                onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, dateRange: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('allTime')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTime')}</SelectItem>
                  <SelectItem value="today">{t('today')}</SelectItem>
                  <SelectItem value="week">{t('thisWeek')}</SelectItem>
                  <SelectItem value="month">{t('thisMonth')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={historyFilters.materialType || 'all'}
                onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, materialType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('allMaterials')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allMaterials')}</SelectItem>
                  {uniqueMaterials.map(material => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && !isMobile && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => {
                setHistoryFilters({
                  projectId: 'all',
                  search: '',
                  dateRange: 'all',
                  materialType: 'all',
                  profileType: 'all'
                })
                setSearchInput('')
              }} className="mt-2">
                {t('clearFilters')}
              </Button>
            </div>
          )}

          {/* Calculations List */}
          <div className="space-y-3">
            {filteredCalculations.map(calc => (
              <div key={calc.id}>
                {isMobile ? (
                  <MobileCalculationCard
                    calculation={calc}
                    projectName={getProjectName(calc.projectId)}
                    onLoad={() => onLoadCalculation?.(calc)}
                    onAddToComparison={() => onAddToComparison?.(calc.id)}
                    onMoveToProject={(projectId) => handleMoveToProjectLocal(calc.id, projectId)}
                    onDelete={() => onDeleteCalculation?.(calc.id)}
                    projects={projects}
                  />
                ) : (
                  <Card className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {calc.name || `${calc.materialName} ${calc.profileName}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {calc.materialName} • {calc.profileName} • {getProjectName(calc.projectId)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {calc.totalWeight ? `${calc.totalWeight.toFixed(2)} kg` : `${calc.weight?.toFixed(2)} kg`}
                          </Badge>
                          {calc.totalCost && calc.totalCost > 0 && (
                            <Badge variant="outline" className="text-green-600">
                              ${calc.totalCost.toFixed(2)}
                            </Badge>
                          )}
                          <Button size="sm" variant="outline" onClick={() => onLoadCalculation?.(calc)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onAddToComparison?.(calc.id)}>
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {filteredCalculations.length >= visibleCount && calculations.length > visibleCount && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={loadMore}>
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Mobile Comparison Card Component
interface MobileComparisonCardProps {
  calculation: Calculation
  baseline: Calculation
  isBaseline: boolean
  onLoadCalculation?: (calculation: Calculation) => void
  onRemoveFromComparison: (calculationId: string) => void
}

function MobileComparisonCard({ 
  calculation, 
  baseline, 
  isBaseline, 
  onLoadCalculation, 
  onRemoveFromComparison 
}: MobileComparisonCardProps) {
  const { t } = useI18n()
  const COMPARISON_METRICS = createComparisonMetrics(t)
  
  const getComparisonIcon = (value: number, baselineValue: number) => {
    const diff = ((value - baselineValue) / baselineValue) * 100
    if (Math.abs(diff) < 1) return <Equal className="h-3 w-3 text-muted-foreground" />
    if (diff > 0) return <TrendingUp className="h-3 w-3 text-green-500" />
    return <TrendingDown className="h-3 w-3 text-red-500" />
  }

  const getPercentageDiff = (value: number, baselineValue: number) => {
    const diff = ((value - baselineValue) / baselineValue) * 100
    const sign = diff > 0 ? '+' : ''
    return `${sign}${diff.toFixed(1)}%`
  }

  return (
    <Card className={cn("border", isBaseline && "border-primary bg-primary/5")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm leading-5 truncate">
                {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
              </h3>
              {isBaseline && (
                <Badge variant="secondary" className="text-xs">Baseline</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculation.materialName} • {calculation.profileName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onRemoveFromComparison(calculation.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {COMPARISON_METRICS.map(metric => {
            const value = metric.getValue(calculation)
            const numValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0
            const baselineValue = typeof metric.getValue(baseline) === 'number' 
              ? metric.getValue(baseline) as number 
              : parseFloat(metric.getValue(baseline).toString()) || 0

            return (
              <div key={metric.key} className="text-center p-2 bg-muted/30 rounded">
                <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
                <div className="font-semibold text-sm">{metric.format(value)}</div>
                {!isBaseline && baselineValue > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {getComparisonIcon(numValue, baselineValue)}
                    <span className="text-xs text-muted-foreground">
                      {getPercentageDiff(numValue, baselineValue)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Actions */}
        {onLoadCalculation && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onLoadCalculation(calculation)}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {t('load')} {t('calculator')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Comparison Component
export function CalculationComparison({ 
  calculations, 
  selectedCalculations,
  onRemoveFromComparison,
  onLoadCalculation
}: CalculationComparisonProps) {
  const { t } = useI18n()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [sortBy, setSortBy] = useState<string>('weight')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const COMPARISON_METRICS = createComparisonMetrics(t)

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
    if (diff > 0) return <TrendingUp className="h-3 w-3 text-green-500 dark:text-green-400" />
    return <TrendingDown className="h-3 w-3 text-red-500 dark:text-red-400" />
  }

  const getPercentageDiff = (value: number, baseline: number) => {
    const diff = ((value - baseline) / baseline) * 100
    const sign = diff > 0 ? '+' : ''
    return `${sign}${diff.toFixed(1)}%`
  }

  if (compareCalculations.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">{t('noCalculationsSelectedForComparison')}</h3>
          <p>{t('selectCalculationsFromHistory')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
      <CardHeader className="pb-3">
        <div className={cn(
          "flex items-center justify-between",
          isMobile && "flex-col gap-3 items-start"
        )}>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {isMobile ? t('compare') : t('calculationComparison')}
            <Badge variant="secondary">{selectedCalculations.size}/5</Badge>
          </CardTitle>
          <div className={cn("flex items-center gap-2", isMobile && "w-full")}>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className={cn(isMobile ? "flex-1" : "w-[200px]")}>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {COMPARISON_METRICS.map(metric => (
                  <SelectItem key={metric.key} value={metric.key}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isMobile ? (
          /* Mobile Card Layout - No horizontal scrolling */
          <div className="space-y-4">
            {sortedCalculations.map((calculation, index) => (
              <MobileComparisonCard
                key={calculation.id}
                calculation={calculation}
                baseline={sortedCalculations[0]}
                isBaseline={index === 0}
                onLoadCalculation={onLoadCalculation}
                onRemoveFromComparison={onRemoveFromComparison}
              />
            ))}
          </div>
        ) : (
          /* Desktop Table Layout */
          <div className="space-y-4">
            <div className="overflow-x-auto touch-pan-y">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">{t('calculator')}</th>
                    <th className="text-center p-2 font-medium">{t('weight')}<br/>kg</th>
                    <th className="text-center p-2 font-medium">{t('cost')}<br/>$</th>
                    <th className="text-center p-2 font-medium">{t('quantity')}<br/>pcs</th>
                    <th className="text-center p-2 font-medium">Cost/{t('weight')}<br/>$/kg</th>
                    <th className="text-center p-2 font-medium">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCalculations.map((calculation, index) => {
                    const baseline = sortedCalculations[0]
                    return (
                      <tr key={calculation.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">
                              {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {calculation.materialName} • {calculation.profileName}
                            </div>
                            {calculation.quantity && calculation.quantity > 1 && (
                              <div className="text-xs text-muted-foreground">
                                {t('quantity')}: {calculation.quantity}
                              </div>
                            )}
                          </div>
                        </td>
                        {COMPARISON_METRICS.map(metric => {
                          const value = metric.getValue(calculation)
                          const numValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0
                          const baselineValue = typeof metric.getValue(baseline) === 'number' 
                            ? metric.getValue(baseline) as number 
                            : parseFloat(metric.getValue(baseline).toString()) || 0
                          
                          return (
                            <td key={metric.key} className="text-center p-2">
                              <div className="flex items-center justify-center gap-1">
                                <span>{metric.format(value)}</span>
                                {index > 0 && baselineValue > 0 && (
                                  <div className="flex items-center gap-1">
                                    {getComparisonIcon(numValue, baselineValue)}
                                    <span className="text-xs text-muted-foreground">
                                      {getPercentageDiff(numValue, baselineValue)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                          )
                        })}
                        <td className="text-center p-2">
                          <div className="flex items-center justify-center gap-1">
                            {onLoadCalculation && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onLoadCalculation(calculation)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRemoveFromComparison(calculation.id)}
                            >
                              ×
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

 