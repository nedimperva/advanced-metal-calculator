"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin,
  FileText,
  Tag,
  Building, 
  Home, 
  Factory, 
  Wrench, 
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react'
import { useProjects } from '@/contexts/project-context'
import { cn } from '@/lib/utils'
import { ProjectStatus, type Project } from '@/lib/types'
import { PROJECT_STATUS_LABELS } from '@/lib/project-utils'
import { toast } from '@/hooks/use-toast'

// Project template definitions
interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'residential' | 'commercial' | 'industrial' | 'infrastructure'
  estimatedDuration: string
  typicalBudgetRange: string
  commonMaterials: string[]
  tags: string[]
  defaultStatus: ProjectStatus
}

const projectTemplates: ProjectTemplate[] = [
  {
    id: 'residential-house',
    name: 'Residential House Construction',
    description: 'Complete construction of a single-family residential home with standard structural requirements.',
    icon: <Home className="h-8 w-8" />,
    category: 'residential',
    estimatedDuration: '6-12 months',
    typicalBudgetRange: '$200,000 - $500,000',
    commonMaterials: ['Steel beams', 'Concrete', 'Rebar', 'Wood framing', 'Roofing materials'],
    tags: ['residential', 'construction', 'house'],
    defaultStatus: ProjectStatus.PLANNING
  },
  {
    id: 'commercial-office',
    name: 'Commercial Office Building',
    description: 'Multi-story commercial office building with modern structural steel framework.',
    icon: <Building className="h-8 w-8" />,
    category: 'commercial',
    estimatedDuration: '12-24 months',
    typicalBudgetRange: '$1M - $10M',
    commonMaterials: ['Structural steel', 'Curtain wall', 'Concrete slabs', 'HVAC systems', 'Fire protection'],
    tags: ['commercial', 'office', 'multi-story'],
    defaultStatus: ProjectStatus.PLANNING
  },
  {
    id: 'industrial-warehouse',
    name: 'Industrial Warehouse',
    description: 'Large-scale warehouse facility with clear-span design and heavy-duty structural elements.',
    icon: <Factory className="h-8 w-8" />,
    category: 'industrial',
    estimatedDuration: '8-18 months',
    typicalBudgetRange: '$500,000 - $5M',
    commonMaterials: ['Pre-engineered steel', 'Metal roofing', 'Concrete foundations', 'Loading docks', 'Industrial lighting'],
    tags: ['industrial', 'warehouse', 'steel'],
    defaultStatus: ProjectStatus.PLANNING
  },
  {
    id: 'bridge-construction',
    name: 'Bridge Infrastructure',
    description: 'Bridge construction project including foundations, superstructure, and safety systems.',
    icon: <Wrench className="h-8 w-8" />,
    category: 'infrastructure',
    estimatedDuration: '18-36 months',
    typicalBudgetRange: '$2M - $50M',
    commonMaterials: ['Prestressed concrete', 'Structural steel', 'Rebar', 'Bridge bearings', 'Safety barriers'],
    tags: ['infrastructure', 'bridge', 'public'],
    defaultStatus: ProjectStatus.PLANNING
  },
  {
    id: 'residential-renovation',
    name: 'Home Renovation',
    description: 'Major renovation project including structural modifications and upgrades.',
    icon: <Home className="h-8 w-8" />,
    category: 'residential',
    estimatedDuration: '3-8 months',
    typicalBudgetRange: '$50,000 - $200,000',
    commonMaterials: ['Steel reinforcement', 'Lumber', 'Drywall', 'Insulation', 'Flooring'],
    tags: ['residential', 'renovation', 'remodel'],
    defaultStatus: ProjectStatus.PLANNING
  },
  {
    id: 'retail-store',
    name: 'Retail Store Buildout',
    description: 'Commercial retail space construction with custom layout and modern finishes.',
    icon: <Building className="h-8 w-8" />,
    category: 'commercial',
    estimatedDuration: '4-8 months',
    typicalBudgetRange: '$100,000 - $1M',
    commonMaterials: ['Light steel framing', 'Glass facades', 'Flooring systems', 'Lighting', 'Security systems'],
    tags: ['commercial', 'retail', 'interior'],
    defaultStatus: ProjectStatus.PLANNING
  }
]

const categoryLabels = {
  residential: 'Residential',
  commercial: 'Commercial',
  industrial: 'Industrial',
  infrastructure: 'Infrastructure'
}

const categoryColors = {
  residential: 'bg-green-100 text-green-800 border-green-200',
  commercial: 'bg-blue-100 text-blue-800 border-blue-200',
  industrial: 'bg-orange-100 text-orange-800 border-orange-200',
  infrastructure: 'bg-purple-100 text-purple-800 border-purple-200'
}

const currencies = [
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'CAD', label: '$ CAD' },
  { value: 'AUD', label: '$ AUD' },
]

// Form validation
interface ProjectFormData {
  name: string
  description: string
  status: ProjectStatus
  client: string
  location: string
  totalBudget: string
  currency: string
  deadline: string
  notes: string
  tags: string[]
}

interface ProjectCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated?: (projectId: string) => void
  editProject?: Project // If provided, modal will be in edit mode
}

type CreationMode = 'choose' | 'new' | 'template'

export default function ProjectCreationModal({ 
  open, 
  onOpenChange, 
  onProjectCreated,
  editProject 
}: ProjectCreationModalProps) {
  const { createProject, updateProject } = useProjects()
  const isEditMode = !!editProject
  
  const [mode, setMode] = useState<CreationMode>('new') // Start directly with new project mode
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isCreating, setIsCreating] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form data based on edit mode
  const getInitialFormData = (): ProjectFormData => {
    if (isEditMode && editProject) {
      return {
        name: editProject.name,
        description: editProject.description,
        status: editProject.status,
        client: editProject.client || '',
        location: editProject.location || '',
        totalBudget: editProject.totalBudget?.toString() || '',
        currency: editProject.currency,
        deadline: editProject.deadline ? new Date(editProject.deadline).toISOString().split('T')[0] : '',
        notes: editProject.notes,
        tags: [...editProject.tags]
      }
    }
    return {
      name: '',
      description: '',
      status: ProjectStatus.PLANNING,
      client: '',
      location: '',
      totalBudget: '',
      currency: 'USD',
      deadline: '',
      notes: '',
      tags: []
    }
  }

  // New project form state
  const [formData, setFormData] = useState<ProjectFormData>(getInitialFormData())
  
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<Partial<ProjectFormData>>({})

  // Update form data when editProject changes
  useEffect(() => {
    setFormData(getInitialFormData())
  }, [editProject, isEditMode])

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? projectTemplates 
    : projectTemplates.filter(template => template.category === selectedCategory)

  // Reset state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMode('new') // Reset to new project mode
      setSelectedCategory('all')
      setIsCreating(null)
      setIsSubmitting(false)
      setFormData(getInitialFormData()) // Reset to initial data (empty or edit data)
      setNewTag('')
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  // Create project from template
  const handleCreateFromTemplate = async (template: ProjectTemplate) => {
    setIsCreating(template.id)
    
    try {
      const projectData = {
        name: `${template.name} Project`,
        description: template.description,
        status: template.defaultStatus,
        currency: 'USD',
        notes: `Created from ${template.name} template.\n\nCommon materials:\n${template.commonMaterials.map(m => `- ${m}`).join('\n')}`,
        tags: [...template.tags, 'template']
      }

      const projectId = await createProject(projectData)
      
      toast({
        title: "Project Created",
        description: `Successfully created project from ${template.name} template`,
      })
      
      handleOpenChange(false)
      if (onProjectCreated) {
        onProjectCreated(projectId)
      }
    } catch (error) {
      console.error('Failed to create project from template:', error)
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive"
      })
    } finally {
      setIsCreating(null)
    }
  }

  // Form handlers for new project
  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission for new project or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        client: formData.client.trim() || undefined,
        location: formData.location.trim() || undefined,
        totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : undefined,
        currency: formData.currency,
        deadline: formData.deadline ? new Date(formData.deadline) : undefined,
        notes: formData.notes.trim(),
        tags: formData.tags
      }

      let projectId: string

      if (isEditMode && editProject) {
        // Update existing project
        const updatedProject = {
          ...editProject,
          ...projectData,
          updatedAt: new Date()
        }
        await updateProject(updatedProject)
        projectId = editProject.id
        
        toast({
          title: "Project Updated",
          description: `Successfully updated project "${projectData.name}"`,
        })
      } else {
        // Create new project
        projectId = await createProject(projectData)
        
        toast({
          title: "Project Created",
          description: `Successfully created project "${projectData.name}"`,
        })
      }
      
      handleOpenChange(false)
      if (onProjectCreated) {
        onProjectCreated(projectId)
      }
    } catch (error) {
      console.error(isEditMode ? 'Failed to update project:' : 'Failed to create project:', error)
      toast({
        title: isEditMode ? "Update Failed" : "Creation Failed",
        description: error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} project`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Template card component
  const TemplateCard = ({ template }: { template: ProjectTemplate }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 h-full cursor-pointer"
          onClick={() => handleCreateFromTemplate(template)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {template.icon}
            </div>
            <Badge 
              variant="outline" 
              className={categoryColors[template.category]}
            >
              {categoryLabels[template.category]}
            </Badge>
          </div>
        </div>
        
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {template.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Project Details */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{template.estimatedDuration}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Budget:</span>
            <span className="font-medium">{template.typicalBudgetRange}</span>
          </div>
        </div>

        {/* Common Materials */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Common Materials:</p>
          <div className="space-y-1">
            {template.commonMaterials.slice(0, 3).map((material, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                • {material}
              </p>
            ))}
            {template.commonMaterials.length > 3 && (
              <p className="text-sm text-muted-foreground">
                • and {template.commonMaterials.length - 3} more...
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full mt-4"
          disabled={isCreating === template.id}
          onClick={(e) => {
            e.stopPropagation()
            handleCreateFromTemplate(template)
          }}
        >
          {isCreating === template.id ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Use This Template
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )

  const renderChooseMode = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Project
        </DialogTitle>
        <DialogDescription>
          Choose how you'd like to create your new project
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <Card className="group hover:shadow-md transition-all cursor-pointer" onClick={() => setMode('new')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Start from Scratch</h3>
                <p className="text-sm text-muted-foreground">
                  Create a custom project with your own specifications
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all cursor-pointer" onClick={() => setMode('template')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Layers className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Use Template</h3>
                <p className="text-sm text-muted-foreground">
                  Start with pre-configured templates for common project types
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  )

  const renderTemplateMode = () => (
    <>
      <DialogHeader className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode('choose')}
            className="p-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <DialogTitle>Choose Template</DialogTitle>
            <DialogDescription>
              Start with pre-configured templates for common construction types
            </DialogDescription>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Templates
          </Button>
          {Object.entries(categoryLabels).map(([category, label]) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {label}
            </Button>
          ))}
        </div>
      </DialogHeader>

      <div className="max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setMode('choose')}>
          Back
        </Button>
        <Button variant="outline" onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
      </DialogFooter>
    </>
  )

  const renderNewProjectMode = () => (
    <>
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        <DialogDescription>
          {isEditMode 
            ? 'Update project information and settings'
            : 'Set up a new construction project to track materials and progress'
          }
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="max-h-[60vh] overflow-y-auto space-y-4 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter project name"
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the project scope and objectives"
              rows={3}
              className={cn(errors.description && "border-destructive")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => handleChange('client', e.target.value)}
                placeholder="Client name"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Project location"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProjectStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {PROJECT_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => handleChange('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="totalBudget">Total Budget</Label>
              <Input
                id="totalBudget"
                type="number"
                min="0"
                step="0.01"
                value={formData.totalBudget}
                onChange={(e) => handleChange('totalBudget', e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange('deadline', e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag"
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addTag}
                disabled={!newTag.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any additional notes or requirements"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Project' : 'Create Project'}
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        {renderNewProjectMode()}
        {/* Template functionality commented out for now */}
        {/* {mode === 'choose' && renderChooseMode()}
        {mode === 'template' && renderTemplateMode()} */}
      </DialogContent>
    </Dialog>
  )
} 