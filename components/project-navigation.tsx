"use client"

import React, { useState } from 'react'
// Navigation is now handled within the tab system - no router needed
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Edit, 
  Share2, 
  Download, 
  Trash2,
  Eye,
  Plus,
  BarChart3,
  Calendar,
  Settings,
  FolderOpen,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/project-context'
import { useI18n } from '@/contexts/i18n-context'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/lib/project-utils'
import { toast } from '@/hooks/use-toast'
import type { Project, ProjectStatus } from '@/lib/types'

interface ProjectNavigationProps {
  project?: Project
  className?: string
  showBackButton?: boolean
  showTabs?: boolean
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const projectTabs = [
  { value: 'overview', label: 'Overview', icon: Eye },
  { value: 'materials', label: 'Materials', icon: BarChart3 },
  { value: 'calculations', label: 'Calculations', icon: Plus },
  { value: 'timeline', label: 'Timeline', icon: Calendar }
]

interface EditProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onSave: (project: Partial<Project>) => Promise<void>
}

function EditProjectModal({ project, isOpen, onClose, onSave }: EditProjectModalProps) {
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    totalBudget: project.totalBudget?.toString() || '',
    currency: project.currency,
    notes: project.notes,
    client: project.client || '',
    location: project.location || '',
    deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
    tags: project.tags.join(', ')
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }

    if (formData.name.length > 100) {
      newErrors.name = 'Project name must be less than 100 characters'
    }

    if (formData.totalBudget && (isNaN(parseFloat(formData.totalBudget)) || parseFloat(formData.totalBudget) < 0)) {
      newErrors.totalBudget = 'Budget must be a valid positive number'
    }

    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (deadlineDate <= today) {
        newErrors.deadline = 'Deadline must be in the future'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const updatedProject: Partial<Project> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : undefined,
        currency: formData.currency,
        notes: formData.notes.trim(),
        client: formData.client.trim() || undefined,
        location: formData.location.trim() || undefined,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      }

      await onSave(updatedProject)
    } catch (error) {
      console.error('Error updating project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project details, status, and other information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as ProjectStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <div className="flex gap-2">
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: e.target.value }))}
                  className={errors.totalBudget ? 'border-red-500' : ''}
                />
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KM">KM</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.totalBudget && <p className="text-red-500 text-sm">{errors.totalBudget}</p>}
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                className={errors.deadline ? 'border-red-500' : ''}
              />
              {errors.deadline && <p className="text-red-500 text-sm">{errors.deadline}</p>}
            </div>

            {/* Tags */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., structural, high-priority, urban"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProjectNavigation({ 
  project, 
  className,
  showBackButton = true,
  showTabs = false,
  activeTab,
  onTabChange
}: ProjectNavigationProps) {
  // Router and pathname no longer needed - navigation handled by parent
  const { deleteProject, updateProject } = useProjects()
  const { t } = useI18n()
  const [showEditModal, setShowEditModal] = useState(false)

  // Handle navigation actions
  const handleBack = () => {
    // Navigation will be handled by parent component within tab system
    console.log('Navigate back to projects')
  }

  const handleEdit = () => {
    if (project) {
      setShowEditModal(true)
    }
  }

  const handleShare = async () => {
    if (project) {
      try {
        await navigator.share({
          title: project.name,
          text: project.description,
          url: window.location.href
        })
      } catch (error) {
        // Fallback to copying URL
        await navigator.clipboard.writeText(window.location.href)
      }
    }
  }

  const handleExport = () => {
    // This would trigger export functionality
    // Implementation depends on the export format needed
    console.log('Export project:', project?.id)
  }

  const handleDelete = async () => {
            if (project && confirm(t('confirmDeleteProject'))) {
      try {
        await deleteProject(project.id)
        // Navigation will be handled by parent component
        console.log('Project deleted, navigate back to projects')
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }

  const handleAddCalculation = () => {
    if (project) {
      // Calculator navigation will be handled by parent component
      console.log('Navigate to calculator with project:', project.id)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          )}
          
          {project && (
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-semibold">{project.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline"
                    className={cn(
                      `bg-${PROJECT_STATUS_COLORS[project.status]}-50 border-${PROJECT_STATUS_COLORS[project.status]}-200 text-${PROJECT_STATUS_COLORS[project.status]}-700`
                    )}
                  >
                    {PROJECT_STATUS_LABELS[project.status]}
                  </Badge>
                  {project.client && (
                    <span className="text-sm text-muted-foreground">
                      • {project.client}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {project && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCalculation}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Calculation
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Project Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Project
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Project Tabs */}
      {showTabs && project && (
        <div className="border-b">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="w-full justify-start bg-transparent p-0 h-auto">
              {projectTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 border-b-2 border-transparent",
                      "hover:bg-muted/50 data-[state=active]:border-primary data-[state=active]:bg-transparent",
                      "rounded-none"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Edit Project Modal */}
      {project && (
        <EditProjectModal
          project={project}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={async (updatedProject) => {
            try {
              await updateProject({ ...project, ...updatedProject })
              setShowEditModal(false)
              toast({
                title: 'Project Updated',
                description: `"${updatedProject.name}" has been updated successfully`,
              })
            } catch (error) {
              console.error('Failed to update project:', error)
              toast({
                title: 'Error',
                description: 'Failed to update project. Please try again.',
                variant: 'destructive',
              })
            }
          }}
        />
      )}
    </div>
  )
}

// Simplified project header for use in layouts
interface ProjectHeaderProps {
  project: Project
  className?: string
}

export function ProjectHeader({ project, className }: ProjectHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <FolderOpen className="h-5 w-5 text-muted-foreground" />
      <div>
        <h2 className="font-semibold">{project.name}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              `bg-${PROJECT_STATUS_COLORS[project.status]}-50 border-${PROJECT_STATUS_COLORS[project.status]}-200 text-${PROJECT_STATUS_COLORS[project.status]}-700`
            )}
          >
            {PROJECT_STATUS_LABELS[project.status]}
          </Badge>
          {project.calculationIds?.length && (
            <span>{project.calculationIds.length} calculations</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Project selector dropdown for quick switching
interface ProjectSelectorProps {
  currentProject?: Project
  className?: string
}

export function ProjectSelector({ currentProject, className }: ProjectSelectorProps) {
  // Router no longer needed - navigation handled by parent
  const { projects } = useProjects()

  const handleProjectSelect = (projectId: string) => {
    // Project navigation will be handled by parent component
    console.log('Select project:', projectId)
  }

  const recentProjects = projects.slice(0, 5)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("justify-start", className)}>
          <FolderOpen className="h-4 w-4 mr-2" />
          {currentProject ? currentProject.name : 'Select Project'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch Project</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentProjects.map((project) => (
          <DropdownMenuItem 
            key={project.id}
            onClick={() => handleProjectSelect(project.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="truncate">{project.name}</span>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs ml-2",
                `bg-${PROJECT_STATUS_COLORS[project.status]}-50 border-${PROJECT_STATUS_COLORS[project.status]}-200 text-${PROJECT_STATUS_COLORS[project.status]}-700`
              )}
            >
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log('View all projects')}>
          <Eye className="h-4 w-4 mr-2" />
          View All Projects
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => router.push('/projects/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProjectNavigation 