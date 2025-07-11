"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ListTodo,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { toast } from '@/hooks/use-toast'
import { useProjects } from '@/contexts/project-context'

// Import task components
import TaskList from './task-list'
import TaskForm from './task-form'
import TaskCard from './task-card'

import { 
  type Project, 
  type ProjectTask, 
  type Worker,
  TaskStatus,
  ProjectStatus,
  MaterialStatus
} from '@/lib/types'
import { PROJECT_STATUS_LABELS } from '@/lib/project-utils'
import { 
  calculateTaskProgress,
  type TaskProgressSummary
} from '@/lib/task-utils'
import { 
  getAllWorkers,
  getProjectTasks,
  updateTask,
  createTask,
  deleteTask
} from '@/lib/database'

interface ProjectTaskManagementProps {
  project: Project
  onUpdate?: () => void
  availableTimelineEvents?: any[] // Will be properly typed when passed from parent
  className?: string
}

export default function ProjectTaskManagement({ 
  project, 
  availableTimelineEvents = [] 
}: ProjectTaskManagementProps) {
  const { updateProject } = useProjects()
  const isMobile = useMediaQuery("(max-width: 767px)")
  
  // State management
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [timelineEvents, setTimelineEvents] = useState<any[]>([])
  const [realTimelineEvents, setRealTimelineEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)
  const [taskProgress, setTaskProgress] = useState<TaskProgressSummary | null>(null)

  // Load tasks, workers, and timeline events
  useEffect(() => {
    loadTasks()
    loadWorkers()
    loadRealTimelineEvents()

    // Listen for timeline updates
    const handleTimelineUpdate = (event: CustomEvent) => {
      if (event.detail?.projectId === project.id) {
        console.log('Timeline updated, reloading timeline events in task management')
        loadRealTimelineEvents()
      }
    }

    window.addEventListener('timeline-update', handleTimelineUpdate as EventListener)
    
    return () => {
      window.removeEventListener('timeline-update', handleTimelineUpdate as EventListener)
    }
  }, [project.id])

  // Calculate task progress when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      const progress = calculateTaskProgress(tasks)
      setTaskProgress(progress)
    }
  }, [tasks])

  // Generate timeline events from project data (simplified version from timeline component)
  useEffect(() => {
    const generateTimelineEvents = () => {
      const events: any[] = []

      // Project creation event
      events.push({
        id: `project-created-${project.id}`,
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
          type: 'status_change',
          title: `Status Changed to ${PROJECT_STATUS_LABELS[project.status]}`,
          description: `Project status updated to ${PROJECT_STATUS_LABELS[project.status]}`,
          timestamp: new Date(project.updatedAt).toISOString(),
          author: 'System'
        })
      }

      // Task completion events
      tasks.forEach((task) => {
        if (task.status === 'completed' && task.actualEnd) {
          events.push({
            id: `task-completed-${task.id}`,
            type: 'milestone',
            title: `Task Completed: ${task.name}`,
            description: `Task "${task.name}" was marked as completed`,
            timestamp: new Date(task.actualEnd).toISOString(),
            author: task.assignedTo || 'Team Member',
            linkedTaskIds: [task.id],
            status: 'completed'
          })
        }
      })

      // Sort events by timestamp (newest first)
      return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }

    setTimelineEvents(generateTimelineEvents())
  }, [project, tasks])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const projectTasks = await getProjectTasks(project.id)
      setTasks(projectTasks)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      toast({
        title: "Load Failed",
        description: "Failed to load project tasks",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadWorkers = async () => {
    try {
      const allWorkers = await getAllWorkers()
      const activeWorkers = allWorkers.filter(w => w.isActive)
      console.log('Loaded workers:', activeWorkers.length) // Debug log
      setWorkers(activeWorkers)
    } catch (error) {
      console.error('Failed to load workers:', error)
      toast({
        title: "Load Failed",
        description: "Failed to load workers",
        variant: "destructive"
      })
    }
  }

  const loadRealTimelineEvents = async () => {
    try {
      const { getTimelineEvents } = await import('@/lib/timeline-storage')
      const events = getTimelineEvents(project.id)
      console.log('Loaded real timeline events:', events.length, events) // Debug log
      setRealTimelineEvents(events)
    } catch (error) {
      console.error('Failed to load timeline events:', error)
    }
  }

  const handleSaveTask = async (taskData: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'> | ProjectTask) => {
    try {
      if ('id' in taskData) {
        // Update existing task
        await updateTask(taskData as ProjectTask)
      } else {
        // Create new task - returns the new task ID
        await createTask(taskData)
      }
      
      // Handle timeline event linking if selectedTimelineEvents was provided
      if ((taskData as any).selectedTimelineEvents && (taskData as any).selectedTimelineEvents.length > 0) {
        try {
          const { updateTimelineEvent } = await import('@/lib/timeline-storage')
          const selectedEvents = (taskData as any).selectedTimelineEvents as string[]
          
          // Get the task ID (either existing or newly created)
          const taskId = 'id' in taskData ? taskData.id : `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          
          // Update each selected timeline event to link to this task
          for (const eventId of selectedEvents) {
            const event = realTimelineEvents.find(e => e.id === eventId)
            if (event) {
              const existingLinks = event.linkedTaskIds || []
              if (!existingLinks.includes(taskId)) {
                await updateTimelineEvent(eventId, {
                  linkedTaskIds: [...existingLinks, taskId]
                })
              }
            }
          }
          
          console.log('Timeline events linked:', selectedEvents, 'to task:', taskId)
          toast({
            title: "Task Saved & Linked",
            description: `Task saved and linked to ${selectedEvents.length} timeline event(s)`,
          })
        } catch (error) {
          console.error('Failed to link timeline events:', error)
          toast({
            title: "Task Saved",
            description: "Task saved but timeline linking failed",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Task Saved",
          description: "Task has been saved successfully",
        })
      }
      
      await loadTasks()
      setShowTaskForm(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Failed to save task:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save task",
        variant: "destructive"
      })
    }
  }

  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await deleteTask(taskId)
      await loadTasks()
      
      toast({
        title: "Task Deleted",
        description: "Task has been deleted successfully",
      })
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete task",
        variant: "destructive"
      })
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) {
        throw new Error('Task not found')
      }

      const updatedTask = {
        ...task,
        status,
        progress: status === TaskStatus.COMPLETED ? 100 : 
                 status === TaskStatus.NOT_STARTED ? 0 : 
                 task.progress,
        actualStart: status === TaskStatus.IN_PROGRESS && !task.actualStart ? new Date() : task.actualStart,
        actualEnd: status === TaskStatus.COMPLETED ? new Date() : undefined,
        updatedAt: new Date()
      }

      await updateTask(updatedTask)
      await loadTasks()
      
      toast({
        title: "Task Updated",
        description: `Task status changed to ${status.replace('_', ' ')}`,
      })
    } catch (error) {
      console.error('Failed to update task status:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update task status",
        variant: "destructive"
      })
    }
  }

  return (
    <div className={cn("space-y-4 md:space-y-6")}>
      {/* Header */}
      <div className={cn(
        "flex gap-4",
        isMobile ? "flex-col" : "items-center justify-between"
      )}>
        <h2 className={cn(
          "font-bold",
          isMobile ? "text-xl" : "text-2xl"
        )}>
          Task Management
        </h2>
        <Button 
          onClick={() => {
            setEditingTask(null)
            setShowTaskForm(true)
          }}
          className={cn(isMobile ? "w-full h-12" : "")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Task Statistics */}
      {taskProgress && (
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-2" : "grid-cols-4"
        )}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className={cn(
                "flex items-center gap-2",
                isMobile ? "text-sm" : "text-base"
              )}>
                <ListTodo className="h-4 w-4" />
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "font-bold",
                isMobile ? "text-xl" : "text-2xl"
              )}>
                {taskProgress.totalTasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className={cn(
                "flex items-center gap-2",
                isMobile ? "text-sm" : "text-base"
              )}>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "font-bold text-green-600",
                isMobile ? "text-xl" : "text-2xl"
              )}>
                {taskProgress.completedTasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className={cn(
                "flex items-center gap-2",
                isMobile ? "text-sm" : "text-base"
              )}>
                <Clock className="h-4 w-4 text-blue-600" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "font-bold text-blue-600",
                isMobile ? "text-xl" : "text-2xl"
              )}>
                {taskProgress.inProgressTasks}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className={cn(
                "flex items-center gap-2",
                isMobile ? "text-sm" : "text-base"
              )}>
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "font-bold text-purple-600",
                isMobile ? "text-xl" : "text-2xl"
              )}>
                {taskProgress.completionPercentage.toFixed(0)}%
              </div>
              <Progress value={taskProgress.completionPercentage} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Simple Task List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading tasks...</p>
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <h3 className="font-semibold mb-2">No Tasks</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first task for this project.
            </p>
            <Button 
              onClick={() => {
                setEditingTask(null)
                setShowTaskForm(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Tasks ({tasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                projectId={project.id}
                variant="default"
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Task Form Modal */}
      <TaskForm
        task={editingTask}
        projectId={project.id}
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        availableTasks={tasks}
        availableWorkers={workers}
        availableTimelineEvents={realTimelineEvents}
      />
    </div>
  )
} 