"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Calendar as CalendarIcon,
  Users,
  Wrench,
  Clock,
  DollarSign,
  TrendingUp,
  BarChart3,
  Activity,
  ArrowRight,
  FileText,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns'
import { 
  type Worker,
  type Machinery,
  type DailyJournalTimesheet,
  type JournalWorkerEntry,
  type JournalMachineryEntry,
  type Project
} from '@/lib/types'
import {
  getAllWorkers,
  getAllMachinery,
  getDailyJournalTimesheetByDate
} from '@/lib/database'
import { toast } from '@/hooks/use-toast'

interface WorkforceManagementProps {
  project: Project
  onUpdate?: () => void
  className?: string
}

interface ProjectWorkforceData {
  date: Date
  workers: JournalWorkerEntry[]
  machinery: JournalMachineryEntry[]
  totalLaborHours: number
  totalMachineryHours: number
  totalCost: number
}

export default function WorkforceManagement({
  project,
  onUpdate,
  className
}: WorkforceManagementProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  
  // State for data
  const [workers, setWorkers] = useState<Worker[]>([])
  const [machinery, setMachinery] = useState<Machinery[]>([])
  const [journalData, setJournalData] = useState<ProjectWorkforceData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  // Load data
  useEffect(() => {
    loadData()
  }, [project.id, selectedMonth])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load workers and machinery
      const [workersData, machineryData] = await Promise.all([
        getAllWorkers().catch(() => []),
        getAllMachinery().catch(() => [])
      ])
      
      setWorkers(workersData.filter(w => w.isActive))
      setMachinery(machineryData.filter(m => m.isActive))

      // Load journal data for the selected month
      await loadJournalData()
    } catch (error) {
      console.error('Failed to load workforce data:', error)
      toast({
        title: "Load Failed",
        description: "Failed to load workforce data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadJournalData = async () => {
    const monthStart = startOfMonth(selectedMonth)
    const monthEnd = endOfMonth(selectedMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
    
    const journalEntries: ProjectWorkforceData[] = []
    
    for (const day of daysInMonth) {
      try {
        const timesheet = await getDailyJournalTimesheetByDate(day)
        if (timesheet) {
          // Filter entries for this project
          const projectWorkers = timesheet.workerEntries.filter(entry =>
            entry.projectHours.some(ph => ph.projectId === project.id)
          ).map(entry => ({
            ...entry,
            projectHours: entry.projectHours.filter(ph => ph.projectId === project.id),
            totalHours: entry.projectHours
              .filter(ph => ph.projectId === project.id)
              .reduce((sum, ph) => sum + ph.hours, 0),
            totalCost: entry.projectHours
              .filter(ph => ph.projectId === project.id)
              .reduce((sum, ph) => sum + ph.cost, 0)
          })).filter(entry => entry.totalHours > 0)

          const projectMachinery = timesheet.machineryEntries.filter(entry =>
            entry.projectHours.some(ph => ph.projectId === project.id)
          ).map(entry => ({
            ...entry,
            projectHours: entry.projectHours.filter(ph => ph.projectId === project.id),
            totalHours: entry.projectHours
              .filter(ph => ph.projectId === project.id)
              .reduce((sum, ph) => sum + ph.hours, 0),
            totalCost: entry.projectHours
              .filter(ph => ph.projectId === project.id)
              .reduce((sum, ph) => sum + ph.cost, 0)
          })).filter(entry => entry.totalHours > 0)

          if (projectWorkers.length > 0 || projectMachinery.length > 0) {
            const totalLaborHours = projectWorkers.reduce((sum, entry) => sum + entry.totalHours, 0)
            const totalMachineryHours = projectMachinery.reduce((sum, entry) => sum + entry.totalHours, 0)
            const totalCost = projectWorkers.reduce((sum, entry) => sum + entry.totalCost, 0) +
                             projectMachinery.reduce((sum, entry) => sum + entry.totalCost, 0)

            journalEntries.push({
              date: day,
              workers: projectWorkers,
              machinery: projectMachinery,
              totalLaborHours,
              totalMachineryHours,
              totalCost
            })
          }
        }
      } catch (error) {
        // Skip days with errors
        continue
      }
    }
    
    setJournalData(journalEntries.sort((a, b) => b.date.getTime() - a.date.getTime()))
  }

  // Calculate summary statistics
  const monthlyStats = useMemo(() => {
    const totalLaborHours = journalData.reduce((sum, day) => sum + day.totalLaborHours, 0)
    const totalMachineryHours = journalData.reduce((sum, day) => sum + day.totalMachineryHours, 0)
    const totalCost = journalData.reduce((sum, day) => sum + day.totalCost, 0)
    const daysWorked = journalData.length
    const avgDailyCost = daysWorked > 0 ? totalCost / daysWorked : 0
    
    // Get unique workers and machinery used
    const uniqueWorkers = new Set<string>()
    const uniqueMachinery = new Set<string>()
    
    journalData.forEach(day => {
      day.workers.forEach(worker => uniqueWorkers.add(worker.workerId))
      day.machinery.forEach(machine => uniqueMachinery.add(machine.machineryId))
    })

    return {
      totalLaborHours,
      totalMachineryHours,
      totalCost,
      daysWorked,
      avgDailyCost,
      uniqueWorkers: uniqueWorkers.size,
      uniqueMachinery: uniqueMachinery.size
    }
  }, [journalData])

  const navigateToJournal = () => {
    // Create URL to navigate to Workforce tab with journal sub-tab
    const url = new URL(window.location.href)
    url.searchParams.set('tab', 'workforce')
    url.searchParams.set('workforce-view', 'journal')
    window.history.pushState({}, '', url.toString())
    
    // Trigger navigation by dispatching a custom event that the main app can listen to
    window.dispatchEvent(new CustomEvent('navigate-to-workforce-journal'))
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Workforce Data</h2>
          <p className="text-muted-foreground">
            Data from Daily Journal entries for {project.name}
          </p>
        </div>
        <Button onClick={navigateToJournal}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Daily Journal
        </Button>
      </div>

      {/* Month Selector and Summary Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Summary
            </CardTitle>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedMonth, "MMMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedMonth(date)
                      setShowCalendar(false)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"
          )}>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {monthlyStats.totalLaborHours.toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Labor Hours</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {monthlyStats.totalMachineryHours.toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Machine Hours</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${monthlyStats.totalCost.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Cost</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {monthlyStats.daysWorked}
              </div>
              <div className="text-sm text-muted-foreground">Work Days</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-3"
          )}>
            <div className="text-center">
              <div className="text-lg font-semibold">{monthlyStats.uniqueWorkers}</div>
              <div className="text-sm text-muted-foreground">Unique Workers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{monthlyStats.uniqueMachinery}</div>
              <div className="text-sm text-muted-foreground">Unique Machinery</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">${monthlyStats.avgDailyCost.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Avg Daily Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Daily Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {journalData.length > 0 ? (
            <div className="space-y-3">
              {journalData.slice(0, 10).map((dayData) => (
                <Card key={dayData.date.toISOString()} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4">
                    <div className={cn(
                      "flex gap-4",
                      isMobile ? "flex-col" : "items-center"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <CalendarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {format(dayData.date, 'MMM d, yyyy')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {dayData.workers.length} workers • {dayData.machinery.length} machinery
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className={cn(
                          "grid gap-3",
                          isMobile ? "grid-cols-1" : "grid-cols-3"
                        )}>
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-sm font-semibold text-blue-600">
                              {dayData.totalLaborHours.toFixed(1)}h
                            </div>
                            <div className="text-xs text-muted-foreground">Labor</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded">
                            <div className="text-sm font-semibold text-orange-600">
                              {dayData.totalMachineryHours.toFixed(1)}h
                            </div>
                            <div className="text-xs text-muted-foreground">Machinery</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-sm font-semibold text-green-600">
                              ${dayData.totalCost.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">Cost</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Worker Details */}
                    {dayData.workers.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Workers ({dayData.workers.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dayData.workers.map((worker) => (
                            <Badge key={worker.workerId} variant="secondary" className="text-xs">
                              {worker.workerName} ({worker.totalHours}h)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Machinery Details */}
                    {dayData.machinery.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Machinery ({dayData.machinery.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dayData.machinery.map((machine) => (
                            <Badge key={machine.machineryId} variant="outline" className="text-xs">
                              {machine.machineryName} ({machine.totalHours}h)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {journalData.length > 10 && (
                <div className="text-center py-4">
                  <Button variant="outline" onClick={navigateToJournal}>
                    View All Entries in Daily Journal
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold mb-2">No Workforce Data</h3>
                <p className="text-muted-foreground mb-4">
                  No Daily Journal entries found for this project in {format(selectedMonth, "MMMM yyyy")}.
                </p>
                <Button onClick={navigateToJournal}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Go to Daily Journal
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>


    </div>
  )
}