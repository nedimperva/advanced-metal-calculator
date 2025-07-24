// Timeline events hook for managing project timeline events with persistence
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
  }, [project.id])

  // Listen for timeline updates from other components
  useEffect(() => {
    const unsubscribe = timelineEventEmitter.subscribe((updatedProjectId) => {
      if (updatedProjectId === project.id) {
        const loadedEvents = getTimelineEvents(project.id)
        setCustomEvents(loadedEvents)
      }
    })

    // Also listen for custom window events as fallback
    const handleTimelineUpdate = (event: any) => {
      if (event.detail?.projectId === project.id) {
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
      
      return savedEvent
    } catch (error) {
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
        return updatedEvent
      } else {
        throw new Error('Event not found')
      }
    } catch (error) {
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
        return true
      } else {
        throw new Error('Event not found')
      }
    } catch (error) {
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