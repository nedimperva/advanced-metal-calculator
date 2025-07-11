"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
// Router no longer needed - navigation handled by parent
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ArrowUpDown,
  FolderOpen,
  Calendar,
  DollarSign,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Layers,
  ChevronDown,
  X
} from 'lucide-react'
import { useProjects } from '@/contexts/project-context'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { 
  PROJECT_STATUS_LABELS, 
  PROJECT_STATUS_COLORS,
  type ProjectSortField 
} from '@/lib/project-utils'
import { ProjectStatus, type Project } from '@/lib/types'
import { LoadingSpinner } from '@/components/loading-states'
import ProjectCard from '@/components/project-card'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

interface MobileProjectDashboardProps {
  className?: string
  maxProjects?: number
  onProjectSelect?: (project: Project) => void
  onCreateProject?: () => void
  onEditProject?: (project: Project) => void
}

export default function MobileProjectDashboard({ 
  className,
  maxProjects,
  onProjectSelect,
  onCreateProject,
  onEditProject 
}: MobileProjectDashboardProps) {
  const { t } = useI18n()
  // Router no longer needed - navigation handled by parent
  const isMobile = !useMediaQuery("(min-width: 768px)")
  
  // Project context
  const {
    projects,
    isLoading,
    error,
    statistics,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortField,
    sortDirection,
    setSorting,
    clearFilters,
    getFilteredProjects,
    refreshProjects
  } = useProjects()

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(searchTerm)
  const [displayedProjects, setDisplayedProjects] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Refs for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const pullToRefreshRef = useRef<HTMLDivElement>(null)

  // Constants
  const ITEMS_PER_PAGE = 10

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, setSearchTerm])

  // Get filtered projects with memoization
  const filteredProjects = useMemo(() => {
    return getFilteredProjects()
  }, [getFilteredProjects, projects, searchTerm, filters, sortField, sortDirection])

  // Update displayed projects when filters change
  useEffect(() => {
    const projectsToShow = maxProjects 
      ? filteredProjects.slice(0, maxProjects)
      : filteredProjects.slice(0, ITEMS_PER_PAGE)
    
    setDisplayedProjects(projectsToShow)
    setHasMore(filteredProjects.length > projectsToShow.length)
  }, [filteredProjects, maxProjects])

  // Pull to refresh
  const handlePullToRefresh = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      await refreshProjects()
      toast({
        title: "Projects Refreshed",
        description: "Project list has been updated",
      })
    } catch (error) {
      console.error('Failed to refresh projects:', error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh projects",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing, refreshProjects])

  // Infinite scroll
  const loadMoreProjects = useCallback(() => {
    if (loadingMore || !hasMore || maxProjects) return

    setLoadingMore(true)
    setTimeout(() => {
      setDisplayedProjects(prev => {
        const currentCount = prev.length
        const nextBatch = filteredProjects.slice(currentCount, currentCount + ITEMS_PER_PAGE)
        const newProjects = [...prev, ...nextBatch]
        
        setHasMore(newProjects.length < filteredProjects.length)
        return newProjects
      })
      setLoadingMore(false)
    }, 500) // Simulate loading delay
  }, [loadingMore, hasMore, maxProjects, filteredProjects])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || maxProjects) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreProjects()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [loadMoreProjects, maxProjects])

  // Touch handlers for pull to refresh
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
    
    if (distance > 0 && distance < 100) {
      setPullDistance(distance)
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      handlePullToRefresh()
    }
    setPullDistance(0)
    setTouchStart(null)
  }

  // Navigation handlers
  const handleCreateProject = () => {
    if (onCreateProject) {
      onCreateProject()
    } else {
      // Emit event to parent to show create dialog
      const event = new CustomEvent('showCreateProjectDialog')
      window.dispatchEvent(event)
    }
  }

  const handleViewTemplates = () => {
    // Template viewing will be handled within the tab system
    console.log('View templates')
  }

  const handleViewProject = (projectId: string) => {
    if (onProjectSelect) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        onProjectSelect(project)
      }
    } else {
      // Project viewing will be handled within the tab system
      console.log('View project:', projectId)
    }
  }

  const handleEditProject = (projectId: string) => {
    if (onEditProject) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        onEditProject(project)
      }
    } else {
      console.log('Edit project:', projectId)
    }
  }

  // Sort options
  const sortOptions: { value: ProjectSortField; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'status', label: 'Status' },
    { value: 'budget', label: 'Budget' }
  ]

  // Status filter options
  const statusOptions = Object.values(ProjectStatus).map(status => ({
    value: status,
    label: PROJECT_STATUS_LABELS[status],
    color: PROJECT_STATUS_COLORS[status]
  }))

  if (error) {
    return (
      <div className={cn("w-full p-4", className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-destructive mb-4">
              <FolderOpen className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to Load Projects</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshProjects}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-primary/10 flex items-center justify-center transition-all duration-200"
          style={{ height: `${Math.min(pullDistance, 60)}px` }}
        >
          {pullDistance > 60 ? (
            <div className="text-primary text-sm font-medium">Release to refresh</div>
          ) : (
            <div className="text-muted-foreground text-sm">Pull to refresh</div>
          )}
        </div>
      )}

      {/* Touch area for pull to refresh */}
      <div
        ref={pullToRefreshRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="min-h-screen"
      >
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Projects</h1>
              <p className="text-sm text-muted-foreground">
                {filteredProjects.length} projects
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleViewTemplates}>
                <Layers className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleCreateProject}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchProjects')}
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

          {/* Filters and Sort */}
          <div className="flex items-center gap-2">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(filters.status || searchTerm) && (
                    <Badge variant="secondary" className="ml-2 h-5 text-xs">
                      {(filters.status?.length || 0) + (searchTerm ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[400px]">
                <SheetHeader>
                  <SheetTitle>Filter Projects</SheetTitle>
                  <SheetDescription>
                    Filter and sort your projects
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-4 mt-6">
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={filters.status?.[0] || 'all'}
                      onValueChange={(value) => 
                        setFilters({ 
                          status: value === 'all' ? undefined : [value as ProjectStatus] 
                        })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder={t('allStatuses')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-sm font-medium">Sort By</label>
                    <Select
                      value={sortField}
                      onValueChange={(value) => setSorting(value as ProjectSortField)}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Direction */}
                  <div>
                    <label className="text-sm font-medium">Order</label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={sortDirection === 'asc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSorting(sortField, 'asc')}
                        className="flex-1"
                      >
                        Ascending
                      </Button>
                      <Button
                        variant={sortDirection === 'desc' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSorting(sortField, 'desc')}
                        className="flex-1"
                      >
                        Descending
                      </Button>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(searchTerm || filters.status) && (
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSorting(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {statistics && !maxProjects && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-lg font-bold">{statistics.totalProjects}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Active</p>
                      <p className="text-lg font-bold">{statistics.projectsByStatus.active}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && displayedProjects.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Projects List */}
        {!isLoading && (
          <div className="px-4 pb-20">
            {displayedProjects.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filters.status 
                      ? "No projects match your current filters."
                      : "Get started by creating your first project."
                    }
                  </p>
                  {!searchTerm && !filters.status && (
                    <div className="space-y-2">
                      <Button onClick={handleCreateProject} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Project
                      </Button>
                      {/* <Button variant="outline" onClick={handleViewTemplates} className="w-full">
                        <Layers className="h-4 w-4 mr-2" />
                        Browse Templates
                      </Button> */}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    variant="list"
                    onView={() => handleViewProject(project.id)}
                    onEdit={() => handleEditProject(project.id)}
                  />
                ))}
                
                {/* Load More Trigger */}
                {hasMore && !maxProjects && (
                  <div ref={loadMoreRef} className="py-4">
                    {loadingMore && (
                      <div className="flex items-center justify-center">
                        <LoadingSpinner />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading more projects...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {isMobile && !maxProjects && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            onClick={handleCreateProject}
            className="rounded-full h-14 w-14 shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )
} 