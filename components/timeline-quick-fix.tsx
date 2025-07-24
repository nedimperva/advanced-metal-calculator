// Enhanced Timeline Component
// Professional timeline with real-time updates, editing, and task integration

import React, { useState } from 'react'
import { useTimelineEvents } from '@/hooks/use-timeline-events'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, Users, Flag, Truck, FileText, Camera, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, ProjectTask } from '@/lib/types'
import type { StoredTimelineEvent } from '@/lib/timeline-storage'

interface EnhancedTimelineProps {
  project: Project
  projectTasks?: ProjectTask[]
}

export function EnhancedTimeline({ project, projectTasks = [] }: EnhancedTimelineProps) {
  const { events, addEvent, editEvent, removeEvent, isLoading } = useTimelineEvents(project, projectTasks)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const getEventIcon = (type: StoredTimelineEvent['type']) => {
    switch (type) {
      case 'milestone': return <Flag className="h-4 w-4" />
      case 'status_change': return <RefreshCcw className="h-4 w-4" />
      case 'material_delivery': return <Truck className="h-4 w-4" />
      case 'note': return <FileText className="h-4 w-4" />
      case 'photo': return <Camera className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getEventColor = (type: StoredTimelineEvent['type']) => {
    switch (type) {
      case 'milestone': return 'bg-purple-500'
      case 'status_change': return 'bg-blue-500'
      case 'material_delivery': return 'bg-green-500'
      case 'note': return 'bg-gray-500'
      case 'photo': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const handleQuickAdd = () => {
    addEvent({
      type: 'note',
      title: `Project Note - ${new Date().toLocaleDateString()}`,
      description: 'Quick note added to project timeline',
      author: 'User',
      linkedTaskIds: projectTasks.length > 0 ? [projectTasks[0].id] : undefined
    })
  }

  const handleStartEdit = (event: StoredTimelineEvent) => {
    setEditingId(event.id)
    setEditTitle(event.title)
  }

  const handleSaveEdit = async () => {
    if (editingId && editTitle.trim()) {
      try {
        await editEvent(editingId, { title: editTitle.trim() })
        setEditingId(null)
        setEditTitle('')
      } catch (error) {
        // Handle edit error silently
      }
    }
  }

  const handleDelete = async (eventId: string) => {
    if (confirm('Delete this event?')) {
      try {
        await removeEvent(eventId)
      } catch (error) {
        // Handle delete error silently
      }
    }
  }

  const getTaskInfo = (taskId: string) => {
    return projectTasks.find(t => t.id === taskId)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Timeline ({events.length} events)</CardTitle>
            <Button onClick={handleQuickAdd} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? 'Adding...' : 'Add Note'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Events Timeline */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">No timeline events yet</p>
              <Button onClick={handleQuickAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Timeline Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event, index) => (
            <Card key={event.id} className="relative">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white",
                      getEventColor(event.type)
                    )}>
                      {getEventIcon(event.type)}
                    </div>
                    {index !== events.length - 1 && (
                      <div className="w-0.5 h-8 bg-border mt-2" />
                    )}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Event title - editable */}
                        {editingId === event.id ? (
                          <div className="flex items-center gap-2 mb-2">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit()
                                if (e.key === 'Escape') setEditingId(null)
                              }}
                              className="text-sm"
                              autoFocus
                            />
                            <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        ) : (
                          <h3 
                            className="font-medium text-sm leading-tight mb-2 cursor-pointer hover:text-primary"
                            onClick={() => handleStartEdit(event)}
                          >
                            {event.title}
                          </h3>
                        )}

                        {/* Event metadata */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Badge variant="outline" className="capitalize">
                            {event.type.replace('_', ' ')}
                          </Badge>
                          <span>•</span>
                          <span>{new Date(event.timestamp).toLocaleString()}</span>
                          {event.author && (
                            <>
                              <span>•</span>
                              <span>by {event.author}</span>
                            </>
                          )}
                        </div>

                        {/* Event description */}
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {event.description}
                          </p>
                        )}

                        {/* Enhanced Linked Tasks Display */}
                        {event.linkedTaskIds && event.linkedTaskIds.length > 0 && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
                            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                              <Users className="h-4 w-4" />
                              <span>Linked Tasks ({event.linkedTaskIds.length})</span>
                            </div>
                            <div className="space-y-2">
                              {event.linkedTaskIds.map(taskId => {
                                const task = getTaskInfo(taskId)
                                return (
                                  <div key={taskId} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium truncate">
                                        {task?.name || `Task ${taskId.substring(0, 8)}`}
                                      </div>
                                      {task?.description && (
                                        <div className="text-xs text-muted-foreground truncate">
                                          {task.description}
                                        </div>
                                      )}
                                      {task?.assignedTo && (
                                        <div className="text-xs text-muted-foreground">
                                          Assigned to: {task.assignedTo}
                                        </div>
                                      )}
                                    </div>
                                    {task && (
                                      <Badge
                                        className={cn(
                                          "text-xs ml-2",
                                          task.status === 'completed' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
                                          task.status === 'in_progress' && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
                                          task.status === 'not_started' && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                        )}
                                      >
                                        {task.status.replace('_', ' ')}
                                      </Badge>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Type-specific content */}
                        {event.milestone && (
                          <div className="mt-2 flex gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {event.milestone.type}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                event.milestone.importance === 'critical' && "border-red-500 text-red-700",
                                event.milestone.importance === 'high' && "border-orange-500 text-orange-700",
                                event.milestone.importance === 'medium' && "border-blue-500 text-blue-700",
                                event.milestone.importance === 'low' && "border-gray-500 text-gray-700"
                              )}
                            >
                              {event.milestone.importance} priority
                            </Badge>
                          </div>
                        )}

                        {event.materialInfo && (
                          <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              {event.materialInfo.supplier && (
                                <div><strong>Supplier:</strong> {event.materialInfo.supplier}</div>
                              )}
                              {event.materialInfo.quantity && (
                                <div><strong>Qty:</strong> {event.materialInfo.quantity}</div>
                              )}
                              {event.materialInfo.cost && (
                                <div><strong>Cost:</strong> ${event.materialInfo.cost.toFixed(2)}</div>
                              )}
                              {event.materialInfo.trackingNumber && (
                                <div><strong>Tracking:</strong> {event.materialInfo.trackingNumber}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons for custom events */}
                      {event.id.startsWith('custom-') && (
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(event)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(event.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// Backward compatibility export
export const TimelineQuickFix = EnhancedTimeline 