"use client"

import React from 'react'
// Navigation is now handled within the tab system - no router needed
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  FolderOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/project-context'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/lib/project-utils'
import type { Project } from '@/lib/types'

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

export function ProjectNavigation({ 
  project, 
  className,
  showBackButton = true,
  showTabs = false,
  activeTab,
  onTabChange
}: ProjectNavigationProps) {
  // Router and pathname no longer needed - navigation handled by parent
  const { deleteProject } = useProjects()

  // Handle navigation actions
  const handleBack = () => {
    // Navigation will be handled by parent component within tab system
    console.log('Navigate back to projects')
  }

  const handleEdit = () => {
    // Edit functionality will be handled in-place within the tab system
    console.log('Edit project:', project?.id)
    // TODO: Implement inline editing or edit modal
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
    if (project && confirm(`Are you sure you want to delete "${project.name}"?`)) {
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