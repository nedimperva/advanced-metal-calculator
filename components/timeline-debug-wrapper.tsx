import React from 'react'
import { TimelineEventsDebug } from './timeline-events-fix'
import type { Project, ProjectTask } from '@/lib/types'

interface TimelineDebugWrapperProps {
  project: Project
  projectTasks?: ProjectTask[]
}

export function TimelineDebugWrapper({ project, projectTasks }: TimelineDebugWrapperProps) {
  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
      <div className="text-sm text-yellow-800 mb-2">
        🐛 <strong>Debug Mode:</strong> Testing timeline events persistence
      </div>
      <TimelineEventsDebug project={project} projectTasks={projectTasks} />
    </div>
  )
} 