"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  Calendar,
  Clock,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Timer
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { ProjectTask } from '@/lib/types'
import { TaskStatus, TaskType, TaskPriority } from '@/lib/types'
import { 
  TASK_STATUS_LABELS, 
  TASK_STATUS_COLORS, 
  TASK_TYPE_LABELS, 
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS
} from '@/lib/task-utils'

interface TaskCardProps {
  task: ProjectTask
  variant?: 'default' | 'compact' | 'detailed'
  showProject?: boolean
  onEdit?: (task: ProjectTask) => void
  onDelete?: (taskId: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onProgressUpdate?: (taskId: string, progress: number) => void
  className?: string
}

const StatusIcon = ({ status }: { status: TaskStatus }) => {
  const iconProps = { className: "h-4 w-4" }
  
  switch (status) {
    case TaskStatus.NOT_STARTED:
      return <Clock {...iconProps} className="h-4 w-4 text-gray-500" />
    case TaskStatus.IN_PROGRESS:
      return <Play {...iconProps} className="h-4 w-4 text-blue-500" />
    case TaskStatus.BLOCKED:
      return <XCircle {...iconProps} className="h-4 w-4 text-red-500" />
    case TaskStatus.ON_HOLD:
      return <Pause {...iconProps} className="h-4 w-4 text-yellow-500" />
    case TaskStatus.COMPLETED:
      return <CheckCircle2 {...iconProps} className="h-4 w-4 text-green-500" />
    case TaskStatus.CANCELLED:
      return <XCircle {...iconProps} className="h-4 w-4 text-gray-500" />
    default:
      return <AlertCircle {...iconProps} className="h-4 w-4 text-gray-500" />
  }
}

export default function TaskCard({
  task,
  variant = 'default',
  showProject = false,
  onEdit,
  onDelete,
  onStatusChange,
  onProgressUpdate,
  className
}: TaskCardProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusChange?.(task.id, newStatus)
  }

  const handleProgressUpdate = (newProgress: number) => {
    onProgressUpdate?.(task.id, newProgress)
  }

  const isOverdue = task.scheduledEnd && new Date(task.scheduledEnd) < new Date() && task.status !== TaskStatus.COMPLETED

  // Quick status actions
  const getQuickActions = () => {
    const actions = []
    
    switch (task.status) {
      case TaskStatus.NOT_STARTED:
        actions.push({
          label: 'Start Task',
          status: TaskStatus.IN_PROGRESS,
          icon: Play
        })
        break
      case TaskStatus.IN_PROGRESS:
        actions.push(
          {
            label: 'Complete',
            status: TaskStatus.COMPLETED,
            icon: CheckCircle2
          },
          {
            label: 'Pause',
            status: TaskStatus.ON_HOLD,
            icon: Pause
          }
        )
        break
      case TaskStatus.ON_HOLD:
        actions.push({
          label: 'Resume',
          status: TaskStatus.IN_PROGRESS,
          icon: Play
        })
        break
      case TaskStatus.BLOCKED:
        actions.push({
          label: 'Unblock',
          status: TaskStatus.IN_PROGRESS,
          icon: Play
        })
        break
    }
    
    return actions
  }

  const quickActions = getQuickActions()

  if (variant === 'compact') {
    return (
      <Card className={cn(
        "hover:bg-muted/30 transition-colors cursor-pointer",
        isOverdue && "border-destructive/50 bg-destructive/5",
        className
      )}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <StatusIcon status={task.status} />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{task.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {TASK_TYPE_LABELS[task.type]}
                  </Badge>
                  <Badge className={cn("text-xs", TASK_PRIORITY_COLORS[task.priority])}>
                    {TASK_PRIORITY_LABELS[task.priority]}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                {task.progress}%
              </div>
              {quickActions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatusChange(quickActions[0].status)}
                  className="h-8 w-8 p-0"
                >
                  {React.createElement(quickActions[0].icon, { className: "h-4 w-4" })}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "hover:bg-muted/30 transition-colors",
      isOverdue && "border-destructive/50 bg-destructive/5",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <StatusIcon status={task.status} />
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold leading-tight",
                isMobile ? "text-base break-words" : "text-lg"
              )}>
                {task.name}
              </h3>
              
              {task.description && (
                <p className={cn(
                  "text-muted-foreground mt-1",
                  isMobile ? "text-sm break-words" : "text-base",
                  !isExpanded && "line-clamp-2"
                )}>
                  {task.description}
                </p>
              )}
              
              {task.description && task.description.length > 100 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-0 h-auto text-xs text-primary mt-1"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
              )}
              
              {quickActions.map((action) => (
                <DropdownMenuItem 
                  key={action.label}
                  onClick={() => handleStatusChange(action.status)}
                >
                  {React.createElement(action.icon, { className: "h-4 w-4 mr-2" })}
                  {action.label}
                </DropdownMenuItem>
              ))}
              
              {quickActions.length > 0 && <DropdownMenuSeparator />}
              
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Status and Priority Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={cn("text-xs", TASK_STATUS_COLORS[task.status])}>
            {TASK_STATUS_LABELS[task.status]}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {TASK_TYPE_LABELS[task.type]}
          </Badge>
          <Badge className={cn("text-xs", TASK_PRIORITY_COLORS[task.priority])}>
            {TASK_PRIORITY_LABELS[task.priority]}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              Overdue
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        {task.status !== TaskStatus.NOT_STARTED && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {task.progress}%
              </span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>
        )}

        {/* Task Details */}
        <div className={cn(
          "grid gap-3",
          isMobile ? "grid-cols-1" : "grid-cols-2"
        )}>
          {/* Estimated Hours */}
          <div className="flex items-center gap-2 text-sm">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Est:</span>
            <span>{task.estimatedHours}h</span>
            {task.actualHours && (
              <span className="text-muted-foreground">
                (Actual: {task.actualHours}h)
              </span>
            )}
          </div>

          {/* Assigned To */}
          {task.assignedTo && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Assigned:</span>
              <span className="truncate">{task.assignedTo}</span>
            </div>
          )}

          {/* Scheduled Dates */}
          {(task.scheduledStart || task.scheduledEnd) && (
            <div className="flex items-center gap-2 text-sm col-span-full">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Scheduled:</span>
              <span>
                {task.scheduledStart && new Date(task.scheduledStart).toLocaleDateString()}
                {task.scheduledStart && task.scheduledEnd && ' - '}
                {task.scheduledEnd && new Date(task.scheduledEnd).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Dependencies */}
        {task.dependencies && task.dependencies.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Depends on {task.dependencies.length} task{task.dependencies.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Blocked By */}
        {task.blockedBy && task.blockedBy.length > 0 && (
          <div>
            <p className="text-sm text-destructive">
              Blocking {task.blockedBy.length} task{task.blockedBy.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <div>
            <p className="text-sm text-muted-foreground">
              <strong>Notes:</strong> {task.notes}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        {quickActions.length > 0 && !isMobile && (
          <div className="flex gap-2 pt-2 border-t">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(action.status)}
                className="flex-1"
              >
                {React.createElement(action.icon, { className: "h-4 w-4 mr-2" })}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 