"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ListTodo,
  Kanban,
  Clock,
  BarChart3,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useTask } from '@/contexts/task-context'
import { toast } from '@/hooks/use-toast'

// Import task components
import TaskList from './task-list'
import TaskCard from './task-card'
import TaskForm from './task-form'
import TaskStatusBoard from './task-status-board'
import WorkLogForm from './work-log-form'
import WorkLogList from './work-log-list'

import { type Project, type ProjectTask, type DailyWorkLog, TaskStatus } from '@/lib/types'
import { calculateTaskProgress, type TaskProgressSummary } from '@/lib/task-utils'
import { calculateWorkLogSummary } from '@/lib/work-log-utils'

interface ProjectTaskManagementProps {
  project: Project
  onUpdate?: () => void
  className?: string
}

export default function ProjectTaskManagement({
  project,
  onUpdate,
  className
}: ProjectTaskManagementProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [activeTab, setActiveTab] = useState('tasks')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showWorkLogForm, setShowWorkLogForm] = useState(false)
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)
  const [editingWorkLog, setEditingWorkLog] = useState<DailyWorkLog | null>(null)

  // Use task context
  const {
    tasks,
    loading,
    error,
    filteredTasks,
    taskProgress,
    searchTerm,
    filters,
    sortField,
    sortDirection,
    createNewTask,
    updateExistingTask,
    deleteExistingTask,
    updateTaskStatus,
    updateTaskProgress,
    getProjectTaskList,
    setSearchTerm,
    setFilters,
    setSorting,
    clearFilters,
    canDeleteTask
  } = useTask()

  // Load project tasks when component mounts or project changes
  useEffect(() => {
    if (project.id) {
      getProjectTaskList(project.id)
    }
  }, [project.id, getProjectTaskList])

  // Mock work logs (in real implementation, this would come from a work log context)
  const [workLogs, setWorkLogs] = useState<DailyWorkLog[]>([])

  // Calculate task and work log progress
  const calculatedTaskProgress = React.useMemo(() => {
    return calculateTaskProgress(filteredTasks)
  }, [filteredTasks])

  const workLogSummary = React.useMemo(() => {
    return calculateWorkLogSummary(workLogs)
  }, [workLogs])

  // Handle task operations
  const handleCreateTask = async () => {
    setEditingTask(null)
    setShowTaskForm(true)
  }

  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleSaveTask = async (taskData: Omit<ProjectTask, 'id' | 'createdAt' | 'updatedAt'> | ProjectTask) => {
    try {
      if ('id' in taskData) {
        // Editing existing task
        await updateExistingTask(taskData)
      } else {
        // Creating new task
        await createNewTask({
          ...taskData,
          projectId: project.id
        })
      }
      onUpdate?.()
    } catch (error) {
      console.error('Failed to save task:', error)
      throw error
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    
    if (!canDeleteTask(taskId)) {
      toast({
        title: "Cannot Delete Task",
        description: "This task has dependencies that must be removed first.",
        variant: "destructive"
      })
      return
    }

    if (window.confirm(`Are you sure you want to delete "${task?.name || 'this task'}"?`)) {
      try {
        await deleteExistingTask(taskId)
        onUpdate?.()
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus(taskId, status)
      onUpdate?.()
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const handleProgressUpdate = async (taskId: string, progress: number) => {
    try {
      await updateTaskProgress(taskId, progress)
      onUpdate?.()
    } catch (error) {
      console.error('Failed to update task progress:', error)
    }
  }

  // Handle work log operations
  const handleCreateWorkLog = () => {
    setEditingWorkLog(null)
    setShowWorkLogForm(true)
  }

  const handleEditWorkLog = (workLog: DailyWorkLog) => {
    setEditingWorkLog(workLog)
    setShowWorkLogForm(true)
  }

  const handleSaveWorkLog = async (workLogData: Omit<DailyWorkLog, 'id' | 'createdAt' | 'updatedAt'> | DailyWorkLog) => {
    try {
      // In real implementation, this would use a work log context
      console.log('Saving work log:', workLogData)
      
      toast({
        title: "Work Log Saved",
        description: "Work log has been saved successfully.",
      })
      
      onUpdate?.()
    } catch (error) {
      console.error('Failed to save work log:', error)
      throw error
    }
  }

  const handleDeleteWorkLog = async (workLogId: string) => {
    try {
      // In real implementation, this would use a work log context
      setWorkLogs(prev => prev.filter(log => log.id !== workLogId))
      
      toast({
        title: "Work Log Deleted",
        description: "Work log has been deleted.",
      })
      
      onUpdate?.()
    } catch (error) {
      console.error('Failed to delete work log:', error)
    }
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <h3 className="font-semibold text-destructive mb-2">Error Loading Tasks</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Project Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={cn(
            "flex items-center gap-2",
            isMobile ? "text-lg" : "text-xl"
          )}>
            <BarChart3 className="h-5 w-5" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            {/* Overall Progress */}
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(calculatedTaskProgress.completionPercentage)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall</div>
              <Progress 
                value={calculatedTaskProgress.completionPercentage} 
                className="mt-2 h-2" 
              />
            </div>

            {/* Completed Tasks */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {calculatedTaskProgress.completedTasks}
              </div>
              <div className="text-sm text-muted-foreground">
                of {calculatedTaskProgress.totalTasks} Tasks
              </div>
            </div>

            {/* Time Progress */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {workLogSummary.totalManHours.toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Hours Logged</div>
            </div>

            {/* Cost */}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ${workLogSummary.totalCost.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={cn(
            "flex flex-wrap gap-2 mt-4 pt-4 border-t",
            isMobile && "justify-center"
          )}>
            <Badge variant="outline" className="flex items-center gap-1">
              <ListTodo className="h-3 w-3" />
              {calculatedTaskProgress.inProgressTasks} In Progress
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {calculatedTaskProgress.blockedTasks} Blocked
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {workLogSummary.averageWorkersPerDay.toFixed(1)} Avg Workers
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {workLogSummary.productivity.toFixed(1)}h/day
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="pb-3">
            <TabsList className={cn(
              "grid w-full",
              isMobile ? "grid-cols-2" : "grid-cols-4"
            )}>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                {!isMobile && "Tasks"}
              </TabsTrigger>
              <TabsTrigger value="board" className="flex items-center gap-2">
                <Kanban className="h-4 w-4" />
                {!isMobile && "Board"}
              </TabsTrigger>
              <TabsTrigger value="worklogs" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {!isMobile && "Work Logs"}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {!isMobile && "Analytics"}
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Task List View */}
            <TabsContent value="tasks" className="mt-0">
              <TaskList
                tasks={filteredTasks}
                loading={loading}
                searchTerm={searchTerm}
                filters={filters}
                sortField={sortField}
                sortDirection={sortDirection}
                taskProgress={taskProgress}
                onSearchChange={setSearchTerm}
                onFiltersChange={setFilters}
                onSortChange={setSorting}
                onClearFilters={clearFilters}
                onCreateTask={handleCreateTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onStatusChange={handleStatusChange}
                onProgressUpdate={handleProgressUpdate}
                showProgress={false} // Already shown in overview
                variant={isMobile ? 'compact' : 'default'}
              />
            </TabsContent>

            {/* Kanban Board View */}
            <TabsContent value="board" className="mt-0">
              <TaskStatusBoard
                tasks={filteredTasks}
                loading={loading}
                onCreateTask={handleCreateTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onStatusChange={handleStatusChange}
                onProgressUpdate={handleProgressUpdate}
              />
            </TabsContent>

            {/* Work Logs View */}
            <TabsContent value="worklogs" className="mt-0">
              <WorkLogList
                workLogs={workLogs}
                loading={loading}
                onCreateWorkLog={handleCreateWorkLog}
                onEditWorkLog={handleEditWorkLog}
                onDeleteWorkLog={handleDeleteWorkLog}
                showAnalytics={false} // Already shown in overview
              />
            </TabsContent>

            {/* Analytics View */}
            <TabsContent value="analytics" className="mt-0">
              <div className="space-y-6">
                {/* Task Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Task Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      "grid gap-4",
                      isMobile ? "grid-cols-1" : "grid-cols-3"
                    )}>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {calculatedTaskProgress.weightedProgress.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Weighted Progress</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          {calculatedTaskProgress.completionPercentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-orange-600">
                          {calculatedTaskProgress.blockedTasks}
                        </div>
                        <div className="text-sm text-muted-foreground">Blocked Tasks</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Time Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Time Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      "grid gap-4",
                      isMobile ? "grid-cols-1" : "grid-cols-3"
                    )}>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {workLogSummary.dailyAverages.hours.toFixed(1)}h
                        </div>
                        <div className="text-sm text-muted-foreground">Daily Average</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-indigo-600">
                          {(workLogSummary.dailyAverages.hours * 7).toFixed(1)}h
                        </div>
                        <div className="text-sm text-muted-foreground">Weekly Average</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-xl font-bold text-cyan-600">
                          ${workLogSummary.dailyAverages.cost.toFixed(0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Daily Cost</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

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
      />

      {/* Work Log Form Modal */}
      <WorkLogForm
        workLog={editingWorkLog}
        projectId={project.id}
        isOpen={showWorkLogForm}
        onClose={() => {
          setShowWorkLogForm(false)
          setEditingWorkLog(null)
        }}
        onSave={handleSaveWorkLog}
      />
    </div>
  )
} 