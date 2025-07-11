"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Filter, 
  Plus,
  SortAsc,
  SortDesc,
  MoreVertical,
  Calendar,
  Clock,
  Users,
  CheckSquare,
  ListTodo,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import TaskCard from './task-card'
import { type ProjectTask, TaskStatus, TaskType, TaskPriority } from '@/lib/types'
import { 
  TASK_STATUS_LABELS, 
  TASK_TYPE_LABELS, 
  TASK_PRIORITY_LABELS,
  type TaskFilters,
  type TaskSortField,
  type SortDirection,
  type TaskProgressSummary
} from '@/lib/task-utils'

interface TaskListProps {
  tasks: ProjectTask[]
  loading?: boolean
  searchTerm: string
  filters: TaskFilters
  sortField: TaskSortField
  sortDirection: SortDirection
  taskProgress: TaskProgressSummary
  projectId?: string // Add project ID for linked events
  onSearchChange: (term: string) => void
  onFiltersChange: (filters: Partial<TaskFilters>) => void
  onSortChange: (field: TaskSortField, direction?: SortDirection) => void
  onClearFilters: () => void
  onCreateTask?: () => void
  onEditTask?: (task: ProjectTask) => void
  onDeleteTask?: (taskId: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  onProgressUpdate?: (taskId: string, progress: number) => void
  className?: string
  showProgress?: boolean
  variant?: 'default' | 'compact'
}

export default function TaskList({
  tasks,
  loading = false,
  searchTerm,
  filters,
  sortField,
  sortDirection,
  taskProgress,
  projectId,
  onSearchChange,
  onFiltersChange,
  onSortChange,
  onClearFilters,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onProgressUpdate,
  className,
  showProgress = true,
  variant = 'default'
}: TaskListProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof TaskFilters]
    return Array.isArray(value) ? value.length > 0 : value !== undefined
  })

  const handleSortClick = (field: TaskSortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
    onSortChange(field, newDirection)
  }

  const getSortIcon = (field: TaskSortField) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? 
      <SortAsc className="h-4 w-4 ml-1" /> : 
      <SortDesc className="h-4 w-4 ml-1" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Summary */}
      {showProgress && (
        <Card>
          <CardContent className="p-4">
            <div className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-2" : "grid-cols-4"
            )}>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {taskProgress.totalTasks}
                </div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {taskProgress.completedTasks}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {taskProgress.inProgressTasks}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(taskProgress.completionPercentage)}%
                </div>
                <div className="text-sm text-muted-foreground">Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header and Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className={cn(
            "flex gap-4",
            isMobile ? "flex-col" : "items-center justify-between"
          )}>
            <CardTitle className={cn(
              "flex items-center gap-2",
              isMobile ? "text-lg" : "text-xl"
            )}>
              <ListTodo className="h-5 w-5" />
              Tasks ({tasks.length})
            </CardTitle>
            
            {onCreateTask && (
              <Button 
                onClick={onCreateTask}
                className={cn(isMobile ? "w-full h-12" : "")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filter Controls */}
          <div className={cn(
            "flex gap-3",
            isMobile ? "flex-col" : "items-center"
          )}>
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className={cn(
                  "pl-10",
                  isMobile && "text-base h-12"
                )}
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size={isMobile ? "default" : "sm"}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                hasActiveFilters && "bg-primary/10 border-primary",
                isMobile && "w-full h-12"
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 text-xs">
                  Active
                </Badge>
              )}
            </Button>

            {/* Sort Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size={isMobile ? "default" : "sm"}
                  className={cn(isMobile && "w-full h-12")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Sort by {sortField}
                  {getSortIcon(sortField)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSortClick('name')}>
                  Name {getSortIcon('name')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortClick('priority')}>
                  Priority {getSortIcon('priority')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortClick('status')}>
                  Status {getSortIcon('status')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortClick('scheduledEnd')}>
                  Due Date {getSortIcon('scheduledEnd')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortClick('progress')}>
                  Progress {getSortIcon('progress')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="border-muted">
              <CardContent className="p-4">
                <div className={cn(
                  "grid gap-4",
                  isMobile ? "grid-cols-1" : "grid-cols-4"
                )}>
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select
                      value={filters.status || "all"}
                      onValueChange={(value) => 
                        onFiltersChange({ 
                          status: value === "all" ? undefined : value as TaskStatus 
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {Object.values(TaskStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {TASK_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select
                      value={filters.type || "all"}
                      onValueChange={(value) => 
                        onFiltersChange({ 
                          type: value === "all" ? undefined : value as TaskType 
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.values(TaskType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {TASK_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <Select
                      value={filters.priority || "all"}
                      onValueChange={(value) => 
                        onFiltersChange({ 
                          priority: value === "all" ? undefined : value as TaskPriority 
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        {Object.values(TaskPriority).map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {TASK_PRIORITY_LABELS[priority]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assigned To Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Assigned To</label>
                    <Input
                      placeholder="Worker name..."
                      value={filters.assignedTo || ''}
                      onChange={(e) => 
                        onFiltersChange({ 
                          assignedTo: e.target.value || undefined 
                        })
                      }
                      className={cn(isMobile && "text-base")}
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="flex justify-end mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onClearFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Task List */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </CardContent>
        </Card>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className={cn(
            "text-center",
            isMobile ? "py-8 px-4" : "py-12"
          )}>
            <CheckSquare className={cn(
              "mx-auto mb-4 opacity-30",
              isMobile ? "h-10 w-10" : "h-12 w-12"
            )} />
            <h3 className={cn(
              "font-semibold mb-2",
              isMobile ? "text-base" : "text-lg"
            )}>
              {searchTerm || hasActiveFilters ? 'No Tasks Found' : 'No Tasks'}
            </h3>
            <p className={cn(
              "text-muted-foreground mb-4",
              isMobile ? "text-sm" : "text-base"
            )}>
              {searchTerm || hasActiveFilters ? 
                'Try adjusting your search or filters.' : 
                'Create your first task to get started.'
              }
            </p>
            {!searchTerm && !hasActiveFilters && onCreateTask && (
              <Button 
                onClick={onCreateTask}
                className={cn(isMobile ? "w-full h-12" : "")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "space-y-3",
          isMobile && "space-y-2"
        )}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              variant={variant}
              projectId={projectId}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
              onProgressUpdate={onProgressUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
} 