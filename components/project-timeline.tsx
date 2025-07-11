"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  Truck,
  MapPin,
  User,
  FileText,
  Camera,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Circle,
  Flag,
  FileIcon,
  ImageIcon,
  PaperclipIcon,
  X,
  RefreshCcw,
  Star,
  Clock4,
  Milestone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/project-context'
import { useTask } from '@/contexts/task-context'
import { useMediaQuery } from '@/hooks/use-media-query'
import { 
  PROJECT_STATUS_LABELS, 
  PROJECT_STATUS_COLORS,
  MATERIAL_STATUS_LABELS,
  MATERIAL_STATUS_COLORS 
} from '@/lib/project-utils'
import { ProjectStatus, MaterialStatus, type Project, type ProjectMaterial, type ProjectTask } from '@/lib/types'
import { LoadingSpinner } from '@/components/loading-states'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

interface TimelineEvent {
  id: string
  type: 'milestone' | 'status_change' | 'material_delivery' | 'note' | 'photo'
  title: string
  description?: string
  timestamp: string
  author?: string
  data?: any
  attachments?: Array<{
    name: string
    url: string
    type: string
    size?: number
  }>
  linkedTaskIds?: string[]
  color?: string
  status?: 'completed' | 'in_progress' | 'pending' | 'cancelled'
  // Type-specific fields
  materialInfo?: {
    supplier?: string
    quantity?: number
    cost?: number
    trackingNumber?: string
  }
  statusChange?: {
    fromStatus: ProjectStatus
    toStatus: ProjectStatus
  }
  milestone?: {
    type: 'start' | 'checkpoint' | 'completion' | 'deadline'
    importance: 'low' | 'medium' | 'high' | 'critical'
  }
}

interface ProjectTimelineProps {
  project: Project
  onUpdate?: () => void
  className?: string
  availableTasks?: ProjectTask[]
}

interface AddEventModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onAdd: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void
  availableTasks?: ProjectTask[]
}

// Add Event Modal Component with Enhanced Type-Specific UI
function AddEventModal({ 
  project, 
  isOpen, 
  onClose, 
  onAdd,
  availableTasks = []
}: AddEventModalProps) {
  const { updateProject } = useProjects()
  const { t, language } = useI18n()
  const isMobile = useMediaQuery("(max-width: 767px)")
  
  // Common fields
  const [eventType, setEventType] = useState<TimelineEvent['type']>('note')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  
  // Status change specific fields
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>(project.status)
  
  // Material delivery specific fields
  const [supplier, setSupplier] = useState('')
  const [quantity, setQuantity] = useState('')
  const [cost, setCost] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  
  // Milestone specific fields
  const [milestoneType, setMilestoneType] = useState<'start' | 'checkpoint' | 'completion' | 'deadline'>('checkpoint')
  const [milestoneImportance, setMilestoneImportance] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')

  const eventTypeOptions = [
    { 
      value: 'note', 
      label: 'Note', 
      icon: FileText,
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Add a project note or observation'
    },
    { 
      value: 'milestone', 
      label: 'Milestone', 
      icon: Flag,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Mark an important project milestone'
    },
    { 
      value: 'status_change', 
      label: 'Status Change', 
      icon: RefreshCcw,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Update project status'
    },
    { 
      value: 'material_delivery', 
      label: 'Material Delivery', 
      icon: Truck,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Record material or equipment delivery'
    },
    { 
      value: 'photo', 
      label: 'Photo/Progress', 
      icon: Camera,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Upload photos or progress documentation'
    }
  ]

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setAuthor('')
    setSelectedTasks([])
    setFiles([])
    setSupplier('')
    setQuantity('')
    setCost('')
    setTrackingNumber('')
    setMilestoneType('checkpoint')
    setMilestoneImportance('medium')
    setNewProjectStatus(project.status)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAdd = async () => {
    if (!title.trim()) return

    setIsLoading(true)
    try {
      const baseEvent: Omit<TimelineEvent, 'id' | 'timestamp'> = {
        type: eventType,
        title: title.trim(),
        description: description.trim() || undefined,
        author: author.trim() || undefined,
        linkedTaskIds: selectedTasks.length > 0 ? selectedTasks : undefined,
        status: 'completed'
      }

      // Add type-specific data
      switch (eventType) {
        case 'status_change':
          baseEvent.statusChange = {
            fromStatus: project.status,
            toStatus: newProjectStatus
          }
          // Update project status if it's different
          if (newProjectStatus !== project.status) {
            await updateProject({
              ...project,
              status: newProjectStatus,
              updatedAt: new Date()
            })
          }
          break
          
        case 'material_delivery':
          baseEvent.materialInfo = {
            supplier: supplier.trim() || undefined,
            quantity: quantity ? parseFloat(quantity) : undefined,
            cost: cost ? parseFloat(cost) : undefined,
            trackingNumber: trackingNumber.trim() || undefined
          }
          break
          
        case 'milestone':
          baseEvent.milestone = {
            type: milestoneType,
            importance: milestoneImportance
          }
          break
      }

      // Handle file attachments (in a real app, you'd upload to cloud storage)
      if (files.length > 0) {
        baseEvent.attachments = files.map(file => ({
          name: file.name,
          url: URL.createObjectURL(file), // In real app, this would be the uploaded URL
          type: file.type,
          size: file.size
        }))
      }

      await onAdd(baseEvent)
      
      resetForm()
      onClose()
      
      toast({
        title: "Event Added",
        description: `Timeline ${eventType.replace('_', ' ')} has been added to the project`,
      })
    } catch (error) {
      console.error('Failed to add timeline event:', error)
      toast({
        title: "Add Failed",
        description: "Failed to add timeline event",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeSpecificFields = () => {
    switch (eventType) {
      case 'status_change':
        return (
          <div className="space-y-4">
            <div>
              <Label>Change Status To</Label>
              <Select value={newProjectStatus} onValueChange={(value) => setNewProjectStatus(value as ProjectStatus)}>
                <SelectTrigger className={cn(isMobile && "h-12")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProjectStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          PROJECT_STATUS_COLORS[status] === 'blue' && "bg-blue-500",
                          PROJECT_STATUS_COLORS[status] === 'green' && "bg-green-500",
                          PROJECT_STATUS_COLORS[status] === 'yellow' && "bg-yellow-500",
                          PROJECT_STATUS_COLORS[status] === 'gray' && "bg-gray-500",
                          PROJECT_STATUS_COLORS[status] === 'red' && "bg-red-500"
                        )} />
                        {PROJECT_STATUS_LABELS[status]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newProjectStatus !== project.status && (
                <p className="text-xs text-amber-600 mt-1">
                  This will update the project status from {PROJECT_STATUS_LABELS[project.status]} to {PROJECT_STATUS_LABELS[newProjectStatus]}
                </p>
              )}
            </div>
          </div>
        )

      case 'material_delivery':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Supplier</Label>
                <Input
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Supplier name"
                  className={cn(isMobile && "text-base h-12")}
                />
              </div>
              <div>
                <Label>{t('quantity')}</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={t('quantity')}
                  className={cn(isMobile && "text-base h-12")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cost ({project.currency})</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0.00"
                  className={cn(isMobile && "text-base h-12")}
                />
              </div>
              <div>
                <Label>Tracking Number</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Tracking #"
                  className={cn(isMobile && "text-base h-12")}
                />
              </div>
            </div>
            <div>
              <Label>Delivery Documents</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="delivery-files"
                />
                <label htmlFor="delivery-files" className="cursor-pointer">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload delivery receipts, invoices, or photos
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )

      case 'milestone':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Milestone Type</Label>
                <Select value={milestoneType} onValueChange={(value) => setMilestoneType(value as any)}>
                  <SelectTrigger className={cn(isMobile && "h-12")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">Project Start</SelectItem>
                    <SelectItem value="checkpoint">Checkpoint</SelectItem>
                    <SelectItem value="completion">Completion</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Importance</Label>
                <Select value={milestoneImportance} onValueChange={(value) => setMilestoneImportance(value as any)}>
                  <SelectTrigger className={cn(isMobile && "h-12")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 'photo':
        return (
          <div className="space-y-4">
            <div>
              <Label>Photos & Documents</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="photo-files"
                />
                <label htmlFor="photo-files" className="cursor-pointer">
                  <div className="text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload progress photos or documentation
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        isMobile ? "max-w-[95vw] max-h-[90vh] w-full overflow-y-auto" : "max-w-2xl max-h-[90vh] overflow-y-auto"
      )}>
        <DialogHeader>
          <DialogTitle>Add Timeline Event</DialogTitle>
          <DialogDescription>
            Choose an event type and add it to the project timeline.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Type Selection with Icons */}
          <div>
            <Label className="text-base font-medium">Event Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {eventTypeOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setEventType(option.value as TimelineEvent['type'])}
                  className={cn(
                    "relative p-4 border-2 rounded-lg cursor-pointer transition-all",
                    eventType === option.value 
                      ? "border-primary bg-primary/5" 
                      : "border-muted-foreground/20 hover:border-muted-foreground/40"
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={cn(
                      "p-3 rounded-full text-white transition-colors",
                      eventType === option.value ? option.color : "bg-muted"
                    )}>
                      <option.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={cn(
                        "font-medium text-sm",
                        eventType === option.value && "text-primary"
                      )}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  {eventType === option.value && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                className={cn(isMobile && "text-base h-12")}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter event description"
                rows={3}
                className={cn("resize-none", isMobile && "text-base")}
              />
            </div>

            <div>
              <Label>Author</Label>
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Who performed this action?"
                className={cn(isMobile && "text-base h-12")}
              />
            </div>
          </div>

          {/* Type-Specific Fields */}
          {getTypeSpecificFields()}

          {/* Task Linking */}
          {availableTasks.length > 0 && (
            <div>
              <Label>Link to Tasks (Optional)</Label>
              <div className="space-y-2 mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-2 p-1 hover:bg-muted/50 rounded">
                    <input
                      type="checkbox"
                      id={`task-${task.id}`}
                      checked={selectedTasks.includes(task.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTasks([...selectedTasks, task.id])
                        } else {
                          setSelectedTasks(selectedTasks.filter(id => id !== task.id))
                        }
                      }}
                      className="rounded border-gray-300 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={`task-${task.id}`}
                        className="text-sm font-normal cursor-pointer block"
                      >
                        {task.name}
                      </Label>
                      <div className="flex gap-1 mt-1">
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded text-white",
                          task.status === 'completed' && "bg-green-500",
                          task.status === 'in_progress' && "bg-blue-500", 
                          task.status === 'not_started' && "bg-gray-500"
                        )}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Display */}
          {files.length > 0 && (
            <div>
              <Label>Attached Files</Label>
              <div className="space-y-2 mt-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="h-4 w-4" />
                      ) : (
                        <FileIcon className="h-4 w-4" />
                      )}
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className={cn(
          isMobile ? "flex-col gap-2 pt-4" : "flex-row gap-2 pt-4"
        )}>
          <Button 
            variant="outline" 
            onClick={onClose}
            className={cn(isMobile && "w-full")}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAdd}
            disabled={!title.trim() || isLoading}
            className={cn(isMobile && "w-full")}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Enhanced Timeline Event Component with Unique Designs
function TimelineEventItem({ 
  event, 
  isLast = false,
  isMobile = false,
  projectTasks = []
}: { 
  event: TimelineEvent
  isLast?: boolean
  isMobile?: boolean
  projectTasks?: ProjectTask[]
}) {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone':
        return <Flag className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
      case 'status_change':
        return <RefreshCcw className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
      case 'material_delivery':
        return <Truck className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
      case 'note':
        return <FileText className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
      case 'photo':
        return <Camera className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
      default:
        return <Circle className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
    }
  }

  const getEventColor = (event: TimelineEvent) => {
    // Custom color takes precedence
    if (event.color) {
      return event.color
    }
    
    // Type-based coloring
    switch (event.type) {
      case 'milestone': return 'bg-purple-500'
      case 'status_change': return 'bg-blue-500'
      case 'material_delivery': return 'bg-green-500'
      case 'note': return 'bg-gray-500'
      case 'photo': return 'bg-orange-500'
      default: return 'bg-gray-400'
    }
  }

  const getEventCardDesign = () => {
    const baseClasses = cn(
      "bg-card border rounded-lg",
      isMobile ? "p-3" : "p-4"
    )

    switch (event.type) {
      case 'milestone':
        return cn(baseClasses, "border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20")
      case 'status_change':
        return cn(baseClasses, "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20")
      case 'material_delivery':
        return cn(baseClasses, "border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20")
      case 'photo':
        return cn(baseClasses, "border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20")
      default:
        return cn(baseClasses, "border-l-4 border-l-gray-500")
    }
  }

  const renderEventSpecificContent = () => {
    switch (event.type) {
      case 'status_change':
        if (event.statusChange) {
          return (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                    {PROJECT_STATUS_LABELS[event.statusChange.fromStatus]}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                    {PROJECT_STATUS_LABELS[event.statusChange.toStatus]}
                  </Badge>
                </div>
              </div>
            </div>
          )
        }
        break

      case 'material_delivery':
        if (event.materialInfo) {
          return (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {event.materialInfo.supplier && (
                  <div>
                    <span className="text-muted-foreground">Supplier:</span>
                    <p className="font-medium">{event.materialInfo.supplier}</p>
                  </div>
                )}
                {event.materialInfo.quantity && (
                  <div>
                                    <span className="text-muted-foreground">{t('quantity')}:</span>
                <p className="font-medium">{event.materialInfo.quantity}</p>
                  </div>
                )}
                {event.materialInfo.cost && (
                  <div>
                    <span className="text-muted-foreground">Cost:</span>
                    <p className="font-medium">${event.materialInfo.cost.toFixed(2)}</p>
                  </div>
                )}
                {event.materialInfo.trackingNumber && (
                  <div>
                    <span className="text-muted-foreground">Tracking:</span>
                    <p className="font-medium font-mono text-xs">{event.materialInfo.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )
        }
        break

      case 'milestone':
        if (event.milestone) {
          return (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "capitalize",
                    event.milestone.importance === 'critical' && "bg-red-100 text-red-700 border-red-200",
                    event.milestone.importance === 'high' && "bg-orange-100 text-orange-700 border-orange-200",
                    event.milestone.importance === 'medium' && "bg-blue-100 text-blue-700 border-blue-200",
                    event.milestone.importance === 'low' && "bg-gray-100 text-gray-700 border-gray-200"
                  )}
                >
                  {event.milestone.importance} Priority
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {event.milestone.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          )
        }
        break
    }
    return null
  }

  return (
    <div className={cn(
      "flex gap-3",
      isMobile && "gap-2"
    )}>
      {/* Timeline Line */}
      <div className="flex flex-col items-center shrink-0">
        <div className={cn(
          "rounded-full flex items-center justify-center text-white",
          isMobile ? "w-6 h-6" : "w-8 h-8",
          getEventColor(event)
        )}>
          {getEventIcon(event.type)}
        </div>
        {!isLast && (
          <div className={cn(
            "bg-border mt-2",
            isMobile ? "w-px h-6" : "w-0.5 h-8"
          )} />
        )}
      </div>

      {/* Event Content */}
      <div className={cn(
        "flex-1 min-w-0",
        isMobile ? "pb-4" : "pb-8"
      )}>
        <div className={getEventCardDesign()}>
          <div className={cn(
            "flex justify-between mb-2",
            isMobile ? "flex-col gap-2" : "items-start"
          )}>
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold leading-tight",
                isMobile ? "text-sm break-words" : "text-base"
              )}>
                {event.title}
              </h3>
              <div className={cn(
                "flex items-center gap-2 text-muted-foreground mt-1",
                isMobile ? "text-xs flex-wrap" : "text-xs"
              )}>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>
                    {isMobile 
                      ? new Date(event.timestamp).toLocaleDateString()
                      : new Date(event.timestamp).toLocaleString()
                    }
                  </span>
                </div>
                {event.author && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{event.author}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs shrink-0 capitalize",
                isMobile && "self-start"
              )}
            >
              {event.type.replace('_', ' ')}
            </Badge>
          </div>
          
          {event.description && (
            <p className={cn(
              "text-muted-foreground mt-2 leading-relaxed",
              isMobile ? "text-xs break-words" : "text-sm"
            )}>
              {event.description}
            </p>
          )}

          {/* Event-specific content */}
          {renderEventSpecificContent()}

          {/* Show linked tasks */}
          {event.linkedTaskIds && event.linkedTaskIds.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <PaperclipIcon className="h-3 w-3" />
                Linked Tasks:
              </p>
              <div className={cn(
                "flex gap-1",
                isMobile ? "flex-col" : "flex-wrap"
              )}>
                {event.linkedTaskIds.map((taskId) => {
                  const task = projectTasks.find(t => t.id === taskId)
                  return task ? (
                    <div key={taskId} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "text-xs",
                          task.status === 'completed' && "bg-green-100 text-green-700",
                          task.status === 'in_progress' && "bg-blue-100 text-blue-700",
                          task.status === 'not_started' && "bg-gray-100 text-gray-700"
                        )}
                      >
                        {task.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
          
          {/* Attachments */}
          {event.attachments && event.attachments.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <PaperclipIcon className="h-3 w-3" />
                Attachments:
              </p>
              <div className={cn(
                "flex gap-2",
                isMobile ? "flex-col" : "flex-wrap"
              )}>
                {event.attachments.map((attachment, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                      "text-xs",
                      isMobile ? "h-10 w-full justify-start" : "h-8"
                    )}
                    onClick={() => window.open(attachment.url, '_blank')}
                  >
                    {attachment.type.startsWith('image/') ? (
                      <ImageIcon className="h-3 w-3 mr-1" />
                    ) : (
                      <FileIcon className="h-3 w-3 mr-1" />
                    )}
                    {attachment.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}  // Main Project Timeline Component
export default function ProjectTimeline({
  project,
  onUpdate,
  className,
  availableTasks = []
}: ProjectTimelineProps) {
  const { updateProject } = useProjects()
  const { t, language } = useI18n()
  const isMobile = useMediaQuery("(max-width: 767px)")
  
  // Local state
  const [customEvents, setCustomEvents] = useState<TimelineEvent[]>([])
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Use passed tasks or default to empty array
  const projectTasks = useMemo(() => 
    availableTasks.filter(task => task.projectId === project.id), 
    [availableTasks, project.id]
  )

  // Load stored timeline events when component mounts
  useEffect(() => {
    const loadStoredEvents = async () => {
      try {
        const { getTimelineEvents } = await import('@/lib/timeline-storage')
        const storedEvents = getTimelineEvents(project.id)
        
        // Convert stored events to timeline events
        const timelineEvents: TimelineEvent[] = storedEvents.map(stored => ({
          id: stored.id,
          type: stored.type as TimelineEvent['type'],
          title: stored.title,
          description: stored.description,
          timestamp: stored.timestamp,
          author: stored.author,
          linkedTaskIds: stored.linkedTaskIds,
          materialInfo: stored.materialInfo,
          statusChange: stored.statusChange ? {
            fromStatus: stored.statusChange.fromStatus as ProjectStatus,
            toStatus: stored.statusChange.toStatus as ProjectStatus
          } : undefined,
          milestone: stored.milestone,
          attachments: stored.attachments
        }))
        
        setCustomEvents(timelineEvents)
        console.log('Loaded stored events:', timelineEvents.length)
      } catch (error) {
        console.error('Failed to load stored events:', error)
      }
    }

    loadStoredEvents()
  }, [project.id])



  // Generate timeline events from project data - memoized to prevent constant regeneration
  const systemTimelineEvents = useMemo(() => {
    const generateTimelineEvents = () => {
      const events: TimelineEvent[] = []

      // Project creation event
      events.push({
        id: `project-created-${project.id}`,
        type: 'milestone',
        title: language === 'bs' ? 'Projekat Kreiran' : 'Project Created',
        description: language === 'bs' ? `Projekat "${project.name}" je kreiran` : `Project "${project.name}" was created`,
        timestamp: new Date(project.createdAt).toISOString(),
        author: language === 'bs' ? 'Sistem' : 'System'
      })

      // Status changes (mock data - in real implementation, this would come from status history)
      if (project.status !== ProjectStatus.PLANNING) {
        events.push({
          id: `status-change-${project.id}`,
          type: 'status_change',
          title: language === 'bs' ? `Status Promijenjen na ${PROJECT_STATUS_LABELS[project.status]}` : `Status Changed to ${PROJECT_STATUS_LABELS[project.status]}`,
          description: language === 'bs' ? `Status projekta ažuriran na ${PROJECT_STATUS_LABELS[project.status]}` : `Project status updated to ${PROJECT_STATUS_LABELS[project.status]}`,
          timestamp: new Date(project.updatedAt).toISOString(),
          author: language === 'bs' ? 'Sistem' : 'System'
        })
      }

      // Material delivery events
      if (project.materials) {
        project.materials.forEach((material) => {
          if (material.status === MaterialStatus.ARRIVED || material.status === MaterialStatus.INSTALLED) {
            events.push({
              id: `material-delivery-${material.id}`,
              type: 'material_delivery',
              title: language === 'bs' ? `Materijal Isporučen` : `Material Delivered`,
              description: language === 'bs' ? `${material.quantity} jedinica isporučeno` : `${material.quantity} units delivered`,
              timestamp: material.arrivalDate ? new Date(material.arrivalDate).toISOString() : new Date().toISOString(),
              author: material.supplier || (language === 'bs' ? 'Dobavljač' : 'Supplier')
            })
          }
        })
      }

      // Task completion events
      projectTasks.forEach((task) => {
        if (task.status === 'completed' && task.actualEnd) {
          events.push({
            id: `task-completed-${task.id}`,
            type: 'milestone',
            title: language === 'bs' ? `Zadatak Završen: ${task.name}` : `Task Completed: ${task.name}`,
            description: language === 'bs' ? `Zadatak "${task.name}" je označen kao završen` : `Task "${task.name}" was marked as completed`,
            timestamp: new Date(task.actualEnd).toISOString(),
            author: task.assignedTo || (language === 'bs' ? 'Član Tima' : 'Team Member'),
            linkedTaskIds: [task.id],
            status: 'completed'
          })
        }
        
        if (task.status === 'in_progress' && task.actualStart) {
          events.push({
            id: `task-started-${task.id}`,
            type: 'status_change',
            title: language === 'bs' ? `Zadatak Počet: ${task.name}` : `Task Started: ${task.name}`,
            description: language === 'bs' ? `Rad je počet na zadatku "${task.name}"` : `Work began on task "${task.name}"`,
            timestamp: new Date(task.actualStart).toISOString(),
            author: task.assignedTo || (language === 'bs' ? 'Član Tima' : 'Team Member'),
            linkedTaskIds: [task.id],
            status: 'in_progress'
          })
        }
      })

      // Deadline milestone
      if (project.deadline) {
        const isOverdue = new Date(project.deadline) < new Date()
        events.push({
          id: `deadline-${project.id}`,
          type: 'milestone',
          title: isOverdue ? 
            (language === 'bs' ? 'Rok Prošao' : 'Deadline Passed') : 
            (language === 'bs' ? 'Projektni Rok' : 'Project Deadline'),
          description: language === 'bs' ? 
            `Rok projekta: ${new Date(project.deadline).toLocaleDateString()}` : 
            `Project deadline: ${new Date(project.deadline).toLocaleDateString()}`,
          timestamp: new Date(project.deadline).toISOString(),
          author: language === 'bs' ? 'Sistem' : 'System'
        })
      }

      // Sort events by timestamp
      return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }

    return generateTimelineEvents()
  }, [project, projectTasks])

  // Combine system events with custom events
  const timelineEvents = useMemo(() => {
    const allEvents = [...systemTimelineEvents, ...customEvents]
    return allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [systemTimelineEvents, customEvents])

  // Handle add event
  const handleAddEvent = async (eventData: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    setIsLoading(true)
    try {
      // Import storage function dynamically to avoid SSR issues
      const { saveTimelineEvent } = await import('@/lib/timeline-storage')
      
      // Convert to storage format and save
      const savedEvent = saveTimelineEvent(project.id, {
        type: eventData.type,
        title: eventData.title,
        description: eventData.description,
        author: eventData.author,
        linkedTaskIds: eventData.linkedTaskIds,
        materialInfo: eventData.materialInfo,
        statusChange: eventData.statusChange ? {
          fromStatus: eventData.statusChange.fromStatus.toString(),
          toStatus: eventData.statusChange.toStatus.toString()
        } : undefined,
        milestone: eventData.milestone,
        attachments: eventData.attachments
      })

      // Manually reload events to ensure immediate UI update
      const { getTimelineEvents } = await import('@/lib/timeline-storage')
      const storedEvents = getTimelineEvents(project.id)
      
      const timelineEvents: TimelineEvent[] = storedEvents.map(stored => ({
        id: stored.id,
        type: stored.type as TimelineEvent['type'],
        title: stored.title,
        description: stored.description,
        timestamp: stored.timestamp,
        author: stored.author,
        linkedTaskIds: stored.linkedTaskIds,
        materialInfo: stored.materialInfo,
        statusChange: stored.statusChange ? {
          fromStatus: stored.statusChange.fromStatus as ProjectStatus,
          toStatus: stored.statusChange.toStatus as ProjectStatus
        } : undefined,
        milestone: stored.milestone,
        attachments: stored.attachments
      }))
      
      setCustomEvents(timelineEvents)
      console.log('Event saved and reloaded:', savedEvent.title, 'Total events:', timelineEvents.length)
      
      onUpdate?.()
      
      toast({
        title: language === 'bs' ? 'Događaj Dodan' : 'Event Added',
        description: language === 'bs' ? 
          `Vremenski događaj "${eventData.title}" je uspješno dodan.` :
          `Timeline event "${eventData.title}" has been added successfully.`,
      })
    } catch (error) {
      console.error('Failed to add timeline event:', error)
      toast({
        title: language === 'bs' ? 'Greška' : 'Error',
        description: language === 'bs' ? 
          'Neuspješno dodavanje vremenskog događaja. Molimo pokušajte ponovo.' :
          'Failed to add timeline event. Please try again.',
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate timeline statistics
  const timelineStats = useMemo(() => {
    const totalEvents = timelineEvents.length
    const milestones = timelineEvents.filter(e => e.type === 'milestone').length
    const deliveries = timelineEvents.filter(e => e.type === 'material_delivery').length
    const recentEvents = timelineEvents.filter(e => 
      new Date(e.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length

    return {
      totalEvents,
      milestones,
      deliveries,
      recentEvents
    }
  }, [timelineEvents])

  // Upcoming deadlines and deliveries
  const upcomingItems = useMemo(() => {
    const upcoming = []
    
    // Project deadline
    if (project.deadline && new Date(project.deadline) > new Date()) {
      const daysUntil = Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      upcoming.push({
        type: 'deadline',
        title: language === 'bs' ? 'Projektni Rok' : 'Project Deadline',
        date: project.deadline,
        daysUntil,
        urgent: daysUntil <= 7
      })
    }

    // Material deliveries (simplified - using orderDate as estimate)
    if (project.materials) {
      project.materials.forEach(material => {
        if (material.orderDate && 
            (material.status === MaterialStatus.ORDERED ||
            material.status === MaterialStatus.SHIPPED)) {
          // Estimate delivery date as 7 days from order date
          const estimatedDelivery = new Date(material.orderDate)
          estimatedDelivery.setDate(estimatedDelivery.getDate() + 7)
          
          if (estimatedDelivery > new Date()) {
            const daysUntil = Math.ceil((estimatedDelivery.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            upcoming.push({
              type: 'delivery',
              title: language === 'bs' ? `Dostava Materijala` : `Material Delivery`,
              date: estimatedDelivery.toISOString(),
              daysUntil,
              urgent: daysUntil <= 3
            })
          }
        }
      })
    }

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil)
  }, [project])

  return (
    <div className={cn("space-y-4 md:space-y-6", className)}>
      {/* Header and Statistics - Mobile Optimized */}
      <div className="space-y-4">
        <div className={cn(
          "flex gap-4",
          isMobile ? "flex-col" : "items-center justify-between"
        )}>
          <h2 className={cn(
            "font-bold",
            isMobile ? "text-xl" : "text-2xl"
          )}>
{language === 'bs' ? 'Projektna Vremenska Linija' : 'Project Timeline'}
          </h2>
          <Button 
            onClick={() => setShowAddEventModal(true)}
            className={cn(
              isMobile ? "w-full h-12" : ""
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
{language === 'bs' ? 'Dodaj Događaj' : 'Add Event'}
          </Button>
        </div>

        {/* Statistics Cards - Mobile Optimized Grid */}
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"
        )}>
          <Card>
            <CardContent className={cn(
              isMobile ? "p-3" : "p-4"
            )}>
              <div className={cn(
                "flex items-center gap-2",
                isMobile && "gap-2"
              )}>
                <div className={cn(
                  "p-2 bg-blue-100 rounded-lg shrink-0",
                  isMobile && "p-1.5"
                )}>
                  <BarChart3 className={cn(
                    "text-blue-600",
                    isMobile ? "h-4 w-4" : "h-5 w-5"
                  )} />
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    "text-muted-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
{language === 'bs' ? 'Ukupni Događaji' : 'Total Events'}
                  </p>
                  <p className={cn(
                    "font-bold",
                    isMobile ? "text-lg" : "text-2xl"
                  )}>
                    {timelineStats.totalEvents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className={cn(
              isMobile ? "p-3" : "p-4"
            )}>
              <div className={cn(
                "flex items-center gap-2",
                isMobile && "gap-2"
              )}>
                <div className={cn(
                  "p-2 bg-purple-100 rounded-lg shrink-0",
                  isMobile && "p-1.5"
                )}>
                  <Flag className={cn(
                    "text-purple-600",
                    isMobile ? "h-4 w-4" : "h-5 w-5"
                  )} />
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    "text-muted-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
{language === 'bs' ? 'Prekretnice' : 'Milestones'}
                  </p>
                  <p className={cn(
                    "font-bold",
                    isMobile ? "text-lg" : "text-2xl"
                  )}>
                    {timelineStats.milestones}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className={cn(
              isMobile ? "p-3" : "p-4"
            )}>
              <div className={cn(
                "flex items-center gap-2",
                isMobile && "gap-2"
              )}>
                <div className={cn(
                  "p-2 bg-green-100 rounded-lg shrink-0",
                  isMobile && "p-1.5"
                )}>
                  <Truck className={cn(
                    "text-green-600",
                    isMobile ? "h-4 w-4" : "h-5 w-5"
                  )} />
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    "text-muted-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
{language === 'bs' ? 'Dostave' : 'Deliveries'}
                  </p>
                  <p className={cn(
                    "font-bold",
                    isMobile ? "text-lg" : "text-2xl"
                  )}>
                    {timelineStats.deliveries}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className={cn(
              isMobile ? "p-3" : "p-4"
            )}>
              <div className={cn(
                "flex items-center gap-2",
                isMobile && "gap-2"
              )}>
                <div className={cn(
                  "p-2 bg-orange-100 rounded-lg shrink-0",
                  isMobile && "p-1.5"
                )}>
                  <TrendingUp className={cn(
                    "text-orange-600",
                    isMobile ? "h-4 w-4" : "h-5 w-5"
                  )} />
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    "text-muted-foreground",
                    isMobile ? "text-xs" : "text-sm"
                  )}>
{language === 'bs' ? 'Nedavni (7d)' : 'Recent (7d)'}
                  </p>
                  <p className={cn(
                    "font-bold",
                    isMobile ? "text-lg" : "text-2xl"
                  )}>
                    {timelineStats.recentEvents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Items - Mobile Optimized */}
      {upcomingItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={cn(
              "flex items-center gap-2",
              isMobile ? "text-lg" : "text-xl"
            )}>
              <Clock className="h-5 w-5" />
{language === 'bs' ? 'Nadolazeći Rokovi i Dostave' : 'Upcoming Deadlines & Deliveries'}
            </CardTitle>
          </CardHeader>
          <CardContent className={cn(
            isMobile ? "p-3" : "p-6"
          )}>
            <div className={cn(
              "space-y-3",
              isMobile && "space-y-2"
            )}>
              {upcomingItems.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between rounded-lg border",
                    isMobile ? "p-2" : "p-3",
                    item.urgent ? "border-destructive/20 bg-destructive/5" : "border-border"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2",
                    isMobile && "gap-2 min-w-0 flex-1"
                  )}>
                    {item.type === 'deadline' ? (
                      <Flag className={cn(
                        "shrink-0",
                        isMobile ? "h-3 w-3" : "h-4 w-4",
                        item.urgent ? "text-destructive" : "text-muted-foreground"
                      )} />
                    ) : (
                      <Truck className={cn(
                        "shrink-0",
                        isMobile ? "h-3 w-3" : "h-4 w-4",
                        item.urgent ? "text-destructive" : "text-muted-foreground"
                      )} />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "font-medium",
                        isMobile ? "text-xs truncate" : "text-sm"
                      )}>
                        {item.title}
                      </p>
                      <p className={cn(
                        "text-muted-foreground",
                        isMobile ? "text-xs" : "text-xs"
                      )}>
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Badge 
                    variant={item.urgent ? "destructive" : "secondary"} 
                    className={cn(
                      "shrink-0",
                      isMobile ? "text-xs ml-2" : "text-xs"
                    )}
                  >
{item.daysUntil === 0 ? (language === 'bs' ? 'Danas' : 'Today') : 
                     item.daysUntil === 1 ? (language === 'bs' ? 'Sutra' : 'Tomorrow') : 
                     `${item.daysUntil}d`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "flex items-center gap-2",
            isMobile ? "text-lg" : "text-xl"
          )}>
            <Calendar className="h-5 w-5" />
{language === 'bs' ? 'Vremenski Događaji' : 'Timeline Events'}
          </CardTitle>
        </CardHeader>
        <CardContent className={cn(
          isMobile ? "p-3" : "p-6"
        )}>
          {timelineEvents.length === 0 ? (
            <div className={cn(
              "text-center",
              isMobile ? "py-8" : "py-12"
            )}>
              <Calendar className={cn(
                "mx-auto mb-4 opacity-30",
                isMobile ? "h-10 w-10" : "h-12 w-12"
              )} />
              <h3 className={cn(
                "font-semibold mb-2",
                isMobile ? "text-base" : "text-lg"
              )}>
{language === 'bs' ? 'Nema Vremenskih Događaja' : 'No Timeline Events'}
              </h3>
              <p className={cn(
                "text-muted-foreground mb-4",
                isMobile ? "text-sm" : "text-base"
              )}>
{language === 'bs' ? 'Počnite dodavati događaje da pratite napredak projekta i prekretnice.' : 'Start adding events to track project progress and milestones.'}
              </p>
              <Button 
                onClick={() => setShowAddEventModal(true)}
                className={cn(
                  isMobile ? "w-full h-12" : ""
                )}
              >
                <Plus className="h-4 w-4 mr-2" />
{language === 'bs' ? 'Dodaj Prvi Događaj' : 'Add First Event'}
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {timelineEvents.map((event, index) => (
                <TimelineEventItem
                  key={event.id}
                  event={event}
                  isLast={index === timelineEvents.length - 1}
                  isMobile={isMobile}
                  projectTasks={projectTasks}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Event Modal */}
      <AddEventModal
        project={project}
        isOpen={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onAdd={handleAddEvent}
        availableTasks={availableTasks}
      />
    </div>
  )
}