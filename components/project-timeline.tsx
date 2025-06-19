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
import { useMediaQuery } from '@/hooks/use-media-query'
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

// Add Event Modal Component - Mobile Optimized
function AddEventModal({ 
  project, 
  isOpen, 
  onClose, 
  onAdd 
}: AddEventModalProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
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
      <DialogContent className={cn(
        isMobile 
          ? "max-w-[95vw] max-h-[90vh] w-full" 
          : "max-w-lg"
      )}>
        <DialogHeader>
          <DialogTitle>Add Timeline Event</DialogTitle>
          <DialogDescription>
            Add a new event to the project timeline.
          </DialogDescription>
        </DialogHeader>
        
        <div className={cn(
          "space-y-4",
          isMobile && "space-y-3"
        )}>
          <div>
            <Label>Event Type</Label>
            <Select value={eventType} onValueChange={(value) => setEventType(value as TimelineEvent['type'])}>
              <SelectTrigger className={cn(isMobile && "h-12")}>
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
              className={cn(
                isMobile && "text-base h-12" // Prevent zoom on iOS
              )}
            />
          </div>

          <div>
            <Label>Description (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              rows={3}
              className={cn(
                "resize-none",
                isMobile && "text-base" // Prevent zoom on iOS
              )}
            />
          </div>

          <div>
            <Label>Author (Optional)</Label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Who performed this action?"
              className={cn(
                isMobile && "text-base h-12" // Prevent zoom on iOS
              )}
            />
          </div>
        </div>
        
        <DialogFooter className={cn(
          isMobile ? "flex-col gap-2" : "flex-row gap-2"
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

// Timeline Event Component - Mobile Optimized
function TimelineEventItem({ 
  event, 
  isLast = false,
  isMobile = false
}: { 
  event: TimelineEvent
  isLast?: boolean
  isMobile?: boolean
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
    <div className={cn(
      "flex gap-3",
      isMobile && "gap-2"
    )}>
      {/* Timeline Line - Mobile Optimized */}
      <div className="flex flex-col items-center shrink-0">
        <div className={cn(
          "rounded-full flex items-center justify-center text-white",
          isMobile ? "w-6 h-6" : "w-8 h-8",
          getEventColor(event.type)
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

      {/* Event Content - Mobile Optimized */}
      <div className={cn(
        "flex-1 min-w-0",
        isMobile ? "pb-4" : "pb-8"
      )}>
        <div className={cn(
          "bg-card border rounded-lg",
          isMobile ? "p-3" : "p-4"
        )}>
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
                  <span className={cn(isMobile && "break-all")}>
                    {isMobile 
                      ? new Date(event.timestamp).toLocaleDateString()
                      : new Date(event.timestamp).toLocaleString()
                    }
                  </span>
                </div>
                {event.author && (
                  <div className="flex items-center gap-1">
                    <Separator orientation="vertical" className="h-3" />
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">{event.author}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs shrink-0",
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
          
          {event.attachments && event.attachments.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Attachments:</p>
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
                  >
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
  const isMobile = useMediaQuery("(max-width: 767px)")
  
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
        timestamp: new Date(project.createdAt).toISOString(),
        author: 'System'
      })

      // Status changes (mock data - in real implementation, this would come from status history)
      if (project.status !== ProjectStatus.PLANNING) {
        events.push({
          id: `status-change-${project.id}`,
          type: 'status_change',
          title: `Status Changed to ${PROJECT_STATUS_LABELS[project.status]}`,
          description: `Project status updated to ${PROJECT_STATUS_LABELS[project.status]}`,
          timestamp: new Date(project.updatedAt).toISOString(),
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
              title: `Material Delivered`,
              description: `${material.quantity} units delivered`,
              timestamp: material.arrivalDate ? new Date(material.arrivalDate).toISOString() : new Date().toISOString(),
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
          timestamp: new Date(project.deadline).toISOString(),
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
              title: `Material Delivery`,
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
            Project Timeline
          </h2>
          <Button 
            onClick={() => setShowAddEventModal(true)}
            className={cn(
              isMobile ? "w-full h-12" : ""
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
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
                    Total Events
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
                    Milestones
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
                    Deliveries
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
                    Recent (7d)
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
              Upcoming Deadlines & Deliveries
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
                    {item.daysUntil === 0 ? 'Today' : 
                     item.daysUntil === 1 ? 'Tomorrow' : 
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
            Timeline Events
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
                No Timeline Events
              </h3>
              <p className={cn(
                "text-muted-foreground mb-4",
                isMobile ? "text-sm" : "text-base"
              )}>
                Start adding events to track project progress and milestones.
              </p>
              <Button 
                onClick={() => setShowAddEventModal(true)}
                className={cn(
                  isMobile ? "w-full h-12" : ""
                )}
              >
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
                  isMobile={isMobile}
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