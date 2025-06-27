# Timeline Events Fix Instructions

## Problem
Events are being "saved" (notification shows) but they don't appear in the timeline because they're not persisting properly.

## Quick Fix Test

### Step 1: Add Debug Component
In your `unified-project-details.tsx` file, add this import at the top:

```tsx
import { TimelineDebugWrapper } from './timeline-debug-wrapper'
```

### Step 2: Add Debug Section
In the timeline tab content, add this debug component temporarily:

```tsx
<TabsContent value="timeline" className="mt-0">
  <TimelineDebugWrapper 
    project={project} 
    projectTasks={projectTasks} 
  />
  <ProjectTimeline
    key={`timeline-${refreshKey}`}
    project={project}
    onUpdate={handleUpdate}
  />
</TabsContent>
```

### Step 3: Test
1. Go to any project's timeline tab
2. You should see a yellow debug box
3. Click "Add Test Event" - this will test the localStorage persistence
4. The event should appear immediately in the debug list
5. Refresh the page - the event should still be there

## Root Cause
The main timeline component has these issues:

1. **State Management**: Events are added to component state but get overwritten when the component recalculates system events
2. **No Persistence**: Events are only stored in memory, not saved anywhere permanent
3. **Effect Conflicts**: Multiple useEffect hooks are fighting over the events array

## Proper Fix (Manual)

If the debug test works, here's how to fix the main timeline component:

### 1. Replace State Management
Replace this pattern:
```tsx
const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])

// This overwrites custom events:
useEffect(() => {
  setTimelineEvents(generatedEvents) 
}, [generatedEvents])
```

With this pattern:
```tsx
import { useTimelineEvents } from './timeline-events-fix'

// In component:
const { events: timelineEvents, addEvent } = useTimelineEvents(project, projectTasks)
```

### 2. Update Add Handler
Replace the `handleAddEvent` function with:
```tsx
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

### 3. Remove Conflicting Effects
Remove these lines from the main component:
```tsx
// Remove this:
useEffect(() => {
  setTimelineEvents(timelineEventsGenerated)
}, [timelineEventsGenerated])
```

## Verification

After applying the fix:

1. **Add Event**: Should save and appear immediately
2. **Refresh Page**: Event should persist after page reload
3. **Switch Projects**: Each project should have its own events
4. **Browser Console**: Should show "Saved timeline event: [title]" messages

## Clean Up

Once the fix is working:
1. Remove the `TimelineDebugWrapper` import and usage
2. Remove the yellow debug box from the timeline tab
3. Keep the storage utility files for production use

## Files Created for Fix
- `lib/timeline-storage.ts` - localStorage utility
- `components/timeline-events-fix.tsx` - Fixed event management hook
- `components/timeline-debug-wrapper.tsx` - Debug component (temporary)

The localStorage approach is a temporary solution. In production, you'd want to save events to your database instead. 