"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
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
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Clock,
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Copy,
  Save,
  Users,
  Wrench,
  FileText,
  Calculator
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useMediaQuery } from '@/hooks/use-media-query'
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
  getDailyJournalTimesheetByDate,
  saveDailyJournalTimesheet,
  duplicateDailyJournalTimesheet,
  calculateJournalTimesheetTotals
} from '@/lib/database'
import { useProjects } from '@/contexts/project-context'
import { toast } from '@/hooks/use-toast'

interface ProjectTimesheetEntry {
  projectId: string
  hours: number
}

interface TimesheetEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (entry: JournalWorkerEntry | JournalMachineryEntry) => void
  workers: Worker[]
  machinery: Machinery[]
  projects: Project[]
  entry?: JournalWorkerEntry | JournalMachineryEntry
  type: 'worker' | 'machinery'
}

function TimesheetEntryDialog({
  isOpen,
  onClose,
  onSave,
  workers,
  machinery,
  projects,
  entry,
  type
}: TimesheetEntryDialogProps) {
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const [projectEntries, setProjectEntries] = useState<ProjectTimesheetEntry[]>([
    { projectId: '', hours: 0 }
  ])

  useEffect(() => {
    if (entry) {
      if (type === 'worker') {
        const workerEntry = entry as JournalWorkerEntry
        setSelectedResourceId(workerEntry.workerId)
        setProjectEntries(workerEntry.projectHours.map((ph) => ({
          projectId: ph.projectId,
          hours: ph.hours
        })))
      } else {
        const machineryEntry = entry as JournalMachineryEntry
        setSelectedResourceId(machineryEntry.machineryId)
        setProjectEntries(machineryEntry.projectHours.map((ph) => ({
          projectId: ph.projectId,
          hours: ph.hours
        })))
      }
    } else {
      setSelectedResourceId('')
      setProjectEntries([{ projectId: '', hours: 0 }])
    }
  }, [entry, type, isOpen])

  const handleAddProjectEntry = () => {
    setProjectEntries(prev => [...prev, { projectId: '', hours: 0 }])
  }

  const handleUpdateProjectEntry = (index: number, field: 'projectId' | 'hours', value: string | number) => {
    setProjectEntries(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ))
  }

  const handleRemoveProjectEntry = (index: number) => {
    if (projectEntries.length > 1) {
      setProjectEntries(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSave = () => {
    if (!selectedResourceId) {
      toast({
        title: "Error",
        description: `Please select a ${type}`,
        variant: "destructive"
      })
      return
    }

    const validEntries = projectEntries.filter(entry => 
      entry.projectId && entry.hours > 0
    )

    if (validEntries.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one project with hours",
        variant: "destructive"
      })
      return
    }

    const totalHours = validEntries.reduce((sum, entry) => sum + entry.hours, 0)
    const resource = type === 'worker' 
      ? workers.find(w => w.id === selectedResourceId)
      : machinery.find(m => m.id === selectedResourceId)

    if (!resource) return

    const newEntry = type === 'worker' ? {
      workerId: selectedResourceId,
      workerName: (resource as Worker).name,
      hourlyRate: resource.hourlyRate,
      totalHours,
      totalCost: totalHours * resource.hourlyRate,
      projectHours: validEntries.map(entry => ({
        projectId: entry.projectId,
        hours: entry.hours,
        cost: entry.hours * resource.hourlyRate
      }))
    } as JournalWorkerEntry : {
      machineryId: selectedResourceId,
      machineryName: (resource as Machinery).name,
      hourlyRate: resource.hourlyRate,
      totalHours,
      totalCost: totalHours * resource.hourlyRate,
      projectHours: validEntries.map(entry => ({
        projectId: entry.projectId,
        hours: entry.hours,
        cost: entry.hours * resource.hourlyRate
      }))
    } as JournalMachineryEntry

    onSave(newEntry)
  }

  const totalHours = projectEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {entry ? 'Edit' : 'Add'} {type === 'worker' ? 'Worker' : 'Machinery'} Entry
          </DialogTitle>
          <DialogDescription>
            Assign time to one or more projects for this {type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="resource">
              Select {type === 'worker' ? 'Worker' : 'Machinery'}
            </Label>
            <Select value={selectedResourceId} onValueChange={setSelectedResourceId}>
              <SelectTrigger>
                <SelectValue placeholder={`Choose ${type}...`} />
              </SelectTrigger>
              <SelectContent>
                {(type === 'worker' ? workers : machinery)
                  .filter(resource => resource.isActive)
                  .map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name} (${resource.hourlyRate}/hr)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Project Assignments</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddProjectEntry}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            {projectEntries.map((entry, index) => (
              <div key={index} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label className="text-xs">Project</Label>
                  <Select 
                    value={entry.projectId} 
                    onValueChange={(value) => handleUpdateProjectEntry(index, 'projectId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24">
                  <Label className="text-xs">Hours</Label>
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={entry.hours || ''}
                    onChange={(e) => handleUpdateProjectEntry(index, 'hours', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                {projectEntries.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveProjectEntry(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}

            <div className="text-sm text-muted-foreground">
              Total Hours: <span className="font-medium">{totalHours.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className={cn(
          "gap-2",
          "sm:flex-row flex-col"
        )}>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="w-full sm:w-auto"
          >
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function DailyJournal() {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const { projects } = useProjects()
  
  // State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentTimesheet, setCurrentTimesheet] = useState<DailyJournalTimesheet | null>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [machinery, setMachinery] = useState<Machinery[]>([])
  const [loading, setLoading] = useState(false)
  
  // Modal states
  const [showEntryDialog, setShowEntryDialog] = useState(false)
  const [entryType, setEntryType] = useState<'worker' | 'machinery'>('worker')
  const [editingEntry, setEditingEntry] = useState<JournalWorkerEntry | JournalMachineryEntry | null>(null)

  useEffect(() => {
    loadResources()
  }, [])

  useEffect(() => {
    loadTimesheet()
  }, [selectedDate])

  const loadResources = async () => {
    try {
      const [workersData, machineryData] = await Promise.all([
        getAllWorkers(),
        getAllMachinery()
      ])
      setWorkers(workersData.filter(w => w.isActive))
      setMachinery(machineryData.filter(m => m.isActive))
    } catch (error) {
      console.error('Failed to load resources:', error)
    }
  }

  const loadTimesheet = async () => {
    setLoading(true)
    try {
      const timesheet = await getDailyJournalTimesheetByDate(selectedDate)
      setCurrentTimesheet(timesheet)
    } catch (error) {
      console.error('Failed to load timesheet:', error)
      setCurrentTimesheet(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEntry = (type: 'worker' | 'machinery') => {
    setEntryType(type)
    setEditingEntry(null)
    setShowEntryDialog(true)
  }

  const handleEditEntry = (entry: JournalWorkerEntry | JournalMachineryEntry, type: 'worker' | 'machinery') => {
    setEntryType(type)
    setEditingEntry(entry)
    setShowEntryDialog(true)
  }

  const handleSaveEntry = async (entry: JournalWorkerEntry | JournalMachineryEntry) => {
    try {
      const updatedTimesheet: DailyJournalTimesheet = currentTimesheet || {
        id: `journal-${format(selectedDate, 'yyyy-MM-dd')}`,
        date: selectedDate,
        workerEntries: [],
        machineryEntries: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (entryType === 'worker') {
        const workerEntry = entry as JournalWorkerEntry
        if (editingEntry) {
          // Update existing entry
          updatedTimesheet.workerEntries = updatedTimesheet.workerEntries.map(e =>
            e.workerId === workerEntry.workerId ? workerEntry : e
          )
        } else {
          // Add new entry
          updatedTimesheet.workerEntries = [
            ...updatedTimesheet.workerEntries.filter(e => e.workerId !== workerEntry.workerId),
            workerEntry
          ]
        }
      } else {
        const machineryEntry = entry as JournalMachineryEntry
        if (editingEntry) {
          // Update existing entry
          updatedTimesheet.machineryEntries = updatedTimesheet.machineryEntries.map(e =>
            e.machineryId === machineryEntry.machineryId ? machineryEntry : e
          )
        } else {
          // Add new entry
          updatedTimesheet.machineryEntries = [
            ...updatedTimesheet.machineryEntries.filter(e => e.machineryId !== machineryEntry.machineryId),
            machineryEntry
          ]
        }
      }

      // Recalculate totals
      const totals = calculateJournalTimesheetTotals(updatedTimesheet)
      updatedTimesheet.totalLaborHours = totals.totalLaborHours
      updatedTimesheet.totalMachineryHours = totals.totalMachineryHours
      updatedTimesheet.totalLaborCost = totals.totalLaborCost
      updatedTimesheet.totalMachineryCost = totals.totalMachineryCost
      updatedTimesheet.totalCost = totals.totalCost
      updatedTimesheet.updatedAt = new Date()

      await saveDailyJournalTimesheet(updatedTimesheet)
      setCurrentTimesheet(updatedTimesheet)
      setShowEntryDialog(false)
      setEditingEntry(null)

      toast({
        title: "Entry Saved",
        description: `${entryType === 'worker' ? 'Worker' : 'Machinery'} entry has been saved.`
      })
    } catch (error) {
      console.error('Failed to save entry:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save timesheet entry.",
        variant: "destructive"
      })
    }
  }

  const handleDuplicateTimesheet = async (sourceDate: Date) => {
    try {
      await duplicateDailyJournalTimesheet(sourceDate, selectedDate)
      await loadTimesheet()
      toast({
        title: "Timesheet Duplicated",
        description: `Timesheet from ${format(sourceDate, 'MMM d, yyyy')} has been copied.`
      })
    } catch (error) {
      console.error('Failed to duplicate timesheet:', error)
      toast({
        title: "Duplicate Failed",
        description: "Failed to duplicate timesheet.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between",
        isMobile && "flex-col space-y-4"
      )}>
        <div className={cn(isMobile && "text-center")}>
          <h1 className={cn("font-bold", isMobile ? "text-2xl" : "text-3xl")}>Daily Journal</h1>
          <p className={cn("text-muted-foreground", isMobile ? "text-sm" : "")}>
            Track daily work hours across multiple projects
          </p>
        </div>
        
        <div className={cn("flex gap-2", isMobile && "w-full")}>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                className={cn(isMobile && "w-full")}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {isMobile ? format(selectedDate, 'MMM d') : format(selectedDate, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={isMobile ? "center" : "end"}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Date and Summary */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-2" : "grid-cols-1 md:grid-cols-4"
      )}>
        <Card>
          <CardContent className={cn("p-4", isMobile && "p-3")}>
            <div className="flex items-center">
              <Clock className={cn("text-blue-600", isMobile ? "h-5 w-5" : "h-6 w-6")} />
              <div className="ml-3">
                <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                  Labor Hours
                </p>
                <p className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}>
                  {currentTimesheet?.totalLaborHours?.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn("p-4", isMobile && "p-3")}>
            <div className="flex items-center">
              <Wrench className={cn("text-orange-600", isMobile ? "h-5 w-5" : "h-6 w-6")} />
              <div className="ml-3">
                <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                  Machine Hours
                </p>
                <p className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}>
                  {currentTimesheet?.totalMachineryHours?.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn("p-4", isMobile && "p-3")}>
            <div className="flex items-center">
              <Calculator className={cn("text-green-600", isMobile ? "h-5 w-5" : "h-6 w-6")} />
              <div className="ml-3">
                <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                  Total Cost
                </p>
                <p className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}>
                  ${currentTimesheet?.totalCost?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className={cn("p-4", isMobile && "p-3")}>
            <div className="flex items-center">
              <FileText className={cn("text-purple-600", isMobile ? "h-5 w-5" : "h-6 w-6")} />
              <div className="ml-3">
                <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                  Entries
                </p>
                <p className={cn("font-bold", isMobile ? "text-lg" : "text-xl")}>
                  {(currentTimesheet?.workerEntries?.length || 0) + (currentTimesheet?.machineryEntries?.length || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Worker Entries */}
      <Card>
        <CardHeader className={cn(isMobile && "pb-3")}>
          <div className={cn(
            "flex items-center justify-between",
            isMobile && "flex-col space-y-3"
          )}>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Worker Entries
            </CardTitle>
            <Button 
              onClick={() => handleAddEntry('worker')}
              className={cn(isMobile && "w-full")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentTimesheet?.workerEntries?.map((entry, index) => (
              <div key={`${entry.workerId}-${index}`} className={cn(
                "border rounded-lg",
                isMobile ? "p-3" : "flex items-center justify-between p-3"
              )}>
                <div className={cn(
                  "flex-1",
                  isMobile && "space-y-3"
                )}>
                  <div className={cn(
                    isMobile ? "space-y-2" : "flex items-center gap-2 mb-2"
                  )}>
                    <h4 className="font-medium">{entry.workerName}</h4>
                    <div className={cn(
                      "flex flex-wrap gap-1",
                      isMobile && "justify-start"
                    )}>
                      <Badge variant="outline" className="text-xs">
                        ${entry.hourlyRate}/hr
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {entry.totalHours}h
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        ${entry.totalCost.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                    Projects: {entry.projectHours.map(ph => {
                      const project = projects.find(p => p.id === ph.projectId)
                      return `${project?.name || 'Unknown'} (${ph.hours}h)`
                    }).join(', ')}
                  </div>
                  {isMobile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEntry(entry, 'worker')}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Worker
                    </Button>
                  )}
                </div>
                {!isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEntry(entry, 'worker')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {(!currentTimesheet?.workerEntries || currentTimesheet.workerEntries.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No worker entries for this date
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Machinery Entries */}
      <Card>
        <CardHeader className={cn(isMobile && "pb-3")}>
          <div className={cn(
            "flex items-center justify-between",
            isMobile && "flex-col space-y-3"
          )}>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Machinery Entries
            </CardTitle>
            <Button 
              onClick={() => handleAddEntry('machinery')}
              className={cn(isMobile && "w-full")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Machinery
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentTimesheet?.machineryEntries?.map((entry, index) => (
              <div key={`${entry.machineryId}-${index}`} className={cn(
                "border rounded-lg",
                isMobile ? "p-3" : "flex items-center justify-between p-3"
              )}>
                <div className={cn(
                  "flex-1",
                  isMobile && "space-y-3"
                )}>
                  <div className={cn(
                    isMobile ? "space-y-2" : "flex items-center gap-2 mb-2"
                  )}>
                    <h4 className="font-medium">{entry.machineryName}</h4>
                    <div className={cn(
                      "flex flex-wrap gap-1",
                      isMobile && "justify-start"
                    )}>
                      <Badge variant="outline" className="text-xs">
                        ${entry.hourlyRate}/hr
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {entry.totalHours}h
                      </Badge>
                      <Badge variant="default" className="text-xs">
                        ${entry.totalCost.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                  <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                    Projects: {entry.projectHours.map(ph => {
                      const project = projects.find(p => p.id === ph.projectId)
                      return `${project?.name || 'Unknown'} (${ph.hours}h)`
                    }).join(', ')}
                  </div>
                  {isMobile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEntry(entry, 'machinery')}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Machinery
                    </Button>
                  )}
                </div>
                {!isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEntry(entry, 'machinery')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            {(!currentTimesheet?.machineryEntries || currentTimesheet.machineryEntries.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No machinery entries for this date
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Entry Dialog */}
      <TimesheetEntryDialog
        isOpen={showEntryDialog}
        onClose={() => {
          setShowEntryDialog(false)
          setEditingEntry(null)
        }}
        onSave={handleSaveEntry}
        workers={workers}
        machinery={machinery}
        projects={projects}
        entry={editingEntry || undefined}
        type={entryType}
      />
    </div>
  )
} 