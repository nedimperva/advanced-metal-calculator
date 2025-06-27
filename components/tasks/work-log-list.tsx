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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  Calendar as CalendarIcon,
  Clock,
  Users,
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
  BarChart3,
  CloudRain,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { format, isToday, isYesterday, startOfWeek, endOfWeek } from 'date-fns'
import { type DailyWorkLog, WorkType } from '@/lib/types'
import { 
  WORK_TYPE_LABELS,
  calculateWorkLogSummary,
  analyzeProjectVelocity,
  type WorkLogSummary
} from '@/lib/work-log-utils'

interface WorkLogListProps {
  workLogs: DailyWorkLog[]
  loading?: boolean
  onCreateWorkLog?: () => void
  onEditWorkLog?: (workLog: DailyWorkLog) => void
  onDeleteWorkLog?: (workLogId: string) => void
  className?: string
  showAnalytics?: boolean
}

interface WorkLogFilters {
  dateRange?: 'today' | 'yesterday' | 'thisWeek' | 'all'
  workType?: WorkType
  searchTerm?: string
}

export default function WorkLogList({
  workLogs,
  loading = false,
  onCreateWorkLog,
  onEditWorkLog,
  onDeleteWorkLog,
  className,
  showAnalytics = true
}: WorkLogListProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [filters, setFilters] = useState<WorkLogFilters>({ dateRange: 'all' })
  const [showFilters, setShowFilters] = useState(false)

  // Filter work logs
  const filteredWorkLogs = React.useMemo(() => {
    let filtered = [...workLogs]

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter(log => {
        const logDate = new Date(log.date)
        switch (filters.dateRange) {
          case 'today':
            return isToday(logDate)
          case 'yesterday':
            return isYesterday(logDate)
          case 'thisWeek':
            return logDate >= startOfWeek(now) && logDate <= endOfWeek(now)
          default:
            return true
        }
      })
    }

    // Work type filter
    if (filters.workType) {
      filtered = filtered.filter(log => 
        log.entries.some(entry => entry.workType === filters.workType)
      )
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(log => 
        log.notes?.toLowerCase().includes(searchLower) ||
        log.entries.some(entry => 
          entry.description.toLowerCase().includes(searchLower)
        )
      )
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [workLogs, filters])

  // Calculate summary
  const summary: WorkLogSummary = React.useMemo(() => {
    return calculateWorkLogSummary(filteredWorkLogs)
  }, [filteredWorkLogs])

  // Calculate velocity analysis
  const velocityAnalysis = React.useMemo(() => {
    return analyzeProjectVelocity(filteredWorkLogs)
  }, [filteredWorkLogs])

  const formatDateLabel = (date: string) => {
    const logDate = new Date(date)
    if (isToday(logDate)) return 'Today'
    if (isYesterday(logDate)) return 'Yesterday'
    return format(logDate, 'MMM d, yyyy')
  }

  const getWeatherIcon = (weather?: string) => {
    if (!weather) return null
    const weatherLower = weather.toLowerCase()
    if (weatherLower.includes('rain') || weatherLower.includes('storm')) {
      return <CloudRain className="h-4 w-4 text-blue-500" />
    }
    return <Sun className="h-4 w-4 text-yellow-500" />
  }

  const hasActiveFilters = filters.dateRange !== 'all' || filters.workType || filters.searchTerm

  return (
    <div className={cn("space-y-4", className)}>
      {/* Analytics Summary */}
      {showAnalytics && (
        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-2" : "grid-cols-4"
        )}>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {summary.totalManHours.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Hours Logged</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                ${summary.totalCost.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {summary.averageWorkersPerDay.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Workers</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(velocityAnalysis.currentVelocity * 7).toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Weekly Avg</div>
            </CardContent>
          </Card>
        </div>
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
              <Clock className="h-5 w-5" />
              Work Logs ({filteredWorkLogs.length})
            </CardTitle>
            
            {onCreateWorkLog && (
              <Button 
                onClick={onCreateWorkLog}
                className={cn(isMobile ? "w-full h-12" : "")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Work
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
                placeholder="Search work logs..."
                value={filters.searchTerm || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
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
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="border-muted">
              <CardContent className="p-4">
                <div className={cn(
                  "grid gap-4",
                  isMobile ? "grid-cols-1" : "grid-cols-3"
                )}>
                  {/* Date Range Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Select
                      value={filters.dateRange || "all"}
                      onValueChange={(value) => 
                        setFilters(prev => ({ 
                          ...prev, 
                          dateRange: value as WorkLogFilters['dateRange']
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="thisWeek">This Week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Work Type Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Work Type</label>
                    <Select
                      value={filters.workType || "all"}
                      onValueChange={(value) => 
                        setFilters(prev => ({ 
                          ...prev, 
                          workType: value === "all" ? undefined : value as WorkType 
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.values(WorkType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {WORK_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setFilters({ dateRange: 'all' })}
                      className="w-full"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Work Log List */}
      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading work logs...</p>
          </CardContent>
        </Card>
      ) : filteredWorkLogs.length === 0 ? (
        <Card>
          <CardContent className={cn(
            "text-center",
            isMobile ? "py-8 px-4" : "py-12"
          )}>
            <Clock className={cn(
              "mx-auto mb-4 opacity-30",
              isMobile ? "h-10 w-10" : "h-12 w-12"
            )} />
            <h3 className={cn(
              "font-semibold mb-2",
              isMobile ? "text-base" : "text-lg"
            )}>
              {hasActiveFilters ? 'No Work Logs Found' : 'No Work Logs'}
            </h3>
            <p className={cn(
              "text-muted-foreground mb-4",
              isMobile ? "text-sm" : "text-base"
            )}>
              {hasActiveFilters ? 
                'Try adjusting your filters.' : 
                'Start logging your daily work hours.'
              }
            </p>
            {!hasActiveFilters && onCreateWorkLog && (
              <Button 
                onClick={onCreateWorkLog}
                className={cn(isMobile ? "w-full h-12" : "")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Log Work
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          "space-y-3",
          isMobile && "space-y-2"
        )}>
          {filteredWorkLogs.map((workLog) => {
            const logSummary = calculateWorkLogSummary([workLog])
            
            return (
              <Card key={workLog.id} className="hover:bg-muted/30 transition-colors">
                <CardContent className={cn(
                  "p-4",
                  isMobile && "p-3"
                )}>
                  <div className={cn(
                    "flex gap-4",
                    isMobile ? "flex-col space-y-3" : "items-start"
                  )}>
                    {/* Date and Weather */}
                    <div className={cn(
                      "flex items-center gap-3",
                      isMobile ? "justify-between" : "flex-col text-center min-w-[120px]"
                    )}>
                      <div>
                        <div className={cn(
                          "font-semibold",
                          isMobile ? "text-base" : "text-lg"
                        )}>
                          {formatDateLabel(workLog.date)}
                        </div>
                        {!isMobile && (
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(workLog.date), 'EEE')}
                          </div>
                        )}
                      </div>
                      {workLog.weatherConditions && (
                        <div className="flex items-center gap-1">
                          {getWeatherIcon(workLog.weatherConditions)}
                          <span className="text-xs text-muted-foreground">
                            {workLog.weatherConditions}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Work Details */}
                    <div className="flex-1 min-w-0">
                      {/* Summary Stats */}
                      <div className={cn(
                        "flex flex-wrap gap-3 mb-3",
                        isMobile && "gap-2"
                      )}>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {logSummary.totalHours.toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {workLog.totalWorkers} worker{workLog.totalWorkers !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-green-600">
                            ${logSummary.totalCost.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Work Entries */}
                      <div className="space-y-2 mb-3">
                        {workLog.entries.map((entry, index) => (
                          <div key={entry.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {WORK_TYPE_LABELS[entry.workType]}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {entry.hours}h × {entry.workers} workers
                                </span>
                              </div>
                              <p className={cn(
                                "text-sm truncate",
                                isMobile && "break-words whitespace-normal"
                              )}>
                                {entry.description}
                              </p>
                            </div>
                            <div className="text-sm font-medium text-green-600 ml-2">
                              ${(entry.hours * entry.workers * entry.hourlyRate).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Notes */}
                      {workLog.notes && (
                        <div className="border-t pt-2">
                          <p className="text-sm text-muted-foreground">
                            <strong>Notes:</strong> {workLog.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className={cn(
                      "flex gap-2",
                      isMobile ? "w-full" : "flex-col"
                    )}>
                      {onEditWorkLog && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditWorkLog(workLog)}
                          className={cn(isMobile && "flex-1")}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {isMobile ? 'Edit' : ''}
                        </Button>
                      )}
                      
                      {onDeleteWorkLog && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => onDeleteWorkLog(workLog.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 