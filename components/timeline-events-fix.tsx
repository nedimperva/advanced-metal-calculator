// Fix for timeline events not showing
// This demonstrates the proper way to handle timeline events with persistence

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getTimelineEvents, saveTimelineEvent, updateTimelineEvent, deleteTimelineEvent, type StoredTimelineEvent } from '@/lib/timeline-storage'
import { timelineEventEmitter } from '@/lib/timeline-events'
import { ProjectStatus, type Project, type ProjectTask } from '@/lib/types'
import { PROJECT_STATUS_LABELS } from '@/lib/project-utils'

// Hook to manage timeline events with persistence
export function useTimelineEvents(project: Project, projectTasks: ProjectTask[] = []) {
  const [customEvents, setCustomEvents] = useState<StoredTimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load custom events from localStorage on mount
  useEffect(() => {
    const loadedEvents = getTimelineEvents(project.id)
    setCustomEvents(loadedEvents)
    console.log('Loaded', loadedEvents.length, 'custom events for project', project.id)
  }, [project.id])

  // Listen for timeline updates from other components
  useEffect(() => {
    const unsubscribe = timelineEventEmitter.subscribe((updatedProjectId) => {
      if (updatedProjectId === project.id) {
        console.log('Timeline update received for project:', project.id)
        const loadedEvents = getTimelineEvents(project.id)
        setCustomEvents(loadedEvents)
      }
    })

    // Also listen for custom window events as fallback
    const handleTimelineUpdate = (event: any) => {
      if (event.detail?.projectId === project.id) {
        console.log('Timeline window event received for project:', project.id)
        const loadedEvents = getTimelineEvents(project.id)
        setCustomEvents(loadedEvents)
      }
    }

    window.addEventListener('timeline-update', handleTimelineUpdate)

    return () => {
      unsubscribe()
      window.removeEventListener('timeline-update', handleTimelineUpdate)
    }
  }, [project.id])

  // Generate system events from project data
  const systemEvents = useMemo(() => {
    const events: StoredTimelineEvent[] = []

    // Project creation event
    events.push({
      id: `project-created-${project.id}`,
      projectId: project.id,
      type: 'milestone',
      title: 'Project Created',
      description: `Project "${project.name}" was created`,
      timestamp: new Date(project.createdAt).toISOString(),
      author: 'System'
    })

    // Status changes
    if (project.status !== ProjectStatus.PLANNING) {
      events.push({
        id: `status-change-${project.id}`,
        projectId: project.id,
        type: 'status_change',
        title: `Status Changed to ${PROJECT_STATUS_LABELS[project.status]}`,
        description: `Project status updated to ${PROJECT_STATUS_LABELS[project.status]}`,
        timestamp: new Date(project.updatedAt).toISOString(),
        author: 'System'
      })
    }

    // Task completion events
    projectTasks.forEach((task) => {
      if (task.status === 'completed' && task.actualEnd) {
        events.push({
          id: `task-completed-${task.id}`,
          projectId: project.id,
          type: 'milestone',
          title: `Task Completed: ${task.name}`,
          description: `Task "${task.name}" was marked as completed`,
          timestamp: new Date(task.actualEnd).toISOString(),
          author: task.assignedTo || 'Team Member',
          linkedTaskIds: [task.id]
        })
      }
    })

    return events
  }, [project, projectTasks])

  // Combine all events and sort by timestamp
  const allEvents = useMemo(() => {
    const combined = [...systemEvents, ...customEvents]
    return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [systemEvents, customEvents])

  // Add new custom event
  const addEvent = async (eventData: Omit<StoredTimelineEvent, 'id' | 'projectId' | 'timestamp'>) => {
    setIsLoading(true)
    try {
      // Save to localStorage
      const savedEvent = saveTimelineEvent(project.id, eventData)
      
      // Update local state immediately for real-time updates
      setCustomEvents(prev => [savedEvent, ...prev])
      
      console.log('Successfully added timeline event:', savedEvent.title)
      return savedEvent
    } catch (error) {
      console.error('Failed to add timeline event:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Edit existing event
  const editEvent = useCallback(async (eventId: string, updates: Partial<Omit<StoredTimelineEvent, 'id' | 'projectId'>>) => {
    setIsLoading(true)
    try {
      // Update in localStorage
      const updatedEvent = updateTimelineEvent(eventId, updates)
      
      if (updatedEvent) {
        // Update local state immediately for real-time updates
        setCustomEvents(prev => 
          prev.map(event => 
            event.id === eventId ? updatedEvent : event
          )
        )
        console.log('Successfully updated timeline event:', updatedEvent.title)
        return updatedEvent
      } else {
        throw new Error('Event not found')
      }
    } catch (error) {
      console.error('Failed to update timeline event:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete event
  const removeEvent = useCallback(async (eventId: string) => {
    setIsLoading(true)
    try {
      // Delete from localStorage
      const success = deleteTimelineEvent(eventId)
      
      if (success) {
        // Update local state immediately for real-time updates
        setCustomEvents(prev => prev.filter(event => event.id !== eventId))
        console.log('Successfully deleted timeline event:', eventId)
        return true
      } else {
        throw new Error('Event not found')
      }
    } catch (error) {
      console.error('Failed to delete timeline event:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Force refresh events from storage
  const refreshEvents = useCallback(() => {
    const loadedEvents = getTimelineEvents(project.id)
    setCustomEvents(loadedEvents)
  }, [project.id])

  return {
    events: allEvents,
    customEvents,
    systemEvents,
    addEvent,
    editEvent,
    removeEvent,
    refreshEvents,
    isLoading
  }
}

// Enhanced debug component with editing and task display
export function TimelineEventsDebug({ project, projectTasks }: { project: Project, projectTasks?: ProjectTask[] }) {
  const { events, addEvent, editEvent, removeEvent, refreshEvents, isLoading } = useTimelineEvents(project, projectTasks)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const handleAddTestEvent = () => {
    const taskIds = projectTasks?.slice(0, 2).map(t => t.id) || []
    addEvent({
      type: 'note',
      title: `Test Event ${Date.now()}`,
      description: 'This is a test event to verify timeline functionality with real-time updates',
      author: 'Debug User',
      linkedTaskIds: taskIds.length > 0 ? taskIds : undefined
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
        console.error('Edit failed:', error)
      }
    }
  }

  const handleDelete = async (eventId: string) => {
    if (confirm('Delete this event?')) {
      try {
        await removeEvent(eventId)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  const getTaskName = (taskId: string) => {
    return projectTasks?.find(t => t.id === taskId)?.name || `Task ${taskId.substring(0, 8)}`
  }

  return (
    <div className="p-4 border rounded">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">Timeline Events Debug ({events.length} total)</h3>
        <button 
          onClick={refreshEvents}
          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={handleAddTestEvent}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Adding...' : 'Add Test Event'}
        </button>
        
        {projectTasks && projectTasks.length > 0 && (
          <button 
            onClick={() => addEvent({
              type: 'milestone',
              title: 'Task Linked Milestone',
              description: 'Milestone with linked tasks',
              author: 'Debug User',
              linkedTaskIds: [projectTasks[0].id],
              milestone: {
                type: 'checkpoint',
                importance: 'high'
              }
            })}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Add Milestone with Task
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500">No events found</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="p-3 bg-gray-50 rounded border text-sm">
              {editingId === event.id ? (
                <div className="space-y-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-1 border rounded text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={handleSaveEdit}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-gray-600 text-xs">{event.type} • {new Date(event.timestamp).toLocaleString()}</div>
                      {event.description && <div className="text-gray-500 text-xs mt-1">{event.description}</div>}
                      
                      {/* Show linked tasks */}
                      {event.linkedTaskIds && event.linkedTaskIds.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-gray-600 mb-1">Linked Tasks:</div>
                          <div className="flex flex-wrap gap-1">
                            {event.linkedTaskIds.map(taskId => (
                              <span key={taskId} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {getTaskName(taskId)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Show milestone info */}
                      {event.milestone && (
                        <div className="mt-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {event.milestone.importance} • {event.milestone.type}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {event.id.startsWith('custom-') && (
                      <div className="flex gap-1 ml-2">
                        <button 
                          onClick={() => handleStartEdit(event)}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(event.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                        >
                          Del
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 