"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogTitle
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Minus,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { format } from 'date-fns'
import { type DailyWorkLog, type WorkEntry, WorkType } from '@/lib/types'
import { 
  WORK_TYPE_LABELS,
  DEFAULT_HOURLY_RATES,
  validateWorkLog 
} from '@/lib/work-log-utils'

interface WorkLogFormProps {
  workLog?: DailyWorkLog | null
  projectId: string
  isOpen: boolean
  onClose: () => void
  onSave: (workLog: Omit<DailyWorkLog, 'id' | 'createdAt' | 'updatedAt'> | DailyWorkLog) => Promise<void>
  className?: string
}

interface WorkLogFormData {
  date: Date
  projectId: string
  entries: WorkEntry[]
  notes?: string
  weatherConditions?: string
  totalWorkers: number
}

const initialFormData: WorkLogFormData = {
  date: new Date(),
  projectId: '',
  entries: [],
  totalWorkers: 1
}

export default function WorkLogForm({
  workLog,
  projectId,
  isOpen,
  onClose,
  onSave,
  className
}: WorkLogFormProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [formData, setFormData] = useState<WorkLogFormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showCalendar, setShowCalendar] = useState(false)

  // Reset form when workLog changes
  useEffect(() => {
    if (workLog) {
      setFormData({
        date: new Date(workLog.date),
        projectId: workLog.projectId,
        entries: workLog.entries || [],
        notes: workLog.notes,
        weatherConditions: workLog.weatherConditions,
        totalWorkers: workLog.totalWorkers || 1
      })
    } else {
      setFormData({
        ...initialFormData,
        projectId,
        date: new Date()
      })
    }
    setErrors({})
  }, [workLog, projectId, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (formData.entries.length === 0) {
      newErrors.entries = 'At least one work entry is required'
    }

    if (formData.totalWorkers < 1) {
      newErrors.totalWorkers = 'Must have at least 1 worker'
    }

    // Validate individual entries
    formData.entries.forEach((entry, index) => {
      if (!entry.description.trim()) {
        newErrors[`entry-${index}-description`] = 'Description is required'
      }
      if (entry.hours <= 0) {
        newErrors[`entry-${index}-hours`] = 'Hours must be greater than 0'
      }
    })

    // Validate work log using utility function
    const workLogValidation = validateWorkLog({
      ...formData,
      id: workLog?.id || 'new',
      date: formData.date.toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    if (!workLogValidation.isValid) {
      newErrors.general = workLogValidation.errors.join(', ')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const workLogData = {
        ...formData,
        date: formData.date.toISOString()
      }

      if (workLog) {
        await onSave({
          ...workLog,
          ...workLogData,
          updatedAt: new Date()
        })
      } else {
        await onSave(workLogData)
      }

      onClose()
    } catch (error) {
      console.error('Failed to save work log:', error)
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to save work log' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }))
    }
    setShowCalendar(false)
  }

  const addWorkEntry = () => {
    const newEntry: WorkEntry = {
      id: `entry-${Date.now()}`,
      workType: WorkType.INSTALLATION,
      description: '',
      hoursWorked: 1,
      workerCount: 1,
      hourlyRate: DEFAULT_HOURLY_RATES[WorkType.INSTALLATION]
    }
    
    setFormData(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry]
    }))
  }

  const removeWorkEntry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index)
    }))
  }

  const updateWorkEntry = (index: number, updates: Partial<WorkEntry>) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, ...updates } : entry
      )
    }))
  }

  const calculateTotalHours = () => {
    return formData.entries.reduce((total, entry) => total + (entry.hoursWorked || 0), 0)
  }

  const calculateTotalCost = () => {
    return formData.entries.reduce((total, entry) => 
      total + ((entry.hoursWorked || 0) * (entry.workerCount || 1) * (entry.hourlyRate || 0)), 0
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        isMobile 
          ? "max-w-[95vw] max-h-[95vh] w-full overflow-y-auto" 
          : "max-w-3xl max-h-[90vh] overflow-y-auto",
        className
      )}>
        <DialogHeader>
          <DialogTitle>
            {workLog ? 'Edit Work Log' : 'Log Daily Work'}
          </DialogTitle>
          <DialogDescription>
            {workLog ? 'Update work log details.' : 'Record work hours and activities for the day.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Date and Basic Info */}
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-2"
          )}>
            <div>
              <Label>Work Date</Label>
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      isMobile && "h-12"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="totalWorkers">Total Workers</Label>
              <Input
                id="totalWorkers"
                type="number"
                min="1"
                value={formData.totalWorkers}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  totalWorkers: parseInt(e.target.value) || 1 
                }))}
                className={cn(
                  isMobile && "text-base h-12",
                  errors.totalWorkers && "border-destructive"
                )}
              />
              {errors.totalWorkers && (
                <p className="text-sm text-destructive mt-1">{errors.totalWorkers}</p>
              )}
            </div>
          </div>

          {/* Work Entries */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Work Entries</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addWorkEntry}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>

            {formData.entries.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No work entries added yet
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addWorkEntry}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Entry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {formData.entries.map((entry, index) => (
                  <Card key={entry.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          Entry {index + 1}
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWorkEntry(index)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Work Type */}
                      <div>
                        <Label>Work Type</Label>
                        <Select
                          value={entry.workType}
                          onValueChange={(value) => updateWorkEntry(index, { 
                            workType: value as WorkType,
                            hourlyRate: DEFAULT_HOURLY_RATES[value as WorkType]
                          })}
                        >
                          <SelectTrigger className={cn(isMobile && "h-12")}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(WorkType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {WORK_TYPE_LABELS[type]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Description */}
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={entry.description || ''}
                          onChange={(e) => updateWorkEntry(index, { description: e.target.value })}
                          placeholder="Describe the work performed..."
                          className={cn(
                            "min-h-[80px] resize-none",
                            isMobile && "text-base",
                            errors[`entry-${index}-description`] && "border-destructive"
                          )}
                        />
                        {errors[`entry-${index}-description`] && (
                          <p className="text-sm text-destructive mt-1">
                            {errors[`entry-${index}-description`]}
                          </p>
                        )}
                      </div>

                      {/* Hours and Workers */}
                      <div className={cn(
                        "grid gap-4",
                        isMobile ? "grid-cols-1" : "grid-cols-3"
                      )}>
                        <div>
                          <Label>Hours</Label>
                          <Input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={entry.hoursWorked || 0}
                            onChange={(e) => updateWorkEntry(index, { 
                              hoursWorked: parseFloat(e.target.value) || 0 
                            })}
                            className={cn(
                              isMobile && "text-base h-12",
                              errors[`entry-${index}-hours`] && "border-destructive"
                            )}
                          />
                          {errors[`entry-${index}-hours`] && (
                            <p className="text-sm text-destructive mt-1">
                              {errors[`entry-${index}-hours`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>Workers</Label>
                          <Input
                            type="number"
                            min="1"
                            value={entry.workerCount || 1}
                            onChange={(e) => updateWorkEntry(index, { 
                              workerCount: parseInt(e.target.value) || 1 
                            })}
                            className={cn(isMobile && "text-base h-12")}
                          />
                        </div>

                        <div>
                          <Label>Rate/Hour</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={entry.hourlyRate || 0}
                            onChange={(e) => updateWorkEntry(index, { 
                              hourlyRate: parseFloat(e.target.value) || 0 
                            })}
                            className={cn(isMobile && "text-base h-12")}
                          />
                        </div>
                      </div>

                      {/* Entry Summary */}
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm">Entry Total:</span>
                        <div className="text-right">
                          <div className="font-medium">
                            ${((entry.hoursWorked || 0) * (entry.workerCount || 1) * (entry.hourlyRate || 0)).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entry.hoursWorked || 0}h × {entry.workerCount || 1} workers × ${entry.hourlyRate || 0}/h
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Totals Summary */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {calculateTotalHours().toFixed(1)}h
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Hours
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ${calculateTotalCost().toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Cost
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {errors.entries && (
              <p className="text-sm text-destructive mt-1">{errors.entries}</p>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="weatherConditions">Weather Conditions</Label>
              <Input
                id="weatherConditions"
                value={formData.weatherConditions || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  weatherConditions: e.target.value 
                }))}
                placeholder="e.g., Sunny, 22°C"
                className={cn(isMobile && "text-base h-12")}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the work day..."
                className={cn(
                  "min-h-[80px] resize-none",
                  isMobile && "text-base"
                )}
              />
            </div>
          </div>
        </form>

        <DialogFooter className={cn(
          isMobile ? "flex-col gap-2" : "flex-row gap-2"
        )}>
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose}
            className={cn(isMobile && "w-full")}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || formData.entries.length === 0}
            className={cn(isMobile && "w-full")}
          >
            {isLoading ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                {workLog ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              workLog ? 'Update Work Log' : 'Save Work Log'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 