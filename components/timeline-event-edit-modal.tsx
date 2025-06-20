"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/loading-states'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { toast } from '@/hooks/use-toast'
import { updateTimelineEvent, type StoredTimelineEvent } from '@/lib/timeline-storage'
import { ProjectStatus, type ProjectTask } from '@/lib/types'
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from '@/lib/project-utils'
import { X, Save, Trash2 } from 'lucide-react'

interface TimelineEventEditModalProps {
  event: StoredTimelineEvent | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedEvent: StoredTimelineEvent) => void
  onDelete: (eventId: string) => void
  availableTasks?: ProjectTask[]
}

export function TimelineEventEditModal({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
  availableTasks = []
}: TimelineEventEditModalProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [isLoading, setIsLoading] = useState(false)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  
  // Type-specific fields
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>(ProjectStatus.PLANNING)
  const [supplier, setSupplier] = useState('')
  const [quantity, setQuantity] = useState('')
  const [cost, setCost] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [milestoneType, setMilestoneType] = useState<'start' | 'checkpoint' | 'completion' | 'deadline'>('checkpoint')
  const [milestoneImportance, setMilestoneImportance] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')

  // Load event data when modal opens
  useEffect(() => {
    if (event && isOpen) {
      setTitle(event.title)
      setDescription(event.description || '')
      setAuthor(event.author || '')
      setSelectedTasks(event.linkedTaskIds || [])
      
      // Load type-specific data
      if (event.statusChange) {
        setNewProjectStatus(event.statusChange.toStatus as ProjectStatus)
      }
      
      if (event.materialInfo) {
        setSupplier(event.materialInfo.supplier || '')
        setQuantity(event.materialInfo.quantity?.toString() || '')
        setCost(event.materialInfo.cost?.toString() || '')
        setTrackingNumber(event.materialInfo.trackingNumber || '')
      }
      
      if (event.milestone) {
        setMilestoneType(event.milestone.type)
        setMilestoneImportance(event.milestone.importance)
      }
    }
  }, [event, isOpen])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setAuthor('')
    setSelectedTasks([])
    setNewProjectStatus(ProjectStatus.PLANNING)
    setSupplier('')
    setQuantity('')
    setCost('')
    setTrackingNumber('')
    setMilestoneType('checkpoint')
    setMilestoneImportance('medium')
  }

  const handleSave = async () => {
    if (!event || !title.trim()) return

    setIsLoading(true)
    try {
      const updates: Partial<StoredTimelineEvent> = {
        title: title.trim(),
        description: description.trim() || undefined,
        author: author.trim() || undefined,
        linkedTaskIds: selectedTasks.length > 0 ? selectedTasks : undefined
      }

      // Add type-specific updates
      switch (event.type) {
        case 'status_change':
          updates.statusChange = {
            fromStatus: event.statusChange?.fromStatus || ProjectStatus.PLANNING,
            toStatus: newProjectStatus.toString()
          }
          break
          
        case 'material_delivery':
          updates.materialInfo = {
            supplier: supplier.trim() || undefined,
            quantity: quantity ? parseFloat(quantity) : undefined,
            cost: cost ? parseFloat(cost) : undefined,
            trackingNumber: trackingNumber.trim() || undefined
          }
          break
          
        case 'milestone':
          updates.milestone = {
            type: milestoneType,
            importance: milestoneImportance
          }
          break
      }

      const updatedEvent = updateTimelineEvent(event.id, updates)
      if (updatedEvent) {
        onSave(updatedEvent)
        resetForm()
        onClose()
        
        toast({
          title: "Event Updated",
          description: "Timeline event has been successfully updated",
        })
      }
    } catch (error) {
      console.error('Failed to update timeline event:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update timeline event",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return
    
    if (confirm('Are you sure you want to delete this timeline event?')) {
      try {
        await onDelete(event.id)
        resetForm()
        onClose()
        
        toast({
          title: "Event Deleted",
          description: "Timeline event has been successfully deleted",
        })
      } catch (error) {
        console.error('Failed to delete timeline event:', error)
        toast({
          title: "Delete Failed",
          description: "Failed to delete timeline event",
          variant: "destructive"
        })
      }
    }
  }

  const getTypeSpecificFields = () => {
    if (!event) return null

    switch (event.type) {
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
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Quantity"
                  className={cn(isMobile && "text-base h-12")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cost</Label>
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

      default:
        return null
    }
  }

  if (!event) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        isMobile 
          ? "max-w-[95vw] max-h-[90vh] w-full overflow-y-auto" 
          : "max-w-2xl max-h-[90vh] overflow-y-auto"
      )}>
        <DialogHeader>
          <DialogTitle>Edit Timeline Event</DialogTitle>
          <DialogDescription>
            Update the timeline event details below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Event Type Display */}
          <div>
            <Label>Event Type</Label>
            <Badge variant="outline" className="capitalize">
              {event.type.replace('_', ' ')}
            </Badge>
          </div>

          {/* Common Fields */}
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

          {/* Type-Specific Fields */}
          {getTypeSpecificFields()}

          {/* Task Linking */}
          {availableTasks.length > 0 && (
            <div>
              <Label>Link to Tasks</Label>
              <div className="space-y-2 mt-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {availableTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-2 p-1 hover:bg-muted/50 rounded">
                    <input
                      type="checkbox"
                      id={`edit-task-${task.id}`}
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
                        htmlFor={`edit-task-${task.id}`}
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
        </div>
        
        <DialogFooter className={cn(
          "flex gap-2 pt-4",
          isMobile ? "flex-col-reverse" : "flex-row"
        )}>
          <Button 
            variant="outline" 
            onClick={onClose}
            className={cn(isMobile && "w-full")}
          >
            Cancel
          </Button>
          
          {event.id.startsWith('custom-') && (
            <Button 
              variant="destructive"
              onClick={handleDelete}
              className={cn(isMobile && "w-full")}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          
          <Button 
            onClick={handleSave}
            disabled={!title.trim() || isLoading}
            className={cn(isMobile && "w-full")}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 