"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Plus,
  User,
  Settings,
  Calendar as CalendarIcon,
  Users,
  Wrench,
  Clock,
  DollarSign,
  Copy,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { format } from 'date-fns'
import { 
  type Worker,
  type Machinery,
  type ProjectAssignment,
  type DailyTimesheet,
  type DailyWorkerEntry,
  type DailyMachineryEntry,
  type Project,
  WorkerSkill,
  MachineryType
} from '@/lib/types'
import {
  createWorker,
  updateWorker,
  getAllWorkers,
  getActiveWorkers,
  deleteWorker,
  createMachinery,
  updateMachinery,
  getAllMachinery,
  getActiveMachinery,
  deleteMachinery,
  createProjectAssignment,
  getActiveProjectAssignments,
  createDailyTimesheet,
  updateDailyTimesheet,
  getProjectTimesheets,
  getTimesheetByDate,
  generateWorkerEntryId,
  generateMachineryEntryId,
  checkDatabaseStores,
  forceDbUpgrade
} from '@/lib/database'
import {
  WORKER_SKILL_LABELS,
  MACHINERY_TYPE_LABELS,
  validateWorker,
  validateMachinery,
  createTimesheetTemplate
} from '@/lib/workforce-utils'
import { toast } from '@/hooks/use-toast'
import WorkerForm from './workforce/worker-form'
import MachineryForm from './workforce/machinery-form'

interface WorkforceManagementProps {
  project: Project
  onUpdate?: () => void
  className?: string
}



export default function WorkforceManagement({
  project,
  onUpdate,
  className
}: WorkforceManagementProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [activeTab, setActiveTab] = useState('timesheet')
  
  // State for data
  const [workers, setWorkers] = useState<Worker[]>([])
  const [machinery, setMachinery] = useState<Machinery[]>([])
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([])
  const [timesheets, setTimesheets] = useState<DailyTimesheet[]>([])
  const [loading, setLoading] = useState(false)
  
  // Modal states
  const [showWorkerForm, setShowWorkerForm] = useState(false)
  const [showMachineryForm, setShowMachineryForm] = useState(false)
  const [showTimesheetForm, setShowTimesheetForm] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
  const [editingMachinery, setEditingMachinery] = useState<Machinery | null>(null)
  const [editingTimesheet, setEditingTimesheet] = useState<DailyTimesheet | null>(null)
  
  // Timesheet form state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  // Load data
  useEffect(() => {
    loadData()
  }, [project.id])

  const loadData = async () => {
    setLoading(true)
    try {
      // Check if database stores exist first
      const storesExist = await checkDatabaseStores()
      if (!storesExist) {
        console.log('Database stores missing, forcing upgrade and retry...')
        await forceDbUpgrade()
        // Wait a moment for the database to be recreated
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Retry loading data after upgrade
        console.log('Retrying data load after database upgrade...')
      }

      // Try to load data, with fallback to empty arrays on error
      const [workersData, machineryData, assignmentsData, timesheetsData] = await Promise.all([
        getActiveWorkers().catch(() => []),
        getActiveMachinery().catch(() => []),
        getActiveProjectAssignments(project.id).catch(() => []),
        getProjectTimesheets(project.id).catch(() => [])
      ])
      
      setWorkers(workersData)
      setMachinery(machineryData)
      setAssignments(assignmentsData)
      setTimesheets(timesheetsData)
      
      if (workersData.length === 0 && machineryData.length === 0 && timesheetsData.length === 0) {
        toast({
          title: "Workforce System Ready",
          description: "Database has been upgraded. You can now add workers and machinery.",
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Failed to load workforce data:', error)
      
      // If it's a store not found error, try to upgrade the database
      if (error instanceof Error && error.message.includes('object stores was not found')) {
        console.log('Store not found error detected, forcing database upgrade...')
        try {
          await forceDbUpgrade()
          toast({
            title: "Database Upgraded",
            description: "Database has been upgraded. Please refresh the page to continue.",
            variant: "default"
          })
        } catch (upgradeError) {
          console.error('Database upgrade failed:', upgradeError)
          toast({
            title: "Upgrade Failed",
            description: "Failed to upgrade database. Please refresh the page and try again.",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Load Failed",
          description: "Failed to load workforce data",
          variant: "destructive"
        })
      }
      
      // Set empty arrays as fallback
      setWorkers([])
      setMachinery([])
      setAssignments([])
      setTimesheets([])
    } finally {
      setLoading(false)
    }
  }

  // Get assigned workers and machinery for the project
  const assignedWorkers = useMemo(() => {
    return workers.filter(worker => 
      assignments.some(assignment => assignment.workerId === worker.id && assignment.isActive)
    )
  }, [workers, assignments])

  const assignedMachinery = useMemo(() => {
    return machinery.filter(machine => 
      assignments.some(assignment => assignment.machineryId === machine.id && assignment.isActive)
    )
  }, [machinery, assignments])

  // Handle worker operations
  const handleCreateWorker = () => {
    setEditingWorker(null)
    setShowWorkerForm(true)
  }

  const handleEditWorker = (worker: Worker) => {
    setEditingWorker(worker)
    setShowWorkerForm(true)
  }

  // Handle machinery operations
  const handleCreateMachinery = () => {
    setEditingMachinery(null)
    setShowMachineryForm(true)
  }

  const handleEditMachinery = (machine: Machinery) => {
    setEditingMachinery(machine)
    setShowMachineryForm(true)
  }

  // Handle timesheet operations
  const handleCreateTimesheet = async (date?: Date) => {
    const targetDate = date || selectedDate
    
    // Check if timesheet already exists for this date
    const existingTimesheet = await getTimesheetByDate(project.id, targetDate)
    if (existingTimesheet) {
      setEditingTimesheet(existingTimesheet)
    } else {
      setEditingTimesheet(null)
      setSelectedDate(targetDate)
    }
    setShowTimesheetForm(true)
  }

  const handleEditTimesheet = (timesheet: DailyTimesheet) => {
    setEditingTimesheet(timesheet)
    setSelectedDate(new Date(timesheet.date))
    setShowTimesheetForm(true)
  }

  const handleDuplicateTimesheet = async (sourceTimesheet: DailyTimesheet) => {
    // Create a new timesheet based on the source but for selected date
    const newTimesheet = createTimesheetTemplate(sourceTimesheet, selectedDate, project.id)

    try {
      await createDailyTimesheet(newTimesheet)
      await loadData()
      toast({
        title: "Timesheet Duplicated",
        description: `Timesheet duplicated for ${format(selectedDate, 'MMM d, yyyy')}`
      })
    } catch (error) {
      console.error('Failed to duplicate timesheet:', error)
      toast({
        title: "Duplication Failed",
        description: "Failed to duplicate timesheet",
        variant: "destructive"
      })
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-bold">Workforce & Machinery Management</h2>
      
      <Tabs defaultValue="timesheet">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timesheet">Daily Journal</TabsTrigger>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="machinery">Machinery</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timesheet">
          <div className="space-y-4">
            {/* Date Selector and Quick Stats */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Daily Timesheet Journal
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selectedDate, "MMM d, yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date)
                              setShowCalendar(false)
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button onClick={() => handleCreateTimesheet()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Entry
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{assignedWorkers.length}</div>
                    <div className="text-sm text-muted-foreground">Assigned Workers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{assignedMachinery.length}</div>
                    <div className="text-sm text-muted-foreground">Assigned Machinery</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{timesheets.length}</div>
                    <div className="text-sm text-muted-foreground">Total Timesheets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {timesheets.reduce((total, ts) => total + ts.totalLaborHours, 0).toFixed(1)}h
                    </div>
                    <div className="text-sm text-muted-foreground">Total Hours</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Timesheets */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Timesheets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timesheets.slice(0, 5).map((timesheet) => (
                    <Card key={timesheet.id} className="hover:bg-muted/30 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <CalendarIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {format(new Date(timesheet.date), 'MMM d, yyyy')}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {timesheet.workerEntries.length} workers • {timesheet.machineryEntries.length} machinery
                              </div>
                              <div className="text-sm text-green-600 font-medium">
                                ${(timesheet.totalLaborCost + timesheet.totalMachineryCost).toFixed(2)} total cost
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicateTimesheet(timesheet)}
                              title="Duplicate for selected date"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTimesheet(timesheet)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {timesheets.length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="p-8 text-center">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <h3 className="text-lg font-semibold mb-2">No Timesheets Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start tracking daily work hours by creating your first timesheet entry
                        </p>
                        <Button onClick={() => handleCreateTimesheet()}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Entry
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="workers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Workers Database
                </CardTitle>
                <Button onClick={handleCreateWorker}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Worker
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workers.map((worker) => (
                  <Card key={worker.id} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{worker.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ${worker.hourlyRate}/hour
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {worker.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {WORKER_SKILL_LABELS[skill]}
                                </Badge>
                              ))}
                              {worker.skills.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{worker.skills.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditWorker(worker)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {workers.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-semibold mb-2">No Workers Added</h3>
                      <p className="text-muted-foreground mb-4">
                        Add workers to your database to track their time and assignments
                      </p>
                      <Button onClick={handleCreateWorker}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Worker
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="machinery">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Machinery Database
                </CardTitle>
                <Button onClick={handleCreateMachinery}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Machinery
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {machinery.map((machine) => (
                  <Card key={machine.id} className="hover:bg-muted/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Wrench className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium">{machine.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {MACHINERY_TYPE_LABELS[machine.type]} • ${machine.hourlyRate}/hour
                            </div>
                            {machine.model && (
                              <div className="text-xs text-muted-foreground">
                                Model: {machine.model}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditMachinery(machine)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {machinery.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <Wrench className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <h3 className="text-lg font-semibold mb-2">No Machinery Added</h3>
                      <p className="text-muted-foreground mb-4">
                        Add machinery and equipment to track usage and costs
                      </p>
                      <Button onClick={handleCreateMachinery}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Machinery
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Project Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Assignment management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Modals */}
      <WorkerForm
        worker={editingWorker}
        isOpen={showWorkerForm}
        onClose={() => {
          setShowWorkerForm(false)
          setEditingWorker(null)
        }}
        onSave={loadData}
      />

      <MachineryForm
        machinery={editingMachinery}
        isOpen={showMachineryForm}
        onClose={() => {
          setShowMachineryForm(false)
          setEditingMachinery(null)
        }}
        onSave={loadData}
      />
    </div>
  )
} 