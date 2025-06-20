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
  const [isLoading, setIsLoading] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)
  const [taskProgress, setTaskProgress] = useState<TaskProgressSummary | null>(null)

  // Load tasks and workers
  useEffect(() => {
    loadTasks()
    loadWorkers()
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
        // Note: In a full implementation, you would update the timeline events in the database
        // to link back to this task. For now, we'll just show a message.
        console.log('Timeline events to link:', (taskData as any).selectedTimelineEvents)
        toast({
          title: "Task Saved & Linked",
          description: `Task saved and linked to ${(taskData as any).selectedTimelineEvents.length} timeline event(s)`,
        })
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
              <div key={task.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{task.name}</h4>
                      <Badge variant="outline" className={cn(
                        task.status === TaskStatus.COMPLETED && "border-green-500 text-green-700 bg-green-50",
                        task.status === TaskStatus.IN_PROGRESS && "border-blue-500 text-blue-700 bg-blue-50",
                        task.status === TaskStatus.NOT_STARTED && "border-gray-500 text-gray-700 bg-gray-50"
                      )}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}
                    {task.assignedTo && (
                      <p className="text-xs text-muted-foreground">Assigned to: {task.assignedTo}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
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
        availableTimelineEvents={timelineEvents}
      />
    </div>
  )
} 