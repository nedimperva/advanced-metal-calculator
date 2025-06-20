import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Settings } from 'lucide-react'
import { useProjects } from '@/contexts/project-context'
import { TaskProvider, useTask } from '@/contexts/task-context'
import { useMediaQuery } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import ProjectDetails from './project-details'
import ProjectMaterials from './project-materials'
import ProjectTimeline from './project-timeline'
import ProjectTaskManagement from './tasks/project-task-management'
import WorkforceManagement from './workforce-management'
import type { Project } from '@/lib/types'

interface UnifiedProjectDetailsProps {
  project: Project
  onBack: () => void
  onEdit?: (project: Project) => void
}

// Timeline component that has access to tasks
function TimelineTabContent({ project }: { project: Project }) {
  const { filteredTasks } = useTask()
  
  return (
    <ProjectTimeline
      project={project}
      onUpdate={() => {}}
      availableTasks={filteredTasks}
    />
  )
}

export function UnifiedProjectDetails({
  project,
  onBack,
  onEdit
}: UnifiedProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshKey, setRefreshKey] = useState(0)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const isMobile = useMediaQuery("(max-width: 767px)")

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(project)
    }
  }

  return (
    <div className={cn("space-y-4", isMobile && "space-y-2")}>
      {/* Mobile Header */}
      {isMobile ? (
        <div className="space-y-3">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="h-9 px-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">{project.name}</h2>
            </div>
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEdit}
                className="h-9 px-3"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Description */}
          {project.description && (
            <p className="text-sm text-muted-foreground px-1">
              {project.description}
            </p>
          )}
        </div>
      ) : (
        /* Desktop Header */
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
          </div>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Edit Project
            </Button>
          )}
        </div>
      )}

      {/* Tabs */}
      <Card className={cn(isMobile && "border-0 shadow-none")}>
        <CardContent className={cn("p-0", isMobile && "bg-transparent")}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className={cn(
              "pb-0 sticky top-0 z-30 backdrop-blur-sm bg-card/95 border-b border-border/50",
              isMobile && "px-0 pt-2 bg-background/95"
            )}>
              <TabsList className={cn(
                "grid w-full grid-cols-5",
                isMobile && "h-10 bg-muted/50"
              )}>
                <TabsTrigger 
                  value="overview" 
                  className={cn(isMobile && "text-xs py-2")}
                >
                  {isMobile ? 'Overview' : 'Overview'}
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className={cn(isMobile && "text-xs py-2")}
                >
                  {isMobile ? 'Tasks' : 'Tasks'}
                </TabsTrigger>
                <TabsTrigger 
                  value="workforce" 
                  className={cn(isMobile && "text-xs py-2")}
                >
                  {isMobile ? 'Workers' : 'Workforce'}
                </TabsTrigger>
                <TabsTrigger 
                  value="materials" 
                  className={cn(isMobile && "text-xs py-2")}
                >
                  {isMobile ? 'Materials' : 'Materials'}
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className={cn(isMobile && "text-xs py-2")}
                >
                  {isMobile ? 'Timeline' : 'Timeline'}
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <div className={cn("p-6", isMobile && "p-3 pt-4")}>
              <TabsContent value="overview" className="mt-0">
                <ProjectDetails
                  key={`overview-${refreshKey}`}
                  project={project}
                  onEdit={handleEdit}
                  onUpdate={handleUpdate}
                />
              </TabsContent>

              <TabsContent value="tasks" className="mt-0">
                <TaskProvider initialProjectId={project.id}>
                  <ProjectTaskManagement
                    key={`tasks-${refreshKey}`}
                    project={project}
                    onUpdate={handleUpdate}
                  />
                </TaskProvider>
              </TabsContent>

              <TabsContent value="workforce" className="mt-0">
                <WorkforceManagement
                  key={`workforce-${refreshKey}`}
                  project={project}
                  onUpdate={handleUpdate}
                />
              </TabsContent>

              <TabsContent value="materials" className="mt-0">
                <ProjectMaterials
                  key={`materials-${refreshKey}`}
                  project={project}
                  onUpdate={handleUpdate}
                />
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                <TaskProvider initialProjectId={project.id}>
                  <TimelineTabContent project={project} />
                </TaskProvider>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 