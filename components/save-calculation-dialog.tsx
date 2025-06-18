import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Save, 
  FolderOpen, 
  Plus, 
  Building2, 
  MapPin, 
  Calendar,
  Tag,
  FileText,
  Loader2
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useProjects } from '@/contexts/project-context'
import type { Calculation, Project } from '@/lib/types'

interface SaveCalculationDialogProps {
  calculation: Partial<Calculation>
  onSave: (calculation: Calculation, projectId?: string) => Promise<void>
  children: React.ReactNode
  disabled?: boolean
  isEditMode?: boolean
  editingCalculationId?: string
}

interface QuickProjectForm {
  name: string
  description: string
  client: string
  location: string
}

export function SaveCalculationDialog({ 
  calculation, 
  onSave, 
  children, 
  disabled = false,
  isEditMode = false,
  editingCalculationId
}: SaveCalculationDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [calculationName, setCalculationName] = useState('')
  const [calculationNotes, setCalculationNotes] = useState('')
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [quickProject, setQuickProject] = useState<QuickProjectForm>({
    name: '',
    description: '',
    client: '',
    location: ''
  })
  const [isCreatingProject, setIsCreatingProject] = useState(false)

  const { projects, createProject } = useProjects()

  // Generate suggested name based on calculation
  const suggestedName = React.useMemo(() => {
    if (!calculation.profileType || !calculation.material) return ''
    
    const profile = calculation.profileType.toUpperCase()
    const size = calculation.standardSize || 'Custom'
    const material = calculation.material
    const weight = calculation.weight ? `${calculation.weight.toFixed(2)}kg` : ''
    
    return `${profile} ${size} - ${material} ${weight}`.trim()
  }, [calculation])

  // Auto-suggest projects based on materials/profiles
  const suggestedProjects = React.useMemo(() => {
    if (!calculation.material && !calculation.profileType) return []
    
    return projects.filter(project => {
      // Check if project has similar materials or profiles in its calculations
      return project.materials?.some(material => 
        material.material === calculation.material ||
        material.profileType === calculation.profileType
      ) || false
    }).slice(0, 3)
  }, [projects, calculation.material, calculation.profileType])

  const handleSave = async () => {
    if (!calculation.weight || calculation.weight <= 0) {
      toast({
        title: "Invalid Calculation",
        description: "Please complete the calculation before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const finalCalculation: Calculation = {
        ...calculation,
        id: Date.now().toString(),
        name: calculationName || suggestedName,
        notes: calculationNotes,
        projectId: selectedProjectId || undefined,
        timestamp: new Date(),
      } as Calculation

      await onSave(finalCalculation, selectedProjectId || undefined)
      
      toast({
        title: "Calculation Saved",
        description: selectedProjectId 
          ? `Saved to project: ${projects.find(p => p.id === selectedProjectId)?.name}`
          : "Saved to general history",
      })
      
      setOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving calculation:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save calculation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleQuickCreateProject = async () => {
    if (!quickProject.name.trim()) {
      toast({
        title: "Project Name Required",
        description: "Please enter a project name.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingProject(true)
    try {
      const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name: quickProject.name,
        description: quickProject.description,
        client: quickProject.client,
        location: quickProject.location,
        status: 'planning',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        budget: 0,
        spent: 0,
        materials: [],
        timeline: [],
        notes: [],
        tags: [],
        attachments: []
      }

      const createdProject = await createProject(newProject)
      setSelectedProjectId(createdProject.id)
      setShowQuickCreate(false)
      resetQuickProjectForm()
      
      toast({
        title: "Project Created",
        description: `Project "${createdProject.name}" has been created and selected.`,
      })
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: "Creation Failed",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingProject(false)
    }
  }

  const resetForm = () => {
    setCalculationName('')
    setCalculationNotes('')
    setSelectedProjectId('')
    setShowQuickCreate(false)
    resetQuickProjectForm()
  }

  const resetQuickProjectForm = () => {
    setQuickProject({
      name: '',
      description: '',
      client: '',
      location: ''
    })
  }

  React.useEffect(() => {
    if (open) {
      setCalculationName(suggestedName)
      
      // Pre-select project if calculation has projectId
      if (calculation.projectId) {
        setSelectedProjectId(calculation.projectId)
      }
    }
  }, [open, suggestedName, calculation.projectId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            {isEditMode ? "Update Calculation" : "Save Calculation"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update your calculation and optionally change its project assignment."
              : "Save your calculation to history and optionally assign it to a project."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Calculation Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {calculation.profileType?.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {calculation.material}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Weight: {calculation.weight?.toFixed(4)} {calculation.weightUnit}
                </div>
                <div className="text-sm text-muted-foreground">
                  Area: {calculation.crossSectionalArea?.toFixed(4)} cm²
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calc-name">Calculation Name</Label>
              <Input
                id="calc-name"
                value={calculationName}
                onChange={(e) => setCalculationName(e.target.value)}
                placeholder="Enter a name for this calculation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calc-notes">Notes (Optional)</Label>
              <Textarea
                id="calc-notes"
                value={calculationNotes}
                onChange={(e) => setCalculationNotes(e.target.value)}
                placeholder="Add any notes about this calculation..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Project Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Assign to Project (Optional)</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuickCreate(!showQuickCreate)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Quick Create
              </Button>
            </div>

            {!showQuickCreate ? (
              <>
                <Select value={selectedProjectId || "none"} onValueChange={(value) => {
                  setSelectedProjectId(value === "none" ? "" : value)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Suggested Projects */}
                {suggestedProjects.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Suggested projects:</div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedProjects.map(project => (
                        <Button
                          key={project.id}
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProjectId(project.id)}
                          className={selectedProjectId === project.id ? 'bg-primary/10' : ''}
                        >
                          <FolderOpen className="h-3 w-3 mr-1" />
                          {project.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Plus className="h-4 w-4" />
                    Create New Project
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label htmlFor="project-name">Project Name *</Label>
                      <Input
                        id="project-name"
                        value={quickProject.name}
                        onChange={(e) => setQuickProject(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter project name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="project-client">Client</Label>
                      <div className="relative">
                        <Building2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="project-client"
                          value={quickProject.client}
                          onChange={(e) => setQuickProject(prev => ({ ...prev, client: e.target.value }))}
                          placeholder="Client name"
                          className="pl-8"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="project-location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="project-location"
                          value={quickProject.location}
                          onChange={(e) => setQuickProject(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Project location"
                          className="pl-8"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="project-description">Description</Label>
                      <Textarea
                        id="project-description"
                        value={quickProject.description}
                        onChange={(e) => setQuickProject(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief project description"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleQuickCreateProject}
                      disabled={isCreatingProject || !quickProject.name.trim()}
                      size="sm"
                    >
                      {isCreatingProject ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-1" />
                      )}
                      Create Project
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowQuickCreate(false)}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || disabled}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {isEditMode ? "Update Calculation" : "Save Calculation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 