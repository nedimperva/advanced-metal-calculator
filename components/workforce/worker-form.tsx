"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { User, Phone, Mail, MapPin, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'
import { 
  type Worker, 
  WorkerSkill 
} from '@/lib/types'
import {
  WORKER_SKILL_LABELS,
  validateWorker
} from '@/lib/workforce-utils'
import {
  createWorker,
  updateWorker
} from '@/lib/database'
import { toast } from '@/hooks/use-toast'
import { useI18n } from '@/contexts/i18n-context'

interface WorkerFormProps {
  worker?: Worker | null
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function WorkerForm({
  worker,
  isOpen,
  onClose,
  onSave
}: WorkerFormProps) {
  const { t } = useI18n()
  const isMobile = useMediaQuery("(max-width: 767px)")
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    skills: [] as WorkerSkill[],
    hourlyRate: 25,
    contactInfo: {
      phone: '',
      email: '',
      address: ''
    },
    notes: ''
  })

  // Initialize form data when worker changes
  useEffect(() => {
    if (worker) {
      setFormData({
        name: worker.name || '',
        employeeId: worker.employeeId || '',
        skills: worker.skills || [],
        hourlyRate: worker.hourlyRate || 25,
        contactInfo: {
          phone: worker.contactInfo?.phone || '',
          email: worker.contactInfo?.email || '',
          address: worker.contactInfo?.address || ''
        },
        notes: worker.notes || ''
      })
    } else {
      // Reset form for new worker
      setFormData({
        name: '',
        employeeId: '',
        skills: [],
        hourlyRate: 25, // Default hourly rate
        contactInfo: {
          phone: '',
          email: '',
          address: ''
        },
        notes: ''
      })
    }
    setErrors([])
  }, [worker, isOpen])

  const handleSkillToggle = (skill: WorkerSkill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleSave = async () => {
    // Validate form
    const validationErrors = validateWorker(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      if (worker) {
        // Update existing worker
        const updatedWorker: Worker = {
          ...worker,
          ...formData,
          updatedAt: new Date()
        }
        await updateWorker(updatedWorker)
        toast({
          title: t('workerUpdatedSuccess'),
          description: `${formData.name} ${t('workerUpdatedSuccess')}.`
        })
      } else {
        // Create new worker
        await createWorker({
          ...formData,
          isActive: true
        })
        toast({
          title: t('workerAddedSuccess'),
          description: `${formData.name} ${t('workerAddedSuccess')}.`
        })
      }
      
      onSave()
      onClose()
    } catch (error) {
      console.error('Failed to save worker:', error)
              toast({
          title: t('savingError'),
          description: t('failedToSaveWorker'),
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
            <User className="h-5 w-5" />
            {worker ? t('editWorker') : t('addNewWorker')}
          </DialogTitle>
          <DialogDescription>
            {worker ? t('updateWorkerInformation') : t('addNewWorkerDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Validation Errors */}
        {errors.length > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  {t('pleaseFixFollowingErrors')}:
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-destructive">
                    {error}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('basicInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('fullName')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter worker's full name"
                    className={cn(isMobile && "text-base")}
                  />
                </div>
                <div>
                  <Label htmlFor="employeeId">{t('employeeId')}</Label>
                  <Input
                    id="employeeId"
                    value={formData.employeeId}
                    onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
                    placeholder="Optional employee ID"
                    className={cn(isMobile && "text-base")}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate * ($)</Label>
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
                  placeholder="25.00"
                  className={cn(isMobile && "text-base")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skills & Specializations *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(WorkerSkill).map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={formData.skills.includes(skill)}
                      onCheckedChange={() => handleSkillToggle(skill)}
                    />
                    <Label 
                      htmlFor={skill} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {WORKER_SKILL_LABELS[skill]}
                    </Label>
                  </div>
                ))}
              </div>
              
              {/* Selected Skills Display */}
              {formData.skills.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm text-muted-foreground">Selected Skills:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {WORKER_SKILL_LABELS[skill]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, phone: e.target.value }
                  }))}
                  placeholder="(555) 123-4567"
                  className={cn(isMobile && "text-base")}
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, email: e.target.value }
                  }))}
                  placeholder="worker@example.com"
                  className={cn(isMobile && "text-base")}
                />
              </div>
              
              <div>
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Textarea
                  id="address"
                  value={formData.contactInfo.address}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contactInfo: { ...prev.contactInfo, address: e.target.value }
                  }))}
                  placeholder="123 Main St, City, State 12345"
                  className={cn(
                    "min-h-[80px] resize-none",
                    isMobile && "text-base"
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about this worker..."
                className={cn(
                  "min-h-[100px] resize-none",
                  isMobile && "text-base"
                )}
              />
            </CardContent>
          </Card>
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
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {worker ? t('updating') : t('adding')}...
              </>
            ) : (
              worker ? t('updateWorker') : t('addWorker')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 