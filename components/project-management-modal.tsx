import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Loader2, 
  X, 
  Edit3, 
  Trash2, 
  Download, 
  Archive, 
  FolderOpen,
  Calendar,
  MapPin,
  User,
  FileText,
  BarChart3,
  Settings,
  AlertTriangle
} from 'lucide-react'
import { Project, ProjectFormData, Calculation } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProjectManagementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  activeProject: Project | null
  onUpdateProject: (projectId: string, data: Partial<ProjectFormData>) => Promise<boolean>
  onDeleteProject: (projectId: string, moveCalculationsTo?: string) => Promise<boolean>
  onSetActiveProject: (projectId: string | null) => Promise<boolean>
  onExportProject: (projectId: string) => Promise<boolean>
  getProjectCalculations: (projectId: string) => Calculation[]
  isLoading?: boolean
}

const PROJECT_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Pink', value: '#ec4899' }
]

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

export function ProjectManagementModal({
  open,
  onOpenChange,
  projects,
  activeProject,
  onUpdateProject,
  onDeleteProject,
  onSetActiveProject,
  onExportProject,
  getProjectCalculations,
  isLoading = false
}: ProjectManagementModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [editMode, setEditMode] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [moveCalculationsTo, setMoveCalculationsTo] = useState<string>('')
  
  const [editFormData, setEditFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    client: '',
    location: '',
    status: 'active',
    tags: [],
    color: PROJECT_COLORS[0].value
  })

  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null
  const projectCalculations = selectedProject ? getProjectCalculations(selectedProject.id) : []

  useEffect(() => {
    if (open && projects.length > 0) {
      const initialProject = activeProject || projects[0]
      setSelectedProjectId(initialProject.id)
    }
  }, [open, projects, activeProject])

  useEffect(() => {
    if (selectedProject) {
      setEditFormData({
        name: selectedProject.name,
        description: selectedProject.description || '',
        client: selectedProject.client || '',
        location: selectedProject.location || '',
        status: selectedProject.status,
        tags: selectedProject.tags || [],
        color: selectedProject.color || PROJECT_COLORS[0].value
      })
      setEditMode(false)
    }
  }, [selectedProject])

  const handleSaveEdit = async () => {
    if (!selectedProject) return

    try {
      const success = await onUpdateProject(selectedProject.id, editFormData)
      if (success) {
        setEditMode(false)
      }
    } catch (error) {
      console.error('Error updating project:', error)
    }
  }

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
    const calculations = getProjectCalculations(project.id)
    if (calculations.length > 0) {
      setMoveCalculationsTo('')
    }
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return

    try {
      const success = await onDeleteProject(
        projectToDelete.id, 
        moveCalculationsTo || undefined
      )
      if (success) {
        setDeleteDialogOpen(false)
        setProjectToDelete(null)
        setMoveCalculationsTo('')
        
        // Select another project if we deleted the selected one
        if (selectedProjectId === projectToDelete.id) {
          const remainingProjects = projects.filter(p => p.id !== projectToDelete.id)
          setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null)
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !editFormData.tags.includes(trimmedTag)) {
      setEditFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const calculateProjectStats = (project: Project) => {
    const calculations = getProjectCalculations(project.id)
    const totalWeight = calculations.reduce((sum, calc) => sum + (calc.weight || 0), 0)
    const materialCount = new Set(calculations.map(calc => `${calc.material}-${calc.grade}`)).size
    const profileCount = new Set(calculations.map(calc => calc.profileType)).size
    
    return {
      totalCalculations: calculations.length,
      totalWeight,
      uniqueMaterials: materialCount,
      uniqueProfiles: profileCount,
      lastActivity: calculations.length > 0 
        ? Math.max(...calculations.map(calc => calc.timestamp.getTime()))
        : project.createdAt.getTime()
    }
  }

  if (!open || projects.length === 0) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Project Management</DialogTitle>
            <DialogDescription>
              Manage your projects, edit details, and organize calculations.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-12 gap-4 h-[70vh]">
            {/* Project List Sidebar */}
            <div className="col-span-4 border-r pr-4 overflow-y-auto">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Projects ({projects.length})</Label>
                {projects.map((project) => {
                  const stats = calculateProjectStats(project)
                  return (
                    <Card
                      key={project.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedProjectId === project.id && "ring-2 ring-primary",
                        activeProject?.id === project.id && "bg-primary/5"
                      )}
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="font-medium text-sm truncate">
                                {project.name}
                              </span>
                            </div>
                            {activeProject?.id === project.id && (
                              <Badge variant="secondary" className="text-xs">Active</Badge>
                            )}
                          </div>
                          
                          {project.client && (
                            <p className="text-xs text-muted-foreground truncate">
                              {project.client}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{stats.totalCalculations} calcs</span>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: PROJECT_STATUS_COLORS[project.status],
                                color: PROJECT_STATUS_COLORS[project.status]
                              }}
                            >
                              {PROJECT_STATUS_LABELS[project.status]}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Project Details */}
            <div className="col-span-8 overflow-y-auto">
              {selectedProject ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="calculations">Calculations</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: selectedProject.color }}
                        />
                        <h3 className="text-lg font-semibold">{selectedProject.name}</h3>
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: PROJECT_STATUS_COLORS[selectedProject.status],
                            color: PROJECT_STATUS_COLORS[selectedProject.status]
                          }}
                        >
                          {PROJECT_STATUS_LABELS[selectedProject.status]}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSetActiveProject(selectedProject.id)}
                          disabled={activeProject?.id === selectedProject.id}
                        >
                          {activeProject?.id === selectedProject.id ? 'Current' : 'Set Active'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onExportProject(selectedProject.id)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Client:</span>
                            <span>{selectedProject.client || 'Not specified'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Location:</span>
                            <span>{selectedProject.location || 'Not specified'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Created:</span>
                            <span>{selectedProject.createdAt.toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {(() => {
                              const stats = calculateProjectStats(selectedProject)
                              return (
                                <>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">
                                      {stats.totalCalculations}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Calculations</div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-center">
                                    <div>
                                      <div className="text-lg font-semibold">{stats.totalWeight.toFixed(1)}</div>
                                      <div className="text-xs text-muted-foreground">kg Total</div>
                                    </div>
                                    <div>
                                      <div className="text-lg font-semibold">{stats.uniqueMaterials}</div>
                                      <div className="text-xs text-muted-foreground">Materials</div>
                                    </div>
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Description */}
                    {selectedProject.description && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Description
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {selectedProject.description}
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Tags */}
                    {selectedProject.tags && selectedProject.tags.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedProject.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Calculations Tab */}
                  <TabsContent value="calculations" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Project Calculations ({projectCalculations.length})</h3>
                    </div>

                    {projectCalculations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No calculations in this project yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {projectCalculations.map((calc) => (
                          <Card key={calc.id} className="hover:bg-muted/50">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">
                                    {calc.materialName} {calc.profileName}
                                    {calc.standardSize !== 'Custom' && ` (${calc.standardSize})`}
                                  </div>
                                  <div className="text-lg font-bold text-primary">
                                    {calc.weight.toFixed(4)} {calc.weightUnit}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {calc.timestamp.toLocaleDateString()} {calc.timestamp.toLocaleTimeString()}
                                  </div>
                                </div>
                                {calc.calculationNumber && (
                                  <Badge variant="outline" className="text-xs">
                                    {calc.calculationNumber}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Project Settings</h3>
                      <div className="flex gap-2">
                        {editMode ? (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveEdit}>
                              Save Changes
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit Project
                          </Button>
                        )}
                      </div>
                    </div>

                    {editMode ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Project Name</Label>
                          <Input
                            id="edit-name"
                            value={editFormData.name}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-client">Client</Label>
                            <Input
                              id="edit-client"
                              value={editFormData.client}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, client: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-location">Location</Label>
                            <Input
                              id="edit-location"
                              value={editFormData.location}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={editFormData.description}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-status">Status</Label>
                          <Select
                            value={editFormData.status}
                            onValueChange={(value: any) => setEditFormData(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="on-hold">On Hold</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Project Color</Label>
                          <div className="flex flex-wrap gap-2">
                            {PROJECT_COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => setEditFormData(prev => ({ ...prev, color: color.value }))}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  editFormData.color === color.value 
                                    ? 'border-foreground scale-110' 
                                    : 'border-muted hover:border-muted-foreground'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <Label className="text-sm text-muted-foreground">Project Name</Label>
                              <p className="font-medium">{selectedProject.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Status</Label>
                              <p>{PROJECT_STATUS_LABELS[selectedProject.status]}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Created</Label>
                              <p>{selectedProject.createdAt.toLocaleDateString()}</p>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Last Updated</Label>
                              <p>{selectedProject.updatedAt.toLocaleDateString()}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    <Separator />

                    {/* Danger Zone */}
                    <Card className="border-destructive/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-destructive flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Delete Project</p>
                            <p className="text-sm text-muted-foreground">
                              Permanently delete this project. This action cannot be undone.
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(selectedProject)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a project to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
              {projectToDelete && getProjectCalculations(projectToDelete.id).length > 0 && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="font-medium text-sm">
                    This project has {getProjectCalculations(projectToDelete.id).length} calculations.
                  </p>
                  <div className="mt-2 space-y-2">
                    <Label htmlFor="move-calculations">Move calculations to:</Label>
                    <Select value={moveCalculationsTo} onValueChange={setMoveCalculationsTo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project or leave unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned (no project)</SelectItem>
                        {projects
                          .filter(p => p.id !== projectToDelete?.id)
                          .map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 