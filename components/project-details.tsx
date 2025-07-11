"use client"

import React, { useState, useEffect } from 'react'
// Router no longer needed - navigation handled by parent
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
import { useMediaQuery } from '@/hooks/use-media-query'
import { 
  PROJECT_STATUS_LABELS, 
  PROJECT_STATUS_COLORS,
  calculateProjectProgress,
  calculateProjectCosts
} from '@/lib/project-utils'
import { ProjectStatus, type Project } from '@/lib/types'
import { LoadingSpinner } from '@/components/loading-states'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

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
  // Router no longer needed - navigation handled by parent
  const { updateProject, deleteProject } = useProjects()
  const { t, language } = useI18n()
  const isMobile = useMediaQuery("(max-width: 767px)")
  
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
      
      // Navigation will be handled by parent component
      console.log('Project deleted, navigate back to projects')
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
      if (navigator.share) {
        await navigator.share({
          title: `Project: ${project.name}`,
          text: `Check out this construction project: ${project.name}`,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link Copied",
          description: "Project link has been copied to clipboard",
        })
      }
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
        project,
        analytics: {
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
    <div className={cn("space-y-4 md:space-y-6", className)}>
      {/* Project Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className={cn(
                    "text-xl md:text-2xl lg:text-3xl leading-tight",
                    isMobile ? "break-words" : "truncate"
                  )}>
                    {project.name}
                  </CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-sm shrink-0",
                      `bg-${PROJECT_STATUS_COLORS[project.status]}-50 border-${PROJECT_STATUS_COLORS[project.status]}-200 text-${PROJECT_STATUS_COLORS[project.status]}-700`
                    )}
                  >
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="destructive" className="shrink-0">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
              
              {project.description && (
                <p className={cn(
                  "text-muted-foreground leading-relaxed",
                  isMobile ? "text-sm" : "text-lg"
                )}>
                  {project.description}
                </p>
              )}
            </div>
            
            {/* Action Buttons - Mobile Optimized */}
            <div className={cn(
              "flex gap-2",
              isMobile ? "flex-col" : "flex-row items-center justify-end"
            )}>
              {/* Status Change Dropdown */}
              <Select 
                value={project.status} 
                onValueChange={handleStatusChange}
                disabled={isLoading}
              >
                <SelectTrigger className={cn(
                  isMobile ? "w-full h-12" : "w-40"
                )}>
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
              
              <div className={cn(
                "flex gap-2",
                isMobile ? "w-full" : ""
              )}>
                {/* Edit Button */}
                <Button 
                  onClick={onEdit} 
                  disabled={isLoading}
                  className={cn(
                    isMobile ? "flex-1 h-12" : ""
                  )}
                >
                  <Edit className="h-4 w-4 mr-2" />
{language === 'bs' ? 'Izmijeni' : 'Edit'}
                </Button>
                
                {/* More Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size={isMobile ? "default" : "icon"}
                      disabled={isLoading}
                      className={cn(
                        isMobile ? "h-12 px-4" : "h-10 w-10"
                      )}
                    >
                      <MoreVertical className="h-4 w-4" />
                      {isMobile && <span className="ml-2">More</span>}
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
          </div>
        </CardHeader>
      </Card>

      {/* Progress Overview */}
      {progress && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
{language === 'bs' ? 'Pregled Progresa' : 'Progress Overview'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{language === 'bs' ? 'Ukupan Progres' : 'Overall Progress'}</span>
                <span className="text-sm text-muted-foreground">
                  {progress.completionPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={progress.completionPercentage} className="h-3" />
            </div>
            
            <div className={cn(
              "grid gap-3",
              isMobile ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"
            )}>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {progress.materialsInstalled}
                </div>
                <div className="text-xs text-muted-foreground">{language === 'bs' ? 'Završeno' : 'Completed'}</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {progress.materialsInProgress}
                </div>
                <div className="text-xs text-muted-foreground">{language === 'bs' ? 'U Toku' : 'In Progress'}</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {progress.materialsPending}
                </div>
                <div className="text-xs text-muted-foreground">{language === 'bs' ? 'Na Čekanju' : 'Pending'}</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-lg font-bold text-foreground">
                  {progress.totalMaterials}
                </div>
                <div className="text-xs text-muted-foreground">{language === 'bs' ? 'Ukupno' : 'Total'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workforce Summary */}
      {costs && costs.workforceBreakdown && costs.workforceBreakdown.daysWorked > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
{language === 'bs' ? 'Pregled Radne Snage' : 'Workforce Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={cn(
              "grid gap-3",
              isMobile ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"
            )}>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {costs.workforceBreakdown.totalLaborHours.toFixed(1)}h
                </div>
                <div className="text-xs text-muted-foreground">{language === 'bs' ? 'Radni Sati' : 'Labor Hours'}</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {costs.workforceBreakdown.totalMachineryHours.toFixed(1)}h
                </div>
                <div className="text-xs text-muted-foreground">{language === 'bs' ? 'Sati Mašina' : 'Machine Hours'}</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {costs.workforceBreakdown.uniqueWorkers}
                </div>
                <div className="text-xs text-muted-foreground">{language === 'bs' ? 'Radnici' : 'Workers'}</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {costs.workforceBreakdown.daysWorked}
                </div>
                <div className="text-xs text-muted-foreground">Work Days</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm text-muted-foreground">Average Daily Cost</span>
              <span className="font-medium">
                ${costs.workforceBreakdown.averageDailyCost.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Information - Mobile Optimized Grid */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
      )}>
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
{language === 'bs' ? 'Informacije o Projektu' : 'Project Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.client && (
              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div className="min-w-0 flex-1">
                  <Label className="text-sm text-muted-foreground">Client</Label>
                  <p className={cn(
                    "font-medium",
                    isMobile ? "break-words" : ""
                  )}>{project.client}</p>
                </div>
              </div>
            )}
            
            {project.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                <div className="min-w-0 flex-1">
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  <p className={cn(
                    "font-medium",
                    isMobile ? "break-words" : ""
                  )}>{project.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div>
                                  <Label className="text-sm text-muted-foreground">{language === 'bs' ? 'Kreirano' : 'Created'}</Label>
                <p className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {project.deadline && (
              <div className="flex items-start gap-3">
                <Clock className={cn(
                  "h-4 w-4 mt-1 shrink-0",
                  isOverdue ? "text-destructive" : "text-muted-foreground"
                )} />
                <div className="min-w-0 flex-1">
                  <Label className="text-sm text-muted-foreground">Deadline</Label>
                  <p className={cn(
                    "font-medium",
                    isOverdue && "text-destructive"
                  )}>
                    {new Date(project.deadline).toLocaleDateString()}
                    {daysUntilDeadline !== null && (
                      <span className="block text-sm">
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
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5" />
{language === 'bs' ? 'Budžet i Troškovi' : 'Budget & Costs'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.totalBudget && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm text-muted-foreground">Total Budget</Label>
                  <span className={cn(
                    "font-bold",
                    isMobile ? "text-base" : "text-lg"
                  )}>
                    ${project.totalBudget.toLocaleString()} {project.currency}
                  </span>
                </div>
                
                {costs && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm text-muted-foreground">Total Spent</Label>
                      <span className="font-medium">
                        ${costs.totalActualCost.toLocaleString()} {project.currency}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm text-muted-foreground">Remaining</Label>
                      <span className={cn(
                        "font-medium",
                        costs.budgetUtilization > 100 ? "text-destructive" : "text-green-600"
                      )}>
                        ${costs.remainingBudget.toLocaleString()} {project.currency}
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
            
            {/* Cost Breakdown */}
            {costs && (
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm font-medium">{language === 'bs' ? 'Raspored Troškova' : 'Cost Breakdown'}</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm text-blue-700">{language === 'bs' ? 'Materijali' : 'Materials'}</span>
                    <span className="font-medium text-blue-700">
                      ${costs.totalMaterialCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-sm text-green-700">{language === 'bs' ? 'Rad' : 'Labor'}</span>
                    <span className="font-medium text-green-700">
                      ${costs.totalLaborCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-sm text-orange-700">{language === 'bs' ? 'Mašine' : 'Machinery'}</span>
                    <span className="font-medium text-orange-700">
                      ${costs.totalMachineryCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {project.materials?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">{language === 'bs' ? 'Materijali' : 'Materials'}</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {project.calculationIds?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">{language === 'bs' ? 'Izračuni' : 'Calculations'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes Section - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
{language === 'bs' ? 'Napomene' : 'Notes'}
            </CardTitle>
            <Button 
              variant="outline" 
              size={isMobile ? "default" : "sm"}
              onClick={() => setShowNotesDialog(true)}
              className={cn(isMobile && "h-10")}
            >
              <Edit className="h-4 w-4 mr-2" />
{language === 'bs' ? 'Izmijeni Napomene' : 'Edit Notes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {project.notes ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {project.notes}
            </div>
          ) : (
            <p className="text-muted-foreground italic text-sm">
{language === 'bs' ? 'Još nema dodanih napomena. Kliknite "Izmijeni Napomene" da dodajte napomene projekta.' : 'No notes added yet. Click "Edit Notes" to add project notes.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Notes Edit Dialog - Mobile Optimized */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className={cn(
          isMobile 
            ? "max-w-[95vw] max-h-[90vh] w-full h-auto" 
            : "max-w-2xl max-h-[90vh]"
        )}>
          <DialogHeader>
            <DialogTitle>Edit Project Notes</DialogTitle>
            <DialogDescription>
              Add notes about this project, such as special requirements or observations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter project notes..."
              className={cn(
                "min-h-[200px] resize-none",
                isMobile && "text-base" // Prevent zoom on iOS
              )}
            />
          </div>
          
          <DialogFooter className={cn(
            isMobile ? "flex-col gap-2" : "flex-row gap-2"
          )}>
            <Button 
              variant="outline" 
              onClick={() => setShowNotesDialog(false)}
              className={cn(isMobile && "w-full")}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNotes}
              disabled={isLoading}
              className={cn(isMobile && "w-full")}
            >
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

      {/* Share Dialog - Mobile Optimized */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className={cn(
          isMobile 
            ? "max-w-[95vw] w-full" 
            : "max-w-md"
        )}>
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
            <DialogDescription>
              Share this project with team members or clients.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-sm font-medium">Project Link</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={window.location.href}
                  readOnly
                  className={cn(
                    "text-sm",
                    isMobile && "text-xs"
                  )}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href)
                      toast({
                        title: "Link Copied",
                        description: "Project link copied to clipboard",
                      })
                    } catch (error) {
                      console.error('Failed to copy link:', error)
                    }
                  }}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter className={cn(
            isMobile ? "flex-col gap-2" : "flex-row gap-2"
          )}>
            <Button 
              variant="outline" 
              onClick={() => setShowShareDialog(false)}
              className={cn(isMobile && "w-full")}
            >
              Close
            </Button>
            <Button 
              onClick={handleShare}
              className={cn(isMobile && "w-full")}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Mobile Optimized */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className={cn(
          isMobile && "max-w-[95vw] w-full"
        )}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone and will also delete all associated materials and calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={cn(
            isMobile ? "flex-col gap-2" : "flex-row gap-2"
          )}>
            <AlertDialogCancel className={cn(isMobile && "w-full")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className={cn(
                "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                isMobile && "w-full"
              )}
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
    </div>
  )
} 