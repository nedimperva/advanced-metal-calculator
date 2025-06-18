import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Settings } from 'lucide-react'
import { useProjects } from '@/contexts/project-context'
import { useMediaQuery } from '@/hooks/use-media-query'
import ProjectDetails from './project-details'
import ProjectMaterials from './project-materials'
import ProjectTimeline from './project-timeline'
import type { Project } from '@/lib/types'

interface UnifiedProjectDetailsProps {
  project: Project
  onBack: () => void
  onEdit?: (project: Project) => void
}

export function UnifiedProjectDetails({
  project,
  onBack,
  onEdit
}: UnifiedProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshKey, setRefreshKey] = useState(0)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(project)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
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

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="pb-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
            </CardHeader>

            <div className="p-6">
              <TabsContent value="overview" className="mt-0">
                <ProjectDetails
                  key={`overview-${refreshKey}`}
                  project={project}
                  onEdit={handleEdit}
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
                <ProjectTimeline
                  key={`timeline-${refreshKey}`}
                  project={project}
                  onUpdate={handleUpdate}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 