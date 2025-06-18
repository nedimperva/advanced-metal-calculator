"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Edit, 
  Trash2, 
  Share2, 
  Download, 
  MoreVertical,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Tag,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Copy,
  ExternalLink,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/project-context'
import { 
  PROJECT_STATUS_LABELS, 
  PROJECT_STATUS_COLORS,
  calculateProjectProgress,
  calculateProjectCosts
} from '@/lib/project-utils'
import { ProjectStatus, type Project } from '@/lib/types'
import { LoadingSpinner } from '@/components/loading-states'
import { toast } from '@/hooks/use-toast'

interface ProjectDetailsProps {
  project: Project
  onEdit?: () => void
  onDelete?: () => void
  onStatusChange?: (status: ProjectStatus) => void
  onUpdate?: () => void
  className?: string
}

export default function ProjectDetails({
  project,
  onEdit,
  onDelete,
  onStatusChange,
  onUpdate,
  className
}: ProjectDetailsProps) {
  const router = useRouter()
  const { updateProject, deleteProject } = useProjects()
  
  // Local state
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [progress, setProgress] = useState<any>(null)
  const [costs, setCosts] = useState<any>(null)
  const [notes, setNotes] = useState(project.notes || '')

  // Load project analytics
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [progressData, costsData] = await Promise.all([
          calculateProjectProgress(project),
          calculateProjectCosts(project)
        ])
        setProgress(progressData)
        setCosts(costsData)
      } catch (error) {
        console.error('Failed to load project analytics:', error)
      }
    }

    loadAnalytics()
  }, [project])

  // Handle status change
  const handleStatusChange = async (newStatus: ProjectStatus) => {
    setIsLoading(true)
    try {
      const updatedProject = {
        ...project,
        status: newStatus
      }
      
      await updateProject(updatedProject)
      onStatusChange?.(newStatus)
      onUpdate?.()
      
      toast({
        title: "Status Updated",
        description: `Project status changed to ${PROJECT_STATUS_LABELS[newStatus]}`,
      })
    } catch (error) {
      console.error('Failed to update project status:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update project status",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deleteProject(project.id)
      setShowDeleteDialog(false)
      onDelete?.()
      
      toast({
        title: "Project Deleted",
        description: `Successfully deleted project "${project.name}"`,
      })
      
      // Navigate back to projects list
      router.push('/projects')
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

  // Handle notes save
  const handleSaveNotes = async () => {
    setIsLoading(true)
    try {
      const updatedProject = {
        ...project,
        notes
      }
      
      await updateProject(updatedProject)
      setShowNotesDialog(false)
      onUpdate?.()
      
      toast({
        title: "Notes Saved",
        description: "Project notes have been updated",
      })
    } catch (error) {
      console.error('Failed to save notes:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save project notes",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle share
  const handleShare = async () => {
    try {
      const shareData = {
        title: `Project: ${project.name}`,
        text: `Check out this project: ${project.name}\n${project.description || ''}`,
        url: window.location.href
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
        toast({
          title: "Link Copied",
          description: "Project link copied to clipboard",
        })
      }
      
      setShowShareDialog(false)
    } catch (error) {
      console.error('Failed to share project:', error)
      toast({
        title: "Share Failed",
        description: "Failed to share project",
        variant: "destructive"
      })
    }
  }

  // Handle export
  const handleExport = () => {
    try {
      const exportData = {
        project: {
          ...project,
          progress,
          costs
        },
        exportedAt: new Date().toISOString(),
        exportedBy: 'Advanced Metal Calculator'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `project-${project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: "Project data has been exported",
      })
    } catch (error) {
      console.error('Failed to export project:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export project data",
        variant: "destructive"
      })
    }
  }

  // Calculate derived data
  const isOverdue = project.deadline && new Date(project.deadline) < new Date()
  const daysUntilDeadline = project.deadline 
    ? Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  // Status options for dropdown
  const statusOptions = Object.values(ProjectStatus).map(status => ({
    value: status,
    label: PROJECT_STATUS_LABELS[status],
    color: PROJECT_STATUS_COLORS[status]
  }))

  return (
    <div className={cn("space-y-6", className)}>
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl lg:text-3xl truncate">
                  {project.name}
                </CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-sm",
                    `bg-${PROJECT_STATUS_COLORS[project.status]}-50 border-${PROJECT_STATUS_COLORS[project.status]}-200 text-${PROJECT_STATUS_COLORS[project.status]}-700`
                  )}
                >
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
              
              {project.description && (
                <p className="text-muted-foreground text-lg">
                  {project.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Status Change Dropdown */}
              <Select 
                value={project.status} 
                onValueChange={handleStatusChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Edit Button */}
              <Button onClick={onEdit} disabled={isLoading}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              {/* More Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" disabled={isLoading}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {progress.completionPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={progress.completionPercentage} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {progress.materialsCompleted}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {progress.materialsInProgress}
                </div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {progress.materialsPending}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  {progress.totalMaterials}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.client && (
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm text-muted-foreground">Client</Label>
                  <p className="font-medium">{project.client}</p>
                </div>
              </div>
            )}
            
            {project.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  <p className="font-medium">{project.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label className="text-sm text-muted-foreground">Created</Label>
                <p className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {project.deadline && (
              <div className="flex items-center gap-3">
                <Clock className={cn(
                  "h-4 w-4",
                  isOverdue ? "text-destructive" : "text-muted-foreground"
                )} />
                <div>
                  <Label className="text-sm text-muted-foreground">Deadline</Label>
                  <p className={cn(
                    "font-medium",
                    isOverdue && "text-destructive"
                  )}>
                    {new Date(project.deadline).toLocaleDateString()}
                    {daysUntilDeadline !== null && (
                      <span className="ml-2 text-sm">
                        ({daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'overdue'})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
            
            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Tags</Label>
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.totalBudget && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-muted-foreground">Total Budget</Label>
                  <span className="font-bold text-lg">
                    ${project.totalBudget.toLocaleString()} {project.currency}
                  </span>
                </div>
                
                {costs && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm text-muted-foreground">Spent</Label>
                      <span className="font-medium">
                        ${costs.totalCost.toLocaleString()} {project.currency}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm text-muted-foreground">Remaining</Label>
                      <span className={cn(
                        "font-medium",
                        costs.budgetUtilization > 100 ? "text-destructive" : "text-green-600"
                      )}>
                        ${(project.totalBudget - costs.totalCost).toLocaleString()} {project.currency}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm text-muted-foreground">Budget Used</Label>
                        <span className={cn(
                          "text-sm font-medium",
                          costs.budgetUtilization > 100 ? "text-destructive" : 
                          costs.budgetUtilization > 80 ? "text-orange-600" : "text-green-600"
                        )}>
                          {costs.budgetUtilization.toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(costs.budgetUtilization, 100)} 
                        className={cn(
                          "h-2",
                          costs.budgetUtilization > 100 && "[&>div]:bg-destructive"
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {project.materials?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Materials</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {project.calculationIds?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Calculations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowNotesDialog(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Notes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {project.notes ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {project.notes}
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              No notes added yet. Click "Edit Notes" to add project notes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
            <DialogDescription>
              Share this project with others or copy the link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Link</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  value={window.location.href} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(window.location.href)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Edit Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project Notes</DialogTitle>
            <DialogDescription>
              Add or update notes for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter project notes..."
              className="min-h-32"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Save Notes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 