"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  ArrowLeft, 
  Save, 
  Plus, 
  X, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin,
  FileText,
  Tag
} from 'lucide-react'
import { useProjects } from '@/contexts/project-context'
import { cn } from '@/lib/utils'
import { ProjectStatus, type Project } from '@/lib/types'
import { PROJECT_STATUS_LABELS } from '@/lib/project-utils'
import BackgroundElements from '@/components/background-elements'
import { LoadingSpinner } from '@/components/loading-states'
import { toast } from '@/hooks/use-toast'

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

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
  { value: 'JPY', label: 'JPY (¥)' }
]

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const { 
    currentProject, 
    selectProject, 
    updateProject, 
    validateProjectData,
    isLoading 
  } = useProjects()
  
  // Form state
  const [formData, setFormData] = useState<ProjectFormData | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState('')

  // Load project data
  useEffect(() => {
    if (projectId && !currentProject) {
      selectProject(projectId)
    }
  }, [projectId, currentProject, selectProject])

  // Populate form when project loads
  useEffect(() => {
    if (currentProject) {
      setFormData({
        name: currentProject.name,
        description: currentProject.description,
        status: currentProject.status,
        client: currentProject.client || '',
        location: currentProject.location || '',
        totalBudget: currentProject.totalBudget?.toString() || '',
        currency: currentProject.currency,
        deadline: currentProject.deadline ? 
          new Date(currentProject.deadline).toISOString().split('T')[0] : '',
        notes: currentProject.notes,
        tags: [...currentProject.tags]
      })
    }
  }, [currentProject])

  // Handle form field changes
  const handleChange = (field: keyof ProjectFormData, value: string) => {
    if (!formData) return
    
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : null)
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Handle tag management
  const addTag = () => {
    if (!formData) return
    
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => prev ? ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }) : null)
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    if (!formData) return
    
    setFormData(prev => prev ? ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }) : null)
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // Form validation
  const validateForm = (): boolean => {
    if (!formData) return false
    
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Project name must be less than 100 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required'
    }

    // Budget validation
    if (formData.totalBudget) {
      const budget = parseFloat(formData.totalBudget)
      if (isNaN(budget) || budget < 0) {
        newErrors.totalBudget = 'Budget must be a valid positive number'
      }
    }

    // Deadline validation
    if (formData.deadline) {
      const deadline = new Date(formData.deadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (deadline <= today) {
        newErrors.deadline = 'Deadline must be in the future'
      }
    }

    // Additional validation using project utils
    const projectData = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      client: formData.client || undefined,
      location: formData.location || undefined,
      totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : undefined,
      currency: formData.currency,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      notes: formData.notes,
      tags: formData.tags
    }

    const validationErrors = validateProjectData(projectData)
    validationErrors.forEach(error => {
      if (error.includes('name')) newErrors.name = error
      if (error.includes('budget') || error.includes('Budget')) newErrors.totalBudget = error
      if (error.includes('deadline') || error.includes('Deadline')) newErrors.deadline = error
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData || !currentProject || !validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const updatedProject: Project = {
        ...currentProject,
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

      await updateProject(updatedProject)
      
      toast({
        title: "Project Updated",
        description: `Successfully updated project "${updatedProject.name}"`,
      })
      
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error('Failed to update project:', error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update project",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle back navigation
  const handleBack = () => {
    router.push(`/projects/${projectId}`)
  }

  if (isLoading || !currentProject || !formData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <BackgroundElements />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BackgroundElements />
      
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
            Back to Project
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
            <p className="text-muted-foreground">
              Update project information and settings
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Project Status</Label>
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
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <div className="flex flex-wrap gap-2">
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
                </CardContent>
              </Card>
            </div>

            {/* Details Sidebar */}
            <div className="space-y-6">
              {/* Client & Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client & Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Input
                      id="client"
                      value={formData.client}
                      onChange={(e) => handleChange('client', e.target.value)}
                      placeholder="Client name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="Project location"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Budget & Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Budget & Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      className={cn(errors.totalBudget && "border-destructive")}
                    />
                    {errors.totalBudget && (
                      <p className="text-sm text-destructive">{errors.totalBudget}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleChange('deadline', e.target.value)}
                      className={cn(errors.deadline && "border-destructive")}
                    />
                    {errors.deadline && (
                      <p className="text-sm text-destructive">{errors.deadline}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Project
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(currentProject.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>{new Date(currentProject.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Materials:</span>
                      <span>{currentProject.materials?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculations:</span>
                      <span>{currentProject.calculationIds?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 