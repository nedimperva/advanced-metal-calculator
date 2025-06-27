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
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/project-context'
import type { Calculation } from '@/lib/types'
import { toast } from '@/hooks/use-toast'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useI18n } from '@/contexts/i18n-context'

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

interface SwipeState {
  calculationId: string
  offset: number
  isActive: boolean
}

const ITEMS_PER_PAGE = 15

export function MobileCalculationHistory({ 
  calculations, 
  onLoadCalculation,
  onMoveToProject,
  onAddToComparison,
  onDeleteCalculation
}: MobileCalculationHistoryProps) {
  const { t } = useI18n()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({
    projectId: 'all',
    search: '',
    dateRange: 'all',
    materialType: 'all',
    profileType: 'all'
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [swipeState, setSwipeState] = useState<SwipeState | null>(null)
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

  // Filter calculations based on history filters
  const filteredCalculations = useMemo(() => {
    let filtered = [...calculations]

    // Project filter
    if (historyFilters.projectId && historyFilters.projectId !== 'all') {
      if (historyFilters.projectId === 'none') {
        filtered = filtered.filter(calc => !calc.projectId)
      } else {
        filtered = filtered.filter(calc => calc.projectId === historyFilters.projectId)
      }
    }

    // Search filter
    if (historyFilters.search) {
      const searchLower = historyFilters.search.toLowerCase()
      filtered = filtered.filter(calc => 
        calc.profileName?.toLowerCase().includes(searchLower) ||
        calc.profileType?.toLowerCase().includes(searchLower) ||
        calc.material?.toLowerCase().includes(searchLower) ||
        calc.materialName?.toLowerCase().includes(searchLower)
      )
    }

    // Date range filter
    if (historyFilters.dateRange && historyFilters.dateRange !== 'all') {
      const now = new Date()
      let cutoffDate = new Date()
      
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

    // Material type filter
    if (historyFilters.materialType && historyFilters.materialType !== 'all') {
      filtered = filtered.filter(calc => calc.material === historyFilters.materialType)
    }

    // Profile type filter
    if (historyFilters.profileType && historyFilters.profileType !== 'all') {
      filtered = filtered.filter(calc => calc.profileType === historyFilters.profileType)
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [calculations, historyFilters])

  const displayedCalculations = filteredCalculations.slice(0, displayedCount)
  const hasMore = displayedCount < filteredCalculations.length

  // Get unique values for filter dropdowns
  const uniqueMaterials = useMemo(() => 
    [...new Set(calculations.map(calc => calc.material).filter(Boolean))], [calculations]
  )
  
  const uniqueProfileTypes = useMemo(() => 
    [...new Set(calculations.map(calc => calc.profileType).filter(Boolean))], [calculations]
  )

  // Pull to refresh
  const [touchStart, setTouchStart] = useState<{ y: number; time: number } | null>(null)
  const [pullDistance, setPullDistance] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      y: e.touches[0].clientY,
      time: Date.now()
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || window.scrollY > 0) return

    const currentY = e.touches[0].clientY
    const distance = currentY - touchStart.y
    
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
      // Simulate refresh - in real app this would refresh calculations
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "History Refreshed",
        description: "Calculation history has been updated",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh calculation history",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Load more calculations
  const loadMore = () => {
    setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredCalculations.length))
  }

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore])

  // Swipe handlers
  const handleSwipeStart = (e: React.TouchEvent, calculationId: string) => {
    const touch = e.touches[0]
    setSwipeState({
      calculationId,
      offset: 0,
      isActive: true
    })
  }

  const handleSwipeMove = (e: React.TouchEvent) => {
    if (!swipeState) return
    
    const touch = e.touches[0]
    const startX = e.currentTarget.getBoundingClientRect().left
    const offset = touch.clientX - startX - (e.currentTarget as HTMLElement).offsetWidth / 2
    
    if (Math.abs(offset) > 10) {
      setSwipeState(prev => prev ? { ...prev, offset: Math.min(Math.max(offset, -120), 120) } : null)
      e.preventDefault()
    }
  }

  const handleSwipeEnd = () => {
    if (swipeState && Math.abs(swipeState.offset) > 60) {
      // Keep the swipe open for actions
      return
    }
    setSwipeState(null)
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'No Project'
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  const exportCalculations = () => {
    const dataStr = JSON.stringify(filteredCalculations, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `calculations-export-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast({
      title: "Export Successful",
      description: `Exported ${filteredCalculations.length} calculations.`,
    })
  }

  const clearFilters = () => {
    setHistoryFilters({
      projectId: 'all',
      search: '',
      dateRange: 'all',
      materialType: 'all',
      profileType: 'all'
    })
    setSearchInput('')
  }

  const hasActiveFilters = historyFilters.projectId !== 'all' || 
                          historyFilters.search || 
                          historyFilters.dateRange !== 'all' || 
                          historyFilters.materialType !== 'all' || 
                          historyFilters.profileType !== 'all'

  if (calculations.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardContent className="text-center py-12">
          <Archive className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">{t('noCalculationsInHistory')}</h3>
          <p className="text-muted-foreground">{t('startCreatingCalculations')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-primary/10 flex items-center justify-center transition-all duration-200"
          style={{ height: `${Math.min(pullDistance, 80)}px` }}
        >
          {pullDistance > 80 ? (
            <div className="text-primary text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('releaseToRefresh')}
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">{t('pullToRefresh')}</div>
          )}
        </div>
      )}

      <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Archive className="h-5 w-5 text-primary" />
              {t('history')}
              <Badge variant="secondary">{filteredCalculations.length}</Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCalculations}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('export')}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search */}
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

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  {t('filters')}
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[80vh]">
                <SheetHeader>
                  <SheetTitle>{t('filterCalculations')}</SheetTitle>
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
                        <SelectItem value="none">{t('noProject')}</SelectItem>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('dateRange')}</label>
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
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('material')}</label>
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
                    <label className="text-sm font-medium mb-2 block">{t('profileType')}</label>
                    <Select
                      value={historyFilters.profileType || 'all'}
                      onValueChange={(value) => setHistoryFilters(prev => ({ ...prev, profileType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('allProfileTypes')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('allProfileTypes')}</SelectItem>
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
                      onClick={clearFilters}
                      className="flex-1"
                    >
                      {t('clearAll')}
                    </Button>
                    <Button 
                      onClick={() => setShowFilters(false)}
                      className="flex-1"
                    >
                      {t('applyFilters')}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
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
                onMoveToProject={(projectId) => onMoveToProject?.(calculation.id, projectId)}
                onDelete={() => onDeleteCalculation?.(calculation.id)}
                projects={projects}
                swipeState={swipeState?.calculationId === calculation.id ? swipeState : null}
                onSwipeStart={(e) => handleSwipeStart(e, calculation.id)}
                onSwipeMove={handleSwipeMove}
                onSwipeEnd={handleSwipeEnd}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex items-center justify-center py-4">
              <Button variant="outline" onClick={loadMore}>
                Load More ({filteredCalculations.length - displayedCount} remaining)
              </Button>
            </div>
          )}

          {filteredCalculations.length === 0 && (
            <div className="text-center py-8">
              <Archive className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No calculations match your filters</p>
              <Button variant="outline" onClick={clearFilters} className="mt-2">
                {t('clearFilters')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Mobile Calculation Card Component
interface MobileCalculationCardProps {
  calculation: Calculation
  projectName: string
  onLoad: () => void
  onAddToComparison: () => void
  onMoveToProject: (projectId: string) => void
  onDelete: () => void
  projects: any[]
  swipeState: SwipeState | null
  onSwipeStart: (e: React.TouchEvent) => void
  onSwipeMove: (e: React.TouchEvent) => void
  onSwipeEnd: () => void
}

function MobileCalculationCard({ 
  calculation, 
  projectName, 
  onLoad, 
  onAddToComparison, 
  onMoveToProject, 
  onDelete, 
  projects,
  swipeState,
  onSwipeStart,
  onSwipeMove,
  onSwipeEnd
}: MobileCalculationCardProps) {
  const { t } = useI18n()
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="relative overflow-hidden">
      {/* Swipe Actions Background */}
      {swipeState && (
        <div className="absolute inset-0 flex items-center justify-between px-4 bg-muted/50">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onAddToComparison}>
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onLoad}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Card */}
      <Card 
        className={cn(
          "transition-transform duration-200 bg-background border",
          swipeState && "transform"
        )}
        style={{
          transform: swipeState ? `translateX(${swipeState.offset}px)` : undefined
        }}
        onTouchStart={onSwipeStart}
        onTouchMove={onSwipeMove}
        onTouchEnd={onSwipeEnd}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm leading-5 truncate">
                {calculation.name || `${calculation.materialName} ${calculation.profileName}`}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {calculation.materialName} • {calculation.profileName}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              onClick={() => setShowActions(!showActions)}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>

          {/* Key Metrics */}
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

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            <Badge variant="outline" className="text-xs">
              {projectName}
            </Badge>
            <span className="text-muted-foreground">
              {calculation.timestamp.toLocaleDateString()}
            </span>
          </div>

          {/* Expandable Actions */}
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
                    {projects.map(project => (
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

          {/* Swipe hint */}
          {!showActions && (
            <div className="text-center mt-2 pt-2 border-t border-dashed">
              <p className="text-xs text-muted-foreground">
                Swipe left/right for quick actions
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 