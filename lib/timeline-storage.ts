// Simple timeline events storage utility
export interface StoredTimelineEvent {
  id: string
  projectId: string
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
  materialInfo?: {
    supplier?: string
    quantity?: number
    cost?: number
    trackingNumber?: string
  }
  statusChange?: {
    fromStatus: string
    toStatus: string
  }
  milestone?: {
    type: 'start' | 'checkpoint' | 'completion' | 'deadline'
    importance: 'low' | 'medium' | 'high' | 'critical'
  }
}

const STORAGE_KEY = 'timeline_events'

export function getTimelineEvents(projectId: string): StoredTimelineEvent[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const allEvents: StoredTimelineEvent[] = JSON.parse(stored)
    return allEvents.filter(event => event.projectId === projectId)
  } catch (error) {
    console.error('Error loading timeline events:', error)
    return []
  }
}

export function saveTimelineEvent(projectId: string, event: Omit<StoredTimelineEvent, 'id' | 'projectId' | 'timestamp'>): StoredTimelineEvent {
  if (typeof window === 'undefined') throw new Error('Cannot save in SSR environment')
  
  const newEvent: StoredTimelineEvent = {
    ...event,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    timestamp: new Date().toISOString()
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const allEvents: StoredTimelineEvent[] = stored ? JSON.parse(stored) : []
    
    allEvents.push(newEvent)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allEvents))
    
    console.log('Saved timeline event:', newEvent.title, 'Total events for project:', allEvents.filter(e => e.projectId === projectId).length)
    
    // Trigger update notification
    import('./timeline-events').then(({ triggerTimelineUpdate }) => {
      triggerTimelineUpdate(projectId)
    }).catch(() => {
      // Fallback: dispatch a custom event
      window.dispatchEvent(new CustomEvent('timeline-update', { detail: { projectId } }))
    })
    
    return newEvent
  } catch (error) {
    console.error('Error saving timeline event:', error)
    throw error
  }
}

export function updateTimelineEvent(eventId: string, updates: Partial<Omit<StoredTimelineEvent, 'id' | 'projectId'>>): StoredTimelineEvent | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const allEvents: StoredTimelineEvent[] = JSON.parse(stored)
    const eventIndex = allEvents.findIndex(event => event.id === eventId)
    
    if (eventIndex === -1) return null
    
    const updatedEvent = { 
      ...allEvents[eventIndex], 
      ...updates,
      timestamp: updates.timestamp || allEvents[eventIndex].timestamp // Only update timestamp if explicitly provided
    }
    
    allEvents[eventIndex] = updatedEvent
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allEvents))
    
    console.log('Updated timeline event:', updatedEvent.title)
    return updatedEvent
  } catch (error) {
    console.error('Error updating timeline event:', error)
    return null
  }
}

export function deleteTimelineEvent(eventId: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return false
    
    const allEvents: StoredTimelineEvent[] = JSON.parse(stored)
    const initialLength = allEvents.length
    const filtered = allEvents.filter(event => event.id !== eventId)
    
    if (filtered.length === initialLength) return false // Event not found
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    console.log('Deleted timeline event:', eventId)
    return true
  } catch (error) {
    console.error('Error deleting timeline event:', error)
    return false
  }
}

export function clearTimelineEvents(projectId?: string): void {
  if (typeof window === 'undefined') return
  
  try {
    if (projectId) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      
      const allEvents: StoredTimelineEvent[] = JSON.parse(stored)
      const filtered = allEvents.filter(event => event.projectId !== projectId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    console.error('Error clearing timeline events:', error)
  }
}

export function getLinkedTimelineEvents(projectId: string, taskId: string): StoredTimelineEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const allEvents: StoredTimelineEvent[] = JSON.parse(stored)
    const projectEvents = allEvents.filter(event => event.projectId === projectId)
    return projectEvents.filter(event => 
      event.linkedTaskIds && event.linkedTaskIds.includes(taskId)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error('Failed to get linked timeline events:', error)
    return []
  }
} 