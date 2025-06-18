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
  Flag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '@/contexts/project-context'
import { 
  PROJECT_STATUS_LABELS, 
  PROJECT_STATUS_COLORS,
  MATERIAL_STATUS_LABELS,
  MATERIAL_STATUS_COLORS 
} from '@/lib/project-utils'
import { ProjectStatus, MaterialStatus, type Project, type ProjectMaterial } from '@/lib/types'
import { LoadingSpinner } from '@/components/loading-states'
import { toast } from '@/hooks/use-toast'

interface TimelineEvent {
  id: string
  type: 'milestone' | 'status_change' | 'material_delivery' | 'note' | 'photo'
  title: string
  description?: string
  timestamp: string
  author?: string
  data?: any
  attachments?: string[]
}

interface ProjectTimelineProps {
  project: Project
  onUpdate?: () => void
  className?: string
}

interface AddEventModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onAdd: (event: Omit<TimelineEvent, 'id' | 'timestamp'>) => void
}

// Add Event Modal Component
function AddEventModal({ 
  project, 
  isOpen, 
  onClose, 
  onAdd 
}: AddEventModalProps) {
  const [eventType, setEventType] = useState<TimelineEvent['type']>('note')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async () => {
    if (!title.trim()) return

    setIsLoading(true)
    try {
      const event: Omit<TimelineEvent, 'id' | 'timestamp'> = {
        type: eventType,
        title: title.trim(),
        description: description.trim() || undefined,
        author: author.trim() || undefined,
        data: {}
      }

      await onAdd(event)
      
      // Reset form
      setTitle('')
      setDescription('')
      setAuthor('')
      setEventType('note')
      onClose()
      
      toast({
        title: "Event Added",
        description: "Timeline event has been added to the project",
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

  const eventTypeOptions = [
    { value: 'milestone', label: 'Milestone', icon: Flag },
    { value: 'status_change', label: 'Status Change', icon: ArrowRight },
    { value: 'material_delivery', label: 'Material Delivery', icon: Truck },
    { value: 'note', label: 'Note', icon: FileText },
    { value: 'photo', label: 'Photo/Progress', icon: Camera }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Timeline Event</DialogTitle>
          <DialogDescription>
            Add a new event to the project timeline.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Event Type</Label>
            <Select value={eventType} onValueChange={(value) => setEventType(value as TimelineEvent['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
            />
          </div>

          <div>
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          <div>
            <Label>Author (Optional)</Label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Who performed this action?"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={isLoading || !title.trim()}>
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Adding...
              </>
            ) : (
              'Add Event'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Timeline Event Component
function TimelineEventItem({ 
  event, 
  isLast = false 
}: { 
  event: TimelineEvent
  isLast?: boolean 
}) {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone':
        return <Flag className="h-4 w-4" />
      case 'status_change':
        return <ArrowRight className="h-4 w-4" />
      case 'material_delivery':
        return <Truck className="h-4 w-4" />
      case 'note':
        return <FileText className="h-4 w-4" />
      case 'photo':
        return <Camera className="h-4 w-4" />
      default:
        return <Circle className="h-4 w-4" />
    }
  }

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone':
        return 'bg-purple-500'
      case 'status_change':
        return 'bg-blue-500'
      case 'material_delivery':
        return 'bg-green-500'
      case 'note':
        return 'bg-gray-500'
      case 'photo':
        return 'bg-orange-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="flex gap-4">
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-white",
          getEventColor(event.type)
        )}>
          {getEventIcon(event.type)}
        </div>
        {!isLast && (
          <div className="w-0.5 h-8 bg-border mt-2" />
        )}
      </div>

      {/* Event Content */}
      <div className="flex-1 pb-8">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-sm">{event.title}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                {new Date(event.timestamp).toLocaleString()}
                {event.author && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <User className="h-3 w-3" />
                    {event.author}
                  </>
                )}
              </div>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {event.type.replace('_', ' ')}
            </Badge>
          </div>
          
          {event.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {event.description}
            </p>
          )}
          
          {event.attachments && event.attachments.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {event.attachments.map((attachment, index) => (
                  <Button key={index} variant="outline" size="sm" className="h-8 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    File {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Project Timeline Component
export default function ProjectTimeline({
  project,
  onUpdate,
  className
}: ProjectTimelineProps) {
  const { updateProject } = useProjects()
  
  // Local state
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Generate timeline events from project data
  useEffect(() => {
    const generateTimelineEvents = () => {
      const events: TimelineEvent[] = []

      // Project creation event
      events.push({
        id: `project-created-${project.id}`,
        type: 'milestone',
        title: 'Project Created',
        description: `Project "${project.name}" was created`,
        timestamp: project.createdAt,
        author: 'System'
      })

      // Status changes (mock data - in real implementation, this would come from status history)
      if (project.status !== ProjectStatus.PLANNING) {
        events.push({
          id: `status-change-${project.id}`,
          type: 'status_change',
          title: `Status Changed to ${PROJECT_STATUS_LABELS[project.status]}`,
          description: `Project status updated to ${PROJECT_STATUS_LABELS[project.status]}`,
          timestamp: project.updatedAt,
          author: 'System'
        })
      }

      // Material delivery events
      if (project.materials) {
        project.materials.forEach((material) => {
          if (material.status === MaterialStatus.ARRIVED || material.status === MaterialStatus.INSTALLED) {
            events.push({
              id: `material-delivery-${material.id}`,
              type: 'material_delivery',
              title: `Material Delivered: ${material.name}`,
              description: `${material.quantity} ${material.unit} of ${material.name} delivered`,
              timestamp: material.expectedDelivery || material.updatedAt || new Date().toISOString(),
              author: material.supplier || 'Supplier'
            })
          }
        })
      }

      // Deadline milestone
      if (project.deadline) {
        const isOverdue = new Date(project.deadline) < new Date()
        events.push({
          id: `deadline-${project.id}`,
          type: 'milestone',
          title: isOverdue ? 'Deadline Passed' : 'Project Deadline',
          description: `Project deadline: ${new Date(project.deadline).toLocaleDateString()}`,
          timestamp: project.deadline,
          author: 'System'
        })
      }

      // Sort events by timestamp
      return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }

    setTimelineEvents(generateTimelineEvents())
  }, [project])

  // Handle add event
  const handleAddEvent = async (eventData: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
    setIsLoading(true)
    try {
      const newEvent: TimelineEvent = {
        ...eventData,
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      }

      // In a real implementation, you would save this to the database
      // For now, we'll just add it to local state
      setTimelineEvents(prev => [newEvent, ...prev])
      
      onUpdate?.()
    } catch (error) {
      console.error('Failed to add timeline event:', error)
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
        title: 'Project Deadline',
        date: project.deadline,
        daysUntil,
        urgent: daysUntil <= 7
      })
    }

    // Material deliveries
    if (project.materials) {
      project.materials.forEach(material => {
        if (material.expectedDelivery && 
            new Date(material.expectedDelivery) > new Date() &&
            material.status !== MaterialStatus.ARRIVED &&
            material.status !== MaterialStatus.INSTALLED) {
          const daysUntil = Math.ceil((new Date(material.expectedDelivery).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          upcoming.push({
            type: 'delivery',
            title: `${material.name} Delivery`,
            date: material.expectedDelivery,
            daysUntil,
            urgent: daysUntil <= 3
          })
        }
      })
    }

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil)
  }, [project])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header and Statistics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Project Timeline</h2>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddEventModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{timelineStats.totalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Flag className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Milestones</p>
                  <p className="text-2xl font-bold">{timelineStats.milestones}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deliveries</p>
                  <p className="text-2xl font-bold">{timelineStats.deliveries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recent (7 days)</p>
                  <p className="text-2xl font-bold">{timelineStats.recentEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Items */}
      {upcomingItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Deadlines & Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingItems.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    item.urgent ? "border-destructive/20 bg-destructive/5" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.type === 'deadline' ? (
                      <Flag className={cn(
                        "h-4 w-4",
                        item.urgent ? "text-destructive" : "text-muted-foreground"
                      )} />
                    ) : (
                      <Truck className={cn(
                        "h-4 w-4",
                        item.urgent ? "text-destructive" : "text-muted-foreground"
                      )} />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant={item.urgent ? "destructive" : "secondary"} className="text-xs">
                    {item.daysUntil === 0 ? 'Today' : 
                     item.daysUntil === 1 ? 'Tomorrow' : 
                     `${item.daysUntil} days`}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">No Timeline Events</h3>
              <p className="text-muted-foreground mb-4">
                Start adding events to track project progress and milestones.
              </p>
              <Button onClick={() => setShowAddEventModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Event
              </Button>
            </div>
          ) : (
            <div className="space-y-0">
              {timelineEvents.map((event, index) => (
                <TimelineEventItem
                  key={event.id}
                  event={event}
                  isLast={index === timelineEvents.length - 1}
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
      />
    </div>
  )
}