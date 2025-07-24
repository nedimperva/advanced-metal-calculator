"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Users, 
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/project-context'
import { 
  PROJECT_STATUS_LABELS, 
  PROJECT_STATUS_COLORS,
  calculateTaskBasedProjectProgress,
  calculateTaskBasedBudget
} from '@/lib/project-utils'
import type { Project } from '@/lib/types'
import { toast } from '@/hooks/use-toast'

interface ProjectCardProps {
  project: Project
  variant?: 'grid' | 'list'
  isSelected?: boolean
  onSelect?: (checked: boolean) => void
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showSelection?: boolean
  className?: string
}

export default function ProjectCard({
  project,
  variant = 'grid',
  isSelected = false,
  onSelect,
  onView,
  onEdit,
  onDelete,
  showSelection = false,
  className
}: ProjectCardProps) {
  const { deleteProject } = useProjects()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<any>(null)
  const [budget, setBudget] = useState<any>(null)

  // Load project analytics on mount
  React.useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [progressData, budgetData] = await Promise.all([
          calculateTaskBasedProjectProgress(project),
          calculateTaskBasedBudget(project)
        ])
        setProgress(progressData)
        setBudget(budgetData)
      } catch (error) {
        console.error('Failed to load project analytics:', error)
      }
    }

    loadAnalytics()
  }, [project.id])

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteProject(project.id)
      toast({
        title: "Project Deleted",
        description: `Successfully deleted project "${project.name}"`,
      })
      onDelete?.()
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete project",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger view if clicking on interactive elements
    if (
      e.target instanceof HTMLElement && 
      (e.target.closest('button') || 
       e.target.closest('[role="checkbox"]') ||
       e.target.closest('[role="menu"]') ||
       e.target.closest('[role="menuitem"]') ||
       e.target.closest('[data-radix-collection-item]'))
    ) {
      return
    }
    onView?.()
  }

  // Calculate derived data
  const calculationsCount = project.calculationIds?.length || 0
  const isOverdue = project.deadline && new Date(project.deadline) < new Date()
  const daysUntilDeadline = project.deadline 
    ? Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Status color classes
  const statusColorClass = `bg-${PROJECT_STATUS_COLORS[project.status]}-50 border-${PROJECT_STATUS_COLORS[project.status]}-200 text-${PROJECT_STATUS_COLORS[project.status]}-700`

  if (variant === 'list') {
    return (
      <Card 
        className={cn(
          "group hover:shadow-md transition-all duration-200 cursor-pointer",
          isSelected && "ring-2 ring-primary",
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Selection Checkbox */}
            {showSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelect}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Project Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <Badge variant="outline" className={cn("text-xs", statusColorClass)}>
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground truncate mb-2">
                {project.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(project.createdAt).toLocaleDateString()}
                </div>
                
                {project.client && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="truncate max-w-32">{project.client}</span>
                  </div>
                )}
                
                {project.totalBudget && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${project.totalBudget.toLocaleString()}
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  {calculationsCount} calculations
                </div>

                {progress && (
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    {progress.completionPercentage.toFixed(0)}% complete
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  onView?.()
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  console.log('Edit button clicked (first instance)')
                  onEdit?.()
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{project.name}"? This action cannot be undone and will also delete all associated materials and calculations.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isLoading}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid variant (default)
  return (
    <Card 
      className={cn(
        "group hover:shadow-lg transition-all duration-200 cursor-pointer h-full",
        isSelected && "ring-2 ring-primary",
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {/* Selection Checkbox */}
          {showSelection && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
          )}
          
          <div className="flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <Badge variant="outline" className={cn("text-xs", statusColorClass)}>
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {project.description}
            </p>

            {/* Status Indicators */}
            <div className="flex items-center gap-2 mb-3">
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
              {daysUntilDeadline !== null && daysUntilDeadline > 0 && daysUntilDeadline <= 7 && (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                  <Clock className="h-3 w-3 mr-1" />
                  {daysUntilDeadline} days left
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                onView?.()
              }}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                console.log('Edit button clicked (second instance)')
                onEdit?.()
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{project.name}"? This action cannot be undone and will also delete all associated materials and calculations.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isLoading}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Progress Indicator */}
        {progress && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {progress.completionPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress.completionPercentage} className="h-2" />
            {progress.taskProgress.totalTasks > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {progress.taskProgress.completedTasks}/{progress.taskProgress.totalTasks} tasks completed
              </div>
            )}
          </div>
        )}

        {/* Project Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Calculations</p>
              <p className="font-medium">{calculationsCount}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          {project.totalBudget && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Budget</p>
                <p className="font-medium">${project.totalBudget.toLocaleString()}</p>
              </div>
            </div>
          )}
          
          {project.client && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Client</p>
                <p className="font-medium truncate">{project.client}</p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-sm">
          {project.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{project.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          
          {project.deadline && (
            <div className={cn(
              "flex items-center gap-2",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}>
              <Clock className="h-4 w-4" />
              <span>
                Due {new Date(project.deadline).toLocaleDateString()}
                {daysUntilDeadline !== null && (
                  <span className="ml-1">
                    ({daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'overdue'})
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Budget Utilization */}
        {budget && project.totalBudget && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Budget Used</span>
              <span className={cn(
                "text-sm",
                budget.budgetUtilization > 100 ? "text-destructive" : 
                budget.budgetUtilization > 80 ? "text-orange-600" : "text-muted-foreground"
              )}>
                {budget.budgetUtilization.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={Math.min(budget.budgetUtilization, 100)} 
              className={cn(
                "h-2",
                budget.budgetUtilization > 100 && "[&>div]:bg-destructive"
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>${budget.totalActualCost.toFixed(0)} used</span>
              <span>${budget.remainingBudget.toFixed(0)} remaining</span>
            </div>
            {budget.budgetAlerts.length > 0 && (
              <div className="mt-2">
                {budget.budgetAlerts.slice(0, 1).map((alert, index) => (
                  <div key={index} className={cn(
                    "text-xs px-2 py-1 rounded",
                    alert.type === 'critical' ? "bg-destructive/10 text-destructive" :
                    alert.type === 'warning' ? "bg-orange-50 text-orange-600" :
                    "bg-blue-50 text-blue-600"
                  )}>
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    {alert.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Loading skeleton for project cards
export function ProjectCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' }) {
  if (variant === 'list') {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-4" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full max-w-md" />
              <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  )
} 