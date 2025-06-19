"use client"

import React, { useState, useEffect, useMemo } from 'react'
// Router no longer needed - navigation handled by parent
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Grid3X3, 
  List, 
  ArrowUpDown, 
  SortAsc, 
  SortDesc,
  FolderOpen,
  Calendar,
  DollarSign,
  BarChart3,
  TrendingUp,
  Users,
  CheckSquare,
  Trash2,
  Edit,
  Layers,
  RefreshCw
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

// View modes
type ViewMode = 'grid' | 'list'

// Bulk action types
type BulkAction = 'delete' | 'status-change' | 'export'

interface ProjectDashboardProps {
  className?: string
  showHeader?: boolean
  maxProjects?: number
  onProjectSelect?: (project: Project) => void
  onCreateProject?: () => void
  onEditProject?: (project: Project) => void
}

export default function ProjectDashboard({ 
  className, 
  showHeader = true,
  maxProjects,
  onProjectSelect,
  onCreateProject,
  onEditProject 
}: ProjectDashboardProps) {
  // Router no longer needed - navigation handled by parent
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  
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
    deleteProject,
    refreshProjects
  } = useProjects()

  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set())
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [bulkStatusChange, setBulkStatusChange] = useState<ProjectStatus | null>(null)

  // Search debouncing
  const [searchInput, setSearchInput] = useState(searchTerm)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, setSearchTerm])

  // Get filtered and sorted projects
  const filteredProjects = useMemo(() => {
    const filtered = getFilteredProjects()
    return maxProjects ? filtered.slice(0, maxProjects) : filtered
  }, [getFilteredProjects, maxProjects, projects, searchTerm, filters, sortField, sortDirection])

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(new Set(filteredProjects.map(p => p.id)))
    } else {
      setSelectedProjects(new Set())
    }
  }

  const handleSelectProject = (projectId: string, checked: boolean) => {
    const newSelection = new Set(selectedProjects)
    if (checked) {
      newSelection.add(projectId)
    } else {
      newSelection.delete(projectId)
    }
    setSelectedProjects(newSelection)
  }

  // Navigation handlers
  const handleCreateProject = () => {
    if (onCreateProject) {
      onCreateProject()
    } else {
      // Project creation will be handled within the tab system
      console.log('Create new project')
    }
  }

  const handleViewTemplates = () => {
    if (onCreateProject) {
      onCreateProject()
    } else {
      // Template viewing will be handled within the tab system
      console.log('View templates')
    }
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

  // Bulk actions
  const handleBulkDelete = async () => {
    setBulkActionLoading(true)
    try {
      await Promise.all(
        Array.from(selectedProjects).map(id => deleteProject(id))
      )
      setSelectedProjects(new Set())
      setShowBulkDeleteDialog(false)
      toast({
        title: "Projects Deleted",
        description: `Successfully deleted ${selectedProjects.size} projects`,
      })
    } catch (error) {
      console.error('Failed to delete projects:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete some projects",
        variant: "destructive"
      })
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkStatusChange = async (status: ProjectStatus) => {
    setBulkActionLoading(true)
    try {
      // This would require implementing updateProject with status change
      // For now, just show a toast
      toast({
        title: "Status Update",
        description: `Status change for ${selectedProjects.size} projects is not yet implemented`,
      })
      setSelectedProjects(new Set())
    } catch (error) {
      console.error('Failed to update project statuses:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update project statuses",
        variant: "destructive"
      })
    } finally {
      setBulkActionLoading(false)
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
      <div className={cn("w-full", className)}>
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
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage your construction projects and track materials
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* <Button variant="outline" onClick={handleViewTemplates}>
              <Layers className="h-4 w-4 mr-2" />
              Templates
            </Button> */}
            <Button onClick={handleCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{statistics.totalProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">{statistics.projectsByStatus.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">${statistics.totalBudget.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{statistics.completionRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 sticky top-0 z-40 backdrop-blur-sm bg-background/95 border-b border-border/50 pb-4 mb-4 -mx-4 px-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Status Filter */}
        <Select
          value={filters.status?.[0] || 'all'}
          onValueChange={(value) => 
            setFilters({ 
              status: value === 'all' ? undefined : [value as ProjectStatus] 
            })
          }
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="All Statuses" />
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
        
        {/* Sort */}
        <Select
          value={sortField}
          onValueChange={(value) => setSorting(value as ProjectSortField)}
        >
          <SelectTrigger className="w-full lg:w-[150px]">
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
        
        {/* Sort Direction */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSorting(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
        >
          {sortDirection === 'asc' ? 
            <SortAsc className="h-4 w-4" /> : 
            <SortDesc className="h-4 w-4" />
          }
        </Button>
        
        {/* View Mode Toggle */}
        {isDesktop && (
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Clear Filters */}
        {(searchTerm || filters.status) && (
          <Button variant="outline" onClick={clearFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedProjects.size > 0 && (
        <Card className="border-primary/20 bg-primary/5 sticky top-16 z-30 backdrop-blur-sm bg-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedProjects.size === filteredProjects.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedProjects.size} of {filteredProjects.length} projects selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusOptions.map((status) => (
                      <DropdownMenuItem 
                        key={status.value}
                        onClick={() => handleBulkStatusChange(status.value)}
                      >
                        {status.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowBulkDeleteDialog(true)}
                  disabled={bulkActionLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Projects List */}
      {!isLoading && (
        <div>
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filters.status 
                    ? "No projects match your current filters."
                    : "Get started by creating your first project."
                  }
                </p>
                {!searchTerm && !filters.status && (
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={handleCreateProject}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Project
                    </Button>
                    <Button variant="outline" onClick={handleViewTemplates}>
                      <Layers className="h-4 w-4 mr-2" />
                      Browse Templates
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isSelected={selectedProjects.has(project.id)}
                      onSelect={(checked) => handleSelectProject(project.id, checked)}
                      onView={() => handleViewProject(project.id)}
                      onEdit={() => handleEditProject(project.id)}
                      showSelection={selectedProjects.size > 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isSelected={selectedProjects.has(project.id)}
                      onSelect={(checked) => handleSelectProject(project.id, checked)}
                      onView={() => handleViewProject(project.id)}
                      onEdit={() => handleEditProject(project.id)}
                      showSelection={selectedProjects.size > 0}
                      variant="list"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Projects</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProjects.size} projects? 
              This action cannot be undone and will also delete all associated materials and calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkActionLoading}
            >
              {bulkActionLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Projects'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 