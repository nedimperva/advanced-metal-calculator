"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FolderOpen, Package, Users, Clock, Truck, ArrowLeft, Plus, Settings, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import { toast } from "@/hooks/use-toast"

import { useI18n } from "@/contexts/i18n-context"
import { useProjects } from "@/contexts/project-context"
import { Project } from "@/lib/types"
import BackgroundElements from "@/components/background-elements"
import { SettingsButton } from "@/components/settings-button"
import ProjectCreationModal from "@/components/project-creation-modal"
import ProjectDashboard from "@/components/project-dashboard"
import MobileProjectDashboard from "@/components/mobile-project-dashboard"
import { UnifiedProjectDetails } from "@/components/unified-project-details"
import GlobalWorkers from "@/components/global-workers"
import GlobalMachinery from "@/components/global-machinery"
import ProjectTaskManagement from "@/components/tasks/project-task-management"
import MaterialStockManagement from "@/components/material-stock-management"
import DispatchManager from "@/components/dispatch-manager"
import DailyJournal from "@/components/daily-journal"
import { ErrorBoundary } from "@/components/error-boundary"

export default function ManagementPage() {
  const router = useRouter()
  const { projects, currentProject, setCurrentProject } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("projects")
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    if (currentProject) {
      setSelectedProjectId(currentProject.id)
    }
  }, [currentProject])

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project)
    setSelectedProjectId(project.id)
    toast({
      title: "Project Selected",
      description: `Now working on ${project.name}`,
    })
  }

  const handleCreateProject = () => {
    setIsProjectModalOpen(true)
  }

  const tabItems = [
    {
      id: "projects",
      label: "Projects",
      icon: FolderOpen,
      description: "Manage construction projects and timelines"
    },
    {
      id: "materials",
      label: "Materials",
      icon: Package,
      description: "Track materials and inventory"
    },
    {
      id: "dispatches",
      label: "Dispatches",
      icon: Truck,
      description: "Track material orders and deliveries"
    },
    {
      id: "workforce",
      label: "Workforce",
      icon: Users,
      description: "Manage workers and machinery"
    },
    {
      id: "tasks",
      label: "Tasks",
      icon: Clock,
      description: "Track work progress and deadlines"
    },
    {
      id: "journal",
      label: "Journal",
      icon: BarChart3,
      description: "Daily work logs and reports"
    }
  ]

  if (selectedProjectId && selectedProjectId !== "overview") {
    const selectedProject = projects.find(p => p.id === selectedProjectId)
    
    if (!selectedProject) {
      // If project not found, reset selection
      setSelectedProjectId(null)
      return null
    }
    
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
          <BackgroundElements />
          <div className="relative z-10 container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedProjectId(null)}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Overview</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleBackToHome}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Home</span>
                </Button>
              </div>
              <SettingsButton />
            </div>
            
            <UnifiedProjectDetails 
              project={selectedProject} 
              onBack={() => setSelectedProjectId(null)}
            />
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <BackgroundElements />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Construction Management
                </h1>
                <p className="text-muted-foreground">
                  Comprehensive project management and workforce coordination
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {activeTab === "projects" && (
                <Button onClick={handleCreateProject} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </Button>
              )}
              <SettingsButton />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              {tabItems.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="flex items-center space-x-2">
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              {isMobile ? (
                <MobileProjectDashboard 
                  onProjectSelect={handleProjectSelect}
                />
              ) : (
                <ProjectDashboard 
                  onProjectSelect={handleProjectSelect}
                />
              )}
            </TabsContent>

            <TabsContent value="materials" className="space-y-6">
              <div className="overflow-y-auto space-y-4 h-[calc(100vh-200px)]">
                <MaterialStockManagement />
              </div>
            </TabsContent>

            <TabsContent value="dispatches" className="space-y-6">
              <div className="overflow-y-auto space-y-4 h-[calc(100vh-200px)]">
                <DispatchManager />
              </div>
            </TabsContent>

            <TabsContent value="workforce" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Workforce Management</h2>
                <p className="text-muted-foreground">Manage workers and machinery across projects</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Workers</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GlobalWorkers />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Machinery</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GlobalMachinery />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Task Management</h2>
                <p className="text-muted-foreground">Track work progress and manage deadlines</p>
              </div>
              
              {currentProject ? (
                <ProjectTaskManagement projectId={currentProject.id} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a project to manage tasks and deadlines
                    </p>
                    <Button onClick={() => setActiveTab("projects")}>
                      Go to Projects
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="journal" className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Daily Journal</h2>
                <p className="text-muted-foreground">Track daily work logs and progress reports</p>
              </div>
              
              <DailyJournal />
            </TabsContent>
          </Tabs>
        </div>

        <ProjectCreationModal
          open={isProjectModalOpen}
          onOpenChange={setIsProjectModalOpen}
        />
      </div>
    </ErrorBoundary>
  )
}