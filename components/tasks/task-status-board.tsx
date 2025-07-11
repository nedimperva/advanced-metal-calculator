"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  Plus,
  MoreVertical,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import TaskCard from './task-card'
import { type ProjectTask, TaskStatus, TaskType, TaskPriority } from '@/lib/types'
import { 
  TASK_STATUS_LABELS, 
  TASK_STATUS_COLORS,
  TASK_TYPE_LABELS,
  TASK_PRIORITY_LABELS 
} from '@/lib/task-utils'

interface TaskStatusBoardProps {
  tasks: ProjectTask[]
  loading?: boolean
  onCreateTask?: () => void
  onEditTask?: (task: ProjectTask) => void
  onDeleteTask?: (taskId: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onProgressUpdate?: (taskId: string, progress: number) => void
  className?: string
}

interface StatusColumn {
  status: TaskStatus
  label: string
  color: string
  icon: React.ElementType
  tasks: ProjectTask[]
  count: number
}

const StatusIcons = {
  [TaskStatus.NOT_STARTED]: Clock,
  [TaskStatus.IN_PROGRESS]: Play,
  [TaskStatus.BLOCKED]: XCircle,
  [TaskStatus.ON_HOLD]: Pause,
  [TaskStatus.COMPLETED]: CheckCircle2,
  [TaskStatus.CANCELLED]: XCircle
}

export default function TaskStatusBoard({
  tasks,
  loading = false,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onProgressUpdate,
  className
}: TaskStatusBoardProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [collapsedColumns, setCollapsedColumns] = useState<Set<TaskStatus>>(new Set())

  // Group tasks by status
  const statusColumns: StatusColumn[] = useMemo(() => {
    const groupedTasks = tasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = []
      }
      acc[task.status].push(task)
      return acc
    }, {} as Record<TaskStatus, ProjectTask[]>)

    return Object.values(TaskStatus).map(status => ({
      status,
      label: TASK_STATUS_LABELS[status],
      color: TASK_STATUS_COLORS[status],
      icon: StatusIcons[status],
      tasks: groupedTasks[status] || [],
      count: (groupedTasks[status] || []).length
    }))
  }, [tasks])

  const toggleColumnCollapse = (status: TaskStatus) => {
    const newCollapsed = new Set(collapsedColumns)
    if (newCollapsed.has(status)) {
      newCollapsed.delete(status)
    } else {
      newCollapsed.add(status)
    }
    setCollapsedColumns(newCollapsed)
  }

  const handleTaskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    onStatusChange?.(taskId, newStatus)
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isMobile) {
    // Mobile layout: Collapsible sections
    return (
      <div className={cn("space-y-4", className)}>
        {/* Progress Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Task Board</CardTitle>
              {onCreateTask && (
                <Button onClick={onCreateTask} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {completedTasks} of {totalTasks} tasks completed
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Columns */}
        {statusColumns.map((column) => {
          const isCollapsed = collapsedColumns.has(column.status)
          const Icon = column.icon

          return (
            <Card key={column.status} className="overflow-hidden">
              <CardHeader 
                className="pb-3 cursor-pointer"
                onClick={() => toggleColumnCollapse(column.status)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-5 w-5", column.color)} />
                    <div>
                      <CardTitle className="text-base">{column.label}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {column.count} task{column.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{column.count}</Badge>
                    {isCollapsed ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronUp className="h-4 w-4" />
                    }
                  </div>
                </div>
              </CardHeader>
              
              {!isCollapsed && (
                <CardContent className="pt-0">
                  {column.tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Icon className={cn("h-8 w-8 mx-auto mb-2 opacity-30", column.color)} />
                      <p className="text-sm text-muted-foreground">
                        No {column.label.toLowerCase()} tasks
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {column.tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          variant="compact"
                          onEdit={onEditTask}
                          onDelete={onDeleteTask}
                          onStatusChange={handleTaskStatusChange}
                          onProgressUpdate={onProgressUpdate}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    )
  }

  // Desktop layout: Horizontal Kanban board
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Task Board</CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalTasks} total tasks • {Math.round(progressPercentage)}% complete
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium">Progress</div>
                <Progress value={progressPercentage} className="w-24 h-2" />
              </div>
              {onCreateTask && (
                <Button onClick={onCreateTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-4">
        {statusColumns.map((column) => {
          const Icon = column.icon
          
          return (
            <Card key={column.status} className="flex flex-col h-[600px]">
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", column.color)} />
                    <CardTitle className="text-sm">{column.label}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {column.count}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto pt-0">
                {column.tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon className={cn("h-8 w-8 mx-auto mb-2 opacity-30", column.color)} />
                    <p className="text-xs text-muted-foreground">
                      No tasks
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {column.tasks.map((task) => (
                      <div key={task.id} className="group">
                        <Card className="hover:bg-muted/30 transition-colors cursor-pointer">
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              {/* Task Title */}
                              <h4 className="font-medium text-sm line-clamp-2">
                                {task.name}
                              </h4>
                              
                              {/* Task Meta */}
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {TASK_TYPE_LABELS[task.type]}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {TASK_PRIORITY_LABELS[task.priority]}
                                </Badge>
                              </div>
                              
                              {/* Progress */}
                              {task.progress > 0 && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span>Progress</span>
                                    <span>{task.progress}%</span>
                                  </div>
                                  <Progress value={task.progress} className="h-1" />
                                </div>
                              )}
                              
                              {/* Assigned To */}
                              {task.assignedTo && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {task.assignedTo}
                                </p>
                              )}
                              
                              {/* Actions */}
                              <div className="flex items-center justify-between pt-1">
                                <div className="text-xs text-muted-foreground">
                                  {task.estimatedHours}h
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {onEditTask && (
                                      <DropdownMenuItem onClick={() => onEditTask(task)}>
                                        Edit
                                      </DropdownMenuItem>
                                    )}
                                    
                                    {/* Status Change Options */}
                                    {Object.values(TaskStatus)
                                      .filter(status => status !== task.status)
                                      .map(status => (
                                        <DropdownMenuItem 
                                          key={status}
                                          onClick={() => handleTaskStatusChange(task.id, status)}
                                        >
                                          Move to {TASK_STATUS_LABELS[status]}
                                        </DropdownMenuItem>
                                      ))
                                    }
                                    
                                    {onDeleteTask && (
                                      <DropdownMenuItem 
                                        onClick={() => onDeleteTask(task.id)}
                                        className="text-destructive"
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 