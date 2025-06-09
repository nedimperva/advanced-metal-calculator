import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Weight, 
  FolderOpen,
  Plus,
  Settings,
  Download,
  Clock,
  Target,
  DollarSign,
  Activity
} from 'lucide-react'
import { Project, Calculation, ProjectSummary } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProjectDashboardProps {
  projects: Project[]
  activeProject: Project | null
  calculations: Calculation[]
  onCreateProject: () => void
  onManageProjects: () => void
  onSetActiveProject: (projectId: string | null) => void
  getProjectCalculations: (projectId: string) => Calculation[]
  onLoadCalculation: (calculation: Calculation) => void
  onUpdateCalculation: (calculationId: string, data: Calculation) => Promise<boolean>
  onDeleteCalculation: (calculationId: string) => Promise<boolean>
  className?: string
  isLoading?: boolean
}

interface ProjectStats {
  project: Project
  calculations: Calculation[]
  totalWeight: number
  recentActivity: Date | null
  topMaterial: string
  topProfile: string
  progressPercentage: number
}

const PROJECT_STATUS_COLORS = {
  active: '#10b981',
  completed: '#3b82f6', 
  archived: '#6b7280',
  'on-hold': '#f59e0b'
}

export function ProjectDashboard({
  projects,
  activeProject,
  calculations,
  onCreateProject,
  onManageProjects,
  onSetActiveProject,
  getProjectCalculations,
  onLoadCalculation,
  onUpdateCalculation,
  onDeleteCalculation,
  className,
  isLoading
}: ProjectDashboardProps) {
  const projectStats = useMemo(() => {
    return projects.map(project => {
      const projectCalculations = calculations.filter(calc => calc.projectId === project.id)
      const totalWeight = projectCalculations.reduce((sum, calc) => sum + ((calc.weight || 0) * (calc.quantity || 1)), 0)
      
      // Find most used material and profile
      const materialCounts: Record<string, number> = {}
      const profileCounts: Record<string, number> = {}
      
      projectCalculations.forEach(calc => {
        const materialKey = `${calc.material}-${calc.grade}`
        materialCounts[materialKey] = (materialCounts[materialKey] || 0) + 1
        profileCounts[calc.profileType] = (profileCounts[calc.profileType] || 0) + 1
      })
      
      const topMaterial = Object.keys(materialCounts).reduce((a, b) => 
        materialCounts[a] > materialCounts[b] ? a : b, Object.keys(materialCounts)[0] || 'None'
      )
      
      const topProfile = Object.keys(profileCounts).reduce((a, b) => 
        profileCounts[a] > profileCounts[b] ? a : b, Object.keys(profileCounts)[0] || 'None'
      )
      
      // Calculate progress (arbitrary logic - could be based on target calculations)
      const targetCalculations = 20 // This could be a project setting
      const progressPercentage = Math.min((projectCalculations.length / targetCalculations) * 100, 100)
      
      const recentActivity = projectCalculations.length > 0 
        ? new Date(Math.max(...projectCalculations.map(calc => calc.timestamp.getTime())))
        : null

      return {
        project,
        calculations: projectCalculations,
        totalWeight,
        recentActivity,
        topMaterial,
        topProfile,
        progressPercentage
      } as ProjectStats
    })
  }, [projects, calculations])

  const summary = useMemo(() => {
    const totalCalculations = calculations.length
    const totalWeight = calculations.reduce((sum, calc) => sum + ((calc.weight || 0) * (calc.quantity || 1)), 0)
    const activeProjects = projects.filter(p => p.status === 'active').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    
    return {
      totalProjects: projects.length,
      activeProjects,
      completedProjects,
      totalCalculations,
      totalWeight
    }
  }, [projects, calculations])

  const recentProjects = useMemo(() => {
    return projectStats
      .filter(stat => stat.recentActivity)
      .sort((a, b) => (b.recentActivity?.getTime() || 0) - (a.recentActivity?.getTime() || 0))
      .slice(0, 3)
  }, [projectStats])

  const topProjects = useMemo(() => {
    return projectStats
      .sort((a, b) => b.calculations.length - a.calculations.length)
      .slice(0, 3)
  }, [projectStats])

  if (projects.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card className="backdrop-blur-sm bg-card/90 border-primary/10">
          <CardContent className="text-center py-12">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-40" />
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first project to start organizing your metal calculations. 
              Projects help you group related work and track progress.
            </p>
            <Button onClick={onCreateProject} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Projects</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{summary.totalProjects}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Projects</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{summary.activeProjects}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200/50 dark:border-purple-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Calculations</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{summary.totalCalculations}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border-orange-200/50 dark:border-orange-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Weight</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {summary.totalWeight.toFixed(1)} kg
                </p>
              </div>
              <Weight className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Project Spotlight */}
      {activeProject && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Active Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeProject.color }}
                  />
                  <h3 className="text-lg font-semibold">{activeProject.name}</h3>
                  <Badge variant="secondary">{activeProject.status}</Badge>
                </div>
                {activeProject.client && (
                  <p className="text-sm text-muted-foreground mb-1">Client: {activeProject.client}</p>
                )}
                {activeProject.description && (
                  <p className="text-sm text-muted-foreground mb-3">{activeProject.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{activeProject.calculationCount || 0} calculations</span>
                  <span>•</span>
                  <span>Created {activeProject.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <Button variant="outline" onClick={onManageProjects} className="mb-2">
                  <Settings className="h-3 w-3 mr-1" />
                  Manage
                </Button>
                <Button variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity & Top Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((stat) => (
                  <div
                    key={stat.project.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => onSetActiveProject(stat.project.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stat.project.color }}
                      />
                      <div>
                        <p className="font-medium text-sm">{stat.project.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {stat.recentActivity?.toLocaleDateString()} - {stat.calculations.length} calculations
                        </p>
                      </div>
                    </div>
                    {activeProject?.id === stat.project.id && (
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Projects by Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No projects with calculations</p>
            ) : (
              <div className="space-y-4">
                {topProjects.map((stat, index) => (
                  <div key={stat.project.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: stat.project.color }}
                        />
                        <span className="font-medium text-sm">{stat.project.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{stat.calculations.length}</p>
                        <p className="text-xs text-muted-foreground">calculations</p>
                      </div>
                    </div>
                    <Progress value={stat.progressPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{stat.totalWeight.toFixed(1)} kg</span>
                      <span>{stat.progressPercentage.toFixed(0)}% progress</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={onCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
            <Button variant="outline" onClick={onManageProjects}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Projects
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All Data
            </Button>
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 