"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Wrench, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { format } from 'date-fns'
import { 
  type Machinery, 
  MachineryType 
} from '@/lib/types'
import {
  MACHINERY_TYPE_LABELS,
  validateMachinery
} from '@/lib/workforce-utils'
import {
  createMachinery,
  updateMachinery
} from '@/lib/database'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

interface MachineryFormProps {
  machinery?: Machinery | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function MachineryForm({
  machinery,
  isOpen,
  onClose,
  onSave
}: MachineryFormProps) {
  const { t } = useI18n()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [showLastMaintenance, setShowLastMaintenance] = useState(false)
  const [showNextMaintenance, setShowNextMaintenance] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    type: '' as MachineryType | '',
    model: '',
    serialNumber: '',
    hourlyRate: 50,
    maintenanceSchedule: {
      lastMaintenance: undefined as Date | undefined,
      nextMaintenance: undefined as Date | undefined,
      maintenanceNotes: ''
    },
    notes: ''
  })

  useEffect(() => {
    if (machinery) {
      setFormData({
        name: machinery.name || '',
        type: machinery.type,
        model: machinery.model || '',
        serialNumber: machinery.serialNumber || '',
        hourlyRate: machinery.hourlyRate || 50,
        maintenanceSchedule: {
          lastMaintenance: machinery.maintenanceSchedule?.lastMaintenance ? 
            new Date(machinery.maintenanceSchedule.lastMaintenance) : undefined,
          nextMaintenance: machinery.maintenanceSchedule?.nextMaintenance ? 
            new Date(machinery.maintenanceSchedule.nextMaintenance) : undefined,
          maintenanceNotes: machinery.maintenanceSchedule?.maintenanceNotes || ''
        },
        notes: machinery.notes || ''
      })
    } else {
      setFormData({
        name: '',
        type: '',
        model: '',
        serialNumber: '',
        hourlyRate: 50,
        maintenanceSchedule: {
          lastMaintenance: undefined,
          nextMaintenance: undefined,
          maintenanceNotes: ''
        },
        notes: ''
      })
    }
    setErrors([])
  }, [machinery, isOpen])

  const handleSave = async () => {
    const validationErrors = validateMachinery({
      ...formData,
      type: formData.type as MachineryType
    })
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      if (machinery) {
        const updatedMachinery: Machinery = {
          ...machinery,
          ...formData,
          type: formData.type as MachineryType,
          updatedAt: new Date()
        }
        await updateMachinery(updatedMachinery)
        toast({
          title: t('machineryUpdatedSuccess'),
          description: `${formData.name} ${t('machineryUpdatedSuccess')}.`
        })
      } else {
        await createMachinery({
          ...formData,
          type: formData.type as MachineryType,
          isActive: true
        })
        toast({
          title: t('machineryAddedSuccess'),
          description: `${formData.name} ${t('machineryAddedSuccess')}.`
        })
      }
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Failed to save machinery:', error)
      toast({
        title: t('savingError'),
        description: t('failedToSaveMachinery'),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-2xl max-h-[90vh] overflow-y-auto",
        isMobile && "max-w-[95vw] w-full"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {machinery ? t('editMachinery') : t('addNewMachinery')}
          </DialogTitle>
          <DialogDescription>
            {machinery ? t('updateMachineryInformation') : t('addNewMachineryDescription')}
          </DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm font-medium text-destructive mb-2">{t('pleaseFixFollowingErrors')}:</p>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-sm text-destructive">{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t('machineryName')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., CAT 320 Excavator"
                className={cn(isMobile && "text-base")}
              />
            </div>
            <div>
              <Label htmlFor="type">{t('machineryType')} *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as MachineryType }))}
              >
                <SelectTrigger className={cn(isMobile && "h-12")}>
                  <SelectValue placeholder="Select machinery type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MachineryType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {MACHINERY_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model">{t('model')}</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g., 320GC"
                className={cn(isMobile && "text-base")}
              />
            </div>
            <div>
              <Label htmlFor="serialNumber">{t('serialNumber')}</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                placeholder="e.g., ABC123456"
                className={cn(isMobile && "text-base")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="hourlyRate">{t('hourlyRateUsd')}</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="0.50"
              value={formData.hourlyRate}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                hourlyRate: parseFloat(e.target.value) || 0 
              }))}
              placeholder="50.00"
              className={cn(isMobile && "text-base")}
            />
          </div>

          {/* Maintenance Schedule */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Maintenance Schedule</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Last Maintenance</Label>
                <Popover open={showLastMaintenance} onOpenChange={setShowLastMaintenance}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.maintenanceSchedule.lastMaintenance && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.maintenanceSchedule.lastMaintenance ? 
                        format(formData.maintenanceSchedule.lastMaintenance, "MMM d, yyyy") : 
                        "Select date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.maintenanceSchedule.lastMaintenance}
                      onSelect={(date) => {
                        setFormData(prev => ({
                          ...prev,
                          maintenanceSchedule: {
                            ...prev.maintenanceSchedule,
                            lastMaintenance: date
                          }
                        }))
                        setShowLastMaintenance(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Next Maintenance</Label>
                <Popover open={showNextMaintenance} onOpenChange={setShowNextMaintenance}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.maintenanceSchedule.nextMaintenance && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.maintenanceSchedule.nextMaintenance ? 
                        format(formData.maintenanceSchedule.nextMaintenance, "MMM d, yyyy") : 
                        "Select date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.maintenanceSchedule.nextMaintenance}
                      onSelect={(date) => {
                        setFormData(prev => ({
                          ...prev,
                          maintenanceSchedule: {
                            ...prev.maintenanceSchedule,
                            nextMaintenance: date
                          }
                        }))
                        setShowNextMaintenance(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="maintenanceNotes">Maintenance Notes</Label>
              <Textarea
                id="maintenanceNotes"
                value={formData.maintenanceSchedule.maintenanceNotes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maintenanceSchedule: {
                    ...prev.maintenanceSchedule,
                    maintenanceNotes: e.target.value
                  }
                }))}
                placeholder="Maintenance history and notes..."
                className={cn(
                  "min-h-[80px] resize-none",
                  isMobile && "text-base"
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this machinery..."
              className={cn(
                "min-h-[80px] resize-none",
                isMobile && "text-base"
              )}
            />
          </div>
        </div>

        <DialogFooter className={cn(
          "flex gap-2",
          isMobile ? "flex-col" : "flex-row"
        )}>
          <Button 
            variant="outline" 
            onClick={onClose}
            className={cn(isMobile && "w-full")}
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className={cn(isMobile && "w-full")}
          >
            {loading ? `${t('adding')}...` : (machinery ? t('updateMachinery') : t('addMachinery'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 