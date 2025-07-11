// Simple event system for timeline component synchronization

type TimelineEventListener = (projectId: string) => void

class TimelineEventEmitter {
  private listeners: TimelineEventListener[] = []

  subscribe(listener: TimelineEventListener) {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  emit(projectId: string) {
    this.listeners.forEach(listener => {
      try {
        listener(projectId)
      } catch (error) {
        console.error('Timeline event listener error:', error)
      }
    })
  }
}

export const timelineEventEmitter = new TimelineEventEmitter()

// Helper function to trigger timeline updates
export function triggerTimelineUpdate(projectId: string) {
  console.log('Triggering timeline update for project:', projectId)
  timelineEventEmitter.emit(projectId)
} 