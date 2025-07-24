"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FolderOpen, Package, Users, Clock, Truck, ArrowLeft, Plus, Settings, BarChart3, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import { toast } from "@/hooks/use-toast"

import { useI18n } from "@/contexts/i18n-context"
import { useProjects } from "@/contexts/project-context"
import { Project, ProjectStatus } from "@/lib/types"
import { PROJECT_STATUS_LABELS } from "@/lib/project-utils"
import BackgroundElements from "@/components/background-elements"
import { SettingsButton } from "@/components/settings-button"
import ProjectCreationModal from "@/components/project-creation-modal"
import ProjectDashboard from "@/components/project-dashboard"
import MobileProjectDashboard from "@/components/mobile-project-dashboard"
import { UnifiedProjectDetails } from "@/components/unified-project-details"
import GlobalWorkers from "@/components/global-workers"
import GlobalMachinery from "@/components/global-machinery"
import WorkforceOverview from "@/components/workforce-overview"
import ProjectTaskManagement from "@/components/tasks/project-task-management"
import MaterialStockManagement from "@/components/material-stock-management"
import DispatchManager from "@/components/dispatch-manager"
import DailyJournal from "@/components/daily-journal"
import { ErrorBoundary } from "@/components/error-boundary"

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

  // Reset form data when project changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
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
      setErrors({})
    }
  }, [project, isOpen])

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

export default function ManagementPage() {
  const router = useRouter()
  const { projects, currentProject, setCurrentProject, updateProject } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("projects")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
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

  const handleProjectEdit = (project: Project) => {
    setEditingProject(project)
    setShowEditModal(true)
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
              onEdit={handleProjectEdit}
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
                  onCreateProject={handleCreateProject}
                />
              ) : (
                <ProjectDashboard 
                  onProjectSelect={handleProjectSelect}
                  onCreateProject={handleCreateProject}
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
              
              {/* Workforce Overview Cards */}
              <WorkforceOverview />
              
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

        {/* Edit Project Modal */}
        {editingProject && (
          <EditProjectModal
            project={editingProject}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setEditingProject(null)
            }}
            onSave={async (updatedProject) => {
              try {
                await updateProject({ ...editingProject, ...updatedProject })
                setShowEditModal(false)
                setEditingProject(null)
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
    </ErrorBoundary>
  )
}