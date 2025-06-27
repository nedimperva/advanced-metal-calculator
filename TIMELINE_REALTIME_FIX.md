# Timeline Real-Time Updates and Edit Features Fix

## Issue Summary
1. **Real-time updates**: Events don't appear immediately, need page reload
2. **Edit functionality**: Users want to edit existing events  
3. **Task display**: Better display of linked tasks in timeline

## Quick Fix for Real-Time Updates

### Problem
The main timeline component state management is conflicting with the custom events. Here's what's happening:

1. Event gets added to localStorage ✅
2. Component state gets updated ✅
3. But the main timeline component overwrites the state with generated events ❌

### Solution 1: Use the Enhanced Hook

Replace the timeline component's event management with the fixed hook:

```tsx
// In project-timeline.tsx, replace this pattern:
const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])

// With this:
import { useTimelineEvents } from './timeline-events-fix'

// In the component:
const { events: timelineEvents, addEvent, editEvent, removeEvent } = useTimelineEvents(project, projectTasks)

// Update the handleAddEvent function:
const handleAddEvent = async (eventData: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
  try {
    await addEvent(eventData)
    onUpdate?.()
  } catch (error) {
    console.error('Failed to add timeline event:', error)
    throw error
  }
}
```

### Solution 2: Add Edit Functionality

Add these functions to handle editing:

```tsx
// Add to timeline component
const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)

// Add edit handler
const handleEditEvent = async (eventId: string, updates: Partial<TimelineEvent>) => {
  try {
    await editEvent(eventId, updates)
    onUpdate?.()
    toast({ title: "Event Updated", description: "Timeline event has been updated" })
  } catch (error) {
    console.error('Failed to edit timeline event:', error)
    toast({ title: "Edit Failed", description: "Failed to update timeline event", variant: "destructive" })
  }
}
```

### Solution 3: Enhanced Timeline Event Display

Update the TimelineEventItem component to show edit buttons and better task display:

```tsx
// In TimelineEventItem component, add edit functionality:
{event.id.startsWith('custom-') && (
  <div className="flex gap-1 mt-2">
    <Button 
      size="sm" 
      variant="ghost" 
      onClick={() => onEdit?.(event)}
      className="h-6 px-2 text-xs"
    >
      <Edit className="h-3 w-3 mr-1" />
      Edit
    </Button>
    <Button 
      size="sm" 
      variant="ghost" 
      onClick={() => onDelete?.(event.id)}
      className="h-6 px-2 text-xs text-destructive"
    >
      <Trash2 className="h-3 w-3 mr-1" />
      Delete
    </Button>
  </div>
)}
```

### Solution 4: Better Task Display

Enhance the linked tasks section:

```tsx
{/* Enhanced task display in TimelineEventItem */}
{event.linkedTaskIds && event.linkedTaskIds.length > 0 && (
  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
      <Users className="h-4 w-4" />
      <span>Linked Tasks ({event.linkedTaskIds.length})</span>
    </div>
    <div className="space-y-2">
      {event.linkedTaskIds.map(taskId => {
        const task = projectTasks.find(t => t.id === taskId)
        return task ? (
          <div key={taskId} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
            <div className="flex-1">
              <div className="text-sm font-medium">{task.name}</div>
              {task.description && (
                <div className="text-xs text-muted-foreground">{task.description}</div>
              )}
              {task.assignedTo && (
                <div className="text-xs text-muted-foreground">Assigned to: {task.assignedTo}</div>
              )}
            </div>
            <Badge 
              className={cn(
                "text-xs",
                task.status === 'completed' && "bg-green-100 text-green-700",
                task.status === 'in_progress' && "bg-blue-100 text-blue-700",
                task.status === 'not_started' && "bg-gray-100 text-gray-700"
              )}
            >
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        ) : (
          <div key={taskId} className="text-xs text-muted-foreground">
            Task {taskId} (not found)
          </div>
        )
      })}
    </div>
  </div>
)}
```

## Testing the Fix

### 1. Add Debug Component First
Add the TimelineDebugWrapper to your timeline tab to test:

```tsx
// In unified-project-details.tsx
import { TimelineDebugWrapper } from './timeline-debug-wrapper'

// In timeline tab:
<TabsContent value="timeline" className="mt-0">
  <TimelineDebugWrapper project={project} projectTasks={projectTasks} />
  <ProjectTimeline ... />
</TabsContent>
```

### 2. Test Real-Time Updates
1. Add an event using the debug component
2. The event should appear immediately (no reload needed)
3. Check browser console for "Saved timeline event" messages
4. Try the "Edit" and "Delete" buttons

### 3. Verify Persistence  
1. Add events and refresh the page
2. Events should persist across page reloads
3. Try switching between projects - each should have its own events

## Implementation Steps

1. **Phase 1**: Add debug component to test localStorage persistence ✅
2. **Phase 2**: Replace timeline state management with the fixed hook
3. **Phase 3**: Add edit modal or inline editing
4. **Phase 4**: Enhance task display in timeline events
5. **Phase 5**: Remove debug component once everything works

## Expected Results

After implementing:
- ✅ Events appear immediately when added (no reload needed)
- ✅ Edit functionality for custom events
- ✅ Delete functionality for custom events  
- ✅ Enhanced task display with status and assignment info
- ✅ Events persist across page reloads
- ✅ Each project has its own timeline events

The debug component will show you exactly what's working and what needs to be fixed. 