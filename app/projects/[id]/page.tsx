"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useProjects } from '@/contexts/project-context'
import { useMediaQuery } from '@/hooks/use-media-query'
import BackgroundElements from '@/components/background-elements'
import { LoadingSpinner } from '@/components/loading-states'
import ProjectDetails from '@/components/project-details'
import ProjectMaterials from '@/components/project-materials'
import ProjectTimeline from '@/components/project-timeline'

export default function ProjectDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const isDesktop = useMediaQuery("(min-width: 768px)")
  
  // Project context
  const {
    currentProject,
    selectProject,
    isLoading
  } = useProjects()

  // Local state
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshKey, setRefreshKey] = useState(0)

  // Load project details
  useEffect(() => {
    if (projectId && !currentProject) {
      selectProject(projectId)
    }
  }, [projectId, currentProject, selectProject])

  // Handle actions
  const handleBack = () => {
    router.push('/projects')
  }

  const handleEdit = () => {
    router.push(`/projects/${projectId}/edit`)
  }

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (isLoading || !currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
        <BackgroundElements />
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner size="lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const project = currentProject

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      <BackgroundElements />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ProjectDetails
                key={`overview-${refreshKey}`}
                project={project}
                onEdit={handleEdit}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="materials" className="space-y-6">
              <ProjectMaterials
                key={`materials-${refreshKey}`}
                project={project}
                onUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <ProjectTimeline
                key={`timeline-${refreshKey}`}
                project={project}
                onUpdate={handleUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 