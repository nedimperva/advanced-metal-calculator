"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Clock,
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Copy,
  Save,
  Users,
  Wrench,
  FileText,
  Calculator,
  Zap,
  Bookmark,
  ArrowRight,
  CheckSquare,
  Filter,
  Star,
  History,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  PlayCircle,
  StopCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays, addDays, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { useMediaQuery } from '@/hooks/use-media-query'
import { 
  type Worker,
  type Machinery,
  type DailyJournalTimesheet,
  type JournalWorkerEntry,
  type JournalMachineryEntry,
  type Project
} from '@/lib/types'
import {
  getAllWorkers,
  getAllMachinery,
  getDailyJournalTimesheetByDate,
  saveDailyJournalTimesheet,
  duplicateDailyJournalTimesheet,
  calculateJournalTimesheetTotals
} from '@/lib/database'
import { useProjects } from '@/contexts/project-context'
import { toast } from '@/hooks/use-toast'

// ============================================================================
// TYPES FOR ENHANCED FEATURES
// ============================================================================

interface ProjectTemplate {
  id: string
  name: string
  workers: { workerId: string; defaultHours: number }[]
  machinery: { machineryId: string; defaultHours: number }[]
  createdAt: Date
  isStarred: boolean
}

interface BulkEntry {
  resourceId: string
  resourceName: string
  resourceType: 'worker' | 'machinery'
  hourlyRate: number
  hours: number
  selected: boolean
}

interface QuickProject {
  projectId: string
  projectName: string
  defaultHours: number
  workers: string[]
  machinery: string[]
}

interface ProjectTimesheetEntry {
  projectId: string
  hours: number
}

// ============================================================================
// BULK ENTRY DIALOG
// ============================================================================

interface BulkEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entries: { workers: JournalWorkerEntry[], machinery: JournalMachineryEntry[] }) => void
  workers: Worker[]
  machinery: Machinery[]
  projects: Project[]
  template?: ProjectTemplate
}

function BulkEntryDialog({
  isOpen,
  onClose,
  onSave,
  workers,
  machinery,
  projects,
  template
}: BulkEntryDialogProps) {
  const [selectedProject, setSelectedProject] = useState('')
  const [defaultHours, setDefaultHours] = useState('8')
  const [bulkEntries, setBulkEntries] = useState<BulkEntry[]>([])
  const [filterType, setFilterType] = useState<'all' | 'workers' | 'machinery'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Initialize bulk entries
  useEffect(() => {
    if (!isOpen) return
    
    const allEntries: BulkEntry[] = [
      ...workers.map(worker => ({
        resourceId: worker.id,
        resourceName: worker.name,
        resourceType: 'worker' as const,
        hourlyRate: worker.hourlyRate,
        hours: template?.workers.find(w => w.workerId === worker.id)?.defaultHours || parseFloat(defaultHours),
        selected: template?.workers.some(w => w.workerId === worker.id) || false
      })),
      ...machinery.map(machine => ({
        resourceId: machine.id,
        resourceName: machine.name,
        resourceType: 'machinery' as const,
        hourlyRate: machine.hourlyRate,
        hours: template?.machinery.find(m => m.machineryId === machine.id)?.defaultHours || parseFloat(defaultHours),
        selected: template?.machinery.some(m => m.machineryId === machine.id) || false
      }))
    ]
    
    setBulkEntries(allEntries)

  }, [isOpen, workers, machinery, template, defaultHours])

  const filteredEntries = useMemo(() => {
    return bulkEntries.filter(entry => {
      const matchesType = filterType === 'all' || 
        (filterType === 'workers' && entry.resourceType === 'worker') ||
        (filterType === 'machinery' && entry.resourceType === 'machinery')
      const matchesSearch = entry.resourceName.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [bulkEntries, filterType, searchTerm])

  const toggleSelection = (resourceId: string) => {
    setBulkEntries(prev => prev.map(entry =>
      entry.resourceId === resourceId 
        ? { ...entry, selected: !entry.selected }
        : entry
    ))
  }

  const updateHours = (resourceId: string, hours: number) => {
    setBulkEntries(prev => prev.map(entry =>
      entry.resourceId === resourceId 
        ? { ...entry, hours }
        : entry
    ))
  }

  const selectAll = () => {
    setBulkEntries(prev => prev.map(entry => ({
      ...entry,
      selected: true
    })))
  }

  const selectNone = () => {
    setBulkEntries(prev => prev.map(entry => ({
      ...entry,
      selected: false
    })))
  }

  const applyDefaultHours = () => {
    const hours = parseFloat(defaultHours)
    setBulkEntries(prev => prev.map(entry => ({
      ...entry,
      hours: entry.selected ? hours : entry.hours
    })))
  }

  const handleSave = () => {
    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project",
        variant: "destructive"
      })
      return
    }

    const selectedEntries = bulkEntries.filter(entry => entry.selected && entry.hours > 0)
    
    if (selectedEntries.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one resource with hours",
        variant: "destructive"
      })
      return
    }

    const workerEntries: JournalWorkerEntry[] = selectedEntries
      .filter(entry => entry.resourceType === 'worker')
      .map(entry => ({
        workerId: entry.resourceId,
        workerName: entry.resourceName,
        hourlyRate: entry.hourlyRate,
        totalHours: entry.hours,
        totalCost: entry.hours * entry.hourlyRate,
        projectHours: [{
          projectId: selectedProject,
          hours: entry.hours,
          cost: entry.hours * entry.hourlyRate
        }]
      }))

    const machineryEntries: JournalMachineryEntry[] = selectedEntries
      .filter(entry => entry.resourceType === 'machinery')
      .map(entry => ({
        machineryId: entry.resourceId,
        machineryName: entry.resourceName,
        hourlyRate: entry.hourlyRate,
        totalHours: entry.hours,
        totalCost: entry.hours * entry.hourlyRate,
        projectHours: [{
          projectId: selectedProject,
          hours: entry.hours,
          cost: entry.hours * entry.hourlyRate
        }]
      }))

    onSave({ workers: workerEntries, machinery: machineryEntries })
  }

  const selectedCount = bulkEntries.filter(entry => entry.selected).length
  const totalCost = bulkEntries
    .filter(entry => entry.selected)
    .reduce((sum, entry) => sum + (entry.hours * entry.hourlyRate), 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Bulk Entry - {template ? `Template: ${template.name}` : 'Quick Add Resources'}
          </DialogTitle>
          <DialogDescription>
            Select multiple workers and machinery to add them all at once to a project
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Project Selection & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <Label>Project *</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Default Hours</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={defaultHours}
                  onChange={(e) => setDefaultHours(e.target.value)}
                  placeholder="8"
                  min="0"
                  step="0.5"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyDefaultHours}
                  disabled={selectedCount === 0}
                >
                  Apply
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  All
                </Button>
                <Button variant="outline" size="sm" onClick={selectNone}>
                  None
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All ({bulkEntries.length})
              </Button>
              <Button
                variant={filterType === 'workers' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('workers')}
              >
                <Users className="h-4 w-4 mr-1" />
                Workers ({workers.length})
              </Button>
              <Button
                variant={filterType === 'machinery' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('machinery')}
              >
                <Wrench className="h-4 w-4 mr-1" />
                Machinery ({machinery.length})
              </Button>
            </div>
            
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>

          {/* Resource List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 border-b font-medium text-sm">
              <div className="col-span-1">Select</div>
              <div className="col-span-4">Resource</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Rate</div>
              <div className="col-span-2">Hours</div>
              <div className="col-span-1">Cost</div>
            </div>
            
            <div className="divide-y">
              {filteredEntries.map((entry) => (
                <div key={entry.resourceId} className={cn(
                  "grid grid-cols-12 gap-2 p-3 items-center hover:bg-muted/30 transition-colors",
                  entry.selected && "bg-blue-50 border-l-2 border-l-blue-500"
                )}>
                  <div className="col-span-1">
                    <Checkbox
                      checked={entry.selected}
                      onCheckedChange={() => toggleSelection(entry.resourceId)}
                    />
                  </div>
                  <div className="col-span-4">
                    <div className="font-medium">{entry.resourceName}</div>
                  </div>
                  <div className="col-span-2">
                    <Badge variant={entry.resourceType === 'worker' ? 'default' : 'secondary'}>
                      {entry.resourceType === 'worker' ? (
                        <Users className="h-3 w-3 mr-1" />
                      ) : (
                        <Wrench className="h-3 w-3 mr-1" />
                      )}
                      {entry.resourceType}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm">${entry.hourlyRate}/hr</span>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={entry.hours}
                      onChange={(e) => updateHours(entry.resourceId, parseFloat(e.target.value) || 0)}
                      disabled={!entry.selected}
                      min="0"
                      step="0.5"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm font-medium">
                      ${(entry.hours * entry.hourlyRate).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div className="text-sm">
                <strong>{selectedCount}</strong> resources selected
              </div>
              <div className="text-lg font-bold text-green-700">
                Total: ${totalCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={selectedCount === 0 || !selectedProject}>
            Add {selectedCount} Resources
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface TimesheetEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry: JournalWorkerEntry | JournalMachineryEntry) => void
  workers: Worker[]
  machinery: Machinery[]
  projects: Project[]
  entry?: JournalWorkerEntry | JournalMachineryEntry
  type: 'worker' | 'machinery'
}

function TimesheetEntryDialog({
  isOpen,
  onClose,
  onSave,
  workers,
  machinery,
  projects,
  entry,
  type
}: TimesheetEntryDialogProps) {
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const [projectEntries, setProjectEntries] = useState<ProjectTimesheetEntry[]>([
    { projectId: '', hours: 0 }
  ])

  useEffect(() => {
    if (entry) {
      if (type === 'worker') {
        const workerEntry = entry as JournalWorkerEntry
        setSelectedResourceId(workerEntry.workerId)
        setProjectEntries(workerEntry.projectHours.map((ph) => ({
          projectId: ph.projectId,
          hours: ph.hours
        })))
      } else {
        const machineryEntry = entry as JournalMachineryEntry
        setSelectedResourceId(machineryEntry.machineryId)
        setProjectEntries(machineryEntry.projectHours.map((ph) => ({
          projectId: ph.projectId,
          hours: ph.hours
        })))
      }
    } else {
      setSelectedResourceId('')
      setProjectEntries([{ projectId: '', hours: 0 }])
    }
  }, [entry, type, isOpen])

  const handleAddProjectEntry = () => {
    setProjectEntries(prev => [...prev, { projectId: '', hours: 0 }])
  }

  const handleUpdateProjectEntry = (index: number, field: 'projectId' | 'hours', value: string | number) => {
    setProjectEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ))
  }

  const handleRemoveProjectEntry = (index: number) => {
    if (projectEntries.length > 1) {
      setProjectEntries(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSave = () => {
    if (!selectedResourceId) {
      toast({
        title: "Error",
        description: `Please select a ${type}`,
        variant: "destructive"
      })
      return
    }

    const validEntries = projectEntries.filter(entry => 
      entry.projectId && entry.hours > 0
    )

    if (validEntries.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one project with hours",
        variant: "destructive"
      })
      return
    }

    const totalHours = validEntries.reduce((sum, entry) => sum + entry.hours, 0)
    const resource = type === 'worker' 
      ? workers.find(w => w.id === selectedResourceId)
      : machinery.find(m => m.id === selectedResourceId)

    if (!resource) return

    const newEntry = type === 'worker' ? {
      workerId: selectedResourceId,
      workerName: (resource as Worker).name,
      hourlyRate: resource.hourlyRate,
      totalHours,
      totalCost: totalHours * resource.hourlyRate,
      projectHours: validEntries.map(entry => ({
        projectId: entry.projectId,
        hours: entry.hours,
        cost: entry.hours * resource.hourlyRate
      }))
    } as JournalWorkerEntry : {
      machineryId: selectedResourceId,
      machineryName: (resource as Machinery).name,
      hourlyRate: resource.hourlyRate,
      totalHours,
      totalCost: totalHours * resource.hourlyRate,
      projectHours: validEntries.map(entry => ({
        projectId: entry.projectId,
        hours: entry.hours,
        cost: entry.hours * resource.hourlyRate
      }))
    } as JournalMachineryEntry

    onSave(newEntry)
  }

  const totalHours = projectEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entry ? 'Edit' : 'Add'} {type === 'worker' ? 'Worker' : 'Machinery'} Entry
          </DialogTitle>
          <DialogDescription>
            Assign time to one or more projects for this {type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="resource">
              Select {type === 'worker' ? 'Worker' : 'Machinery'}
            </Label>
            <Select value={selectedResourceId} onValueChange={setSelectedResourceId}>
              <SelectTrigger>
                <SelectValue placeholder={`Choose ${type}...`} />
              </SelectTrigger>
              <SelectContent>
                {(type === 'worker' ? workers : machinery)
                  .filter(resource => resource.isActive)
                  .map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name} (${resource.hourlyRate}/hr)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Project Assignments</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddProjectEntry}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            {projectEntries.map((entry, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Project</Label>
                  <Select 
                    value={entry.projectId} 
                    onValueChange={(value) => handleUpdateProjectEntry(index, 'projectId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24">
                  <Label className="text-xs">Hours</Label>
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={entry.hours || ''}
                    onChange={(e) => handleUpdateProjectEntry(index, 'hours', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                {projectEntries.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveProjectEntry(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}

            <div className="text-sm text-muted-foreground">
              Total Hours: <span className="font-medium">{totalHours.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className={cn(
          "gap-2",
          "sm:flex-row flex-col"
        )}>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="w-full sm:w-auto"
          >
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// TEMPLATE MANAGEMENT DIALOG
// ============================================================================

interface TemplateManagerProps {
  isOpen: boolean
  onClose: () => void
  templates: ProjectTemplate[]
  onSaveTemplate: (template: Omit<ProjectTemplate, 'id' | 'createdAt'>) => void
  onDeleteTemplate: (templateId: string) => void
  onApplyTemplate: (template: ProjectTemplate) => void
  projects: Project[]
  workers: Worker[]
  machinery: Machinery[]
  currentTimesheet?: DailyJournalTimesheet
}

function TemplateManager({
  isOpen,
  onClose,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  onApplyTemplate,
  projects,
  workers,
  machinery,
  currentTimesheet
}: TemplateManagerProps) {
  const [activeTab, setActiveTab] = useState<'saved' | 'create'>('saved')
  const [newTemplateName, setNewTemplateName] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [templateWorkers, setTemplateWorkers] = useState<{ workerId: string; defaultHours: number }[]>([])
  const [templateMachinery, setTemplateMachinery] = useState<{ machineryId: string; defaultHours: number }[]>([])

  const handleCreateCustomTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive"
      })
      return
    }

    if (templateWorkers.length === 0 && templateMachinery.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one worker or machinery",
        variant: "destructive"
      })
      return
    }

    const template: Omit<ProjectTemplate, 'id' | 'createdAt'> = {
      name: newTemplateName.trim(),
      workers: templateWorkers,
      machinery: templateMachinery,
      isStarred: false
    }

            onSaveTemplate(template)
        setNewTemplateName('')
        setTemplateWorkers([])
        setTemplateMachinery([])
        setActiveTab('saved')
    toast({
      title: "Template Saved",
      description: `Template "${template.name}" has been created`
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Project Templates
          </DialogTitle>
          <DialogDescription>
            Save and reuse worker/machinery combinations for faster daily entry
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'saved' | 'create')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="saved">Saved Templates ({templates.length})</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No templates saved yet</p>
                <p className="text-sm">Create templates from your current timesheets</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {templates.map((template) => {
                  return (
                    <Card key={template.id} className="hover:bg-muted/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{template.name}</h4>
                              {template.isStarred && (
                                <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Universal template - can be applied to any project
                            </p>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{template.workers.length} workers</span>
                              <span>{template.machinery.length} machinery</span>
                              <span>
                                {template.workers.reduce((sum, w) => sum + w.defaultHours, 0) +
                                 template.machinery.reduce((sum, m) => sum + m.defaultHours, 0)} total hours
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onApplyTemplate(template)}
                            >
                              <PlayCircle className="h-4 w-4 mr-1" />
                              Use
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteTemplate(template.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="e.g., Steel Fabrication Team"
                />
              </div>



              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Select Resources for Template</h4>
                </div>
                
                {/* Workers Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Workers
                  </Label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg bg-background">
                    {workers.map(worker => (
                      <div key={worker.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={templateWorkers.some(tw => tw.workerId === worker.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTemplateWorkers(prev => [...prev, { workerId: worker.id, defaultHours: 8 }])
                              } else {
                                setTemplateWorkers(prev => prev.filter(tw => tw.workerId !== worker.id))
                              }
                            }}
                          />
                          <span className="text-sm">{worker.name}</span>
                          <Badge variant="outline" className="text-xs">${worker.hourlyRate}/hr</Badge>
                        </div>
                        {templateWorkers.some(tw => tw.workerId === worker.id) && (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={templateWorkers.find(tw => tw.workerId === worker.id)?.defaultHours || 8}
                              onChange={(e) => {
                                const hours = parseFloat(e.target.value) || 0
                                setTemplateWorkers(prev => prev.map(tw => 
                                  tw.workerId === worker.id ? { ...tw, defaultHours: hours } : tw
                                ))
                              }}
                              className="w-16 h-6 text-xs"
                              min="0"
                              step="0.5"
                            />
                            <span className="text-xs text-muted-foreground">hrs</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Machinery Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Machinery
                  </Label>
                  <div className="max-h-40 overflow-y-auto border rounded-lg bg-background">
                    {machinery.map(machine => (
                      <div key={machine.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={templateMachinery.some(tm => tm.machineryId === machine.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTemplateMachinery(prev => [...prev, { machineryId: machine.id, defaultHours: 8 }])
                              } else {
                                setTemplateMachinery(prev => prev.filter(tm => tm.machineryId !== machine.id))
                              }
                            }}
                          />
                          <span className="text-sm">{machine.name}</span>
                          <Badge variant="outline" className="text-xs">${machine.hourlyRate}/hr</Badge>
                        </div>
                        {templateMachinery.some(tm => tm.machineryId === machine.id) && (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={templateMachinery.find(tm => tm.machineryId === machine.id)?.defaultHours || 8}
                              onChange={(e) => {
                                const hours = parseFloat(e.target.value) || 0
                                setTemplateMachinery(prev => prev.map(tm => 
                                  tm.machineryId === machine.id ? { ...tm, defaultHours: hours } : tm
                                ))
                              }}
                              className="w-16 h-6 text-xs"
                              min="0"
                              step="0.5"
                            />
                            <span className="text-xs text-muted-foreground">hrs</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Template Summary */}
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <div className="text-sm">
                    <strong>Template will include:</strong> {templateWorkers.length} workers, {templateMachinery.length} machinery
                    {templateWorkers.length + templateMachinery.length > 0 && (
                      <span className="ml-2 text-muted-foreground">
                        ({templateWorkers.reduce((sum, w) => sum + w.defaultHours, 0) + 
                         templateMachinery.reduce((sum, m) => sum + m.defaultHours, 0)} total hours)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCreateCustomTemplate}
                disabled={!newTemplateName.trim() || (templateWorkers.length === 0 && templateMachinery.length === 0)}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default function DailyJournal() {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const { projects } = useProjects()
  
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentTimesheet, setCurrentTimesheet] = useState<DailyJournalTimesheet | null>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [machinery, setMachinery] = useState<Machinery[]>([])
  const [loading, setLoading] = useState(false)
  
  // Enhanced features state
  const [viewMode, setViewMode] = useState<'daily' | 'project' | 'quick'>('quick')
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [showBulkEntry, setShowBulkEntry] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | undefined>()
  const [showWeekView, setShowWeekView] = useState(false)

  // Quick entry mode state
  const [quickProjects, setQuickProjects] = useState<QuickProject[]>([])
  const [activeQuickProject, setActiveQuickProject] = useState<string>('')
  
  // Modal states
  const [showEntryDialog, setShowEntryDialog] = useState(false)
  const [entryType, setEntryType] = useState<'worker' | 'machinery'>('worker')
  const [editingEntry, setEditingEntry] = useState<JournalWorkerEntry | JournalMachineryEntry | null>(null)

  useEffect(() => {
    loadResources()
    loadTemplates()
  }, [])

  useEffect(() => {
    loadTimesheet()
  }, [selectedDate])

  const loadResources = async () => {
    try {
      const [workersData, machineryData] = await Promise.all([
        getAllWorkers(),
        getAllMachinery()
      ])
      setWorkers(workersData.filter(w => w.isActive))
      setMachinery(machineryData.filter(m => m.isActive))
    } catch (error) {
      console.error('Failed to load resources:', error)
    }
  }

  const loadTimesheet = async () => {
    setLoading(true)
    try {
      const timesheet = await getDailyJournalTimesheetByDate(selectedDate)
      setCurrentTimesheet(timesheet)
    } catch (error) {
      console.error('Failed to load timesheet:', error)
      setCurrentTimesheet(null)
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    // In a real implementation, load from localStorage or database
    const savedTemplates = localStorage.getItem('journal-templates')
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates))
    }
  }

  const saveTemplate = (template: Omit<ProjectTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: ProjectTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      createdAt: new Date()
    }
    const updatedTemplates = [...templates, newTemplate]
    setTemplates(updatedTemplates)
    localStorage.setItem('journal-templates', JSON.stringify(updatedTemplates))
  }

  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId)
    setTemplates(updatedTemplates)
    localStorage.setItem('journal-templates', JSON.stringify(updatedTemplates))
  }

  const applyTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateManager(false)
    setShowBulkEntry(true)
  }

  const handleBulkSave = async (entries: { workers: JournalWorkerEntry[], machinery: JournalMachineryEntry[] }) => {
    try {
      const updatedTimesheet: DailyJournalTimesheet = currentTimesheet || {
        id: `journal-${format(selectedDate, 'yyyy-MM-dd')}`,
        date: selectedDate,
        workerEntries: [],
        machineryEntries: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Add new entries, replacing any existing ones for the same resources
      updatedTimesheet.workerEntries = [
        ...updatedTimesheet.workerEntries.filter(e => 
          !entries.workers.some(w => w.workerId === e.workerId)
        ),
        ...entries.workers
      ]

      updatedTimesheet.machineryEntries = [
        ...updatedTimesheet.machineryEntries.filter(e => 
          !entries.machinery.some(m => m.machineryId === e.machineryId)
        ),
        ...entries.machinery
      ]

      // Recalculate totals
      const totals = calculateJournalTimesheetTotals(updatedTimesheet)
      updatedTimesheet.totalLaborHours = totals.totalLaborHours
      updatedTimesheet.totalMachineryHours = totals.totalMachineryHours
      updatedTimesheet.totalLaborCost = totals.totalLaborCost
      updatedTimesheet.totalMachineryCost = totals.totalMachineryCost
      updatedTimesheet.totalCost = totals.totalCost
      updatedTimesheet.updatedAt = new Date()

      await saveDailyJournalTimesheet(updatedTimesheet)
      setCurrentTimesheet(updatedTimesheet)
      setShowBulkEntry(false)
      setSelectedTemplate(undefined)

      toast({
        title: "Bulk Entry Saved",
        description: `Added ${entries.workers.length} workers and ${entries.machinery.length} machinery entries`
      })
    } catch (error) {
      console.error('Failed to save bulk entry:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save bulk entries",
        variant: "destructive"
      })
    }
  }

  const handleDuplicateDay = async (sourceDate: Date, targetDates: Date[]) => {
    try {
      for (const targetDate of targetDates) {
        await duplicateDailyJournalTimesheet(sourceDate, targetDate)
      }
      
      // Reload current timesheet if one of the target dates is the selected date
      if (targetDates.some(date => format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd'))) {
        await loadTimesheet()
      }
      
      toast({
        title: "Timesheet Duplicated",
        description: `Copied to ${targetDates.length} day${targetDates.length > 1 ? 's' : ''}`
      })
    } catch (error) {
      console.error('Failed to duplicate timesheet:', error)
      toast({
        title: "Duplicate Failed",
        description: "Failed to duplicate timesheet",
        variant: "destructive"
      })
    }
  }

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Monday
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }

  const handleAddEntry = (type: 'worker' | 'machinery') => {
    setEntryType(type)
    setEditingEntry(null)
    setShowEntryDialog(true)
  }

  const handleEditEntry = (entry: JournalWorkerEntry | JournalMachineryEntry, type: 'worker' | 'machinery') => {
    setEntryType(type)
    setEditingEntry(entry)
    setShowEntryDialog(true)
  }

  const handleSaveEntry = async (entry: JournalWorkerEntry | JournalMachineryEntry) => {
    try {
      const updatedTimesheet: DailyJournalTimesheet = currentTimesheet || {
        id: `journal-${format(selectedDate, 'yyyy-MM-dd')}`,
        date: selectedDate,
        workerEntries: [],
        machineryEntries: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (entryType === 'worker') {
        const workerEntry = entry as JournalWorkerEntry
        if (editingEntry) {
          // Update existing entry
          updatedTimesheet.workerEntries = updatedTimesheet.workerEntries.map(e =>
            e.workerId === workerEntry.workerId ? workerEntry : e
          )
        } else {
          // Add new entry
          updatedTimesheet.workerEntries = [
            ...updatedTimesheet.workerEntries.filter(e => e.workerId !== workerEntry.workerId),
            workerEntry
          ]
        }
      } else {
        const machineryEntry = entry as JournalMachineryEntry
        if (editingEntry) {
          // Update existing entry
          updatedTimesheet.machineryEntries = updatedTimesheet.machineryEntries.map(e =>
            e.machineryId === machineryEntry.machineryId ? machineryEntry : e
          )
        } else {
          // Add new entry
          updatedTimesheet.machineryEntries = [
            ...updatedTimesheet.machineryEntries.filter(e => e.machineryId !== machineryEntry.machineryId),
            machineryEntry
          ]
        }
      }

      // Recalculate totals
      const totals = calculateJournalTimesheetTotals(updatedTimesheet)
      updatedTimesheet.totalLaborHours = totals.totalLaborHours
      updatedTimesheet.totalMachineryHours = totals.totalMachineryHours
      updatedTimesheet.totalLaborCost = totals.totalLaborCost
      updatedTimesheet.totalMachineryCost = totals.totalMachineryCost
      updatedTimesheet.totalCost = totals.totalCost
      updatedTimesheet.updatedAt = new Date()

      await saveDailyJournalTimesheet(updatedTimesheet)
      setCurrentTimesheet(updatedTimesheet)
      setShowEntryDialog(false)
      setEditingEntry(null)

      toast({
        title: "Entry Saved",
        description: `${entryType === 'worker' ? 'Worker' : 'Machinery'} entry has been saved.`
      })
    } catch (error) {
      console.error('Failed to save entry:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save timesheet entry.",
        variant: "destructive"
      })
    }
  }

  const quickEntryActions = [
    {
      title: "Bulk Add Resources",
      description: "Select multiple workers and machinery at once",
      icon: <CheckSquare className="h-5 w-5" />,
      action: () => {
        setSelectedTemplate(undefined)
        setShowBulkEntry(true)
      }
    },
    {
      title: "Use Template",
      description: "Apply a saved worker/machinery combination",
      icon: <Bookmark className="h-5 w-5" />,
      action: () => setShowTemplateManager(true)
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header with View Mode Switcher */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Journal - Enhanced
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Fast, efficient daily time tracking with templates and bulk operations
              </p>
            </div>
            
            <div className="flex gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList>
                  <TabsTrigger value="quick" className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    Quick
                  </TabsTrigger>
                  <TabsTrigger value="daily" className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Daily
                  </TabsTrigger>
                  <TabsTrigger value="project" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Project
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Date Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                >
                  ← Prev
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                  disabled={isToday(selectedDate)}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  Next →
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            {currentTimesheet && (
              <div className="flex gap-4 text-sm text-muted-foreground ml-auto">
                <span>{(currentTimesheet.workerEntries?.length || 0) + (currentTimesheet.machineryEntries?.length || 0)} entries</span>
                <span>${currentTimesheet.totalCost?.toFixed(2) || '0.00'} total</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Entry Mode */}
      {viewMode === 'quick' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickEntryActions.map((action, index) => (
            <Card key={index} className={cn(
              "hover:bg-muted/50 transition-colors cursor-pointer",
                             false && "opacity-50 cursor-not-allowed"
            )}>
              <CardContent 
                className="p-6"
                onClick={action.action}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Current Timesheet Summary (for all modes) */}
      {currentTimesheet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Timesheet</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateManager(true)}
                >
                  <Bookmark className="h-4 w-4 mr-1" />
                  Templates
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkEntry(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Bulk Add
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Card>
                <CardContent className="p-3 text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Workers</p>
                  <p className="font-bold">{currentTimesheet.workerEntries?.length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Wrench className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                  <p className="text-sm text-muted-foreground">Machinery</p>
                  <p className="font-bold">{currentTimesheet.machineryEntries?.length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="font-bold">
                    {((currentTimesheet.totalLaborHours || 0) + (currentTimesheet.totalMachineryHours || 0)).toFixed(1)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <Calculator className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="font-bold">${currentTimesheet.totalCost?.toFixed(2) || '0.00'}</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Project Breakdown */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Projects Today</h4>
              {(() => {
                const projectHours: Record<string, { hours: number; cost: number }> = {}
                
                currentTimesheet.workerEntries?.forEach(entry => {
                  entry.projectHours.forEach(ph => {
                    if (!projectHours[ph.projectId]) {
                      projectHours[ph.projectId] = { hours: 0, cost: 0 }
                    }
                    projectHours[ph.projectId].hours += ph.hours
                    projectHours[ph.projectId].cost += ph.cost
                  })
                })
                
                currentTimesheet.machineryEntries?.forEach(entry => {
                  entry.projectHours.forEach(ph => {
                    if (!projectHours[ph.projectId]) {
                      projectHours[ph.projectId] = { hours: 0, cost: 0 }
                    }
                    projectHours[ph.projectId].hours += ph.hours
                    projectHours[ph.projectId].cost += ph.cost
                  })
                })

                return Object.entries(projectHours).map(([projectId, data]) => {
                  const project = projects.find(p => p.id === projectId)
                  return (
                    <div key={projectId} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="font-medium">{project?.name || 'Unknown Project'}</span>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{data.hours.toFixed(1)}h</span>
                        <span>${data.cost.toFixed(2)}</span>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traditional View - Only show if not in quick mode */}
      {viewMode !== 'quick' && (
        <>
          {/* Date and Summary */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-4"
      )}>
        <Card>
          <CardContent className={cn("p-4", isMobile && "p-3")}>
            <div className="flex items-center">
              <Clock className={cn("text-blue-600", isMobile ? "h-5 w-5" : "h-6 w-6")} />
              <div className="ml-3">
                <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                  Labor Hours
                </p>
                <p className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}>
                  {currentTimesheet?.totalLaborHours?.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn("p-4", isMobile && "p-3")}>
            <div className="flex items-center">
              <Wrench className={cn("text-orange-600", isMobile ? "h-5 w-5" : "h-6 w-6")} />
              <div className="ml-3">
                <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                  Machine Hours
                </p>
                <p className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}>
                  {currentTimesheet?.totalMachineryHours?.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn("p-4", isMobile && "p-3")}>
            <div className="flex items-center">
              <Calculator className={cn("text-green-600", isMobile ? "h-5 w-5" : "h-6 w-6")} />
              <div className="ml-3">
                <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                  Total Cost
                </p>
                <p className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}>
                  ${currentTimesheet?.totalCost?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn("p-4", isMobile && "p-3")}>
            <div className="flex items-center">
              <FileText className={cn("text-purple-600", isMobile ? "h-5 w-5" : "h-6 w-6")} />
              <div className="ml-3">
                <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                  Entries
                </p>
                <p className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}>
                  {(currentTimesheet?.workerEntries?.length || 0) + (currentTimesheet?.machineryEntries?.length || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Worker Entries */}
      <Card>
        <CardHeader className={cn(isMobile && "pb-3")}>
          <div className={cn(
            "flex items-center justify-between",
            isMobile && "flex-col space-y-3"
          )}>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Worker Entries
            </CardTitle>
            <Button 
              onClick={() => handleAddEntry('worker')}
              className={cn(isMobile && "w-full")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentTimesheet?.workerEntries?.map((entry, index) => (
              <div key={`${entry.workerId}-${index}`} className={cn(
                "border rounded-lg",
                isMobile ? "p-3" : "flex items-center justify-between p-3"
              )}>
                <div className={cn(
                  "flex-1",
                  isMobile && "space-y-3"
                )}>
                  <div className={cn(
                    isMobile ? "space-y-2" : "flex items-center gap-2 mb-2"
                  )}>
                    <h4 className="font-medium">{entry.workerName}</h4>
                    <div className={cn(
                      "flex flex-wrap gap-1",
                      isMobile && "justify-start"
                    )}>
                      <Badge variant="outline" className="text-xs">
                        ${entry.hourlyRate}/hr
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {entry.totalHours}h
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        ${entry.totalCost.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                    Projects: {entry.projectHours.map(ph => {
                      const project = projects.find(p => p.id === ph.projectId)
                      return `${project?.name || 'Unknown'} (${ph.hours}h)`
                    }).join(', ')}
                  </div>
                  {isMobile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEntry(entry, 'worker')}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Worker
                    </Button>
                  )}
                </div>
                {!isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEntry(entry, 'worker')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {(!currentTimesheet?.workerEntries || currentTimesheet.workerEntries.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No worker entries for this date
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Machinery Entries */}
      <Card>
        <CardHeader className={cn(isMobile && "pb-3")}>
          <div className={cn(
            "flex items-center justify-between",
            isMobile && "flex-col space-y-3"
          )}>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Machinery Entries
            </CardTitle>
            <Button 
              onClick={() => handleAddEntry('machinery')}
              className={cn(isMobile && "w-full")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Machinery
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentTimesheet?.machineryEntries?.map((entry, index) => (
              <div key={`${entry.machineryId}-${index}`} className={cn(
                "border rounded-lg",
                isMobile ? "p-3" : "flex items-center justify-between p-3"
              )}>
                <div className={cn(
                  "flex-1",
                  isMobile && "space-y-3"
                )}>
                  <div className={cn(
                    isMobile ? "space-y-2" : "flex items-center gap-2 mb-2"
                  )}>
                    <h4 className="font-medium">{entry.machineryName}</h4>
                    <div className={cn(
                      "flex flex-wrap gap-1",
                      isMobile && "justify-start"
                    )}>
                      <Badge variant="outline" className="text-xs">
                        ${entry.hourlyRate}/hr
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {entry.totalHours}h
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        ${entry.totalCost.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                    Projects: {entry.projectHours.map(ph => {
                      const project = projects.find(p => p.id === ph.projectId)
                      return `${project?.name || 'Unknown'} (${ph.hours}h)`
                    }).join(', ')}
                  </div>
                  {isMobile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEntry(entry, 'machinery')}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Machinery
                    </Button>
                  )}
                </div>
                {!isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEntry(entry, 'machinery')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {(!currentTimesheet?.machineryEntries || currentTimesheet.machineryEntries.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No machinery entries for this date
              </div>
            )}
          </div>
        </CardContent>
      </Card>

        </>
      )}

      {/* Enhanced Dialogs */}
      <BulkEntryDialog
        isOpen={showBulkEntry}
        onClose={() => {
          setShowBulkEntry(false)
          setSelectedTemplate(undefined)
        }}
        onSave={handleBulkSave}
        workers={workers}
        machinery={machinery}
        projects={projects}
        template={selectedTemplate}
      />

      <TemplateManager
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        templates={templates}
        onSaveTemplate={saveTemplate}
        onDeleteTemplate={deleteTemplate}
        onApplyTemplate={applyTemplate}
        projects={projects}
        workers={workers}
        machinery={machinery}
        currentTimesheet={currentTimesheet || undefined}
      />

      {/* Entry Dialog */}
      <TimesheetEntryDialog
        isOpen={showEntryDialog}
        onClose={() => {
          setShowEntryDialog(false)
          setEditingEntry(null)
        }}
        onSave={handleSaveEntry}
        workers={workers}
        machinery={machinery}
        projects={projects}
        entry={editingEntry || undefined}
        type={entryType}
      />
    </div>
  )
} 