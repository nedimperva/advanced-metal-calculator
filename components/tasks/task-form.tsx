"use client"

import React, { useState, useEffect } from 'react'
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { format } from 'date-fns'
import { type ProjectTask, type Worker, TaskStatus, TaskType, TaskPriority } from '@/lib/types'

// Timeline Event interface for linking (copied from project-timeline.tsx)
interface TimelineEvent {
  id: string
  type: 'milestone' | 'status_change' | 'material_delivery' | 'note' | 'photo'
  title: string
  description?: string
  timestamp: string
  author?: string
  data?: any
  attachments?: string[]
  linkedTaskIds?: string[]
  color?: string
  status?: 'completed' | 'in_progress' | 'pending' | 'cancelled'
}
import { 
  TASK_STATUS_LABELS, 
  TASK_TYPE_LABELS, 
  TASK_PRIORITY_LABELS,
  validateDependencies
} from '@/lib/task-utils'

interface TaskFormProps {
  task?: ProjectTask | null
  projectId: string
  isOpen: boolean
  onClose: () => void
  onSave: (task: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'> | ProjectTask) => Promise<void>
  availableTasks?: ProjectTask[]
  availableWorkers?: Worker[]
  availableTimelineEvents?: TimelineEvent[]
  className?: string
}

interface TaskFormData {
  name: string
  description: string
  type: TaskType
  priority: TaskPriority
  status: TaskStatus
  estimatedHours: number
  actualHours?: number
  assignedTo?: string

  scheduledStart?: Date
  scheduledEnd?: Date
  dependencies: string[]
  notes?: string
  progress: number
}

const initialFormData: TaskFormData = {
  name: '',
  description: '',
  type: TaskType.OTHER,
  priority: TaskPriority.MEDIUM,
  status: TaskStatus.NOT_STARTED,
  estimatedHours: 1,
  dependencies: [],
  progress: 0
}

export default function TaskForm({
  task,
  projectId,
  isOpen,
  onClose,
  onSave,
  availableTasks = [],
  availableWorkers = [],
  availableTimelineEvents = [],
  className
}: TaskFormProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [formData, setFormData] = useState<TaskFormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCalendar, setShowCalendar] = useState<string | null>(null)
  const [selectedTimelineEvents, setSelectedTimelineEvents] = useState<string[]>([])

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        type: task.type,
        priority: task.priority,
        status: task.status,
        estimatedHours: 8, // Default estimation if not available
        assignedTo: task.assignedTo,

        scheduledStart: task.scheduledStart ? new Date(task.scheduledStart) : undefined,
        scheduledEnd: task.scheduledEnd ? new Date(task.scheduledEnd) : undefined,
        dependencies: task.dependencies || [],
        notes: task.notes,
        progress: task.progress || 0
      })
    } else {
      setFormData(initialFormData)
    }
    setErrors({})
    setSelectedTimelineEvents([])
  }, [task, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required'
    }

    if (formData.estimatedHours <= 0) {
      newErrors.estimatedHours = 'Estimated hours must be greater than 0'
    }

    if (formData.scheduledStart && formData.scheduledEnd) {
      if (formData.scheduledStart >= formData.scheduledEnd) {
        newErrors.scheduledEnd = 'End date must be after start date'
      }
    }

    // Validate dependencies
    if (formData.dependencies.length > 0) {
      const validation = validateDependencies(task?.id || 'new', formData.dependencies, availableTasks)
      if (!validation.isValid) {
        newErrors.dependencies = validation.errors.join(', ')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const taskData = {
        ...formData,
        projectId,
        scheduledStart: formData.scheduledStart,
        scheduledEnd: formData.scheduledEnd,
        dependencies: formData.dependencies,
        blockedBy: [],
        selectedTimelineEvents
      }

      if (task) {
        await onSave({
          ...task,
          ...taskData,
          updatedAt: new Date()
        })
      } else {
        await onSave(taskData)
      }

      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to save task' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (date: Date | undefined, field: string) => {
    setFormData(prev => ({ ...prev, [field]: date }))
    setShowCalendar(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        isMobile 
          ? "max-w-[95vw] max-h-[95vh] w-full overflow-y-auto" 
          : "max-w-2xl max-h-[90vh] overflow-y-auto",
        className
      )}>
        <DialogHeader>
          <DialogTitle>
            {task ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {task ? 'Update task details and settings.' : 'Create a new task for your project.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{errors.general}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Task Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter task name"
                className={cn(
                  isMobile && "text-base",
                  errors.name && "border-destructive"
                )}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the task..."
                className={cn(
                  "min-h-[100px] resize-none",
                  isMobile && "text-base"
                )}
              />
            </div>
          </div>

          {/* Task Properties */}
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-3"
          )}>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TaskType }))}
              >
                <SelectTrigger className={cn(isMobile && "h-12")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {TASK_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TaskPriority }))}
              >
                <SelectTrigger className={cn(isMobile && "h-12")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskPriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {TASK_PRIORITY_LABELS[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as TaskStatus }))}
              >
                <SelectTrigger className={cn(isMobile && "h-12")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {TASK_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time and Assignment */}
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-2"
          )}>
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours *</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 1 }))}
                className={cn(
                  isMobile && "text-base",
                  errors.estimatedHours && "border-destructive"
                )}
              />
              {errors.estimatedHours && (
                <p className="text-sm text-destructive mt-1">{errors.estimatedHours}</p>
              )}
            </div>

            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              {availableWorkers.length > 0 ? (
                <Select
                  value={formData.assignedTo || "__no_assignment__"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value === "__no_assignment__" ? undefined : value }))}
                >
                  <SelectTrigger className={cn(isMobile && "h-12")}>
                    <SelectValue placeholder="Select a worker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__no_assignment__">No assignment</SelectItem>
                    {availableWorkers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.name}>
                        {worker.name} {worker.employeeId && `(${worker.employeeId})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="assignedTo"
                  value={formData.assignedTo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Worker name"
                  className={cn(isMobile && "text-base")}
                />
              )}
            </div>


          </div>

          {/* Schedule Dates */}
          <div>
            <h4 className="font-medium mb-3">Schedule</h4>
            <div className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-1" : "grid-cols-2"
            )}>
              {/* Scheduled Start */}
              <div>
                <Label>Scheduled Start</Label>
                <Popover open={showCalendar === 'scheduledStart'} onOpenChange={(open) => setShowCalendar(open ? 'scheduledStart' : null)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduledStart && "text-muted-foreground",
                        isMobile && "h-12"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledStart ? format(formData.scheduledStart, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledStart}
                      onSelect={(date) => handleDateSelect(date, 'scheduledStart')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Scheduled End */}
              <div>
                <Label>Scheduled End</Label>
                <Popover open={showCalendar === 'scheduledEnd'} onOpenChange={(open) => setShowCalendar(open ? 'scheduledEnd' : null)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduledEnd && "text-muted-foreground",
                        isMobile && "h-12",
                        errors.scheduledEnd && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledEnd ? format(formData.scheduledEnd, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledEnd}
                      onSelect={(date) => handleDateSelect(date, 'scheduledEnd')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.scheduledEnd && (
                  <p className="text-sm text-destructive mt-1">{errors.scheduledEnd}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Event Linking */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Link to Timeline Events</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('🔍 Available timeline events:', availableTimelineEvents)
                  console.log('  Project ID:', projectId)
                  console.log('  Events count:', availableTimelineEvents.length)
                }}
                className="text-xs h-6 px-2"
              >
                Debug Events
              </Button>
            </div>
            {availableTimelineEvents.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  Connect this task to existing timeline events for better project tracking.
                </p>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {availableTimelineEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      setSelectedTimelineEvents(prev => 
                        prev.includes(event.id)
                          ? prev.filter(id => id !== event.id)
                          : [...prev, event.id]
                      )
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTimelineEvents.includes(event.id)}
                      onChange={() => {}}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{event.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {event.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedTimelineEvents.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedTimelineEvents.length} event{selectedTimelineEvents.length !== 1 ? 's' : ''} selected
                </p>
              )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No timeline events available for linking.
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              className={cn(
                "min-h-[80px] resize-none",
                isMobile && "text-base"
              )}
            />
          </div>
        </form>

        <DialogFooter className={cn(
          isMobile ? "flex-col gap-2" : "flex-row gap-2"
        )}>
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose}
            className={cn(isMobile && "w-full")}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(isMobile && "w-full")}
          >
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                {task ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              task ? 'Update Task' : 'Create Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 