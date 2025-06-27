"use client"

import React, { useState } from 'react'
import { useTimelineEvents } from './timeline-events-fix'
import { type StoredTimelineEvent } from '@/lib/timeline-storage'
import { Edit, Trash2, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useI18n } from '@/contexts/i18n-context'
import type { Project, ProjectTask } from '@/lib/types'

interface EnhancedTimelineWrapperProps {
  project: Project
  projectTasks?: ProjectTask[]
}

export function EnhancedTimelineWrapper({ project, projectTasks = [] }: EnhancedTimelineWrapperProps) {
  const { t } = useI18n()
  const { events, addEvent, editEvent, removeEvent, refreshEvents, isLoading } = useTimelineEvents(project, projectTasks)
  const [editingEvent, setEditingEvent] = useState<StoredTimelineEvent | null>(null)
  const isMobile = useMediaQuery("(max-width: 767px)")

  const getTaskName = (taskId: string) => {
    return projectTasks.find(t => t.id === taskId)?.name || `Task ${taskId.substring(0, 8)}`
  }

  const getEventColor = (event: StoredTimelineEvent) => {
    switch (event.type) {
      case 'milestone': return 'bg-purple-500'
      case 'status_change': return 'bg-blue-500'
      case 'material_delivery': return 'bg-green-500'
      case 'note': return 'bg-gray-500'
      case 'photo': return 'bg-orange-500'
      default: return 'bg-gray-400'
    }
  }

  const getEventIcon = (type: StoredTimelineEvent['type']) => {
    switch (type) {
      case 'milestone': return '🏁'
      case 'status_change': return '🔄'  
      case 'material_delivery': return '🚛'
      case 'note': return '📝'
      case 'photo': return '📷'
      default: return '⚪'
    }
  }

  const handleQuickEdit = async (event: StoredTimelineEvent, newTitle: string) => {
    if (newTitle.trim() && newTitle !== event.title) {
      try {
        await editEvent(event.id, { title: newTitle.trim() })
      } catch (error) {
        console.error('Quick edit failed:', error)
      }
    }
  }

  const handleDelete = async (eventId: string) => {
    if (confirm('Delete this timeline event?')) {
      try {
        await removeEvent(eventId)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const handleAddQuickNote = () => {
    addEvent({
      type: 'note',
      title: `Quick Note - ${new Date().toLocaleDateString()}`,
      description: 'Click edit to add details',
      author: 'User'
    })
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Enhanced Timeline ({events.length} events)</CardTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={refreshEvents}
                disabled={isLoading}
              >
                Refresh
              </Button>
              <Button 
                size="sm" 
                onClick={handleAddQuickNote}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Quick Note
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No timeline events yet</p>
              <Button onClick={handleAddQuickNote} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add First Event
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
                      "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm",
                      getEventColor(event)
                    )}>
                      {getEventIcon(event.type)}
                    </div>
                    {index !== events.length - 1 && (
                      <div className="w-0.5 h-8 bg-border mt-2" />
                    )}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {editingEvent?.id === event.id ? (
                          <input
                            defaultValue={event.title}
                            onBlur={(e) => {
                              handleQuickEdit(event, e.target.value)
                              setEditingEvent(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleQuickEdit(event, e.currentTarget.value)
                                setEditingEvent(null)
                              } else if (e.key === 'Escape') {
                                setEditingEvent(null)
                              }
                            }}
                            className="w-full p-1 border rounded text-sm font-medium"
                            autoFocus
                          />
                        ) : (
                          <h3 
                            className="font-medium text-sm leading-tight cursor-pointer hover:text-primary"
                            onClick={() => setEditingEvent(event)}
                          >
                            {event.title}
                          </h3>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
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
                        
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {event.description}
                          </p>
                        )}

                        {/* Enhanced Task Display */}
                        {event.linkedTaskIds && event.linkedTaskIds.length > 0 && (
                          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <div className="flex items-center gap-1 text-xs text-blue-700 dark:text-blue-300 mb-2">
                              <Users className="h-3 w-3" />
                              <span className="font-medium">Linked Tasks ({event.linkedTaskIds.length})</span>
                            </div>
                            <div className="grid gap-2">
                              {event.linkedTaskIds.map(taskId => {
                                const task = projectTasks.find(t => t.id === taskId)
                                return (
                                  <div key={taskId} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium truncate">
                                        {task?.name || getTaskName(taskId)}
                                      </div>
                                      {task?.description && (
                                        <div className="text-xs text-muted-foreground truncate">
                                          {task.description}
                                        </div>
                                      )}
                                    </div>
                                    {task && (
                                      <Badge
                                        variant="secondary"
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
                            <Badge variant="outline" className="text-xs">
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
                          <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded text-xs">
                            {event.materialInfo.supplier && (
                              <div><strong>Supplier:</strong> {event.materialInfo.supplier}</div>
                            )}
                            {event.materialInfo.quantity && (
                              <div><strong>{t('quantity')}:</strong> {event.materialInfo.quantity}</div>
                            )}
                            {event.materialInfo.cost && (
                              <div><strong>Cost:</strong> ${event.materialInfo.cost.toFixed(2)}</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      {event.id.startsWith('custom-') && (
                        <div className="flex gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingEvent(event)}
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