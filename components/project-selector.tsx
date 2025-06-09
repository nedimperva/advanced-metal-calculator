import React, { useState, useEffect } from 'react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  FolderOpen, 
  ChevronDown, 
  Circle,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Project } from '@/lib/types'
import { ProjectStorage } from '@/lib/project-storage'

interface ProjectSelectorProps {
  activeProject: Project | null
  projects: Project[]
  onProjectChange: (projectId: string | null) => void
  onCreateProject: () => void
  onManageProjects: () => void
  className?: string
  isLoading?: boolean
}

const PROJECT_STATUS_COLORS = {
  active: '#10b981',
  completed: '#3b82f6', 
  archived: '#6b7280',
  'on-hold': '#f59e0b'
}

const PROJECT_STATUS_LABELS = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
  'on-hold': 'On Hold'
}

export function ProjectSelector({
  activeProject,
  projects,
  onProjectChange,
  onCreateProject,
  onManageProjects,
  className,
  isLoading = false
}: ProjectSelectorProps) {

  const handleProjectSelect = (projectId: string) => {
    if (projectId === 'none') {
      onProjectChange(null)
    } else if (projectId === 'create-new') {
      onCreateProject()
    } else if (projectId === 'manage') {
      onManageProjects()
    } else {
      onProjectChange(projectId)
    }
  }

  const getProjectDisplayName = (project: Project) => {
    if (project.client) {
      return `${project.name} (${project.client})`
    }
    return project.name
  }

  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const otherProjects = projects.filter(p => p.status !== 'active' && p.status !== 'completed')

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Project Display/Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={cn(
              "justify-between min-w-[200px] h-8 text-xs",
              activeProject && "border-primary/50"
            )}
            disabled={isLoading}
          >
            <div className="flex items-center gap-2 min-w-0">
              {activeProject ? (
                <>
                  <Circle 
                    className="h-2 w-2 fill-current flex-shrink-0" 
                    style={{ color: activeProject.color || PROJECT_STATUS_COLORS[activeProject.status] }}
                  />
                  <span className="truncate text-left">
                    {getProjectDisplayName(activeProject)}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className="h-4 text-xs px-1 py-0 flex-shrink-0"
                    style={{ 
                      backgroundColor: `${activeProject.color || PROJECT_STATUS_COLORS[activeProject.status]}20`,
                      color: activeProject.color || PROJECT_STATUS_COLORS[activeProject.status]
                    }}
                  >
                    {activeProject.calculationCount || 0}
                  </Badge>
                </>
              ) : (
                <>
                  <FolderOpen className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">No Project</span>
                </>
              )}
            </div>
            <ChevronDown className="h-3 w-3 flex-shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel className="flex items-center justify-between">
            Projects
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateProject}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* No Project Option */}
          <DropdownMenuItem 
            onSelect={() => handleProjectSelect('none')}
            className="flex items-center gap-2"
          >
            <FolderOpen className="h-3 w-3 text-muted-foreground" />
            <span>No Project</span>
            {!activeProject && <Circle className="h-2 w-2 fill-current ml-auto text-primary" />}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground py-1">
                Active Projects
              </DropdownMenuLabel>
              {activeProjects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onSelect={() => handleProjectSelect(project.id)}
                  className="flex items-center gap-2 py-2"
                >
                  <Circle 
                    className="h-2 w-2 fill-current flex-shrink-0" 
                    style={{ color: project.color || PROJECT_STATUS_COLORS[project.status] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm">{project.name}</div>
                    {project.client && (
                      <div className="text-xs text-muted-foreground truncate">{project.client}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="secondary" className="h-4 text-xs px-1 py-0">
                      {project.calculationCount || 0}
                    </Badge>
                    {activeProject?.id === project.id && (
                      <Circle className="h-2 w-2 fill-current text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Completed Projects */}
          {completedProjects.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground py-1">
                Completed Projects
              </DropdownMenuLabel>
              {completedProjects.slice(0, 3).map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onSelect={() => handleProjectSelect(project.id)}
                  className="flex items-center gap-2 py-1"
                >
                  <Circle 
                    className="h-2 w-2 fill-current flex-shrink-0" 
                    style={{ color: project.color || PROJECT_STATUS_COLORS[project.status] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs">{project.name}</div>
                  </div>
                  <Badge variant="outline" className="h-4 text-xs px-1 py-0">
                    {project.calculationCount || 0}
                  </Badge>
                  {activeProject?.id === project.id && (
                    <Circle className="h-2 w-2 fill-current text-primary ml-1" />
                  )}
                </DropdownMenuItem>
              ))}
              {completedProjects.length > 3 && (
                <DropdownMenuItem 
                  onSelect={onManageProjects}
                  className="text-xs text-muted-foreground justify-center py-1"
                >
                  +{completedProjects.length - 3} more projects...
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Other Projects (Archived, On Hold) */}
          {otherProjects.length > 0 && (
            <>
              <DropdownMenuLabel className="text-xs text-muted-foreground py-1">
                Other Projects
              </DropdownMenuLabel>
              {otherProjects.slice(0, 2).map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onSelect={() => handleProjectSelect(project.id)}
                  className="flex items-center gap-2 py-1"
                >
                  <Circle 
                    className="h-2 w-2 fill-current flex-shrink-0" 
                    style={{ color: project.color || PROJECT_STATUS_COLORS[project.status] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs">{project.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {PROJECT_STATUS_LABELS[project.status]}
                    </div>
                  </div>
                  <Badge variant="outline" className="h-4 text-xs px-1 py-0">
                    {project.calculationCount || 0}
                  </Badge>
                  {activeProject?.id === project.id && (
                    <Circle className="h-2 w-2 fill-current text-primary ml-1" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          
          {/* Management Options */}
          <DropdownMenuItem 
            onSelect={onManageProjects}
            className="flex items-center gap-2 text-sm"
          >
            <Settings className="h-3 w-3" />
            Manage Projects
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onSelect={onCreateProject}
            className="flex items-center gap-2 text-sm"
          >
            <Plus className="h-3 w-3" />
            Create New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Quick Stats */}
      {activeProject && (
        <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
          <span>{activeProject.calculationCount || 0} calculations</span>
          {activeProject.totalWeight && activeProject.totalWeight > 0 && (
            <>
              <span>•</span>
              <span>{activeProject.totalWeight.toFixed(1)}kg total</span>
            </>
          )}
        </div>
      )}
    </div>
  )
} 